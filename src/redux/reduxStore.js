import { applyMiddleware, createStore } from "redux";
import rootReducer from './reducers';

let reduxStore = (defaultState = {
    user: null,
    searchCollectionData: {
        searchCollectionInput: "explore"
    }
}) => {
    return createStore(rootReducer, defaultState);
}

export default reduxStore;