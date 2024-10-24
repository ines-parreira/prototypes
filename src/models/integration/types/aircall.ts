// g/integrations/aircall/schemas.py
import {IntegrationType} from '../constants'
import type {Integration} from './'
import type {IntegrationBase} from './base'

export type AircallIntegration = IntegrationBase & {
    type: IntegrationType.Aircall
    meta: AircallIntegrationMeta
}

type AircallIntegrationMeta = {
    address: string
}

export const isAircallIntegration = (
    integration: Maybe<Integration>
): integration is AircallIntegration =>
    integration?.type === IntegrationType.Aircall
