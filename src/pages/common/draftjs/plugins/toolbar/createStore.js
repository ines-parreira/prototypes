const createStore = (initialState) => {
    let state = initialState || {}
    const listeners = {}

    const updateItem = (key, item) => {
        state = {
            ...state,
            [key]: item,
        }
        if (listeners[key]) {
            listeners[key].forEach((listener) => listener(state[key]))
        }
    }

    const getItem = key => state[key]

    return {
        updateItem,
        getItem,
    }
}

export default createStore
