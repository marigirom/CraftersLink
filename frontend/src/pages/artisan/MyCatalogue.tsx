import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Button,
  Tag,
  Modal,
  Loading,
  Pagination,
} from '@carbon/react';
import {
  Add,
  Edit,
  TrashCan,
  View,
} from '@carbon/icons-react';

interface CatalogueItem {
  id: number;
  title: string;
  category: string;
  price: number;
  price_unit: string;
  availability: string;
  created_at: string;
  images: string[];
}

const MyCatalogue: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CatalogueItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<CatalogueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchCatalogueItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchQuery, items]);

  const fetchCatalogueItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/catalogue/my/');
      const data = response.data.results || response.data || [];
      setItems(data);
      setFilteredItems(data);
    } catch (err: any) {
      console.error('Failed to fetch catalogue items:', err);
      setError(err.response?.data?.message || 'Failed to load catalogue items');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    if (!searchQuery.trim()) {
      setFilteredItems(items);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
    setFilteredItems(filtered);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      await api.delete(`/catalogue/${itemToDelete}/`);
      setItems(items.filter((item) => item.id !== itemToDelete));
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete item:', err);
      alert(err.response?.data?.message || 'Failed to delete item');
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'green';
      case 'busy':
        return 'orange';
      case 'custom_order':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getPriceDisplay = (item: CatalogueItem) => {
    const price = `KES ${item.price.toLocaleString()}`;
    switch (item.price_unit) {
      case 'per_piece':
        return `${price} / piece`;
      case 'per_sqm':
        return `${price} / sqm`;
      case 'negotiable':
        return `${price} (negotiable)`;
      default:
        return price;
    }
  };

  // Pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  const rows = paginatedItems.map((item) => ({
    id: item.id.toString(),
    title: item.title,
    category: item.category,
    price: getPriceDisplay(item),
    availability: item.availability,
    created: new Date(item.created_at).toLocaleDateString(),
    actions: item.id,
  }));

  const headers = [
    { key: 'title', header: 'Title' },
    { key: 'category', header: 'Category' },
    { key: 'price', header: 'Price' },
    { key: 'availability', header: 'Availability' },
    { key: 'created', header: 'Created' },
    { key: 'actions', header: 'Actions' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading description="Loading catalogue..." withOverlay={false} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
          <Button
            kind="tertiary"
            size="sm"
            onClick={fetchCatalogueItems}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Catalogue</h1>
        <p className="text-gray-600">
          Manage your products and services. Total items: {items.length}
        </p>
      </div>

      <DataTable rows={rows} headers={headers}>
        {({
          rows,
          headers,
          getTableProps,
          getHeaderProps,
          getRowProps,
          getTableContainerProps,
        }) => (
          <TableContainer
            title=""
            description=""
            {...getTableContainerProps()}
          >
            <TableToolbar>
              <TableToolbarContent>
                <TableToolbarSearch
                  placeholder="Search catalogue..."
                  onChange={(e: any) => setSearchQuery(e.target.value)}
                />
                <Button
                  kind="primary"
                  renderIcon={Add}
                  onClick={() => navigate('/dashboard/artisan/catalogue/new')}
                >
                  Add New Item
                </Button>
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={headers.length}>
                      <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">
                          {searchQuery
                            ? 'No items match your search.'
                            : 'You haven\'t added any items yet.'}
                        </p>
                        {!searchQuery && (
                          <Button
                            kind="primary"
                            renderIcon={Add}
                            onClick={() =>
                              navigate('/dashboard/artisan/catalogue/new')
                            }
                          >
                            Add Your First Item
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow {...getRowProps({ row })}>
                      {row.cells.map((cell) => {
                        if (cell.info.header === 'availability') {
                          return (
                            <TableCell key={cell.id}>
                              <Tag
                                type={getAvailabilityColor(cell.value)}
                                size="sm"
                              >
                                {cell.value.replace('_', ' ')}
                              </Tag>
                            </TableCell>
                          );
                        }
                        if (cell.info.header === 'actions') {
                          return (
                            <TableCell key={cell.id}>
                              <div className="flex gap-2">
                                <Button
                                  kind="ghost"
                                  size="sm"
                                  renderIcon={View}
                                  iconDescription="View"
                                  hasIconOnly
                                  onClick={() =>
                                    navigate(
                                      `/dashboard/artisan/catalogue/${cell.value}`
                                    )
                                  }
                                />
                                <Button
                                  kind="ghost"
                                  size="sm"
                                  renderIcon={Edit}
                                  iconDescription="Edit"
                                  hasIconOnly
                                  onClick={() =>
                                    navigate(
                                      `/dashboard/artisan/catalogue/${cell.value}/edit`
                                    )
                                  }
                                />
                                <Button
                                  kind="danger--ghost"
                                  size="sm"
                                  renderIcon={TrashCan}
                                  iconDescription="Delete"
                                  hasIconOnly
                                  onClick={() => {
                                    setItemToDelete(Number(cell.value));
                                    setDeleteModalOpen(true);
                                  }}
                                />
                              </div>
                            </TableCell>
                          );
                        }
                        return <TableCell key={cell.id}>{cell.value}</TableCell>;
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>

      {filteredItems.length > pageSize && (
        <Pagination
          totalItems={filteredItems.length}
          pageSize={pageSize}
          pageSizes={[10, 20, 30, 50]}
          page={currentPage}
          onChange={({ page, pageSize: newPageSize }) => {
            setCurrentPage(page);
            setPageSize(newPageSize);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        danger
        modalHeading="Delete Catalogue Item"
        primaryButtonText="Delete"
        secondaryButtonText="Cancel"
        onRequestClose={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onRequestSubmit={handleDelete}
      >
        <p>
          Are you sure you want to delete this item? This action cannot be
          undone.
        </p>
      </Modal>
    </div>
  );
};

export default MyCatalogue;

// Made with Bob
