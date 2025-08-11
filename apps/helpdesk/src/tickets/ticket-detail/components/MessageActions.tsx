import { useState } from 'react'

import classnames from 'classnames'
import { fromJS } from 'immutable'
import _truncate from 'lodash/truncate'
import { Badge } from 'reactstrap'

import { Button, LoadingSpinner, Tooltip } from '@gorgias/axiom'
import { TicketMessage } from '@gorgias/helpdesk-types'

import { ActionTemplate, ActionTemplateExecution } from 'config'
import { ContentType } from 'models/api/types'
import { MacroActionName } from 'models/macroAction/types'
import { Action, ActionStatus } from 'models/ticket/types'
import { JSONTree } from 'pages/common/components/JSONTree'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import { useTicketModalContext } from 'timeline/ticket-modal/hooks/useTicketModalContext'
import { getActionTemplate, toRGBA } from 'utils'

import css from './MessageActions.less'

const SHOPIFY_ACTION_NAMES = [
    MacroActionName.ShopifyCancelLastOrder,
    MacroActionName.ShopifyCancelOrder,
    MacroActionName.ShopifyDuplicateLastOrder,
    MacroActionName.ShopifyEditNoteLastOrder,
    MacroActionName.ShopifyEditShippingAddressLastOrder,
    MacroActionName.ShopifyFullRefundLastOrder,
    MacroActionName.ShopifyPartialRefundLastOrder,
    MacroActionName.ShopifyRefundShippingCostLastOrder,
] as const

const displayedArg: Record<string, string> = {
    [MacroActionName.AddTags]: 'tags',
    [MacroActionName.AddAttachments]: 'attachments',
    [MacroActionName.AddInternalNote]: 'body_text',
    [MacroActionName.SetAssignee]: 'assignee_user',
    [MacroActionName.SetResponseText]: 'body_text',
    [MacroActionName.SetStatus]: 'status',
    [MacroActionName.SetPriority]: 'priority',
    [MacroActionName.SetSubject]: 'subject',
    [MacroActionName.SetTeamAssignee]: 'assignee_team',
    [MacroActionName.SnoozeTicket]: 'snooze_timedelta',
    [MacroActionName.SetCustomFieldValue]: 'value',
}

type Props = {
    message: TicketMessage
}

export function MessageActions({ message }: Props) {
    const [modalActionIndex, setModalActionIndex] = useState<number | null>(
        null,
    )

    const { isInsideTicketModal } = useTicketModalContext()

    if (!message.actions) return null

    const backActions = message.actions.filter(
        ({ name }) =>
            getActionTemplate(name as string)?.execution !==
            ActionTemplateExecution.Front,
    ) as Action[]

    if (backActions.length === 0) return null

    return (
        <div className={classnames(css.component, 'mt-3')}>
            <div className={classnames(css.title, 'mb-2 text-muted')}>
                Actions performed:
            </div>
            {backActions.map((action: Action, index: number) => {
                const getIcon = (icon: string) => (
                    <i className={classnames('material-icons mr-2', css.icon)}>
                        {icon}
                    </i>
                )
                let icon = getIcon('check')
                let color = '#20C08C'

                if (action.status === ActionStatus.Pending) {
                    icon = (
                        <LoadingSpinner
                            className={css.spinner}
                            size={18}
                            color="dark"
                        />
                    )
                    color = '#1D365C'
                } else if (
                    action.status === ActionStatus.Error ||
                    action.status === ActionStatus.Cancelled
                ) {
                    icon = getIcon('info_outline')
                    color = '#F24F66'
                }

                const isExternalTemplateAction =
                    action.name === MacroActionName.ApplyExternalTemplate

                const arg = getActionArg(action)

                const isHTTPOrShopify =
                    getIsHttpAction(action) || getIsShopifyAction(action)

                const displayTooltip = !isInsideTicketModal && isHTTPOrShopify

                return (
                    <div
                        key={`message-actions-${index}`}
                        className="d-inline-block ml-1 mr-1 mb-2"
                    >
                        {
                            <Badge
                                cssModule={{ badge: css.badge }}
                                style={{
                                    color,
                                    backgroundColor: toRGBA(color, 0.05),
                                }}
                                id={`message-${message.id}-actions-badge-${index}`}
                            >
                                {icon}
                                {isExternalTemplateAction
                                    ? 'WhatsApp template applied'
                                    : action.title}
                                {!isHTTPOrShopify &&
                                    !isExternalTemplateAction &&
                                    ![
                                        MacroActionName.ForwardByEmail,
                                        MacroActionName.ExcludeFromAutoMerge,
                                        MacroActionName.ExcludeFromCSAT,
                                    ].includes(action.name) &&
                                    ': ' + arg}
                            </Badge>
                        }
                        {displayTooltip &&
                            action.status !== ActionStatus.Pending && (
                                <Tooltip
                                    target={`message-${message.id}-actions-badge-${index}`}
                                    autohide={false}
                                    className={css.tooltip}
                                >
                                    <span className={css.tooltipContent}>
                                        Action
                                        {action.status === ActionStatus.Success
                                            ? ' succeeded. '
                                            : ' failed. '}
                                        {
                                            <Button
                                                fillStyle="ghost"
                                                size="small"
                                                onClick={() =>
                                                    setModalActionIndex(index)
                                                }
                                            >
                                                More details
                                            </Button>
                                        }
                                    </span>
                                </Tooltip>
                            )}
                    </div>
                )
            })}
            {typeof modalActionIndex === 'number' && (
                <ActionModal
                    action={backActions[modalActionIndex]}
                    onClose={() => setModalActionIndex(null)}
                />
            )}
        </div>
    )
}

