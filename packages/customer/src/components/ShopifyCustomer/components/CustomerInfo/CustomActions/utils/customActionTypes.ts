export type ParameterType = 'text' | 'dropdown'

export type Parameter = {
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
        'application/json': unknown
        'application/x-www-form-urlencoded': Parameter[]
    }
}

export type ButtonConfig = { label: string; action: ButtonAction }
export type LinkConfig = { label: string; url: string }
