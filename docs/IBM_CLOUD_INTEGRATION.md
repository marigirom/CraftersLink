# CraftersLink - IBM Cloud Object Storage Integration

## Overview
This document details the integration strategy for IBM Cloud Object Storage (COS) in the CraftersLink platform, covering configuration, implementation, security, and best practices.

---

## 1. IBM Cloud Object Storage Setup

### 1.1 Service Configuration

**Service Details:**
- **Service Name:** CraftersLink Storage
- **Plan:** Standard (Pay-as-you-go)
- **Region:** us-south (or closest to Kenya for optimal latency)
- **Storage Class:** Standard (for frequently accessed files)

**Bucket Configuration:**
```
Bucket Name: crafterslink-media
Region: us-south
Storage Class: Standard
Public Access: Enabled for product images only
Versioning: Disabled (to save costs)
Encryption: Server-side encryption enabled
```

---

### 1.2 Access Credentials

**Required Credentials:**
```bash
IBM_COS_ENDPOINT=https://s3.us-south.cloud-object-storage.appdomain.cloud
IBM_COS_API_KEY=<your-api-key>
IBM_COS_INSTANCE_ID=<your-instance-id>
IBM_COS_BUCKET_NAME=crafterslink-media
IBM_COS_AUTH_ENDPOINT=https://iam.cloud.ibm.com/identity/token
```

**Environment Variables (.env):**
```bash
# IBM Cloud Object Storage
IBM_COS_ENDPOINT=https://s3.us-south.cloud-object-storage.appdomain.cloud
IBM_COS_API_KEY=your_api_key_here
IBM_COS_INSTANCE_ID=crn:v1:bluemix:public:cloud-object-storage:global:a/...
IBM_COS_BUCKET_NAME=crafterslink-media
IBM_COS_AUTH_ENDPOINT=https://iam.cloud.ibm.com/identity/token

# Optional: For public access
IBM_COS_PUBLIC_ENDPOINT=https://crafterslink-media.s3.us-south.cloud-object-storage.appdomain.cloud
```

---

## 2. Backend Implementation

### 2.1 Python SDK Installation

**requirements.txt:**
```txt
ibm-cos-sdk==2.13.0
ibm-cos-sdk-core==2.13.0
ibm-cos-sdk-s3transfer==2.13.0
```

---

### 2.2 Django Configuration

**backend/crafterslink/settings.py:**
```python
import os
from decouple import config

# IBM Cloud Object Storage Configuration
IBM_COS_CONFIG = {
    'endpoint': config('IBM_COS_ENDPOINT'),
    'api_key': config('IBM_COS_API_KEY'),
    'instance_id': config('IBM_COS_INSTANCE_ID'),
    'bucket_name': config('IBM_COS_BUCKET_NAME'),
    'auth_endpoint': config('IBM_COS_AUTH_ENDPOINT', default='https://iam.cloud.ibm.com/identity/token'),
    'public_endpoint': config('IBM_COS_PUBLIC_ENDPOINT', default=''),
}

# File upload settings
MAX_UPLOAD_SIZE = 5 * 1024 * 1024  # 5MB for images
MAX_DOCUMENT_SIZE = 10 * 1024 * 1024  # 10MB for PDFs

ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
ALLOWED_DOCUMENT_TYPES = ['application/pdf']
```

---

### 2.3 Storage Service Implementation

**backend/apps/common/services/storage_service.py:**
```python
import ibm_boto3
from ibm_botocore.client import Config
from django.conf import settings
from datetime import datetime, timedelta
import uuid
import mimetypes
from PIL import Image
from io import BytesIO

class IBMCloudStorageService:
    """Service for managing IBM Cloud Object Storage operations"""
    
    def __init__(self):
        self.config = settings.IBM_COS_CONFIG
        self.client = self._get_client()
        self.bucket_name = self.config['bucket_name']
    
    def _get_client(self):
        """Initialize IBM COS client"""
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
        Upload file to IBM COS
        
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
        Upload and optimize image
        
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
        Delete file from IBM COS
        
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
        Generate pre-signed URL for temporary access
        
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
        Upload PDF document
        
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
        """Extract file extension from filename"""
        return filename[filename.rfind('.'):]
    
    def _extract_key_from_url(self, url):
        """Extract object key from full URL"""
        # Remove endpoint and bucket name from URL
        if self.config.get('public_endpoint') in url:
            return url.replace(f"{self.config['public_endpoint']}/", '')
        else:
            return url.replace(f"{self.config['endpoint']}/{self.bucket_name}/", '')


# Singleton instance
storage_service = IBMCloudStorageService()
```

---

### 2.4 File Upload View