function getIsShopifyAction(action: Action) {
    return SHOPIFY_ACTION_NAMES.includes(
        action.name as (typeof SHOPIFY_ACTION_NAMES)[number],
    )
}

function getIsHttpAction(action: Action) {
    return action.name === 'http'
}

function ActionModal({
    action,
    onClose,
}: {
    action: Maybe<Action>
    onClose: () => void
}) {
    if (!action) return null

    const isShopifyAction = getIsShopifyAction(action)
    const isHttpAction = getIsHttpAction(action)

    if (!isShopifyAction && !isHttpAction) return null

    const title = isShopifyAction ? 'Options' : 'Request'

    return (
        <Modal isOpen onClose={onClose} size="large">
            <ModalHeader title={title} />
            {isShopifyAction ? (
                <ShopifyAction action={action} />
            ) : (
                <HTTPAction
                    action={action}
                    contentType={action.arguments?.content_type as ContentType}
                />
            )}
        </Modal>
    )
}

function ShopifyAction({ action }: { action: Action }) {
    const hiddenOptions = ['tracking_event_name']
    return (
        <ModalBody>
            {Object.keys(action.arguments || []).map((arg, idx) => {
                if (!hiddenOptions.includes(arg)) {
                    let rawValue =
                        action.arguments![arg as keyof typeof action.arguments]

                    let value: string

                    if (typeof rawValue === 'object') {
                        value = JSON.stringify(rawValue)
                    } else {
                        value = String(rawValue)
                    }

                    return (
                        <p key={idx}>
                            <b>{arg}:</b> {value}
                        </p>
                    )
                }
            })}
        </ModalBody>
    )
}

function HTTPAction({
    action,
    contentType,
}: {
    action: Action
    contentType?: ContentType
}) {
    return (
        <ModalBody>
            <h3>Headers</h3>
            {!!action.arguments?.headers &&
                Object.keys(action.arguments.headers).map((arg, idx) => (
                    <p key={idx}>
                        <b>{arg}:</b> {action.arguments?.headers![arg]}
                    </p>
                ))}
            <h3>URL Parameters</h3>
            {!!action.arguments?.params &&
                Object.keys(action.arguments.params).map((arg, idx) => (
                    <p key={idx}>
                        <b>{arg}:</b> {action.arguments?.params![arg]}
                    </p>
                ))}
            {!!action.arguments?.form && contentType === ContentType.Form && (
                <div className="mt-3">
                    <h3>Form Data</h3>
                    {Object.keys(action.arguments.form).map((arg, idx) => (
                        <p key={idx}>
                            <b>{arg}:</b> {action.arguments?.form![arg]}
                        </p>
                    ))}
                </div>
            )}
            {!!action.arguments?.json && contentType === ContentType.Json && (
                <div className="mt-3">
                    <h3>JSON Data</h3>
                    <JSONTree data={fromJS(action.arguments?.json)} />
                </div>
            )}
            {!!action.response && (
                <div className="mt-3">
                    <h2>Response</h2>
                    <p>
                        Status code: <b>{action.response.status_code}</b>
                    </p>
                    <div className={css.body}>
                        <b>Body</b>:
                        <pre>
                            <code>{action.response.response}</code>
                        </pre>
                    </div>
                </div>
            )}
        </ModalBody>
    )
}

function getActionArg(action: Action) {
    const key = displayedArg[action.name]
    const actionArgs = action.arguments as ActionTemplate['arguments']
    let arg = actionArgs && key ? actionArgs[key] : 'None'

    if (!arg) {
        arg = 'None'
    }
    if (typeof arg === 'object') {
        arg =
            'name' in arg
                ? ((arg as unknown as ActionTemplate['arguments'])!
                      .name as string)
                : 'None'
    }
    if (action.name === MacroActionName.AddTags) {
        arg = arg.split(',').join(', ')
    }
    return _truncate(arg, { length: 20 })
}
