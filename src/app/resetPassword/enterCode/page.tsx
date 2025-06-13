"use client";
import { useState } from "react";
import { InputComponent, ErrorDiv, LoaderButton } from "@/component/smallComponents";
import { signIn } from "@/redux/features/accounts/accountThunks";
import { useAppDispatch } from "@/redux/hooks";
import { useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";

const signInPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, isSuccess, isError, errorMessage } = useAppSelector((state) => state.orgAccountData);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const validationPassed = () => {
    if (!code.trim()) {
      setError("Please enter the recieved code.");
      return;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validationPassed()) {
      try {
        const response = await dispatch(signIn(code)).unwrap();
        if (response) {
          router.push("/");
        }
      } catch (error: any) {
        setError(error.response?.data.message || error.message || error || "An error occurred during signIn");
      }
    }
  };
  return (
    <div className="flex flex-col gap-5 border border-foregroundColor-20 p-8 rounded-lg shadow justify-center items-center w-3/4">
      <h2>Reset Password - Enter Code</h2>
      <h3>Please provide the code you received through code</h3>
      {error && <ErrorDiv>{error}</ErrorDiv>}
      <form className="flex flex-col gap-2 mt-5 w-full items-center" onSubmit={handleSubmit}>
        <InputComponent
          type="code"
          placeholder="Enter Received Code *"
          name="code"
          value={code}
          required={true}
          onChange={(e) => {
            setCode(e.target.value);
          }}
        />

        <LoaderButton
          type="submit"
          buttonText="Send code"
          loadingButtonText="Checking code..."
          disabled={!code}
          buttonStyle="w-full mt-5"
          isLoading={isLoading}
        />
      </form>
    </div>
  );
};

export default signInPage;
