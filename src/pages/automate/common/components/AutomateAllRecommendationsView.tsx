import React, {useState} from 'react'
import {LocaleCode} from 'models/helpCenter/types'
import {
    AllRecommendationsStatus,
    useAIArticleRecommendationItems,
} from '../hooks/useAIArticleRecommendationItems'
import AutomateAllRecommendationsCard from './AutomateAllRecommendationsCard'

const ITEMS_PER_PAGE = 15

type AutomateAllRecommendationsViewProps = {
    helpCenterId: number
    storeIntegrationId: number
    locale: LocaleCode
}

const AutomateAllRecomendationsView = ({
    helpCenterId,
    storeIntegrationId,
    locale,
}: AutomateAllRecommendationsViewProps) => {
    const [currentPage, setCurrentPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState<AllRecommendationsStatus>(
        AllRecommendationsStatus.NotCreated
    )

    const onPageChange = (page: number) => {
        if (currentPage !== page) {
            setCurrentPage(page)
        }
    }

    const {paginatedItems, itemsCount, isLoading} =
        useAIArticleRecommendationItems({
            helpCenterId,
            storeIntegrationId,
            locale,
            statusFilter,
            currentPage,
            itemsPerPage: ITEMS_PER_PAGE,
        })

    return (
        <AutomateAllRecommendationsCard
            paginatedItems={paginatedItems}
            isLoading={isLoading}
            itemsCount={itemsCount}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onPageChange={onPageChange}
        />
    )
}

export default AutomateAllRecomendationsView
