import type { PropsWithChildren, ReactElement } from 'react'
import React, { Children, cloneElement, useMemo } from 'react'

import classnames from 'classnames'
import type { List, Map } from 'immutable'
import { Link } from 'react-router-dom'
import { Card, CardBody } from 'reactstrap'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import Errors from 'pages/common/components/ast/Errors'
import { computeLeftPadding } from 'pages/common/components/ast/utils'
import type { RuleItemActions } from 'pages/settings/rules/types'

import ActionSelect from './ActionSelect'
import ActionWarning from './ActionWarning'
import { actionsConfig, isValidActionKey } from './config'

import css from './Action.less'

type Props = {
    actions: RuleItemActions
    depth: number
    parent: List<any>
    properties: {
        key: { name: string }
        value: { value: unknown }
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
                {},
            ),
        [properties],
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

    const actionTooltip = useMemo(() => {
        if (value === 'replyToTicket') {
            return (
                <>
                    <i
                        id="replyToTicketWarningIcon"
                        className={classnames(
                            'material-icons',
                            css.warningIcon,
                        )}
                    >
                        warning
                    </i>
                    <Tooltip
                        placement="top-start"
                        target="replyToTicketWarningIcon"
                        trigger={['hover']}
                        autohide={false}
                    >
                        {`Reply to customer won’t trigger if the last message is
                        from an agent. Use 'Apply macro' instead if you want to
                        reply to all messages`}
                    </Tooltip>
                </>
            )
        }
    }, [value])

    return (
        <div
            className={classnames('Action', {
                'd-flex': config?.compact,
            })}
            style={{
                display: 'flex',
                paddingLeft: computeLeftPadding(depth),
                gap: 'var(--spacing-xxs)',
                minHeight: 32,
                alignItems: 'center',
            }}
        >
            <ActionSelect
                actions={actions}
                rule={rule}
                parent={parent.push('value')}
                value={value}
            />
            {actionTooltip}
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
                            'compact-action',
                        )}
                    >
                        {Children.map(children, (child) =>
                            cloneElement(child as ReactElement, {
                                compact: config.compact,
                            }),
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
