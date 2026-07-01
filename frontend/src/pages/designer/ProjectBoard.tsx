import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface ProjectItem {
  id: number;
  product: {
    id: number;
    name: string;
    primary_image: string;
    price_kes: string | number;
    craft_category: string;
    artisan_name?: string;
  };
  pinned_at: string;
  notes: string;
}

interface ProjectCommission {
  id: number;
  title: string;
  artisan_name: string;
  item_title: string | null;
  custom_brief: string;
  budget_kes: number;
  status: string;
  status_display: string;
  created_at: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  items: ProjectItem[];
  item_count: number;
  commissions: ProjectCommission[];
  created_at: string;
  updated_at: string;
}

const getStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'ACCEPTED':
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'CANCELLED':
    case 'REJECTED':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const ProjectBoard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/projects/${projectId}/`);
      const data: Project = res.data.data || res.data;
      setProject(data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Project not found.');
      } else {
        setError(err.response?.data?.message || 'Failed to load project.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading project…</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
          <p className="text-red-600 mb-4">{error || 'Project not found.'}</p>
          <button
            onClick={() => navigate('/designer/projects')}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={() => navigate('/designer/projects')}
              className="text-sm text-gray-500 hover:text-amber-600 transition-colors"
            >
              ← My Projects
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="text-gray-600 mt-1">{project.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Created {new Date(project.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* ── SECTION 1: Pinned Items ── */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Pinned Items
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({project.items.length})
                </span>
              </h2>
              <Link
                to="/designer/catalogue"
                className="text-sm font-medium text-amber-600 hover:text-amber-700"
              >
                + Add Items
              </Link>
            </div>
          </div>

          <div className="p-6">
            {project.items.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-3">No items pinned to this project yet.</p>
                <Link
                  to="/designer/catalogue"
                  className="inline-block px-5 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                >
                  Browse Catalogue
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {project.items.map((item) => (
                  <Link
                    key={item.id}
                    to={`/designer/products/${item.product.id}`}
                    className="block border border-gray-200 rounded-lg overflow-hidden hover:shadow-md hover:border-amber-300 transition-all"
                  >
                    <div className="h-40 bg-gray-100 overflow-hidden">
                      {item.product.primary_image ? (
                        <img
                          src={item.product.primary_image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-500 mb-1">
                        {item.product.craft_category}
                      </p>
                      <p className="text-amber-600 font-bold text-sm">
                        KES {Number(item.product.price_kes).toLocaleString()}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-gray-500 mt-1 italic truncate">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── SECTION 2: Commissions for this Project ── */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Commissions for this Project
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({project.commissions?.length ?? 0})
              </span>
            </h2>
          </div>

          <div className="p-6">
            {!project.commissions || project.commissions.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-1">No commissions linked to this project yet.</p>
                <p className="text-xs text-gray-400">
                  When you send a commission request and select this project, it will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {project.commissions.map((commission) => (
                  <div
                    key={commission.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-amber-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-0.5 truncate">
                          {commission.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-1">
                          Artisan:{' '}
                          <span className="font-medium">{commission.artisan_name}</span>
                          {commission.item_title && (
                            <span className="text-gray-500">
                              {' '}
                              · Item:{' '}
                              <span className="italic">{commission.item_title}</span>
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                          {commission.custom_brief}
                        </p>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-gray-500">
                            {new Date(commission.created_at).toLocaleDateString()}
                          </span>
                          <span className="font-medium text-amber-600">
                            KES {Number(commission.budget_kes).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full border flex-shrink-0 ${getStatusColor(
                          commission.status
                        )}`}
                      >
                        {commission.status_display}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectBoard;

// Made with Bob
