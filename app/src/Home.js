import React, { Component } from 'react'
import { getToken } from './utils/auth';
import { Layout, Table } from 'antd'
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
                            return ({ [d.fecha]: horas.map(h => ({  
                                hora: h,
                                estadoCielo: d.estadoCielo.find(e => e.periodo === h).descripcion,
                                temperatura: d.temperatura.find(t => t.periodo === h).value
                            }))})
                        })
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
                    <h1>Home</h1>
                    <h3>El tiempo</h3>
                    {
                        this.state.meteo && this.state.meteo.map((d, i) => {
                            return <div key={"d" + i}>
                                <h4>{ Object.keys(d)[0] }</h4>
                                <Table rowKey="hora" dataSource={Object.values(d)[0]} columns={[
                                    {
                                        title: "Hora",
                                        dataIndex: "hora",
                                        key: "hora"
                                    },
                                    {
                                        title: "Estado",
                                        dataIndex: "estadoCielo",
                                        key: "estadoCielo"
                                    },
                                    {
                                        title: "Temperatura",
                                        dataIndex: "temperatura",
                                        key: "temperatura"
                                    }
                                ]} />
                            </div>
                        })
                    }
                </Frame>
            </Layout>
        )
    }
}

export default Home

