import React, { Component } from 'react'
import { Layout, Collapse, Form, Input, Tag, Icon, Select, Button, message, Table, Popconfirm, Modal } from 'antd'
import Frame from './Frame';
import ModalEditarPws from './components/ModalEditarPws'
import { getToken, getUserInfo } from './utils/auth'
import { connect } from 'react-redux'
import request from './utils/request';
import { fetchPws } from './actions';
import PrivateComponent from './PrivateComponent';

class Passwords extends Component{
    
    state = {
        nuevaNombre: "",
        nuevaCampos: [{"username" : ""}, {"password": ""}],
        nuevaGrupos: [],
        nuevaUsuarios: [],
        modalPw: false,
        pwSelect: {
            datos: {}
        }
    }

    txtRefs = []

    componentDidMount(){
        if(this.props.pws.length > 0 && this.props.auth){
            this.setState({ pws: this.filtraPw() })
        }
    }
    componentDidUpdate(prevProps){
        if((prevProps.pws !== this.props.pws || this.props.blueCollar !== prevProps.blueCollar) && this.props.auth){
            this.setState({ pws: this.filtraPw() })
        }
    }

    filtraPw = () => {
        const pwFiltradas = this.props.pws.filter(pw => {
            const arrayGruposPw = pw.grupos.map(g => g._id)
            const arrayGruposUser = this.props.auth.grupos.map(g => g._id)
            const esGrupo = arrayGruposPw.filter(gp => arrayGruposUser.includes(gp)).length > 0
            const esUsuario = pw.users.map(u => u._id).includes(this.props.auth._id)
            const esManager = this.props.auth.manager && !this.props.blueCollar
            return esGrupo || esUsuario || esManager
        })
        return pwFiltradas
    }

    handleRepeater = (txt, i, cual) => {
        const campoEdit = this.state.nuevaCampos[i]
        const prevKey = Object.keys(campoEdit)[0]
        const prevValue = Object.values(campoEdit)[0]

        if(cual === "key"){
            campoEdit[txt] = prevValue
            delete campoEdit[prevKey]
        }
        else if(cual === "value"){
            campoEdit[Object.keys(campoEdit)[0]] = txt
        }

        const nuevaCampos = this.state.nuevaCampos.map((c, j) => {
            if(i === j){ return campoEdit }
            else{ return c }
        })

        this.setState({ nuevaCampos })
    }

    nuevaEntrada = () => {

        const users = this.state.nuevaUsuarios.map(nu => this.props.usuarios.find(u => u.username === nu)._id)
        const grupos = this.state.nuevaGrupos.map(ng => this.props.grupos.find(g => g.nombre === ng)._id)
        const datos = this.state.nuevaCampos.reduce((a, b) => ({...a, ...b}), {})

        if(this.state.nuevaCampos.length > Object.keys(datos).length ){
            message.warning("No puede haber dos campos con el mismo identificador")
        }
        else{
            if( grupos.length === 0 && users.length === 0){
                message.info("La contraseña no ha sido asignada a nadie, estará solo disponible para administradores")
            }
            request("/pws", {
                method: "POST",
                body: {
                    nombre: this.state.nuevaNombre,
                    datos,
                    users,
                    grupos,
                    equipo: getUserInfo().equipo
                }
            }).then(data => {
                message.success("La entrada se guardó correctamente")
                this.props.dispatch(fetchPws())
                this.setState({        
                    nuevaNombre: "",
                    nuevaCampos: [{"username" : ""}, {"password": ""}],
                    nuevaGrupos: [],
                    nuevaUsuarios: []
                })
            }).catch(err => { 
                console.log(err); 
                message.error("Ocurrió un error durante el guardado de la entrada")
            })
        }
    }

    borrarEntrada = pw => {
        console.log(pw)
        request("/pws/" + pw._id, { method: "DELETE" })
            .then(data => {
                message.success("La entrada se eliminó correctamente")
                this.props.dispatch(fetchPws())
            }).catch(err => {
                console.log(err)
                message.error("Se produjo un error durante el borrado de la entrada")
            })
    }

