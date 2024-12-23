// src/components/Process-Sheet/ClientTable.js
import React, { useState, useEffect } from "react";
import "./Coating.css";

const ClientTable = ({ formData, handleChange, updateClientTableData, isProcessSheetCopy, sendMessageToParent }) => {
  let { techSpec, projName, clientData, pqtNotes } = formData;
  const [isChange, setIsChange] = useState(isProcessSheetCopy)
  const [isChange5, setIsChange5] = useState(isProcessSheetCopy)
  const [isChange1, setIsChange1] = useState(isProcessSheetCopy)
  const [isChange2, setIsChange2] = useState(isProcessSheetCopy)
  const [isChange3, setIsChange3] = useState(isProcessSheetCopy)
  const [isChange4, setIsChange4] = useState(isProcessSheetCopy)

  let [clientTempObj, setClientTempObj] = useState({
    techSpec: techSpec,
    projName: projName,
    clientData: clientData,
    pqtNotes: pqtNotes,
  });

  let [triggeredEvent, setTriggeredEvent] = useState({});
  const [ponoSet, setPonoSet] = useState(new Set());

  // let handleInput = (e) => {
  //   let { name, value } = e.target;
  //   setClientTempObj((prevValues) => ({
  //     ...prevValues,
  //     [name]: value,
  //   }));
  //   setTriggeredEvent(e);
  // };
  let handleInput = (e, index, fieldName) => {
    if (fieldName == "destination") {
      setIsChange(false)
    }
    else if (fieldName == "pono") {
      setIsChange5(false)
    }
    else if (fieldName == "salesOrderNo") {
      setIsChange1(false)
    }
    else if (fieldName == "itemNo") {
      setIsChange2(false)
    }
    else if (fieldName == "poItemNo") {
      setIsChange3(false)
    }
    else if (fieldName == "poQty") {
      setIsChange4(false)
    }
    console.log(e.target.value, isProcessSheetCopy)
    const { name, value } = e.target;
    const updatedClientData = [...clientTempObj.clientData];
    updatedClientData[index] = {
      ...updatedClientData[index],
      [fieldName]: value,
    };
    setClientTempObj((prevValues) => ({
      ...prevValues,
      clientData: updatedClientData,
      [name]: value,
    }));
    if (fieldName == "pono") {
      const updatedPonoValues = updatedClientData
        .map((row) => row.pono) // Get all 'pono' values
        .filter((pono) => pono) // Filter out empty or null 'pono' values
      sendMessageToParent(updatedPonoValues);
    }
    setTriggeredEvent(e);
    console.log(isProcessSheetCopy)
  };

  useEffect(() => {
    if (isProcessSheetCopy) {
      clientTempObj.clientData = [{
        destination: "",
        salesOrderNo: "",
        itemNo: "",
        poItemNo: "",
        poQty: "",
        pono: ""
      }];
      console.log(clientTempObj, "log", 83)
    }
  }, [])

  useEffect(() => {
    if (triggeredEvent?.target) {
      const timer = setTimeout(() => {
        handleChange(triggeredEvent);
        updateClientTableData(clientTempObj.clientData);
        console.log(clientTempObj, "clientTempObj")
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [triggeredEvent]);

  const addRowClient = () => {
    const newClientData = {
      destination: "",
      salesOrderNo: "",
      itemNo: "",
      poItemNo: "",
      poQty: "",
      pono: ""
    };

    setClientTempObj((prevData) => ({
      ...prevData,
      clientData: [...prevData.clientData, newClientData],
    }));
  };

  const removeRowClient = (index) => {
    if (clientTempObj.clientData.length > 1) {
      const updatedClientData = clientTempObj.clientData.filter(
        (_, i) => i !== index
      );

      setClientTempObj((prevData) => ({
        ...prevData,
        clientData: updatedClientData,
      }));
      updateClientTableData(updatedClientData);
    }
  };

  return (
    <section className="ClientPageSection">
      <div className="firsttableContainer" id="custom-scroll">
        <div className="firsttable" id="custom-scroll">
          <table>
            <thead>
              <tr
                style={{
                  background: "#5A245A",
                  position: "sticky",
                  top: "0",
                }}
              >
                <th style={{ minWidth: "60px" }}>S No.</th>
                <th style={{ minWidth: "120px" }}>Destination</th>
                <th style={{ minWidth: "160px" }}>Sales Order No.</th>
                <th style={{ minWidth: "100px" }}>SO Line Item No.</th>
                <th style={{ minWidth: "160px" }}>PO No.</th>
                {/**Updated by Nitin on May 14, 2024 */}
                <th style={{ minWidth: "130px" }}>PO Item No. </th>
                <th style={{ minWidth: "80px" }}>PO QTY MTR.</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {clientTempObj?.clientData &&
                clientTempObj?.clientData.map((client, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <input
                        type="text"
                        name="destination"
                        id="process-destination"
                        value={isChange ? '' : client.destination}
                        onChange={(e) => handleInput(e, index, "destination")}
                        placeholder="Enter destination"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="salesOrderNo"
                        id="process-salesno"
                        value={isChange1 ? "" : client.salesOrderNo}
                        onChange={(e) => handleInput(e, index, "salesOrderNo")}
                        placeholder="Enter sales order no."
                        onInput={(e) => {
                          e.target.value = e.target.value.replace(/\D/g, "");
                        }}
                        maxLength="10"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="itemNo"
                        id="process-itemno"
                        value={isChange2 ? "" : client.itemNo}
                        onChange={(e) => handleInput(e, index, "itemNo")}
                        placeholder="Enter item no."
                        onInput={(e) => {
                          e.target.value = e.target.value.replace(/\D/g, "").slice(0, 2);
                        }}
                        maxLength="10"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="multiplePo"
                        id="multiple-po"
                        value={isChange5 ? "" : client.pono}
                        onChange={(e) => handleInput(e, index, "pono")}
                        placeholder="Enter PO no."
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="poItemNo"
                        id="process-poitem"
                        value={isChange3 ? "" : client.poItemNo}
                        onChange={(e) => handleInput(e, index, "poItemNo")}
                        placeholder="Enter PO item no."
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="poQty"
                        id="process-poqty"
                        value={isChange4 ? "" : client.poQty}
                        onChange={(e) => handleInput(e, index, "poQty")}
                        placeholder="Enter PO qty"
                        onInput={(e) => {
                          e.target.value = e.target.value.replace(/\D/g, "");
                        }}
                        maxLength="10"
                      />
                    </td>
                    <td>
                      {index > 0 && (
                        <div
                          onClick={() => removeRowClient(index)}
                          disabled={formData.clientData.length === 1}
                          className="button-container"
                        >
                          <i className="fas fa-trash-alt removeButton"></i>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div style={{ width: "100%", textAlign: "right", marginTop: "20px" }}>
            <div onClick={addRowClient} className="AddnewBtn">
              <i className="fas fa-plus"></i> Add
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="form-group" style={{ display: "block" }}>
          <label htmlFor="" style={{ marginBottom: "10px", marginRight: "10px" }}>
            {" "}
            Field Number
          </label>
          <select
            name="FieldNumber"
            id="FieldNumber"
            style={{ width: "15%" }}
            onChange={handleChange}
            value={formData.fieldNumber}
          >
            <option value="0">-- SFN --</option>
            <option value="1">A</option>
            <option value="2">B</option>
            <option value="3">C</option>
            <option value="4">D</option>
          </select>
        </div>
      </div>

      <div className="textarea">
        <div className="form-group">
          <label htmlFor="">Technical Specification</label>
          <textarea
            type="text"
            id="technical-spec"
            name="techSpec"
            value={clientTempObj.techSpec}
            onChange={handleInput}
            placeholder="Enter technical specification"
          />
        </div>
        <div className="form-group">
          <label htmlFor="">Project Name</label>
          <textarea
            type="text"
            name="projName"
            id="project-name"
            value={clientTempObj.projName}
            onChange={handleInput}
            placeholder="Enter project name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="">PQT Notes</label>
          <textarea
            type="text"
            name="pqtNotes"
            id="pqt-notes"
            value={clientTempObj.pqtNotes}
            onChange={handleInput}
            placeholder="Enter PQT Notes"
          />
        </div>
      </div>
    </section>
  );
};

export default ClientTable;
