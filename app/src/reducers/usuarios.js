import { 
    CARGAR_USUARIOS
} from "../constants/action-types";

export default function usuariosReducer(state = [], action) {
    switch (action.type) {
        case CARGAR_USUARIOS:
            console.log(action)
            return action.payload;
        default:
            return state;
    }
}