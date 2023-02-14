/* eslint-disable */
import React, { Component } from "react";
import TextField from "@material-ui/core/TextField";
import { Button, Form } from "react-bootstrap";
import logo from "asserts/green-logo.png";
import SweetAlert from "react-bootstrap-sweetalert";
import {CognitoUserPool, CognitoUser} from 'amazon-cognito-identity-js';
/**
 * @componentName PasswordReset
 * @description UI form for changing password in case of forgotten password
 * On success confirmPassword cognito function redirect user to login/home UI
 */
const COGNITO_USER_APP_CLIENT_ID = process.env.REACT_APP_COGNITO_USER_APP_CLIENT_ID;
const COGNITO_USER_POOL_ID = process.env.REACT_APP_COGNITO_USER_POOL_ID;

const validPasswordRegex = RegExp(/^(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+*!=]).*$/);

class Reset extends Component {
  constructor() {
    super()
    this.state = {

      username: '',
      code: '',
      password: '',
      confirmPassword: '',
      showError: false,
      errorText: '',
      errors: {
        username: '',
        password: '',
        code: '',
        confirmPassword: ''
      }
    }
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  };

  /** check user input in reset password form and warning handling */
  onChange(e) {
    e.preventDefault();
    const { name, value } = e.target;
    let errors = this.state.errors;

    switch (name) {
      case 'username':
        errors.username =
          value.length === 0
            ? '*Username is required'
            : '';
        break;
      case 'code':
        errors.code =
          value.length === 0
            ? '*Enter code you received'
            : '';
        break;
      case 'password':
        errors.password =
          !validPasswordRegex.test(value)
            ? '*Password must be 8 characters long including 1 uppercase letter, 1 special character, alphanumeric characters'
            : '';

        break;
      case 'confirmPassword':
        errors.confirmPassword =
          value.length < 8
            ? '*Password must be at least 8 characters long'
            : '';

        break;
      default:
        break;
    }
    this.setState({ errors, [name]: value });
  };

  /** configure AWS Cognito User pool */
  getUserPool = () => {
    let poolData = { 
        UserPoolId : COGNITO_USER_POOL_ID,
        ClientId : COGNITO_USER_APP_CLIENT_ID
    };
    let userPool = new CognitoUserPool(poolData);
    return userPool
  };

  /** reset password functionality using AWS Cognito service and check user input; 
   * redirection depending on successfully confirmPassword action*/
  onSubmit = e => {
    e.preventDefault()
    let that = this;
    const { username, password, code, confirmPassword, errors } = this.state;
    const userData = {
      Username: username,
      Pool: this.getUserPool(),
    };
    const cognitoUser = new CognitoUser(userData);
    errors.username = '';
    errors.password = '';
    if (username.length === 0) {
      errors.username = '*Username is required';
    }
    else if (code.length === 0) {
      errors.code = '*Code is required';
    }
    else if (password.length === 0) {
      errors.password = '*Password is required';
    }
    else if (password !== confirmPassword) {
      errors.confirmPassword = '*Please enter the same password as above';
    } else {
      errors.confirmPassword = '';
      cognitoUser.confirmPassword(code, password, {
        onFailure(err) {
          that.setState({showError: true});
          that.setState({errorText: err.message});
        },
        onSuccess() {
          if(that.props.auth.isAuthenticated) {   
            window.location.href = "/monitoring";
          }
          else {
            window.location.href = "/";
          }
        }
      });
    }
    this.setState({ errors });
  };

  /**function for toggle password visibility when click on eye icon */
  toggleNewPasswordVisiblity = () => {
    const { isNewPasswordShown } = this.state;
    this.setState({ isNewPasswordShown: !isNewPasswordShown });
  };

  /**function for toggle confirm password visibility when click on eye icon */
  toggleConfirmPasswordVisiblity = () => {
    const { isConfirmPasswordShown } = this.state;
    this.setState({ isConfirmPasswordShown: !isConfirmPasswordShown });
  };


  render() {
    const { username, password, code, errors, isNewPasswordShown, isConfirmPasswordShown } = this.state;
    return (
      <div className="container-fluid">
        <div className="row logContainer">
          <div className="col-md-12 tabWrapper">
            <div className="row colDiv" style={{ background: "white" }}>
              <div className="col imgWrapper">
                <img className="logoImage1" src={logo} alt="Logo" />
              </div>
              <div className="col resetWrp">
                <div className="col-md-8 mx-auto loginFormWrapper">
                  <h1 className="loginH1">Create new password </h1>
                  <h2 className="loginH2">
                    Please enter your username, the confirmation code we've sent you on your email address and your new password
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
                        onChange={this.onChange}
                      />
                      {errors.username.length > 0 && (<span className="error">{errors.username}</span>)}

                    </Form.Group>
                    <Form.Group className="form-group">
                      <TextField
                        id="code"
                        type="text"
                        name="code"
                        label="Code"
                        placeholder="Enter the confirmation code"
                        value={code}
                        onChange={this.onChange}
                      />
                      {errors.code.length > 0 && (<span className="error">{errors.code}</span>)}
                    </Form.Group>
                    <Form.Group className="form-group">
                      <div className="wrapper-new-password">
                        <TextField
                          id="password"
                          type={isNewPasswordShown ? "text" : "password"}
                          name="password"
                          label="New Password"
                          placeholder="Enter the new password"
                          value={password}
                          onChange={this.onChange}
                        />
                        {isNewPasswordShown && <i className="fa fa-eye-slash password-icon" onClick={this.toggleNewPasswordVisiblity} />}
                        {!isNewPasswordShown && <i className="fa fa-eye password-icon password-icon" onClick={this.toggleNewPasswordVisiblity} />}
                      </div>
                      {errors.password.length > 0 && (<span className="error">{errors.password}.</span>)}
                    </Form.Group>
                    <Form.Group className="form-group">
                      <div className="wrapper-new-password">
                        <TextField
                          id="confirmPassword"
                          type={isConfirmPasswordShown ? "text" : "password"}
                          name="confirmPassword"
                          label="Confirm password"
                          placeholder="Enter the new password again"
                          onChange={this.onChange}
                        />
                        {isConfirmPasswordShown && <i className="fa fa-eye-slash password-icon" onClick={this.toggleConfirmPasswordVisiblity} />}
                        {!isConfirmPasswordShown && <i className="fa fa-eye password-icon password-icon " onClick={this.toggleConfirmPasswordVisiblity}/>}
                      </div>
                      {errors.confirmPassword.length > 0 && (<span className="error">{errors.confirmPassword}.</span>)}
                    </Form.Group>
                  </Form>
                  <div className="d-flex justify-content-center w-100 updateRow">
                    <Button
                      className="btnReset"
                      type="submit"
                      onClick={this.onSubmit}
                    >
                      Reset your password
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <SweetAlert
          title="Error"
          show={this.state.showError}
          onConfirm={() => this.setState({showError: false})}
          onCancel={() => this.setState({showError: false})}
        >
          There was an error:
          <p className = "error">{this.state.errorText}</p>
        </SweetAlert>
      </div>
    );
  }
}
export default Reset;