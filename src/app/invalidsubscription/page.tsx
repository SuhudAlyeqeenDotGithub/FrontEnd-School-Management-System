const invalidSubsciption = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
      <div className=" flex flex-col items-center mb-5">
        <div className="h-10 w-22">
          <img src="/suhudlogo.png" className="h-full w-full" alt="Suhud Logo" />
        </div>
        <p className="text-[18px] text-[#0097a7]  font-medium">School Management System</p>
      </div>
      <h1 className="text-4xl font-bold mb-4">Access Not Allowed</h1>
      <div></div>
      <p className="text-lg font-medium">Oops! Your organization does not have a valid subscription </p>
      <p className="mb-6">
        Either your freemium expired or your last premium payment was not successfully charged. The Absolute admin can
        go to billing to upgrade your subscription.
      </p>
      <a href="/main/admin/billing" className="text-[#0097a7]  underline">
        Go to Billing to resolve the issue
      </a>
    </div>
  );
};

export default invalidSubsciption;
