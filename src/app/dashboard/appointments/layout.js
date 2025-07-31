export const metadata = {
  title: "Wizyty – Panel",
  description: "Lista wszystkich zaplanowanych i zakończonych wizyt.",
};

function AppointmentsLayout({ children }) {
  return <div className="min-h-screen flex bg-gray-100">{children}</div>;
}

export default AppointmentsLayout;
