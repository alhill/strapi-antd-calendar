import React, { Component } from 'react'
import { Layout, Table, Collapse, Panel, Progress } from 'antd'
import Frame from './Frame';
import { connect } from 'react-redux';
import { socketConnect } from 'socket.io-react';
import moment from 'moment';


class Registro extends Component{

    state = {
        usuarios: []
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
        title: 'Horas',
        dataIndex: 'horas',
        key: 'horas',
        sorter: (a, b) => a.horas - b.horas,
        render: horas => horas !== "-" ? horas + "h" : "-"
    }]

    componentDidMount() {
        if(this.props.es){
            this.procesaES()
        }

        console.log( this.diasLaborables() )
        console.log( this.diasLaborables(2, 2019) )


    }

    componentDidUpdate(prevProps){
        if(prevProps.es !== this.props.es){
            this.procesaES();
        }
    }

    diasLaborables = (month = moment().month() + 1, year = moment().year()) => (
        Array(moment().month(month - 1).year(year).daysInMonth()).fill(null).filter((e, i) => {
            return moment().year(year).month(month - 1).date(i+1).weekday() <= 4
        }).length
    )

    procesaES = (month = moment().month() + 1, year = moment().year()) => {
        const diasDeEseMes = moment().month(month - 1).year(year).daysInMonth()
        const usuarios = this.props.es.map(u => {
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
                // console.log(arrayCachos)
                const arrayHoras = arrayCachos.map(c => c.horas)
                const jornada = arrayCachos[0] ? {
                    key: arrayCachos[0].key,
                    entrada: arrayCachos[0].entrada,
                    salida: arrayCachos.slice(-1)[0].salida,
                    horas: !arrayHoras.includes("-") ? arrayHoras.reduce((a, b) => a + b, 0) : "-"
                } : []
                return jornada
            })

            const horasTotales = jornadas.map(j => j.horas).filter(h => h !== "-" && h !== undefined).reduce((a, b) => a + b, 0)
            const porcentajeHoras = Math.round((horasTotales / (diasDeEseMes * 8)) * 10000) / 100

            return { ...u, jornadas, horasTotales, porcentajeHoras }
        })
        this.setState({ usuarios })
    }
    
    render(){
        return(
            <Layout style={{height:"100vh"}}>
                <Frame>
                    <h1>Jornadas</h1>
                        <Collapse>
                        {
                            this.state.usuarios && this.state.usuarios.map((u, i) => [
                                <Collapse.Panel header={<div style={{ display: "flex", justifyContent: "space-between", paddingRight: "10px" }}>
                                    <span>{ u.username }</span>
                                    <div style={{ width: "200px",  }}>
                                        <Progress percent={u.porcentajeHoras} />
                                    </div>
                                </div>} key={i}>
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
        es: state.es
    }
}

export default socketConnect(connect(mapStateToProps)(Registro))