**backend/apps/common/views.py:**
```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from .services.storage_service import storage_service

class ImageUploadView(APIView):
    """Handle image uploads to IBM COS"""
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Upload image file"""
        try:
            # Validate file presence
            if 'file' not in request.FILES:
                return Response({
                    'success': False,
                    'error': {
                        'code': 'FILE_REQUIRED',
                        'message': 'No file provided'
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            
            file = request.FILES['file']
            upload_type = request.data.get('type', 'general')
            
            # Validate file type
            if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
                return Response({
                    'success': False,
                    'error': {
                        'code': 'INVALID_FILE_TYPE',
                        'message': f'File type {file.content_type} not allowed'
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate file size
            if file.size > settings.MAX_UPLOAD_SIZE:
                return Response({
                    'success': False,
                    'error': {
                        'code': 'FILE_TOO_LARGE',
                        'message': f'File size exceeds {settings.MAX_UPLOAD_SIZE / 1024 / 1024}MB limit'
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Determine folder based on type
            folder_map = {
                'profile': 'profiles',
                'product': 'products',
                'portfolio': 'portfolios',
                'commission': 'commissions',
                'milestone': 'milestones',
                'general': 'uploads'
            }
            folder = folder_map.get(upload_type, 'uploads')
            
            # Upload to IBM COS
            url = storage_service.upload_image(file, folder)
            
            return Response({
                'success': True,
                'data': {
                    'url': url,
                    'filename': file.name,
                    'size': file.size,
                    'content_type': file.content_type
                },
                'message': 'Image uploaded successfully'
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'success': False,
                'error': {
                    'code': 'UPLOAD_FAILED',
                    'message': str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DocumentUploadView(APIView):
    """Handle document uploads to IBM COS"""
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Upload document file (PDF)"""
        try:
            if 'file' not in request.FILES:
                return Response({
                    'success': False,
                    'error': {
                        'code': 'FILE_REQUIRED',
                        'message': 'No file provided'
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            
            file = request.FILES['file']
            upload_type = request.data.get('type', 'general')
            
            # Validate file type
            if file.content_type not in settings.ALLOWED_DOCUMENT_TYPES:
                return Response({
                    'success': False,
                    'error': {
                        'code': 'INVALID_FILE_TYPE',
                        'message': f'Only PDF files are allowed'
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate file size
            if file.size > settings.MAX_DOCUMENT_SIZE:
                return Response({
                    'success': False,
                    'error': {
                        'code': 'FILE_TOO_LARGE',
                        'message': f'File size exceeds {settings.MAX_DOCUMENT_SIZE / 1024 / 1024}MB limit'
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Determine folder
            folder_map = {
                'brief': 'briefs',
                'contract': 'contracts',
                'general': 'documents'
            }
            folder = folder_map.get(upload_type, 'documents')
            
            # Upload to IBM COS
            url = storage_service.upload_file(file, folder, public=False)
            
            return Response({
                'success': True,
                'data': {
                    'url': url,
                    'filename': file.name,
                    'size': file.size,
                    'content_type': file.content_type
                },
                'message': 'Document uploaded successfully'
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'success': False,
                'error': {
                    'code': 'UPLOAD_FAILED',
                    'message': str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

---

## 3. Bucket Organization

### 3.1 Folder Structure

```
crafterslink-media/
├── profiles/                    # User profile images (public)
│   ├── {uuid}.jpg
│   └── {uuid}.jpg
│
├── products/                    # Product images (public)
│   ├── {uuid}.jpg
│   └── {uuid}.jpg
│
├── portfolios/                  # Artisan portfolio images (public)
│   ├── {uuid}.jpg
│   └── {uuid}.jpg
│
├── commissions/                 # Commission attachments (private)
│   ├── {uuid}.pdf
│   └── {uuid}.jpg
│
├── milestones/                  # Milestone progress images (private)
│   ├── {uuid}.jpg
│   └── {uuid}.jpg
│
├── invoices/                    # Generated invoice PDFs (private)
│   ├── 2026/
│   │   ├── INV-2026-0001.pdf
│   │   └── INV-2026-0002.pdf
│   └── 2027/
│
└── documents/                   # General documents (private)
    ├── {uuid}.pdf
    └── {uuid}.pdf
```

---

## 4. Security Configuration

### 4.1 Bucket Policies

**Public Read Policy (for product images):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::crafterslink-media/products/*"
    },
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::crafterslink-media/portfolios/*"
    },
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::crafterslink-media/profiles/*"
    }
  ]
}
```

### 4.2 CORS Configuration

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://crafterslink.com"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

---

## 5. Frontend Integration

### 5.1 Upload Service

