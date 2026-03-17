import { Route, Switch, useRouteMatch } from 'react-router-dom'

import { ConnectedChannelsContactFormView } from '../legacy/components/ConnectedChannelsContactFormView'
import { ConnectedChannelsEmailView } from '../legacy/components/ConnectedChannelsEmailView'
import { ConnectedChannelsHelpCenterView } from '../legacy/components/ConnectedChannelsHelpCenterView'
import { ConnectedChannelsChatView } from './components/ConnectedChannelsChatView/ConnectedChannelsChatView'
import { useConnectedChannelsPreviewPanel } from './hooks/useConnectedChannelsPreviewPanel'

import css from './ConnectedChannelsView.less'

export const ConnectedChannelsView = () => {
    const { path } = useRouteMatch()

    useConnectedChannelsPreviewPanel()

    return (
        <div className={css.container}>
            <Switch>
                <Route
                    path={path}
                    exact
                    component={() => <ConnectedChannelsChatView />}
                />
                <Route
                    path={`${path}/help-center`}
                    exact
                    component={() => <ConnectedChannelsHelpCenterView />}
                />
                <Route
                    path={`${path}/contact-form`}
                    exact
                    component={() => <ConnectedChannelsContactFormView />}
                />
                <Route
                    path={`${path}/email`}
                    exact
                    component={() => <ConnectedChannelsEmailView />}
                />
            </Switch>
        </div>
    )
}
