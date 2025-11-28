"use client";

import {
  InputComponent,
  LoaderButton,
  ContainerComponent,
  ErrorDiv,
  SelectInputComponent,
  TextAreaComponent,
  ActionButtons
} from "../general/compLibrary";
import { IoClose } from "react-icons/io5";
import { useEffect, useState } from "react";
import {
  useGeneralClientFunctions,
  useNavigationHandler
} from "../../shortFunctions/clientFunctions.ts/clientFunctions";
import {
  formatDate,
  generateCustomId,
  handledDeleteImage,
  validateEmail,
  validatePhoneNumber
} from "../../shortFunctions/shortFunctions";
import { YesNoDialog } from "../general/compLibrary";
import { useAppSelector } from "@/redux/hooks";
import ImageUploadDiv from "../general/imageUploadCom";
import { handleApiRequest } from "@/axios/axiosClient";
import axios from "axios";
import { QualificationDialog } from "./qualificationDialog";
import { defaultButtonStyle, tabGroupButtonStyle } from "@/lib/generalStyles";
import reusableQueries from "@/tanStack/reusables/reusableQueries";
import { SkillDialog } from "./skillDialog";
import { MdAdd } from "react-icons/md";
import { WorkExperienceDialog } from "./workExperienceDialog";
import { IdentificationDialog } from "./identificationDialog";
import { useReusableMutations } from "@/tanStack/reusables/mutations";

