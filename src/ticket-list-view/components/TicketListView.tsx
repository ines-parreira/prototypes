import React, {useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {Ticket} from 'models/ticket/types'
import {useGetViewItems} from 'models/view/queries'
import InfiniteScroll from 'pages/common/components/InfiniteScroll/InfiniteScroll'
import SkeletonLoader from 'pages/common/components/SkeletonLoader'
import {getViewPlainJS} from 'state/views/selectors'

import TicketRow from './TicketRow'
import css from './TicketListView.less'

export default function TicketListView({viewId}: {viewId: string}) {
    const {isInitialLoading, data, hasNextPage, fetchNextPage} =
        useGetViewItems({
            viewId: parseInt(viewId),
        })

    const view = useAppSelector((state) => getViewPlainJS(state, viewId))

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
                <div className={css.title}>{view?.name}</div>
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
