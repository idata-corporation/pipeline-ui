/* eslint-disable */
import React, { Component } from "react";
import Logo from "../asserts/logo.png";
import { Navbar, Nav, NavDropdown } from 'react-bootstrap'
import { Auth } from 'aws-amplify';

const REACT_APP_REQUIRE_LOGIN = process.env.REACT_APP_REQUIRE_LOGIN.toLowerCase() === 'true' ? true : false;

/**
 * @componentName Nav
 * @description This is a component responsible for Top Navbar
 */
class Nav1 extends Component {
  
  /**function called when user press sign out, use aws-amplify */
  signOut = async () => {
    try {
      await Auth.signOut({global: true});
      window.location.href = "/";
    } catch (error) {
      console.log('error signing out: ', error);
    }
  }

  render() {
    if (this.props.auth.isAuthenticated) {
      return (
        <Navbar bg="light" variant="light">
            <Navbar.Brand>
              <img
                alt="logo"
                src={Logo}
                className="img-responsive logo-img"
              />{' '}
              <div className="title">DATASET MONITORING</div>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
              <Nav className="ml-auto">
                <NavDropdown title={this.props.username} id="basic-nav-dropdown">
                <NavDropdown.Item href="/monitoring"><i className="fa fa-home"></i>Home</NavDropdown.Item>
                  <NavDropdown.Item href="/forgotpassword"><i className="fa fa-lock"></i>Reset password</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick = {() => this.signOut()}><i className="fa fa-sign-out" aria-hidden="true"></i>Logout</NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Navbar.Collapse>
        </Navbar>
      );
    } else {
      return (
        <Navbar bg="light" variant="light">
            <Navbar.Brand>
              <img
                alt="logo"
                src={Logo}
                className="img-responsive logo-img"
              />{' '}
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            {REACT_APP_REQUIRE_LOGIN === true && !this.props.isLogin && <Navbar.Collapse id="responsive-navbar-nav">
              <Navbar.Text className="ml-auto navBarLogin" onClick = {() => window.location.href = "/"}>
                Login
              </Navbar.Text>
          </Navbar.Collapse>}
        </Navbar>
      );
    }
  }
}

export default Nav1;