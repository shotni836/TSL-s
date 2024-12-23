import React, { useRef, useState, useEffect } from "react";
import InputBox from "./InputBox";
import ClientTable from "./ClientTable";
import MaterialTable from "./MaterialTable";
import Loading from "../Loading";
import EditTestTable from "./EditTestTable";
import "./Coating.css";
import RegisterEmployeebg from "../../assets/images/RegisterEmployeebg.jpg";
import Header from "../Common/Header/Header";
import Footer from "../Common/Footer/Footer";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Environment from "../../environment";
import { toast } from "react-toastify";
import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import { encryptData } from "../Encrypt-decrypt";

const Coating = () => {
  //const radioRef = useRef(null);
  const searchParams = new URLSearchParams(document.location.search);
  let projectid = searchParams.get("id");
  let proc_type = searchParams.get("Proc_type");
  const userId = secureLocalStorage.getItem("empId")
  // const roleId = '2'
  const roleId = secureLocalStorage.getItem("roleId")
  projectid = projectid ? projectid : 0;
  let isProcessSheetCopy = searchParams.get("isProcessSheetCopy");
  let [tempClientData, setTempClientData] = useState([
    {
      destination: "",
      salesOrderNo: "",
      itemNo: "",
      poItemNo: "",
      poQty: "",
    },
  ]);
  let [lpeMaterialData, setLpeMaterialData] = useState([
    {
      material: "",
      manufacturer: "",
      matgrade: "",
    },
  ]);

  const date = new Date();
  const [formData, setFormData] = useState({
    processType: "",
    coatingType: "",
    date: new Date(date).toLocaleDateString("fr-CA").replace(/\//g, "-").split(" ")[0],
    Numbertype: "",
    processSheetNo: `TSL/PSC/${date.toISOString().split("-")[0]}`,
    clientName: "",
    pipeOD: "",
    createdBy: userId,
    RoleId: roleId?.toString(),
    pipeWT: "",
    type: "",
    LOIPOFOA: "",
    pqtNotes: "",
    qapNo: "",
    shiftType: "",
    techSpec: "",
    projName: "",
    fieldNumber: "",
    clientData: tempClientData,
    lpeMaterialData: lpeMaterialData,
    testsData: [],
    proc_type: isProcessSheetCopy ? '0' : proc_type != null ? proc_type : '0',
    isSubmit: 0,
    isCopy: isProcessSheetCopy ? 1 : 0,
    pm_Copy_projectId: isProcessSheetCopy ? parseInt(projectid) : 0
  });

  const [ddlmastersval, setddlmastersval] = useState({});
  const navigate = useNavigate()

  const ddlclientId = useRef("")
  const ddltslId = useRef("")
  const ddltpiId = useRef("")
  const ddlpmcId = useRef("")
  const ddlsurId = useRef("")
  const [tslValue, setTslValue] = useState("")
  const [ddlClientValChange, setDdlClientValChange] = useState(1)
  const [handleSubmitDisable, setHandleSubmitDisable] = useState(false)
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const moduleId = queryParams.get('moduleId');
  const menuId = queryParams.get('menuId');
  const token = secureLocalStorage.getItem('token');

  useEffect(() => {
    if (projectid) {
      fetchData();
    } else {
      localStorage.setItem("ddlClientVal", JSON.stringify({
        tslclientID: "0",
        tpiclientID: "0",
        pmcclientID: "0",
        surclientID: "0",
        clientID: "0",
      })
      );
      localStorage.setItem("TableTestGridRowData", JSON.stringify([]));
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);


  const [message, setMessage] = useState("");
  function concatUniqueValues(values) {
    // Create a frequency map to count occurrences of each value
    const valueCounts = values.reduce((acc, value) => {
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});

    // Filter out values that appear more than once
    const uniqueValues = values.filter((value, index, arr) => {
      return valueCounts[value] === 1 || (index === 0 || value !== arr[index - 1]);
    });

    // Join the filtered values with "&"
    return uniqueValues.join("&");
  }

  const handleMessageChange = (newMessage) => {
    const result = concatUniqueValues(newMessage)
    setMessage(result);
  };


  const fetchData = () => {
    axios.get(Environment.BaseAPIURL + `/api/User/EditProcessSheetDetails?project_id=${projectid}&Proc_type=${proc_type}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((response) => {
        if (response?.data) {
          const data = response.data;
          setFormData((prevState) => {
            const rawDate = data[1][0]["pm_procsheet_date"];
            let formattedDate = "";

            if (rawDate) {
              const dateValue = new Date(rawDate);

              if (!isNaN(dateValue.getTime())) {
                formattedDate = new Date(dateValue).toLocaleDateString("fr-CA").replace(/\//g, "-").split(" ")[0];
              } else {
                console.error("Invalid date format:", rawDate);
              }
            } else {
              console.error("Date not found.");
            }

            return {
              ...prevState,
              processType: data[1][0]["pm_proc_type"],
              projName: data[0][0]["project_name"],
              coatingType: data[1][0]["pm_proc_coattype"],
              date: formattedDate,
              Numbertype: data[1][0]["pm_field_number"],
              processSheetNo: data[1][0]["pm_procsheet_code"],
              clientName: data[1][0]["co_busipartner_id"].toString(),
              pipeOD: data[1][0]["pm_size_od"] + "",
              pipeWT: data[1][0]["pm_size_wt"] + "",
              type: data[1][0]["pm_order_type"],
              LOIPOFOA: data[1][0]["pm_loi_po_foa_no"],
              pqtNotes: data[1][0]["pm_pqt_notes"],
              qapNo: data[1][0]["ps_qap_no"],
              shiftType: data[1][0]["pm_shift_id"] + "",
              techSpec: data[1][0]["pm_technical_spec"],
              fieldNumber: data[1][0]["pm_field_number"],
            };
          });

          //clientData
          if (response?.data[2]) {
            const newClientData = response.data[2].map((item) => ({
              destination: item.pm_destination,
              salesOrderNo: item.pm_salesord_no,
              itemNo: item.pm_item_no,
              poItemNo: item.pm_po_item_no,
              poQty: item.pm_po_item_qty,
              pono: item.pono
            }));
            setFormData((prevFormData) => ({
              ...prevFormData,
              clientData: newClientData,
            }));
            setTempClientData(newClientData);
          }

          //lpeMaterialData
          if (response?.data[3]) {
            const newLpeMaterialData = response.data[3].map((item) => ({
              material: item.ps_material_id,
              manufacturer: item.ps_manufacturer_id,
              matgrade: item.ps_grade_id,
            }));
            setFormData((prevFormData) => ({
              ...prevFormData,
              lpeMaterialData: newLpeMaterialData,
            }));
            setLpeMaterialData(newLpeMaterialData);
          }

          if (response?.data[4]) {

            // const testIds = localStorage.getItem(JSON.parse("TableAllData"))
            const testIds1 = JSON.parse(localStorage.getItem("TableAllData"))
            const matchingTests = testIds1.filter(item =>
              response.data[4].some(test => item.pm_test_id == test.pm_test_id)
            );
            const mappedTestData = response.data[4].map((item) => ({
              index: matchingTests.find((d => d.co_param_val_id == item.pm_test_id)).index,
              PqtFreqName_id: item.pm_pqt_test_freq_id,
              RegFreqName_id: item.pm_regu_test_freq_id,
              basevalue: item.pm_reqmnt_temperature + "",
              client: item.pm_witness_client_perc + "",
              co_param_val_id: item.pm_test_id,
              max: item.pm_reqmnt_test_max + "",
              min: item.pm_value_type == "A" ? item.pm_test_value : item.pm_reqmnt_test_min + "",
              negative: item.pm_reqmnt_temp_minus + "",
              pmc: item.pm_witness_pmc_perc + "",
              positive: item.pm_reqmnt_temp_plus + "",
              requnit_id: item.pm_reqmnt_test_unit_id,
              suffix: item.pm_reqmnt_suffix,
              surveillance: item.pm_witness_survlnc_perc + "",
              testmethod_id: item.pm_test_type_id,
              tpi: item.pm_witness_tpi_perc + "",
              tsl: item.pm_witness_tsl_perc + "",
              // data from api
              regular_tpi: item.pm_witness_tpi_perc_reg + "",
              regular_tsl: item.pm_witness_tsl_perc_reg + "",
              regular_pmc: item.pm_witness_pmc_perc_reg + "",
              regular_surveillance: item.pm_witness_survlnc_perc_reg + "",
              regular_client: item.pm_witness_client_perc_reg + "",
              chkchecked: true,
            }));
            // const newData = data.filter((item) => item.pm_test_id === mappedTestData.map((items) => items.co_param_val_id))

            setFormData((prevFormData) => ({
              ...prevFormData,
              testsData: mappedTestData,
            }));

            localStorage.setItem("TableTestGridRowData", JSON.stringify(mappedTestData));

            let ddlClientValObj = {
              clientID: response.data[4][0].pm_witness_client_emp_id || "0",
              pmcclientID: response.data[4][0].pm_witness_pmc_emp_id || "0",
              surclientID: response.data[4][0].pm_witness_survlnc_emp_id || "0",
              tpiclientID: response.data[4][0].pm_witness_tpi_emp_id || "0",
              tslclientID: response.data[4][0].pm_witness_tsl_emp_id || "0",
            };

            localStorage.setItem("ddlClientVal", JSON.stringify(ddlClientValObj));
          }
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  };

  const addRowMaterial = () => {
    setFormData({
      ...formData,
      lpeMaterialData: [
        ...formData.lpeMaterialData,
        {
          material: "",
          manufacturer: "",
          matgrade: "",
        },
      ],
    });
  };

  const removeRowMaterial = (index) => {
    if (formData.lpeMaterialData.length > 1) {
      const updatedlpeMaterialData = [...formData.lpeMaterialData];
      updatedlpeMaterialData.splice(index, 1);
      setFormData({
        ...formData,
        lpeMaterialData: updatedlpeMaterialData,
      });
    }
  };

  const updateProcessType = (value) => {
    const processTypePrefix = value === "External" ? "EXT" : "INT";
    let coatingtypedata;
    let response = JSON.parse(localStorage.getItem("coatingmasterdata"));
    if (response) {
      coatingtypedata = response.data.CoatingType?.filter(
        (item) => item.CoatingType_Id === parseInt(formData.coatingType)
      );
    }
    const newProcessSheetNo = `TSL/PSC/${processTypePrefix}/${formData.coatingType}/${formData.date.split("-")[0]}`;
    setFormData({
      ...formData,
      processType: value,
      processSheetNo: newProcessSheetNo,
    });
  };

  const updateCoatingType = (value) => {
    const processTypePrefix = formData.processType === "External" ? "EXT" : "INT";
    let coatingtypedata;
    let response = JSON.parse(localStorage.getItem("coatingmasterdata"));
    if (response) {
      coatingtypedata = response.data.CoatingType.filter(
        (item) => item.CoatingType_Id === parseInt(value)
      );
    }
    const newProcessSheetNo = `TSL/PSC/${processTypePrefix}/${coatingtypedata[0]?.["CoatingType"] ?? ""}/${formData.date.split("-")[0]}`;
    setFormData({
      ...formData,
      coatingType: value,
      processSheetNo: newProcessSheetNo,
    });
  };

  const updateClienName = (value) => {
    setFormData({
      ...formData,
      clientName: formData.clientName === undefined ? "0" : value + "",
    });
  };

  let ddlClientVal = JSON.parse(localStorage.getItem("ddlClientVal"));

  const updateDate = (value) => {
    const processTypePrefix = formData.processType === "External" ? "EXT" : "INT";
    const year = value.split("-")[0];
    let coatingtypedata;
    let response = JSON.parse(localStorage.getItem("coatingmasterdata"));
    if (response) {
      coatingtypedata = response.data.CoatingType.filter(
        (item) => item.CoatingType_Id === parseInt(formData.coatingType)
      );
    }

    const newProcessSheetNo = `TSL/PSC/${processTypePrefix}/${coatingtypedata[0]?.["CoatingType"] ?? ""}/${year}`;

    setFormData({
      ...formData,
      date: value,
      processSheetNo: newProcessSheetNo,
    });
  };

  const updateClientData = (index, name, value) => {
    const updatedClientData = [...formData.clientData];
    updatedClientData[index] = { ...updatedClientData[index], [name]: value };
    setFormData({ ...formData, clientData: updatedClientData });
  };

  const FieldNumber = (value) => {
    setFormData({
      ...formData,
      Numbertype: formData.Numbertype === undefined ? "0" : value + "",
      fieldNumber: value,
    });
  };

  const updateMaterialData = (index, name, value) => {
    const updatedlpeMaterialData = [...formData.lpeMaterialData];
    updatedlpeMaterialData[index] = {
      ...updatedlpeMaterialData[index],
      [name]: value,
    };
    if (chkDuplicates(updatedlpeMaterialData)) {
      toast.error("Please select unique raw material combination from list");
      setLoading(false)
      return false;
    }
    setFormData({ ...formData, lpeMaterialData: updatedlpeMaterialData });
  };

  let TableTestGridRowData = JSON.parse(localStorage.getItem("TableTestGridRowData"));

  TableTestGridRowData = TableTestGridRowData ? TableTestGridRowData : [];

  const updateClientTableData = (data) => {
    setFormData((prevValues) => ({
      ...prevValues,
      clientData: data,
    }));
  };


  const handleDdlChange = (data) => {
    setDdlClientValChange(ddlClientValChange + 1)
    if (data == "tslclientID") {
      ddltslId.current == "100" ? ddltslId.current = "" : ddltslId.current = "100"
      // handleChange(null, index, "tsl", testdesc_id, ddltslId);
    }
    if (data == "tpiclientID") {
      ddltpiId.current == "100" ? ddltpiId.current = "" : ddltpiId.current = "100"
    }
    if (data == "pmcclientID") {
      ddlpmcId.current == "100" ? ddlpmcId.current = "" : ddlpmcId.current = "100"
    }
    if (data == "surclientID") {
      ddlsurId.current == "100" ? ddlsurId.current = "" : ddlsurId.current = "100"
    }
    if (data == "clientID") {
      ddlclientId.current == "100" ? ddlclientId.current = "" : ddlclientId.current = "100"
    }
  }
  // if (fieldname == "chkchecked" && !e.target.checked) {
  //   let objtestsData = {
  //     chkchecked: "false",
  //     co_param_val_id: "",
  //     // testmethod_id: "",
  //     // PqtFreqName_id: "",
  //     // RegFreqName_id: "",
  //     min: "",
  //     max: "",
  //     requnit_id: "",
  //     suffix: "",
  //     basevalue: "",
  //     negative: "",
  //     positive: "",
  //     tsl: "",
  //     tpi: "",
  //     pmc: "",
  //     surveillance: "",
  //     client: "",
  //     regular_tpi: "",
  //     regular_pmc: "",
  //     regular_surveillance: "",
  //     regular_client: "",
  //     regular_tsl: ""
  //   };
  //   TableTestGridRowData.push(objtestsData)
  // }


  const handleChange = (e, index, fieldname, testdesc_id) => {

    if (
      [
        "chkchecked",
        "testmethod_id",
        "PqtFreqName_id",
        "RegFreqName_id",
        "min",
        "max",
        "requnit_id",
        "suffix",
        "basevalue",
        "negative",
        "positive",
        "tsl",
        "tpi",
        "pmc",
        "surveillance",
        "client",
        "regular_tpi",
        "regular_tsl",
        "regular_pmc",
        "regular_surveillance",
        "regular_client",
      ].includes(fieldname) === false
    ) {
      if (e.target) {
        const { name, value } = e.target;
        switch (name) {
          case "processType":
            updateProcessType(value);
            break;
          case "coatingType":
            updateCoatingType(value);
            break;
          case "clientName":
            updateClienName(value);
            break;
          case "date":
            updateDate(value);
            break;
          case "FieldNumber":
            FieldNumber(value);
            break;
          case "destination":
          case "salesOrderNo":
          case "itemNo":
          case "poItemNo":
          case "poQty":
            updateClientData(index, name, value);
            break;
          case "material":
          case "manufacturer":
          case "matgrade":
            updateMaterialData(index, name, value);
            break;
          default:
            setFormData({ ...formData, [name]: value });
        }
      }
    } else {
      if (TableTestGridRowData?.length > 0) {
        let eleindex = undefined;
        TableTestGridRowData.forEach((value, index) => {
          if (value["co_param_val_id"] === testdesc_id) {
            eleindex = index;
          }
        });
        if (eleindex != undefined) {
          if (e === null) {
            TableTestGridRowData[eleindex][fieldname] = "";
          } else {
            if (fieldname === "chkchecked") {
              TableTestGridRowData[eleindex][fieldname] = e.target.checked;
            } else {

              const containsAlphabets = (value) => {
                return /[a-zA-Z!@#$%^&*()_+\=\[\]{};':"\\|,<>\/?]/.test(value);
              };
              if (fieldname == 'min') {
                const isAlpha = containsAlphabets(e.target.value)
                TableTestGridRowData[eleindex][fieldname] =
                  e.value === undefined ? e.target.value : e.value;
                if (isAlpha) {
                  TableTestGridRowData[eleindex]['max'] = ""
                }
              }
              else {
                TableTestGridRowData[eleindex][fieldname] =
                  e.value === undefined ? e.target.value : e.value;
              }

            }
          }
        } else {
          let objtestsData = {
            index: index,
            chkchecked: "false",
            co_param_val_id: "",
            // testmethod_id: "",
            // PqtFreqName_id: "",
            // RegFreqName_id: "",
            min: "",
            max: "",
            requnit_id: "",
            suffix: "",
            basevalue: "",
            negative: "",
            positive: "",
            tsl: "100",
            tpi: "100",
            pmc: "100",
            surveillance: "100",
            client: "100",
            regular_tpi: "",
            regular_pmc: "",
            regular_surveillance: "",
            regular_client: "",
            regular_tsl: ""
          };
          objtestsData["co_param_val_id"] = testdesc_id;
          if (e === null) {
            objtestsData[fieldname] = "";
          } else {
            if (fieldname === "chkchecked") {
              objtestsData[fieldname] = e.target.checked;
            } else {
              objtestsData[fieldname] =
                e.value === undefined ? e.target.value : e.value;
            }
          }
          TableTestGridRowData?.push(objtestsData);
        }
      } else {
        const tslclientIDData = localStorage.getItem("ddlClientVal");
        const clientsIdObject = JSON.parse(tslclientIDData);
        const tslclientID = clientsIdObject.tslclientID;
        let objtestsData = {
          index: index,
          chkchecked: "false",
          co_param_val_id: "",
          // testmethod_id: "0",
          // PqtFreqName_id: "0",
          // RegFreqName_id: "0",
          min: "",
          max: "",
          requnit_id: "0",
          suffix: "",
          basevalue: "",
          negative: "",
          positive: "",
          tsl: "100",
          tpi: '100',
          pmc: '100',
          surveillance: '100',
          client: '100',
          regular_tpi: "",
          regular_pmc: "",
          regular_surveillance: "",
          regular_client: "",
          regular_tsl: ""
        };
        objtestsData["co_param_val_id"] = testdesc_id;
        if (e === null) {
          objtestsData[fieldname] = "";
        } else {
          if (fieldname === "chkchecked") {
            objtestsData[fieldname] = e.target.checked;
          } else {
            console.log(objtestsData['max'], objtestsData['min'])
            objtestsData[fieldname] =
              e.value === undefined ? e.target.value : e.value;
          }
        }
        TableTestGridRowData?.push(objtestsData);
      }
      for (var i = 0; i < TableTestGridRowData.length; i++) {
        if (TableTestGridRowData[i]["testmethod_id"] == "") {
          TableTestGridRowData[i]["testmethod_id"] = "0"
        }
        if (TableTestGridRowData[i]["RegFreqName_id"] == "") {
          TableTestGridRowData[i]["RegFreqName_id"] = "0"
        }
        if (TableTestGridRowData[i]["PqtFreqName_id"] == "") {
          TableTestGridRowData[i]["PqtFreqName_id"] = "0"
        }
      }
      if (fieldname == "suffix") {
        if ((Number(TableTestGridRowData[TableTestGridRowData.length - 1]["min"]) > Number(TableTestGridRowData[TableTestGridRowData.length - 1]["max"])) && TableTestGridRowData[TableTestGridRowData.length - 1]["max"] != '') {
          toast.error(`Max value should be greater than min value`);
          setLoading(false)
        }
      }
      localStorage.setItem("TableTestGridRowData", JSON.stringify(TableTestGridRowData));

      setFormData((prevFormData) => ({
        ...prevFormData,
        testsData: TableTestGridRowData,
      }));
    }
  };

  const [TypeGrids, setTypeGrids] = useState("");
  let ShowProcessTypeGrids = TypeGrids;

  const fetchDropdownValues = async () => {
    if (formData.processType) {
      try {
        const response = await axios.get(Environment.BaseAPIURL + `/api/User/GetProcSheetDD?ProcessType=${encryptData(formData.processType)}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // if (response) {
        //   setCoatingType(response.data.CoatingType);
        //   setPipeOD(response.data.PipeOD);
        //   setPipeWT(response.data.PipeWT);
        //   setClients(response.data.Clients);
        //   localStorage.removeItem("coatingmasterdata");
        //   localStorage.setItem("coatingmasterdata", JSON.stringify(response));
        // }

        if (response?.data) {
          setddlmastersval(response);
          localStorage.removeItem("coatingmasterdata");
          localStorage.setItem("coatingmasterdata", JSON.stringify(response));
        } else {
          localStorage.setItem("coatingmasterdata", JSON.stringify(response));
        }
        setTypeGrids(true);
      } catch (error) {
        console.error("Error fetching dropdown values:", error);
        setLoading(false)
      }
    }
  };

  function chkDuplicates(arr) {
    var len = arr.length,
      tmp = {};
    arr.sort();
    while (len--) {
      var obj = arr[len];
      for (var key in obj) {
        if (typeof obj[key] === "number") {
          obj[key] = String(obj[key]);
        }
      }
      var val = JSON.stringify(obj);
      if (tmp[val]) {
        return true;
      }
      tmp[val] = true;
    }
    return false;
  }

  const containsAlphabets = (value) => {
    return /^[a-zA-Z !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(value)
  };

  const isAlphaNumeric = (value) => {
    return /^(?=.*[0-9])(?=.*[a-zA-Z])/.test(value);
  };

  const handleSubmit = async (e, value) => {
    setHandleSubmitDisable(true)
    e.preventDefault();
    setLoading(true)
    if (formData.processType === "") {
      toast.error("Please select process type");
      setLoading(false)
      setHandleSubmitDisable(false)
      return false;
    } else if (
      formData.coatingType === "" ||
      formData.coatingType === "Select type"
    ) {
      const element = document.getElementById("coating-type")
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus(); // Optional: Focus on the first empty field
      element.classList.add("highlight");
      toast.error("Please select coating type");
      setLoading(false)
      setHandleSubmitDisable(false)
      return false;
    }
    else if (formData.date === "") {
      toast.error("Please select date");
      setLoading(false)
      setHandleSubmitDisable(false)
      return false;
    } else if (formData.clientName === "") {
      const element = document.getElementById("process-client-name")
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus(); // Optional: Focus on the first empty field
      element.classList.add("highlight");

      const element1 = document.getElementById("coating-type")
      element1.classList.remove("highlight");
      toast.error("Please select client name");
      setLoading(false)
      setHandleSubmitDisable(false)
      return false;
    } else if (formData.pipeOD === "" || formData.pipeOD === "Select") {
      const element = document.getElementById("pipe-OD")
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus(); // Optional: Focus on the first empty field
      element.classList.add("highlight");

      const element1 = document.getElementById("process-client-name")
      element1.classList.remove("highlight");
      toast.error("Please select pipe size OD");
      setLoading(false)
      setHandleSubmitDisable(false)
      return false;
    }
    else if (formData.pipeWT === "" || formData.pipeWT === "Select") {
      const element = document.getElementById("pipe-WD")
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus(); // Optional: Focus on the first empty field
      element.classList.add("highlight");

      const element1 = document.getElementById("pipe-OD")
      element1.classList.remove("highlight");
      toast.error("Please select pipe size WT");
      setLoading(false)
      setHandleSubmitDisable(false)
      return false;
    }
    else if (formData.type === "") {
      toast.error("Please select LOI/PO/FOA/LOA field");
      setLoading(false)
      setHandleSubmitDisable(false)
      return false;
    } else if (formData.LOIPOFOA === "") {
      const element = document.getElementById("loa-foa-id")
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus(); // Optional: Focus on the first empty field
      element.classList.add("highlight");

      const element1 = document.getElementById("pipe-WD")
      element1.classList.remove("highlight");
      toast.error("Please enter LOI/PO/FOA/LOA no.");
      setLoading(false)
      setHandleSubmitDisable(false)
      return false;
    } else if (formData.shiftType === "") {
      toast.error("Please select shift");
      const element = document.getElementById("shift-type")
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus(); // Optional: Focus on the first empty field
      element.classList.add("highlight");

      const element1 = document.getElementById("loa-foa-id")
      setLoading(false)
      element1.classList.remove("highlight");
      setHandleSubmitDisable(false)
      // const element1 = document.getElementById("loa-foa-id")
      // element1.classList.remove("highlight");
      return false;
    } else if (formData.qapNo === "") {
      const element = document.getElementById("qap-no")
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus(); // Optional: Focus on the first empty field
      element.classList.add("highlight");

      const element1 = document.getElementById("shift-type")
      element1.classList.remove("highlight");
      setLoading(false)
      toast.error("Please enter QAP no.");
      setHandleSubmitDisable(false)
      return false;
    }
    else if (formData.Numbertype === "" || formData.Numbertype === "0") {
      const element = document.getElementById("FieldNumber")
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus(); // Optional: Focus on the first empty field
      element.classList.add("highlight");

      const element1 = document.getElementById("qap-no")
      element1.classList.remove("highlight");
      toast.error("Please select field no.");
      setLoading(false)
      setHandleSubmitDisable(false)
      return false;
    }
    else if (formData.techSpec === "") {
      const element = document.getElementById("technical-spec")
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus(); // Optional: Focus on the first empty field
      element.classList.add("highlight");

      const element1 = document.getElementById("FieldNumber")
      element1.classList.remove("highlight");
      toast.error("Please enter technical specification");
      setLoading(false)
      setHandleSubmitDisable(false)
      return false;
    } else if (formData.projName === "") {
      const element = document.getElementById("project-name")
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus(); // Optional: Focus on the first empty field
      element.classList.add("highlight");

      const element1 = document.getElementById("technical-spec")
      element1.classList.remove("highlight");
      toast.error("Please enter project name");
      setLoading(false)
      setHandleSubmitDisable(false)
      return false;
    }
    else if (formData.pqtNotes === "") {
      const element = document.getElementById("pqt-notes")
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus(); // Optional: Focus on the first empty field
      element.classList.add("highlight");

      const element1 = document.getElementById("project-name")
      element1.classList.remove("highlight");
      toast.error("Please enter PQT Notes");
      setLoading(false)
      setHandleSubmitDisable(false)
      return false;
    }
    if (chkDuplicates(formData.clientData)) {
      toast.error("Please enter unique client data");
      setLoading(false)
      setHandleSubmitDisable(false)
      return false;
    }

    for (let i = 0; i < formData.clientData.length; i++) {
      if (formData.clientData[i]["destination"] == "") {
        toast.error("Please enter destination");
        const element = document.getElementById("process-destination")
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus(); // Optional: Focus on the first empty field
        element.classList.add("highlight");
        setHandleSubmitDisable(false)
        setLoading(false)
        return false;
      } else if (formData.clientData[i]["salesOrderNo"] == "") {
        const element = document.getElementById("process-salesno")
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus(); // Optional: Focus on the first empty field
        element.classList.add("highlight");

        const element1 = document.getElementById("process-destination")
        element1.classList.remove("highlight");
        toast.error("Please enter sales order no.");
        setLoading(false)
        setHandleSubmitDisable(false)
        return false;
      } else if (formData.clientData[i]["itemNo"] === "") {
        const element = document.getElementById("process-itemno")
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus(); // Optional: Focus on the first empty field
        element.classList.add("highlight");

        const element1 = document.getElementById("process-salesno")
        element1.classList.remove("highlight");
        toast.error("Please enter item no.");
        setLoading(false)
        setHandleSubmitDisable(false)
        return false;
      } else if (formData.clientData[i]["poItemNo"] === "") {
        const element = document.getElementById("process-poitem")
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus(); // Optional: Focus on the first empty field
        element.classList.add("highlight");

        const element1 = document.getElementById("process-poqty")
        element1.classList.remove("highlight");
        toast.error("Please enter PO item no.");
        setLoading(false)
        setHandleSubmitDisable(false)
        return false;
      }
      else if (formData.clientData[i]["poQty"] === "") {
        const element = document.getElementById("process-poqty")
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus(); // Optional: Focus on the first empty field
        element.classList.add("highlight");

        const element1 = document.getElementById("process-itemno")
        element1.classList.remove("highlight");
        toast.error("Please enter PO Quantity");
        setLoading(false)
        setHandleSubmitDisable(false)
        return false;
      }
    }

    if (chkDuplicates(formData.lpeMaterialData)) {
      toast.error("Please select unique raw material combination from list");
      setLoading(false)
      setHandleSubmitDisable(false)
      return false;
    }

    for (let i = 0; i < formData.lpeMaterialData.length; i++) {
      if (
        formData.lpeMaterialData[i]["material"] === "" ||
        formData.lpeMaterialData[i]["material"] === "Select material"
      ) {
        toast.error("Please select material from drop-down");
        setLoading(false)
        setHandleSubmitDisable(false)
        return false;
      } else if (
        formData.lpeMaterialData[i]["manufacturer"] === "" ||
        formData.lpeMaterialData[i]["manufacturer"] === "Select manufacturer"
      ) {
        toast.error("Please select manufacturer from drop-down");
        setLoading(false)
        setHandleSubmitDisable(false)
        return false;
      } else if (
        formData.lpeMaterialData[i]["matgrade"] === "" ||
        formData.lpeMaterialData[i]["matgrade"] === "Select grade"
      ) {
        toast.error("Please select grade from drop-down");
        setLoading(false)
        setHandleSubmitDisable(false)
        return false;
      }
    }

    // let obj = JSON.parse(localStorage.getItem("testGridWitnessStatus"));
    TableTestGridRowData = JSON.parse(
      localStorage.getItem("TableTestGridRowData")
    );

    let TableALLData = JSON.parse(
      localStorage.getItem("TableAllData")
    );

    let TestGridRowData = TableTestGridRowData.filter(
      (item) => item.chkchecked === true
    );
    if (TestGridRowData.length > 0) {
      for (let i = 0; i < TestGridRowData.length; i++) {
        ddlClientVal = JSON.parse(localStorage.getItem("ddlClientVal"));
        const rowIndex = TestGridRowData[i]['index']
        // const element = document.getElementById("test-method-" + rowIndex)
        // console.log(element)
        // element.parentElement.classList.remove("highlight");
        if (
          TestGridRowData[i]["testmethod_id"] == undefined
        ) {
          const element = document.getElementById("test-method-" + rowIndex)
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus(); // Optional: Focus on the first empty field
          element.parentElement.classList.add("highlight");
          toast.error(`Please select test method from drop-down`);
          setLoading(false)
          setHandleSubmitDisable(false)
          return false;
        } else if (
          TestGridRowData[i]["PqtFreqName_id"] == undefined
        ) {
          const element = document.getElementById("pqt-frequency-" + rowIndex)
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus(); // Optional: Focus on the first empty field
          element.parentElement.classList.add("highlight");
          const element1 = document.getElementById("test-method-" + rowIndex)
          element1.parentElement.classList.remove("highlight");
          toast.error(`Please select frequency from drop-down`);
          setLoading(false)
          setHandleSubmitDisable(false)
          return false;
        } else if (
          TestGridRowData[i]["RegFreqName_id"] == undefined
        ) {
          const element = document.getElementById("regular-frequency-" + rowIndex)
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus(); // Optional: Focus on the first empty field
          element.parentElement.classList.add("highlight");
          const element1 = document.getElementById("pqt-frequency-" + rowIndex)
          element1.parentElement.classList.remove("highlight");
          toast.error(`Please select frequency from drop-down`);
          setLoading(false)
          setHandleSubmitDisable(false)
          return false;
        } else if (
          TestGridRowData[i]["min"] == null || (TestGridRowData[i]["min"] == "" && TestGridRowData[i]["max"] == "")
        ) {
          const element = document.getElementById("min-number-" + rowIndex)
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus(); // Optional: Focus on the first empty field
          element.parentElement.classList.add("highlight");
          const element1 = document.getElementById("regular-frequency-" + rowIndex)
          element1.parentElement.classList.remove("highlight");
          toast.error(`Please enter min or max value`);
          setLoading(false)
          setHandleSubmitDisable(false)
          return false;
        } else if (
          TestGridRowData[i]["max"] == "" && TestGridRowData[i]["min"] == "" &&
          !containsAlphabets(TestGridRowData[i]["min"]) &&
          !isAlphaNumeric(TestGridRowData[i]["min"])
        ) {
          const element = document.getElementById("min-number-" + rowIndex)
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus(); // Optional: Focus on the first empty field
          element.parentElement.classList.add("highlight");
          toast.error(`Please enter min or max value`);
          setLoading(false)
          setHandleSubmitDisable(false)
          return false;
        } else if (
          Number(TestGridRowData[i]["max"]) == Number(TestGridRowData[i]["min"]) && TestGridRowData[i]["max"] != "" && TestGridRowData[i]["min"] != ""
        ) {
          const element = document.getElementById("min-number-" + rowIndex)
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus(); // Optional: Focus on the first empty field
          element.parentElement.classList.add("highlight");
          toast.error(`Min and Max value should be different`);
          setLoading(false)
          setHandleSubmitDisable(false)
          return false;
        } else if (
          Number(TestGridRowData[i]["max"]) < Number(TestGridRowData[i]["min"]) && TestGridRowData[i]["max"] != "" && TestGridRowData[i]["min"] != ""
        ) {
          const element = document.getElementById("min-number-" + rowIndex)
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus(); // Optional: Focus on the first empty field
          element.parentElement.classList.add("highlight");
          toast.error(`Max value should be greater than min value`);
          setLoading(false)
          setHandleSubmitDisable(false)
          return false;
        }
        else if (
          TestGridRowData[i]["requnit_id"] === "" ||
          TestGridRowData[i]["requnit_id"] === "0"
        ) {
          const element = document.getElementById("req-unit-" + rowIndex)
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus(); // Optional: Focus on the first empty field
          element.parentElement.classList.add("highlight");
          const element1 = document.getElementById("min-number-" + rowIndex)
          element1.parentElement.classList.remove("highlight");
          toast.error(`Please select unit from drop-down`);
          setLoading(false)
          setHandleSubmitDisable(false)
          return false;
        } else if (TestGridRowData[i]["suffix"] === "") {
          const element = document.getElementById("suffix-" + rowIndex)
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus(); // Optional: Focus on the first empty field
          element.parentElement.classList.add("highlight");
          const element1 = document.getElementById("req-unit-" + rowIndex)
          element1.parentElement.classList.remove("highlight");
          toast.error(`Please enter suffix`);
          setLoading(false)
          setHandleSubmitDisable(false)
          return false;
        } else if (TestGridRowData[i]["TempRange"] === "") {
          const element = document.getElementById("test-row-" + rowIndex)
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus(); // Optional: Focus on the first empty field
          element.parentElement.classList.add("highlight");
          toast.error(`Please enter temp. range`);
          setLoading(false)
          setHandleSubmitDisable(false)
          return false;
        } else if (TestGridRowData[i]["tsl"] === "") {
          const element = document.getElementById("test-row-" + rowIndex)
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus(); // Optional: Focus on the first empty field
          element.parentElement.classList.add("highlight");
          toast.error(`Please enter TSL value`);
          setLoading(false)
          setHandleSubmitDisable(false)
          return false;
        } else if (TestGridRowData[i]["tpi"] === "") {
          const element = document.getElementById("test-row-" + rowIndex)
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus(); // Optional: Focus on the first empty field
          element.parentElement.classList.add("highlight");
          toast.error(`Please enter TPI value`);
          setLoading(false)
          setHandleSubmitDisable(false)
          return false;
        } else if (TestGridRowData[i]["regular_tsl"] === "" && ddlClientVal?.tslclientID !== "0") {
          const element = document.getElementById("tsl-regular-" + rowIndex)
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus(); // Optional: Focus on the first empty field
          element.classList.add("highlight");
          const element1 = document.getElementById("suffix-" + rowIndex)
          element1.classList.remove("highlight");
          toast.error(`Please enter Regular TSL value`);
          setLoading(false)
          setHandleSubmitDisable(false)
          return false;
        } else if (TestGridRowData[i]["regular_tpi"] === "" && ddlClientVal?.tpiclientID !== "0") {
          const element = document.getElementById("tpi-regular-" + rowIndex)
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus(); // Optional: Focus on the first empty field
          element.classList.add("highlight");
          const element1 = document.getElementById("tsl-regular-" + rowIndex)
          element1.classList.remove("highlight");
          toast.error(`Please enter Regular TPI value`);
          setLoading(false)
          setHandleSubmitDisable(false)
          return false;
        } else if (TestGridRowData[i]["pmc"] === "") {
          const element = document.getElementById("test-row-" + rowIndex)
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus(); // Optional: Focus on the first empty field
          element.parentElement.classList.add("highlight");
          toast.error(`Please enter PMC value`);
          setLoading(false)
          setHandleSubmitDisable(false)
          return false;
        } else if (TestGridRowData[i]["regular_pmc"] === "" && ddlClientVal?.pmcclientID !== "0") {
          const element = document.getElementById("pmc-regular-" + rowIndex)
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus(); // Optional: Focus on the first empty field
          element.classList.add("highlight");
          const element1 = document.getElementById("tpi-regular-" + rowIndex)
          element1.classList.remove("highlight");
          toast.error(`Please enter Regular PMC value`);
          setLoading(false)
          setHandleSubmitDisable(false)
          return false;
        } else if (TestGridRowData[i]["surveillance"] === "") {
          const element = document.getElementById("test-row-" + rowIndex)
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus(); // Optional: Focus on the first empty field
          element.parentElement.classList.add("highlight");
          toast.error(`Please enter Surveillance value`);
          setLoading(false)
          setHandleSubmitDisable(false)
          return false;
        } else if (TestGridRowData[i]["regular_surveillance"] === "" && ddlClientVal?.surclientID !== "0") {
          const element = document.getElementById("surveillance-regular-" + rowIndex)
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus(); // Optional: Focus on the first empty field
          element.classList.add("highlight");
          const element1 = document.getElementById("pmc-regular-" + rowIndex)
          element1.classList.remove("highlight");
          setLoading(false)
          toast.error(`Please enter Regular Surveillance value`);
          setHandleSubmitDisable(false)
          return false;
        } else if (TestGridRowData[i]["client"] === "") {
          const element = document.getElementById("test-row-" + rowIndex)
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus(); // Optional: Focus on the first empty field
          element.parentElement.classList.add("highlight");
          toast.error(`Please enter Client value`);
          setLoading(false)
          setHandleSubmitDisable(false)
          return false;
        } else if (TestGridRowData[i]["regular_client"] === "" && ddlClientVal?.clientID !== "0") {
          const element = document.getElementById("client-regular-" + rowIndex)
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus(); // Optional: Focus on the first empty field
          element.classList.add("highlight");
          const element1 = document.getElementById("surveillance-regular-" + rowIndex)
          element1.classList.remove("highlight");
          toast.error(`Please enter Regular Client value`);
          setLoading(false)
          setHandleSubmitDisable(false)
          return false;
        }
      }
    } else {
      toast.error("Please select atleast one process test from grid.");
      setLoading(false)
      setHandleSubmitDisable(false)
      return false;
    }

    TestGridRowData.forEach((value, index) => {
      if (typeof TestGridRowData[index]["PqtFreqName_id"] === "number") {
        TestGridRowData[index]["PqtFreqName_id"] = value["PqtFreqName_id"] + "";
      }
      if (typeof TestGridRowData[index]["RegFreqName_id"] === "number") {
        TestGridRowData[index]["RegFreqName_id"] = value["RegFreqName_id"] + "";
      }
      if (typeof TestGridRowData[index]["co_param_val_id"] === "number") {
        TestGridRowData[index]["co_param_val_id"] =
          value["co_param_val_id"] + "";
      }
      if (typeof TestGridRowData[index]["requnit_id"] === "number") {
        TestGridRowData[index]["requnit_id"] = value["requnit_id"] + "";
      }
      if (typeof TestGridRowData[index]["testmethod_id"] === "number") {
        TestGridRowData[index]["testmethod_id"] = value["testmethod_id"] + "";
      }
      if (typeof TestGridRowData[index]["chkchecked"] === "boolean") {
        TestGridRowData[index]["chkchecked"] = value["chkchecked"] + "";
      }
    });

    if (ddlClientVal["tslclientID"] == "0") {
      toast.error("Please select TSL Client value from grid.");
      setLoading(false)
      setHandleSubmitDisable(false)
      return false;
    }

    if (ddlClientVal["tpiclientID"] == "0" && ddlClientVal["pmcclientID"] == "0" && ddlClientVal["surclientID"] == "0" && ddlClientVal["clientID"] == "0") {
      toast.error("Please select atleaset one witness from grid.");
      setLoading(false)
      setHandleSubmitDisable(false)
      return false;
    }
    // if (!ddlClientVal["tpiclientID"]) {
    //   toast.error("Please select tpi client value from grid");
    //   return false;
    // }
    // if (!ddlClientVal["pmcclientID"]) {
    //   toast.error("Please select pmc client value from grid");
    //   return false;
    // }
    // if (!ddlClientVal["surclientID"]) {
    //   toast.error("Please select sur.. client value from grid");
    //   return false;
    // }
    // if (!ddlClientVal["clientID"]) {
    //   toast.error("Please select client value from grid");
    //   return false;
    // }

    const completeFormData = {
      ...formData,
      testsData: TestGridRowData.map((rowData) => ({
        ...rowData,
        min: rowData.hasOwnProperty("min") ? rowData.min : "0",
        max: rowData.hasOwnProperty("max") ? rowData.max : "0",
      })),
      headerclients: ddlClientVal,
      projectid: isProcessSheetCopy ? "0" : projectid + "",
      date: isProcessSheetCopy ? new Date().toISOString().split("T")[0] : formData.date,
      isSubmit: value ? 1 : 0
    };

    try {
      const response = await fetch(Environment.BaseAPIURL + "/api/User/PostProcessSheet", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(completeFormData),
      }
      );

      const responseBody = await response.text();
      if (responseBody !== "") {
        const id = responseBody.split('~')[0];
        const proc_type = responseBody.split('~')[1];
        setHandleSubmitDisable(false)
        if (value === true) {
          navigate(`/addstation?moduleId=${moduleId}&menuId=${menuId}&id=${id}&proc_type=${proc_type}`)
        }
        else {
          navigate(`/processsheetlist?moduleId=${moduleId}&menuId=${menuId}`)
          toast.success("Draft save successfully!");
        }
      } else {
        setHandleSubmitDisable(false)
        toast.error("Failed to submit.");
        setLoading(false)
        console.error("Login failed with status:", response.status);
      }
    } catch (error) {
      setHandleSubmitDisable(false)
      setLoading(false)
      console.error("An error occurred while sending form data:", error);
    }
    finally {
      setLoading(false)
    }
  };

  // --------------------------------------------

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
  }, [ddlclientId.current, ddlsurId.current, ddlpmcId.current, ddltpiId.current, ddltslId.current, ddlClientValChange])

  useEffect(() => {
    setTslValue(ddltslId.current)
  }, [ddltslId.current])

  useEffect(() => {
    fetchDropdownValues();
  }, [formData?.processType]);

  const handleClientChange = (selectedOption) => {
    const clientID = selectedOption ? selectedOption.value : null;
    handleChange({ target: { name: "clientName", value: clientID } });
  };

  return (
    <>
      {loading ? (<Loading />) : (
        <>
          <Header />
          <section className="InnerHeaderPageSection">
            <div className="InnerHeaderPageBg" style={{ backgroundImage: `url(${RegisterEmployeebg})` }}></div>
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12">
                  <ul>
                    <li><Link to={`/dashboard?moduleId=${moduleId}`}>Quality Module</Link></li>
                    <li><h1>/&nbsp;</h1></li>
                    <li>&nbsp;<Link to={`/processsheetlist?moduleId=${moduleId}&menuId=${menuId}`}>&nbsp;Process Sheet List</Link></li>
                    <li><h1>/&nbsp; Process Sheet</h1></li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
          <section className="CoatingPageSection">
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12">
                  <form className="form row m-0" autoComplete="off" onSubmit={handleSubmit}>
                    <div className="col-lg-5 col-sm-12 col-xs-5">
                      <InputBox
                        formData={formData}
                        handleChange={handleChange}
                        ddlmastersval={ddlmastersval}
                        key={JSON.stringify(ddlmastersval)}
                        isClientNameField={projectid ? false : true}
                        isProcessSheetCopy={isProcessSheetCopy}
                        poMessage={message}
                      />
                    </div>

                    <div className="col-lg-7 col-sm-12 col-xs-7">
                      <ClientTable
                        formData={formData}
                        handleChange={handleChange}
                        updateClientTableData={updateClientTableData}
                        isProcessSheetCopy={isProcessSheetCopy}
                        sendMessageToParent={handleMessageChange}
                      />
                    </div>

                    {ShowProcessTypeGrids && (
                      <>
                        <MaterialTable
                          lpeMaterialData={formData.lpeMaterialData}
                          handleChange={handleChange}
                          addRowMaterial={addRowMaterial}
                          removeRowMaterial={removeRowMaterial}
                          processType={formData.processType}
                        />
                        <EditTestTable
                          testsData={formData.testsData}
                          handleChange={handleChange}
                          handleDdlChange={handleDdlChange}
                        />
                        <div className="FlexSubmitFlex">
                          <button type="submit" className="DraftSaveBtn subBtn mx-2" onClick={(e) => handleSubmit(e, false)} disabled={loading}>{loading ? 'Saving...' : 'Draft Save'}</button>
                          <button type="submit" className="subBtn" onClick={(e) => handleSubmit(e, true)} disabled={loading}>{loading ? 'Saving...' : 'Next'}</button>
                        </div>
                      </>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </section>
          <Footer />
        </>
      )}
    </>
  );
};

export default Coating;