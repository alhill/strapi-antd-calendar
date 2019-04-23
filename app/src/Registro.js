import React, { Component } from 'react'
import { Layout, Table } from 'antd'
import Frame from './Frame';
import request from './utils/request';
import { connect } from 'react-redux';
import { cargarUsuarios } from './actions'


class Registro extends Component{

    componentDidMount() {
        this.fetchES()
    }

    fetchES = async () => {

    }
    
    render(){
        // const { activos, pendientes, columns, extraColumnsA, extraColumnsB } = this.state
        return(
            <Layout style={{height:"100vh"}}>
                <Frame>
                    <h1>Usuarios activos</h1>
                    {/* <Table dataSource={activos} columns={[...columns, ...extraColumnsA]} /> */}
                    <h1>Usuarios pendientes de aprobación</h1>
                    {/* <Table dataSource={pendientes} columns={[...columns, ...extraColumnsB]} /> */}
                </Frame>
            </Layout>
        )
    }
}

const mapStateToProps = state => {
    return {
        usuarios: state.usuarios
    }
}

export default connect(mapStateToProps)(Registro)