import React, { useEffect, useState, useMemo } from "react";
import Header from "../components/Header";
import apiClient from "../services/ApiService";
import {
  DeleteIcon,
  WarningIcon,
  CompaniesIcon,
  CompanyPlusIcon,
} from "../assets/icons";
import { LeftArrowIcon, RightArrowIcon, WeelIcon } from "../assets/icons";
import { toast } from "react-toastify";
import { useUser } from "../context/UserContext";
import { useQuery } from "react-query";
import loading from "../assets/loading.gif";

const Company = () => {
  const { userType } = useUser();
  const [companies, setCompanies] = useState([]);

  const [productList, setProductList] = useState([]);
  const [rowsLimit] = useState(10);
  const [rowsToShow, setRowsToShow] = useState([]);
  const [customPagination, setCustomPagination] = useState([]);
  const [totalPage, setTotalPage] = useState(
    Math.ceil(productList?.length / rowsLimit)
  );
  const [currentPage, setCurrentPage] = useState(0);

  const nextPage = () => {
    const startIndex = rowsLimit * (currentPage + 1);
    const endIndex = startIndex + rowsLimit;
    const newArray = companies.slice(startIndex, endIndex);
    setRowsToShow(newArray);
    setCurrentPage(currentPage + 1);
  };
  const changePage = (value) => {
    const startIndex = value * rowsLimit;
    const endIndex = startIndex + rowsLimit;
    const newArray = companies.slice(startIndex, endIndex);
    setRowsToShow(newArray);
    setCurrentPage(value);
  };
  const previousPage = () => {
    const startIndex = (currentPage - 1) * rowsLimit;
    const endIndex = startIndex + rowsLimit;
    const newArray = companies.slice(startIndex, endIndex);
    setRowsToShow(newArray);
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else {
      setCurrentPage(0);
    }
  };

  const fetchCompanies = async () => {
    const authToken = sessionStorage.getItem("authToken");
    if (!authToken) {
      throw new Error("No auth token");
    }

    const response = await apiClient.get("company");
    if (!response.data) {
      throw new Error("Failed to retrieve data");
    }
    return response.data;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data, error, isLoading } = useQuery("company", fetchCompanies, {
    onSuccess: (data) => {
      const updatedCompany = data?.filter((company) => company.cid != null);
      if (updatedCompany) {
        setCompanies(updatedCompany);
        setProductList(updatedCompany);
        setRowsToShow(updatedCompany.slice(0, rowsLimit));
        setTotalPage(Math.ceil(updatedCompany.length / rowsLimit));
      }
    },
    onError: (error) => {
      toast.error(`Retrieve companies failed ${error}`);
    },
  });

  useMemo(() => {
    setCustomPagination(
      Array(Math.ceil(productList?.length / rowsLimit)).fill(null)
    );
  }, [productList, rowsLimit]);

  const [addModalOpen, setAddModalOpen] = useState(false);

  const handleAdd = () => {
    setAddModalOpen(true);
  };
  const closeAddModal = () => {
    setAddModalOpen(false);
  };

  const handleAddSave = (newData) => {
    // Your save logic here
    closeAddModal();
    const updatedCompany = [...companies, newData];
    setCompanies(updatedCompany);
    setProductList(updatedCompany);
    setRowsToShow(
      updatedCompany.slice(
        currentPage * rowsLimit,
        (currentPage + 1) * rowsLimit
      )
    );
    setTotalPage(Math.ceil(updatedCompany.length / rowsLimit));
    setSelectedItem({});
  };

  const nextPorts = () => {
    if (companies && companies.length > 0) {
      const lastApp = companies[companies.length - 1];
      return {
        ws_port: lastApp.ws_port + 1,
        rest_port: lastApp.rest_port + 1,
      };
    } else {
      return {
        ws_port: 23450,
        rest_port: 8880,
      };
    }
  };

  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleEdit = (data) => {
    setEditModalOpen({ status: true, data: data });
  };
  const closeEditModal = () => {
    setEditModalOpen({ status: false, data: [] });
  };

  const handleEditSave = (newData) => {
    // Your save logic here
    closeEditModal({ status: false, data: [] });
    const updatedCompanies = companies.map((company) =>
      company.cid === newData.cid ? newData : company
    );

    // Update the states
    setCompanies(updatedCompanies);
    setProductList(updatedCompanies);
    setRowsToShow(
      updatedCompanies.slice(
        currentPage * rowsLimit,
        (currentPage + 1) * rowsLimit
      )
    );
    setTotalPage(Math.ceil(updatedCompanies.length / rowsLimit));
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
    deleteApp(`company/${selectedItem.cid}`);
  };

  const deleteApp = async (endpoint: string) => {
    try {
      const response = await apiClient.delete(endpoint);
      if (response.data) {
        toast.success(`Company ${selectedItem.cid} deleted successfully`);
        const updatedCompany = companies.filter(
          (company) => company.cid !== selectedItem.cid
        );
        setCompanies(updatedCompany);
        setProductList(updatedCompany);
        setRowsToShow(
          updatedCompany.slice(
            currentPage * rowsLimit,
            (currentPage + 1) * rowsLimit
          )
        );
        setTotalPage(Math.ceil(updatedCompany.length / rowsLimit));
        setSelectedItem({});
        if (
          currentPage > 0 &&
          updatedCompany.length <= currentPage * rowsLimit
        ) {
          setCurrentPage(currentPage - 1);
          setRowsToShow(
            updatedCompany.slice(
              (currentPage - 1) * rowsLimit,
              currentPage * rowsLimit
            )
          );
        }
      }
    } catch (error) {
      console.log("error");
      toast.error(`Company ${selectedItem.cid} deleted Unsuccessfull`);
    }
  };

  return (
    <>
      <div className="flex h-screen overflow-hidden  ">
        {/* Sidebar */}
        <div className="relative flex flex-col flex-1 overflow-y-hidden overflow-x-hidden">
          {/*  Site header */}
          <Header />
          <div className="min-h-screen h-full bg-blue-50 flex justify-center dark:bg-slate-600 overflow-y-auto mt-6">
            <div className="w-full px-2 pl-5 pr-5 pt-5 pb-5 overflow-scroll">
              <div className="flex justify-between items-center">
                <div className="flex ">
                  <CompaniesIcon />
                  <h1 className="text-2xl font-medium  ml-2">Company</h1>
                </div>
                {userType === 0 && (
                  <div className="group cursor-pointer relative flex ">
                    <button
                      onClick={() => handleAdd()}
                      className={
                        "p-1 mr-3 rounded-full  cursor-pointer hover:scale-125"
                      }
                    >
                      <CompanyPlusIcon />
                    </button>
                    <div className="text-xs w-32 absolute hidden group-hover:block left-0 transform -translate-x-full -translate-y-1/2 px-2 py-1 rounded bg-black text-white z-50">
                      Add New Company
                      <div className="bg-black w-2.5 h-2.5 rotate-45 absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2  right-[-0.625rem]"></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full overflow-x-scroll md:overflow-auto  2xl:max-w-none mt-2 dark:bg-slate-700">
                {isLoading ? (
                  <div className="flex justify-center items-center pt-24">
                    <div className="loader">
                      <div className="h-screen bg-blue-50 dark:bg-slate-600">
                        <img className="h-16 w-16" src={loading} alt="" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <table
                    className="table-auto overflow-scroll md:overflow-auto text-left font-inter"
                    style={{ width: "99.8%", minWidth: "max-content" }}
                  >
                    <thead className="rounded-lg text-base bg-gray-800 text-white font-semibold w-full">
                      <tr className="bg-[#222E3A]/[20%] dark:bg-[#222E3A]/[60%]">
                        <th className="py-3 px-3  dark:text-white sm:text-base font-bold whitespace-nowrap justify-center text-center">
                          #
                        </th>
                        <th className="py-3 px-3  dark:text-white sm:text-base font-bold whitespace-nowrap justify-center text-center">
                          Company Name
                        </th>
                        <th className="py-3 px-3  dark:text-white sm:text-base font-bold whitespace-nowrap justify-center text-center">
                          Status
                        </th>
                        {userType === 0 && (
                          <th
                            className="flex items-center py-3 px-3  dark:text-white sm:text-base font-bold whitespace-nowrap justify-center text-center gap-1"
                            style={{ justifyContent: "space-around" }}
                          >
                            Action
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
                          } hover:bg-amber-50 dark:hover:bg-gray-600  transition duration-200 transform hover:-translate-y-0.5 hover:shadow-lg rounded-xl`}
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
                            className={`py-5 px-4 text-base font-bold justify-center text-center ${
                              data?.enable ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {data?.enable ? "Active" : "Inactive"}
                          </td>
                          {userType === 0 && (
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
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
        <AddCompanyForm
          isOpen={addModalOpen}
          onClose={closeAddModal}
          onSave={handleAddSave}
          modalData={nextPorts()}
        />
      )}
      {deleteModalOpen && (
        <DeleteCompany
          isOpen={deleteModalOpen}
          onClose={closeDeleteModal}
          onSave={handleDeleteSave}
        >
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <WarningIcon />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left dark:bg-slate-800 dark:text-white">
              <h3
                className="text-2xl font-semibold leading-6 text-gray-900 dark:text-gray-200"
                id="modal-title"
              >
                Delete Company
              </h3>
              <div className="mt-2">
                <p className="text-md text-gray-500 dark:text-white">
                  Are you sure to delete this Company {selectedItem?.name}? All
                  of data will be permanently removed. This action cannot be
                  undone.
                </p>
              </div>
            </div>
          </div>
        </DeleteCompany>
      )}
      {editModalOpen.status && (
        <EditCompanyForm
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
const EditCompanyForm = ({ isOpen, onClose, onSave, modalData, children }) => {
  const [formData, setFormData] = useState({
    name: "",
    enable: "",
  });

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      ...modalData,
    }));
  }, [modalData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.put(`company/${formData.cid}`, formData);
      if (response.data) {
        toast.success("company data edit successfully");
        onSave(formData);
        onClose();
        setFormData({});
      } else {
        toast.error("company data edit unsuccessfull");
        onClose();
        setFormData({});
      }
    } catch (error) {
      console.log("error");
      toast.error(`Company data edit Unsuccessfull`);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleClear = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      name: "",
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
                  Edit Company
                </p>
                <div className="m-1 shadow-2xl bg-gray-50 rounded-xl p-1 max-h-50vh overflow-auto dark:bg-slate-800">
                  <form className="mx-auto " onSubmit={handleSubmit}>
                    <div className="md:flex md:items-center mb-1 ">
                      <div className="md:w-1/4  ">
                        <label className="block text-gray-500 font-bold md:text-center mb-1 md:mb-0 pr-4 bg-gray-300 py-2 px-4 mr-1 rounded dark:bg-gray-700 dark:text-white">
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
                        <label className="block text-gray-500 font-bold md:text-center mb-1 md:mb-0 pr-4 bg-gray-300 py-2 px-4 mr-1 rounded dark:bg-gray-700 dark:text-white">
                          Status
                        </label>
                      </div>
                      <div className="md:w-3/4">
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            id="status"
                            type="checkbox"
                            className="peer sr-only"
                            checked={formData?.enable}
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
const AddCompanyForm = ({ isOpen, onClose, onSave, modalData, children }) => {
  const [formData, setFormData] = useState({
    name: "",
    enable: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post("company", formData);
      if (response.data) {
        toast.success("company added successfully");
        onSave(response.data[0]);
        onClose();
        setFormData({});
      } else {
        toast.error("company added unsuccessfull");
        onClose();
        setFormData({});
      }
    } catch (error) {
      console.log("error");
      toast.error("company added unsuccessfull");
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
            className={`relative z-50 w-full max-w-2xl mx-auto block font-semibold`}
          >
            <div
              className="relative bg-white rounded-lg shadow-lg overflow-auto text-black dark:bg-slate-800"
              style={{ maxHeight: "93vh" }}
            >
              <div>
                <p className="flex items-center justify-center flex-col text-2xl bg-gray-200 pb-3 pt-3 dark:bg-slate-700 dark:text-white">
                  Create Company
                </p>
                <div className="m-1 shadow-2xl bg-gray-50 rounded-xl p-1 max-h-50vh overflow-auto dark:bg-slate-800 dark:text-white">
                  <form className="mx-auto " onSubmit={handleSubmit}>
                    <div className="md:flex md:items-center mb-1 ">
                      <div className="md:w-1/4  ">
                        <label className="block text-gray-500 font-bold md:text-center mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded dark:bg-gray-700 dark:text-white">
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
                        <label className="block text-gray-500 font-bold md:text-center mb-1 md:mb-0 pr-4 bg-gray-200 py-2 px-4 mr-1 rounded dark:bg-gray-700 dark:text-white">
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
                    <div className="bg-gray-100 flex px-6 py-4 items-center justify-end  rounded-b-lg dark:bg-slate-800 dark:text-white">
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
const DeleteCompany = ({ isOpen, onClose, onSave, children }) => {
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
                      className="inline-flex w-28 justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-400 sm:ml-3 sm:w-auto"
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

export default Company;
