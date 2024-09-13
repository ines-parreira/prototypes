import React from 'react'
import classnames from 'classnames'
import moment from 'moment'
import {useHistory} from 'react-router-dom'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import Button from 'pages/common/components/button/Button'
import {LlmTriggeredExecution} from '../types'

import css from './ActionEventRow.less'

type Props = {
    execution: LlmTriggeredExecution
    onClick: (executionId: string) => void
    isSelected: boolean
}

export default function ActionsRow({execution, onClick, isSelected}: Props) {
    const history = useHistory()

    const handleTicketClick = () => {
        history.push(`/app/tickets/${execution.state.user_journey_id}`)
    }
    return (
        <TableBodyRow
            className={classnames(css.container, {
                [css.isSelected]: isSelected,
            })}
            onClick={() => onClick(execution.id)}
        >
            <BodyCell className={css.updateCell}>
                {moment(execution.updated_datetime).calendar()}
            </BodyCell>
            <BodyCell className={css.statusCell}>
                {execution.success === true && (
                    <Badge type={ColorType.LightSuccess}>SUCCESS</Badge>
                )}
                {execution.success === false && (
                    <Badge type={ColorType.LightError}>ERROR</Badge>
                )}
            </BodyCell>
            <BodyCell>
                {execution.state?.user_journey_id && (
                    <Button fillStyle="ghost" onClick={handleTicketClick}>
                        {execution.state.user_journey_id}
                    </Button>
                )}
            </BodyCell>

            <BodyCell justifyContent="right">
                <i className={classnames('material-icons', css.flowChevron)}>
                    keyboard_arrow_right
                </i>
            </BodyCell>
        </TableBodyRow>
    )
}
