import { 
    CARGAR_USUARIOS, 
    CARGAR_CALENDARIO, 
    CARGAR_ES, 
    CARGAR_DOCUMENTOS, 
    CARGAR_GRUPOS, 
    CARGAR_PWS, 
    CARGAR_AUTH, 
    CARGAR_ENTRADAS, 
    CAMBIAR_BLUE_COLLAR, 
    CAMBIAR_MES_ES, 
    FALLO_CARGA
} from "../constants/action-types"
import request from "../utils/request"
import gql from "../utils/gql"
import { getUserInfo } from '../utils/auth'
import { gestionaError } from '../utils/func'
import { queryCalendario, queryES, queryEntradas } from '../queries'
import moment from 'moment'

export function cambiarBlueCollar(payload) {
    return {
        type: CAMBIAR_BLUE_COLLAR,
        payload
    }
}

export function falloCarga(payload) {
    return {
        type: FALLO_CARGA,
        payload
    }
}

export function cambiarMesES(payload) {
    return {
        type: CAMBIAR_MES_ES,
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
            gestionaError(error, dispatch, "usuarios");
        });
    };
};

export function cargarAuth(payload) {
    return {
        type: CARGAR_AUTH,
        payload
    }
}
  
export const fetchAuth = () => {
    return (dispatch) => {
        return request("/users/me").then(response => {
            dispatch(cargarAuth(response))
        })
        .catch(error => {
            gestionaError(error, dispatch, "auth");
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
            gestionaError(error, dispatch, "calendario");
        });
    };
};

export function cargarES(payload) {
    return {
        type: CARGAR_ES,
        payload
    }
}
  
export const fetchES = (mes = moment()) => {
    return (dispatch) => {
        return request(gql(queryES({
               equipo: getUserInfo().equipo,
               desde: mes.clone().startOf("month").utc().format(),
               hasta: mes.clone().endOf("month").utc().format()
            }))).then(response => {
            dispatch(cargarES(response.data.equipo))
        })
        .catch(error => {
            gestionaError(error, dispatch, "es");
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
        return request("/documentos?_limit=0").then(response => {
            dispatch(cargarDocumentos(response))
        })
        .catch(error => {
            gestionaError(error, dispatch, "documentos");
        });
    };
};

export function cargarGrupos(payload) {
    return {
        type: CARGAR_GRUPOS,
        payload
    }
}
  
export const fetchGrupos = () => {
    return (dispatch) => {
        return request("/grupos?_limit=0").then(response => {
            dispatch(cargarGrupos(response))
        })
        .catch(error => {
            gestionaError(error, dispatch, "grupos");
        });
    };
};

export function cargarPws(payload) {
    return {
        type: CARGAR_PWS,
        payload
    }
}
  
export const fetchPws = () => {
    return (dispatch) => {
        return request("/pws?_limit=0").then(response => {
            dispatch(cargarPws(response))
        })
        .catch(error => {
            gestionaError(error, dispatch, "pws");
        });
    };
};

export function cargarEntradas(payload) {
    return {
        type: CARGAR_ENTRADAS,
        payload
    }
}
  
export const fetchEntradas = () => {
    return (dispatch) => {
        return request(gql(queryEntradas(getUserInfo()))).then(response => {
            dispatch(cargarEntradas(response))
        })
        .catch(error => {
            gestionaError(error, dispatch, "entradas");
        });
    };
};