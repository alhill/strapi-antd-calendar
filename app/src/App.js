import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Home from "./Calendar"
import Login from "./Login"
import Register from "./Register"
import FourOhFour from "./FourOhFour"
import 'antd/dist/antd.css';
import { LocaleProvider } from 'antd';
import esES from 'antd/lib/locale-provider/es_ES';
import moment from 'moment';
import 'moment/locale/es';
import { PrivateRoute } from './PrivateRoute';
import NuevoUsuario from './NuevoUsuario';
moment.locale('es');

class App extends Component {
  render() {
    return (
      <LocaleProvider locale={esES}>
        <BrowserRouter>
          <Switch>
            <Route exact path="/login" component={Login} />
            <Route exact path="/register" component={Register} />
            <PrivateRoute exact path="/calendario" component={Home} />
            <PrivateRoute exact path="/nuevousuario" component={NuevoUsuario} />
            <PrivateRoute exact path="/" component={Home} />
            <Route path="" component={FourOhFour} />
          </Switch>
        </BrowserRouter>
      </LocaleProvider>
    );
  }
}

export default App;
