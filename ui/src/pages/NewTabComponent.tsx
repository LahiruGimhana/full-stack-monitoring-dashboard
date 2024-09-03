/* eslint-disable @typescript-eslint/no-unused-vars */
import Header from "../components/Header";
import { OnlineIcon, OfflineIcon, CloseIcon } from "../assets/icons";

import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Icon from "../assets/logo.png";
import apiClient from "../services/ApiService";
import Tabpane from "../components/Tabpane";
import moment from "moment";

const NewTabComponent = () => {
  const now: Moment = moment();
  const [data, setData] = useState({});
  const [appStatusData, setAppStatusData] = useState({});
  const [appInfoData, setAppInfoData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = () => {
    setIsModalOpen(false);
  };

  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      const jsonData = sessionStorage.getItem("appData");

      if (jsonData === null) {
        try {
          const appData = await getAppData(`application/${id}`);
          setData(appData);
        } catch (error) {
          console.error("Error fetching app data:", error);
        }
      } else if (typeof jsonData === "string" && jsonData.trim() !== "") {
        setData(JSON.parse(jsonData));
      } else {
        window.addEventListener("message", (event) => {
          if (event.source && event.data) {
            const receivedData = event.data;
            // Access the data using receivedData.type and receivedData.payload
            if (receivedData.type === "DATA") {
              setData(receivedData.payload);
              // console.log(receivedData.payload);
              alert.log(receivedData.payload);

              sessionStorage.setItem(
                "appData",
                JSON.stringify(receivedData.payload)
              );
            }
          }
        });
      }
    };
    // return () => {
    //   window.removeEventListener("message", handleMessage);
    // };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.storageArea === sessionStorage) {
        // Check if the required value is not present in session storage
        if (!sessionStorage.getItem("authToken")) {
          // Perform your action here when the session value is not present
          // For example, close the browser tab
          window.close();
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStorage.getItem("authToken")]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (data?.ip && data?.rest_port && id) {
          const statusData = await fetchAppUnitData(`app/${id}/status`);
          statusData ? setAppStatusData(statusData) : setAppStatusData({});
          const infoData = await fetchAppUnitData(`app/${id}/info`);
          infoData ? setAppInfoData(infoData) : setAppInfoData({});
        }
      } catch (error) {
        console.log("error:", error);
      }
    };

    fetchData();
    // const intervalId = setInterval(fetchData, 3 * 60000); //  every 3 minute
    const intervalId = setInterval(fetchData, 30000); //  every 3 minute

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, id]);

  const formatTimeShort = (upTime) => {
    const duration = moment.duration(parseInt(upTime, 10), "seconds");

    return `${Math.floor(
      duration.asDays()
    )}D : ${duration.hours()}H : ${duration.minutes()}M : ${duration.seconds()}S`;
  };

  const fetchAppUnitData = async (endpoint) => {
    try {
      const response = await apiClient.post(endpoint, {
        ip: data.ip,
        rest_port: data.rest_port,
      });
      return response.data;
    } catch (error) {
      console.log("error");
      toast.error("retreived AppUnit failed");
    }
  };

  const getAppData = async (endpoint) => {
    try {
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      toast.error("retreived applications failed");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const confSave = async (endpoint, body) => {
    try {
      const response = await apiClient.post(endpoint, body);
      return response.data;
    } catch (error) {
      console.log("error");
      toast.error("retreived applications failed");
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const confReload = async (endpoint, body) => {
    try {
      const response = await apiClient.post(endpoint, body);
      return response.data;
    } catch (error) {
      console.log("error");
    }
  };

  const handleCloseAndMoveBack = () => {
    window.close();
    window.location.href = "/dashboard";
  };

  const updateStatusDataFromChild = (data: string) => {
    setAppStatusData(JSON.parse(data));
  };

  const updateWSStatus: (data: boolean) => void = (data: boolean) => {
    setAppInfoData((prevState: object) => ({
      ...prevState,
      WSMonitor_Started: data,
    }));

    sendDataToParentTab({ [id]: data });
  };

  // Send data to the parent tab
  const sendDataToParentTab = (data) => {
    if (window.opener) {
      window.opener.postMessage(data, "*");
    } else {
      console.warn("No opener window found.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-800">
      <Header
        prop={
          appInfoData && Object.keys(appInfoData).length > 0
            ? appInfoData.Name
            : ""
        }
        zauApp={data.name}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-3 xl:grid-cols-12 2xl:gap-7.52 ml-4 mr-4 rounded-xl mt-1 pt-11">
        <div className=" flex flex-col col-span-full sm:col-span-6 md-custom:col-span-6 md:col-span-6 lg-custom:col-span-6 lg:col-span-6 xl:col-span-6 bg-white bg-opacity-90 shadow-md  border border-slate-200 dark:border-slate-600 dark:bg-slate-700 rounded-md">
          <div className="block rounded-lg dark:bg-slate-700  shadow-secondary-1">
            <div className="text-surface dark:text-white">
              <div className="grid grid-cols-12 gap-2  bg-slate-200 rounded-t-md dark:bg-slate-800">
                <div className="text-center  col-span-2 ">
                  <img
                    src={Icon}
                    style={{
                      filter: "invert(100%)",
                      marginLeft: ".7vw",
                      marginTop: "5px",
                    }}
                    width="30"
                    height="30"
                    alt="Icon 01"
                  />
                  <h2
                    className="text-lg font-medium text-gray-600 dark:text-slate-100 flex justify-center pl-1 pr-1"
                    style={{ marginLeft: ".2vw" }}
                  ></h2>
                </div>

                <div className="dark:bg-slate-800 pl-1 pr-1 pt-0 col-span-8 bg-slate-200 ">
                  <h2 className="text-2xl font-medium text-gray-700 dark:text-slate-100  flex justify-center text-center">
                    HEALTH
                  </h2>
                </div>
              </div>

              <div
                className="p-8 pb-0 pt-0 dark:bg-slate-700  border-t border-t-gray-100 dark:border-t-gray-700"
                style={{ minHeight: "23vh" }}
              >
                {appInfoData && Object.keys(appInfoData).length > 0 ? (
                  <div className="">
                    <h2 className="text-md font-medium text-gray-400 dark:text-slate-100 flex justify-between">
                      <span>Name</span>
                      <span>{appInfoData.Name}</span>
                    </h2>
                    <h2 className="text-md font-medium text-gray-400 dark:text-slate-100 flex justify-between">
                      <span>Started Date</span>
                      <span>{appInfoData.Started}</span>
                    </h2>
                    <h2 className="text-md font-medium text-gray-400 dark:text-slate-100 flex justify-between">
                      <span>Up Time</span>
                      <span>{formatTimeShort(appInfoData.UpTime)}</span>
                    </h2>
                    <h2 className="text-sm font-medium text-gray-400 dark:text-slate-100 flex justify-between">
                      <span>PID</span>
                      <span>{appInfoData.PID}</span>
                    </h2>
                    <h2 className="text-md font-medium text-gray-400 dark:text-slate-100 flex justify-between">
                      <span>Version </span>
                      <span>{appInfoData.Version}</span>
                    </h2>
                    <h2 className="text-md font-medium text-gray-400 dark:text-slate-100 flex justify-between">
                      <span>HTTP Monitor Status</span>
                      <span className={` w-4 h-4  cursor-pointer `}>
                        {appInfoData.HTTPMonitor_Started ? (
                          <OnlineIcon />
                        ) : (
                          <OfflineIcon />
                        )}
                      </span>
                    </h2>
                    <h2 className="text-md font-medium text-gray-400 dark:text-slate-100 flex justify-between">
                      <span>Real Time Monitor Status </span>
                      <span className={` w-4 h-4  cursor-pointer `}>
                        {appInfoData.WSMonitor_Started ? (
                          <OnlineIcon />
                        ) : (
                          <OfflineIcon />
                        )}
                      </span>
                    </h2>
                    <h2 className="text-md font-medium text-gray-400 dark:text-slate-100 flex justify-between">
                      <span>AppUnits </span>
                      <span>
                        {appInfoData?.AppUnits?.length ||
                        appInfoData?.AppUnits?.length === 0
                          ? appInfoData?.AppUnits?.length
                          : "Nan"}
                      </span>
                    </h2>
                    <button
                      className="px-4 py-0 mt-1 mb-1 text-gray-500 dark:text-white font-bold  bg-gray-300 dark:bg-gray-500 rounded hover:bg-slate-300 focus:outline-none focus:bg-gray-300"
                      onClick={showModal}
                    >
                      <div className="group cursor-pointer relative flex ">
                        {isModalOpen ? "App Units -" : "App Units +"}
                        <div className="opacity-0 w-32 bg-black text-white text-center align-middle text-xs rounded-lg py-1 absolute z-10 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none">
                          View all App Units
                          <div className="bg-black w-2.5 h-2.5 rotate-45 absolute bottom-[-0.625rem] left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                        </div>
                      </div>
                    </button>
                    {isModalOpen && (
                      <Modal
                        isOpen={isModalOpen}
                        onCancel={closeModal}
                        onSave={handleSave}
                      >
                        <div
                          className="absolute right-3 cursor-pointer -mt-2 -mr-2 dark:bg-slate-800 dark:text-white"
                          onClick={() => closeModal()}
                        >
                          <CloseIcon />
                        </div>

                        <p className="flex-grow text-center text-2xl bg-gray-300 m-2 dark:bg-slate-700 dark:text-white">
                          APP UNIT INFO
                        </p>

                        {appInfoData.AppUnits.map((element, index) => (
                          <div className="mb-2" key={index}>
                            <p className="text-gray-800  dark:text-white ">
                              Name : {element.Info.Name}
                            </p>
                            <p className="text-gray-800  dark:text-white">
                              Version : {element.Info.Version}
                            </p>
                            <p className="text-gray-800  dark:text-white">
                              Req_Failed : {element.Req_Failed}
                            </p>
                            <p className="text-gray-800  dark:text-white">
                              Req_Handled : {element.Req_Handled}
                            </p>
                            <p className="text-gray-800  dark:text-white">
                              Routines : {element.Routines}
                            </p>
                            <hr />
                            <hr />
                          </div>
                        ))}
                      </Modal>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center mt-14">
                    <span className="dark:text-black">No Data found</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className=" flex flex-col col-span-full sm:col-span-6 md-custom:col-span-6 md:col-span-6 lg-custom:col-span-6 lg:col-span-6 xl:col-span-6 bg-white bg-opacity-90 shadow-md  border border-slate-200 dark:border-slate-700 dark:bg-slate-700 rounded-md">
          <div className="block rounded-lg dark:bg-slate-700  shadow-secondary-1">
            <div className="text-surface dark:text-white ">
              <div className="grid grid-cols-12 gap-2  bg-slate-200 rounded-t-md dark:bg-slate-800">
                <div className="text-center  col-span-2">
                  <img
                    src={Icon}
                    style={{
                      filter: "invert(100%)",
                      marginLeft: ".7vw",
                      marginTop: "5px",
                    }}
                    width="30"
                    height="30"
                    alt="Icon 01"
                  />
                  <h2
                    className="text-lg font-medium text-gray-600 dark:text-slate-100 flex justify-center pl-1 pr-1"
                    style={{ marginLeft: ".2vw" }}
                  ></h2>
                </div>

                <div className="dark:bg-slate-800 pl-1 pr-1 pt-0 col-span-8 bg-slate-200">
                  <h2 className="text-2xl font-medium text-gray-700 dark:text-slate-100  flex justify-center text-center">
                    STATUS
                  </h2>
                </div>
              </div>

              <div
                className="p-8 pb-0 pt-0 dark:bg-slate-700  border-t border-t-gray-100 dark:border-t-gray-700"
                // style={{ minHeight: "23vh" }}
              >
                {appStatusData && Object.keys(appStatusData).length > 0 ? (
                  <div className="">
                    <h2 className="text-md font-medium text-gray-400 dark:text-slate-100 flex justify-between">
                      <span>Handled Request </span>
                      <span>
                        {appStatusData.Req_Handled ||
                        appStatusData.Req_Handled === 0
                          ? appStatusData.Req_Handled
                          : "Nan"}
                      </span>
                    </h2>
                    <h2 className="text-md font-medium text-gray-400 dark:text-slate-100 flex justify-between">
                      <span>Failed Request </span>
                      <span>
                        {appStatusData.Req_Failed ||
                        appStatusData.Req_Failed === 0
                          ? appStatusData.Req_Failed
                          : "Nan"}
                      </span>
                    </h2>
                    <h2 className="text-md font-medium text-gray-400 dark:text-slate-100 flex justify-between">
                      <span>Routines </span>
                      <span>
                        {appStatusData.Routines || appStatusData.Routines === 0
                          ? appStatusData.Routines
                          : "Nan"}
                      </span>
                    </h2>
                    <h2 className="text-md font-medium text-gray-400 dark:text-slate-100 flex justify-between">
                      <span>Monitor Clients </span>
                      <span>
                        {appStatusData.MonitorClients ||
                        appStatusData.MonitorClients === 0
                          ? appStatusData.MonitorClients
                          : "Nan"}
                      </span>
                    </h2>
                    <h2 className="text-md font-medium text-gray-400 dark:text-slate-100 flex justify-between">
                      <span>Status Clients</span>
                      <span>
                        {appStatusData.StatusClients ||
                        appStatusData.StatusClients === 0
                          ? appStatusData.StatusClients
                          : "Nan"}
                      </span>
                    </h2>
                    <h2 className="text-md font-medium text-gray-400 dark:text-slate-100 flex justify-between">
                      <span>Memory Usage</span>
                      <span>
                        {appStatusData.Mem_Usage ||
                        appStatusData.Mem_Usage === 0
                          ? appStatusData.Mem_Usage
                          : "Nan"}
                      </span>
                    </h2>
                    <h2 className="text-md font-medium text-gray-400 dark:text-slate-100 flex justify-between">
                      <span>Total Routines </span>
                      <span>
                        {appStatusData.TotRoutines ||
                        appStatusData.TotRoutines === 0
                          ? appStatusData.TotRoutines
                          : "Nan"}
                      </span>
                    </h2>
                    <h2 className="text-md font-medium text-gray-400 dark:text-slate-100 flex justify-between">
                      <span>Active </span>
                      <span>
                        {appStatusData.Active || appStatusData.Active === 0
                          ? appStatusData.Active
                          : "Nan"}
                      </span>
                    </h2>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center mt-14">
                    <span className="dark:text-black">No Data found</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabpane
        appData={data}
        appId={id}
        wsState={appInfoData?.WSMonitor_Started}
        updateStatusData={updateStatusDataFromChild}
        updateWSStatus={updateWSStatus}
      />
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Modal = ({ isOpen, onCancel, onSave, children }) => {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto">
          <div
            className="fixed inset-0 bg-black opacity-50"
            onClick={onCancel}
          ></div>
          <div
            className={`relative z-50 w-full max-w-md top-0 left-0 mx-auto my-6 block dark:bg-slate-800 dark:text-white`}
          >
            <div
              className="relative bg-white rounded-lg shadow-md overflow-auto dark:bg-slate-800 dark:text-white"
              style={{ maxHeight: "80vh" }}
            >
              <div className="pl-6 pr-6 py-3 ">{children}</div>
              <div className="flex items-center justify-end px-6 py-2 rounded-b-lg">
                <button
                  className="px-4  text-gray-600 text-lg font-medium bg-gray-300 rounded hover:bg-gray-500 "
                  onClick={onCancel}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default NewTabComponent;
