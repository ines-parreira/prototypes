import { useMemo, useState } from 'react'

import { LegacyButton as Button, Skeleton } from '@gorgias/axiom'
import type {
    ListBusinessHoursOrderBy,
    OrderDirection,
} from '@gorgias/helpdesk-queries'
import { useListBusinessHours } from '@gorgias/helpdesk-queries'

import { NoDataAvailable } from 'domains/reporting/pages/common/components/NoDataAvailable'
import Navigation from 'pages/common/components/Navigation/Navigation'
import Search from 'pages/common/components/Search'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'

import ListCustomBusinessHoursTableRow from './ListCustomBusinessHoursTableRow'

import css from './ListCustomBusinessHours.less'

export default function ListCustomBusinessHours() {
    const [cursor, setCursor] = useState<string | undefined>(undefined)
    const [order_by, setOrderBy] = useState<ListBusinessHoursOrderBy>()
    const direction = useMemo(() => order_by?.split(':')?.[1], [order_by])
    const sortBy = useMemo(
        () => order_by?.split(':')?.[0] as 'name' | 'timezone',
        [order_by],
    )

    const [search, setSearch] = useState<string | undefined>(undefined)
    const { data: allBusinessHours } = useListBusinessHours()
    const customBusinessHoursCount = allBusinessHours?.data.meta.total_resources

    const { data, isLoading, isError, refetch } = useListBusinessHours({
        order_by,
        ...(order_by ? {} : { cursor }),
        ...(search ? { name: search } : {}),
    })

    const handleSearch = (query: string) => {
        setSearch(query)
        setCursor(undefined)
    }

    const businessHours = data?.data.data

    const updateCursor = (direction: 'next' | 'prev') => {
        if (direction === 'next') {
            setCursor(data!.data.meta.next_cursor!)
        } else {
            setCursor(data!.data.meta.prev_cursor!)
        }
    }

    if (!customBusinessHoursCount && !isLoading && !isError) {
        return null
    }

    const handleSortChange = (value: 'name' | 'timezone') => {
        if (sortBy === value) {
            if (direction === 'asc') {
                setOrderBy(`${value}:desc`)
            } else {
                setOrderBy(undefined)
            }
        } else {
            setOrderBy(`${value}:asc`)
        }
    }

    return (
        <>
            <Search
                className={css.search}
                placeholder="Search name"
                onChange={handleSearch}
                searchDebounceTime={300}
                value={search}
            />
            <TableWrapper className={css.table}>
                <TableHead>
                    <HeaderCellProperty
                        className={css.nameScheduleColumn}
                        direction={direction as OrderDirection}
                        isOrderedBy={sortBy === 'name'}
                        onClick={() => handleSortChange('name')}
                        title="Name & Schedule"
                    />
                    <HeaderCell className={css.integrationColumn}>
                        Integration
                    </HeaderCell>
                    <HeaderCellProperty
                        className={css.timezoneColumn}
                        direction={direction as OrderDirection}
                        isOrderedBy={sortBy === 'timezone'}
                        onClick={() => handleSortChange('timezone')}
                        title="Timezone"
                    />
                    <HeaderCell className={css.actionsColumn} />
                </TableHead>
                <TableBody>
                    {isLoading ? (
                        Array.from({ length: 5 }, (_, key) => (
                            <RowSkeleton key={key} />
                        ))
                    ) : !businessHours?.length ? (
                        <tr>
                            <td colSpan={4}>
                                <NoDataAvailable
                                    className={css.noDataAvailable}
                                    description={
                                        isError ? (
                                            <>
                                                <p>
                                                    Something went wrong when
                                                    fetching the data. Please
                                                    try again.
                                                </p>
                                                <Button
                                                    fillStyle="ghost"
                                                    onClick={() => refetch()}
                                                >
                                                    Refresh
                                                </Button>
                                            </>
                                        ) : (
                                            "We couldn't find any business hours. Please adjust filters."
                                        )
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
        </>
    )
}

const RowSkeleton = () => {
    return (
        <TableBodyRow>
            <BodyCell className={css.nameScheduleColumn}>
                <Skeleton width={300} />
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
