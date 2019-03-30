import React, { Component } from 'react'
import { Layout } from 'antd'
import Frame from './Frame';


class Configuracion extends Component{
    render(){
        return(
            <Layout style={{height:"100vh"}}>
                <Frame>
                    <h1>Configuración</h1>
                </Frame>
            </Layout>
        )
    }
}

export default Configuracion