"use client";
import { ReactNode } from "react";

export interface InputComponentType {
  type?: string;
  placeholder: string;
  required?: boolean;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  themes: {
    backgroundColor: string;
    foregroundColor: string;
  };
  roleId: {
    tabAccess: {};
    _id: string;
    organisationId: string;
    roleName: string;
    roleDescription: string;
    absoluteAdmin: boolean;
  };
}

export interface TabObject {
  icon?: ReactNode;
  title: string;
  subTitle?: string;
  url: string;
}

export interface DataTableType {
  title: string;
  subTitle: string;
  searchPlaceholder: string;
  actionButtonText: string;
  headers: string[];
  outerDivStyle: string;
  innerDivStyle: string;
  valueDivStyle: string;
  divSkeletonType: string;
  data: any[]; // [{accountId: "123", accountName: "boy"}, {accountId: "123", accountName: "boy"}, {accountId: "123", accountName: "boy"}]
  IdKey?: any;
  key1?: any;
  key2?: any;
  key3?: any;
  key4?: any;
  key5?: any;
  key6?: any;
  key7?: any;
  key8?: any;
  searchKey?: any;
  onNewActionClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onDeleteClick?: (e: React.MouseEvent<SVGElement>) => void;
  onDivClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}
