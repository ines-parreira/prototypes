import type { FC, ReactNode, SyntheticEvent } from 'react'
import React from 'react'

import type { LegacyButtonIntent } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { getFacebookRedirectUri } from 'state/integrations/selectors'

import FacebookLoginButton from './FacebookLoginButton'

type Props = {
    children?: ReactNode
    intent?: LegacyButtonIntent
    link?: boolean
    reconnect?: boolean
}

const FacebookIntegrationLoginButton: FC<Props> = ({
    children,
    intent,
    link = false,
    reconnect = false,
}) => {
    const redirectUri = useAppSelector(getFacebookRedirectUri(reconnect))

    const handleSubmit = (e: SyntheticEvent, redirectUri: string) => {
        e.preventDefault()
        window.open(redirectUri)
    }

    return link ? (
        <a href={redirectUri}>{children || 'Login with Facebook'}</a>
    ) : (
        <FacebookLoginButton
            intent={intent}
            onClick={(e) => handleSubmit(e, redirectUri)}
        >
            {children || 'Reconnect'}
        </FacebookLoginButton>
    )
}

export default FacebookIntegrationLoginButton
