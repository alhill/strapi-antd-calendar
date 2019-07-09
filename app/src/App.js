import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Login from "./Login"
import Register from "./Register"
import FourOhFour from "./FourOhFour"
import 'antd/dist/antd.css';
import { LocaleProvider } from 'antd';
import es_ES from 'antd/lib/locale-provider/es_ES';
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
import EditUsuario from './EditUsuario';
import Analitica from './Analitica';
import Registro from './Registro';
import Perfil from './Perfil';
import Grupos from './Grupos';
import Passwords from './Passwords';
import Configuracion from './Configuracion';
import { Provider } from 'react-redux';
import { getUserInfo } from './utils/auth'
import store from './store';
import { fetchCalendario, fetchUsuarios, fetchES, fetchDocumentos, fetchGrupos, fetchPws, fetchAuth, fetchEntradas } from './actions'
import Exportacion from './Exportacion';

moment.locale('es');

const socket = io.connect(process.env.REACT_APP_API_URL, {
  transports: [ 'websocket' ]
});

class DebugRouter extends BrowserRouter {
  constructor(props){
    super(props);
    console.log('initial history is: ', JSON.stringify(this.history, null,2))
    this.history.listen((location, action)=>{
      console.log(
        `The current URL is ${location.pathname}${location.search}${location.hash}`
      )
      console.log(`The last navigation action was ${action}`, JSON.stringify(this.history, null,2));
    });
  }
}

class App extends Component {
  componentDidMount(){
    const userInfo = getUserInfo()
    if( userInfo && userInfo.equipo ){
      store.dispatch(fetchAuth())
      store.dispatch(fetchUsuarios())
      store.dispatch(fetchCalendario())
      store.dispatch(fetchES())
      store.dispatch(fetchEntradas())
      store.dispatch(fetchDocumentos())
      store.dispatch(fetchGrupos())
      store.dispatch(fetchPws())
    }
  }
  render() {
    return (
      <Provider store={store}>
        <LocaleProvider locale={es_ES}>
          <SocketProvider socket={socket}>
            <BrowserRouter>
              <Switch>
                <Route exact path="/login" component={Login} />
                <Route exact path="/register" component={Register} />
                <PrivateRoute exact path="/calendario" component={Calendario} />
                <PrivateRoute exact path="/archivos" component={Documentos} />
                <PrivateRoute exact path="/perfil" component={Perfil} />
                <PrivateRoute exact path="/usuarios" component={Usuarios} />
                <PrivateRoute exact path="/passwords" component={Passwords} />
                <PrivateRoute onlyManager={true} exact path="/analitica" component={Analitica} />
                <PrivateRoute onlyManager={true} exact path="/grupos" component={Grupos} />
                <PrivateRoute onlyManager={true} exact path="/configuracion" component={Configuracion} />
                <PrivateRoute onlyManager={true} exact path="/exportacion" component={Exportacion} />
                <PrivateRoute exact path="/usuario/:id" component={EditUsuario} />
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
