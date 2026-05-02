"""
IBM Cloud Object Storage service for file uploads.
"""
import ibm_boto3
from ibm_botocore.client import Config
from django.conf import settings
from datetime import datetime, timedelta
import uuid
import mimetypes
from PIL import Image
from io import BytesIO


class IBMCloudStorageService:
    """Service for managing IBM Cloud Object Storage operations."""
    
    def __init__(self):
        self.config = settings.IBM_COS_CONFIG
        self.client = self._get_client()
        self.bucket_name = self.config['bucket_name']
    
    def _get_client(self):
        """Initialize IBM COS client."""
        return ibm_boto3.client(
            's3',
            ibm_api_key_id=self.config['api_key'],
            ibm_service_instance_id=self.config['instance_id'],
            ibm_auth_endpoint=self.config['auth_endpoint'],
            config=Config(signature_version='oauth'),
            endpoint_url=self.config['endpoint']
        )
    
    def upload_file(self, file, folder, filename=None, public=False):
        """
        Upload file to IBM COS.
        
        Args:
            file: File object to upload
            folder: Folder path in bucket (e.g., 'products', 'portfolios')
            filename: Optional custom filename
            public: Whether file should be publicly accessible
        
        Returns:
            str: URL of uploaded file
        """
        try:
            # Generate unique filename if not provided
            if not filename:
                ext = self._get_file_extension(file.name)
                filename = f"{uuid.uuid4()}{ext}"
            
            # Construct full key
            key = f"{folder}/{filename}"
            
            # Determine content type
            content_type = file.content_type or mimetypes.guess_type(file.name)[0]
            
            # Upload file
            extra_args = {
                'ContentType': content_type,
            }
            
            if public:
                extra_args['ACL'] = 'public-read'
            
            self.client.upload_fileobj(
                file,
                self.bucket_name,
                key,
                ExtraArgs=extra_args
            )
            
            # Return URL
            if public and self.config.get('public_endpoint'):
                return f"{self.config['public_endpoint']}/{key}"
            else:
                return f"{self.config['endpoint']}/{self.bucket_name}/{key}"
        
        except Exception as e:
            raise Exception(f"Failed to upload file to IBM COS: {str(e)}")
    
    def upload_image(self, image_file, folder, max_size=(2000, 2000), quality=85):
        """
        Upload and optimize image.
        
        Args:
            image_file: Image file object
            folder: Folder path in bucket
            max_size: Maximum dimensions (width, height)
            quality: JPEG quality (1-100)
        
        Returns:
            str: URL of uploaded image
        """
        try:
            # Open and optimize image
            img = Image.open(image_file)
            
            # Convert RGBA to RGB if necessary
            if img.mode == 'RGBA':
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[3])
                img = background
            
            # Resize if larger than max_size
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Save to BytesIO
            output = BytesIO()
            img.save(output, format='JPEG', quality=quality, optimize=True)
            output.seek(0)
            
            # Generate filename
            filename = f"{uuid.uuid4()}.jpg"
            key = f"{folder}/{filename}"
            
            # Upload
            self.client.upload_fileobj(
                output,
                self.bucket_name,
                key,
                ExtraArgs={
                    'ContentType': 'image/jpeg',
                    'ACL': 'public-read'
                }
            )
            
            # Return public URL
            if self.config.get('public_endpoint'):
                return f"{self.config['public_endpoint']}/{key}"
            else:
                return f"{self.config['endpoint']}/{self.bucket_name}/{key}"
        
        except Exception as e:
            raise Exception(f"Failed to upload image: {str(e)}")
    
    def delete_file(self, url):
        """
        Delete file from IBM COS.
        
        Args:
            url: Full URL of file to delete
        """
        try:
            # Extract key from URL
            key = self._extract_key_from_url(url)
            
            # Delete file
            self.client.delete_object(
                Bucket=self.bucket_name,
                Key=key
            )
        
        except Exception as e:
            raise Exception(f"Failed to delete file: {str(e)}")
    
    def generate_presigned_url(self, key, expiration=3600):
        """
        Generate pre-signed URL for temporary access.
        
        Args:
            key: Object key in bucket
            expiration: URL expiration time in seconds (default: 1 hour)
        
        Returns:
            str: Pre-signed URL
        """
        try:
            url = self.client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': key
                },
                ExpiresIn=expiration
            )
            return url
        
        except Exception as e:
            raise Exception(f"Failed to generate pre-signed URL: {str(e)}")
    
    def upload_pdf(self, pdf_content, folder, filename):
        """
        Upload PDF document.
        
        Args:
            pdf_content: PDF file content (BytesIO or file object)
            folder: Folder path in bucket
            filename: PDF filename
        
        Returns:
            str: URL of uploaded PDF
        """
        try:
            key = f"{folder}/{filename}"
            
            self.client.upload_fileobj(
                pdf_content,
                self.bucket_name,
                key,
                ExtraArgs={
                    'ContentType': 'application/pdf',
                    'ContentDisposition': f'inline; filename="{filename}"'
                }
            )
            
            # Generate pre-signed URL (valid for 7 days)
            return self.generate_presigned_url(key, expiration=604800)
        
        except Exception as e:
            raise Exception(f"Failed to upload PDF: {str(e)}")
    
    def _get_file_extension(self, filename):
        """Extract file extension from filename."""
        return filename[filename.rfind('.'):]
    
    def _extract_key_from_url(self, url):
        """Extract object key from full URL."""
        # Remove endpoint and bucket name from URL
        if self.config.get('public_endpoint') in url:
            return url.replace(f"{self.config['public_endpoint']}/", '')
        else:
            return url.replace(f"{self.config['endpoint']}/{self.bucket_name}/", '')


# Singleton instance
storage_service = IBMCloudStorageService()

# Made with Bob
