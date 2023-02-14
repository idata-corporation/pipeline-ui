/* eslint-disable */
import React, { Component } from "react";
import TextField from "@material-ui/core/TextField";
import { Button, Form } from "react-bootstrap";
import logo from "asserts/green-logo.png";
import {CognitoUserPool, CognitoUser, AuthenticationDetails} from 'amazon-cognito-identity-js';
import SweetAlert from "react-bootstrap-sweetalert";
/**
 * @componentName ForgotPassword
 * @description UI form for entering a username and sending code to user email in case of forgotten password.
 * On success forgotPassword cognito function redirect user to change password UI
 */
const COGNITO_USER_APP_CLIENT_ID = process.env.REACT_APP_COGNITO_USER_APP_CLIENT_ID;
const COGNITO_USER_POOL_ID = process.env.REACT_APP_COGNITO_USER_POOL_ID;

class ForgotPassword extends Component {
  constructor() {
    super();
    this.state = {
      username: "",
      showError: false,
      messageFromServer: "",
      showNullError: false,
    };
  }

  /** check if username is provided */
  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value,
    });
    if (event.target.value !== "") {
      this.setState({ showNullError: false });
    }
    else {
      this.setState({ showNullError: true });
    }
  };

 /** configure AWS Cognito User pool */
  getUserPool = () => {
    var poolData = { 
        UserPoolId : COGNITO_USER_POOL_ID,
        ClientId : COGNITO_USER_APP_CLIENT_ID
    };
    var userPool = new CognitoUserPool(poolData);
    return userPool
 };

 /** use AWS Cognito to do forgotPassword functionality, after the username is supplied 
  * email with code will be sent to the user email and user will be redirected to form 
  * for password reset
  */
  sendEmail = async (e) => {
    e.preventDefault();
    const { username } = this.state;
    const userData = {
      Username: username,
      Pool: this.getUserPool(),
    };
    const cognitoUser = new CognitoUser(userData);
    if (username === "") {
      this.setState({
        showError: false,
        messageFromServer: "",
        showNullError: true,
      });
    } else {
        cognitoUser.forgotPassword({
        onSuccess: function(result) {
          window.location.href = "/reset";
        },
        onFailure: function(err) {
          this.setState({ showError: true });
          this.setState({ messageFromServer: err.message });
        }
    });
    }
  };

  render() {
    const { username, showNullError, showError } = this.state;
    return (
      <div className="container-fluid">
        <div className="row logContainer">
          <div className="col-md-12 tabWrapper">
            <div className="row colDiv" style={{ background: "white" }}>
              <div className="col">
                <img className="logoImage1" src={logo} alt="Logo" />
              </div>
              <div className="col loginWrp">
                <div className="col-md-8 mx-auto loginFormWrapper">
                  <h1 className="loginH1 resetH1">Reset password</h1>
                  <h2 className="loginH2">
                    Please enter your username and we will send you a password reset link
                  </h2>
                  <Form className="loginForm align-items-center">
                    <Form.Group className="form-group">
                      <TextField
                        id="username"
                        type="username"
                        name="username"
                        label="Username"
                        placeholder="Enter username"
                        value={username}
                        onChange={this.handleChange("username")}
                      />
                      {showNullError && (<span className="error">*The username cannot be null.</span>)}
                      {showError && (<span className="error"> *That username isn&apos;t recognized. Please try again or register for a new account.</span>)}
                    </Form.Group>
                  </Form>
                  <div className="d-flex justify-content-center w-100 updateRow">
                    <Button
                      className="btnSendRequest"
                      type="submit"
                      onClick={this.sendEmail}
                    >
                      Send request
                    </Button>
                    {showError && (
                      <Button
                        className="btnSignUp"
                        onClick={() => (window.location.href = "/register")}
                      >
                        Register
                      </Button>
                    )}

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <SweetAlert
          title="Error"
          show={this.state.showError}
          onConfirm={() => this.setState({ showError: false })}
          onCancel={() => this.setState({ showError: false })}
        >
          There was an error:
          <p className="error">{this.state.messageFromServer}</p>
        </SweetAlert>
      </div>
    );
  }
}

export default ForgotPassword;
