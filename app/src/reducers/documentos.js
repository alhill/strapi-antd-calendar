import { 
    CARGAR_DOCUMENTOS
} from "../constants/action-types";

export default function documentosReducer(state = [], action) {
    switch (action.type) {
        case CARGAR_DOCUMENTOS:
            console.log(action)
            return action.payload;
        default:
            return state;
    }
}