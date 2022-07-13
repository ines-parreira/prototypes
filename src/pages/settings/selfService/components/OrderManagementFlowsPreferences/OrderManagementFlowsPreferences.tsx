import React from 'react'
import {
    Breadcrumb,
    BreadcrumbItem,
    Col,
    Container,
    Row,
    Table,
} from 'reactstrap'
import {Link} from 'react-router-dom'
import classnames from 'classnames'

import warningIcon from 'assets/img/icons/warning2.svg'
import upgradeIcon from 'assets/img/icons/upgrade-icon.svg'
import useAppSelector from 'hooks/useAppSelector'
import Tooltip from 'pages/common/components/Tooltip'
import PageHeader from 'pages/common/components/PageHeader'
import Loader from 'pages/common/components/Loader/Loader'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import LinkAlert from 'pages/common/components/Alert/LinkAlert'
import {PolicyEnum} from 'models/selfServiceConfiguration/types'
import {
    getCurrentAccountState,
    hasAutomationLegacyFeatures,
} from 'state/currentAccount/selectors'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import {GorgiasChatIntegrationSelfServicePaywall} from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationSelfServicePaywall'
import {openChat} from 'utils'
import settingsCss from 'pages/settings/settings.less'
import SelfServicePreferencesNavbar from 'pages/settings/selfService/components/SelfServicePreferencesNavbar'
import {useConfigurationData} from 'pages/settings/selfService/components/hooks'

import {notify} from '../../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../../state/notifications/types'
import {updateSelfServiceConfiguration} from '../../../../../models/selfServiceConfiguration/resources'
import useAppDispatch from '../../../../../hooks/useAppDispatch'
import {updateOrCreateIntegration} from '../../../../../state/integrations/actions'
import {selfServiceConfigurationUpdated} from '../../../../../state/entities/selfServiceConfigurations/actions'
import {
    logEvent,
    SegmentEvent,
} from '../../../../../store/middlewares/segmentTracker'
import {CurrentAccountState} from '../../../../../state/currentAccount/types'
import {PolicyRow} from './components/PolicyRow'
import css from './OrderManagementFlowsPreferences.less'

