import React, { Component } from 'react'
import { getToken } from './utils/auth';
import { Layout, Collapse } from 'antd'
import Frame from './Frame';
import ModuloFestivos from './modulosConfig/ModuloFestivos';
import ModuloRegistros from './modulosConfig/ModuloRegistros';


class Configuracion extends Component{

    state = {}

    render(){
        const Panel = Collapse.Panel;
        return(
            <Layout style={{height:"100vh"}}>
                <Frame isLogged={ getToken() ? true : false }>
                    <h1>Configuración</h1>
                    <Collapse>
                        <Panel header="Añadir registros">
                            <ModuloRegistros />
                        </Panel>
                    </Collapse>
                    <Collapse>
                        <Panel header="Gestionar festivos">
                            <ModuloFestivos />
                        </Panel>
                    </Collapse>
                </Frame>
            </Layout>
        )
    }
}

export default Configuracion