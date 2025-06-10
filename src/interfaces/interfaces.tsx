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
export interface OrgSignInType {
  organisationEmail: string;
  organisationPassword: string;
}

export interface OrgType {
  _id: string;
  organisationName: string;
  organisationPhone: string;
  organisationPassword: string;
  organisationImage: string;
  themes: {
    backgroundColor: string;
    foregroundColor: string;
  };
}
