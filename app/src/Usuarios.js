import React, { Component } from 'react'
import { Layout, Table, Tag, Popconfirm, message, Icon, Button, Modal } from 'antd'
import Frame from './Frame';
import { socketConnect } from 'socket.io-react';
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchUsuarios } from './actions'
import request from './utils/request';
import { getToken, getUserInfo } from './utils/auth';


class Usuarios extends Component{

    state = {
        columns: [],
        extraColumnsA: [],
        extraColumnsA2: [],
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

        const extraColumnsA = getUserInfo().manager ? [{
            title: 'Manager',
            dataIndex: 'manager',
            render: bool => bool ? <Icon type="check-circle" theme="twoTone" twoToneColor="#eb2f96" twoToneColor="#52c41a"/> : <Icon type="close-circle" theme="twoTone" twoToneColor="#eb2f96"/>
        }, {
            title: 'ID Tarjeta',
            key: 'idcard',
            render: (text, record) => {
                return record.idcard ? 
                    <div>
                        <span>{record.idcard}&nbsp;&nbsp;</span>
                        <Popconfirm title={`¿Estás seguro de que deseas desasociar la tarjeta de ${record.email}?`} onConfirm={evt => this.desasociarTarjeta(record)}>
                            <Tag color="volcano" key={`${record._id}_denegar`}><Icon type="delete" /></Tag>
                        </Popconfirm>
                    </div>
                    : <Button type="primary" onClick={() => this.setState({ modalAsociar: true, usuarioAsociar: record._id })}>Asociar tarjeta</Button>
            }
        }] : []
        
        const extraColumnsA2 = [{
            key: 'btn',
            render: (text, record) => (
                <Link to={"/usuario/" + record._id}>
                    <Tag key={`${record._id}_denegar`}><Icon type="user" /> Editar</Tag>
                </Link>
            )
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
        this.setState({ columns, extraColumnsA, extraColumnsA2, extraColumnsB })
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
                this.props.socket.on('notification', msg => {
                    console.log(msg)
                    if(!this.props.usuarios.map(u => u.idcard).includes(msg.es)){
                        request("/users/" + this.state.usuarioAsociar, {
                            method: "PUT",
                            body: {
                                idcard: msg.es && msg.es.idcard
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
                    }
                    else{
                        message.error("Esa tarjeta ya está asociada a un usuario. Desasociela antes de reasignarla.")
                    }
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

    desasociarTarjeta = usuario => {
        console.log(usuario)
        request("/users/" + usuario._id, {
            method: "PUT",
            body: {
                idcard: ""
            }
        }).then(() => this.fetchUsers())
    }
    
    render(){
        const { activos, pendientes, columns, extraColumnsA, extraColumnsA2, extraColumnsB } = this.state
        //console.log(columns)
        return(
            <Layout style={{height:"100vh"}}>
                <Frame isLogged={ getToken() ? true : false }>
                    <h1>Usuarios activos</h1>
                    <Table dataSource={activos} columns={[...columns, ...extraColumnsA, ...extraColumnsA2 ]} />
                    {
                        getUserInfo().manager && [
                            <h1 key="pendAprobTitle">Usuarios pendientes de aprobación</h1>,
                            <Table key="pendAprobTable" dataSource={pendientes} columns={[...columns, ...extraColumnsB]} />
                        ]
                    }
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