import {AccountFeatureMetadata} from '../state/currentAccount/types'

export function isFeatureEnabled(
    featureMetadata: AccountFeatureMetadata
): boolean {
    return featureMetadata.enabled
}

/**
 * Temporary function returning if an account will be affected by this breaking change:
 * https://developers.gorgias.com/changelog/users-passwords-will-not-be-accepted-anymore-to-authenticate-requests
 */
export const isAccountAffectedByApiBreakingChange = (
    accountDomain: string
): boolean => {
    return [
        'acme',
        '4patriots',
        'cardalloon',
        'onequince',
        'portosbakery',
        'discountelectronics',
        'designeroptics',
        'thefeed',
        'foodcheri',
        'vermontflannel',
        'frichti',
        'hello-nomad',
        'riversol',
        'kollohealth',
        'wefeedraw',
        'brosa',
        'chylak',
        'regimesanssel',
        'misha-and-puff',
        'liveouter',
        'cerebelly',
        'mosiebaby',
        'aikidosteel',
        'nonnalive',
        'augieeyewear',
        'zesttorganics',
        'korkers',
        'happyhealthyyou',
        'missamara',
        'lilyandjo',
        'funboy',
        'july',
        'clarev',
        'greatbayhome',
        'thryfty',
        'dundasworld',
    ].includes(accountDomain)
}
