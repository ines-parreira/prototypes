import React, {useState} from 'react'
import {Link} from 'react-router-dom'
import moment from 'moment'
import {Card} from '@gorgias/analytics-ui-kit'
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
import {useHasEmailToStoreConnection} from './TopQuestions/useHasEmailToStoreConnection'
import {useTopQuestionsViewedOnPage} from './TopQuestions/useTopQuestionsViewedOnPage'

const ITEMS_PER_PAGE = 15

type AutomateAllRecommendationsViewProps = {
    selectedStore: ShopifyIntegration
    selectedHelpCenter: HelpCenter
    currentPage: number
    onPageChange: (page: number) => void
    storeFilter: TopQuestionsSectionProps['storeFilter']
    helpCenterFilter: TopQuestionsSectionProps['helpCenterFilter']
}

const AutomateAllRecommendationsContent = ({
    selectedStore,
    selectedHelpCenter,
    currentPage,
    onPageChange,
}: Pick<
    AutomateAllRecommendationsViewProps,
    'selectedStore' | 'selectedHelpCenter' | 'currentPage' | 'onPageChange'
>) => {
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

    const viewedOnPage = useTopQuestionsViewedOnPage(
        selectedStore.id,
        selectedHelpCenter.id,
        'all-recommendations',
        batchDatetime ? moment(batchDatetime).toDate() : new Date()
    )

    return (
        <AutomateAllRecommendationsCard
            paginatedItems={paginatedItems}
            isLoading={isLoading}
            itemsCount={itemsCount}
            totalItemsCount={totalItemsCount}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            currentPage={currentPage}
            onPageChange={onPageChange}
            displayNewBadge={!isLoading && !viewedOnPage && totalItemsCount > 0}
            helpCenterId={selectedHelpCenter.id}
        />
    )
}

const AutomateConnectEmailToStoreSection = () => (
    <Card className={css.emptySectionCard}>
        <div className={css.emptySectionTitle}>
            Top questions from customers
        </div>
        <div className={css.emptySection}>
            <div className={css.connectToEmail}>
                This store must be connected to an email to receive
                recommendations.
            </div>
            <div className={css.link}>
                <Link to={'/app/settings/channels/email'} target="_blank">
                    Connect store to email
                </Link>
            </div>
        </div>
    </Card>
)

const AutomateAllRecommendationsView = ({
    selectedStore,
    storeFilter,
    selectedHelpCenter,
    helpCenterFilter,
    currentPage,
    onPageChange,
}: AutomateAllRecommendationsViewProps) => {
    const isMultiStore = storeFilter && storeFilter.options.length > 1
    const hasEmailToStoreConnection = useHasEmailToStoreConnection(
        selectedStore?.id
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
                {isMultiStore && !hasEmailToStoreConnection ? (
                    <AutomateConnectEmailToStoreSection />
                ) : (
                    <AutomateAllRecommendationsContent
                        selectedStore={selectedStore}
                        selectedHelpCenter={selectedHelpCenter}
                        currentPage={currentPage}
                        onPageChange={onPageChange}
                    />
                )}
            </div>
        </StatsPage>
    )
}

export default AutomateAllRecommendationsView
