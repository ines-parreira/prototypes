//@flow

export type Store = {
    updateItem: (string, any) => void,
    getItem: (string) => any
}

const createStore = (initialState: any): Store => {
    let state = initialState || {}
    const listeners = {}

    const updateItem = (key: string, item: any) => {
        state = {
            ...state,
            [key]: item,
        }
        if (listeners[key]) {
            listeners[key].forEach((listener) => listener(state[key]))
        }
    }

    const getItem = (key: string) => state[key]

    return {
        updateItem,
        getItem,
    }
}

export default createStore
