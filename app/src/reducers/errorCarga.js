import { 
    FALLO_CARGA
} from "../constants/action-types";

export default function falloCargaReducer(state = { error: false }, action) {
    switch (action.type) {
        case FALLO_CARGA:
            return action.payload;
        default:
            return state;
    }
}