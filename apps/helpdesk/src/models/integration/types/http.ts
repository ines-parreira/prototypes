import type { ContentType, HttpMethod } from 'models/api/types'
import type { EventType } from 'models/event/types'
import type { Field } from 'pages/integrations/integration/components/http/Integration/ObjectListField'

import { IntegrationType } from '../constants'
import type { Integration } from './'
import type { IntegrationBase } from './base'

export type HttpIntegration = IntegrationBase & {
    type: IntegrationType.Http
    meta: Record<string, unknown>
    http: Maybe<HttpIntegrationMeta>
}

export enum OAuth2TokenLocation {
    Header = 'header',
    QueryString = 'query',
}

export type OAuth2Config = {
    token_url: string
    client_id: string
    client_secret: string
    token_location: OAuth2TokenLocation
    token_key: string
    scopes?: string
}

export type HttpIntegrationMeta = {
    execution_order: number
    form: HTTPForm
    headers: Record<string, unknown> & {
        'Content-Type'?: ContentType
        'content-type'?: ContentType
    }
    id: number
    method: HttpMethod
    oauth2?: OAuth2Config
    request_content_type: ContentType
    response_content_type: ContentType
    triggers: {
        [key in (typeof EventType)[keyof typeof EventType]]?: boolean
    }
    url: string
}

export type HTTPForm = string | null | Record<string, unknown> | Field[]

export const isHttpIntegration = (
    integration: Maybe<Integration>,
): integration is HttpIntegration => integration?.type === IntegrationType.Http

export type HTTPIntegrationEvent = {
    created_datetime: string
    id: string
    integration_id: number
    request?: {
        headers?: {
            'Content-Type'?: ContentType
            'content-type'?: ContentType
        }
        method: HttpMethod
        url: string
        params?: Record<string, string> | string
        body?: Record<string, string> | string
    }
    status_code: number
    response: {
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
        error?: string
    }
}
