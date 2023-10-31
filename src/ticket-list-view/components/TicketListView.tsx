import React, {useMemo} from 'react'

import {Ticket} from 'models/ticket/types'
import {useGetViewItems} from 'models/view/queries'
import InfiniteScroll from 'pages/common/components/InfiniteScroll/InfiniteScroll'
import SkeletonLoader from 'pages/common/components/SkeletonLoader'

import TicketRow from './TicketRow'
import css from './TicketListView.less'
import SortingDropdown from './SortingDropdown'

export default function TicketListView({viewId}: {viewId: string}) {
    const {isInitialLoading, data, hasNextPage, fetchNextPage} =
        useGetViewItems({
            viewId: parseInt(viewId),
        })

    const tickets = useMemo(
        () =>
            data?.pages.reduce<Ticket[]>(
                (all, page) => [...all, ...page.data.data],
                []
            ) || [],
        [data]
    )

    return (
        <div className={css.wrapper}>
            <div className={css.titleWrapper}>
                <div className={css.title}>My tickets</div>
                <SortingDropdown />
            </div>
            {isInitialLoading ? (
                <SkeletonLoader length={5} className={css.skeleton} />
            ) : tickets.length === 0 ? (
                <div className={css.empty}>
                    <div className={css.emptyTitle}>No tickets</div>
                    <div className={css.description}>This view is empty.</div>
                </div>
            ) : (
                <InfiniteScroll
                    className={css.list}
                    onLoad={fetchNextPage}
                    shouldLoadMore={!isInitialLoading && !!hasNextPage}
                >
                    {tickets.map(
                        ({
                            excerpt,
                            channel,
                            created_datetime,
                            id,
                            is_unread,
                            last_message_datetime,
                            status,
                            subject,
                        }) => (
                            <TicketRow
                                key={id}
                                viewId={viewId}
                                ticket={{
                                    excerpt,
                                    channel,
                                    id,
                                    is_unread,
                                    status,
                                    subject,
                                }}
                                lastMessageDatetime={
                                    last_message_datetime ?? created_datetime
                                }
                            />
                        )
                    )}
                </InfiniteScroll>
            )}
        </div>
    )
}
