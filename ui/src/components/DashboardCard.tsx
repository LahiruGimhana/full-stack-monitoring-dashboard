/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
// import LineChart from "../../charts/LineChart01";
import Icon from "../assets/logo.png";

// Import utilities
import AppModal from "../components/AppModal";
import { useEffect, useState, useRef } from "react";
import Tooltips from "../components/Tooltips";
import apiClient from "../services/ApiService";
import { DataProvider } from "../components/DataContext";
import NewTabComponent from "../pages/NewTabComponent";
import { Link } from "react-router-dom";
// import NewTab from "../backup/NewTab";
import { useNavigate } from "react-router-dom";
import { ReloadIcon, SmallReloadIcon } from "../assets/icons";
import { toast } from "react-toastify";
import {
  ConfIcon,
  EyeIcon,
  Offline,
  Live,
  OnlineIcon,
  OfflineIcon,
} from "../assets/icons";
import { useUser } from "../context/UserContext";
import moment from "moment";
import appConfig from "../config/config";

interface AppData {
  aid: number;
  name: string;
  ip: string;
  rest_port: number;
  ws_port: number;
  conf_id: number;
  desc: string;
}

interface DashboardCardProps {
  // appData: AppData[];
  appData: AppData;
  sendDataToParent: object;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  appData,
  sendDataToParent,
}) => {
  const { userType } = useUser();
  const [modalData, setModalData] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [appStatusData, setAppStatusData] = useState({});
  const [appInfoData, setAppInfoData] = useState({});
  const [appLiveData, setAppLiveData] = useState(false);
  const [openNewTab, setOpenNewTab] = useState(false);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [retryEnabled, setRetryEnabled] = useState(false);
  const intervalRef = useRef(null);
  const retryCountRef = useRef(0);
  const now: Moment = moment();

  const maxRetries = appConfig.maxRetries;

  const fetchData = async (status) => {
    try {
      if (appData.aid) {
        const infoData = await getAppInfo(`app/${appData.aid}/info`, {
          ip: appData.ip,
          rest_port: appData.rest_port,
        });

        if (infoData !== undefined && Object.keys(infoData).length > 0) {
          if (retryEnabled || status === "Retry" || status === "Refresh") {
            toast.success(`${appData.name} data received successfully`);
          }

          let totalReqHandled = 0;
          let totalReqFailed = 0;
          let totalRoutines = 0;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          infoData?.AppUnits.forEach((unit: any) => {
            totalReqHandled += unit.Req_Handled;
            totalReqFailed += unit.Req_Failed;
            totalRoutines += unit.Routines;
          });

          // Update the info object with calculated totals
          const updatedInfo = { ...infoData };
          updatedInfo.Req_Handled = totalReqHandled;
          updatedInfo.Req_Failed = totalReqFailed;
          updatedInfo.Routines = totalRoutines;
          updatedInfo.UpTime = formatTimeShort(updatedInfo.UpTime);
          delete updatedInfo.AppUnits;
          setAppInfoData(updatedInfo);

          setAppLiveData(true);
          sendDataToParent({
            [appData.aid]: true,
          });
          retryCountRef.current = 0; // Reset the retry counter on success
          clearInterval(intervalRef.current);
          intervalRef.current = setInterval(() => fetchData(""), 1 * 60000); // Resume normal interval
        } else {
          setAppInfoData({});
          if (retryCountRef.current < maxRetries) {
            setTimeout(() => fetchData(status), 1000); // Retry after 1 seconds
            retryCountRef.current += 1;
          } else {
            clearInterval(intervalRef.current); // Stop further attempts after 3 retries
            setAppLiveData(false);
            sendDataToParent({
              [appData.aid]: false,
            });
            if (status === "Retry") {
              toast.error(
                `Retry fetching ${appData.name} application data ${
                  retryCountRef.current + 1
                } attempt failed`
              );
            }
            setRetryEnabled(false);
          }
        }
      }
    } catch (error) {
      toast.error(`Retrieve fetching ${appData.name} application data error`);
    }
  };

  const handleRetry = () => {
    toast.info(`Retrying to fetching ${appData.name} application data`);

    retryCountRef.current = 0; // Reset the retry counter
    setRetryEnabled(true); // Disable retry button
    fetchData("Retry"); // Restart the fetch process
  };

  useEffect(() => {
    fetchData("initial"); // Initial fetch

    intervalRef.current = setInterval(() => {
      fetchData("test");
    }, 1 * 60000); // Normal interval

    return () => clearInterval(intervalRef.current);
  }, [appData]);

  const formatTimeShort = (upTime) => {
    const duration = moment.duration(parseInt(upTime, 10), "seconds");

    return `${Math.floor(
      duration.asDays()
    )}D : ${duration.hours()}H : ${duration.minutes()}M : ${duration.seconds()}S`;
  };

  const getAppInfo = async (endpoint, body) => {
    try {
      const response = await apiClient.post(endpoint, body);
      return response.data;
    } catch (error) {
      // console.log("error");
    }
  };

  const getAppLive = async (endpoint, body) => {
    try {
      const response = await apiClient.post(endpoint, body);
      return response.data;
    } catch (error) {
      // console.log("error");
    }
  };

  const handleModalOpen = (appData: AppData) => {
    setOpenModal(true);
    setModalData({
      title: "App Details",
      message:
        "Are you sure you want to deactivate your account? All of your data will be permanently removed. This action cannot be undone.",
    });
  };

  const handleModalClose = () => {
    setOpenModal(false);
  };

  const handleViewClick = () => {
    const data = {
      ip: appData.ip,
      rest_port: appData.rest_port,
      ws_port: appData.ws_port,
    };

    const newTab = window.open(`/dashboard/app/${appData.aid}`, "_blank");

    if (newTab) {
      newTab.addEventListener("load", () => {
        // console.log("Sending data:", { type: "DATA", payload: data }); // Log sent data
        newTab.postMessage(
          { type: "DATA", payload: data },
          window.location.origin
        );
      });
    }
  };

  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin) {
      return;
    }

    const [key, value] = Object.entries(event.data)[0];
    if (String(appData.aid) === key && appInfoData.WSMonitor_Started != value) {
      setAppInfoData((prevState: object) => ({
        ...prevState,
        WSMonitor_Started: value,
      }));
    }
  });

  return (
    <>
      <div className="transition duration-300  transform hover:translate-y-2 hover:shadow-2xl rounded-lg  bg-opacity-90 bg-white shadow-lg  border border-slate-200 dark:border-slate-700 dark:bg-slate-700 ">
        <div className="block rounded-lg dark:bg-slate-700  shadow-secondary-1">
          <div className="text-surface dark:text-white ">
            <div
              className="grid grid-cols-12 gap-2"
              style={{ minHeight: "6vh" }}
            >
              <div className="text-center  col-span-2">
                <img
                  src={Icon}
                  style={{
                    filter: "invert(100%)",
                    marginLeft: ".7vw",
                    marginTop: "10px",
                  }}
                  width="30"
                  height="30"
                  alt="Icon 01"
                />
              </div>
              <div className="dark:bg-slate-700 pl-1 pr-1 pt-1 col-span-9">
                <h2 className="text-sm font-medium text-gray-500  dark:text-slate-100 flex justify-center text-center">
                  {/* {appInfoData.Name} */}
                  {appData.name}
                </h2>
                <h2 className="text-sm font-medium text-gray-400 dark:text-slate-100 flex justify-center">
                  {appData.ip}
                </h2>
                <span className="text-sm font-medium text-gray-400 dark:text-slate-100 flex justify-center">
                  <small className="text-xm font-small">
                    {appInfoData.Version}
                  </small>
                </span>
              </div>

              <div className="flex justify-end display-end col-span-1">
                <div
                  className={`absolute mr-2 ml-3 transform -translate-x-1 translate-y-1/2`}
                >
                  <div className="group relative ">
                    {appLiveData ? <Offline /> : <Live />}
                    <div className="opacity-0 w-24 bg-black text-white text-center align-middle text-xs rounded-lg py-1 absolute z-10 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none">
                      {appLiveData ? "Connected" : "Disconnected"}
                      <div className="bg-black w-2.5 h-2.5 rotate-45 absolute bottom-[-0.625rem] left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="p-3 pb-0 pt-0 dark:bg-slate-700 border-t border-t-gray-100"
              style={{ minHeight: "15vh" }}
            >
              {appInfoData != undefined &&
              Object.keys(appInfoData).length > 0 ? (
                <div className="">
                  <h2 className="text-sm font-medium text-gray-400 dark:text-slate-100 flex justify-between">
                    <span>RT Monitor</span>
                    <span className={` w-4 h-4   `}>
                      <div className="group relative ">
                        {appInfoData.WSMonitor_Started ? (
                          <OnlineIcon />
                        ) : (
                          <OfflineIcon />
                        )}
                        <div className="opacity-0 w-14 bg-black text-white text-center align-middle text-xs rounded-lg py-1 absolute z-10 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none">
                          {appInfoData.WSMonitor_Started
                            ? "Active"
                            : "Inactive"}
                          <div className="bg-black w-2.5 h-2.5 rotate-45 absolute bottom-[-0.625rem] left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                        </div>
                      </div>
                    </span>
                  </h2>
                  <h2 className="text-sm font-medium text-gray-400 dark:text-slate-100 flex justify-between">
                    <span>HTTP Monitor</span>
                    <span className={` w-4 h-4   `}>
                      <div className="group relative ">
                        {appInfoData.HTTPMonitor_Started ? (
                          <OnlineIcon />
                        ) : (
                          <OfflineIcon />
                        )}
                        <div className="opacity-0 w-14 bg-black text-white text-center align-middle text-xs rounded-lg py-1 absolute z-10 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none">
                          {appInfoData.HTTPMonitor_Started
                            ? "Active"
                            : "Inactive"}
                          <div className="bg-black w-2.5 h-2.5 rotate-45 absolute bottom-[-0.625rem] left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                        </div>
                      </div>
                    </span>
                  </h2>
                  <h2 className="text-sm font-medium text-gray-400 dark:text-slate-100 flex justify-between">
                    <span>Start Time</span>
                    <span>{appInfoData.Started}</span>
                  </h2>
                  <h2 className="text-sm font-medium text-gray-400 dark:text-slate-100 flex justify-between">
                    <span>Up Time</span>
                    <span>{appInfoData.UpTime}</span>
                  </h2>
                  <h2 className="text-sm font-medium text-gray-400 dark:text-slate-100 flex justify-between">
                    <span>Handled Request</span>
                    <span>{appInfoData.Req_Handled}</span>
                  </h2>
                  <h2 className="text-sm font-medium text-gray-400 dark:text-slate-100 flex justify-between">
                    <span>Failed Request</span>
                    <span>{appInfoData.Req_Failed}</span>
                  </h2>
                  <h2 className="text-sm font-medium text-gray-400 dark:text-slate-100 flex justify-between">
                    <span>Routines</span>
                    <span>{appInfoData.Routines}</span>
                  </h2>
                </div>
              ) : (
                <>
                  <span className="flex text-sm font-medium text-gray-400 hover:text-gray-500 hover:scale-105 justify-center textAlign-center pt-12 ">
                    {retryEnabled ? (
                      <ReloadIcon animate="animate-spin" />
                    ) : (
                      <div className="group  relative flex ">
                        <span
                          className="cursor-pointer "
                          onClick={handleRetry}
                          disabled={retryEnabled}
                        >
                          <ReloadIcon animate="animate-none" />
                          <div className="opacity-0 w-28 bg-black text-white text-center align-middle text-xs rounded-lg py-1 absolute z-10 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none">
                            Reload
                            <div className="bg-black w-2.5 h-2.5 rotate-45 absolute bottom-[-0.625rem] left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                          </div>
                        </span>
                      </div>
                    )}
                  </span>
                  <span className="flex text-sm font-medium text-gray-400 justify-center textAlign-center pt-3">
                    No Data Found
                  </span>
                </>
              )}
            </div>
          </div>
          <>
            <div className="flex justify-center items-center space-x-4">
              {appInfoData != undefined &&
                Object.keys(appInfoData).length > 0 && (
                  <div
                    data-tip="Monitor"
                    className="flex items-center ml-2 mr-2 mb-1 cursor-pointer text-gray-400 hover:text-gray-500 "
                    onClick={handleViewClick}
                  >
                    <div className="group cursor-pointer relative flex ">
                      <EyeIcon />
                      <span className="ml-1 font-medium">View</span>
                      <div className="opacity-0 w-28 bg-black text-white text-center text-xs rounded-lg py-1 absolute z-10 group-hover:opacity-100 bottom-full pointer-events-none">
                        View {appData.name} more info
                        <div className="bg-black w-2.5 h-2.5 rotate-45 absolute bottom-[-0.625rem] left-1/4 transform -translate-x-1/2 -translate-y-1/2"></div>
                      </div>
                    </div>
                  </div>
                )}
              {(userType === 0 || userType === 1) && (
                <div
                  data-tip="Configuration"
                  className="flex items-center ml-2 mr-2 mb-1 cursor-pointer text-gray-400 hover:text-gray-500 "
                  onClick={() => navigate("/application")}
                >
                  <div className="group cursor-pointer relative flex ">
                    <ConfIcon />
                    <span className="ml-1 font-medium ">Config</span>
                    <div className="opacity-0 w-28 bg-black text-white text-center text-xs rounded-lg py-1 absolute z-10 group-hover:opacity-100 bottom-full pointer-events-none">
                      Configure {appData.name}
                      <div className="bg-black w-2.5 h-2.5 rotate-45 absolute bottom-[-0.625rem] left-1/4 transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                  </div>
                </div>
              )}
              {appInfoData != undefined &&
                Object.keys(appInfoData).length > 0 && (
                  <div
                    data-tip="Configuration"
                    className="flex items-center ml-2 mr-2 mb-1 cursor-pointer text-gray-400 hover:text-gray-500 "
                    onClick={() => {
                      toast.info(`Refresh ${appData.name} application`);
                      fetchData("Refresh");
                    }}
                  >
                    <div className="group cursor-pointer relative flex ">
                      <SmallReloadIcon />
                      <span className="ml-1 font-medium ">Refresh</span>
                      <div className="opacity-0 w-28 bg-black text-white text-center text-xs rounded-lg py-1 absolute z-10 group-hover:opacity-100 bottom-full pointer-events-none">
                        Refresh {appData.name} Data
                        <div className="bg-black w-2.5 h-2.5 rotate-45 absolute bottom-[-0.625rem] left-1/4 transform -translate-x-1/2 -translate-y-1/2"></div>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </>
        </div>
      </div>
    </>
  );
};

export default DashboardCard;
