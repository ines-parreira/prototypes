import classnames from 'classnames'
import moment from 'moment'

import { Button } from '@gorgias/axiom'

import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'

import { LlmTriggeredExecution } from '../types'
import ActionStatus from './ActionsStatus'

import css from './ActionEventRow.less'

type Props = {
    execution: LlmTriggeredExecution
    onClick: (executionId: string) => void
    isSelected: boolean
}

export default function ActionsRow({ execution, onClick, isSelected }: Props) {
    const handleTicketClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation()
        window.open(`/app/ticket/${execution.state.user_journey_id}`, '_blank')
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
                <ActionStatus status={execution.status} />
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
