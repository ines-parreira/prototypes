import React, {useMemo} from 'react'

import {Container} from 'reactstrap'

import {Redirect, useParams} from 'react-router-dom'
import css from 'pages/settings/settings.less'

import PageHeader from 'pages/common/components/PageHeader'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'
import useAppSelector from 'hooks/useAppSelector'
import {getIntegrationsByTypes} from 'state/integrations/selectors'
import {IntegrationType} from 'models/integration/constants'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {CONVERT_ROUTE_PARAM_NAME} from 'pages/convert/common/constants'
import {ConvertRouteParams} from 'pages/convert/common/types'
import {ClickTrackingCustomDomain} from '../ClickTrackingCustomDomain'

const ClickTrackingSettingsView = () => {
    const hasManyIntegrations =
        useAppSelector(getIntegrationsByTypes([IntegrationType.GorgiasChat]))
            .length > 1

    // Only show this page if the click tracking feature flag is on
    const isConvertSubscriber = useIsConvertSubscriber()
    if (!isConvertSubscriber) {
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
                    {hasManyIntegrations && (
                        <Alert icon type={AlertType.Info}>
                            Please be aware that Click tracking set up will
                            apply to all your chats
                        </Alert>
                    )}
                </div>
            </Container>
        </div>
    )
}

function ClickTrackingSettingsOrPaywallPage() {
    const isConvertSubscriber = useIsConvertSubscriber()
    const {[CONVERT_ROUTE_PARAM_NAME]: integrationId} =
        useParams<ConvertRouteParams>()

    const redirectUrl = useMemo(() => {
        if (!!integrationId) {
            return `/app/convert/${integrationId}/click-tracking/subscribe`
        }
        return `/app/settings/convert/click-tracking/subscribe`
    }, [integrationId])

    return isConvertSubscriber ? (
        <ClickTrackingSettingsView />
    ) : (
        <Redirect to={redirectUrl} />
    )
}

export default ClickTrackingSettingsOrPaywallPage
