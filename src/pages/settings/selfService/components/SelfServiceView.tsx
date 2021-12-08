import React, {useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {Col, Container, Row, Table} from 'reactstrap'
import {Map} from 'immutable'

import PageHeader from '../../../common/components/PageHeader'
import Tooltip from '../../../common/components/Tooltip'
import {getIntegrationsByTypes} from '../../../../state/integrations/selectors'
import {IntegrationType} from '../../../../models/integration/types'
import {getIconFromUrl} from '../../../../state/integrations/helpers'
import {getSelfServiceConfigurations} from '../../../../state/entities/selfServiceConfigurations/selectors'
import {SelfServiceConfiguration} from '../../../../models/selfServiceConfiguration/types'
import useAppDispatch from '../../../../hooks/useAppDispatch'
import {selfServiceConfigurationsFetched} from '../../../../state/entities/selfServiceConfigurations/actions'
import {fetchSelfServiceConfigurations} from '../../../../models/selfServiceConfiguration/resources'
import Loader from '../../../common/components/Loader/Loader'
import Alert, {AlertType} from '../../../common/components/Alert/Alert'
import {notify} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'
import {GorgiasChatIntegrationSelfServicePaywall} from '../../../integrations/detail/components/gorgias_chat/GorgiasChatIntegrationSelfServicePaywall'
import {getHasAutomationAddOn} from '../../../../state/billing/selectors'
import {hasAutomationLegacyFeatures} from '../../../../state/currentAccount/selectors'
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

export const SelfServiceView = () => {
    const dispatch = useAppDispatch()
    const hasSelfServiceV1Features = useSelector(hasAutomationLegacyFeatures)
    const hasAutomationAddOn = useSelector(getHasAutomationAddOn)
    const shopifyIntegrations = useSelector(
        getIntegrationsByTypes(IntegrationType.Shopify)
    )
    const selfServiceConfigurations = useSelector(getSelfServiceConfigurations)

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        void (async () => {
            setLoading(true)
            try {
                const res = await fetchSelfServiceConfigurations()
                void dispatch(selfServiceConfigurationsFetched(res.data))
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
        <div className="full-width">
            <PageHeader title="Self-service" />

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
                                    chat ticket for your team to handle.
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
                                        Self-Service is currently only available
                                        for chat.
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
                                    <>
                                        <p>
                                            Self-service is only available to
                                            stores that have a Shopify store
                                            integration.
                                        </p>
                                        <Table
                                            className={`table-hover table-integrations ${css.selfServiceIntegrationsTable}`}
                                        >
                                            <tbody>
                                                {shopifyIntegrations
                                                    .valueSeq()
                                                    .map(
                                                        (
                                                            integration: Map<
                                                                any,
                                                                any
                                                            >
                                                        ) => (
                                                            <IntegrationRow
                                                                key={integration.get(
                                                                    'id'
                                                                )}
                                                                integration={
                                                                    integration
                                                                }
                                                                configuration={_findConfiguration(
                                                                    selfServiceConfigurations,
                                                                    integration
                                                                )}
                                                            />
                                                        )
                                                    )}
                                            </tbody>
                                        </Table>
                                    </>
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
