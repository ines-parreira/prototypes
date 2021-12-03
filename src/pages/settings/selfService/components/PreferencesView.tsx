import React, {MouseEvent} from 'react'
import {
    Alert,
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

import Tooltip from '../../../common/components/Tooltip'
import PageHeader from '../../../common/components/PageHeader'
import Loader from '../../../common/components/Loader/Loader'
import {PolicyEnum} from '../../../../models/selfServiceConfiguration/types'
import {hasAutomationLegacyFeatures} from '../../../../state/currentAccount/selectors'
import {getHasAutomationAddOn} from '../../../../state/billing/selectors'
import {GorgiasChatIntegrationSelfServicePaywall} from '../../../integrations/detail/components/gorgias_chat/GorgiasChatIntegrationSelfServicePaywall'
import upgradeIcon from '../../../../../img/icons/upgrade-icon.svg'
import {openChat} from '../../../../utils'
import settingsCss from '../../settings.less'

import {PolicyRow} from './PolicyRow'
import {useConfigurationData} from './hooks'
import css from './PreferencesView.less'

export const PreferencesView = () => {
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
                                will be able to take with the Self-service
                                portal. Note that actions available for each
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
                                <Alert color="warning">
                                    Could not find the configuration for this
                                    store. Please try again later.
                                </Alert>
                            ) : (
                                <>
                                    {configuration.deactivated_datetime ? (
                                        <Alert color="warning">
                                            Self-service is inactive for this
                                            store. Go to the main Self-service
                                            page to activate it.
                                        </Alert>
                                    ) : null}
                                    {!hasAutomationAddOn ? (
                                        <Alert
                                            className={
                                                css.alertBeforeAutomationContainer
                                            }
                                            color="info"
                                        >
                                            <div>
                                                <img
                                                    src={upgradeIcon}
                                                    alt="upgrade-icon"
                                                    className={classnames(
                                                        css.upgradeIcon,
                                                        'sm' && css['sm']
                                                    )}
                                                />
                                                <span
                                                    className={
                                                        css.automationHelp
                                                    }
                                                >
                                                    Speak to one of our
                                                    specialists to learn more
                                                    about our automation add-on!
                                                </span>
                                            </div>
                                            <a
                                                style={{cursor: 'pointer'}}
                                                onClick={(
                                                    event: MouseEvent
                                                ) => {
                                                    openChat(event)
                                                }}
                                            >
                                                Contact Us
                                            </a>
                                        </Alert>
                                    ) : (
                                        <Alert
                                            className={
                                                css.alertPostAutomationContainer
                                            }
                                            color="info"
                                        >
                                            <div>
                                                <i
                                                    style={{
                                                        marginRight: '17.67px',
                                                    }}
                                                    className="align-middle material-icons md-2"
                                                >
                                                    info
                                                </i>
                                                <span
                                                    className={
                                                        css.automationHelp
                                                    }
                                                >
                                                    Do you want help from one of
                                                    our agents to improve
                                                    automations?
                                                </span>
                                            </div>
                                            <a
                                                style={{cursor: 'pointer'}}
                                                onClick={(
                                                    event: MouseEvent
                                                ) => {
                                                    openChat(event)
                                                }}
                                            >
                                                Contact Us
                                            </a>
                                        </Alert>
                                    )}
                                    <Table>
                                        <tbody>
                                            <PolicyRow
                                                integration={integration}
                                                policyKey={
                                                    PolicyEnum.TRACK_ORDER_POLICY
                                                }
                                                policyName="Track order"
                                                policyDescription="Let customers track
                                                        orders directly from the
                                                        chat portal"
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
                                                policyName="Returns"
                                                policyDescription="Let customers request returns directly
                                                        from the chat portal"
                                                configuration={configuration}
                                            />
                                            <PolicyRow
                                                policyKey={
                                                    PolicyEnum.CANCEL_ORDER_POLICY
                                                }
                                                integration={integration}
                                                policyName="Cancellations"
                                                policyDescription="Let customers request order cancellations
                                                        directly from the chat portal"
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

export default PreferencesView
