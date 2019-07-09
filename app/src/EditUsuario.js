import React, { Component } from 'react'
import { getToken, getUserInfo } from './utils/auth';
import { Layout, Input, Form, Radio, Button, message, DatePicker, Tag, Icon, Divider, Switch, Select } from 'antd'
import { connect } from 'react-redux'
import request from './utils/request'
import Frame from './Frame';
import { fetchUsuarios, fetchES, fetchAuth } from './actions'
import PrivateComponent from './PrivateComponent';
import moment from 'moment';

class EditUsuario extends Component{

    state = {
        usuario: {},
        duracionjornada: "",
        frasesStr: "",
        frases: [],
        frasePr: "",
        frasePrAct: false,
        manager: undefined,
        inicioContrato: moment(),
        correccion: []
    }

    componentDidMount(){
        if(this.props.usuarios.length > 0){
            const usuario = this.props.usuarios.find(u => u._id === this.props.match.params.id) 
            console.log(usuario)
            this.setState({ 
                duracionjornada: usuario.duracionjornada,
                frasesStr: usuario.frases.reduce((a, b) => a + b + "\n", ""),
                frases: usuario.frases,
                frasePr: usuario.frasePrioritaria,
                frasePrAct: usuario.actFrasePrioritaria,
                correccion: usuario.correccion || [],
                tipocontrato: usuario.tipocontrato,
                inicioContrato: usuario.iniciocontrato ? moment(usuario.iniciocontrato) : null,
                finalContrato: usuario.finalcontrato ? moment(usuario.finalcontrato) : null,
                indefinido: usuario.indefinido,
                manager: usuario.manager,
                usuario
            })
        }
    }

    componentDidUpdate(prevProps, prevState){
        if(this.props.usuarios && this.props.usuarios !== prevProps.usuarios){
            const usuario = this.props.usuarios.find(u => u._id === this.props.match.params.id) 
            console.log(usuario)
            this.setState({ 
                duracionjornada: usuario.duracionjornada,
                frasesStr: usuario.frases.reduce((a, b) => a + b + "\n", ""),
                frases: usuario.frases,
                frasePr: usuario.frasePrioritaria,
                frasePrAct: usuario.actFrasePrioritaria,
                correccion: usuario.correccion || [],
                tipocontrato: usuario.tipocontrato,
                inicioContrato: usuario.iniciocontrato ? moment(usuario.iniciocontrato) : null,
                finalContrato: usuario.finalcontrato ? moment(usuario.finalcontrato) : null,
                indefinido: usuario.indefinido,
                manager: usuario.manager,
                usuario
            })
        }
        else if( this.state.frasesStr !== prevState.frasesStr ){
            this.setState({ frases: this.state.frasesStr.split(/\n/gm) })
        }
    }

    guardarFrases = () => {
        request("/users/" + this.state.usuario._id, {
            method: "PUT",
            body: {
                frases: this.state.frases.filter(f => ![undefined, null, ""].includes(f)),
                frasePrioritaria: this.state.frasePr,
                actFrasePrioritaria: this.state.frasePrAct,
            }
        }).then(data => {
            message.success("Los cambios se guardaron correctamente")
            this.props.dispatch(fetchUsuarios())
        }).catch(err => {
            console.log(err)
            message.error("Se produjo un error durante el guardado")
        })
    }

    guardarDatosSerios = () => {
        if(this.state.duracionjornada > 0 && this.state.duracionjornada < 24){
            request("/users/" + this.state.usuario._id, {
                method: "PUT",
                body: {
                    manager: this.state.manager,
                    duracionjornada: this.state.duracionjornada,
                    iniciocontrato: this.state.inicioContrato ? this.state.inicioContrato.utc().format() : undefined,
                    finalcontrato: this.state.finalContrato ? this.state.finalContrato.utc().format() : undefined,
                    indefinido: this.state.indefinido,
                    tipocontrato: this.state.tipocontrato,
                    correccion: this.state.correccion.filter(c => c.ano !== undefined && c.correccion !== undefined )
                }
            }).then(data => {
                //console.log(data)
                message.success("Los cambios se guardaron correctamente")
                this.props.dispatch(fetchES())
                this.props.dispatch(fetchUsuarios())
                this.props.dispatch(fetchAuth())
            }).catch(err => {
                console.log(err)
                message.error("Se produjo un error durante el guardado")
            })
        }
        else{
            message.error("La duración media de la jornada ha de estar entre 0 y 24")
        }
    }

