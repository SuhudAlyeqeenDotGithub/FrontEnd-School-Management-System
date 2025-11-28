"use client"

import type React from "react"

import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Banknote,
  Calendar,
  X,
  Crown,
  AlertCircle,
  RefreshCw,
  CheckCircle,
} from "lucide-react"
import { useState } from "react"

interface CurrencyAmount {
  usd: number
  ngn: number
  gbp: number
}

interface UsageData {
  amount: CurrencyAmount
  units: number
  unitType: string
}

interface BillData {
  id: string
  billingMonth: string
  mongoBasePrice: CurrencyAmount
  appProvisionPrice: CurrencyAmount
  dataBaseread: UsageData
  dataBasewrite: UsageData
  dataBasedelete: UsageData
  dataBaseupdate: UsageData
  databaseStorage: UsageData
  dataBaseDataTransfer: UsageData
  databaseBackup: UsageData
  cloudStorageGBStored: UsageData
  cloudStorageGBDownloaded: UsageData
  cloudStorageUploadOperation: UsageData
  cloudStorageDownloadOperation: UsageData
  frontendHostingFileTransfer: UsageData
  cloudFunctionInvocation: UsageData
  cloudFunctionGBSeconds: UsageData
  cloudFunctionCPUSeconds: UsageData
  cloudFunctionOutboundNetworking: UsageData
  totalDataBaseCost: CurrencyAmount
  totalFrontendCost: CurrencyAmount
  totalCloudFunctionCost: CurrencyAmount
  totalCloudStorageCost: CurrencyAmount
  totalCost: CurrencyAmount
  totalOperations: number
  totalStorageGB: number
  totalTransferGB: number
  status: "paid" | "pending" | "overdue" | "failed"
  paymentMethod?: string
  dueDate?: string
}

interface SubscriptionData {
  subscriptionType: "Freemium" | "Premium"
  organisationId: string
  freemiumStartDate: string
  freemiumEndDate: string
  premiumStartDate?: string
  premiumEndDate?: string
  subscriptionStatus: "Active" | "Inactive"
  billingAddress: string
  billingPostcode: string
  paymentDetails: {
    cardType?: string
    lastFourDigits?: string
    expiryDate?: string
  }
  features: string[]
  price?: CurrencyAmount
}

