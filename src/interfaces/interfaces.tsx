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
