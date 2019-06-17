import React, { Component } from 'react'
import { Modal, Form, Table, Button, TimePicker, message, Icon, Popconfirm, Tag } from 'antd';
import { connect } from 'react-redux'
import moment from 'moment'
import { fetchES } from '../actions'
import { getUserInfo, getToken } from '../utils/auth';
import request from '../utils/request';

class ModalInfoRegistros extends Component {
    state = {
        datos: {},
        datosMod: {},
        modificado: false,
        nuevosRegistros: [],
        hora: moment(),
        columns: [],
        extraColumns: []
    }

    componentDidMount(){
        this.cargaColumnas()
    }

    componentDidUpdate(prevProps) {
        if((prevProps.datos !== this.props.datos) && this.props.datos){
            this.setState({ datos: this.props.datos, datosMod: this.props.datos })
            this.cargaColumnas()
        }
    }

    cargaColumnas = () => {
        const columns = [
            { 
                key: "a",
                title: "Hora",
                render: row => moment(row.fecha).format("HH:mm")
            },
            {
                key: "b",
                title: "Evento",
                render: (row, mierda, i) => {
                    if(i === 0){ return "Entrada" }
                    else if(i % 2){ 
                        if(i === this.state.datosMod.registros.length - 1){ return "Salida" }
                        else{ return "Comienzo de descanso" }
                    }
                    else{ return "Final de descanso"}
                }
            }
        ]
        const extraColumns = this.props.colAprobado ? [{
            key: "c",
            title: "Aprobado",
            render: row => (
                    row.aprobado ? <Icon type="check-circle" theme="twoTone" twoToneColor="#eb2f96" twoToneColor="#52c41a"/> : (getUserInfo().manager && !this.props.blueCollar) ?
                    <span>
                        <Popconfirm title={`¿Estás seguro de que deseas aprobar la jornada?`} onConfirm={() => this.jornadaPendiente(true, row)}>
                            <Tag color="green" key={`${row._id}_aceptar`}>Aceptar</Tag>
                        </Popconfirm>
                        <Popconfirm title={`¿Estás seguro de que deseas denegar jornada?`} onConfirm={() => this.jornadaPendiente(false, row)}>
                            <Tag color="volcano" key={`${row._id}_denegar`}>Denegar</Tag>
                        </Popconfirm>
                    </span> : <Icon type="close-circle" theme="twoTone" twoToneColor="#eb2f96"/>                  
            )
        }] : []
        this.setState({ columns, extraColumns })
    }

    addRegistro = () => {
        const fecha = this.state.hora
            .date(moment(this.state.datos.entrada).date())
            .month(moment(this.state.datos.entrada).month())
            .year(moment(this.state.datos.entrada).year())

        if(fecha.isSameOrBefore(moment())){
            const registros = [
                ...this.state.datosMod.registros,
                { fecha: fecha.utc().format() }
            ].sort((a, b) => {
                if(moment(a.fecha).isBefore(moment(b.fecha))){ return -1 }
                else if(moment(a.fecha).isAfter(moment(b.fecha))){ return 1 }
                else{ return 0 }
            })


            this.setState({ 
                modificado: true,
                datosMod: {
                    ...this.state.datosMod, 
                    registros
                },
                nuevosRegistros: [...this.state.nuevosRegistros, {
                    fecha: this.state.hora.utc().format(),
                    user: this.state.datos.registros[0].user._id,
                    ultimoEditor: getUserInfo()._id,
                    aprobado: getUserInfo().manager ? true : false
                }]
            })
        }
        else{
            message.warning("No se pueden añadir registros por adelantado")
        }
    }

    guardarNuevosRegistros = () => {
        const n = this.state.nuevosRegistros.length
        const registros = this.state.nuevosRegistros
        Modal.confirm({
            title: `Por razones legales no es posible editar ni borrar registros. ¿Estás seguro de que quieres añadir ${ n>1 ? n : "un" } nuevo${ n>1 ? "s" : ""} registro${ n>1 ? "s" : ""}?`,
            onOk: async () => {
                const prom = registros.map(r => (
                    fetch(process.env.REACT_APP_API_URL + "/registros", {
                        method: "POST",
                        headers: {
                            "Authorization": "Bearer " + getToken(),
                            "Accept": "application/json",
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(r)
                    }).catch(err => err)
                ))
                const resp = (await Promise.all(prom)).map(r => r.status)
                if(resp.some(r => r >= 400)){ 
                    message.error("Se ha producido un error durante el guardado de los registros"); 
                    console.log(resp) 
                }
                else{ 
                    message.success("Los nuevos registros se añadieron correctamente") 
                    this.setState({ modificado: false, nuevosRegistros: [] })
                    Modal.destroyAll()
                }
            }
        })
    }

    jornadaPendiente = (accion, dato) => {
        if(accion === true){
            request("/registros/" + dato._id, {
                method: "PUT",
                body: {
                    aprobado: true
                }
            }).then(data => {
                //console.log(data)
                message.success("Se ha aprobado el registro correctamente")
                this.props.dispatch(fetchES())
                this.setState({ datosMod: {
                    ...this.state.datosMod, 
                    registros: this.state.datosMod.registros.map(r => {
                        if(r._id === dato._id){ return {...r, aprobado: true }}
                        else{ return r }
                    })
                }})
            }).catch(err => {
                console.log(err)
                message.error("Ha ocurrido un error durante la aprobación del registro")
            })
        }
        else{
            request("/registros/" + dato._id, { method: "DELETE" }).then(data => {
                message.success("Se ha denegado el registro correctamente")
                this.props.dispatch(fetchES())
                this.setState({ datosMod: {
                    ...this.state.datosMod, 
                    registros: this.state.datosMod.registros.filter(r => r._id !== dato._id)
                }})
            }).catch(err => {
                console.log(err)
                message.error("Ha ocurrido un error durante la denegación del registro")
            })
        }
    }

    render(){
        const { datos, datosMod } = this.state
        return (
            <Modal
                visible={this.props.visible}
                footer={null}
                onCancel={() => {
                    if(this.state.modificado){
                        Modal.confirm({
                            title: "Los registros no han sido guardados. ¿Seguro que desea salir?",
                            onOk: () => { 
                                this.setState({ datosMod: this.state.datos, modificado: false, nuevosRegistros: [] })
                                this.props.cb() 
                            }
                        })
                    } else{ 
                        this.props.cb() }
                }}
                width="80vw"
            >
                <h2>{ datos.usuario + " - " + moment(datos.entrada).format("YYYY-MM-DD") }</h2>
                <div>
                    <Table
                        dataSource={datosMod.registros}
                        rowKey="_id"
                        pagination={false}
                        style={{ marginBottom: 20 }}
                        columns={[...this.state.columns, ...this.state.extraColumns]}
                    />
                </div>
                <div style={{ marginBottom: 20 }}>
                    <TimePicker placeholder="Selecciona hora" value={this.state.hora.utcOffset(2)} onChange={hora => this.setState({ hora }) } style={{ marginRight: 20 }} />
                    <Button onClick={this.addRegistro}>Añadir registro</Button>
                </div>
                {   this.state.modificado &&
                    <div>
                        <Button type="danger" style={{ marginRight: 20 }} onClick={() => this.setState({ datosMod: this.state.datos, modificado: false, nuevosRegistros: [] })}>Restablecer</Button>
                        <Button type="primary" onClick={() => this.guardarNuevosRegistros()}>Guardar</Button>
                    </div>
                }
            </Modal>
        )
    }
}

export default connect()(ModalInfoRegistros)
