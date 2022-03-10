import React, {useEffect, useState} from 'react'
import {Col, Container, Row, Table} from 'reactstrap'
import {List, Map} from 'immutable'
import classnames from 'classnames'

import PageHeader from 'pages/common/components/PageHeader'
import Tooltip from 'pages/common/components/Tooltip'
import {getIntegrationsByTypes} from 'state/integrations/selectors'
import {IntegrationType} from 'models/integration/types'
import {getSelfServiceConfigurations} from 'state/entities/selfServiceConfigurations/selectors'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {selfServiceConfigurationsFetched} from 'state/entities/selfServiceConfigurations/actions'
import {fetchSelfServiceConfigurations} from 'models/selfServiceConfiguration/resources'
import Loader from 'pages/common/components/Loader/Loader'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {GorgiasChatIntegrationSelfServicePaywall} from 'pages/integrations/detail/components/gorgias_chat/GorgiasChatIntegrationSelfServicePaywall'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import {hasAutomationLegacyFeatures} from 'state/currentAccount/selectors'
import {getIconFromUrl} from 'utils'
import settingsCss from '../../settings.less'

import {IntegrationRow} from './IntegrationRow'
import css from './SelfServiceView.less'

const selfServiceMock = getIconFromUrl('integrations/self_service.png')

const _findConfiguration = (
    selfServiceConfigurations: SelfServiceConfiguration[],
    shopifyIntegration: Map<any, any>
): SelfServiceConfiguration | undefined => {
    return selfServiceConfigurations.find((configuration) => {
        return (
            configuration.shop_name ===
            shopifyIntegration.getIn(['meta', 'shop_name'])
        )
    })
}

const _findSelfServiceIntegration = (
    selfServiceIntegrations: List<Map<any, any>>,
    shopifyIntegration: Map<any, any>
): Map<any, any> | undefined => {
    return selfServiceIntegrations.find((selfServiceIntegration) => {
        return (
            selfServiceIntegration?.getIn(['meta', 'shop_name']) ===
            shopifyIntegration.getIn(['meta', 'shop_name'])
        )
    })
}

export const SelfServiceView = () => {
    const dispatch = useAppDispatch()
    const hasSelfServiceV1Features = useAppSelector(hasAutomationLegacyFeatures)
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const shopifyIntegrations = useAppSelector(
        getIntegrationsByTypes(IntegrationType.Shopify)
    )
    const selfServiceIntegrations = useAppSelector(
        getIntegrationsByTypes(IntegrationType.SelfService)
    )
    const selfServiceConfigurations = useAppSelector(
        getSelfServiceConfigurations
    )

    const [loading, setLoading] = useState(true)

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
    }, [])

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
                                    Self-service enables your customers to
                                    browse their orders and select the type of
                                    issue they are having. It will then create a
                                    chat or help center ticket for your team to
                                    handle.
                                </p>
                                <h5 className={css.enableSelfServiceTitle}>
                                    Enable Self-service{' '}
                                    <i
                                        id="enable-self-service-icon"
                                        className={`material-icons-outlined ${css.enableSelfServiceIcon}`}
                                    >
                                        info
                                    </i>
                                    <Tooltip
                                        target="enable-self-service-icon"
                                        placement="top"
                                        popperClassName={
                                            css.enableSelfServiceTooltip
                                        }
                                    >
                                        Self-service is only available to stores
                                        that have a Shopify store integration.
                                    </Tooltip>
                                </h5>
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
                                                            selfServiceIntegration={_findSelfServiceIntegration(
                                                                selfServiceIntegrations,
                                                                shopifyIntegration
                                                            )}
                                                            configuration={_findConfiguration(
                                                                selfServiceConfigurations,
                                                                shopifyIntegration
                                                            )}
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
