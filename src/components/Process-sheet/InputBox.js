import React, { useState, useEffect, useRef } from "react";
import "./Coating.css";
import axios from "axios";
import Select from "react-select";
import Environment from "../../environment";
import { json } from "react-router-dom";

const InputBox = ({
  formData,
  handleChange,
  ddlmastersval,
  isClientNameField,
  isProcessSheetCopy,
  poMessage
}) => {
  const handleProcessTypeChange = (value) => {
    handleChange({ target: { name: "processType", value: value } });
    if (value === "External") fetchDropdownValues("External");
    else fetchDropdownValues("Internal");
    generateQapNo();
  };

  const handleShiftTypeChange = (value) => {
    handleChange({ target: { name: "shiftType", value: value } });
  };

  const [coatingType, setCoatingType] = useState([]);
  const [clients, setClients] = useState([]);
  const [pipeOD, setPipeOD] = useState([]);
  const [pipeWT, setPipeWT] = useState([]);
  const [selectedOption, setSelectedOption] = useState();
  const [qapNo, setQapNo] = useState(formData.qapNo);

  let { LOIPOFOA } = formData;

  let [inputBoxTempObj, setInputBoxTempObj] = useState({
    LOIPOFOA: LOIPOFOA,
    qapNo: qapNo,
  });

  let [triggeredEvent, setTriggeredEvent] = useState({});

  let handleInput = (e) => {
    const { name, value } = e.target;
    setInputBoxTempObj((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
    console.log(inputBoxTempObj, formData, "inputBoxTempObj")
    setTriggeredEvent(e);
  };

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Your effect logic here
    setInputBoxTempObj((prevValues) => ({
      ...prevValues,
      LOIPOFOA: poMessage,
    }));
    setTriggeredEvent({ target: { name: 'LOIPOFOA', value: poMessage } });
    console.log(poMessage, inputBoxTempObj, formData, "inputBoxTempObj");
  }, [poMessage]);  // Dependency array ensures the effect runs when poMessage changes

  useEffect(() => {
    if (triggeredEvent?.target) {
      const timer = setTimeout(() => {
        handleChange(triggeredEvent);
      }, 1000);
      return () => clearTimeout(timer);
    }
    console.log()
  }, [triggeredEvent]);

  useEffect(() => generateQapNo());
  useEffect(() => {
    fetchDropdownValues();
  }, [ddlmastersval]);

  const generateQapNo = () => {
    if (formData.processType === "External") setQapNo("TSL/COAT/EXT/");
    else if (formData.processType === "Internal") setQapNo("TSL/COAT/INT/");
    else setQapNo("");
  };

  const fetchDropdownValues = async (processType) => {
    try {
      //const response = await axios.get(Environment.BaseAPIURL + `/api/User/GetProcSheetDD?ProcessType=${processType}`);
      let response = ddlmastersval; //JSON.parse(localStorage.getItem("coatingmasterdata"));
      if (response?.data) {
        console.log(ddlmastersval)
        const fetchedOptions = formData.clientName
        const clients = ddlmastersval.data.Clients.map(clientOption => ({
          value: clientOption.ClientID,
          label: clientOption.ClientName,
        }));
        console.log(clients)
        const defaultOption = clients.find(option => option.value == fetchedOptions);
        setSelectedOption(defaultOption);
        console.log(clients, fetchedOptions, defaultOption)
        // localStorage.setItem("ClientDDL", JSON.stringify(response.data.Clients));
        setCoatingType(response.data.CoatingType);
        setPipeOD(response.data.PipeOD);
        setPipeWT(response.data.PipeWT);
        setClients(response.data.Clients);
        console.log(formData)
      }
    } catch (error) {
      console.error("Error fetching dropdown values:", error);
    }
  };

  const handleClientChange = (selectedOption) => {
    const clientID = selectedOption ? selectedOption.value : null;
    setSelectedOption(selectedOption)
    handleChange({ target: { name: "clientName", value: selectedOption?.value } });
    console.log(selectedOption)
  };

  return (
    <>
      <div className="split-container">
        <div className="form-group1">
          <label htmlFor="">Process Type</label>
          <div className="ProcessTypeFlex">
            <div className="ProcessTypeBox">
              <input
                name="processType"
                id="processType"
                type="radio"
                value="External"
                checked={formData.processType === "External"}
                onChange={() => handleProcessTypeChange("External")}
              />
              <label htmlFor="ExternalRadio">External</label>
            </div>
            <div className="ProcessTypeBox">
              <input
                name="processType"
                id="processType"
                type="radio"
                value="Internal"
                checked={formData.processType === "Internal"}
                onChange={() => handleProcessTypeChange("Internal")}
              />
              <label htmlFor="InternalRadio">Internal</label>
            </div>
          </div>
          {/* {formData.processType && (
            <span className="err">Please select</span>
          )} */}
        </div>
        <div className="form-group">
          <label htmlFor="">Coating Type</label>
          <select
            name="coatingType"
            id="coating-type"
            value={formData.coatingType}
            onChange={handleChange}
          >
            <option>Select type</option>
            {coatingType?.map((coatingTypeOption, i) => (
              <option key={i} value={coatingTypeOption.CoatingType_Id}>
                {coatingTypeOption.CoatingType}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="">Date</label>
          <input
            type="date"
            name="date"
            // value={new Date().toISOString().split("T")[0]}/**formData?.date?.split("T")[0] Changed by Nitin on 14-May-2024 */
            value={!isProcessSheetCopy ? formData.date : new Date().toISOString().split("T")[0]}
            onChange={handleChange}
            max={new Date().toISOString().split("T")[0]}
          />
        </div>
        <div className="form-group">
          <label htmlFor="">Process Sheet No.</label>
          <input
            type="text"
            name="processSheetNo"
            value={formData.processSheetNo}
            onChange={handleChange}
            readOnly
          />
        </div>

        <div className="form-group2">
          <label htmlFor="">Client Name</label>
          <Select
            className="select"
            id="process-client-name"
            value={selectedOption}
            onChange={handleClientChange}
            options={clients.map((clientOption) => ({
              value: clientOption.ClientID,
              label: clientOption.ClientName,
            }))}
            isSearchable
            isClearable
            isMulti={false}
            placeholder="Search or Select client..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="pipeSize">Pipe Size</label>
          <div className="PipeSizeselectinputBox">
            <label>OD</label>
            <select
              id="pipe-OD"
              name="pipeOD"
              value={formData.pipeOD}
              onChange={handleChange}
            >
              <option>Select</option>
              {pipeOD.map((pipeODOption, i) => (
                <option key={i} value={pipeODOption.PipeOD_Id}>
                  {pipeODOption.PipeOD}
                </option>
              ))}
            </select>
            <span style={{ marginRight: "0" }}>mm</span>
            <span>X</span>
            <label>WT</label>
            <select
              name="pipeWT"
              id="pipe-WD"
              value={formData.pipeWT}
              onChange={handleChange}
            >
              <option>Select</option>
              {pipeWT.map((pipeWTOption, i) => (
                <option key={i} value={pipeWTOption.PipeWT_Id}>
                  {pipeWTOption.PipeWT}
                </option>
              ))}
            </select>
            <span style={{ marginRight: "0" }}>mm</span>
          </div>
        </div>
        <div className="form-group radioBtn">
          <div className="radioBtnBox">
            <label htmlFor="LOI">LOI No.</label>
            <input
              type="radio"
              name="type"
              value="LOI"
              checked={formData.type === "LOI"}
              onChange={handleChange}
            />
          </div>
          <div className="radioBtnBox">
            <label htmlFor="PO">PO No.</label>
            <input
              type="radio"
              name="type"
              value="PO"
              checked={formData.type === "PO"}
              onChange={handleChange}
            />
          </div>
          <div className="radioBtnBox">
            <label htmlFor="FOA">FOA No.</label>
            <input
              type="radio"
              name="type"
              value="FOA"
              checked={formData.type === "FOA"}
              onChange={handleChange}
            />
          </div>
          <div className="radioBtnBox">{/**Added by Nitin on May 14, 2024 */}
            <label htmlFor="LOA">LOA No.</label>
            <input
              type="radio"
              name="type"
              value="LOA"
              checked={formData.type === "LOA"}
              onChange={handleChange}
            />
          </div>
          {formData.type && (
            <input
              type="text"
              name="LOIPOFOA"
              id="loa-foa-id"
              value={inputBoxTempObj.LOIPOFOA}
              // onInput={handleInput}
              placeholder={`${formData.type} no.`}
            />
          )}
        </div>
        <div className="form-group1">
          <label htmlFor="">Shift Type</label>
          <div className="ProcessTypeFlex">
            <div className="ProcessTypeBox">
              <input
                name="shiftType"
                id="shift-type"
                type="radio"
                value="1"
                checked={formData.shiftType == "1"}
                onChange={() => handleShiftTypeChange("1")}
              />
              <label htmlFor="ExternalRadio">A/B/C</label>
            </div>
            <div className="ProcessTypeBox">
              <input
                name="shiftType"
                type="radio"
                value="2"
                checked={formData.shiftType == "2"}
                onChange={() => handleShiftTypeChange("2")}
              />
              <label htmlFor="InternalRadio">Day/Night</label>
            </div>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="">QAP No.</label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "end",
            }}
          >
            {qapNo}
            <input
              style={{ marginLeft: "8px" }}
              type="text"
              name="qapNo"
              id="qap-no"
              value={inputBoxTempObj.qapNo}
              onInput={handleInput}
            />
          </div>
        </div>
      </div>
    </>
  );
};

InputBox.defaultProps = {
  isClientNameField: true,
};

export default InputBox;
