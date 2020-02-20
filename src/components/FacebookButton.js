import React, { Component } from "react";
import { Auth } from "aws-amplify";

// Wait for the Facebook JS SDK to load
// Once loaded, enable the Login With Facebook button
function waitForInit() {
  return new Promise((res, rej) => {
    const hasFbLoaded = () => {
      if (window.FB) {
        res();
        console.log("SDK Loaded");
      } else {
        setTimeout(hasFbLoaded, 100);
      }
    };
    hasFbLoaded();
  });
}

export default class FacebookButton extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true
    };
  }

  async componentDidMount() {
    console.log("Mounted");
    await waitForInit();
    this.setState({ isLoading: false });
  }

  statusChangeCallback = response => {
    console.log("satusChangeCallback");
    if (response.status === "connected") {
      this.handleResponse(response.authResponse);
    } else {
      this.handleError(response);
    }
  };

  checkLoginState = () => {
    console.log("Checking login state");
    window.FB.getLoginStatus(this.statusChangeCallback);
  };

  handleClick = () => {
    console.log("Login to FB attempt");
    window.FB.login(this.checkLoginState, { scope: "public_profile, email" });
  };

  handleError(error) {
    console.log(error);
    alert(error);
  }

  async handleResponse(data) {
    const { email, accessToken: token, expiresIn } = data;
    const expires_at = expiresIn * 1000 + new Date().getTime();
    const user = { email };
    this.setState({ isLoading: true });

    try {
      console.log("Calling FB");
      const response = await Auth.federatedSignIn(
        "Facebook",
        { token, expires_at },
        user
      );
      this.setState({ isLoading: false });
      this.props.onLogin(response);
    } catch (e) {
      this.setState({ isLoading: false });
      this.handleError(e);
    }
  }

  render() {
    return (
      <div>
        <div>
          <button
            type="button"
            class="btn btn-primary"
            data-toggle="button"
            aria-pressed="false"
            autocomplete="off"
            onClick={this.handleClick}
            disabled={this.state.isLoading}
          >
            Login With Facebook
          </button>
        </div>
      </div>
    );
  }
}
