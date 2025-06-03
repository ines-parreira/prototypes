import { useMemo, useState } from 'react'

import { OrderDirection } from 'models/api/types'
import { StoreIntegration } from 'models/integration/types'
import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { GuidanceListRow } from 'pages/aiAgent/components/GuidanceList/GuidanceListRow'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'

import { GuidanceArticle } from '../../types'

import css from './GuidanceList.less'

type SortState = {
    column: 'title' | 'lastUpdated'
    direction: OrderDirection
}

const initialSortState: SortState = {
    column: 'lastUpdated',
    direction: OrderDirection.Desc,
}

const compareDates = (a: string, b: string, direction: OrderDirection) => {
    return direction === OrderDirection.Asc
        ? new Date(a).getTime() - new Date(b).getTime()
        : new Date(b).getTime() - new Date(a).getTime()
}

type Props = {
    guidanceArticles: GuidanceArticle[]
    shopName: string
    shopType: string
    currentStoreIntegrationId: number | undefined
    onDelete: (articleId: number) => void
    onDuplicate: (articleId: number, storeIntegration: StoreIntegration) => void
    onRowClick: (articleId: number) => void
    onChangeVisibility: (articleId: number, isVisible: boolean) => void
}

export const GuidanceList = ({
    guidanceArticles,
    shopName,
    shopType,
    currentStoreIntegrationId,
    onDelete,
    onDuplicate,
    onRowClick,
    onChangeVisibility,
}: Props) => {
    const [sortState, setSortState] = useState<SortState>(initialSortState)
    const storeIntegrations = useStoreIntegrations()

    const { guidanceActions: availableActions } =
        useGetGuidancesAvailableActions(shopName, shopType)

    const onSortClick = (column: SortState['column']) => {
        const initialDirection =
            sortState.column === column ? undefined : OrderDirection.Asc
        const newDirection =
            sortState.direction === OrderDirection.Asc
                ? OrderDirection.Desc
                : OrderDirection.Asc

        setSortState({
            column,
            direction: initialDirection ?? newDirection,
        })
    }

    const onToggle = (articleId: number, isVisible: boolean) => {
        onChangeVisibility(articleId, isVisible)
    }

    const sortedGuidanceArticles = useMemo(
        () =>
            guidanceArticles.sort((a, b) => {
                if (sortState.column === 'title') {
                    return sortState.direction === OrderDirection.Asc
                        ? a.title.localeCompare(b.title)
                        : b.title.localeCompare(a.title)
                }

                if (sortState.column === 'lastUpdated') {
                    return compareDates(
                        a.lastUpdated,
                        b.lastUpdated,
                        sortState.direction,
                    )
                }

                return 0
            }),
        [guidanceArticles, sortState.column, sortState.direction],
    )

    const storesSortedCurrentFirst = useMemo(() => {
        return [...storeIntegrations].sort(
            ({ id: integrationIdA }, { id: integrationIdB }) => {
                if (integrationIdA === currentStoreIntegrationId) return -1
                if (integrationIdB === currentStoreIntegrationId) return 1
                return 0
            },
        )
    }, [currentStoreIntegrationId, storeIntegrations])

    return (
        <TableWrapper>
            <TableHead>
                <HeaderCellProperty
                    title="Guidance name"
                    titleClassName={css.titleCell}
                    onClick={() => onSortClick('title')}
                    isOrderedBy={sortState.column === 'title'}
                    direction={sortState.direction}
                />
                <HeaderCellProperty
                    title="Last updated"
                    titleClassName={css.titleCell}
                    onClick={() => onSortClick('lastUpdated')}
                    isOrderedBy={sortState.column === 'lastUpdated'}
                    direction={sortState.direction}
                />

                <HeaderCell />
                <HeaderCell />
            </TableHead>
            <TableBody>
                {sortedGuidanceArticles.map((article) => (
                    <GuidanceListRow
                        key={article.id}
                        article={article}
                        currentStoreIntegrationId={currentStoreIntegrationId}
                        onToggle={onToggle}
                        onDelete={onDelete}
                        sortedStoreIntegrations={storesSortedCurrentFirst}
                        onDuplicate={onDuplicate}
                        onRowClick={onRowClick}
                        availableActions={availableActions}
                    />
                ))}
            </TableBody>
        </TableWrapper>
    )
}
