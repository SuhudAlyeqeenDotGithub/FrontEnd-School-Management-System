const NoFeatureAccess = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
      <div className=" flex flex-col items-center mb-5">
        <div className="h-20 w-45">
          <img src="/suhudlogo.png" className="h-full w-full" alt="Suhud Logo" />
        </div>
        <p className="text-[18px] text-[#0097a7] font-medium">School Management System</p>
      </div>
      <h1 className="text-4xl font-bold mb-4">Access Not Allowed</h1>
      <p className="text-lg font-medium">Oops! Your organization does not have access to this feature </p>
      <div className=" text-left mt-5">
        <h2 className="font-medium">Possible Causes</h2>
        <ul className="list-disc ml-6">
          <li>They have not purchased it yet - vist features to get it</li>
          <li>It has recently been removed - vist features to get it again</li>
        </ul>
      </div>

      <p className="mt-6 mb-4 font-medium">Your Absolute admin can go to Features to purchase it.</p>
      <a href="/main/admin/features" className="text-[#0097a7]  underline">
        Go to Features
      </a>
    </div>
  );
};

export default NoFeatureAccess;
