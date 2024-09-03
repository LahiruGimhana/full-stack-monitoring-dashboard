/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authClient from "../services/authService";
import Logo from "../assets/logo.png";
import { useUser } from "../context/UserContext";
import CoverImg from "../assets/z-auth-bg.jpg";

const Login = () => {
  const { setUserType } = useUser();
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLogin, setIsLogin] = useState<boolean>(
    !!sessionStorage.getItem("authToken")
  );

  const navigate = useNavigate();
  const token = sessionStorage.getItem("authToken");

  useEffect(() => {
    return () => {
      if (token && isLogin) {
        navigate("/dashboard", { replace: true });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const formData = new FormData(e.target);
      const email = formData.get("email");
      const password = formData.get("password");

      if (email && password) {
        setIsLoading(true);
        try {
          const response = await authClient.post("/auth/login", {
            userName: email,
            password: password,
          });
          const token = response.data.auth_token;
          const userData = response.data._user_data;
          if (token) {
            sessionStorage.setItem("authToken", token);
            sessionStorage.setItem("userData", JSON.stringify(userData));
            setUserType(userData.userType);
            navigate("/dashboard");
          } else {
            setLoginError("The email or password you entered is invalid.");
          }
        } catch (error) {
          setLoginError("An error occurred while logging in.");
          setIsLoading(false);
          console.error("Login error:", error);
        }
        setIsLoading(false);
      } else {
        setLoginError("The email or password you entered is invalid.");
      }
    } catch (error) {
      setIsLoading(false);

      setLoginError("Invalid email or password.");
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center w-full dark:bg-gray-950">
        <img
          src={CoverImg}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div
          style={{
            backgroundColor: "#01020799",
            width: "90vw",
            maxWidth: "538px",
            height: "auto",
            padding: "64px 80px 44px",
            borderRadius: "16px",
            position: "relative",
            transition: "all 0.3s ease-in",
          }}
          className=""
        >
          <div className="flex items-center justify-between pl-2 pr-2">
            <img src={Logo} width="40" height="40" alt="Logo 01" />
            <h1 className="text-2xl font-bold text-center mr-3 text-blue-500 uppercase-text">
              AGENT ASSIST MONITOR
            </h1>
          </div>
          <span className="text-white bg-orange-900 pl-1 pr-1 flex justify-center rounded-lg mt-3">
            {loginError}
          </span>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm mt-3 font-medium text-gray-400 dark:text-gray-300 mb-2">
                User Name
              </label>
              <input
                type="text"
                id="email"
                name="email"
                className="shadow-sm bg-transparent text-white rounded-full w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your user name"
                required
              />
            </div>
            <div className="relative mb-4">
              <label className="block text-sm font-medium text-gray-400 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="shadow-sm bg-transparent text-white rounded-full w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 pr-10" // added pr-10 for padding
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="absolute right-10 transform -translate-y-1/2 mt-5 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg
                    strokeWidth={1.5}
                    className="w-6 h-6"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipule="evenodd"
                      d="M7.5 11C4.80285 11 2.52952 9.62184 1.09622 7.50001C2.52952 5.37816 4.80285 4 7.5 4C10.1971 4 12.4705 5.37816 13.9038 7.50001C12.4705 9.62183 10.1971 11 7.5 11ZM7.5 3C4.30786 3 1.65639 4.70638 0.0760002 7.23501C-0.0253338 7.39715 -0.0253334 7.60288 0.0760014 7.76501C1.65639 10.2936 4.30786 12 7.5 12C10.6921 12 13.3436 10.2936 14.924 7.76501C15.0253 7.60288 15.0253 7.39715 14.924 7.23501C13.3436 4.70638 10.6921 3 7.5 3ZM7.5 9.5C8.60457 9.5 9.5 8.60457 9.5 7.5C9.5 6.39543 8.60457 5.5 7.5 5.5C6.39543 5.5 5.5 6.39543 5.5 7.5C5.5 8.60457 6.39543 9.5 7.5 9.5Z"
                      fill="#adb1b9"
                    />
                  </svg>
                ) : (
                  <svg
                    strokeWidth={1.5}
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4.4955 7.44088C3.54724 8.11787 2.77843 8.84176 2.1893 9.47978C0.857392 10.9222 0.857393 13.0778 2.1893 14.5202C3.9167 16.391 7.18879 19 12 19C13.2958 19 14.4799 18.8108 15.5523 18.4977L13.8895 16.8349C13.2936 16.9409 12.6638 17 12 17C7.9669 17 5.18832 14.82 3.65868 13.1634C3.03426 12.4872 3.03426 11.5128 3.65868 10.8366C4.23754 10.2097 4.99526 9.50784 5.93214 8.87753L4.4955 7.44088Z"
                      fill="#adb1b9"
                    />
                    <path
                      d="M8.53299 11.4784C8.50756 11.6486 8.49439 11.8227 8.49439 12C8.49439 13.933 10.0614 15.5 11.9944 15.5C12.1716 15.5 12.3458 15.4868 12.516 15.4614L8.53299 11.4784Z"
                      fill="#adb1b9"
                    />
                    <path
                      d="M15.4661 12.4471L11.5473 8.52829C11.6937 8.50962 11.8429 8.5 11.9944 8.5C13.9274 8.5 15.4944 10.067 15.4944 12C15.4944 12.1515 15.4848 12.3007 15.4661 12.4471Z"
                      fill="#adb1b9"
                    />
                    <path
                      d="M18.1118 15.0928C19.0284 14.4702 19.7715 13.7805 20.3413 13.1634C20.9657 12.4872 20.9657 11.5128 20.3413 10.8366C18.8117 9.18002 16.0331 7 12 7C11.3594 7 10.7505 7.05499 10.1732 7.15415L8.50483 5.48582C9.5621 5.1826 10.7272 5 12 5C16.8112 5 20.0833 7.60905 21.8107 9.47978C23.1426 10.9222 23.1426 13.0778 21.8107 14.5202C21.2305 15.1486 20.476 15.8603 19.5474 16.5284L18.1118 15.0928Z"
                      fill="#adb1b9"
                    />
                    <path
                      d="M2.00789 3.42207C1.61736 3.03155 1.61736 2.39838 2.00789 2.00786C2.39841 1.61733 3.03158 1.61733 3.4221 2.00786L22.0004 20.5862C22.391 20.9767 22.391 21.6099 22.0004 22.0004C21.6099 22.3909 20.9767 22.3909 20.5862 22.0004L2.00789 3.42207Z"
                      fill="#adb1b9"
                    />
                  </svg>
                )}
              </button>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? "Logging In..." : "Login"}
            </button>
          </form>
          <small className="text-white pt-1 flex justify-center rounded-lg mt-3">
            © 2024 Zaion | All rights reserved
          </small>
        </div>
      </div>
    </>
  );
};

export default Login;
