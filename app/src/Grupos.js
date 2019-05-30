import React, { Component } from 'react'
import { getToken } from './utils/auth';
import { Layout, Collapse } from 'antd'
import Frame from './Frame';


class Grupos extends Component{

    state = {}

    render(){
        const Panel = Collapse.Panel;
        return(
            <Layout style={{height:"100vh"}}>
                <Frame isLogged={ getToken() ? true : false }>
                    <h1>Configuración</h1>
                    <Collapse defaultActiveKey={["grupos"]}>
                        <Panel key="grupos" header="Grupos de usuarios">
                        
                        </Panel>
                        <Panel key="nuevoGrupo" header="Nuevo grupo de usuarios">
                            
                        </Panel>
                    </Collapse>
                </Frame>
            </Layout>
        )
    }
}

export default Grupos