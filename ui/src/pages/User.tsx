import React, { useEffect, useState, useRef, useMemo } from "react";
import Header from "../components/Header";
import Login from "./Login";
import apiClient from "../services/ApiService";
import {
  DeleteIcon,
  WarningIcon,
  UsersIcon,
  UserPlusIcon,
} from "../assets/icons";
import { RightArrowIcon, LeftArrowIcon, WeelIcon } from "../assets/icons";
import { useUser } from "../context/UserContext";
import { toast } from "react-toastify";

const User = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { userType, setUserType } = useUser();
  const [users, setUsers] = useState([]);
  const [companyList, setCompanyList] = useState([]);

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dropdownRef = useRef(null);
  const nextPage = () => {
    const startIndex = rowsLimit * (currentPage + 1);
    const endIndex = startIndex + rowsLimit;
    const newArray = users.slice(startIndex, endIndex);
    setRowsToShow(newArray);
    setCurrentPage(currentPage + 1);
  };
  const changePage = (value) => {
    const startIndex = value * rowsLimit;
    const endIndex = startIndex + rowsLimit;
    const newArray = users.slice(startIndex, endIndex);
    setRowsToShow(newArray);
    setCurrentPage(value);
  };
  const previousPage = () => {
    const startIndex = (currentPage - 1) * rowsLimit;
    const endIndex = startIndex + rowsLimit;
    const newArray = users.slice(startIndex, endIndex);
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
          const data = await getUsers("user");
          const updatedUsers = data?.filter((user) => user.uid != null);
          if (updatedUsers) {
            setUsers(updatedUsers);
            setProductList(updatedUsers);
            setRowsToShow(updatedUsers.slice(0, rowsLimit));
            setTotalPage(Math.ceil(updatedUsers.length / rowsLimit));
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
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getUsers = async (endpoint: string) => {
    try {
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      toast.error("retreived users failed");
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

  const [addModalOpen, setAddModalOpen] = useState(false);

  const handleAdd = () => {
    if (companyList.length > 0) {
      setAddModalOpen(true);
    } else {
      toast.error("Create a Company first");
    }
  };
  const closeAddModal = () => {
    setAddModalOpen(false);
  };

  const handleAddSave = (newData) => {
    // Your save logic here
    closeAddModal();
    const updatedUsers = [...users, newData];
    setUsers(updatedUsers);
    setProductList(updatedUsers);
    setRowsToShow(
      updatedUsers.slice(currentPage * rowsLimit, (currentPage + 1) * rowsLimit)
    );
    setTotalPage(Math.ceil(updatedUsers.length / rowsLimit));
    setSelectedItem({});
  };

  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleEdit = (data) => {
    setEditModalOpen({ status: true, data: data });
  };
  const closeEditModal = () => {
    setEditModalOpen({ status: false, data: [] });
  };

  const handleEditSave = (newData) => {
    closeEditModal({ status: false, data: [] });
    const updatedUsers = users?.map((user) =>
      user.uid === newData.uid ? newData : user
    );

    setUsers(updatedUsers);
    setProductList(updatedUsers);
    setRowsToShow(
      updatedUsers.slice(currentPage * rowsLimit, (currentPage + 1) * rowsLimit)
    );
    setTotalPage(Math.ceil(updatedUsers.length / rowsLimit));
    setSelectedItem({});
  };

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});

  const handleDelete = (data) => {
    setSelectedItem(data);
    setDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const handleDeleteSave = () => {
    closeDeleteModal();
    deleteUser(`user/${selectedItem.aid}`);
  };

  const deleteUser = async (endpoint: string) => {
    try {
      const response = await apiClient.delete(endpoint);
      if (response.data) {
        const updatedUsers = users.filter(
          (user) => user.cid !== selectedItem.cid
        );
        setUsers(updatedUsers);
        setProductList(updatedUsers);
        setRowsToShow(
          updatedUsers.slice(
            currentPage * rowsLimit,
            (currentPage + 1) * rowsLimit
          )
        );
        setTotalPage(Math.ceil(updatedUsers.length / rowsLimit));
        setSelectedItem({});
        if (currentPage > 0 && updatedUsers.length <= currentPage * rowsLimit) {
          setCurrentPage(currentPage - 1);
          setRowsToShow(
            updatedUsers.slice(
              (currentPage - 1) * rowsLimit,
              currentPage * rowsLimit
            )
          );
        }
      }
    } catch (error) {
      console.log("error");
      toast.error("Delete user failed");
    }
  };

  return (
    <>
      <div className="flex h-screen overflow-hidden  ">
        <div className="relative flex flex-col flex-1 overflow-y-hidden overflow-x-hidden">
          <Header />
          <div className="min-h-screen h-full bg-blue-50 flex justify-center dark:bg-slate-600  overflow-y-auto mt-6">
            <div className="w-full px-2 pl-5 pr-5 pt-5 pb-5 overflow-scroll">
              <div className="flex justify-between items-center">
                <div className="flex ">
                  <UsersIcon />
                  <h1 className="text-2xl font-medium flex ml-2">Users</h1>
                </div>
                {(userType === 0 || userType === 1) && (
                  <div className="group cursor-pointer relative flex ">
                    <button
                      onClick={() => handleAdd()}
                      className={
                        "p-1 mr-3 rounded-full  cursor-pointer hover:scale-125"
                      }
                    >
                      <UserPlusIcon />
                    </button>
                    <div className="text-xs w-28 absolute hidden group-hover:block left-0 transform -translate-x-full -translate-y-1/2 px-2 py-1 rounded bg-black text-white z-50">
                      Add New User
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
                      <th className="py-3 px-3  dark:text-white sm:text-base font-bold whitespace-nowrap justify-center text-center">
                        #
                      </th>
                      <th className="py-3 px-3  dark:text-white sm:text-base font-bold whitespace-nowrap justify-center text-center">
                        User Name
                      </th>
                      <th className="py-3 px-3  dark:text-white sm:text-base font-bold whitespace-nowrap justify-center text-center">
                        User Type
                      </th>
                      <th className="py-3 px-3   dark:text-white sm:text-base font-bold whitespace-nowrap justify-center text-center">
                        Email
                      </th>
                      <th className="py-3 px-3  dark:text-white sm:text-base font-bold whitespace-nowrap justify-center text-center">
                        Company
                      </th>
                      <th className="py-3 px-3  dark:text-white sm:text-base font-bold whitespace-nowrap justify-center text-center">
                        Status
                      </th>
                      <th
                        className="flex items-center py-3 px-3  dark:text-white sm:text-base font-bold whitespace-nowrap justify-center text-center gap-1"
                        style={{ justifyContent: "space-around" }}
                      >
                        Action
                      </th>
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
                        <td
                          className={`py-5 px-4 text-base font-normal  whitespace-nowrap justify-center text-center`}
                        >
                          {data?.name}
                        </td>
                        <td
                          className={`py-5 px-4 text-base font-normal  whitespace-nowrap justify-center text-center`}
                        >
                          {data?.utid === 0
                            ? "System Admin"
                            : data?.utid === 1
                            ? "Admin"
                            : data?.utid === 2
                            ? "User"
                            : ""}
                        </td>
                        <td
                          className={`py-5 px-4 text-base font-normal whitespace-nowrap justify-center text-center `}
                        >
                          {data?.email}
                        </td>
                        <td
                          className={`py-5 px-4 text-base font-normal  whitespace-nowrap justify-center text-center`}
                        >
                          {data?.cid === "*" ? "***" : data?.cname}
                        </td>
                        <td
                          className={`py-5 px-4 text-base font-bold  whitespace-nowrap justify-center text-center ${
                            data?.enable ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {data?.enable ? "Active" : "Inactive"}
                        </td>

                        <td
                          className={`py-5 px-4 text-base font-normal justify-center text-center `}
                        >
                          <div className="flex items-center justify-center text-center">
                            {userType === 0 ||
                            (userType === 1 && data.utid != 1) ||
                            data.uid ===
                              JSON.parse(sessionStorage.getItem("userData"))
                                ?.userId ? (
                              <button onClick={() => handleEdit(data)}>
                                <div className="group relative ">
                                  <WeelIcon />
                                  <div className="opacity-0 w-24 bg-black text-white text-center align-middle text-xs rounded-lg py-1 absolute z-10 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none">
                                    Edit {data?.name}
                                    <div className="bg-black w-2.5 h-2.5 rotate-45 absolute bottom-[-0.625rem] left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                                  </div>
                                </div>
                              </button>
                            ) : (
                              <button disabled className="cursor-not-allowed">
                                <div className="group relative opacity-50 cursor-not-allowed">
                                  <WeelIcon props="cursor-not-allowed" />
                                </div>
                              </button>
                            )}
                            {userType === 0 ||
                            (userType === 1 && data.utid != 1) ? (
                              <button
                                onClick={
                                  data.cid !== "*"
                                    ? () => handleDelete(data)
                                    : null
                                }
                                className={`${
                                  data.cid === "*"
                                    ? "cursor-not-allowed opacity-50"
                                    : ""
                                }`}
                                disabled={data.cid === "*"}
                              >
                                <div className="group relative ">
                                  <DeleteIcon
                                    props={
                                      data.cid === "*"
                                        ? "cursor-not-allowed"
                                        : "cursor-pointer"
                                    }
                                  />
                                  <div className="opacity-0 w-24 bg-black text-white text-center align-middle text-xs rounded-lg py-1 absolute z-10 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none">
                                    Delete {data?.name}
                                    <div className="bg-black w-2.5 h-2.5 rotate-45 absolute bottom-[-0.625rem] left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                                  </div>
                                </div>
                              </button>
                            ) : (
                              userType === 1 && (
                                <button disabled className="cursor-not-allowed">
                                  <div className="group relative opacity-50">
                                    <DeleteIcon props="cursor-not-allowed" />
                                  </div>
                                </button>
                              )
                            )}
                          </div>
                        </td>
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
                          ? "dark:bg-slate-600 bg-[#d5ddee] pointer-events-none"
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
                          ? "dark:bg-slate-600 bg-[#d5ddee] pointer-events-none"
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
        <AddUserForm
          isOpen={addModalOpen}
          onClose={closeAddModal}
          onSave={handleAddSave}
        />
      )}
      {deleteModalOpen && (
        <DeleteUser
          isOpen={deleteModalOpen}
          onClose={closeDeleteModal}
          onSave={handleDeleteSave}
        >
          <div className="sm:flex sm:items-start dark:bg-slate-800 dark:text-white">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <WarningIcon />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left ">
              <h3
                className="text-2xl font-semibold leading-6 text-gray-900 dark:text-gray-200"
                id="modal-title"
              >
                Delete User
              </h3>
              <div className="mt-2">
                <p className="text-md text-gray-500 dark:text-white">
                  Are you sure to delete this User {selectedItem?.name} ? All of
                  data will be permanently removed. This action cannot be
                  undone.
                </p>
              </div>
            </div>
          </div>
        </DeleteUser>
      )}
      {editModalOpen.status && (
        <EditUserForm
          isOpen={editModalOpen.status}
          onClose={closeEditModal}
          onSave={handleEditSave}
          modalData={editModalOpen.data}
        />
      )}
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EditUserForm = ({ isOpen, onClose, onSave, modalData, children }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    cid: "",
    cname: "",
    utid: 2,
    enable: "",
  });

  const { userType } = useUser();
  const [company, setCompany] = useState([]);

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      ...modalData,
    }));

    const fetchData = async () => {
      try {
        if (userType === 0 && modalData.cid != "*") {
          const data = await getCompanies("company");
          setCompany(data);
        }
      } catch (error) {
        console.log("error:", error);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalData]);

  const getCompanies = async (endpoint: string) => {
    try {
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      toast.error("retreived companies failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.put(`user/${formData.uid}`, formData);
      if (response.data) {
        toast.success(`${formData?.name} Edit successfully`);
        const userObject = JSON.parse(sessionStorage.getItem("userData"));
        if (modalData.uid === userObject.userId) {
          userObject.userName = formData?.name;
          userObject.userType = formData?.utid;
          sessionStorage.setItem("userData", JSON.stringify(userObject));
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...newFormData } = formData;
        onSave(newFormData);
        onClose();
        setFormData({});
      } else {
        toast.error(`${formData?.name} Edit unsuccessfull`);
        onClose();
        setFormData({});
      }
    } catch (error) {
      console.log("error");
      toast.error(`${formData?.name} Edit unsuccessfull`);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleClear = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      name: "",
      email: "",
      cid: "",
      enable: "",
    }));
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto ">
          <div
            onClick={() => {
              onClose();
              setFormData({});
            }}
            className="fixed inset-0 bg-black opacity-50"
          ></div>
          <div
            className={`relative z-50 w-full max-w-2xl mx-auto block font-semibold `}
          >
            <div
              className="relative bg-white rounded-lg shadow-lg overflow-auto text-black dark:bg-slate-800"
              style={{ maxHeight: "93vh" }}
            >
              <div>
                <p className="flex items-center justify-center flex-col text-2xl bg-gray-300 pb-3 pt-3 dark:bg-slate-700 dark:text-white">
                  Edit{" "}
                  {modalData.utid == 0
                    ? "Super Admin"
                    : modalData.utid == 1
                    ? "Admin"
                    : "User"}{" "}
                  Data
                </p>
                <div className="m-1 shadow-2xl bg-gray-50 rounded-xl p-1 max-h-50vh overflow-auto dark:bg-slate-800 dark:text-white">
                  <form className="mx-auto " onSubmit={handleSubmit}>
                    <div className="md:flex md:items-center mb-1 ">
                      <div className="md:w-1/4  ">
                        <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-300 py-2 px-4 mr-1 rounded dark:bg-gray-700 dark:text-white ">
                          Name
                        </label>
                      </div>
                      <div className="md:w-3/4">
                        <input
                          className="font-thin bg-white appearance-none border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-800 dark:text-white"
                          id="name"
                          type="text"
                          value={formData?.name}
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
                        <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-300 py-2 px-4 mr-1 rounded dark:bg-gray-700 dark:text-white">
                          email
                        </label>
                      </div>
                      <div className="md:w-3/4">
                        <input
                          className="font-thin bg-white appearance-none border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-800 dark:text-white"
                          id="email"
                          type="text"
                          value={formData?.email}
                          onChange={(e) =>
                            setFormData((prevFormData) => ({
                              ...prevFormData,
                              email: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="md:flex md:items-center mb-1 ">
                      <div className="md:w-1/4  ">
                        <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-300 py-2 px-4 mr-1 rounded dark:bg-gray-700 dark:text-white">
                          Password
                        </label>
                      </div>
                      <div className="md:w-3/4">
                        <input
                          className="bg-white appearance-none border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-800 dark:text-white "
                          id="password"
                          type="password"
                          // value={'*'.repeat(formData?.password?.length || 0)}
                          value={formData?.password}
                          onChange={(e) =>
                            setFormData((prevFormData) => ({
                              ...prevFormData,
                              password: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                    </div>
                    {modalData.cid != "*" && (
                      <>
                        <div className="md:flex md:items-center mb-1 ">
                          <div className="md:w-1/4  ">
                            <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-300 py-2 px-4 mr-1 rounded dark:bg-gray-700 dark:text-white">
                              Company
                            </label>
                          </div>
                          <div className="md:w-3/8">
                            <div className="relative">
                              {userType === 0 ? (
                                <>
                                  <select
                                    className="block appearance-none w-full border border-gray-200 dark:border-gray-600 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 dark:bg-slate-800 dark:text-white"
                                    onChange={(e) =>
                                      setFormData((prevFormData) => ({
                                        ...prevFormData,
                                        cid: e.target.value,
                                      }))
                                    }
                                    defaultValue=""
                                    required
                                  >
                                    <option value="" disabled>
                                      Select a company
                                    </option>
                                    {company?.map((item) => (
                                      <option key={item.cid} value={item.cid}>
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
                                  className=" font-thin border-2 dark:border-gray-600 bg-gray-100 rounded w-full py-2 pl-4 text-gray-700 leading-tight focus:outline-none focus:bg-white "
                                  id="ifname"
                                  type="text"
                                  value={formData?.cname}
                                  disabled
                                />
                              )}
                            </div>
                          </div>
                          <div className="md:w-3/8 pl-16 text-gray-500 dark:text-white">
                            <label>Current Company : {modalData.cname}</label>
                          </div>
                        </div>
                        <div className="md:flex md:items-center mb-1 ">
                          <div className="md:w-1/4  ">
                            <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-300 py-2 px-4 mr-1 rounded dark:bg-gray-700 dark:text-white">
                              User Type
                            </label>
                          </div>
                          <div className="md:w-3/8">
                            <div className="relative">
                              {userType === 0 || userType === 1 ? (
                                <>
                                  <select
                                    className="block appearance-none w-full border border-gray-200 dark:border-gray-600 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 dark:bg-slate-800 dark:text-white"
                                    onChange={(e) =>
                                      setFormData((prevFormData) => ({
                                        ...prevFormData,
                                        utid: parseInt(e.target.value),
                                      }))
                                    }
                                    defaultValue=""
                                    required
                                  >
                                    <option value="" disabled>
                                      Select a User Type
                                    </option>
                                    <option key={1} value={1}>
                                      Admin
                                    </option>
                                    <option key={2} value={2}>
                                      User
                                    </option>
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
                                  className=" font-thin border-2 dark:border-gray-600 bg-gray-100 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white "
                                  id="ifname"
                                  type="text"
                                  value="User"
                                  disabled
                                />
                              )}
                            </div>
                          </div>
                          <div className="md:w-3/8 pl-16 text-gray-500  dark:text-white">
                            <label>
                              Current User Type :{" "}
                              {modalData.utid === 1
                                ? "Admin"
                                : modalData.utid === 0
                                ? "Super Admin"
                                : "User"}
                            </label>
                          </div>
                        </div>
                        <div className="md:flex md:items-center mb-1 ">
                          <div className="md:w-1/4  ">
                            <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-300 py-2 px-4 mr-1 rounded dark:bg-gray-700 dark:text-white">
                              Status
                            </label>
                          </div>
                          <div className="md:w-3/4">
                            <label className="relative inline-flex cursor-pointer items-center">
                              <input
                                id="status"
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
                      </>
                    )}
                    <div className="bg-gray-100 flex px-6 py-4 items-center justify-end  rounded-b-lg dark:bg-slate-800 dark:text-white">
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AddUserForm = ({ isOpen, onClose, onSave, children }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    cid: "",
    utid: "",
    enable: "",
  });
  const { userType } = useUser();
  const [company, setCompany] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userType === 0) {
          const data = await getCompanies("company");
          if (data.length === 0) {
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
          }));
        }
      } catch (error) {
        console.log("error:", error);
      }
    };
    fetchData();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post("user", formData);
      if (response.data) {
        toast.success("user added successfully");
        onSave({
          ...formData,
          uid: response.data[0].uid,
        });
        onClose();
        setFormData({});
      } else {
        toast.error("user added unsuccessfull");
        onClose();
        setFormData({});
      }
    } catch (error) {
      console.log("error");
      toast.error("user added unsuccessfull");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleClear = () => {
    setFormData({});
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDelete = (preview) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      name: "",
      email: "",
      cid: "",
      enable: "",
    }));
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto ">
          <div
            onClick={() => {
              onClose();
              setFormData({});
            }}
            className="fixed inset-0 bg-black opacity-50"
          ></div>
          <div
            className={`relative z-50 w-full max-w-2xl mx-auto block font-semibold `}
          >
            <div
              className="relative bg-white rounded-lg shadow-lg overflow-auto text-black dark:bg-slate-800"
              style={{ maxHeight: "93vh" }}
            >
              <div>
                <p className="flex items-center justify-center flex-col text-2xl bg-gray-200 pb-3 pt-3 dark:bg-slate-700 dark:text-white">
                  Create User
                </p>
                <div className="m-1 shadow-2xl bg-gray-50 rounded-xl p-1 max-h-50vh overflow-auto dark:bg-slate-800">
                  <form className="mx-auto " onSubmit={handleSubmit}>
                    <div className="md:flex md:items-center mb-1 ">
                      <div className="md:w-1/4  ">
                        <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded dark:bg-gray-700 dark:text-white">
                          Name
                        </label>
                      </div>
                      <div className="md:w-3/4">
                        <input
                          className="bg-white appearance-none border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-800 dark:text-white "
                          id="name"
                          type="text"
                          value={formData?.name}
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
                        <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded dark:bg-gray-700 dark:text-white">
                          email
                        </label>
                      </div>
                      <div className="md:w-3/4">
                        <input
                          className="bg-white font-thin border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-800 dark:text-white "
                          id="email"
                          type="text"
                          value={formData?.email}
                          onChange={(e) =>
                            setFormData((prevFormData) => ({
                              ...prevFormData,
                              email: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="md:flex md:items-center mb-1 ">
                      <div className="md:w-1/4  ">
                        <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded dark:bg-gray-700 dark:text-white">
                          Password
                        </label>
                      </div>
                      <div className="md:w-3/4">
                        <input
                          className="bg-white appearance-none border-2 dark:border-gray-600 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white dark:bg-slate-800 dark:text-white "
                          id="password"
                          type="text"
                          value={formData?.password}
                          onChange={(e) =>
                            setFormData((prevFormData) => ({
                              ...prevFormData,
                              password: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="md:flex md:items-center mb-1 ">
                      <div className="md:w-1/4  ">
                        <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded dark:bg-gray-700 dark:text-white">
                          Company
                        </label>
                      </div>
                      <div className="md:w-3/8">
                        <div className="relative">
                          {userType === 0 ? (
                            <>
                              <select
                                className="block appearance-none w-full border border-gray-200 dark:border-gray-600  text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 dark:bg-slate-800 dark:text-white"
                                onChange={(e) => {
                                  const selectedOption =
                                    e.target.options[e.target.selectedIndex];
                                  setFormData((prevFormData) => ({
                                    ...prevFormData,
                                    cid: selectedOption.value,
                                    cname: selectedOption.dataset.name,
                                  }));
                                }}
                                defaultValue=""
                                required
                              >
                                <option value="" disabled>
                                  Select a company
                                </option>
                                {company?.map((item) => (
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
                              className=" font-thin border-2 dark:border-gray-600 bg-gray-100 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white "
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
                        <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded dark:bg-gray-700 dark:text-white">
                          User Type
                        </label>
                      </div>
                      <div className="md:w-3/8">
                        <div className="relative">
                          {userType === 0 || userType === 1 ? (
                            <>
                              <select
                                className="block appearance-none w-full border border-gray-200 dark:border-gray-600  text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 dark:bg-slate-800 dark:text-white"
                                onChange={(e) =>
                                  setFormData((prevFormData) => ({
                                    ...prevFormData,
                                    utid: parseInt(e.target.value),
                                  }))
                                }
                                defaultValue=""
                                required
                              >
                                <option value="" disabled>
                                  Select a User Type
                                </option>
                                <option key={1} value={1}>
                                  Admin
                                </option>
                                <option key={2} value={2}>
                                  User
                                </option>
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
                              className=" font-thin border-2 dark:border-gray-600 bg-gray-100 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white "
                              id="ifname"
                              type="text"
                              value="User"
                              disabled
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="md:flex md:items-center mb-1 ">
                      <div className="md:w-1/4  ">
                        <label className="block text-gray-500 font-bold md:text-left mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded dark:bg-gray-700 dark:text-white">
                          Status
                        </label>
                      </div>
                      <div className="md:w-3/4">
                        <label className="relative inline-flex cursor-pointer items-center ">
                          <input
                            id="status"
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
                    <div className="bg-gray-100 flex px-6 py-4 items-center justify-end  rounded-b-lg dark:bg-slate-800">
                      <button
                        className="px-4 py-1 mr-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-400 focus:shadow-outline focus:outline-none  font-bold "
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DeleteUser = ({ isOpen, onClose, onSave, children }) => {
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
              className="relative bg-white rounded-lg shadow-lg overflow-auto text-black dark:bg-slate-700"
              style={{ maxHeight: "93vh" }}
            >
              <div>
                <div className="m-1 shadow-2xl bg-gray-50 rounded-xl p-1 max-h-50vh overflow-auto dark:bg-slate-800">
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 dark:bg-slate-800">
                    {children}
                  </div>
                  <div className="bg-gray-50 flex px-6 py-2 items-center justify-end  rounded-b-lg dark:bg-slate-800">
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

export default User;
