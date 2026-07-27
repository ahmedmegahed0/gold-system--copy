import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FolderPlus,
  Pencil,
  Archive,
  FolderOpen,
  Loader2,
  AlertCircle,
  X,
  Tags,
  Tag,
  Calendar,
} from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryStatusFilter,
} from '../../common/types/category.types';

/* ──────────────────────────────────────────────
   MODAL OVERLAY
   ────────────────────────────────────────────── */
const ModalOverlay: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-charcoal">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-charcoal hover:bg-gray-50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {/* Body */}
        <div className="px-8 py-6">{children}</div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────
   CREATE CATEGORY MODAL
   ────────────────────────────────────────────── */
const CreateCategoryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryDto) => Promise<void>;
}> = ({ isOpen, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError(t('categories.validation.nameRequired'));
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      await onSubmit({ name: name.trim() });
      setName('');
      onClose();
    } catch (err: any) {
      setFormError(err.response?.data?.message || t('categories.errors.createFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title={t('categories.addCategory')}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {formError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            <AlertCircle size={16} />
            {formError}
          </div>
        )}

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-charcoal mb-2">
            <span className="text-gray-400"><Tag size={16} /></span>
            {t('categories.fields.name')}
            <span className="text-red-400 text-xs">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setFormError('');
            }}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all bg-gray-50/50 focus:bg-white text-charcoal placeholder:text-gray-300"
            placeholder={t('categories.placeholders.name')}
            autoFocus
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="flex-1 py-3.5 bg-gold hover:bg-[#b59540] text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <FolderPlus size={18} />
            )}
            {saving ? t('categories.saving') : t('categories.addCategory')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3.5 border border-gray-200 text-gray-500 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            {t('categories.cancel')}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
};

/* ──────────────────────────────────────────────
   EDIT CATEGORY MODAL
   ────────────────────────────────────────────── */
const EditCategoryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onSubmit: (id: string, data: UpdateCategoryDto) => Promise<void>;
}> = ({ isOpen, onClose, category, onSubmit }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  React.useEffect(() => {
    if (category) {
      setName(category.name);
      setFormError('');
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;

    if (!name.trim()) {
      setFormError(t('categories.validation.nameRequired'));
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      await onSubmit(category._id || category.id || '', { name: name.trim() });
      onClose();
    } catch (err: any) {
      setFormError(err.response?.data?.message || t('categories.errors.updateFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title={t('categories.editCategory')}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {formError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            <AlertCircle size={16} />
            {formError}
          </div>
        )}

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-charcoal mb-2">
            <span className="text-gray-400"><Tag size={16} /></span>
            {t('categories.fields.name')}
            <span className="text-red-400 text-xs">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setFormError('');
            }}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all bg-gray-50/50 focus:bg-white text-charcoal placeholder:text-gray-300"
            autoFocus
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving || !name.trim() || name === category?.name}
            className="flex-1 py-3.5 bg-gold hover:bg-[#b59540] text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Pencil size={18} />
            )}
            {saving ? t('categories.saving') : t('categories.saveChanges')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3.5 border border-gray-200 text-gray-500 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            {t('categories.cancel')}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
};

/* ──────────────────────────────────────────────
   CONFIRM ARCHIVE MODAL
   ────────────────────────────────────────────── */
const ConfirmArchiveModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onConfirm: (id: string) => Promise<void>;
}> = ({ isOpen, onClose, category, onConfirm }) => {
  const { t } = useTranslation();
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!category) return;
    setDeleting(true);
    try {
      await onConfirm(category._id || category.id || '');
      onClose();
    } catch {
      // Error handled by hook
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title={t('categories.confirmArchive.title')}>
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500 mb-5">
          <Archive size={28} />
        </div>
        <p className="text-charcoal font-medium text-lg mb-2">
          {t('categories.confirmArchive.message')}
        </p>
        <p className="text-gray-400 font-medium bg-gray-50 py-2 px-4 rounded-lg inline-block mt-2">
          {category?.name}
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={handleConfirm}
          disabled={deleting}
          className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {deleting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Archive size={18} />
          )}
          {deleting ? t('categories.archiving') : t('categories.confirmArchive.confirm')}
        </button>
        <button
          onClick={onClose}
          className="px-6 py-3.5 border border-gray-200 text-gray-500 font-medium rounded-xl hover:bg-gray-50 transition-colors"
        >
          {t('categories.cancel')}
        </button>
      </div>
    </ModalOverlay>
  );
};

