import { 
    CARGAR_USUARIOS, CARGAR_CALENDARIO, CARGAR_ES, CARGAR_DOCUMENTOS, CAMBIAR_BLUE_COLLAR
} from "../constants/action-types"
import request from "../utils/request"
import gql from "../utils/gql"
import { getUserInfo } from '../utils/auth'
import { queryCalendario, queryES } from '../queries'

export function cambiarBlueCollar(payload) {
    return {
        type: CAMBIAR_BLUE_COLLAR,
        payload
    }
}

export function cargarUsuarios(payload) {
    return {
        type: CARGAR_USUARIOS,
        payload
    }
}
  
export const fetchUsuarios = () => {
    return (dispatch) => {
        const equipo = getUserInfo() && getUserInfo().equipo
        return request("/users?_limit=0&equipo=" + equipo).then(response => {
            dispatch(cargarUsuarios(response))
        })
        .catch(error => {
            throw(error);
        });
    };
};

export function cargarCalendario(payload) {
    return {
        type: CARGAR_CALENDARIO,
        payload
    }
}
  
export const fetchCalendario = () => {
    return (dispatch) => {
        return request(gql(queryCalendario(getUserInfo()))).then(response => {
            dispatch(cargarCalendario(response.data.dias))
        })
        .catch(error => {
            throw(error);
        });
    };
};

export function cargarES(payload) {
    return {
        type: CARGAR_ES,
        payload
    }
}
  
export const fetchES = () => {
    return (dispatch) => {
        return request(gql(queryES(getUserInfo()))).then(response => {
            dispatch(cargarES(response.data.equipo && response.data.equipo.users))
        })
        .catch(error => {
            throw(error);
        });
    };
};

export function cargarDocumentos(payload) {
    return {
        type: CARGAR_DOCUMENTOS,
        payload
    }
}
  
export const fetchDocumentos = () => {
    return (dispatch) => {
        return request("/documentos").then(response => {
            dispatch(cargarDocumentos(response))
        })
        .catch(error => {
            throw(error);
        });
    };
};