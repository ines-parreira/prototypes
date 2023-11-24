import React, {ReactNode} from 'react'
import classnames from 'classnames'
import {Map, List} from 'immutable'
import {Card, CardBody} from 'reactstrap'
import {Link} from 'react-router-dom'
import _isFunction from 'lodash/isFunction'
import _isArray from 'lodash/isArray'

import Errors from 'pages/common/components/ast/Errors'
import {computeLeftPadding} from 'pages/common/components/ast/utils'
import {RuleItemActions} from 'pages/settings/rules/types'

import {useIsAutomateRebranding} from 'pages/automate/common/hooks/useIsAutomateRebranding'
import ActionSelect from './ActionSelect'
import ActionWarning from './ActionWarning'
import css from './Action.less'
import {actionsConfig} from './config'

type Props = {
    rule: Map<any, any>
    actions: RuleItemActions
    children: ReactNode
    parent: List<any>
    value: keyof typeof actionsConfig
    depth: number
    schemas?: Map<any, any>
    leftsiblings?: List<any>
}

const TeamAssigneeActionWarning = () => {
    const {ticketAssignmentUrl} = useIsAutomateRebranding()
    return (
        <ActionWarning key="warning">
            To set up team auto-assignment, go to the{' '}
            <Link to={ticketAssignmentUrl}>Ticket assignment</Link> page
        </ActionWarning>
    )
}

export default class Action extends React.Component<Props> {
    _renderBody = () => {
        const {value} = this.props
        let {children} = this.props

        if (!value) {
            return <Errors inline>An action cannot be empty</Errors>
        }

        if (
            value === 'facebookHideComment' ||
            value === 'facebookLikeComment'
        ) {
            return (
                <ActionWarning>
                    An extensive use of automatic Facebook actions may
                    deactivate your page on Facebook!
                </ActionWarning>
            )
        }

        // Determine the display mode
        const config = actionsConfig[value]
        if (!config) {
            return null
        }

        const values: {[key: string]: unknown} = {}
        let errors: string[] | string = []

        // build an object with the keys and values of the action
        ;(
            children as {
                props: {
                    properties: {key: {name: string}; value: {value: unknown}}[]
                }
            }
        ).props.properties.forEach((property) => {
            values[property.key.name] = property.value.value
        })

        if (values && _isFunction(config.validate)) {
            errors = (config as {validate: (values: any) => string[]}).validate(
                values
            )
        }

        if (!_isArray(errors)) {
            errors = [errors]
        }

        errors = errors.filter((error) => !!error)

        // add 'compact' as a property of children
        children = React.Children.map(children, (child) =>
            React.cloneElement(child as any, {compact: !!config.compact})
        )

        if (config.compact) {
            return [
                <span
                    key="children"
                    className={classnames(css.compactAction, 'compact-action')}
                >
                    {children}
                </span>,
                value === 'setTeamAssignee' && <TeamAssigneeActionWarning />,
                errors.length ? (
                    <Errors className={css.inlineErrors} key="errors" inline>
                        {errors}
                    </Errors>
                ) : null,
            ]
        }

        return (
            <div className="card-action">
                <Card>
                    <CardBody>
                        {children}
                        {errors.length ? (
                            <Errors>
                                {errors.map((error, id) => (
                                    <div key={id}>{error}</div>
                                ))}
                            </Errors>
                        ) : null}
                    </CardBody>
                </Card>
            </div>
        )
    }

    render() {
        const {actions, rule, parent, value, depth} = this.props

        const config = actionsConfig[value] || {}

        return (
            <div
                className={classnames('Action', {
                    'd-flex align-items-baseline': config.compact,
                })}
                style={{paddingLeft: computeLeftPadding(depth)}}
            >
                <ActionSelect
                    actions={actions}
                    rule={rule}
                    parent={parent.push('value')}
                    value={value as any}
                />
                {this._renderBody()}
            </div>
        )
    }
}
