import React, {useCallback, useEffect, useState} from 'react'
import {Col, Container, Row, Table} from 'reactstrap'
import {Map} from 'immutable'
import classnames from 'classnames'
import moment from 'moment-timezone'

import PageHeader from 'pages/common/components/PageHeader'
import {DEPRECATED_getIntegrationsByTypes} from 'state/integrations/selectors'
import {IntegrationType} from 'models/integration/types'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {selfServiceConfigurationsFetched} from 'state/entities/selfServiceConfigurations/actions'
import {fetchSelfServiceConfigurations} from 'models/selfServiceConfiguration/resources'
import Loader from 'pages/common/components/Loader/Loader'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {GorgiasChatIntegrationSelfServicePaywall} from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationSelfServicePaywall'
import {useHelpCenterList} from 'pages/settings/helpCenter/hooks/useHelpCenterList'
import {
    getHasAutomationAddOn,
    getHasLegacyAutomationAddOnFeatures,
} from 'state/billing/selectors'
import {getIconFromUrl} from 'utils'
import {useStandaloneHelpCenterAfterDismiss} from 'pages/settings/helpCenter/hooks/useStandaloneHelpCenterAfterDismiss'
import {
    PRODUCT_BANNER_KEY,
    useProductBannerStorage,
} from 'hooks/useProductBannerStorage'
import settingsCss from '../../settings.less'

import {IntegrationRow} from './IntegrationRow'
import {StandaloneBanner} from './StandaloneBanner'

import css from './SelfServiceView.less'

const selfServiceMock = getIconFromUrl('integrations/self_service.png')

export const SelfServiceView = () => {
    const dispatch = useAppDispatch()
    const hasSelfServiceV1Features = useAppSelector(
        getHasLegacyAutomationAddOnFeatures
    )
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    const shopifyIntegrations = useAppSelector(
        DEPRECATED_getIntegrationsByTypes(IntegrationType.Shopify)
    )
    const {helpCenters} = useHelpCenterList({per_page: 900})
    const standaloneHelpCenters = useStandaloneHelpCenterAfterDismiss(
        helpCenters,
        PRODUCT_BANNER_KEY.SELF_SERVICE_STANDALONE_SSP
    )
    const [shouldShowProductBanner, setShouldShowProductBanner] = useState(
        standaloneHelpCenters.length > 0
    )
    const {getProductBanner, updateProductBanner} = useProductBannerStorage()

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const productBannerInfo = getProductBanner(
            PRODUCT_BANNER_KEY.SELF_SERVICE_STANDALONE_SSP
        )

        if (productBannerInfo) {
            return
        }
        setShouldShowProductBanner(standaloneHelpCenters.length > 0)
    }, [standaloneHelpCenters, setShouldShowProductBanner, getProductBanner])

    useEffect(() => {
        void (async () => {
            try {
                const configResponse = await fetchSelfServiceConfigurations()
                void dispatch(
                    selfServiceConfigurationsFetched(configResponse.data)
                )
            } catch (error) {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message:
                            'Could not fetch Self-service configurations, please try again later.',
                    })
                )
            } finally {
                setLoading(false)
            }
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleCloseProductBanner = useCallback(() => {
        const now = moment()

        updateProductBanner(PRODUCT_BANNER_KEY.SELF_SERVICE_STANDALONE_SSP, {
            closedAt: now.format(),
        })
        setShouldShowProductBanner(false)
    }, [updateProductBanner])

    return (
        <div className="full-width d-flex flex-column">
            <PageHeader title="Self-service" className={css.pageHeader} />

            {hasSelfServiceV1Features || hasAutomationAddOn ? (
                <Container fluid className={settingsCss.pageContainer}>
                    <Row>
                        <Col className={css.contentColumn}>
                            <div className="mb-3">
                                <p>
                                    Most ecommerce support requests are about
                                    the same 20 types of issues.
                                </p>
                                <p>
                                    Self-service empowers customers to find
                                    answers to common questions and manage their
                                    orders via Chat or Help Center, resolving
                                    requests without an agent. If customers
                                    require further assistance, a chat or help
                                    center ticket is created.
                                </p>
                                {shouldShowProductBanner && (
                                    <StandaloneBanner
                                        helpCenters={standaloneHelpCenters}
                                        onClose={handleCloseProductBanner}
                                    />
                                )}
                                {shopifyIntegrations.size === 0 ? (
                                    <Alert type={AlertType.Warning}>
                                        No active Shopify store detected. Please
                                        make sure to add a Shopify integration
                                        to access the Self-service features.
                                    </Alert>
                                ) : loading ? (
                                    <Loader />
                                ) : (
                                    <Table
                                        className={classnames(
                                            'table-hover table-integrations',
                                            css.selfServiceIntegrationsTable
                                        )}
                                        data-testid="table-integrations"
                                    >
                                        <tbody>
                                            {shopifyIntegrations
                                                .valueSeq()
                                                .map(
                                                    (
                                                        shopifyIntegration: Map<
                                                            any,
                                                            any
                                                        >
                                                    ) => (
                                                        <IntegrationRow
                                                            key={shopifyIntegration.get(
                                                                'id'
                                                            )}
                                                            shopifyIntegration={
                                                                shopifyIntegration
                                                            }
                                                        />
                                                    )
                                                )}
                                        </tbody>
                                    </Table>
                                )}
                            </div>
                        </Col>
                        <Col>
                            <img
                                src={selfServiceMock}
                                width="442"
                                height="689"
                                alt="Self-service example"
                            />
                        </Col>
                    </Row>
                </Container>
            ) : (
                <GorgiasChatIntegrationSelfServicePaywall />
            )}
        </div>
    )
}

export default SelfServiceView
