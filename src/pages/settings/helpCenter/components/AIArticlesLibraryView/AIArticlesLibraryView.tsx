import React, {useRef} from 'react'
import {ErrorBoundary} from 'pages/ErrorBoundary'
import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'
import {getViewLanguage} from 'state/ui/helpCenter'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {
    AIArticle,
    ArticleTemplateReviewAction,
    ArticleTemplateType,
    HelpCenterArticleItem,
} from 'models/helpCenter/types'
import {useCreateArticleUsingTemplate} from '../../hooks/useCreateArticleUsingTemplate'
import useCurrentHelpCenter from '../../hooks/useCurrentHelpCenter'
import HelpCenterPageWrapper from '../HelpCenterPageWrapper'
import {useGetAIArticles, useReviewArticleTemplate} from '../../queries'
import {HELP_CENTER_DEFAULT_LOCALE} from '../../constants'
import LibrarySkeleton from './components/AIArticlesLibrarySkeleton/AIArticlesLibrarySkeleton'
import AIArticlesLibraryList from './components/AIArticlesLibraryList'

import AIArticlesLibraryPreview from './components/AIArticlesLibraryPreview'
import {useHelpCenterAIArticlesLibrary} from './hooks/useHelpCenterAIArticlesLibrary'
import AIArticleArchiveModal, {
    AIArticleArchiveModalHandle,
} from './components/AIArticleArchiveModal/AIArticleArchiveModal'

import css from './AIArticlesLibraryView.less'

const AIArticlesLibraryView = () => {
    const helpCenter = useCurrentHelpCenter()
    const locale = useAppSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE
    const archiveModal = useRef<AIArticleArchiveModalHandle>(null)

    const appDispatch = useAppDispatch()

    const {data: fetchedArticles, isLoading} = useGetAIArticles(
        helpCenter.id,
        locale,
        {
            refetchOnWindowFocus: false,
        }
    )

    const {
        articles,
        counters,
        selectedArticle,
        setSelectedArticle,
        selectedArticleType,
        setSelectedArticleType,
        showLinkToArticleTemplates,
        markArticleAsReviewed,
    } = useHelpCenterAIArticlesLibrary(fetchedArticles)

    const {createArticle} = useCreateArticleUsingTemplate(helpCenter)

    const reviewArticle = useReviewArticleTemplate({
        onSuccess: (__data, [__client, __pathParameters, body]) => {
            const successMessages: Record<ArticleTemplateReviewAction, string> =
                {
                    publish:
                        'Article published and added to your ‘Articles’ tab.',
                    saveAsDraft:
                        'Article saved as a draft and added to your ‘Articles’ tab.',
                    archive: 'Article archived.',
                }

            void appDispatch(
                notify({
                    message: successMessages[body.action],
                    status: NotificationStatus.Success,
                })
            )

            markArticleAsReviewed(body.template_key, body.action)

            if (body.action !== 'archive') {
                const article = articles.find(
                    (article) => article.key === body.template_key
                )

                if (!article) return

                const replaceNewLines = (
                    input: string | undefined
                ): string | undefined => input?.replace(/\\n/g, '')

                const articleTemplate: HelpCenterArticleItem = {
                    ...article,
                    content: replaceNewLines(article.html_content),
                    type: ArticleTemplateType.AI,
                }

                const shouldPublish = body.action === 'publish'

                void createArticle(articleTemplate, shouldPublish)
            }
        },
        onError: (__error, [__client, __pathParameters, body]) => {
            const errorActions: Record<ArticleTemplateReviewAction, string> = {
                publish: 'published',
                saveAsDraft: 'saved as draft',
                archive: 'archived',
            }

            void appDispatch(
                notify({
                    message: `Article could not be ${
                        errorActions[body.action]
                    }.`,
                    status: NotificationStatus.Error,
                })
            )
        },
    })

    const onArchive = (article: AIArticle, reason: string | undefined) => {
        return reviewArticle.mutate([
            undefined,
            {help_center_id: helpCenter.id},
            {action: 'archive', template_key: article.key, reason},
        ])
    }

    const onPublish = (article: AIArticle) => {
        return reviewArticle.mutate([
            undefined,
            {help_center_id: helpCenter.id},
            {action: 'publish', template_key: article.key},
        ])
    }

    /** 
     * Use later through modal
    const onSaveAsDraft = (article: AIArticle) => {
        return reviewArticle.mutate([
            undefined,
            {help_center_id: helpCenter.id},
            {action: 'saveAsDraft', template_key: article.key},
        ])
    }
    */

    const onStartArchive = (article: AIArticle) => {
        archiveModal.current?.open(article)
    }

    return (
        <>
            <HelpCenterPageWrapper
                helpCenter={helpCenter}
                isDirty={false}
                fluidContainer={false}
                pageWrapperClassName={css.pageWrapper}
            >
                <div className={css.wrapper}>
                    {isLoading ? (
                        <LibrarySkeleton />
                    ) : (
                        <div className={css.container}>
                            <AIArticlesLibraryList
                                articles={articles}
                                counters={counters}
                                selectedArticle={selectedArticle}
                                setSelectedArticle={setSelectedArticle}
                                selectedArticleType={selectedArticleType}
                                setSelectedArticleType={setSelectedArticleType}
                                showLinkToArticleTemplates={
                                    showLinkToArticleTemplates
                                }
                                helpCenterId={helpCenter.id}
                            />
                            <AIArticlesLibraryPreview
                                onArchive={onStartArchive}
                                onPublish={onPublish}
                                onEdit={() => ({})}
                                article={selectedArticle}
                            />
                        </div>
                    )}
                </div>
            </HelpCenterPageWrapper>
            <AIArticleArchiveModal ref={archiveModal} onArchive={onArchive} />
        </>
    )
}

const AIArticlesLibraryViewWithErrorBoundary = () => (
    <ErrorBoundary
        sentryTags={{
            section: 'help-center-ai-library',
            team: 'automate-obs',
        }}
    >
        <AIArticlesLibraryView />
    </ErrorBoundary>
)

export default AIArticlesLibraryViewWithErrorBoundary
