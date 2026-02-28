import { Outlet } from "react-router-dom";
import collegeImg from "./college.jpg";

const Layout = () => {
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${collegeImg})`,
      }}
    >
      {/* Dark overlay for premium look */}
      <div className="min-h-screen w-full bg-black/50">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
