import { Form, Input, Select, Modal } from "antd";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import InlineStatBar from "../../components/ui/InlineStatBar";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "../../components/ui/Toast";
import { useSession } from "../../features/auth/useSession";
import { isThisMonth } from "../../utils/isThisMonth";
import { desaApi } from "../../api/desa.api";
import { KelurahanApi } from "../../api/perangkat-desa.api";
import { qk } from "../../queries/keys";

export default function RegisterPetugasKelurahan() {
  const [form] = Form.useForm();
  const toast = useToast();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const queryClient = useQueryClient();

  const { isAuthenticated } = useSession();

  const { data: dataDesa, isLoading: desaLoading } = useQuery({
    queryKey: qk.desa.list,
    queryFn: async () => {
      const res = await desaApi.list();
      return res.data ?? [];
    },
    enabled: isAuthenticated,
  });

  const { data: petugasData, isLoading: petugasLoading } = useQuery({
    queryKey: qk.petugasKelurahan.list,
    queryFn: async () => {
      const res = await KelurahanApi.list();
      return res.data ?? [];
    },
    enabled: isAuthenticated,
  });

  const createPetugasMutation = useMutation({
    mutationFn: (values: Record<string, any>) =>
      KelurahanApi.register({
        nama: values.nama,
        username: values.username,
        email: values.email || undefined,
        password: values.password,
        password_confirmation: values.password_confirmation,
        jabatan: values.jabatan,
        no_hp: values.no_hp,
        alamat: values.alamat,
        id_desa: values.id_desa,
        status: true,
      }),
    onSuccess: () => {
      toast.success("Petugas Kelurahan berhasil didaftarkan");
      form.resetFields();
      setIsModalVisible(false);
      queryClient.invalidateQueries({ queryKey: qk.petugasKelurahan.all });
    },
    onError: (err) =>
      toast.error(err?.message ?? "Gagal mendaftarkan Petugas Kelurahan"),
  });

  const updatePetugasMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: Record<string, any> }) =>
      KelurahanApi.update(id, {
        nama: values.nama,
        username: values.username,
        email: values.email || undefined,
        password: values.password || undefined,
        password_confirmation: values.password
          ? values.password_confirmation
          : undefined,
        jabatan: values.jabatan,
        no_hp: values.no_hp,
        alamat: values.alamat,
        id_desa: values.id_desa,
        status: true,
      }),
    onMutate: async ({ id, values }) => {
      await queryClient.cancelQueries({ queryKey: qk.petugasKelurahan.list });
      const previous = queryClient.getQueryData(qk.petugasKelurahan.list);
      queryClient.setQueryData(qk.petugasKelurahan.list, (old) =>
        Array.isArray(old)
          ? old.map((item) =>
              item.id === id
                ? {
                    ...item,
                    nama: values.nama,
                    username: values.username,
                    email: values.email || undefined,
                    jabatan: values.jabatan,
                    no_hp: values.no_hp,
                    alamat: values.alamat,
                    id_desa: values.id_desa,
                    desa: values.id_desa
                      ? dataDesa?.find((d) => d.id === values.id_desa) ?? item.desa
                      : item.desa,
                  }
                : item
            )
          : old
      );
      return { previous };
    },
    onSuccess: () => {
      toast.success("Petugas Kelurahan berhasil diperbarui");
      form.resetFields();
      setIsModalVisible(false);
      setModalMode("add");
      setSelectedUser(null);
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous !== undefined) {
        queryClient.setQueryData(qk.petugasKelurahan.list, ctx.previous);
      }
      toast.error(err?.message ?? "Gagal memperbarui Petugas Kelurahan");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qk.petugasKelurahan.all });
    },
  });

  const deletePetugasMutation = useMutation({
    mutationFn: (id) => KelurahanApi.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: qk.petugasKelurahan.list });
      const previous = queryClient.getQueryData(qk.petugasKelurahan.list);
      queryClient.setQueryData(qk.petugasKelurahan.list, (old) =>
        Array.isArray(old) ? old.filter((item) => item.id !== id) : old
      );
      return { previous };
    },
    onSuccess: () => {
      toast.success("Petugas Kelurahan berhasil dihapus");
      setIsDeleteModalVisible(false);
      setUserToDelete(null);
    },
    onError: (err, _id, ctx) => {
      if (ctx?.previous !== undefined) {
        queryClient.setQueryData(qk.petugasKelurahan.list, ctx.previous);
      }
      toast.error(err?.message ?? "Gagal menghapus Petugas Kelurahan");
      setIsDeleteModalVisible(false);
      setUserToDelete(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qk.petugasKelurahan.all });
    },
  });

  const isBusy =
    createPetugasMutation.isPending ||
    updatePetugasMutation.isPending ||
    deletePetugasMutation.isPending;

  const showDeleteConfirm = (id) => {
    setUserToDelete(id);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deletePetugasMutation.mutate(userToDelete);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
    setUserToDelete(null);
  };

  const handleEdit = (record) => {
    setModalMode("edit");
    setSelectedUser(record);
    form.setFieldsValue({
      nama: record.nama,
      username: record.username,
      email: record.email,
      jabatan: record.jabatan,
      no_hp: record.no_hp,
      alamat: record.alamat,
      id_desa: record.desa?.id ?? record.id_desa,
    });
    setIsModalVisible(true);
  };

  const rows = petugasData ?? [];
  const stats = [
    { label: "Total Petugas Kelurahan", value: rows.length },
    {
      label: "Baru Bulan Ini",
      value: rows.filter((r) => isThisMonth(r.created_at)).length,
      accent: "primary",
    },
  ];

  const columns = [
    { accessorKey: "nama", header: "Nama", enableSorting: true },
    { accessorKey: "username", header: "Username", enableSorting: true },
    { accessorKey: "jabatan", header: "Jabatan", enableSorting: true },
    { accessorKey: "no_hp", header: "No. HP", enableSorting: true },
    {
      id: "desa",
      header: "Kelurahan",
      accessorFn: (row) =>
        row.desa?.name ??
        dataDesa?.find((d) => d.id === row.id_desa)?.name ??
        "N/A",
      enableSorting: true,
    },
    {
      id: "action",
      header: "Aksi",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            leadingIcon={<Pencil size={16} strokeWidth={1.75} />}
            onClick={() => handleEdit(row.original)}
            disabled={isBusy}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            leadingIcon={<Trash2 size={16} strokeWidth={1.75} />}
            onClick={() => showDeleteConfirm(row.original.id)}
            disabled={isBusy}
          >
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  const onFinish = (values) => {
    if (modalMode === "edit" && selectedUser) {
      updatePetugasMutation.mutate({ id: selectedUser.id, values });
    } else {
      createPetugasMutation.mutate(values);
    }
  };

  const showModal = () => {
    setModalMode("add");
    setSelectedUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setModalMode("add");
    setSelectedUser(null);
    form.resetFields();
  };

  return (
    <div>
      {toast.contextHolder}
      <PageHeader
        eyebrow="Akun Pengguna"
        title="Kelola Petugas Kelurahan"
        subtitle="Daftar Petugas Kelurahan yang terdaftar di tiap kelurahan."
        dataTourId="admin-tenkes-header"
        action={
          <Button
            data-tour-id="admin-tenkes-add-button"
            variant="primary"
            size="lg"
            leadingIcon={<Plus size={20} strokeWidth={2} />}
            onClick={showModal}
            disabled={isBusy}
          >
            Tambah Petugas Kelurahan
          </Button>
        }
        stats={<InlineStatBar items={stats} loading={petugasLoading} />}
      />

      <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[33px]">
        <div
          className="bg-white border border-light-ash rounded-default shadow-card border-t-2 border-t-primary-500 p-[25px]"
          data-tour-id="admin-tenkes-table"
        >
          <DataTable
            columns={columns}
            data={rows}
            loading={petugasLoading || isBusy}
            rowKey="id"
            searchPlaceholder="Cari Petugas Kelurahan..."
            emptyText="Belum ada Petugas Kelurahan terdaftar"
          />
        </div>
      </div>

      <Modal
        title={
          <span className="text-heading font-semibold text-deep-slate">
            {modalMode === "add"
              ? "Registrasi Petugas Kelurahan"
              : "Edit Petugas Kelurahan"}
          </span>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          name="register_petugas_kelurahan"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Nama</span>}
            name="nama"
            rules={[{ required: true, message: "Nama masih kosong" }]}
          >
            <Input placeholder="Nama Lengkap" className="h-[52px] text-base" />
          </Form.Item>
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Username</span>}
            name="username"
            rules={[{ required: true, message: "Username masih kosong" }]}
          >
            <Input placeholder="username" className="h-[52px] text-base" />
          </Form.Item>
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Email (opsional)</span>}
            name="email"
            rules={[
              { type: "email", message: "Format email tidak valid" },
            ]}
          >
            <Input placeholder="email@contoh.com" className="h-[52px] text-base" />
          </Form.Item>
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Kata Sandi</span>}
            name="password"
            rules={
              modalMode === "add"
                ? [
                    { required: true, message: "Kata sandi masih kosong" },
                    { pattern: /^.{8,}$/, message: "Minimal 8 karakter" },
                  ]
                : [{ pattern: /^.{8,}$/, message: "Minimal 8 karakter" }]
            }
          >
            <Input.Password
              placeholder={modalMode === "add" ? "Minimal 8 karakter" : "Kosongkan jika tidak diubah"}
              className="h-[52px] text-base"
            />
          </Form.Item>
          <Form.Item
            label={
              <span className="text-body-sm font-medium text-deep-slate">
                Konfirmasi Kata Sandi
              </span>
            }
            name="password_confirmation"
            dependencies={["password"]}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const password = getFieldValue("password");
                  if (modalMode !== "add" && !password) {
                    return Promise.resolve();
                  }
                  if (!value) {
                    return Promise.reject(new Error("Konfirmasi kata sandi"));
                  }
                  if (password !== value) {
                    return Promise.reject(new Error("Kata sandi tidak sesuai"));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input.Password placeholder="Ulangi kata sandi" className="h-[52px] text-base" />
          </Form.Item>
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Jabatan</span>}
            name="jabatan"
            rules={[{ required: true, message: "Jabatan masih kosong" }]}
          >
            <Input placeholder="Contoh: Sekretaris Kelurahan" className="h-[52px] text-base" />
          </Form.Item>
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">No. HP</span>}
            name="no_hp"
            rules={[
              { required: true, message: "No. HP masih kosong" },
              { pattern: /^[0-9+]{8,15}$/, message: "No. HP tidak valid" },
            ]}
          >
            <Input placeholder="08xxxxxxxxxx" inputMode="tel" className="h-[52px] text-base" />
          </Form.Item>
          <Form.Item
            label={<span className="text-body-sm font-medium text-deep-slate">Alamat</span>}
            name="alamat"
            rules={[{ required: true, message: "Alamat masih kosong" }]}
          >
            <Input.TextArea rows={3} placeholder="Alamat tempat tinggal" className="text-base" />
          </Form.Item>
          <Form.Item
            name="id_desa"
            label={<span className="text-body-sm font-medium text-deep-slate">Kelurahan</span>}
            rules={[{ required: true, message: "Kelurahan masih kosong" }]}
          >
            <Select
              listHeight={200}
              optionFilterProp="children"
              showSearch
              placeholder="Pilih Kelurahan"
              disabled={desaLoading}
              className="h-[52px]"
            >
              {dataDesa?.map((value) => (
                <Select.Option key={value.id} value={value.id}>
                  {value.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <div className="flex gap-[13px] justify-end pt-[13px]">
            <Button
              variant="default"
              size="md"
              onClick={handleCancel}
              disabled={
                createPetugasMutation.isPending ||
                updatePetugasMutation.isPending
              }
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={
                createPetugasMutation.isPending ||
                updatePetugasMutation.isPending
              }
            >
              {createPetugasMutation.isPending ||
              updatePetugasMutation.isPending
                ? "Menyimpan..."
                : "Simpan"}
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title={
          <span className="text-heading font-semibold text-deep-slate">
            Konfirmasi Hapus
          </span>
        }
        open={isDeleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Hapus"
        cancelText="Batal"
        okButtonProps={{ danger: true }}
      >
        <p className="text-body-sm text-deep-slate">
          Apakah Anda yakin ingin menghapus Petugas Kelurahan ini?
        </p>
      </Modal>
    </div>
  );
}
