/* eslint-disable */
import React, { Component, useContext } from "react";
import TextField from "@material-ui/core/TextField";
import { Button, Form } from "react-bootstrap";
import logo from "asserts/green-logo.png";
import SweetAlert from "react-bootstrap-sweetalert";
/**
 * @componentName Change password
 * @description Component for changing the password after the first-time login for users added from AWS Cognito administrator.
 */
const validPasswordRegex = RegExp(/^(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+*!=]).*$/);

class Reset extends Component {
  constructor(props) {
    super(props)
    this.state = {
      username:'',
      password: '',
      confirmPassword: '',
      showError: false,
      errorText: '',
      errors: {
        username: '',
        password: '',
        confirmPassword: ''
      }
    }
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

   /***Execute if props are changed - e.g. when an error occurs during the login*/
  componentDidUpdate(prevProps) {
    if (JSON.stringify(this.props.error) !== JSON.stringify(prevProps.error)) {
      this.setState({ showError: true });
      this.setState({ errorText: this.props.error });
    }
  };

   /***Check if input fields are filled incorrectly, set error messages*/
  onChange(e) {
    e.preventDefault();
    const { name, value } = e.target;
    let errors = this.state.errors;

    switch (name) {
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

  onSubmit = e => {
    const { password, confirmPassword, errors } = this.state;
    errors.username = '';
    errors.password = '';
   
    if (password.length === 0) {
      errors.password = '*Password is required';
    }
    e.preventDefault()

    if (password !== confirmPassword) {
      errors.confirmPassword = '*Please enter the same password as above';
    } else {
      errors.confirmPassword = '';
      this.props.changePassword(password);
    }
    this.setState({ errors });
  };


  render() {
    const { password, errors } = this.state;
    return (
      <div className="container-fluid">
        <div className="row logContainer">
          <div className="col-md-12 tabWrapper">
            <div className="row colDiv" style={{ background: "white" }}>
              <div className="col imgWrapper">
                <img className="logoImage1" src={logo} alt="Logo" />
              </div>
              <div className="col loginWrp">
                <div className="col-md-8 mx-auto loginFormWrapper">
                  <h1 className="loginH1">Create new password </h1>
                  <h2 className="loginH2">
                    Please change your temporary password!
                  </h2>
                  <Form className="loginForm align-items-center">
                    <Form.Group className="form-group">
                      <TextField
                        id="password"
                        type="password"
                        name="password"
                        label="New Password"
                        placeholder="Enter the new password"
                        value={password}
                        onChange={this.onChange}
                      />
                      {errors.password.length > 0 && (<span className="error">{errors.password}.</span>)}

                    </Form.Group>
                    <Form.Group className="form-group">
                      <TextField
                        id="confirmPassword"
                        type="password"
                        name="confirmPassword"
                        label="Confirm password"
                        placeholder="Enter the new password again"
                        onChange={this.onChange}
                      />
                      {errors.confirmPassword.length > 0 && (<span className="error">{errors.confirmPassword}.</span>)}
                    </Form.Group>
                  </Form>
                  <div className="d-flex justify-content-center w-100 updateRow">
                    <Button
                      className="btnReset"
                      type="submit"
                      onClick={this.onSubmit}
                    >
                      Reset password
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
          onConfirm={() => this.setState({ showError: false })}
          onCancel={() => this.setState({ showError: false })}
        >
          There was an error:
          <p className = "error">{this.state.errorText}</p>
        </SweetAlert>
      </div>
    );
  }
}

export default Reset;