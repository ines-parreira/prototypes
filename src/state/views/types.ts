import type {Map} from 'immutable'

export type ViewsState = Map<any, any>

export type ViewFilter = {
    operator: string
    left: string
    right: string
}

export type View = Map<any, any>
