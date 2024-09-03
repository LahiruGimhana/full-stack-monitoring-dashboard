import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import DashboardCard from "../components/DashboardCard";
import apiClient from "../services/ApiService";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import { toast } from "react-toastify";

function Dashboard() {
  const [apps, setApps] = useState([]);
  const [liveApp, setLiveApp] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = sessionStorage.getItem("authToken");

    const fetchData = async () => {
      // try {
      if (authToken) {
        const data = await getApps("application/");
        setApps(data);
      } else {
        return <Login />;
      }
      // } catch (error) {
      //   console.log("error:", error);
      // }
    };

    fetchData();
  }, []);

  useEffect(() => {
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  const getApps = async (endpoint) => {
    try {
      const response = await apiClient.get(endpoint);
      if (response.data.length <= 0) {
        toast.success("Not available applications");
      }
      return response.data;
    } catch (error) {
      toast.error("retreived applications failed");
    }
  };

  const receiveDataFromChild = (data: object) => {
    setLiveApp((prevData) => ({
      ...prevData,
      ...data,
    }));
  };

  const [selectedPage, setSelectedPage] = useState(null);

  const handleSelect = (page) => {
    setSelectedPage(page);
  };

  return (
    <>
      <div
        className="flex  overflow-hidden  dark:bg-slate-700	"
        style={{ height: "100vh", minHeight: "720px" }}
      >
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Header
            prop={apps ? apps.length : ""}
            Active={
              Object.values(liveApp).filter((value) => value === true).length
            }
            Inactive={
              apps && apps.length
                ? apps.length -
                  Object.values(liveApp).filter((value) => value === true)
                    .length
                : 0
            }
            onSelect={handleSelect}
          />
          <div
            className=" rounded-2xl shadow-2xl  bg-blue-50  dark:bg-slate-800 mt-11"
            style={{ height: "100%" }}
          >
            {/* <p className="px-4 pt-1 w-full max-w-9xl mx-auto">
              <span className="inline-block p-1 pl-3 pr-3  bg-gray-500/10 text-gray-600 dark:text-gray-300 font-bold rounded-full">
                Applcations: [ {apps ? apps.length : ""} ]
              </span>
              <span className="ml-4 inline-block p-1 pl-3 pr-3 bg-emerald-200/60 dark:bg-emerald-900/60  text-emerald-500 font-bold rounded-full">
                Active: [{" "}
                {
                  Object.values(liveApp).filter((value) => value === true)
                    .length
                }{" "}
                ]
              </span>
              <span className="ml-4 inline-block p-1 pl-3 pr-3  bg-rose-500/10 text-red-700 font-bold rounded-full">
                Inactive: [{" "}
                {apps && apps.length
                  ? apps.length -
                    Object.values(liveApp).filter((value) => value === true)
                      .length
                  : 0}{" "}
                ]
              </span>
            </p> */}
            <main>
              <div className="pl-2 pr-4 py-1 w-full max-w-9xl mx-auto">
                {selectedPage === "services" ? (
                  <div className="grid gap-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <div className="max-w-md rounded overflow-hidden shadow-lg ">
                      <div className="px-6 py-4">
                        <div className="font-bold text-xl mb-2 text-center">
                          DB
                        </div>
                        <p className=" text-base">
                          Lorem ipsum dolor sit amet, consectetur adipisicing
                          elit. Voluptatibus quia, nulla! Maiores et perferendis
                          eaque, exercitationem praesentium nihil.
                        </p>
                      </div>
                    </div>
                    <div className="max-w-md rounded overflow-hidden shadow-lg">
                      <div className="px-6 py-4">
                        <div className="font-bold text-xl mb-2 text-center">
                          MQ
                        </div>
                        <p className=" text-base">
                          Lorem ipsum dolor sit amet, consectetur adipisicing
                          elit. Voluptatibus quia, nulla! Maiores et perferendis
                          eaque, exercitationem praesentium nihil.
                        </p>
                      </div>
                    </div>
                    <div className="max-w-md rounded overflow-hidden shadow-lg">
                      <div className="px-6 py-4">
                        <div className="font-bold text-xl mb-2 text-center">
                          ASR
                        </div>
                        <p className=" text-base">
                          Lorem ipsum dolor sit amet, consectetur adipisicing
                          elit. Voluptatibus quia, nulla! Maiores et perferendis
                          eaque, exercitationem praesentium nihil.
                        </p>
                      </div>
                    </div>
                    <div className="max-w-md rounded overflow-hidden shadow-lg">
                      <div className="px-6 py-4">
                        <div className="font-bold text-xl mb-2 text-center">
                          Summary Handler
                        </div>
                        <p className=" text-base">
                          Lorem ipsum dolor sit amet, consectetur adipisicing
                          elit. Voluptatibus quia, nulla! Maiores et perferendis
                          eaque, exercitationem praesentium nihil.
                        </p>
                      </div>
                    </div>
                    <div className="max-w-md rounded overflow-hidden shadow-lg">
                      <div className="px-6 py-4">
                        <div className="font-bold text-xl mb-2 text-center">
                          Call Handler
                        </div>
                        <p className=" text-base">
                          Lorem ipsum dolor sit amet, consectetur adipisicing
                          elit. Voluptatibus quia, nulla! Maiores et perferendis
                          eaque, exercitationem praesentium nihil.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {apps && apps?.length > 0 ? (
                      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {/* {Array(20)
                          .fill()
                          .map((_, index) =>
                            apps?.map(
                              (element) =>
                                element.aid &&
                                element.enable === 1 && (
                                  <DashboardCard
                                    key={`${element.aid}-${index}`} // Ensure unique keys
                                    appData={element}
                                    sendDataToParent={receiveDataFromChild}
                                  />
                                )
                            )
                          )} */}
                        {apps?.map(
                          (element) =>
                            element.aid &&
                            element.enable === 1 && (
                              <DashboardCard
                                key={element.aid}
                                appData={element}
                                sendDataToParent={receiveDataFromChild}
                              />
                            )
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center overflow-hidden">
                        <div className="h-1/2 overflow-hidden">
                          <p>No Apps found</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