    handleCorreccion = (valor, i, campo) => {
        let correccion = [...this.state.correccion]
        correccion[i][campo] = valor
        this.setState({  correccion })
    }

    render(){
        const { usuario, correccion } = this.state
        return(
            <Layout style={{height:"100vh"}}>
                <Frame isLogged={ getToken() ? true : false }>
                    <h1>{ usuario.username }</h1>
                    <PrivateComponent blue={this.props.blueCollar}>
                        <Form.Item key="editUserJornada" label="Duración media de su jornada laboral">
                            <Input type="number" value={this.state.duracionjornada} onChange={e => this.setState({ duracionjornada: e.target.value })} />
                        </Form.Item>
                        <Form.Item key="tipoContrato" label="Tipo de contrato">
                            <Select value={this.state.tipocontrato} onChange={tipocontrato => this.setState({ tipocontrato })} style={{ width: 300 }}>
                                <Select.Option value="contratado">Contratado</Select.Option>
                                <Select.Option value="practicas">Prácticas</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item key="inicioContrato" label="Fecha de inicio de contrato">
                            <DatePicker value={this.state.inicioContrato} onChange={inicioContrato => this.setState({ inicioContrato })} />
                        </Form.Item>
                        <Form.Item key="finalContrato" label="Fecha de final de contrato">
                            { !this.state.indefinido && (
                                <div>
                                    <DatePicker value={this.state.finalContrato} onChange={finalContrato => this.setState({ finalContrato })} />
                                    <br />
                                </div>
                            )}
                            <span>Indefinido&nbsp;<Switch checked={this.state.indefinido} onChange={e => this.setState({ indefinido: e })}/></span>
                        </Form.Item>
                        <Form.Item key="compensacionDias" label="Corrección de días de vacaciones">
                            { correccion.map((c, i) => (
                                <div style={{ display: "flex" }}>
                                    <Input 
                                        type="number" 
                                        placeholder="Año" 
                                        style={{ marginRight: 20 }} 
                                        value={ this.state.correccion[i].ano } 
                                        onChange={evt => this.handleCorreccion(evt.target.value, i, "ano")} 
                                    />
                                    <Input 
                                        type="number" 
                                        placeholder="Corrección" 
                                        style={{ marginRight: 20 }} 
                                        value={ this.state.correccion[i].correccion } 
                                        onChange={evt => this.handleCorreccion(evt.target.value, i, "correccion")} 
                                    />
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <Tag color="volcano" onClick={() => this.setState({ correccion: correccion.filter((c, j) => j !== i )})}>
                                            <Icon type="delete" />
                                        </Tag>
                                    </div>
                                </div>
                            ))}
                            <Button onClick={() => this.setState({ correccion: [...this.state.correccion, {}]})}>Añadir año</Button>
                        </Form.Item>
                        <Form.Item key="editUserManager" label="Manager">
                            <Radio.Group  value={ this.state.manager }>
                                <Radio.Button value={true} onClick={() => this.setState({ manager: true })}>Sí</Radio.Button>
                                <Radio.Button value={false} onClick={() => this.setState({ manager: false })}>No</Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                        <Button onClick={this.guardarDatosSerios}>Guardar datos del usuario</Button>
                        <Divider />
                    </PrivateComponent>
                    <Form.Item label="Frases (una por línea)">
                        <Input.TextArea rows={6} value={this.state.frasesStr} onChange={e => this.setState({ frasesStr: e.target.value })} />
                    </Form.Item>
                    <Form.Item label="Frase prioritaria">
                        <Input type="text" value={this.state.frasePr} onChange={e => this.setState({ frasePr: e.target.value })}/>
                        <Radio.Group value={ this.state.frasePrAct }>
                            <Radio.Button value={true} onClick={() => this.setState({ frasePrAct: true })}>Activada</Radio.Button>
                            <Radio.Button value={false} onClick={() => this.setState({ frasePrAct: false })}>Desactivada</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                    <Button onClick={this.guardarFrases}>Guardar frases</Button>
                </Frame>
            </Layout>
        )
    }
}

const mapStateToProps = state => {
    return {
        usuarios: state.usuarios,
        blueCollar: state.blueCollar
    }
}

export default connect(mapStateToProps)(EditUsuario)