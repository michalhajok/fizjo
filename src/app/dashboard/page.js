"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import Card from "@/components/ui/Card";
import Calendar from "@/components/ui/Calendar";
import { useAuth } from "@/hooks";
import useApiFetch from "@/hooks/useApiFetch";
import {
  getPatients,
  getWeeklyStats,
  getStatsPhysiotherapist,
  getEmployee,
} from "@/lib/api";
import AdminDashboard from "@/components/dashboard/AdminDashboard";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [physiotherapist, setPhysiotherapist] = useState({});

  const { data: patientsData, loading: loadingPatients } = useApiFetch(
    getPatients,
    [],
    true
  );

  const { data: statsData, loading: loadingStats } = useApiFetch(
    getWeeklyStats,
    [],
    true
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/signin");
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === "physiotherapist") {
        Promise.all([getEmployee(user?._id)])
          .then(([empRes]) => {
            if (empRes.data) {
              Promise.all([
                getStatsPhysiotherapist(empRes.data.data?._id),
              ]).then(([staRes]) => {
                setPhysiotherapist(staRes?.data.data.grouped);
              });
            }
          })
          .catch((err) => {
            console.error("Error loading  data:", err);
            setError("Błąd ładowania danych ");
          });
      }
    }
  }, [user]);

  console.log(physiotherapist);

  const patients = patientsData?.data || [];
  const { total, upcoming, completed, pending, cancelled } =
    statsData?.data?.grouped || {};

  if (authLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size="lg" text="Sprawdzam..." />
      </div>
    );
  } else {
    return (
      <div className="p-6 space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-gray-700">
            Witaj, {user.firstName}!
          </h1>
          <p className="text-gray-600">
            Rola: {user.role.charAt(0).toUpperCase() + user.role.substring(1)}
          </p>
        </header>

        {/* Wspólne statystyki */}
        <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <Card>
            <Card.Content className="text-center">
              {loadingPatients ? (
                <Spinner size="sm" />
              ) : (
                <div className="text-3xl">{patients.length}</div>
              )}
              <div>Pacjenci ogółem</div>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content className="text-center">
              <div className="text-3xl">{total}</div>

              <div>Wizyty dziś</div>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content className="text-center">
              <div className="text-3xl">{upcoming}</div>
              <div>Zaplanowane</div>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content className="text-center">
              <div className="text-3xl">{completed}</div>
              <div>Zakończone</div>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content className="text-center">
              <div className="text-3xl">{cancelled}</div>
              <div>Anulowane</div>
            </Card.Content>
          </Card>
        </section>

        {/* Role-aware sekcje */}
        {user.role === "admin" && <AdminDashboard />}

        {user.role === "physiotherapist" && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Kalendarz
              </h2>
              <Calendar selectedDate={new Date()} appointments={[]} />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Twoje sesje
              </h2>
              <ul className="space-y-2 text-gray-700">
                <li>Wszystkie: {physiotherapist?.total}</li>
                <li>Oczekujące: {physiotherapist?.upcoming}</li>
                <li>Zakończone: {physiotherapist?.completed}</li>
                <li>Anulowane: {physiotherapist?.cancelled}</li>
              </ul>
            </div>
          </section>
        )}

        {user.role === "receptionist" && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Rejestracja wizyt</h2>
            <Card>
              <Card.Content>
                <p>Dodaj wizytę:</p>
                <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded">
                  Nowa wizyta
                </button>
              </Card.Content>
            </Card>
          </section>
        )}
      </div>
    );
  }
}
