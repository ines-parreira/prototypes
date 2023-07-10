import React from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, Map} from 'immutable'
import classnames from 'classnames'
import {Card, CardBody} from 'reactstrap'
import _capitalize from 'lodash/capitalize'
import _isObject from 'lodash/isObject'
import JSONPretty from 'react-json-pretty'

import IconButton from 'pages/common/components/button/IconButton'
import {IntegrationType} from 'models/integration/constants'
import {RootState} from 'state/types'
import {getActionByName} from 'config/actions'
import {AgentLabel, DatetimeLabel} from 'pages/common/utils/labels'
import {getIntegrationById} from 'state/integrations/selectors'
import {
    getAppDataByAppId,
    getIntegrationDataByIntegrationId,
} from 'state/ticket/selectors'
import {humanizeString, stripErrorMessage} from 'utils'

import css from './Event.less'
import getEvent from './Events'

export function renderDetails(isError: boolean, eventData: Map<any, any>) {
    const payload = (eventData.get('payload') || fromJS({})) as Map<any, any>
    const content = []

    if (isError) {
        content.push(
            <div key="error">
                <b className="text-danger">Error:</b>{' '}
                {stripErrorMessage(eventData.get('msg'))}
            </div>
        )
    }

    if (!payload.isEmpty()) {
        content.push(
            <div key="payload">
                <div>
                    {payload
                        .map((value, key) => {
                            let formattedValue

                            // Necessary to display correctly booleans
                            if (typeof value === 'boolean') {
                                formattedValue = value.toString()
                            } else if (_isObject(value)) {
                                formattedValue = (
                                    <JSONPretty
                                        data={(value as Map<any, any>).toJS()}
                                        className="d-inline-flex"
                                    />
                                )
                            } else {
                                formattedValue = value
                            }

                            return (
                                <div key={key}>
                                    <b>{humanizeString(key)}</b>:{' '}
                                    {formattedValue}
                                </div>
                            )
                        })
                        .toList()}
                </div>
            </div>
        )
    }

    return content
}

type OwnProps = {
    event: Map<any, any>
    isLast: boolean
}

type Props = OwnProps & ConnectedProps<typeof connector>

type State = {
    showDetails: boolean
}

export class EventContainer extends React.Component<Props, State> {
    static defaultProps: Pick<Props, 'isLast'> = {
        isLast: false,
    }

    state: State = {
        showDetails: false,
    }

    getDisplayableType(integrationType: IntegrationType) {
        if (integrationType === IntegrationType.SmoochInside) {
            return 'chat'
        }

        return integrationType
    }

    render() {
        const {event, isLast, integration, integrationData, appData} =
            this.props

        const user = (event.get('user') || fromJS({})) as Map<any, any>
        const status = event.getIn(['data', 'status'])
        const actionName = event.getIn(['data', 'action_name'])
        const payload = (event.getIn(['data', 'payload']) || fromJS({})) as Map<
            any,
            any
        >

        const isError = status === 'error'
        const isSuccess = !isError

        const actionConfig = getActionByName(actionName)

        if (!actionConfig) {
            return null
        }

        const hasIntegration = !integration.isEmpty()

        const actionLabel =
            event.getIn(['data', 'action_label']) || actionConfig.label
        const eventIcon = (
            <div
                className={classnames(css.icon, {
                    [css.danger]: isError,
                    [css.success]: isSuccess,
                })}
                title={isError ? 'Fail' : 'Success'}
            >
                <i className="material-icons">{isError ? 'close' : 'check'}</i>
            </div>
        )

        const {objectLabel, objectLink} = getEvent({
            integration,
            actionConfig,
            payload,
            data: integrationData,
        })

        return (
            <div
                className={classnames(css.component, {
                    [css.last]: isLast,
                })}
            >
                <div className={css.event}>
                    <div className={css.content}>
                        {eventIcon}
                        <span className={css.actionName}>
                            {actionLabel}{' '}
                            {!!objectLabel && (
                                <a
                                    href={objectLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {objectLabel}
                                </a>
                            )}
                        </span>

                        {appData && (
                            <>
                                <span className={css.equalFiller}>on</span>
                                <span className={css.actionName}>
                                    {appData.__app_name__}
                                </span>
                            </>
                        )}

                        {hasIntegration && (
                            <>
                                <span className={css.equalFiller}>on</span>
                                <span className={css.actionName}>
                                    {hasIntegration &&
                                        _capitalize(
                                            this.getDisplayableType(
                                                integration.get('type')
                                            )
                                        )}{' '}
                                    ({integration.get('name')})
                                </span>
                            </>
                        )}

                        <span className={css.filler}>by</span>

                        <AgentLabel
                            name={
                                (user.get('name') ||
                                    user.get('email')) as string
                            }
                        />

                        <IconButton
                            fillStyle="ghost"
                            intent="secondary"
                            onClick={() =>
                                this.setState({
                                    showDetails: !this.state.showDetails,
                                })
                            }
                            title="More details"
                        >
                            {this.state.showDetails
                                ? 'expand_less'
                                : 'expand_more'}
                        </IconButton>
                    </div>
                    <DatetimeLabel
                        dateTime={event.get('created_datetime')}
                        className={classnames(css.date, 'text-faded')}
                    />
                </div>

                <Card
                    className={classnames(css.details, {
                        'd-none': !this.state.showDetails,
                    })}
                >
                    <CardBody>
                        {renderDetails(isError, event.get('data'))}
                    </CardBody>
                </Card>
            </div>
        )
    }
}

const connector = connect((state: RootState, ownProps: OwnProps) => {
    const {event} = ownProps
    const integration = getIntegrationById(
        event.getIn(['data', 'integration_id'])
    )(state)

    return {
        integrationData: getIntegrationDataByIntegrationId(
            integration.get('id', '') as number
        )(state),
        appData: getAppDataByAppId(event.getIn(['data', 'app_id']))(state),
        integration,
    }
})

export default connector(EventContainer)
