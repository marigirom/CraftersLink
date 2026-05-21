import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Form,
  TextInput,
  TextArea,
  Select,
  SelectItem,
  NumberInput,
  Button,
  InlineNotification,
  FileUploader,
  Loading,
  Stack,
  Grid,
  Column,
} from '@carbon/react';
import { ArrowLeft, Save, TrashCan } from '@carbon/icons-react';
import apiClient from '../../services/apiClient';

interface CatalogueItem {
  id?: number;
  name: string;
  description: string;
  category: string;
  price_kes: number;
  price_unit: string;
  availability: string;
  images: string[];
  materials?: string;
  dimensions?: string;
  lead_time_days?: number;
}

const CATEGORIES = [
  { value: 'FURNITURE', label: 'Furniture' },
  { value: 'METALWORK', label: 'Metalwork' },
  { value: 'TEXTILES', label: 'Textiles' },
  { value: 'CERAMICS', label: 'Ceramics' },
  { value: 'WOODWORK', label: 'Woodwork' },
  { value: 'UPHOLSTERY', label: 'Upholstery' },
  { value: 'LIGHTING', label: 'Lighting' },
  { value: 'DECOR', label: 'Decor' },
  { value: 'OTHER', label: 'Other' },
];

const PRICE_UNITS = [
  { value: 'ITEM', label: 'Per Item' },
  { value: 'SQM', label: 'Per Square Meter' },
  { value: 'METER', label: 'Per Meter' },
  { value: 'SET', label: 'Per Set' },
  { value: 'PAIR', label: 'Per Pair' },
];

const AVAILABILITY_OPTIONS = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'BUSY', label: 'Busy' },
  { value: 'CUSTOM_ORDER', label: 'Custom Order Only' },
];

const CatalogueItemForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<CatalogueItem>({
    name: '',
    description: '',
    category: 'FURNITURE',
    price_kes: 0,
    price_unit: 'ITEM',
    availability: 'AVAILABLE',
    images: [],
    materials: '',
    dimensions: '',
    lead_time_days: 7,
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    if (isEditMode && id) {
      fetchItem();
    }
  }, [id, isEditMode]);

  const fetchItem = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/artisans/products/${id}/`);
      if (response.data.success) {
        const item = response.data.data;
        setFormData({
          name: item.name || '',
          description: item.description || '',
          category: item.category || 'FURNITURE',
          price_kes: item.price_kes || 0,
          price_unit: item.price_unit || 'ITEM',
          availability: item.availability || 'AVAILABLE',
          images: item.images || [],
          materials: item.materials || '',
          dimensions: item.dimensions || '',
          lead_time_days: item.lead_time_days || 7,
        });
        setExistingImages(item.images || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load item');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CatalogueItem, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setImageFiles((prev) => [...prev, ...fileArray]);
    }
  };

  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setImageFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Item name is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (formData.price_kes <= 0) {
      setError('Price must be greater than 0');
      return false;
    }
    if (existingImages.length === 0 && imageFiles.length === 0) {
      setError('At least one image is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const formDataToSend = new FormData();
      
      // Append text fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('price_kes', formData.price_kes.toString());
      formDataToSend.append('price_unit', formData.price_unit);
      formDataToSend.append('availability', formData.availability);
      
      if (formData.materials) {
        formDataToSend.append('materials', formData.materials);
      }
      if (formData.dimensions) {
        formDataToSend.append('dimensions', formData.dimensions);
      }
      if (formData.lead_time_days) {
        formDataToSend.append('lead_time_days', formData.lead_time_days.toString());
      }

      // Append existing images
      if (isEditMode) {
        formDataToSend.append('existing_images', JSON.stringify(existingImages));
      }

      // Append new image files
      imageFiles.forEach((file) => {
        formDataToSend.append('images', file);
      });

      let response;
      if (isEditMode) {
        response = await apiClient.put(`/artisans/products/${id}/`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await apiClient.post('/artisans/products/create/', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (response.data.success) {
        setSuccess(isEditMode ? 'Item updated successfully!' : 'Item created successfully!');
        setTimeout(() => {
          navigate('/dashboard/artisan/catalogue');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.delete(`/artisans/products/${id}/`);
      if (response.data.success) {
        setSuccess('Item deleted successfully!');
        setTimeout(() => {
          navigate('/dashboard/artisan/catalogue');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete item');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading description="Loading item..." withOverlay={false} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          kind="ghost"
          renderIcon={ArrowLeft}
          onClick={() => navigate('/dashboard/artisan/catalogue')}
          className="mb-4"
        >
          Back to Catalogue
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? 'Edit Catalogue Item' : 'Add New Catalogue Item'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditMode
            ? 'Update your catalogue item details'
            : 'Add a new item to your catalogue'}
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <InlineNotification
          kind="error"
          title="Error"
          subtitle={error}
          onCloseButtonClick={() => setError(null)}
          className="mb-4"
        />
      )}

      {success && (
        <InlineNotification
          kind="success"
          title="Success"
          subtitle={success}
          onCloseButtonClick={() => setSuccess(null)}
          className="mb-4"
        />
      )}

      {/* Form */}
      <Form onSubmit={handleSubmit}>
        <Stack gap={6}>
          {/* Basic Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <Grid>
              <Column lg={16} md={8} sm={4}>
                <TextInput
                  id="name"
                  labelText="Item Name *"
                  placeholder="e.g., Custom Dining Table"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </Column>

              <Column lg={16} md={8} sm={4}>
                <TextArea
                  id="description"
                  labelText="Description *"
                  placeholder="Describe your item in detail..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  required
                />
              </Column>

              <Column lg={8} md={4} sm={4}>
                <Select
                  id="category"
                  labelText="Category *"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value} text={cat.label} />
                  ))}
                </Select>
              </Column>

              <Column lg={8} md={4} sm={4}>
                <Select
                  id="availability"
                  labelText="Availability *"
                  value={formData.availability}
                  onChange={(e) => handleInputChange('availability', e.target.value)}
                >
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} text={opt.label} />
                  ))}
                </Select>
              </Column>
            </Grid>
          </div>

          {/* Pricing */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Pricing</h2>
            <Grid>
              <Column lg={8} md={4} sm={4}>
                <NumberInput
                  id="price_kes"
                  label="Price (KES) *"
                  min={0}
                  step={100}
                  value={formData.price_kes}
                  onChange={(e, { value }) => handleInputChange('price_kes', value)}
                  required
                />
              </Column>

              <Column lg={8} md={4} sm={4}>
                <Select
                  id="price_unit"
                  labelText="Price Unit *"
                  value={formData.price_unit}
                  onChange={(e) => handleInputChange('price_unit', e.target.value)}
                >
                  {PRICE_UNITS.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value} text={unit.label} />
                  ))}
                </Select>
              </Column>
            </Grid>
          </div>

          {/* Additional Details */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Additional Details</h2>
            <Grid>
              <Column lg={8} md={4} sm={4}>
                <TextInput
                  id="materials"
                  labelText="Materials"
                  placeholder="e.g., Mahogany, Oak"
                  value={formData.materials}
                  onChange={(e) => handleInputChange('materials', e.target.value)}
                />
              </Column>

              <Column lg={8} md={4} sm={4}>
                <TextInput
                  id="dimensions"
                  labelText="Dimensions"
                  placeholder="e.g., 180cm x 90cm x 75cm"
                  value={formData.dimensions}
                  onChange={(e) => handleInputChange('dimensions', e.target.value)}
                />
              </Column>

              <Column lg={8} md={4} sm={4}>
                <NumberInput
                  id="lead_time_days"
                  label="Lead Time (Days)"
                  min={1}
                  max={365}
                  value={formData.lead_time_days}
                  onChange={(e, { value }) => handleInputChange('lead_time_days', value)}
                />
              </Column>
            </Grid>
          </div>

          {/* Images */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Images *</h2>
            
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Current Images:</p>
                <div className="grid grid-cols-4 gap-4">
                  {existingImages.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                      <Button
                        kind="danger"
                        size="sm"
                        renderIcon={TrashCan}
                        onClick={() => removeImage(index, true)}
                        className="absolute top-2 right-2"
                        hasIconOnly
                        iconDescription="Remove"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            {imageFiles.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">New Images:</p>
                <div className="grid grid-cols-4 gap-4">
                  {imageFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                      <Button
                        kind="danger"
                        size="sm"
                        renderIcon={TrashCan}
                        onClick={() => removeImage(index, false)}
                        className="absolute top-2 right-2"
                        hasIconOnly
                        iconDescription="Remove"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File Uploader */}
            <FileUploader
              labelTitle="Upload Images"
              labelDescription="Max file size is 5MB. Supported formats: JPG, PNG"
              buttonLabel="Add images"
              filenameStatus="edit"
              accept={['.jpg', '.jpeg', '.png']}
              multiple
              onChange={handleFileChange}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4">
            <div>
              {isEditMode && (
                <Button
                  kind="danger--ghost"
                  renderIcon={TrashCan}
                  onClick={handleDelete}
                  disabled={submitting}
                >
                  Delete Item
                </Button>
              )}
            </div>
            <div className="flex gap-4">
              <Button
                kind="secondary"
                onClick={() => navigate('/dashboard/artisan/catalogue')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                kind="primary"
                type="submit"
                renderIcon={Save}
                disabled={submitting}
              >
                {submitting ? 'Saving...' : isEditMode ? 'Update Item' : 'Create Item'}
              </Button>
            </div>
          </div>
        </Stack>
      </Form>
    </div>
  );
};

export default CatalogueItemForm;

// Made with Bob
