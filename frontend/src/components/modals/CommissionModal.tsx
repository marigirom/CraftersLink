import React, { useState, useEffect } from 'react';
import { Close } from '@carbon/icons-react';
import api from '../../services/api';

interface CommissionProduct {
  id: number;
  name: string;
  description: string;
  material: string;
  price_kes: number;
  artisan_id: number;
  artisan_name: string;
}

interface CommissionProjectOption {
  id: number;
  name: string;
}

interface CommissionModalProps {
  product: CommissionProduct;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

type Step = 'project' | 'commission';

const CommissionModal: React.FC<CommissionModalProps> = ({ product, onClose, onSuccess }) => {
  const [step, setStep] = useState<Step>('project');

  // Project selection state
  const [projects, setProjects] = useState<CommissionProjectOption[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [projectError, setProjectError] = useState<string>('');
  const [savingProject, setSavingProject] = useState(false);

  // Commission form state
  const [formData, setFormData] = useState({
    itemDescription: product.description,
    preferredMaterials: product.material,
    dimensions: '',
    finishPreference: '',
    budget: product.price_kes.toString(),
    deliveryDate: '',
    additionalNotes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived: the project object for the selected id
  const selectedProject = projects.find((p) => p.id === selectedProjectId) ?? null;

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);
      const res = await api.get('/projects/');
      const list: CommissionProjectOption[] = res.data.results || res.data.data || res.data || [];
      setProjects(Array.isArray(list) ? list : []);
    } catch {
      // Non-fatal: the designer can still create a new project inline
    } finally {
      setProjectsLoading(false);
    }
  };

  // ---------- Project step ----------

  const handleCreateNewProject = async () => {
    if (!newProjectName.trim()) {
      setProjectError('Project name is required');
      return;
    }
    try {
      setSavingProject(true);
      setProjectError('');
      const res = await api.post('/projects/', {
        name: newProjectName.trim(),
        description: newProjectDescription.trim(),
      });
      const created: CommissionProjectOption = res.data.data || res.data;
      setProjects((prev) => [created, ...prev]);
      setSelectedProjectId(created.id);
      setCreatingNew(false);
      setNewProjectName('');
      setNewProjectDescription('');
    } catch (err: any) {
      setProjectError(
        err.response?.data?.name?.[0] ||
          err.response?.data?.message ||
          'Failed to create project'
      );
    } finally {
      setSavingProject(false);
    }
  };

  const canProceedToCommission = selectedProjectId !== null;

  // ---------- Commission step ----------

  const getMinDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.itemDescription || formData.itemDescription.trim().length < 50) {
      newErrors.itemDescription = 'Description must be at least 50 characters';
    }

    if (!formData.preferredMaterials || formData.preferredMaterials.trim().length < 3) {
      newErrors.preferredMaterials = 'Please specify preferred materials';
    }

    const budgetNum = parseFloat(formData.budget);
    if (!formData.budget || isNaN(budgetNum) || budgetNum <= 0) {
      newErrors.budget = 'Please enter a valid budget';
    }

    if (!formData.deliveryDate) {
      newErrors.deliveryDate = 'Delivery date is required';
    } else {
      const selectedDate = new Date(formData.deliveryDate);
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + 1);
      minDate.setHours(0, 0, 0, 0);

      if (selectedDate <= minDate) {
        newErrors.deliveryDate = 'Delivery date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || selectedProjectId === null) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const payload = {
        artisan: product.artisan_id,
        reference_product: product.id,
        title: `Custom ${product.name}`,
        custom_brief: [
          formData.itemDescription.trim(),
          formData.preferredMaterials && `Materials: ${formData.preferredMaterials}`,
          formData.dimensions && `Dimensions: ${formData.dimensions}`,
          formData.finishPreference && `Finish: ${formData.finishPreference}`,
          formData.additionalNotes && `Notes: ${formData.additionalNotes}`,
        ]
          .filter(Boolean)
          .join('\n\n'),
        budget_kes: parseFloat(formData.budget),
        requested_delivery_date: formData.deliveryDate,
        attachment_urls: [],
        project_id: selectedProjectId,
      };

      const response = await api.post('/commissions/create/', payload);

