import React, {useCallback, useEffect, useMemo, useState} from 'react'

import moment from 'moment'
import {ShopifyIntegration} from 'models/integration/types'
import {HelpCenter} from 'models/helpCenter/types'
import {logEvent, SegmentEvent} from 'common/segment'
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
import {useTopQuestionsArticles} from './useTopQuestionsArticles'
import {useTopQuestionsViewedOnPage} from './useTopQuestionsViewedOnPage'

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
    const {articles, isLoading, dismissArticle, createArticle} =
        useTopQuestionsArticles(
            selectedStore.id,
            selectedHelpCenter.id,
            selectedHelpCenter.default_locale || 'en-US'
        )

    const batchDatetime = useMemo(
        () =>
            !isLoading && articles.length > 0
                ? moment(articles[0].batch_datetime).toDate()
                : new Date(),
        [articles, isLoading]
    )

    const viewedOnPage = useTopQuestionsViewedOnPage(
        selectedStore.id,
        selectedHelpCenter.id,
        'automate-overview',
        batchDatetime
    )

    const [topQuestions, setTopQuestions] = useState<
        TopQuestionsSectionProps['topQuestions']
    >([])

    useEffect(() => {
        if (!isLoading && articles) {
            setTopQuestions(
                filteredSortedTopQuestionsFromFetchedArticles(articles)
            )
        }
    }, [isLoading, articles])

    const newQuestionsCount =
        isLoading || viewedOnPage ? undefined : topQuestions.length

    const isSingleStore = !storeFilter || storeFilter.options.length < 2

    const [wasJustReviewed, setWasJustReviewed] = useState(false)

    const onCreateArticle = useCallback(
        async (templateKey: string) => {
            try {
                await createArticle(templateKey)
                logEvent(SegmentEvent.AutomateTopQuestionsSectionCreateArticle)
            } catch (error) {
                console.error(error)
            } finally {
                setWasJustReviewed(true)
            }
        },
        [createArticle]
    )

    const onDismiss = useCallback(
        async (templateKey: string) => {
            try {
                await dismissArticle(templateKey)

                setWasJustReviewed(true)
            } catch (error) {
                console.error(error)
            }
        },
        [dismissArticle]
    )

    if (isSingleStore) {
        if (isLoading || (topQuestions.length === 0 && !wasJustReviewed)) {
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
                    onCreateArticle={onCreateArticle}
                    onDismiss={onDismiss}
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

    if (topQuestions.length === 0 && !wasJustReviewed) {
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
                onCreateArticle={onCreateArticle}
                onDismiss={onDismiss}
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
    } = useTopQuestionsFilters({searchFirstMatchingStoreAndHelpCenter: true})

    const {
        hasEmailToStoreConnection,
        isLoading: isLoadingEmailToStoreConnection,
    } = useHasEmailToStoreConnection(selectedStore?.id)

    if (
        isLoading ||
        isLoadingEmailToStoreConnection ||
        !selectedStore ||
        !selectedHelpCenter
    ) {
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
