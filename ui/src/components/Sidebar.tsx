import React, { useState } from "react";
import { DashboardIcon, AppIcon, CompanyIcon, UserIcon } from "../assets/icons";
import logo from "../assets/logo.png";
import { NavLink, useLocation } from "react-router-dom";
import { ZMenuIcon } from "../assets/icons";
import Monitor from "../assets/Monitor.png";
import UserMenu from "./DropdownProfile";
import appConfig from "../config/config";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { pathname } = location;

  const toggle = () => setIsOpen(!isOpen);

  const menuItem = [
    {
      path: "/dashboard",
      name: "dashboard",
      icon: <DashboardIcon pathname={pathname} />,
    },
    {
      path: "/application",
      name: "application",
      icon: <AppIcon pathname={pathname} />,
    },
    {
      path: "/user",
      name: "user",
      icon: <UserIcon pathname={pathname} />,
    },
    {
      path: "/company",
      name: "company",
      icon: <CompanyIcon pathname={pathname} />,
    },
  ];

  const userData = JSON.parse(sessionStorage.getItem("userData"));
  return (
    <div
      className="overflow-y-auto overflow-x-hidden"
      style={{
        height: "100vh", // Full height for the sidebar
        // display: "flex",
        display: "contents",
        flexDirection: "column",
      }}
    >
      <div
        style={{ width: isOpen ? "240px" : "80px", minHeight: "720px" }}
        className="sidebar flex flex-col justify-between"
      >
        <div
          className="bg-black"
          style={{
            height: "60vh",
          }}
        >
          <div
            className="flex ml-2 mb-4 pt-3 border-b border-white pl-3 "
            style={{
              height: "70px",
            }}
          >
            <div>
              <a href="/dashboard">
                <img
                  src={logo}
                  alt=""
                  style={{
                    width: "40px",
                    alignItems: "center",
                  }}
                />
              </a>
            </div>
            <h1
              style={{ display: isOpen ? "block" : "none", fontSize: "25px" }}
              className={`logo text-xl font-bold mr-4 pt-1 pl-3 ${
                isOpen ? "animate-fadeInOut" : "opacity-0"
              }`}
            >
              ZAION
            </h1>
          </div>
          <div className="flex ml-4 mb-4 mt-4 pb-4 pl-3">
            <div
              className={`pr-4 ${isOpen ? "animate-fadeInOut" : "opacity-0"}`}
              style={{
                display: isOpen ? "block" : "none",
                transition: "opacity 0.5s ease-in",
                opacity: isOpen ? 1 : 0,
              }}
            >
              <img
                src={Monitor}
                alt=""
                style={{
                  width: "20px",
                  alignItems: "center",
                }}
              />
            </div>
            <h1
              className={`logo font-medium text-gray-400  text-sm ${
                isOpen ? "animate-fadeInOut" : "opacity-0"
              }`}
              style={{
                display: isOpen ? "block " : "none ",
              }}
            >
              Agent Monitoring
            </h1>
            <div
              style={{ marginLeft: isOpen ? "8px" : "0px" }}
              className="bars pl-2"
            >
              <button
                onClick={toggle}
                className={`transform transition-transform duration-500 ${
                  isOpen ? "-scale-x-100" : "scale-x-100"
                }`}
              >
                <ZMenuIcon />
              </button>
            </div>
          </div>

          <div className="pl-3">
            {menuItem.map((item, index) => (
              <NavLink
                to={item.path}
                key={index}
                className="link "
                activeclassname="active"
              >
                <div className="icon pt-1">{item.icon}</div>
                <div
                  style={{ display: isOpen ? "block" : "none" }}
                  className="link_text"
                >
                  {item.name}
                </div>
              </NavLink>
            ))}
          </div>
        </div>
        <div className="text-white mb-2 bg-black">
          <div className="flex items-center ml-4 mb-3">
            <UserMenu align="top" />
            <h1
              style={{
                display: isOpen ? "block" : "none",
                fontSize: "23px",
                flex: "none",
              }}
              className={`logo text-xl font-bold mr-4 pt-1 pl-3 ${
                isOpen ? "animate-fadeInOut" : "opacity-0"
              } mt-auto mb-1`}
            >
              {userData.userName}
            </h1>
          </div>
          <hr />
          <h2 style={{ height: "23px" }}>
            <small
              style={{ display: isOpen ? "block" : "none" }}
              className="text-white pt-1 flex justify-center rounded-lg ml-3"
            >
              © 2024{" "}
              <a
                href="https://www.zaion.ai"
                target="_blank"
                className="text-blue-500"
              >
                Zaion
              </a>{" "}
              | All rights reserved
            </small>{" "}
            <small
              style={{ display: isOpen ? "none" : "block" }}
              className="text-white pt-1 flex justify-center rounded-lg ml-3"
            >
              ©{" "}
              <a
                href="https://www.zaion.ai"
                target="_blank"
                className="text-blue-500"
              >
                Zaion
              </a>
            </small>
          </h2>
          <small
            style={{ display: "block", fontSize: "xx-small" }}
            className="text-white flex justify-center rounded-lg ml-3"
          >
            Version : {appConfig.version}
          </small>
        </div>
      </div>
      {/* <main>{children}</main> */}
    </div>
  );
};

export default Sidebar;
