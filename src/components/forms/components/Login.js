/* eslint-disable */
import React, { Component } from "react";
import { Button, Form } from "react-bootstrap";
import TextField from "@material-ui/core/TextField";
import logo from "asserts/green-logo.png";
import "bootstrap/dist/css/bootstrap.min.css";
import SweetAlert from "react-bootstrap-sweetalert";
/**
 * @componentName Login
 * @description Component responsible for Login UI.
 */
class Login extends Component {
  constructor() {
    super();
    this.state = {
      username: "",
      password: "",
      showLoginError: false,
      isChecked: false,
      errorText: "",
      errors: {
        username: "",
        password: "",
      },
    };
  }

  /** After all the elements of the page are rendered correctly, 
    * the username from LocalStorage is displayed in the form if the user previously used 'remember me'
  * */
  componentDidMount() {
    this.props.isLogin(true);
    if (localStorage.checkbox === "true" && localStorage.username !== null) {
     this.setState({
       isChecked: true,
       username:localStorage.username
     })
    }
    if(this.props.auth.isAuthenticated) {
      window.location.href = "/monitoring";
    } 
   };

  /***Execute if props are changed - e.g. when an error occurs during the login*/
  componentDidUpdate(prevProps) {
    if (JSON.stringify(this.props.error) !== JSON.stringify(prevProps.error)) {
      this.setState({ showLoginError: true });
      this.setState({ errorText: this.props.error });
    }
  }

  /** used for storing username data in LocalStorage for 'remember me functionality */
  onChangeCheckbox = (event) => {
    this.setState({
      isChecked: event.target.checked,
    }, () => {
      if(this.state.username !=="" && this.state.isChecked === true) {
        localStorage.setItem('username', this.state.username);
        localStorage.setItem('checkbox', true);
      } 
    });
  };

  /** check user input in login form and warning handling */
  onChange = (event) => {
    event.preventDefault();
    const { name, value } = event.target;
    let errors = this.state.errors;

    switch (name) {
      case "username":
        errors.username = value.length === 0 ? "*Username is required" : "";
        break;
      case "password":
        errors.password = value.length < 8 ? "*Password must be at least 8 characters long" : "";
        break;
      default:
        break;
    }
    this.setState({ errors });
      if (name === "username") {
        this.setState({ [name]: value });
      }
      if (name === "password") {
        this.setState({ [name]: value });
      }
  };
  
  /** for login functionality; uses AWS-amplify; 
   * redirection depending on successfully login action and remembered previously used app tab */
  loginSubmit = async () => {
    let that = this;
    const username = that.state.username;
    const password = that.state.password;

    this.props.handleLogin(username, password);
  };

 /** used to render the React JSX content into our DOM. */
  render() {
    const {isChecked, errors } = this.state;
    
    return (
    !this.props.auth.isAuthenticated && 
      <div className="container-fluid" >
        <div className="row logContainer">
          <div className="col-md-12 tabWrapper">
            <div className="row colDiv" style={{ background: "white" }}>
              <div className="col imgWrapper">
                <img className="logoImage1" src={logo} alt="Logo" />
              </div>
              <div className="col loginWrp">
                <div className="col-md-8 mx-auto loginFormWrapper">
                  <h1 className="loginH1 logH1">Login</h1>
                  <h2 className="loginH2">
                    Welcome back! Please login to your account
                  </h2>
                  <Form className="loginForm align-items-center">
                    <Form.Group className="form-group">
                      <TextField
                        type="username"
                        name="username"
                        label="Username"
                        onChange={this.onChange}
                        value={this.state.username}
                      />
                      {errors.username.length > 0 && (<span className="error">{errors.username}</span>)}
                    </Form.Group>
                    <Form.Group className="form-group">
                      <TextField
                        type="password"
                        name="password"
                        label="Password"
                        onChange={this.onChange}
                      />
                      {errors.password.length > 0 && (<span className="error">{errors.password}</span>)}
                    </Form.Group>
                    <Form.Group className="form-group row">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="remember"
                          name="remember"
                          value="Remember me"
                          onChange={this.onChangeCheckbox}
                          checked={isChecked}
                        />
                        <label className="form-check-label">
                          Remember me
                        </label>
                      </div>
                      <div className="col text-right">
                        <Form.Label onClick={() =>(window.location.href = "/forgotpassword")}>
                          Forgot password
                        </Form.Label>
                      </div>
                    </Form.Group>
                  </Form>
                  <div className="d-flex justify-content-center w-100 updateRow">
                    <Button
                      className="btnLogin"
                      type="submit"
                      disabled={this.state.loginDisable}
                      onClick={this.loginSubmit}
                    >
                      Login
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <SweetAlert
          title="Error"
          show={this.state.showLoginError}
          onConfirm={() => this.setState({ showLoginError: false })}
          onCancel={() => this.setState({ showLoginError: false })}
        >
          There was a problem during an attempt to login:
          <p className="error">{this.state.errorText}</p>
        </SweetAlert>
      </div>
    );
  }
}

export default Login;