export const OrderManagementFlowsPreferences = () => {
    const {
        isLoadingConfig: loading,
        integration,
        configuration,
        selfServiceIntegration,
    } = useConfigurationData()

    const hasSelfServiceV1Features = useAppSelector(hasAutomationLegacyFeatures)
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const account = useAppSelector<CurrentAccountState>(getCurrentAccountState)
    const dispatch = useAppDispatch()

    if (!(hasSelfServiceV1Features || hasAutomationAddOn)) {
        return <GorgiasChatIntegrationSelfServicePaywall />
    }

    const activateSelfService = async () => {
        if (!configuration) {
            return
        }

        const segmentEvent = {
            name: SegmentEvent.SelfServiceActivatedViaBanner,
            props: {
                domain: account.get('domain'),
                shop_name: selfServiceIntegration.getIn(['meta', 'shop_name']),
            },
        }

        try {
            const [res] = await Promise.all([
                updateSelfServiceConfiguration({
                    ...configuration,
                    deactivated_datetime: null,
                }),
                selfServiceIntegration
                    ? dispatch(
                          updateOrCreateIntegration(
                              selfServiceIntegration.set(
                                  'deactivated_datetime',
                                  null
                              )
                          )
                      )
                    : null,
            ])

            void dispatch(selfServiceConfigurationUpdated(res))
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Self-service configuration successfully updated.',
                })
            )
            logEvent(segmentEvent.name, segmentEvent.props)
        } catch (error) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message:
                        'Could not update Self-service configuration, please try again later.',
                })
            )
        }

        return null
    }

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/self-service">
                                Self-service
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            {integration.getIn(['meta', 'shop_name'])}
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <SelfServicePreferencesNavbar />

            <Container fluid className={settingsCss.pageContainer}>
                <Row>
                    <Col>
                        <div className="mb-3">
                            <h4 className={css.preferencesTitle}>
                                Preferences
                            </h4>
                            <p
                                id="email-capture-help"
                                className={css.preferencesDescription}
                            >
                                Choose preferences of the actions your customers
                                will be able to take to manage their orders.
                                Note that actions available for each
                                <span id="orders-shipments">
                                    <b> order’s shipments</b>
                                </span>{' '}
                                <Tooltip
                                    autohide={false}
                                    delay={100}
                                    placement="top"
                                    target="orders-shipments"
                                >
                                    Gorgias breaks down orders into shipments
                                    (one or more) allowing shoppers to track or
                                    take actions related to individual
                                    shipments.
                                </Tooltip>
                                depend on their statuses.{' '}
                                <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://docs.gorgias.com/self-service/self-service-portal-statuses"
                                >
                                    Read more
                                </a>{' '}
                                about all existing order shipment statuses &
                                corresponding available actions.
                            </p>
                            {loading ? (
                                <Loader />
                            ) : !configuration ? (
                                <Alert type={AlertType.Warning}>
                                    Could not find the configuration for this
                                    store. Please try again later.
                                </Alert>
                            ) : (
                                <>
                                    {configuration.deactivated_datetime ? (
                                        <LinkAlert
                                            className={settingsCss.mb16}
                                            onAction={activateSelfService}
                                            actionLabel="Activate it"
                                            type={AlertType.Warning}
                                            icon={
                                                <img
                                                    src={warningIcon}
                                                    alt="warning-icon"
                                                    className={classnames(
                                                        css.warningIcon
                                                    )}
                                                />
                                            }
                                        >
                                            Self-service is inactive for this
                                            store
                                        </LinkAlert>
                                    ) : null}
                                    {!hasAutomationAddOn ? (
                                        <LinkAlert
                                            type={AlertType.Warning}
                                            onAction={openChat}
                                            actionLabel="Contact Us"
                                            className={settingsCss.mb16}
                                            icon={
                                                <img
                                                    src={upgradeIcon}
                                                    alt="upgrade-icon"
                                                    className={classnames(
                                                        css.upgradeIcon
                                                    )}
                                                />
                                            }
                                        >
                                            Speak to one of our specialists to
                                            learn more about our automation
                                            add-on!
                                        </LinkAlert>
                                    ) : (
                                        <LinkAlert
                                            className={settingsCss.mb16}
                                            actionLabel="Contact Us"
                                            onAction={openChat}
                                            icon
                                        >
                                            Do you want help from one of our
                                            agents to improve automations?
                                        </LinkAlert>
                                    )}

                                    <Table>
                                        <tbody>
                                            <PolicyRow
                                                integration={integration}
                                                policyKey={
                                                    PolicyEnum.TRACK_ORDER_POLICY
                                                }
                                                policyName="Track"
                                                policyDescription="Let customers track
                                                        orders directly from the
                                                        Self-service Portal in chat
                                                        and help center"
                                                configuration={configuration}
                                            />
                                            <PolicyRow
                                                policyKey={
                                                    PolicyEnum.REPORT_ISSUE_POLICY
                                                }
                                                integration={integration}
                                                policyName="Report issue"
                                                policyDescription="Let customers report an
                                                        issue with an order"
                                                configuration={configuration}
                                            />
                                            <PolicyRow
                                                policyKey={
                                                    PolicyEnum.RETURN_ORDER_POLICY
                                                }
                                                integration={integration}
                                                policyName="Return"
                                                policyDescription="Let customers request returns directly
                                                        from the Self-service Portal in chat
                                                        and help center"
                                                configuration={configuration}
                                            />
                                            <PolicyRow
                                                policyKey={
                                                    PolicyEnum.CANCEL_ORDER_POLICY
                                                }
                                                integration={integration}
                                                policyName="Cancel"
                                                policyDescription="Let customers request order cancellations
                                                        directly from the Self-service Portal in chat
                                                        and help center"
                                                configuration={configuration}
                                            />
                                        </tbody>
                                    </Table>
                                </>
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default OrderManagementFlowsPreferences
