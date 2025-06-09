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
  organisationPassword: string;
  organisationConfirmPassword: string;
}
export interface OrgSignInType {
  organisationEmail: string;
  organisationPassword: string;
}

export interface OrgType {
  organisationName: string;
  organisationEmail: string;
}
