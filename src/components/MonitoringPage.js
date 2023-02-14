/* eslint-disable */
import React, { Component } from "react";
import filterFactory from "react-bootstrap-table2-filter";
import { OverlayTrigger, Tooltip, Button } from "react-bootstrap";
import { BootstrapTable as BTable, TableHeaderColumn } from "react-bootstrap-table";
import Dropdown from "components/forms/components/Dropdown";
import SweetAlert from "react-bootstrap-sweetalert";
import axios from "axios";
import Loader from 'react-loader-spinner';
import { usePromiseTracker } from "react-promise-tracker";
/**
 * @componentName NewDataSource
 * @description This is a component responsible for all tables that aprears in app
 */
const X_API_KEY = process.env.REACT_APP_X_API_KEY;
const API_GATEWAY_ENDPOINT = process.env.REACT_APP_API_GATEWAY_ENDPOINT;

const stateType = {
  'All': '',
  'end': 'end',
  'begin': 'begin',
  "processing": "processing"
};

const statusType = {
  'All': '',
  'info': 'info',
  'error': 'error',
  "warning": "warning",
  "success": "success",
  "processing": "processing",
  "timed out": "timed out"
};

class NewDataSource extends Component {

  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.tooltipCopyFormatter = this.tooltipCopyFormatter.bind(this);
    this.formatCopyData = this.formatCopyData.bind(this);
    this.state = {
      pipelineToken: "",
      restartSuccess: false,
      restartStart: false,
      restartError: "",
      showRestartError: false,
      popoverOpen: false,
      columnWidths: [190, 160, 190, 190, 190, 100, 100, 200, 50]
    };
    this.showLogs = this.showLogs.bind(this);
  }

  enumFormatter(cell, row, enumObject) {
    return enumObject[cell];
  };

  toggle() {
    this.setState({
      popoverOpen: !this.state.popoverOpen,
    });
  };

  /**tooltip to be shown when hovering over the cell*/
  tooltipFormatter(cell, row) {
    return (
      <OverlayTrigger
        placement="left"
        overlay={<Tooltip id={String(row.id)}>{cell}</Tooltip>}
      >
        <span>{cell}</span>
      </OverlayTrigger>
    );
  };

  /**format data to be copied*/
  formatCopyData = (data) => {
    delete data.id;
    delete data.copy;
    let formatedData = JSON.stringify(data, null, 2).replace(/["{[,}\]]/g, "");
    let x = formatedData.replace(/\\n/g, "");
    return x.replace(/\\t/g, "");
  };

  /**functionality for copy/paste functionality*/
  copyToClipboard(text) {
    if (typeof (navigator.clipboard) == 'undefined') {
      let textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      document.body.removeChild(textArea);
      return;
    }
    navigator.clipboard.writeText(text).then(function () {
    }, function (err) {
      console.log('unsuccessful!', err);
    });
  };

  /**formats tooltip when hovering last column and call copy to clipboard if clicked */
  tooltipCopyFormatter(cell, row) {
    let formatedData = this.formatCopyData(row);
    return (
      <OverlayTrigger
        placement="left"
        overlay={<Tooltip id={String(row.id)}>Copy</Tooltip>}
      >
        <span><i className="fa fa-copy" onClick={() => { this.copyToClipboard(formatedData); alert(formatedData) }}></i></span>
      </OverlayTrigger>
    );
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.filterProcessKeyword === "" && this.refs.datasetNameCol) {
      this.refs.datasetNameCol.applyFilter(nextProps.filterProcessKeyword);
    }
    if (nextProps.filterProcessKeyword) {
      if (this.refs.datasetNameCol) {
        this.refs.datasetNameCol.applyFilter(nextProps.filterProcessKeyword);
      }
    }
  };

  componentDidMount() {
    for (let index = 0; index < 12; index += 1) {
      if (window.$(`.react-bs-container-header .table th:eq(${index})`).length === 0) break; // used for resize table columns 
      window.$(`.react-bs-container-header .table th:eq(${index})`).resizable({
        minWidth: 50,
        handles: 'e',
        resize: (__event, ui) => {
          const newColumnWidths = [...this.state.columnWidths];
          console.log("MUI ", ui.size.width);
          newColumnWidths[index] = ui.size.width;
          this.setState({ columnWidths: newColumnWidths }, () => console.log(this.state.columnWidths));
        },
      });
    }
    for (let index = 0; index < 12; index += 1) {
      if (window.$(`.custom-row-header th:eq(${index})`).length === 0) break; // break if cant find any more columns
      window.$(`.custom-row-header th:eq(${index})`).resizable({
        minWidth: 50,
        handles: 'e',
        resize: (__event, ui) => {
          const newColumnWidths = [...this.state.columnWidths];
          console.log("UI ", ui.size.width);
          newColumnWidths[index] = ui.size.width;
          this.setState({ columnWidths: newColumnWidths }, () => console.log(this.state.columnWidths));
        },
      });
    }
  };

  /**pass pipeline token to parent Dashboard componenet in order to fetch logs data for dataset selected*/
  showLogs = (pipelineToken) => {
    this.props.setRefreshToken(pipelineToken);
    this.props.pipelineToken(pipelineToken);
    this.props.onTurn("logs");
  };

  echo(e) {
    e.stopPropagation();
  };


  /**detect if the user reached table bottom and call function for fetching more data*/
  scrollDown(e) {
    var node = e.target;
    if (node.scrollTop !== 0) {
        const bottom = node.scrollHeight - Math.round(node.scrollTop) <= node.clientHeight;
        if (bottom) {
          this.props.loadNextPage();
        }
      }
  };

  render() {
    const { dataSource } = this.props;
    const selectRow = this.props.isSelect;
    const tabType = this.props.tabType;
    this.props.dataSource.forEach(function (element) {
      element.copy = "true";
    });
    let func = this.props;
    const tableRowEvents = {
      onRowClick:(e,event,value) => {
        if(e.pipelineToken){
          func.setRefreshToken(e.pipelineToken);
          func.pipelineToken("pipelinetoken",e.pipelineToken);
          func.onTurn("logs");
        }  
      },
    };
    const tableRowTriggerEvents = {
      onRowClick:(e,event,value) => {
        if(e.triggerToken){
          func.setRefreshToken(e.triggerToken);
          func.pipelineToken("triggertoken", e.triggerToken);
          func.onTurn("logs");
        }  
      },
    };

    const rowEvn = {
      onRowMouseOver: (row) => {
        if (row.description && row.description.length > 1000) {
          // eslint-disable-next-line
          let element = document.getElementsByClassName("tooltip-inner");
        }
      }
    };

    const LoadingIndicator = props => {
      const { promiseInProgress } = usePromiseTracker();

      return promiseInProgress &&
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            zIndex:10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#e9e9e9",
            opacity: "0.3"
          }}
        >
          <Loader type="ThreeDots" color="#343a40" height="80" width="80" />
        </div>
    };

    if (selectRow) {
      if(tabType === "dataset") {
        return (
          <div onScroll = {(e)=>this.scrollDown(e)} onWheel = {(e)=>this.scrollDown(e)} ref={ref => this.container = ref} className="table-responsive" style={{ height: `${window.innerHeight - 200}px`, width:`${window.innerWidth - 200}px` }}>
            <BTable
              bordered={false}
              striped={true}
              hover={true}
              data={dataSource}
              filter={filterFactory()}
              options={tableRowEvents}
              containerStyle={{ height: `${window.innerHeight - 250}px`}}
            >
              <TableHeaderColumn isKey={true} dataFormat={this.tooltipFormatter} dataField="pipelineToken" hidden={true} thStyle={{ width: `${this.state.columnWidths[0]}px`, border: "1px solid white" }} tdStyle={{ width: `${this.state.columnWidths[0]}px` }}>
                Pipeline Token
                </TableHeaderColumn>
              <TableHeaderColumn dataField="dataset" dataFormat={this.tooltipFormatter} dataSort={true} thStyle={{ width: `${this.state.columnWidths[1]}px`, border: "1px solid white" }} tdStyle={{ width: `${this.state.columnWidths[1]}px` }} ref='datasetNameCol' filter={{ type: 'TextFilter', defaultValue: '' }}>
                DATASET
                </TableHeaderColumn>
              <TableHeaderColumn dataField="process" dataFormat={this.tooltipFormatter} dataSort={true} thStyle={{ width: `${this.state.columnWidths[2]}px`, border: "1px solid white" }} tdStyle={{ width: `${this.state.columnWidths[2]}px` }} >
                CURRENT PROCESS
                </TableHeaderColumn>
              <TableHeaderColumn dataField="startTime" dataSort={true} dataFormat={this.tooltipFormatter} thStyle={{ width: `${this.state.columnWidths[3]}px`, border: "1px solid white" }} tdStyle={{ width: `${this.state.columnWidths[3]}px` }} >
                START TIME
                </TableHeaderColumn>
              <TableHeaderColumn dataField="endTime" dataSort={true} dataFormat={this.tooltipFormatter} thStyle={{ width: `${this.state.columnWidths[4]}px`, border: "1px solid white" }} tdStyle={{ width: `${this.state.columnWidths[4]}px` }} >
                END TIME
                </TableHeaderColumn>
              <TableHeaderColumn dataField="totalTime" dataSort={true} dataFormat={this.tooltipFormatter} thStyle={{ width: `${this.state.columnWidths[5]}px`, border: "1px solid white" }} tdStyle={{ width: `${this.state.columnWidths[5]}px` }} >
                TOTAL TIME
                </TableHeaderColumn>
              <TableHeaderColumn dataField="status" dataSort={true} thStyle={{ width: `${this.state.columnWidths[6]}px`, border: "1px solid white" }} tdStyle={{ width: `${this.state.columnWidths[6]}px` }} ref='statusCol' filterFormatted dataFormat={this.enumFormatter}
                formatExtraData={statusType} filter={{ type: 'SelectFilter', options: statusType }} >
                STATUS
                </TableHeaderColumn>
             </BTable>
            <div
              ref={ref => this.bottomLine = ref}
            ></div>
            <LoadingIndicator />
          </div>
        );}
        if (tabType === "trigger") {
          return (
            <div className="table-responsive" onScroll = {(e)=>this.scrollDown(e)} onWheel = {(e)=>this.scrollDown(e)} ref={ref => this.container = ref} style={{ height: `${window.innerHeight - 200}px`, width:`${window.innerWidth - 200}px` }}>
              <BTable
                bordered={false}
                striped={true}
                hover={true}
                data={dataSource}
                filter={filterFactory()}
                options={tableRowTriggerEvents}
              >
                <TableHeaderColumn isKey={true} dataFormat={this.tooltipFormatter} dataField="triggerToken" hidden={true} thStyle={{ width: `${this.state.columnWidths[0]}px`, border: "1px solid white" }} tdStyle={{ width: `${this.state.columnWidths[0]}px` }}>
                  Trigger Token
                </TableHeaderColumn>
                <TableHeaderColumn dataField="process" dataFormat={this.tooltipFormatter} dataSort={true} thStyle={{ width: `${this.state.columnWidths[1]}px`, border: "1px solid white" }} tdStyle={{ width: `${this.state.columnWidths[1]}px` }} ref='datasetNameCol' filter={{ type: 'TextFilter', defaultValue: '' }}>
                  PROCESS NAME
                </TableHeaderColumn>
                <TableHeaderColumn dataField="startTime" dataSort={true} dataFormat={this.tooltipFormatter} thStyle={{ width: `${this.state.columnWidths[2]}px`, border: "1px solid white" }} tdStyle={{ width: `${this.state.columnWidths[2]}px` }} >
                  START TIME
                  </TableHeaderColumn>
                <TableHeaderColumn dataField="endTime" dataSort={true} dataFormat={this.tooltipFormatter} thStyle={{ width: `${this.state.columnWidths[3]}px`, border: "1px solid white" }} tdStyle={{ width: `${this.state.columnWidths[3]}px` }} >
                  END TIME
                  </TableHeaderColumn>
                <TableHeaderColumn dataField="totalTime" dataSort={true} dataFormat={this.tooltipFormatter} thStyle={{ width: `${this.state.columnWidths[4]}px`, border: "1px solid white" }} tdStyle={{ width: `${this.state.columnWidths[4]}px` }} >
                  TOTAL TIME
                  </TableHeaderColumn>
                <TableHeaderColumn dataField="status" dataSort={true} thStyle={{ width: `${this.state.columnWidths[5]}px`, border: "1px solid white" }} tdStyle={{ width: `${this.state.columnWidths[5]}px` }} ref='statusCol' filterFormatted dataFormat={this.enumFormatter}
                  formatExtraData={statusType} filter={{ type: 'SelectFilter', options: statusType }} >
                  STATUS
                </TableHeaderColumn>
              </BTable>
              <div
                ref={ref => this.bottomLine = ref}
              ></div>
              <LoadingIndicator />
          </div>

          );}
    } else {
      if(this.props.tabType === "dataset") {
        return (
          <div className="table-responsive" style={{ height: `${window.innerHeight - 200}px`, width:`${window.innerWidth - 200}px` }}>
            <BTable
              data={this.props.dataSource}
              bordered={false}
              striped={true}
              hover={true}
              filter={filterFactory()}
              containerStyle={{height: `${window.innerHeight - 250}px`}}
              options={rowEvn}
            >
              <TableHeaderColumn dataField="dateTime" dataFormat={this.tooltipFormatter} dataSort={true} thStyle={{ width: `${this.state.columnWidths[0]}px`, border: "1px solid white" }} tdStyle={{ width: `${this.state.columnWidths[0]}px` }}>
                TIME
              </TableHeaderColumn>
              <TableHeaderColumn isKey={true} dataField="processName" dataFormat={this.tooltipFormatter} dataSort={true} thStyle={{ width: `${this.state.columnWidths[1]}px`, border: "1px solid white" }} tdStyle={{ width: `${this.state.columnWidths[1]}px` }} ref='processNameCol' filter={{ type: 'TextFilter', defaultValue: '' }}>
                PROCESS
              </TableHeaderColumn>
              <TableHeaderColumn dataField="publisherToken" dataSort={true} dataFormat={this.tooltipFormatter} thStyle={{ width: `${this.state.columnWidths[2]}px`, border: "1px solid white" }} tdStyle={{ width: `${this.state.columnWidths[2]}px` }} >
                PUBLISHER TOKEN
              </TableHeaderColumn>
              <TableHeaderColumn dataField="pipelineToken" dataSort={true} dataFormat={this.tooltipFormatter} thStyle={{ width: `${this.state.columnWidths[3]}px`, border: "1px solid white" }} tdStyle={{ width: `${this.state.columnWidths[3]}px` }}>
                PIPELINE TOKEN
              </TableHeaderColumn>
              <TableHeaderColumn dataField="filename" dataSort={true} dataFormat={this.tooltipFormatter} thStyle={{ width: `${this.state.columnWidths[4]}px`, border: "1px solid white" }} tdStyle={{ width: `${this.state.columnWidths[4]}px` }}>
                FILENAME
              </TableHeaderColumn>
              <TableHeaderColumn dataField="state" thStyle={{ width: `${this.state.columnWidths[5]}px`, border: "1px solid white" }} tdStyle={{ width: `${this.state.columnWidths[5]}px` }} dataSort={true} ref='stateNameCol' filterFormatted dataFormat={this.enumFormatter}
                formatExtraData={stateType} filter={{ type: 'SelectFilter', options: stateType }}>
                STATE
              </TableHeaderColumn>
              <TableHeaderColumn dataField="code" dataFormat={this.tooltipFormatter} dataSort={true} thStyle={{ width: `${this.state.columnWidths[6]}px`, border: "1px solid white" }} tdStyle={{ width: `${this.state.columnWidths[6]}px` }}>
                CODE
              </TableHeaderColumn>
              <TableHeaderColumn dataField="description" dataSort={true} dataFormat={this.tooltipFormatter} thStyle={{ width: `${this.state.columnWidths[7]}px`, border: "1px solid white" }} tdStyle={{ width: `${this.state.columnWidths[7]}px` }} >
                DESCRIPTION
              </TableHeaderColumn>
              <TableHeaderColumn dataField="copy" dataFormat={this.tooltipCopyFormatter} thStyle={{ width: `${this.state.columnWidths[8]}px`, border: "1px solid white" }} tdStyle={{ width: `${this.state.columnWidths[8]}px` }}>
              </TableHeaderColumn>
            </BTable>
          </div>
      );}
      if(this.props.tabType === "trigger") {
        return (
          <div className="table-responsive" style={{ height: `${window.innerHeight - 200}px`, width:`${window.innerWidth - 200}px` }}>
            <BTable
              data={this.props.dataSource}
              bordered={false}
              striped={true}
              hover={true}
              filter={filterFactory()}
              containerStyle={{height: `${window.innerHeight - 250}px`}}
              options={rowEvn}
            >
              <TableHeaderColumn dataField="dateTime" dataFormat={this.tooltipFormatter} dataSort={true} thStyle={{ width: `${this.state.columnWidths[0]}px`, border: "1px solid white" }} tdStyle={{ width: `${this.state.columnWidths[0]}px` }}>
                TIME
              </TableHeaderColumn>
              <TableHeaderColumn isKey={true} dataField="processName" dataFormat={this.tooltipFormatter} dataSort={true} thStyle={{ width: `${this.state.columnWidths[1]}px`, border: "1px solid white" }} tdStyle={{ width: `${this.state.columnWidths[1]}px` }} ref='processNameCol' filter={{ type: 'TextFilter', defaultValue: '' }}>
                PROCESS
              </TableHeaderColumn>
              <TableHeaderColumn dataField="triggerToken" dataSort={true} dataFormat={this.tooltipFormatter} thStyle={{ width: `${this.state.columnWidths[2]}px`, border: "1px solid white" }} tdStyle={{ width: `${this.state.columnWidths[2]}px` }} >
                TRIGGER TOKEN
              </TableHeaderColumn>
              <TableHeaderColumn dataField="state" thStyle={{ width: `${this.state.columnWidths[5]}px`, border: "1px solid white" }} tdStyle={{ width: `${this.state.columnWidths[5]}px` }} dataSort={true} ref='stateNameCol' filterFormatted dataFormat={this.enumFormatter}
                formatExtraData={stateType} filter={{ type: 'SelectFilter', options: stateType }}>
                STATE
              </TableHeaderColumn>
              <TableHeaderColumn dataField="code" dataFormat={this.tooltipFormatter} dataSort={true} thStyle={{ width: `${this.state.columnWidths[6]}px`, border: "1px solid white" }} tdStyle={{ width: `${this.state.columnWidths[6]}px` }}>
                CODE
              </TableHeaderColumn>
              <TableHeaderColumn dataField="description" dataSort={true} dataFormat={this.tooltipFormatter} thStyle={{ width: `${this.state.columnWidths[7]}px`, border: "1px solid white" }} tdStyle={{ width: `${this.state.columnWidths[7]}px` }} >
                DESCRIPTION
              </TableHeaderColumn>
              <TableHeaderColumn dataField="copy" dataFormat={this.tooltipCopyFormatter} thStyle={{ width: `${this.state.columnWidths[8]}px`, border: "1px solid white" }} tdStyle={{ width: `${this.state.columnWidths[8]}px` }}>
              </TableHeaderColumn>
            </BTable>
          </div>
      );}
    }
  }
}

export default NewDataSource;
