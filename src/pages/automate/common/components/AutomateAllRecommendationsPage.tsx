import React, {useCallback, useEffect} from 'react'
import {useHistory, useLocation} from 'react-router-dom'
import {useSearchParam} from 'hooks/useSearchParam'
import {ShopifyIntegration} from 'models/integration/types'
import {HelpCenter} from 'models/helpCenter/types'
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
        setSelectedStore,
        selectedHelpCenter,
        setSelectedHelpCenter,
        storeOptions,
        helpCentersOptions,
    } = useTopQuestionsFilters({initialStoreId, initialHelpCenterId})

    const [page] = useSearchParam('page')
    const currentPage = Number(page) || 1

    const updateQueryParams = useCallback(
        (params) => {
            const searchParams = new URLSearchParams(location.search)
            Object.entries(params).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    searchParams.set(key, String(value))
                } else {
                    searchParams.delete(key)
                }
            })
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

    const onStoreChange = (store: ShopifyIntegration) => {
        if (selectedStore !== store) {
            setSelectedStore(store)
            updateQueryParams({
                store_integration_id: store.id,
            })
        }
    }

    const onHelpCenterChange = (helpCenter: HelpCenter) => {
        if (selectedHelpCenter !== helpCenter) {
            setSelectedHelpCenter(helpCenter)
            updateQueryParams({
                help_center_id: helpCenter.id,
            })
        }
    }

    const onPageChange = (page: number) => {
        if (currentPage !== page) {
            updateQueryParams({page})
        }
    }

    if (
        isLoading ||
        !storeOptions ||
        !helpCentersOptions ||
        !selectedStore ||
        !selectedHelpCenter
    ) {
        return null
    }

    return (
        <AutomateAllRecommendationsView
            selectedStore={selectedStore}
            onStoreChange={onStoreChange}
            selectedHelpCenter={selectedHelpCenter}
            onHelpCenterChange={onHelpCenterChange}
            storeOptions={storeOptions}
            helpCentersOptions={helpCentersOptions}
            currentPage={currentPage}
            onPageChange={onPageChange}
        />
    )
}

export default AutomateAllRecommendationsPage
