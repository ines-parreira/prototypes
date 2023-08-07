import React from 'react'

import {Container} from 'reactstrap'

import {useFlags} from 'launchdarkly-react-client-sdk'
import css from 'pages/settings/settings.less'

import PageHeader from 'pages/common/components/PageHeader'
import {FeatureFlagKey} from 'config/featureFlags'
import {useIsRevenueBetaTester} from 'pages/common/hooks/useIsRevenueBetaTester'
import {ClickTrackingCustomDomain} from '../ClickTrackingCustomDomain'

export const ClickTrackingSettingsView = () => {
    // Only show this page if the click tracking feature flag is on
    const isRevenueSubscriber = useIsRevenueBetaTester()
    const clickTrackingEnabled = useFlags()[FeatureFlagKey.RevenueClickTracking]
    if (!isRevenueSubscriber || !clickTrackingEnabled) {
        return null
    }

    return (
        <div data-testid="click-tracking-settings" className="full-width">
            <PageHeader title="Click tracking" />

            <Container fluid className={css.pageContainer}>
                <div className={css.contentWrapper}>
                    <p>
                        With the Gorgias click tracking service you can now
                        track clicks back to your store from short-links sent
                        via helpdesk conversations. This feature can be used in
                        any channel with standard Gorgias branded links or you
                        can customize your links to match your store’s domain.
                        Simply edit the DNS/custom domain settings in the
                        “manage” section above and the links sent to shoppers
                        will automatically reference your domain!
                    </p>
                    <ClickTrackingCustomDomain />
                </div>
            </Container>
        </div>
    )
}
