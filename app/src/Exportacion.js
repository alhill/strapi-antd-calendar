import React, { Component } from 'react'
import { Layout, Table, Collapse, DatePicker, Button, Modal, Popconfirm, Tag, message, List } from 'antd'
import Frame from './Frame';
import { connect } from 'react-redux';
import { socketConnect } from 'socket.io-react';
import moment from 'moment';
import { getUserInfo, getToken } from './utils/auth';
import { fetchES, cambiarMesES } from './actions';
import ReactPDF, { Page, Text, View, Document, PDFViewer, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { redondear, mayusculizer } from './utils/func';

const PreciosoPDF = ({ datos, mes }) => 
    <Document>
        <Page size="A4" style={styles.hoja}>
            <Text>WEEELCOME</Text>
            <Text style={{ marginTop: 10, marginBottom: 20 }}>Registro de jornada laboral - { mes && mayusculizer(mes.format("MMMM YYYY")) }</Text>
            <View style={styles.datos}>
                <View style={styles.cajaDatos}>
                    <View style={styles.filaDatos}>
                        <Text style={styles.claveDatos}>Trabajador:&nbsp;</Text>
                        <Text style={styles.valorDatos}>{ datos.nombre + " " + datos.apellidos }</Text>
                    </View>
                    <View style={styles.filaDatos}>
                        <Text style={styles.claveDatos}>NIF:&nbsp;</Text>
                        <Text style={styles.valorDatos}>{ datos.nif }</Text>
                    </View>
                    <View style={styles.filaDatos}>
                        <Text style={styles.claveDatos}>Número afiliación:&nbsp;</Text>
                        <Text style={styles.valorDatos}>{ datos.nuss }</Text>
                    </View>
                </View>
                <View style={styles.cajaDatos}>
                    <View style={styles.filaDatos}>
                        <Text style={styles.claveDatos}>Empresa:&nbsp;</Text>
                        <Text style={styles.valorDatos}>{ datos.empresa.razonSocial }</Text>
                    </View>
                    <View style={styles.filaDatos}>
                        <Text style={styles.claveDatos}>CIF:&nbsp;</Text>
                        <Text style={styles.valorDatos}>{ datos.empresa.cif }</Text>
                    </View>
                    <View style={styles.filaDatos}>
                        <Text style={styles.claveDatos}>CCC:&nbsp;</Text>
                        <Text style={styles.valorDatos}>{ datos.empresa.ccc }</Text>
                    </View>
                </View>
            </View>
            <View style={styles.tabla}>
                <View style={{...styles.fila, ...styles.encabezado}}>
                    <Text style={{...styles.celda, ...styles.celdaEncabezado}}>Día</Text>
                    <Text style={{...styles.celda, ...styles.celdaEncabezado}}>Hora de entrada</Text>
                    <Text style={{...styles.celda, ...styles.celdaEncabezado}}>Hora de salida</Text>
                    <Text style={{...styles.celda, ...styles.celdaEncabezado}}>Tiempo de descanso</Text>
                    <Text style={{...styles.celda, ...styles.celdaEncabezado}}>Horas</Text>
                </View>
                {
                    [].concat.apply([], datos.jornadas.filter(j => j.aprobado)).map((dia, i) =>
                        <View style={{...styles.fila, backgroundColor: i%2 ? "white" : "#eee"}} key={dia.key}>
                            <Text style={styles.celda}>{ moment(dia.entrada).format("YYYY-MM-DD") }</Text>
                            <Text style={styles.celda}>{ moment(dia.entrada).format("HH:mm") }</Text>
                            <Text style={styles.celda}>{ dia.salida !== "-" ? moment(dia.salida).format("HH:mm") : " - " }</Text>
                            <Text style={styles.celda}>{ redondear(dia.tiempoDescanso, 1) }h</Text>
                            <Text style={{...styles.celda, ...styles.ultimaColumna}}>{ redondear(dia.horas, 1) }h</Text>
                        </View>
                    )
                }

            </View>
            <View style={styles.pie}>
                <Text style={styles.fecha}>A {moment().format("LL")}:</Text>
                <View style={styles.cajapie}>
                    <Text style={styles.textopie}>Firma del trabajador</Text>
                    <Text style={styles.textopie}>Firma del responsable de la empresa</Text>
                </View>
            </View>
        </Page>
    </Document>
    
class Exportacion extends Component{

    state = {
        usuarios: [],
        userInfo: getUserInfo()
    }

    componentDidMount() {
        if(this.props.es && this.props.es.users){
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
            return d.user && ( d.user._id === userId && d.aprobado === true && moment(d.fecha).month() === month)
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
                        tiempoDescanso
                    } : []
                    return jornada
                })

                const horasTrabajadas = Math.round(jornadas.filter(j => j.aprobado).map(j => j.horas).filter(h => h !== "-" && h !== undefined).reduce((a, b) => a + b, 0) * 100 ) / 100
                const horasMes = diasLaborables * duracionJornada
                const porcentajeHoras = Math.round((horasTrabajadas / (diasLaborables * duracionJornada)) * 10000) / 100
                const horasPendientes = Math.round((horasMes - horasTrabajadas) * 100 ) / 100
                const empresa = {
                    razonSocial: this.props.es.razonSocial,
                    cif: this.props.es.cif,
                    ccc: this.props.es.ccc
                }
                return { ...u, jornadas, horasTrabajadas, horasPendientes, porcentajeHoras, duracionJornada, diasLaborables, empresa }
            })
            
            this.setState({ 
                usuarios
            })
        }
    }

    render(){
        const MonthPicker = DatePicker.MonthPicker
        return(
            <Layout style={{height:"100vh"}}>
                <Frame isLogged={ getToken() ? true : false }>
                    <h1>Jornadas</h1>
                    <MonthPicker 
                        placeholder="Seleccionar mes" 
                        value={this.props.mesES} 
                        onChange={mes => {
                            this.props.dispatch(cambiarMesES(mes))
                        }}
                        style={{ marginBottom: 20 }}
                    />
                        <List dataSource={this.state.usuarios} renderItem={u => (
                            <List.Item>
                                <span style={{ marginRight: 20 }}>{ u.username }</span>
                                <Button>
                                    <PDFDownloadLink document={<PreciosoPDF datos={u} mes={this.props.mesES} />} fileName={`Weeelcome - ${u.nombre} ${u.apellidos} - ${moment(this.props.mesES).format("YYYYMM")} Volcado.pdf`}>
                                        {({ blob, url, loading, error }) => (loading ? 'Cargando documento...' : 'Descargar')}
                                    </PDFDownloadLink>
                                </Button>
                                {/* <PDFViewer>
                                    <PreciosoPDF datos={u} mes={this.props.mesES} />
                                </PDFViewer> */}
                            </List.Item>
                        )} />
                </Frame>
            </Layout>
        )
    }
}

