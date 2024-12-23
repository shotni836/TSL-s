import React from 'react'
import { Route, Routes, BrowserRouter } from "react-router-dom";
import './App.css';

// LOGIN 
import Login from './components/Login/Login';
import ForgotPassword from './components/Login/Forgot-password';
import UpdatePassword from './components/Login/Update-password';

// MODULE 
import Module from './components/Module/Module';

// DASHBOARD 
import Dashboard from './components/Dashboard/Dashboard';
import Hrdashboard from './components/Hr-dashboard/Hrdashboard';
import Ppcdashboard from './components/Ppc-dashboard/Ppcdashboard';
import Productiondashboard from './components/Production-dashboard/Productiondashboard';

// REGISTER EMPLOYEE 
import Registeremployee from './components/Register-employee/Registeremployee';
import Completeregister from './components/Complete-register-form/Completeregister';
import Employeelist from './components/Employee-list/Employeelist';
import Role from './components/Role/Role';

// PROFILE 
import Profile from './components/Profile/Profile';
import UpdateProfile from './components/Update-profile-request/Update-profile-request';

// TALLY TAG MAPPING 
import Tallytagmapping from './components/Tally-tag-mapping/Tallytagmapping';
import Tallytagmappinglist from './components/Tally-tag-mapping/Tallytagmappinglist';
import Viewtallytagmapping from './components/Tally-tag-mapping/Viewtallytagmapping';
import Edittallytagmapping from './components/Tally-tag-mapping/Edittallytagmapping'

// PROCESS SHEET 
import Blasting from './components/Blasting/Blasting';
import Processsheet from './components/Process-sheet/Coating';
import ProcessSheetview from './components/Process-sheet-view/ProcessSheetview';
import Addstation from './components/Process-sheet/AddStation';
import Processsheetlist from './components/Process-sheet-list/ProcessSheetlist';

// BLASTING DATA ENTRY
import BlastingDataEntry from './components/Blasting-Process-sheet/BlastingDataEntry';
import BlastingSheetlist from './components/Blasting-process-list/BlastingSheetlist';

// Inlet , Blasting , Application , Thickness , External Final
import InletReport from './components/Reports/Pipe-release-mtc/Bare-pipe-insp/Bare-pipe-insp';
import PhosBlastInsp from './components/Reports/Pipe-release-mtc/Phosp-blast-insp/Phos-blast-insp';
import ChromCoatInsp from './components/Reports/Pipe-release-mtc/Chromate-coat-insp/Chromate-coat-insp';
import ThicknessInsp from './components/Reports/Pipe-release-mtc/Thickness-insp/Thickness-insp';
import FinalInsp from './components/Reports/Pipe-release-mtc/Final-inspection/Final-insp';

import RoghnessGauge from './components/Reports/Pipe-release-mtc/Roughness-gauge/Roughness-gauge';
import ThicknessGauge from './components/Reports/Pipe-release-mtc/Thickness-gauge/Thickness-gauge';

// SAMPLE REPORT 
import Sampleonereport from './components/Common/Sample-onereport/Sampleonereport';

// REPORT 
import Reportlist from './components/Reportlist/Reportlist';
import Epoxyreport from './components/Reportlist/Epoxyreport';

import Formatlistview from './components/Format-List/Formatlistview';
import Formatlistedit from './components/Format-List/Formatlistedit';

// TESTING 
import Testing from './components/Testing/Testing';

// External Origin 
import Externalorigin from './components/External-origin/Externalorigin';
import Externaloriginlist from './components/External-origin/Externaloriginlist';
import Externaloriginview from './components/External-origin/Externaloriginview';
import Externaloriginedit from './components/External-origin/Externaloriginedit';

// Work Instruction 
import Workinstruction from './components/Work-Instruction/Workinstruction';
import Workinstructionlist from './components/Work-Instruction/Workinstructionlist';
import Workinstructionview from './components/Work-Instruction/Workinstructionview';

