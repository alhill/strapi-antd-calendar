import React, { Component } from 'react'
import { Layout, Table, Collapse, Statistic, Progress, DatePicker, Button, Modal, Popconfirm, Tag, message } from 'antd'
import Frame from './Frame';
import { connect } from 'react-redux';
import { socketConnect } from 'socket.io-react';
import moment from 'moment';
import { getUserInfo, getToken } from './utils/auth';
import ModuloRegistros from './modulosConfig/ModuloRegistros'
import request from './utils/request';
import { fetchES } from './actions';

class Registro extends Component{

    state = {
        usuarios: [],
        userInfo: getUserInfo(),
        mes: moment(),
        modalVisible: false, 
        modalLoading: false
    }

    columns = [{
        title: 'Entrada',
        dataIndex: 'entrada',
        key: 'entrada',
        defaultSortOrder: 'descend',
        sorter: (a, b) => moment(a.entrada).diff(moment(b.entrada)),
        render: hora => moment(hora).format("YYYY-MM-DD, HH:mm")
    }, {
        title: 'Salida',
        dataIndex: 'salida',
        key: 'salida',
        sorter: (a, b) => moment(a.entrada).diff(moment(b.entrada)),
        render: hora => hora !== "-" ? moment(hora).format("YYYY-MM-DD, HH:mm") : "-"
    }, {
        title: 'Horas trabajadas',
        dataIndex: 'horas',
        key: 'horas',
        sorter: (a, b) => a.horas - b.horas,
        render: horas => horas !== "-" ? horas + "h" : "-"
    }, {
        title: 'Horas de descanso',
        dataIndex: 'tiempoDescanso',
        key: 'tiempoDescanso',
        sorter: (a, b) => a.tiempoDescanso - b.tiempoDescanso,
        render: tiempoDescanso => tiempoDescanso !== "-" ? tiempoDescanso + "h" : "-"
    }]

    componentDidMount() {
        if(this.props.es){
            this.procesaES(this.state.mes.month(), this.state.mes.year())
        }
        // console.log( this.diasLaborables() )
        // console.log( this.diasLaborables(2, 2019) )
    }

    componentDidUpdate(prevProps, prevState){
        if(prevProps.es !== this.props.es || !(prevState.mes.isSame(this.state.mes, "month")) ){
            this.procesaES(this.state.mes.month(), this.state.mes.year());
        }
    }

    diasLaborables = (userId, month = moment().month() + 1, year = moment().year()) => {
        const diasFestivos = (this.props.dias.filter(d => d.tipo === "festivo" && moment(d.fecha).month() === month)).length
        const diasEntreSemana = Array(moment().month(month).year(year).daysInMonth()).fill(null).filter((e, i) => {
            return moment().year(year).month(month).date(i+1).weekday() <= 4
        }).length
        const diasLibres = (this.props.dias.filter(d => {
            return d.user && ( d.user._id === userId && d.aprobado === true && moment(d.fecha).month() === month)
        })).length
        return diasEntreSemana - diasLibres - diasFestivos
    }