const styles = StyleSheet.create({
    hoja: {
        display: "flex",
        alignItems: "center",
        padding: 20
    },
    tabla: {
        display: "flex",
        flexDirection: "column",
        borderBottomColor: "#ddd",
        borderBottomWidth: 1
    },
    fila: {
        display: "flex",
        flexDirection: "row",
        width: "100%"
    },
    celda: {
        display: "flex",
        width: "20%",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "11pt",
        borderLeftColor: "#ddd",
        borderLeftWidth: 1,
        padding: 4
    },
    ultimaColumna: {
        borderRightColor: "#ddd",
        borderRightWidth: 1
    },
    encabezado: {
        fontWeight: "bold",
        backgroundColor: "black",
        color: "white"
    },
    celdaEncabezado: {
        borderLeftColor: "black",
        borderRightColor: "black"
    },
    datos: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20
    },
    cajaDatos: {
        display: "flex",
        width: "50%"
    },
    filaDatos: {
        display: "flex",
        flexDirection: "row"
    },
    claveDatos: {
        fontSize: "14pt",
        marginRight: "1em"
    },
    valorDatos: {
        fontSize: "14pt"
    },
    pie: {
        display: "flex",
        marginTop: 40,
        width: "100%",
        paddingLeft: 40,
        paddingRight: 40,
    },
    fecha: {
        fontSize: "11pt",
        marginBottom: 5
    },
    cajapie: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between"  
    },
    textopie: {
        fontSize: "11pt"
    }
})
const mapStateToProps = state => {
    return {
        es: state.es,
        mesES: state.mesES,
        dias: state.dias,
        blueCollar: state.blueCollar
    }
}

export default socketConnect(connect(mapStateToProps)(Exportacion))