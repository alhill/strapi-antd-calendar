import React, { Component } from 'react'
import { Layout, Table, Tag, Popconfirm, message, Icon, Button, Modal } from 'antd'
import Frame from './Frame';
import { socketConnect } from 'socket.io-react';
import { connect } from 'react-redux'
import { fetchUsuarios } from './actions'
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
        }, {
            title: 'ID Tarjeta',
            key: 'idcard',
            render: (text, record) => {
                return record.idcard ? record.idcard : <Button type="primary" onClick={() => this.setState({ modalAsociar: true, usuarioAsociar: record._id })}>Asociar tarjeta</Button>
            }
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
            this.filtraUsuarios(this.props.usuarios) 
        }
    }

    componentDidUpdate(prevProps, prevState){
        if(prevProps.usuarios !== this.props.usuarios){
            this.filtraUsuarios(this.props.usuarios)
        }
        else if(prevState.modalAsociar !== this.state.modalAsociar){
            if( this.state.modalAsociar ){
                console.log("holi")
                this.props.socket.on('notification', msg => {
                    console.log(msg)
                    request("/users/" + this.state.usuarioAsociar, {
                        method: "PUT",
                        body: {
                            idcard: msg.es
                        }
                    }).then(data => {
                        message.info("La tarjeta ha sido asociada correctamente")
                        this.fetchUsers()
                        this.setState({ modalAsociar: false, usuarioAsociar: undefined })
                    }).catch(err => {
                        message.error("Se produjo un error durante el proceso de asociación de la tarjeta")
                        console.log(err)
                        this.setState({ modalAsociar: false, usuarioAsociar: undefined })
                    })
                })
            }
            else{
                this.props.socket.off('notification')
            }
        }
    }

    filtraUsuarios = usuarios => {
        const activos = this.props.usuarios.filter(u => u.confirmed).map(u => ({...u, key: u._id}))
        const pendientes = this.props.usuarios.filter(u => !u.confirmed).map(u => ({...u, key: u._id}))
        this.setState({ activos, pendientes })
    }

    fetchUsers = async () => {
        await this.props.dispatch(fetchUsuarios())
        this.filtraUsuarios(this.props.usuarios)
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
                <Modal
                    visible={this.state.modalAsociar}
                    onOk={e => e}
                    onCancel={() => this.setState({ modalAsociar: false, usuarioAsociar: undefined })}
                    footer={[
                        <Button key="back" type="primary" onClick={() => this.setState({ modalAsociar: false, usuarioAsociar: undefined })}>Cancelar</Button>,
                    ]}
                >
                    <p>Acerca la tarjeta al lector sin cerrar esta ventana para asociarla al usuario</p>
                </Modal>
            </Layout>
        )
    }
}

const mapStateToProps = state => {
    return {
        usuarios: state.usuarios
    }
}

export default socketConnect(connect(mapStateToProps)(Usuarios))