import { Card } from '@gorgias/analytics-ui-kit'
import { Badge } from '@gorgias/axiom'

import { NoDataAvailable } from 'domains/reporting/pages/common/components/NoDataAvailable'
import type { TooltipData } from 'domains/reporting/pages/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'

import type { AIArticleRecommendationItem } from '../hooks/useAIArticleRecommendationItems'
import { AllRecommendationsStatus } from '../hooks/useAIArticleRecommendationItems'
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

/**
 * @deprecated This component is outdated and not used anymore. Do not add any new usage of this component.
 * @date 2025-10-02
 * @type automate-deprecation
 */
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
                        <Badge type={'light-success'}>
                            {`${totalItemsCount} `}NEW
                        </Badge>
                    )}
                </div>
                {!isLoading && totalItemsCount > 0 && (
                    <SelectField
                        fixedWidth
                        style={{ width: '160px' }}
                        dropdownMenuClassName={css.dropdownMenu}
                        value={statusFilter}
                        onChange={(value) =>
                            setStatusFilter(value as AllRecommendationsStatus)
                        }
                        options={allRecommendationsStatusOptions}
                        showSelectedOption
                    />
                )}
            </div>
            {!isLoading && totalItemsCount <= 0 ? (
                <div className={css.noRecommendations}>
                    You have no recommendations for this store yet.
                </div>
            ) : !isLoading && itemsCount <= 0 ? (
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
