/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef, useMemo } from "react";
import Header from "../components/Header";
import Login from "./Login";
import apiClient from "../services/ApiService";
import UploadImg from "../assets/upload.png";
import { CloseIcon, AppPlusIcon, AppsIcon, Deploy } from "../assets/icons";
import { toast } from "react-toastify";
import {
  UploadIcon,
  InfoIcon,
  WeelIcon,
  DeleteIcon,
  WarningIcon,
} from "../assets/icons";
import {
  AddAppIcon,
  LeftArrowIcon,
  RightArrowIcon,
  PreviewIcon,
} from "../assets/icons";
import { useUser } from "../context/UserContext";

const Application = () => {
  const { userType } = useUser();
  const [apps, setApps] = useState([]);
  const [companyList, setCompanyList] = useState([]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [productList, setProductList] = useState([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [rowsLimit, setRowsLimit] = useState(10);
  const [rowsToShow, setRowsToShow] = useState([]);
  const [customPagination, setCustomPagination] = useState([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [totalPage, setTotalPage] = useState(
    Math.ceil(productList?.length / rowsLimit)
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [appUnitModalOpen, setAppUnitModalOpen] = useState({});
  const [selectedItem, setSelectedItem] = useState({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dropdownRef = useRef(null);
  const nextPage = () => {
    const startIndex = rowsLimit * (currentPage + 1);
    const endIndex = startIndex + rowsLimit;
    const newArray = apps.slice(startIndex, endIndex);
    setRowsToShow(newArray);
    setCurrentPage(currentPage + 1);
  };
  const changePage = (value) => {
    const startIndex = value * rowsLimit;
    const endIndex = startIndex + rowsLimit;
    const newArray = apps.slice(startIndex, endIndex);
    setRowsToShow(newArray);
    setCurrentPage(value);
  };
  const previousPage = () => {
    const startIndex = (currentPage - 1) * rowsLimit;
    const endIndex = startIndex + rowsLimit;
    const newArray = apps.slice(startIndex, endIndex);
    setRowsToShow(newArray);
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else {
      setCurrentPage(0);
    }
  };
  useMemo(() => {
    setCustomPagination(
      Array(Math.ceil(productList?.length / rowsLimit)).fill(null)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const authToken = sessionStorage.getItem("authToken");

    const fetchData = async () => {
      try {
        if (authToken) {
          const data = await getApps("application");
          const updatedApps = data?.filter((app) => app.aid != null);
          if (updatedApps) {
            setApps(updatedApps);
            setProductList(updatedApps);
            setRowsToShow(updatedApps.slice(0, rowsLimit));
            setTotalPage(Math.ceil(updatedApps.length / rowsLimit));
          }
          if (userType === 0) {
            const data = await getCompanies("company");
            setCompanyList(data);
          }
        } else {
          return <Login />;
        }
      } catch (error) {
        console.log("error:", error);
        toast.error("retreived apps failed");
      }
    };

    fetchData();
  }, []);

  const getApps = async (endpoint: string) => {
    try {
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.log("error", error);
      toast.error("retreived apps failed");
    }
  };

  const getCompanies = async (endpoint: string) => {
    try {
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      toast.error("retreived companies failed");
    }
  };

  const handleAdd = () => {
    if (userType === 0 && companyList.length < 0) {
      toast.error("Create a Company first");
    } else {
      setAddModalOpen(true);
    }
  };
  const closeAddModal = () => {
    setAddModalOpen(false);
  };

  const handleAddSave = (data) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { appunits, ...rest } = data;
    const updatedApps = [...apps, rest];
    setApps(updatedApps);
    setProductList(updatedApps);
    setRowsToShow(
      updatedApps.slice(currentPage * rowsLimit, (currentPage + 1) * rowsLimit)
    );
    setTotalPage(Math.ceil(updatedApps.length / rowsLimit));
    setSelectedItem({});
    closeAddModal();
  };

  // const nextPorts = () => {
  //   if (apps && apps.length > 0) {
  //     const lastApp = apps[apps.length - 1];
  //     return {
  //       ws_port: lastApp.ws_port + 1,
  //       rest_port: lastApp.rest_port + 1,
  //       prof_port: lastApp.prof_port + 1,
  //     };
  //   } else {
  //     return {
  //       ws_port: 23450,
  //       rest_port: 8990,
  //       prof_port: 8880,
  //     };
  //   }
  // };

  const handleEdit = (data) => {
    setEditModalOpen({ status: true, data: data });
  };
  const closeEditModal = () => {
    setEditModalOpen({ status: false, data: [] });
  };

  const handleEditSave = (newData) => {
    // Your save logic here
    closeEditModal({ status: false, data: [] });
    const updatedApp = apps.map((app) =>
      app.aid === newData.aid ? newData : app
    );

    setApps(updatedApp);
    setProductList(updatedApp);
    setRowsToShow(
      updatedApp.slice(currentPage * rowsLimit, (currentPage + 1) * rowsLimit)
    );
    setTotalPage(Math.ceil(updatedApp.length / rowsLimit));
    setSelectedItem({});
  };

  const handleDelete = (data) => {
    setSelectedItem(data);
    setDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const handleDeleteSave = () => {
    closeDeleteModal();
    deleteApp(`application/${selectedItem.cid}/${selectedItem.aid}`);
  };

  const handleDeploy = async (data) => {
    try {
      const response = await apiClient.get(`application/start/`, {
        cname: data.cname,
        zid: data.zid,
      });
      if (response.data) {
        toast.success("zau app deployement successfull");
      } else {
        toast.error("zau app deployement failed");
      }
    } catch (error) {
      toast.error("zau app deployement failed");
    }
  };

  const deleteApp = async (endpoint: string) => {
    try {
      const response = await apiClient.delete(endpoint);
      if (response.data) {
        const updatedApps = apps.filter((app) => app.aid !== selectedItem.aid);
        setApps(updatedApps);
        setProductList(updatedApps);
        setRowsToShow(
          updatedApps.slice(
            currentPage * rowsLimit,
            (currentPage + 1) * rowsLimit
          )
        );
        setTotalPage(Math.ceil(updatedApps.length / rowsLimit));
        setSelectedItem({});
        if (currentPage > 0 && updatedApps.length <= currentPage * rowsLimit) {
          setCurrentPage(currentPage - 1);
          setRowsToShow(
            updatedApps.slice(
              (currentPage - 1) * rowsLimit,
              currentPage * rowsLimit
            )
          );
        }
      }
    } catch (error) {
      console.log("error");
      toast.error("Delete app failed");
    }
  };

  const handleAppUnit = (zid, cname, cid) => {
    setAppUnitModalOpen({ status: true, data: { zid, cname, cid } });
  };
  const closeAppUnitModal = () => {
    setAppUnitModalOpen({ status: false, data: [] });
  };

  const handleAppUnitSave = () => {
    closeAppUnitModal({ status: false, data: [] });
  };

  return (
    <>
      <div className="flex h-screen overflow-hidden ">
        {/* Sidebar */}

        <div className="relative flex flex-col flex-1 overflow-y-hidden overflow-x-hidden">
          {/*  Site header */}
          <Header />
          <div className="min-h-screen h-full bg-blue-50 flex justify-center dark:bg-slate-700 w-full  overflow-y-auto mt-6">
            <div className="w-full px-2 pl-5 pr-5 pt-5 pb-5 overflow-scroll">
              <div className="flex justify-between items-center">
                <div className="flex ">
                  <AppsIcon />
                  <h1 className="text-2xl font-medium ml-2">Applications</h1>
                </div>
                {(userType === 0 || userType === 1) && (
                  <div className="group cursor-pointer relative flex ">
                    <button
                      onClick={() => handleAdd()}
                      className={
                        "p-1 mr-3 rounded-full cursor-pointer hover:scale-125"
                      }
                    >
                      <AppPlusIcon />
                    </button>
                    <div className="text-xs  absolute hidden group-hover:block left-0 transform -translate-x-full -translate-y-1/2 px-2 py-1 rounded bg-black text-white z-50">
                      Add New Application
                      <div className="bg-black w-2.5 h-2.5 rotate-45 absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2  right-[-0.625rem]"></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="w-full xl:overflow-x-hidden  md:overflow-auto sm:overflow-auto xs:overflow-auto overflow-x-auto  2xl:max-w-none mt-2">
                <table
                  className="table-auto xl:overflow-x-hidden text-left font-inter"
                  style={{ width: "99.8%", minWidth: "max-content" }}
                >
                  <thead className="rounded-lg font-semibold w-full bg-gray-800 text-white">
                    <tr className="bg-[#222E3A]/[20%] dark:bg-[#222E3A]/[60%]">
                      <th className="py-3 px-3 dark:text-white sm:text-base font-bold whitespace-nowrap justify-center text-center">
                        #
                      </th>
                      {userType === 0 && (
                        <th className="py-3 px-3 sm:text-base font-bold whitespace-nowrap justify-center text-center">
                          Company Name
                        </th>
                      )}
                      <th className="py-3 px-3 sm:text-base font-bold whitespace-nowrap justify-center text-center">
                        App Name
                      </th>
                      <th className="py-3 px-3 sm:text-base font-bold whitespace-nowrap justify-center text-center">
                        ZID
                      </th>
                      <th className="py-3 px-3 sm:text-base font-bold whitespace-nowrap justify-center text-center">
                        IP
                      </th>
                      <th className="py-3 px-3 sm:text-base font-bold whitespace-nowrap justify-center text-center">
                        Rest Port
                      </th>
                      <th className="py-3 px-3 sm:text-base font-bold whitespace-nowrap justify-center text-center">
                        WS Port
                      </th>
                      <th className="py-3 px-3 sm:text-base font-bold whitespace-nowrap justify-center text-center">
                        Description
                      </th>
                      <th className="py-3 px-3 sm:text-base font-bold whitespace-nowrap justify-center text-center">
                        Status
                      </th>

                      <th className="py-3 px-3 sm:text-base font-bold whitespace-nowrap justify-center text-center">
                        App Unit info
                      </th>
                      {(userType === 0 || userType === 1) && (
                        <th
                          className="flex items-center py-3 px-3  dark:text-white sm:text-base font-bold whitespace-nowrap justify-center text-center gap-1"
                          style={{ justifyContent: "space-around" }}
                        >
                          Action
                        </th>
                      )}
                      {(userType === 0 || userType === 1) && (
                        <th className="py-3 px-3 sm:text-base font-bold whitespace-nowrap justify-center text-center">
                          Deploy
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {rowsToShow?.map((data, index) => (
                      <tr
                        className={`${
                          index % 2 == 0
                            ? "bg-[#222E3A]/[5%] dark:bg-[#222E3A]/[50%]"
                            : "bg-[#222E3A]/[2%] dark:bg-[#222E3A]/[2%]"
                        } hover:bg-amber-50 dark:hover:bg-gray-600 transition duration-200 transform hover:-translate-y-0.5 hover:shadow-lg rounded-xl`}
                        key={index}
                      >
                        <td
                          className={`py-5 px-4 text-base font-normal  whitespace-nowrap justify-center text-center`}
                        >
                          {index + 1 + currentPage * rowsLimit}
                        </td>
                        {userType === 0 && (
                          <td
                            className={`py-5 px-4 text-base font-normal justify-center text-center  whitespace-nowrap `}
                          >
                            {data?.cname}
                          </td>
                        )}
                        <td
                          className={`py-5 px-4 text-base font-normal justify-center text-center `}
                        >
                          {data?.name}
                        </td>
                        <td
                          className={`py-5 px-4 text-base font-normal  whitespace-nowrap justify-center text-center`}
                        >
                          {data?.zid}
                        </td>
                        <td
                          className={`py-5 px-4 text-base font-normal  whitespace-nowrap justify-center text-center`}
                        >
                          {data?.ip}
                        </td>
                        <td
                          className={`py-5 px-4 text-base font-normal justify-center text-center `}
                        >
                          {data?.rest_port}
                        </td>
                        <td
                          className={`py-5 px-4 text-base font-normal justify-center text-center `}
                        >
                          {data?.ws_port}
                        </td>
                        <td
                          className={`py-5 px-4 text-base font-normal justify-center text-center `}
                        >
                          {data?.desc}
                        </td>
                        <td
                          className={`py-5 px-4 text-base font-bold whitespace-nowrap justify-center text-center ${
                            data?.enable ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {data?.enable ? "Active" : "Inactive"}
                        </td>

                        <td
                          className={`py-5 px-4 text-base font-normal justify-center text-center `}
                        >
                          <div className="flex items-center justify-center text-center">
                            <button
                              onClick={() =>
                                handleAppUnit(data.zid, data.cname, data.cid)
                              }
                            >
                              <div className="group relative ">
                                <InfoIcon />
                                <div className="opacity-0 w-24 bg-black text-white text-center align-middle text-xs rounded-lg py-1 absolute z-10 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none">
                                  View {data?.name} info
                                  <div className="bg-black w-2.5 h-2.5 rotate-45 absolute bottom-[-0.625rem] left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                                </div>
                              </div>
                            </button>
                          </div>
                        </td>
                        {(userType === 0 || userType === 1) && (
                          <td
                            className={`py-5 px-4 text-base font-normal justify-center text-center `}
                          >
                            <div className="flex items-center justify-center text-center">
                              <button onClick={() => handleEdit(data)}>
                                <div className="group relative ">
                                  <WeelIcon />
                                  <div className="opacity-0 w-24 bg-black text-white text-center align-middle text-xs rounded-lg py-1 absolute z-10 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none">
                                    Edit {data?.name}
                                    <div className="bg-black w-2.5 h-2.5 rotate-45 absolute bottom-[-0.625rem] left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                                  </div>
                                </div>
                              </button>
                              <button onClick={() => handleDelete(data)}>
                                <div className="group relative ">
                                  <DeleteIcon />
                                  <div className="opacity-0 w-24 bg-black text-white text-center align-middle text-xs rounded-lg py-1 absolute z-10 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none">
                                    Delete {data?.name}
                                    <div className="bg-black w-2.5 h-2.5 rotate-45 absolute bottom-[-0.625rem] left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                                  </div>
                                </div>
                              </button>
                            </div>
                          </td>
                        )}
                        {(userType === 0 || userType === 1) && (
                          <td
                            className={`py-5 px-4 text-base font-normal justify-center text-center `}
                          >
                            <div className="flex items-center justify-center text-center">
                              <button onClick={() => handleDeploy(data)}>
                                <div className="group relative ">
                                  <Deploy />
                                  <div className="opacity-0 w-24 bg-black text-white text-center align-middle text-xs rounded-lg py-1 absolute z-10 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none">
                                    Deploy {data?.name} app
                                    <div className="bg-black w-2.5 h-2.5 rotate-45 absolute bottom-[-0.625rem] left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                                  </div>
                                </div>
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="w-full  flex justify-center  sm:justify-between flex-col sm:flex-row gap-5 mt-1.5 px-1 items-center">
                <div className="text-lg">
                  Showing {currentPage == 0 ? 1 : currentPage * rowsLimit + 1}{" "}
                  to{" "}
                  {currentPage == totalPage - 1
                    ? productList?.length
                    : (currentPage + 1) * rowsLimit}{" "}
                  of {productList?.length} entries
                </div>
                <div className="flex">
                  <ul
                    className="flex justify-center  items-center gap-x-[10px] z-30"
                    role="navigation"
                    aria-label="Pagination"
                  >
                    <li
                      className={` prev-btn flex items-center justify-center w-[36px] rounded-[6px] h-[36px] border-[1px] border-solid border-[#E4E4EB] disabled] ${
                        currentPage == 0
                          ? "dark:bg-slate-700 bg-[#d5ddee] pointer-events-none"
                          : " cursor-pointer"
                      }
  `}
                      onClick={previousPage}
                    >
                      <LeftArrowIcon />
                    </li>
                    {customPagination.length > 0 ? (
                      customPagination?.map((data, index) => (
                        <li
                          className={`flex items-center justify-center w-[36px] rounded-[6px] h-[34px] border-[1px] border-solid bg-[#FFFFFF] cursor-pointer ${
                            currentPage === index
                              ? "text-blue-600 border-sky-500"
                              : "border-[#E4E4EB]"
                          }`}
                          onClick={() => changePage(index)}
                          key={index}
                        >
                          {index + 1}
                        </li>
                      ))
                    ) : (
                      <li
                        className={`flex items-center justify-center w-[36px] rounded-[6px] h-[34px] border-[1px] border-solid bg-[#FFFFFF] cursor-pointer text-blue-600 border-sky-500`}
                      >
                        <span className="font-bold">{currentPage + 1}</span>
                      </li>
                    )}

                    <li
                      className={`flex items-center justify-center w-[36px] rounded-[6px] h-[36px] border-[1px] border-solid border-[#E4E4EB]  ${
                        currentPage == totalPage - 1
                          ? "dark:bg-slate-700 bg-[#d5ddee] pointer-events-none"
                          : " cursor-pointer"
                      }`}
                      onClick={nextPage}
                    >
                      <RightArrowIcon />
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {addModalOpen && (
        <AddAppForm
          isOpen={addModalOpen}
          onClose={closeAddModal}
          onSave={handleAddSave}
          // modalData={nextPorts()}
        />
      )}
      {deleteModalOpen && (
        <DeleteApp
          isOpen={deleteModalOpen}
          onClose={closeDeleteModal}
          onSave={handleDeleteSave}
        >
          <div className="sm:flex sm:items-start ">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <WarningIcon />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3
                className="text-2xl font-semibold leading-6 text-gray-900 dark:text-gray-200"
                id="modal-title"
              >
                Delete {selectedItem?.name} Applcation
              </h3>
              <div className="mt-2">
                <p className="text-md text-gray-500 dark:text-white">
                  Are you sure to delete this Applcation? All of data will be
                  permanently removed. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </DeleteApp>
      )}
      {editModalOpen.status && (
        <EditAppForm
          isOpen={editModalOpen.status}
          onClose={closeEditModal}
          onSave={handleEditSave}
          modalData={editModalOpen.data}
        />
      )}
      {appUnitModalOpen.status && (
        <AppUnit
          isOpen={appUnitModalOpen.status}
          onClose={closeAppUnitModal}
          onSave={handleAppUnitSave}
          modalData={appUnitModalOpen.data}
        />
      )}
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EditAppForm = ({ isOpen, onClose, onSave, modalData, children }) => {
  const [formData, setFormData] = useState({
    aid: "",
    name: "",
    zid: "",
    version: "",
    key: "",
    desc: "",
    enable: false,
    cid: "",
    ip: "",
    rest_port: "",
    ws_port: "",
    utid: 1,
  });
  const { userType } = useUser();

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      ...modalData,
    }));
  }, [modalData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.put(
        `application/${formData?.aid}`,
        formData
      );
      if (response.data) {
        toast.success(`App ${formData?.aid} Edit successfully`);
        onSave(formData);
        onClose();
        setFormData({});
      } else {
        toast.error(`App ${formData?.aid} Edit unsuccessfull`);
        onClose();
        setFormData({});
      }
    } catch (error) {
      console.log("error");
      toast.error(`App ${formData?.aid} Edit unsuccessfull`);
    }
  };

  const handleClear = () => {
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      name: "",
      zid: "",
      version: "",
      key: "",
      desc: "",
      enable: "",
      cid: "",
      ip: "",
      rest_port: "",
      ws_port: "",
      utid: 1,
    }));
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto ">
          <div
            className="fixed inset-0 bg-black opacity-50"
            onClick={() => {
              onClose();
            }}
          ></div>
          <div
            className={`relative z-50 w-full max-w-2xl mx-auto block font-semibold `}
          >
            <div
              className="relative bg-white rounded-lg shadow-lg overflow-auto text-black dark:bg-slate-800"
              style={{ maxHeight: "93vh" }}
            >
              <div>
                <div className="relative flex items-center justify-between bg-gray-200 dark:bg-slate-700 dark:text-white">
                  <p className="flex-grow text-center text-2xl p-2">
                    Edit Application
                  </p>
                  <div
                    className="absolute right-1 cursor-pointer -mt-4"
                    onClick={() => {
                      onClose();
                    }}
                  >
                    <CloseIcon />
                  </div>
                </div>
                <div className="m-1 shadow-2xl bg-gray-50 rounded-xl p-1 max-h-50vh overflow-auto dark:bg-slate-800">
                  <form className="mx-auto " onSubmit={handleSubmit}>
                    <div className="md:flex md:items-center mb-1 ">
                      <div className="md:w-1/4 ">
                        <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-300 py-2 px-4 mr-1 rounded dark:bg-slate-700 dark:text-white">
                          Name
                        </label>
                      </div>
                      <div className="md:w-3/4">
                        <input
                          className="font-thin bg-white appearance-none border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-800 dark:text-white"
                          id="name"
                          type="text"
                          value={formData?.name || ""}
                          onChange={(e) =>
                            setFormData((prevFormData) => ({
                              ...prevFormData,
                              name: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="md:flex md:items-center mb-1 ">
                      <div className="md:w-1/4  ">
                        <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-300 py-2 px-4 mr-1 rounded dark:bg-slate-700 dark:text-white">
                          Version
                        </label>
                      </div>
                      <div className="md:w-3/4">
                        <input
                          className="font-thin bg-white appearance-none border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-800 dark:text-white"
                          id="version"
                          type="text"
                          value={formData?.version || ""}
                          onChange={(e) =>
                            setFormData((prevFormData) => ({
                              ...prevFormData,
                              version: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    {/* <div className="md:flex md:items-center mb-1 ">
                      <div className="md:w-1/4  ">
                        <label
                          className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-300 py-2 px-4 mr-1 rounded dark:bg-slate-700 dark:text-white"
                          
                        >
                          ZID
                        </label>
                      </div>
                      <div className="md:w-3/4">
                        <input
                          className="font-thin bg-white appearance-none border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-800 dark:text-white"
                          id="zid"
                          type="text"
                          value={formData?.zid}
                          onChange={(e) =>
                            setFormData((prevFormData) => ({
                              ...prevFormData,
                              zid: e.target.value,
                            }))
                          } 
                          required
                        />
                      </div>
                    </div> */}
                    <div className="md:flex md:items-center mb-1 ">
                      <div className="md:w-1/4  ">
                        <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-300 py-2 px-4 mr-1 rounded dark:bg-slate-700 dark:text-white">
                          App Key
                        </label>
                      </div>
                      <div className="md:w-3/4">
                        <input
                          className="font-thin bg-white appearance-none border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-800 dark:text-white"
                          id="key"
                          type="text"
                          value={formData?.key || ""}
                          onChange={(e) =>
                            setFormData((prevFormData) => ({
                              ...prevFormData,
                              key: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="md:flex md:items-center mb-1 ">
                      <div className="md:w-1/4  ">
                        <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-300 py-2 px-4 mr-1 rounded dark:bg-slate-700 dark:text-white">
                          Desc
                        </label>
                      </div>
                      <div className="md:w-3/4">
                        <input
                          className="font-thin bg-white appearance-none border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-800 dark:text-white"
                          id="desc"
                          type="text"
                          value={formData?.desc}
                          onChange={(e) =>
                            setFormData((prevFormData) => ({
                              ...prevFormData,
                              desc: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="md:flex md:items-center mb-1 ">
                      <div className="md:w-1/4  ">
                        <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-300 py-2 px-4 mr-1 rounded dark:bg-slate-700 dark:text-white">
                          Status
                        </label>
                      </div>
                      <div className="md:w-3/4">
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            id="switch"
                            type="checkbox"
                            className="peer sr-only"
                            value={formData?.enable}
                            checked={formData?.enable}
                            onChange={(e) =>
                              setFormData((prevFormData) => ({
                                ...prevFormData,
                                enable: e.target.checked,
                              }))
                            }
                          />
                          <label className="hidden"></label>
                          <div className="peer h-6 w-11 rounded-full border bg-slate-400 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:dark:border-gray-600 after:bg-white after:transition-all after:content-[''] peer-checked:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-green-300"></div>
                        </label>
                      </div>
                    </div>
                    {userType === 0 && (
                      <div className="md:flex md:items-center mb-1 ">
                        <div className="md:w-1/4  ">
                          <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-300 py-2 px-4 mr-1 rounded dark:bg-slate-700 dark:text-white">
                            Company ID
                          </label>
                        </div>
                        <div className="md:w-3/4">
                          <input
                            className="font-thin bg-white appearance-none border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-800 dark:text-white"
                            id="cid"
                            type="number"
                            value={formData?.cid}
                            onChange={(e) =>
                              setFormData((prevFormData) => ({
                                ...prevFormData,
                                cid: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                      </div>
                    )}
                    <div className="md:flex md:items-center mb-1 ">
                      <div className="md:w-1/4  ">
                        <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-300 py-2 px-4 mr-1 rounded dark:bg-slate-700 dark:text-white">
                          Ip Address
                        </label>
                      </div>
                      <div className="md:w-3/4">
                        <input
                          className="font-thin bg-white appearance-none border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-800 dark:text-white"
                          id="ip"
                          type="text"
                          value={formData?.ip}
                          onChange={(e) =>
                            setFormData((prevFormData) => ({
                              ...prevFormData,
                              ip: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="md:flex md:items-center mb-1 ">
                      <div className="md:w-1/4  ">
                        <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-300 py-2 px-4 mr-1 rounded dark:bg-slate-700 dark:text-white">
                          Rest Port
                        </label>
                      </div>
                      <div className="md:w-3/4">
                        <input
                          className="font-thin bg-white appearance-none border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-800 dark:text-white"
                          id="rest_port"
                          type="number"
                          value={formData?.rest_port}
                          onChange={(e) =>
                            setFormData((prevFormData) => ({
                              ...prevFormData,
                              rest_port: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="md:flex md:items-center mb-1 ">
                      <div className="md:w-1/4  ">
                        <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-300 py-2 px-4 mr-1 rounded dark:bg-slate-700 dark:text-white">
                          WS Port
                        </label>
                      </div>
                      <div className="md:w-3/4">
                        <input
                          className="font-thin bg-white appearance-none border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-800 dark:text-white"
                          id="ws_port"
                          type="number"
                          value={formData?.ws_port}
                          onChange={(e) =>
                            setFormData((prevFormData) => ({
                              ...prevFormData,
                              ws_port: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="bg-gray-100 flex px-6 py-4 items-center justify-end  rounded-b-lg dark:bg-slate-800">
                      <button
                        className="px-4 py-1 mr-2 text-gray-600 bg-gray-300 rounded hover:bg-gray-400 focus:shadow-outline focus:outline-none font-bold "
                        onClick={() => {
                          handleClear({});
                        }}
                      >
                        Clear
                      </button>

                      <button
                        className="px-4 py-1 mr-2 text-gray-600 bg-gray-300 rounded hover:bg-gray-400 focus:shadow-outline focus:outline-none font-bold "
                        onClick={() => {
                          onClose();
                          setFormData({});
                        }}
                      >
                        Close
                      </button>

                      <button
                        type="submit"
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-4 mr-2 rounded"
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// add new application
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AddAppForm = ({ isOpen, onClose, onSave, children }) => {
  const [formData, setFormData] = useState({
    name: "",
    zid: "",
    version: "",
    key: "",
    desc: "",
    enable: false,
    cid: "",
    ip: "",
    rest_port: "",
    ws_port: "",
    prof_port: "",
    utid: 1,
    appunits: {
      uname: "",
      enable: 1,
      pool_size: 1,
      ifname: "",
      path: "",
      name: "",
      cid: "",
      cname: "",
    },
  });
  const [files, setFiles] = useState({});
  const { userType } = useUser();
  const [company, setCompany] = useState([]);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    // setFormData((prevFormData) => ({
    //   ...prevFormData,
    //   rest_port: modalData?.rest_port,
    //   ws_port: modalData?.ws_port,
    // }));

    const fetchCompanyData = async () => {
      try {
        if (userType === 0) {
          const data = await getCompanies("company");
          if (data?.length === 0) {
            onClose();
            toast.error("Create a Company first");
          }
          setCompany(data);
        } else {
          const data = await getCompanies(
            `company/ ${JSON.parse(sessionStorage.getItem("userData"))?.cid}`
          );
          setCompany(data);
          setFormData((prevFormData) => ({
            ...prevFormData,
            cid: data[0].cid,
            cname: data[0].name,
            appunits: {
              ...prevFormData.appunits,
              cid: data[0].cid,
              cname: data[0].name,
            },
          }));
        }
      } catch (error) {
        console.log("error:", error);
      }
    };
    const fetchPorts = async () => {
      try {
        const data = await getPorts("application/ports");
        setFormData((prevFormData) => ({
          ...prevFormData,
          rest_port: data?.max_rest_port + 1,
          ws_port: data?.max_ws_port + 1,
          prof_port: data?.max_prof_port + 1,
        }));
      } catch (error) {
        console.log("error:", error);
      }
    };

    fetchCompanyData();
    fetchPorts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCompanies = async (endpoint: string) => {
    try {
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      toast.error("retreived companies failed");
    }
  };

  const getPorts = async (endpoint: string) => {
    try {
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      toast.error("No available ports");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append("appunit_data", JSON.stringify(formData));
    formDataToSend.append("file", files.preview);
    try {
      const response = await apiClient.postFile("application", formDataToSend);
      if (response.data) {
        toast.success("app added successfully");
        onClose();
        onSave({ ...formData, aid: response.data[0].aid });
        setFormData({});
        setFiles({});
      } else {
        toast.error("app added unsuccessfull");
        onClose();
        setFormData({});
        setFiles({});
      }
    } catch (error) {
      console.log("error", error);
      toast.error("app added unsuccessfull");
    }
  };

  const handleNextPage = (e) => {
    e.preventDefault();
    if (validateFile()) {
      setPage(page + 1);
    }
  };

  const validateFile = () => {
    if (
      formData?.appunits &&
      formData?.appunits?.name != "" &&
      formData?.appunits != undefined
    ) {
      return true;
    } else {
      toast.info("Please upload the zip file.");
      return false;
    }
  };

  const handlePreviousPage = () => {
    setPage(page - 1);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleClear = () => {
    setFormData({});
  };

  //upload file =======================================

  const addFile = (file) => {
    if (
      file.type === "application/zip" ||
      file.type === "application/x-zip-compressed"
    ) {
      const filename = file.name.slice(0, file.name.lastIndexOf("."));
      setFormData((prevFormData) => ({
        ...prevFormData,
        appunits: {
          ...prevFormData.appunits,
          ifname: "IZAppUnit",
          path: `zappunits/${filename}/`,
          name: `${filename}.so`,
        },
      }));

      setFiles({
        ...files,
        preview: file,
      });
    } else {
      // Notify the user that only zip files are allowed
      setFormData((prevFormData) => ({
        ...prevFormData,
        appunits: {
          ...prevFormData.appunits,
          ifname: "",
          path: "",
          name: "",
        },
      }));
      toast.info("Zip file only allowed");
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const fileList = [...event.dataTransfer.files];
    fileList.forEach((file) => addFile(file));
  };

  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      const fileList = [...event.target.files];
      fileList.forEach((file) => addFile(file));
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDelete = (preview) => {
    setFiles({});
    setFormData((prevFormData) => ({
      ...prevFormData,
      appunits: {
        ...prevFormData.appunits,
        ifname: "",
        path: "",
        name: "",
      },
    }));
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto">
          <div
            onClick={() => {
              onClose();
              setFormData({});
              setFiles({});
            }}
            className="fixed inset-0 bg-black opacity-50"
          ></div>
          <div
            className={`relative z-50 w-full max-w-2xl mx-auto block font-semibold `}
          >
            <div
              className="relative bg-white rounded-lg shadow-lg overflow-auto text-black  dark:bg-slate-800"
              style={{ maxHeight: "93vh" }}
            >
              {page === 1 && (
                <div>
                  <div className="relative flex items-center justify-between bg-gray-200 p-3  dark:bg-slate-700 dark:text-white">
                    <p className="flex-grow text-center text-2xl ">
                      Create Application
                    </p>
                    <div
                      className="absolute right-3 cursor-pointer"
                      onClick={() => {
                        onClose();
                        setPage(1);
                        setFormData({});
                        setFiles({});
                      }}
                    >
                      <CloseIcon />
                    </div>
                  </div>
                  <div className="m-1 shadow-2xl bg-gray-50 rounded-xl p-1 max-h-50vh overflow-auto  dark:bg-slate-800">
                    <form className="mx-auto " onSubmit={handleNextPage}>
                      <div className="md:flex md:items-center mb-1">
                        <div className="md:w-1/4  ">
                          <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded  dark:bg-gray-700 dark:text-white">
                            Name
                          </label>
                        </div>
                        <div className="md:w-3/4">
                          <input
                            className="bg-white appearance-none border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-800 dark:text-white "
                            id="name"
                            type="text"
                            value={formData?.name || ""}
                            onChange={(e) =>
                              setFormData((prevFormData) => ({
                                ...prevFormData,
                                name: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                      </div>
                      <div className="md:flex md:items-center mb-1 ">
                        <div className="md:w-1/4  ">
                          <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded  dark:bg-gray-700 dark:text-white">
                            Version
                          </label>
                        </div>
                        <div className="md:w-3/4">
                          <input
                            className="bg-white font-thin border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-800 dark:text-white "
                            id="version"
                            type="text"
                            value={formData?.version}
                            onChange={(e) =>
                              setFormData((prevFormData) => ({
                                ...prevFormData,
                                version: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className="md:flex md:items-center mb-1 ">
                        <div className="md:w-1/4  ">
                          <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded  dark:bg-gray-700 dark:text-white">
                            ZID
                          </label>
                        </div>
                        <div className="md:w-3/4">
                          <input
                            className="bg-white appearance-none border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-800 dark:text-white "
                            id="zid"
                            type="text"
                            value={formData?.zid}
                            onChange={(e) =>
                              setFormData((prevFormData) => ({
                                ...prevFormData,
                                zid: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                      </div>
                      <div className="md:flex md:items-center mb-1 ">
                        <div className="md:w-1/4  ">
                          <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded  dark:bg-gray-700 dark:text-white">
                            App Key
                          </label>
                        </div>
                        <div className="md:w-3/4">
                          <input
                            className="bg-white appearance-none border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-800 dark:text-white "
                            id="key"
                            type="text"
                            value={formData?.key}
                            onChange={(e) =>
                              setFormData((prevFormData) => ({
                                ...prevFormData,
                                key: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                      </div>
                      <div className="md:flex md:items-center mb-1 ">
                        <div className="md:w-1/4  ">
                          <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded  dark:bg-gray-700 dark:text-white">
                            Desc
                          </label>
                        </div>
                        <div className="md:w-3/4">
                          <input
                            className="bg-white appearance-none border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-800 dark:text-white "
                            id="desc"
                            type="text"
                            value={formData?.desc}
                            onChange={(e) =>
                              setFormData((prevFormData) => ({
                                ...prevFormData,
                                desc: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                      </div>
                      <div className="md:flex md:items-center mb-1 ">
                        <div className="md:w-1/4  ">
                          <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded  dark:bg-gray-700 dark:text-white">
                            Status
                          </label>
                        </div>
                        <div className="md:w-3/4">
                          <label className="relative inline-flex cursor-pointer items-center">
                            <input
                              id="switch"
                              type="checkbox"
                              className="peer sr-only"
                              value={formData?.enable}
                              onChange={(e) =>
                                setFormData((prevFormData) => ({
                                  ...prevFormData,
                                  enable: e.target.checked,
                                }))
                              }
                            />
                            <label className="hidden"></label>
                            <div className="peer h-6 w-11 rounded-full border bg-slate-400 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:dark:border-gray-600 after:bg-white after:transition-all after:content-[''] peer-checked:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-green-300"></div>
                          </label>
                        </div>
                      </div>
                      <div className="md:flex md:items-center mb-1 ">
                        <div className="md:w-1/4  ">
                          <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded  dark:bg-gray-700 dark:text-white">
                            Company
                          </label>
                        </div>
                        <div className="md:w-3/8">
                          <div className="relative">
                            {userType === 0 ? (
                              <>
                                <select
                                  className="block appearance-none w-full border bg-slate-100 border-gray-200 dark:border-gray-600 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 dark:bg-gray-700 dark:text-white"
                                  onChange={(e) => {
                                    const selectedOption =
                                      e.target.options[e.target.selectedIndex];
                                    const selectedCid = selectedOption.value;
                                    const selectedName =
                                      selectedOption.getAttribute("data-name");
                                    setFormData((prevFormData) => ({
                                      ...prevFormData,
                                      cid: selectedCid,
                                      cname: selectedName,
                                      appunits: {
                                        ...prevFormData.appunits,
                                        cid: selectedCid,
                                        cname: selectedName,
                                      },
                                    }));
                                  }}
                                  defaultValue=""
                                  required
                                >
                                  <option value="" disabled>
                                    Select a company
                                  </option>
                                  {company.map((item) => (
                                    <option
                                      key={item.cid}
                                      value={item.cid}
                                      data-name={item.name}
                                    >
                                      {item.name}
                                    </option>
                                  ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-white">
                                  <svg
                                    className="fill-current h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                  </svg>
                                </div>
                              </>
                            ) : (
                              <input
                                className=" font-thin border-2 dark:border-gray-600 bg-gray-100 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-800 dark:text-white "
                                id="ifname"
                                type="text"
                                value={company[0]?.name}
                                disabled
                              />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="md:flex md:items-center mb-1 ">
                        <div className="md:w-1/4  ">
                          <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded  dark:bg-gray-700 dark:text-white">
                            Ip Address
                          </label>
                        </div>
                        <div className="md:w-3/4">
                          <input
                            className="bg-white appearance-none border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-800 dark:text-white "
                            id="ip"
                            type="text"
                            value={formData?.ip}
                            onChange={(e) =>
                              setFormData((prevFormData) => ({
                                ...prevFormData,
                                ip: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                      </div>
                      <div className="md:flex md:items-center mb-1 ">
                        <div className="md:w-1/4  ">
                          <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded  dark:bg-gray-700 dark:text-white">
                            Rest Port
                          </label>
                        </div>
                        <div className="md:w-3/4">
                          <input
                            className=" font-thin border-2 dark:border-gray-600 bg-gray-100 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-800 dark:text-white "
                            id="rest_port"
                            type="number"
                            value={formData?.rest_port}
                            onChange={(e) =>
                              setFormData((prevFormData) => ({
                                ...prevFormData,
                                rest_port: e.target.value,
                              }))
                            }
                            disabled={userType === 0 ? false : true}
                          />
                        </div>
                      </div>
                      <div className="md:flex md:items-center mb-1 ">
                        <div className="md:w-1/4  ">
                          <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded  dark:bg-gray-700 dark:text-white">
                            WS Port
                          </label>
                        </div>
                        <div className="md:w-3/4">
                          <input
                            className=" font-thin border-2 dark:border-gray-600 bg-gray-100 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-800 dark:text-white "
                            id="ws_port"
                            type="number"
                            value={formData?.ws_port}
                            onChange={(e) =>
                              setFormData((prevFormData) => ({
                                ...prevFormData,
                                ws_port: e.target.value,
                              }))
                            }
                            disabled={userType === 0 ? false : true}
                          />
                        </div>
                      </div>

                      <div
                        className=""
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                      >
                        <main className="container mx-auto max-w-screen-lg ">
                          <div
                            id="overlay"
                            className="w-full h-full absolute top-0 left-0 pointer-events-none z-50 flex flex-col items-center justify-center rounded-md"
                            style={{ paddingTop: "52%" }}
                          >
                            <i>
                              <svg
                                className="fill-current w-12 h-12 mb-3 text-blue-700"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                              >
                                <path d="M19.479 10.092c-.212-3.951-3.473-7.092-7.479-7.092-4.005 0-7.267 3.141-7.479 7.092-2.57.463-4.521 2.706-4.521 5.408 0 3.037 2.463 5.5 5.5 5.5h13c3.037 0 5.5-2.463 5.5-5.5 0-2.702-1.951-4.945-4.521-5.408zm-7.479-1.092l4 4h-3v4h-2v-4h-3l4-4z" />
                              </svg>
                            </i>
                            <p className="text-lg text-blue-700 dark:text-blue-500">
                              <span>Drag and drop files anywhere or</span>
                            </p>
                            <p className="text-lg text-blue-700 dark:text-blue-500">
                              <span>Upload a file</span>
                            </p>
                          </div>
                          <section className="h-full overflow-auto p-8 pt-4 pb-2 w-full  flex flex-col">
                            <header className="border-dashed border-2 border-gray-400  flex flex-col justify-center items-center">
                              <input
                                id="hidden-input"
                                type="file"
                                multiple
                                className="cursor-pointer relative  opacity-0 w-full h-full py-12 z-50"
                                onChange={handleFileChange}
                                onClick={handleFileChange}
                              />
                            </header>

                            <ul id="gallery" className="h-24">
                              {Object.keys(files).length === 0 && (
                                <li
                                  id="empty"
                                  className=" text-center flex flex-col "
                                >
                                  <img
                                    className="mx-auto w-20"
                                    src={UploadImg}
                                    alt="no data"
                                  />
                                  <span className="text-small text-gray-500 dark:text-gray-300">
                                    No files selected
                                  </span>
                                </li>
                              )}
                              {Object.keys(files).map((preview) => (
                                <li
                                  key={preview}
                                  className="block p-1 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/6 xl:w-1/8 h-24"
                                >
                                  <article
                                    tabIndex={0}
                                    className="group w-full h-full rounded-md focus:outline-none focus:shadow-outline elative bg-gray-100 cursor-pointer relative shadow-sm"
                                  >
                                    <img
                                      alt="upload preview"
                                      className="img-preview hidden w-full h-full sticky object-cover rounded-md bg-fixed"
                                      src={URL.createObjectURL(files[preview])}
                                    />
                                    <section className="flex flex-col rounded-md text-xs break-words w-full h-full z-20 absolute top-0 py-2 px-3">
                                      <h1 className="flex-1 group-hover:text-blue-800">
                                        {files[preview].name}
                                      </h1>
                                      <div className="flex">
                                        <span className="p-1 text-blue-800">
                                          <i>
                                            <UploadIcon />
                                          </i>
                                        </span>
                                        <p className="p-1 size text-xs text-gray-700">
                                          {files[preview].size > 1024
                                            ? files[preview].size > 1048576
                                              ? Math.round(
                                                  files[preview].size / 1048576
                                                ) + "mb"
                                              : Math.round(
                                                  files[preview].size / 1024
                                                ) + "kb"
                                            : files[preview].size + "b"}
                                        </p>
                                        <button
                                          className="delete ml-auto focus:outline-none hover:bg-gray-200 p-1 rounded-md text-gray-800"
                                          onClick={() => handleDelete(preview)}
                                        >
                                          <PreviewIcon />
                                        </button>
                                      </div>
                                    </section>
                                  </article>
                                </li>
                              ))}
                            </ul>
                          </section>
                        </main>
                      </div>
                      <div className="bg-gray-100 flex px-6 py-4 items-center justify-end  rounded-b-lg dark:bg-slate-800 dark:text-white">
                        <button
                          className="px-4 py-1 mr-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-400 focus:shadow-outline focus:outline-none  font-bold "
                          onClick={() => {
                            onClose();
                            setPage(1);
                            setFormData({});
                            setFiles({});
                          }}
                        >
                          Close
                        </button>
                        <button
                          type="submit"
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded small"
                        >
                          Next
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              {page === 2 && (
                <div>
                  <div className="relative flex items-center justify-between bg-gray-200 p-3 dark:bg-gray-700 dark:text-white">
                    <p className="flex-grow text-center text-2xl">
                      Create ZAU APP
                    </p>
                    <div
                      className="absolute right-3 cursor-pointer"
                      onClick={() => {
                        onClose();
                        setPage(1);
                        setFormData({});
                        setFiles({});
                      }}
                    >
                      <CloseIcon />
                    </div>
                  </div>
                  <div className="m-1 shadow-2xl bg-gray-50 rounded-2xl p-2  max-h-50vh overflow-auto dark:bg-slate-800">
                    <form className="mx-auto " onSubmit={handleSubmit}>
                      <div className="md:flex md:items-center mb-1 ">
                        <div className="md:w-1/4  ">
                          <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded  dark:bg-gray-700 dark:text-white">
                            Unit Name
                          </label>
                        </div>
                        <div className="md:w-3/4">
                          <input
                            className="bg-white appearance-none border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-800 dark:text-white "
                            id="uname"
                            type="text"
                            value={formData?.appunits?.uname}
                            onChange={(e) =>
                              setFormData((prevFormData) => ({
                                ...prevFormData,
                                appunits: {
                                  ...prevFormData.appunits,
                                  uname: e.target.value,
                                },
                              }))
                            }
                            required
                          />
                        </div>
                      </div>
                      <div className="md:flex md:items-center mb-1 ">
                        <div className="md:w-1/4  ">
                          <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded  dark:bg-gray-700 dark:text-white">
                            Status
                          </label>
                        </div>
                        <div className="md:w-3/4">
                          <label className="relative inline-flex cursor-pointer items-center">
                            <input
                              id="switch"
                              type="checkbox"
                              className="peer sr-only"
                              value={formData?.appunits?.enable}
                              onChange={(e) =>
                                setFormData((prevFormData) => ({
                                  ...prevFormData,
                                  appunits: {
                                    ...prevFormData.appunits,
                                    enable: e.target.checked,
                                  },
                                }))
                              }
                            />
                            <label className="hidden"></label>
                            <div className="peer h-6 w-11 rounded-full border bg-slate-400 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:dark:border-gray-600 after:bg-white after:transition-all after:content-[''] peer-checked:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-green-300"></div>
                          </label>
                        </div>
                      </div>
                      <div className="md:flex md:items-center mb-1 ">
                        <div className="md:w-1/4  ">
                          <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded  dark:bg-gray-700 dark:text-white">
                            Pool Size
                          </label>
                        </div>
                        <div className="md:w-3/4">
                          <input
                            className="bg-white  border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-800 dark:text-white "
                            id="pool_size"
                            type="number"
                            pattern="[0-9]*"
                            value={formData?.appunits?.pool_size}
                            onChange={(e) =>
                              setFormData((prevFormData) => ({
                                ...prevFormData,
                                appunits: {
                                  ...prevFormData.appunits,
                                  pool_size: e.target.value,
                                },
                              }))
                            }
                            required
                          />
                        </div>
                      </div>
                      <div className="md:flex md:items-center mb-1">
                        <div className="md:w-1/4  ">
                          <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded  dark:bg-gray-700 dark:text-white">
                            ifname
                          </label>
                        </div>
                        <div className="md:w-3/4">
                          <input
                            className="font-thin border-2 dark:border-gray-600 bg-gray-100 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-700 dark:text-white "
                            id="ifname"
                            type="text"
                            value={formData?.appunits?.ifname}
                            disabled
                          />
                        </div>
                      </div>
                      <div className="md:flex md:items-center mb-1">
                        <div className="md:w-1/4  ">
                          <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded  dark:bg-gray-700 dark:text-white">
                            Path
                          </label>
                        </div>
                        <div className="md:w-3/4">
                          <input
                            className="bg-gray-100 font-thin border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-700 dark:text-white "
                            id="path"
                            type="text"
                            value={formData?.appunits?.path}
                            disabled
                          />
                        </div>
                      </div>
                      <div className="md:flex md:items-center mb-3 ">
                        <div className="md:w-1/4  ">
                          <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded  dark:bg-gray-700 dark:text-white">
                            name
                          </label>
                        </div>
                        <div className="md:w-3/4">
                          <input
                            className="bg-gray-100 font-thin border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-700 dark:text-white "
                            id="name"
                            type="text"
                            value={formData?.appunits?.name}
                            disabled
                          />
                        </div>
                      </div>

                      <div className="bg-gray-100 flex px-6 py-4 items-center justify-end  rounded-b-lg dark:bg-slate-800 dark:text-white">
                        <button
                          className="px-4 py-1 mr-2 text-gray-600 bg-gray-300 rounded hover:bg-gray-400 focus:shadow-outline focus:outline-none font-bold "
                          onClick={() => {
                            onClose();
                            setPage(1);
                            setFormData({});
                            setFiles({});
                          }}
                        >
                          Close
                        </button>
                        <button
                          type="button"
                          onClick={handlePreviousPage}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-4 mr-2 rounded"
                        >
                          Previous
                        </button>
                        <button
                          type="submit"
                          className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-4 mr-2 rounded"
                        >
                          Submit
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// delete application
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DeleteApp = ({ isOpen, onClose, onSave, children }) => {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto dark:text-white">
          <div
            className="fixed inset-0 bg-black opacity-50 "
            onClick={() => {
              onClose(); // Close the modal when the overlay is clicked
            }}
          ></div>
          <div
            className={`relative z-50 w-full max-w-2xl mx-auto block font-semibold `}
          >
            <div
              className="relative bg-white rounded-lg shadow-lg overflow-auto text-black  dark:text-white dark:bg-slate-700"
              style={{ maxHeight: "93vh" }}
            >
              <div>
                <div className="m-1 shadow-2xl bg-gray-50 rounded-xl p-1 max-h-50vh overflow-auto dark:bg-slate-800">
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 dark:bg-slate-800 dark:text-white">
                    {children}
                  </div>
                  <div className="bg-gray-50 flex px-6 py-2 items-center justify-end  rounded-b-lg dark:bg-slate-800 ">
                    <button
                      className="px-4 py-1 mr-2 text-gray-600 bg-gray-300 rounded hover:bg-gray-400 focus:shadow-outline focus:outline-none font-bold "
                      onClick={() => {
                        onClose();
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSave();
                      }}
                      className="inline-flex w-20 justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-400 sm:ml-3 sm:w-auto"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// view app unit
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AppUnit = ({ isOpen, onClose, onSave, modalData, children }) => {
  const { userType } = useUser();
  const [appUnits, setAppUnits] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (modalData != "") {
          const response = await apiClient.get(
            `application/appunits/${modalData?.cid}/${modalData.zid}`
          );
          if (response?.data) {
            setAppUnits(response.data);
          }
        }
      } catch (error) {
        console.log("error");
      }
    };

    fetchData();
  }, [modalData]);

  //delete app unit
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});

  const handleDelete = (data) => {
    setSelectedItem(data);
    setDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const handleDeleteConf = () => {
    closeDeleteModal();
    deleteAppUnit(
      `application/appunit/${modalData?.cid}/${selectedItem?.zid}/${selectedItem?.id}`
    );
  };

  const deleteAppUnit = async (endpoint: string) => {
    try {
      const response = await apiClient.delete(endpoint);
      if (response.data) {
        toast.success(`App Unit ${selectedItem?.id} deleted successfully`);
        const updatedApps = appUnits.filter(
          (app) => app.id !== selectedItem?.id
        );
        setAppUnits(updatedApps);
        setSelectedItem({});
      } else {
        toast.error(`App Unit ${selectedItem?.id} deleted unsuccessfully`);
      }
    } catch (error) {
      toast.error(`App Unit ${selectedItem?.id} deleted unsuccessfully`);
    }
  };

  //add app unit
  const [addAppUnit, setAddAppUnit] = useState({});

  const handleAAU = (data: unknown) => {
    setAddAppUnit({ status: true, data: data, modalData: modalData });
  };
  const closeAAUModal = () => {
    setAddAppUnit({ status: false, data: {}, modalData: null });
  };

  const handleAAUSave = (data) => {
    const updatedApps = [...appUnits, data];
    setAppUnits(updatedApps);
    setSelectedItem({});
    closeAAUModal();
  };

  //edit app unit
  const [editAppUnit, setEditAppUnit] = useState({});

  const handleEAU = (data: unknown) => {
    setEditAppUnit({
      status: true,
      data: { ...data, cname: modalData.cname, cid: modalData.cid },
    });
  };
  const closeEAUModal = () => {
    setEditAppUnit({ status: false, data: {} });
  };

  const handleEAUSave = (data, id) => {
    const updatedApps = appUnits.map((item) => {
      if (item.id === id) {
        return { ...item, ...data };
      }
      return item;
    });

    setAppUnits(updatedApps);
    closeEAUModal();
  };

  return (
    <>
      <div>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-x-auto overflow-y-auto"
            style={{ marginTop: "16rem" }}
          >
            <div
              onClick={() => {
                onClose();
              }}
              className="fixed inset-0 bg-black opacity-50"
            ></div>
            <div className="flex flex-col ">
              <div
                className="overflow-x-auto  bg-white dark:bg-[#494c57] rounded-lg"
                style={{ width: "60vw", zIndex: 1 }}
              >
                <div className="inline-block min-w-full px-2 ">
                  <div
                    className={`flex ${
                      userType === 0 || userType === 1
                        ? "justify-between"
                        : "justify-center"
                    } items-center p-1 `}
                  >
                    <h3
                      className="text-2xl font-semibold leading-6 text-gray-900  mb-2 dark:text-white"
                      id="modal-title"
                    ></h3>
                    <h3
                      className="text-2xl font-semibold leading-6 text-gray-900 mb-2 dark:text-white"
                      id="modal-title"
                    >
                      App Unit {modalData.zid}
                    </h3>

                    {(userType === 0 || userType === 1) && (
                      <div className="group cursor-pointer relative flex">
                        <button
                          onClick={() => handleAAU(appUnits)}
                          className={
                            "p-1 mr-3 rounded-full cursor-pointer hover:scale-125"
                          }
                        >
                          <AddAppIcon />
                        </button>
                        <div
                          className="text-xs absolute hidden group-hover:block left-0 transform -translate-x-full translate-y-1/8 px-2 py-1 rounded bg-black text-white z-50"
                          style={{
                            width: "max-content",
                            whiteSpace: "nowrap",
                            maxWidth: "200px",
                            zIndex: 1000,
                          }}
                        >
                          Add New App Unit
                          <div className="bg-black w-2.5 h-2.5 rotate-45 absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 right-[-0.625rem]"></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <table className="min-w-full text-left text-sm font-light">
                      <thead className=" font-medium text-white">
                        <tr className="bg-black">
                          <th scope="col" className="px-6 py-4 text-center">
                            #
                          </th>
                          <th scope="col" className="px-6 py-4 text-center">
                            Uname
                          </th>
                          <th scope="col" className="px-6 py-4 text-center">
                            Pool Size
                          </th>
                          <th scope="col" className="px-6 py-4 text-center">
                            Ifname
                          </th>
                          <th scope="col" className="px-6 py-4 text-center">
                            Path
                          </th>
                          <th scope="col" className="px-6 py-4 text-center">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-4 text-center">
                            Status
                          </th>
                          {(userType === 0 || userType === 1) && (
                            <th scope="col" className="px-6 py-4 text-center">
                              Action
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {appUnits.length > 0 && appUnits[0].uname ? (
                          appUnits.map((data, index) => (
                            <tr
                              className={`${
                                index % 2 == 0
                                  ? "bg-[#222E3A]/[5%] dark:bg-[#222E3A]/[50%]"
                                  : "bg-[#222E3A]/[2%] dark:bg-[#222E3A]/[2%]"
                              } hover:bg-amber-50 dark:hover:bg-gray-600 transition duration-200 transform hover:-translate-y-0.5 hover:shadow-lg rounded-xl`}
                              key={index}
                            >
                              <td className="whitespace-nowrap px-6 py-4 font-normal text-center">
                                {index + 1}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 font-normal text-center">
                                {data?.uname}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 font-normal text-center">
                                {data?.pool_size}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 font-normal text-center">
                                {data?.ifname}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 font-normal text-center">
                                {data?.path}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 font-normal text-center min-w-[150px]">
                                {data?.name}
                              </td>
                              <td
                                className={`whitespace-nowrap px-6 py-4 font-bold text-center ${
                                  data?.enable
                                    ? "text-green-600"
                                    : "text-red-600"
                                } min-w-[100px]`}
                              >
                                {data?.enable ? "Active" : "Inactive"}
                              </td>
                              {(userType === 0 || userType === 1) && (
                                <td className="whitespace-nowrap px-6 py-4 font-normal text-center">
                                  <div className="flex items-center justify-center space-x-2">
                                    <button onClick={() => handleEAU(data)}>
                                      <div className="group relative">
                                        <WeelIcon />
                                        <div
                                          className="opacity-0 w-32 bg-black text-white dark:bg-white dark:text-black text-center text-xs rounded-lg py-1 absolute z-10 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 mb-2"
                                          style={{
                                            zIndex: 1,
                                          }}
                                        >
                                          Edit {data?.name.split(".")[0]}
                                          <div
                                            className="bg-black dark:bg-white dark:text-black w-2.5 h-2.5 rotate-45 absolute bottom-[-0.625rem] left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                            style={{
                                              zIndex: 1,
                                            }}
                                          ></div>
                                        </div>
                                      </div>
                                    </button>
                                    <button onClick={() => handleDelete(data)}>
                                      <div className="group relative">
                                        <DeleteIcon />
                                        <div
                                          className="opacity-0 w-32 bg-black text-white dark:bg-white dark:text-black text-center text-xs rounded-lg py-1 absolute z-10 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 mb-2"
                                          style={{
                                            zIndex: 1,
                                          }}
                                        >
                                          Delete {data?.name.split(".")[0]}
                                          <div
                                            className="bg-black dark:bg-white dark:text-black w-2.5 h-2.5 rotate-45 absolute bottom-[-0.625rem] left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                            style={{
                                              zIndex: 1,
                                            }}
                                          ></div>
                                        </div>
                                      </div>
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="8"
                              className="whitespace-nowrap px-6 py-4 font-normal text-center"
                            >
                              No data found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end items-center">
                    <div className="flex py-1 items-center justify-end rounded-b-lg">
                      <button
                        className="px-4 py-1 text-gray-600 dark:bg-slate-700 dark:hover:bg-gray-400 dark:text-white bg-gray-300 rounded hover:bg-gray-400 focus:shadow-outline focus:outline-none font-bold cursor-pointer"
                        onClick={() => {
                          onClose();
                        }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {deleteModalOpen && (
        <DeleteApp
          isOpen={deleteModalOpen}
          onClose={closeDeleteModal}
          onSave={handleDeleteConf}
        >
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <WarningIcon />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3
                className="text-2xl font-semibold leading-6 text-gray-900 dark:text-gray-200"
                id="modal-title"
              >
                Delete {selectedItem?.uname} App Unit
              </h3>
              <div className="mt-2">
                <p className="text-md text-gray-500 dark:text-white">
                  Are you sure to delete this App Unit? All of data will be
                  permanently removed. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </DeleteApp>
      )}
      {addAppUnit?.status && (
        <AddAppUnit
          isOpen={addAppUnit?.status}
          onClose={closeAAUModal}
          onSave={handleAAUSave}
          allZau={addAppUnit?.data}
          modalData={addAppUnit?.modalData}
        />
      )}
      {editAppUnit?.status && (
        <EditAppUnit
          isOpen={editAppUnit?.status}
          onClose={closeEAUModal}
          onSave={handleEAUSave}
          modalData={editAppUnit?.data}
          appUnits={appUnits}
        />
      )}
    </>
  );
};

//add new app unit
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AddAppUnit = ({
  isOpen,
  onClose,
  onSave,
  allZau,
  modalData,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  children,
}) => {
  const [formData, setFormData] = useState({
    uname: "",
    enable: 1,
    pool_size: 1,
    ifname: "",
    path: "",
    name: "",
  });
  const [files, setFiles] = useState({});
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append(
      "appunit_data",
      JSON.stringify({
        ...formData,
        cname: modalData.cname,
      })
    );
    formDataToSend.append("file", files.preview);
    // formDataToSend.append("fileb", files);
    try {
      const response = await apiClient.postFile(
        `application/appunit/${modalData.cid}/${modalData.zid}`,
        formDataToSend
      );
      if (response.data) {
        toast.success(`App Unit ${formData.uname} added successfully`);
        onClose();
        onSave(response.data[0]);
        setFormData({});
        setFiles({});
      } else {
        toast.error("App Unit  added unsuccessfull");
        onClose();
        setFormData({});
        setFiles({});
      }
    } catch (error) {
      console.log("error");
      toast.error("App Unit  added unsuccessfull");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleClear = () => {
    setFormData({});
  };

  //upload file =======================================

  const addFile = (file) => {
    if (
      file.type === "application/zip" ||
      file.type === "application/x-zip-compressed"
    ) {
      const filename = file.name.slice(0, file.name.lastIndexOf("."));
      setFormData((prevFormData) => ({
        ...prevFormData,
        ifname: "IZAppUnit",
        path: `zappunits/${filename}/`,
        name: `${filename}.so`,
      }));

      setFiles({
        ...files,
        preview: file,
      });
    } else {
      // Notify the user that only zip files are allowed
      setFormData((prevFormData) => ({
        ...prevFormData,
        ifname: "",
        path: "",
        name: "",
      }));
      toast.info("Zip file only allowed");
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const fileList = [...event.dataTransfer.files];
    fileList.forEach((file) => addFile(file));
  };

  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      const fileList = [...event.target.files];
      fileList.forEach((file) => addFile(file));
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDelete = (preview) => {
    setFiles({});
    setFormData((prevFormData) => ({
      ...prevFormData,
      ifname: "",
      path: "",
      name: "",
    }));
  };

  const validateUname = (e) => {
    const { value } = e.target;

    const isUnique =
      !allZau?.length ||
      !allZau.some((data) => data.uname.toLowerCase() === value.toLowerCase());

    if (isUnique) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        uname: value,
      }));
      setError("");
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        uname: value,
      }));
      setError("This username already exists.");
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto ">
          <div
            className="fixed inset-0 bg-black opacity-50"
            onClick={() => {
              onClose();
              setFormData({});
              setFiles({});
            }}
          ></div>
          <div
            className={`relative z-50 w-full max-w-2xl mx-auto block font-semibold `}
          >
            <div
              className="relative bg-white rounded-lg shadow-lg overflow-auto text-black dark:bg-slate-800 "
              style={{ maxHeight: "93vh" }}
            >
              <div>
                <p className="flex items-center justify-center flex-col text-2xl bg-gray-200  pb-3 pt-3 dark:bg-slate-700 dark:text-white">
                  Add App Unit
                </p>
                <div className="m-1 shadow-2xl bg-gray-50 rounded-xl p-1 max-h-50vh overflow-auto dark:bg-slate-800 pr-4">
                  <form
                    className="mx-auto dark:bg-slate-800 "
                    onSubmit={handleSubmit}
                  >
                    <div className="md:flex md:items-center mb-1 dark:bg-slate-800 ">
                      <div className="md:w-1/4">
                        <label className="block text-gray-500 dark:text-white font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded  dark:bg-gray-700 ">
                          Unit Name
                        </label>
                      </div>
                      <div className="md:w-3/4 dark:bg-slate-800 ">
                        {error && (
                          <small
                            className="text-red-500 md:w-3/4"
                            style={{
                              position: "fixed",
                              display: "block",
                              width: "460px",
                              textAlign: "end",
                            }}
                          >
                            {error}
                          </small>
                        )}
                        <input
                          className={`bg-white appearance-none border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-800 dark:text-white  
                          ${
                            error
                              ? "border-red-500 placeholder-red-500 text-red-500"
                              : "dark:border-gray-600"
                          }`}
                          id="uname"
                          type="text"
                          value={formData?.uname}
                          onChange={validateUname}
                          required
                        />
                      </div>
                    </div>
                    <div className="md:flex md:items-center mb-1 dark:bg-slate-800 ">
                      <div className="md:w-1/4  ">
                        <label className="block text-gray-500 dark:text-white font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded  dark:bg-gray-700 ">
                          Status
                        </label>
                      </div>
                      <div className="md:w-3/4">
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            id="switch"
                            type="checkbox"
                            className="peer sr-only "
                            value={formData?.enable}
                            onChange={(e) =>
                              setFormData((prevFormData) => ({
                                ...prevFormData,
                                enable: e.target.checked,
                              }))
                            }
                          />
                          <label className="hidden"></label>
                          <div className="peer h-6 w-11 rounded-full border bg-slate-400 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:dark:border-gray-600 after:bg-white after:transition-all after:content-[''] peer-checked:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-green-300 dark:bg-slate-700 "></div>
                        </label>
                      </div>
                    </div>
                    <div className="md:flex md:items-center mb-1 dark:bg-slate-800 ">
                      <div className="md:w-1/4  ">
                        <label className="block text-gray-500 dark:text-white font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded  dark:bg-gray-700 ">
                          Pool Size
                        </label>
                      </div>
                      <div className="md:w-3/4">
                        <input
                          className="bg-white  border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-800 dark:text-white leading-tight focus:outline-none focus:bg-white dark:bg-slate-800 "
                          id="pool_size"
                          type="number"
                          pattern="[0-9]*"
                          value={formData?.pool_size}
                          onChange={(e) =>
                            setFormData((prevFormData) => ({
                              ...prevFormData,
                              pool_size: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                    </div>

                    {Object.keys(files).length > 0 && (
                      <>
                        <div className="md:flex md:items-center mb-1">
                          <div className="md:w-1/4  ">
                            <label className="block text-gray-500 dark:text-white font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded  dark:bg-gray-700 ">
                              ifname
                            </label>
                          </div>
                          <div className="md:w-3/4">
                            <input
                              className=" font-thin border-2 dark:border-gray-600 bg-gray-100 dark:bg-slate-700  rounded w-full py-2 px-4 text-gray-700 dark:text-white leading-tight focus:outline-none focus:bg-white "
                              id="ifname"
                              type="text"
                              value={formData?.ifname}
                              disabled
                            />
                          </div>
                        </div>
                        <div className="md:flex md:items-center mb-1">
                          <div className="md:w-1/4  ">
                            <label className="block text-gray-500 dark:text-white font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 dark:bg-slate-700 py-2 px-4 mr-1 rounded">
                              Path
                            </label>
                          </div>
                          <div className="md:w-3/4">
                            <input
                              className="bg-gray-100 dark:bg-slate-700 font-thin border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-700 dark:text-white leading-tight focus:outline-none focus:bg-white "
                              id="path"
                              type="text"
                              value={formData?.path}
                              disabled
                            />
                          </div>
                        </div>
                        <div className="md:flex md:items-center mb-1">
                          <div className="md:w-1/4  ">
                            <label className="block text-gray-500 dark:text-white font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 dark:bg-slate-700 py-2 px-4 mr-1 rounded">
                              name
                            </label>
                          </div>
                          <div className="md:w-3/4">
                            <input
                              className="bg-gray-100 dark:bg-slate-700 font-thin border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-700 dark:text-white leading-tight focus:outline-none focus:bg-white "
                              id="name"
                              type="text"
                              value={formData?.name || ""}
                              disabled
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div
                      className=""
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <main className="container mx-auto max-w-screen-lg ">
                        <div
                          id="overlay"
                          className="w-full h-full absolute top-0 left-0 pointer-events-none z-50 flex flex-col items-center justify-center rounded-md "
                          style={{
                            paddingTop:
                              Object.keys(files).length <= 0 ? "7%" : "25%",
                          }}
                        >
                          <i>
                            <svg
                              className="fill-current w-12 h-12 mb-3 text-blue-700 dark:text-blue-500"
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                            >
                              <path d="M19.479 10.092c-.212-3.951-3.473-7.092-7.479-7.092-4.005 0-7.267 3.141-7.479 7.092-2.57.463-4.521 2.706-4.521 5.408 0 3.037 2.463 5.5 5.5 5.5h13c3.037 0 5.5-2.463 5.5-5.5 0-2.702-1.951-4.945-4.521-5.408zm-7.479-1.092l4 4h-3v4h-2v-4h-3l4-4z" />
                            </svg>
                          </i>
                          <p className="text-lg text-blue-700 dark:text-blue-500">
                            <span>Drag and drop files anywhere or</span>
                          </p>
                          <p className="text-lg text-blue-700 dark:text-blue-500">
                            <span>Upload a file</span>
                          </p>
                        </div>
                        <section className="h-full  p-8 pt-4 pb-2 w-full  flex flex-col">
                          <header className="border-dashed border-2 border-gray-400  flex flex-col justify-center items-center">
                            <input
                              id="hidden-input"
                              type="file"
                              multiple
                              className="cursor-pointer relative  opacity-0 w-full h-full py-12 z-50"
                              onChange={handleFileChange}
                              onClick={handleFileChange}
                            />
                          </header>

                          <ul id="gallery" className="h-24">
                            {Object.keys(files).length === 0 && (
                              <li
                                id="empty"
                                className=" text-center flex flex-col "
                              >
                                <img
                                  className="mx-auto w-20"
                                  src={UploadImg}
                                  alt="no data"
                                />
                                <span className="text-small text-gray-500 dark:text-gray-300">
                                  No files selected
                                </span>
                              </li>
                            )}
                            {Object.keys(files).map((preview) => (
                              <li
                                key={preview}
                                className="block p-1 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/6 xl:w-1/8 h-24"
                              >
                                <article
                                  tabIndex={0}
                                  className="group w-full h-full rounded-md focus:outline-none focus:shadow-outline elative bg-gray-100 dark:bg-slate-400 relative shadow-sm"
                                >
                                  <img
                                    alt="upload preview"
                                    className="img-preview hidden w-full h-full sticky object-cover rounded-md bg-fixed"
                                    src={URL.createObjectURL(files[preview])}
                                  />
                                  <section className="flex flex-col rounded-md text-xs break-words w-full h-full z-20 absolute top-0 py-2 px-3">
                                    <h1 className="flex-1 group-hover:text-blue-800 font-bold">
                                      {files[preview].name}
                                    </h1>
                                    <div className="flex">
                                      <span className="p-1 text-blue-600">
                                        <UploadIcon />
                                      </span>
                                      <p className="p-1 size text-xs text-gray-700 dark:text-black">
                                        {files[preview].size > 1024
                                          ? files[preview].size > 1048576
                                            ? Math.round(
                                                files[preview].size / 1048576
                                              ) + "mb"
                                            : Math.round(
                                                files[preview].size / 1024
                                              ) + "kb"
                                          : files[preview].size + "b"}
                                      </p>
                                      <button
                                        className="delete ml-auto focus:outline-none hover:scale-125 p-1 rounded-md text-gray-800"
                                        onClick={() => handleDelete(preview)}
                                      >
                                        <PreviewIcon />
                                      </button>
                                    </div>
                                  </section>
                                </article>
                              </li>
                            ))}
                          </ul>
                        </section>
                      </main>
                    </div>
                    <div className=" flex py-4 items-center justify-end  rounded-b-lg  ">
                      <button
                        className="px-4 py-1 mr-2 text-gray-600 bg-gray-300 rounded hover:bg-gray-400 focus:shadow-outline focus:outline-none font-bold  "
                        onClick={() => {
                          onClose();
                          setFormData({});
                          setFiles({});
                        }}
                      >
                        Close
                      </button>
                      <button
                        type="submit"
                        className={`bg-green-500  hover:bg-green-700 text-white dark:text-white font-bold py-1 px-4 mr-2 rounded ${
                          error || Object.keys(files).length === 0
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        disabled={error}
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// edit app unit
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EditAppUnit = ({
  isOpen,
  onClose,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSave,
  modalData,
  appUnits,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  children,
}) => {
  const [formData, setFormData] = useState({
    zid: modalData.zid,
    uname: modalData.uname,
    enable: modalData.enable,
    pool_size: modalData.pool_size,
    cname: modalData.cname,
    ifname: "",
    path: "",
    name: "",
  });
  const [files, setFiles] = useState({});
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.preview) {
      const formDataToSend = new FormData();
      formDataToSend.append("appunit_data", JSON.stringify(formData));
      formDataToSend.append("file", files.preview);
      // formDataToSend.append("fileb", files);
      try {
        const response = await apiClient.postFile(
          `application/appunit/${modalData.cid}/${formData.zid}/${modalData.id}`,
          formDataToSend
        );
        if (response.data) {
          toast.success(`App Unit ${formData.uname} updated successfully`);
          onClose();
          onSave(formData, modalData.id);
          setFormData({});
          setFiles({});
        } else {
          toast.error(`App Unit ${formData.uname} updated  unsuccessfull`);
          onClose();
          setFormData({});
          setFiles({});
        }
      } catch (error) {
        console.log("error");
        toast.error(`App Unit ${formData.uname} updated  unsuccessfull`);
      }
    } else {
      try {
        const response = await apiClient.put(
          `application/appunit/${modalData.cid}/${formData.zid}/${modalData.id}`,
          formData
        );
        if (response.data) {
          toast.success(`App Unit ${formData.uname} updated successfully`);
          onClose();
          onSave(
            {
              ...formData, // Spread the current state
              ifname: modalData.ifname,
              name: modalData.name,
              path: modalData.path,
            },
            modalData.id
          );
          setFormData({});
          setFiles({});
        } else {
          toast.error(`App Unit ${formData.uname} updated unsuccessfully`);
          onClose();
          setFormData({});
          setFiles({});
        }
      } catch (error) {
        console.log("error");
        toast.error(`App Unit ${formData.uname} updated unsuccessfully`);
      }
    }
  };

  //upload file =======================================

  const addFile = (file) => {
    if (
      file.type === "application/zip" ||
      file.type === "application/x-zip-compressed"
    ) {
      const filename = file.name.slice(0, file.name.lastIndexOf("."));
      setFormData((prevFormData) => ({
        ...prevFormData,
        ifname: "IZAppUnit",
        path: `zappunits/${filename}/`,
        name: `${filename}.so`,
      }));

      setFiles({
        ...files,
        preview: file,
      });
    } else {
      // Notify the user that only zip files are allowed
      setFormData((prevFormData) => ({
        ...prevFormData,
        ifname: "",
        path: "",
        name: "",
      }));
      toast.info("Zip file only allowed");
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const fileList = [...event.dataTransfer.files];
    fileList.forEach((file) => addFile(file));
  };

  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      const fileList = [...event.target.files];
      fileList.forEach((file) => addFile(file));
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDelete = (preview) => {
    setFiles({});
    setFormData((prevFormData) => ({
      ...prevFormData,
      ifname: "",
      path: "",
      name: "",
    }));
  };

  const validateUname = (e) => {
    const { value } = e.target;

    const isUnique = !appUnits.some((data) => {
      if (modalData.uname.toLowerCase() === value.toLowerCase()) {
        return false;
      } else if (data.uname.toLowerCase() === value.toLowerCase()) {
        return true;
      }
    });

    if (isUnique) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        uname: value,
      }));
      setError("");
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        uname: value,
      }));
      setError("This username already exists.");
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto ">
          <div
            onClick={() => {
              onClose();
              setFormData({});
              setFiles({});
            }}
            className="fixed inset-0 bg-black opacity-50"
          ></div>
          <div
            className={`relative z-50 w-full max-w-2xl mx-auto block font-semibold `}
          >
            <div
              className="relative bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-auto text-black"
              style={{ maxHeight: "93vh" }}
            >
              <div>
                <div className="relative dark:text-white dark:bg-slate-700 flex items-center justify-between bg-gray-200 p-3">
                  <p className="flex-grow text-center text-2xl">
                    Edit {formData?.zid} App Unit
                  </p>
                  <div
                    className="absolute right-3 cursor-pointer "
                    onClick={() => {
                      onClose();
                      setFormData({});
                      setFiles({});
                    }}
                  >
                    <CloseIcon />
                  </div>
                </div>
                <div className="m-1 dark:bg-slate-800 shadow-2xl bg-gray-50 rounded-xl p-1 max-h-50vh overflow-auto ">
                  <form className="mx-auto " onSubmit={handleSubmit}>
                    <div className="md:flex md:items-center mb-1 ">
                      <div className="md:w-1/4  ">
                        <label className="block text-gray-500  border-2 dark:border-gray-700 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded  dark:bg-gray-700 dark:text-white">
                          Unit Name
                        </label>
                      </div>
                      <div className="md:w-3/4">
                        {error && (
                          <small
                            className="text-red-500 md:w-3/4 "
                            style={{
                              position: "fixed",
                              display: "block",
                              width: "460px",
                              textAlign: "end",
                            }}
                          >
                            {error}
                          </small>
                        )}
                        <input
                          className={`bg-white appearance-none border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-800 dark:text-white 
                            ${
                              error
                                ? "border-red-500 placeholder-red-500 text-red-500"
                                : "dark:border-gray-600"
                            }`}
                          id="uname"
                          name="uname"
                          type="text"
                          value={formData?.uname}
                          onChange={validateUname}
                          required
                        />
                      </div>
                    </div>
                    <div className="md:flex md:items-center mb-1 ">
                      <div className="md:w-1/4  ">
                        <label className="block text-gray-500 border-2 dark:dark:border-gray-600 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded  dark:bg-gray-700 dark:text-white">
                          Status
                        </label>
                      </div>
                      <div className="md:w-3/4">
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            id="switch"
                            type="checkbox"
                            className="peer sr-only"
                            value={formData?.enable}
                            checked={formData?.enable}
                            onChange={(e) =>
                              setFormData((prevFormData) => ({
                                ...prevFormData,
                                enable: e.target.checked,
                              }))
                            }
                          />

                          <label className="hidden"></label>
                          <div className="peer h-6 w-11 rounded-full border dark:text-white bg-slate-400 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:dark:border-gray-600 after:bg-white after:transition-all after:content-[''] peer-checked:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-green-300"></div>
                        </label>
                      </div>
                    </div>
                    <div className="md:flex md:items-center mb-1">
                      <div className="md:w-1/4  ">
                        <label className="block text-gray-500  border-2 dark:dark:border-gray-700 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded  dark:bg-gray-700 dark:text-white">
                          Pool Size
                        </label>
                      </div>
                      <div className="md:w-3/4">
                        <input
                          className="bg-white   border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-800 dark:text-white "
                          id="pool_size"
                          type="number"
                          pattern="[0-9]*"
                          value={formData?.pool_size}
                          onChange={(e) =>
                            setFormData((prevFormData) => ({
                              ...prevFormData,
                              pool_size: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                    </div>

                    {Object.keys(files).length > 0 && (
                      <>
                        <div className="md:flex md:items-center mb-1">
                          <div className="md:w-1/4  ">
                            <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded  dark:bg-gray-700 dark:text-white">
                              ifname
                            </label>
                          </div>
                          <div className="md:w-3/4">
                            <input
                              className=" font-thin border-2 dark:border-gray-600 bg-gray-100 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-700 dark:text-white "
                              id="ifname"
                              type="text"
                              value={formData?.ifname}
                              disabled
                            />
                          </div>
                        </div>
                        <div className="md:flex md:items-center mb-1">
                          <div className="md:w-1/4  ">
                            <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded  dark:bg-gray-700 dark:text-white">
                              Path
                            </label>
                          </div>
                          <div className="md:w-3/4">
                            <input
                              className="bg-gray-100 font-thin border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-700 dark:text-white "
                              id="path"
                              type="text"
                              value={formData?.path}
                              disabled
                            />
                          </div>
                        </div>
                        <div className="md:flex md:items-center mb-1">
                          <div className="md:w-1/4  ">
                            <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded  dark:bg-gray-700 dark:text-white">
                              name
                            </label>
                          </div>
                          <div className="md:w-3/4">
                            <input
                              className="bg-gray-100 font-thin border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-700 dark:text-white "
                              id="name"
                              type="text"
                              value={formData?.name || ""}
                              disabled
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div
                      className=""
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <main className="container mx-auto max-w-screen-lg ">
                        <div
                          id="overlay"
                          className="w-full h-full absolute top-0 left-0 pointer-events-none z-50 flex flex-col items-center justify-center rounded-md "
                          style={{
                            paddingTop:
                              Object.keys(files).length <= 0 ? "7%" : "25%",
                          }}
                        >
                          <i>
                            <svg
                              className="fill-current w-12 h-12 mb-3 text-blue-700"
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                            >
                              <path d="M19.479 10.092c-.212-3.951-3.473-7.092-7.479-7.092-4.005 0-7.267 3.141-7.479 7.092-2.57.463-4.521 2.706-4.521 5.408 0 3.037 2.463 5.5 5.5 5.5h13c3.037 0 5.5-2.463 5.5-5.5 0-2.702-1.951-4.945-4.521-5.408zm-7.479-1.092l4 4h-3v4h-2v-4h-3l4-4z" />
                            </svg>
                          </i>
                          <p className="text-lg text-blue-700 dark:text-blue-500">
                            <span>Drag and drop files anywhere or</span>
                          </p>
                          <p className="text-lg text-blue-700 dark:text-blue-500">
                            <span>Upload a file</span>
                          </p>
                        </div>
                        <section className="h-full  p-8 pt-4 pb-2 w-full  flex flex-col">
                          <header className="border-dashed border-2 border-gray-400  flex flex-col justify-center items-center">
                            <input
                              id="hidden-input"
                              type="file"
                              multiple
                              className="cursor-pointer relative  opacity-0 w-full h-full py-12 z-50"
                              onChange={handleFileChange}
                              onClick={handleFileChange}
                            />
                          </header>

                          <ul id="gallery" className="h-24">
                            {Object.keys(files).length === 0 && (
                              <li
                                id="empty"
                                className=" text-center flex flex-col "
                              >
                                <img
                                  className="mx-auto w-20"
                                  src={UploadImg}
                                  alt="no data"
                                />
                                <span className="text-small text-gray-500 dark:text-gray-300">
                                  No files selected
                                </span>
                              </li>
                            )}
                            {Object.keys(files).map((preview) => (
                              <li
                                key={preview}
                                className="block p-1 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/6 xl:w-1/8 h-24"
                              >
                                <article
                                  tabIndex={0}
                                  className="group w-full h-full rounded-md focus:outline-none focus:shadow-outline elative bg-gray-100 cursor-pointer relative shadow-sm"
                                >
                                  <img
                                    alt="upload preview"
                                    className="img-preview hidden w-full h-full sticky object-cover rounded-md bg-fixed"
                                    src={URL.createObjectURL(files[preview])}
                                  />
                                  <section className="flex flex-col rounded-md text-xs break-words w-full h-full z-20 absolute top-0 py-2 px-3">
                                    <h1 className="flex-1 group-hover:text-blue-800">
                                      {files[preview].name}
                                    </h1>
                                    <div className="flex">
                                      <span className="p-1 text-blue-800">
                                        <i>
                                          <UploadIcon />
                                        </i>
                                      </span>
                                      <p className="p-1 size text-xs text-gray-700">
                                        {files[preview].size > 1024
                                          ? files[preview].size > 1048576
                                            ? Math.round(
                                                files[preview].size / 1048576
                                              ) + "mb"
                                            : Math.round(
                                                files[preview].size / 1024
                                              ) + "kb"
                                          : files[preview].size + "b"}
                                      </p>
                                      <button
                                        className="delete ml-auto focus:outline-none hover:bg-gray-200 p-1 rounded-md text-gray-800"
                                        onClick={() => handleDelete(preview)}
                                      >
                                        <PreviewIcon />
                                      </button>
                                    </div>
                                  </section>
                                </article>
                              </li>
                            ))}
                          </ul>
                        </section>
                      </main>
                    </div>
                    <div className="bg-gray-100 dark:bg-slate-800 flex px-6 py-4 items-center justify-end  rounded-b-lg">
                      <button
                        className="px-4 py-1 mr-2 text-gray-600 bg-gray-300 rounded hover:bg-gray-400 focus:shadow-outline focus:outline-none font-bold "
                        onClick={() => {
                          onClose();
                          setFormData({});
                          setFiles({});
                        }}
                      >
                        Close
                      </button>
                      <button
                        type="submit"
                        className={`bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-4 mr-2 rounded ${
                          error ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={error}
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Application;
