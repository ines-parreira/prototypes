import React from 'react'
import {Card} from '@gorgias/analytics-ui-kit'
import {NoDataAvailable} from 'pages/stats/NoDataAvailable'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {TooltipData} from 'pages/stats/types'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import {
    AIArticleRecommendationItem,
    AllRecommendationsStatus,
} from '../hooks/useAIArticleRecommendationItems'
import AutomateAllRecommendationsTable from './AutomateAllRecommendationsTable'
import css from './AutomateAllRecommendationsCard.less'

export type AllRecomendationsColumn = {
    name: string
    width?: number
    tooltip?: TooltipData
}

const allRecommendationsStatusOptions = [
    {
        value: AllRecommendationsStatus.All,
        label: 'All',
    },
    {
        value: AllRecommendationsStatus.ArticleCreated,
        label: 'Article created',
    },
    {
        value: AllRecommendationsStatus.NotCreated,
        label: 'Not created',
    },
]

const columns: AllRecomendationsColumn[] = [
    {
        name: 'Question',
        width: 674,
    },
    {
        name: '# of tickets',
        tooltip: {
            title: 'The number of tickets received with this question over the past 90 days',
        },
    },
    {
        name: '',
    },
]

const ITEMS_PER_PAGE = 15

type AutomateAllRecommendationsCardProps = {
    paginatedItems: AIArticleRecommendationItem[]
    isLoading: boolean
    itemsCount: number
    totalItemsCount: number
    statusFilter: AllRecommendationsStatus
    setStatusFilter: (status: AllRecommendationsStatus) => void
    currentPage: number
    onPageChange: (page: number) => void
    displayNewBadge: boolean
    helpCenterId: number
}

const AutomateAllRecommendationsCard = ({
    paginatedItems,
    isLoading,
    itemsCount,
    totalItemsCount,
    statusFilter,
    setStatusFilter,
    currentPage,
    onPageChange,
    displayNewBadge,
    helpCenterId,
}: AutomateAllRecommendationsCardProps) => {
    const pagesCount = Math.ceil(itemsCount / ITEMS_PER_PAGE)

    return (
        <Card className={css.wrapper}>
            <div className={css.titleWrapper}>
                <div className={css.title}>
                    <span>Top questions from customers</span>
                    {!isLoading && displayNewBadge && (
                        <Badge type={ColorType.LightSuccess}>
                            {`${totalItemsCount} `}NEW
                        </Badge>
                    )}
                </div>
                <SelectField
                    fixedWidth
                    style={{width: '160px'}}
                    dropdownMenuClassName={css.dropdownMenu}
                    value={statusFilter}
                    onChange={(value) =>
                        setStatusFilter(value as AllRecommendationsStatus)
                    }
                    options={allRecommendationsStatusOptions}
                    showSelectedOption
                />
            </div>
            {!isLoading && itemsCount === 0 ? (
                <NoDataAvailable
                    className={css.noDataWrapper}
                    title="No data available"
                    description="Try adjusting filters to get results."
                />
            ) : (
                <AutomateAllRecommendationsTable
                    onPageChange={onPageChange}
                    isLoading={isLoading}
                    currentPage={currentPage}
                    pagesCount={pagesCount}
                    pageSize={ITEMS_PER_PAGE}
                    columns={columns}
                    articles={paginatedItems}
                    helpCenterId={helpCenterId}
                />
            )}
        </Card>
    )
}

export default AutomateAllRecommendationsCard
