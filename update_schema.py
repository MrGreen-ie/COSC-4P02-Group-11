import os
import sqlite3

# Path to the database
DATABASE_PATH = os.path.join("instance", "database.db")

def update_schema():
    print(f"Updating database schema at: {DATABASE_PATH}")
    print("Adding section1, section2, section3, content_left, content_right columns to saved_template table...")
    
    try:
        # Connect to SQLite database
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # Get existing columns
        cursor.execute("PRAGMA table_info(saved_template)")
        columns = [column[1] for column in cursor.fetchall()]
        print(f"Current columns: {columns}")
        
        # Add section1 column if it doesn't exist
        if 'section1' not in columns:
            print("Adding section1 column...")
            cursor.execute("ALTER TABLE saved_template ADD COLUMN section1 TEXT")
        
        # Add section2 column if it doesn't exist
        if 'section2' not in columns:
            print("Adding section2 column...")
            cursor.execute("ALTER TABLE saved_template ADD COLUMN section2 TEXT")
        
        # Add section3 column if it doesn't exist
        if 'section3' not in columns:
            print("Adding section3 column...")
            cursor.execute("ALTER TABLE saved_template ADD COLUMN section3 TEXT")
        
        # Add content_left column if it doesn't exist
        if 'content_left' not in columns:
            print("Adding content_left column...")
            cursor.execute("ALTER TABLE saved_template ADD COLUMN content_left TEXT")
        
        # Add content_right column if it doesn't exist
        if 'content_right' not in columns:
            print("Adding content_right column...")
            cursor.execute("ALTER TABLE saved_template ADD COLUMN content_right TEXT")
        
        # Commit changes
        conn.commit()
        
        # Verify changes
        cursor.execute("PRAGMA table_info(saved_template)")
        updated_columns = [column[1] for column in cursor.fetchall()]
        print(f"Updated columns: {updated_columns}")
        
        print("Schema update completed successfully!")
        
    except sqlite3.Error as e:
        print(f"SQLite error: {e}")
    
    except Exception as e:
        print(f"Error: {e}")
    
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    update_schema() 