import {Tooltip} from '@gorgias/merchant-ui-kit'
import cn from 'classnames'
import moment from 'moment'
import React, {useMemo} from 'react'
import {Link} from 'react-router-dom'

import {TicketStatus} from 'business/types/ticket'
import useAppSelector from 'hooks/useAppSelector'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import {getTicket} from 'state/ticket/selectors'

import {dimensionConfig} from '../config'
import useAutoQA from '../hooks/useAutoQA'
import css from './AutoQA.less'
import AutoQASkeleton from './AutoQASkeleton'
import Dimension from './Dimension'
import SaveBadge from './SaveBadge'

export default function AutoQA() {
    const ticket = useAppSelector(getTicket)
    const {changeHandlers, dimensions, isLoading, lastUpdated, saveState} =
        useAutoQA(ticket.id)

    const lastUpdatedString = useMemo(
        () => moment(lastUpdated).calendar(),
        [lastUpdated]
    )

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
                        AI generated results, edit to improve AI model.
                    </Tooltip>
                    <Badge type={ColorType.Magenta}>BETA</Badge>
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
