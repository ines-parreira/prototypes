import React, {
    Children,
    cloneElement,
    PropsWithChildren,
    ReactElement,
    useMemo,
} from 'react'
import classnames from 'classnames'
import {Map, List} from 'immutable'
import {Card, CardBody} from 'reactstrap'
import {Link} from 'react-router-dom'

import Errors from 'pages/common/components/ast/Errors'
import {computeLeftPadding} from 'pages/common/components/ast/utils'
import {RuleItemActions} from 'pages/settings/rules/types'

import ActionSelect from './ActionSelect'
import ActionWarning from './ActionWarning'
import css from './Action.less'
import {actionsConfig, isValidActionKey} from './config'

type Props = {
    actions: RuleItemActions
    depth: number
    parent: List<any>
    properties: {
        key: {name: string}
        value: {value: unknown}
    }[]
    rule: Map<any, any>
    schemas?: Map<any, any>
    value: string
}

export default function Action({
    actions,
    children,
    depth,
    parent,
    properties,
    rule,
    value,
}: PropsWithChildren<Props>) {
    const config = isValidActionKey(value) ? actionsConfig[value] : null

    const values = useMemo(
        () =>
            properties.reduce(
                (props, property) => ({
                    ...props,
                    [property.key.name]: property.value.value,
                }),
                {}
            ),
        [properties]
    )

    const errors = useMemo(() => {
        const errors = config?.validate?.(values)
        if (!errors) {
            return []
        }
        if (typeof errors === 'string') {
            return [errors]
        }
        return errors.filter((error) => !!error)
    }, [config, values])

    return (
        <div
            className={classnames('Action', {
                'd-flex align-items-baseline': config?.compact,
            })}
            style={{paddingLeft: computeLeftPadding(depth)}}
        >
            <ActionSelect
                actions={actions}
                rule={rule}
                parent={parent.push('value')}
                value={value}
            />
            {!value ? (
                <Errors inline>An action cannot be empty</Errors>
            ) : value === 'facebookHideComment' ||
              value === 'facebookLikeComment' ? (
                <ActionWarning>
                    An extensive use of automatic Facebook actions may
                    deactivate your page on Facebook!
                </ActionWarning>
            ) : !config ? null : config?.compact ? (
                <>
                    <span
                        className={classnames(
                            css.compactAction,
                            'compact-action'
                        )}
                    >
                        {Children.map(children, (child) =>
                            cloneElement(child as ReactElement, {
                                compact: config.compact,
                            })
                        )}
                    </span>
                    {value === 'setTeamAssignee' && (
                        <ActionWarning>
                            To set up team auto-assignment, go to the{' '}
                            <Link to="/app/settings/ticket-assignment">
                                Ticket assignment
                            </Link>{' '}
                            page
                        </ActionWarning>
                    )}
                    {!!errors.length && (
                        <Errors className={css.inlineErrors} inline>
                            {errors}
                        </Errors>
                    )}{' '}
                </>
            ) : (
                <div className="card-action">
                    <Card>
                        <CardBody>
                            {children}
                            {!!errors.length && (
                                <Errors>
                                    {errors.map((error, id) => (
                                        <div key={id}>{error}</div>
                                    ))}
                                </Errors>
                            )}
                        </CardBody>
                    </Card>
                </div>
            )}
        </div>
    )
}