// ASSIGN TEST ON PIPE
import AssignLabFieldTestList from './components/AssignLabFieldTest/AssignLabFieldList';
import AssignLabFieldTest from './components/AssignLabFieldTest/AssignLabFieldTest';

// DPR
import Dailyproductionreport from './components/Daily-production-report/Dailyproductionreport';
import Dailyproductionreportlist from './components/Daily-production-report/Dailyproductionreportlist';
import Dailyproductionreportview from './components/Daily-production-report/Dailyproductionreportview';

// RAW MATERIAL 
import Inspectiontesting from './components/Inspectiontesting/Inspectiontesting'
import RawMaterialInwardList from './components/Raw-material-list/Raw-material-inward';
import Rawmaterialinspection from './components/Raw-material-inspection/Rawmaterialinspection';
import RawmaterialList from './components/Raw-material-list/Rawmateriallist';
import InhouseTesting from './components/Raw-material/InhouseTesting';
import BeforeProcessLabTesting from './components/Raw-material/BeforeProcessLabTesting';
import LabTesting from './components/Raw-material/LabTesting';
import FieldTesting from './components/Raw-material/FieldTesting';
import Rawmaterial from './components/Raw-material/Rawmaterial';

// Raw-Material-Inspection Report
import InspectionReport from './components/Reports/Raw-material-inspection/Inspection-report';
// Raw-Material-In-House-Testing
import InHouseTestReport from './components/Reports/Raw-material-in-house-test/In-house-report';
// Before-Process-LAB-Testing
import BeforeProcessLabTestReport from './components/Reports/Before-process-lab-test/Before-process-lab-test';
// Calibration
import CalibrationBlasting from './components/Reports/Calibration-reports/CalibrationBlasting';
import CalibrationBlastingReport from './components/Reports/Calibration-reports/CalibrationBlastingReport';
// CD-Test
import CdTest from './components/Reports/Cd-test/Cd-test';
import PorosityTest from './components/Reports/Cd-test/Porosity-test';
import IndentationTest from './components/Reports/Cd-test/Indentation';
// Field-test
import FieldTest from './components/Reports/Field-test/Field-test';
import PeelTest from './components/Reports/Field-test/Peel-test';
import TrialTest from './components/Reports/Field-test/Trial-test';
// Repair 
import Repair from './components/Reports/Repair/Repair';
import RepairList from './components/Reports/Repair/RepairList';
import RepairReport from './components/Reports/Repair/RepairReport';

// NC report 
import Nc from './components/Reports/NC-report/Nc';
import NcList from './components/Reports/NC-report/NcList';
import NcReport from './components/Reports/NC-report/NcReport';

// MTC 
import QA from './components/Mtc/QA';
import PackingList from './components/Mtc/Packing-list';
import Packing from './components/Mtc/Packing';
import MtcList from './components/Mtc/Mtc-list';
import MtcReport from './components/Reports/Pipe-release-mtc/Mtc/MtcReport';
import Pqt from './components/Reports/Pipe-release-mtc/Pqt/Pqt';
import Mtc from './components/Reports/Pipe-release-mtc/Mtc/Mtc';

import Packingreport from './components/Reports/Pipe-release-mtc/Mtc/PackingReport';
import PeelTestReports from './components/Reports/Pipe-release-mtc/Mtc/PeelTestReport';
import ImpactTestReports from './components/Reports/Pipe-release-mtc/Mtc/ImpactTestReports';

// DUST REPORT
import Dustlevel from './components/Reports/Pipe-release-mtc/Dust-level/Dustlevel';
import Dustlevelview from './components/Reports/Pipe-release-mtc/Dust-level/Dustlevelview';
import DustList from './components/Reports/Pipe-release-mtc/Dust-level/Dustlist';

// Blasting Line
import AddBlastingline from './components/Blasting-line/AddBlastingline';
import ListBlastingline from './components/Blasting-line/ListBlastingline';
import ViewBlastingline from './components/Blasting-line/ViewBlastingline';

