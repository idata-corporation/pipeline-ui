/* eslint-disable */
import React, { Component } from "react";
import {CognitoUserPool, CognitoUser, AuthenticationDetails} from 'amazon-cognito-identity-js';
import Login from 'components/forms/components/Login';
import ChangePassword from 'components/forms/components/ChangePassword';
/**
 * @componentName FirstTimeLogin
 * @description Rendered if user first-time visit app. 
 * For users added from AVS Cognito, the newPasswordRequired challenge must be performed. 
 * For each subsequent access to the app login page  is rendered
 */
const COGNITO_USER_APP_CLIENT_ID = process.env.REACT_APP_COGNITO_USER_APP_CLIENT_ID;
const COGNITO_USER_POOL_ID = process.env.REACT_APP_COGNITO_USER_POOL_ID;

class FirstTimeLogin extends Component {
  constructor() {
    super();
    this.state = {
      user: null,
      userAttr: null,
      isFirstLogin: false,
      authenticationError: ""
    }  
  }
  
  /**configure Cognito user pool*/
  getUserPool = () => {
      var poolData = { 
          UserPoolId : COGNITO_USER_POOL_ID,
          ClientId : COGNITO_USER_APP_CLIENT_ID
      };
      var userPool = new CognitoUserPool(poolData);
      return userPool
  };

  handleLogin = (username, password) => {
      const authDetails = new AuthenticationDetails({
        Username: username,
        Password: password,
      });
      const userData = {
        Username: username,
        Pool: this.getUserPool(),
      };
      const cognitoUser = new CognitoUser(userData);
      cognitoUser.authenticateUser(authDetails, {
        onSuccess: () => {
          window.location.href = "/monitoring";
        },
        onFailure: (err) => {
          console.log(err);
          this.setState({authenticationError: err.message} , () => console.log(this.state.authenticationError))
        },
        newPasswordRequired: userAttr => {
          delete userAttr.email_verified;
          this.setState({
            isFirstLogin: true,
            user: cognitoUser,
            userAttr: userAttr,
          });
        },
      });
  };

  
  changePassword = (newPassword) => {
      const cognitoUser = this.state.user;
      const userAttr = this.state.userAttr;
      cognitoUser.completeNewPasswordChallenge(newPassword, userAttr, {
      onSuccess: result => {
          window.location.href = "/monitoring";
      },  
      onFailure: (err) => {
        console.log(err);
        this.setState({authenticationError: err.message} , () => console.log(this.state.authenticationError))
        }
      });
  };
  
  /** used to render the React JSX content into our DOM. */
  render() {
    return (
      <div>
      {this.state.isFirstLogin ? (
        <ChangePassword changePassword={this.changePassword} error={this.state.authenticationError}/>
      ) : (
        <Login handleLogin={this.handleLogin} auth={this.props.auth}  isLogin={this.props.isLogin} error={this.state.authenticationError}/>
      )}
    </div>
    );
}
}

export default FirstTimeLogin;