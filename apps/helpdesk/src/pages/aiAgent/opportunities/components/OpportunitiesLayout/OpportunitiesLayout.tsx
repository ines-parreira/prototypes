import { useMemo, useState } from 'react'

import { useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { useAiAgentHelpCenter } from 'pages/aiAgent/hooks/useAiAgentHelpCenter'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { useHelpCenterAIArticlesLibrary } from 'pages/settings/helpCenter/components/AIArticlesLibraryView/hooks/useHelpCenterAIArticlesLibrary'
import { HELP_CENTER_DEFAULT_LOCALE } from 'pages/settings/helpCenter/constants'
import { getViewLanguage } from 'state/ui/helpCenter'

import {
    mapAiArticlesToOpportunities,
    Opportunity,
} from '../../utils/mapAiArticlesToOpportunities'
import { OpportunitiesContent } from '../OpportunitiesContent/OpportunitiesContent'
import { OpportunitiesSidebar } from '../OpportunitiesSidebar/OpportunitiesSidebar'

import css from './OpportunitiesLayout.less'

export const OpportunitiesLayout = () => {
    const { shopName } = useParams<{
        shopName: string
    }>()

    const { storeConfiguration, isLoading: isStoreConfigLoading } =
        useAiAgentStoreConfigurationContext()

    const guidanceHelpCenter = useAiAgentHelpCenter({
        helpCenterType: 'guidance',
        shopName,
    })

    const locale = useAppSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE

    const {
        articles: aiArticles,
        isLoading: isLoadingAiArticles,
        markArticleAsReviewed,
    } = useHelpCenterAIArticlesLibrary(
        storeConfiguration?.helpCenterId ?? 0,
        locale,
        shopName,
    )

    const [selectedOpportunity, setSelectedOpportunity] =
        useState<Opportunity | null>(null)

    const opportunities: Opportunity[] = useMemo(() => {
        if (!storeConfiguration?.helpCenterId) return []
        return mapAiArticlesToOpportunities(aiArticles)
    }, [aiArticles, storeConfiguration?.helpCenterId])

    const selectNextOpportunity = (articleKey: string) => {
        // If the published opportunity was selected, select the next one
        if (selectedOpportunity?.key === articleKey) {
            const remainingOpportunities = opportunities.filter(
                (opp) => opp.key !== articleKey,
            )
            setSelectedOpportunity(remainingOpportunities[0] || null)
        }
    }

    const selectCertainOpportunity = (index: number) => {
        setSelectedOpportunity(opportunities[index])
    }

    const handleArchiveArticle = (articleKey: string) => {
        markArticleAsReviewed(articleKey, 'archive')

        selectNextOpportunity(articleKey)
    }

    const handlePublishArticle = (articleKey: string) => {
        markArticleAsReviewed(articleKey, 'publish')

        selectNextOpportunity(articleKey)
    }

    const isLoading = isStoreConfigLoading || isLoadingAiArticles

    return (
        <div className={css.wrapper} data-ai-opportunities>
            <div className={css.layout}>
                <OpportunitiesSidebar
                    opportunities={opportunities}
                    isLoading={isLoading}
                    onSelectOpportunity={setSelectedOpportunity}
                    selectedOpportunity={selectedOpportunity}
                />
                <OpportunitiesContent
                    key={selectedOpportunity?.key}
                    selectedOpportunity={selectedOpportunity}
                    shopName={shopName}
                    helpCenterId={storeConfiguration?.helpCenterId ?? 0}
                    guidanceHelpCenterId={guidanceHelpCenter?.id ?? 0}
                    onArchive={handleArchiveArticle}
                    onPublish={handlePublishArticle}
                    markArticleAsReviewed={markArticleAsReviewed}
                    opportunities={opportunities}
                    selectCertainOpportunity={selectCertainOpportunity}
                />
            </div>
        </div>
    )
}
