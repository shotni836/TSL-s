/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Reportlist.css'
import Header from '../Common/Header/Header'
import Footer from '../Common/Footer/Footer'
import Loading from "../Loading";
import InnerHeaderPageSection from "../../components/Common/Header-content/Header-content";

const Reportlist = () => {

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 2000);
  }, [])

  const handleDropdownItemClick = (item, category, itemName, componentNo) => {
    let routePrefix;
    switch (category) {
      case 'Raw Material Inspection':
        routePrefix = 'inspection-test';
        break;
      case 'Raw Material In-house Testing':
        routePrefix = 'in-house-test';
        break;
      case 'Before Process Lab Testing':
        routePrefix = 'before-process-lab-test';
        break;
      case 'CD Test':
        routePrefix = 'cd-test';
        break;
      case 'Lab Test':
        routePrefix = `lab-test-${componentNo}`;
        break;
      case 'Field Test':
        routePrefix = 'field-test';
        break;
      case 'Pipe Release and MTC':
        switch (item) {
          case 222:
            routePrefix = 'bare-pipe-inspection';
            break;
          case 677:
            routePrefix = 'phos-blast-insp';
            break;
          case 676:
            routePrefix = 'nc-report';
            break;
          case 670:
            routePrefix = 'chromate-coat-insp';
            break;
          case 'rough-gauge':
            routePrefix = 'rough-gauge';
            break;
          case 'thickness-gauge':
            routePrefix = 'thickness-gauge';
            break;
          case 'thickness-insp':
            routePrefix = 'thickness-insp';
            break;
          case 'dust-level':
            routePrefix = 'dust-level';
            break;
          default:
            routePrefix = '';
            break;
        }
        break;
      default:
        routePrefix = '';
        break;
    }

    navigate(`/list/${routePrefix}/${item}`, { state: { category, itemName } });
  };

  // dropdown items
  const dropdownData = [
    {
      category: 'Raw Material Inspection',
      items: [
        { id: 138, name: 'Adhesive RMTC Merged' },
        { id: 146, name: 'Chromate RMTC Inspection' },
        { id: 614, name: 'Epoxy RMTC Merged' },
        { id: 141, name: 'HDPE RMTC Merged' },
        { id: 145, name: 'Phospheric RMTC Inspection' }
      ]
    },
    {
      category: 'Raw Material In-house Testing',
      items: [
        { id: 192, name: 'Adhesive RMTC' },
        { id: 184, name: 'Epoxy RMTC' },
        { id: 199, name: 'HDPE RMTC' }
      ]
    },
    {
      category: 'Before Process Lab Testing',
      items: [
        { id: 248, name: 'DM Water Test' },
        { id: 215, name: 'Inspection Of Abrasive Grit' },
        { id: 210, name: 'Inspection Of Abrasive Shot' },
        { id: 244, name: 'Phosphoric Acid & Chromate Concentration' },
        { id: 242, name: 'Quality Of Compressed Air Test' },
        { id: 650, name: 'Water Soluable Contamination' }
      ]
    },
    {
      category: 'CD Test',
      items: [
        { id: 297, name: '24 Hrs CD Test' },
        { id: 300, name: '48 Hrs CD Test' },
        { id: 298, name: '28 Days CD Test (Normal)' },
        { id: 299, name: '28 Days CD Test (Hot)' },
        { id: 301, name: '30 Days CD Test (Normal)' },
        { id: 302, name: '30 Days CD Test (Hot)' },
      ]
    },
    {
      category: 'Lab Test',
      items: [
        { id: 287, name: 'Cross Section Interface Porosity' },
        { id: 283, name: 'Degree Of Cure With Graph' },
        { id: 307, name: 'Hardness Test' },
        { id: 305, name: 'Product Stability Test' },
        { id: 306, name: 'Tensile Test' },
        { id: 663, name: 'Hot water Adhesion Test 24 hrs' },
        { id: 295, name: 'Hot Water Immersion Test 48 hrs' },
        { id: 'elongation', name: 'Elongation Test' },
        { id: 304, name: 'Flexibility Test' },
        { id: 'indentation', name: 'Indentation Test' }
      ]
    },
    {
      category: 'Field Test',
      items: [
        { id: 666, name: 'Impact Test' },
        { id: 330, name: 'Peel Test Report With Graph' },
        { id: 332, name: 'Sleeve Peel Test' },
        { id: 294, name: 'Air Entrapment Test' },
        { id: 667, name: 'Cross Cut Test' },
        { id: 668, name: 'Epoxy Holiday Test' },
        { id: 216, name: 'Repair' }
      ]
    },
    {
      category: 'Pipe Release and MTC',
      items: [
        { id: 222, name: 'Bare Pipe Inspection' },
        { id: 'rough-gauge', name: 'Calibration Report of Roughness Gauge' },
        { id: 'dust-level', name: 'Dust Level Report' },
        { id: 677, name: 'Phosphate Application and Blasting Inspection' },
        { id: 'chromcoat-insp', name: 'Chromate & Coating Application on Inspection' },
        { id: 'thickness-gauge', name: 'Calibration Report of Thickness Gauge' },
        { id: 'thickness-insp', name: 'Coating Thickness Inspection' },
        { id: 'final-insp', name: 'Final Inspection Report' },
        { id: 'holiday-callib', name: 'Holiday Calibration on Report' },
        { id: 'raw-material-insp-list1', name: 'MTC with Coated Pipe Release List' },
        { id: 676, name: 'NC Report' },
        { id: 'raw-material-insp-list2', name: 'PQT Report' },
        { id: 'raw-material-insp-list3', name: 'PVR Report' }
      ]
    },
  ];

  // sort items alphabetically by name
  const sortItemsByName = (items) => {
    return items.sort((a, b) => a.name.localeCompare(b.name));
  };

  const sortedDropdownData = dropdownData.map((category) => {
    return {
      ...category,
      items: sortItemsByName(category.items)
    };
  });

  const componentNumbers = [1, 1, 2, 2, 1, 1, 1, 3, 1, 1];

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Header />
          <InnerHeaderPageSection
            linkTo="/dashboard?moduleId=618"
            linkText="Quality Module"
            linkText2="Report List"
          />

          <section className='ReportlistPageSection'>
            <div className='container'>
              <div className='row'>
                <div className='col-md-12 col-sm-12 col-xs-12'>
                  <div className='InspectiontestingDrowpdown'>
                    {sortedDropdownData.map((category, index) => (
                      <div className="dropdown" key={index}>
                        <a className="dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                          {category.category}
                        </a>
                        <ul className="dropdown-menu">
                          {category.items.map((item, itemIndex) => (
                            <li key={item.id}>
                              <a className="dropdown-item" onClick={() => handleDropdownItemClick(item.id, category.category, item.name, componentNumbers[itemIndex])}>
                                {item.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

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

export default Reportlist;