    render(){
        const Panel = Collapse.Panel;
        const Item = Form.Item;
        const Option = Select.Option;
        return(
            <Layout style={{height:"100vh"}}>
                <Frame isLogged={ getToken() ? true : false }>
                    <h2>Contraseñas</h2>
                    <Table 
                        style={{ paddingBottom: 30 }} 
                        rowKey="_id" 
                        dataSource={this.state.pws} 
                        onRow={row => ({
                            onClick: () => this.setState({ modalPw: true, pwSelect: row })
                        })}
                        columns={[
                            {
                                title: "Entrada",
                                dataIndex: "nombre",
                                key: "nombre"
                            },
                            {
                                title: "Asignada a",
                                render: row => [...row.grupos, ...row.users].map((e, i) => <Tag key={e._id + "-" + i} style={{ margin: "2px" }}>{e.username ? e.username : e.nombre}</Tag>),
                                key: "asignadaA"
                            },
                            {
                                title: "",
                                key: "btnConsulta",
                                render: pwSelect => (
                                    <div style={{ display: "flex", justifyContent: "flex-end"}}>
                                        <div style={{ display: "flex" }}>
                                            <PrivateComponent blue={this.props.blueCollar}>
                                                <Popconfirm title="Se borrará la entrada. ¿Quieres continuar?"
                                                    onConfirm={() => this.borrarEntrada(pwSelect)}
                                                    okText="Aceptar"
                                                    cancelText="Cancelar"
                                                >
                                                    <Tag color="volcano" onClick={() => this.setState({ pwSelect })}><Icon type="delete" /> Eliminar</Tag>
                                                </Popconfirm>
                                            </PrivateComponent>
                                            <Tag color="gold" onClick={() => this.setState({ modalEditarPws: true, pwSelect })}><Icon type="edit" /> Editar</Tag>
                                        </div>
                                        <Tag color="blue" onClick={() => this.setState({ modalPw: true, pwSelect })}><Icon type="search" /> Consultar</Tag>
                                    </div>
                                )
                            }
                        ]} 
                    />

                    <Collapse>
                        <Panel key="nueva" header="Nueva entrada">
                            <Item label="Nombre de la entrada">
                                <Input type="text" value={ this.state.nuevaNombre } onChange={evt => this.setState({ nuevaNombre: evt.target.value })} />
                            </Item>
                            <Item label="Campos">
                                {
                                    this.state.nuevaCampos.map((c, i) => {
                                        return (
                                            <div key={"campo" + i} style={{ display: "flex" }}>
                                                <Item label="Identificador" style={{ flex: 1, paddingRight: "1em" }}>
                                                    <Input type="text" value={ Object.keys(c)[0] } onChange={evt => this.handleRepeater(evt.target.value, i, "key")} />
                                                </Item>
                                                <Item label="Valor" style={{ flex: 1, paddingRight: "1em" }}>
                                                    <Input type="text" value={ Object.values(c)[0] } onChange={evt => this.handleRepeater(evt.target.value, i, "value")} />
                                                </Item>
                                                { this.state.nuevaCampos.length > 1 &&
                                                    <Item label=" " colon={false}>
                                                        <Tag color="volcano" onClick={() => this.setState({ nuevaCampos: this.state.nuevaCampos.filter((e, it) => it !== i)})}>
                                                            <Icon type="delete" />
                                                        </Tag>
                                                    </Item>
                                                }
                                            </div>
                                        )
                                    })
                                }
                                <Tag onClick={() => this.setState({ nuevaCampos: [...this.state.nuevaCampos, {"" : ""}]})}><Icon type="plus" /> Nuevo campo</Tag>
                            </Item>
                                <Item label="Asignar a grupos">
                                    <Select style={{ width: "100%" }} onChange={evt => this.setState({ nuevaGrupos: [...new Set([...this.state.nuevaGrupos, evt])]})}>
                                        {
                                            this.props.grupos.map((g, i) => (
                                                <Option key={"grupo" + i } value={g.nombre}>{ g.nombre }</Option>
                                            ))
                                        }
                                    </Select>
                                    <div style={{ paddingBottom: 30 }}>
                                        {
                                            this.state.nuevaGrupos.map((g, i) => (
                                                <Tag closable key={"gtag" + g} onClose={() => this.setState({ nuevaGrupos: this.state.nuevaGrupos.filter(h => h !== g) })}>{g}</Tag>
                                            ))
                                        }  
                                    </div>
                                </Item>
                                <Item label="Asignar a usuarios">
                                    <Select style={{ width: "100%" }} onChange={evt => this.setState({ nuevaUsuarios: [...new Set([...this.state.nuevaUsuarios, evt])]})}>
                                        {
                                            this.props.usuarios.map((u, i) => (
                                                <Option key={"user" + i } value={u.username}>{ u.username }</Option>
                                            ))
                                        }
                                    </Select>
                                    <div style={{ paddingBottom: 30 }}>
                                        {
                                            this.state.nuevaUsuarios.map((u, i) => (
                                                <Tag closable key={"utag" + u} onClose={() => this.setState({ nuevaUsuarios: this.state.nuevaUsuarios.filter(v => v !== u) })}>{u}</Tag>
                                            ))
                                        }  
                                    </div>
                                </Item>
                            <Button onClick={this.nuevaEntrada}>Guardar entrada</Button>
                        </Panel>
                    </Collapse>
                </Frame>
                <Modal
                    visible={this.state.modalPw}
                    footer={null}
                    onCancel={() => this.setState({ modalPw: false })}
                >
                    <h2>{ this.state.pwSelect.nombre }</h2>
                    <Table 
                        showHeader={false} 
                        pagination={false} 
                        size="small" 
                        rowKey="zzzzz"
                        dataSource={Object.keys(this.state.pwSelect.datos).map((k, i) => ({[k]: this.state.pwSelect.datos[k], zzzzz: i}))} 
                        columns={[
                            {
                                title: "Identificador",
                                key: row => Object.keys(row)[0],
                                render: row => Object.keys(row)[0]
                            },
                            {
                                title: "Valor",
                                render: row => Object.values(row)[0]
                            },
                            {
                                title: "",
                                render: row => <div style={{ display: "flex", justifyContent: "flex-end" }}><Button onClick={() => { 
                                    navigator.clipboard.writeText(Object.values(row)[0]) 
                                    message.info("Se ha copiado la clave en el portapapeles")
                                }}>Copiar</Button></div>
                            }
                        ]}
                    />
                </Modal>
                <ModalEditarPws
                    visible={this.state.modalEditarPws}
                    cb={() => this.setState({ modalEditarPws: false })}
                    pwSelect={this.state.pwSelect}
                    grupos={this.props.grupos}
                    usuarios={this.props.usuarios}
                    blue={this.props.blueCollar}
                />
            </Layout>
        )
    }
}

const mapStateToProps = state => ({
    grupos: state.grupos,
    usuarios: state.usuarios,
    pws: state.pws,
    auth: state.auth,
    blueCollar: state.blueCollar
})

export default connect(mapStateToProps)(Passwords)