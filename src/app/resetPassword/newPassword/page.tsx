"use client";
import { useState } from "react";
import { InputComponent, ErrorDiv, LoaderButton, SuccessDiv } from "@/lib/customComponents/general/compLibrary";
import Link from "next/link";
import { useAppDispatch } from "@/redux/hooks";
import { useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import { setNewPassword } from "@/redux/features/accounts/accountThunks";

const signUpPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, isSuccess, isError, errorMessage } = useAppSelector((state) => state.accountData);
  const [inputData, setInputData] = useState({
    organisationEmail: "",
    organisationPhone: "",
    organisationPassword: "",
    organisationConfirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { organisationEmail, organisationPassword, organisationConfirmPassword } = inputData;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&~*+-]).{8,}$/;
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
      const code = localStorage.getItem("resetCode");
      if (!code) {
        setError("Reset code is missing. Please restart the password reset process. You will not be redirected");
        setTimeout(() => {
          router.push("/resetPassword");
        }, 3000);
        return;
      }
      const resetPasswordData = { ...inputData, code };
      try {
        const response = await dispatch(setNewPassword(resetPasswordData)).unwrap();
        if (response) {
          localStorage.removeItem("resetCode");
          localStorage.removeItem("accountEmail");
          router.push("/main");
        }
      } catch (error: any) {
        setError(error.response?.data.message || error.message || error || "An error occurred during password reset");
      }
    }
  };
  return (
    <div className="flex flex-col gap-2 border border-borderColor px-6 py-4 bg-backgroundColor rounded-lg shadow justify-center items-center w-[40%] h-[70%] mt-3 overflow-auto">
      <h2>Reset Password</h2>
      <h3>Please provide the organisation email and the new password</h3>
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
          type={showPassword ? "text" : "password"}
          placeholder="New Password *"
          name="organisationPassword"
          value={organisationPassword}
          required={true}
          onChange={handleInputChange}
        />
        <InputComponent
          type={showPassword ? "text" : "password"}
          placeholder="Confirm New Password *"
          name="organisationConfirmPassword"
          value={organisationConfirmPassword}
          required={true}
          onChange={handleInputChange}
        />

        <div className="flex gap-3 w-full items-center my-3">
          <input type="checkbox" onChange={() => setShowPassword(!showPassword)} className="w-4 h-4" />
          <span className="text-foregroundColor text-sm hover:text-foregroundColor-2 hover:underline cursor-pointer pt-1">
            {showPassword ? "Hide Passwords" : "Show Passwords"}
          </span>
        </div>

        <LoaderButton
          type="submit"
          buttonText="Reset Password"
          loadingButtonText="Reseting Password..."
          disabled={!organisationEmail || !organisationPassword || !organisationConfirmPassword}
                  isLoading={isLoading}
        />
      </form>
      <Link href="/signup" className="hover:text-foregroundColor-70 hover:underline">
        Have no account? Sign Up
      </Link>
      <Link href="/resetPassword" className="hover:text-foregroundColor-70 hover:underline">
        Resend Code
      </Link>
    </div>
  );
};

export default signUpPage;
