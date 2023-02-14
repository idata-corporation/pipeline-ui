/* eslint-disable */
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Dropdown from "react-bootstrap/Dropdown";
/**
 * @componentName RestartJob
 * @description Component for the dropdown menu for restarting job functionality
 */
const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
  <a
    href=""
    ref={ref}
    onClick={e => {
      e.preventDefault();
      onClick(e);
    }}
  >
    {children}
    <span className="threedots" />
  </a>
));
export default function RestartJob(props) {   
  return (
    <div className="dropdown">
      <Dropdown>
        <Dropdown.Toggle as={CustomToggle} />
        <Dropdown.Menu size="sm" title="" className="dropdown-edit">
          <Dropdown.Item className = "restartEdit"  onClick={()=> props.restartJob(props.pipelineToken)}>Restart job</Dropdown.Item>
         </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}