export const metadata = {
  title: "Raporty – Panel",
  description: "Wybierz raport do analizy danych gabinetu",
};

function ReportsLayout({ children }) {
  return <div className="min-h-screen flex bg-gray-100">{children}</div>;
}

export default ReportsLayout;
