import React from 'react'

import {Container} from 'reactstrap'

import {useFlags} from 'launchdarkly-react-client-sdk'
import {NavLink, Route, Switch} from 'react-router-dom'
import settingsCss from 'pages/settings/settings.less'

import PageHeader from 'pages/common/components/PageHeader'
import useTitle from 'hooks/useTitle'
import {FeatureFlagKey} from 'config/featureFlags'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import Detail from 'pages/integrations/components/Detail'
import {ClickTrackingCustomDomain} from '../ClickTrackingCustomDomain'

import {ABOUT_PAGE, CLICK_TRACKING_BASE_PATH} from '../../constants'
import css from './ClickTrackingSettingsView.less'

export const ClickTrackingSettingsView = () => {
    useTitle('Click Tracking')

    // Only show this page if the click tracking feature flag is on
    const clickTrackingEnabled = useFlags()[FeatureFlagKey.RevenueClickTracking]
    if (!clickTrackingEnabled) {
        return null
    }

    return (
        <div
            data-testid="click-tracking-settings"
            className={css.settingsLayout}
        >
            <PageHeader title="Click Tracking" />
            <SecondaryNavbar>
                <NavLink exact to={CLICK_TRACKING_BASE_PATH}>
                    About
                </NavLink>
                <NavLink exact to={CLICK_TRACKING_BASE_PATH + '/manage'}>
                    Manage
                </NavLink>
            </SecondaryNavbar>

            <Switch>
                <Route exact path={CLICK_TRACKING_BASE_PATH}>
                    <Detail {...ABOUT_PAGE} />
                </Route>
                <Route exact path={CLICK_TRACKING_BASE_PATH + '/manage'}>
                    <Container fluid className={settingsCss.pageContainer}>
                        <ClickTrackingCustomDomain />
                    </Container>
                </Route>
            </Switch>
        </div>
    )
}
