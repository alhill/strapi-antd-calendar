import React, { Component } from 'react'
import { getToken } from './utils/auth';
import { Layout, Collapse, Form, Input, Select, Button, Tag, message, Table, Icon, Popconfirm, Modal } from 'antd'
import Frame from './Frame';
import { connect } from 'react-redux'
import request from './utils/request';
import { getUserInfo } from './utils/auth';
import { fetchGrupos } from './actions'

const reset = {
    users: []
}

class Grupos extends Component{

    state = {
        seleccionados: [],
        nombreNuevoGrupo: "",
        grupoEditar: reset
    }

    addSeleccionado = (u, esModal) => {
        if(esModal){
            const user = this.props.usuarios.find(user => user.username === u)
            this.setState({
                grupoEditar: {
                    ...this.state.grupoEditar,
                    users: [...this.state.grupoEditar.users, user]
                }
            })
        }
        else{
            this.setState({ seleccionados: [...new Set([...this.state.seleccionados, u])]})
        }
    }

    removeSeleccionado = (s, esModal) => {
        if(esModal){
            this.setState({
                grupoEditar: {
                    ...this.state.grupoEditar,
                    users: this.state.grupoEditar.users.filter(g => g._id !== s._id)
                }
            })
        }
        else{
            this.setState({ seleccionados: this.state.seleccionados.filter(sel => s !== sel)})
        }
    }

    crearGrupo = () => {
        if(this.state.nombreNuevoGrupo === ""){ message.warning("Es necesario introducir un nombre para el grupo")}
        else if(this.state.seleccionados.length === 0){ message.warning("No se han añadido usuarios al grupo") }
        else{
            const users = this.state.seleccionados.map(sel => this.props.usuarios.find(u => u.username === sel)).map(u => u._id)
            const equipo = getUserInfo().equipo

            request("/grupos", {
                method: "POST",
                body: {
                    nombre: this.state.nombreNuevoGrupo,
                    users,
                    equipo
                }
            }).then(data => {
                console.log(data)
                message.success("El grupo se creó correctamente")
                this.props.dispatch(fetchGrupos())
            }).catch(err => {
                console.log(err)
                message.error("Se produjo un error durante la creación del grupo")
            })
        }
    }
    
    borrarGrupo = grupo => {
        request("/grupos/" + grupo._id, { method: "DELETE" })
            .then(data => { this.props.dispatch(fetchGrupos()); message.success("El grupo se borró correctamente" ) })
            .catch(err => { console.log(err); message.error("Se produjo un error durante el borrado del grupo") })
    }

    editarGrupo = () => {
        const { nombre, users, _id } = this.state.grupoEditar
        request("/grupos/" + _id, {
            method: "PUT",
            body: { nombre, users }
        }).then(data => { 
            this.props.dispatch(fetchGrupos()); 
            message.success("El grupo se editó correctamente" ); 
            this.setState({ modalEdicion: false, grupoEditar: reset }) 
        }).catch(err => { console.log(err); message.error("Se produjo un error durante la edición del grupo") })
    }

    render(){
        const Panel = Collapse.Panel;
        return(
            <Layout style={{height:"100vh"}}>
                <Frame isLogged={ getToken() ? true : false }>
                    <h2>Grupos</h2>
                    <Table style={{ paddingBottom: 30 }} rowKey="_id" dataSource={this.props.grupos} columns={[
                        {
                            title: "Grupo",
                            dataIndex: "nombre",
                            key: "nombre"
                        },
                        {
                            title: "Usuarios",
                            dataIndex: "users",
                            render: (us) => us.map(u => <Tag key={"u" + u._id}>{u.username}</Tag>)
                        },
                        {
                            render: row => {
                                return (
                                    <div style={{ display: "flex", margin: 5 }}>
                                        <Tag color="blue" onClick={() => this.setState({ modalEdicion: true, grupoEditar: row })}><Icon type="edit" /></Tag>
                                        <Popconfirm
                                            title={`¿Seguro que deseas borrar el equipo ${row.nombre}?`}
                                            onConfirm={() => this.borrarGrupo(row)}
                                            okText="Aceptar"
                                            cancelText="Cancelar"
                                        >
                                            <Tag color="volcano"><Icon type="delete" /></Tag>
                                        </Popconfirm>
                                    </div>
                                )
                            }
                        }
                    ]} />
                    <Collapse>
                        <Panel key="nuevoGrupo" header="Nuevo grupo de usuarios">
                            <Form.Item label="Nombre del grupo">
                                <Input type="text" value={this.state.nombreNuevoGrupo} onChange={evt => this.setState({ nombreNuevoGrupo: evt.target.value }) }/>
                            </Form.Item>
                            <Form.Item label="Integrantes">
                                <Select style={{ width: "100%" }} onChange={evt => this.addSeleccionado(evt, false)}>
                                    {
                                        this.props.usuarios.map((u, i) => (
                                            <Select.Option key={"user" + i } value={u.username}>{ u.username }</Select.Option>
                                        ))
                                    }
                                </Select>
                            </Form.Item>
                            <div style={{ paddingBottom: 30 }}>
                                  {
                                      this.state.seleccionados.map((s, i) => (
                                          <Tag closable key={s} onClose={() => this.removeSeleccionado(s)}>{s}</Tag>
                                      ))
                                  }  
                            </div>
                            <Button onClick={this.crearGrupo}>Crear nuevo grupo</Button>
                        </Panel>
                    </Collapse>
                </Frame>
                <Modal
                    visible={this.state.modalEdicion}
                    footer={null}
                    onCancel={() => this.setState({ modalEdicion: false, grupoEditar: reset })}
                >
                    <h3>Editar grupo</h3>
                    <Form.Item label="Nombre del grupo">
                        <Input type="text" value={this.state.grupoEditar.nombre} onChange={evt => this.setState({ grupoEditar: {...this.state.grupoEditar, nombre: evt.target.value} }) }/>
                    </Form.Item>
                    <Form.Item label="Integrantes">
                        <Select style={{ width: "100%" }} onChange={evt => this.addSeleccionado(evt, true)}>
                            {
                                this.props.usuarios.map((u, i) => (
                                    <Select.Option key={"user" + i } value={u.username}>{ u.username }</Select.Option>
                                ))
                            }
                        </Select>
                    </Form.Item>
                    <div style={{ paddingBottom: 30 }}>
                            {
                                this.state.grupoEditar.users.map((s, i) => (
                                    <Tag closable key={s._id} onClose={() => this.removeSeleccionado(s, true)}>{s.username}</Tag>
                                ))
                            }  
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button style={{ paddingLeft: 20 }} onClick={this.editarGrupo}>Editar Grupo</Button>
                        <Button type="danger" onClick={() => this.setState({ modalEdicion: false, grupoEditar: reset })}>Cancelar</Button>
                    </div>
                </Modal>
            </Layout>
        )
    }
}

const mapStateToProps = state => ({
    usuarios: state.usuarios,
    grupos: state.grupos
})

export default connect(mapStateToProps)(Grupos)