// Custom Badge Component
function CustomBadge({
  children,
  variant = "default",
}: { children: React.ReactNode; variant?: "success" | "warning" | "danger" | "default" | "info" }) {
  const variants = {
    success: "bg-emerald-100 text-emerald-800 border-emerald-200",
    warning: "bg-amber-100 text-amber-800 border-amber-200",
    danger: "bg-rose-100 text-rose-800 border-rose-200",
    info: "bg-blue-100 text-blue-800 border-blue-200",
    default: "bg-slate-100 text-slate-800 border-slate-200",
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]}`}
    >
      {children}
    </span>
  )
}

// Custom Button Component
function CustomButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  className?: string
}) {
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600",
    secondary: "bg-white text-slate-700 hover:bg-slate-50 border-slate-300",
    ghost: "bg-transparent text-emerald-600 hover:bg-emerald-50 border-transparent",
    danger: "bg-rose-600 text-white hover:bg-rose-700 border-rose-600",
  }

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition-colors ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}
    >
      {children}
    </button>
  )
}

// Custom Modal Component
function CustomModal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  )
}

// Currency Display Component
function CurrencyDisplay({ amount, className = "" }: { amount: CurrencyAmount; className?: string }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="text-sm font-medium text-slate-800">${amount.usd.toFixed(2)}</div>
      <div className="text-xs text-slate-600">
        ₦{amount.ngn.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div className="text-xs text-slate-600">£{amount.gbp.toFixed(2)}</div>
    </div>
  )
}

// Compact Currency Display
function CompactCurrencyDisplay({ amount }: { amount: CurrencyAmount }) {
  return (
    <div className="text-right">
      <div className="font-semibold text-slate-800">${amount.usd.toFixed(2)}</div>
      <div className="text-xs text-slate-500">
        ₦{amount.ngn.toLocaleString()} • £{amount.gbp.toFixed(2)}
      </div>
    </div>
  )
}

// Usage Display Component
function UsageDisplay({ usage }: { usage: UsageData }) {
  return (
    <div className="text-center">
      <div className="font-medium text-slate-800">{usage.units.toLocaleString()}</div>
      <div className="text-xs text-slate-600">{usage.unitType}</div>
    </div>
  )
}

export default function BillingDashboard() {
  const [activeSection, setActiveSection] = useState<"billing" | "subscription" | "failed">("billing")
  const [selectedBill, setSelectedBill] = useState<BillData | null>(null)
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionData | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isEditingPayment, setIsEditingPayment] = useState(false)
  const [editedBillingAddress, setEditedBillingAddress] = useState("")
  const [editedBillingPostcode, setEditedBillingPostcode] = useState("")
  const [editedCardNumber, setEditedCardNumber] = useState("")
  const [editedExpiryDate, setEditedExpiryDate] = useState("")
  const itemsPerPage = 10

  // Mock billing data
  const billData: BillData[] = [
    {
      id: "BILL-2024-01",
      billingMonth: "January 2024",
      mongoBasePrice: { usd: 25.0, ngn: 41250.0, gbp: 19.75 },
      appProvisionPrice: { usd: 15.0, ngn: 24750.0, gbp: 11.85 },
      dataBaseread: { amount: { usd: 12.5, ngn: 20625.0, gbp: 9.88 }, units: 125000, unitType: "read operations" },
      dataBasewrite: { amount: { usd: 8.75, ngn: 14437.5, gbp: 6.91 }, units: 87500, unitType: "write operations" },
      dataBasedelete: { amount: { usd: 2.3, ngn: 3795.0, gbp: 1.82 }, units: 23000, unitType: "delete operations" },
      dataBaseupdate: { amount: { usd: 5.45, ngn: 8992.5, gbp: 4.31 }, units: 54500, unitType: "update operations" },
      databaseStorage: { amount: { usd: 18.9, ngn: 31185.0, gbp: 14.93 }, units: 18.9, unitType: "GB stored" },
      dataBaseDataTransfer: { amount: { usd: 7.25, ngn: 11962.5, gbp: 5.73 }, units: 7.25, unitType: "GB transferred" },
      databaseBackup: { amount: { usd: 10.0, ngn: 16500.0, gbp: 7.9 }, units: 5, unitType: "backup snapshots" },
      cloudStorageGBStored: { amount: { usd: 22.4, ngn: 36960.0, gbp: 17.7 }, units: 224, unitType: "GB stored" },
      cloudStorageGBDownloaded: { amount: { usd: 5.6, ngn: 9240.0, gbp: 4.42 }, units: 56, unitType: "GB downloaded" },
      cloudStorageUploadOperation: {
        amount: { usd: 3.2, ngn: 5280.0, gbp: 2.53 },
        units: 32000,
        unitType: "upload operations",
      },
      cloudStorageDownloadOperation: {
        amount: { usd: 1.8, ngn: 2970.0, gbp: 1.42 },
        units: 18000,
        unitType: "download operations",
      },
      frontendHostingFileTransfer: {
        amount: { usd: 9.3, ngn: 15345.0, gbp: 7.35 },
        units: 9.3,
        unitType: "GB transferred",
      },
      cloudFunctionInvocation: {
        amount: { usd: 14.7, ngn: 24255.0, gbp: 11.61 },
        units: 147000,
        unitType: "function calls",
      },
      cloudFunctionGBSeconds: { amount: { usd: 11.2, ngn: 18480.0, gbp: 8.85 }, units: 112000, unitType: "GB-seconds" },
      cloudFunctionCPUSeconds: { amount: { usd: 8.9, ngn: 14685.0, gbp: 7.03 }, units: 89000, unitType: "CPU seconds" },
      cloudFunctionOutboundNetworking: {
        amount: { usd: 4.5, ngn: 7425.0, gbp: 3.56 },
        units: 4.5,
        unitType: "GB outbound",
      },
      totalDataBaseCost: { usd: 100.15, ngn: 165247.5, gbp: 79.12 },
      totalFrontendCost: { usd: 24.3, ngn: 40095.0, gbp: 19.2 },
      totalCloudFunctionCost: { usd: 39.3, ngn: 64845.0, gbp: 31.05 },
      totalCloudStorageCost: { usd: 33.0, ngn: 54450.0, gbp: 26.07 },
      totalCost: { usd: 196.75, ngn: 324637.5, gbp: 155.43 },
      totalOperations: 340000,
      totalStorageGB: 242.9,
      totalTransferGB: 77.05,
      status: "paid",
      paymentMethod: "Visa •••• 4242",
      dueDate: "2024-01-31",
    },
    {
      id: "BILL-2024-02",
      billingMonth: "February 2024",
      mongoBasePrice: { usd: 25.0, ngn: 41500.0, gbp: 19.8 },
      appProvisionPrice: { usd: 15.0, ngn: 24900.0, gbp: 11.88 },
      dataBaseread: { amount: { usd: 15.2, ngn: 25232.0, gbp: 12.04 }, units: 152000, unitType: "read operations" },
      dataBasewrite: { amount: { usd: 10.3, ngn: 17098.0, gbp: 8.16 }, units: 103000, unitType: "write operations" },
      dataBasedelete: { amount: { usd: 3.1, ngn: 5146.0, gbp: 2.46 }, units: 31000, unitType: "delete operations" },
      dataBaseupdate: { amount: { usd: 6.8, ngn: 11288.0, gbp: 5.39 }, units: 68000, unitType: "update operations" },
      databaseStorage: { amount: { usd: 21.5, ngn: 35690.0, gbp: 17.04 }, units: 21.5, unitType: "GB stored" },
      dataBaseDataTransfer: { amount: { usd: 8.9, ngn: 14774.0, gbp: 7.05 }, units: 8.9, unitType: "GB transferred" },
      databaseBackup: { amount: { usd: 10.0, ngn: 16600.0, gbp: 7.92 }, units: 6, unitType: "backup snapshots" },
      cloudStorageGBStored: { amount: { usd: 28.7, ngn: 47642.0, gbp: 22.75 }, units: 287, unitType: "GB stored" },
      cloudStorageGBDownloaded: { amount: { usd: 7.2, ngn: 11952.0, gbp: 5.71 }, units: 72, unitType: "GB downloaded" },
      cloudStorageUploadOperation: {
        amount: { usd: 4.1, ngn: 6806.0, gbp: 3.25 },
        units: 41000,
        unitType: "upload operations",
      },
      cloudStorageDownloadOperation: {
        amount: { usd: 2.3, ngn: 3818.0, gbp: 1.82 },
        units: 23000,
        unitType: "download operations",
      },
      frontendHostingFileTransfer: {
        amount: { usd: 11.8, ngn: 19588.0, gbp: 9.35 },
        units: 11.8,
        unitType: "GB transferred",
      },
      cloudFunctionInvocation: {
        amount: { usd: 18.9, ngn: 31374.0, gbp: 14.98 },
        units: 189000,
        unitType: "function calls",
      },
      cloudFunctionGBSeconds: {
        amount: { usd: 14.6, ngn: 24236.0, gbp: 11.57 },
        units: 146000,
        unitType: "GB-seconds",
      },
      cloudFunctionCPUSeconds: {
        amount: { usd: 11.2, ngn: 18592.0, gbp: 8.88 },
        units: 112000,
        unitType: "CPU seconds",
      },
      cloudFunctionOutboundNetworking: {
        amount: { usd: 5.8, ngn: 9628.0, gbp: 4.6 },
        units: 5.8,
        unitType: "GB outbound",
      },
      totalDataBaseCost: { usd: 115.8, ngn: 192228.0, gbp: 91.74 },
      totalFrontendCost: { usd: 26.8, ngn: 44488.0, gbp: 21.23 },
      totalCloudFunctionCost: { usd: 50.5, ngn: 83830.0, gbp: 40.03 },
      totalCloudStorageCost: { usd: 42.3, ngn: 70218.0, gbp: 33.53 },
      totalCost: { usd: 235.4, ngn: 390764.0, gbp: 186.53 },
      totalOperations: 418000,
      totalStorageGB: 308.5,
      totalTransferGB: 98.5,
      status: "failed",
      paymentMethod: "Mastercard •••• 5555",
      dueDate: "2024-02-29",
    },
    {
      id: "BILL-2024-03",
      billingMonth: "March 2024",
      mongoBasePrice: { usd: 25.0, ngn: 41750.0, gbp: 19.85 },
      appProvisionPrice: { usd: 15.0, ngn: 25050.0, gbp: 11.91 },
      dataBaseread: { amount: { usd: 18.9, ngn: 31557.0, gbp: 15.01 }, units: 189000, unitType: "read operations" },
      dataBasewrite: { amount: { usd: 12.4, ngn: 20706.0, gbp: 9.85 }, units: 124000, unitType: "write operations" },
      dataBasedelete: { amount: { usd: 4.2, ngn: 7014.0, gbp: 3.34 }, units: 42000, unitType: "delete operations" },
      dataBaseupdate: { amount: { usd: 8.1, ngn: 13527.0, gbp: 6.44 }, units: 81000, unitType: "update operations" },
      databaseStorage: { amount: { usd: 24.8, ngn: 41412.0, gbp: 19.71 }, units: 24.8, unitType: "GB stored" },
      dataBaseDataTransfer: { amount: { usd: 10.5, ngn: 17535.0, gbp: 8.34 }, units: 10.5, unitType: "GB transferred" },
      databaseBackup: { amount: { usd: 10.0, ngn: 16700.0, gbp: 7.94 }, units: 7, unitType: "backup snapshots" },
      cloudStorageGBStored: { amount: { usd: 32.1, ngn: 53607.0, gbp: 25.52 }, units: 321, unitType: "GB stored" },
      cloudStorageGBDownloaded: { amount: { usd: 8.4, ngn: 14028.0, gbp: 6.68 }, units: 84, unitType: "GB downloaded" },
      cloudStorageUploadOperation: {
        amount: { usd: 5.2, ngn: 8684.0, gbp: 4.13 },
        units: 52000,
        unitType: "upload operations",
      },
      cloudStorageDownloadOperation: {
        amount: { usd: 2.9, ngn: 4843.0, gbp: 2.31 },
        units: 29000,
        unitType: "download operations",
      },
      frontendHostingFileTransfer: {
        amount: { usd: 13.7, ngn: 22879.0, gbp: 10.89 },
        units: 13.7,
        unitType: "GB transferred",
      },
      cloudFunctionInvocation: {
        amount: { usd: 22.3, ngn: 37241.0, gbp: 17.73 },
        units: 223000,
        unitType: "function calls",
      },
      cloudFunctionGBSeconds: {
        amount: { usd: 17.8, ngn: 29726.0, gbp: 14.15 },
        units: 178000,
        unitType: "GB-seconds",
      },
      cloudFunctionCPUSeconds: {
        amount: { usd: 13.9, ngn: 23213.0, gbp: 11.05 },
        units: 139000,
        unitType: "CPU seconds",
      },
      cloudFunctionOutboundNetworking: {
        amount: { usd: 6.7, ngn: 11189.0, gbp: 5.33 },
        units: 6.7,
        unitType: "GB outbound",
      },
      totalDataBaseCost: { usd: 128.9, ngn: 215251.0, gbp: 102.39 },
      totalFrontendCost: { usd: 28.7, ngn: 47929.0, gbp: 22.8 },
      totalCloudFunctionCost: { usd: 60.7, ngn: 101369.0, gbp: 48.26 },
      totalCloudStorageCost: { usd: 48.6, ngn: 81162.0, gbp: 38.64 },
      totalCost: { usd: 266.9, ngn: 445711.0, gbp: 212.09 },
      totalOperations: 517000,
      totalStorageGB: 345.8,
      totalTransferGB: 114.9,
      status: "pending",
      paymentMethod: "Visa •••• 4242",
      dueDate: "2024-03-31",
    },
    {
      id: "BILL-2023-12",
      billingMonth: "December 2023",
      mongoBasePrice: { usd: 25.0, ngn: 41000.0, gbp: 19.7 },
      appProvisionPrice: { usd: 15.0, ngn: 24600.0, gbp: 11.82 },
      dataBaseread: { amount: { usd: 10.2, ngn: 16728.0, gbp: 8.04 }, units: 102000, unitType: "read operations" },
      dataBasewrite: { amount: { usd: 7.5, ngn: 12300.0, gbp: 5.91 }, units: 75000, unitType: "write operations" },
      dataBasedelete: { amount: { usd: 1.8, ngn: 2952.0, gbp: 1.42 }, units: 18000, unitType: "delete operations" },
      dataBaseupdate: { amount: { usd: 4.2, ngn: 6888.0, gbp: 3.31 }, units: 42000, unitType: "update operations" },
      databaseStorage: { amount: { usd: 16.5, ngn: 27060.0, gbp: 13.01 }, units: 16.5, unitType: "GB stored" },
      dataBaseDataTransfer: { amount: { usd: 6.1, ngn: 10004.0, gbp: 4.81 }, units: 6.1, unitType: "GB transferred" },
      databaseBackup: { amount: { usd: 10.0, ngn: 16400.0, gbp: 7.88 }, units: 4, unitType: "backup snapshots" },
      cloudStorageGBStored: { amount: { usd: 19.8, ngn: 32472.0, gbp: 15.61 }, units: 198, unitType: "GB stored" },
      cloudStorageGBDownloaded: { amount: { usd: 4.5, ngn: 7380.0, gbp: 3.55 }, units: 45, unitType: "GB downloaded" },
      cloudStorageUploadOperation: {
        amount: { usd: 2.7, ngn: 4428.0, gbp: 2.13 },
        units: 27000,
        unitType: "upload operations",
      },
      cloudStorageDownloadOperation: {
        amount: { usd: 1.5, ngn: 2460.0, gbp: 1.18 },
        units: 15000,
        unitType: "download operations",
      },
      frontendHostingFileTransfer: {
        amount: { usd: 7.8, ngn: 12792.0, gbp: 6.15 },
        units: 7.8,
        unitType: "GB transferred",
      },
      cloudFunctionInvocation: {
        amount: { usd: 12.4, ngn: 20336.0, gbp: 9.78 },
        units: 124000,
        unitType: "function calls",
      },
      cloudFunctionGBSeconds: { amount: { usd: 9.5, ngn: 15580.0, gbp: 7.49 }, units: 95000, unitType: "GB-seconds" },
      cloudFunctionCPUSeconds: { amount: { usd: 7.6, ngn: 12464.0, gbp: 5.99 }, units: 76000, unitType: "CPU seconds" },
      cloudFunctionOutboundNetworking: {
        amount: { usd: 3.8, ngn: 6232.0, gbp: 3.0 },
        units: 3.8,
        unitType: "GB outbound",
      },
      totalDataBaseCost: { usd: 91.3, ngn: 149732.0, gbp: 71.98 },
      totalFrontendCost: { usd: 22.8, ngn: 37392.0, gbp: 17.97 },
      totalCloudFunctionCost: { usd: 33.3, ngn: 54612.0, gbp: 26.26 },
      totalCloudStorageCost: { usd: 28.5, ngn: 46740.0, gbp: 22.47 },
      totalCost: { usd: 175.9, ngn: 288476.0, gbp: 138.68 },
      totalOperations: 281000,
      totalStorageGB: 214.5,
      totalTransferGB: 62.7,
      status: "failed",
      paymentMethod: "Visa •••• 4242",
      dueDate: "2023-12-31",
    },
  ]

  // Mock subscription data
  const subscriptionData: SubscriptionData = {
    subscriptionType: "Premium",
    organisationId: "ORG-2024-001",
    freemiumStartDate: "2024-01-01",
    freemiumEndDate: "2024-01-31",
    premiumStartDate: "2024-02-01",
    premiumEndDate: "2025-02-01",
    subscriptionStatus: "Active",
    billingAddress: "123 School Street, Education District, London",
    billingPostcode: "SW1A 1AA",
    paymentDetails: {
      cardType: "Visa",
      lastFourDigits: "4242",
      expiryDate: "12/2026",
    },
    price: { usd: 49.99, ngn: 82483.5, gbp: 39.49 },
    features: [
      "Unlimited database operations",
      "Priority support 24/7",
      "Advanced analytics dashboard",
      "Custom domain support",
      "Team collaboration (up to 10 members)",
      "API access with higher rate limits",
      "Automated backups every 6 hours",
      "Advanced security features",
    ],
  }

  // Filter data based on active section
  const getFilteredData = () => {
    let data = billData

    if (activeSection === "failed") {
      data = billData.filter((bill) => bill.status === "failed")
    }

    const filtered = data.filter((bill) => {
      const matchesSearch =
        bill.billingMonth.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || bill.status === statusFilter
      return matchesSearch && matchesStatus
    })

    return filtered
  }

  const filteredData = getFilteredData()
  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const displayedData = filteredData.slice(startIndex, endIndex)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <CustomBadge variant="success">Paid</CustomBadge>
      case "pending":
        return <CustomBadge variant="warning">Pending</CustomBadge>
      case "overdue":
        return <CustomBadge variant="danger">Overdue</CustomBadge>
      case "failed":
        return <CustomBadge variant="danger">Failed</CustomBadge>
      default:
        return <CustomBadge variant="default">{status}</CustomBadge>
    }
  }

  const handleRetryPayment = (billId: string) => {
    alert(`Retrying payment for ${billId}...`)
  }

  const handleSavePaymentDetails = () => {
    alert("Payment details updated successfully!")
    setIsEditingPayment(false)
  }

  const handleCancelEdit = () => {
    setEditedBillingAddress(subscriptionData.billingAddress)
    setEditedBillingPostcode(subscriptionData.billingPostcode)
    setEditedCardNumber("")
    setEditedExpiryDate(subscriptionData.paymentDetails.expiryDate || "")
    setIsEditingPayment(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-xl shadow-lg border border-emerald-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <Banknote className="h-8 w-8 text-emerald-600" />
                Billing Dashboard
              </h1>
              <p className="text-slate-600 mt-2">Manage your billing, subscriptions, and payment history</p>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="mb-6 bg-white rounded-xl shadow-md border border-slate-200 p-2">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveSection("billing")
                setCurrentPage(1)
              }}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                activeSection === "billing" ? "bg-emerald-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Calendar className="h-5 w-5" />
                Billing History
              </div>
            </button>
            <button
              onClick={() => {
                setActiveSection("subscription")
                setCurrentPage(1)
              }}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                activeSection === "subscription"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Crown className="h-5 w-5" />
                Subscription
              </div>
            </button>
            <button
              onClick={() => {
                setActiveSection("failed")
                setCurrentPage(1)
              }}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                activeSection === "failed" ? "bg-emerald-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Failed Payments
                {billData.filter((b) => b.status === "failed").length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-rose-500 text-white text-xs rounded-full">
                    {billData.filter((b) => b.status === "failed").length}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Billing Section */}
        {activeSection === "billing" && (
          <>
            {/* Filters */}
            <div className="mb-6 bg-white rounded-xl shadow-md border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Filter & Search</h3>
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[300px]">
                  <input
                    type="search"
                    placeholder="Search by billing month or bill ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-4 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                  <option value="failed">Failed</option>
                </select>
                <CustomButton
                  variant="secondary"
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                    setCurrentPage(1)
                  }}
                >
                  Clear Filters
                </CustomButton>
              </div>
            </div>

            {/* Bills Table */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 border-b border-slate-200">
                      <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700">Bill ID</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700">Billing Month</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700">Status</th>
                      <th className="py-4 px-6 text-center text-sm font-semibold text-slate-700">Usage</th>
                      <th className="py-4 px-6 text-right text-sm font-semibold text-slate-700">Total Cost</th>
                      <th className="py-4 px-6 text-center text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="h-24 text-center text-slate-500">
                          No bills found for the selected criteria.
                        </td>
                      </tr>
                    ) : (
                      displayedData.map((bill, index) => (
                        <tr
                          key={bill.id}
                          onClick={() => setSelectedBill(bill)}
                          className={`cursor-pointer hover:bg-emerald-50 transition-colors border-b border-slate-100 ${
                            index % 2 === 0 ? "bg-white" : "bg-slate-50"
                          }`}
                        >
                          <td className="py-4 px-6 font-medium text-slate-800">{bill.id}</td>
                          <td className="py-4 px-6 text-slate-600">{bill.billingMonth}</td>
                          <td className="py-4 px-6">{getStatusBadge(bill.status)}</td>
                          <td className="py-4 px-6">
                            <div className="text-center space-y-1">
                              <div className="text-sm font-medium text-slate-800">
                                {bill.totalOperations.toLocaleString()} ops
                              </div>
                              <div className="text-xs text-slate-600">{bill.totalStorageGB.toFixed(1)} GB storage</div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <CompactCurrencyDisplay amount={bill.totalCost} />
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedBill(bill)
                              }}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalItems > 0 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-emerald-50">
                    <div className="text-sm text-slate-600">
                      Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} bills
                    </div>
                    <div className="flex items-center gap-2">
                      <CustomButton
                        variant="secondary"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </CustomButton>
                      <span className="text-sm text-slate-600 px-2">
                        Page {currentPage} of {totalPages}
                      </span>
                      <CustomButton
                        variant="secondary"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </CustomButton>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Subscription Section */}
        {activeSection === "subscription" && (
          <div className="space-y-6">
            {/* Main Subscription Card */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-4">
                    <Crown className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">{subscriptionData.subscriptionType} Plan</h2>
                  <CustomBadge variant={subscriptionData.subscriptionStatus === "Active" ? "success" : "danger"}>
                    {subscriptionData.subscriptionStatus.toUpperCase()}
                  </CustomBadge>
                </div>

                {/* Subscription Details Grid */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Subscription Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-slate-600 mb-2">Organisation ID</p>
                      <p className="text-base font-semibold text-slate-800">{subscriptionData.organisationId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-2">Subscription Type</p>
                      <p className="text-base font-semibold text-slate-800">{subscriptionData.subscriptionType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-2">Monthly Price</p>
                      {subscriptionData.price ? (
                        <div className="space-y-1">
                          <div className="text-base font-semibold text-slate-800">
                            ${subscriptionData.price.usd.toFixed(2)}
                          </div>
                          <div className="text-xs text-slate-600">
                            ₦{subscriptionData.price.ngn.toLocaleString()} • £{subscriptionData.price.gbp.toFixed(2)}
                          </div>
                        </div>
                      ) : (
                        <p className="text-base font-semibold text-slate-800">Free</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-2">Freemium Period</p>
                      <p className="text-base font-semibold text-slate-800">
                        {subscriptionData.freemiumStartDate} to {subscriptionData.freemiumEndDate}
                      </p>
                    </div>
                    {subscriptionData.premiumStartDate && (
                      <div>
                        <p className="text-sm text-slate-600 mb-2">Premium Period</p>
                        <p className="text-base font-semibold text-slate-800">
                          {subscriptionData.premiumStartDate} to {subscriptionData.premiumEndDate}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-slate-600 mb-2">Status</p>
                      <CustomBadge variant={subscriptionData.subscriptionStatus === "Active" ? "success" : "danger"}>
                        {subscriptionData.subscriptionStatus}
                      </CustomBadge>
                    </div>
                  </div>
                </div>

                {/* Plan Features */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">Plan Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subscriptionData.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <CustomButton variant="primary" onClick={() => setSelectedSubscription(subscriptionData)}>
                    View Full Details
                  </CustomButton>
                  {subscriptionData.subscriptionType === "Freemium" && (
                    <CustomButton variant="secondary">Upgrade to Premium</CustomButton>
                  )}
                  {subscriptionData.subscriptionType === "Premium" &&
                    subscriptionData.subscriptionStatus === "Active" && (
                      <CustomButton variant="danger">Cancel Subscription</CustomButton>
                    )}
                </div>
              </div>
            </div>

            {/* Payment Details Section */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-slate-800">Payment & Billing Details</h3>
                  {!isEditingPayment && (
                    <CustomButton
                      variant="secondary"
                      onClick={() => {
                        setIsEditingPayment(true)
                        setEditedBillingAddress(subscriptionData.billingAddress)
                        setEditedBillingPostcode(subscriptionData.billingPostcode)
                        setEditedExpiryDate(subscriptionData.paymentDetails.expiryDate || "")
                      }}
                    >
                      Edit Details
                    </CustomButton>
                  )}
                </div>

                {!isEditingPayment ? (
                  // View Mode
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-slate-50 to-emerald-50 rounded-xl p-6 border border-slate-200">
                      <h4 className="text-lg font-semibold text-slate-800 mb-4">Payment Method</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <p className="text-sm text-slate-600 mb-2">Card Type</p>
                          <p className="text-base font-semibold text-slate-800">
                            {subscriptionData.paymentDetails.cardType || "Not set"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 mb-2">Card Number</p>
                          <p className="text-base font-semibold text-slate-800">
                            •••• •••• •••• {subscriptionData.paymentDetails.lastFourDigits || "****"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 mb-2">Expiry Date</p>
                          <p className="text-base font-semibold text-slate-800">
                            {subscriptionData.paymentDetails.expiryDate || "Not set"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-slate-50 to-teal-50 rounded-xl p-6 border border-slate-200">
                      <h4 className="text-lg font-semibold text-slate-800 mb-4">Billing Address</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-slate-600 mb-2">Address</p>
                          <p className="text-base font-semibold text-slate-800">{subscriptionData.billingAddress}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 mb-2">Postcode</p>
                          <p className="text-base font-semibold text-slate-800">{subscriptionData.billingPostcode}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Edit Mode
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-slate-50 to-emerald-50 rounded-xl p-6 border border-slate-200">
                      <h4 className="text-lg font-semibold text-slate-800 mb-4">Update Payment Method</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Card Number</label>
                          <input
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            value={editedCardNumber}
                            onChange={(e) => setEditedCardNumber(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                            maxLength={19}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM/YYYY"
                            value={editedExpiryDate}
                            onChange={(e) => setEditedExpiryDate(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                            maxLength={7}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-slate-50 to-teal-50 rounded-xl p-6 border border-slate-200">
                      <h4 className="text-lg font-semibold text-slate-800 mb-4">Update Billing Address</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Billing Address</label>
                          <textarea
                            placeholder="Enter your billing address"
                            value={editedBillingAddress}
                            onChange={(e) => setEditedBillingAddress(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none resize-none"
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Billing Postcode</label>
                          <input
                            type="text"
                            placeholder="Enter postcode"
                            value={editedBillingPostcode}
                            onChange={(e) => setEditedBillingPostcode(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 justify-end">
                      <CustomButton variant="secondary" onClick={handleCancelEdit}>
                        Cancel
                      </CustomButton>
                      <CustomButton variant="primary" onClick={handleSavePaymentDetails}>
                        Save Changes
                      </CustomButton>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Failed Payments Section */}
        {activeSection === "failed" && (
          <>
            {displayedData.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md border border-slate-200 p-12 text-center">
                <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-800 mb-2">All Caught Up!</h3>
                <p className="text-slate-600">You have no failed payments at this time.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                <div className="bg-rose-50 border-b border-rose-200 p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-6 w-6 text-rose-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">Failed Payments</h3>
                      <p className="text-sm text-slate-600">These payments require your attention</p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-rose-100 to-red-100 border-b border-slate-200">
                        <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700">Bill ID</th>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700">Billing Month</th>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700">Due Date</th>
                        <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700">Payment Method</th>
                        <th className="py-4 px-6 text-right text-sm font-semibold text-slate-700">Amount</th>
                        <th className="py-4 px-6 text-center text-sm font-semibold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedData.map((bill, index) => (
                        <tr
                          key={bill.id}
                          onClick={() => setSelectedBill(bill)}
                          className={`cursor-pointer hover:bg-rose-50 transition-colors border-b border-slate-100 ${
                            index % 2 === 0 ? "bg-white" : "bg-slate-50"
                          }`}
                        >
                          <td className="py-4 px-6 font-medium text-slate-800">{bill.id}</td>
                          <td className="py-4 px-6 text-slate-600">{bill.billingMonth}</td>
                          <td className="py-4 px-6 text-slate-600">{bill.dueDate}</td>
                          <td className="py-4 px-6 text-slate-600">{bill.paymentMethod}</td>
                          <td className="py-4 px-6">
                            <CompactCurrencyDisplay amount={bill.totalCost} />
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRetryPayment(bill.id)
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                              >
                                <RefreshCw className="h-4 w-4" />
                                Retry Payment
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedBill(bill)
                                }}
                                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bill Details Modal */}
      <CustomModal
        isOpen={selectedBill !== null}
        onClose={() => setSelectedBill(null)}
        title={`Bill Details - ${selectedBill?.billingMonth}`}
      >
        {selectedBill && <BillDetailsContent bill={selectedBill} />}
      </CustomModal>

      {/* Subscription Details Modal */}
      <CustomModal
        isOpen={selectedSubscription !== null}
        onClose={() => setSelectedSubscription(null)}
        title="Complete Subscription Details"
      >
        {selectedSubscription && <SubscriptionDetailsContent subscription={selectedSubscription} />}
      </CustomModal>
    </div>
  )
}

// Bill Details Content Component
function BillDetailsContent({ bill }: { bill: BillData }) {
  return (
    <div className="space-y-6">
      {/* Bill Summary */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-xl p-6 border border-emerald-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Bill Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div>
            <p className="text-sm text-slate-600 mb-1">Bill ID</p>
            <p className="font-semibold text-slate-800">{bill.id}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Billing Month</p>
            <p className="font-semibold text-slate-800">{bill.billingMonth}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Status</p>
            <div className="mt-1">
              {bill.status === "paid" && <CustomBadge variant="success">Paid</CustomBadge>}
              {bill.status === "pending" && <CustomBadge variant="warning">Pending</CustomBadge>}
              {bill.status === "overdue" && <CustomBadge variant="danger">Overdue</CustomBadge>}
              {bill.status === "failed" && <CustomBadge variant="danger">Failed</CustomBadge>}
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-2">Usage Summary</p>
            <div className="text-center space-y-1">
              <div className="text-sm font-medium text-slate-800">{bill.totalOperations.toLocaleString()} ops</div>
              <div className="text-xs text-slate-600">{bill.totalStorageGB.toFixed(1)} GB storage</div>
              <div className="text-xs text-slate-600">{bill.totalTransferGB.toFixed(1)} GB transfer</div>
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-2">Total Cost</p>
            <CurrencyDisplay amount={bill.totalCost} />
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Costs */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-emerald-50 border-b border-slate-200 px-4 py-3">
            <h4 className="font-semibold text-slate-800">Database Services</h4>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-3 gap-4 items-start text-sm">
              <span className="text-slate-600">MongoDB Base</span>
              <div className="text-center text-slate-500">Base service</div>
              <CurrencyDisplay amount={bill.mongoBasePrice} />
            </div>
            <div className="grid grid-cols-3 gap-4 items-start text-sm">
              <span className="text-slate-600">App Provision</span>
              <div className="text-center text-slate-500">Base service</div>
              <CurrencyDisplay amount={bill.appProvisionPrice} />
            </div>
            <div className="grid grid-cols-3 gap-4 items-start text-sm">
              <span className="text-slate-600">Read Operations</span>
              <UsageDisplay usage={bill.dataBaseread} />
              <CurrencyDisplay amount={bill.dataBaseread.amount} />
            </div>
            <div className="grid grid-cols-3 gap-4 items-start text-sm">
              <span className="text-slate-600">Write Operations</span>
              <UsageDisplay usage={bill.dataBasewrite} />
              <CurrencyDisplay amount={bill.dataBasewrite.amount} />
            </div>
            <div className="grid grid-cols-3 gap-4 items-start text-sm">
              <span className="text-slate-600">Delete Operations</span>
              <UsageDisplay usage={bill.dataBasedelete} />
              <CurrencyDisplay amount={bill.dataBasedelete.amount} />
            </div>
            <div className="grid grid-cols-3 gap-4 items-start text-sm">
              <span className="text-slate-600">Update Operations</span>
              <UsageDisplay usage={bill.dataBaseupdate} />
              <CurrencyDisplay amount={bill.dataBaseupdate.amount} />
            </div>
            <div className="grid grid-cols-3 gap-4 items-start text-sm">
              <span className="text-slate-600">Storage</span>
              <UsageDisplay usage={bill.databaseStorage} />
              <CurrencyDisplay amount={bill.databaseStorage.amount} />
            </div>
            <div className="grid grid-cols-3 gap-4 items-start text-sm">
              <span className="text-slate-600">Data Transfer</span>
              <UsageDisplay usage={bill.dataBaseDataTransfer} />
              <CurrencyDisplay amount={bill.dataBaseDataTransfer.amount} />
            </div>
            <div className="grid grid-cols-3 gap-4 items-start text-sm">
              <span className="text-slate-600">Backup</span>
              <UsageDisplay usage={bill.databaseBackup} />
              <CurrencyDisplay amount={bill.databaseBackup.amount} />
            </div>
            <div className="border-t border-slate-200 pt-3 grid grid-cols-3 gap-4 items-start font-semibold">
              <span className="text-slate-800">Database Total</span>
              <div></div>
              <CurrencyDisplay amount={bill.totalDataBaseCost} className="text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Cloud Storage Costs */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-teal-50 border-b border-slate-200 px-4 py-3">
            <h4 className="font-semibold text-slate-800">Cloud Storage</h4>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-3 gap-4 items-start text-sm">
              <span className="text-slate-600">GB Stored</span>
              <UsageDisplay usage={bill.cloudStorageGBStored} />
              <CurrencyDisplay amount={bill.cloudStorageGBStored.amount} />
            </div>
            <div className="grid grid-cols-3 gap-4 items-start text-sm">
              <span className="text-slate-600">GB Downloaded</span>
              <UsageDisplay usage={bill.cloudStorageGBDownloaded} />
              <CurrencyDisplay amount={bill.cloudStorageGBDownloaded.amount} />
            </div>
            <div className="grid grid-cols-3 gap-4 items-start text-sm">
              <span className="text-slate-600">Upload Ops</span>
              <UsageDisplay usage={bill.cloudStorageUploadOperation} />
              <CurrencyDisplay amount={bill.cloudStorageUploadOperation.amount} />
            </div>
            <div className="grid grid-cols-3 gap-4 items-start text-sm">
              <span className="text-slate-600">Download Ops</span>
              <UsageDisplay usage={bill.cloudStorageDownloadOperation} />
              <CurrencyDisplay amount={bill.cloudStorageDownloadOperation.amount} />
            </div>
            <div className="border-t border-slate-200 pt-3 grid grid-cols-3 gap-4 items-start font-semibold">
              <span className="text-slate-800">Storage Total</span>
              <div></div>
              <CurrencyDisplay amount={bill.totalCloudStorageCost} className="text-teal-600" />
            </div>
          </div>
        </div>

        {/* Frontend Hosting */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-cyan-50 border-b border-slate-200 px-4 py-3">
            <h4 className="font-semibold text-slate-800">Frontend Hosting</h4>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-3 gap-4 items-start text-sm">
              <span className="text-slate-600">File Transfer</span>
              <UsageDisplay usage={bill.frontendHostingFileTransfer} />
              <CurrencyDisplay amount={bill.frontendHostingFileTransfer.amount} />
            </div>
            <div className="border-t border-slate-200 pt-3 grid grid-cols-3 gap-4 items-start font-semibold">
              <span className="text-slate-800">Frontend Total</span>
              <div></div>
              <CurrencyDisplay amount={bill.totalFrontendCost} className="text-cyan-600" />
            </div>
          </div>
        </div>

        {/* Cloud Functions */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-indigo-50 border-b border-slate-200 px-4 py-3">
            <h4 className="font-semibold text-slate-800">Cloud Functions</h4>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-3 gap-4 items-start text-sm">
              <span className="text-slate-600">Invocations</span>
              <UsageDisplay usage={bill.cloudFunctionInvocation} />
              <CurrencyDisplay amount={bill.cloudFunctionInvocation.amount} />
            </div>
            <div className="grid grid-cols-3 gap-4 items-start text-sm">
              <span className="text-slate-600">GB-Seconds</span>
              <UsageDisplay usage={bill.cloudFunctionGBSeconds} />
              <CurrencyDisplay amount={bill.cloudFunctionGBSeconds.amount} />
            </div>
            <div className="grid grid-cols-3 gap-4 items-start text-sm">
              <span className="text-slate-600">CPU Seconds</span>
              <UsageDisplay usage={bill.cloudFunctionCPUSeconds} />
              <CurrencyDisplay amount={bill.cloudFunctionCPUSeconds.amount} />
            </div>
            <div className="grid grid-cols-3 gap-4 items-start text-sm">
              <span className="text-slate-600">Outbound Net</span>
              <UsageDisplay usage={bill.cloudFunctionOutboundNetworking} />
              <CurrencyDisplay amount={bill.cloudFunctionOutboundNetworking.amount} />
            </div>
            <div className="border-t border-slate-200 pt-3 grid grid-cols-3 gap-4 items-start font-semibold">
              <span className="text-slate-800">Functions Total</span>
              <div></div>
              <CurrencyDisplay amount={bill.totalCloudFunctionCost} className="text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Grand Total */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-xl p-6 border-2 border-emerald-300">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xl font-bold text-slate-800">Grand Total</span>
            <div className="text-sm text-slate-600 mt-1">
              {bill.totalOperations.toLocaleString()} operations • {bill.totalStorageGB.toFixed(1)} GB storage •{" "}
              {bill.totalTransferGB.toFixed(1)} GB transfer
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-emerald-600">${bill.totalCost.usd.toFixed(2)}</div>
            <div className="text-lg text-slate-600">
              ₦{bill.totalCost.ngn.toLocaleString()} • £{bill.totalCost.gbp.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Subscription Details Content Component
function SubscriptionDetailsContent({ subscription }: { subscription: SubscriptionData }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Subscription Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-slate-600 mb-1">Organisation ID</p>
            <p className="font-semibold text-slate-800">{subscription.organisationId}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Subscription Type</p>
            <p className="font-semibold text-slate-800">{subscription.subscriptionType}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Status</p>
            <CustomBadge variant={subscription.subscriptionStatus === "Active" ? "success" : "danger"}>
              {subscription.subscriptionStatus}
            </CustomBadge>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Monthly Price</p>
            {subscription.price ? (
              <div className="space-y-1">
                <div className="text-base font-semibold text-slate-800">${subscription.price.usd.toFixed(2)}</div>
                <div className="text-xs text-slate-600">
                  ₦{subscription.price.ngn.toLocaleString()} • £{subscription.price.gbp.toFixed(2)}
                </div>
              </div>
            ) : (
              <p className="text-base font-semibold text-slate-800">Free</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">Subscription Timeline</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-slate-600 mb-1">Freemium Start Date</p>
            <p className="text-base font-semibold text-slate-800">{subscription.freemiumStartDate}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Freemium End Date</p>
            <p className="text-base font-semibold text-slate-800">{subscription.freemiumEndDate}</p>
          </div>
          {subscription.premiumStartDate && (
            <>
              <div>
                <p className="text-sm text-slate-600 mb-1">Premium Start Date</p>
                <p className="text-base font-semibold text-slate-800">{subscription.premiumStartDate}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Premium End Date</p>
                <p className="text-base font-semibold text-slate-800">{subscription.premiumEndDate}</p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">Payment Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-slate-600 mb-1">Payment Method</p>
            <p className="text-base font-semibold text-slate-800">
              {subscription.paymentDetails.cardType} •••• {subscription.paymentDetails.lastFourDigits}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Card Expiry</p>
            <p className="text-base font-semibold text-slate-800">{subscription.paymentDetails.expiryDate}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Billing Address</p>
            <p className="text-base font-semibold text-slate-800">{subscription.billingAddress}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Billing Postcode</p>
            <p className="text-base font-semibold text-slate-800">{subscription.billingPostcode}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">Included Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subscription.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {subscription.subscriptionType === "Premium" && subscription.subscriptionStatus === "Active" && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-slate-800 mb-2">Cancel Subscription</h4>
          <p className="text-sm text-slate-600 mb-4">
            If you cancel your subscription, you'll continue to have access until {subscription.premiumEndDate}.
          </p>
          <CustomButton variant="danger">Cancel Subscription</CustomButton>
        </div>
      )}
    </div>
  )
}
