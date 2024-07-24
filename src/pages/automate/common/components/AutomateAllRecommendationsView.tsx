import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {Link, useHistory} from 'react-router-dom'
import moment from 'moment'
import StatsPage from 'pages/stats/StatsPage'
import {ShopifyIntegration} from 'models/integration/types'
import {HelpCenter} from 'models/helpCenter/types'
import {
    AllRecommendationsStatus,
    useAIArticleRecommendationItems,
} from '../hooks/useAIArticleRecommendationItems'
import {useLocalStorageTopQuestions} from '../hooks/useLocalStorageTopQuestions'
import AutomateAllRecommendationsCard from './AutomateAllRecommendationsCard'
import {HelpCenterFilter, ShopFilter} from './TopQuestions/TopQuestionsSection'
import css from './AutomateAllRecommendationsView.less'

const ITEMS_PER_PAGE = 15

type AutomateAllRecommendationsViewProps = {
    selectedStore: ShopifyIntegration
    onStoreChange: (store: ShopifyIntegration) => void
    selectedHelpCenter: HelpCenter
    onHelpCenterChange: (helpCenter: HelpCenter) => void
    storeOptions: ShopifyIntegration[]
    helpCentersOptions: HelpCenter[]
    currentPage: number
    onPageChange: (page: number) => void
}

const AutomateAllRecommendationsView = ({
    selectedStore,
    onStoreChange,
    selectedHelpCenter,
    onHelpCenterChange,
    storeOptions,
    helpCentersOptions,
    currentPage,
    onPageChange,
}: AutomateAllRecommendationsViewProps) => {
    const history = useHistory()
    const [statusFilter, setStatusFilter] = useState<AllRecommendationsStatus>(
        AllRecommendationsStatus.NotCreated
    )

    const {
        paginatedItems,
        itemsCount,
        totalItemsCount,
        isLoading,
        batchDatetime,
    } = useAIArticleRecommendationItems({
        storeIntegrationId: selectedStore.id,
        helpCenterId: selectedHelpCenter.id,
        locale: selectedHelpCenter.default_locale,
        statusFilter,
        currentPage,
        itemsPerPage: ITEMS_PER_PAGE,
    })

    const {viewedOnPages, addViewedOnPage} = useLocalStorageTopQuestions(
        selectedStore.id,
        selectedHelpCenter.id,
        moment(batchDatetime).toDate()
    )

    const onLeavePage = useCallback(() => {
        addViewedOnPage('all-recommendations')
    }, [addViewedOnPage])

    useEffect(() => {
        window.addEventListener('beforeunload', onLeavePage)

        return () => {
            window.removeEventListener('beforeunload', onLeavePage)
        }
    }, [onLeavePage])

    useEffect(() => {
        const unlisten = history.listen(onLeavePage)

        return () => {
            unlisten()
        }
    }, [history, onLeavePage])

    const shopFilter = useMemo(
        () =>
            storeOptions.length > 1
                ? {
                      options: storeOptions.map((store) => ({
                          shopName: store.name,
                          shopType: store.type,
                          integrationId: store.id,
                      })),
                      selectedShopIntegrationId: selectedStore.id,
                      setSelectedShopIntegrationId: (integrationId: number) => {
                          const selectedStore = storeOptions.find(
                              (store) => store.id === integrationId
                          )
                          if (selectedStore) {
                              onStoreChange(selectedStore)
                          }
                      },
                  }
                : undefined,
        [storeOptions, selectedStore, onStoreChange]
    )

    const helpCenterFilter = useMemo(
        () =>
            helpCentersOptions.length > 1
                ? {
                      options: helpCentersOptions.map((helpCenter) => ({
                          name: helpCenter.name,
                          helpCenterId: helpCenter.id,
                      })),
                      selectedHelpCenterId: selectedHelpCenter.id,
                      setSelectedHelpCenterId: (helpCenterId: number) => {
                          const selectedHelpCenter = helpCentersOptions.find(
                              (helpCenter) => helpCenter.id === helpCenterId
                          )
                          if (selectedHelpCenter) {
                              onHelpCenterChange(selectedHelpCenter)
                          }
                      },
                  }
                : undefined,
        [helpCentersOptions, selectedHelpCenter.id, onHelpCenterChange]
    )

    return (
        <StatsPage title="Automate">
            <div className={css.wrapper}>
                <div className={css.headerSection}>
                    <div className={css.goBackButtonWrapper}>
                        <i className="material-icons">arrow_back</i>
                        <Link
                            className={css.goBackButton}
                            to={`/app/automation`}
                        >
                            Back To Dashboard
                        </Link>
                    </div>
                    <div className={css.filters}>
                        {shopFilter && (
                            <ShopFilter
                                shopFilter={shopFilter}
                                shopIntegrationId={selectedStore.id}
                            />
                        )}
                        {helpCenterFilter && (
                            <HelpCenterFilter
                                helpCenterFilter={helpCenterFilter}
                                helpCenterId={selectedHelpCenter.id}
                            />
                        )}
                    </div>
                </div>
                <div className={css.title}>
                    <div className={css.titleText}>All Recommendations</div>
                    in the last 90 days
                </div>
                <AutomateAllRecommendationsCard
                    paginatedItems={paginatedItems}
                    isLoading={isLoading}
                    itemsCount={itemsCount}
                    totalItemsCount={totalItemsCount}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    currentPage={currentPage}
                    onPageChange={onPageChange}
                    displayNewBadge={
                        !viewedOnPages.has('all-recommendations') &&
                        totalItemsCount > 0
                    }
                    helpCenterId={selectedHelpCenter.id}
                />
            </div>
        </StatsPage>
    )
}

export default AutomateAllRecommendationsView
