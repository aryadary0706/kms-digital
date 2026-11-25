import React, { useState } from 'react';
import { Form, Input, Select } from 'antd';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useCreateOrangTua } from '../../queries/useOrangTuaQueries';

export default function SeparatedDaftarOrangTuaForm({ idPosyandu, idDesa }) {
  const [form] = Form.useForm();
  const createMutation = useCreateOrangTua();
  const [notice, setNotice] = useState(null);

  const isPending = createMutation.isPending;

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        setNotice(null);
        createMutation.mutate(
          {
            email: values.email || undefined,
            password: values.password,
            password_confirmation: values.password_confirmation,
            nama: values.nama,
            username: values.username,
            alamat: values.alamat,
            status: values.status ?? false,
            id_posyandu: idPosyandu,
            id_desa: idDesa,
          },
          {
            onSuccess: () => {
              setNotice({
                type: 'success',
                message: `Orang tua "${values.nama}" berhasil didaftarkan.`,
              });
              form.resetFields();
            },
            onError: (err) =>
              setNotice({
                type: 'error',
                message: err?.message ?? 'Gagal menambahkan orang tua',
              }),
          }
        );
      })
      .catch(() => {});
  };

  const handleReset = () => {
    form.resetFields();
    setNotice(null);
  };

  const isSuccess = notice?.type === 'success';

  return (
    <div className="bg-white border border-light-ash rounded-default shadow-card border-t-2 border-t-primary-500 p-[25px] space-y-[17px]">
      <h2 className="text-heading font-semibold text-deep-slate">
        Tambah Orang Tua
      </h2>

      <Form form={form} layout="vertical" name="form_daftar_orang_tua">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[17px]">
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Nama</span>}
            name="nama"
            rules={[{ required: true, message: 'Nama masih kosong' }]}
          >
            <Input placeholder="Nama lengkap" className="h-[52px] text-base" />
          </Form.Item>

          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Username</span>}
            name="username"
            rules={[{ required: true, message: 'Username masih kosong' }]}
          >
            <Input placeholder="username" className="h-[52px] text-base" />
          </Form.Item>

          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Email (opsional)</span>}
            name="email"
            rules={[{ type: 'email', message: 'Format email tidak valid' }]}
          >
            <Input placeholder="email@contoh.com" className="h-[52px] text-base" />
          </Form.Item>

          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Status</span>}
            name="status"
            rules={[{ required: true, message: 'Status masih kosong' }]}
          >
            <Select placeholder="Pilih status" className="h-[52px]">
              <Select.Option value={true}>Disetujui</Select.Option>
              <Select.Option value={false}>Belum Disetujui</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Kata Sandi</span>}
            name="password"
            rules={[
              { required: true, message: 'Kata sandi masih kosong' },
              { pattern: /^.{8,}$/, message: 'Minimal 8 karakter' },
            ]}
          >
            <Input.Password placeholder="Minimal 8 karakter" className="h-[52px] text-base" />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-body-sm font-medium text-deep-slate">
                Konfirmasi Kata Sandi
              </span>
            }
            name="password_confirmation"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Konfirmasi kata sandi' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
                  return Promise.reject(new Error('Kata sandi tidak sesuai'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Ulangi kata sandi" className="h-[52px] text-base" />
          </Form.Item>
        </div>

        <Form.Item
          label={<span className="text-body-sm font-medium text-deep-slate">Alamat</span>}
          name="alamat"
          rules={[{ required: true, message: 'Alamat masih kosong' }]}
        >
          <Input.TextArea rows={3} className="text-base" placeholder="Alamat tempat tinggal" />
        </Form.Item>
      </Form>

      <div className="flex gap-[13px] justify-end">
        <Button variant="default" size="md" onClick={handleReset} disabled={isPending}>
          Reset
        </Button>
        <Button variant="primary" size="md" onClick={handleSubmit} disabled={isPending}>
          {isPending ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>

      {notice && (
        <div
          role="status"
          aria-live="polite"
          className={`flex items-start gap-[13px] p-[17px] rounded-default border ${
            isSuccess
              ? 'bg-success/10 border-success/30 text-success'
              : 'bg-danger/10 border-danger/30 text-danger'
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 size={20} strokeWidth={2} className="shrink-0 mt-[2px]" />
          ) : (
            <XCircle size={20} strokeWidth={2} className="shrink-0 mt-[2px]" />
          )}
          <div className="flex-1">
            <p className="text-body-sm font-semibold">
              {isSuccess ? 'Berhasil' : 'Gagal'}
            </p>
            <p className="text-body-sm">{notice.message}</p>
          </div>
          <button
            type="button"
            aria-label="Tutup notifikasi"
            onClick={() => setNotice(null)}
            className="shrink-0 opacity-70 hover:opacity-100"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}
