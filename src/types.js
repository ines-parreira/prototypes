//@flow
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
        error: string,
    }>,
}

export type attachmentType = {
    content_type: string,
    name: string,
    size: number,
    url: string,
    type: string,
}

export type schemasType = Map<*, *>

// 3rd party

// react-router 3.x
export type reactRouterLocation = {
    query: {
        _activity_polling?: boolean,
        customer?: string,
    },
    pathname: string,
    search: string,
}

type reactRouterSingleRoute = {
    path: string,
    component: any,
}

export type reactRouterRoute = reactRouterSingleRoute & {
    childRoutes?: Array<reactRouterSingleRoute>,
}

export type ReactRouterInjectedRouter = {
    setRouteLeaveHook: (
        route: any,
        callback: (nextLocation?: reactRouterLocation) => any
    ) => void,
}

// esprima
export type esprimaParse = {
    body: Array<{}>,
    sourceType: 'script',
    type: 'Program',
}
