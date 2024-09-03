/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { useLocation } from "react-router-dom";
import {
  OpenSliderIcon,
  UpArrow,
  DownArrow,
  Services,
  Apps,
} from "../assets/icons";

const Header = ({ prop, Active, Inactive, zauApp, onSelect }) => {
  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <header
      className="sticky rounded shadow-2xl dark:bg-[#182235] border-b border-slate-200 dark:border-slate-700 z-30 bg-white"
      style={{ position: "fixed", width: "-webkit-fill-available" }}
    >
      <div className="px-4 sm:px-6 lg:px-6">
        <div className="flex items-center justify-between h-10">
          {/* Header: Left side */}
          <div className="flex">
            <span>&nbsp; &nbsp;</span>
            <span className="mt-2 mr-8">
              {location.pathname === "/dashboard"
                ? `. . . ${location.pathname}/${
                    selectedTab === 0 ? "apps" : "services"
                  }`
                : `. . . ${location.pathname}`}
            </span>
            {location.pathname === "/dashboard" ? (
              <>
                <button
                  className={`mr-3 px-3  cursor-pointer hover:scale-105 border-b-4 rounded-t-md transition-colors duration-300 ${
                    selectedTab === 0
                      ? "bg-slate-300 dark:bg-gray-600 text-black dark:text-white dark:border-teal-600 border-teal-500"
                      : "bg-slate-200 dark:bg-slate-800 text-black dark:text-white border-transparent"
                  }`}
                  onClick={() => {
                    onSelect("Apps");
                    setSelectedTab(0);
                  }}
                >
                  Apps
                </button>
                <button
                  className={`mr-3 px-3  cursor-pointer hover:scale-105 border-b-4 rounded-t-md transition-colors duration-300 ${
                    selectedTab === 1
                      ? "bg-slate-300 dark:bg-gray-600 text-black dark:text-white  dark:border-teal-600 border-teal-500"
                      : "bg-slate-200 dark:bg-slate-800 text-black dark:text-white border-transparent"
                  }`}
                  onClick={() => {
                    onSelect("services");
                    setSelectedTab(1);
                  }}
                >
                  Services
                </button>
              </>
            ) : null}
          </div>
          <div className="flex text-2xl font-medium text-gray-700 dark:text-slate-100 mr-[7vw]">
            {zauApp}
          </div>
          {/* Header: Right side */}
          <div className="flex items-center space-x-3">
            <div className="bg-gray-200 dark:bg-teal-800 px-3">
              {location.pathname === "/dashboard" ? (
                <>
                  <span style={{ display: "contents" }}>
                    <>
                      <span className="group relative ">
                        <span className="inline-block text-sm font-medium text-black dark:text-white">
                          <Apps />
                        </span>
                        <span className="inline-block text-md pr-1 text-gray-600 dark:text-white text-sm font-medium rounded-full">
                          {prop}
                        </span>
                        <div className="opacity-0 w-24 bg-black text-white text-center align-middle text-xs rounded-lg py-1 absolute z-10 group-hover:opacity-100 top-full left-1/2 transform -translate-x-1/2 mt-2 pointer-events-none">
                          {"All Apps"}
                          <div className="bg-black w-2.5 h-2.5 rotate-45 absolute top-[-0.625rem] left-1/2 transform -translate-x-1/2 translate-y-1/2"></div>
                        </div>
                      </span>

                      <span className="group relative ">
                        <span className="ml-2 inline-block text-sm font-medium text-gray-400">
                          <UpArrow />
                        </span>
                        <span className="inline-block text-md pr-1 text-[#54e052] text-sm font-medium rounded-full">
                          {Active}
                        </span>
                        <div className="opacity-0 w-24 bg-black text-white text-center align-middle text-xs rounded-lg py-1 absolute z-10 group-hover:opacity-100 top-full left-1/2 transform -translate-x-1/2 mt-2 pointer-events-none">
                          {"Active Apps"}
                          <div className="bg-black w-2.5 h-2.5 rotate-45 absolute top-[-0.625rem] left-1/2 transform -translate-x-1/2 translate-y-1/2"></div>
                        </div>
                      </span>

                      <span className="group relative ">
                        <span className="ml-2 inline-block text-sm font-medium text-gray-400">
                          <DownArrow />
                        </span>
                        <span className="mr-4 inline-block text-md pr-1  text-[#ee3333] text-sm font-medium rounded-full">
                          {Inactive}
                        </span>
                        <div className="opacity-0 w-24 bg-black text-white text-center align-middle text-xs rounded-lg py-1 absolute z-10 group-hover:opacity-100 top-full left-1/2 transform -translate-x-1/2 mt-2 pointer-events-none">
                          {"Inactive Apps"}
                          <div className="bg-black w-2.5 h-2.5 rotate-45 absolute top-[-0.625rem] left-1/2 transform -translate-x-1/2 translate-y-1/2"></div>
                        </div>
                      </span>
                    </>
                    <span className="">|</span>

                    <>
                      <span className="group relative ">
                        <span className="ml-4 inline-block text-sm font-medium text-black dark:text-white">
                          <Services />
                        </span>
                        <span className="inline-block text-md pr-1 text-gray-600 dark:text-white text-sm font-medium rounded-full">
                          {5}
                        </span>
                        <div className="opacity-0 w-24 bg-black text-white text-center align-middle text-xs rounded-lg py-1 absolute z-10 group-hover:opacity-100 top-full left-1/2 transform -translate-x-1/2 mt-2 pointer-events-none">
                          {"All Services"}
                          <div className="bg-black w-2.5 h-2.5 rotate-45 absolute top-[-0.625rem] left-1/2 transform -translate-x-1/2 translate-y-1/2"></div>
                        </div>
                      </span>

                      <span className="group relative ">
                        <span className="ml-2 inline-block text-sm font-medium text-gray-400">
                          <UpArrow />
                        </span>
                        <span className="inline-block text-md pr-1  text-[#54e052] text-sm font-medium rounded-full">
                          {5}
                        </span>
                        <div className="opacity-0 w-24 bg-black text-white text-center align-middle text-xs rounded-lg py-1 absolute z-10 group-hover:opacity-100 top-full left-1/2 transform -translate-x-1/2 mt-2 pointer-events-none">
                          {"Active Services"}
                          <div className="bg-black w-2.5 h-2.5 rotate-45 absolute top-[-0.625rem] left-1/2 transform -translate-x-1/2 translate-y-1/2"></div>
                        </div>
                      </span>

                      <span className="group relative ">
                        <span className="ml-2 inline-block text-sm font-medium text-gray-400">
                          <DownArrow />
                        </span>
                        <span className="inline-block text-md pr-1  text-[#ee3333] text-sm font-medium rounded-full">
                          {0}
                        </span>
                        <div className="opacity-0 w-24 bg-black text-white text-center align-middle text-xs rounded-lg py-1 absolute z-10 group-hover:opacity-100 top-full left-1/2 transform -translate-x-1/2 mt-2 pointer-events-none">
                          {"Inactive Services"}
                          <div className="bg-black w-2.5 h-2.5 rotate-45 absolute top-[-0.625rem] left-1/2 transform -translate-x-1/2 translate-y-1/2"></div>
                        </div>
                      </span>
                    </>
                  </span>
                </>
              ) : null}
            </div>
            <ThemeToggle />
            <hr className="w-px h-6 bg-slate-200 dark:bg-slate-700 border-none" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
