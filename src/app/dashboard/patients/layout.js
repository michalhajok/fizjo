export const metadata = {
  title: "Pacjenci – FizGab",
  description: "Lista pacjentów oraz ich szczegóły.",
};

function PatientsLayout({ children }) {
  return <div className="min-h-screen flex bg-gray-100">{children}</div>;
}

export default PatientsLayout;
