/* eslint-disable */
import React, { Component } from "react";
import axios from "axios";
import FilterForm from "components/FilterForm";
import NewDataSource from "components/MonitoringPage";
import { customFilter } from "react-bootstrap-table2-filter";
import { COLUMNS_LOGS } from "../constants";
import { trackPromise } from 'react-promise-tracker';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
/**
 * @componentName Dashboard
 * @description This is a container component, holds all other components and render them depending on user action
 */
const API_GATEWAY_ENDPOINT = process.env.REACT_APP_API_GATEWAY_ENDPOINT;
const X_API_KEY = process.env.REACT_APP_X_API_KEY;
const REACT_APP_REQUIRE_LOGIN = process.env.REACT_APP_REQUIRE_LOGIN.toLowerCase() === 'true' ? true : false;

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.showError = React.createRef();
    this.state = {
      applyFilter: false,
      tabType : "dataset",
      filterKeyword: "",
      filterProcessKeyword: "",
      columnSelected: false,
      key: "data",
      show: false,
      i: 0,
      page: 1,
      refreshToken: "",
      datasets: [],
      dataSourceLogs: [],
    };
  }

  onResultFilter = null;
  onStatusFilter = null;
  onDsNameFilter = null;
 

  columnsData = [
    {
      dataField: "pipelineToken",
      hidden: true,
    },
    {
      dataField: "dataset",
      text: "DATASET",
      filter: customFilter(),
      sort: true,
      filterRenderer: (onFilter, column) => {
        this.onDsNameFilter = onFilter;
        return null;
      },
      onSelect: (row, isSelect, rowIndex, e) => {
        this.setState({ columnSelected: true });
        this.setState({ key: "logs" });
      },
    },
    {
      dataField: "process",
      text: "CURRENT PROCESS",
    },
    {
      dataField: "startTime",
      text: "START TIME",
    },
    {
      dataField: "endTime",
      text: "END TIME",
    },
    {
      dataField: "totalTime",
      text: "TOTAL TIME",
    },
    {
      dataField: "status",
      text: "STATUS",
      filter: customFilter(),
      filterRenderer: (onFilter, column) => {
        this.onResultFilter = onFilter;
        return null;
      },
    }
  ];

  componentDidMount() {
    this.setState({ editMode: this.props.isEditable });
    if (this.props.auth.isAuthenticated || REACT_APP_REQUIRE_LOGIN === false) {
      this.setState({ show: true });
    } else {
      this.setState({ show: false });
    }
    if (localStorage.getItem('tabType') !== null) {
      let activeTab = localStorage.getItem('tabType');
      this.setState({ tabType: activeTab });
    }
  };

 /**function is called if data is changed */
  componentDidUpdate(prevProps) {
    if (JSON.stringify(this.props.dataSource) !== JSON.stringify(prevProps.dataSource)) {
      this.setState({ datasets: this.props.dataSource });
      this.setState({page:1});
    }
  };

  /**for filtering table data based on dataset name input */
  onValueChange = (event) => {
    let valueAll = "";
    let targetId = event.target.id;
    const { value } = event.target;

    if (targetId === "formGridResult") {
      if (value !== "All") {
        valueAll = value;
      }
      this.onResultFilter(valueAll);
    }
    if (targetId === "formGridStatus") {
      if (value !== "All") {
        valueAll = value;
      }
      this.onStatusFilter(valueAll);
    }
    if (targetId === "formGridDatasetName") {
      if (value !== "All") {
        valueAll = value;
      }
      this.onDsNameFilter(valueAll);
    }
  };

  setActive(activeId) {
    this.setState({ active: activeId });
  };

  /**called when tables are switched */
  onTurn(id) {
    this.setState({ key: id });
  };

  /**bind row data pipeline token value to component state */
  setRefreshToken(token) {
    this.setState({ refreshToken: token })
  };

  /**function for applying filter and pass keyword to be filtered by */
  callFilterProcess(newKeyword) {
    this.setState({ applyFilter: true, filterProcessKeyword: newKeyword });
  };

  /**function for storing tab selected*/
  setTab(tabSelected) {
    this.setState({tabType : tabSelected});
  };

  /**function for pagination and load next page data when scroll to bottom of the table*/
  loadNextPage(){
    let pageNumber = this.state.page+1;
    trackPromise(
      axios
        .get(
          API_GATEWAY_ENDPOINT + `/${this.state.tabType}/status?page=`
          + pageNumber,
          {
            headers: {
              "X-API-Key": X_API_KEY,
            },
          }
        )
        .then((res) => {
          this.setState({datasets:this.state.datasets.concat(res.data)});
          this.setState({page:pageNumber});
        })
        .catch((err) => {
          console.log(err);
        })
    );
  };

  /**function for getting data when clicked on home table dataset row*/
  fetchLogsData(type, token) {
    trackPromise(
      axios
        .get(
          API_GATEWAY_ENDPOINT + `/${this.state.tabType}/status?${type}=` + 
          token,
          {
            headers: {
              "X-API-Key": X_API_KEY,
            },
          }
        )
        .then((res) => {
          this.setState({ dataSourceLogs: res.data });
        })
        .catch((err) => {
          console.log(err);
        })
    );
  };

  render() {
    const dataSource = this.state.datasets;
    let datasetNames = [];
    dataSource.forEach((data) => {
      datasetNames.push(data.name);
    });

    if (this.state.show) {
      return (
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12 tabWrapper">
              {this.state.key === "data" && (
                <Tabs  defaultActiveKey={this.state.tabType} id="datasets" onSelect={key => {localStorage.setItem('tabType', key); this.setTab(key); this.props.loadMoreData(key) }}>
                  <Tab eventKey="dataset" title="Dataset Status">
                    <div className="container-fluid tabCont">
                      <FilterForm
                        tabSelect="Data"
                        tabType={this.state.tabType}
                        author={false}
                        onChange={this.onValueChange}
                        callFilterProcess={this.callFilterProcess.bind(this)}
                        loadMoreData={this.props.loadMoreData}
                      />
                      <NewDataSource
                        keyField="pipelineToken"
                        tabType={this.state.tabType}
                        columns={this.columnsData}
                        dataSource={dataSource}
                        applyFilter={this.state.applyFilter}
                        filterProcessKeyword={this.state.filterProcessKeyword}
                        isSelect={true}
                        onTurn={this.onTurn.bind(this)}
                        pipelineToken={this.fetchLogsData.bind(this)}
                        setRefreshToken={this.setRefreshToken.bind(this)}
                        loadNextPage = {this.loadNextPage.bind(this)}
                      />
                    </div>
                  </Tab>
                  <Tab eventKey="trigger" title="Trigger Status">
                    <div className="container-fluid tabCont">
                      <FilterForm
                        tabSelect="Data"
                        tabType={this.state.tabType}
                        author={false}
                        onChange={this.onValueChange}
                        callFilterProcess={this.callFilterProcess.bind(this)}
                        loadMoreData={this.props.loadMoreData}
                      />
                      <NewDataSource
                        keyField="pipelineToken"
                        tabType={this.state.tabType}
                        columns={this.columnsData}
                        dataSource={dataSource}
                        applyFilter={this.state.applyFilter}
                        filterProcessKeyword={this.state.filterProcessKeyword}
                        isSelect={true}
                        onTurn={this.onTurn.bind(this)}
                        pipelineToken={this.fetchLogsData.bind(this)}
                        setRefreshToken={this.setRefreshToken.bind(this)}
                        loadNextPage = {this.loadNextPage.bind(this)}
                      />
                    </div>
                  </Tab>
                </Tabs>
              )}
              {this.state.key === "logs" && (
                <div className="container-fluid tabCont">
                  <FilterForm
                    tabSelect="Logs"
                    loadMoreData={this.props.loadMoreData}
                    refreshToken={this.state.refreshToken}
                    pipelineToken={this.fetchLogsData.bind(this)}
                  />
                  <NewDataSource
                    keyField="pipelineToken"
                    tabType= {this.state.tabType}
                    columns={COLUMNS_LOGS}
                    resizable={true}
                    dataSource={this.state.dataSourceLogs}
                    applyFilter={this.state.applyFilter}
                    filterProcessKeyword={this.state.filterProcessKeyword}
                    setRefreshToken={this.setRefreshToken.bind(this)}
                  />
                  
                </div>
              )}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="notAutorize">
          <h1 className="forbiddenH1"><i className="fa fa-lock"></i>Forbidden</h1>
          <h2 className="forbiddenH2">You are not autorized to view this page.</h2>
        </div>
      );
    }
  }
}
export default Dashboard;
