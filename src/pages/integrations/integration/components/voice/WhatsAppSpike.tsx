import React, {useState} from 'react'
import {useEffectOnce} from 'react-use'

import Button from 'pages/common/components/button/Button'
import client from 'models/api/resources'

const submitAccessToken = async (accessToken: string) => {
    await client.post('/integrations/whatsapp/onboard', {
        access_token: accessToken,
    })
}

export function initFacebookSdk(onComplete: () => void) {
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
            appId: '5821065397904485',
            cookie: true,
            xfbml: true,
            version: 'v15.0',
        })
        onComplete()
    }
}

function launchWhatsAppSignup() {
    if (!window.FB) {
        return
    }

    window.FB.login(
        function (response: facebook.StatusResponse) {
            if (response.authResponse) {
                const accessToken = response.authResponse.accessToken
                submitAccessToken(accessToken).catch((error) => {
                    console.error('Failed to submit token.', error)
                })
            } else {
                console.error(
                    'User cancelled login or did not fully authorize.'
                )
            }
        },
        {
            scope: 'business_management,whatsapp_business_management',
            extras: {
                feature: 'whatsapp_embedded_signup',
                setup: {},
            },
        } as facebook.LoginOptions
    )
}

const WhatsAppSpike = () => {
    const [isInitialized, setIsInitialized] = useState(false)
    const [accessToken, setAccessToken] = useState('')

    useEffectOnce(() => {
        if (isInitialized) {
            return
        }

        initFacebookSdk(() => setIsInitialized(true))
    })

    if (!isInitialized) {
        return null
    }

    return (
        <>
            <div style={{marginRight: 50}}>
                <h3>Launch the embedded signup flow</h3>
                <Button
                    onClick={() => {
                        launchWhatsAppSignup()
                    }}
                >
                    Login with Facebook
                </Button>
            </div>
            <div>
                <h3>Submit an already obtained access token</h3>
                <span>
                    <input
                        onChange={(event) => setAccessToken(event.target.value)}
                        placeholder="access token"
                    />
                    <Button
                        onClick={() => submitAccessToken(accessToken)}
                        style={{marginLeft: 10}}
                    >
                        Send
                    </Button>
                </span>
            </div>
        </>
    )
}

export default WhatsAppSpike
