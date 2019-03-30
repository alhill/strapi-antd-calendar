import React, { Component } from 'react'
import { Layout } from 'antd'
import Frame from './Frame';


class Documentos extends Component{
    render(){
        return(
            <Layout style={{height:"100vh"}}>
                <Frame>
                    <h1>Documentos</h1>
                </Frame>
            </Layout>
        )
    }
}

export default Documentos