/* ──────────────────────────────────────────────
   MAIN PAGE COMPONENT
   ────────────────────────────────────────────── */
export const CategoriesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const {
    categories,
    isLoading,
    error,
    activeFilter,
    setActiveFilter,
    createCategory,
    updateCategory,
    softDeleteCategory,
  } = useCategories();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [archivingCategory, setArchivingCategory] = useState<Category | null>(null);

  const tabs: { key: CategoryStatusFilter; label: string }[] = [
    { key: 'ACTIVE', label: t('categories.tabs.active') },
    { key: 'ARCHIVED', label: t('categories.tabs.archived') },
  ];

  const isArchiveView = activeFilter === 'ARCHIVED';

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-theme-categories/10 text-theme-categories">
              <Tags size={24} />
            </div>
            {t('categories.title')}
          </h1>
          <p className="text-gray-400 text-sm mt-1 mr-14">
            {t('categories.subtitle')}
          </p>
        </div>

        {!isArchiveView && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-theme-categories hover:bg-theme-categories/90 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            <FolderPlus size={18} />
            {t('categories.addCategory')}
          </button>
        )}
      </div>

      {/* ─── Error Banner ─── */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* ─── Filter Tabs ─── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 bg-gray-50/30">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`relative flex-1 py-4 px-6 text-sm font-bold transition-colors ${
                activeFilter === tab.key
                  ? 'text-theme-categories bg-white'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
              {activeFilter === tab.key && (
                <span className="absolute bottom-0 inset-x-0 h-[2px] bg-theme-categories" />
              )}
            </button>
          ))}
        </div>

        {/* ─── Table ─── */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
              <Loader2 size={24} className="animate-spin text-gold" />
              <span className="font-medium">{t('categories.loading')}</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <FolderOpen size={28} />
              </div>
              <p className="font-medium">{t('categories.empty')}</p>
            </div>
          ) : (
            <table className="w-full text-base text-right">
              <thead>
                <tr className="bg-gray-50/70 text-gray-400 border-b border-gray-100">
                  <th className="px-8 py-5 font-semibold w-1/2">{t('categories.table.name')}</th>
                  <th className="px-6 py-5 font-semibold">{t('categories.table.createdAt')}</th>
                  <th className="px-6 py-5 font-semibold">{t('categories.table.status')}</th>
                  <th className="px-8 py-5 font-semibold w-48">{t('categories.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categories.map((cat) => {
                  const isActive = !cat.isArchived && cat.status !== 'ARCHIVED';
                  return (
                    <tr
                      key={cat._id || cat.id}
                      className="hover:bg-gold/[0.02] transition-colors group"
                    >
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-theme-categories/10 text-theme-categories flex items-center justify-center flex-shrink-0">
                            <Tag size={18} />
                          </div>
                          <span className="font-bold text-charcoal text-lg">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span dir="ltr">
                            {new Date(cat.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold tracking-wide ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : 'bg-gray-100 text-gray-500 border border-gray-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-emerald-500' : 'bg-gray-400'
                            }`}
                          />
                          {isActive ? t('categories.status.active') : t('categories.status.archived')}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        {!isArchiveView ? (
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditingCategory(cat)}
                              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-theme-categories bg-theme-categories/8 hover:bg-theme-categories/15 border border-theme-categories/20 rounded-lg transition-colors"
                            >
                              <Pencil size={14} />
                              {t('categories.actions.edit')}
                            </button>
                            <button
                              onClick={() => setArchivingCategory(cat)}
                              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg transition-colors"
                            >
                              <Archive size={14} />
                              {t('categories.actions.archive')}
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-400 rounded-lg text-xs font-medium">
                              <Archive size={14} />
                              {t('categories.status.archived')}
                            </span>
                            <button
                              onClick={async () => {
                                try {
                                  await updateCategory(cat._id || cat.id || '', { status: 'ACTIVE' } as any);
                                } catch (err) {
                                  // Error is already handled by the hook
                                }
                              }}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-lg transition-colors"
                            >
                              <Tags size={14} />
                              {t('categories.actions.restore')}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ─── Modals ─── */}
      <CreateCategoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={createCategory}
      />

      <EditCategoryModal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        category={editingCategory}
        onSubmit={updateCategory}
      />

      <ConfirmArchiveModal
        isOpen={!!archivingCategory}
        onClose={() => setArchivingCategory(null)}
        category={archivingCategory}
        onConfirm={softDeleteCategory}
      />
    </div>
  );
};
