"use client";

import { formatDate } from "@/lib/shortFunctions/shortFunctions";
import { ContainerComponent, StatusFormatter } from "../general/compLibrary";
import { IoClose } from "react-icons/io5";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

export const BillingDialogComponent = ({
  data,
  onClose,
  dollarToDollar,
  dollarToNaira,
  dollarToPounds,
  makeHumanReadable
}: {
  data: any;
  dollarToDollar: (dollar: number) => number;
  dollarToNaira: (dollar: number, rate: number) => number;
  dollarToPounds: (dollar: number, rate: number) => number;
  makeHumanReadable: (amount: number, currency: "USD" | "NGN" | "GBP") => string;
  onClose: (close: boolean) => void;
}) => {
  const {
    billingId,
    billingMonth,
    dollarToNairaRate,
    dollarToPoundsRate,
    billingStatus,
    paymentStatus,
    totalCost,
    appProvisionCost,
    renderBaseCost,
    renderBandwidth,
    renderComputeSeconds,
    databaseStorageAndBackup,
    databaseOperation,
    databaseDataTransfer,
    cloudStorageGBStored,
    cloudStorageGBDownloaded,
    cloudStorageUploadOperation,
    cloudStorageDownloadOperation
  } = data || {};

  // Currency Display Component
  const CurrencyDisplay = ({ amountInDollar, className = "" }: { amountInDollar: number; className?: string }) => {
    return (
      <div className={`space-y-1 ${className}`}>
        <div className=" font-medium text-foregroundColor">
          {makeHumanReadable(dollarToDollar(amountInDollar), "USD")}
        </div>
        <div className="text-[14px] text-foregroundColor-2">
          {makeHumanReadable(dollarToNaira(amountInDollar, dollarToNairaRate), "NGN")}
        </div>
        <div className="text-[14px] text-foregroundColor-2">
          {makeHumanReadable(dollarToPounds(amountInDollar, dollarToPoundsRate), "GBP")}
        </div>
      </div>
    );
  };

  const getSum = (numbers: string[] | number[]) => {
    let sum = 0;
    for (let i = 0; i < numbers.length; i++) {
      sum += Number(numbers[i]);
    }
    return sum;
  };

  // Usage Display Component
  const UsageDisplay = ({ value, unitType, quantity }: { value: any; unitType: any; quantity?: boolean }) => {
    return (
      <div className="text-center">
        <div className="font-medium text-foregroundColor">
          {quantity ? value.toLocaleString() : Number(value).toFixed(4)}
        </div>
        <div className="text-[14px] text-foregroundColor-2">{unitType}</div>
      </div>
    );
  };

  return (
    <div className="fixed flex z-20 items-center justify-center inset-0 bg-foregroundColor-transparent">
      <ContainerComponent style="w-[70%] h-[90%] gap-5 overflow-auto flex flex-col">
        {/* top div */}
        <div className="flex justify-between items-center">
          <h2>Bill Detail</h2>
          <div className="flex justify-between items-center gap-5">
            <IoClose
              onClick={() => {
                onClose(true);
              }}
              className="text-[30px] hover:text-foregroundColor-2 hover:cursor-pointer w-full"
            />
          </div>
        </div>

        {/* Bill Summary */}
        <div className="bg-gradient-to-l from-backgroundColor-2 to-[#0097a7]/5 rounded-xl p-6 border border-borderColor-2">
          <h3 className="text-lg font-semibold text-foregroundColor mb-4">Bill Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            <div className="mt-1">
              <p className="text-foregroundColor-2 text-medium mb-1">Bill ID</p>
              <p className="font-semibold text-foregroundColor">{billingId}</p>
            </div>

            <div>
              <p className="text-foregroundColor-2 text-medium mb-1">Billing Status</p>
              <div className="mt-2">
                <StatusFormatter text={billingStatus} />
              </div>
            </div>
            <div>
              <p className="text-foregroundColor-2 text-medium mb-1">Billing Month</p>
              <p className="font-semibold text-foregroundColor">{billingMonth}</p>
            </div>

            <div>
              <p className="text-foregroundColor-2 text-medium mb-1">Payment Status</p>
              <div className="mt-2">
                <StatusFormatter text={paymentStatus} />
              </div>
            </div>
            <div>
              <p className="text-foregroundColor-2 text-medium mb-1">Usage Summary</p>
              <div className="space-y-1">
                <div className=" font-medium text-foregroundColor">{databaseOperation?.value.toLocaleString()} ops</div>
                <div className="text-[14px] text-foregroundColor-2">
                  {databaseStorageAndBackup?.value.toFixed(4)} GB storage & backup
                </div>
                <div className="text-[14px] text-foregroundColor-2">
                  {databaseDataTransfer?.value.toFixed(4)} GB transfer
                </div>
              </div>
            </div>
            <div>
              <p className="text-foregroundColor-2 text-medium mb-1">Total Cost</p>
              <CurrencyDisplay amountInDollar={totalCost} />
            </div>
          </div>
        </div>

        {/* app provison */}
        <div className="bg-white rounded-xl border border-borderColor-2">
          <div className="bg-gradient-to-r from-backgroundColor-2 to-[#0097a7]/5 border-b border-borderColor-2 px-4 py-3 rounded-t-xl">
            <h4 className="font-semibold text-foregroundColor">App Provision</h4>
          </div>
          <div className="px-4 py-3 flex justify-between">
            <div className="font-medium text-foregroundColor">
              {makeHumanReadable(dollarToDollar(appProvisionCost), "USD")}
            </div>
            <div className="font-medium text-foregroundColor">
              {makeHumanReadable(dollarToNaira(appProvisionCost, dollarToNairaRate), "NGN")}
            </div>
            <div className="font-medium text-foregroundColor">
              {makeHumanReadable(dollarToPounds(appProvisionCost, dollarToPoundsRate), "GBP")}
            </div>
          </div>
        </div>
        {/* Cost Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Database Costs */}
          <div className="bg-white rounded-xl border border-borderColor-2 overflow-hidden">
            <div className="bg-gradient-to-r from-backgroundColor-2 to-[#0097a7]/5 border-b border-borderColor-2 px-4 py-3">
              <h4 className="font-semibold text-foregroundColor">Database Services</h4>
            </div>
            <div className="p-4 space-y-4">
              {" "}
              <div className="grid grid-cols-3 gap-4 items-start text-[14px]">
                <span className="text-foregroundColor-2">Operations</span>
                <UsageDisplay value={databaseOperation?.value} unitType="create, read, update, delete" quantity />
                <CurrencyDisplay amountInDollar={databaseOperation?.costInDollar} />
              </div>
              <div className="grid grid-cols-3 gap-4 items-start text-[14px]">
                <span className="text-foregroundColor-2">Storage</span>
                <UsageDisplay value={databaseStorageAndBackup?.value / 2} unitType="GB stored" />
                <CurrencyDisplay amountInDollar={databaseStorageAndBackup?.costInDollar / 2} />
              </div>
              <div className="grid grid-cols-3 gap-4 items-start text-[14px]">
                <span className="text-foregroundColor-2">Backup</span>
                <UsageDisplay value={databaseStorageAndBackup?.value / 2} unitType="GB backed up" />
                <CurrencyDisplay amountInDollar={databaseStorageAndBackup?.costInDollar / 2} />
              </div>
              <div className="grid grid-cols-3 gap-4 items-start text-[14px]">
                <span className="text-foregroundColor-2">Data Transfer</span>
                <UsageDisplay value={databaseDataTransfer?.value} unitType="GB transferred" />
                <CurrencyDisplay amountInDollar={databaseDataTransfer?.costInDollar} />
              </div>
              <div className="border-t border-borderColor-2 pt-3 grid grid-cols-3 gap-4 items-start font-semibold">
                <span className="text-foregroundColor">Database Total</span>
                <div></div>
                <CurrencyDisplay
                  amountInDollar={getSum([
                    databaseStorageAndBackup?.costInDollar,
                    databaseOperation?.costInDollar,
                    databaseDataTransfer?.costInDollar
                  ])}
                  className="text-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Cloud Storage Costs */}
          <div className="bg-white rounded-xl border border-borderColor-2 overflow-hidden">
            <div className="bg-gradient-to-l from-backgroundColor-2 to-[#0097a7]/5 border-b border-borderColor-2 px-4 py-3">
              <h4 className="font-semibold text-foregroundColor">Cloud Storage</h4>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-4 items-start text-[14px]">
                <span className="text-foregroundColor-2">GB Stored</span>
                <UsageDisplay value={cloudStorageGBStored?.value} unitType="GB stored" />
                <CurrencyDisplay amountInDollar={cloudStorageGBStored?.costInDollar} />
              </div>
              <div className="grid grid-cols-3 gap-4 items-start text-[14px]">
                <span className="text-foregroundColor-2">GB Downloaded</span>
                <UsageDisplay value={cloudStorageGBDownloaded?.value} unitType="GB downloaded" />
                <CurrencyDisplay amountInDollar={cloudStorageGBDownloaded?.costInDollar} />
              </div>
              <div className="grid grid-cols-3 gap-4 items-start text-[14px]">
                <span className="text-foregroundColor-2">Upload Ops</span>
                <UsageDisplay value={cloudStorageUploadOperation?.value} unitType="GB upload operation" quantity />
                <CurrencyDisplay amountInDollar={cloudStorageUploadOperation?.costInDollar} />
              </div>
              <div className="grid grid-cols-3 gap-4 items-start text-[14px]">
                <span className="text-foregroundColor-2">Download Ops</span>
                <UsageDisplay value={cloudStorageDownloadOperation?.value} unitType="GB download operation" quantity />
                <CurrencyDisplay amountInDollar={cloudStorageDownloadOperation?.costInDollar} />
              </div>
              <div className="border-t border-borderColor-2 pt-3 grid grid-cols-3 gap-4 items-start font-semibold">
                <span className="text-foregroundColor">Storage Total</span>
                <div></div>
                <CurrencyDisplay
                  amountInDollar={getSum([
                    cloudStorageUploadOperation?.costInDollar,
                    cloudStorageDownloadOperation?.costInDollar,
                    cloudStorageGBStored?.costInDollar,
                    cloudStorageGBDownloaded?.costInDollar
                  ])}
                  className="text-teal-600"
                />
              </div>
            </div>
          </div>

          {/* front end Hosting */}
          <div className="bg-white rounded-xl border border-borderColor-2 overflow-hidden">
            <div className="bg-gradient-to-r from-backgroundColor-2 to-[#0097a7]/5 border-b border-borderColor-2 px-4 py-3">
              <h4 className="font-semibold text-foregroundColor">Frontend Hosting</h4>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-4 items-start text-[14px]">
                <span className="text-foregroundColor-2">File Transfer - (free)</span>
                <UsageDisplay value={0} unitType="GB" />
                <CurrencyDisplay amountInDollar={0} />
              </div>
              <div className="border-t border-borderColor-2 pt-3 grid grid-cols-3 gap-4 items-start font-semibold">
                <span className="text-foregroundColor">Frontend Total</span>
                <div></div>
                <CurrencyDisplay amountInDollar={0} className="text-cyan-600" />
              </div>
            </div>
          </div>

          {/* back end Hosting */}
          <div className="bg-white rounded-xl border border-borderColor-2 overflow-hidden">
            <div className="bg-gradient-to-l from-backgroundColor-2 to-[#0097a7]/5 border-b border-borderColor-2 px-4 py-3">
              <h4 className="font-semibold text-foregroundColor">Backend Hosting</h4>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-4 items-start text-[14px]">
                <span className="text-foregroundColor-2">Base Cost </span>
                <UsageDisplay value={renderBaseCost} unitType="Regardless of usage" />
                <CurrencyDisplay amountInDollar={renderBaseCost} />
              </div>
              <div className="grid grid-cols-3 gap-4 items-start text-[14px]">
                <span className="text-foregroundColor-2">Bandwith</span>
                <UsageDisplay value={renderBandwidth?.value} unitType="GB transferred" />
                <CurrencyDisplay amountInDollar={renderBandwidth?.costInDollar} />
              </div>
              <div className="grid grid-cols-3 gap-4 items-start text-[14px]">
                <span className="text-foregroundColor-2">Computation</span>
                <UsageDisplay value={renderComputeSeconds?.value} unitType="seconds" />
                <CurrencyDisplay amountInDollar={renderComputeSeconds?.costInDollar} />
              </div>
              <div className="border-t border-borderColor-2 pt-3 grid grid-cols-3 gap-4 items-start font-semibold">
                <span className="text-foregroundColor">Frontend Total</span>
                <div></div>
                <CurrencyDisplay amountInDollar={renderBaseCost?.costInDollar} className="text-cyan-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Grand Total */}
        <div className="bg-gradient-to-l from-backgroundColor-2 to-[#0097a7]/5 border-2 border-borderColor rounded-xl p-6">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xl font-bold text-foregroundColor">Grand Total</span>
              <div className=" text-foregroundColor-2 mt-1">
                {databaseOperation?.value.toLocaleString()} operations • {databaseStorageAndBackup?.value.toFixed(4)} GB
                storage & backup • {databaseDataTransfer?.value.toFixed(4)} GB transfer
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-emerald-600">
                {makeHumanReadable(dollarToDollar(totalCost), "USD")}
              </div>
              <div className="text-lg text-foregroundColor-2">
                {makeHumanReadable(dollarToNaira(totalCost, dollarToNairaRate), "NGN")} •{" "}
                {makeHumanReadable(dollarToPounds(totalCost, dollarToPoundsRate), "GBP")}
              </div>
            </div>
          </div>
        </div>
      </ContainerComponent>
    </div>
  );
};
