import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  UserPlus,
  Pencil,
  Archive,
  Users,
  Loader2,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  UserCog,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Lock,
  User,
}
from 'lucide-react';
import { useEmployees } from '../../hooks/useEmployees';
import type {
  Employee,
  CreateUserDto,
  UpdateUserDto,
  EmployeeStatusFilter,
} from '../../common/types/employee.types';

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
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
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
   FORM INPUT COMPONENT
   ────────────────────────────────────────────── */
const FormField: React.FC<{
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  required?: boolean;
}> = ({ label, icon, children, required }) => (
  <div>
    <label className="flex items-center gap-2 text-sm font-semibold text-charcoal mb-2">
      <span className="text-gray-400">{icon}</span>
      {label}
      {required && <span className="text-red-400 text-xs">*</span>}
    </label>
    {children}
  </div>
);

const inputClass =
  'w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all bg-gray-50/50 focus:bg-white text-charcoal placeholder:text-gray-300';

/* ──────────────────────────────────────────────
   CREATE EMPLOYEE MODAL
   ────────────────────────────────────────────── */
const CreateEmployeeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserDto) => Promise<void>;
}> = ({ isOpen, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    nationalId: '',
    address: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password || !form.phoneNumber || !form.nationalId) {
      setFormError(t('employees.validation.required'));
      return;
    }
    if (form.password.length < 6) {
      setFormError(t('employees.validation.passwordMin'));
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      await onSubmit({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phoneNumber: form.phoneNumber,
        role: 'Employee',
        nationalId: form.nationalId || undefined,
        address: form.address || undefined,
      });
      setForm({ fullName: '', email: '', password: '', phoneNumber: '', nationalId: '', address: '' });
      onClose();
    } catch (err: any) {
      setFormError(err.response?.data?.message || t('employees.errors.createFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title={t('employees.addEmployee')}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {formError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            <AlertCircle size={16} />
            {formError}
          </div>
        )}

        <FormField label={t('employees.fields.fullName')} icon={<User size={16} />} required>
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            className={inputClass}
            placeholder={t('employees.placeholders.fullName')}
          />
        </FormField>

        <FormField label={t('employees.fields.email')} icon={<Mail size={16} />} required>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`${inputClass} text-left`}
            dir="ltr"
            placeholder={t('employees.placeholders.email')}
          />
        </FormField>

        <FormField label={t('employees.fields.password')} icon={<Lock size={16} />} required>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className={`${inputClass} pl-12`}
              dir="ltr"
              placeholder={t('employees.placeholders.password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </FormField>

        <FormField label={t('employees.fields.phone')} icon={<Phone size={16} />} required>
          <input
            type="tel"
            value={form.phoneNumber}
            onChange={(e) => handleChange('phoneNumber', e.target.value)}
            className={`${inputClass} text-left`}
            dir="ltr"
            placeholder={t('employees.placeholders.phone')}
          />
        </FormField>

        <FormField label={t('employees.fields.nationalId')} icon={<CreditCard size={16} />} required>
          <input
            type="text"
            value={form.nationalId}
            onChange={(e) => handleChange('nationalId', e.target.value)}
            className={`${inputClass} text-left`}
            dir="ltr"
            placeholder={t('employees.placeholders.nationalId')}
          />
        </FormField>

        <FormField label={t('employees.fields.address')} icon={<MapPin size={16} />}>
          <input
            type="text"
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className={inputClass}
            placeholder={t('employees.placeholders.address')}
          />
        </FormField>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3.5 bg-gold hover:bg-[#b59540] text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {t('employees.saving')}
              </>
            ) : (
              <>
                <UserPlus size={18} />
                {t('employees.addEmployee')}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3.5 border border-gray-200 text-gray-500 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            {t('employees.cancel')}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
};

/* ──────────────────────────────────────────────
   EDIT EMPLOYEE MODAL
   ────────────────────────────────────────────── */
const EditEmployeeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSubmit: (id: string, data: UpdateUserDto) => Promise<void>;
}> = ({ isOpen, onClose, employee, onSubmit }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  React.useEffect(() => {
    if (employee) {
      setForm({
        fullName: employee.fullName || '',
        phoneNumber: employee.phoneNumber || '',
        address: employee.address || '',
        password: '',
      });
      setFormError('');
    }
  }, [employee]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    if (!form.fullName) {
      setFormError(t('employees.validation.nameRequired'));
      return;
    }
    if (form.password && form.password.length < 6) {
      setFormError(t('employees.validation.passwordMin'));
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      const payload: UpdateUserDto = {
        fullName: form.fullName,
        phoneNumber: form.phoneNumber || undefined,
        address: form.address || undefined,
      };
      if (form.password) {
        payload.password = form.password;
      }
      await onSubmit(employee._id, payload);
      onClose();
    } catch (err: any) {
      setFormError(err.response?.data?.message || t('employees.errors.updateFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title={t('employees.editEmployee')}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {formError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            <AlertCircle size={16} />
            {formError}
          </div>
        )}

        {/* Read-only email */}
        <FormField label={t('employees.fields.email')} icon={<Mail size={16} />}>
          <div className="px-4 py-3 bg-gray-100 rounded-xl text-gray-500 text-sm" dir="ltr">
            {employee?.email}
          </div>
        </FormField>

        <FormField label={t('employees.fields.fullName')} icon={<User size={16} />} required>
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            className={inputClass}
          />
        </FormField>

        <FormField label={t('employees.fields.phone')} icon={<Phone size={16} />}>
          <input
            type="tel"
            value={form.phoneNumber}
            onChange={(e) => handleChange('phoneNumber', e.target.value)}
            className={`${inputClass} text-left`}
            dir="ltr"
          />
        </FormField>

        <FormField label={t('employees.fields.address')} icon={<MapPin size={16} />}>
          <input
            type="text"
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className={inputClass}
          />
        </FormField>

        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-3">{t('employees.passwordHint')}</p>
          <FormField label={t('employees.fields.newPassword')} icon={<Lock size={16} />}>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className={`${inputClass} pl-12`}
                dir="ltr"
                placeholder={t('employees.placeholders.newPassword')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </FormField>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3.5 bg-gold hover:bg-[#b59540] text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {t('employees.saving')}
              </>
            ) : (
              <>
                <Pencil size={18} />
                {t('employees.saveChanges')}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3.5 border border-gray-200 text-gray-500 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            {t('employees.cancel')}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
};

/* ──────────────────────────────────────────────
   CONFIRM DELETE MODAL
   ────────────────────────────────────────────── */
const ConfirmArchiveModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onConfirm: (id: string) => Promise<void>;
}> = ({ isOpen, onClose, employee, onConfirm }) => {
  const { t } = useTranslation();
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!employee) return;
    setDeleting(true);
    try {
      await onConfirm(employee._id);
      onClose();
    } catch {
      // Error is handled by the hook
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title={t('employees.confirmArchive.title')}>
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500 mb-5">
          <Archive size={28} />
        </div>
        <p className="text-charcoal font-medium text-lg mb-2">
          {t('employees.confirmArchive.message')}
        </p>
        <p className="text-gray-400 text-sm mb-1">
          {employee?.fullName}
        </p>
        <p className="text-gray-400 text-sm" dir="ltr">
          {employee?.email}
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={handleConfirm}
          disabled={deleting}
          className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {deleting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {t('employees.archiving')}
            </>
          ) : (
            <>
              <Archive size={18} />
              {t('employees.confirmArchive.confirm')}
            </>
          )}
        </button>
        <button
          onClick={onClose}
          className="px-6 py-3.5 border border-gray-200 text-gray-500 font-medium rounded-xl hover:bg-gray-50 transition-colors"
        >
          {t('employees.cancel')}
        </button>
      </div>
    </ModalOverlay>
  );
};

/* ──────────────────────────────────────────────
   STATUS BADGE
   ────────────────────────────────────────────── */
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const { t } = useTranslation();
  const isActive = status === 'ACTIVE';
  return (
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
      {isActive ? t('employees.status.active') : t('employees.status.archived')}
    </span>
  );
};

/* ──────────────────────────────────────────────
   MAIN PAGE COMPONENT
   ────────────────────────────────────────────── */
export const EmployeesPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    employees,
    isLoading,
    error,
    activeFilter,
    setActiveFilter,
    createEmployee,
    updateEmployee,
    softDeleteEmployee,
  } = useEmployees();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [archivingEmployee, setArchivingEmployee] = useState<Employee | null>(null);

  const tabs: { key: EmployeeStatusFilter; label: string }[] = [
    { key: 'ACTIVE', label: t('employees.tabs.active') },
    { key: 'ARCHIVED', label: t('employees.tabs.archived') },
  ];

  const isArchiveView = activeFilter === 'ARCHIVED';

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-theme-movements/10 text-theme-movements">
              <UserCog size={24} />
            </div>
            {t('employees.title')}
          </h1>
          <p className="text-gray-400 text-sm mt-1 mr-14">
            {t('employees.subtitle')}
          </p>
        </div>

        {!isArchiveView && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-theme-movements hover:bg-theme-movements/90 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            <UserPlus size={18} />
            {t('employees.addEmployee')}
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
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`relative flex-1 py-4 px-6 text-sm font-bold transition-colors ${
                activeFilter === tab.key
                  ? 'text-theme-movements'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
              {activeFilter === tab.key && (
                <span className="absolute bottom-0 inset-x-6 h-[3px] bg-theme-movements rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* ─── Table ─── */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
              <Loader2 size={24} className="animate-spin text-gold" />
              <span className="font-medium">{t('employees.loading')}</span>
            </div>
          ) : employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <Users size={28} />
              </div>
              <p className="font-medium">{t('employees.empty')}</p>
            </div>
          ) : (
            <table className="w-full text-base text-right">
              <thead>
                <tr className="bg-gray-50/70 text-gray-400">
                  <th className="px-6 py-4 font-semibold">{t('employees.table.name')}</th>
                  <th className="px-6 py-4 font-semibold">{t('employees.table.email')}</th>
                  <th className="px-6 py-4 font-semibold">{t('employees.table.phone')}</th>
                  <th className="px-6 py-4 font-semibold">{t('employees.table.nationalId')}</th>
                  <th className="px-6 py-4 font-semibold">{t('employees.table.address')}</th>
                  <th className="px-6 py-4 font-semibold">{t('employees.table.status')}</th>
                  <th className="px-6 py-4 font-semibold w-48">{t('employees.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {employees.map((emp) => (
                  <tr
                    key={emp._id}
                    className="hover:bg-gold/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-theme-movements/10 text-theme-movements flex items-center justify-center font-bold text-sm uppercase flex-shrink-0">
                          {emp.fullName?.charAt(0) || '?'}
                        </div>
                        <span className="font-semibold text-charcoal text-base">{emp.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500" dir="ltr">
                      {emp.email}
                    </td>
                    <td className="px-6 py-4 text-gray-500" dir="ltr">
                      {emp.phoneNumber || '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-500" dir="ltr">
                      {emp.nationalId || '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {emp.address || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={emp.status} />
                    </td>
                    <td className="px-6 py-4">
                      {!isArchiveView ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingEmployee(emp)}
                            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-theme-movements bg-theme-movements/8 hover:bg-theme-movements/15 border border-theme-movements/20 rounded-lg transition-colors"
                          >
                            <Pencil size={14} />
                            {t('employees.actions.edit')}
                          </button>
                          <button
                            onClick={() => setArchivingEmployee(emp)}
                            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg transition-colors"
                          >
                            <Archive size={14} />
                            {t('employees.actions.archive')}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-400 rounded-lg text-xs font-medium">
                            <Archive size={14} />
                            {t('employees.status.archived')}
                          </span>
                          <button
                            onClick={async () => {
                              try {
                                await updateEmployee(emp._id, { status: 'ACTIVE' } as any);
                              } catch (err) {
                                // Error is already handled by the hook and displayed in the banner
                              }
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-lg transition-colors"
                          >
                            <UserPlus size={14} />
                            {t('employees.actions.restore')}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ─── Modals ─── */}
      <CreateEmployeeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={createEmployee}
      />

      <EditEmployeeModal
        isOpen={!!editingEmployee}
        onClose={() => setEditingEmployee(null)}
        employee={editingEmployee}
        onSubmit={updateEmployee}
      />

      <ConfirmArchiveModal
        isOpen={!!archivingEmployee}
        onClose={() => setArchivingEmployee(null)}
        employee={archivingEmployee}
        onConfirm={softDeleteEmployee}
      />
    </div>
  );
};
