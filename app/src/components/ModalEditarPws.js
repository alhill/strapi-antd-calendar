import React, { Component } from 'react'
import { Modal, Form, Tag, Button, Input, Icon, Select, message } from 'antd';
import { fetchPws } from '../actions'
import PrivateComponent from '../PrivateComponent'
import request from '../utils/request'
import { connect } from 'react-redux'

class ModalEditarPws extends Component {
    state = {
        editNombre: "",
        editCampos: [{"" : ""}],
        editGrupos: [],
        editUsuarios: []
    }

    componentDidUpdate = (prevProps) => {
        if((prevProps.pwSelect !== this.props.pwSelect) && this.props.pwSelect){
            console.log(this.props.pwSelect)
            this.setState({
                editNombre: this.props.pwSelect.nombre,
                editCampos: Object.keys(this.props.pwSelect.datos).map((k, i) => ({[k]: this.props.pwSelect.datos[k]})),
                editGrupos: this.props.pwSelect.grupos.map(g => g.nombre),
                editUsuarios: this.props.pwSelect.users.map(u => u.username)
            })
        }
    }

    handleRepeater = (txt, i, cual) => {
        const campoEdit = this.state.editCampos[i]
        const prevKey = Object.keys(campoEdit)[0]
        const prevValue = Object.values(campoEdit)[0]

        if(cual === "key"){
            campoEdit[txt] = prevValue
            delete campoEdit[prevKey]
        }
        else if(cual === "value"){
            campoEdit[Object.keys(campoEdit)[0]] = txt
        }

        const editCampos = this.state.editCampos.map((c, j) => {
            if(i === j){ return campoEdit }
            else{ return c }
        })

        this.setState({ editCampos })
    }

    editarEntrada = () => {

        const users = this.state.editUsuarios.map(eu => this.props.usuarios.find(u => u.username === eu)._id)
        const grupos = this.state.editGrupos.map(eg => this.props.grupos.find(g => g.nombre === eg)._id)
        const datos = this.state.editCampos.reduce((a, b) => ({...a, ...b}), {})

        if(this.state.editCampos.length > Object.keys(datos).length ){
            message.warning("No puede haber dos campos con el mismo identificador")
        }
        else{
            if( grupos.length === 0 && users.length === 0){
                message.info("La entrada no ha sido asignada a nadie, estará solo disponible para administradores")
            }
            request("/pws/" + this.props.pwSelect._id, {
                method: "PUT",
                body: {
                    nombre: this.state.editNombre,
                    datos,
                    users,
                    grupos
                }
            }).then(data => {
                message.success("La entrada se editó correctamente")
                this.props.dispatch(fetchPws())
                this.setState({        
                    editNombre: "",
                    editCampos: [{"" : ""}],
                    editGrupos: [],
                    editUsuarios: []
                })
                this.props.cb()
            }).catch(err => { 
                console.log(err); 
                message.error("Ocurrió un error durante la edición de la entrada")
            })
        }
    }

    render(){
        const Item = Form.Item;
        const Option = Select.Option;
        return (
            <Modal
                visible={this.props.visible}
                footer={null}
                onCancel={this.props.cb}
                width="80vw"
            >
                <h2>{ this.props.pwSelect.nombre }</h2>
                <div>
                    <Item label="Nombre de la entrada">
                        <Input type="text" value={ this.state.editNombre } onChange={evt => this.setState({ editNombre: evt.target.value })} />
                    </Item>
                    <Item label="Campos">
                        {
                            this.state.editCampos.map((c, i) => {
                                return (
                                    <div key={"campo" + i} style={{ display: "flex" }}>
                                        <Item label="Identificador" style={{ flex: 1, paddingRight: "1em" }}>
                                            <Input type="text" value={ Object.keys(c)[0] } onChange={evt => this.handleRepeater(evt.target.value, i, "key")} />
                                        </Item>
                                        <Item label="Valor" style={{ flex: 1, paddingRight: "1em" }}>
                                            <Input type="text" value={ Object.values(c)[0] } onChange={evt => this.handleRepeater(evt.target.value, i, "value")} />
                                        </Item>
                                        { this.state.editCampos.length > 1 &&
                                            <Item label=" " colon={false}>
                                                <Tag color="volcano" onClick={() => this.setState({ editCampos: this.state.editCampos.filter((e, it) => it !== i)})}>
                                                    <Icon type="delete" />
                                                </Tag>
                                            </Item>
                                        }
                                    </div>
                                )
                            })
                        }
                        <Tag onClick={() => this.setState({ editCampos: [...this.state.editCampos, {"" : ""}]})}><Icon type="plus" /> Nuevo campo</Tag>
                    </Item>
                    <PrivateComponent blue={this.props.blue}>
                        <Item label="Asignar a grupos">
                            <Select style={{ width: "100%" }} onChange={evt => this.setState({ editGrupos: [...new Set([...this.state.editGrupos, evt])]})}>
                                {
                                    this.props.grupos.map((g, i) => (
                                        <Option key={"grupo" + i } value={g.nombre}>{ g.nombre }</Option>
                                    ))
                                }
                            </Select>
                            <div style={{ paddingBottom: 30 }}>
                                {
                                    this.state.editGrupos.map((g, i) => (
                                        <Tag closable key={"gtag" + g} onClose={() => this.setState({ editGrupos: this.state.editGrupos.filter(h => h !== g) })}>{g}</Tag>
                                    ))
                                }  
                            </div>
                        </Item>
                        <Item label="Asignar a usuarios">
                            <Select style={{ width: "100%" }} onChange={evt => this.setState({ editUsuarios: [...new Set([...this.state.editUsuarios, evt])]})}>
                                {
                                    this.props.usuarios.map((u, i) => (
                                        <Option key={"user" + i } value={u.username}>{ u.username }</Option>
                                    ))
                                }
                            </Select>
                            <div style={{ paddingBottom: 30 }}>
                                {
                                    this.state.editUsuarios.map((u, i) => (
                                        <Tag closable key={"utag" + u} onClose={() => this.setState({ editUsuarios: this.state.editUsuarios.filter(v => v !== u) })}>{u}</Tag>
                                    ))
                                }  
                            </div>
                        </Item>
                    </PrivateComponent>
                    <Button onClick={this.editarEntrada}>Editar entrada</Button>
                </div>
            </Modal>
        )
    }
}

export default connect()(ModalEditarPws)
