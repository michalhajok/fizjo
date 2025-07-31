import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
//import MobileDrawer from "./MobileDrawer"; // jeśli już masz

export const metadata = {
  title: "Dashboard – FizjoCare",
  description: "Panel administracyjny",
};

function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      {/* <MobileDrawer open={isOpen} onClose={() => setIsOpen(false)}>
        <Sidebar />
      </MobileDrawer> */}

      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
