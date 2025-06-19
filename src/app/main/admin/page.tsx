"use client";
import { DataTable } from "@/lib/component/compLibrary";
import { checkDataType } from "@/lib/shortFunctions/shortFunctions";

const RolesAccess = () => {
  const accounts = [
    {
      accountId: "123",
      accountName: "boy",
      accountEmail: "boy@example.com",
      accountType: "User",
      accountStatus: "active",
      dateOfBirth: "2000-03-12T00:00:00.000Z",
      searchText: "123|boy|boy@example.com|User|active|12/03/2000"
    },
    {
      accountId: "124",
      accountName: "girl",
      accountEmail: "girl@example.com",
      accountType: "User",
      accountStatus: "inactive",
      dateOfBirth: "1999-07-25T00:00:00.000Z",
      searchText: "124|girl|girl@example.com|User|inactive|25/07/1999"
    },
    {
      accountId: "125",
      accountName: "admin",
      accountEmail: "admin@example.com",
      accountType: "Admin",
      accountStatus: "active",
      dateOfBirth: "1985-01-01T00:00:00.000Z",
      searchText: "125|admin|admin@example.com|Admin|active|01/01/1985"
    },
    {
      accountId: "126",
      accountName: "staff",
      accountEmail: "staff@example.com",
      accountType: "Staff",
      accountStatus: "active",
      dateOfBirth: "1992-11-14T00:00:00.000Z",
      searchText: "126|staff|staff@example.com|Staff|active|14/11/1992"
    },
    {
      accountId: "127",
      accountName: "manager",
      accountEmail: "manager@example.com",
      accountType: "Organization",
      accountStatus: "inactive",
      dateOfBirth: "1980-08-08T00:00:00.000Z",
      searchText: "127|manager|manager@example.com|Organization|inactive|08/08/1980"
    }
  ];

  return (
    <div className="px-8 py-6">
      <div>
        <DataTable
          title="Roles & Access"
          subTitle="Use this section to create and manage roles, and specify each access for each"
          searchPlaceholder="Search Role - (Name)"
          actionButtonText="New Role"
          headers={["Account ID", "Account Name", "Account Email", "Account Status", "Date of Birth"]}
          outerDivStyle="w-full flex"
          innerDivStyle="grid auto-cols-max grid-flow-col w-[95%] gap-5"
          valueDivStyle="w-[200px] whitespace-nowrap flex items-center justify-center"
          divSkeletonType="deleteEnabled"
          data={accounts}
          IdKey="accountId"
          key1="accountId"
          key2="accountName"
          key3="accountEmail"
          key4="accountStatus"
          key5="dateOfBirth"
          searchKey="searchText"
          onDivClick={(e) => {
            e.preventDefault();
            alert("You clicked on div");
          }}
          onDeleteClick={(e) => {
            e.preventDefault();
            alert("You clicked on delete");
          }}
        />
      </div>
    </div>
  );
};

export default RolesAccess;
