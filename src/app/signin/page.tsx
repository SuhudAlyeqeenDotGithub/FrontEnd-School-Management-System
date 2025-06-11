"use client";
import { useState } from "react";
import { InputComponent, ErrorDiv } from "@/component/smallComponents";
import Link from "next/link";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { signIn } from "@/redux/features/accounts/accountThunks";
import { useAppDispatch } from "@/redux/hooks";
import { useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";

const signInPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, isSuccess, isError, errorMessage } = useAppSelector((state) => state.orgAccountData);
  const [inputData, setInputData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const { email, password } = inputData;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
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
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center w-1/2 gap-5">
        <h1>Al-Yeqeen School Management App</h1>
        <div className="flex flex-col gap-5 border border-foregroundColor-20 p-8 rounded-lg shadow justify-center items-center w-3/4">
          <h2>Sign In</h2>
          <h3>Sign in with your details</h3>
          {error && <ErrorDiv>{error}</ErrorDiv>}
          <form className="flex flex-col gap-2 mt-5 w-full items-center" onSubmit={handleSubmit}>
            <InputComponent
              type="email"
              placeholder="Account Email *"
              name="email"
              value={email}
              required={true}
              onChange={handleInputChange}
            />

            <div className="flex flex-col gap-1 w-full">
              <div className="flex justify-end">
                <Link href="/forgotpassword" className="hover:text-foregroundColor-70 hover:underline text-sm">
                  Forgot Password?
                </Link>
              </div>
              <InputComponent
                type="password"
                placeholder="Password *"
                name="password"
                value={password}
                required={true}
                onChange={handleInputChange}
              />
            </div>

            <button type="submit" disabled={!password || !email} className="w-full mt-5">
              Sign In
            </button>
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
