export const metadata = {
  title: "Kalendarz – FizGab",
  description: "Zarządzaj swoim kalendarzem wizyt i wydarzeń.",
};

function CalendarLayout({ children }) {
  return <div className="min-h-screen flex bg-gray-100">{children}</div>;
}

export default CalendarLayout;
