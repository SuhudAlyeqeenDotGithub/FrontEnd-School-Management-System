"use client";
import { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export interface InputComponentType {
  disabled?: boolean;
  type?: string;
  title?: string;
  autocomplete?: string;
  placeholder: string;
  required?: boolean;
  name: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}
export interface OrgSignUpType {
  organisationName: string;
  organisationEmail: string;
  organisationPhone: string;
  organisationPassword: string;
  organisationConfirmPassword: string;
}

export interface ResetPasswordType {
  organisationEmail: string;
  organisationPassword: string;
  organisationConfirmPassword: string;
  code: string;
}
export interface SignInType {
  email: string;
  password: string;
}

export interface AccountType {
  accountId: any;
  staffId: any;
  accountStatus: string;
  accountType: string;
  accountName: string;
  accountEmail: string;
  accountPhone: string;
  organisationId: any;
  settings: any;
  uniqueTabAccess: [];
  themes: {
    backgroundColor: string;
    foregroundColor: string;
  };
  roleId: {
    tabAccess: [];
    _id: string;
    accountId: string;
    organisationId: string;
    roleName: string;
    roleDescription: string;
    absoluteAdmin: boolean;
  };
}

export interface DataTableType {
  title: string;
  subTitle: string;
  searchPlaceholder: string;
  actionButtonText?: string;
  headers: string[];
  outerDivStyle: string;
  innerDivStyle: string;
  valueDivStyle: string;
  divSkeletonType: string;
  data: any[]; // [{accountId: "123", accountName: "boy"}, {accountId: "123", accountName: "boy"}, {accountId: "123", accountName: "boy"}]
  IdKey?: any;
  keys?: any[];
  searchKey?: any;
  onNewActionClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onDeleteClick?: (e: React.MouseEvent<SVGElement>) => void;
  onDivClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}
export interface TabAccessType {
  tab: string;
  actions: { name: string; permission: boolean }[];
}
export interface ReturnRoleType {
  tabAccess: TabAccessType[];
  _id: string;
  accountId: string;
  organisationId: string;
  roleName: string;
  roleDescription: string;
  absoluteAdmin: boolean;
}

export interface ParamRoleType {
  roleName: string;
  roleDescription: string;
  tabAccess: TabAccessType[];
}

export interface DeleteParamRoleType {
  roleIdToDelete: string;
  roleName: string;
  roleDescription: string;
  absoluteAdmin: boolean;
  tabAccess: TabAccessType[];
}

export interface ParamUserType {
  staffId: string;
  userName: string;
  userEmail: string;
  userPassword: string;
  userStatus: string;
  roleId: string;
}

export interface EditParamUserType {
  userId: string;
  staffId: string;
  userName: string;
  userEmail: string;
  userPassword: string;
  userStatus: string;
  onEditUserIsAbsoluteAdmin: boolean;
  roleId: any;
  passwordChanged: boolean;
}

export interface DeleteParamUserType {
  accountIdToDelete: string;
  accountType: string;
  userName: string;
  userEmail: string;
  userStatus: string;
  roleId: any;
}

export interface ReturnUserType {
  accountType: string;
  organisationId: any;
  staffId: any;
  accountName: string;
  accountEmail: string;
  searchText: string;
  roleId: ReturnRoleType;
}

export interface QualificationType {
  _id: string;
  qualificationName: string;
  schoolName: string;
  grade: string;
  startDate: string;
  endDate: string;
}

export interface IdentificationType {
  _id: string;
  identificationType: string;
  identificationValue: string;
  issueDate: string;
  expiryDate: string;
}

export interface WorkExperienceType {
  _id: string;
  organisation: string;
  position: string;
  experience: string;
  startDate: string;
  endDate: string;
}

export interface StaffType {
  _id: string;
  organisationId: string;
  staffCustomId?: string;
  staffFullName: string;
  staffDateOfBirth: string;
  staffGender: string;
  staffPhone: string;
  staffEmail: string;
  staffAddress: string;
  staffPostCode?: string;
  staffImage?: string;
  staffImageDestination?: string;
  staffMaritalStatus: string;
  staffStartDate: string;
  staffEndDate?: string;
  staffNationality: string;
  staffAllergies?: string;
  staffNextOfKinName: string;
  staffNextOfKinRelationship: string;
  staffNextOfKinPhone: string;
  staffNextOfKinEmail: string;
  staffQualification?: {
    _id: string;
    qualificationName: string;
    schoolName: string;
    startDate: string;
    endDate: string;
  }[];
}

export interface BaseStaffContractType {
  academicYearId: string;
  academicYear: string;
  staffId: string;
  staffCustomId: string;
  staffFullName: string;
  jobTitle: string;
  contractStartDate: string;
  contractEndDate: string;
  responsibilities: { responsibility: string; description: string }[];
  contractType: string;
  contractStatus: string;
  contractSalary: string;
  workingSchedule: { day: string; startTime: string; endTime: string; hours: string }[];
}

// Used when sending data (input parameters)
export interface ParamStaffContractType extends BaseStaffContractType {}

// Used when receiving data (includes _id and organisationId)
export interface ReturnStaffContractType extends BaseStaffContractType {
  _id: string;
  organisationId: string;
}

export interface BasePeriodType {
  period: string;
  startDate: string;
  endDate: string;
}
export interface ParamPeriodType extends BasePeriodType {
  _id: string;
}

export interface BaseAcademicYearType {
  academicYear: string;
  startDate: string;
  endDate: string;
}

export interface ParamAcademicYearType extends BaseAcademicYearType {
  _id: string;
}
