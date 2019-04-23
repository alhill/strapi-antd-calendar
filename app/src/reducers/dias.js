import { 
    CARGAR_CALENDARIO
} from "../constants/action-types";

export default function diasReducer(state = [], action) {
    switch (action.type) {
        case CARGAR_CALENDARIO:
            console.log(action)
            return action.payload;
        default:
            return state;
    }
}