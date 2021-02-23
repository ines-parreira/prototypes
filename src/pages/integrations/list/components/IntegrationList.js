// @flow
import React from 'react'
import {Link} from 'react-router-dom'
import {Alert, Container, Row, Col} from 'reactstrap'

import type {List, Map} from 'immutable'

import {AccountFeatures} from '../../../../state/currentAccount/types.ts'
import {IntegrationType} from '../../../../models/integration/types.ts'
import PageHeader from '../../../common/components/PageHeader.tsx'

import {SMOOCH_INSIDE_INTEGRATION_TYPE} from '../../../../constants/integration.ts'

import IntegrationListRow from './IntegrationListRow.tsx'

type Props = {
    integrations: List<Map<string, any>>,
    integrationsConfig: List<Map<string, any>>,
    currentPlan: Map<*, *>,
    allowedIntegrations: number,
    activeIntegrations: number,
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

    _deprecatedChatWarning = () => {
        const deadline = new Date(Date.UTC(2021, 2, 1))
        const isBeforeDeadline = new Date(Date.now()) < deadline

        return (
            <Alert color={isBeforeDeadline ? 'warning' : 'danger'}>
                <span>
                    You are currently using a deprecated version of the chat
                    integration. Please migrate to the{' '}
                    <Link to="/app/settings/integrations/gorgias_chat">
                        new chat integration
                    </Link>
                    {isBeforeDeadline ? ' ' : ' by 03/31 '}following these{' '}
                    <a
                        href="https://docs.gorgias.com/gorgias-chat/migrating-to-new-chat-integration-beta-version"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        instructions
                    </a>
                    .
                    {isBeforeDeadline
                        ? ''
                        : ' Past this date, your integration will be automatically disabled.'}
                </span>
            </Alert>
        )
    }

    render() {
        const {currentPlan, integrations, integrationsConfig} = this.props
        const hasSmoochInsideIntegration = integrations.find(
            (integration) =>
                integration.get('type') === SMOOCH_INSIDE_INTEGRATION_TYPE
        )
        const displayList = integrationsConfig
            .filter((integration) => {
                // do not return the smooch inside integration if none has ever been created
                if (
                    integration.get('type') ===
                        SMOOCH_INSIDE_INTEGRATION_TYPE &&
                    !hasSmoochInsideIntegration
                ) {
                    return false
                }
                return !integration.get('hide')
            })
            .map((integration) => {
                if (
                    integration.get('type') ===
                        IntegrationType.Magento2IntegrationType &&
                    (currentPlan.isEmpty() ||
                        !currentPlan
                            .get('features')
                            .get(AccountFeatures.MagentoIntegration))
                ) {
                    return integration.set('displayUpgrade', true)
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
                            {hasSmoochInsideIntegration
                                ? this._deprecatedChatWarning()
                                : null}
                        </Col>
                    </Row>
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
