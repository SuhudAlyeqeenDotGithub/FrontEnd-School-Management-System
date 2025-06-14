"use client";
import { useState } from "react";
import { InputComponent, ErrorDiv, LoaderButton } from "@/component/smallComponents";
import Link from "next/link";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { orgSignUp } from "@/redux/features/accounts/accountThunks";
import { useAppDispatch } from "@/redux/hooks";
import { useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";

const signUpPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, isSuccess, isError, errorMessage } = useAppSelector((state) => state.orgAccountData);
  const [inputData, setInputData] = useState({
    organisationEmail: "",
    organisationPhone: "",
    organisationPassword: "",
    organisationConfirmPassword: ""
  });
  const [error, setError] = useState("");
  const { organisationEmail, organisationPassword, organisationConfirmPassword } = inputData;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const validationPassed = () => {
    if (!organisationEmail.trim() || !organisationPassword || !organisationConfirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(organisationEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&~*]).{8,}$/;
    if (!passwordStrengthRegex.test(organisationPassword)) {
      setError(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and at least one special character [!@#$%^&~*]."
      );
      return;
    }

    if (organisationPassword !== organisationConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validationPassed()) {
      try {
        const response = await axios.post("http://localhost:5000/alyeqeenschoolapp/api/orgaccount/signin", signInData, {
          withCredentials: true
        });
        return response.data;
      } catch (error: any) {
        ;
      }
    }
  };
  return (
    <div className="flex flex-col gap-5 border border-foregroundColor-20 p-8 rounded-lg shadow justify-center items-center w-3/4">
      <h2>Reset Password</h2>
      <h3>Please provide the organisation email and the new password</h3>
      {error && <ErrorDiv>{error}</ErrorDiv>}
      <form className="flex flex-col gap-4 mt-5 w-full items-center" onSubmit={handleSubmit}>
        <InputComponent
          type="email"
          placeholder="Organisation Email - (admin) *"
          name="organisationEmail"
          value={organisationEmail}
          required={true}
          onChange={handleInputChange}
        />

        <InputComponent
          type="password"
          placeholder="New Password *"
          name="organisationPassword"
          value={organisationPassword}
          required={true}
          onChange={handleInputChange}
        />
        <InputComponent
          type="password"
          placeholder="Confirm New Password *"
          name="organisationConfirmPassword"
          value={organisationConfirmPassword}
          required={true}
          onChange={handleInputChange}
        />

        <LoaderButton
          type="submit"
          buttonText="Reset Password"
          loadingButtonText="Reseting Password..."
          disabled={!organisationEmail || !organisationPassword || !organisationConfirmPassword}
          buttonStyle="w-full"
          isLoading={isLoading}
        />
      </form>
    </div>
  );
};

export default signUpPage;
