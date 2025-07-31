"use client";

import { useState } from "react";
import { useAuth } from "@/hooks";
import useApiFetch from "@/hooks/useApiFetch";
import { getServices, createService, updateService } from "@/lib/api";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";

const categoriesOptions = [
  { value: "consultation", label: "Konsultacja" },
  { value: "therapy", label: "Terapia" },
  { value: "massage", label: "Masaż" },
  { value: "exercise", label: "Ćwiczenia" },
];

export default function ServicesPage() {
  const { user, loading: authLoading } = useAuth();
  const { data, loading, error, refetch } = useApiFetch(getServices, [], true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  // Modal do dodawania/edycji
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null); // null = dodawanie, obiekt = edycja

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    duration: 30,
    isActive: true,
    bookingSettings: {
      advanceBookingDays: 30,
      cancellationDeadlineHours: 24,
    },
  });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Filtrowanie usług
  const services = (data || []).filter((srv) => {
    const matchesSearch =
      search === "" ||
      srv.name.toLowerCase().includes(search.toLowerCase()) ||
      (srv.description &&
        srv.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = category === "all" || srv.category === category;
    return matchesSearch && matchesCategory;
  });

  // Dynamiczne kategorie do selecta
  const categoryOptions = [
    { value: "all", label: "Wszystkie" },
    ...Array.from(new Set((data || []).map((s) => s.category)))
      .filter(Boolean)
      .map((c) => ({ value: c, label: c })),
  ];

  // Otwórz modal do dodawania
  const openAddModal = () => {
    setEditingService(null);
    setForm({
      name: "",
      description: "",
      category: "",
      duration: 30,
      isActive: true,
      bookingSettings: {
        advanceBookingDays: 30,
        cancellationDeadlineHours: 24,
      },
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Otwórz modal do edycji
  const openEditModal = (srv) => {
    setEditingService(srv);
    setForm({
      name: srv.name,
      description: srv.description || "",
      category: categoriesOptions.find((c) => c.value === srv.category) || "",
      duration: srv.duration,
      isActive: srv.isActive,
      bookingSettings: {
        advanceBookingDays: srv.bookingSettings?.advanceBookingDays || 30,
        cancellationDeadlineHours:
          srv.bookingSettings?.cancellationDeadlineHours || 24,
      },
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Obsługa formularza usługi
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("bookingSettings.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        bookingSettings: {
          ...prev.bookingSettings,
          [key]: type === "checkbox" ? checked : value,
        },
      }));
    } else if (name === "category") {
      setForm((prev) => ({
        ...prev,
        category: categoriesOptions.find((c) => c.value === value) || "",
      }));
    } else if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setForm((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    setFormError(null);
  };

  // Obsługa selecta kategorii (z Select)
  const handleCategorySelect = (val) => {
    setForm((prev) => ({ ...prev, category: val }));
    setFormError(null);
  };

  // Dodaj lub edytuj usługę
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!form.name || !form.category || !form.duration) {
      setFormError("Wszystkie pola wymagane: nazwa, kategoria, czas trwania.");
      return;
    }
    setSubmitting(true);

    const payload = {
      name: form.name,
      description: form.description,
      category: form.category.value || form.category,
      duration: form.duration,
      isActive: form.isActive,
      bookingSettings: form.bookingSettings,
    };

    let apiResult;
    if (editingService) {
      apiResult = await updateService(editingService._id, payload);
    } else {
      apiResult = await createService(payload);
    }
    setSubmitting(false);

    if (apiResult.error) {
      setFormError(apiResult.error);
    } else {
      setIsModalOpen(false);
      setEditingService(null);
      setForm({
        name: "",
        description: "",
        category: "",
        duration: 30,
        isActive: true,
        bookingSettings: {
          advanceBookingDays: 30,
          cancellationDeadlineHours: 24,
        },
      });
      refetch();
    }
  };

  // Kolumny tabeli z przyciskiem Edytuj
  const columns = [
    { key: "name", label: "Nazwa" },
    {
      key: "category",
      label: "Kategoria",
      render: (v) => categoriesOptions.find((c) => c.value === v)?.label || v,
    },
    { key: "duration", label: "Czas (min)" },
    { key: "isActive", label: "Aktywna", render: (v) => (v ? "Tak" : "Nie") },
    {
      key: "actions",
      label: "Akcje",
      render: (_, srv) =>
        user.role === "admin" ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => openEditModal(srv)}
          >
            Edytuj
          </Button>
        ) : (
          <span className="text-gray-400">Brak akcji</span>
        ),
    },
  ];

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" text="Ładowanie usług..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        Błąd ładowania usług: {error}
        <Button onClick={refetch} className="ml-4">
          Spróbuj ponownie
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-700">Usługi</h1>
        {user.role === "admin" && (
          <Button onClick={openAddModal}>Dodaj usługę</Button>
        )}
      </div>

      <Card>
        <Card.Content>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <Input
              placeholder="Szukaj po nazwie lub opisie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select
              options={categoryOptions}
              value={category}
              onChange={(option) => setCategory(option.value)}
              placeholder="Kategoria"
              className="max-w-xs"
            />
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setCategory("all");
              }}
            >
              Wyczyść filtry
            </Button>
          </div>
          <DataTable
            data={services}
            columns={columns}
            pageSize={10}
            loading={loading}
          />
        </Card.Content>
      </Card>

      {/* Modal dodawania/edycji usługi */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingService(null);
        }}
        title={editingService ? "Edytuj usługę" : "Dodaj usługę"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nazwa"
            name="name"
            value={form.name}
            onChange={handleFormChange}
            required
          />
          <Input
            label="Opis"
            name="description"
            value={form.description}
            onChange={handleFormChange}
          />
          <Select
            label="Kategoria"
            name="category"
            options={categoriesOptions}
            value={form.category}
            onChange={handleCategorySelect}
            required
          />
          <Input
            label="Czas trwania (minuty)"
            name="duration"
            type="number"
            min={1}
            max={480}
            value={form.duration}
            onChange={handleFormChange}
            required
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleFormChange}
            />
            <span>Usługa aktywna</span>
          </div>
          <div className="space-y-2">
            <div className="font-semibold">Ustawienia rezerwacji:</div>
            <Input
              label="Maks. dni do przodu"
              name="bookingSettings.advanceBookingDays"
              type="number"
              min={1}
              max={365}
              value={form.bookingSettings.advanceBookingDays}
              onChange={handleFormChange}
            />
            <Input
              label="Termin anulowania (godziny)"
              name="bookingSettings.cancellationDeadlineHours"
              type="number"
              min={1}
              max={168}
              value={form.bookingSettings.cancellationDeadlineHours}
              onChange={handleFormChange}
            />
          </div>
          {formError && <div className="text-red-600 text-sm">{formError}</div>}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingService(null);
              }}
              disabled={submitting}
            >
              Anuluj
            </Button>
            <Button type="submit" loading={submitting}>
              {editingService ? "Zapisz zmiany" : "Dodaj usługę"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