// Coating Application Line
import Addcoatingapplicationline from './components/Coatingapplication-line/Addcoatingapplicationline';
import Listcoatingapplicationline from './components/Coatingapplication-line/Listcoatingapplicationline';
import Viewcoatingapplicationline from './components/Coatingapplication-line/Viewcoatingapplicationline';

// Calibration 
import Calibration from './components/Calibration/Calibration';
import Calibrationlist from './components/Calibration/Calibrationlist';
import Calibrationedit from './components/Calibration/Calibrationedit';
import Calibrationview from './components/Calibration/Calibrationview';

// PIPE DETAILS
import Pipe from './components/Pipe-details/Pipe-details';

// Format List 
import Formatlist from './components/Format-List/Formatlist';
import Formatlistlist from './components/Format-List/Formatlistlist';

import List from './components/Reports/List';

import MiscList from './components/Reports/Misclist';
import HolidayCallib from './components/Reports/Pipe-release-mtc/Holiday-callibration/Holiday-calibration';
// import NcReport from './components/Reports/Pipe-release-mtc/Nc-report/Nc-report';

import Masters from './components/Masters/Masters';
import Masterslist from './components/Masters/Masterslist';

import BlastingDataEntryInlet from './components/Blasting-Process-sheet/BlastingDataEntryInlet';
import BlastingDataEntryBlasting from './components/Blasting-Process-sheet/BlastingDataEntryBlasting';

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>

          {/* LOGIN */}
          <Route path="/" element={<Login />} ></Route>
          <Route path="/forgotPassword" element={<ForgotPassword />} ></Route>
          <Route path="/updatePassword" element={<UpdatePassword />} ></Route>

          {/* MODULE */}
          <Route path="/module" element={<Module />} ></Route>

          {/* DASHBOARD */}
          <Route path="/dashboard" element={<Dashboard />} ></Route>
          <Route path="/hrdashboard" element={<Hrdashboard />} ></Route>
          <Route path="/ppcdashboard" element={<Ppcdashboard />} ></Route>
          <Route path="/productiondashboard" element={<Productiondashboard />} ></Route>

          {/* PROFILE */}
          <Route path="/registeremployee" element={<Registeremployee />} ></Route>
          <Route path="/completeregister" element={<Completeregister />} ></Route>
          <Route path="/profile" element={<Profile />} ></Route>
          <Route path="/updateProfile" element={<UpdateProfile />} ></Route>
          <Route path="/employeelist" element={<Employeelist />} ></Route>
          <Route path="/role" element={<Role />} ></Route>

          {/* TALLY TAG MAPPING */}
          <Route path="/tallytagmapping" element={<Tallytagmapping />} ></Route>
          <Route path="/tallytagmappinglist" element={<Tallytagmappinglist />} ></Route>
          <Route path="/viewtallytagmapping" element={<Viewtallytagmapping />} ></Route>
          <Route path="/edittallytagmapping" element={<Edittallytagmapping />}></Route>

          {/* PROCESS SHEET */}
          <Route path="/coating" element={<Processsheet />} ></Route>
          <Route path="/addstation" element={<Addstation />} ></Route>
          <Route path="/processsheetlist" element={<Processsheetlist />} ></Route>
          <Route path="/processsheetview" element={<ProcessSheetview />} ></Route>

          {/* DPR */}
          <Route path="/dailyproductionreport" element={<Dailyproductionreport />} ></Route>
          <Route path="/dailyproductionreportview" element={<Dailyproductionreportview />} ></Route>
          <Route path="/dailyproductionreportlist" element={<Dailyproductionreportlist />} ></Route>

          {/* Assign Test On Pipes */}
          <Route path="/assignfieldlabtest" element={<AssignLabFieldTest />} ></Route>
          <Route path="/assignfieldlabtestlist" element={<AssignLabFieldTestList />} ></Route>

          {/* Testing */}
          <Route path="/inspectiontesting" element={<Inspectiontesting />} ></Route>
          <Route path="/rawmaterialinwardlist" element={<RawMaterialInwardList />} ></Route>
          <Route path="/rawmateriallist" element={<RawmaterialList />} ></Route>
          <Route path="/rawmaterialinspection" element={<Rawmaterialinspection />} ></Route>
          <Route path="/inhousetest" element={<InhouseTesting />} ></Route>
          <Route path="/beforeprocesslabtest" element={<BeforeProcessLabTesting />} ></Route>
          <Route path="/labtest" element={<LabTesting />} ></Route>
          <Route path="/fieldtest" element={<FieldTesting />} ></Route>
          <Route path="/rawmaterial" element={<Rawmaterial />} ></Route>

          {/* Blasting Data Entry */}
          <Route path="/blastingsheetlist" element={<BlastingSheetlist />} ></Route>
          <Route path="/blastingprocesssheet" element={<BlastingDataEntry />} ></Route>

          {/* Inlet , Blasting , Application , Thickness , External Final */}
          <Route path="/chromate-coat-insp/:tstmaterialid" element={<ChromCoatInsp />} ></Route>
          <Route path="/calibration-blasting-report" element={<CalibrationBlasting />} ></Route>
          <Route path="/bare-pipe-inspection/:tstmaterialid" element={<InletReport />} ></Route>
          <Route path="/phos-blast-insp/:tstmaterialid" element={<PhosBlastInsp />} ></Route>
          <Route path="/thickness-insp/:tstmaterialid" element={<ThicknessInsp />} ></Route>
          <Route path="/final-inspection/:tstmaterialid" element={<FinalInsp />} ></Route>
          <Route path="/calibration-blasting-report-view/:tstmaterialid" element={<CalibrationBlastingReport />} ></Route>

          {/* Dust Level */}
          <Route path="/dustlevel/:tstmaterialid" element={<Dustlevel />} ></Route>
          <Route path="/dustlevelview/:tstmaterialid" element={<Dustlevelview />} ></Route>
          <Route path="/dustlist" element={<DustList />} ></Route>

          {/* Repair */}
          <Route path="/repair-add" element={<Repair />} ></Route>
          <Route path="/repair-list" element={<RepairList />} ></Route>
          <Route path="/repair-report/:tstmaterialid" element={<RepairReport />} ></Route>

          {/* Repair */}
          <Route path="/nc-add" element={<Nc />} ></Route>
          <Route path="/nc-list" element={<NcList />} ></Route>
          <Route path="/nc-report" element={<NcReport />} ></Route>

          <Route path="/pqt" element={<Pqt />} ></Route>
          <Route path="/mtc" element={<Mtc />} ></Route>
          <Route path="/peel-test-report/:tstmaterialid" element={<PeelTestReports />} ></Route>
          <Route path="/impact-test-report/:tstmaterialid" element={<ImpactTestReports />} ></Route>

          {/* BLASTING LINE */}
          <Route path="/addblastingline" element={<AddBlastingline />} ></Route>
          <Route path="/listblastingline" element={<ListBlastingline />} ></Route>
          <Route path="/viewblastingline" element={<ViewBlastingline />} ></Route>

          {/* COATING APPLICATION LINE */}
          <Route path="/addcoatingapplicationline" element={<Addcoatingapplicationline />} ></Route>
          <Route path="/listcoatingapplicationline" element={<Listcoatingapplicationline />} ></Route>
          <Route path="/viewcoatingapplicationline" element={<Viewcoatingapplicationline />} ></Route>

          <Route path="/pipe-details" element={<Pipe />} ></Route>

          <Route path='/list/miseleaneous-test' element={<MiscList />}></Route>

          {/* SAMPLE REPORT */}
          <Route path="/Sampleonereport" element={<Sampleonereport />} ></Route>

          {/* REPORT */}
          <Route path="/reportlist" element={<Reportlist />} ></Route>
          <Route path="/epoxyreport" element={<Epoxyreport />} ></Route>

          {/* External Origin */}
          <Route path="/externalorigin" element={<Externalorigin />} ></Route>
          <Route path="/externaloriginlist" element={<Externaloriginlist />} ></Route>
          <Route path="/externaloriginview" element={<Externaloriginview />} ></Route>
          <Route path="/externaloriginedit" element={<Externaloriginedit />} ></Route>

          {/* Work Instruction */}
          <Route path="/Workinstruction" element={<Workinstruction />} ></Route>
          <Route path="/Workinstructionlist" element={<Workinstructionlist />} ></Route>
          <Route path="/Workinstructionview" element={<Workinstructionview />} ></Route>

          {/*Calibration */}
          <Route path="/Calibration" element={<Calibration />} ></Route>
          <Route path="/Calibrationlist" element={<Calibrationlist />} ></Route>
          <Route path="/Calibrationedit" element={<Calibrationedit />} ></Route>
          <Route path="/Calibrationview" element={<Calibrationview />} ></Route>

          {/* Format List */}
          <Route path="/Formatlist" element={<Formatlist />} ></Route>
          <Route path="/Formatlistlist" element={<Formatlistlist />} ></Route>
          <Route path="/formatlistview" element={<Formatlistview />} ></Route>
          <Route path="/Formatlistedit" element={<Formatlistedit />} ></Route>

          {/* Indentation Report */}
          <Route path="/indentation-test/:tstmaterialid" element={<IndentationTest />} ></Route>

          <Route path='/list/:routePrefix/:tstmaterialid' element={<List />}></Route>
          {/* Raw Material Inspection */}
          <Route path="/inspection-test/:tstmaterialid" element={<InspectionReport />} ></Route>

          {/* Raw Material In House Testing */}
          <Route path="/in-house-test/:tstmaterialid" element={<InHouseTestReport />} ></Route>

          {/* Before-Process-LAB-Testing */}
          <Route path="/before-process-lab-test/:tstmaterialid" element={<BeforeProcessLabTestReport />} ></Route>

          {/* TESTING */}
          <Route path="/testing" element={<Testing />} ></Route>

          {/* CD-Test */}
          <Route path="/cd-test/:tstmaterialid" element={<CdTest />} ></Route>
          <Route path="/porosity-test/:tstmaterialid" element={<PorosityTest />} ></Route>

          {/* Field-test */}
          <Route path="/field-test/:tstmaterialid" element={<FieldTest />} ></Route>
          <Route path="/trial-test/:tstmaterialid" element={<TrialTest />} ></Route>
          <Route path="/peel-test/:tstmaterialid" element={<PeelTest />} ></Route>

          {/* Mtc routes */}
          <Route path="/qa" element={<QA />} ></Route>
          <Route path="/packinglist" element={<PackingList />} ></Route>
          <Route path="/packing" element={<Packing />} ></Route>
          <Route path="/mtclist" element={<MtcList />} ></Route>
          <Route path="/packingreport" element={<Packingreport />} ></Route>
          <Route path="/mtcreport" element={<MtcReport />} ></Route>

          <Route path="/holiday-calib/:tstmaterialid" element={<HolidayCallib />} ></Route>
          <Route path="/pipe-release-mtc-test/:tstmaterialid" element={<ChromCoatInsp />} ></Route>
          <Route path="/thickness-gauge/:tstmaterialid" element={<ThicknessGauge />} ></Route>
          <Route path="/rough-gauge/:tstmaterialid" element={<RoghnessGauge />} ></Route>

          {/* MASTERS */}
          <Route path="/masters" element={<Masters />} ></Route>
          <Route path="/masterslist" element={<Masterslist />} ></Route>
          {/* TESTING */}
          <Route path="/testing" element={<Testing />} ></Route>

          <Route path="/blasting" element={<Blasting />} ></Route>
          <Route path="/blastingprocesssheetInlet" element={<BlastingDataEntryInlet />} ></Route>
          <Route path="/blastingprocesssheetBlasting" element={<BlastingDataEntryBlasting />} ></Route>

        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App