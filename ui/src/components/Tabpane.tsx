import { useEffect, useState } from "react";
import apiClient from "../services/ApiService";
// import { ConfModal } from "./AppModal";
// import Alert from "./Alert";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Notification from "./Notification";
// import WsStatus from "./WsStatus";
import "../styles.css";
import moment from "moment";
import { toast } from "react-toastify";
import { useMutation } from "react-query";
import ColorPicker from "./ColorPicker";

interface TabpaneProps {
  appData: [];
  appId: number;
  WsState: boolean | string | null | undefined;
  updateStatusData: string;
  updateWSStatus: boolean;
}

const Tabpane: React.FC<TabpaneProps> = ({
  appData,
  appId,
  wsState,
  updateStatusData,
  updateWSStatus,
}) => {
  const [activeTab, setActiveTab] = useState(1);
  const [isWebSocketActive, setIsWebSocketActive] = useState(false);
  const [outputLogs, setoutputLogs] = useState<string[]>([]);
  const [outputStatus, setoutputStatus] = useState<string[]>([]);
  const [outputActivity, setoutputActivity] = useState<string[]>([]);
  const [wsLogs, setWsLogs] = useState<WebSocket | null>(null);
  const [wsStatus, setwsStatus] = useState<WebSocket | null>(null);
  const [wsActivity, setwsActivity] = useState<WebSocket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#222223");

  useEffect(() => {
    if (wsState != null || wsState != undefined) {
      setIsWebSocketActive(wsState);
      updateWSStatus(wsState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsState]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const showModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = () => {
    setIsModalOpen(false);
  };

  const startWSMonitor = useMutation(
    async () => {
      if (appData.ip === undefined) {
        const jsonData = sessionStorage.getItem("appData");
        appData = JSON.parse(jsonData);
      }
      const result = await apiClient.post(`app/${appId}/WSMonitor-start`, {
        ip: appData.ip,
        rest_port: appData.rest_port,
      });
      return result;
    },
    {
      onSuccess: (result) => {
        if (result) {
          toast.success(`Real-time Monitoring started successfully`);
          setIsWebSocketActive(true);
          updateWSStatus(true);
        } else {
          toast.error(`Real-time Monitoring start failed`);
        }
      },
      onError: () => {
        toast.error(`Real-time Monitoring start failed`);
      },
    }
  );

  const stopWSMonitor = useMutation(
    async () => {
      if (appData.ip === undefined) {
        const jsonData = sessionStorage.getItem("appData");
        appData = JSON.parse(jsonData);
      }
      const result = await apiClient.post(`app/${appId}/WSMonitor-stop`, {
        ip: appData.ip,
        rest_port: appData.rest_port,
      });
      return result;
    },
    {
      onSuccess: (result) => {
        if (result) {
          toast.success(`Real-time Monitoring stopped successfully`);
          setIsWebSocketActive(false);
          updateWSStatus(false);
          setWsLogs(false);
          setwsStatus(false);
          setwsActivity(false);
        } else {
          toast.error(`Real-time Monitoring stop failed`);
        }
      },
      onError: () => {
        toast.error(`Real-time Monitoring stop failed`);
      },
    }
  );

  const handleButtonClick = () => {
    if (isWebSocketActive) {
      stopWSMonitor.mutate();
    } else {
      startWSMonitor.mutate();
    }
  };

  const isLoading = startWSMonitor.isLoading || stopWSMonitor.isLoading;
  const handleStatusToggle = () => {
    if (isWebSocketActive && !wsStatus) {
      const newWs = new WebSocket(
        `ws://${appData.ip}:${appData.ws_port}/app/status`
      );

      newWs.onopen = () => {
        toast.success(`Real-time Status Monitoring started successfully`);

        // print("OPEN");
        // setoutputStatus((prevOutput) => ["OPEN: " + evt.data, ...prevOutput]);
      };
      newWs.onclose = () => {
        toast.success(`Real-time Status Monitoring stopted successfully`);

        // print("CLOSE");
        // setoutputStatus((prevOutput) => ["CLOSE: " + evt.data, ...prevOutput]);
        setwsStatus(null);
      };
      newWs.onmessage = (evt) => {
        // print("RESPONSE: " + evt.data);
        const now: Moment = moment();
        setoutputStatus(
          (prevOutput) =>
            [
              `${now.format("YYYY-MM-DD HH:mm:ss")} - ` +
                evt.data.slice(1, -1).replace(/"/g, " ").replace(/:/g, " : "),
              ...prevOutput,
            ] as never[]
        );
        updateStatusData(evt.data);
      };
      newWs.onerror = (evt) => {
        // print("ERROR: " + evt.data);
        toast.error(`Real-time Status Monitoring failed`);
        setoutputStatus((prevOutput: string[]) => [
          "ERROR: " + evt.data,
          ...prevOutput,
        ]);
      };
      setwsStatus(newWs);
    } else if (!isWebSocketActive && !wsActivity) {
      toast.info(`start Real-time monitoring first`);
    } else {
      if (wsStatus !== null) {
        wsStatus.close();
      }
      setoutputStatus((prevOutput) => [
        "REAL TIME MONITORING CLOSED: - Real-time status Monitoring stopped!",
        ...prevOutput,
      ]);
      setwsStatus(null);
    }
  };

  const handleActivityToggle = () => {
    if (isWebSocketActive && !wsActivity) {
      const newWs = new WebSocket(
        `ws://${appData.ip}:${appData.ws_port}/app/monitor`
      );
      newWs.onopen = () => {
        toast.success(`Real-time Activity Monitoring started successfully`);
        // print("OPEN");
        // setoutputActivity((prevOutput: string[]) => [...prevOutput, "OPEN"]);
      };
      newWs.onclose = () => {
        toast.success(`Real-time Activity Monitoring stopted successfully`);
        // print("CLOSE");
        // setoutputActivity((prevOutput: string[]) => [...prevOutput, "CLOSE"]);
        setwsActivity(null);
      };
      newWs.onmessage = (evt) => {
        // print("RESPONSE: " + evt.data);
        const now: Moment = moment();
        setoutputActivity(
          (prevOutput) =>
            [
              `${now.format("YYYY-MM-DD HH:mm:ss")} - ` +
                evt.data.slice(1, -1).replace(/"/g, " ").replace(/:/g, " : "),
              ...prevOutput,
            ] as never[]
        );
      };
      newWs.onerror = () => {
        // print("ERROR: " + evt.data);
        toast.error(`Real-time Activity Monitoring failed`);
        setoutputActivity(
          (prevOutput) => ["ERROR: ", ...prevOutput] as never[]
        );
      };
      setwsActivity(newWs);
    } else if (!isWebSocketActive && !wsActivity) {
      toast.info(`start Real-time monitoring first`);
    } else {
      if (wsActivity != null) {
        wsActivity.close();
      }
      setoutputActivity((prevOutput) => [
        "REAL TIME MONITORING CLOSED: - Real-time activities monitoring stopped !",
        ...prevOutput,
      ]);
      setwsActivity(null);
    }
  };

  const handleLogsToggle = () => {
    if (isWebSocketActive && !wsLogs) {
      const newWs = new WebSocket(
        `ws://${appData.ip}:${appData.ws_port}/app/logger`
      );
      newWs.onopen = () => {
        toast.success(`Real-time Logs Monitoring started successfully`);

        // print("OPEN");
        // setoutputLogs((prevOutput) => [...prevOutput, "OPEN"]);
      };
      newWs.onclose = () => {
        toast.success(`Real-time Logs Monitoring stopted successfully`);

        // print("CLOSE");
        // setoutputLogs((prevOutput) => [...prevOutput, "CLOSE"]);
        setWsLogs(null);
      };
      newWs.onmessage = (evt) => {
        // print("RESPONSE: " + evt.data);
        const now: Moment = moment();
        setoutputLogs((prevOutput) => [
          `${now.format("YYYY-MM-DD HH:mm:ss")} - ` +
            evt.data.slice(1, -1).replace(/"/g, " ").replace(/:/g, " : "),
          ...prevOutput,
        ]);
      };
      newWs.onerror = (evt) => {
        // print("ERROR: " + evt.data);
        toast.error(`Real-time Logs Monitoring failed`);
        setoutputLogs((prevOutput) => ["ERROR: " + evt.data, ...prevOutput]);
      };
      setWsLogs(newWs);
    } else if (!isWebSocketActive && !wsActivity) {
      toast.info(`start Real-time monitoring first`);
    } else {
      wsLogs.close();
      setoutputLogs((prevOutput) => [
        "REAL TIME MONITORING CLOSED: - Real-time logs monitoring stopped!",
        ...prevOutput,
      ]);
      setWsLogs(null);
    }
  };

  window.addEventListener("beforeunload", (ev) => {
    ev.preventDefault();
    if (ev.returnValue !== "Are you sure you want to close?") {
      updateWSStatus(false); //without checking send state to parent app card.
    }
    return (ev.returnValue = "Are you sure you want to close?");
  });

  return (
    <>
      <div className="ml-4 mr-4 shadow-md bg-gray-50 rounded dark:bg-slate-800">
        <div className="flex justify-left pt-2 pb-2 pr-4">
          <button
            onClick={handleButtonClick}
            className={`px-4 py-1 rounded-md mr-2 ${
              isWebSocketActive ? "bg-red-500" : "bg-green-500"
            } text-white hover:bg-${
              isWebSocketActive ? "red-700" : "green-600"
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="flex items-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-3 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A8.002 8.002 0 0112 4.472v3.064A4.5 4.5 0 007.5 12H6v5.291z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              </>
            ) : isWebSocketActive ? (
              "Stop RT monitoring"
            ) : (
              "Start RT monitoring"
            )}
          </button>
          <Modal isOpen={isModalOpen} onCancel={closeModal} onSave={handleSave}>
            <h2 className="text-2xl mb-4">App Configure </h2>
          </Modal>
        </div>
        <ul
          className="flex flex-wrap -mb-px text-sm font-medium text-center bg-slate-200 border rounded dark:bg-slate-700 dark:border-slate-700"
          role="tablist"
        >
          <li role="presentation ">
            <div className="group cursor-pointer relative flex ">
              <button
                className={`inline-block p-4 pl-10 pr-10  border-white dark:border-gray-700 ${
                  activeTab === 1
                    ? "dark:bg-slate-600 text-purple-600 hover:text-purple-600 dark:text-purple-500 dark:hover:text-purple-500 rounded-tl-lg rounded-tr-lg border-t-2 border-r-2 border-l-2 bg-white hover:bg-gray-50"
                    : " hover:text-black dark:text-white dark:hover:text-gray-700 dark:hover:bg-gray-500/60  hover:bg-[#9CA3AF]"
                }`}
                onClick={() => setActiveTab(1)}
                id="profile-styled-tab"
                role="tab"
                aria-controls="1"
                aria-selected={activeTab === 1}
              >
                Status
              </button>
              <div className="opacity-0 w-32 bg-black text-white text-center align-middle text-xs rounded-lg py-1 absolute z-10 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none">
                Monitor real time status
                <div className="bg-black w-2.5 h-2.5 rotate-45 absolute bottom-[-0.625rem] left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            </div>
          </li>
          <li role="presentation ">
            <div className="group cursor-pointer relative flex ">
              <button
                className={`inline-block p-4 pl-10 pr-10  border-white dark:border-gray-700  ${
                  activeTab === 2
                    ? "dark:bg-slate-600 text-purple-600 hover:text-purple-600 dark:text-purple-500 dark:hover:text-purple-500 rounded-tl-lg rounded-tr-lg border-t-2 border-r-2 border-l-2 bg-white hover:bg-gray-50"
                    : " hover:text-gray-600 dark:text-white dark:hover:text-gray-700 dark:hover:bg-gray-500/60 hover:bg-[#9CA3AF]"
                }`}
                onClick={() => setActiveTab(2)}
                id="dashboard-styled-tab"
                role="tab"
                aria-controls="2"
                aria-selected={activeTab === 2}
              >
                Activity
              </button>
              <div className="opacity-0 w-32 bg-black text-white text-center align-middle text-xs rounded-lg py-1 absolute z-10 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none">
                Monitor real time activity
                <div className="bg-black w-2.5 h-2.5 rotate-45 absolute bottom-[-0.625rem] left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            </div>
          </li>
          <li role="presentation">
            <div className="group cursor-pointer relative flex ">
              <button
                className={`inline-block p-4 pl-10 pr-10 border-white dark:border-gray-700  ${
                  activeTab === 3
                    ? "dark:bg-slate-600 text-purple-600 hover:text-purple-600 dark:text-purple-500 dark:hover:text-purple-500 rounded-tl-lg rounded-tr-lg border-t-2 border-r-2 border-l-2 bg-white hover:bg-gray-50"
                    : " hover:text-gray-600 dark:text-white dark:hover:text-gray-700 dark:hover:bg-gray-500/60  hover:bg-[#9CA3AF]"
                }`}
                onClick={() => setActiveTab(3)}
                id="settings-styled-tab"
                role="tab"
                aria-controls="3"
                aria-selected={activeTab === 3}
              >
                Logs
              </button>
              <div className="opacity-0 w-28 bg-black text-white text-center align-middle text-xs rounded-lg py-1 absolute z-10 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none">
                Monitor real time logs
                <div className="bg-black w-2.5 h-2.5 rotate-45 absolute bottom-[-0.625rem] left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            </div>
          </li>
        </ul>
        <div className=" max-h-50vh overflow-auto">
          <div
            className={`flex ${
              activeTab === 1 ? "block" : "hidden"
            } grid grid-flow-row`}
          >
            <div className="mt-2 ml-3 flex justify-between">
              <div>
                <button
                  onClick={handleStatusToggle}
                  className={`text-lg text-black pl-8 pr-8 mb-2 rounded-lg border-b bg-gray-200 ${
                    wsStatus ? "bg-red-500" : "bg-gray-200"
                  } text-lg hover:bg-${wsStatus ? "red-700" : "gray-400"} ${
                    !isWebSocketActive ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {wsStatus ? "Stop" : "Start"}
                </button>

                <button
                  onClick={() => setoutputStatus([])}
                  className={` text-black pl-8 pr-8 mb-2 ml-4 rounded-lg border-b bg-gray-200 text-lg  hover:bg-[#9CA3AF] `}
                >
                  Clear
                </button>
              </div>
              <div className="relative">
                <button
                  onClick={() => setSelectedColor("#222223")}
                  className="w-6 h-6 rounded-full bg-[#222223] border-2 border-gray-300 mx-1 hover:scale-110 transition-transform"
                />
                <button
                  onClick={() => setSelectedColor("#FFFFFF")}
                  className="w-6 h-6 rounded-full bg-white  border-2 border-gray-300 mx-1 hover:scale-110 transition-transform"
                />
                <button
                  onClick={() => setSelectedColor("#05f3")}
                  className="w-6 h-6 rounded-full bg-[#05f3] border-2 border-gray-300 mx-1  mr-5 hover:scale-110 transition-transform"
                />
                <button className="w-6 h-6 rounded-full mx-1 mr-5 hover:scale-110 transition-transform ml-5">
                  <ColorPicker pickedColor={(e) => setSelectedColor(e)} />
                </button>
              </div>
            </div>

            <div
              className="p-2 pt-2 overflow-y-auto h-[11vh] xs:h-[28vh] md:h-[50vh]"
              style={{
                minHeight: "266px",
                maxHeight: "44vh",
                backgroundColor: selectedColor,
              }}
            >
              <div
                className={`p-2 ${
                  selectedColor === "#222223" ? "text-white" : "text-black"
                } dark:${
                  selectedColor === "#FFFFFF" ? "text-black" : "text-white"
                } `}
              >
                {outputStatus &&
                  outputStatus.map((message, index) => (
                    <div key={index}>{message}</div>
                  ))}
              </div>
            </div>
          </div>
          <div
            className={`flex  ${
              activeTab === 2 ? "block" : "hidden"
            } grid grid-flow-row`}
          >
            <div className="mt-2 ml-3 flex justify-between">
              <div>
                <button
                  onClick={handleActivityToggle}
                  className={`text-lg text-black  pl-8 pr-8 mb-2 rounded-lg border-b bg-gray-200  ${
                    wsActivity ? "bg-red-500" : "bg-gray-200"
                  } text-lg  hover:bg-${wsActivity ? "red-700" : "gray-400"} ${
                    !isWebSocketActive ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {wsActivity ? "Stop" : "Start"}
                </button>
                <button
                  onClick={() => setoutputActivity([])}
                  className={`text-black  pl-8 pr-8 mb-2 ml-4 rounded-lg border-b bg-gray-200 text-lg  hover:bg-[#9CA3AF] `}
                >
                  Clear
                </button>
              </div>
              <div className="relative">
                <button
                  onClick={() => setSelectedColor("#222223")}
                  className="w-6 h-6 rounded-full bg-[#222223] border-2 border-gray-300 mx-1 hover:scale-110 transition-transform"
                />
                <button
                  onClick={() => setSelectedColor("#FFFFFF")}
                  className="w-6 h-6 rounded-full bg-white border-2 border-gray-300 mx-1 hover:scale-110 transition-transform"
                />
                <button
                  onClick={() => setSelectedColor("#05f3")}
                  className="w-6 h-6 rounded-full bg-[#05f3] border-2 border-gray-300 mx-1  mr-5 hover:scale-110 transition-transform"
                />
                <button className="w-6 h-6 rounded-full mx-1 mr-5 hover:scale-110 transition-transform ml-5">
                  <ColorPicker pickedColor={(e) => setSelectedColor(e)} />
                </button>
              </div>
            </div>
            <div
              className="p-2 pt-2 text- overflow-y-auto  h-[11vh] xs:h-[28vh] md:h-[50vh] "
              style={{
                minHeight: "266px",
                maxHeight: "44vh",
                backgroundColor: selectedColor,
              }}
            >
              <div
                className={`p-2 ${
                  selectedColor === "#222223" ? "text-white" : "text-black"
                } dark:${
                  selectedColor === "#FFFFFF" ? "text-black" : "text-white"
                } `}
              >
                {outputActivity &&
                  outputActivity.map((message, index) => (
                    <div key={index}>{message}</div>
                  ))}
              </div>
            </div>
          </div>
          <div
            className={`flex ${
              activeTab === 3 ? "block" : "hidden"
            } grid grid-flow-row`}
          >
            <div className="mt-2 ml-3 flex justify-between">
              <div>
                <button
                  onClick={handleLogsToggle}
                  className={`text-lg  text-black pl-8 pr-8 mb-2 rounded-lg  bg-gray-200  ${
                    wsLogs ? "bg-red-500" : "bg-gray-200"
                  } text-lg  hover:bg-${wsLogs ? "red-700" : "gray-400"} ${
                    !isWebSocketActive ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {wsLogs ? "Stop" : "Start"}
                </button>
                <button
                  onClick={() => setoutputLogs([])}
                  className={` text-black pl-8 pr-8 mb-2 ml-4 rounded-lg  bg-gray-200 text-lg hover:bg-[#9CA3AF] `}
                >
                  Clear
                </button>
              </div>
              <div className="relative">
                <button
                  onClick={() => setSelectedColor("#222223")}
                  className="w-6 h-6 rounded-full bg-[#222223] border-2 border-gray-300 mx-1 hover:scale-110 transition-transform"
                />
                <button
                  onClick={() => setSelectedColor("#FFFFFF")}
                  className="w-6 h-6 rounded-full bg-white border-2 border-gray-300 mx-1 hover:scale-110 transition-transform"
                />
                <button
                  onClick={() => setSelectedColor("#05f3")}
                  className="w-6 h-6 rounded-full bg-[#05f3] border-2 border-gray-300 mx-1  mr-5 hover:scale-110 transition-transform"
                />
                <button className="w-6 h-6 rounded-full mx-1 mr-5 hover:scale-110 transition-transform ml-5">
                  <ColorPicker pickedColor={(e) => setSelectedColor(e)} />
                </button>
              </div>
            </div>
            <div
              className="p-2 pt-2 overflow-y-auto  h-[11vh] xs:h-[28vh] md:h-[50vh]"
              style={{
                minHeight: "266px",
                maxHeight: "44vh",
                backgroundColor: selectedColor,
              }}
            >
              <div
                className={`p-2 ${
                  selectedColor === "#222223" ? "text-white" : "text-black"
                } dark:${
                  selectedColor === "#FFFFFF" ? "text-black" : "text-white"
                } `}
              >
                {outputLogs &&
                  outputLogs.map((message, index) => (
                    <div key={index}>{message}</div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Modal = ({ isOpen, onCancel, onSave, children }) => {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 items-center justify-center overflow-x-hidden overflow-y-auto block">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          {/* <div
            className={`relative z-50 w-full ${getSizeClasses()} ${getPositionClasses()} mx-auto my-6`}
          > */}
          <div
            className={`relative z-50 w-full max-w-lg top-0 left-0 mx-auto my-6 block`}
          >
            <div
              className="relative bg-white rounded-lg shadow-lg  overflow-auto"
              style={{ maxHeight: "80vh" }}
            >
              <div className="p-6">{children}</div>
              <div className="flex items-center justify-end px-6 py-4 bg-gray-100 rounded-b-lg">
                <button
                  className="px-4 py-2 mr-2 text-gray-600 bg-gray-300 rounded hover:bg-[#222223]"
                  onClick={onCancel}
                >
                  Close
                </button>
                <button
                  className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
                  onClick={onSave}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Tabpane;
