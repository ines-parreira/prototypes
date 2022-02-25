import React, {useState} from 'react'
import {fromJS, List, Map} from 'immutable'
import {Collapse} from 'reactstrap'
import classNames from 'classnames'

import {MacroActionName} from 'models/macroAction/types'
import Badge from 'pages/common/components/Badge/Badge'
import Tooltip from 'pages/common/components/Tooltip'
import {updateActionArgsOnApplied} from 'state/ticket/actions'
import {getActionTemplate} from 'utils'

import TicketReplyAction from './TicketReplyAction'
import css from './TicketReplyActions.less'

type Props = {
    ticketId: number
    appliedMacro?: Map<any, any>
    onDelete: (actionIndex: number, ticketId: number) => void
    onUpdate: typeof updateActionArgsOnApplied
}

export default function TicketReplyActions({
    ticketId,
    appliedMacro,
    onDelete,
    onUpdate,
}: Props) {
    const backendActions = appliedMacro
        ? ((appliedMacro.get('actions') as List<any>).filter(
              (action: Map<any, any>) => {
                  const actionTemplate = getActionTemplate(action.get('name'))
                  return !!actionTemplate && actionTemplate.execution === 'back'
              }
          ) as List<any>)
        : (fromJS([]) as List<any>)

    const [isOpen, setIsOpen] = useState(backendActions.size < 5)

    if (!appliedMacro || !backendActions || !backendActions.size) {
        return null
    }

    const sortedBackendActions = backendActions.sort((a, b) =>
        a === MacroActionName.AddInternalNote || a < b
            ? -1
            : b === MacroActionName.AddInternalNote || a > b
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
                <Badge className="mr-2">{backendActions.size}</Badge>
                <span className={css.title}>Actions performed on send</span>
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
            <Collapse isOpen={isOpen}>
                {sortedBackendActions.map(
                    (action: Map<any, any>, key: number | undefined) => (
                        <TicketReplyAction
                            key={key}
                            index={(
                                appliedMacro.get('actions') as List<any>
                            ).indexOf(action)}
                            action={action}
                            update={onUpdate}
                            remove={onDelete}
                            ticketId={ticketId}
                        />
                    )
                )}
            </Collapse>
        </div>
    )
}
