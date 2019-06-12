import { 
    CARGAR_GRUPOS
} from "../constants/action-types";

export default function gruposReducer(state = [], action) {
    switch (action.type) {
        case CARGAR_GRUPOS:
            console.log(action)
            return action.payload;
        default:
            return state;
    }
}