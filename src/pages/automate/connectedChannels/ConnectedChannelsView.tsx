import React from 'react'
import {
    NavLink,
    Route,
    Switch,
    useParams,
    useRouteMatch,
} from 'react-router-dom'

import PageHeader from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'

import {AiAgentMovedBanner} from '../common/components/AiAgentMovedBanner'
import {AVAILABLE_CHANNELS, CHANNELS} from '../common/components/constants'
import {useDisplayAiAgentMovedBanner} from '../common/hooks/useDisplayAiAgentMovedBanner'
import {ConnectedChannelsChatView} from './components/ConnectedChannelsChatView'
import {ConnectedChannelsContactFormView} from './components/ConnectedChannelsContactFormView'
import {ConnectedChannelsEmailView} from './components/ConnectedChannelsEmailView'
import {ConnectedChannelsHelpCenterView} from './components/ConnectedChannelsHelpCenterView'
import css from './ConnectedChannelsView.less'

export const ConnectedChannelsView = () => {
    const displayAiAgentMovedBanner = useDisplayAiAgentMovedBanner()
    const {shopType, shopName} = useParams<{
        shopType: string
        shopName: string
    }>()

    const baseUrl = `/app/automation/${shopType}/${shopName}/connected-channels`
    const headerNavbarItems = [
        {
            title: AVAILABLE_CHANNELS.CHAT,
            route: baseUrl,
        },
        {
            title: AVAILABLE_CHANNELS.HELP_CENTER,
            route: `${baseUrl}/help-center`,
        },
        {
            title: AVAILABLE_CHANNELS.CONTACT_FORM,
            route: `${baseUrl}/contact-form`,
        },
        {
            title: AVAILABLE_CHANNELS.EMAIL,
            route: `${baseUrl}/email`,
        },
    ]

    const {path} = useRouteMatch()

    return (
        <div className={css.pageContainer}>
            {displayAiAgentMovedBanner && <AiAgentMovedBanner />}
            <div className={css.pageHeader}>
                <PageHeader title={CHANNELS} />

                <SecondaryNavbar>
                    {headerNavbarItems.map(({route, title}) => (
                        <NavLink key={route} to={route} exact={true}>
                            {title}
                        </NavLink>
                    ))}
                </SecondaryNavbar>
            </div>

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
