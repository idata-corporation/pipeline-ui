import React, { Component } from "react";
import { Form } from "react-bootstrap";
import IconButton from '@material-ui/core/IconButton';
/**
 * @componentName FilterForm
 * @description The Component responsible for filtering dataset table and refresh action
 */
class FilterForm extends Component {
  constructor(props) {
    super(props);
    this.datasetName = React.createRef();
    this.state = {
      value: ""
    };
  }

  change = (event) => {
   if(event.target.name === "datasetName" && event.target.value === ""){
      this.props.callFilterProcess(event.target.value);
      this.setState({ value: event.target.value });
    }
  };

  filterDatasetName(){
    this.props.callFilterProcess(this.datasetName.current.value);
    this.setState({ value: this.datasetName.current.value });
  };

  render() {
    const tabSelect = this.props.tabSelect;
    let tokenType = "pipelinetoken";
    if (localStorage.getItem('tabType') !== null) {
      let activeTab = localStorage.getItem('tabType');
      tokenType = activeTab === "dataset" ? "pipelinetoken" : "triggertoken";
    }

    if (tabSelect === "Data") {
      return (
        <Form className="form-inline datasetForm" role="form">
          <Form.Row className="row d-flex dtSetRow" >
            <Form.Group controlId="formGridDatasetName" className="form-group form-dataset-name datasetNameForm">
              <Form.Label className="col-md-auto control-label formLabel">
                {this.props.tabType === "dataset" ? "Dataset name" : "Trigger name"}
              </Form.Label>
              <div className="col colDts">
                <Form.Control
                  ref = {this.datasetName}
                  placeholder={this.props.tabType === "dataset" ? "Enter dataset name" : "Enter trigger name"}
                  className="form-control-static selectOpt"
                  name = "datasetName"
                  onChange = {this.change}
                />
              </div>
            </Form.Group>
            {!this.props.author && (
              <Form.Group controlId="formGridResult" className="form-group flex-grow-1 mr-auto form-group statusFormFilter">
                <div className="col colRsp" onClick={()=>this.filterDatasetName()}>
                  <IconButton style = {{marginLeft: "10px"}}aria-label="refresh" className="refreshBtn" size="small">
                    <i className="fa fa-search float-right" aria-hidden="true"></i>
                  </IconButton>
                </div>
                <div className="refreshBtnDiv" onClick={() => this.props.loadMoreData(this.props.tabType)}>
                  <IconButton aria-label="refresh" className="refreshBtn" size="small">
                    <i className="fa fa-refresh float-right" aria-hidden="true"></i>
                  </IconButton>
                </div>
              </Form.Group>
            )}
          </Form.Row>
        </Form>
      );
    }
    if (tabSelect === "Logs") {
      return (
        <Form className="form-inline datasetForm" role="form">
          <Form.Row className="row d-flex dtSetRow form-row">
            <Form.Group controlId="formBtn" className="form-group backBtnSvg">
              <div className="col">
                <svg width="2.3em" height="2.3em" viewBox="0 0 16 16" className="bi bi-arrow-left-square-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg" onClick={event => window.location.href = '/monitoring'}>
                  <path fillRule="evenodd" d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm9.5 8.5a.5.5 0 0 0 0-1H5.707l2.147-2.146a.5.5 0 1 0-.708-.708l-3 3a.5.5 0 0 0 0 .708l3 3a.5.5 0 0 0 .708-.708L5.707 8.5H11.5z" />
                </svg>
              </div>
            </Form.Group>
            <Form.Group controlId="formGridLogsName" className="form-group flex-grow-1 mr-auto form-group form-group refreshFormDiv">
              <div className="col colLog">
              </div>
              <div className="refreshBtnDivLog" onClick={() => this.props.pipelineToken(tokenType, this.props.refreshToken)}>
                <IconButton aria-label="refresh" className="refreshBtn" size="small">
                  <i className="fa fa-refresh float-right" aria-hidden="true"></i>
                </IconButton>
              </div>
            </Form.Group>
          </Form.Row>
        </Form>
      );
    }
  }
}

export default FilterForm;
