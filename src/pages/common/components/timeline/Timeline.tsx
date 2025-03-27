import { memo, useState } from 'react'

import { Link } from 'react-router-dom'

import { CustomField, ObjectType } from '@gorgias/api-queries'
import { LoadingSpinner } from '@gorgias/merchant-ui-kit'

import GorgiasLogo from 'assets/img/gorgias-logo.svg'
import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import useAppSelector from 'hooks/useAppSelector'
import { getCustomerHistory, getLoading } from 'state/customers/selectors'

import DisplayedDate from './DisplayedDate'
import { useSort } from './hooks/useSort'
import { Sort } from './Sort'
import TicketCard from './TicketCard'
import { ReduxCustomerHistory } from './types'

import css from './Timeline.less'

type Props = {
    ticketId?: number
    onLoaded?: () => unknown
}

export function Timeline({ ticketId = 0, onLoaded }: Props) {
    const hasNewTimeline = useFlag(FeatureFlagKey.CustomerTimeline)
    const [hasCalledOnLoaded, setHasCalledOnLoaded] = useState(false)

    const {
        data: { data: customFieldDefinitions } = {},
        isLoading: isLoadingCFDefinitions,
    } = useCustomFieldDefinitions({
        archived: false,
        object_type: ObjectType.Ticket,
    })

    const customersLoading = useAppSelector(getLoading).toJS() as {
        history: boolean
    }
    const customerHistory = useAppSelector(
        getCustomerHistory,
    ).toJS() as ReduxCustomerHistory

    const { sortedTickets, sortOption, setSortOption } = useSort(
        customerHistory.tickets,
    )

    if (customersLoading.history) {
        return (
            <div className={css.centeringContainer}>
                <LoadingSpinner size="big" />
            </div>
        )
    }

    if (customerHistory.triedLoading && !hasCalledOnLoaded) {
        setHasCalledOnLoaded(true)
        onLoaded?.()
    }

    if (customerHistory.triedLoading && customerHistory.tickets.length === 0) {
        return (
            <div className={`${css.centeringContainer} ${css.noResults}`}>
                <img src={GorgiasLogo} alt="Gorgias Logo" />
                <p>This customer doesn’t have any tickets yet.</p>
            </div>
        )
    }

    return (
        <div>
            {hasNewTimeline && (
                <div className={css.filtersContainer}>
                    <div></div>
                    <Sort value={sortOption} onChange={setSortOption} />
                </div>
            )}
            <ol className={css.list}>
                {sortedTickets
                    .filter((ticket) => ticket.channel)
                    .map((ticket) => {
                        const isCurrentTicket = ticketId === ticket.id
                        return (
                            <li key={ticket.id}>
                                <Link
                                    to={`/app/ticket/${ticket.id}`}
                                    onClick={() => {
                                        logEvent(
                                            SegmentEvent.CustomerTimelineTicketClicked,
                                        )
                                    }}
                                >
                                    <TicketCard
                                        className={css.card}
                                        ticket={ticket}
                                        isHighlighted={isCurrentTicket}
                                        isLoadingCFDefinitions={
                                            isLoadingCFDefinitions
                                        }
                                        customFieldDefinitions={
                                            (customFieldDefinitions ||
                                                []) as CustomField[]
                                        }
                                        displayedDate={DisplayedDate(
                                            sortOption,
                                            ticket,
                                        )}
                                    />
                                </Link>
                            </li>
                        )
                    })}
            </ol>
        </div>
    )
}

export default memo(Timeline)
