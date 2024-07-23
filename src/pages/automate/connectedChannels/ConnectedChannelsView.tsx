import React from 'react'
import {Route, Switch, useParams, useRouteMatch} from 'react-router-dom'
import {Container} from 'reactstrap'
import AutomateView from '../common/components/AutomateView'
import {AVAILABLE_CHANNELS, CHANNELS} from '../common/components/constants'

import css from './ConnectedChannelsView.less'

export const ConnectedChannelsView = () => {
    const {shopType, shopName} = useParams<{
        shopType: string
        shopName: string
    }>()
    const baseUrl = `/app/automation/${shopType}/${shopName}/connected-channels`

    const {path} = useRouteMatch()

    return (
        <AutomateView
            title={CHANNELS}
            isLoading={false}
            headerNavbarItems={[
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
            ]}
        >
            <Container fluid className={css.pageContainer}>
                <Switch>
                    <Route path={path} exact component={() => <>Chat</>} />
                    <Route
                        path={`${path}/help-center`}
                        component={() => <>Help Center</>}
                        exact
                    />
                    <Route
                        path={`${path}/contact-form`}
                        component={() => <>Contact Form</>}
                        exact
                    />
                    <Route
                        path={`${path}/email`}
                        component={() => <>Email</>}
                        exact
                    />
                </Switch>
            </Container>
        </AutomateView>
    )
}
