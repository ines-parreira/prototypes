import {ContentType, HttpMethod} from 'models/api/types'
import type {EventType} from 'models/event/types'
import type {Field} from 'pages/integrations/integration/components/http/Integration/ObjectListField'
import {IntegrationType} from '../constants'
import type {IntegrationBase} from './base'
import type {Integration} from './'

export type HttpIntegration = IntegrationBase & {
    type: IntegrationType.Http
    meta: Record<string, unknown>
    http: Maybe<HttpIntegrationMeta>
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
    request_content_type: ContentType
    response_content_type: ContentType
    triggers: {
        [key in typeof EventType[keyof typeof EventType]]?: boolean
    }
    url: string
}

export type HTTPForm = string | null | Record<string, unknown> | Field[]

export const isHttpIntegration = (
    integration: Maybe<Integration>
): integration is HttpIntegration => integration?.type === IntegrationType.Http
