import type {
    ButtonAction,
    ContentType,
    HttpMethod,
    ParameterType,
} from './customActionTypes'

export const PARAMETER_TYPES: Array<{ id: ParameterType; name: string }> = [
    { id: 'text', name: 'Text' },
    { id: 'dropdown', name: 'Dropdown' },
]

export const HTTP_METHODS: Array<{ id: HttpMethod; name: string }> = [
    { id: 'GET', name: 'GET' },
    { id: 'POST', name: 'POST' },
    { id: 'PUT', name: 'PUT' },
    { id: 'DELETE', name: 'DELETE' },
    { id: 'PATCH', name: 'PATCH' },
]

export const CONTENT_TYPES: Array<{ id: ContentType; name: string }> = [
    { id: 'application/json', name: 'JSON' },
    { id: 'application/x-www-form-urlencoded', name: 'Form' },
]

export const METHODS_WITH_BODY: HttpMethod[] = ['POST', 'PUT', 'PATCH']

export const DROPDOWN_VALUES_LIMIT = 10

export const INITIAL_BODY: ButtonAction['body'] = {
    contentType: 'application/json',
    'application/json': {},
    'application/x-www-form-urlencoded': [],
}

export const INITIAL_ACTION: ButtonAction = {
    method: 'GET',
    url: '',
    headers: [],
    params: [],
    body: { ...INITIAL_BODY },
}
