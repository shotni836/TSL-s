import React, { useState, useEffect } from "react";
import InputBox from "./InputBox";
import ClientTable from "./ClientTable";
import MaterialTable from "./MaterialTable";
import Loading from "../Loading";
import EditTestTable from "./EditTestTable";
import "./Coating.css";
import RegisterEmployeebg from "../../assets/images/RegisterEmployeebg.jpg";
import Header from "../Common/Header/Header";
import Footer from "../Common/Footer/Footer";
import { Link } from "react-router-dom";
import Environment from "../../environment";
import { toast } from "react-toastify";
import axios from "axios";

const EditProcessSheet = () => {
  //const radioRef = useRef(null);
  const searchParams = new URLSearchParams(document.location.search);
  let projectid = searchParams.get("id");
  let proc_type = searchParams.get("Proc_type");
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
  const [formData, setFormData] = useState({
    processType: "",
    coatingType: "",
    date: "",
    Numbertype: "",
    processSheetNo: "",
    clientName: "",
    pipeOD: "",
    pipeWT: "",
    type: "",
    LOIPOFOA: "",
    qapNo: "",
    shiftType: "",
    pqtNotes: "",
    techSpec: "",
    projName: "",
    fieldNumber: "",
    clientData: tempClientData,
    lpeMaterialData: lpeMaterialData,
    testsData: [],
    proc_type: proc_type
  });

  const [ddlmastersval, setddlmastersval] = useState({});

  useEffect(() => {
    fetchData();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const fetchData = () => {
    axios
      .get(Environment.BaseAPIURL + `/api/User/EditProcessSheetDetails?project_id=${projectid}`)
      .then((response) => {
        if (response?.data) {
          const data = response.data;
          setFormData((prevState) => ({
            ...prevState,
            processType: data[1][0]["pm_proc_type"],
            projName: data[0][0]["project_name"],
            coatingType: data[1][0]["pm_proc_coattype"],
            date: data[1][0]["pm_procsheet_date"],
            Numbertype: data[1][0]["pm_field_number"],
            processSheetNo: data[1][0]["pm_procsheet_code"],
            clientName: data[1][0]["co_busipartner_id"],
            pipeOD: data[1][0]["pm_size_od"] + '',
            pipeWT: data[1][0]["pm_size_wt"] + '',
            type: data[1][0]["pm_order_type"],
            LOIPOFOA: data[1][0]["pm_loi_po_foa_no"],
            pqtNotes: data[1][0]["pm_pqt_notes"],
            qapNo: data[1][0]["ps_qap_no"],
            shiftType: data[1][0]["pm_shift_id"] + '',
            techSpec: data[1][0]["pm_technical_spec"],
            fieldNumber: data[1][0]["pm_field_number"],
          }));

          //clientData
          if (response?.data[2]) {
            const newClientData = response.data[2].map((item) => ({
              destination: item.pm_destination,
              salesOrderNo: item.pm_salesord_no,
              itemNo: item.pm_item_no,
              poItemNo: item.pm_po_item_no,
              poQty: item.pm_po_item_qty,
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
            const mappedTestData = response.data[4].map((item) => ({
              PqtFreqName_id: item.pm_pqt_test_freq_id,
              RegFreqName_id: item.pm_regu_test_freq_id,
              basevalue: item.pm_reqmnt_temperature + '',
              client: item.pm_witness_client_perc + '',
              co_param_val_id: item.pm_test_id,
              max: item.pm_reqmnt_test_max + '',
              min: item.pm_reqmnt_test_min + '',
              negative: item.pm_reqmnt_temp_minus + '',
              pmc: item.pm_witness_pmc_perc + '',
              positive: item.pm_reqmnt_temp_plus + '',
              requnit_id: item.pm_reqmnt_test_unit_id,
              suffix: item.pm_reqmnt_suffix,
              surveillance: item.pm_witness_survlnc_perc + '',
              testmethod_id: item.pm_test_type_id,
              tpi: item.pm_witness_tpi_perc + '',
              tsl: item.pm_witness_tsl_perc + '',
              pm_witness_tpi_perc_reg: item.pm_witness_tpi_perc_reg + '',
              pm_witness_pmc_perc_reg: item.pm_witness_pmc_perc_reg + '',
              pm_witness_survlnc_perc_reg: item.pm_witness_survlnc_perc_reg + '',
              pm_witness_client_perc_reg: item.pm_witness_client_perc_reg + '',
              chkchecked: true,
            }));

            setFormData((prevFormData) => ({
              ...prevFormData,
              testsData: mappedTestData,
            }));

            localStorage.setItem("TableTestGridRowData", JSON.stringify(mappedTestData));

            let ddlClientValObj = {
              clientID: response.data[4][0].pm_witness_client_emp_id || "",
              pmcclientID: response.data[4][0].pm_witness_pmc_emp_id || "",
              surclientID: response.data[4][0].pm_witness_survlnc_emp_id || "",
              tpiclientID: response.data[4][0].pm_witness_tpi_emp_id || "",
              tslclientID: response.data[4][0].pm_witness_tsl_emp_id || "",
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
      coatingtypedata = response.data.CoatingType.filter(
        (item) => item.CoatingType_Id === parseInt(formData.coatingType)
      );
    }
    const newProcessSheetNo = `TSL/PSC/${processTypePrefix}/${formData.coatingType
      }/${formData.date.split("-")[0]}`;
    setFormData({
      ...formData,
      processType: value,
      processSheetNo: newProcessSheetNo,
    });
  };

  const updateCoatingType = (value) => {
    const processTypePrefix =
      formData.processType === "External" ? "EXT" : "INT";
    let coatingtypedata;
    let response = JSON.parse(localStorage.getItem("coatingmasterdata"));
    if (response) {
      coatingtypedata = response.data.CoatingType.filter(
        (item) => item.CoatingType_Id === parseInt(value)
      );
    }
    const newProcessSheetNo = `TSL/PSC/${processTypePrefix}/${coatingtypedata[0]["CoatingType"]
      }/${formData.date.split("-")[0]}`;
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

  const updateDate = (value) => {
    const processTypePrefix =
      formData.processType === "External" ? "EXT" : "INT";
    const year = value.split("-")[0];
    let coatingtypedata;
    let response = JSON.parse(localStorage.getItem("coatingmasterdata"));
    if (response) {
      coatingtypedata = response.data.CoatingType.filter(
        (item) => item.CoatingType_Id === parseInt(formData.coatingType)
      );
    }
    const newProcessSheetNo = `TSL/PSC/${processTypePrefix}/${coatingtypedata[0]["CoatingType"]}/${year}`;
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
    setFormData({ ...formData, lpeMaterialData: updatedlpeMaterialData });
  };

  let TableTestGridRowData = JSON.parse(localStorage.getItem("TableTestGridRowData"));

  const updateClientTableData = (data) => {
    setFormData((prevValues) => ({
      ...prevValues,
      clientData: data,
    }));
  };

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
      ].includes(fieldname) === false
    ) {
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
    } else {
      if (TableTestGridRowData.length > 0) {
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
              TableTestGridRowData[eleindex][fieldname] =
                e.value === undefined ? e.target.value : e.value;
            }
          }
        } else {
          let objtestsData = {
            chkchecked: "false",
            co_param_val_id: "",
            testmethod_id: "0",
            PqtFreqName_id: "0",
            RegFreqName_id: "0",
            min: "",
            max: "",
            requnit_id: "0",
            suffix: "",
            basevalue: "",
            negative: "",
            positive: "",
            tsl: "100",
            tpi: "100",
            pmc: "100",
            surveillance: "100",
            client: "100",
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
          TableTestGridRowData.push(objtestsData);
        }
      } else {
        let objtestsData = {
          chkchecked: "false",
          co_param_val_id: "",
          testmethod_id: "0",
          PqtFreqName_id: "0",
          RegFreqName_id: "0",
          min: "",
          max: "",
          requnit_id: "0",
          suffix: "",
          basevalue: "",
          negative: "",
          positive: "",
          tsl: "100",
          tpi: "100",
          pmc: "100",
          surveillance: "100",
          client: "100",
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
        TableTestGridRowData.push(objtestsData);
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
        const response = await axios.get(Environment.BaseAPIURL + `/api/User/GetProcSheetDD?ProcessType=${formData.processType}`);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.processType === "") {
      toast.error("Please select process type");
      return false;
    } else if (
      formData.coatingType === "" ||
      formData.coatingType === "Select type"
    ) {
      toast.error("Please select coating type");
      return false;
    } else if (formData.date === "") {
      toast.error("Please select date");
      return false;
    } else if (formData.clientName === "") {
      toast.error("Please select client name");
      return false;
    } else if (formData.pipeWT === "" || formData.pipeWT === "Select") {
      toast.error("Please select Pipe Size WT");
      return false;
    } else if (formData.pipeOD === "" || formData.pipeOD === "Select") {
      toast.error("Please select Pipe Size OD");
      return false;
    } else if (formData.Numbertype === "" || formData.Numbertype === "0") {
      toast.error("Please select field no.");
      return false;
    } else if (formData.techSpec === "") {
      toast.error("Please enter technical specification");
      return false;
    } else if (formData.projName === "") {
      toast.error("Please enter project name");
      return false;
    } else if (formData.type === "") {
      toast.error("Please select LOI/PO/FOA/LOA field ");
      return false;
    } else if (formData.LOIPOFOA === "") {
      toast.error("Please enter LOI/PO/FOA/LOA no.");
      return false;
    } else if (formData.pqtNotes === "") {
      toast.error("Please enter LOI/PO/FOA/LOA no.");
      return false;
    }
    else if (formData.qapNo === "") {
      toast.error("Please enter any QAP No");
      return false;
    }


    if (chkDuplicates(formData.clientData)) {
      toast.error("Please enter unique client data");
      return false;
    }

    for (let i = 0; i < formData.clientData.length; i++) {
      if (formData.clientData[i]["destination"] == "") {
        toast.error("Please enter destination");
        return false;
      } else if (formData.clientData[i]["salesOrderNo"] === "") {
        toast.error("Please enter sales order no.");
        return false;
      } else if (formData.clientData[i]["itemNo"] === "") {
        toast.error("Please enter item no.");
        return false;
      } else if (formData.clientData[i]["poQty"] === "") {
        toast.error("Please enter PO Quantity");
        return false;
      } else if (formData.clientData[i]["poItemNo"] === "") {
        toast.error("Please enter PO item no.");
        return false;
      }
    }

    if (chkDuplicates(formData.lpeMaterialData)) {
      toast.error("Please select unique raw material combination");
      return false;
    }

    for (let i = 0; i < formData.lpeMaterialData.length; i++) {
      if (
        formData.lpeMaterialData[i]["material"] === "" ||
        formData.lpeMaterialData[i]["material"] === "Select material"
      ) {
        toast.error("Please select material from drop-down");
        return false;
      } else if (
        formData.lpeMaterialData[i]["manufacturer"] === "" ||
        formData.lpeMaterialData[i]["manufacturer"] === "Select manufacturer"
      ) {
        toast.error("Please select manufacturer from drop-down");
        return false;
      } else if (
        formData.lpeMaterialData[i]["matgrade"] === "" ||
        formData.lpeMaterialData[i]["matgrade"] === "Select grade"
      ) {
        toast.error("Please select grade from drop-down");
        return false;
      }
    }
    console.log(TestGridRowData[i]["max"], TestGridRowData[i]["min"], TestGridRowData[i]["max"], TestGridRowData[i]["min"])

    // let obj = JSON.parse(localStorage.getItem("testGridWitnessStatus"));
    TableTestGridRowData = JSON.parse(
      localStorage.getItem("TableTestGridRowData")
    );

    let TestGridRowData = TableTestGridRowData.filter(
      (item) => item.chkchecked === true
    );
    if (TestGridRowData.length > 0) {
      for (let i = 0; i < TestGridRowData.length; i++) {
        if (
          TestGridRowData[i]["testmethod_id"] === "" ||
          TestGridRowData[i]["testmethod_id"] === "0"
        ) {
          toast.error("Please select test method from drop-down");
          return false;
        } else if (
          TestGridRowData[i]["max"] < TestGridRowData[i]["min"] && TestGridRowData[i]["max"] != "" && TestGridRowData[i]["min"] != ""
        ) {
          toast.error("Max value should be greater than min value");
          return false;
        }
        else if (
          TestGridRowData[i]["PqtFreqName_id"] === "" ||
          TestGridRowData[i]["PqtFreqName_id"] === "0"
        ) {
          toast.error("Please select frequancy from drop-down");
          return false;
        } else if (
          TestGridRowData[i]["RegFreqName_id"] === "" ||
          TestGridRowData[i]["RegFreqName_id"] === "0"
        ) {
          toast.error("Please select frequancy from drop-down");
          return false;
        } else if (TestGridRowData[i]["min"] === "") {
          toast.error("Please enter min value..");
          return false;
        } else if (TestGridRowData[i]["max"] === "") {
          toast.error("Please enter max value..");
          return false;
        } else if (
          TestGridRowData[i]["requnit_id"] === "" ||
          TestGridRowData[i]["requnit_id"] === "0"
        ) {
          toast.error("Please select unit from drop-down");
          return false;
        } else if (TestGridRowData[i]["suffix"] === "") {
          toast.error("Please enter suffix");
          return false;
        } else if (TestGridRowData[i]["TempRange"] === "") {
          toast.error("Please enter temp range");
          return false;
        } else if (TestGridRowData[i]["tsl"] === "") {
          toast.error("Please enter TSL value");
          return false;
        } else if (TestGridRowData[i]["tpi"] === "") {
          toast.error("Please enter TPI value");
          return false;
        } else if (TestGridRowData[i]["pmc"] === "") {
          toast.error("Please enter PMC value");
          return false;
        } else if (TestGridRowData[i]["surveillance"] === "") {
          toast.error("Please enter Surveillance value");
          return false;
        } else if (TestGridRowData[i]["client"] === "") {
          toast.error("Please enter Client value");
          return false;
        }
      }
    } else {
      toast.error("Please select atleat one process test");
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

    let ddlClientVal = JSON.parse(localStorage.getItem("ddlClientVal"));
    if (!ddlClientVal["tslclientID"]) {
      toast.error("Please select TSL client value");
      return false;
    }
    if (!ddlClientVal["tpiclientID"]) {
      toast.error("Please select TPI client value");
      return false;
    }
    if (!ddlClientVal["pmcclientID"]) {
      toast.error("Please select PMC client value");
      return false;
    }
    if (!ddlClientVal["surclientID"]) {
      toast.error("Please select Survillance value");
      return false;
    }
    if (!ddlClientVal["clientID"]) {
      toast.error("Please select client value from grid");
      return false;
    }

    const completeFormData = {
      ...formData,
      testsData: TestGridRowData,
      headerclients: ddlClientVal,
      projectid: isProcessSheetCopy ? "0" : projectid,
    };

    try {
      const response = await fetch(Environment.BaseAPIURL + "/api/User/PostProcessSheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(completeFormData),
      }
      );

      const responseBody = await response.text();
      if (responseBody !== "") {
        toast.success("Data updated successfully!");
      } else {
        toast.error("Failed to update");
        console.error("Login failed with status:", response.status);
      }
    } catch (error) {
      console.error("An error occurred while sending form data:", error);
    }
  };

  // --------------------------------------------

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

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
                    <li><Link to="/dashboard?moduleId=618">Quality Module</Link></li>
                    <li><h1>/&nbsp; Process Sheet </h1></li>
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
                    <div className="col-md-5 col-sm-12 col-xs-5">
                      <InputBox
                        formData={formData}
                        handleChange={handleChange}
                        ddlmastersval={ddlmastersval}
                        key={JSON.stringify(ddlmastersval)}
                        isClientNameField={false}
                      />
                    </div>
                    <div className="col-md-7 col-sm-12 col-xs-7">
                      <ClientTable
                        formData={formData}
                        handleChange={handleChange}
                        updateClientTableData={updateClientTableData}
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
                        />
                        <div className="FlexSubmitFlex"><button type="submit" className="subBtn">Submit</button></div>
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

export default EditProcessSheet;