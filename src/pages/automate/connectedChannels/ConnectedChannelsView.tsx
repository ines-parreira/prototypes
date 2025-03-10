import React, { useMemo } from 'react'

import {
    NavLink,
    Route,
    Switch,
    useParams,
    useRouteMatch,
} from 'react-router-dom'

import PageHeader from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'

import { AiAgentMovedBanner } from '../common/components/AiAgentMovedBanner'
import { AVAILABLE_CHANNELS, CHANNELS } from '../common/components/constants'
import { useDisplayAiAgentMovedBanner } from '../common/hooks/useDisplayAiAgentMovedBanner'
import { ConnectedChannelsChatView } from './components/ConnectedChannelsChatView'
import { ConnectedChannelsContactFormView } from './components/ConnectedChannelsContactFormView'
import { ConnectedChannelsEmailView } from './components/ConnectedChannelsEmailView'
import { ConnectedChannelsHelpCenterView } from './components/ConnectedChannelsHelpCenterView'

import css from './ConnectedChannelsView.less'

export const ConnectedChannelsView = () => {
    const displayAiAgentMovedBanner = useDisplayAiAgentMovedBanner()
    const { shopType, shopName } = useParams<{
        shopType: string
        shopName: string
    }>()
    const isAutomateSettings = useIsAutomateSettings()

    const baseURL = useMemo(() => {
        if (isAutomateSettings) {
            return `/app/settings/flows/${shopType}/${shopName}/channels`
        }
        return `/app/automation/${shopType}/${shopName}/connected-channels`
    }, [isAutomateSettings, shopType, shopName])

    const headerNavbarItems = [
        {
            title: AVAILABLE_CHANNELS.CHAT,
            route: baseURL,
        },
        {
            title: AVAILABLE_CHANNELS.HELP_CENTER,
            route: `${baseURL}/help-center`,
        },
        {
            title: AVAILABLE_CHANNELS.CONTACT_FORM,
            route: `${baseURL}/contact-form`,
        },
        {
            title: AVAILABLE_CHANNELS.EMAIL,
            route: `${baseURL}/email`,
        },
    ]

    const { path } = useRouteMatch()

    return (
        <div className={css.pageContainer}>
            {displayAiAgentMovedBanner && <AiAgentMovedBanner />}
            {!isAutomateSettings && (
                <div className={css.pageHeader}>
                    <PageHeader title={CHANNELS} />

                    <SecondaryNavbar>
                        {headerNavbarItems.map(({ route, title }) => (
                            <NavLink key={route} to={route} exact={true}>
                                {title}
                            </NavLink>
                        ))}
                    </SecondaryNavbar>
                </div>
            )}

            <div
                className={css.settingsContainer}
                ref={(e) => {
                    if (!e) return
                    const isOverflowing = e.scrollHeight > e.clientHeight
                    if (isOverflowing) {
                        e.classList.remove(css.fullHeight)
                    } else {
                        e.classList.add(css.fullHeight)
                    }
                }}
            >
                <Switch>
                    <Route
                        path={path}
                        exact
                        component={() => <ConnectedChannelsChatView />}
                    />
                    <Route
                        path={`${path}/help-center`}
                        component={() => <ConnectedChannelsHelpCenterView />}
                        exact
                    />
                    <Route
                        path={`${path}/contact-form`}
                        component={() => <ConnectedChannelsContactFormView />}
                        exact
                    />
                    <Route
                        path={`${path}/email`}
                        component={() => <ConnectedChannelsEmailView />}
                        exact
                    />
                </Switch>
            </div>
        </div>
    )
}
