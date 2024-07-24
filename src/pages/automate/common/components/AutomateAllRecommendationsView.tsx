import React, {useState} from 'react'
import {Link} from 'react-router-dom'
import moment from 'moment'
import StatsPage from 'pages/stats/StatsPage'
import {ShopifyIntegration} from 'models/integration/types'
import {HelpCenter} from 'models/helpCenter/types'
import {
    AllRecommendationsStatus,
    useAIArticleRecommendationItems,
} from '../hooks/useAIArticleRecommendationItems'
import AutomateAllRecommendationsCard from './AutomateAllRecommendationsCard'
import {
    HelpCenterFilter,
    StoreFilter,
    TopQuestionsSectionProps,
} from './TopQuestions/TopQuestionsSection'
import css from './AutomateAllRecommendationsView.less'
import {useViewedOnPage} from './TopQuestions/useViewedOnPage'

const ITEMS_PER_PAGE = 15

type AutomateAllRecommendationsViewProps = {
    selectedStore: ShopifyIntegration
    selectedHelpCenter: HelpCenter
    currentPage: number
    onPageChange: (page: number) => void
    storeFilter: TopQuestionsSectionProps['storeFilter']
    helpCenterFilter: TopQuestionsSectionProps['helpCenterFilter']
}

const AutomateAllRecommendationsView = ({
    selectedStore,
    storeFilter,
    selectedHelpCenter,
    helpCenterFilter,
    currentPage,
    onPageChange,
}: AutomateAllRecommendationsViewProps) => {
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

    const viewedOnPage = useViewedOnPage(
        selectedStore.id,
        selectedHelpCenter.id,
        batchDatetime ? moment(batchDatetime).toDate() : new Date(),
        'all-recommendations'
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
                        {storeFilter && (
                            <StoreFilter
                                storeFilter={storeFilter}
                                storeIntegrationId={selectedStore.id}
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
                    displayNewBadge={!viewedOnPage && totalItemsCount > 0}
                    helpCenterId={selectedHelpCenter.id}
                />
            </div>
        </StatsPage>
    )
}

export default AutomateAllRecommendationsView
