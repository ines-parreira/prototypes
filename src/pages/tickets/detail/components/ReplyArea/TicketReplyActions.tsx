import React, {useState} from 'react'
import {fromJS, List, Map} from 'immutable'
import {Collapse} from 'reactstrap'
import classNames from 'classnames'

import {MacroActionName} from 'models/macroAction/types'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import Tooltip from 'pages/common/components/Tooltip'
import {getActionTemplate} from 'utils'

import {ActionTemplateExecution} from 'config'
import useAppSelector from 'hooks/useAppSelector'
import {hasContent} from 'state/newMessage/selectors'
import TicketReplyAction from './TicketReplyAction'
import TMPApplyOnSendPopover from './ApplyOnSendPopover'
import css from './TicketReplyActions.less'

type Props = {
    ticketId: number
    appliedMacro?: Map<any, any>
    onDelete: (actionIndex: number, ticketId: number) => void
}

export default function TicketReplyActions({
    ticketId,
    appliedMacro,
    onDelete,
}: Props) {
    const backendActions: List<any> = appliedMacro
        ? (appliedMacro.get('actions') as List<Map<any, any>>).filter(
              (action) =>
                  getActionTemplate(action!.get('name'))?.execution !==
                  ActionTemplateExecution.Front
          )
        : fromJS([])

    const [isOpen, setIsOpen] = useState(backendActions.size < 5)
    const hasNewMessageContent = useAppSelector(hasContent)

    if (!appliedMacro || !backendActions || !backendActions.size) {
        return null
    }

    const sortedBackendActions = backendActions.sort(
        (a: Map<any, any>, b: Map<any, any>) =>
            a.get('name') === MacroActionName.AddInternalNote ||
            a.get('name') < b.get('name')
                ? -1
                : b.get('name') === MacroActionName.AddInternalNote ||
                  a.get('name') > b.get('name')
                ? 1
                : 0
    )

    return (
        <div>
            <div className={css.actions} onClick={() => setIsOpen(!isOpen)}>
                <i
                    className={classNames(
                        css.actionIcon,
                        'material-icons mr-2'
                    )}
                >
                    bolt
                </i>
                <Badge type={ColorType.Classic} className="mr-2">
                    {backendActions.size}
                </Badge>
                <span className={css.title}>
                    Actions performed{hasNewMessageContent && ' on send'}
                </span>
                <i
                    id="show-actions"
                    className={classNames(css.collapseIcon, 'material-icons')}
                >
                    {isOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                </i>
                <Tooltip placement="top" target="show-actions">
                    {isOpen ? 'Hide macro actions ' : 'Show macro actions'}
                </Tooltip>
            </div>
            <TMPApplyOnSendPopover actions={backendActions} />
            <Collapse isOpen={isOpen} className={css.scrollable}>
                {sortedBackendActions.map(
                    (action: Map<any, any>, key: number | undefined) => (
                        <TicketReplyAction
                            key={key}
                            index={(
                                appliedMacro.get('actions') as List<any>
                            ).indexOf(action)}
                            action={action}
                            remove={onDelete}
                            ticketId={ticketId}
                        />
                    )
                )}
            </Collapse>
        </div>
    )
}