    procesaES = (month = moment().month() + 1, year = moment().year()) => {

        const diasDeEseMes = moment().month(month - 1).year(year).daysInMonth()
        const usuarios = this.props.es.map(u => {
            const duracionJornada = u.duracionjornada || 8;
            const diasLaborables = this.diasLaborables(u._id, month, year)
            const dias = Array(diasDeEseMes).fill(null)
                .map((e, i) => moment().subtract(i, "days").format("YYYY-MM-DD"))
                .map(d => u.registros.filter(r => {
                    //console.log(r)
                    return moment(r.fecha).isSame(moment(d), "days") && moment(r.fecha).isSame(this.state.mes, "month")}))

            const jornadas = dias.map((dia, i) => {
                const arrayCachos = Array(Math.ceil(dia.length / 2)).fill(null).map((e, j) => {
                    const a = moment(dia[(2*j)].fecha);
                    const b = dia[(2*j)+1] ? moment(dia[(2*j)+1].fecha) : undefined;
                    const m = b && moment.duration(b.diff(a))
                    const horas = b ? Math.round(m.as('hours')*100)/100 : "-"
                    return {
                        key: u._id + "-" + i + "-" + j,
                        entrada: a.format(),
                        aprobado: (dia[(2*j)].aprobado && (dia[(2*j)+1] ? dia[(2*j)+1].aprobado : true)) ? true : false,
                        salida: b ? b.format() : "-",
                        horas
                    }
                })
                //console.log(arrayCachos)

                const tiempoDescanso = Array(arrayCachos.length > 0 ? arrayCachos.length - 1 : 0).fill(null).map((e, i) => {
                    const comienzoDescanso = moment(arrayCachos[i].salida)
                    const finDescanso = moment(arrayCachos[i+1].entrada)
                    const duracionDescanso = Math.round(moment.duration(finDescanso.diff(comienzoDescanso)).as("hours")*100)/100
                    return duracionDescanso
                }).reduce((a, b) => a + b, 0)

                const arrayHoras = arrayCachos.map(c => c.horas)
                const jornada = arrayCachos[0] ? {
                    key: arrayCachos[0].key,
                    entrada: arrayCachos[0].entrada,
                    salida: arrayCachos.slice(-1)[0].salida,
                    aprobado: arrayCachos.map(a => a.aprobado).includes(false) ? false : true,
                    horas: !arrayHoras.includes("-") ? arrayHoras.reduce((a, b) => a + b, 0) : "-",
                    usuario: u.username,
                    idsRegistros: dia.map(d => d._id),
                    tiempoDescanso
                } : []
                return jornada
            })

            const horasTrabajadas = Math.round(jornadas.filter(j => j.aprobado).map(j => j.horas).filter(h => h !== "-" && h !== undefined).reduce((a, b) => a + b, 0) * 100 ) / 100
            const horasMes = diasLaborables * duracionJornada
            const porcentajeHoras = Math.round((horasTrabajadas / (diasLaborables * duracionJornada)) * 10000) / 100
            const horasPendientes = Math.round((horasMes - horasTrabajadas) * 100 ) / 100

            //console.log({ ...u, jornadas, horasTrabajadas, horasPendientes, porcentajeHoras, duracionJornada, diasLaborables })
            return { ...u, jornadas, horasTrabajadas, horasPendientes, porcentajeHoras, duracionJornada, diasLaborables }
        })
        this.setState({ 
            usuarios,
            jornadasPorAprobar: [].concat.apply([], usuarios.map(u => u.jornadas)).filter(j => !Array.isArray(j) && !j.aprobado)
        })
    }

    jornadaPendiente = (accion, ids) => {
        if(accion === true){
            ids.forEach(id => {
                request("/registros/" + id, {
                    method: "PUT",
                    body: {
                        aprobado: true
                    }
                }).then(data => {
                    //console.log(data)
                    message.success("Se ha aprobado la jornada correctamente")
                    this.props.dispatch(fetchES())
                }).catch(err => {
                    console.log(err)
                    message.error("Ha ocurrido un error durante la aprobación de la jornada")
                })
            })
        }
        else{
            ids.forEach(id => {
                request("/registros/" + id, { method: "DELETE" }).then(data => {
                    //console.log(data)
                    message.success("Se ha denegado la jornada correctamente")
                    this.props.dispatch(fetchES())
                }).catch(err => {
                    console.log(err)
                    message.error("Ha ocurrido un error durante la denegación de la jornada")
                })
            })
        }
    }

