import React, { Component } from 'react'
import { Layout, Table, Collapse, Statistic, Progress } from 'antd'
import Frame from './Frame';
import { connect } from 'react-redux';
import { socketConnect } from 'socket.io-react';
import moment from 'moment';
import { getUserInfo, getToken } from './utils/auth';
import { wrap } from 'module';

class Registro extends Component{

    state = {
        usuarios: [],
        userInfo: getUserInfo()
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
            this.procesaES()
        }
        // console.log( this.diasLaborables() )
        // console.log( this.diasLaborables(2, 2019) )
    }

    componentDidUpdate(prevProps){
        if(prevProps.es !== this.props.es){
            this.procesaES();
        }
    }

    diasLaborables = (userId, month = moment().month() + 1, year = moment().year()) => {
        const diasFestivos = (this.props.dias.filter(d => d.tipo === "festivo")).length
        const diasLibres = (this.props.dias.filter(d => d.user && d.user._id === userId)).length
        return Array(moment().month(month - 1).year(year).daysInMonth()).fill(null).filter((e, i) => {
            return moment().year(year).month(month - 1).date(i+1).weekday() <= 4
        }).length - diasLibres - diasFestivos
    }

    procesaES = (month = moment().month() + 1, year = moment().year()) => {
        const duracionJornada = 8
        const diasDeEseMes = moment().month(month - 1).year(year).daysInMonth()
        const usuarios = this.props.es.map(u => {
            const diasLaborables = this.diasLaborables(u._id, month, year)
            const dias = Array(diasDeEseMes).fill(null)
                .map((e, i) => moment().subtract(i, "days").format("YYYY-MM-DD"))
                .map(d => u.registros.filter(r => moment(r.fecha).isSame(moment(d), "days")))

            const jornadas = dias.map((dia, i) => {
                const arrayCachos = Array(Math.ceil(dia.length / 2)).fill(null).map((e, j) => {
                    const a = moment(dia[(2*j)].fecha);
                    const b = dia[(2*j)+1] ? moment(dia[(2*j)+1].fecha) : undefined;
                    const m = b && moment.duration(b.diff(a))
                    const horas = b ? Math.round(m.as('hours')*100)/100 : "-"
                    return {
                        key: u._id + "-" + i + "-" + j,
                        entrada: a.format(),
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
                    horas: !arrayHoras.includes("-") ? arrayHoras.reduce((a, b) => a + b, 0) : "-",
                    tiempoDescanso
                } : []
                return jornada
            })

            const horasTrabajadas = Math.round(jornadas.map(j => j.horas).filter(h => h !== "-" && h !== undefined).reduce((a, b) => a + b, 0) * 100 ) / 100
            const horasMes = diasLaborables * duracionJornada
            const porcentajeHoras = Math.round((horasTrabajadas / (diasLaborables * duracionJornada)) * 10000) / 100
            const horasPendientes = horasMes - horasTrabajadas

            return { ...u, jornadas, horasTrabajadas, horasPendientes, porcentajeHoras, duracionJornada, diasLaborables }
        })
        this.setState({ usuarios })
    }
    
    render(){
        return(
            <Layout style={{height:"100vh"}}>
                <Frame isLogged={ getToken() ? true : false }>
                    <h1>Jornadas</h1>
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
                                    <div style={{ display: "flex", flexWrap: wrap, justifyContent: "space-evenly" }}>
                                        <Statistic title="Horas trabajadas" value={ u.horasTrabajadas + "h" } />
                                        <Statistic title="Horas pendientes" value={ u.horasPendientes + "h" } />
                                        <Statistic title="Días laborables de este mes" value={ u.diasLaborables } />
                                        <Statistic title="Duración de su jornada" value={ u.duracionJornada + "h" } />
                                    </div>
                                    <h3 style={{marginTop: 20 }}>Desglose de jornadas</h3>
                                    <Table key={"table"+i} dataSource={[].concat.apply([], u.jornadas)} columns={this.columns} />
                                </Collapse.Panel>,
                            ])
                        }
                        </Collapse>
                </Frame>
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