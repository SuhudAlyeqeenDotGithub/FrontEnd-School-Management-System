import { AlertTriangle, Check, Database, X } from "lucide-react";
import { CustomBadge, CustomButton, CustomModal, ErrorDiv, IconFormatter, LoaderDiv } from "../general/compLibrary";
import {
  dollarToNaira,
  dollarToPounds,
  getDollarNairaRate,
  getDollarPoundsRate,
  makeHumanReadable
} from "@/lib/shortFunctions/shortFunctions";
import reusableQueries from "@/tanStack/reusables/reusableQueries";
import { handleApiRequest } from "@/axios/axiosClient";
import { useAppDispatch } from "@/redux/hooks";
import { updateOrgInAccount } from "@/redux/features/accounts/accountSlice";
import { useState } from "react";
import { set } from "date-fns";

export const FeatureDialog = ({
  isOpen,
  onClose,
  title,
  size,
  selectedFeature,
  allFeatures,
  feature_IconMap
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size: "default" | "large";
  selectedFeature: any;
  allFeatures: any[];
  feature_IconMap: any;
}) => {
  const { orgFeatures, featuresFromQuery, orgFeaturesInString } = reusableQueries();
  const dispatch = useAppDispatch();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openRemoveFeatureDialog, setOpenRemoveFeatureDialog] = useState(false);
  const isMandatory = selectedFeature.mandatory;
  const isAdded = orgFeatures.some((f: any) => f._id === selectedFeature._id);
  const isLaunchingSoon = selectedFeature.availability === "Launching Soon";

  const featureIsValidated = () => {
    const selectedFeatureRequirements = selectedFeature.requirements;
    if (selectedFeatureRequirements.length === 0) return true;
    if (selectedFeatureRequirements.every((f: any) => orgFeaturesInString.includes(f))) {
      return true;
    } else {
      setError(
        "You need to have the following features to purchase this feature: " + selectedFeatureRequirements.join(", ")
      );
      return false;
    }
  };

  const isRequirementForExistingFeature = () => {
    const nonMandatoryFeatures = featuresFromQuery.filter((f: any) => !f.mandatory);
    const dependentFeatures = nonMandatoryFeatures.filter(
      (f: any) => orgFeaturesInString.includes(f.name) && f.requirements.includes(selectedFeature.name)
    );

    if (dependentFeatures.length > 0) {
      setError(
        `This feature cannot be removed as it is a requirement for the following existing feature : (${dependentFeatures
          .map((f: any) => f.name)
          .join(", ")}) - You need to be removed them if you want to remove this feature`
      );

      return true;
    }
  };
  const handlePurchase = async () => {
    if (!featureIsValidated()) return;
    setError("");
    setLoading(true);
    try {
      const updatedOrAccount = await handleApiRequest("post", "alyeqeenschoolapp/api/admin/feature/purchase", {
        _id: selectedFeature._id
      });
      const data = updatedOrAccount?.data;

      if (data) {
        dispatch(updateOrgInAccount(data));
        setLoading(false);
      }
    } catch (error: any) {
      setError(error.response?.data.message || error.message || "Error adding feature");
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (isRequirementForExistingFeature()) return;
    setError("");
    setOpenRemoveFeatureDialog(true);
  };

  const removeAndDeleteData = async () => {
    try {
      const updatedOrAccount = await handleApiRequest("delete", "alyeqeenschoolapp/api/admin/feature/remove-delete", {
        _id: selectedFeature._id,
        orgFeatures: orgFeatures.map((f: any) => f.name)
      });
      const data = updatedOrAccount?.data;

      if (data) {
        dispatch(updateOrgInAccount(data));
        setOpenRemoveFeatureDialog(false);
        onClose();
      }
    } catch (error: any) {
      setError(error.response?.data.message || error.message || "Error removing feature");
      setOpenRemoveFeatureDialog(false);
    }
  };

  const removeAndKeepData = async () => {
    try {
      const updatedOrAccount = await handleApiRequest("delete", "alyeqeenschoolapp/api/admin/feature/remove-keep", {
        _id: selectedFeature._id,
        orgFeatures: orgFeatures.map((f: any) => f.name)
      });
      const data = updatedOrAccount?.data;

      if (data) {
        dispatch(updateOrgInAccount(data));
        setOpenRemoveFeatureDialog(false);
        onClose();
      }
    } catch (error: any) {
      setError(error.response?.data.message || error.message || "Error removing feature");
      setOpenRemoveFeatureDialog(false);
    }
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title={title} size={size}>
      {" "}
      {openRemoveFeatureDialog && (
        <RemoveFeatureDialog
          openModal={openRemoveFeatureDialog}
          onClose={() => setOpenRemoveFeatureDialog(false)}
          selectedFeature={selectedFeature}
          removeAndDeleteData={removeAndDeleteData}
          removeAndKeepData={removeAndKeepData}
        />
      )}
      {selectedFeature && (
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-indigo-100 rounded-xl">
              <IconFormatter
                icon={feature_IconMap[selectedFeature.name as keyof typeof feature_IconMap]}
                className="h-6 w-6 text-indigo-600"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h2 className="text-2xl font-bold text-slate-900">{selectedFeature.name}</h2>
                {selectedFeature.mandatory ? (
                  <CustomBadge variant="mandatory">Mandatory</CustomBadge>
                ) : (
                  <CustomBadge variant="default">Optional</CustomBadge>
                )}
                {selectedFeature.availability === "Launching Soon" && (
                  <CustomBadge variant="warning">Launching Soon</CustomBadge>
                )}
                {isAdded && <CustomBadge variant="success">Added</CustomBadge>}
              </div>
              <p className="text-slate-600">{selectedFeature.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="col-span-2">
              <p className="text-sm text-slate-500 mb-2">Price</p>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-indigo-600">
                  {makeHumanReadable(selectedFeature.price, "USD")}/month
                </p>
                <div className="flex items-center gap-4 text-base">
                  <span className="text-slate-700 font-semibold">
                    {makeHumanReadable(dollarToNaira(selectedFeature.price, getDollarNairaRate), "NGN")}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-700 font-semibold">
                    {makeHumanReadable(dollarToPounds(selectedFeature.price, getDollarPoundsRate), "GBP")}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Category</p>
              <p className="text-lg font-semibold text-slate-900">{selectedFeature.category}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Availability</p>
              <p className="text-lg font-semibold text-slate-900">{selectedFeature.availability}</p>
            </div>
          </div>

          {selectedFeature.tabs.length > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-3">Available in Tabs</h4>
              <div className="flex flex-wrap gap-2">
                {selectedFeature.tabs.map((tab: string) => (
                  <span
                    key={tab}
                    className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium border border-blue-300"
                  >
                    {tab}
                  </span>
                ))}
              </div>
            </div>
          )}

          {selectedFeature.requirements.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-900 mb-2">Requirements</h4>
                  <p className="text-sm text-amber-800 mb-3">
                    This feature requires the following features to be active. They will become mandatory if you add
                    this feature:
                  </p>
                  <ul className="space-y-2">
                    {selectedFeature.requirements.map((requiredFeature: any) => {
                      const reqFeatureObj = allFeatures.find((feature) => feature.name === requiredFeature);
                      return (
                        reqFeatureObj && (
                          <li key={reqFeatureObj._id} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-amber-600" />
                            <span className="font-medium text-amber-900">{reqFeatureObj.name}</span>
                            <span className="text-sm text-amber-700">
                              ({makeHumanReadable(reqFeatureObj.price, "USD")} |{" "}
                              {makeHumanReadable(dollarToNaira(reqFeatureObj.price, getDollarNairaRate), "NGN")} |{" "}
                              {makeHumanReadable(dollarToPounds(reqFeatureObj.price, getDollarPoundsRate), "GBP")}{" "}
                              /month)
                            </span>
                          </li>
                        )
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          )}
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
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            {isLaunchingSoon && (
              <div className="w-full p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
                <p className="text-amber-800 font-medium">This feature is launching soon and cannot be added yet</p>
              </div>
            )}

            {!isAdded && !isMandatory && !isLaunchingSoon && (
              <CustomButton
                disabled={loading}
                isLoading={loading}
                onClick={handlePurchase}
                variant="primary"
                size="lg"
                fullWidth
              >
                <Check className="h-5 w-5" />
                Add Feature
              </CustomButton>
            )}

            {isAdded && !isMandatory && (
              <CustomButton onClick={handleRemove} variant="danger" size="lg" fullWidth>
                <X className="h-5 w-5" />
                Remove Feature
              </CustomButton>
            )}

            {isMandatory && (
              <div className="w-full p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
                <p className="text-purple-800 font-medium">This is a mandatory feature and cannot be removed</p>
              </div>
            )}
          </div>
        </div>
      )}
    </CustomModal>
  );
};

export const RemoveFeatureDialog = ({
  openModal,
  onClose,
  selectedFeature,
  removeAndDeleteData,
  removeAndKeepData
}: {
  openModal: boolean;
  onClose: () => void;
  selectedFeature: any;
  removeAndDeleteData: () => void;
  removeAndKeepData: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  return (
    <CustomModal isOpen={openModal} onClose={onClose} title="Remove Feature Confirmation">
      <div className="space-y-6">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-900 mb-1">Are you sure you want to remove this feature?</h3>
              <p className="text-sm text-amber-800">
                You are about to remove <span className="font-semibold">{selectedFeature.name}</span> from your
                subscription.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="font-semibold text-slate-900">Please choose how to proceed:</p>

          <button
            onClick={() => {
              setLoading(true);
              removeAndDeleteData();
            }}
            className="w-full p-4 border-2 border-rose-300 rounded-lg text-left hover:bg-rose-50 transition-colors group"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-100 rounded-lg group-hover:bg-rose-200 transition-colors">
                <X className="h-5 w-5 text-rose-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 mb-1">Remove feature and delete all related data</h4>
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-rose-600">Warning:</span> This action is permanent. All data
                  associated with this feature will be permanently deleted and cannot be recovered.
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setLoading(true);
              removeAndKeepData();
            }}
            className="w-full p-4 border-2 border-indigo-300 rounded-lg text-left hover:bg-indigo-50 transition-colors group"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <Database className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 mb-1">Remove feature and keep stored data</h4>
                <p className="text-sm text-slate-600 mb-2">
                  You won't be charged for this feature anymore, but your data will remain in the database.
                </p>
                <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="font-semibold">Note:</span> Stored data will continue to count towards your storage
                  billing and usage limits.
                </p>
              </div>
            </div>
          </button>
        </div>
        {loading && (
          <div className="flex items-center justify-center gap-4">
            <p className="animate-pulse">Removing Feature...</p>
            <LoaderDiv type="spinner" dimension="w-7 h-7" />
          </div>
        )}
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <CustomButton disabled={loading} onClick={onClose} variant="primary" fullWidth>
            Cancel
          </CustomButton>
        </div>
      </div>
    </CustomModal>
  );
};
