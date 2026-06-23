import { Bell } from "lucide-react";

const AdminNavbar = () => {

  console.log("Admin Navbar Loaded");

  return (
    <div className="bg-white shadow px-6 py-4 flex justify-between items-center">

      <h2 className="text-xl font-bold">
        InnoConnect Admin
      </h2>

      <div className="flex items-center gap-4">

        <Bell
          size={22}
          className="cursor-pointer"
        />

        <div className="flex items-center gap-2">

          <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
            A
          </div>

          <p className="font-semibold">
            Admin
          </p>

        </div>

      </div>

    </div>
  );
};

export default AdminNavbar;