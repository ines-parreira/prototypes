import { noop } from 'lodash'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import Navigation from 'pages/common/components/Navigation/Navigation'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'

import ListCustomBusinessHoursTableRow from './ListCustomBusinessHoursTableRow'

import css from './ListCustomBusinessHours.less'

type Props = {
    isLoading?: boolean
}

export default function ListCustomBusinessHours({ isLoading = false }: Props) {
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
                ) : (
                    [1, 2, 3].map((_, index) => (
                        /* TODO replace index with id when available */
                        <ListCustomBusinessHoursTableRow key={index} />
                    ))
                )}
            </TableBody>
            {!isLoading && (
                <Navigation
                    className={css.pagination}
                    hasNextItems={true}
                    hasPrevItems={false}
                    fetchNextItems={noop}
                    fetchPrevItems={noop}
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
