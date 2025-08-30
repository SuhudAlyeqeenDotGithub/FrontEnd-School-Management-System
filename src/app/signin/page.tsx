"use client";
import { useState } from "react";
import { InputComponent, ErrorDiv, LoaderButton, CustomHeading } from "@/lib/customComponents/general/compLibrary";
import Link from "next/link";
import { signIn } from "@/redux/features/accounts/accountThunks";
import { useAppDispatch } from "@/redux/hooks";
import { useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import { validateEmail } from "@/lib/shortFunctions/shortFunctions";

const signInPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, isSuccess, isError, errorMessage } = useAppSelector((state) => state.accountData);
  const [inputData, setInputData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const { email, password } = inputData;
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInputData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const validationPassed = () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validationPassed()) {
      try {
        const response = await dispatch(signIn(inputData)).unwrap();
        if (response) {
          router.push("/main");
        }
      } catch (error: any) {
        setError(error.response?.data.message || error.message || error || "An error occurred during signIn");
      }
    }
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-backgroundColor-3">
      <div className="flex flex-col items-center justify-center w-1/2 gap-5">
        <CustomHeading>Al-Yeqeen School Management App</CustomHeading>
        <div className="flex flex-col gap-5 border border-foregroundColor-20 p-8 bg-backgroundColor rounded-lg shadow justify-center items-center w-3/4">
          <div className="flex flex-col gap-2 w-full items-center justify-center">
            <CustomHeading variation="head2">Sign In</CustomHeading>
            <CustomHeading variation="head4light">Sign in with your details</CustomHeading>
          </div>

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
          <form className="flex flex-col gap-2 mt-5 w-full items-center" onSubmit={handleSubmit}>
            <InputComponent
              type="email"
              title="Account Email *"
              placeholder="Account Email *"
              name="email"
              value={email}
              required={true}
              onChange={handleInputChange}
            />

            <div className="flex flex-col gap-1 w-full">
              <div className="flex justify-end">
                <Link href="/resetPassword" className="hover:text-foregroundColor-70 hover:underline text-sm">
                  Forgot Password?
                </Link>
              </div>
              <InputComponent
                title="Password *"
                type={showPassword ? "text" : "password"}
                placeholder="Password *"
                name="password"
                value={password}
                required={true}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex gap-5 w-full items-center my-3">
              <input type="checkbox" onChange={() => setShowPassword(!showPassword)} className="w-4 h-4" />
              <span className="text-foregroundColor-70 text-sm hover:text-foregroundColor-90 hover:underline cursor-pointer">
                {showPassword ? "Hide Passwords" : "Show Passwords"}
              </span>
            </div>
            <LoaderButton
              type="submit"
              buttonText="Sign In"
              loadingButtonText="Signing In..."
              disabled={!password || !email}
              isLoading={isLoading}
            />
          </form>

          <Link href="/signup" className="hover:text-foregroundColor-70 hover:underline">
            Have no account? Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default signInPage;
