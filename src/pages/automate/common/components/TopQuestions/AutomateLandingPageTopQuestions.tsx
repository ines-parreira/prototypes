import React, {useCallback, useEffect, useMemo} from 'react'

import moment from 'moment'
import {useHistory} from 'react-router-dom'
import {useConditionalGetAIArticles} from 'pages/settings/helpCenter/hooks/useConditionalGetAIArticles'
import {NonNullProperties} from 'pages/automate/aiAgent/types'
import {useLocalStorageTopQuestions} from '../../hooks/useLocalStorageTopQuestions'
import {useTopQuestionsFilters} from './useTopQuestionsFilters'

import css from './AutomateLandingPageTopQuestions.less'
import {TopQuestionsSection} from './TopQuestionsSection'
import {filteredSortedTopQuestionsFromFetchedArticles} from './utils'

type TopQuestionsSectionWithFiltersProps = NonNullProperties<
    Omit<ReturnType<typeof useTopQuestionsFilters>, 'isLoading'>
>

const TopQuestionsSectionWithFilters = ({
    selectedStore,
    setSelectedStore,
    selectedHelpCenter,
    setSelectedHelpCenter,
    storeOptions,
    helpCentersOptions,
}: TopQuestionsSectionWithFiltersProps) => {
    const history = useHistory()

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

    const {viewedOnPages, addViewedOnPage} = useLocalStorageTopQuestions(
        selectedStore.id,
        selectedHelpCenter.id,
        batchDatetime
    )

    const onLeavePage = useCallback(() => {
        addViewedOnPage('automate-overview')
    }, [addViewedOnPage])

    useEffect(() => {
        const unlisten = history.listen(onLeavePage)
        window.addEventListener('beforeunload', onLeavePage)

        return () => {
            unlisten()
            window.removeEventListener('beforeunload', onLeavePage)
        }
    }, [history, onLeavePage])

    useEffect(() => history.listen(onLeavePage), [history, onLeavePage])

    const topQuestions = useMemo(
        () => filteredSortedTopQuestionsFromFetchedArticles(fetchedArticles),
        [fetchedArticles]
    )

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
                              setSelectedStore(selectedStore)
                          }
                      },
                  }
                : undefined,
        [storeOptions, selectedStore, setSelectedStore]
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
                              setSelectedHelpCenter(selectedHelpCenter)
                          }
                      },
                  }
                : undefined,
        [helpCentersOptions, selectedHelpCenter, setSelectedHelpCenter]
    )

    if (isLoading || !fetchedArticles || fetchedArticles.length < 4) {
        return null
    }

    return (
        <div className={css.topQuestionsWrapper}>
            <TopQuestionsSection
                newQuestionsCount={
                    viewedOnPages.has('automate-overview')
                        ? undefined
                        : topQuestions.length
                }
                topQuestions={topQuestions}
                onCreateArticle={() => {}}
                onDismiss={() => {}}
                shopFilter={shopFilter}
                helpCenterFilter={helpCenterFilter}
                shopIntegrationId={selectedStore.id}
                helpCenterId={selectedHelpCenter.id}
            />
        </div>
    )
}

export const AutomateLandingPageTopQuestions = () => {
    const {
        isLoading,
        selectedStore,
        setSelectedStore,
        selectedHelpCenter,
        setSelectedHelpCenter,
        storeOptions,
        helpCentersOptions,
    } = useTopQuestionsFilters({})

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
        <TopQuestionsSectionWithFilters
            selectedStore={selectedStore}
            setSelectedStore={setSelectedStore}
            selectedHelpCenter={selectedHelpCenter}
            setSelectedHelpCenter={setSelectedHelpCenter}
            storeOptions={storeOptions}
            helpCentersOptions={helpCentersOptions}
        />
    )
}
