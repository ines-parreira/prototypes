// @flow
import * as Sentry from '@sentry/react'

type SentryConfig = {
    release: string,
    environment: string,
    dsn: string,
    currentAccount: {
        domain: string,
    },
    currentUser: {
        id: string,
        account_id: string,
        name: string,
        email: string,
    },
}

const initSentry = ({
    release,
    environment,
    dsn,
    currentUser,
    currentAccount,
}: SentryConfig): void => {
    Sentry.init({
        release,
        environment,
        dsn,
        denyUrls: [/extensions\//i, /^chrome:\/\//i],
        ignoreErrors: [
            'fb_xd_fragment', // Facebook borked
            'draft-js/lib/*', // Draft JS errors
        ],
        beforeSend(event) {
            if (
                !/^(.+Mobile.+Safari.+|.+MSIE 8\.0;.+)$/.test(
                    window.navigator.userAgent
                )
            ) {
                return event
            }
            return null
        },
    })

    Sentry.configureScope(function (scope) {
        if (currentAccount && currentAccount.domain) {
            scope.setTag('account.domain', currentAccount.domain)
        }
        if (currentUser) {
            const {id, account_id, name, email} = currentUser
            scope.setUser({
                id,
                account_id,
                name,
                email,
            })
        }
    })
}

export default initSentry
