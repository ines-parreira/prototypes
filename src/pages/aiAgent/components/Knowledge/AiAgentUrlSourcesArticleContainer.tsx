import { useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {
    CONTENT_TYPE,
    HeaderType,
} from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'
import { AiAgentLayout } from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import { KNOWLEDGE } from 'pages/aiAgent/constants'
import { useGetIngestedUrlArticles } from 'pages/aiAgent/hooks/useGetIngestedUrlArticles'
import { useGetOrCreateSnippetHelpCenter } from 'pages/aiAgent/hooks/useGetOrCreateSnippetHelpCenter'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import AiAgentExternalSourceArticlesView from './AiAgentExternalSourceArticlesView'

import css from '../../AiAgentScrapedDomainContent/AiAgentScrapedDomainQuestionsContainer.less'

// Custom hook wrapper to handle string to number conversion for URL articles
const useGetIngestedUrlArticlesWithStringId = (
    helpCenterId: number,
    ingestionId: string,
) => {
    return useGetIngestedUrlArticles(helpCenterId, parseInt(ingestionId, 10))
}

const AiAgentUrlSourcesArticleContainer = () => {
    const { shopName, articleIngestionId } = useParams<{
        shopName: string
        articleIngestionId: string
    }>()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const { helpCenter } = useGetOrCreateSnippetHelpCenter({
        accountDomain,
        shopName,
    })

    if (!helpCenter || !articleIngestionId) {
        return null
    }

    return (
        <AiAgentLayout
            className={css.container}
            shopName={shopName}
            title={KNOWLEDGE}
        >
            <AiAgentExternalSourceArticlesView
                shopName={shopName}
                helpCenterId={helpCenter.id}
                helpCenter={helpCenter}
                fileIngestionId={articleIngestionId}
                fetchArticles={useGetIngestedUrlArticlesWithStringId}
                headerType={HeaderType.URL}
                pageType={CONTENT_TYPE.URL_QUESTION}
            />
        </AiAgentLayout>
    )
}

export default AiAgentUrlSourcesArticleContainer
