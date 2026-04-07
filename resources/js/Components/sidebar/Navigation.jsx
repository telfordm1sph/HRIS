import { usePage } from "@inertiajs/react";
import SidebarLink from "@/Components/sidebar/SidebarLink";

import { User, Users, ClipboardList, Upload, Database } from "lucide-react";
import Dropdown from "./DropDown";

export default function NavLinks({ isSidebarOpen }) {
    const { emp_data } = usePage().props;
    console.log(emp_data);

    return (
        <nav
            className="flex flex-col flex-grow space-y-1 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
        >
            <SidebarLink
                href={route("employees.show", btoa(emp_data.emp_id))}
                label="Details"
                icon={<User className="w-5 h-5" />}
                isSidebarOpen={isSidebarOpen}
            />
            <SidebarLink
                href={route("employees.index")}
                label="Employee List"
                icon={<Users className="w-5 h-5" />}
                isSidebarOpen={isSidebarOpen}
            />
            <SidebarLink
                href={route("change-requests.index")}
                label="Change Requests"
                icon={<ClipboardList className="w-5 h-5" />}
                isSidebarOpen={isSidebarOpen}
            />
            <SidebarLink
                href={route("import.index")}
                label="Import"
                icon={<Upload className="w-5 h-5" />}
                isSidebarOpen={isSidebarOpen}
            />
            <SidebarLink
                href={route("lookups.index")}
                label="Lookups"
                icon={<Database className="w-5 h-5" />}
                isSidebarOpen={isSidebarOpen}
            />
        </nav>
    );
}
