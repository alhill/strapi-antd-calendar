import { 
    CARGAR_ENTRADAS
} from "../constants/action-types";

export default function entradasReducer(state = [], action) {
    switch (action.type) {
        case CARGAR_ENTRADAS:
            console.log(action)
            return action.payload.data.entradas;
        default:
            return state;
    }
}