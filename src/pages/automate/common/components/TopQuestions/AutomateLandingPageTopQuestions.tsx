import React, {useMemo} from 'react'

import moment from 'moment'
import {useConditionalGetAIArticles} from 'pages/settings/helpCenter/hooks/useConditionalGetAIArticles'
import {ShopifyIntegration} from 'models/integration/types'
import {HelpCenter} from 'models/helpCenter/types'
import {useTopQuestionsFilters} from './useTopQuestionsFilters'

import css from './AutomateLandingPageTopQuestions.less'
import {
    TopQuestionsSection,
    TopQuestionsSectionAllReviewed,
    TopQuestionsSectionConnectStoreToEmail,
    TopQuestionsSectionLoading,
    TopQuestionsSectionNoRecommendations,
    TopQuestionsSectionProps,
} from './TopQuestionsSection'
import {filteredSortedTopQuestionsFromFetchedArticles} from './utils'
import {useHasEmailToStoreConnection} from './useHasEmailToStoreConnection'
import {useViewedOnPage} from './useViewedOnPage'

type TopQuestionsSectionWithFiltersProps = {
    selectedStore: ShopifyIntegration
    selectedHelpCenter: HelpCenter
    storeFilter: TopQuestionsSectionProps['storeFilter']
    helpCenterFilter: TopQuestionsSectionProps['helpCenterFilter']
}

const TopQuestionsSectionWithFilters = ({
    selectedStore,
    selectedHelpCenter,
    storeFilter,
    helpCenterFilter,
}: TopQuestionsSectionWithFiltersProps) => {
    const {fetchedArticles, isLoading} = useConditionalGetAIArticles({
        helpCenterId: selectedHelpCenter.id,
        storeIntegrationId: selectedStore.id,
        locale: selectedHelpCenter?.default_locale || 'en-US',
    })

    const batchDatetime = useMemo(
        () =>
            !isLoading && fetchedArticles
                ? moment(fetchedArticles[0].batch_datetime).toDate()
                : new Date(),
        [fetchedArticles, isLoading]
    )

    const viewedOnPage = useViewedOnPage(
        selectedStore.id,
        selectedHelpCenter.id,
        batchDatetime,
        'automate-overview'
    )

    const topQuestions = useMemo(
        () => filteredSortedTopQuestionsFromFetchedArticles(fetchedArticles),
        [fetchedArticles]
    )

    const newQuestionsCount = viewedOnPage ? undefined : topQuestions.length

    const isSingleStore = !storeFilter || storeFilter.options.length < 2

    // TODO: this is a placeholder for when we have create article & dismiss article actions
    // we need to remember that the merchant has interacted with the top questions section so that,
    // if there are less than 4 top questions, we keep showing them, not just hide them
    const wasJustReviewed = false

    if (isSingleStore) {
        if (isLoading || (topQuestions.length < 4 && !wasJustReviewed)) {
            return null
        }

        if (topQuestions.length === 0) {
            return (
                <div className={css.topQuestionsWrapper}>
                    <TopQuestionsSectionAllReviewed
                        storeFilter={storeFilter}
                        helpCenterFilter={helpCenterFilter}
                        storeIntegrationId={selectedStore.id}
                        helpCenterId={selectedHelpCenter.id}
                    />
                </div>
            )
        }

        return (
            <div className={css.topQuestionsWrapper}>
                <TopQuestionsSection
                    newQuestionsCount={newQuestionsCount}
                    topQuestions={topQuestions}
                    onCreateArticle={() => {}}
                    onDismiss={() => {}}
                    storeFilter={storeFilter}
                    helpCenterFilter={helpCenterFilter}
                    storeIntegrationId={selectedStore.id}
                    helpCenterId={selectedHelpCenter.id}
                />
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className={css.topQuestionsWrapper}>
                <TopQuestionsSectionLoading
                    storeFilter={storeFilter}
                    helpCenterFilter={helpCenterFilter}
                    storeIntegrationId={selectedStore.id}
                    helpCenterId={selectedHelpCenter.id}
                />
            </div>
        )
    }

    if (topQuestions.length < 4 && !wasJustReviewed) {
        return (
            <div className={css.topQuestionsWrapper}>
                <TopQuestionsSectionNoRecommendations
                    storeFilter={storeFilter}
                    helpCenterFilter={helpCenterFilter}
                    storeIntegrationId={selectedStore.id}
                    helpCenterId={selectedHelpCenter.id}
                />
            </div>
        )
    }

    if (topQuestions.length === 0) {
        return (
            <div className={css.topQuestionsWrapper}>
                <TopQuestionsSectionAllReviewed
                    storeFilter={storeFilter}
                    helpCenterFilter={helpCenterFilter}
                    storeIntegrationId={selectedStore.id}
                    helpCenterId={selectedHelpCenter.id}
                />
            </div>
        )
    }

    return (
        <div className={css.topQuestionsWrapper}>
            <TopQuestionsSection
                newQuestionsCount={newQuestionsCount}
                topQuestions={topQuestions}
                onCreateArticle={() => {}}
                onDismiss={() => {}}
                storeFilter={storeFilter}
                helpCenterFilter={helpCenterFilter}
                storeIntegrationId={selectedStore.id}
                helpCenterId={selectedHelpCenter.id}
            />
        </div>
    )
}

export const AutomateLandingPageTopQuestions = () => {
    const {
        isLoading,
        selectedStore,
        storeFilter,
        selectedHelpCenter,
        helpCenterFilter,
    } = useTopQuestionsFilters({})

    const hasEmailToStoreConnection = useHasEmailToStoreConnection(
        selectedStore?.id
    )

    if (isLoading || !selectedStore || !selectedHelpCenter) {
        return null
    }

    const isMultiStore = storeFilter && storeFilter.options.length > 1

    if (!hasEmailToStoreConnection && isMultiStore) {
        return (
            <div className={css.topQuestionsWrapper}>
                <TopQuestionsSectionConnectStoreToEmail
                    storeFilter={storeFilter}
                    helpCenterFilter={helpCenterFilter}
                    storeIntegrationId={selectedStore.id}
                    helpCenterId={selectedHelpCenter.id}
                />
            </div>
        )
    }

    return (
        <TopQuestionsSectionWithFilters
            selectedStore={selectedStore}
            storeFilter={storeFilter}
            selectedHelpCenter={selectedHelpCenter}
            helpCenterFilter={helpCenterFilter}
        />
    )
}
