// src/components/Process-Sheet/MaterialTable.js
import React, { useState, useEffect } from "react";
import "./Coating.css";
import axios from "axios";
import Environment from "../../environment";
import { de } from "date-fns/locale";

const MaterialTable = ({
  lpeMaterialData,
  handleChange,
  addRowMaterial,
  removeRowMaterial,
  processType,
}) => {

  const [materials, setMaterials] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [grades, setGrades] = useState([]);

  useEffect(() => {
    const fetchDropdownValues = async () => {
      try {
        if (processType) {
          //const response = await axios.get(Environment.BaseAPIURL + `/api/User/GetProcSheetDD?ProcessType=${processType}`);
          let response = JSON.parse(localStorage.getItem("coatingmasterdata"));
          if (response) {
            const matManGrade = response.data.MatManGrade || [];
            const MatManufacture = response.data.MatManufacture || [];
            const MatGrade = response.data.MatGrade || [];
            setMaterials(matManGrade);
            setManufacturers(MatManufacture);
            setGrades(MatGrade);
          }
        }
      } catch (error) {
        console.error("Error fetching dropdown values:", error);
      }
    };
    fetchDropdownValues();
  }, [processType]);

  const handleMaterialChange = (e, index) => {
    handleChange(e, index);
  };

  return (
    <>
      <section className="MaterialtableSectionTable">
        <div className="formheadingline">
          <h2 style={{ color: "rgb(61, 126, 219)" }}>
            {processType} Coating Raw Material
            <hr style={{ borderTop: "2px solid rgb(61, 126, 219)" }} />
          </h2>
        </div>
        <div className="Materialtable">
          <table className="secondTable" border="1">
            <thead>
              <tr style={{ background: "#5a245a" }}>
                <th style={{ maxWidth: "50px" }}>S No.</th>
                <th style={{ minWidth: "90px" }}>Material</th>
                <th style={{ minWidth: "90px" }}>Manufacturer</th>
                <th style={{ minWidth: "90px" }}>Grade</th>
                <th style={{ maxWidth: "50px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {lpeMaterialData &&
                lpeMaterialData.map((material, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <select
                        id="process-raw-material"
                        name="material"
                        onChange={(e) => handleMaterialChange(e, index)}
                        value={
                          lpeMaterialData.length > 0 &&
                            materials.find(
                              (option) =>
                                option.Material_Id == lpeMaterialData[index].material
                            )
                            ? lpeMaterialData[index].material
                            : ""
                        }
                      >
                        <option selected disabled value="">--Select material--</option>
                        {materials &&
                          materials.map((materialOption, i) => (
                            <option key={i} value={materialOption.Material_Id}>
                              {materialOption.Material}
                            </option>
                          ))}
                      </select>
                    </td>
                    <td>
                      <select
                        name="manufacturer"
                        id="process-manufacturer"
                        value={material.manufacturer}
                        onChange={(e) => handleChange(e, index)}
                      >
                        <option selected disabled value="">--Select manufacturer--</option>
                        {/* {manufacturers.map((manufacturerOption, i) => (
                        <option key={i} value={manufacturerOption}> {manufacturerOption} </option>
                      ))} */}
                        {manufacturers &&
                          manufacturers
                            .filter(
                              (item) => item.Material_Id == material.material
                            )
                            .map((filteredItem, i) => (
                              <option
                                key={i}
                                value={filteredItem.Manfacturer_Id}
                              >
                                {filteredItem.Manfacturer}
                              </option>
                            ))}
                      </select>
                    </td>
                    <td>
                      <select
                        name="matgrade"
                        id="process-grades"
                        value={material.matgrade}
                        onChange={(e) => handleChange(e, index)}
                      >
                        <option>Select grade</option>
                        {/* {grades.map((gradeOption, i) => (
                        <option key={i} value={gradeOption}> {gradeOption} </option>
                      ))} */}
                        {grades &&
                          grades
                            .filter(
                              (item) => item.Material_Id == material.material && item.Manfacturer_Id == material.manufacturer
                            )
                            .map((filteredItem, i) => (
                              <option key={i} value={filteredItem.Grade_Id}>
                                {filteredItem.Grade}
                              </option>
                            ))}
                      </select>
                    </td>
                    <td>
                      {index > 0 && (
                        <i
                          className="fas fa-trash-alt removeButton"
                          onClick={() => removeRowMaterial(index)}
                          disabled={lpeMaterialData.length === 1}
                        ></i>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div style={{ width: "100%", textAlign: "right", marginTop: "20px" }}>
            <div onClick={addRowMaterial} className="AddnewBtn">
              <i className="fas fa-plus"></i> Add
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default MaterialTable;
