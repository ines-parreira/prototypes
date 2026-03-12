import type { GetArticleVersionStatus } from '@gorgias/help-center-types'

import {
    useGetArticleTranslationVersion,
    useGetHelpCenterArticle,
} from 'models/helpCenter/queries'

import { useFaqHelpCenterData } from './useFaqHelpCenterData'

type UseKnowledgeEditorArticleDataParams = {
    helpCenterId: number
    articleId: number
    versionStatus: GetArticleVersionStatus
    initialVersionId?: number
    isOpen?: boolean
    isExisting: boolean
}

export const useKnowledgeEditorArticleData = ({
    helpCenterId,
    articleId,
    versionStatus,
    initialVersionId,
    isOpen = true,
    isExisting,
}: UseKnowledgeEditorArticleDataParams) => {
    const {
        helpCenter,
        categories,
        locales,
        isLoading: isHelpCenterDataLoading,
    } = useFaqHelpCenterData(helpCenterId, isOpen)

    const locale = helpCenter?.default_locale ?? 'en-US'

    const {
        data: article,
        isLoading: isArticleLoading,
        isError: isArticleError,
        error: articleError,
    } = useGetHelpCenterArticle(
        articleId,
        helpCenter?.id ?? 0,
        locale,
        versionStatus,
        {
            enabled: isOpen && isExisting && !!helpCenter && articleId > 0,
            throwOn404: true,
            refetchOnWindowFocus: false,
        },
    )

    const {
        data: initialVersionData,
        isLoading: isVersionQueryLoading,
        isError: isInitialVersionError,
    } = useGetArticleTranslationVersion(
        {
            help_center_id: helpCenter?.id ?? 0,
            article_id: articleId,
            locale,
            version_id: initialVersionId ?? 0,
        },
        {
            enabled: !!initialVersionId && !!helpCenter?.id && !!article,
            staleTime: 10 * 60 * 1000,
            refetchOnWindowFocus: false,
        },
    )

    const isCurrentVersion =
        !!initialVersionData &&
        (article?.translation?.published_version_id === initialVersionData.id ||
            article?.translation?.draft_version_id === initialVersionData.id)

    return {
        helpCenter,
        categories,
        locales,
        isHelpCenterDataLoading,
        article,
        isArticleLoading,
        isArticleError,
        articleError,
        initialVersionData: isCurrentVersion ? undefined : initialVersionData,
        isInitialVersionLoading: !!initialVersionId && isVersionQueryLoading,
        isInitialVersionError,
    }
}
