import React, { Component } from 'react'
import { Layout, Table, Tag, Popconfirm, message, Icon } from 'antd'
import Frame from './Frame';
import { connect } from 'react-redux'
import request from './utils/request';


class Usuarios extends Component{

    state = {
        columns: [],
        extraColumnsA: [],
        extraColumnsB: []
    }

    componentDidMount() {
        const columns = [{
            title: 'Nombre de usuario',
            dataIndex: 'username',
            key: 'username',
        }, {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        }]

        const extraColumnsA = [{
            title: 'Manager',
            dataIndex: 'manager',
            render: bool => bool ? <Icon type="check-circle" theme="twoTone" twoToneColor="#eb2f96" twoToneColor="#52c41a"/> : <Icon type="close-circle" theme="twoTone" twoToneColor="#eb2f96"/>
        }]
        const extraColumnsB = [{
            title: 'Acción',
            key: 'action',
            render: (text, record) => (
              <span>
                <Popconfirm title={`¿Estás seguro de que deseas aceptar en ${record.equipo && record.equipo.nombre} a ${record.email}?`} onConfirm={evt => this.responderSolicitud(record, true)}>
                    <Tag color="green" key={`${record._id}_aceptar`}>Aceptar</Tag>
                </Popconfirm>
                <Popconfirm title={`¿Estás seguro de que deseas denegar la solicitud de ${record.email} para entrar en ${record.equipo && record.equipo.nombre}?`} onConfirm={evt => this.responderSolicitud(record, false)}>
                    <Tag color="volcano" key={`${record._id}_denegar`}>Denegar</Tag>
                </Popconfirm>
              </span>
            ),
        }]
        this.setState({ columns, extraColumnsA, extraColumnsB })
        if(this.props.usuarios){
            console.log("cdm")
            this.filtraUsuarios(this.props.usuarios)
        }
    }

    componentDidUpdate(prevProps){
        if(prevProps.usuarios !== this.props.usuarios){
            console.log("cdu")
            this.filtraUsuarios(this.props.usuarios)
        }
    }

    filtraUsuarios = usuarios => {
        const activos = this.props.usuarios.filter(u => u.confirmed).map(u => ({...u, key: u._id}))
        const pendientes = this.props.usuarios.filter(u => !u.confirmed).map(u => ({...u, key: u._id}))
        this.setState({ activos, pendientes })
    }
    responderSolicitud = (usuario, bool) => {
        if(bool){ //Aceptar
            request("/users/" + usuario._id, {
                method: "PUT",
                body: { confirmed: true }
            }).then(resp => {
                message.success(`¡${usuario.email} ahora forma parte del equipo ${usuario.equipo.nombre}!`)
                this.fetchUsers()
            }).catch(err => {
                console.error(err)
                message.error("Se ha producido un error durante la confirmación de la solicitud del usuario")                    
            })
        }
        else{ //Denegar
            request("/users/" + usuario._id, {
                method: "DELETE",
            }).then(resp => {
                message.info("La solicitud se ha denegado correctamente")
                this.fetchUsers()               
            }).catch(err => {
                message.error("Se ha producido un error durante la denegación de la solicitud del usuario")       
                console.error(err)
            })
        }
    }
    
    render(){
        const { activos, pendientes, columns, extraColumnsA, extraColumnsB } = this.state
        //console.log(columns)
        return(
            <Layout style={{height:"100vh"}}>
                <Frame>
                    <h1>Usuarios activos</h1>
                    <Table dataSource={activos} columns={[...columns, ...extraColumnsA]} />
                    <h1>Usuarios pendientes de aprobación</h1>
                    <Table dataSource={pendientes} columns={[...columns, ...extraColumnsB]} />
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

export default connect(mapStateToProps)(Usuarios)