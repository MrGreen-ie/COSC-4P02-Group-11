# Media Attachment Feature

This document describes the implementation of the media attachment feature for the social media post management system.

## Overview

The media attachment feature allows users to attach images, videos, and other media files to their social media posts. This enhances the post content and increases engagement on social platforms.

## Supported Platforms and Limitations

### Twitter
- Up to 4 media attachments per tweet
- Maximum file size: 5MB
- Supported formats: JPEG, PNG, GIF, MP4

### Facebook (Simulated)
- Up to 10 media attachments per post
- Maximum file size: 25MB
- Supported formats: JPEG, PNG, GIF, MP4

### LinkedIn (Simulated)
- Up to 9 media attachments per post
- Maximum file size: 100MB
- Supported formats: JPEG, PNG, GIF, MP4, PDF

## Implementation Details

### Frontend
- Added file upload component with drag-and-drop support
- Implemented file validation based on platform requirements
- Added media preview functionality for images
- Updated post submission to use FormData for file uploads

### Backend
- Created temporary storage for media files
- Implemented file upload handling in Flask
- Added media attachment support to the Twitter API
- Updated scheduled posts to include media files

## Technical Notes

### Media Storage
Media files are temporarily stored on the server in the `website/temp_media` directory. Files are automatically cleaned up after posting or when a scheduled post is executed.

### File Naming
Files are stored with a UUID prefix to prevent filename collisions.

### Security Considerations
- File extensions and types are validated
- Maximum file size is enforced
- Filenames are sanitized using `secure_filename`

## Future Improvements

1. Add support for media editing (cropping, filters, etc.)
2. Implement permanent media storage for reuse
3. Add media analytics (views, engagement)
4. Support additional file types (audio, documents)
5. Implement media optimization for different platforms
