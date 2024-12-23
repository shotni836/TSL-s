import React, {
  useState,
  useMemo,
  useEffect,
  setApiResponse,
  useSearchParams,
  useRef,
} from "react";
import Loading from "../Loading";
import "./BlastingDataEntry.css";
import Header from "../Common/Header/Header";
import Footer from "../Common/Footer/Footer";
import { Link, useNavigate } from "react-router-dom";
import Environment from "../../environment";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import axios from "axios";
import RegisterEmployeebg from "../../assets/images/RegisterEmployeebg.jpg";
import queryString from "query-string";
import { de, tr } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import { Table } from "react-bootstrap";
import { toast } from "react-toastify";
import Select from "react-select";
import "ag-grid-autocomplete-editor/dist/main.css";
import Modal from 'react-modal';
import secureLocalStorage from "react-secure-storage";
import { isThisHour } from "date-fns";
import { decryptData, encryptData } from "../Encrypt-decrypt";

var excludedPipes = []


const BlastingDataEntry = () => {
  const token = secureLocalStorage.getItem('token');
  const searchParams = new URLSearchParams(window.location.search);
  const year_query = searchParams.get("year");
  const sequence_no = searchParams.get("sequence_no");
  const process_type = searchParams.get("process_type");
  const viewType = searchParams.get("ViewType");
  let gunCount = useRef(0)
  let noOfPipes = useRef(0)
  let existingGuns = useRef(0)
  let gunsWithValues = useRef([])
  const value_type1 = searchParams.get("id");
  const value_type = decryptData(value_type1);
  const pm_test_run_id1 = searchParams.get("pm_test_run_id");
  let pm_test_run_id = decryptData(pm_test_run_id1)
  const procsheetId = searchParams.get("processsheetId");
  const action = searchParams.get("action");
  const moduleId = searchParams.get("moduleId");
  const menuId = searchParams.get("menuId");
  const ShowTestDate = useRef("");
  const [batches, setBatches] = useState([]);
  const checkedPipes = useRef([]);
  const [ShowApprovalSection, setShowApprovalSection] = useState("");
  const [modalIsOpen, setIsOpen] = useState(false);
  const empId = secureLocalStorage.getItem('empId');
  const loadingRef = useRef(null);
  const contentRef = useRef(null);
  const isSubmitting = useRef(null);
  const [checkNow, setCheckNow] = useState(false)
  const [wiProcedure, setWiProcedure] = useState([]);
  const [witnessData, setWitnessData] = useState([]);
  const [witnessList, setWitnessList] = useState([]);
  const [currentShift, setCurrentShift] = useState();
  const [wiSelectedProcedure, setWiSelectedProcedure] = useState("");
  const [indexPipe, setIndexPipe] = useState(false);
  const [testRunId, setTestRunId] = useState();
  const [defaultLineSpeed, setDefaultLineSpeed] = useState();
  const [blastingLineSpeed, setBlastingLineSpeed] = useState();
  const [blastingLoad1, setblastingLoad1] = useState();
  const [blastingLoad2, setBlastingLoad2] = useState();
  const checkExistGuns = useRef([]);
  const [defaultNoOfGuns, setDefaultNoOfGuns] = useState();
  const [defaultDewPoint, setDefaultDewPoint] = useState();
  const [defaultHdpe1, setDefaultHdpe1] = useState();
  const [defaultHdpe2, setDefaultHdpe2] = useState();
  const [defaultAdhesive, setDefaultAdhesive] = useState();
  const gunValidation = useRef(true);
  const gunValidation1 = useRef(true);
  const blastingValidation1 = useRef(true);
  const blastingValidation2 = useRef(true);
  const blastingValidation3 = useRef(true);
  const userRole = secureLocalStorage.getItem('userRole');
  const roleId = secureLocalStorage.getItem('roleId');
  const userId = secureLocalStorage.getItem('userId');
  const currentCompanyId = secureLocalStorage.getItem('emp_current_comp_id');
  const showPopUp = useRef(false)
  const isChange = useRef([])
  const navigate = useNavigate()
  const checkVar = useRef("")
  const [editRawMaterialList, setEditRawMaterialList] = useState([]);

  const [SoNoList, setSoNoList] = useState([]);
  const [Pono, setPono] = useState([]);
  const [SoLineItemList, setSoLineItemList] = useState([]);
  const [multiplePO, setMultiplePO] = useState([]);
  const [POItemList, setPOItemList] = useState([]);

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      minWidth: '40%'
    },
  };

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  Modal.setAppElement('#root');
  let subtitle;

  useEffect(() => {
    if (viewType === "onhandleApproveClick") {
      ShowTestDate.current = ("");
      setShowApprovalSection("Yes");
      setApprovalFormData({ ...approvalFormData, approvertype: "qc" });
    } else if (viewType === "onhandleSecondApproveClick") {
      ShowTestDate.current = ("Yes");
      setShowApprovalSection("Yes");
      setApprovalFormData({ ...approvalFormData, approvertype: "tpi" });
    } else if (viewType === "View") {
      ShowTestDate.current = ("");
      setShowApprovalSection("");
    }
  }, [viewType]);

  // setTimeout(() => {
  //   gridApi.setRowData(newData);
  // }, 0);


  // Function to remove duplicates based on a combination of properties
  function removeDuplicates(arr) {
    // Track seen combinations of properties
    let seen = {};
    // Filtered array to store unique objects
    let filteredArray = [];

    arr.forEach(obj => {
      // Create a key using the properties that define uniqueness
      let key = obj.co_param_val_name + '|' + obj.PIPNO + '|' + obj.pm_test_id;

      // Check if this key has been seen before
      if (!seen[key]) {
        seen[key] = true;
        filteredArray.push(obj);
      }
    });

    return filteredArray;
  }

  const procedureChange = (selectedOption) => {

    const labels = selectedOption.map(option => option.label).join(', ');


    setWiSelectedProcedure(labels)
    // You can send the payload to an API or perform other actions here
  };

  function callBlastingApi(date, value_type) {
    setTypeOfProcess(value_type)
    axios.get(Environment.BaseAPIURL + `/api/User/GetTestBlastingdataEntryNewtmp?processsheetno=${procsheetId}&processtype=${value_type}&TestDate=${date}&shiftid=${formData.shift}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })
      .then((response) => {
        setMatMafGrade(response?.data[11])
      })
  }

  const formatDataForAPI = (data) => {
    return data.map(item => ({
      material: item.Material_Id.toString(),
      manufacturer: item.Manfacturer_Id.toString(),
      grade: item.Grade_Id.toString(),
      batch: item.pm_batch
    }));
  };

  async function editData(data_procedure1) {
    try {
      setTypeOfProcess(value_type)

      const response2 = await axios.post(`${Environment.BaseAPIURL}/api/User/GetInspectionRandomWitnessById?ProcessSheetID=${procsheetId}&ProcessSheetTypeID=${value_type1}&testid=${pm_test_run_id1}&current_companyid=${encryptData(currentCompanyId)}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      setWitnessList(response2.data[2])

      const response = await axios.post(Environment.BaseAPIURL + `/api/User/GetBlastingDetailsByIdNew?ProcessSheetID=${procsheetId}&ProcessSheetTypeID=${value_type1}&testid=${pm_test_run_id1}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      setShift(response.data[0][0])
      setCurrentShift(response.data[9][0].pm_shift_id)
      const uniquePipes = new Set(response?.data[2].map(item => item.PIPNO));

      // Get the number of unique pipes

      let airPressureCount = 0;
      const gunsWithValues1 = [];

      // Iterate over each key in the object
      for (const key in response.data[2][0]) {
        // Check if the key starts with 'Airpressure_A' or 'Airpressure_B'
        if ((key.startsWith('Airpressure_A') || key.startsWith('Airpressure_B')) && response.data[2][0][key] !== "") {
          airPressureCount++;
        }

        if ((key.startsWith('Airpressure_A') || key.startsWith('Airpressure_B')) && response.data[2][0][key] !== "") {
          // Extract the gun identifier by removing the "Airpressure_" prefix
          gunsWithValues1.push(key.replace('Airpressure_', ''));
        }
      }

      gunsWithValues.current = gunsWithValues1
      existingGuns.current = airPressureCount

      const uniquePipesLength = uniquePipes.size;

      noOfPipes.current = uniquePipesLength;
      setFormData((prevData) => ({
        ...prevData,
        year: response.data[0][0].pm_procsheet_year,
        type: response.data[0][0].pm_procsheet_seq,
        processsheet: response.data[0][0].pm_procsheet_code,
        clientname: response.data[0][0].clientname,
        projectname: response.data[0][0].project_name,
        project_id: response.data[0][0].project_id,
        procsheet_id: response.data[0][0].procsheet_id,
        pipesize: response.data[0][0].pipesize,
        typeofcoating: response.data[0][0].coating_type,
        procedure: wiSelectedProcedure || "",
        testdate: (new Date(response.data[0][0].test_date).toLocaleDateString("en-CA")),
        shift: response.data[0][0].pm_shift_id,
        coatingType: response.data[0][0].co_param_val_id,
        ispqt: response.data[0][0].pm_ispqt_id == 1 ? true : false,
      }))

      const procedureTypeIds = response.data[0][0].pm_Procedure_type_id.split(",");
      const validProcedureTypeIds = procedureTypeIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));

      const filteredData = data_procedure1.filter(item => validProcedureTypeIds.includes(item.value));
      const data_procedure = filteredData.map(id => ({
        value: id.value,
        label: id.label
      }));
      excludedPipes = []

      // Function to filter data based on Material_Id, ps_manufacturer_id, Grade_Id, and pm_batch
      const filterData = (materialId, manufacturerId, gradeId, batch) => {
        return response.data[4].filter(item =>
          item.Material_Id === materialId &&
          item.Manfacturer_Id === manufacturerId &&
          item.Grade_Id === gradeId &&
          item.pm_batch === batch
        );
      };


      if (value_type == "524") {
        const materials = response?.data[4].filter((data) => data.Material == "Phosphoric Acid")
        console.log(materials, "kshitiz")
        setMaterials(materials)
      }
      if (value_type == "525") {
        const materials = response?.data[4].filter((data) => data.Material === "Adhesive" || data.Material === "Chromate" || data.Material === "Fusion Bonded Epoxy" || data.Material === "High Density Polyethylene")
        // const uniqueMaterials = [...new Set(materials.map(item => item))];
        setMaterials(materials)
      }

      setWiSelectedProcedure(data_procedure)
      if (response.data[2].length > 0) {
        // const newData = removeDuplicates(response.data[2]);

        const processedData = {};


        response.data[2].forEach((item) => {
          const { pm_asl_number, PIPNO, pm_isrepair, pm_pono, pm_manufacturer_id, pm_material_id, pm_rm_batch, pm_grade_id, pm_rfid_data_id, pm_FieldNo, pm_pipe_lengthtelly, pm_po_item_no, pm_salesord_no, pm_item_no, pm_is_sample_cut, FieldNo, pipe_id, seqno, Coatstatus, co_param_val_name, pm_test_value1, pm_temperature1, pm_project_id, pm_procsheet_id, pm_test_run_id, pm_test_categ_id, pm_test_type_id, pm_test_id, pm_proc_template_id, pm_proc_test_id, pm_shift_id, pm_value_type, pm_test_value2, pm_procsheet_seq, pm_process_type_id, pm_test_result_remarks, pm_isfield, pm_islab, Airpressure_A1, Airpressure_A2, Airpressure_A3, Airpressure_A4, Airpressure_A5, Airpressure_A6, Airpressure_A7, Airpressure_A8, Airpressure_A9, Airpressure_A10, Airpressure_A11, Airpressure_A12, Airpressure_B1, Airpressure_B2, Airpressure_B3, Airpressure_B4, Airpressure_B5, Airpressure_B6, Airpressure_B7, Airpressure_B8, Airpressure_B9, Airpressure_B10, Airpressure_B11, Airpressure_B12, Flowrate_A1, Flowrate_A2, Flowrate_A3, Flowrate_A4, Flowrate_A5, Flowrate_A6, Flowrate_A7, Flowrate_A8, Flowrate_A9, Flowrate_A10, Flowrate_A11, Flowrate_A12, Flowrate_B1, Flowrate_B2, Flowrate_B3, Flowrate_B4, Flowrate_B5, Flowrate_B6, Flowrate_B7, Flowrate_B8, Flowrate_B9, Flowrate_B10, Flowrate_B11, Flowrate_B12, LineSpeed, DewPointforCoating, HdpeScrewRpm1, HdpeScrewRpm2, AdhesiveScrewRpm, pm_ntc_id, blastinglineSpeed, blastingmc1, blastingmc2 } = item;
          // Initialize if PIPNO is not already in processedData
          if (!processedData[seqno]) {
            processedData[seqno] = { seqno };
          }
          const materialData = response.data[4].find(material => material.ps_material_id === pm_material_id);
          const materialName = materialData ? materialData.Material : "Unknown Material";

          const manufacturerData = response.data[4].find(manufacturer => manufacturer.ps_manufacturer_id === pm_manufacturer_id);
          const manufacturerName = manufacturerData ? manufacturerData.Manfacturer : '';

          // Map Grade Name using pm_grade_id
          const gradeData = response.data[4].find(grade => grade.ps_grade_id === pm_grade_id);
          const gradeName = gradeData ? gradeData.Grade : '';
          // const filteredData = filterData(pm_material_id, pm_manufacturer_id, pm_grade_id, pm_rm_batch);
          // console.log(filteredData, "okays")
          // setMaterials(filteredData)
          processedData[seqno].seqno = seqno;
          processedData[seqno].pm_is_sample_cut = pm_is_sample_cut;
          processedData[seqno].POItemLists = pm_po_item_no;
          processedData[seqno].soNoLists = pm_salesord_no;
          processedData[seqno].ponos = pm_pono;
          processedData[seqno].SoLineItemLists = pm_item_no;
          processedData[seqno].material_multiple = materialName;
          processedData[seqno].manufacturer_multiple = manufacturerName;
          processedData[seqno].grade_multiple = gradeName;
          processedData[seqno].batch_multiple = pm_rm_batch;
          processedData[seqno].pm_pipe_lengthtelly = pm_pipe_lengthtelly;
          processedData[seqno].pm_FieldNo = FieldNo;
          processedData[seqno].pm_rfid_data_id = pm_rfid_data_id;
          // processedData[seqno].FieldNo = FieldNo;
          processedData[seqno].pm_repair = pm_isrepair;
          processedData[seqno].PIPNO = PIPNO;
          processedData[seqno].pipe_id = pipe_id;
          processedData[seqno].pm_ntc_id = pm_ntc_id;
          processedData[seqno].pm_asl_number = pm_asl_number;
          processedData[seqno].pm_test_result_remarks = pm_test_result_remarks;
          processedData[seqno].coat_status = Coatstatus;
          processedData[seqno].isfield = pm_isfield;
          processedData[seqno].islab = pm_islab;
          processedData[seqno].ntcReason = pm_test_result_remarks == "NTC" ? pm_test_value2 : "";
          processedData[seqno].rejectReason = pm_test_result_remarks == "Reject" ? pm_test_value2 : '';
          processedData[seqno].A1 = Airpressure_A1;
          processedData[seqno].A2 = Airpressure_A2;
          processedData[seqno].A3 = Airpressure_A3;
          processedData[seqno].A4 = Airpressure_A4;
          processedData[seqno].A5 = Airpressure_A5;
          processedData[seqno].A6 = Airpressure_A6;
          processedData[seqno].A7 = Airpressure_A7;
          processedData[seqno].A8 = Airpressure_A8;
          processedData[seqno].A9 = Airpressure_A9;
          processedData[seqno].A10 = Airpressure_A10;
          processedData[seqno].A11 = Airpressure_A11;
          processedData[seqno].A12 = Airpressure_A12;

          processedData[seqno].B1 = Airpressure_B1;
          processedData[seqno].B2 = Airpressure_B2;
          processedData[seqno].B3 = Airpressure_B3;
          processedData[seqno].B4 = Airpressure_B4;
          processedData[seqno].B5 = Airpressure_B5;
          processedData[seqno].B6 = Airpressure_B6;
          processedData[seqno].B7 = Airpressure_B7;
          processedData[seqno].B8 = Airpressure_B8;
          processedData[seqno].B9 = Airpressure_B9;
          processedData[seqno].B10 = Airpressure_B10;
          processedData[seqno].B11 = Airpressure_B11;
          processedData[seqno].B12 = Airpressure_B12;

          processedData[seqno].SecondA1 = Flowrate_A1;
          processedData[seqno].SecondA2 = Flowrate_A2;
          processedData[seqno].SecondA3 = Flowrate_A3;
          processedData[seqno].SecondA4 = Flowrate_A4;
          processedData[seqno].SecondA5 = Flowrate_A5;
          processedData[seqno].SecondA6 = Flowrate_A6;
          processedData[seqno].SecondA7 = Flowrate_A7;
          processedData[seqno].SecondA8 = Flowrate_A8;
          processedData[seqno].SecondA9 = Flowrate_A9;
          processedData[seqno].SecondA10 = Flowrate_A10;
          processedData[seqno].SecondA11 = Flowrate_A11;
          processedData[seqno].SecondA12 = Flowrate_A12;

          processedData[seqno].SecondB1 = Flowrate_B1;
          processedData[seqno].SecondB2 = Flowrate_B2;
          processedData[seqno].SecondB3 = Flowrate_B3;
          processedData[seqno].SecondB4 = Flowrate_B4;
          processedData[seqno].SecondB5 = Flowrate_B5;
          processedData[seqno].SecondB6 = Flowrate_B6;
          processedData[seqno].SecondB7 = Flowrate_B7;
          processedData[seqno].SecondB8 = Flowrate_B8;
          processedData[seqno].SecondB9 = Flowrate_B9;
          processedData[seqno].SecondB10 = Flowrate_B10;
          processedData[seqno].SecondB11 = Flowrate_B11;
          processedData[seqno].SecondB12 = Flowrate_B12;
          processedData[seqno].LineSpeed = LineSpeed;
          processedData[seqno].DewPointforCoating = DewPointforCoating;
          processedData[seqno].blastingLineSpeed = blastinglineSpeed;
          processedData[seqno].blastingLoad1 = blastingmc1;
          processedData[seqno].blastingLoad2 = blastingmc2;
          processedData[seqno].HdpeScrewRpm1 = HdpeScrewRpm1;
          processedData[seqno].AdhesiveScrewRpm = AdhesiveScrewRpm;
          processedData[seqno].HdpeScrewRpm2 = HdpeScrewRpm2;

          // Add current item's data under the co_param_val_name for this seqno
          processedData[seqno][co_param_val_name.replace(/[^\w\s]/g, '')] = {
            pm_test_value1,
            pm_temperature1,
            pm_project_id,
            pm_procsheet_id,
            pm_test_run_id,
            pm_test_categ_id,
            pm_test_type_id,
            pm_test_id,
            pm_proc_template_id,
            pm_proc_test_id,
            pm_shift_id,
            pm_value_type,
            pm_test_value2,
            pm_procsheet_seq,
            pm_process_type_id,
          };

          const witnessData = response2.data[2].find(witness => witness.pipe_id === pipe_id);
          if (witnessData) {
            const witnessIds = witnessData.pm_random_witness_id?.split(',').map(id => id.trim());

            processedData[seqno].witness_1 = witnessIds?.includes('625');
            processedData[seqno].witness_2 = witnessIds?.includes('629');
            processedData[seqno].witness_3 = witnessIds?.includes('626');
            processedData[seqno].witness_4 = witnessIds?.includes('638');
          }
        });

        setDefaultLineSpeed(response?.data[10][0]?.pm_line_speed)
        setDefaultNoOfGuns(response?.data[10][0]?.pm_no_of_epoxy_guns_operate)
        setDefaultDewPoint(response?.data[10][0]?.pm_dew_pt_temp)
        setDefaultHdpe1(response?.data[10][0]?.pm_hdpe_screw_rpm?.split(',')[0])
        setDefaultHdpe2(response?.data[10][0]?.pm_hdpe_screw_rpm?.split(',')[1])

        setBlastingLineSpeed(response?.data[11][0]?.pm_blasted_line_speed)
        setblastingLoad1(response?.data[11][0]?.blastingmc1)
        setBlastingLoad2(response?.data[11][0]?.blastingmc2)


        for (const seqno in processedData) {
          const tests = processedData[seqno];

          // Loop through nested tests within each PIPNO
          for (const testName in tests) {
            const testInfo = tests[testName];

            // Check if testInfo is defined and has pm_test_id
            if (testInfo && testInfo.pm_test_id) {
              const pmTestId = testInfo.pm_test_id;

              // Match with additional data based on pm_test_id
              const matchingData = response.data[1].find(addData => addData.pm_test_id === pmTestId);

              if (matchingData) {
                // Add the new values to the testInfo object
                tests.pm_line_speed = matchingData.pm_line_speed;
                tests.pm_dew_pt_temp = matchingData.pm_dew_pt_temp;
                tests.pm_hdpe_screw_rpm = matchingData.pm_hdpe_screw_rpm;
                tests.pm_adhes_screw_rpm = matchingData.pm_adhes_screw_rpm;
              }
            }
          }
        }
        // Convert processedData to desired output format
        console.log(processedData)
        const result = Object.values(processedData);

        setExistingDataForGrid(result);
        // setDataForGrid(result);
      }
      setTypeGrids(true);
      setNtcReasons(response?.data[6])
      setRejectReason(response?.data[12])
      setApiResponse(response.data[1]);
      setYear(response.data[0][0].pm_procsheet_year)
      setRemarksList(response.data[5])
      setMatMafGrade(response?.data[4])
      const formattedData = formatDataForAPI(response?.data[4]);
      setEditRawMaterialList(formattedData)

      const response1 = await axios.get(`${Environment.BaseAPIURL}/api/User/GETInstrumentDetailsByReportId?ReportId=${value_type1}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      const data = response1.data[0]
      setusedInstrument(data);

      const response4 = await axios.post(`${Environment.BaseAPIURL}/api/User/GetEmployeeTypeWithName?p_procsheet_id=${procsheetId}&p_test_run_id=${pm_test_run_id1}&p_type_id=${value_type1}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      setWitnessData(response4?.data)

      const response5 = await axios
        .get(
          Environment.BaseAPIURL +
          `/api/User/GetDestinationDetails?pm_procsheet_id=${encryptData(response.data[0][0].procsheet_id)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
        )
      const orderNumbers = response5.data[0].map(item => item.pm_salesord_no);
      setSoNoList(orderNumbers)

      const poNo = response5.data[0].map(item => item.pono);
      setPono(poNo)
      console.log(poNo, "poNo")

      const soLineItems = response5.data[0].map(item => item.pm_item_no);
      console.log(soLineItems, "SoLineItemList")
      setSoLineItemList(soLineItems)

      const PoItems = response5.data[0].map(item => item.pm_po_item_no);
      setPOItemList(PoItems)
    } catch (error) {
      console.error('Error fetching report data:', error);
    }
  }

  // useEffect(() => {
  //   axios.get(Environment.BaseAPIURL + `/api/User/GetWiTestList?sub_test_id=0&test_id=${value_type}`)
  //     .then((response) => {
  //       console.log(response, "WI NO")
  //     })
  // }, [value_type])

  const date = new Date();
  const futureDate = date.getDate();
  date.setDate(futureDate);
  const defaulttestdate = date.toLocaleDateString("en-CA");
  const [year, setYear] = useState(year_query ? year_query : "");
  const [type, setType] = useState(sequence_no ? sequence_no : "");
  const [processType, setProcessType] = useState(
    process_type ? process_type : ""
  );
  const [formData, setFormData] = useState({
    processsheet: "",
    year: year,
    type: type,
    clientname: "",
    projectname: "",
    project_id: "",
    procsheet_id: "",
    pipesize: "",
    typeofcoating: "",
    procedure: "",
    testdate: defaulttestdate,
    shift: "",
    coatingType: processType,
    fieldtesting: "",
    labtesting: "",
    ispqt: false,
    rm_batch: "",
    material_id: "",
    manufacturer_id: "",
    grade_id: "",
    created_by: empId?.toString(),
    isSubmit: "",
    isThickness: "",
  });

  const [approvalFormData, setApprovalFormData] = useState({
    approvertype: "",
    QCApproverejectflag: "",
    QCApproverejectremark: "",
    pmtestrunid: "123",
  });

  let [APIresponse, setApiResponse] = useState([]);
  let [DataforGrid, setDataForGrid] = useState([]);
  let [ExistingDataforGrid, setExistingDataForGrid] = useState([]);
  let [materialUsed, setMaterialUsed] = useState([]);
  let [count, setCount] = useState(0);

  const [TypeGrids, setTypeGrids] = useState("");
  const [TestDDL, setTestDDL] = useState("");

  const shouldDisableFields = year && type;
  const ProcessSheetFields = year && type;
  let ShowProcessTypeGrids = TypeGrids;
  const [ddlYear, setddlYear] = useState([]);
  const [coatingType, setCoatingType] = useState([]);
  const [selectedProcedures1, setSelectedProcedures1] = useState([]);
  const [ddlShift, setShift] = useState([]);
  const [ddlprocedure, setProcedure] = useState([]);
  const [ddlfieldTesting, setddlfieldTesting] = useState([]);
  const [ddlLabtesting, setddlLabtesting] = useState([]);
  const [Remarks, setRemarks] = useState([]);
  const ddlRemarks = [];
  const [usedInstrument, setusedInstrument] = useState([]);
  const [isDetailsListFetched, setIsDetailsListFetched] = useState(false);
  const [coatStatusOptions, setCoatStatusOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [frequencyDetails, setFrequencyDetails] = useState([]);
  const [frequency, setFrequency] = useState([]);
  const [remarksList, setRemarksList] = useState([])
  const [ntcReasons, setNtcReasons] = useState([])
  const [rejectReason, setRejectReason] = useState([])

  const [ntcValue, setNtcValue] = useState()
  const [submit, setSubmit] = useState()
  const [typeOfProcess, setTypeOfProcess] = useState()
  const [previousStationPipes, setPreviousStationPipes] = useState([])
  const [shiftId, setShiftId] = useState()
  const [materials, setMaterials] = useState([])
  const [manufacturers, setManufacturers] = useState([])
  const [grade, setGrade] = useState([])
  const [batch, setBatch] = useState([])
  // const [thicknessData, setThicknessData] = useState({
  //   coatstatus: '',
  //   islab: '',
  //   isfield: ''
  // })

  useEffect(() => {
    fetchData();
    const fetchSuggestions = async () => {
      const suggestionList = [
        { ClientID: 'Batch1', ClientName: 'Batch 1' },
        { ClientID: 'Batch2', ClientName: 'Batch 2' },
        { ClientID: 'Batch3', ClientName: 'Batch 3' },
        { ClientID: 'Batch4', ClientName: 'Batch 4' },
      ];
      setSuggestions(suggestionList);
    };

    fetchSuggestions();
  }, []);


  const handleClientChange = (selectedOption) => {
    setSelectedOption(selectedOption);
  };


  useEffect(() => {
    if (process_type && sequence_no && isDetailsListFetched) {
      getTestBlastingDataEntries(process_type);
    }
  }, [process_type, sequence_no, isDetailsListFetched]);

  const handleprocedureChange = (selectedOption) => {
    handleTypeChange({ target: { name: "procedure", value: selectedOption } });
  };

  const handlefieldtestingChange = (selectedOption) => {
    handleTypeChange({
      target: { name: "fieldtesting", value: selectedOption },
    });
  };
  const handlelabtestingChange = (selectedOption) => {
    handleTypeChange({ target: { name: "labtesting", value: selectedOption } });
  };

  const [typeblasting, settypeblasting] = useState([
    {
      "Raw Material Name": "Adhesive",
      "MFR": "Manufacture",
      "Grade": "Grade"
    }
  ]);

  const onDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this row?')) {
      const newRowData = rowData.filter(row => row.id !== id);
      rowData = newRowData;
    }
  };

  const [matManGrade, setMatMafGrade] = useState([]);
  const [selectedBatches, setSelectedBatches] = useState({});

  const getTestBlastingEntry = () => {
    axios
      // .get(
      //   Environment.BaseAPIURL +
      //   `/api/User/GetTestBlastingdataEntry?processsheetno=${formData.type}&processtype=0`
      // )
      .get(
        Environment.BaseAPIURL +
        `/api/User/GetTestBlastingdataEntryNewtmp?processsheetno=${encryptData(formData.type)}&processtype=${encryptData(0)}&TestDate=${encryptData(formData.testdate)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }
      )
      .then((response) => {
        // rowData = []
        setNtcReasons(response?.data[9])
        setRejectReason(response?.data[15])
        if (response.data[3].length < 1) {
          setFormData({
            processsheet: "",
            year: year,
            type: type,
            clientname: "",
            projectname: "",
            project_id: "",
            procsheet_id: "",
            pipesize: "",
            typeofcoating: "",
            procedure: "",
            testdate: defaulttestdate,
            shift: "",
            coatingType: processType,
            fieldtesting: "",
            labtesting: "",
            ispqt: false,
            rm_batch: "",
            material: "",
            manufacturer: "",
            grade: "",
            created_by: empId.toString(),
            isSubmit: "",
            isThickness: "",
          });
        }
        if (response.data[7].length > 0) {
          setShiftId(response.data[7][0].pm_shift_id);
        }
        if (response.data[3].length > 0) {
          const sprocedure = response.data[3][0]["sprocedure"];
          let selectedProcedures = [];
          if (sprocedure) {
            const selectedProcedureIds = sprocedure.split(",").filter(Boolean);
            selectedProcedures = selectedProcedureIds
              .map((id) => {
                const procedure = ddlprocedure.find(
                  (proc) => proc.pm_workinst_detail_id == id
                );
                return procedure
                  ? {
                    value: procedure.pm_workinst_detail_id,
                    label: procedure.pm_workinst_doc_id,
                  }
                  : null;
              })
              .filter(Boolean);
          }

          setFormData({
            ...formData,
            processsheet: response.data[3][0]["pm_procsheet_code"],
            type: formData.type + "",
            clientname: response.data[3][0]["clientname"],
            projectname: response.data[3][0]["project_name"],
            project_id: response.data[3][0]["project_id"] + "",
            procsheet_id: response.data[3][0]["procsheet_id"] + "",
            pipesize: response.data[3][0]["pipesize"],
            typeofcoating: response.data[3][0]["coating_type"],
            procedure: selectedProcedures,
          });
        }
        setCurrentShift(response.data[7][0].pm_shift_id)
      })
      .catch((error) => {
        console.error("Error fetching API data:", error);
      });
  };

  const findUniqueEquipments = (equipments) => {
    const seen = new Set();
    return equipments.filter(
      (equipment) =>
        !seen.has(equipment.equip_id) && seen.add(equipment.equip_id)
    );
  };

  const handleTypeChange = (event, index) => {
    const { name, value } = event.target;
    switch (name) {
      case "year":
        setYear(event.target.value);
        updateyear(event.target.value);
        break;
      case "type":
        setType(event.target.value);
        updateProcessType(event.target.value);
        break;
      case "procedure":
        setFormData({ ...formData, procedure: value });
        break;
      case "testdate":
        setFormData({ ...formData, testdate: value });
        break;
      case "shift":
        setFormData({ ...formData, shift: value });
        break;
      case "coatingType":
        setProcessType(value);
        setFormData({ ...formData, coatingType: value });
        if (value == 526) {
          // return getThicknessInstruments();
        }
        getTestBlastingDataEntries(value);
        break;
      case "ispqt":
        if (formData.ispqt === false) {
          setFormData({ ...formData, ispqt: true });
        } else {
          setFormData({ ...formData, ispqt: false });
        }
        break;
      default:
        setFormData({ ...formData, [name]: value });
    }
  };

  const updateyear = (value) => {
    setFormData({ ...formData, year: value });
  };

  const updateProcessType = (value) => {
    setFormData({ ...formData, type: value });
  };

  const fetchData = () => {
    axios
      .get(Environment.BaseAPIURL + `/api/User/GetShiftID`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      .then((response) => {
        setIsDetailsListFetched(true);
        const filteredOptions = response.data[0].filter(option => option.co_param_val_id == value_type);
        setCoatingType(filteredOptions);

        setProcedure(response.data[1]);
        setddlYear(response.data[2]);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        getCoatStatusOptions();
      });
  };


  const fetchFrequency = async (value, data1) => {
    try {
      const response = await axios.post(Environment.BaseAPIURL + `/api/User/GetFrequencyCriteria?processsheetno=${encryptData(formData.type)}&processtype=${encryptData(value)}&isPqt=${encryptData(formData.ispqt ? 0 : 1)}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      setFrequency(response.data[0].frequency);
      setFrequencyDetails(response.data[0]._FrequencyCriteriaDetails);

      const response1 = await axios.get(`${Environment.BaseAPIURL}/api/User/GETInstrumentDetailsByReportId?ReportId=${value_type1}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      const data = response1.data[0]
      setusedInstrument(data);
      console.log(value_type, "typeOfProcess")
      const response2 = value_type != 528 ? await axios
        .get(
          Environment.BaseAPIURL +
          `/api/User/GetPendingPipedetails?ProcessType=${encryptData(value)}&procsheetid=${encryptData(data1)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
        ) : await axios
          .get(
            Environment.BaseAPIURL +
            `/api/User/GetExternalFinalDataPendingPipe?pm_process_type_id=${encryptData(528)}&pm_procsheet_id=${encryptData(data1)}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          }
          )
      setPreviousStationPipes(response2?.data[0])
    }
    catch (error) {
      console.error("Error fetching data:", error);
    };
  };

  const editBlastingDataEntry = (value, value1, value2) => {

    // axios
    //   // .get(
    //   //   Environment.BaseAPIURL +
    //   //   `/api/User/GetTestBlastingdataEntry?processsheetno=${formData.type}&processtype=${value}`
    //   // )
    //   .get(
    //     Environment.BaseAPIURL +
    //     `/api/User/GetTestBlastingdataEntryNewtmp?processsheetno=${value}&processtype=${value1}&TestDate=${value2}`
    //   )
    //   .then((response) => {
    //     setCount(count => count + 1)
    //     setMaterials(response?.data[10])
    //     if (response.data[8].length > 0) {
    //       setRemarksList(response.data[8])
    //     }
    //     if (response.data[7].length > 0) {
    //       setShift(response.data[7]);
    //     }
    //     if (response.data.length > 0) {
    //       fetchFrequency();
    //     }
    //     const uniqueEquipments = findUniqueEquipments(response.data[6]);
    //     setusedInstrument(uniqueEquipments);
    //     if (formData.coatingType === "526") {
    //       setddlfieldTesting(response.data[4]);
    //       setddlLabtesting(response.data[5]);
    //       setTestDDL(true);
    //     } else {
    //       setTestDDL(false);
    //     }
    //     if (response.data[0].length) {
    //       setTypeGrids(true);
    //       setApiResponse(response.data[0]);
    //     } else {
    //       setTypeGrids(false);
    //     }
    //     if (response.data[1].length > 0) {
    //       setDataForGrid(response.data[1]);
    //     }
    //     if (response.data[2].length > 0) {
    //       setExistingDataForGrid(response.data[2]);
    //     }

    //     if (response.data[8].length > 0) {
    //       setRemarks(response.data[8]);
    //       response.data[8].forEach((item) => {
    //         ddlRemarks.push(item.cbrm_remarks_val);
    //       });
    //     }

    //     if (response.data[7].length > 0) {
    //       // setShift(response.data[7]);
    //     }

    //     if (response.data[3].length > 0) {
    //       const sprocedure = response.data[3][0]["sprocedure"];
    //       let selectedProcedures = [];
    //       if (sprocedure) {
    //         const selectedProcedureIds = sprocedure.split(",").filter(Boolean);
    //         selectedProcedures = selectedProcedureIds
    //           .map((id) => {
    //             const procedure = ddlprocedure.find(
    //               (proc) => proc.pm_workinst_detail_id == id
    //             );
    //             return procedure
    //               ? {
    //                 value: procedure.pm_workinst_detail_id,
    //                 label: procedure.pm_workinst_doc_id,
    //               }
    //               : null;
    //           })
    //           .filter(Boolean);
    //       }

    //       setFormData({
    //         ...formData,
    //         processsheet: response.data[3][0]["pm_procsheet_code"],
    //         type: formData.type + "",
    //         clientname: response.data[3][0]["clientname"],
    //         projectname: response.data[3][0]["project_name"],
    //         project_id: response.data[3][0]["project_id"] + "",
    //         procsheet_id: response.data[3][0]["procsheet_id"] + "",
    //         pipesize: response.data[3][0]["pipesize"],
    //         typeofcoating: response.data[3][0]["coating_type"],
    //         procedure: selectedProcedures,
    //         shift: response.data[3][0]["pm_shift_id"],
    //         coatingType: value,
    //       });
    //     }
    //   })
    //   .catch((error) => {
    //     console.error("Error fetching API data:", error);
    //   });
  };

  const getTestBlastingDataEntries = async (value) => {
    try {
      setTypeOfProcess(value)
      const response = await axios
        .get(
          Environment.BaseAPIURL +
          `/api/User/GetTestBlastingdataEntryNewtmp?processsheetno=${encryptData(formData.type)}&processtype=${encryptData(value)}&TestDate=${encryptData(formData.testdate)}&shiftid=${encryptData(currentShift)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
        )
      // rowData = []
      const uniquePipes = new Set(response?.data[1].map(item => item.PIPNO));

      // Get the number of unique pipes
      const uniquePipesLength = uniquePipes.size;

      noOfPipes.current = uniquePipesLength;
      setDefaultLineSpeed(response?.data[13][0]?.LineSpeed)
      setBlastingLineSpeed(response?.data[14][0]?.pm_blasted_line_speed)
      setblastingLoad1(response?.data[14][0]?.blastingmc1)
      setBlastingLoad2(response?.data[14][0]?.blastingmc2)
      setDefaultDewPoint(response?.data[13][0]?.AirCoating)
      if (value_type == "524") {
        const materials = response?.data[11].filter((data) => data.Material == "Phosphoric Acid")
        console.log(materials, "kshitiz")
        setMaterials(materials)
      }
      if (value_type == "525") {
        const materials = response?.data[11].filter((data) => data.Material === "Adhesive" || data.Material === "Chromate" || data.Material === "Fusion Bonded Epoxy" || data.Material === "High Density Polyethylene")
        // const uniqueMaterials = [...new Set(materials.map(item => item))];
        setMaterials(materials)
      }
      // setDefaultNoOfGuns(4)
      setDefaultNoOfGuns(response?.data[13][0]?.EpoxyGun)
      setDefaultHdpe1(response?.data[13][0]?.HdpeScrew?.split(',')[0])
      setDefaultHdpe2(response?.data[13][0]?.HdpeScrew?.split(',')[1])
      setShift(response.data[7][0])
      if (response.data[1].length > 0) {
        const processedData = {};
        response.data[1].forEach((item, index) => {
          if (index == 0) {
            setTestRunId(item.pm_test_run_id)
          }
          if (item.issaved == 1) {
            const { pm_asl_number, PIPNO, pipe_id, pm_pipe_lengthtelly, pm_po_item_no, pm_salesord_no, pm_pono, pm_item_no, pm_is_sample_cut, pm_rfid_data_id, FieldNo, seqno, pm_ntc_id, Coatstatus, co_param_val_name, pm_test_value1, pm_temperature1, pm_project_id, pm_procsheet_id, pm_test_run_id, pm_test_categ_id, pm_test_type_id, pm_test_id, pm_proc_template_id, pm_proc_test_id, pm_shift_id, pm_value_type, pm_test_value2, pm_procsheet_seq, pm_process_type_id, pm_test_result_remarks, pm_isfield, pm_islab, pm_random_witness_id, issaved, blastinglineSpeed, blastingmc1, blastingmc2 } = item;

            // Initialize if PIPNO is not already in processedData
            if (!processedData[seqno]) {
              processedData[seqno] = { seqno };
            }
            console.log(pm_test_value2, "pm_test_value2")
            processedData[seqno].seqno = seqno;
            processedData[seqno].pm_is_sample_cut = pm_is_sample_cut;
            processedData[seqno].POItemLists = pm_po_item_no;
            processedData[seqno].soNoLists = pm_salesord_no;
            processedData[seqno].ponos = pm_pono;
            processedData[seqno].SoLineItemLists = pm_item_no;
            processedData[seqno].pm_pipe_lengthtelly = pm_pipe_lengthtelly;
            // processedData[seqno].FieldNo = FieldNo;
            processedData[seqno].pm_FieldNo = FieldNo;
            processedData[seqno].pm_rfid_data_id = pm_rfid_data_id;
            processedData[seqno].PIPNO = PIPNO;
            processedData[seqno].pm_ntc_id = pm_ntc_id;
            processedData[seqno].pipe_id = pipe_id;
            processedData[seqno].pm_asl_number = pm_asl_number;
            processedData[seqno].pm_test_result_remarks = pm_test_result_remarks;
            processedData[seqno].coat_status = Coatstatus;
            processedData[seqno].isfield = pm_isfield;
            processedData[seqno].islab = pm_islab;
            processedData[seqno].ntcReason = pm_test_result_remarks == "NTC" ? pm_test_value2 : "";
            processedData[seqno].rejectReason = pm_test_result_remarks == "Reject" ? pm_test_value2 : '';
            // processedData[seqno].ntcReason = pm_test_value2;
            processedData[seqno].random_witness_id1 = pm_random_witness_id;
            processedData[seqno].random_witness_id2 = pm_random_witness_id;
            processedData[seqno].random_witness_id3 = pm_random_witness_id;
            processedData[seqno].random_witness_id4 = pm_random_witness_id;
            processedData[seqno].blastingLineSpeed = blastinglineSpeed;
            processedData[seqno].blastingLoad1 = blastingmc1;
            processedData[seqno].blastingLoad2 = blastingmc2;
            processedData[seqno].issaved = issaved;
            // Add current item's data under the co_param_val_name for this seqno
            processedData[seqno][co_param_val_name.replace(/[^\w\s]/g, '')] = {
              pm_test_value1,
              pm_temperature1,
              pm_project_id,
              pm_procsheet_id,
              pm_test_run_id,
              pm_test_categ_id,
              pm_test_type_id,
              pm_test_id,
              pm_proc_template_id,
              pm_proc_test_id,
              pm_shift_id,
              pm_value_type,
              pm_test_value2,
              pm_procsheet_seq,
              pm_process_type_id,
            };
          }
        });

        // Convert processedData to desired output format
        console.log(processedData, "910")
        const result = Object.values(processedData);
        setExistingDataForGrid(result);
        // setDataForGrid(result);
      }
      setCount(count => count + 1)
      setNtcReasons(response?.data[9])
      setRejectReason(response?.data[15])
      setMatMafGrade(response?.data[11])

      // setMaterials(mergedData)
      if (response.data[8].length > 0) {
        setRemarksList(response.data[8])
      }
      if (response.data[7].length > 0) {
        // setShift(response.data[7]);
      }
      if (response.data.length > 0) {
        fetchFrequency(value, response.data[3][0]["procsheet_id"]);
      }
      if (formData.coatingType === "526") {
        setddlfieldTesting(response.data[4]);
        setddlLabtesting(response.data[5]);
        setTestDDL(true);
      } else {
        setTestDDL(false);
      }
      if (action != 'edit') {
        if (response.data[0].length) {
          setTypeGrids(true);
          setApiResponse(response.data[0]);
        } else {
          setTypeGrids(false);
        }
        let matchingData = [];
        if (response.data[1].length > 0) {
          for (var i = 0; i < response.data[1].length; i++) {
            if (response.data[1][i].issaved == 0) {
              console.log(i)
              matchingData.push(response.data[1][i]);
            }
          }
          console.log(matchingData)
          setDataForGrid(matchingData);
        }
        if (response.data[0].length < 1) {
          if (value != '') {
            toast.error("There are no tests added for this process sheet")
          }
        }
        if (response.data[1].length < 1) {
          if (value != '') {
            toast.error("There are no pipes added for this process sheet")
          }
        }
      }
      // if (response.data[2].length > 0) {
      //   setExistingDataForGrid(response.data[2]);
      // }

      if (response.data[8].length > 0) {
        setRemarks(response.data[8]);
        response.data[8].forEach((item) => {
          ddlRemarks.push(item.cbrm_remarks_val);
        });
      }

      if (response.data[7].length > 0) {
        // setShift(response.data[7]);
      }

      if (response.data[3].length > 0) {
        const sprocedure = response.data[3][0]["sprocedure"];
        let selectedProcedures = [];
        if (sprocedure) {
          const selectedProcedureIds = sprocedure.split(",").filter(Boolean);
          selectedProcedures = selectedProcedureIds
            .map((id) => {
              const procedure = ddlprocedure.find(
                (proc) => proc.pm_workinst_detail_id == id
              );
              return procedure
                ? {
                  value: procedure.pm_workinst_detail_id,
                  label: procedure.pm_workinst_doc_id,
                }
                : null;
            })
            .filter(Boolean);
        }

        setFormData({
          ...formData,
          processsheet: response.data[3][0]["pm_procsheet_code"],
          type: formData.type + "",
          clientname: response.data[3][0]["clientname"],
          projectname: response.data[3][0]["project_name"],
          project_id: response.data[3][0]["project_id"] + "",
          procsheet_id: response.data[3][0]["procsheet_id"] + "",
          pipesize: response.data[3][0]["pipesize"],
          typeofcoating: response.data[3][0]["coating_type"],
          procedure: selectedProcedures,
          shift: response.data[3][0]["pm_shift_id"],
          coatingType: value,
        });
      }

      const response1 = await axios
        .get(
          Environment.BaseAPIURL +
          `/api/User/GetDestinationDetails?pm_procsheet_id=${encryptData(formData.procsheet_id)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
        )
      const orderNumbers = response1.data[0].map(item => item.pm_salesord_no);
      setSoNoList(orderNumbers)

      const poNo = response1.data[0].map(item => item.pono);
      setPono(poNo)
      console.log(poNo, "poNo")

      const soLineItems = response1.data[0].map(item => item.pm_item_no);
      console.log(soLineItems, "SoLineItemList")
      setSoLineItemList(soLineItems)

      const PoItems = response1.data[0].map(item => item.pm_po_item_no);
      setPOItemList(PoItems)

      console.log(response1, response1.data[0], "destinations")

    } catch (error) {
      console.error('Error fetching report data:', error);
    }

  };
  const getThicknessInstruments = () => {
    axios
      .post(Environment.BaseAPIURL + `/api/User/getinstrumentlist`, {
        processsheetno: formData.type || "",
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      .then((response) => {
        if (response?.data) {
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const handleChange = (selectedOption) => {
    if (userRole === "Admin") {
      setWiSelectedProcedure(selectedOption);
    }
  };

  console.log(matManGrade, "matManGrade");


  const groupedData = matManGrade.reduce((acc, item) => {
    const key = `${item.Material_Id}_${item.Manfacturer_Id}_${item.Grade_Id}`;
    if (!acc[key]) {
      acc[key] = { ...item, batches: [] };
    }
    acc[key].batches.push(item.pm_batch == 0 ? '' : item.pm_batch);
    return acc;
  }, {});

  const groupedDataArray = Object.values(groupedData);
  const handleBatchChange = (key, selectedOption) => {
    setSelectedBatches(prevState => ({
      ...prevState,
      [key]: selectedOption,
    }));
  };

  console.log(selectedBatches, groupedDataArray, "groupedDataArray");


  const getCoatStatusOptions = async () => {
    axios
      .get(Environment.BaseAPIURL + `/api/User/GetCoatStatustypeData`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      .then((response) => {
        if (response?.data) {
          setCoatStatusOptions(response.data);
          axios.get(Environment.BaseAPIURL + `/api/User/GetWiTestList?sub_test_id=${encryptData(0)}&test_id=${value_type1}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          })
            .then((response) => {
              const procedures = response?.data.map(item => ({ value: item.work_instr_id, label: item.workinst_doc_id }));
              setWiProcedure(procedures)
              setWiSelectedProcedure(procedures);
              if (action == 'edit') {
                editData(procedures)
              }
            })
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        loading.current = (false);
      });
  };

  const containerStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);

  const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);
  // class TwoInputEditor {
  //   init(params) {
  //     this.params = params;

  //     // Create a container div
  //     this.eGui = document.createElement('div');

  //     // Create first input
  //     this.input1 = document.createElement('input');
  //     this.input1.value = params.value ? params.value.split(',')[0] : '';
  //     this.eGui.appendChild(this.input1);

  //     // Create second input
  //     this.input2 = document.createElement('input');
  //     this.input2.value = params.value ? params.value.split(',')[1] : '';
  //     this.eGui.appendChild(this.input2);
  //   }

  //   getGui() {
  //     return this.eGui;
  //   }

  //   getValue() {
  //     return `${this.input1.value},${this.input2.value}`;
  //   }

  //   isPopup() {
  //     return false;
  //   }
  // }

  const defaultColDef = useMemo(() => {

    return {

      initialWidth: 200,

      wrapHeaderText: true,

      autoHeaderHeight: true,

      resizable: true,

      flex: 1, // Distributes column width equally across available space

      minWidth: 100, // Ensures columns have a minimum width

      suppressSizeToFit: false, // Allows resizing based on the container size 

    };

  }, []);
  let columnDefs = [
    // {
    //   headerName: "Actions",
    //   field: "actions",
    //   cellRenderer: "removeButtonRenderer",
    //   width: 50,
    //   headerClass: "custom-header",
    // },
    {
      headerName: "S No.",
      field: "Id",
      headerClass: "custom-header",
      width: 50,
      sortable: false,
      movable: false,
    },
    {
      headerName: "Pipe No.",
      field: "pipeno",
      headerClass: "custom-header",
      width: 50,
      sortable: false
    },
    {
      headerName: "ASL No.",
      field: "aslno",
      headerClass: "custom-header",
      width: 50,
      sortable: false
    },
  ];
  //End TestGrid

  let finlrowdata = "";
  let rowData = [];
  let fieldsNamesarr = [];
  let columnsArr = []
  let valueids = [];
  let dynamicRowDataForZerothPos = "";
  let dynamicRowDataForFirstPos = "";
  function removeSpecialCharacters(str) {
    // Replace any character that is not alphanumeric or underscore with an empty string
    return str?.replace(/[^\w\s]/gi, '');
  }
  APIresponse.forEach(function (element, index) {
    const new_param_value = removeSpecialCharacters(element.co_param_val_name)
    element.co_param_val_name = new_param_value
    let fieldsNames;
    if (
      element.PM_Reqmnt_test_min !== null &&
      element.PM_Reqmnt_test_Max !== null
    ) {
      let dynamicField;
      dynamicField = element.co_param_val_name?.split(" ").join("");
      columnsArr.push(dynamicField)
      fieldsNames = dynamicField;
      const selectValues = dynamicField == 'DegreeOfDustClass' || dynamicField == 'DegreeOfDustRating' ? [element.PM_Reqmnt_test_min, element.PM_Reqmnt_test_Max] : element?.pm_test_value?.split(/,\s*/)
      const values = element.pm_value_type == "A" ? element.pm_test_value : element.PM_Reqmnt_test_min
      console.log(selectValues, dynamicField, "selectValues")
      let obj = {
        headerName: element.co_param_val_name,
        field: dynamicField,
        sortable: false,
        editable: function (params) {
          if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
            // if (params.data.remarks != 'NTC') {
            if (params.data.coat_status != 'Bare' && params.data.coat_status != 'H/C Trial' && params.data.coat_status != 'Partially Coated' && params.data.coat_status != 'FBE') {
              return true;
            }
          } else {
            return false;
          }
        },
        cellEditor: (element.pm_value_type === "A" || dynamicField == "pHofPipeSurfaceAfterwaterwash" || dynamicField == 'pHofPipeSurfaceBeforewaterwash' || dynamicField == 'DegreeOfDustClass' || dynamicField == 'DegreeOfDustRating') && element.pm_test_value != '-' && dynamicField != 'DewPointC' ? "agSelectCellEditor" : '',
        cellEditorParams: {
          values: selectValues?.map((data) => data),
        },
        // valueFormatter: (params) => {
        //   console.log(params.node.rowIndex)
        //   if (element.pm_value_type === "A" && params.colDef.field === obj.field && params.node.rowIndex > 1) {
        //     // Only set the first value of selectValues if the field matches obj.field, row index is >= 2, and pm_value_type is "A"
        //     return params.value ? params.value : (selectValues.length > 0 ? selectValues[0] : "Ok");
        //   } else {
        //     // For all other fields, just return the value as is
        //     return params.value;
        //   }
        // },
        headerClass: "custom-header",
        cellStyle: (params) => {
          if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
            if (typeof parseFloat(params.value) == "number") {
              let minvalue = rowData[0][params.colDef.field];
              let maxvalue = rowData[1][params.colDef.field];
              if ((minvalue === '' && parseFloat(params.value) > maxvalue) ||
                (maxvalue === '' && parseFloat(params.value) < minvalue) ||
                (maxvalue !== '' && minvalue !== '' &&
                  (parseFloat(params.value) < minvalue || parseFloat(params.value) > maxvalue))) {
                return { borderColor: "#ED2939" };
              } else {
                return { borderColor: "#34B233" };
              }
            } else {
              return { borderColor: "#FFA100" };
            }
          }
        },
        valueSetter: TestGridValueSetter,
      };

      columnDefs.push(obj);
      if (dynamicRowDataForZerothPos === "") {
        dynamicRowDataForZerothPos =
          '"' + dynamicField + '":' + '"' + values + '",';
        dynamicRowDataForFirstPos =
          '"' + dynamicField + '":' + '"' + element.PM_Reqmnt_test_Max + '",';
        finlrowdata = '"' + dynamicField + '":' + '"' + '",';
      } else {
        dynamicRowDataForZerothPos =
          dynamicRowDataForZerothPos +
          '"' +
          dynamicField +
          '":' +
          '"' +
          values +
          '",';
        dynamicRowDataForFirstPos =
          dynamicRowDataForFirstPos +
          '"' +
          dynamicField +
          '":' +
          '"' +
          element.PM_Reqmnt_test_Max +
          '",';
        finlrowdata = finlrowdata + '"' + dynamicField + '":' + '"' + '",';
      }
    }
    if (
      element.pm_reqmnt_temp_Minus !== '' &&
      element.pm_reqmnt_temp_plus !== ''
    ) {
      let dynamicField;
      dynamicField = (element.co_param_val_name + "Temp1").split(" ").join("");
      fieldsNames = fieldsNames + "@~@" + dynamicField;
      columnsArr.push(dynamicField)
      let obj = {
        headerName: element.co_param_val_name + " Temp.. Range",
        field: dynamicField,
        editable: function (params) {
          if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
            if (params.data.coat_status != 'Bare' || params.data.coat_status != 'H/C Trial') {
              return true;
            }
          } else {
            return false;
          }
        },
        headerClass: "custom-header",
        sortable: false,
        cellStyle: (params) => {
          if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
            if (typeof parseFloat(params.value) == "number") {
              let minvalue = parseFloat(element.pm_reqmnt_temperature) - parseFloat(rowData[0][params.colDef.field]);
              let maxvalue = parseFloat(rowData[1][params.colDef.field]) + parseFloat(element.pm_reqmnt_temperature);
              if (
                parseFloat(params.value) < minvalue ||
                parseFloat(params.value) > maxvalue
              ) {
                return { borderColor: "#ED2939" };
              } else {
                return { borderColor: "#34B233" };
              }
            } else {
              return { borderColor: "#FFA100" };
            }
          }
        },
        valueSetter: TestGridValueSetter,
      };
      columnDefs.push(obj);
      if (dynamicRowDataForZerothPos === "") {
        dynamicRowDataForZerothPos =
          '"' + dynamicField + '":' + '"' + element.pm_reqmnt_temp_Minus + '",';
        dynamicRowDataForFirstPos =
          '"' + dynamicField + '":' + '"' + element.pm_reqmnt_temp_plus + '",';
        finlrowdata = '"' + dynamicField + '":' + '"' + '",';
      } else {
        dynamicRowDataForZerothPos =
          dynamicRowDataForZerothPos +
          '"' +
          dynamicField +
          '":' +
          '"' +
          element.pm_reqmnt_temp_Minus +
          '",';
        dynamicRowDataForFirstPos =
          dynamicRowDataForFirstPos +
          '"' +
          dynamicField +
          '":' +
          '"' +
          element.pm_reqmnt_temp_plus +
          '",';
        finlrowdata = finlrowdata + '"' + dynamicField + '":' + '"' + 0 + '",';
      }
    }
    finlrowdata = finlrowdata + '"remarks":' + '"' + "Select" + '",';
    finlrowdata = finlrowdata + '"remarks":' + '"' + "Select" + '",';
    fieldsNamesarr.push(fieldsNames);
    let ids =
      finlrowdata +
      '"' +
      "pm_proc_template_id" +
      '":' +
      element.pm_proc_template_id +
      "," +
      '"' +
      "pm_test_categ_id" +
      '":' +
      element.pm_test_categ_id +
      "," +
      '"' +
      "pm_test_type_id" +
      '":' +
      element.pm_test_type_id +
      "," +
      '"' +
      "pm_test_id" +
      '":' +
      element.pm_test_id +
      "," +
      '"' +
      "pm_proc_test_id" +
      '":' +
      element.pm_proc_test_id;
    ids = "{" + ids + "}";
    valueids.push(JSON.parse(ids));
  });

  // if (formData.coatingType == "526") {
  if (formData.coatingType == "526") {
    columnDefs.push({
      headerName: "Coat Status",
      field: "coat_status",
      sortable: false,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: coatStatusOptions.map((item) => item.co_param_val_alias),
      },
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      width: 80,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });

    columnDefs.push({
      headerName: "Field Test",
      field: "field_test",
      sortable: false,
      cellRenderer: "agCheckboxCellRenderer",
      cellEditor: "agCheckboxCellEditor",
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          const matchingRecord = coatStatusOptions.find(record => record.co_param_val_alias === params.data.coat_status);
          if (matchingRecord?.FieldTestCount > 0) {
            return true
          }
        } else {
          return false;
        }
      },
      width: 80,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });

    columnDefs.push({
      headerName: "Lab Test",
      field: "lab_test",
      sortable: false,
      cellRenderer: "agCheckboxCellRenderer",
      cellEditor: "agCheckboxCellEditor",
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          const matchingRecord = coatStatusOptions.find(record => record.co_param_val_alias === params.data.coat_status);
          if (matchingRecord?.LabTestCount > 0) {
            return true
          }
        } else {
          return false;
        }
      },
      width: 80,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });

    columnDefs.push({
      headerName: "Repair",
      field: "is_repair",
      sortable: false,
      cellRenderer: "agCheckboxCellRenderer",
      cellEditor: "agCheckboxCellEditor",
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          if (params.data.coat_status == "3LPE" || params.data.coat_status == "DFBE") {
            console.log(params.data.coat_status)
            return true
          }
        }
        return false;
      },
      width: 80,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });

  }

  // values: ["Select", "OK", "NOT OK", "NTC"],

  if (formData.coatingType == "524") {
    columnDefs.push({
      headerName: "Blasting Line Speed",
      field: "blastingLineSpeedentry",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      valueGetter: function (params) {
        // If it's the first row, return 40
        return params.node.rowIndex === 0 ? blastingLineSpeed : params.data.blastingLineSpeedentry;
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "Blasting Load 1",
      sortable: false,
      field: "blastingLoad1entry",
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      valueGetter: function (params) {
        // If it's the first row, return 40
        return params.node.rowIndex === 1 ? blastingLoad1 : params.data.blastingLoad1entry;
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "Blasting Load 2",
      field: "blastingLoad2entry",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      valueGetter: function (params) {
        // If it's the first row, return 40
        return params.node.rowIndex === 1 ? blastingLoad2 : params.data.blastingLoad2entry;
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
  }

  if (formData.coatingType == 528) {
    console.log(SoLineItemList, "okayokay")
    columnDefs.push({
      headerName: "Length",
      sortable: false,
      field: "pm_pipe_lengthtelly",
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          console.log(params.data)
          // if (params.data.pm_is_sample_cut != 0 || userRole == "Super Incharge" || userRole == "Incharge") {
          return true;
          // }
        } else {
          return false;
        }
      },
      width: 80,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });

    columnDefs.push({
      headerName: "Length Sample Size",
      field: "length_sample_size",
      sortable: false,
      valueGetter: function (params) {
        // If it's the first row, return 40
        return params.data.pm_sample_cut_size != undefined && params.data.pm_sample_cut_size != 0 && params.data.pm_sample_cut_size != "0" && params.data.pm_sample_cut_size != "" ? params.data.pm_sample_cut_size : params.data.aslno !== "Min" && params.data.aslno !== "Max" ? 0 : '';
      },
      editable: function (params) {
        return false
      },
      width: 80,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    console.log(Pono, SoNoList, "Pono")
    columnDefs.push({
      headerName: "PO No.",
      field: "ponos",
      sortable: false,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: Pono && Pono.length > 0 ? Pono?.map((data) => data) : ''
      },
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          console.log(params.data)
          // if (params.data.pm_is_sample_cut != 0 || userRole == "Super Incharge" || userRole == "Incharge") {
          return true;
          // }
        } else {
          return false;
        }
      },
      width: 80,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "SO Order No.",
      field: "soNoLists",
      sortable: false,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: SoNoList && SoNoList.length > 0 ? SoNoList?.map((data) => data) : ''
      },
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          console.log(params.data)
          // if (params.data.pm_is_sample_cut != 0 || userRole == "Super Incharge" || userRole == "Incharge") {
          return true;
          // }
        } else {
          return false;
        }
      },
      width: 80,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    console.log(SoLineItemList, "okayokay")
    columnDefs.push({
      headerName: "SO Line Item No.",
      field: "SoLineItemLists",
      sortable: false,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: SoLineItemList && SoLineItemList.length > 0 ? SoLineItemList?.map((data) => data) : ''
      },
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          console.log(params.data)
          // if (params.data.pm_is_sample_cut != 0 || userRole == "Super Incharge" || userRole == "Incharge") {
          return true;
          // }
        } else {
          return false;
        }
      },
      width: 80,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });

    // columnDefs.push({
    //   headerName: "PO No.",
    //   field: "pm_pipe_lengthtelly",
    //   editable: function (params) {
    //     if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
    //       console.log(params.data)
    //       if (params.data.pm_is_sample_cut != 0 || userRole == "Super Incharge" || userRole == "Incharge") {
    //         return true;
    //       }
    //     } else {
    //       return false;
    //     }
    //   },
    //   width: 80,
    //   headerClass: "custom-header",
    //   valueSetter: TestGridValueSetter,
    // });

    columnDefs.push({
      headerName: "PO Item No.",
      field: "POItemLists",
      sortable: false,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: POItemList && POItemList.length > 0 ? POItemList?.map((data) => data) : ''
      },
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          console.log(params.data)
          // if (params.data.pm_is_sample_cut != 0 || userRole == "Super Incharge" || userRole == "Incharge") {
          return true;
          // }
        } else {
          return false;
        }
      },
      width: 80,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
  }

  columnDefs.push({
    headerName: "Remarks",
    field: "remarks",
    sortable: false,
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
      values: remarksList && remarksList.length > 0 ? remarksList?.map((data) => data.cbrm_remarks_val) : ''
    },
    editable: function (params) {
      if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
        return true;
      } else {
        return false;
      }
    },
    width: 80,
    headerClass: "custom-header",
    valueSetter: TestGridValueSetter,
  });


  if (formData.coatingType == '526') {
    columnDefs.push({
      headerName: "Reject Reason",
      field: "pm_reject_status",
      sortable: false,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: rejectReason && rejectReason.length > 0 ? rejectReason?.map((data) => data.RejectReason) : ''
      },
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          if (params.data.remarks == 'Reject') {
            return true;
          }
        } else {
          return false;
        }
      },
      width: 80,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
  }

  if (formData.coatingType == "524") {
    columnDefs.push({
      headerName: "NTC Reason",
      sortable: false,
      field: "ntc_reasons",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ntcReasons && ntcReasons.length > 0 ? ntcReasons?.map((data) => data.NTCReasons) : ''
      },
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          if (params.data.remarks == 'NTC') {
            return true;
          }
        } else {
          return false;
        }
      },
      width: 80,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
  }
  if (formData.coatingType == "524" || formData.coatingType == "525") {
    columnDefs.push({
      headerName: "Material",
      sortable: false,
      field: "material_multiple",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: materials && materials?.length > 0 ? materials?.map((data) => data?.Material) : ''
      },
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      width: 80,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });

    columnDefs.push({
      headerName: "Manufacturer",
      sortable: false,
      field: "manufacturer_multiple",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: materials && materials.length > 0 ? materials?.map((data) => data?.Manfacturer) : ''
      },
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      width: 80,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });

    columnDefs.push({
      headerName: "Grade",
      sortable: false,
      field: "grade_multiple",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: materials && materials.length > 0 ? materials?.map((data) => data?.Grade) : ''
      },
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      width: 80,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });

    columnDefs.push({
      headerName: "Batch",
      sortable: false,
      field: "batch_multiple",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: materials && materials.length > 0 ? materials?.map((data) => data?.pm_batch) : ''
      },
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      width: 80,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
  }

  if (typeOfProcess == 525) {
    columnDefs.push({
      headerName: "A1 (Air Pressure)",
      field: "A1",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "A1 (Flow Rate)",
      field: "SecondA1",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max" && !!params.data.A1) {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "A2 (Air Pressure)",
      field: "A2",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "A2 (Flow Rate)",
      field: "SecondA2",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max" && !!params.data.A2) {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "A3 (Air Pressure)",
      field: "A3",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "A3 (Flow Rate)",
      field: "SecondA3",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max" && !!params.data.A3) {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "A4 (Air Pressure)",
      field: "A4",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "A4 (Flow Rate)",
      field: "SecondA4",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max" && !!params.data.A4) {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "A5 (Air Pressure)",
      field: "A5",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "A5 (Flow Rate)",
      field: "SecondA5",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max" && !!params.data.A5) {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "A6 (Air Pressure)",
      field: "A6",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "A6 (Flow Rate)",
      field: "SecondA6",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max" && !!params.data.A6) {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "A7 (Air Pressure)",
      field: "A7",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "A7 (Flow Rate)",
      field: "SecondA7",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max" && !!params.data.A7) {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "A8 (Air Pressure)",
      field: "A8",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      width: 10,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "A8 (Flow Rate)",
      field: "SecondA8",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max" && !!params.data.A8) {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "A9 (Air Pressure)",
      field: "A9",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "A9 (Flow Rate)",
      field: "SecondA9",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max" && !!params.data.A9) {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "A10 (Air Pressure)",
      field: "A10",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "A10 (Flow Rate)",
      field: "SecondA10",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max" && !!params.data.A10) {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "A11 (Air Pressure)",
      field: "A11",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "A11 (Flow Rate)",
      field: "SecondA11",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max" && !!params.data.A11) {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "A12 (Air Pressure)",
      field: "A12",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "A12 (Flow Rate)",
      field: "SecondA12",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max" && !!params.data.A12) {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "B1 (Air Pressure)",
      field: "B1",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "B1 (Flow Rate)",
      field: "SecondB1",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max" && !!params.data.B1) {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "B2 (Air Pressure)",
      field: "B2",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "B2 (Flow Rate)",
      field: "SecondB2",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max" && !!params.data.B2) {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "B3 (Air Pressure)",
      field: "B3",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "B3 (Flow Rate)",
      field: "SecondB3",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max" && !!params.data.B3) {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "B4 (Air Pressure)",
      field: "B4",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "B4 (Flow Rate)",
      field: "SecondB4",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max" && !!params.data.B4) {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "B5 (Air Pressure)",
      field: "B5",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "B5 (Flow Rate)",
      field: "SecondB5",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max" && !!params.data.B5) {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "B6 (Air Pressure)",
      field: "B6",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "B6 (Flow Rate)",
      field: "SecondB6",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max" && !!params.data.B6) {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "B7 (Air Pressure)",
      field: "B7",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "B7 (Flow Rate)",
      field: "SecondB7",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max" && !!params.data.B7) {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "B8 (Air Pressure)",
      field: "B8",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "B8 (Flow Rate)",
      field: "SecondB8",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max" && !!params.data.B8) {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "B9 (Air Pressure)",
      field: "B9",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "B9 (Flow Rate)",
      field: "SecondB9",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max" && !!params.data.B9) {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "B10 (Air Pressure)",
      field: "B10",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "B10 (Flow Rate)",
      field: "SecondB10",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max" && !!params.data.B10) {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "B11 (Air Pressure)",
      field: "B11",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "B11 (Flow Rate)",
      field: "SecondB11",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max" && !!params.data.B11) {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "B12 (Air Pressure)",
      field: "B12",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "B12 (Flow Rate)",
      field: "SecondB12",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max" && !!params.data.B12) {
          return true;
        } else {
          return false;
        }
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
    columnDefs.push({
      headerName: "Line Speed",
      field: "lineSpeed",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      valueGetter: function (params) {
        // If it's the first row, return 40
        return params.node.rowIndex === 0 ? defaultLineSpeed : params.data.lineSpeed;
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });


    columnDefs.push({
      headerName: "Dew Point for Coating Appplication",
      field: "dewPointforCoating",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      valueGetter: function (params) {
        // If it's the first row, return 40
        return params.node.rowIndex === 0 ? defaultDewPoint : params.data.dewPointforCoating;
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });

    columnDefs.push({
      headerName: "HDPE Screw 1",
      field: "hdpeScrewRpm1",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      // valueGetter: function (params) {
      //   // If it's the first row, return 40
      //   return params.node.rowIndex === 0 ? defaultHdpe1 : params.data.hdpeScrewRpm1;
      // },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });

    columnDefs.push({
      headerName: "HDPE Screw 2",
      field: "hdpeScrewRpm2",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      // valueGetter: function (params) {
      //   // If it's the first row, return 40
      //   return params.node.rowIndex === 0 ? defaultHdpe2 : params.data.hdpeScrewRpm2;
      // },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });

    columnDefs.push({
      headerName: "Adhesive Screw",
      field: "adhesiveScrewRpm",
      sortable: false,
      editable: function (params) {
        if (params.data.aslno !== "Min" && params.data.aslno !== "Max") {
          return true;
        } else {
          return false;
        }
      },
      valueGetter: function (params) {
        // If it's the first row, return 40
        return params.node.rowIndex === 0 ? defaultAdhesive : params.data.adhesiveScrewRpm;
      },
      width: 40,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
  }

  if (witnessData.some(item => item.Name.includes("CLIENT"))) {
    columnDefs.push({
      headerName: "Witness Client",
      field: "witness_1",
      sortable: false,
      cellRenderer: "agCheckboxCellRenderer",
      cellEditor: "agCheckboxCellEditor",
      editable: function (params) {
        if (userRole == "Witness_Client") {
          return true
        }
        else {
          return false
        }
      },
      width: 80,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
  }


  if (witnessData.some(item => item.Name.includes("SUR"))) {
    columnDefs.push({
      headerName: "Witness Surveillance",
      field: "witness_2",
      sortable: false,
      cellRenderer: "agCheckboxCellRenderer",
      cellEditor: "agCheckboxCellEditor",
      editable: function (params) {
        if (userRole == "Witness_Surveillance") {
          return true
        }
        else {
          return false
        }
      },
      width: 100,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
  }

  if (witnessData.some(item => item.Name.includes("PMC"))) {
    columnDefs.push({
      headerName: "Witness PMC",
      field: "witness_3",
      sortable: false,
      cellRenderer: "agCheckboxCellRenderer",
      cellEditor: "agCheckboxCellEditor",
      editable: function (params) {
        if (userRole == "Witness_PMC") {
          return true
        }
        else {
          return false
        }
      },
      width: 80,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
  }

  if (witnessData.some(item => item.Name.includes("TPI"))) {
    columnDefs.push({
      headerName: "Witness TPI",
      field: "witness_4",
      sortable: false,
      cellRenderer: "agCheckboxCellRenderer",
      cellEditor: "agCheckboxCellEditor",
      editable: function (params) {
        if (userRole == "Witness_TPI") {
          return true
        }
        else {
          return false
        }
      },
      width: 80,
      headerClass: "custom-header",
      valueSetter: TestGridValueSetter,
    });
  }

  columnDefs.push({
    headerName: "Witness TPI",
    field: "isChange1",
    sortable: false,
    cellRenderer: "agCheckboxCellRenderer",
    cellEditor: "agCheckboxCellEditor",
    editable: function (params) {
      if (userRole == "Witness_TPI") {
        return true
      }
      else {
        return false
      }
    },
    width: 80,
    headerClass: "custom-header",
    valueSetter: TestGridValueSetter,
    hide: true
  });

  columnDefs.push({
    headerName: "Witness TPI",
    field: "NTC_exist",
    sortable: false,
    cellRenderer: "agCheckboxCellRenderer",
    cellEditor: "agCheckboxCellEditor",
    editable: function (params) {
      if (userRole == "Witness_TPI") {
        return true
      }
      else {
        return false
      }
    },
    valueGetter: function (params) {
      // If it's the first row, return 40
      return params.node.pm_ntc_id;
    },
    width: 80,
    headerClass: "custom-header",
    valueSetter: TestGridValueSetter,
    hide: true
  });

  if (dynamicRowDataForZerothPos !== "") {
    dynamicRowDataForZerothPos =
      "{" +
      dynamicRowDataForZerothPos.substring(
        0,
        dynamicRowDataForZerothPos.length - 1
      ) +
      "}";
    dynamicRowDataForZerothPos = JSON.parse(dynamicRowDataForZerothPos);
    dynamicRowDataForZerothPos.Id = "";
    dynamicRowDataForZerothPos.pipeno = "";
    dynamicRowDataForZerothPos.aslno = "Min";
  }
  if (dynamicRowDataForFirstPos !== "") {
    dynamicRowDataForFirstPos =
      "{" +
      dynamicRowDataForFirstPos.substring(
        0,
        dynamicRowDataForFirstPos.length - 1
      ) +
      "}";
    dynamicRowDataForFirstPos = JSON.parse(dynamicRowDataForFirstPos);
    dynamicRowDataForFirstPos.Id = "";
    dynamicRowDataForFirstPos.pipeno = "";
    dynamicRowDataForFirstPos.aslno = "Max";
  }

  if (finlrowdata !== "") {
    rowData.push(dynamicRowDataForZerothPos);
    rowData.push(dynamicRowDataForFirstPos);
    let temp = finlrowdata;
    finlrowdata = "{" + finlrowdata.substring(0, finlrowdata.length - 1) + "}";
    finlrowdata = JSON.parse(finlrowdata);
    ExistingDataforGrid.forEach(function (element, index) {
      console.log(element, "saved")
      finlrowdata.Id = typeOfProcess != 528 ? element?.seqno : index + 1;
      finlrowdata.material_multiple = element?.material_multiple;
      finlrowdata.manufacturer_multiple = element?.manufacturer_multiple;
      finlrowdata.batch_multiple = element?.batch_multiple;
      finlrowdata.grade_multiple = element?.grade_multiple;
      finlrowdata.pm_is_sample_cut = element?.pm_is_sample_cut;
      finlrowdata.SoLineItemLists = element?.SoLineItemLists;
      finlrowdata.ponos = element?.ponos;
      finlrowdata.soNoLists = element?.soNoLists;
      finlrowdata.POItemLists = element?.POItemLists;
      finlrowdata.pm_pipe_lengthtelly = element?.pm_pipe_lengthtelly;
      finlrowdata.pm_FieldNo = element?.pm_FieldNo;
      finlrowdata.pm_rfid_data_id = element?.pm_rfid_data_id;
      finlrowdata.pm_ntc_id = element?.pm_ntc_id;
      finlrowdata.pipe_id = element?.pipe_id.toString();
      finlrowdata.pipeno = element?.PIPNO;
      finlrowdata.remarks = element?.pm_test_result_remarks;
      finlrowdata.aslno = element?.pm_asl_number;
      finlrowdata.field_test = element?.isfield == 1 ? true : false;
      finlrowdata.lab_test = element?.islab == 1 ? true : false;
      finlrowdata.is_repair = element?.pm_repair == 1 ? true : false;
      finlrowdata.witness_1 = element?.witness_1;
      finlrowdata.witness_2 = element?.witness_2;
      finlrowdata.witness_3 = element?.witness_3;
      finlrowdata.witness_4 = element?.witness_4;
      finlrowdata.coat_status = element?.coat_status;
      finlrowdata.ntc_reasons = element?.ntcReason;
      finlrowdata.pm_reject_status = element?.rejectReason;
      finlrowdata.issaved = element?.issaved;
      finlrowdata.A1 = element?.A1;
      finlrowdata.A2 = element?.A2;
      finlrowdata.A3 = element?.A3;
      finlrowdata.A4 = element?.A4;
      finlrowdata.A5 = element?.A5;
      finlrowdata.A6 = element?.A6;
      finlrowdata.A7 = element?.A7;
      finlrowdata.A8 = element?.A8;
      finlrowdata.A9 = element?.A9;
      finlrowdata.A10 = element?.A10;
      finlrowdata.A11 = element?.A11;
      finlrowdata.A12 = element?.A12;
      finlrowdata.B1 = element?.B1;
      finlrowdata.B2 = element?.B2;
      finlrowdata.B3 = element?.B3;
      finlrowdata.B4 = element?.B4;
      finlrowdata.B5 = element?.B5;
      finlrowdata.B6 = element?.B6;
      finlrowdata.B7 = element?.B7;
      finlrowdata.B8 = element?.B8;
      finlrowdata.B9 = element?.B9;
      finlrowdata.B10 = element?.B10;
      finlrowdata.B11 = element?.B11;
      finlrowdata.B12 = element?.B12;
      finlrowdata.SecondA1 = element?.SecondA1;
      finlrowdata.SecondA2 = element?.SecondA2;
      finlrowdata.SecondA3 = element?.SecondA3;
      finlrowdata.SecondA4 = element?.SecondA4;
      finlrowdata.SecondA5 = element?.SecondA5;
      finlrowdata.SecondA6 = element?.SecondA6;
      finlrowdata.SecondA7 = element?.SecondA7;
      finlrowdata.SecondA8 = element?.SecondA8;
      finlrowdata.SecondA9 = element?.SecondA9;
      finlrowdata.SecondA10 = element?.SecondA10;
      finlrowdata.SecondA11 = element?.SecondA11;
      finlrowdata.SecondA12 = element?.SecondA12;

      finlrowdata.SecondB1 = element?.SecondB1;
      finlrowdata.SecondB2 = element?.SecondB2;
      finlrowdata.SecondB3 = element?.SecondB3;
      finlrowdata.SecondB4 = element?.SecondB4;
      finlrowdata.SecondB5 = element?.SecondB5;
      finlrowdata.SecondB6 = element?.SecondB6;
      finlrowdata.SecondB7 = element?.SecondB7;
      finlrowdata.SecondB8 = element?.SecondB8;
      finlrowdata.SecondB9 = element?.SecondB9;
      finlrowdata.SecondB10 = element?.SecondB10;
      finlrowdata.SecondB11 = element?.SecondB11;
      finlrowdata.SecondB12 = element?.SecondB12;

      finlrowdata.lineSpeed = element?.LineSpeed;
      finlrowdata.dewPointforCoating = element?.DewPointforCoating;
      finlrowdata.blastingLineSpeedentry = element?.blastingLineSpeed;
      finlrowdata.blastingLoad1entry = element?.blastingLoad1;
      finlrowdata.blastingLoad2entry = element?.blastingLoad2;
      finlrowdata.hdpeScrewRpm1 = element?.HdpeScrewRpm1;
      finlrowdata.hdpeScrewRpm2 = element?.HdpeScrewRpm2;
      finlrowdata.adhesiveScrewRpm = element?.AdhesiveScrewRpm;
      Object.keys(finlrowdata).forEach(function (objcolkeyitem) {
        if (!["material_multiple", "manufacturer_multiple", "grade_multiple", "batch_multiple", "Id", "pipeno", "pm_rfid_data_id", "pm_FieldNo", "pm_pipe_lengthtelly", "POItemLists", "soNoLists", "ponos", "SoLineItemLists", "pm_is_sample_cut", "FieldNo", "aslno", "pipe_id", "pm_isrepair", "pm_ntc_id", "remarks", "field_test", "lab_test", "is_repair", "coat_status", "witness_1", "witness_2", "witness_3", "witness_4", "ntc_reasons", "pm_reject_status", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11", "A12", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10", "B11", "B12", "SecondA1", "SecondA2", "SecondA3", "SecondA4", "SecondA5", "SecondA6", "SecondA7", "SecondA8", "SecondA9", "SecondA10", "SecondA11", "SecondA12", "SecondB1", "SecondB2", "SecondB3", "SecondB4", "SecondB5", "SecondB6", "SecondB7", "SecondB8", "SecondB9", "SecondB10", "SecondB11", "SecondB12", "lineSpeed", "dewPointforCoating", "blastingLineSpeedentry", "blastingLoad1entry", "blastingLoad2entry", "hdpeScrewRpm1", "hdpeScrewRpm2", "adhesiveScrewRpm"].includes(objcolkeyitem)) {
          // let isTempCol = objcolkeyitem.includes("Temp");
          let isTempCol = objcolkeyitem.includes("Temp1");
          let checkcol = isTempCol ? objcolkeyitem.split("Temp1")[0] : objcolkeyitem;

          // Find matching data based on `PIPNO` and `checkcol`
          let matchDatabasedonkey = ExistingDataforGrid.filter(item =>
            item.seqno === element.seqno
          );
          if (matchDatabasedonkey.length > 0) {
            if (isTempCol) {
              finlrowdata[objcolkeyitem] = matchDatabasedonkey[0][checkcol]?.pm_temperature1 || "";
            } else {
              if (matchDatabasedonkey[0][checkcol]?.pm_value_type == "A") {
                finlrowdata[objcolkeyitem] =
                  matchDatabasedonkey[0][checkcol]?.pm_test_value2
              }
              else {
                finlrowdata[objcolkeyitem] = matchDatabasedonkey[0][checkcol]?.pm_test_value1 || "";
              }
            }
          }
        }
      });
      rowData.push(finlrowdata);
      finlrowdata = temp;
      finlrowdata =
        "{" + finlrowdata.substring(0, finlrowdata.length - 1) + "}";
      finlrowdata = JSON.parse(finlrowdata);
      // Push `finlrowdata` to `rowData` array
    });
    DataforGrid.forEach(function (element, index) {
      console.log(element, "notsaved")
      // finlrowdata.Id = index + 1; element?.seqno : 
      finlrowdata.Id = typeOfProcess != 528 ? element["seqno"] : index + 1;
      // finlrowdata.FieldNo = element["FieldNo"];
      finlrowdata.pm_is_sample_cut = element["pm_is_sample_cut"];
      finlrowdata.POItemLists = element["POItemLists"];
      finlrowdata.SoLineItemLists = element["SoLineItemLists"];
      finlrowdata.ponos = element["ponos"];
      finlrowdata.soNoLists = element["soNoLists"];
      finlrowdata.pm_pipe_lengthtelly = element["pm_pipe_lengthtelly"];
      finlrowdata.pm_FieldNo = element["FieldNo"];
      finlrowdata.pm_rfid_data_id = element["pm_rfid_data_id"];
      // finlrowdata.Id = element["seqno"];
      finlrowdata.pipe_id = element["pipe_id"] + "";
      finlrowdata.pipeno = element["PIPNO"];
      finlrowdata.aslno = element["pm_asl_number"];
      finlrowdata.pm_ntc_id = element["pm_ntc_id"];
      finlrowdata.coat_status = element["coat_status"];
      let objcolkey = Object.keys(finlrowdata);
      if (objcolkey.length > 0) {
        objcolkey.forEach(function (objcolkeyitem, objcolkeyindex) {
          if (["Id", "pipeno", "aslno"].includes(objcolkeyitem) == false) {
            let isTempCol = false;
            let checkcol = "";
            if (objcolkeyitem.includes("Temp1")) {
              isTempCol = true;
              checkcol = objcolkeyitem.split("Temp1")[0];
            } else {
              checkcol = objcolkeyitem;
            }
            let matchDatabasedonkey = ExistingDataforGrid.filter(
              (item) =>
                item.PIPNO === element.PIPNO &&
                item.co_param_val_name?.replace(/[^\w\s]/gi, '').includes(checkcol)
            );
            if (matchDatabasedonkey.length > 0) {
              if (isTempCol) {
                finlrowdata[objcolkeyitem] =
                  matchDatabasedonkey[0]["pm_temperature1"];
              } else {
                if (element.pm_value_type == "A") {
                  finlrowdata[objcolkeyitem] =
                    matchDatabasedonkey[0]["pm_test_value2"];
                }
                else {
                  finlrowdata[objcolkeyitem] =
                    matchDatabasedonkey[0]["pm_test_value1"];
                  console.log(matchDatabasedonkey[0]["pm_test_value1"], 'dhdh');

                }
              }
            }
          }
        });
      }
      rowData.push(finlrowdata);
      finlrowdata = temp;
      finlrowdata =
        "{" + finlrowdata.substring(0, finlrowdata.length - 1) + "}";
      finlrowdata = JSON.parse(finlrowdata);
    });
  }
  function isValueInRange(valueToCheck, rangeString) {
    // Regex to match "Atleast (-)40°C" and extract the value
    const atleastRegex = /Atleast\s*\(?-?(\d+(\.\d+)?)\)?/;
    const exactRegex = /(\d+(\.\d+)?)\s*\(±(\d+(\.\d+)?)\)/;

    let lowerLimit = null;
    let upperLimit = null;

    const matchAtleast = rangeString?.match(atleastRegex);
    const matchExact = rangeString?.match(exactRegex);

    if (matchAtleast) {
      // For "Atleast" case
      lowerLimit = parseFloat(matchAtleast[1]);
      upperLimit = Infinity; // No upper limit
    } else if (matchExact) {
      // For exact value with tolerance
      const targetValue = parseFloat(matchExact[1]);
      const tolerance = parseFloat(matchExact[3]);
      lowerLimit = targetValue - tolerance;
      upperLimit = targetValue + tolerance;
    }

    if (lowerLimit !== null) {
      return valueToCheck >= lowerLimit && valueToCheck <= upperLimit;
    }

    return false; // Return false if the format is not as expected
  }

  function parseMinValue(minValueString) {
    // Use a regular expression to extract the minimum value
    const match = minValueString.match(/Atleast[-]?\(?([\d.]+)\)?°?[C]?/);
    if (match) {
      return parseFloat(match[1]);
    }
    throw new Error("Invalid input format");
  }

  function isValueAboveMin(enteredValue, minValue) {
    return enteredValue >= minValue;
  }

  function parseValueAndTolerance(prefilledString) {
    console.log(prefilledString, "prefilledString")
    // Use a regular expression to extract the value and tolerance
    const match = prefilledString?.match(/([\d.]+)\s*\(±([\d.%]+)\)\s*[A-Za-z.\/]+/);
    if (match) {
      const prefilledValue = parseFloat(match[1]);
      const tolerance = parseFloat(match[2]);
      return { prefilledValue, tolerance };
    }
  }

  function isValueInRange1(enteredValue, prefilledValue, tolerance) {
    const minValue = prefilledValue - tolerance;
    const maxValue = prefilledValue + tolerance;
    return enteredValue >= minValue && enteredValue <= maxValue;
  }

  function TestGridValueSetter(params) {
    const newValue = params.newValue;
    const { data, colDef, api } = params;
    const colField = colDef.field;
    const field = params.colDef.field;

    // if (data.pm_ntc_id != "" && data.pm_ntc_id != undefined) {
    //   toast.error("No")
    //   return false
    // }

    // const currentRowIndex = params.node.rowIndex;

    // // Check if this is a newly inserted row by checking if the row is empty or contains default values
    // if (currentRowIndex > 0 && (data[colField] === null || data[colField] === undefined || data[colField] === "")) {
    //   // Get the previous row's data
    //   const prevRowNode = api.getRowNode(currentRowIndex - 1);
    //   if (prevRowNode) {
    //     const prevRowData = prevRowNode.data;

    //     // Set the current row's value to the previous row's value for this column
    //     data[colField] = prevRowData[colField];

    //     // Apply the updated value to the grid
    //     api.applyTransaction({ update: [data] });
    //     return true;
    //   }
    // }

    const limit = defaultNoOfGuns; // Set your limit here
    const aFields = ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11", "A12"];
    const bFields = ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10", "B11", "B12"];

    // Function to count filled fields
    let count = 0;
    const countFilledFields = () => {
      api.forEachNode(node => {
        if (aFields.includes(colField) || bFields.includes(colField)) {
          if (node.data[colField]) {
            count++;
          }
        }
      });
      return count;
    };

    // Check if adding a new value would exceed the limit

    if (data[colField] === newValue) {
      return false; // No change
    }

    if (colField === "witness_1" || colField === "witness_2" || colField === "witness_3" || colField === "witness_4") {
      const checkedRows = [];
      // Set the new value for the checkbox (witness) in the row data
      data[colField] = newValue;

      // Loop through all rows and find the checked rows
      api.forEachNode(node => {
        if (node.data[colField] === true) {
          console.log(node.data)
          checkedRows.push({ seqno: node.data.Id.toString(), pipe_id: node.data.pipe_id, pm_rfid_data_id: node.data.pm_rfid_data_id?.toString() });
        }
      });
      console.log(checkedRows)
      checkedPipes.current = checkedRows
      // Ensure that the data is updated in the grid
      api.applyTransaction({ update: [data] });

      // Return true to indicate the value was set successfully
      return true;
    }

    // Handle columns A1, A2, A3, A4, etc. SecondA1
    // if (["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11", "A12", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10", "B11", "B12", "lineSpeed", "dewPointforCoating", "hdpeScrewRpm1", "adhesiveScrewRpm", "hdpeScrewRpm2", "3oclock1", "3oclock2", "3oclock3", "6oclock1", "6oclock2", "6oclock3", "9oclock1", "9oclock2", "9oclock3", "12oclock1", "12oclock2", "12oclock3", "SecondA1", "SecondA2", "SecondA3", "SecondA4", "SecondA5", "SecondA6", "SecondA7", "SecondA8", "SecondA9", "SecondA10", "SecondA11", "SecondA12", "SecondB1", "SecondB2", "SecondB3", "SecondB4", "SecondB5", "SecondB6", "SecondB7", "SecondB8", "SecondB9", "SecondB10", "SecondB11", "SecondB12"].includes(colField)) {
    if (["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11", "A12", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10", "B11", "B12", "lineSpeed", "dewPointforCoating", "blastingLineSpeedentry", "blastingLoad1entry", "blastingLoad2entry", "hdpeScrewRpm1", "adhesiveScrewRpm", "hdpeScrewRpm2", "SecondA1", "SecondA2", "SecondA3", "SecondA4", "SecondA5", "SecondA6", "SecondA7", "SecondA8", "SecondA9", "SecondA10", "SecondA11", "SecondA12", "SecondB1", "SecondB2", "SecondB3", "SecondB4", "SecondB5", "SecondB6", "SecondB7", "SecondB8", "SecondB9", "SecondB10", "SecondB11", "SecondB12"].includes(colField)) {
      data[colField] = newValue;

      if (["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11", "A12", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10", "B11", "B12"].includes(colField)) {

        if (action == 'edit') {
          if (existingGuns.current == defaultNoOfGuns && !gunsWithValues.current.includes(colField)) {
            toast.error("You have already entered data in guns")
            params.data[colField] = null;
            return false
          }
        }
        const limit = parseInt(defaultNoOfGuns);
        const pipes = parseInt(noOfPipes.current);

        if (checkExistGuns.current.includes(colField)) {
          gunCount.current = gunCount.current
        }
        else {
          gunCount.current = gunCount.current + 1
        }

        if (gunCount.current > limit) {
          gunCount.current = gunCount.current - 1
          params.data[colField] = null;
          toast.error("Max no. of guns user can enter is " + limit)
          return false
        }

        // if(checkExistGuns.current.includes(colField)) {
        // if (gunCount.current + 1 > (limit * pipes)) {
        //     gunCount.current = gunCount.current
        //   }
        //   else {
        //     gunCount.current = gunCount.current + 1
        //   }
        // }
        // else {
        //   // gunCount.current = gunCount.current - 1
        //   params.data[colField] = null;
        //   toast.error("Max no. of guns user can enter is " + limit)
        //   return false
        // }
        checkExistGuns.current.push(colField);
      }
      // Set the value in the next row only
      const currentRowIndex = params.node.rowIndex;
      const nextRowNode = api.getRowNode(currentRowIndex + 1);

      if (nextRowNode) {
        nextRowNode.setDataValue(colField, newValue);
      }

      let a = 0
      let b = 0
      if (colField == 'lineSpeed') {
        console.log(defaultLineSpeed, "defaultLineSpeed")
        const { prefilledValue, tolerance } = parseValueAndTolerance(defaultLineSpeed);
        if (isValueInRange1(newValue, prefilledValue, tolerance)) {
          gunValidation.current = true
          console.log("The entered value is within the range.");
        } else {
          gunValidation.current = false
          console.log("The entered value is out of the range.");
        }
      }

      if (colField == 'dewPointforCoating') {
        if (newValue < (-39)) {
          console.log("The entered value is above the minimum.");
          gunValidation1.current = true
        } else {
          console.log("The entered value is below the minimum.");
          gunValidation1.current = false
        }
      }

      if (colField == 'blastingLineSpeedentry') {
        if (parseInt(newValue) >= parseInt(blastingLineSpeed)) {
          console.log("The entered value is in range.");
          blastingValidation1.current = true
        } else {
          console.log("The entered value is out of range.");
          blastingValidation1.current = false
        }
      }

      if (colField == 'blastingLoad1entry') {
        if (parseInt(newValue) <= parseInt(blastingLoad1)) {
          console.log("In range.");
          blastingValidation2.current = true
        } else {
          console.log("Out Range");
          blastingValidation2.current = false
        }
      }

      if (colField == 'blastingLoad2entry') {
        if (parseInt(newValue) <= parseInt(blastingLoad2)) {
          console.log("In range");
          blastingValidation3.current = true
        } else {
          console.log("Out Range");
          blastingValidation3.current = false
        }
      }

      // if (a > 0 || b > 0) {
      //   setGunValidation(true)
      // }

      if (colField == 'hdpeScrewRpm1') {
        if (isValueInRange(newValue, defaultHdpe1)) {
        } else {
        }
      }

      if (colField == 'hdpeScrewRpm2') {
        if (isValueInRange(newValue, defaultHdpe2)) {
        } else {
        }
      }

      if (/^A\d+$/.test(field)) {
        // If the new value is empty, clear the corresponding SecondA value
        const secondField = `Second${field}`;
        if (!newValue) {
          params.data[secondField] = null; // or use "" to set it as an empty string
        }
      }

      if (/^B\d+$/.test(field)) {
        // If the new value is empty, clear the corresponding SecondA value
        const secondField = `Second${field}`;
        if (!newValue) {
          params.data[secondField] = null; // or use "" to set it as an empty string
        }
      }

      api.applyTransaction({ update: [data] });
      return true;
    }
    // console.log(data.coat_status)
    // console.log(data)
    // if (colField == 'coat_status' && (data.coat_status == "Partially Coated" || data.coat_status == "H/C Trial" || data.coat_status == "Bare" || data.coat_status == "H/C" || data.coat_status == "FBE") && data.coat_status != "3LPE") {
    //   console.log(data.coat_status)
    //   params.data['3oclock1'] = null;
    //   params.data['3oclock2'] = null;
    //   params.data['3oclock3'] = null;
    //   params.data['6oclock1'] = null;
    //   params.data['6oclock2'] = null;
    //   params.data['6oclock3'] = null;
    //   params.data['9oclock1'] = null;
    //   params.data['9oclock2'] = null;
    //   params.data['9oclock3'] = null;
    //   params.data['12oclock1'] = null;
    //   params.data['12oclock2'] = null;
    //   params.data['12oclock3'] = null;
    // }

    // Check if the value being set is for any A1, A2, ..., A12

    if ((colField != "witness_1" && colField != "witness_2" && colField != "witness_3" && colField != "witness_4") && action == 'edit') {
      data.isChange1 = true
      data.witness_1 = false
      data.witness_2 = false
      data.witness_3 = false
      data.witness_4 = false
    }

    if (typeof parseFloat(newValue) === "number") {
      // Ensure rowData is populated with the necessary rows
      let minvalue = rowData[0][colField];
      let maxvalue = rowData[1][colField];
      if (!params.colDef.field != 'Id' && !params.colDef.field != 'aslno' && !params.colDef.field != 'field_test' && !params.colDef.field != 'lab_test' && !params.colDef.field != 'is_repair' && !params.colDef.field != 'pm_ntc_id' && !params.colDef.field != 'remarks'
        && !params.colDef.field != 'pipeno' && !params.colDef.field != 'ntcId') {
        if (
          (minvalue === '' && parseFloat(newValue) > maxvalue) ||
          (maxvalue === '' && parseFloat(newValue) < minvalue) ||
          (maxvalue !== '' && minvalue !== '' &&
            (parseFloat(newValue) < minvalue || parseFloat(newValue) > maxvalue))
        ) {
          checkVar.current = params.colDef.field
          // Show popup or update other components as needed
          showPopUp.current = true;

          if (["3oclock1", "3oclock2", "3oclock3", "6oclock1", "6oclock2", "6oclock3", "9oclock1", "9oclock2", "9oclock3", "12oclock1", "12oclock2", "12oclock3", "soNoLists", "ponos", "SoLineItemLists", "POItemLists", "grade_multiple", "batch_multiple"].includes(colField)) {
            const currentRowIndex = params.node.rowIndex;
            const nextRowNode = api.getRowNode(currentRowIndex + 1);

            if (nextRowNode) {
              nextRowNode.setDataValue(colField, newValue);
            }
          }

          if (typeOfProcess == 524) {
            data.remarks = "NTC";
          }
          // else {
          //   if(typeOfProcess !)
          //   data.remarks = "Not Ok";
          // }
          // if (typeOfProcess == 526) {
          //   data.coat_status = ""
          // }
          // Apply the change to the grid
          api.applyTransaction({ update: [data] });
        }
        else {
          if (["3oclock1", "3oclock2", "3oclock3", "6oclock1", "6oclock2", "6oclock3", "9oclock1", "9oclock2", "9oclock3", "12oclock1", "12oclock2", "12oclock3", "soNoLists", "ponos", "SoLineItemLists", "POItemLists", "grade_multiple", "batch_multiple"].includes(colField)) {
            const currentRowIndex = params.node.rowIndex;
            const nextRowNode = api.getRowNode(currentRowIndex + 1);

            if (nextRowNode) {
              nextRowNode.setDataValue(colField, newValue);
            }
          }
          if (params.colDef.field == checkVar.current || checkVar.current == '') {
            if (typeOfProcess == 526 && colField != 'field_test' && colField != 'lab_test' && colField != 'is_repair' && colField != 'remarks') {
              data.coat_status = "3LPE"
            }
            showPopUp.current = false;
            if (colField != "ntc_reasons" && colField != "pm_reject_status" && colField != "field_test" && colField != "lab_test" && colField != "is_repair" && colField != "coat_status" && colField != "material_multiple" && colField != "manufacturer_multiple" && colField != "grade_multiple" && colField != "batch_multiple") {
              data.remarks = "Ok";
            }
            api.applyTransaction({ update: [data] });
          }
        }
      }
    }

    function isAlphaNumericOrAlpha(value) {
      // Regex for alphanumeric values, including special characters
      const alphanumericRegex = /^[a-zA-Z0-9\s\p{L}\p{N}]*$/u; // Unicode property escapes for letters and numbers
      // Regex for pure numeric values
      const numericRegex = /^\d+$/;

      // Check if the value is purely numeric
      if (numericRegex.test(value)) {
        return false;
      }

      // Check if the value is alphanumeric or alphabetic, including special characters
      return alphanumericRegex.test(value);
    }

    switch (params.colDef.field) {
      case "coat_status":
        // Update coat_status field in data
        data.coat_status = newValue;
        if (newValue == "Bare") {
          data.field_test = false
          data.lab_test = false
        }
        break;
      case "field_test":
        // Update field_test field in data
        data.field_test = newValue;
        break;
      case "lab_test":
        // Update lab_test field in data
        data.lab_test = newValue;
        break;
      case "is_repair":
        // Update is_repair field in data\
        console.log(data.coat_status)
        if (data.coat_status == "Bare" || data.coat_status == "FBE" || data.coat_status == "H/C" || data.coat_status == "H/C Trial") {
          data.is_repair = false
          return false
        }
        else {
          data.is_repair = newValue;
        }
        break;
      case "A1":
        // Update field_test field in data
        data.A1 = newValue;
        break;
      case "A2":
        // Update field_test field in data
        data.A2 = newValue;
        break;
      case "A3":
        // Update field_test field in data
        data.A3 = newValue;
        break;
      case "A4":
        // Update field_test field in data
        data.A4 = newValue;
        break;
      case "A5":
        // Update field_test field in data
        data.A5 = newValue;
        break;
      case "A6":
        // Update field_test field in data
        data.A6 = newValue;
        break;
      case "A7":
        // Update field_test field in data
        data.A7 = newValue;
        break;
      case "A8":
        // Update field_test field in data
        data.A8 = newValue;
        break;
      case "A9":
        // Update field_test field in data
        data.A9 = newValue;
        break;
      case "A10":
        // Update field_test field in data
        data.A10 = newValue;
        break;
      case "A11":
        // Update field_test field in data
        data.A11 = newValue;
        break;
      case "A12":
        // Update field_test field in data
        data.A12 = newValue;
        break;
      case "B1":
        // Update field_test field in data
        data.B1 = newValue;
        break;
      case "B2":
        // Update field_test field in data
        data.B2 = newValue;
        break;
      case "B3":
        // Update field_test field in data
        data.B3 = newValue;
        break;
      case "B4":
        // Update field_test field in data
        data.B4 = newValue;
        break;
      case "B5":
        // Update field_test field in data
        data.B5 = newValue;
        break;
      case "B6":
        // Update field_test field in data
        data.B6 = newValue;
        break;
      case "B7":
        // Update field_test field in data
        data.B7 = newValue;
        break;
      case "B8":
        // Update field_test field in data
        data.B8 = newValue;
        break;
      case "B9":
        // Update field_test field in data
        data.B9 = newValue;
        break;
      case "B10":
        // Update field_test field in data
        data.B10 = newValue;
        break;
      case "B11":
        // Update field_test field in data
        data.B11 = newValue;
        break;
      case "B12":
        // Update field_test field in data
        data.B12 = newValue;
        break;
      case "SecondA1":
        // Update field_test field in data
        data.SecondA1 = newValue;
        break;
      case "SecondA2":
        // Update field_test field in data
        data.SecondA2 = newValue;
        break;
      case "SecondA3":
        // Update field_test field in data
        data.SecondA3 = newValue;
        break;
      case "SecondA4":
        // Update field_test field in data
        data.SecondA4 = newValue;
        break;
      case "SecondA5":
        // Update field_test field in data
        data.SecondA5 = newValue;
        break;
      case "SecondA6":
        // Update field_test field in data
        data.SecondA6 = newValue;
        break;
      case "SecondA7":
        // Update field_test field in data
        data.SecondA7 = newValue;
        break;
      case "SecondA8":
        // Update field_test field in data
        data.SecondA8 = newValue;
        break;
      case "SecondA9":
        // Update field_test field in data
        data.SecondA9 = newValue;
        break;
      case "SecondA10":
        // Update field_test field in data
        data.SecondA10 = newValue;
        break;
      case "SecondA11":
        // Update field_test field in data
        data.SecondA11 = newValue;
        break;
      case "SecondA12":
        // Update field_test field in data
        data.SecondA12 = newValue;
        break;
      case "SecondB1":
        // Update field_test field in data
        data.SecondB1 = newValue;
        break;
      case "SecondB2":
        // Update field_test field in data
        data.SecondB2 = newValue;
        break;
      case "SecondB3":
        // Update field_test field in data
        data.SecondB3 = newValue;
        break;
      case "SecondB4":
        // Update field_test field in data
        data.SecondB4 = newValue;
        break;
      case "SecondB5":
        // Update field_test field in data
        data.SecondB5 = newValue;
        break;
      case "SecondB6":
        // Update field_test field in data
        data.SecondB6 = newValue;
        break;
      case "SecondB7":
        // Update field_test field in data
        data.SecondB7 = newValue;
        break;
      case "SecondB8":
        // Update field_test field in data
        data.SecondB8 = newValue;
        break;
      case "SecondB10":
        // Update field_test field in data
        data.SecondB10 = newValue;
        break;
      case "SecondB11":
        // Update field_test field in data
        data.SecondB11 = newValue;
        break;
      case "SecondB12":
        // Update field_test field in data
        data.SecondB12 = newValue;
        break;
      case "lineSpeed":
        // Update field_test field in data
        data.lineSpeed = newValue;
        break;
      case "dewPointforCoating":
        // Update field_test field in data
        data.dewPointforCoating = newValue;
        break;
      case "blastingLineSpeedentry":
        // Update field_test field in data
        data.blastingLineSpeedentry = newValue;
        break;
      case "blastingLoad1entry":
        // Update field_test field in data
        data.blastingLoad1 = newValue;
        break;
      case "blastingLoad2entry":
        // Update field_test field in data
        data.blastingLoad2 = newValue;
        break;
      case "hdpeScrewRpm1":
        // Update field_test field in data
        data.hdpeScrewRpm1 = newValue;
        break;
      case "hdpeScrewRpm2":
        // Update field_test field in data
        data.hdpeScrewRpm2 = newValue;
        break;
      case "adhesiveScrewRpm":
        // Update field_test field in data
        data.adhesiveScrewRpm = newValue;
        break;
      case "ntc_reasons":
        data.ntc_reasons = newValue;
        for (let key in data) {
          if (key !== 'Id' && key !== 'soNoLists' && key !== 'ponos' && key !== 'SoLineItemLists' && key !== 'POItemLists' && key !== 'aslno' && key !== 'pm_pipe_lengthtelly' && key !== 'pm_rfid_data_id' && key !== 'pm_FieldNo' && key !== "pm_ntc_id" && key !== 'pipe_id' && key !== 'remarks' && key !== 'pipeno' && key !== 'coat_status' && key !== 'field_test' && key !== 'lab_test' && key !== 'is_repair' && key !== 'A1' && key !== 'A2' && key !== 'A3' && key !== 'A4' && key !== 'A5' && key !== 'A6' && key !== 'A7' && key !== 'A8' && key !== 'A9' && key !== 'A10' && key !== 'A11' && key !== 'A12' && key !== 'B1' && key !== 'B2' && key !== 'B3' && key !== 'B4' && key !== 'B5' && key !== 'B6' && key !== 'B7' && key !== 'B8' && key !== 'B9' && key !== 'B10' && key !== 'B11' && key !== 'B12' && key !== 'SecondA1' && key !== 'SecondA2' && key !== 'SecondA3' && key !== 'SecondA4' && key !== 'SecondA5' && key !== 'SecondA6' && key !== 'SecondA7' && key !== 'SecondA8' && key !== 'SecondA9' && key !== 'SecondA10' && key !== 'SecondA11' && key !== 'SecondA12' && key !== 'SecondB1' && key !== 'SecondB2' && key !== 'SecondB3' && key !== 'SecondB4' && key !== 'SecondB5' && key !== 'SecondB6' && key !== 'SecondB7' && key !== 'SecondB8' && key !== 'SecondB9' && key !== 'SecondB10' && key !== 'SecondB11' && key !== 'SecondB12' && key !== 'lineSpeed' && key !== 'dewPointforCoating' && key !== 'blastingLineSpeedentry' && key !== 'blastingLoad1entry' && key !== 'blastingLoad2entry' && key !== 'hdpeScrewRpm1' && key !== 'hdpeScrewRpm2' && key !== 'adhesiveScrewRpm') {
            data[key] = newValue;
          }
        }
        break;
      case "pm_reject_status":
        data.pm_reject_status = newValue;
        for (let key in data) {
          if (key !== 'Id' && key !== 'soNoLists' && key !== 'ponos' && key !== 'SoLineItemLists' && key !== 'POItemLists' && key !== 'aslno' && key !== 'pm_pipe_lengthtelly' && key !== 'pm_rfid_data_id' && key !== 'pm_FieldNo' && key !== "pm_ntc_id" && key !== 'pipe_id' && key !== 'remarks' && key !== 'pipeno' && key !== 'coat_status' && key !== 'field_test' && key !== 'lab_test' && key !== 'is_repair' && key !== 'A1' && key !== 'A2' && key !== 'A3' && key !== 'A4' && key !== 'A5' && key !== 'A6' && key !== 'A7' && key !== 'A8' && key !== 'A9' && key !== 'A10' && key !== 'A11' && key !== 'A12' && key !== 'B1' && key !== 'B2' && key !== 'B3' && key !== 'B4' && key !== 'B5' && key !== 'B6' && key !== 'B7' && key !== 'B8' && key !== 'B9' && key !== 'B10' && key !== 'B11' && key !== 'B12' && key !== 'SecondA1' && key !== 'SecondA2' && key !== 'SecondA3' && key !== 'SecondA4' && key !== 'SecondA5' && key !== 'SecondA6' && key !== 'SecondA7' && key !== 'SecondA8' && key !== 'SecondA9' && key !== 'SecondA10' && key !== 'SecondA11' && key !== 'SecondA12' && key !== 'SecondB1' && key !== 'SecondB2' && key !== 'SecondB3' && key !== 'SecondB4' && key !== 'SecondB5' && key !== 'SecondB6' && key !== 'SecondB7' && key !== 'SecondB8' && key !== 'SecondB9' && key !== 'SecondB10' && key !== 'SecondB11' && key !== 'SecondB12' && key !== 'lineSpeed' && key !== 'dewPointforCoating' && key !== 'blastingLineSpeedentry' && key !== 'blastingLoad1entry' && key !== 'blastingLoad2entry' && key !== 'hdpeScrewRpm1' && key !== 'hdpeScrewRpm2' && key !== 'adhesiveScrewRpm') {
            data[key] = newValue;
          }
        }
        break;

      default:
        console.log(params.colDef.field, "okay")
        // if (params.column.getColId() === 'material_multiple') {
        //   const selectedValue = params.newValue;

        //   // Get the rowNode for the current row
        //   const rowNode = params.node;

        //   // Based on the selected value in column1, set the value of column2
        //   let newColumn2Value = '';

        //   if (selectedValue === 'Option A') {
        //     newColumn2Value = 'Option X'; // Default option based on Option A
        //   } else if (selectedValue === 'Option B') {
        //     newColumn2Value = 'Option Y'; // Default option based on Option B
        //   } else if (selectedValue === 'Option C') {
        //     newColumn2Value = 'Option Z'; // Default option based on Option C
        //   }

        //   // Update the value in column2
        //   rowNode.setDataValue('manufacturer_multiple', newColumn2Value);
        // }
        // if (params.column.getColId() === 'material_multiple') {
        //   const selectedMaterial = params.newValue;
        //   const rowNode = params.node;

        //   // Dynamically change available options for Manufacturer column
        //   let manufacturerOptions = [];

        //   if (selectedMaterial === 'Option A') {
        //     manufacturerOptions = ['Option X']; // Only Option X available
        //   } else if (selectedMaterial === 'Option B') {
        //     manufacturerOptions = ['Option Y']; // Only Option Y available
        //   } else if (selectedMaterial === 'Option C') {
        //     manufacturerOptions = ['Option Z']; // Only Option Z available
        //   }

        //   // Ensure columnApi and api are available
        //   const manufacturerColumn = gridOptions.columnApi.getColumnState().find(col => col.colId === 'manufacturer_multiple');
        //   if (manufacturerColumn) {
        //     // Update the values dynamically
        //     const columnDef = gridOptions.columnApi.getColumnDef('manufacturer_multiple');
        //     columnDef.cellEditorParams.values = manufacturerOptions;

        //     // Refresh the grid to apply the changes
        //     gridOptions.api.refreshCells({ force: true });

        //     // Optionally, you can also reset the value of 'manufacturer_multiple' based on your logic
        //     rowNode.setDataValue('manufacturer_multiple', manufacturerOptions[0]); // Set the default value for Manufacturer
        //   }
        // }

        if (params.node.rowIndex === 2) {
          // Update the value for the first row
          console.log("oay1")
          if (params.oldValue !== params.newValue) {
            data[params.colDef.field] = newValue;
          } else {
            data[params.colDef.field] = params.oldValue;
          }

          // Loop through all rows and set the value in the specified column
          if (isAlphaNumericOrAlpha(newValue)) {
            console.log("okay2")
            api.forEachNode((node) => {
              if (node.rowIndex !== 0 && node.rowIndex > 2 && (node?.data?.pm_ntc_id == '' || node?.data?.pm_ntc_id == undefined || node?.data?.pm_ntc_id == 'undefined')) {
                node.setDataValue(colDef.field, newValue);
              }
            });
          }
        } else {
          // For other rows, just update the specific cell
          if (params.oldValue !== params.newValue) {
            data[params.colDef.field] = newValue;
          } else {
            data[params.colDef.field] = params.oldValue;
          }
        }
        // For dynamic columns or other fields, update as needed
        break;
    }

    // Handle any specific conditions or actions based on the new value
    // if (newValue === "NTC") {
    //   setIsOpen(true);
    // } else {
    //   setIsOpen(false);
    // }

    // Return true to indicate value was set successfully
    return true;

    // if (params.newValue == "NTC") {
    //   setIsOpen(true)
    // }
    // else {
    //   setIsOpen(false)
    // }
    // try {
    //   if (params.newValue !== undefined) {
    //     // const isValidNumber = /^-?\d*\.?\d+$/.test(params.newValue);
    //     if (params.oldValue !== params.newValue) {
    //       console.log(params.data[params.colDef.field], params.newValue)
    //       params.data[params.colDef.field] = params.newValue;
    //       console.log(params.data[params.colDef.field], params.newValue)
    //     } else {
    //       params.data[params.colDef.field] = params.oldValue;
    //     }
    //   } else {
    //     params.data[params.colDef.field] = params.oldValue;
    //   }

    //   // params.data[params.colDef.field] = params.newValue;
    // }


    // catch (error) {
    //   console.log(error);
    // }
  }

  const RemoveButton = (props) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Check if the current row is the last row
    const isLastRow = props.rowIndex > 1;
    // const isLastRow = props.rowIndex == props.api.getDisplayedRowCount() - 1;
    const openModal = (e) => {
      if (isLastRow) {
        e.preventDefault()
        setIsModalOpen(true);
      }
    };

    const closeModal = () => {
      setIsModalOpen(false);
    };

    const confirmRemove = () => {
      props.api.applyTransaction({ remove: [props.node.data] });
      // console.log(indexPipe)
      // const pipes = props.data.pipe_id
      // setIndexPipe((data) => ({ ...data, pipes }))
      excludePipe(props)
      closeModal();
    };

    function excludePipe(data) {
      excludedPipes.push(data.data["pipe_id"])
    }
    // setIndexPipe(excludedPipes)

    const onClick = (e) => {
      if (isLastRow) {
        e.preventDefault()
        props.api.applyTransaction({ remove: [props.node.data] });
      }
    };

    return (
      <>
        {isLastRow ? (
          <i onClick={openModal} id={props.rowIndex} className="fa fa-trash"></i>
        ) : (
          <span></span>  // Render nothing if not the last row
        )}

        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Confirm Deletion"
          ariaHideApp={false}
          className="BlastingDataModalCustom">
          <div className="BlastingDataModalBox">
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete this row?</p>
            <button onClick={confirmRemove} style={{ background: '#34B233' }}>Yes, Remove</button>
            <button onClick={closeModal} style={{ background: '#ED2939' }}>Cancel</button>
          </div>
        </Modal>
      </>
    );
  };

  // const RemoveButton = (props) => {
  //   const onClick = (e) => {
  //     e.preventDefault();
  //     props.api.applyTransaction({ remove: [props.node.data] });
  //   };

  //   return (
  //     <button onClick={onClick}>Remove</button>
  //   );
  // };


  const gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData,
    suppressMovableColumns: true,
    onCellValueChanged: onCellValueChanged,
    components: {
      removeButtonRenderer: RemoveButton,  // Register the RemoveButton component
    },
    getRowStyle: (params) => {
      if (params.data.pm_ntc_id && params.data.pm_ntc_id !== '' && typeOfProcess != 523) {
        return { backgroundColor: '#f0f0f0', opacity: 0.5, pointerEvents: 'none' };
      }
      return null; // Default style
    },
    isRowSelectable: (params) => false,

    // Apply a custom CSS class to disabled rows
    rowClassRules: {
      'disabled-row': (params) => params.data.isDisabled
    },
    rowHeight: 400
    // Other grid options
  };
  // if (rowData.length > 0) {
  //   rowData[0].dewPointforCoating = 40;
  // }

  // gridOptions.api.setRowData(rowData);

  function onCellValueChanged(params) {
    TestGridValueSetter(params);

    if (params.rowIndex === 0) {
      const newValue = params.newValue;
      gridOptions.api.forEachNode(node => {
        if (node.rowIndex !== 0) { // Avoid updating the first row again
          node.setDataValue(params.colDef.field, newValue);
        }
      });
    }
  }
  const handleSelectChange = (event, rowIndex, selectName) => {
    if (selectName != 'batch') {
      const { value } = event.target;
      setMaterialUsed(prevData => {
        const updatedData = [...prevData];
        if (updatedData[rowIndex]) {
          updatedData[rowIndex][selectName] = value;
        } else {
          updatedData[rowIndex] = { [selectName]: value };
        }
        // updatedData[rowIndex].batches = convertToCommaSeparatedString(batches[rowIndex]);
        return updatedData;
      });
    }
    else {
      setMaterialUsed(prevData => {
        const updatedData = [...prevData];
        const batch = [...batches];
        batch[rowIndex] = event;
        setBatches(batch);
        updatedData[rowIndex].batch = convertToCommaSeparatedString(batch[rowIndex]);
        return updatedData;
      })
    }
  };

  const convertToCommaSeparatedString = (dataArray) => {
    return dataArray?.map(item => item.value).join('@#@');
  };

  function containsNonNumeric(value) {
    // Regular expression to match non-numeric characters
    // ^-? means the string can optionally start with a minus sign
    // \d+ means there should be at least one digit
    // (\.\d+)? means there can optionally be a dot followed by one or more digits
    let numericPattern = /^-?\d+(\.\d+)?$/;

    return !numericPattern.test(value);
  }
  let isNtc = false
  const handleSubmit = async (e, value) => {
    if (loadingRef.current && contentRef.current) {
      // Show the loader and hide the content
      loadingRef.current.style.display = 'block';
      contentRef.current.style.display = 'none';
    }
    const limit = parseInt(gunCount.current)
    const pipes = parseInt(noOfPipes.current)
    const value1 = defaultNoOfGuns
    console.log(value1, gunCount.current)
    if (value1 != gunCount.current && action != 'edit' && typeOfProcess == 525) {
      toast.error(`You have not enter ${defaultNoOfGuns} values in epoxy guns`)
      if (loadingRef.current && contentRef.current) {
        // Show the loader and hide the content
        loadingRef.current.style.display = 'none';
        contentRef.current.style.display = 'block';
      }
      return false
    }
    console.log(gunValidation, gunValidation1, "gunValidation1")
    if (!gunValidation.current || !gunValidation1.current) {
      toast.error("Line Speed or Dew Point value is not in range")
      if (loadingRef.current && contentRef.current) {
        // Show the loader and hide the content
        loadingRef.current.style.display = 'none';
        contentRef.current.style.display = 'block';
      }
      return false
    }

    if (!blastingValidation1?.current || !blastingValidation3?.current || !blastingValidation2?.current) {
      toast.error("Blasting Line Speed, Blasting Load 1 or Blasting Load 2 value is not in range")
      if (loadingRef.current && contentRef.current) {
        // Show the loader and hide the content
        loadingRef.current.style.display = 'none';
        contentRef.current.style.display = 'block';
      }
      return false
    }

    if (userRole == "Witness_PMC" || userRole == "Witness_Client" || userRole == "Witness_Surveillance" || userRole == "Witness_TPI") {
      const inputData1 = {
        pm_comp_id: "1",
        pm_location_id: "1",
        pm_project_id: formData.project_id.toString(),
        pm_processSheet_id: formData.procsheet_id.toString(),
        pm_processtype_id: formData.coatingType.toString(),
        pm_approved_by: userId.toString(),
        p_test_run_id: pm_test_run_id,
        checkedPipes: checkedPipes.current
      }

      try {
        const response = await fetch(
          Environment.BaseAPIURL + "/api/User/InsertInspectionRandomWitnessNew",
          {
            method: "POST",
            headers: {
              'Content-Type': `application/json`,
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(inputData1),
          }
        );

        const responseBody = await response.text();
        isSubmitting.current = (false);
        if (loadingRef.current && contentRef.current) {
          // Show the loader and hide the content
          loadingRef.current.style.display = 'none';
          contentRef.current.style.display = 'block';
        }
        if (responseBody === "100") {
          toast.success("Form data sent successfully!");
          console.log("Form data sent successfully!");
          navigate(`/blastingsheetlist?menuId=${menuId}`)
        } else {
          console.error(
            "Failed to send form data to the server. Status code:",
            response.status
          );
          toast.error("Please try again")
          console.error("Server response:", responseBody);
        }
      } catch (error) {
        if (loadingRef.current && contentRef.current) {
          // Show the loader and hide the content
          loadingRef.current.style.display = 'none';
          contentRef.current.style.display = 'block';
        }
        toast.error("Please try again")
        console.error("An error occurred while sending form data:", error);
      }
    }

    else {
      isSubmitting.current = (true);

      if (showPopUp.current) {
        const confirmed = window.confirm('Are you sure you want to proceed with Non-Satisfactory result?');
        if (confirmed) {
        } else {
          loadingRef.current.style.display = 'none';
          contentRef.current.style.display = 'block';
          isSubmitting.current = (false);
          return
        }
      }
      // const batchesString = convertToCommaSeparatedString(batch);
      // let data = materialUsed.filter(item => item !== null && item !== undefined);
      // data.batches = batches
      // const filteredData = data.filter(row => (
      //   row.material && row.manufacturer && row.grade && row.batch
      // ));
      // let transformedData = [];

      // // Iterate over each item in the original data
      // filteredData.forEach(item => {
      //   // Split the batch field by '@#@' separator
      //   let batches = item.batch.split('@#@');

      //   // For each split batch, create a new object with the same material, manufacturer, and grade
      //   batches.forEach(batch => {
      //     let newObject = {
      //       "material": item.material,
      //       "manufacturer": item.manufacturer,
      //       "grade": item.grade,
      //       "batch": batch
      //     };
      //     transformedData.push(newObject);
      //   });
      // });

      // // Print the transformed data (array of objects)

      // // Format data to match the specified order
      // const formattedData = filteredData.map(row => ({
      //   material: row.material,
      //   manufacturer: row.manufacturer,
      //   grade: row.grade,
      //   batch: row.batch
      // }));
      const transformedData = [];
      groupedDataArray.forEach((item) => {
        const key = `${item.Material}-${item.Manfacturer}-${item.Grade}`;
        const selectedOption = selectedBatches[key] || [];

        selectedOption.forEach((option) => {
          transformedData.push({
            material: item.ps_material_id.toString(),
            manufacturer: item.ps_manufacturer_id.toString(),
            grade: item.ps_grade_id.toString(),
            batch: option.value,
          });
        });
      });

      console.log(selectedOption, groupedDataArray, transformedData, "transformedData");

      let Aggriddata = [];
      var testing_data = {}
      fieldsNamesarr.forEach(function (ele, index) {
        for (var i = 0; i < columnsArr.length; i++) {
          testing_data[i] = columnsArr[i]
        }
        // columnsArr.forEach(function (ele, index) {
        let firstcolname = ele.split("@~@")[0];
        let secondcolname = ele.split("@~@")[1];
        var colNo = {}

        const filteredRowData = rowData.filter(item =>
          (item.CutBackFEnd != '' && item.CutBackFEnd != '0') || (item.EpoxyBandFEnd != '' && item.EpoxyBandFEnd != '0') || (item.CutBackAngleFEnd != '' && item.CutBackAngleFEnd != '0')
        );

        console.log(rowData)

        const newData = value_type != 528 ? rowData : filteredRowData

        console.log(filteredRowData, "filteredRowData");
        newData.forEach(function (elerow) {

          const selectedOption = coatStatusOptions?.find(option => option.co_param_val_alias === elerow.coat_status);
          const id = selectedOption ? selectedOption.co_param_val_id : '0';
          console.log(elerow, "elerows")
          if (elerow.pipeno !== "") {
            let obj = {
              seqno: "",
              test_categ_id: "",
              test_type_id: "",
              test_id: "",
              proc_template_id: "",
              proc_test_id: "",
              shift_id: currentShift ? currentShift.toString() : formData.shift.toString(),
              test_result_batch: "0",
              pipe_id: "",
              temperature1: "",
              test_value1: "",
              test_value2: "",
              value_type: value_type,
              test_result_accepted: "",
              assigned_to_role_id: "",
              test_result_remarks: "",
              coatstatus: elerow?.pm_ntc_id ? "" : id.toString(),
              islab: elerow.lab_test == true ? true : false,
              pm_isrepair: elerow.is_repair == true ? "1" : "0",
              isfield: elerow.field_test == true ? true : false,
              ntcReason: "",
              pm_reject_status: "",
              isChange: elerow.isChange1 == true ? '1' : '0',
              airpressure_A1: '',
              airpressure_A2: '',
              airpressure_A3: '',
              airpressure_A4: '',
              airpressure_A5: '',
              airpressure_A6: '',
              airpressure_A7: '',
              airpressure_A8: '',
              airpressure_A9: '',
              airpressure_A10: '',
              airpressure_A11: '',
              airpressure_A12: '',
              flowrate_A1: '',
              flowrate_A2: '',
              flowrate_A3: '',
              flowrate_A4: '',
              flowrate_A5: '',
              flowrate_A6: '',
              flowrate_A7: '',
              flowrate_A8: '',
              flowrate_A9: '',
              flowrate_A10: '',
              flowrate_A11: '',
              flowrate_A12: '',
              flowrate_B1: '',
              flowrate_B2: '',
              flowrate_B3: '',
              flowrate_B4: '',
              flowrate_B5: '',
              flowrate_B6: '',
              flowrate_B7: '',
              flowrate_B8: '',
              flowrate_B9: '',
              flowrate_B10: '',
              flowrate_B11: '',
              flowrate_B12: '',
              airpressure_B1: '',
              airpressure_B2: '',
              airpressure_B3: '',
              airpressure_B4: '',
              airpressure_B5: '',
              airpressure_B6: '',
              airpressure_B7: '',
              airpressure_B8: '',
              airpressure_B9: '',
              airpressure_B10: '',
              airpressure_B11: '',
              airpressure_B12: '',
              lineSpeed: '',
              dewPointforCoating: '',
              hdpeScrewRpm1: '',
              hdpeScrewRpm2: '',
              adhesiveScrewRpm: '',
              blastinglineSpeed: "",
              blastingmc1: "",
              blastingmc2: "",
              pm_FieldNo: "",
              pm_rfid_data_id: "",
              pm_pipe_length: "",
              pipe_material: "",
              pipe_manufacturer: "",
              pipe_grade: "",
              pipe_batch: ""
            };
            let result = ntcReasons?.find(item => item.NTCReasons === elerow.ntc_reasons);
            let reject = rejectReason?.find(item => item.RejectReason === elerow.pm_reject_status);
            let isMaterials = materials?.find(item => item.Material === elerow.material_multiple);
            let isManufacturer = materials?.find(item => item.Manfacturer === elerow.manufacturer_multiple);
            let isGrade = materials?.find(item => item.Grade === elerow.grade_multiple);
            let isBatch = materials?.find(item => item.pm_batch === elerow.batch_multiple);
            console.log(isMaterials, materials, "isMaterials", elerow.material_multiple)

            if (elerow?.remarks == "Not OK" || elerow?.remarks == "OK") {
              result = ""
            }

            if (elerow?.remarks == "NTC" || elerow?.remarks == "OK") {
              reject = ""
            }
            if (elerow.remarks == "NTC" && (elerow.ntc_reasons == "" || elerow.ntc_reasons == undefined) && elerow?.pm_ntc_id == '') {
              isNtc = true
              if (loadingRef.current && contentRef.current) {
                // Show the loader and hide the content
                loadingRef.current.style.display = 'none';
                contentRef.current.style.display = 'block';
              }
              toast.error("Please select NTC reason", { toastId: '202' })
              return false
            }

            if (elerow.remarks == "Reject" && (elerow.pm_reject_status == "" || elerow.pm_reject_status == undefined) && elerow?.pm_ntc_id == '') {
              console.log(elerow, elerow.pm_reject_status == "", elerow.pm_reject_status == undefined)
              isNtc = true
              toast.error("Please select Reject reason", { toastId: '203' })
              if (loadingRef.current && contentRef.current) {
                // Show the loader and hide the content
                loadingRef.current.style.display = 'none';
                contentRef.current.style.display = 'block';
              }
              return false
            }

            obj.pipe_id = elerow.pipe_id;
            obj.test_result_remarks = elerow?.pm_ntc_id ? "NTC" : elerow.remarks;
            obj.airpressure_A1 = elerow.A1 ? elerow.A1 : '';
            obj.airpressure_A2 = elerow.A2 ? elerow.A2 : '';
            obj.airpressure_A3 = elerow.A3 ? elerow.A3 : '';
            obj.airpressure_A4 = elerow.A4 ? elerow.A4 : '';
            obj.airpressure_A5 = elerow.A5 ? elerow.A5 : '';
            obj.airpressure_A6 = elerow.A6 ? elerow.A6 : '';
            obj.airpressure_A7 = elerow.A7 ? elerow.A7 : '';
            obj.airpressure_A8 = elerow.A8 ? elerow.A8 : '';
            obj.airpressure_A9 = elerow.A9 ? elerow.A9 : '';
            obj.airpressure_A10 = elerow.A10 ? elerow.A10 : '';
            obj.airpressure_A11 = elerow.A11 ? elerow.A11 : '';
            obj.airpressure_A12 = elerow.A12 ? elerow.A12 : '';
            obj.airpressure_B1 = elerow.B1 ? elerow.B1 : '';
            obj.airpressure_B2 = elerow.B2 ? elerow.B2 : '';
            obj.airpressure_B3 = elerow.B3 ? elerow.B3 : '';
            obj.airpressure_B4 = elerow.B4 ? elerow.B4 : '';
            obj.airpressure_B5 = elerow.B5 ? elerow.B5 : '';
            obj.airpressure_B6 = elerow.B6 ? elerow.B6 : '';
            obj.airpressure_B7 = elerow.B7 ? elerow.B7 : '';
            obj.airpressure_B8 = elerow.B8 ? elerow.B8 : '';
            obj.airpressure_B9 = elerow.B9 ? elerow.B9 : '';
            obj.airpressure_B10 = elerow.B10 ? elerow.B10 : '';
            obj.airpressure_B11 = elerow.B11 ? elerow.B11 : '';
            obj.airpressure_B12 = elerow.B12 ? elerow.B12 : '';
            obj.flowrate_A1 = elerow.SecondA1 ? elerow.SecondA1 : '';
            obj.flowrate_A2 = elerow.SecondA2 ? elerow.SecondA2 : '';
            obj.flowrate_A3 = elerow.SecondA3 ? elerow.SecondA3 : '';
            obj.flowrate_A4 = elerow.SecondA4 ? elerow.SecondA4 : '';
            obj.flowrate_A5 = elerow.SecondA5 ? elerow.SecondA5 : '';
            obj.flowrate_A6 = elerow.SecondA6 ? elerow.SecondA6 : '';
            obj.flowrate_A7 = elerow.SecondA7 ? elerow.SecondA7 : '';
            obj.flowrate_A8 = elerow.SecondA8 ? elerow.SecondA8 : '';
            obj.flowrate_A9 = elerow.SecondA9 ? elerow.SecondA9 : '';
            obj.flowrate_A10 = elerow.SecondA10 ? elerow.SecondA10 : '';
            obj.flowrate_A11 = elerow.SecondA11 ? elerow.SecondA11 : '';
            obj.flowrate_A12 = elerow.SecondA12 ? elerow.SecondA12 : '';
            obj.flowrate_B1 = elerow.SecondB1 ? elerow.SecondB1 : '';
            obj.flowrate_B2 = elerow.SecondB2 ? elerow.SecondB2 : '';
            obj.flowrate_B3 = elerow.SecondB3 ? elerow.SecondB3 : '';
            obj.flowrate_B4 = elerow.SecondB4 ? elerow.SecondB4 : '';
            obj.flowrate_B5 = elerow.SecondB5 ? elerow.SecondB5 : '';
            obj.flowrate_B6 = elerow.SecondB6 ? elerow.SecondB6 : '';
            obj.flowrate_B7 = elerow.SecondB7 ? elerow.SecondB7 : '';
            obj.flowrate_B8 = elerow.SecondB8 ? elerow.SecondB8 : '';
            obj.flowrate_B9 = elerow.SecondB9 ? elerow.SecondB9 : '';
            obj.flowrate_B10 = elerow.SecondB10 ? elerow.SecondB10 : '';
            obj.flowrate_B11 = elerow.SecondB11 ? elerow.SecondB11 : '';
            obj.flowrate_B12 = elerow.SecondB12 ? elerow.SecondB12 : '';
            obj.lineSpeed = elerow.lineSpeed ? elerow.lineSpeed : '';
            obj.dewPointforCoating = elerow.dewPointforCoating ? elerow.dewPointforCoating : '';
            obj.blastinglineSpeed = elerow.blastingLineSpeedentry ? elerow.blastingLineSpeedentry : '';
            obj.blastingmc1 = elerow.blastingLoad1entry ? elerow.blastingLoad1entry : '';
            obj.blastingmc2 = elerow.blastingLoad2entry ? elerow.blastingLoad2entry : '';
            obj.hdpeScrewRpm1 = elerow.hdpeScrewRpm1 ? elerow.hdpeScrewRpm1 : '';
            obj.hdpeScrewRpm2 = elerow.hdpeScrewRpm2 ? elerow.hdpeScrewRpm2 : '';
            obj.adhesiveScrewRpm = elerow.adhesiveScrewRpm ? elerow.adhesiveScrewRpm : '';
            obj.ntcReason = result ? result.valId.toString() : elerow?.pm_ntc_id ? elerow?.pm_ntc_id : "";
            console.log(reject, 'reject')
            obj.pm_reject_status = reject?.valId != "" && reject?.valId != "undefined" && !result && reject?.valId != undefined ? reject.valId.toString() : "0";
            obj.seqno = elerow?.Id ? elerow?.Id.toString() : "1";
            // obj.FieldNo = elerow?.FieldNo ? elerow?.FieldNo.toString() : "0";
            obj.pm_FieldNo = elerow?.pm_FieldNo ? elerow?.pm_FieldNo.toString() : "0";
            obj.pm_rfid_data_id = elerow?.pm_rfid_data_id ? elerow?.pm_rfid_data_id.toString() : "0";
            obj.pm_pipe_length = elerow?.pm_pipe_lengthtelly ? elerow?.pm_pipe_lengthtelly.toString() : "0";
            obj.pm_pono = elerow?.ponos ? elerow?.ponos.toString() : "0";
            obj.pm_salesord_no = elerow?.soNoLists ? elerow?.soNoLists.toString() : "0";
            obj.pm_item_no = elerow?.SoLineItemLists ? elerow?.SoLineItemLists.toString() : "0";
            obj.pm_po_item_no = elerow?.POItemLists ? elerow?.POItemLists.toString() : "0";
            obj.pipe_material = isMaterials ? isMaterials.Material_Id.toString() : elerow?.material_multiple ? elerow?.material_multiple : "";
            obj.pipe_manufacturer = isManufacturer ? isManufacturer.Manfacturer_Id.toString() : elerow?.manufacturer_multiple ? elerow?.manufacturer_multiple : "";
            obj.pipe_grade = isGrade ? isGrade.Grade_Id.toString() : elerow?.grade_multiple ? elerow?.grade_multiple : "";
            obj.pipe_batch = isBatch ? isBatch.pm_batch.toString() : elerow?.batch_multiple ? elerow?.batch_multiple : "";
            if (firstcolname !== "") {
              obj.test_value1 = elerow?.pm_ntc_id && elerow.ntc_reasons == '' ? '0' : result ? result.NTCReasons : elerow[firstcolname] == "null" ? "0" : elerow[firstcolname] + "";
            }
            if (secondcolname != undefined) {
              obj.temperature1 = result ? "0" : elerow[secondcolname] == undefined ? 0 : elerow[secondcolname] + "";
            }
            else {
              obj.temperature1 = "0"
            }
            obj.proc_template_id = valueids[index].pm_proc_template_id + "";
            obj.test_categ_id = valueids[index].pm_test_categ_id + "";
            obj.test_type_id = valueids[index].pm_test_type_id + "";
            obj.test_id = valueids[index].pm_test_id + "";
            obj.proc_test_id = valueids[index].pm_proc_test_id + "";
            if (!excludedPipes.includes(elerow.pipe_id)) {
              Aggriddata.push(obj);
            }
          }
        });
        // }
      });
      let selectedprocedure = "";
      // formData?.procedure?.forEach((element) => {
      //   selectedprocedure = selectedprocedure + element.value + ",";
      // });
      let thickness = false
      if (formData.coatingType == '526') {
        thickness = true
      }
      else {
        thickness = false
      }
      let inputData = {
        test_run_id: action == 'edit' ? pm_test_run_id : testRunId ? testRunId.toString() : "0",
        project_id: formData.project_id.toString(),
        procsheet_id: formData.procsheet_id.toString(),
        processsheet: formData.processsheet,
        testdate: formData.testdate,
        shift: currentShift ? currentShift.toString() : formData.shift.toString(),
        rm_batch: formData.rm_batch,
        material_id: formData.material_id == "" ? "0" : formData.material_id,
        manufacturer_id: formData.manufacturer_id == "" ? "0" : formData.manufacturer_id,
        grade_id: formData.grade_id == "" ? "0" : formData.grade_id,
        created_by: formData.created_by,
        year: formData.year,
        type: formData.type,
        clientname: formData.clientname,
        projectname: formData.projectname,
        pipesize: formData.pipesize,
        typeofcoating: formData.typeofcoating,
        procedure_type: wiSelectedProcedure.map((proc) => proc.value).join(',') + ',',
        process_type: formData.coatingType.toString(),
        ispqt: formData.ispqt + "",
        testsData: Aggriddata,
        instrumentData: usedInstrument,
        rawMaterialData: action === 'edit' ? editRawMaterialList : transformedData,
        isSubmit: value,
        isThickness: thickness,
        roleId: parseInt(roleId)
      };
      let flag = 0
      if (inputData.testsData.length == 0) {
        // toast.error("There are no pipes available")
        return
      }
      for (let i = 0; i < inputData.testsData.length; i++) {
        if ((inputData.testsData[i].test_value1 == "" || inputData.testsData[i].temperature1 == "" || inputData.testsData[i].test_result_remarks == "Select") && inputData.testsData[i].test_result_remarks != "NTC") {
          flag = 1
        }
        if (containsNonNumeric(inputData.testsData[i].temperature1) && inputData.testsData[i].test_result_remarks != "NTC") {
          flag = 2
        }
      }
      if (false) {

      }
      // if (flag == 1) {
      //   setIsSubmitting(false);
      //   toast.error("Please enter field values")
      //   return
      // }
      // else if (flag == 2) {
      //   setIsSubmitting(false);
      //   toast.error("Please enter numeric values only in temperature field")
      //   return
      // }
      else {
        if (isNtc) {
          isNtc = false
          isSubmitting.current = (false)
          if (loadingRef.current && contentRef.current) {
            // Show the loader and hide the content
            loadingRef.current.style.display = 'none';
            contentRef.current.style.display = 'block';
          }
          return false
        }
        try {
          console.log(inputData, "inputData")
          if (inputData.testsData[0].lineSpeed == "" && value_type == 525) {
            toast.error("Please enter Line Speed value")
            if (loadingRef.current && contentRef.current) {
              // Show the loader and hide the content
              loadingRef.current.style.display = 'none';
              contentRef.current.style.display = 'block';
            }
            isSubmitting.current = (false);
            return false
          }
          if (inputData.testsData[0].dewPointforCoating == "" && value_type == 525) {
            toast.error("Please enter Dew Point value")
            if (loadingRef.current && contentRef.current) {
              // Show the loader and hide the content
              loadingRef.current.style.display = 'none';
              contentRef.current.style.display = 'block';
            }
            isSubmitting.current = (false);
            return false
          }
          const response = await fetch(
            Environment.BaseAPIURL + "/api/User/SaveProcessDataEntry",
            {
              method: "POST",
              headers: {
                'Content-Type': `application/json`,
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify(inputData),
            }
          );

          const responseBody = await response.text();
          isSubmitting.current = (false);
          if (responseBody === "1000") {
            toast.success("Form data sent successfully!");
            console.log("Form data sent successfully!");
            if (loadingRef.current && contentRef.current) {
              // Show the loader and hide the content
              loadingRef.current.style.display = 'none';
              contentRef.current.style.display = 'block';
            }
            navigate(`/blastingsheetlist?menuId=${menuId}`)
          } else {
            console.error(
              "Failed to send form data to the server. Status code:",
              response.status
            );
            toast.success("Form data sent successfully!");
            // toast.error("Please try again")
            if (loadingRef.current && contentRef.current) {
              // Show the loader and hide the content
              loadingRef.current.style.display = 'none';
              contentRef.current.style.display = 'block';
            }
            navigate(`/blastingsheetlist?menuId=${menuId}`)
            console.error("Server response:", responseBody);
          }
        } catch (error) {
          if (loadingRef.current && contentRef.current) {
            // Show the loader and hide the content
            loadingRef.current.style.display = 'none';
            contentRef.current.style.display = 'block';
          }
          toast.error("Please try again")
          console.error("An error occurred while sending form data:", error);
        }
      }
    }

  };

  const handleApprovalSubmit = async () => {
    try {
      const response = await fetch(
        Environment.BaseAPIURL + "/api/User/updateQCApprove",
        {
          method: "POST",
          headers: {
            'Content-Type': `application/json`,
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(approvalFormData),
        }
      );

      const responseBody = await response.text();

      if (responseBody === "100" || responseBody === "200") {
        toast.success("Form data sent successfully!");
        console.log("Form data sent successfully!");
      } else {
        console.error(
          "Failed to send form data to the server. Status code:",
          response.status
        );
        console.error("Server response:", responseBody);
      }
    } catch (error) {
      console.error("An error occurred while sending form data:", error);
    }
  };

  const handleDust = async (e) => {
    // window.open(``, '_blank')
  }

  // ---------------------------------------------
  // -------------------------------------------
  const loading = useRef(false);
  useEffect(() => {
    // loading.current = (true);
    setTimeout(() => {
      if (loadingRef.current) {
        // Hide the loader after async operation
        loadingRef.current.style.display = 'none';
      }
    }, 1000);
  }, []);

  const handleStatusChange = (value) => {
    if (value === "A") {
      setApprovalFormData({ ...approvalFormData, QCApproverejectflag: "1" });
    }
    if (value === "R") {
      setApprovalFormData({ ...approvalFormData, QCApproverejectflag: "0" });
    }
  };

  const formatDate = (date) => {
    console.log(date, "date")
    if (!date) return '';

    const [year, month, day] = date.split("-");

    // Format the date as DD-MM-YYYY
    const formattedDate = `${day}-${month}-${year}`;
    // const d = new Date(date);
    // const day = String(d.getDate()).padStart(2, '0');
    // const month = String(d.getMonth() + 1).padStart(2, '0');
    // const year = d.getFullYear();
    // console.log(`${day}-${month}-${year}`)
    return `${formattedDate}`;
  };

  return (
    <>

      <div ref={loadingRef} style={{ display: 'none' }} className="loaderMain">
        Loading...
      </div>

      <>
        <div ref={contentRef} style={{ display: 'block' }}>
          <Header />
          <section className="InnerHeaderPageSection">
            <div
              className="InnerHeaderPageBg"
              style={{ backgroundImage: `url(${RegisterEmployeebg})` }}
            ></div>
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12">
                  <ul>
                    <li>
                      <Link to={`/dashboard?moduleId=${moduleId}`}>Quality Module</Link>
                    </li>
                    <li><h1>/&nbsp;</h1></li>
                    <li>&nbsp;<Link to={`/blastingsheetlist?moduleId=${moduleId}&menuId=${menuId}`}>&nbsp;Process Data Entry List</Link></li>
                    <li>
                      <h1>/&nbsp; Process Data Entry </h1>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
          <section className="RawmaterialPageSection BlastingDataEntrySectionPage">
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-sm-12 col-xs-12">
                  <div className="PipeTallySheetDetails">
                    <form className="form row m-0">
                      <div className="col-md-12 col-sm-12 col-xs-12">
                        <h4>
                          Process Data Entry <span>- Add page</span>
                        </h4>
                      </div>
                      <div className="col-md-4 col-sm-4 col-xs-12">
                        <div className="form-group">
                          <label htmlFor="">Process Sheet</label>
                          <div className="ProcessSheetFlexBox">
                            <input
                              style={{ width: "66%", cursor: "not-allowed" }}
                              name="processsheet"
                              value={formData.processsheet}
                              onChange={handleTypeChange}
                              disabled={ProcessSheetFields}
                              placeholder="Process sheet no."
                              readOnly
                            />

                            <select
                              name="year"
                              value={formData.year}
                              onChange={handleTypeChange}
                            >
                              <option value="">Year</option>
                              {ddlYear?.map((coatingTypeOption, i) => (
                                <option
                                  key={i}
                                  value={coatingTypeOption.year_id}
                                >
                                  {" "}
                                  {coatingTypeOption.year_value}{" "}
                                </option>
                              ))}
                            </select>
                            {/* <select
                              name="year"
                              value={formData.year}
                              onChange={handleTypeChange}
                            >
                              <option value=""> Year </option>
                              <option value="2022"> 2022 </option>
                              <option value="2023"> 2023 </option>
                            </select> */}
                            <b>-</b>
                            <input
                              type="number"
                              name="type"
                              value={formData.type}
                              onChange={handleTypeChange}
                              onBlur={getTestBlastingEntry}
                              placeholder="No."
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4 col-sm-4 col-xs-12">
                        <div className="form-group">
                          <label htmlFor="">Client Name</label>
                          <input
                            type="text"
                            name="clientname"
                            value={formData.clientname}
                            onChange={handleTypeChange}
                            placeholder="Client name"
                            style={{ cursor: "not-allowed" }}
                            readOnly
                          />
                        </div>
                      </div>
                      {/* <div className="col-md-4 col-sm-4 col-xs-12">
                        <div className="form-group">
                          <label htmlFor="">Project Name</label>
                          <input
                            type="text"
                            name="projectname"
                            value={formData.projectname}
                            onChange={handleTypeChange}
                            disabled={shouldDisableFields}
                            placeholder="Project name"
                            style={{ cursor: "not-allowed" }}
                            readOnly
                          />
                        </div>
                      </div> */}
                      <div className="col-md-4 col-sm-4 col-xs-12">
                        <div className="form-group">
                          <label htmlFor="">Pipe Size</label>
                          <input
                            type="text"
                            name="pipesize"
                            value={formData.pipesize}
                            onChange={handleTypeChange}
                            disabled={shouldDisableFields}
                            placeholder="Pipe size"
                            style={{ cursor: "not-allowed" }}
                            readOnly
                          />
                        </div>
                      </div>
                      {/* <div className="col-md-4 col-sm-4 col-xs-12">
                        <div className="form-group">
                          <label htmlFor="">Type Of Coating</label>
                          <input
                            type="text"
                            name="typeofcoating"
                            value={formData.typeofcoating}
                            onChange={handleTypeChange}
                            disabled={shouldDisableFields}
                            placeholder="Type of coating"
                            style={{ cursor: "not-allowed" }}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-md-4 col-sm-4 col-xs-12">
                        <div className="form-group">
                          <label htmlFor="">Procedure/ WI No.</label>
                          <Select
                            className="select"
                            name="procedure"
                            value={wiSelectedProcedure}
                            onChange={handleChange}
                            isDisabled={!userRole}
                            options={wiProcedure}
                            isSearchable
                            isClearable
                            isMulti={true}
                            placeholder="Search or Select procedure..."
                          />
                        </div>
                      </div> */}
                      <div className="col-md-4 col-sm-4 col-xs-12">
                        <div className="form-group">
                          <label htmlFor="">Date</label>


                          <input type="text" value={formatDate(formData?.testdate)} />

                          {/* <DatePicker
                            max={new Date().toISOString().split("T")[0]}
                            name="testdate"
                            value={formData.testdate}
                            onChange={handleTypeChange}
                            dateFormat="dd/MMM/yyyy"
                            placeholderText="DD/MMM/YYYY"
                          /> */}
                        </div>
                      </div>

                      <div className="col-md-4 col-sm-4 col-xs-12">
                        <div className="form-group">
                          <label htmlFor="">Process Type</label>
                          <select
                            name="coatingType"
                            className=""
                            value={formData.coatingType}
                            onChange={handleTypeChange}
                          >
                            <option value=''>Select type</option>
                            {coatingType.map((coatingTypeOption, i) => (
                              <option
                                key={i}
                                value={coatingTypeOption.co_param_val_id}
                              >
                                {" "}
                                {coatingTypeOption.co_param_val_name}{" "}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-4 col-sm-4 col-xs-12">
                        <div className="form-group">
                          <label htmlFor="">Shift</label>
                          <input type="text" className="form-control" value={ddlShift.pm_shiftvalue} />
                          {/* <select
                            name="shift"
                            className=""
                            style={{ cursor: "not-allowed" }}
                            readOnly
                            disabled
                            value={formData.shift}
                            onChange={handleTypeChange}
                          >
                            <option value="0" selected>
                              Select shift
                            </option>
                            {ddlShift.map((coatingTypeOption, i) => (
                              <option
                                key={i}
                                value={coatingTypeOption.pm_shift_id}
                              >
                                {coatingTypeOption.pm_shiftvalue}
                              </option>
                            ))}
                          </select> */}
                          {/* <select name="shift" value={formData.shift} onChange={handleTypeChange}>
                                                                        <option value="0">-- Select shift --</option>
                                                                        <option value="1">Day</option>
                                                                        <option value="2">Night</option>
                                                                    </select> */}
                          {/* <input type="text" value={shouldDisableFields ? 'DAY' : ''} title={shouldDisableFields ? 'DAY' : ''} disabled={shouldDisableFields} placeholder='Report No.' style={{ cursor: 'not-allowed' }} readOnly /> */}
                        </div>
                      </div>


                      {ShowProcessTypeGrids && (
                        <>
                          {/* <div className="col-md-12 col-sm-12 col-xs-12">
                            <hr className="DividerLine" />
                          </div> */}
                          <div className="col-md-12 col-sm-12 col-xs-12">
                            <div className="d-flex align-items-center">
                              <div className="PQTBox">
                                <input
                                  type="checkbox"
                                  id="ispqt"
                                  name="ispqt"
                                  checked={formData.ispqt}
                                  onChange={handleTypeChange}
                                />
                                <label for="pqt"> PQT</label>
                              </div>
                              {typeOfProcess == 524 ? <><a href={`/dustlevelview/${encryptData(0)}&pm_processSheet_id=${encryptData(formData.procsheet_id)}&test_id=${encryptData(237)}&moduleId=${moduleId}&menuId=${menuId}`} target="_blank" className="btn btn-primary mx-2" style={{ padding: '4px' }}>Dust Level Report</a></> : ''}
                              {typeOfProcess == 524 ? <><a href={`/calibration-blasting-report?year=${encryptData(formData.year)}&ProcessSheetID=${encryptData(formData.procsheet_id)}&ProcessSheetTypeID=${encryptData(1398)}&moduleId=${moduleId}&menuId=${menuId}`} target="_blank" className="btn btn-primary mx-2" style={{ padding: '4px' }}>Calibration</a></> : ''}
                            </div>
                          </div>


                          {/* <div className="accordion" id="accordionExample">
                            <div className="accordion-item" id="headingOne">
                              <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                Frequency: {frequency}
                              </button>
                              <div id="collapseOne" className="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                                <div className="accordion-body">
                                  <div className="Frequencytable">
                                    <table>
                                      <thead>
                                        <tr style={{ background: "#5a245a", color: "#fff", }}>
                                          <th>Sr No.</th>
                                          <th>Batch</th>
                                          <th>Pipe No.</th>
                                          <th>Shift</th>
                                          <th>Date</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {frequencyDetails?.map((item, index) =>
                                          <tr>
                                            <td>{index + 1}</td>
                                            <td>{item.batch}</td>
                                            <td>{item.pipeno}</td>
                                            <td>{item.shift}</td>
                                            <td>{new Date(item.date).toLocaleDateString("en-GB")}</td>
                                          </tr>)}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div> */}

                          {/* {(typeOfProcess != "523" && typeOfProcess != "526") ?
                            materials.map((data, i) => {
                              return (
                                <>
                                  <div className='col-md-3 col-sm-3 col-xs-12'>
                                    <div className='form-group'>
                                      <label htmlFor="">Raw Material Name</label>
                                      <select style={{ background: "#fbfbfb" }} name="material" id="" onChange={(e) => handleSelectChange(e, i, 'material')}>
                                        <option>Select raw material</option>
                                        <option value={data?.Material_Id}>{data?.Material}</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div className='col-md-3 col-sm-3 col-xs-12'>
                                    <div className='form-group'>
                                      <label htmlFor="">Manufacturer</label>
                                      <select style={{ background: "#fbfbfb" }} name="manufacturer" id="material" onChange={(e) => handleSelectChange(e, i, 'manufacturer')}>
                                        <option>Select mfr</option>
                                        <option value={data?.Manufacturer_Id}>{data?.Manufacturer}</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div className='col-md-3 col-sm-3 col-xs-12'>
                                    <div className='form-group'>
                                      <label htmlFor="">Grade</label>
                                      <select style={{ background: "#fbfbfb" }} name="grade" id="" onChange={(e) => handleSelectChange(e, i, 'grade')}>
                                        <option>Select grade</option>
                                        <option value={data?.Grade_Id}>{data?.Grade}</option>
                                      </select>
                                    </div>
                                  </div>

                                  {/* <div className='col-md-3 col-sm-3 col-xs-12'>
                                    <div className='form-group'>
                                      <label htmlFor="">Batch</label>
                                      <select style={{ background: "#fbfbfb" }} multiple name="batch" id="" onChange={(e) => handleSelectChange(e, i, 'batch')}>
                                        <option>Select Batch</option>
                                        {data?.Batches?.map((data1) => {
                                          return (
                                            <option value={data1}>{data1}</option>
                                          )
                                        })}
                                      </select>
                                    </div>
                                  </div> */}


                          {/* <div className='col-md-3'>
                                    <label htmlFor="" style={{ marginBottom: '8px' }}>Batch</label>
                                    <Select
                                      className="select"
                                      value={batches[i]}  // Use batchSelections for this specific row
                                      onChange={(selectedOption) => handleSelectChange(selectedOption, i, 'batch')}
                                      options={data.Batches?.map(batch => ({ value: batch, label: batch }))}
                                      isSearchable
                                      isClearable
                                      isMulti
                                      placeholder="Search or select batch..."
                                    />
                                  </div> */}

                          {/* <div className='col-md-3 col-sm-3 col-xs-12'>
                                    <div className='form-group'>
                                      <label htmlFor='batchno'>Batch No.</label>
                                      <Select
                                        className="select"
                                        name="batch"
                                        value={batches}
                                        onChange={(selectedOption) => setBatches(selectedOption)}
                                        options={data?.Batches?.map((clientOption) => ({
                                          value: clientOption,
                                          label: clientOption,
                                        }))}
                                        isSearchable
                                        isClearable
                                        isMulti={true}
                                        placeholder="Search or Select batch..."
                                      />
                                      <span id='testrunid' hidden></span>
                                    </div>
                                  </div> 
                                </>
                              )
                            }) : ''} */}
                          {/* {(typeOfProcess !== "523" && typeOfProcess !== "526") && (
                            <>
                              {
                                ((typeOfProcess === "524" && groupedDataArray.some(item => item.Material === "Phosphoric Acid")) ||
                                  (typeOfProcess === "525" && groupedDataArray.some(item =>
                                    ["Chromate", "Adhesive", "Fusion Bonded Epoxy", "High Density Polyethylene"].includes(item.Material)
                                  ))) &&
                                (
                                  <div className="Frequencytable">
                                    <table>
                                      <thead>
                                        <tr style={{ background: "#5a245a", color: "#fff" }}>
                                          <th>Sr. No.</th>
                                          <th style={{ minWidth: "150px" }}>Material</th>
                                          <th style={{ minWidth: "150px" }}>Manufacturer</th>
                                          <th style={{ minWidth: "150px" }}>Grade</th>
                                          <th style={{ minWidth: "150px" }}>Batch No.</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {groupedDataArray.filter(item => {
                                          if (typeOfProcess === "524") {
                                            return item.Material === "Phosphoric Acid";
                                          }
                                          if (typeOfProcess === "525") {
                                            return ["Chromate", "Adhesive", "Fusion Bonded Epoxy", "High Density Polyethylene"].includes(item.Material);
                                          }
                                          return false;
                                        })
                                          .map((item, index) => {
                                            const key = `${item.Material}-${item.Manfacturer}-${item.Grade}`;
                                            const selectedOption = selectedBatches[key] || null;

                                            return (
                                              <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td><select><option value={item.ps_material_id}>{item.Material}</option></select></td>
                                                <td><select><option value={item.ps_manufacturer_id}>{item.Manfacturer}</option></select></td>
                                                <td><select><option value={item.ps_grade_id}>{item.Grade}</option></select></td>
                                                <td>
                                                  {action === 'edit' ? (
                                                    <div>
                                                      <Select
                                                        className="select"
                                                        id="batchno"
                                                        value={item.batches.map(batch => ({ value: batch, label: batch }))}
                                                        isMulti
                                                      />
                                                    </div>
                                                  ) : (
                                                    <Select
                                                      className="select"
                                                      id="batchno"
                                                      value={selectedOption}
                                                      onChange={selectedOption => handleBatchChange(key, selectedOption)}
                                                      options={item.batches.map(batch => ({
                                                        value: batch,
                                                        label: batch,
                                                      }))}
                                                      isSearchable
                                                      isClearable
                                                      isMulti
                                                      placeholder="Search or Select batch..."
                                                    />
                                                  )}
                                                </td>
                                              </tr>
                                            );
                                          })}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                            </>
                          )} */}
                          {/* <div className="col-md-12 col-sm-12 col-xs-12">
                            <hr className="DividerLine" />
                          </div> */}

                          {typeOfProcess != 523 ?
                            <div className="accordion" id="accordionExample">
                              <div className="accordion-item" id="headingOne">
                                <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="true" aria-controls="collapseOne" style={{ backgroundColor: previousStationPipes?.length > 0 ? '#ED2939' : '#34B233', color: previousStationPipes?.length > 0 ? '#fff' : '#fff' }}>
                                  Pipes pending at previous stations | Count : {previousStationPipes?.length}
                                </button>
                                <div id="collapseFour" className="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                                  <div className='container-fluid'>
                                    <div className='row'>
                                      <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                                        <table>
                                          <thead>
                                            <tr style={{ background: "#5a245a", color: "#fff" }}>
                                              <th>S. No.</th>
                                              <th>Process Sheet No.</th>
                                              <th>Pipe No.</th>
                                              <th>ASL No.</th>
                                              {/* <th>Station</th> */}
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {previousStationPipes?.map((data, index) => {
                                              return (
                                                <tr index={index}>
                                                  <td>{index + 1}</td>
                                                  <td>{data.pm_procsheet_id}</td>
                                                  <td>{data.PIPNO}</td>
                                                  <td>{data.pm_asl_number}</td>
                                                  {/* <td>{data.co_param_val_name}</td> */}
                                                </tr>
                                              )
                                            })}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div> : ''}
                          {/* <div className="col-md-12 col-sm-12 col-xs-12">
                            <hr className="DividerLine" />
                          </div> */}
                          <div className="fadedIcon">
                            <li style={{ listStyle: 'none' }}>
                              <i
                                onClick={() => {
                                  getTestBlastingDataEntries(
                                    formData.coatingType
                                  );
                                }}
                                className="fa-solid fa-arrows-rotate refresh-icon"
                                style={{
                                  color: "#3d7edb",
                                  display: "inline-block",
                                  cursor: "pointer",
                                  marginRight: "7px"
                                }}
                              ></i>
                              Refresh
                            </li>
                          </div>
                          <div className="col-md-12 col-sm-12 col-xs-12">
                            <div style={containerStyle}>
                              <div
                                className="ag-theme-alpine ag-theme-quartz"
                                id="custom-scroll"
                                style={gridStyle}
                              >
                                {typeOfProcess == 525 ? <div style={{ fontSize: '16px' }}>No of Guns : {defaultNoOfGuns}</div> : ''}
                                <AgGridReact
                                  // getRowId={params => params.data.id}
                                  className="BlastingDataEntryTable ag-theme-alpinez"
                                  columnDefs={columnDefs}
                                  defaultColDef={defaultColDef}
                                  suppressLastEmptyLineOnPaste={true}
                                  rowData={rowData}
                                  suppressDragLeaveHidesColumns={false}
                                  stopEditingWhenGridLosesFocus={false}
                                  suppressRowClickSelection="true"
                                  autoHeaderHeight={true}
                                  rowHeight={50}
                                  domLayout="autoHeight"
                                  gridOptions={gridOptions}
                                  resizable={true}
                                  suppressHorizontalScroll={false}
                                  editable={true}
                                  enableRangeSelection={true} // This works in community edition
                                  clipboardPasteOperation={(params) => {
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          {/* <div className="col-md-12 col-sm-12 col-xs-12">
                            <hr className="DividerLine" />
                          </div> */}
                          <div className="col-md-12 col-sm-12 col-xs-12">
                            <Table>
                              <thead>
                                <tr
                                  style={{
                                    background: "#5a245a",
                                    color: "#fff !important",
                                  }}
                                >
                                  <th
                                    colSpan={3}
                                    style={{
                                      fontSize: "16px",
                                      textAlign: "center",
                                    }}
                                  >
                                    {" "}
                                    Used Instrument
                                  </th>
                                </tr>
                                <tr
                                  style={{
                                    background: "#5a245a",
                                    color: "#fff",
                                  }}
                                >
                                  <td
                                    style={{
                                      maxWidth: "30px",
                                      background: "whitesmoke",
                                    }}
                                  >
                                    Sr. No.
                                  </td>
                                  <td
                                    style={{
                                      maxWidth: "30px",
                                      background: "whitesmoke",
                                    }}
                                  >
                                    Instrument Name
                                  </td>
                                  <td
                                    style={{
                                      minWidth: "30px",
                                      background: "whitesmoke",
                                    }}
                                  >
                                    Instrument ID/Serial No.
                                  </td>
                                </tr>
                              </thead>
                              <tbody>
                                {usedInstrument?.map((tests, index) => (
                                  <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{tests.equip_name}</td>
                                    <td>
                                      <select name="" id="">
                                        <option value="">
                                          -- Select instrument id/ serial no.--{" "}
                                        </option>
                                        <option
                                          value={tests.equip_code}
                                          selected
                                        >
                                          {tests.equip_code}
                                        </option>
                                      </select>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                          {!ShowApprovalSection && (
                            <div className="FlexSubmitFlex">
                              {(userRole != "Witness_PMC" && userRole != "Witness_Client" && userRole != "Witness_Surveillance" && userRole != "Witness_TPI") ?
                                <button type="button" className="DraftSaveBtn SubmitBtn" disabled={isSubmitting.current} onClick={(e) => handleSubmit(e, false)}>
                                  Draft Save
                                </button> : ''}
                              <button type="button" className="SubmitBtn" disabled={isSubmitting.current} onClick={(e) => handleSubmit(e, true)}>
                                Submit
                              </button>
                            </div>
                          )}
                        </>
                      )}

                      {ShowApprovalSection && (
                        <>
                          <div className="row text-center mt-4">
                            <p>Prepared By : </p>
                            <p>Prepared on: </p>
                            {ShowTestDate.current && (
                              <>
                                <p>Reviewed By: </p>
                                <p>Review Date: </p>
                              </>
                            )}

                            <div className="col-md-12 col-sm-12 col-xs-12">
                              <label className="custom-radio">
                                <input
                                  type="radio"
                                  className="Approveinput"
                                  name="pm_approver_status"
                                  id="btnaprv"
                                  onChange={() => handleStatusChange("A")}
                                />
                                <span className="radio-btn">
                                  <i className="fas fa-check"></i>Approve
                                </span>
                              </label>
                              <label className="custom-radio">
                                <input
                                  type="radio"
                                  className="Rejectinput"
                                  name="pm_approver_status"
                                  id="btnreject"
                                  onChange={() => handleStatusChange("R")}
                                />
                                <span className="radio-btn m-0">
                                  <i className="fas fa-times"></i>Reject
                                </span>
                              </label>
                            </div>
                            <div className="col-md-12 col-sm-12 col-xs-12">
                              <div className="form-group Remarksform-group">
                                <label htmlFor="">
                                  Remarks <b>*</b>
                                </label>
                                <input
                                  name="pm_remarks"
                                  className="form-control"
                                  type="text"
                                  placeholder="Enter Approval/Rejection Remarks...."
                                  autoComplete="off"
                                  onInput={(event) =>
                                    setApprovalFormData({
                                      ...approvalFormData,
                                      QCApproverejectremark: event.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                            {ShowTestDate.current && (
                              <div className="col-md-12 col-sm-12 col-xs-12">
                                <div className="form-group Remarksform-group">
                                  <label htmlFor="">
                                    Effective Date <b>*</b>
                                  </label>
                                  <input
                                    type="date"
                                    className="form-control"
                                    autoComplete="off"
                                    name="pm_testdate"
                                    min={new Date().toISOString().split("T")[0]}
                                    placeholder="Enter Effective Date...."
                                  />
                                </div>
                              </div>
                            )}
                            <div className="col-md-12 col-sm-12 col-xs-12">
                              <button
                                type="button"
                                className="ApprovalSubmitBtn"
                                onClick={handleApprovalSubmit}
                              >
                                Submit
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Example Modal"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h4 style={{ color: "black" }}>Select reason for NTC</h4>
              <button onClick={closeModal} style={{ background: 'transparent', border: 'none' }}>X</button>
            </div>
            <form className="ntc-reason-form mt-4">
              <label for="ntc_reason" className="mb-2">NTC reason</label>
              <select name="ntc_reason" className="form-control" onChange={(e) => setNtcValue(e.target.value)}>
                <option disabled selected>Select Reason</option>
                {ntcReasons && ntcReasons?.map((data) => {
                  return (
                    <option value={data?.valId}>{data?.NTCReasons}</option>
                  )
                })}
              </select>
              <div>
                <button type="button" onClick={closeModal} className="SubmitBtn mt-4">Submit</button>
              </div>
            </form>
          </Modal>
          <Footer />
        </div>
      </>
    </>
  );
};

export default BlastingDataEntry;