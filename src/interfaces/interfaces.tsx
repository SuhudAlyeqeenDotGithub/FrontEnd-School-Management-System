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
export interface SignInType {
  email: string;
  password: string;
}

export interface AccountType {
  accountId: string;
  accountType: string;
  accountName: string;
  accountEmail: string;
  accountPhone: string;
  organisationId: string;
  themes: {
    backgroundColor: string;
    foregroundColor: string;
  };
  roleId: {
    tabAccess: {
      adminTab: string[];
      courseTab: string[];
      studentTab: string[];
      enrollmentTab: string[];
      attendanceTab: string[];
      staffTab: string[];
    };
    _id: string;
    organisationId: string;
    roleName: string;
    roleDescription: string;
    absoluteAdmin: boolean;
  };
}
