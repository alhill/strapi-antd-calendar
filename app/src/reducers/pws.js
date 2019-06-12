import { 
    CARGAR_PWS
} from "../constants/action-types";

export default function pwsReducer(state = [], action) {
    switch (action.type) {
        case CARGAR_PWS:
            console.log(action)
            return action.payload;
        default:
            return state;
    }
}