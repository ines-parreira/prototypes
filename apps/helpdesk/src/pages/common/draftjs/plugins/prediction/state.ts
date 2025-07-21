import { SelectionState } from 'draft-js'

type State<T> = {
    current: T | null
    get: () => T | null
    set: (value: T | null) => void
}

export const cachedSelection: State<SelectionState> = {
    current: null,

    get() {
        return this.current
    },

    set(value) {
        this.current = value
    },
}

export const predictionKey: State<string> = {
    current: null,

    get() {
        return this.current
    },

    set(value) {
        this.current = value
    },
}
