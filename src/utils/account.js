import _isString from 'lodash/isString'

export const canUseNewRevenueStats = (accountId: number): boolean => {
    // `19447`: The ID of the most recent account created
    // when the new revenue statistics feature has been deployed.
    // Accounts with an ID superior to this one have data to be displayed
    // so they can use this new feature.
    // `15513`: louistestaccount
    return accountId && [15513, 10637].includes(accountId)
}

/**
 *
 * DO NOT USE IT OR RELY ON IT to get the ID of the current account.
 * This is an HACK and TEMPORARY function.
 *
 */
// TODO(@LouisBarranqueiro): remove this function on May 15th.
export const getCurrentAccountId = (window: Window): number | null => {
    // Format of the Segment user ID is `{{accountId}}_{{userId}}`.
    const segmentUserId = window.SEGMENT_ANALYTICS_USER_ID
    if (!_isString(segmentUserId) || !segmentUserId.match(/^[0-9]+_[0-9]+$/)) {
        return null
    }

    const [accountId] = segmentUserId.split('_')
    return accountId ? parseInt(accountId) : null
}
