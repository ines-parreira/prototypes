// @flow
import React from 'react'
import {Link} from 'react-router-dom'
import {Alert, Container, Row, Col} from 'reactstrap'

import type {Map} from 'immutable'

import PageHeader from '../../../common/components/PageHeader.tsx'
import {getIntegrationsList} from '../../../../state/integrations/helpers.ts'

import IntegrationListRow from './IntegrationListRow'

type Props = {
    integrations: Map<*, *>,
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

    render() {
        const {integrations} = this.props

        const hasSmoochInsideIntegration = integrations
            .get('integrations')
            .find((integration) => integration.get('type') === 'smooch_inside')
        const list = getIntegrationsList(integrations.get('integrations'))
        const displayList = list.filter((integration) => {
            // do not return the smooch inside integration if none has ever been created
            if (
                integration.get('type') === 'smooch_inside' &&
                !hasSmoochInsideIntegration
            ) {
                return false
            }
            return !integration.get('hide')
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
