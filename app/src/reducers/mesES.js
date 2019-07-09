import { 
    CAMBIAR_MES_ES
} from "../constants/action-types";
import moment from "moment";

export default function mesESReducer(state = moment(), action) {
    switch (action.type) {
        case CAMBIAR_MES_ES:
            return action.payload;
        default:
            return state;
    }
}