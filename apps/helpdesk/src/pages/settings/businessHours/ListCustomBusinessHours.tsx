import { useState } from 'react'

import { useListBusinessHours } from '@gorgias/helpdesk-queries'
import { Button, Skeleton } from '@gorgias/merchant-ui-kit'

import { NoDataAvailable } from 'domains/reporting/pages/common/components/NoDataAvailable'
import Navigation from 'pages/common/components/Navigation/Navigation'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'

import ListCustomBusinessHoursTableRow from './ListCustomBusinessHoursTableRow'

import css from './ListCustomBusinessHours.less'

export default function ListCustomBusinessHours() {
    const [cursor, setCursor] = useState<string>()
    const { data, isLoading, isError, refetch } = useListBusinessHours({
        cursor,
    })

    const businessHours = data?.data.data

    const updateCursor = (direction: 'next' | 'prev') => {
        if (direction === 'next') {
            setCursor(data!.data.meta.next_cursor!)
        } else {
            setCursor(data!.data.meta.prev_cursor!)
        }
    }

    if (!isLoading && !isError && !businessHours?.length) {
        return null
    }

    return (
        <TableWrapper className={css.table}>
            <TableHead>
                <HeaderCell className={css.nameScheduleColumn}>
                    Name & Schedule
                </HeaderCell>
                <HeaderCell className={css.integrationColumn}>
                    Integration
                </HeaderCell>
                <HeaderCell className={css.timezoneColumn}>Timezone</HeaderCell>
                <HeaderCell className={css.actionsColumn} />
            </TableHead>
            <TableBody>
                {isLoading ? (
                    <RowSkeleton />
                ) : isError ? (
                    <tr>
                        <td colSpan={4}>
                            <NoDataAvailable
                                className={css.noDataAvailable}
                                description={
                                    <>
                                        <p>
                                            Something went wrong when fetching
                                            the data. Please try again.
                                        </p>
                                        <Button
                                            fillStyle="ghost"
                                            onClick={() => refetch()}
                                        >
                                            Refresh
                                        </Button>
                                    </>
                                }
                            />
                        </td>
                    </tr>
                ) : (
                    businessHours?.map((item) => (
                        <ListCustomBusinessHoursTableRow
                            key={item.id}
                            businessHours={item}
                        />
                    ))
                )}
            </TableBody>
            {!isLoading && (
                <Navigation
                    className={css.pagination}
                    hasNextItems={!!data?.data.meta.next_cursor}
                    hasPrevItems={!!data?.data.meta.prev_cursor}
                    fetchNextItems={() => updateCursor('next')}
                    fetchPrevItems={() => updateCursor('prev')}
                />
            )}
        </TableWrapper>
    )
}

const RowSkeleton = () => {
    return (
        <TableBodyRow>
            <BodyCell className={css.nameScheduleColumn}>
                <Skeleton width={300} />
            </BodyCell>
            <BodyCell className={css.integrationColumn}>
                <Skeleton width={150} />
            </BodyCell>
            <BodyCell className={css.timezoneColumn}>
                <Skeleton width={100} />
            </BodyCell>
            <BodyCell className={css.actionsColumn}>
                <Skeleton width={50} />
            </BodyCell>
        </TableBodyRow>
    )
}
