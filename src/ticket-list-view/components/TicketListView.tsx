import React from 'react'

import {useGetViewItems} from 'models/view/queries'
import SkeletonLoader from 'pages/common/components/SkeletonLoader'

import TicketRow from './TicketRow'
import css from './TicketListView.less'
import SortingDropdown from './SortingDropdown'

export default function TicketListView({viewId}: {viewId: string}) {
    const {data, isLoading} = useGetViewItems({viewId: parseInt(viewId)})

    return (
        <div className={css.wrapper}>
            <div className={css.titleWrapper}>
                <div className={css.title}>My tickets</div>
                <SortingDropdown />
            </div>
            <div className={css.list}>
                {isLoading ? (
                    <SkeletonLoader length={5} className={css.loader} />
                ) : data?.data.data.length === 0 ? (
                    <div className={css.empty}>
                        <div className={css.emptyTitle}>No tickets</div>
                        <div className={css.description}>
                            This view is empty.
                        </div>
                    </div>
                ) : (
                    data?.data.data.map(
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
                    )
                )}
            </div>
        </div>
    )
}
