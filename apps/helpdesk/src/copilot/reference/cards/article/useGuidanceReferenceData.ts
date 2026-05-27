import { useAiAgentHelpCenter } from 'pages/aiAgent/hooks/useAiAgentHelpCenter'
import { useGuidanceArticle } from 'pages/aiAgent/hooks/useGuidanceArticle'

type Params = {
    shopName: string
    articleId: number
    enabled: boolean
}

/**
 * Two-step fetch shared by guidance and skill reference cards:
 *   1. Look up the (cached) guidance help-center for the shop
 *   2. Once we have the help-center id, fetch the article itself
 *
 * Both calls are no-ops until `enabled` is true so the popover only fires
 * network requests on first hover/focus.
 */
export function useGuidanceReferenceData({
    shopName,
    articleId,
    enabled,
}: Params) {
    const helpCenter = useAiAgentHelpCenter({
        shopName,
        helpCenterType: 'guidance',
        enabled,
    })

    const { guidanceArticle, isGuidanceArticleLoading, isError } =
        useGuidanceArticle({
            guidanceHelpCenterId: helpCenter?.id ?? 0,
            guidanceArticleId: articleId,
            locale: helpCenter?.default_locale ?? 'en-US',
            versionStatus: 'latest_draft',
            enabled: enabled && !!helpCenter?.id,
        })

    return {
        article: guidanceArticle,
        isLoading: enabled && (!helpCenter || isGuidanceArticleLoading),
        isError,
    }
}
