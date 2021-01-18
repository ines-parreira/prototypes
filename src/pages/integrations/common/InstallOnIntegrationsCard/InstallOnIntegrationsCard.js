// @flow
import React from 'react'
import {Card, CardBody} from 'reactstrap'
import {fromJS, List, Map} from 'immutable'
import moment from 'moment'
import _capitalize from 'lodash/capitalize'

import {SMOOCH_INSIDE_INTEGRATION_TYPE} from '../../../../constants/integration.ts'
import * as integrationHelpers from '../../../../state/integrations/helpers.ts'
import ToggleButton from '../../../common/components/ToggleButton'
import history from '../../../history.ts'

import css from './InstallOnIntegrations.less'

function getMetaField(integrationType: string): string {
    return `${integrationType}_integration_ids`
}

type Props = {
    integrationType: string,
    targetIntegrations: List<Map<*, *>>,
    integration: Map<*, *>,
    updateOrCreateIntegration: (Map<*, *>) => Promise<*>,
}

type State = {
    integrationLoading: ?number,
    showAll: boolean,
}

export default class InstallOnIntegrationsCard extends React.Component<
    Props,
    State
> {
    state = {
        integrationLoading: null,
        showAll: false,
    }

    async _installOnStore(targetIntegration: Map<*, *>) {
        const {
            integration,
            integrationType,
            updateOrCreateIntegration,
        } = this.props

        this.setState({integrationLoading: targetIntegration.get('id')})

        // todo(@martin): see if this is required too for Magento when implementing
        if (targetIntegration.getIn(['meta', 'need_scope_update'])) {
            history.push(
                `/app/settings/integrations/${targetIntegration.get('type')}/` +
                    `${targetIntegration.get('id')}/?error=need_scope_update`
            )
            return
        }

        const targetIntegrationId = targetIntegration.get('id')
        let targetIntegrationIdsList = integration.getIn(
            ['meta', getMetaField(integrationType)],
            fromJS([])
        )

        if (!targetIntegrationIdsList.contains(targetIntegrationId)) {
            targetIntegrationIdsList = targetIntegrationIdsList.push(
                targetIntegrationId
            )
        }

        const form = {
            id: integration.get('id'),
            type: integration.get('type'),
            meta: integration
                .get('meta')
                .set(getMetaField(integrationType), targetIntegrationIdsList),
        }

        await updateOrCreateIntegration(fromJS(form))

        this.setState({integrationLoading: null})
    }

    async _removeFromStore(targetIntegrationId: number) {
        const {
            integration,
            integrationType,
            updateOrCreateIntegration,
        } = this.props

        this.setState({integrationLoading: targetIntegrationId})

        const indexToDelete = integration
            .getIn(['meta', getMetaField(integrationType)], fromJS([]))
            .findIndex((value) => value === targetIntegrationId)

        const form = {
            id: integration.get('id'),
            type: integration.get('type'),
            meta: integration
                .get('meta')
                .deleteIn([getMetaField(integrationType), indexToDelete]),
        }

        await updateOrCreateIntegration(fromJS(form))

        this.setState({integrationLoading: null})
    }

    _showAll = () => {
        this.setState({showAll: true})
    }

    render() {
        const {integrationType, targetIntegrations, integration} = this.props
        const {showAll, integrationLoading} = this.state

        const isChat =
            integration.get('type') === SMOOCH_INSIDE_INTEGRATION_TYPE
        const integrationAlias = isChat ? 'chat' : 'customer chat'

        let sortedTargetIntegrations = targetIntegrations.sortBy(
            (targetIntegration) =>
                -moment(targetIntegration.get('created_datetime')).valueOf()
        )

        if (!showAll) {
            sortedTargetIntegrations = sortedTargetIntegrations.slice(0, 3)
        }

        return (
            <Card className={css['integration-card']}>
                <CardBody className={css['card-body']}>
                    <div className={css['logo-wrapper']}>
                        <img
                            alt={`${integrationType}-logo`}
                            src={integrationHelpers.getIconFromType(
                                integrationType
                            )}
                        />
                    </div>
                    <div className={css['content-wrapper']}>
                        <h3>{_capitalize(integrationType)}</h3>
                        <p>
                            Install the {integrationAlias} widget on your{' '}
                            {_capitalize(integrationType)} store in one click
                        </p>
                        <div>
                            {sortedTargetIntegrations.map(
                                (targetIntegration) => {
                                    const targetIntegrationId = targetIntegration.get(
                                        'id'
                                    )
                                    const chatIsInstalled = integration
                                        .getIn(
                                            [
                                                'meta',
                                                getMetaField(integrationType),
                                            ],
                                            fromJS([])
                                        )
                                        .includes(targetIntegrationId)

                                    return (
                                        <div
                                            key={targetIntegration.get('id')}
                                            className={css['integration-item']}
                                        >
                                            <div>
                                                <b>
                                                    {targetIntegration.get(
                                                        'name'
                                                    )}
                                                </b>
                                            </div>
                                            <ToggleButton
                                                value={chatIsInstalled}
                                                onChange={
                                                    chatIsInstalled
                                                        ? () =>
                                                              this._removeFromStore(
                                                                  targetIntegrationId
                                                              )
                                                        : () =>
                                                              this._installOnStore(
                                                                  targetIntegration
                                                              )
                                                }
                                                loading={
                                                    integrationLoading ===
                                                    targetIntegrationId
                                                }
                                                disabled={!!integrationLoading}
                                            />
                                        </div>
                                    )
                                }
                            )}
                            {!showAll &&
                                !targetIntegrations.slice(3).isEmpty() && (
                                    <div className="mt-3">
                                        <a
                                            className={css['show-more']}
                                            onClick={this._showAll}
                                        >
                                            Show more
                                        </a>
                                    </div>
                                )}
                        </div>
                    </div>
                </CardBody>
            </Card>
        )
    }
}
