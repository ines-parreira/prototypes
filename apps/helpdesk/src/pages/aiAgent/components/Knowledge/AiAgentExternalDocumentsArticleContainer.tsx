import { useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {
    CONTENT_TYPE,
    HeaderType,
} from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'
import { AiAgentLayout } from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import { KNOWLEDGE } from 'pages/aiAgent/constants'
import { useGetIngestedFileArticles } from 'pages/aiAgent/hooks/useGetIngestedFileArticles'
import { useGetOrCreateSnippetHelpCenter } from 'pages/aiAgent/hooks/useGetOrCreateSnippetHelpCenter'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import AiAgentExternalSourceArticlesView from './AiAgentExternalSourceArticlesView'

import css from '../../AiAgentScrapedDomainContent/AiAgentScrapedDomainQuestionsContainer.less'

const AiAgentExternalDocumentsArticleContainer = () => {
    const { shopName, fileIngestionId } = useParams<{
        shopName: string
        fileIngestionId: string
    }>()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const { helpCenter } = useGetOrCreateSnippetHelpCenter({
        accountDomain,
        shopName,
    })

    if (!helpCenter || !fileIngestionId) {
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
                fileIngestionId={fileIngestionId}
                fetchArticles={useGetIngestedFileArticles}
                headerType={HeaderType.ExternalDocument}
                pageType={CONTENT_TYPE.FILE_QUESTION}
            />
        </AiAgentLayout>
    )
}

export default AiAgentExternalDocumentsArticleContainer
