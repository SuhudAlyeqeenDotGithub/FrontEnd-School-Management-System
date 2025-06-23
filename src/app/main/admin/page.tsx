"use client";
import { checkDataType } from "@/lib/shortFunctions/shortFunctions";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { useEffect, useState } from "react";
import { fetchRolesAccess } from "@/redux/features/admin/roles/roleThunks";
import { ErrorDiv } from "@/lib/component/compLibrary";
import { LuArrowUpDown } from "react-icons/lu";
import { FaSearch } from "react-icons/fa";
import { CgTrash } from "react-icons/cg";
import { formatDate } from "@/lib/shortFunctions/shortFunctions";
import { EditRoleDialog } from "@/lib/component/editRoleComponents";
import { setOnOpenRoleData } from "@/redux/features/general/generalSlice";
import { NewRoleDialog } from "@/lib/component/newRoleComponent";

const RolesAccess = () => {
  const dispatch = useAppDispatch();
  const { roles, isLoading } = useAppSelector((state) => state.rolesAccess);
  const [localData, setLocalData] = useState<any>([]);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortOrderTracker, setSortOrderTracker] = useState<any>({});
  const [openEditRoleDialog, setOpenEditRoleDialog] = useState(false);
  const [openNewRoleDialog, setOpenNewRoleDialog] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await dispatch(fetchRolesAccess()).unwrap();
      } catch (error: any) {
        setError(error);
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    setLocalData(roles);
  }, [roles]);

  useEffect(() => {
    if (searchValue !== "") {
      const filteredData = roles.filter((obj: any) => obj.searchText.toLowerCase().includes(searchValue.toLowerCase()));
      setLocalData(filteredData);
    } else {
      setLocalData(roles);
    }
  }, [searchValue]);

  return (
    <div className="px-8 py-6">
      {error && <ErrorDiv>{error}</ErrorDiv>}{" "}
      {openEditRoleDialog && (
        <div className="absolute flex items-center justify-center inset-0 bg-foregroundColor-90">
          <EditRoleDialog
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenEditRoleDialog(!open);
              return {};
            }}
          />
        </div>
      )}
      {openNewRoleDialog && (
        <div className="absolute flex items-center justify-center inset-0 bg-foregroundColor-90">
          <NewRoleDialog
            onClose={(open: boolean) => {
              document.body.style.overflow = "";
              setOpenNewRoleDialog(!open);
              return {};
            }}
          />
        </div>
      )}
      {/* data table section */}
      <div>
        {/* data table div */}
        <div className="flex flex-col gap-4">
          {/* title */}
          <div className="flex flex-col gap-2 mb-5">
            <h2>Role and Access</h2>
            <h3>Use this section to create and manage roles, and specify each access for each</h3>
          </div>
          {/* search bar and new action Button */}
          <div className="flex justify-between items-center">
            {/* search div */}
            <div className="flex w-[500px] h-[50px] items-center gap-2">
              <input
                className="border border-foregroundColor-25 rounded p-2 outline-none focus:border-b-3 focus:border-foregroundColor-40 w-full"
                placeholder="Searh role (Name, Created By)"
                name="searchValue"
                onChange={(e) => {
                  setSearchValue(e.target.value);
                }}
              />
              <FaSearch className="text-foregroundColor size-5" />
            </div>
            {/* new action button */}
            <div>
              <button onClick={() => setOpenNewRoleDialog(true)}>New Role</button>
            </div>
          </div>

          {/* table body */}
          <div className="flex flex-col gap-2">
            {/* table header */}
            <div className="w-full flex px-4 py-3 p-2 h-[50px]">
              <div className="grid auto-cols-max grid-flow-col w-[95%] gap-5">
                {["Role Name", "Created By", "Created At", "Tab Access"].map((header) => (
                  <div
                    key={header}
                    className="font-semibold flex gap-1 p-2 hover:bg-foregroundColor-5 hover:border border-foregroundColor-10 hover:cursor-pointer rounded-lg whitespace-nowrap items-center justify-center w-[200px]"
                  >
                    {header} <LuArrowUpDown />
                  </div>
                ))}
              </div>
            </div>

            {/* table data */}
            <div className="flex flex-col gap-2 mt-3">
              {localData.length < 1 && searchValue ? (
                <div className="flex justify-center mt-6">No search result found</div>
              ) : localData.length < 1 ? (
                <div className="flex justify-center mt-6">No data available</div>
              ) : (
                localData.map((doc: any, index: any) => {
                  const { _id: roleId, roleName, accountId, createdAt, tabAccess } = doc;
                  const tabs = tabAccess
                    .map((tab: any) => tab.tab)
                    .slice(0, 5)
                    .join(", ");
                  return (
                    <div
                      key={roleId}
                      onClick={() => {
                        document.body.style.overflow = "hidden";
                        setOpenEditRoleDialog(true);
                        dispatch(setOnOpenRoleData(doc));
                      }}
                      className="w-full flex px-4 border border-foregroundColor-15 rounded-md shadow-sm py-3 hover:bg-foregroundColor-5 hover:cursor-pointer"
                    >
                      <div className="grid auto-cols-max grid-flow-col w-[95%] gap-5">
                        <span className="whitespace-nowrap flex items-center justify-center w-[200px]">
                          {roleName.slice(0, 15)}
                        </span>
                        <span className="whitespace-nowrap flex items-center justify-center w-[200px]">
                          {accountId.accountName}
                        </span>
                        <span className="whitespace-nowrap flex items-center justify-center w-[200px]">
                          {formatDate(createdAt)}
                        </span>
                        <span className="whitespace-nowrap flex items-center justify-center w-full">{tabs}.....</span>
                      </div>

                      <CgTrash
                        className="text-[25px] hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          alert("oh you are trying to delete a role");
                        }}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
      {/* end of data table */}
    </div>
  );
};

export default RolesAccess;
