import { 
    CARGAR_USUARIOS, CARGAR_CALENDARIO, CARGAR_ES, CARGAR_DOCUMENTOS, CARGAR_GRUPOS, CARGAR_PWS, CARGAR_AUTH, CAMBIAR_BLUE_COLLAR
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
        return request("/documentos?_limit=0").then(response => {
            dispatch(cargarDocumentos(response))
        })
        .catch(error => {
            throw(error);
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
            throw(error);
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
            throw(error);
        });
    };
};