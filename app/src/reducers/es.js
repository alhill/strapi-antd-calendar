import { 
    CARGAR_ES
} from "../constants/action-types";

export default function esReducer(state = {}, action) {
    switch (action.type) {
        case CARGAR_ES:
            console.log(action)
            return action.payload;
        default:
            return state;
    }
}