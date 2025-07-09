"use client";

import { InputComponent, LoaderButton, ContainerComponent, ErrorDiv } from "../../component/general/compLibrary";
import { IoClose } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useNavigationHandler } from "../../shortFunctions/clientFunctions.ts/clientFunctions";
import { CgTrash } from "react-icons/cg";
import { formatDate } from "../../shortFunctions/shortFunctions";
import { YesNoDialog } from "../../component/general/compLibrary";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { QualificationType } from "@/interfaces/interfaces";
import { nanoid } from "@reduxjs/toolkit";
import ImageUploadDiv from "../general/imageUploadCom";
import { handleApiRequest } from "@/axios/axiosClient";
import axios from "axios";
import { createStaffProfile } from "@/redux/features/staff/staffThunks";

export const QualificationDialog = ({
  type = "new",
  data,
  onSave,
  onClose
}: {
  type?: string;
  data: QualificationType;
  onSave: (save: boolean, returnData: QualificationType) => void;
  onClose: (close: boolean) => void;
}) => {
  const newDialog = type === "new";
  const { handleUnload } = useNavigationHandler();
  const [unsaved, setUnsaved] = useState(false);
  const [error, setError] = useState("");
  const [openUnsavedDialog, setOpenUnsavedDialog] = useState(false);
  const [localData, setLocalData] = useState({
    _id: data._id,
    qualificationName: data.qualificationName,
    schoolName: data.schoolName,
    startDate: data.startDate,
    endDate: data.endDate
  });

  const { qualificationName, schoolName, startDate, endDate } = localData;

  useEffect(() => {
    if (!unsaved) return;
    handleUnload("add");

    return () => {
      handleUnload("remove");
    };
  }, [unsaved]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUnsaved(true);
    setLocalData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validationPassed = () => {
    if (!qualificationName) {
      setError("Missing Data: Please provide a qualification name");
      return false;
    }

    if (!schoolName) {
      setError("Missing Data: Please provide a school/institution name");
      return false;
    }

    if (!startDate) {
      setError("Missing Data: Please provide a qualification start date");
      return false;
    }
    if (!endDate) {
      setError("Missing Data: Please provide a qualification end date");
      return false;
    }

    return true;
  };
  return (
    <div className="flex justify-center items-center absolute bg-foregroundColor-70 inset-0">
      <ContainerComponent style="w-[55%] h-[55%] gap-10 flex flex-col z-40 bg-backgroundColor overflow-auto">
        {error && (
          <ErrorDiv
            onClose={(close) => {
              if (close) {
                setError("");
              }
            }}
          >
            {error}
          </ErrorDiv>
        )}
        {openUnsavedDialog && (
          <YesNoDialog
            warningText="You have unsaved changes. Are you sure you want to proceed?"
            onNo={() => {
              const container = document.getElementById("staffDialogContainer");
              if (container) {
                container.style.overflow = "";
              }
              setOpenUnsavedDialog(false);
            }}
            onYes={() => {
              handleUnload("remove");
              const container = document.getElementById("staffDialogContainer");
              if (container) {
                container.style.overflow = "";
              }
              onClose(true);
            }}
          />
        )}
        <div className="flex justify-between items-center">
          <h2>{newDialog ? "New" : "Edit"} Qualification</h2>
          <div className="flex justify-between items-center gap-5">
            <LoaderButton
              buttonText="Save"
              loadingButtonText="Saving..."
              disabled={!unsaved}
              buttonStyle="w-full"
              onClick={async () => {
                if (validationPassed()) {
                  setError("");
                  onSave(true, { ...localData, _id: type === "edit" ? localData._id : nanoid() });
                }
              }}
            />
            <IoClose
              onClick={() => {
                if (!unsaved) {
                  onClose(true);
                } else {
                  const container = document.getElementById("staffDialogContainer");
                  if (container) {
                    container.style.overflow = "hidden";
                  }
                  setOpenUnsavedDialog(true);
                }
              }}
              className="text-[50px] hover:text-foregroundColor-50 hover:cursor-pointer"
            />
          </div>
        </div>
        <div className="flex gap-3 flex-col">
          <InputComponent
            placeholder="Qualification Name *"
            required
            name="qualificationName"
            value={qualificationName}
            onChange={handleInputChange}
          />
          <InputComponent
            placeholder="School Name *"
            required
            name="schoolName"
            value={schoolName}
            onChange={handleInputChange}
          />
          <InputComponent
            placeholder="Start Date *"
            type="date"
            required
            name="startDate"
            value={startDate}
            onChange={handleInputChange}
          />
          <InputComponent
            placeholder="End Date *"
            type="date"
            required
            name="endDate"
            value={endDate}
            onChange={handleInputChange}
          />
        </div>
      </ContainerComponent>
    </div>
  );
};

const NewStaffComponent = ({
  onClose,
  onCreate
}: {
  onClose: (close: boolean) => {};
  onCreate: (create: boolean) => {};
}) => {
  const { handleUnload } = useNavigationHandler();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.staffData);
  const [unsaved, setUnsaved] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageName, setImageName] = useState("");
  const [imageType, setImageType] = useState("");
  const [error, setError] = useState("");
  const [openUnsavedDialog, setOpenUnsavedDialog] = useState(false);
  const [newQualficationDialog, setNewQualficationDialog] = useState(false);
  const [editQualficationDialog, setEditQualficationDialog] = useState(false);
  const [editQualficationData, setEditQualficationData] = useState({
    _id: "",
    qualificationName: "",
    schoolName: "",
    startDate: "",
    endDate: ""
  });
  const [localData, setLocalData] = useState({
    staffCustomId: "",
    staffFirstName: "",
    staffMiddleName: "",
    staffLastName: "",
    staffDateOfBirth: "",
    staffGender: "",
    staffPhone: "",
    staffEmail: "",
    staffAddress: "",
    staffPostCode: "",
    staffImage: "",
    staffImageDestination: "",
    staffMaritalStatus: "",
    staffStartDate: "",
    staffEndDate: "",
    staffNationality: "",
    staffAllergies: "",
    staffNextOfKinName: "",
    staffNextOfKinRelationship: "",
    staffNextOfKinPhone: "",
    staffNextOfKinEmail: "",
    staffQualification: []
  });

  useEffect(() => {
    if (!unsaved) return;
    handleUnload("add");

    return () => {
      handleUnload("remove");
    };
  }, [unsaved]);

  const {
    staffCustomId,
    staffFirstName,
    staffMiddleName,
    staffLastName,
    staffDateOfBirth,
    staffGender,
    staffPhone,
    staffEmail,
    staffAddress,
    staffPostCode,
    staffImage,
    staffImageDestination,
    staffMaritalStatus,
    staffStartDate,
    staffEndDate,
    staffNationality,
    staffAllergies,
    staffNextOfKinName,
    staffNextOfKinRelationship,
    staffNextOfKinPhone,
    staffNextOfKinEmail,
    staffQualification
  } = localData;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setUnsaved(true);
    const { name, value } = e.target;
    setLocalData((prev: any) => ({ ...prev, [name]: value }));
  };
  const sanitizeStaffImageName = (originalName: string) => {
    const timestamp = Date.now();
    const extension = originalName.split(".").pop();
    return `staff_${timestamp}.${extension}`;
  };

  const validationPassed = () => {
    const {
      staffCustomId,
      staffImage,
      staffImageDestination,
      staffMiddleName,
      staffQualification,
      staffPostCode,
      staffEndDate,
      ...copyLocalData
    } = localData;

    for (const [key, value] of Object.entries(copyLocalData)) {
      if (!value || (typeof value === "string" && value.trim() === "")) {
        setError(`Missing Data: Please fill in the ${key} input`);
        return false;
      }
    }

    return true;
  };

  const handleCreateStaff = async () => {
    if (validationPassed()) {
      setError("");

      // get signed url from the backend
      if (imageName === "") {
        try {
          const response = await dispatch(createStaffProfile(localData)).unwrap();
          if (response) {
            onCreate(true);
          }
        } catch (err: any) {
          setError(err);
        }
        return;
      }

      if (imageName !== "") {
        try {
          const signedUrlParamData = { imageName: sanitizeStaffImageName(imageName), imageType };
          const response = await handleApiRequest(
            "post",
            "http://localhost:5000/alyeqeenschoolapp/api/signedurl",
            signedUrlParamData
          );

          if (response) {
            const { signedUrl, publicUrl, destination }: any = response.data;
            // update local image with the public url

            const updatedLocalData = { ...localData, staffImage: publicUrl, staffImageDestination: destination };
            setLocalData(updatedLocalData);

            // send put request to upload image
            try {
              const uploadResponse = await axios.put(signedUrl, imageFile, {
                headers: {
                  "Content-Type": imageType // important!
                }
              });

              if (uploadResponse) {
                try {
                  const response = await dispatch(createStaffProfile(updatedLocalData)).unwrap();
                  if (response) {
                    onCreate(true);
                  }
                } catch (err: any) {
                  setError(err);
                }
              }
            } catch (error: any) {
              setError(error.response?.data.message || error.message || "Error getting uploading image");
            }
          }
        } catch (error: any) {
          setError(error.response?.data.message || error.message || "Error getting image upload resources");
        }
      }
    }
  };

  const textAreaStyle =
    "border border-foregroundColor-25 rounded p-2 outline-none focus:border-b-3 focus:border-foregroundColor-40 w-full h-[100px] overflow-auto";

  return (
    <ContainerComponent id="staffDialogContainer" style="w-[80%] h-[90%] gap-5 overflow-auto flex flex-col">
      {newQualficationDialog && (
        <QualificationDialog
          type="new"
          data={{
            _id: "",
            qualificationName: "",
            schoolName: "",
            startDate: "",
            endDate: ""
          }}
          onSave={(save, returnData) => {
            setNewQualficationDialog(!save);
            setLocalData((prev: any) => ({
              ...prev,
              staffQualification: [...prev.staffQualification, returnData]
            }));
            setUnsaved(true);
          }}
          onClose={(open) => {
            setNewQualficationDialog(!open);
          }}
        />
      )}
      {editQualficationDialog && (
        <QualificationDialog
          type="edit"
          data={editQualficationData}
          onSave={(save, returnData) => {
            setEditQualficationDialog(!save);
            setLocalData((prev: any) => ({
              ...prev,
              staffQualification: [...prev.staffQualification].map((qualification: any) =>
                qualification._id === returnData._id ? returnData : qualification
              )
            }));
          }}
          onClose={(open) => {
            setEditQualficationDialog(!open);
          }}
        />
      )}
      {openUnsavedDialog && (
        <YesNoDialog
          warningText="You have unsaved changes. Are you sure you want to proceed?"
          onNo={() => {
            const container = document.getElementById("staffDialogContainer");
            if (container) {
              container.style.overflow = "";
            }
            setOpenUnsavedDialog(false);
          }}
          onYes={() => {
            handleUnload("remove");
            onClose(true);
          }}
        />
      )}
      {/* top div */}
      <div className="flex justify-between items-center">
        <h2>New Staff</h2>
        <div className="flex justify-between items-center gap-5">
          <LoaderButton
            buttonText="Create"
            loadingButtonText="Creating Staff..."
            disabled={!unsaved}
            buttonStyle="w-full"
            isLoading={isLoading}
            onClick={handleCreateStaff}
          />
          <IoClose
            onClick={() => {
              if (!unsaved) {
                onClose(true);
              }
              const container = document.getElementById("staffDialogContainer");
              if (container) {
                container.style.overflow = "hidden";
              }
              setOpenUnsavedDialog(true);
            }}
            className="text-[50px] hover:text-foregroundColor-50 hover:cursor-pointer"
          />
        </div>
      </div>
      {/* input divs */}
      <div className="flex flex-col gap-3">
        {error && (
          <ErrorDiv
            onClose={(close) => {
              if (close) {
                setError("");
              }
            }}
          >
            {error}
          </ErrorDiv>
        )}
        {/* text and image div */}
        <div className="flex">
          {/* text div */}
          <div className="grid grid-cols-2 gap-3 w-[70%]">
            <InputComponent
              placeholder="Staff Custom ID"
              required
              name="staffCustomId"
              value={staffCustomId}
              onChange={handleInputChange}
            />
            <InputComponent
              placeholder="First Name *"
              required
              name="staffFirstName"
              value={staffFirstName}
              onChange={handleInputChange}
            />
            <InputComponent
              placeholder="Middle Name"
              name="staffMiddleName"
              value={staffMiddleName}
              onChange={handleInputChange}
            />
            <InputComponent
              placeholder="Last Name *"
              name="staffLastName"
              value={staffLastName}
              onChange={handleInputChange}
            />
            <div className="gap-1 flex flex-col">
              <h3 className="ml-1">Date Of Birth *</h3>
              <InputComponent
                type="date"
                placeholder="Date Of Birth *"
                name="staffDateOfBirth"
                value={staffDateOfBirth}
                onChange={handleInputChange}
              />
            </div>

            <select
              name="staffGender"
              value={staffGender}
              onChange={handleInputChange}
              className="bg-backgroundColor border border-foregroundColor-25 rounded p-2 outline-none focus:border-b-3 focus:border-foregroundColor-40 w-full"
            >
              <option disabled value="">
                Gender *
              </option>
              <option value="Male"> Gender - Male</option>
              <option value="Female"> Gender - Female</option>
              <option value="Other"> Gender - Other</option>
            </select>
            <InputComponent placeholder="Phone *" name="staffPhone" value={staffPhone} onChange={handleInputChange} />
            <InputComponent placeholder="Email *" name="staffEmail" value={staffEmail} onChange={handleInputChange} />
            <select
              name="staffMaritalStatus"
              value={staffMaritalStatus}
              onChange={handleInputChange}
              className="bg-backgroundColor border border-foregroundColor-25 rounded p-2 outline-none focus:border-b-3 focus:border-foregroundColor-40 w-full"
            >
              <option disabled value="">
                Marital Status *
              </option>
              <option value="Married"> Marital Status - Married</option>
              <option value="Single"> Marital Status - Single</option>
            </select>
            <InputComponent
              placeholder="Nationality *"
              name="staffNationality"
              value={staffNationality}
              onChange={handleInputChange}
            />

            <div className="gap-1 flex flex-col">
              <h3 className="ml-1">Joined Date *</h3>
              <InputComponent
                placeholder="Joined Date *"
                type="date"
                name="staffStartDate"
                value={staffStartDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="gap-1 flex flex-col">
              <h3 className="ml-1">Leave Date</h3>

              <InputComponent
                placeholder="Leave Date"
                type="date"
                name="staffEndDate"
                value={staffEndDate}
                onChange={handleInputChange}
              />
            </div>
          </div>
          {/* staff image div */}
          <ImageUploadDiv
            publicUrl={staffImage}
            onUpload={(uploaded, publicUrl, imageFile, imageName, imageType) => {
              if (uploaded) {
                setUnsaved(true);
                setImageFile(imageFile);
                setImageName(imageName);
                setImageType(imageType);
                setLocalData((prev: any) => ({ ...prev, staffImage: publicUrl }));
              }
            }}
          />
        </div>
        <div className="flex w-full gap-3">
          <div className="w-[70%]">
            <InputComponent
              placeholder="Address *"
              name="staffAddress"
              value={staffAddress}
              onChange={handleInputChange}
            />
          </div>
          <div className="w-[30%]">
            <InputComponent
              placeholder="Post Code"
              name="staffPostCode"
              value={staffPostCode}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <textarea
          placeholder="Allergies *"
          required
          name="staffAllergies"
          value={staffAllergies}
          onChange={handleInputChange}
          className={textAreaStyle}
        />
        <div className="flex flex-col gap-3">
          {/* next of kin section */}
          <span className="text-[20px] font-bold mt-2">Next of Kin </span>
          <div className="grid grid-cols-2 gap-3">
            <InputComponent
              placeholder="Next Of Kin Name *"
              name="staffNextOfKinName"
              value={staffNextOfKinName}
              onChange={handleInputChange}
            />
            <InputComponent
              placeholder="Next Of Kin Relationship *"
              name="staffNextOfKinRelationship"
              value={staffNextOfKinRelationship}
              onChange={handleInputChange}
            />
            <InputComponent
              placeholder="Next Of Kin Phone *"
              name="staffNextOfKinPhone"
              value={staffNextOfKinPhone}
              onChange={handleInputChange}
            />
            <InputComponent
              placeholder="Next Of Kin Email *"
              name="staffNextOfKinEmail"
              value={staffNextOfKinEmail}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
      {/* education and qualification div */}
      <div className="flex flex-col gap-5">
        {/* heading and action button */}
        <div className="flex justify-between gap-5">
          <h2>Education & Qualification</h2>
          <div>
            <button onClick={() => setNewQualficationDialog(true)}>Add Qualification</button>
          </div>
        </div>
        {/* body */}
        <div className="flex flex-wrap gap-2">
          {staffQualification.length < 1 ? (
            <div>No Qualifications Added</div>
          ) : (
            staffQualification.map((qualification: any) => {
              const { _id, qualificationName, schoolName, startDate, endDate } = qualification;
              return (
                <div
                  key={_id}
                  className="flex flex-col w-[300px] hover:cursor-pointer hover:bg-foregroundColor-5 border border-foregroundColor-15 rounded-lg shadow p-4"
                  onClick={() => {
                    setEditQualficationData(qualification);
                    setEditQualficationDialog(true);
                  }}
                >
                  <div className="flex gap-5 justify-between items-center">
                    <span className="whitespace-nowrap font-bold text-[19px]">{qualificationName.slice(0, 20)}</span>{" "}
                    <CgTrash
                      className="text-[25px] hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUnsaved(true);
                        setLocalData((prev: any) => ({
                          ...prev,
                          staffQualification: prev.staffQualification.filter(
                            (qualification: any) => qualification._id !== _id
                          )
                        }));
                      }}
                    />
                  </div>
                  <span className="whitespace-nowrap font-bold text-foregroundColor-60 text-[18px]">{schoolName}</span>
                  <div className="flex flex-col mt-2">
                    <span>{formatDate(startDate)}</span>
                    <span>{formatDate(endDate)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </ContainerComponent>
  );
};

export default NewStaffComponent;