const StaffProfileDialogComponent = ({
  type,
  data,
  onClose,
  onSave
}: {
  type: "new" | "edit" | "view";
  data?: any;
  onClose: (close: boolean) => void;
  onSave: (save: boolean) => void;
}) => {
  const { handleUnload } = useNavigationHandler();
  const { hasActionAccess } = reusableQueries();
  const { tanMutateAny } = useReusableMutations();
  const { getStaffImageViewSignedUrl } = useGeneralClientFunctions();
  const updateMutation = tanMutateAny("put", "alyeqeenschoolapp/api/staff/profile");
  const createMutation = tanMutateAny("post", "alyeqeenschoolapp/api/staff/profile");
  const [unsaved, setUnsaved] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageName, setImageName] = useState("");
  const [imageType, setImageType] = useState("");
  const [error, setError] = useState("");
  const [onEditMode, setOnEditMode] = useState(type === "edit");
  const [onViewMode, setOnViewMode] = useState(type === "view");
  const [onCreateMode, setOnCreateMode] = useState(type === "new");
  const [openUnsavedDialog, setOpenUnsavedDialog] = useState(false);
  const [newQualificationDialog, setNewQualificationDialog] = useState(false);
  const [editQualificationDialog, setEditQualificationDialog] = useState(false);
  const [viewQualificationDialog, setViewQualificationDialog] = useState(false);
  const [onOpenQualificationDialogData, setOnOpenQualificationDialogData] = useState({
    _id: "",
    qualificationName: "",
    schoolName: "",
    grade: "",
    startDate: "",
    endDate: ""
  });

  const [newSkillDialog, setNewSkillDialog] = useState(false);
  const [editSkillDialog, setEditSkillDialog] = useState(false);
  const [viewSkillDialog, setViewSkillDialog] = useState(false);
  const [onOpenSkillDialogData, setOnOpenSkillDialogData] = useState("");

  const [newWorkExperienceDialog, setNewWorkExperienceDialog] = useState(false);
  const [editWorkExperienceDialog, setEditWorkExperienceDialog] = useState(false);
  const [viewWorkExperienceDialog, setViewWorkExperienceDialog] = useState(false);
  const [onOpenWorkExperienceDialogData, setOnOpenWorkExperienceDialogData] = useState({
    _id: "",
    organisation: "",
    position: "",
    startDate: "",
    experience: "",
    endDate: ""
  });

  const [newIdentificationDialog, setNewIdentificationDialog] = useState(false);
  const [editIdentificationDialog, setEditIdentificationDialog] = useState(false);
  const [viewIdentificationDialog, setViewIdentificationDialog] = useState(false);
  const [onOpenIdentificationDialogData, setOnOpenIdentificationDialogData] = useState({
    _id: "",
    identificationType: "",
    identificationValue: "",
    issueDate: "",
    expiryDate: ""
  });

  const [localData, setLocalData] = useState<any>({
    staffCustomId: onCreateMode ? generateCustomId(`STF`, true, "numeric") : data.staffCustomId || "",
    staffFullName: onCreateMode ? "" : data.staffFullName,
    staffDateOfBirth: onCreateMode ? "" : data.staffDateOfBirth,
    staffGender: onCreateMode ? "" : data.staffGender,
    staffPhone: onCreateMode ? "" : data.staffPhone,
    staffEmail: onCreateMode ? "" : data.staffEmail,
    staffAddress: onCreateMode ? "" : data.staffAddress,
    staffPostCode: onCreateMode ? "" : data.staffPostCode,
    staffImageUrl: onCreateMode ? "" : data.staffImageUrl,
    imageLocalDestination: onCreateMode ? "" : data.imageLocalDestination,
    staffMaritalStatus: onCreateMode ? "" : data.staffMaritalStatus,
    staffStartDate: onCreateMode ? "" : data.staffStartDate,
    staffEndDate: onCreateMode ? "" : data.staffEndDate,
    staffNationality: onCreateMode ? "" : data.staffNationality,
    staffAllergies: onCreateMode ? "" : data.staffAllergies,
    staffNextOfKinName: onCreateMode ? "" : data.staffNextOfKinName,
    staffNextOfKinRelationship: onCreateMode ? "" : data.staffNextOfKinRelationship,
    staffNextOfKinPhone: onCreateMode ? "" : data.staffNextOfKinPhone,
    staffNextOfKinEmail: onCreateMode ? "" : data.staffNextOfKinEmail,
    staffQualification: onCreateMode ? [] : data.staffQualification || [],
    skills: onCreateMode ? [] : data.skills || [],
    identification: onCreateMode ? [] : data.identification || [],
    workExperience: onCreateMode ? [] : data.workExperience || []
  });

  const [viewImageUrl, setViewImageUrl] = useState("");

  useEffect(() => {
    if (onCreateMode) return;
    if (data.imageLocalDestination === "") return;
    const getUrl = async () => {
      const url = await getStaffImageViewSignedUrl(data.staffCustomId, data.imageLocalDestination);
      console.log(url);
      setViewImageUrl(url);
    };

    getUrl();
  }, []);

  useEffect(() => {
    if (!unsaved) return;
    handleUnload("add");

    return () => {
      handleUnload("remove");
    };
  }, [unsaved]);

  useEffect(() => {
    if (onViewMode) {
      setOnEditMode(false);
      setOnCreateMode(false);
    }
  }, [onViewMode]);

  useEffect(() => {
    if (onCreateMode) {
      setOnEditMode(false);
      setOnViewMode(false);
    }
  }, [onCreateMode]);

  useEffect(() => {
    if (onEditMode) {
      setOnCreateMode(false);
      setOnViewMode(false);
    }
  }, [onEditMode]);

  const {
    staffCustomId,
    staffFullName,
    staffDateOfBirth,
    staffGender,
    staffPhone,
    staffEmail,
    staffAddress,
    staffPostCode,
    staffImageUrl,
    imageLocalDestination,
    staffMaritalStatus,
    staffStartDate,
    staffEndDate,
    staffNationality,
    staffAllergies,
    staffNextOfKinName,
    staffNextOfKinRelationship,
    staffNextOfKinPhone,
    staffNextOfKinEmail,
    staffQualification,
    workExperience,
    identification,
    skills
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
      staffImageUrl,
      imageLocalDestination,
      staffQualification,
      workExperience,
      identification,
      skills,
      staffPostCode,
      staffEndDate,
      ...copyLocalData
    } = localData;

    if (!validateEmail(staffEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!validatePhoneNumber(staffPhone)) {
      setError("Please enter a valid phone number with the country code. e.g +234, +447");
      return;
    }

    for (const [key, value] of Object.entries(copyLocalData)) {
      if (!value || (typeof value === "string" && value.trim() === "")) {
        setError(`Missing Data: Please fill in the ${key} input`);
        return false;
      }
    }

    return true;
  };

  // function to handle all staff profile object data update
  const handleRegularUpdate = async (staffData: any) => {
    try {
      const response = await updateMutation.mutateAsync(staffData);
      if (response?.data) {
        onSave(true);
      }
    } catch (error: any) {
      setError(error.message || error.response?.data.message || "Error creating profile");
    }
  };

  // function to handle image upload and update backend and update all staff profile data upon success
  const handleUploadImage = async () => {
    try {
      const signedUrlParamData = { imageName: sanitizeStaffImageName(imageName), imageType };
      const gotSignedUrl = await handleApiRequest(
        "post",
        "alyeqeenschoolapp/api/staffimageuploadsignedurl",
        signedUrlParamData
      );

      if (gotSignedUrl) {
        const { signedUrl, publicUrl, destination }: any = gotSignedUrl.data;
        // update local image with the public url

        const updatedLocalData = { ...localData, staffImageUrl: publicUrl, imageLocalDestination: destination };
        setLocalData(updatedLocalData);

        // send put request to upload image to google cloud
        try {
          const uploadSuccessful = await axios.put(signedUrl, imageFile, {
            headers: {
              "Content-Type": imageType // important!
            }
          });

          if (uploadSuccessful) {
            handleRegularUpdate(updatedLocalData);
          }
        } catch (error: any) {
          setError(error.response?.data.message || error.message || "Error uploading image");
        }
      }
    } catch (error: any) {
      setError(error.response?.data.message || error.message || "Error getting image upload resources");
    }
  };

  // function to handle all profile update process upon edition
  const handleUpdateStaff = async () => {
    if (validationPassed()) {
      setError("");
      //  runs only on edit mode
      if (onEditMode) {
        // get signed url from the backend
        if (imageName === "") {
          handleRegularUpdate(localData);
          return;
        }
        if (imageName !== "") {
          if (staffImageUrl !== "" && imageLocalDestination !== "") {
            try {
              const deletionDone = await handledDeleteImage(imageLocalDestination);
              if (deletionDone) {
                handleUploadImage();
              } else {
                return;
              }
            } catch (error: any) {
              setError(error);
            }
          } else {
            handleUploadImage();
          }
        }
      }
    }
  };

  // function to handle staff creation
  const handleCreateStaff = async () => {
    if (validationPassed()) {
      setError("");

      if (onCreateMode) {
        // get signed url from the backend
        if (imageName === "") {
          try {
            const response = await createMutation.mutateAsync(localData);
            if (response?.data) {
              onSave(true);
            }
          } catch (error: any) {
            setError(error.message || error.response?.data.message || "Error creating profile");
          }
          return;
        }

        if (imageName !== "") {
          try {
            const signedUrlParamData = { imageName: sanitizeStaffImageName(imageName), imageType };
            const response = await handleApiRequest(
              "post",
              `alyeqeenschoolapp/api/staffimageuploadsignedurl`,
              signedUrlParamData
            );

            if (response) {
              const { signedUrl, publicUrl, destination }: any = response.data;
              // update local image with the public url

              const updatedLocalData = { ...localData, staffImageUrl: publicUrl, imageLocalDestination: destination };
              setLocalData(updatedLocalData);

              // send put request to upload image to google cloud storage
              try {
                const imageUploadSuccessful = await axios.put(signedUrl, imageFile, {
                  headers: {
                    "Content-Type": imageType
                  }
                });

                if (imageUploadSuccessful) {
                  try {
                    const response = await createMutation.mutateAsync(updatedLocalData);
                    if (response?.data) {
                      onSave(true);
                    }
                  } catch (err: any) {
                    setError(err.message || err.response?.data.message || "Error creating profile");
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
    }
  };

  return (
    <div className="fixed flex z-20 items-center justify-center inset-0 bg-foregroundColor-transparent">
      <ContainerComponent id="staffDialogContainer" style="w-[80%] h-[90%] gap-5 overflow-auto flex flex-col">
        {newSkillDialog && (
          <SkillDialog
            type="new"
            existingData={skills}
            onSave={(save, skill) => {
              setNewSkillDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                skills: [...prev.skills, skill]
              }));
              setUnsaved(true);
            }}
            onClose={(open) => {
              setNewSkillDialog(!open);
            }}
          />
        )}
        {editSkillDialog && (
          <SkillDialog
            type="edit"
            data={onOpenSkillDialogData}
            onSave={(save, returnedSkill, oldData) => {
              if (skills.includes(returnedSkill)) {
                setEditSkillDialog(!save);
                return;
              }
              setEditSkillDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                skills: prev.skills.map((skill: string) => (skill === oldData ? returnedSkill : skill))
              }));
            }}
            onClose={(open) => {
              setEditSkillDialog(!open);
            }}
          />
        )}
        {newQualificationDialog && (
          <QualificationDialog
            type="new"
            onSave={(save, returnData) => {
              setNewQualificationDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                staffQualification: [...prev.staffQualification, returnData]
              }));
              setUnsaved(true);
            }}
            onClose={(open) => {
              setNewQualificationDialog(!open);
            }}
          />
        )}
        {editQualificationDialog && (
          <QualificationDialog
            type="edit"
            data={onOpenQualificationDialogData}
            onSave={(save, returnData) => {
              setEditQualificationDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                staffQualification: [...prev.staffQualification].map((qualification: any) =>
                  qualification._id === returnData._id ? returnData : qualification
                )
              }));
            }}
            onClose={(open) => {
              setEditQualificationDialog(!open);
            }}
          />
        )}
        {viewQualificationDialog && (
          <QualificationDialog
            type="view"
            data={onOpenQualificationDialogData}
            onSave={(save, returnData) => {
              setViewQualificationDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                staffQualification: [...prev.staffQualification].map((qualification: any) =>
                  qualification._id === returnData._id ? returnData : qualification
                )
              }));
            }}
            onClose={(open) => {
              setViewQualificationDialog(!open);
            }}
          />
        )}
        {newWorkExperienceDialog && (
          <WorkExperienceDialog
            type="new"
            onSave={(save, returnData) => {
              setNewWorkExperienceDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                workExperience: [...prev.workExperience, returnData]
              }));
              setUnsaved(true);
            }}
            onClose={(open) => {
              setNewWorkExperienceDialog(!open);
            }}
          />
        )}
        {editWorkExperienceDialog && (
          <WorkExperienceDialog
            type="edit"
            data={onOpenWorkExperienceDialogData}
            onSave={(save, returnData) => {
              setEditWorkExperienceDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                workExperience: [...prev.workExperience].map((experience: any) =>
                  experience._id === returnData._id ? returnData : experience
                )
              }));
            }}
            onClose={(open) => {
              setEditWorkExperienceDialog(!open);
            }}
          />
        )}
        {viewWorkExperienceDialog && (
          <WorkExperienceDialog
            type="view"
            data={onOpenWorkExperienceDialogData}
            onSave={(save, returnData) => {
              setViewWorkExperienceDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                workExperience: [...prev.workExperience].map((experience: any) =>
                  experience._id === returnData._id ? returnData : experience
                )
              }));
            }}
            onClose={(open) => {
              setViewWorkExperienceDialog(!open);
            }}
          />
        )}
        {newIdentificationDialog && (
          <IdentificationDialog
            type="new"
            onSave={(save, returnData) => {
              setNewIdentificationDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                identification: [...prev.identification, returnData]
              }));
              setUnsaved(true);
            }}
            onClose={(open) => {
              setNewIdentificationDialog(!open);
            }}
          />
        )}
        {editIdentificationDialog && (
          <IdentificationDialog
            type="edit"
            data={onOpenIdentificationDialogData}
            onSave={(save, returnData) => {
              setEditIdentificationDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                identification: [...prev.identification].map((iden: any) =>
                  iden._id === returnData._id ? returnData : iden
                )
              }));
            }}
            onClose={(open) => {
              setEditIdentificationDialog(!open);
            }}
          />
        )}
        {viewIdentificationDialog && (
          <IdentificationDialog
            type="view"
            data={onOpenIdentificationDialogData}
            onSave={(save, returnData) => {
              setViewIdentificationDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                identification: [...prev.identification].map((iden: any) =>
                  iden._id === returnData._id ? returnData : iden
                )
              }));
            }}
            onClose={(open) => {
              setViewIdentificationDialog(!open);
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
          <h2>{onCreateMode ? "Create" : onViewMode ? "View" : "Edit"} Staff</h2>
          <div className="flex justify-between items-center gap-5">
            {onCreateMode && (
              <LoaderButton
                buttonText="Create"
                loadingButtonText="Creating Staff..."
                disabled={!unsaved}
                isLoading={createMutation.isPending}
                onClick={handleCreateStaff}
              />
            )}
            {onEditMode && (
              <LoaderButton
                buttonText="Save"
                loadingButtonText="Saving Staff..."
                disabled={!unsaved}
                isLoading={updateMutation.isPending}
                onClick={handleUpdateStaff}
              />
            )}
            {onViewMode && (
              <button
                disabled={!hasActionAccess("Edit Staff Profile")}
                hidden={!hasActionAccess("Edit Staff Profile")}
                onClick={() => setOnEditMode(true)}
                className={defaultButtonStyle}
              >
                Edit
              </button>
            )}
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
              className="text-[30px] hover:text-foregroundColor-2 hover:cursor-pointer w-full"
            />
          </div>
        </div>
        {/* input divs */}
        <div className="flex flex-col gap-3 border border-borderColor p-4 rounded-md shadow-md bg-backgroundColor-2">
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
                disabled={onViewMode}
                title="Staff Custom ID *"
                placeholder="Staff Custom ID"
                required
                name="staffCustomId"
                value={staffCustomId}
                onChange={handleInputChange}
              />

              <InputComponent
                disabled={onViewMode}
                title="Full Name *"
                autocomplete="on"
                placeholder="Full Name *"
                name="staffFullName"
                value={staffFullName}
                onChange={handleInputChange}
              />

              <InputComponent
                disabled={onViewMode}
                title="Date Of Birth *"
                type="date"
                placeholder="Date Of Birth *"
                name="staffDateOfBirth"
                value={staffDateOfBirth}
                onChange={handleInputChange}
              />

              <SelectInputComponent
                disabled={onViewMode}
                title="Gender *"
                placeholder="Gender *"
                name="staffGender"
                value={staffGender}
                onChange={handleInputChange}
                options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                  { value: "Other", label: "Other" }
                ]}
              />

              <InputComponent
                disabled={onViewMode}
                title="Phone *"
                placeholder="Phone (+44787654321)*"
                name="staffPhone"
                value={staffPhone}
                onChange={handleInputChange}
              />
              <InputComponent
                disabled={onViewMode}
                autocomplete="on"
                title="Email *"
                placeholder="Email *"
                name="staffEmail"
                value={staffEmail}
                onChange={handleInputChange}
              />
              <SelectInputComponent
                disabled={onViewMode}
                placeholder="Marital Status *"
                title="Marital Status *"
                name="staffMaritalStatus"
                value={staffMaritalStatus}
                onChange={handleInputChange}
                options={[
                  { value: "Married", label: "Married" },
                  { value: "Single", label: "Single" }
                ]}
              />

              <InputComponent
                disabled={onViewMode}
                title="Nationality *"
                placeholder="Nationality *"
                autocomplete="on"
                name="staffNationality"
                value={staffNationality}
                onChange={handleInputChange}
              />

              <InputComponent
                disabled={onViewMode}
                title="Joined Date *"
                placeholder="Joined Date *"
                type="date"
                name="staffStartDate"
                value={staffStartDate}
                onChange={handleInputChange}
              />

              <InputComponent
                disabled={onViewMode}
                title="Leave Date *"
                placeholder="Leave Date *"
                type="date"
                name="staffEndDate"
                value={staffEndDate}
                onChange={handleInputChange}
              />
            </div>
            {/* staff image div */}
            <ImageUploadDiv
              hidden={onViewMode}
              disabled={onViewMode}
              publicUrl={viewImageUrl}
              onUpload={(uploaded, publicUrl, imageFile, imageName, imageType) => {
                if (uploaded) {
                  setUnsaved(true);
                  setImageFile(imageFile);
                  setImageName(imageName);
                  setImageType(imageType);
                  setLocalData((prev: any) => ({ ...prev, staffImageUrl: publicUrl }));
                }
              }}
            />
          </div>
          <div className="flex w-full gap-3">
            <div className="w-[70%]">
              <InputComponent
                disabled={onViewMode}
                title="Address *"
                placeholder="Address *"
                name="staffAddress"
                value={staffAddress}
                onChange={handleInputChange}
              />
            </div>
            <div className="w-[30%]">
              <InputComponent
                disabled={onViewMode}
                title="Post Code *"
                placeholder="Post Code *"
                name="staffPostCode"
                value={staffPostCode}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <TextAreaComponent
            disabled={onViewMode}
            title="Allergies *"
            required
            placeholder="Allergies *"
            name="staffAllergies"
            value={staffAllergies}
            onChange={handleInputChange}
          />

          <div className="flex flex-col gap-3">
            {/* next of kin section */}
            <span className="text-[20px] font-bold mt-2">Next of Kin </span>
            <div className="grid grid-cols-2 gap-3">
              <InputComponent
                disabled={onViewMode}
                placeholder="Next Of Kin Name *"
                name="staffNextOfKinName"
                value={staffNextOfKinName}
                onChange={handleInputChange}
              />
              <InputComponent
                disabled={onViewMode}
                placeholder="Next Of Kin Relationship *"
                name="staffNextOfKinRelationship"
                value={staffNextOfKinRelationship}
                onChange={handleInputChange}
              />
              <InputComponent
                disabled={onViewMode}
                placeholder="Next Of Kin Phone *"
                name="staffNextOfKinPhone"
                value={staffNextOfKinPhone}
                onChange={handleInputChange}
              />
              <InputComponent
                disabled={onViewMode}
                placeholder="Next Of Kin Email *"
                name="staffNextOfKinEmail"
                value={staffNextOfKinEmail}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        {/* skills div */}
        <div className="flex flex-col gap-5 border border-borderColor p-4 rounded-md shadow-md bg-backgroundColor-2">
          {/* heading and action button */}
          <div className="flex justify-between gap-5">
            <div className="flex gap-3 items-center">
              <h2>Skills</h2>
              <p>{skills.length}</p>
            </div>

            <div>
              <button
                disabled={onViewMode}
                hidden={onViewMode}
                onClick={() => setNewSkillDialog(true)}
                className={defaultButtonStyle}
              >
                <MdAdd className="inline-block text-[20px] mb-1 mr-2" /> Add Skill
              </button>
            </div>
          </div>
          {/* body */}
          <div className="flex flex-wrap gap-2 max-h-[200px] min-h-[100px] overflow-auto">
            {skills.length < 1 ? (
              <div>No Skills Added</div>
            ) : (
              skills.map((skill: string) => {
                return (
                  <button
                    key={skill}
                    onClick={() => {
                      setOnOpenSkillDialogData(skill);
                      setEditSkillDialog(true);
                    }}
                    className={`${tabGroupButtonStyle} inline-flex gap-2 items-center`}
                  >
                    {skill}
                    <IoClose
                      className="hover:text-red-500 size-[18px]"
                      onClick={(e: React.MouseEvent<SVGElement>) => {
                        e.stopPropagation();
                        setLocalData((prev: any) => ({
                          ...prev,
                          skills: prev.skills.filter((s: string) => s !== skill)
                        }));
                        setUnsaved(true);
                      }}
                    />
                  </button>
                );
              })
            )}
          </div>
        </div>
        {/* education and qualification div */}
        <div className="flex flex-col gap-5 border border-borderColor p-4 rounded-md shadow-md bg-backgroundColor-2">
          {/* heading and action button */}
          <div className="flex justify-between gap-5">
            <h2>Education & Qualification</h2>
            <div>
              <button
                disabled={onViewMode}
                hidden={onViewMode}
                onClick={() => setNewQualificationDialog(true)}
                className={defaultButtonStyle}
              >
                <MdAdd className="inline-block text-[20px] mb-1 mr-2" /> Add Qualification
              </button>
            </div>
          </div>
          {/* body */}
          <div className="flex flex-wrap gap-2">
            {staffQualification.length < 1 ? (
              <div>No Qualifications Added</div>
            ) : (
              staffQualification.map((qualification: any) => {
                const { _id, qualificationName, schoolName, startDate, endDate, grade } = qualification;
                return (
                  <div
                    key={_id}
                    className="flex flex-col gap-2 w-[300px] hover:cursor-pointer bg-backgroundColor hover:bg-backgroundColor-3 border border-borderColor-2 rounded-lg shadow p-4"
                    onClick={() => {
                      setOnOpenQualificationDialogData(qualification);
                      setViewQualificationDialog(true);
                    }}
                  >
                    <div className="flex gap-5 justify-between items-center">
                      <span className="whitespace-nowrap font-bold text-[19px]">
                        {qualificationName || "".slice(0, 20)}
                      </span>
                      <ActionButtons
                        disableDelete={onViewMode}
                        hideDelete={onViewMode}
                        disableEdit={onViewMode}
                        hideEdit={onViewMode}
                        onEdit={() => {
                          setOnOpenQualificationDialogData(qualification);
                          setEditQualificationDialog(true);
                          setUnsaved(true);
                        }}
                        onDelete={() => {
                          setLocalData((prev: any) => ({
                            ...prev,
                            staffQualification: prev.staffQualification.filter(
                              (qualification: any) => qualification._id !== _id
                            )
                          }));
                          setUnsaved(true);
                        }}
                      />
                    </div>
                    <span className="whitespace-nowrap font-semibold text-foregroundColor-2 text-[16px]">
                      {schoolName || "".slice(0, 20)}
                    </span>
                    <span className="whitespace-nowrap font-semibold text-foregroundColor text-[14px]">
                      Grade: {grade || "".slice(0, 20)}
                    </span>
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
        {/* workexperience div */}
        <div className="flex flex-col gap-5 border border-borderColor p-4 rounded-md shadow-md bg-backgroundColor-2">
          {/* heading and action button */}
          <div className="flex justify-between gap-5">
            <h2>Work Experience</h2>
            <div>
              <button
                disabled={onViewMode}
                hidden={onViewMode}
                onClick={() => setNewWorkExperienceDialog(true)}
                className={defaultButtonStyle}
              >
                <MdAdd className="inline-block text-[20px] mb-1 mr-2" /> Add Work Experience
              </button>
            </div>
          </div>
          {/* body */}
          <div className="flex flex-wrap gap-2">
            {workExperience.length < 1 ? (
              <div>No Work Experience Added</div>
            ) : (
              workExperience.map((experienceObj: any) => {
                const { _id, organisation, position, startDate, endDate } = experienceObj;
                return (
                  <div
                    key={_id}
                    className="flex flex-col gap-2 w-[300px] hover:cursor-pointer bg-backgroundColor hover:bg-backgroundColor-3 border border-borderColor-2 rounded-lg shadow p-4"
                    onClick={() => {
                      setOnOpenWorkExperienceDialogData(experienceObj);
                      setViewWorkExperienceDialog(true);
                    }}
                  >
                    <div className="flex gap-5 justify-between items-center">
                      <span className="whitespace-nowrap font-bold text-[19px]">{position.slice(0, 20)}</span>
                      <ActionButtons
                        disableDelete={onViewMode}
                        hideDelete={onViewMode}
                        disableEdit={onViewMode}
                        hideEdit={onViewMode}
                        onEdit={() => {
                          setOnOpenWorkExperienceDialogData(experienceObj);
                          setEditWorkExperienceDialog(true);
                        }}
                        onDelete={() => {
                          setLocalData((prev: any) => ({
                            ...prev,
                            workExperience: prev.workExperience.filter((experience: any) => experience._id !== _id)
                          }));
                          setUnsaved(true);
                        }}
                      />
                    </div>
                    <span className="whitespace-nowrap font-semibold text-foregroundColor-2 text-[16px]">
                      {organisation}
                    </span>
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
        {/* identification div */}
        <div className="flex flex-col gap-5 border border-borderColor p-4 rounded-md shadow-md bg-backgroundColor-2">
          {/* heading and action button */}
          <div className="flex justify-between gap-5">
            <h2>Identification</h2>
            <div>
              <button
                disabled={onViewMode}
                hidden={onViewMode}
                onClick={() => setNewIdentificationDialog(true)}
                className={defaultButtonStyle}
              >
                <MdAdd className="inline-block text-[20px] mb-1 mr-2" /> Add Identification
              </button>
            </div>
          </div>
          {/* body */}
          <div className="flex flex-wrap gap-2">
            {identification.length < 1 ? (
              <div>No Identification Added</div>
            ) : (
              identification.map((identification: any) => {
                const { _id, identificationType, identificationValue, issueDate, expiryDate } = identification;
                return (
                  <div
                    key={_id}
                    className="flex flex-col gap-2 w-[300px] hover:cursor-pointer bg-backgroundColor hover:bg-backgroundColor-3 border border-borderColor-2 rounded-lg shadow p-4"
                    onClick={() => {
                      setOnOpenIdentificationDialogData(identification);
                      setViewIdentificationDialog(true);
                    }}
                  >
                    <div className="flex gap-5 justify-between items-center">
                      <span className="whitespace-nowrap font-bold text-[19px]">{identificationType.slice(0, 20)}</span>
                      <ActionButtons
                        disableDelete={onViewMode}
                        hideDelete={onViewMode}
                        disableEdit={onViewMode}
                        hideEdit={onViewMode}
                        onEdit={() => {
                          setOnOpenIdentificationDialogData(identification);
                          setEditIdentificationDialog(true);
                        }}
                        onDelete={() => {
                          setLocalData((prev: any) => ({
                            ...prev,
                            identification: prev.identification.filter((iden: any) => iden._id !== _id)
                          }));
                          setUnsaved(true);
                        }}
                      />
                    </div>
                    <span className="whitespace-nowrap font-bold text-foregroundColor-2 text-[18px]">
                      {identificationValue}
                    </span>
                    <div className="flex flex-col mt-2">
                      <span>{formatDate(issueDate)}</span>
                      <span>{formatDate(expiryDate)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </ContainerComponent>
    </div>
  );
};

export default StaffProfileDialogComponent;
