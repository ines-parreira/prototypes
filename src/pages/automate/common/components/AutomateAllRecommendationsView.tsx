import React from 'react'

import moment from 'moment'
import { Link } from 'react-router-dom'

import { Card } from '@gorgias/analytics-ui-kit'

import { HelpCenter } from 'models/helpCenter/types'
import { StoreIntegration } from 'models/integration/types'
import { ArticleOrigin } from 'pages/settings/helpCenter/types/articleOrigin.enum'
import StatsPage from 'pages/stats/StatsPage'

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
import { useTopQuestionsViewedOnPage } from './TopQuestions/useTopQuestionsViewedOnPage'

import css from './AutomateAllRecommendationsView.less'

const ITEMS_PER_PAGE = 15

type AutomateAllRecommendationsViewProps = {
    selectedStore: StoreIntegration
    selectedHelpCenter: HelpCenter
    currentPage: number
    onPageChange: (page: number) => void
    currentStatus: AllRecommendationsStatus
    onStatusChange: (status: AllRecommendationsStatus) => void
    storeFilter: TopQuestionsSectionProps['storeFilter']
    helpCenterFilter: TopQuestionsSectionProps['helpCenterFilter']
    hasEmailToStoreConnection: boolean
}

const AutomateAllRecommendationsContent = ({
    selectedStore,
    selectedHelpCenter,
    currentPage,
    onPageChange,
    currentStatus,
    onStatusChange,
}: Pick<
    AutomateAllRecommendationsViewProps,
    | 'selectedStore'
    | 'selectedHelpCenter'
    | 'currentPage'
    | 'onPageChange'
    | 'currentStatus'
    | 'onStatusChange'
>) => {
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
        statusFilter: currentStatus,
        currentPage,
        itemsPerPage: ITEMS_PER_PAGE,
        origin: ArticleOrigin.ALL_RECOMMENDATIONS_PAGE,
    })

    const viewedOnPage = useTopQuestionsViewedOnPage(
        selectedStore.id,
        selectedHelpCenter.id,
        'all-recommendations',
        batchDatetime ? moment(batchDatetime).toDate() : new Date(),
    )

    return (
        <AutomateAllRecommendationsCard
            paginatedItems={paginatedItems}
            isLoading={isLoading}
            itemsCount={itemsCount}
            totalItemsCount={totalItemsCount}
            statusFilter={currentStatus}
            setStatusFilter={onStatusChange}
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
    currentStatus,
    onStatusChange,
    hasEmailToStoreConnection,
}: AutomateAllRecommendationsViewProps) => {
    const isMultiStore = storeFilter && storeFilter.options.length > 1

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
                        currentStatus={currentStatus}
                        onStatusChange={onStatusChange}
                    />
                )}
            </div>
        </StatsPage>
    )
}

export default AutomateAllRecommendationsView
