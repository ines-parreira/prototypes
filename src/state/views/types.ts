import {Map} from 'immutable'

export enum ViewNavDirection {
    PrevView = 'prev',
    NextView = 'next',
}

export type ViewsState = Map<any, any>

export type ViewFilter = {
    operator: string
    left: string
    right?: string
}

export type ViewImmutable = Map<any, any>
