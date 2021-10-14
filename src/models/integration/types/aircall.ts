// g/integrations/aircall/schemas.py

import {createTypeGuard} from '../../../utils'

import {IntegrationType} from '../constants'

import {IntegrationBase} from './base'

import type {Integration} from './'

export type AircallIntegration = IntegrationBase & {
    type: IntegrationType.Aircall
    meta: AircallIntegrationMeta
}

type AircallIntegrationMeta = {
    address: string
}

export const isAircallIntegration = createTypeGuard<
    Maybe<Integration>,
    AircallIntegration
>((input: Maybe<Integration>) =>
    input?.type === IntegrationType.Aircall ? input : undefined
)
