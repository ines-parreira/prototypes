import { useMemo, useRef } from 'react'

import { useHelpdeskV2MS1Flag } from '@repo/tickets/feature-flags'
import cn from 'classnames'
import moment from 'moment'
import { Link } from 'react-router-dom'

import { Icon, LegacyTooltip as Tooltip } from '@gorgias/axiom'

import type { SaveState } from 'auto_qa/hooks/useSaveState'
import { TicketStatus } from 'business/types/ticket'
import { useTicketIsAfterFeedbackCollectionPeriod } from 'common/utils/useIsTicketAfterFeedbackCollectionPeriod'
import useAppSelector from 'hooks/useAppSelector'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'
import AutoSaveBadge from 'pages/tickets/detail/components/AIAgentFeedbackBar/AutoSaveBadge'
import { AutoSaveState } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { getTicket } from 'state/ticket/selectors'
import TicketListInfo from 'ticket-list-view/components/TicketListInfo'

import { dimensionConfig } from '../config'
import useAutoQA from '../hooks/useAutoQA'
import AutoQASkeleton from './AutoQASkeleton'
import Dimension from './Dimension'
import SaveBadge from './SaveBadge'

import css from './AutoQA.less'

export default function AutoQA() {
    const ticket = useAppSelector(getTicket)
    const hasAgentPrivileges = useHasAgentPrivileges()
    const { changeHandlers, dimensions, isLoading, lastUpdated, saveState } =
        useAutoQA(ticket.id)
    const isAfterFeedbackCollectionPeriod =
        useTicketIsAfterFeedbackCollectionPeriod()

    const hasUIVisionMS1 = useHelpdeskV2MS1Flag()

    const lastUpdatedString = useMemo(
        () => moment(lastUpdated).calendar(),
        [lastUpdated],
    )

    const prevSaveBadgeState = useRef<SaveState>('idle')

    const newSaveBadgeState = useMemo(() => {
        let newState = AutoSaveState.INITIAL

        if (
            (prevSaveBadgeState.current === 'saved' && saveState === 'idle') ||
            saveState === 'saved'
        ) {
            newState = AutoSaveState.SAVED
        } else if (saveState === 'saving') {
            newState = AutoSaveState.SAVING
        }

        prevSaveBadgeState.current = saveState

        return newState
    }, [saveState])

    if (!hasAgentPrivileges && isAfterFeedbackCollectionPeriod) {
        return (
            <div className={css.container}>
                <TicketListInfo
                    text="Unauthorized"
                    subText="You do not have permission to view ticket feedback."
                />
            </div>
        )
    }

    return (
        <div
            className={cn(css.container, {
                [css.hasUIVisionMS1]: hasUIVisionMS1,
            })}
        >
            <header className={css.header}>
                <div className={css.titleWrapper}>
                    {hasUIVisionMS1 && <Icon name="star" size="md" />}
                    <h2 className={css.title}>Auto QA Score</h2>
                    <i
                        id="auto-qa-score"
                        className={cn('material-icons-outlined', css.icon)}
                    >
                        info
                    </i>
                    <Tooltip target="auto-qa-score" placement="top-end">
                        Evaluate how well the agent handled your ticket to track
                        their performance and help them improve. While some
                        performance metrics are automatically calculated, you
                        can adjust both the scores and feedback to improve the
                        AI model.
                    </Tooltip>
                </div>
                {isAfterFeedbackCollectionPeriod ? (
                    <AutoSaveBadge
                        state={newSaveBadgeState}
                        updatedAt={
                            lastUpdated ? new Date(lastUpdated) : undefined
                        }
                    />
                ) : (
                    <SaveBadge state={saveState} />
                )}
            </header>

            {isLoading ? (
                <AutoQASkeleton />
            ) : !lastUpdated ? (
                <div className={css.unavailable}>
                    {ticket.status === TicketStatus.Open ? (
                        <>
                            <p>
                                Auto QA results will be available 12 hours after
                                ticket closure.
                            </p>
                            <p>
                                In the meantime, you can review the{' '}
                                <Link to="/app/stats/auto-qa">
                                    Auto QA report
                                </Link>
                                .
                            </p>
                        </>
                    ) : (
                        <p>
                            Only tickets that meet certain requirements are
                            scored by Auto QA. This ticket might be scored 12h
                            after closure. To learn more, please refer to{' '}
                            <a
                                href="https://link.gorgias.com/fpc"
                                rel="noreferrer"
                                target="_blank"
                            >
                                this article
                            </a>
                            .
                        </p>
                    )}
                </div>
            ) : (
                <>
                    {hasUIVisionMS1 ? (
                        <div>
                            {dimensions.map((dim) => (
                                <Dimension
                                    key={dim.name}
                                    config={dimensionConfig[dim.name]}
                                    dimension={dim}
                                    onChange={changeHandlers[dim.name]}
                                    ticketId={ticket.id}
                                />
                            ))}
                        </div>
                    ) : (
                        dimensions.map((dim) => (
                            <Dimension
                                key={dim.name}
                                config={dimensionConfig[dim.name]}
                                dimension={dim}
                                onChange={changeHandlers[dim.name]}
                                ticketId={ticket.id}
                            />
                        ))
                    )}
                    <p className={css.lastUpdated}>
                        Last updated: {lastUpdatedString}
                    </p>
                </>
            )}
        </div>
    )
}
