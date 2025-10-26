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
import { defaultButtonStyle, tabGroupButtonStyle } from "@/lib/generalStyles";
import reusableQueries from "@/tanStack/reusables/reusableQueries";
import { MdAdd } from "react-icons/md";
import { useReusableMutations } from "@/tanStack/reusables/mutations";
import { QualificationDialog } from "../staff/qualificationDialog";
import { IdentificationDialog } from "../staff/identificationDialog";

export const StudentProfileDialogComponent = ({
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
  const { getStudentImageViewSignedUrl } = useGeneralClientFunctions();
  const updateMutation = tanMutateAny("put", "alyeqeenschoolapp/api/student/profile");
  const createMutation = tanMutateAny("post", "alyeqeenschoolapp/api/student/profile");
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
    studentCustomId: onCreateMode ? generateCustomId(`STD`, true, "numeric") : data.studentCustomId || "",
    studentFullName: onCreateMode ? "" : data.studentFullName,
    studentDateOfBirth: onCreateMode ? "" : data.studentDateOfBirth,
    studentGender: onCreateMode ? "" : data.studentGender,
    studentPhone: onCreateMode ? "" : data.studentPhone,
    studentEmail: onCreateMode ? "" : data.studentEmail,
    studentAddress: onCreateMode ? "" : data.studentAddress,
    studentPostCode: onCreateMode ? "" : data.studentPostCode,
    studentImageUrl: onCreateMode ? "" : data.studentImageUrl,
    imageLocalDestination: onCreateMode ? "" : data.imageLocalDestination,
    studentStartDate: onCreateMode ? "" : data.studentStartDate,
    studentEndDate: onCreateMode ? "" : data.studentEndDate,
    studentNationality: onCreateMode ? "" : data.studentNationality,
    studentAllergies: onCreateMode ? "" : data.studentAllergies,
    studentNextOfKinName: onCreateMode ? "" : data.studentNextOfKinName,
    studentNextOfKinRelationship: onCreateMode ? "" : data.studentNextOfKinRelationship,
    studentNextOfKinPhone: onCreateMode ? "" : data.studentNextOfKinPhone,
    studentNextOfKinEmail: onCreateMode ? "" : data.studentNextOfKinEmail,
    studentQualification: onCreateMode ? [] : data.studentQualification || [],
    identification: onCreateMode ? [] : data.identification || []
  });

  const [viewImageUrl, setViewImageUrl] = useState("");

  useEffect(() => {
    if (onCreateMode) return;
    if (data.imageLocalDestination === "") return;
    const getUrl = async () => {
      const url = await getStudentImageViewSignedUrl(data.studentCustomId, data.imageLocalDestination);
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
    studentCustomId,
    studentFullName,
    studentDateOfBirth,
    studentGender,
    studentPhone,
    studentEmail,
    studentAddress,
    studentPostCode,
    studentImageUrl,
    imageLocalDestination,
    studentStartDate,
    studentEndDate,
    studentNationality,
    studentAllergies,
    studentNextOfKinName,
    studentNextOfKinRelationship,
    studentNextOfKinPhone,
    studentNextOfKinEmail,
    studentQualification,
    identification
  } = localData;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setUnsaved(true);
    const { name, value } = e.target;
    setLocalData((prev: any) => ({ ...prev, [name]: value }));
  };
  const sanitizeStudentImageName = (originalName: string) => {
    const timestamp = Date.now();
    const extension = originalName.split(".").pop();
    return `student_${timestamp}.${extension}`;
  };

  const validationPassed = () => {
    const {
      studentCustomId,
      studentImageUrl,
      imageLocalDestination,
      studentQualification,
      identification,
      studentPostCode,
      studentEndDate,
      ...copyLocalData
    } = localData;

    if (!validateEmail(studentEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!validatePhoneNumber(studentPhone)) {
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

  // function to handle all student profile object data update
  const handleRegularUpdate = async (studentData: any) => {
    try {
      const response = await updateMutation.mutateAsync(studentData);
      if (response?.data) {
        onSave(true);
      }
    } catch (error: any) {
      setError(error.message || error.response?.data.message || "Error creating profile");
    }
  };

  // function to handle image upload and update backend and update all student profile data upon success
  const handleUploadImage = async () => {
    try {
      const signedUrlParamData = { imageName: sanitizeStudentImageName(imageName), imageType };
      const gotSignedUrl = await handleApiRequest(
        "post",
        "alyeqeenschoolapp/api/studentimageuploadsignedurl",
        signedUrlParamData
      );

      if (gotSignedUrl) {
        const { signedUrl, publicUrl, destination }: any = gotSignedUrl.data;
        // update local image with the public url

        const updatedLocalData = { ...localData, studentImageUrl: publicUrl, imageLocalDestination: destination };
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
  const handleUpdateStudent = async () => {
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
          if (studentImageUrl !== "" && imageLocalDestination !== "") {
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

  // function to handle student creation
  const handleCreateStudent = async () => {
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
            const signedUrlParamData = { imageName: sanitizeStudentImageName(imageName), imageType };
            const response = await handleApiRequest("post", `alyeqeenschoolapp/api/signedurl`, signedUrlParamData);

            if (response) {
              const { signedUrl, publicUrl, destination }: any = response.data;
              // update local image with the public url

              const updatedLocalData = { ...localData, studentImageUrl: publicUrl, imageLocalDestination: destination };
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
      <ContainerComponent id="studentDialogContainer" style="w-[80%] h-[90%] gap-5 overflow-auto flex flex-col">
        {newQualificationDialog && (
          <QualificationDialog
            type="new"
            onSave={(save, returnData) => {
              setNewQualificationDialog(!save);
              setLocalData((prev: any) => ({
                ...prev,
                studentQualification: [...prev.studentQualification, returnData]
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
                studentQualification: [...prev.studentQualification].map((qualification: any) =>
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
                studentQualification: [...prev.studentQualification].map((qualification: any) =>
                  qualification._id === returnData._id ? returnData : qualification
                )
              }));
            }}
            onClose={(open) => {
              setViewQualificationDialog(!open);
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
              const container = document.getElementById("studentDialogContainer");
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
          <h2>{onCreateMode ? "Create" : onViewMode ? "View" : "Edit"} Student</h2>
          <div className="flex justify-between items-center gap-5">
            {onCreateMode && (
              <LoaderButton
                buttonText="Create"
                loadingButtonText="Creating Student..."
                disabled={!unsaved}
                isLoading={createMutation.isPending}
                onClick={handleCreateStudent}
              />
            )}
            {onEditMode && (
              <LoaderButton
                buttonText="Save"
                loadingButtonText="Saving Student..."
                disabled={!unsaved}
                isLoading={updateMutation.isPending}
                onClick={handleUpdateStudent}
              />
            )}
            {onViewMode && (
              <button
                disabled={!hasActionAccess("Edit Student Profile")}
                hidden={!hasActionAccess("Edit Student Profile")}
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
                const container = document.getElementById("studentDialogContainer");
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
                title="Student Custom ID *"
                placeholder="Student Custom ID"
                required
                name="studentCustomId"
                value={studentCustomId}
                onChange={handleInputChange}
              />

              <InputComponent
                disabled={onViewMode}
                title="Full Name *"
                autocomplete="on"
                placeholder="Full Name *"
                name="studentFullName"
                value={studentFullName}
                onChange={handleInputChange}
              />

              <InputComponent
                disabled={onViewMode}
                title="Date Of Birth *"
                type="date"
                placeholder="Date Of Birth *"
                name="studentDateOfBirth"
                value={studentDateOfBirth}
                onChange={handleInputChange}
              />

              <SelectInputComponent
                disabled={onViewMode}
                title="Gender *"
                placeholder="Gender *"
                name="studentGender"
                value={studentGender}
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
                name="studentPhone"
                value={studentPhone}
                onChange={handleInputChange}
              />
              <InputComponent
                disabled={onViewMode}
                autocomplete="on"
                title="Email *"
                placeholder="Email *"
                name="studentEmail"
                value={studentEmail}
                onChange={handleInputChange}
              />

              <InputComponent
                disabled={onViewMode}
                title="Nationality *"
                placeholder="Nationality *"
                autocomplete="on"
                name="studentNationality"
                value={studentNationality}
                onChange={handleInputChange}
              />

              <InputComponent
                disabled={onViewMode}
                title="Joined Date *"
                placeholder="Joined Date *"
                type="date"
                name="studentStartDate"
                value={studentStartDate}
                onChange={handleInputChange}
              />

              <InputComponent
                disabled={onViewMode}
                title="Leave Date *"
                placeholder="Leave Date *"
                type="date"
                name="studentEndDate"
                value={studentEndDate}
                onChange={handleInputChange}
              />
            </div>
            {/* student image div */}
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
                  setLocalData((prev: any) => ({ ...prev, studentImageUrl: publicUrl }));
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
                name="studentAddress"
                value={studentAddress}
                onChange={handleInputChange}
              />
            </div>
            <div className="w-[30%]">
              <InputComponent
                disabled={onViewMode}
                title="Post Code *"
                placeholder="Post Code *"
                name="studentPostCode"
                value={studentPostCode}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <TextAreaComponent
            disabled={onViewMode}
            title="Allergies *"
            required
            placeholder="Allergies *"
            name="studentAllergies"
            value={studentAllergies}
            onChange={handleInputChange}
          />

          <div className="flex flex-col gap-3">
            {/* next of kin section */}
            <span className="text-[20px] font-bold mt-2">Next of Kin </span>
            <div className="grid grid-cols-2 gap-3">
              <InputComponent
                disabled={onViewMode}
                placeholder="Next Of Kin Name *"
                name="studentNextOfKinName"
                value={studentNextOfKinName}
                onChange={handleInputChange}
              />
              <InputComponent
                disabled={onViewMode}
                placeholder="Next Of Kin Relationship *"
                name="studentNextOfKinRelationship"
                value={studentNextOfKinRelationship}
                onChange={handleInputChange}
              />
              <InputComponent
                disabled={onViewMode}
                placeholder="Next Of Kin Phone *"
                name="studentNextOfKinPhone"
                value={studentNextOfKinPhone}
                onChange={handleInputChange}
              />
              <InputComponent
                disabled={onViewMode}
                placeholder="Next Of Kin Email *"
                name="studentNextOfKinEmail"
                value={studentNextOfKinEmail}
                onChange={handleInputChange}
              />
            </div>
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
            {studentQualification.length < 1 ? (
              <div>No Qualifications Added</div>
            ) : (
              studentQualification.map((qualification: any) => {
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
                            studentQualification: prev.studentQualification.filter(
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
