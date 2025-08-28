"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import Card from "@/components/ui/Card";
import Calendar from "@/components/ui/Calendar";
import { useAuth } from "@/hooks";
import useApiFetch from "@/hooks/useApiFetch";
import { getPatients, getTodayAppointments, getWeeklyStats } from "@/lib/api";
import AdminDashboard from "@/components/dashboard/AdminDashboard";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const { data: patientsData, loading: loadingPatients } = useApiFetch(
    getPatients,
    [],
    false
  );
  const { data: todayData, loading: loadingToday } = useApiFetch(
    getTodayAppointments,
    [],
    false
  );
  const { data: statsData, loading: loadingStats } = useApiFetch(
    getWeeklyStats,
    [],
    false
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/signin");
  }, [authLoading, isAuthenticated, router]);

  const patients = patientsData?.patients || [];
  const today = todayData?.appointments || [];
  const { total = 0, active = 0, completed = 0, pending = 0 } = statsData || {};

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
          <p className="text-gray-600">Rola: {user.role}</p>
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
              <div>Pacjenci</div>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content className="text-center">
              {loadingToday ? (
                <Spinner size="sm" />
              ) : (
                <div className="text-3xl">{today.length}</div>
              )}
              <div>Wizyty dziś</div>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content className="text-center">
              <div className="text-3xl">{active}</div>
              <div>Aktywni</div>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content className="text-center">
              <div className="text-3xl">{completed}</div>
              <div>Zakończone</div>
            </Card.Content>
          </Card>
        </section>

        {/* Role-aware sekcje */}
        {user.role === "admin" && <AdminDashboard />}

        {user.role === "physiotherapist" && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Kalendarz</h2>
              <Calendar selectedDate={new Date()} appointments={today} />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4">Twoje sesje</h2>
              <ul className="space-y-2">
                <li>Aktywne: {today.length}</li>
                <li>Zakończone: {completed}</li>
                <li>Oczekujące: {pending}</li>
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
