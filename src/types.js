/* Reusable Flow types.
 */

import type {Map} from 'immutable'

export type actionTemplateType = {
    execution: 'front' | 'back',
    name: string,
    title: string,
    notes?: Array<string>,
    integrationType?: string,
    arguments?: {},
    validators?: Array<{
        validate: ({integrations: Array<*>}) => {} | boolean,
        error: string
    }>
}

export type attachmentType = {
    content_type: string,
    name: string,
    size: number,
    url: string
}

export type schemasType = Map<*,*>

// 3rd party

// react-router 3.x
export type reactRouterLocation = {
    query: {
        _activity_polling?: boolean
    },
    pathname: string
}

type reactRouterSingleRoute = {
    path: string,
    component: any
}

export type reactRouterRoute = reactRouterSingleRoute & {
  childRoutes?: Array<reactRouterSingleRoute>
}

// esprima
export type esprimaParse = {
    body: Array<{}>,
    sourceType: 'script',
    type: 'Program'
}
