import moment from 'moment'
import {TWO_FA_REQUIRED_AFTER_DAYS} from 'state/currentUser/constants'

export function buildPasswordAnd2FaText(hasPassword: boolean) {
    let passwordAnd2FaText = 'Password & 2FA'

    if (!hasPassword) {
        passwordAnd2FaText = '2FA'
    }

    return passwordAnd2FaText
}

export function check2FARequired(
    twoFAEnforcedDatetime: Maybe<string>,
    has2FAEnabled: boolean
) {
    if (!twoFAEnforcedDatetime) {
        return false
    }

    if (has2FAEnabled) {
        return false
    }

    return (
        moment().diff(moment.utc(twoFAEnforcedDatetime), 'days') >=
        TWO_FA_REQUIRED_AFTER_DAYS
    )
}

export function checkAccessTo2FAEnforcement(domain: string) {
    return (
        // allow access to 2FA enforcement for specified domains and for preview envs
        domain
            ? ['acme', 'test-martin', 'ionut-zamfir'].includes(domain) ||
                  domain.includes('.preview')
            : false
    )
}
