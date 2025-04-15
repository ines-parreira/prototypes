import React, { useMemo } from 'react'

import cn from 'classnames'
import { useFlags } from 'launchdarkly-react-client-sdk'
import moment from 'moment'
import { Link } from 'react-router-dom'

import { Badge, Tooltip } from '@gorgias/merchant-ui-kit'

import { TicketStatus } from 'business/types/ticket'
import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'
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
    const isSimplifiedFeedbackCollectionEnabled =
        useFlags()[FeatureFlagKey.SimplifyAiAgentFeedbackCollection]

    const lastUpdatedString = useMemo(
        () => moment(lastUpdated).calendar(),
        [lastUpdated],
    )

    if (!hasAgentPrivileges && isSimplifiedFeedbackCollectionEnabled) {
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
        <div className={css.container}>
            <header className={css.header}>
                <div className={css.titleWrapper}>
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
                    <Badge type={'magenta'}>BETA</Badge>
                </div>
                <SaveBadge state={saveState} />
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
                    {dimensions.map((dim) => (
                        <Dimension
                            key={dim.name}
                            config={dimensionConfig[dim.name]}
                            dimension={dim}
                            onChange={changeHandlers[dim.name]}
                            ticketId={ticket.id}
                        />
                    ))}

                    <p className={css.lastUpdated}>
                        Last updated: {lastUpdatedString}
                    </p>
                </>
            )}
        </div>
    )
}
