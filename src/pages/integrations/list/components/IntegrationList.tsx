import React from 'react'
import {Col, Container, Row} from 'reactstrap'
import {List, Map} from 'immutable'

import {IntegrationType} from '../../../../models/integration/types'
import {getCheapestPlanNameForFeature} from '../../../../utils/paywalls'
import {toJS} from '../../../../utils'
import PageHeader from '../../../common/components/PageHeader'
import {AlertType} from '../../../common/components/Alert/Alert'
import LinkAlert from '../../../common/components/Alert/LinkAlert'

import {isFeatureEnabled} from '../../../../utils/account'
import css from '../../../settings/settings.less'

import IntegrationListRow from './IntegrationListRow'

type Props = {
    integrations: List<Map<string, any>>
    integrationsConfig: List<Map<string, any>>
    currentPlan: Map<any, any>
    allowedIntegrations: number
    activeIntegrations: number
    plans: Map<any, any>
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
            <LinkAlert
                type={
                    remainingIntegrations > 0
                        ? AlertType.Warning
                        : AlertType.Error
                }
                icon
                actionLabel="Upgrade your plan"
                actionHref={'/app/settings/billing'}
            >
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
                        Need more?
                    </span>
                ) : (
                    <span>
                        <strong>
                            Your account has reached the integration limit.{' '}
                        </strong>
                        Need more?
                    </span>
                )}
            </LinkAlert>
        )
    }

    _hasTwitterIntegrations = () => {
        return this.props.integrations
            .filter(
                (integration) =>
                    integration!.get('type') === IntegrationType.Twitter
            )
            .find(
                (integration) =>
                    (integration!.get('deleted_datetime') as string | null) ===
                    null
            )
    }

    _hasKlaviyoIntegrations = () => {
        return this.props.integrations
            .filter(
                (integration) =>
                    integration!.get('type') === IntegrationType.Klaviyo
            )
            .find(
                (integration) =>
                    (integration!.get('deleted_datetime') as string | null) ===
                    null
            )
    }

    _hasActiveSmoochInsideIntegrations = () => {
        return this.props.integrations
            .filter(
                (integration) =>
                    integration!.get('type') === IntegrationType.SmoochInside
            )
            .find(
                (integration) =>
                    (integration!.get('deactivated_datetime') as
                        | string
                        | null) === null ||
                    (integration!.getIn([
                        'meta',
                        'shopify_integration_ids',
                        'size',
                    ]) as boolean)
            )
    }

    _deprecatedChatWarning = () => {
        return (
            <LinkAlert
                type={AlertType.Error}
                actionLabel="Migrate"
                actionHref="/app/settings/integrations/gorgias_chat"
            >
                You are currently using a deprecated version of the chat
                integration. If applicable, please migrate to the{' '}
                <strong>new chat integration</strong> by 03/31 following these{' '}
                <a
                    href="https://docs.gorgias.com/gorgias-chat/migrating-to-new-chat-integration-beta-version"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    instructions
                </a>
                . Past this date, any remaining active integrations will be
                automatically removed.
            </LinkAlert>
        )
    }

    render() {
        const {currentPlan, integrationsConfig, plans} = this.props
        const hasActiveSmoochInsideIntegrations =
            this._hasActiveSmoochInsideIntegrations()
        const hasTwitterIntegrations = this._hasTwitterIntegrations()
        const hasKlaviyoIntegrations = this._hasKlaviyoIntegrations()

        const displayList = integrationsConfig
            .filter((integration) => {
                // do not return the smooch inside integration
                // if there is no active integration of it
                if (
                    integration!.get('type') === IntegrationType.SmoochInside &&
                    !hasActiveSmoochInsideIntegrations
                ) {
                    return false
                }

                // Handle deprecation of Klaviyo integrations
                // TODO(@walter) remove this when Klaviyo migration is completed
                if (
                    integration!.get('type') === IntegrationType.Klaviyo &&
                    !hasKlaviyoIntegrations
                ) {
                    return false
                }

                return !integration!.get('hide')
            })
            .map((integration) => {
                const requiredFeature = integration!.get('requiredFeature')

                // Handle plan for twitter integrations
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

                    // Kind of a hacky way because `plans` variable doesn't
                    // contain the custom plans (Enterprise plans == Custom plans)
                    if (
                        !hasTwitterIntegrations &&
                        integration!.get('type') === IntegrationType.Twitter
                    ) {
                        return integration!.set(
                            'requiredPlanName',
                            'Enterprise'
                        )
                    }

                    return integration!.set(
                        'requiredPlanName',
                        requiredPlanName
                    )
                }

                return integration
            })

        return (
            <div className="full-width">
                <PageHeader title="Integrations" />
                <Container fluid className={css.pageContainer}>
                    <Row
                        className="mb-4"
                        data-candu-id="integrations-list-description"
                    >
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
                        <Row className="mb-4">
                            <Col>{this._deprecatedChatWarning()}</Col>
                        </Row>
                    )}
                    <Row>
                        <Col>
                            {displayList.map((config, index) => {
                                return (
                                    <IntegrationListRow
                                        key={index}
                                        integrationConfig={config!}
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
