import React from 'react'

import { Route, Switch, useRouteMatch } from 'react-router-dom'

import { ConnectedChannelsChatView } from './components/ConnectedChannelsChatView'
import { ConnectedChannelsContactFormView } from './components/ConnectedChannelsContactFormView'
import { ConnectedChannelsEmailView } from './components/ConnectedChannelsEmailView'
import { ConnectedChannelsHeader } from './components/ConnectedChannelsHeader'
import { ConnectedChannelsHelpCenterView } from './components/ConnectedChannelsHelpCenterView'

import css from './ConnectedChannelsView.less'

export const ConnectedChannelsView = () => {
    const { path } = useRouteMatch()

    return (
        <div className={css.pageContainer}>
            <ConnectedChannelsHeader />

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
