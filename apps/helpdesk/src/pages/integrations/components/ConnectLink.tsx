import type { ReactElement, ReactNode } from 'react'
import React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { Link } from 'react-router-dom'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import { useAppSelector } from 'hooks/useAppSelector'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import css from './ConnectLink.less'

const CONNECT_BUTTON_ID = 'connect-button'

const trackInstalls =
    (
        integrationTitle = '',
        isApp: boolean,
        domain: string,
        onClick?: () => void,
    ) =>
    () => {
        logEvent(SegmentEvent.IntegrationConnectClicked, {
            integration: integrationTitle.toLowerCase(),
            is_openchannel_app: isApp,
            account_domain: domain,
        })
        onClick?.()
    }

type Props = {
    connectUrl: string
    isApp?: boolean
    isExternal?: boolean
    integrationTitle: string
    isDisabled?: boolean
    disabledMessage?: ReactElement | string
    onClick?: () => void
    children: ReactNode
}

export function ConnectLink({
    connectUrl,
    isExternal,
    integrationTitle,
    isApp = false,
    isDisabled,
    disabledMessage,
    onClick,
    children,
}: Props) {
    const domain = useAppSelector(getCurrentAccountState).get('domain')

    if (isDisabled) {
        return (
            <>
                <span className={css.connectButtonWrapper}>
                    {children}
                    <span
                        className={css.connectTooltip}
                        id={CONNECT_BUTTON_ID}
                    />
                </span>
                {disabledMessage && (
                    <Tooltip placement="bottom" target={CONNECT_BUTTON_ID}>
                        {disabledMessage}
                    </Tooltip>
                )}
            </>
        )
    }
    let sanitizedConnectUrl = connectUrl
    // The modification below ensure we have proper query param to handle OAuth redirection
    if (isApp) {
        let url
        try {
            url = new URL(connectUrl)
        } catch {
            url = new URL('https://docs.gorgias.com/')
        }
        url.searchParams.set('account', domain)
        sanitizedConnectUrl = url.toString()
    }
    return isApp || isExternal ? (
        <a
            href={sanitizedConnectUrl}
            onClick={trackInstalls(integrationTitle, isApp, domain, onClick)}
            target="_blank"
            rel="noopener noreferrer"
            className={css.connectButtonWrapper}
        >
            {children}
        </a>
    ) : (
        <Link
            to={connectUrl}
            onClick={trackInstalls(integrationTitle, isApp, domain, onClick)}
            className={css.connectButtonWrapper}
        >
            {children}
        </Link>
    )
}
