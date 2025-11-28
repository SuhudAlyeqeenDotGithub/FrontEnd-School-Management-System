"use client";
import { useState } from "react";
import { InputComponent, ErrorDiv, SuccessDiv, LoaderButton } from "@/lib/customComponents/general/compLibrary";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BASE_API_URL } from "@/lib/shortFunctions/shortFunctions";

const SendResetCode = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validationPassed = () => {
    if (!email.trim()) {
      setError("Please enter the associated email.");
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
    setIsLoading(true);
    if (validationPassed()) {
      setSuccess("");
      setError("");
      try {
        const response = await axios.post(
          `${BASE_API_URL}/alyeqeenschoolapp/api/orgaccount/resetpassword`,
          { email },
          {
            withCredentials: true
          }
        );
        if (response) {
          localStorage.setItem("accountEmail", email);
          setSuccess(response.data.message);
          setTimeout(() => {
            router.push("/resetPassword/entercode");
          }, 3000);
        }
      } catch (error: any) {
        setError(error.response?.data.message || error.message || "Error sending verification code");
      }
      setIsLoading(false);
    }
  };
  return (
    <div className="flex flex-col gap-2 border border-borderColor px-6 py-4 bg-backgroundColor rounded-lg shadow justify-center items-center w-[40%] h-[50%] mt-3 overflow-auto">
      <h2>Reset Password - Provide Email</h2>
      <h3>Please provide the associated email, you will receive and email with a code and be redirected</h3>
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
      {success && <SuccessDiv>{success}</SuccessDiv>}
      <form className="flex flex-col gap-5 mt-5 w-full items-center" onSubmit={handleSubmit}>
        <InputComponent
          type="email"
          placeholder="Account Email *"
          name="email"
          value={email}
          required={true}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />

        <LoaderButton
          type="submit"
          buttonText="Send Email"
          loadingButtonText="Sending Email..."
          disabled={!email}
          isLoading={isLoading}
        />
      </form>

      <div className="flex flex-col gap-1">
        <Link href="/signup" className="hover:text-foregroundColor-70 hover:underline">
          Go back to Sign Up
        </Link>
        <Link href="/signin" className="hover:text-foregroundColor-70 hover:underline">
          Go back to Sign In
        </Link>
      </div>
    </div>
  );
};

export default SendResetCode;