**frontend/src/services/upload.service.ts:**
```typescript
import api from './api';

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  content_type: string;
}

class UploadService {
  async uploadImage(
    file: File,
    type: 'profile' | 'product' | 'portfolio' | 'commission' | 'milestone'
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await api.post<{ data: UploadResponse }>(
      '/upload/image/',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data;
  }

  async uploadDocument(
    file: File,
    type: 'brief' | 'contract'
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await api.post<{ data: UploadResponse }>(
      '/upload/document/',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data;
  }

  validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Only JPEG, PNG, and WebP images are allowed',
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Image size must be less than 5MB',
      };
    }

    return { valid: true };
  }

  validateDocumentFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (file.type !== 'application/pdf') {
      return {
        valid: false,
        error: 'Only PDF documents are allowed',
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Document size must be less than 10MB',
      };
    }

    return { valid: true };
  }
}

export default new UploadService();
```

---

## 6. Cost Optimization

### 6.1 Storage Costs

**IBM COS Standard Pricing (us-south):**
- Storage: $0.023 per GB/month
- GET requests: $0.004 per 10,000 requests
- PUT requests: $0.05 per 10,000 requests
- Data transfer out: $0.09 per GB

### 6.2 Optimization Strategies

1. **Image Optimization:**
   - Compress images before upload (85% JPEG quality)
   - Resize large images to max 2000x2000px
   - Convert PNG to JPEG where possible

2. **Caching:**
   - Set long cache headers for public images (1 year)
   - Use CDN for frequently accessed files

3. **Lifecycle Policies:**
   - Archive old invoices after 2 years
   - Delete temporary files after 30 days

4. **Request Optimization:**
   - Batch multiple file operations
   - Use pre-signed URLs for private files
   - Cache file URLs in database

---

## 7. Monitoring & Logging

### 7.1 Upload Metrics

Track the following metrics:
- Total uploads per day
- Failed uploads
- Average file size
- Storage usage by folder
- Request costs

### 7.2 Error Handling

```python
import logging

logger = logging.getLogger(__name__)

try:
    url = storage_service.upload_image(file, folder)
except Exception as e:
    logger.error(f"IBM COS upload failed: {str(e)}", extra={
        'user_id': request.user.id,
        'file_name': file.name,
        'file_size': file.size,
        'folder': folder
    })
    raise
```

---

## 8. Testing

### 8.1 Unit Tests

**tests/test_storage_service.py:**
```python
import unittest
from unittest.mock import Mock, patch
from apps.common.services.storage_service import IBMCloudStorageService

class TestIBMCloudStorageService(unittest.TestCase):
    
    @patch('ibm_boto3.client')
    def test_upload_file(self, mock_client):
        """Test file upload to IBM COS"""
        service = IBMCloudStorageService()
        mock_file = Mock()
        mock_file.name = 'test.jpg'
        mock_file.content_type = 'image/jpeg'
        
        url = service.upload_file(mock_file, 'products')
        
        self.assertIsNotNone(url)
        self.assertIn('products/', url)
    
    @patch('ibm_boto3.client')
    def test_generate_presigned_url(self, mock_client):
        """Test pre-signed URL generation"""
        service = IBMCloudStorageService()
        
        url = service.generate_presigned_url('invoices/INV-2026-0001.pdf')
        
        self.assertIsNotNone(url)
```

---

## 9. Backup & Disaster Recovery

### 9.1 Backup Strategy

1. **Critical Files:**
   - Invoice PDFs: Backed up to secondary bucket
   - Commission attachments: Backed up weekly

2. **Backup Schedule:**
   - Daily: Invoice PDFs
   - Weekly: All private documents
   - Monthly: Full bucket backup

### 9.2 Recovery Plan

1. Restore from backup bucket
2. Regenerate missing invoice PDFs from database
3. Request users to re-upload portfolio images if needed

---

## 10. Migration Plan

### 10.1 From Local Storage to IBM COS

```python
# Migration script
from apps.common.services.storage_service import storage_service
from apps.artisans.models import Product
import os

def migrate_product_images():
    """Migrate product images from local to IBM COS"""
    products = Product.objects.all()
    
    for product in products:
        if product.primary_image.startswith('/media/'):
            # Read local file
            local_path = os.path.join(settings.MEDIA_ROOT, product.primary_image)
            with open(local_path, 'rb') as f:
                # Upload to IBM COS
                url = storage_service.upload_image(f, 'products')
                # Update database
                product.primary_image = url
                product.save()
            
            print(f"Migrated: {product.name}")
```

---

This integration plan provides a complete strategy for implementing IBM Cloud Object Storage in the CraftersLink platform.