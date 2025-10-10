import classnames from 'classnames'
import moment from 'moment'

import { LegacyButton as Button } from '@gorgias/axiom'

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

    const journeyId = execution.state.user_journey_id
    const isJourneyInTestMode = journeyId === '123'

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
            <BodyCell className={isJourneyInTestMode ? css.testModeCell : ''}>
                {isJourneyInTestMode ? (
                    <span>Action performed in test mode</span>
                ) : (
                    journeyId && (
                        <Button
                            fillStyle="ghost"
                            onClick={handleTicketClick}
                            className={css.ActionEventRowJourneyButton}
                        >
                            {journeyId}
                        </Button>
                    )
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
