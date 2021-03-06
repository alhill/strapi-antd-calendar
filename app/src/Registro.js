import React, { Component } from 'react'
import { Layout, Table, Collapse, Statistic, Progress, DatePicker, Button, Modal, Popconfirm, Tag, message } from 'antd'
import Frame from './Frame';
import { connect } from 'react-redux';
import { socketConnect } from 'socket.io-react';
import moment from 'moment';
import { getUserInfo, getToken } from './utils/auth';
import ModuloRegistros from './modulosConfig/ModuloRegistros'
import ModalInfoRegistros from './components/ModalInfoRegistros'
import { fetchES, cambiarMesES } from './actions';

class Registro extends Component{

    state = {
        usuarios: [],
        userInfo: getUserInfo(),
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
        title: 'Tiempo trabajado',
        dataIndex: 'horas',
        key: 'horas',
        sorter: (a, b) => a.horas - b.horas,
        render: horas => horas !== "-" ? Math.trunc(horas, 10) + "h " + Math.round((horas % 1) * 60) + "m" : "-"
    }, {
        title: 'Tiempo de descanso',
        dataIndex: 'tiempoDescanso',
        key: 'tiempoDescanso',
        sorter: (a, b) => a.tiempoDescanso - b.tiempoDescanso,
        render: tiempoDescanso => tiempoDescanso !== "-" ? Math.trunc(tiempoDescanso, 10) + "h " + Math.round((tiempoDescanso % 1) * 60) + "m" : "-"
    }, {
        title: "",
        dataIndex: "detalles",
        key: "detalles",
        render: () => <Tag color="blue">Detalles</Tag>
    }]

    componentDidMount() {
        if(this.props.es){
            this.procesaES(this.props.mesES.month(), this.props.mesES.year())
        }
    }

    componentDidUpdate(prevProps, prevState){
        if(prevProps.es !== this.props.es){
            this.procesaES(this.props.mesES.month(), this.props.mesES.year());
        }
        else if(!prevProps.mesES.isSame(this.props.mesES, "month")){
            this.props.dispatch(fetchES(this.props.mesES))
        }
    }

    diasLaborables = (userId, month = moment().month() + 1, year = moment().year()) => {
        const diasFestivos = (this.props.dias.filter(d => d.tipo === "festivo" && moment(d.fecha).month() === month)).length
        const diasEntreSemana = Array(moment().month(month).year(year).daysInMonth()).fill(null).filter((e, i) => {
            return moment().year(year).month(month).date(i+1).weekday() <= 4
        }).length
        const diasLibres = (this.props.dias.filter(d => {
            return d.user && ( d.user._id === userId && d.aprobado === true && d.tipo === "libre" && moment(d.fecha).month() === month)
        })).length
        return diasEntreSemana - diasLibres - diasFestivos
    }

    procesaES = (month = moment().month() + 1, year = moment().year()) => {

        const diasDeEseMes = moment().month(month - 1).year(year).daysInMonth()
        if(Array.isArray(this.props.es.users)){
            const usuarios = this.props.es.users.map(u => {
                const duracionJornada = u.duracionjornada || 8;
                const diasLaborables = this.diasLaborables(u._id, month, year)
                const dias = Array(diasDeEseMes).fill(null)
                    .map((e, i) => moment().subtract(i, "days").format("YYYY-MM-DD"))
                    .map(d => u.registros.filter(r =>  moment(r.fecha).isSame(moment(d), "days") && moment(r.fecha).isSame(this.props.mesES, "month"))
                        .sort((a, b) => {
                            if(moment(a.fecha).isBefore(moment(b.fecha))){ return -1 }
                            else if(moment(b.fecha).isBefore(moment(a.fecha))){ return 1 }
                            else{ return 0 }
                        })
                    )

                const jornadas = dias.map((dia, i) => {
                    const arrayCachos = Array(Math.ceil(dia.length / 2)).fill(null).map((e, j) => {
                        const a = moment(dia[(2*j)].fecha);
                        const b = dia[(2*j)+1] ? moment(dia[(2*j)+1].fecha) : undefined;
                        const m = b ? moment.duration(b.diff(a)) : ( a.isSame(moment(), "day") ? moment.duration(moment().diff(a)) : "-" )
                        const horas = m !== "-" ? Math.round(m.as('hours')*100)/100 : "-"
                        return {
                            key: u._id + "-" + i + "-" + j,
                            entrada: a.format(),
                            aprobado: (dia[(2*j)].aprobado && (dia[(2*j)+1] ? dia[(2*j)+1].aprobado : true)) ? true : false,
                            salida: b ? b.format() : "-",
                            horas
                        }
                    })

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
                        registros: dia,
                        empresa: {
                            nombre: this.props.es.nombre,
                            cif: this.props.es.cif,
                            ccc: this.props.es.ccc
                        },
                        tiempoDescanso
                    } : []
                    return jornada
                })

                const horasTrabajadas = Math.round(jornadas.filter(j => j.aprobado).map(j => j.horas).filter(h => h !== "-" && h !== undefined).reduce((a, b) => a + b, 0) * 100 ) / 100
                const horasMes = diasLaborables * duracionJornada
                const porcentajeHoras = Math.round((horasTrabajadas / (diasLaborables * duracionJornada)) * 10000) / 100
                const horasPendientes = Math.round((horasMes - horasTrabajadas) * 100 ) / 100
                const empresa = {
                    nombre: this.props.es.razonSocial,
                    cif: this.props.es.cif,
                    ccc: this.props.es.ccc
                }
                return { ...u, jornadas, horasTrabajadas, horasPendientes, porcentajeHoras, duracionJornada, diasLaborables, empresa }
            })
            
            this.setState({ 
                usuarios,
                jornadasPorAprobar: [].concat.apply([], usuarios.filter(u => u._id === getUserInfo()._id || (getUserInfo().manager && !this.props.blueCollar)).map(u => u.jornadas)).filter(j => !Array.isArray(j) && !j.aprobado)
            })
        }
    }

    handleRowClick = (fila, apr) => {
        this.setState({ rowSelect: fila, modalInfo: true, modalInfoApr: apr })
    }


    render(){
        const { modalVisible, modalLoading } = this.state
        const MonthPicker = DatePicker.MonthPicker
        return(
            <Layout style={{height:"100vh"}}>
                <Frame isLogged={ getToken() ? true : false }>
                    <h1>Jornadas</h1>
                    <MonthPicker 
                        placeholder="Seleccionar mes" 
                        value={this.props.mesES} 
                        onChange={mes => {
                            //this.setState({ mes })
                            this.props.dispatch(cambiarMesES(mes))
                        }}
                        style={{ marginBottom: 20 }}
                    />
                    {/*( this.state.userInfo.manager && !this.props.blueCollar)*/ true &&
                        <div>
                            <h3>Jornadas pendientes de aprobación</h3>
                            <Table style={{ marginBottom: "1em" }} dataSource={this.state.jornadasPorAprobar} locale={{
                                emptyText: "No hay jornadas pendientes de aprobar"
                            }}
                            onRow={row => ({
                                onClick: () => this.handleRowClick(row, true)
                            })}
                            columns={[{
                                title: 'Usuario',
                                dataIndex: 'usuario',
                                key: 'usuario',
                            },{
                                title: 'Día',
                                dataIndex: 'entrada',
                                key: 'dia',
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
                                render: e => moment(e).format("HH:mm") === "Invalid date" ? " - " : moment(e).format("HH:mm")
                            },{
                                title: 'Horas',
                                dataIndex: 'horas',
                                key: 'horas',
                            }, {
                                title: "",
                                dataIndex: "detalles",
                                key: "detalles",
                                render: () => <Tag color="blue">Detalles</Tag>
                            }]}/>
                        </div>
                    }

                        <Collapse defaultActiveKey={!(getUserInfo().manager && !this.props.blueCollar) ? getUserInfo()._id : undefined}>
                        {
                            this.state.usuarios && this.state.usuarios.filter(u => {
                                return this.state.userInfo._id === u._id || (this.state.userInfo.manager && !this.props.blueCollar)}).map((u, i) => [
                                <Collapse.Panel header={<div style={{ display: "flex", justifyContent: "space-between", paddingRight: "10px" }}>
                                    <span>{ u.username }</span>
                                    <div style={{ width: "200px",  }}>
                                        <Progress percent={u.porcentajeHoras} />
                                    </div>
                                </div>} key={u._id}>
                                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-evenly" }}>
                                        <Statistic title="Horas trabajadas" value={ Math.trunc(u.horasTrabajadas, 10) + "h " + Math.round((u.horasTrabajadas % 1) * 60) + "m"  } />
                                        <Statistic 
                                            title={`Horas ${u.horasPendientes >= 0 ? "pendientes" : "extra"}`} 
                                            valueStyle={{ color: u.horasPendientes < 0 ? "red" : "inherit" }} 
                                            value={ u.horasPendientes > 0 ?
                                                Math.trunc(u.horasPendientes, 10) + "h " + Math.round((u.horasPendientes % 1) * 60) + "m" :
                                                Math.trunc(-u.horasPendientes, 10) + "h " + Math.round((-u.horasPendientes % 1) * 60) + "m"
                                            }
                                        />
                                        <Statistic title="Días laborables de este mes" value={ u.diasLaborables } />
                                        <Statistic title="Duración de jornada" value={ u.duracionJornada + "h" } />
                                    </div>
                                    <h3 style={{marginTop: 20 }}>Desglose de jornadas</h3>
                                    <Table 
                                        key={"table"+i} 
                                        dataSource={[].concat.apply([], u.jornadas.filter(j => j.aprobado))} 
                                        columns={this.columns} 
                                        onRow={row => ({
                                            onClick: () => this.handleRowClick(row, false)
                                        })}
                                    />
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
                    <ModuloRegistros usuario={this.state.modalUser} cerrarModal={() => this.setState({ modalVisible: false })} />
                </Modal>
                <ModalInfoRegistros
                    visible={this.state.modalInfo}
                    colAprobado={this.state.modalInfoApr}
                    cb={() => this.setState({ modalInfo: false })}
                    datos={this.state.rowSelect}
                    blueCollar={this.props.blueCollar}
                />
            </Layout>
        )
    }
}

const mapStateToProps = state => {
    return {
        es: state.es,
        mesES: state.mesES,
        dias: state.dias,
        blueCollar: state.blueCollar
    }
}

export default socketConnect(connect(mapStateToProps)(Registro))