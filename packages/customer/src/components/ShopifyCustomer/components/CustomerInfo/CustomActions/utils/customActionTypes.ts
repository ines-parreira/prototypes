import type { Widget } from '@gorgias/helpdesk-types'

export type ParameterType = 'text' | 'dropdown'

export type Parameter = {
    id: string
    key: string
    value: string
    type?: ParameterType
    label?: string
    editable?: boolean
    mandatory?: boolean
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
export type ContentType =
    | 'application/json'
    | 'application/x-www-form-urlencoded'

export type ButtonAction = {
    method: HttpMethod
    url: string
    headers: Parameter[]
    params: Parameter[]
    body: {
        contentType: ContentType
        'application/json': Record<string, unknown> | string
        'application/x-www-form-urlencoded': Parameter[]
    }
}

export type ButtonConfig = { label: string; action: ButtonAction }
export type LinkConfig = { label: string; url: string }

export type NestedWidget = {
    path?: string
    type?: string
    meta?: {
        custom?: {
            links?: LinkConfig[]
            buttons?: ButtonConfig[]
        }
        [key: string]: unknown
    }
    [key: string]: unknown
}

export type WidgetTemplate = {
    type?: string
    widgets?: NestedWidget[]
    meta?: Record<string, unknown>
    [key: string]: unknown
}

export type ShopifyWidget = Widget & {
    template?: WidgetTemplate
}
