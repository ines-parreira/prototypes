import {Map} from 'immutable'

import {ContentType, HttpMethod} from '../../models/api/types'

export type HTTPIntegrationEvent = {
    created_datetime: string
    id: string
    integration_id: number
    request: {
        headers: {
            'content-type': ContentType
        }
        method: HttpMethod
        url: string
    }
    reponse: {
        body: string
        headers: {
            'Access-Control-Allow-Credentials'?: string
            'Access-Control-Allow-Origin'?: string
            Connection?: string
            'Content-Length'?: string
            'Content-Type'?: ContentType
            Date?: string
            Server?: string
        }
        status_code: number
    }
}

export type HTTPIntegrationEventsState = Map<any, any>
