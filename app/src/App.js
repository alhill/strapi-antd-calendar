import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Login from "./Login"
import Register from "./Register"
import FourOhFour from "./FourOhFour"
import 'antd/dist/antd.css';
import { LocaleProvider } from 'antd';
import esES from 'antd/lib/locale-provider/es_ES';
import moment from 'moment';
import 'moment/locale/es';
import { SocketProvider } from 'socket.io-react';
import io from 'socket.io-client';
import { PrivateRoute } from './PrivateRoute';
import Home from "./Home"
import Calendario from "./Calendario"
import NuevoUsuario from './NuevoUsuario';
import Documentos from './Documentos';
import Usuarios from './Usuarios';
import Analitica from './Analitica';
import Registro from './Registro';
import Configuracion from './Configuracion';
import { Provider } from 'react-redux';
import { getUserInfo } from './utils/auth'
import store from './store';
import { fetchCalendario, fetchUsuarios, fetchES } from './actions'
moment.locale('es');

const socket = io.connect(process.env.REACT_APP_API_URL);

class App extends Component {
  componentDidMount(){
    if( getUserInfo() ){
      store.dispatch(fetchUsuarios())
      store.dispatch(fetchCalendario())
      store.dispatch(fetchES())
    }
  }
  render() {
    return (
      <Provider store={store}>
        <LocaleProvider locale={esES}>
          <SocketProvider socket={socket}>
            <BrowserRouter>
              <Switch>
                <Route exact path="/login" component={Login} />
                <Route exact path="/register" component={Register} />
                <PrivateRoute exact path="/calendario" component={Calendario} />
                <PrivateRoute exact path="/documentos" component={Documentos} />
                <PrivateRoute onlyManager={true} exact path="/usuarios" component={Usuarios} />
                <PrivateRoute onlyManager={true} exact path="/analitica" component={Analitica} />
                <PrivateRoute onlyManager={true} exact path="/configuracion" component={Configuracion} />
                <PrivateRoute exact path="/registro" component={Registro} />
                <PrivateRoute exact path="/nuevousuario" component={NuevoUsuario} />
                <PrivateRoute exact path="/" component={Home} />
                <Route path="" component={FourOhFour} />
              </Switch>
            </BrowserRouter>
          </SocketProvider>
        </LocaleProvider>
      </Provider>
    );
  }
}

export default App;
