import redis
import json
import hashlib
from dotenv import load_dotenv
import os
from urllib.parse import urlparse
import ssl
from pathlib import Path
import gzip
import base64
import time
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from parent directory's .env.local
env_path = Path(__file__).resolve().parent.parent / '.env.local'
load_dotenv(env_path)

class RedisCache:
    def __init__(self):
        redis_url = os.getenv('REDIS_URL')
        if not redis_url:
            raise ValueError(f"REDIS_URL environment variable is not set. Looking in: {env_path}")
            
        try:
            # Configure connection using URL
            self.redis_client = redis.from_url(
                redis_url,
                decode_responses=True
            )
            
            # Test the connection
            self.redis_client.ping()
            print("Successfully connected to Redis Cloud!")
        except Exception as e:
            print(f"Failed to connect to Redis: {str(e)}")
            # Initialize a dummy client that will fail gracefully
            self.redis_client = None
            
        self.cache_expiry = int(os.getenv('REDIS_CACHE_EXPIRY', 3600))  # Default 1 hour
        self.max_content_size = int(os.getenv('REDIS_MAX_CONTENT_SIZE', 10000))  # Default 10KB
        self.compression_threshold = int(os.getenv('REDIS_COMPRESSION_THRESHOLD', 1000))  # Default 1KB
        self.memory_limit = int(os.getenv('REDIS_MEMORY_LIMIT', 100 * 1024 * 1024))  # Default 100MB
        
        # Initialize cache stats
        self.cache_hits = 0
        self.cache_misses = 0
        self.last_cleanup = time.time()
        self.cleanup_interval = 3600  # 1 hour

    def is_connected(self):
        """Check if Redis is connected and working"""
        if not self.redis_client:
            return False
        try:
            self.redis_client.ping()
            return True
        except:
            return False

    def generate_cache_key(self, content, length, tone):
        """Generate a unique cache key based on content and parameters"""
        # Create a string combining all parameters
        params = f"{content}:{length}:{tone}"
        # Generate MD5 hash of the parameters
        return f"summary:{hashlib.md5(params.encode()).hexdigest()}"

    def compress_data(self, data):
        """Compress data using gzip"""
        try:
            # Convert to JSON string
            json_str = json.dumps(data)
            # Convert to bytes
            json_bytes = json_str.encode('utf-8')
            # Compress
            compressed = gzip.compress(json_bytes)
            # Encode as base64 for storage
            encoded = base64.b64encode(compressed).decode('ascii')
            
            # Add compression metadata
            return {
                'compressed': True,
                'data': encoded,
                'original_size': len(json_bytes),
                'compressed_size': len(compressed)
            }
        except Exception as e:
            logger.error(f"Compression error: {str(e)}")
            return data

    def decompress_data(self, data):
        """Decompress data compressed with gzip"""
        try:
            if isinstance(data, str):
                # Try to parse as JSON first
                data = json.loads(data)
                
            if not isinstance(data, dict) or not data.get('compressed'):
                return data
                
            # Get the compressed data
            compressed = data.get('data')
            
            # Decode base64
            decoded = base64.b64decode(compressed)
            
            # Decompress
            decompressed = gzip.decompress(decoded)
            
            # Convert back to JSON
            return json.loads(decompressed.decode('utf-8'))
        except Exception as e:
            logger.error(f"Decompression error: {str(e)}")
            return data

    def get_cached_summary(self, content, length, tone):
        """Get cached summary if it exists"""
        if not self.is_connected():
            return None
            
        try:
            cache_key = self.generate_cache_key(content, length, tone)
            cached_data = self.redis_client.get(cache_key)
            
            if cached_data:
                # Track cache hit
                self.cache_hits += 1
                
                # Try to parse as JSON
                try:
                    cached_result = json.loads(cached_data)
                    
                    # Check if data is compressed
                    if isinstance(cached_result, dict) and cached_result.get('compressed'):
                        cached_result = self.decompress_data(cached_result)
                    
                    cached_result['cached'] = True
                    return cached_result
                except json.JSONDecodeError:
                    # If not valid JSON, it might be compressed data
                    try:
                        # Try to decompress directly
                        decompressed = self.decompress_data({'compressed': True, 'data': cached_data})
                        decompressed['cached'] = True
                        return decompressed
                    except:
                        # If all else fails, return None
                        logger.error(f"Failed to decode cached data for key: {cache_key}")
                        return None
            
            # Track cache miss
            self.cache_misses += 1
            return None
        except Exception as e:
            logger.error(f"Redis get error: {str(e)}")
            return None

    def cache_summary(self, content, length, tone, summary_data):
        """Cache the summary data"""
        if not self.is_connected():
            return False
            
        try:
            # Check if we need to run memory optimization
            self._check_memory_usage()
            
            # Remove original content if it's too large
            data_to_cache = summary_data.copy()
            
            # Check if original content is too large
            if 'original_content' in data_to_cache and len(str(data_to_cache['original_content'])) > self.max_content_size:
                # Store a truncated version
                data_to_cache['original_content'] = data_to_cache['original_content'][:self.max_content_size] + '... (truncated)'
                data_to_cache['content_truncated'] = True
            
            # Compress data if it's large enough
            json_data = json.dumps(data_to_cache)
            if len(json_data) > self.compression_threshold:
                data_to_cache = self.compress_data(data_to_cache)
                
            cache_key = self.generate_cache_key(content, length, tone)
            self.redis_client.setex(
                cache_key,
                self.cache_expiry,
                json.dumps(data_to_cache)
            )
            
            # Update cache stats
            self._update_cache_stats(cache_key, len(json.dumps(data_to_cache)))
            
            return True
        except Exception as e:
            logger.error(f"Redis set error: {str(e)}")
            return False
    
    def _check_memory_usage(self):
        """Check Redis memory usage and clean up if necessary"""
        # Only check periodically
        current_time = time.time()
        if current_time - self.last_cleanup < self.cleanup_interval:
            return
            
        try:
            # Get Redis memory info
            info = self.redis_client.info('memory')
            used_memory = info.get('used_memory', 0)
            
            # If memory usage is above limit, clean up
            if used_memory > self.memory_limit:
                logger.info(f"Redis memory usage ({used_memory} bytes) exceeds limit ({self.memory_limit} bytes). Cleaning up...")
                self._cleanup_cache()
                
            self.last_cleanup = current_time
        except Exception as e:
            logger.error(f"Error checking memory usage: {str(e)}")
    
    def _cleanup_cache(self):
        """Clean up cache by removing oldest entries"""
        try:
            # Get all summary keys
            keys = self.redis_client.keys('summary:*')
            
            if not keys:
                return
                
            # Get TTL for each key
            key_ttls = []
            for key in keys:
                ttl = self.redis_client.ttl(key)
                key_ttls.append((key, ttl))
                
            # Sort by TTL (oldest first)
            key_ttls.sort(key=lambda x: x[1])
            
            # Remove oldest 25%
            keys_to_remove = key_ttls[:len(key_ttls) // 4]
            
            if keys_to_remove:
                logger.info(f"Removing {len(keys_to_remove)} oldest cache entries")
                for key, _ in keys_to_remove:
                    self.redis_client.delete(key)
        except Exception as e:
            logger.error(f"Error cleaning up cache: {str(e)}")
    
    def _update_cache_stats(self, key, size):
        """Update cache statistics"""
        try:
            # Store cache stats in Redis
            stats_key = 'cache:stats'
            
            # Update hit/miss ratio
            total = self.cache_hits + self.cache_misses
            hit_ratio = self.cache_hits / total if total > 0 else 0
            
            stats = {
                'hits': self.cache_hits,
                'misses': self.cache_misses,
                'hit_ratio': hit_ratio,
                'last_key': key,
                'last_size': size,
                'last_update': time.time()
            }
            
            self.redis_client.hmset(stats_key, stats)
        except Exception as e:
            logger.error(f"Error updating cache stats: {str(e)}")
    
    def get_cache_stats(self):
        """Get cache statistics"""
        if not self.is_connected():
            return {
                'connected': False,
                'hits': self.cache_hits,
                'misses': self.cache_misses
            }
            
        try:
            stats_key = 'cache:stats'
            if self.redis_client.exists(stats_key):
                stats = self.redis_client.hgetall(stats_key)
                
                # Convert numeric values
                for key in ['hits', 'misses', 'hit_ratio', 'last_size', 'last_update']:
                    if key in stats:
                        stats[key] = float(stats[key])
                
                # Add memory info
                info = self.redis_client.info('memory')
                stats['memory_used'] = info.get('used_memory', 0)
                stats['memory_limit'] = self.memory_limit
                
                return stats
            else:
                return {
                    'connected': True,
                    'hits': self.cache_hits,
                    'misses': self.cache_misses,
                    'hit_ratio': self.cache_hits / (self.cache_hits + self.cache_misses) if (self.cache_hits + self.cache_misses) > 0 else 0
                }
        except Exception as e:
            logger.error(f"Error getting cache stats: {str(e)}")
            return {
                'connected': True,
                'error': str(e),
                'hits': self.cache_hits,
                'misses': self.cache_misses
            }

# Create a global instance
redis_cache = RedisCache()
