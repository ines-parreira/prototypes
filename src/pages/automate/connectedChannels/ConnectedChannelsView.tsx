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
import {AVAILABLE_CHANNELS, CHANNELS} from '../common/components/constants'
import {ConnectedChannelsChatView} from './components/ConnectedChannelsChatView'
import css from './ConnectedChannelsView.less'
import {ConnectedChannelsHelpCenterView} from './components/ConnectedChannelsHelpCenterView'
import {ConnectedChannelsContactFormView} from './components/ConnectedChannelsContactFormView'
import {ConnectedChannelsEmailView} from './components/ConnectedChannelsEmailView'

export const ConnectedChannelsView = () => {
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
    )
}
