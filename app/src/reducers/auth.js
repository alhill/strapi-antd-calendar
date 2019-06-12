import { 
    CARGAR_AUTH
} from "../constants/action-types";

export default function authReducer(state = {}, action) {
    switch (action.type) {
        case CARGAR_AUTH:
            console.log(action)
            return action.payload;
        default:
            return state;
    }
}