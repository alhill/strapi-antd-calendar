
import { message } from 'antd'
import { falloCarga } from '../actions'

export const mayusculizer = str => str.replace(/\s|-/g, " ,")
    .split(",")
    .map(c => c.slice(0, 1).toUpperCase() + c.slice(1).toLowerCase())
    .reduce((a, b) => a + b, "")

export const redondear = (dato, n = 0) => 
    parseInt(dato * Math.pow(10, n), 10) / Math.pow(10, n)

export const gestionaError = (err, dispatch, chivato) => {
    console.log(err.response.payload.error + " - " + err.response.payload.message)
        if(err.response.status === 403){
            message.error("No tienes permiso para acceder a ese contenido")
            dispatch(falloCarga({ error: 403, redirectTo: "/", chivato }))
        }
        else if(err.response.status === 401){
            message.error("La sesión ha caducado o los datos de autenticación son incorrectos")
            localStorage.clear()
            sessionStorage.clear()
            dispatch(falloCarga({ error: 401, redirectTo: "/login", chivato }))
        }
}