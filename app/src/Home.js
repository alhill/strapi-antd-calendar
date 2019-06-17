import React, { Component } from 'react'
import { getToken, getUserInfo } from './utils/auth';
import { Layout } from 'antd'
import moment from 'moment'
import Frame from './Frame';


class Home extends Component{

    state = {}

    componentDidMount(){
        fetch("https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/horaria/28079/?api_key=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhbHZhcm9naWxAYmxhY2tub3NhdXIuY29tIiwianRpIjoiNTQwNjQ0NzEtMzhiMC00MTRiLWE3MDktMGYxYTVmY2JkOGUyIiwiaXNzIjoiQUVNRVQiLCJpYXQiOjE1NjAyNTcyNTMsInVzZXJJZCI6IjU0MDY0NDcxLTM4YjAtNDE0Yi1hNzA5LTBmMWE1ZmNiZDhlMiIsInJvbGUiOiIifQ.ihZx3I_3987zhxRmM8oA8_-hSI9OTakxR6e-WmU5fjs", {
            headers:{ "Cache-Control": "no-cache" }
        }).then(resp => {
            resp.json().then(data => {
                fetch(data.datos).then(resp => {
                    resp.json().then(meteoRaw => {
                        const meteo = meteoRaw[0].prediccion.dia.map(d => {
                            const horas = d.estadoCielo.map(e => e.periodo)
                            return ({ [moment().isSame(d.fecha, "day") ? "Hoy" : (moment().add(1, "day").isSame(d.fecha, "day") ? "Mañana" : "borrar")]: horas.map(h => ({  
                                hora: h,
                                estadoCielo: d.estadoCielo.find(e => e.periodo === h).value,
                                temperatura: d.temperatura.find(t => t.periodo === h).value
                            }))})
                        }).filter(dia => Object.keys(dia)[0] !== "borrar")

                        console.log(meteo)
                        this.setState({ meteo })
                    })
                })
            }).catch(err => { console.log(err) })
        }).catch(err => { console.log(err) })
    }

    render(){
        return(
            <Layout style={{height:"100vh"}}>
                <Frame isLogged={ getToken() ? true : false }>
                    <h1>Hola, { getUserInfo().nombre }</h1>
                    <br />
                    {
                        this.state.meteo && this.state.meteo.map((d, i) => {
                            return <div key={"d" + i}>
                                <h3>{ Object.keys(d)[0] }</h3>
                                <div style={{
                                    display: "inline-flex",
                                    border: "1px solid gainsboro",
                                    borderRadius: 3,
                                    boxShadow: "rgba(0, 0, 0, 0.1) 1px 1px 5px 0px",
                                    overflowX: "auto",
                                    marginBottom: "1em"
                                }}>
                                    {
                                        Object.values(d)[0].map(r => (
                                            <div style={{
                                                display: "flex",
                                                flex: 1,
                                                flexDirection: "column"
                                            }}>
                                                <div style={{
                                                    backgroundColor: "#333",
                                                    color: "white",
                                                    padding: 5,
                                                    textAlign: "center"
                                                }}>{r.hora}:00</div>
                                                <div style={{
                                                    padding: 5,
                                                    textAlign: "center",
                                                    fontWeight: "bold",
                                                    color: r.temperatura <= 15 ? "#2222cc" : (r.temperatura >= 28 ? "#cc0000" : "#333")
                                                }}>{r.temperatura}º</div>
                                                <div style={{
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center"
                                                }}><img src={`${process.env.PUBLIC_URL}/meteo/${r.estadoCielo}.png`} /></div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        })
                    }
                </Frame>
            </Layout>
        )
    }
}

export default Home
