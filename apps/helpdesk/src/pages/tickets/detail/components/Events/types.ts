import type { Map } from 'immutable'

export type actionConfigType = {
    name: string
    label: string
    objectType: string
}

export type eventMaker = {
    integration: Map<any, any>
    actionConfig: actionConfigType
    payload: Map<any, any>
    data: Map<any, any>
}

export type integrationEvent = {
    objectLabel: string
    objectLink: string
}
