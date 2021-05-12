import moment from 'moment'
import {Map} from 'immutable'

export const isAccountCreatedBeforeFeatureBasedPlans = (createdAt: string) => {
    return moment(createdAt).isBefore(moment('2021-02-01'))
}

export function isFeatureEnabled(
    featureMetadata: boolean | Map<any, any>
): boolean {
    return typeof featureMetadata === 'boolean'
        ? featureMetadata
        : (featureMetadata.get('enabled') as boolean)
}
