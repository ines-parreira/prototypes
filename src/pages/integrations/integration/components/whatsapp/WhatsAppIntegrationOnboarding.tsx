import {useAsyncFn, useEffectOnce} from 'react-use'
import React, {useState} from 'react'
import {Container} from 'reactstrap'

import history from 'pages/history'
import client from 'models/api/resources'
import {reportError} from 'utils/errors'

import css from 'pages/settings/settings.less'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {fetchIntegrations} from 'state/integrations/actions'
import {GorgiasApiError} from 'models/api/types'
import FacebookLoginButton from '../facebook/FacebookLoginButton/FacebookLoginButton'

async function submitAccessToken(accessToken: string) {
    await client.post('/integrations/whatsapp/onboard', {
        access_token: accessToken,
    })
}

function initFacebookSdk(onComplete: () => void) {
    const tagId = 'facebook-jssdk'
    if (document.getElementById(tagId)) {
        return
    }

    const scriptTag = document.createElement('script')
    scriptTag.id = tagId
    scriptTag.async = true
    scriptTag.defer = true
    scriptTag.crossOrigin = 'anonymus'
    scriptTag.src = 'https://connect.facebook.net/en_US/sdk.js'
    document.head.appendChild(scriptTag)

    window.fbAsyncInit = function () {
        window.FB.init({
            appId: window.WHATSAPP_APP_ID,
            cookie: true,
            version: 'v15.0',
        })
        onComplete()
    }
}

async function onboardWhatsAppNumber(): Promise<string> {
    if (!window.FB) {
        return Promise.reject(new Error('Facebook SDK is not initialized'))
    }

    return new Promise((resolve, reject) => {
        window.FB.login(
            function (response: facebook.StatusResponse) {
                if (!response.authResponse) {
                    const error = new Error(
                        'User cancelled login or did not fully authorize.'
                    )
                    return reject(error)
                }

                return resolve(response.authResponse.accessToken)
            },
            {
                scope: 'business_management,whatsapp_business_management',
                auth_type: 'reauthenticate',
                extras: {
                    feature: 'whatsapp_embedded_signup',
                    setup: {},
                },
            } as facebook.LoginOptions
        )
    })
}

export default function WhatsAppIntegrationOnboarding(): JSX.Element | null {
    const [isInitialized, setIsInitialized] = useState(false)
    const dispatch = useAppDispatch()

    useEffectOnce(() => {
        if (isInitialized) {
            return
        }

        initFacebookSdk(() => setIsInitialized(true))
    })

    const [{loading: isSubmitting}, handleOnboarding] = useAsyncFn(async () => {
        try {
            const token = await onboardWhatsAppNumber()
            await submitAccessToken(token)
            void dispatch(fetchIntegrations())
            void dispatch(
                notify({
                    message: 'Integration created successfully',
                    status: NotificationStatus.Success,
                })
            )
            history.push('/app/settings/integrations/whatsapp/integrations')
        } catch (error) {
            const message =
                (error as GorgiasApiError)?.response?.data?.error?.msg ??
                'Failed to onboard integration'

            void dispatch(
                notify({
                    message,
                    status: NotificationStatus.Error,
                })
            )

            if (error instanceof Error) {
                reportError(error)
            }
        }
    })

    if (!isInitialized) {
        return null
    }

    return (
        <Container fluid className={css.pageContainer}>
            <h3 className="mb-1">Connect WhatsApp</h3>
            <p>
                You will be redirected to log in with Facebook to continue
                setting up your WhatsApp business account.
            </p>
            <div className="mt-2">
                <FacebookLoginButton
                    onClick={handleOnboarding}
                    isLoading={isSubmitting}
                    showIcon
                />
            </div>
        </Container>
    )
}
