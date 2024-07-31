import React, {useCallback, useEffect} from 'react'
import {useHistory, useLocation} from 'react-router-dom'
import {useSearchParam} from 'hooks/useSearchParam'

import {
    AllRecommendationsStatus,
    isAllRecommendationStatus,
} from '../hooks/useAIArticleRecommendationItems'
import AutomateAllRecommendationsView from './AutomateAllRecommendationsView'
import {useTopQuestionsFilters} from './TopQuestions/useTopQuestionsFilters'

const AutomateAllRecommendationsPage = () => {
    const location = useLocation()
    const history = useHistory()

    const [helpCenterIdParam] = useSearchParam('help_center_id')
    const [storeIntegrationIdParam] = useSearchParam('store_integration_id')

    const initialStoreId = !isNaN(Number(storeIntegrationIdParam))
        ? Number(storeIntegrationIdParam)
        : undefined
    const initialHelpCenterId = !isNaN(Number(helpCenterIdParam))
        ? Number(helpCenterIdParam)
        : undefined

    const {
        isLoading,
        selectedStore,
        storeFilter,
        selectedHelpCenter,
        helpCenterFilter,
    } = useTopQuestionsFilters({initialStoreId, initialHelpCenterId})

    const [page] = useSearchParam('page')
    const currentPage = Number(page) || 1

    const [statusParam] = useSearchParam('status')
    const currentStatus = isAllRecommendationStatus(statusParam)
        ? statusParam
        : AllRecommendationsStatus.NotCreated

    const updateQueryParams = useCallback(
        ({
            store_integration_id,
            help_center_id,
            page,
            status,
        }: {
            help_center_id?: number
            store_integration_id?: number
            page?: number
            status?: AllRecommendationsStatus
        }) => {
            const searchParams = new URLSearchParams(location.search)

            if (store_integration_id !== undefined) {
                searchParams.set(
                    'store_integration_id',
                    String(store_integration_id)
                )
                searchParams.delete('page')
            }
            if (help_center_id !== undefined) {
                searchParams.set('help_center_id', String(help_center_id))
                searchParams.delete('page')
            }
            if (status !== undefined) {
                searchParams.set('status', status)
                searchParams.delete('page')
            }
            if (page !== undefined) {
                searchParams.set('page', String(page))
            }

            history.push({
                pathname: location.pathname,
                search: searchParams.toString(),
            })
        },
        [history, location.pathname, location.search]
    )

    useEffect(() => {
        if (
            selectedStore &&
            (!initialStoreId || initialStoreId !== selectedStore.id)
        ) {
            updateQueryParams({
                store_integration_id: selectedStore.id,
            })
        }
    }, [initialStoreId, selectedStore, updateQueryParams])

    useEffect(() => {
        if (
            selectedHelpCenter &&
            (!initialHelpCenterId ||
                initialHelpCenterId !== selectedHelpCenter.id)
        ) {
            updateQueryParams({help_center_id: selectedHelpCenter.id})
        }
    }, [initialHelpCenterId, selectedHelpCenter, updateQueryParams])

    const onPageChange = (page: number) => {
        if (currentPage !== page) {
            updateQueryParams({page})
        }
    }

    const onStatusChange = (status: AllRecommendationsStatus) => {
        if (status !== currentStatus) {
            updateQueryParams({status})
        }
    }

    if (
        isLoading ||
        !selectedHelpCenter ||
        !selectedStore ||
        !selectedStore ||
        !selectedHelpCenter
    ) {
        return null
    }

    return (
        <AutomateAllRecommendationsView
            selectedStore={selectedStore}
            selectedHelpCenter={selectedHelpCenter}
            storeFilter={storeFilter}
            helpCenterFilter={helpCenterFilter}
            currentStatus={currentStatus}
            onStatusChange={onStatusChange}
            currentPage={currentPage}
            onPageChange={onPageChange}
        />
    )
}

export default AutomateAllRecommendationsPage
