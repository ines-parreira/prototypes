import {Dispatch, SetStateAction} from 'react'

import {AIArticle, HelpCenter} from 'models/helpCenter/types'
import {StoreIntegration} from 'models/integration/types'
import {sortAIArticlesByTicketsCount} from 'pages/settings/helpCenter/components/AIArticlesLibraryView/AIArticlesLibraryUtils'
import {useGetAIArticles} from 'pages/settings/helpCenter/hooks/useGetAIArticles'

import {TopQuestion, TopQuestionsSectionProps} from './TopQuestionsSection'

type FetchedArticles = ReturnType<typeof useGetAIArticles>['fetchedArticles']

export const isAIArticleWithoutReviewAction = (article: AIArticle): boolean =>
    article.review_action === undefined

const topQuestionFromAIArticle = (article: AIArticle): TopQuestion => ({
    title: article.title,
    templateKey: article.key,
    ticketsCount: article.related_tickets_count ?? 0,
    reviewAction: article.review_action,
})

export const filteredSortedTopQuestionsFromFetchedArticles = (
    fetchedArticles: FetchedArticles
): TopQuestionsSectionProps['topQuestions'] => {
    if (!fetchedArticles) {
        return []
    }

    return sortAIArticlesByTicketsCount([...fetchedArticles])
        .filter(isAIArticleWithoutReviewAction)
        .map(topQuestionFromAIArticle)
}

export const makeStoreFilter = (
    stores: StoreIntegration[],
    setSelectedStore: Dispatch<SetStateAction<StoreIntegration | undefined>>
): TopQuestionsSectionProps['storeFilter'] =>
    stores.length > 1
        ? {
              options: stores.map((store) => ({
                  shopName: store.name,
                  shopType: store.type,
                  integrationId: store.id,
              })),
              setSelectedStoreIntegrationId: (integrationId: number) => {
                  const selectedStore = stores.find(
                      (store) => store.id === integrationId
                  )
                  if (selectedStore) {
                      setSelectedStore(selectedStore)
                  }
              },
          }
        : undefined

export const makeHelpCenterFilter = (
    helpCenters: HelpCenter[],
    setSelectedHelpCenter: Dispatch<SetStateAction<HelpCenter | undefined>>
): TopQuestionsSectionProps['helpCenterFilter'] =>
    helpCenters.length > 1
        ? {
              options: helpCenters.map((helpCenter) => ({
                  name: helpCenter.name,
                  helpCenterId: helpCenter.id,
              })),
              setSelectedHelpCenterId: (helpCenterId: number) => {
                  const selectedHelpCenter = helpCenters.find(
                      ({id}) => id === helpCenterId
                  )

                  if (selectedHelpCenter) {
                      setSelectedHelpCenter(selectedHelpCenter)
                  }
              },
          }
        : undefined
