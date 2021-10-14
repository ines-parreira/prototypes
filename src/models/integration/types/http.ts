// g/integrations/http/schemas.py

import {createTypeGuard} from '../../../utils'

import {IntegrationType} from '../constants'

import {IntegrationBase} from './base'

import type {Integration} from './'

export type HttpIntegration = IntegrationBase & {
    type: IntegrationType.Http
    meta: Record<string, unknown>
}

export const isHttpIntegration = createTypeGuard<
    Maybe<Integration>,
    HttpIntegration
>((input: Maybe<Integration>) =>
    input?.type === IntegrationType.Http ? input : undefined
)