    render(){
        const { modalVisible, modalLoading } = this.state
        const MonthPicker = DatePicker.MonthPicker
        return(
            <Layout style={{height:"100vh"}}>
                <Frame isLogged={ getToken() ? true : false }>
                    <h1>Jornadas</h1>
                    <MonthPicker placeholder="Seleccionar mes" value={this.state.mes} onChange={mes => this.setState({ mes })} style={{ marginBottom: 20 }}/>
                    {( this.state.userInfo.manager && !this.props.blueCollar) && 
                        <div>
                            <h3>Jornadas pendientes de aprobación</h3>
                            <Table dataSource={this.state.jornadasPorAprobar} columns={[{
                                title: 'Usuario',
                                dataIndex: 'usuario',
                                key: 'usuario',
                            },{
                                title: 'Día',
                                dataIndex: 'entrada',
                                key: 'entrada',
                                render: e => moment(e).format("YYYY-MM-DD")
                            },{
                                title: 'Entrada',
                                dataIndex: 'entrada',
                                key: 'entrada',
                                render: e => moment(e).format("HH:mm")
                            },{
                                title: 'Salida',
                                dataIndex: 'salida',
                                key: 'salida',
                                render: e => moment(e).format("HH:mm")
                            },{
                                title: 'Horas',
                                dataIndex: 'horas',
                                key: 'horas',
                            },{
                                title: 'Acción',
                                key: 'action',
                                render: (text, record) => (
                                  <span>
                                    <Popconfirm title={`¿Estás seguro de que deseas aprobar la jornada?`} onConfirm={evt => this.jornadaPendiente(true, record.idsRegistros)}>
                                        <Tag color="green" key={`${record._id}_aceptar`}>Aceptar</Tag>
                                    </Popconfirm>
                                    <Popconfirm title={`¿Estás seguro de que deseas denegar jornada?`} onConfirm={evt => this.jornadaPendiente(false, record.idsRegistros) }>
                                        <Tag color="volcano" key={`${record._id}_denegar`}>Denegar</Tag>
                                    </Popconfirm>
                                  </span>
                                ),
                            }]}/>
                        </div>
                    }

                        <Collapse>
                        {
                            this.state.usuarios && this.state.usuarios.filter(u => {
                                return this.state.userInfo._id === u._id || (this.state.userInfo.manager && !this.props.blueCollar)}).map((u, i) => [
                                <Collapse.Panel header={<div style={{ display: "flex", justifyContent: "space-between", paddingRight: "10px" }}>
                                    <span>{ u.username }</span>
                                    <div style={{ width: "200px",  }}>
                                        <Progress percent={u.porcentajeHoras} />
                                    </div>
                                </div>} key={i}>
                                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-evenly" }}>
                                        <Statistic title="Horas trabajadas" value={ u.horasTrabajadas + "h" } />
                                        <Statistic title="Horas pendientes" value={ u.horasPendientes + "h" } />
                                        <Statistic title="Días laborables de este mes" value={ u.diasLaborables } />
                                        <Statistic title="Duración de su jornada" value={ u.duracionJornada + "h" } />
                                    </div>
                                    <h3 style={{marginTop: 20 }}>Desglose de jornadas</h3>
                                    <Table key={"table"+i} dataSource={[].concat.apply([], u.jornadas.filter(j => j.aprobado))} columns={this.columns} />
                                    {( this.state.userInfo._id === u._id || (this.state.userInfo.manager && !this.props.blueCollar)) && 
                                        <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
                                            <Button onClick={() => this.setState({ modalVisible: true, modalUser: u._id })}>Añadir jornada</Button>
                                        </div>
                                    }
                                </Collapse.Panel>,
                            ])
                        }
                        </Collapse>
                </Frame>
                <Modal
                    visible={modalVisible}
                    title="Añadir registro"
                    onOk={this.handleNuevoRegistro}
                    onCancel={() => { this.setState({ modalVisible: false })}}
                    style={{ maxWidth: 900 }}
                    width="90%"
                    footer={null}
                    >
                    <ModuloRegistros usuario={this.state.modalUser} />
                </Modal>
            </Layout>
        )
    }
}

const mapStateToProps = state => {
    return {
        es: state.es,
        dias: state.dias,
        blueCollar: state.blueCollar
    }
}

export default socketConnect(connect(mapStateToProps)(Registro))