      if (response.status === 201) {
        const projectName = selectedProject?.name ?? '';
        const successMsg = `Commission sent to ${product.artisan_name} under "${projectName}".`;
        onClose();
        if (onSuccess) {
          onSuccess(successMsg);
        }
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData && typeof errorData === 'object') {
        const fieldErrors: Record<string, string> = {};
        Object.keys(errorData).forEach((key) => {
          if (Array.isArray(errorData[key])) {
            fieldErrors[key] = errorData[key][0];
          } else {
            fieldErrors[key] = String(errorData[key]);
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: 'Failed to send commission request. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {step === 'project' ? 'Select a Project' : 'Request a Custom Commission'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">from {product.artisan_name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Close size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* ── STEP 1: Project selection ── */}
          {step === 'project' && (
            <div className="space-y-6">
              <p className="text-sm text-gray-600">
                Every commission must belong to a project so you can track related work in
                one place. Select an existing project or create a new one.
              </p>

              {/* Existing projects */}
              {projectsLoading ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  Loading your projects…
                </div>
              ) : (
                <div className="space-y-2">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => {
                        setSelectedProjectId(project.id);
                        setCreatingNew(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 border-2 rounded-lg text-left transition-colors ${
                        selectedProjectId === project.id
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                          selectedProjectId === project.id
                            ? 'border-amber-600 bg-amber-600'
                            : 'border-gray-300'
                        }`}
                      />
                      <span className="font-medium text-gray-900">{project.name}</span>
                    </button>
                  ))}

                  {/* Create new project option */}
                  <button
                    type="button"
                    onClick={() => {
                      setCreatingNew(true);
                      setSelectedProjectId(null);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 border-2 rounded-lg text-left transition-colors ${
                      creatingNew
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-dashed border-gray-300 hover:border-amber-400 hover:bg-amber-50'
                    }`}
                  >
                    <span className="text-amber-600 font-bold text-lg">+</span>
                    <span className="font-medium text-amber-700">Create New Project</span>
                  </button>
                </div>
              )}

              {/* Inline new project form */}
              {creatingNew && (
                <div className="border border-amber-200 rounded-lg p-4 bg-amber-50 space-y-3">
                  <h4 className="font-semibold text-gray-900">New Project</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="e.g. Karen Residence"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (optional)
                    </label>
                    <input
                      type="text"
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Brief description…"
                    />
                  </div>
                  {projectError && (
                    <p className="text-xs text-red-600">{projectError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCreateNewProject}
                      disabled={savingProject || !newProjectName.trim()}
                      className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
                    >
                      {savingProject ? 'Creating…' : 'Create & Select'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreatingNew(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep('commission')}
                  disabled={!canProceedToCommission}
                  className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Commission details ── */}
          {step === 'commission' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Selected project badge */}
              {selectedProject && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Project:</span>
                  <span className="px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                    {selectedProject.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep('project')}
                    className="text-xs text-amber-600 hover:text-amber-700 underline ml-1"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* Reference product */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Based on: {product.name}
                </h3>
                <p className="text-sm text-gray-600">
                  Starting from:{' '}
                  <span className="font-semibold text-amber-600">
                    KES {product.price_kes.toLocaleString()}
                  </span>
                </p>
              </div>

              {/* Item Description */}
              <div>
                <label
                  htmlFor="itemDescription"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Item Description *
                  <span className="text-gray-500 font-normal ml-2">(minimum 50 characters)</span>
                </label>
                <textarea
                  id="itemDescription"
                  name="itemDescription"
                  value={formData.itemDescription}
                  onChange={handleChange}
                  rows={6}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    errors.itemDescription ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe exactly what you want…"
                  required
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    {formData.itemDescription.length} / 50 characters minimum
                  </p>
                  {errors.itemDescription && (
                    <p className="text-xs text-red-600">{errors.itemDescription}</p>
                  )}
                </div>
              </div>

              {/* Preferred Materials */}
              <div>
                <label
                  htmlFor="preferredMaterials"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Preferred Materials *
                </label>
                <input
                  type="text"
                  id="preferredMaterials"
                  name="preferredMaterials"
                  value={formData.preferredMaterials}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    errors.preferredMaterials ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g. Mahogany wood, brass fittings"
                  required
                />
                {errors.preferredMaterials && (
                  <p className="mt-1 text-xs text-red-600">{errors.preferredMaterials}</p>
                )}
              </div>

              {/* Dimensions and Finish */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="dimensions"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Dimensions (Optional)
                  </label>
                  <input
                    type="text"
                    id="dimensions"
                    name="dimensions"
                    value={formData.dimensions}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="e.g. 60cm × 40cm × 30cm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="finishPreference"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Finish / Colour (Optional)
                  </label>
                  <input
                    type="text"
                    id="finishPreference"
                    name="finishPreference"
                    value={formData.finishPreference}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="e.g. Natural wood, dark walnut stain"
                  />
                </div>
              </div>

              {/* Budget and Delivery Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="budget"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Budget (KES) *
                  </label>
                  <input
                    type="number"
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    min={product.price_kes}
                    step="0.01"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                      errors.budget ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.budget && (
                    <p className="mt-1 text-xs text-red-600">{errors.budget}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="deliveryDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Required Delivery Date *
                  </label>
                  <input
                    type="date"
                    id="deliveryDate"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleChange}
                    min={getMinDeliveryDate()}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                      errors.deliveryDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.deliveryDate ? (
                    <p className="mt-1 text-xs text-red-600">{errors.deliveryDate}</p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-500">Minimum 7 days from today</p>
                  )}
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label
                  htmlFor="additionalNotes"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Any other details or clarifications…"
                />
              </div>

              {/* General Error */}
              {errors.general && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{errors.general}</p>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep('project')}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedProjectId}
                  className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending…
                    </span>
                  ) : (
                    'Send Commission Request'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommissionModal;

// Made with Bob
