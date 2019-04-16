import { Component } from 'react';
import { getUserInfo } from './utils/auth';
//import { includes as lodashIncludes } from 'lodash';

class PrivateComponent extends Component {

  render() {
    const userInfo = getUserInfo()
    const authData = (typeof userInfo === "object" && userInfo !== null && userInfo.blocked === false ) ? userInfo : {
      role: {
        name: "Not Authorised"
      }
    };
    return authData.manager ? this.props.children : "";
  }
}

export default PrivateComponent