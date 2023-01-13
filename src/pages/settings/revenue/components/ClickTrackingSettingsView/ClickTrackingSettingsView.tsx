import React from 'react'

import {Container} from 'reactstrap'

import {useFlags} from 'launchdarkly-react-client-sdk'
import settingsCss from 'pages/settings/settings.less'

import PageHeader from 'pages/common/components/PageHeader'
import useTitle from 'hooks/useTitle'
import {FeatureFlagKey} from 'config/featureFlags'
import {ClickTrackingCustomDomain} from '../ClickTrackingCustomDomain'

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

            <Container fluid className={settingsCss.pageContainer}>
                <ClickTrackingCustomDomain />
            </Container>
        </div>
    )
}
