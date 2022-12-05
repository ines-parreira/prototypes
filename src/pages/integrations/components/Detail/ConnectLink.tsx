import React, {ReactElement, ReactNode} from 'react'
import {Link} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import Tooltip from 'pages/common/components/Tooltip'
import css from './Detail.less'

const CONNECT_BUTTON_ID = 'connect-button'

const trackInstalls =
    (integrationTitle = '', isApp: boolean, domain: string) =>
    () => {
        logEvent(SegmentEvent.IntegrationConnectClicked, {
            integration: integrationTitle.toLowerCase(),
            is_openchannel_app: isApp,
            account_domain: domain,
        })
    }

type Props = {
    connectUrl: string
    isApp?: boolean
    isExternal?: boolean
    integrationTitle: string
    isDisabled?: boolean
    disabledMessage?: ReactElement | string
    children: ReactNode
}

export default function ConnectLink({
    connectUrl,
    isExternal,
    integrationTitle,
    isApp = false,
    isDisabled,
    disabledMessage,
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
        } catch (e) {
            url = new URL('https://docs.gorgias.com/')
        }
        url.searchParams.set('account', domain)
        sanitizedConnectUrl = url.toString()
    }
    return isApp || isExternal ? (
        <a
            href={sanitizedConnectUrl}
            onClick={trackInstalls(integrationTitle, isApp, domain)}
            {...(isApp && {
                target: '_blank',
                rel: 'noopener noreferrer',
            })}
            className={css.connectButtonWrapper}
        >
            {children}
        </a>
    ) : (
        <Link
            to={connectUrl}
            onClick={trackInstalls(integrationTitle, isApp, domain)}
            className={css.connectButtonWrapper}
        >
            {children}
        </Link>
    )
}
