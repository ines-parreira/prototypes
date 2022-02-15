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
import {useSelector} from 'react-redux'
import classnames from 'classnames'

import upgradeIcon from 'assets/img/icons/upgrade-icon.svg'

import Tooltip from '../../../../common/components/Tooltip'
import PageHeader from '../../../../common/components/PageHeader'
import Loader from '../../../../common/components/Loader/Loader'
import Alert, {AlertType} from '../../../../common/components/Alert/Alert'
import LinkAlert from '../../../../common/components/Alert/LinkAlert'

import {PolicyEnum} from '../../../../../models/selfServiceConfiguration/types'
import {hasAutomationLegacyFeatures} from '../../../../../state/currentAccount/selectors'
import {getHasAutomationAddOn} from '../../../../../state/billing/selectors'
import {GorgiasChatIntegrationSelfServicePaywall} from '../../../../integrations/detail/components/gorgias_chat/GorgiasChatIntegrationSelfServicePaywall'
import {openChat} from '../../../../../utils'
import settingsCss from '../../../settings.less'

import SelfServicePreferencesNavbar from '../SelfServicePreferencesNavbar'

import {useConfigurationData} from '../hooks'
import {PolicyRow} from './components/PolicyRow'
import css from './OrderManagementFlowsPreferences.less'

export const OrderManagementFlowsPreferences = () => {
    const {
        isLoadingConfig: loading,
        integration,
        configuration,
    } = useConfigurationData()

    const hasSelfServiceV1Features = useSelector(hasAutomationLegacyFeatures)
    const hasAutomationAddOn = useSelector(getHasAutomationAddOn)

    if (!(hasSelfServiceV1Features || hasAutomationAddOn)) {
        return <GorgiasChatIntegrationSelfServicePaywall />
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
                                        <Alert
                                            type={AlertType.Warning}
                                            className={settingsCss.mb16}
                                        >
                                            Self-service is inactive for this
                                            store. Go to the main Self-service
                                            page to activate it.
                                        </Alert>
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
                                                policyDescription="Let customers track orders directly 
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
