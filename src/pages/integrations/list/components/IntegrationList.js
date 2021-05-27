// @flow
import React from 'react'
import {Link} from 'react-router-dom'
import {Alert, Container, Row, Col} from 'reactstrap'

import type {List, Map} from 'immutable'

import {SMOOCH_INSIDE_INTEGRATION_TYPE} from '../../../../constants/integration.ts'
import {getCheapestPlanNameForFeature} from '../../../../utils/paywalls.ts'
import {toJS} from '../../../../utils.ts'
import PageHeader from '../../../common/components/PageHeader.tsx'
import {isFeatureEnabled} from '../../../../utils/account.ts'

import IntegrationListRow from './IntegrationListRow.tsx'

type Props = {
    integrations: List<Map<string, any>>,
    integrationsConfig: List<Map<string, any>>,
    currentPlan: Map<any, any>,
    allowedIntegrations: number,
    activeIntegrations: number,
    plans: Map<any, any>,
}

export default class IntegrationList extends React.Component<Props> {
    _limitWarning = () => {
        const {activeIntegrations, allowedIntegrations} = this.props
        const remainingIntegrations = allowedIntegrations - activeIntegrations
        const plural = activeIntegrations > 1

        if (remainingIntegrations > 3) {
            return null
        }

        return (
            <Alert
                color={remainingIntegrations > 0 ? 'warning' : 'danger'}
                className="d-flex align-items-center"
            >
                <i className="material-icons md-3 mr-3">error</i>

                {remainingIntegrations > 0 ? (
                    <span>
                        You are using{' '}
                        <strong>
                            {activeIntegrations}{' '}
                            {plural ? 'integrations' : 'integration'} of{' '}
                            {this.props.allowedIntegrations} allowed
                        </strong>{' '}
                        allowed on your{' '}
                        <strong>
                            {this.props.currentPlan.get('name')} plan.
                        </strong>{' '}
                        Need more?{' '}
                        <Link to="/app/settings/billing" className="alert-link">
                            Upgrade your account.
                        </Link>
                    </span>
                ) : (
                    <span>
                        <strong>
                            {' '}
                            Your account has reached the integration limit.{' '}
                        </strong>
                        To add more integrations,{' '}
                        <Link to="/app/settings/billing" className="alert-link">
                            upgrade your plan
                        </Link>
                        .
                    </span>
                )}
            </Alert>
        )
    }

    _hasActiveSmoochInsideIntegrations = () => {
        return this.props.integrations
            .filter(
                (integration) =>
                    integration.get('type') === SMOOCH_INSIDE_INTEGRATION_TYPE
            )
            .find(
                (integration) =>
                    integration.get('deactivated_datetime') === null ||
                    integration.getIn([
                        'meta',
                        'shopify_integration_ids',
                        'size',
                    ])
            )
    }

    _deprecatedChatWarning = () => {
        return (
            <Alert color="danger">
                <span>
                    You are currently using a deprecated version of the chat
                    integration. If applicable, please migrate to the{' '}
                    <Link to="/app/settings/integrations/gorgias_chat">
                        new chat integration
                    </Link>{' '}
                    by 03/31 following these{' '}
                    <a
                        href="https://docs.gorgias.com/gorgias-chat/migrating-to-new-chat-integration-beta-version"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        instructions
                    </a>
                    . Past this date, any remaining active integrations will be
                    automatically removed.
                </span>
            </Alert>
        )
    }

    render() {
        const {currentPlan, integrationsConfig, plans} = this.props
        const hasActiveSmoochInsideIntegrations = this._hasActiveSmoochInsideIntegrations()
        const displayList = integrationsConfig
            .filter((integration) => {
                // do not return the smooch inside integration
                // if there is no active integration of it
                if (
                    integration.get('type') ===
                        SMOOCH_INSIDE_INTEGRATION_TYPE &&
                    !hasActiveSmoochInsideIntegrations
                ) {
                    return false
                }
                return !integration.get('hide')
            })
            .map((integration) => {
                const requiredFeature = integration.get('requiredFeature')

                if (
                    requiredFeature &&
                    (currentPlan.isEmpty() ||
                        !isFeatureEnabled(
                            toJS(
                                currentPlan.getIn(['features', requiredFeature])
                            )
                        ))
                ) {
                    const requiredPlanName = getCheapestPlanNameForFeature(
                        requiredFeature,
                        toJS(plans)
                    )
                    return integration.set('requiredPlanName', requiredPlanName)
                }
                return integration
            })

        return (
            <div className="full-width">
                <PageHeader title="Integrations" />

                <Container fluid className="page-container">
                    <Row className="mb-4">
                        <Col md="10">
                            <p>
                                Gorgias is most useful when you connect it to
                                other applications. Integrations let you
                                communicate with customers through multiple
                                channels, pull more information about them and
                                perform actions in outside tools directly from
                                Gorgias.
                            </p>

                            {this._limitWarning()}
                        </Col>
                    </Row>
                    {hasActiveSmoochInsideIntegrations && (
                        <Row>
                            <Col>{this._deprecatedChatWarning()}</Col>
                        </Row>
                    )}
                    <Row>
                        <Col>
                            {displayList.map((config, index) => {
                                return (
                                    <IntegrationListRow
                                        key={index}
                                        integrationConfig={config}
                                    />
                                )
                            })}
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}
