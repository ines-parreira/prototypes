import { useRef } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import useAppDispatch from 'hooks/useAppDispatch'
import type {
    AIArticle,
    AILibraryArticleItem,
    ArticleTemplateReviewAction,
    CustomerVisibility,
    HelpCenter,
} from 'models/helpCenter/types'
import { useKnowledgeTracking } from 'pages/aiAgent/hooks/useKnowledgeTracking'
import { useCreateAIArticle } from 'pages/settings/helpCenter/hooks/useCreateAIArticle'
import { useEditionManager } from 'pages/settings/helpCenter/providers/EditionManagerContext'
import {
    aiArticleKeys,
    useUpsertArticleTemplateReview,
} from 'pages/settings/helpCenter/queries'
import { ArticleOrigin } from 'pages/settings/helpCenter/types/articleOrigin.enum'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import type { AIArticleArchiveModalHandle } from '../components/AIArticleArchiveModal/AIArticleArchiveModal'

export type onEditorSaveProps = {
    article?: AILibraryArticleItem
    title: string
    content: string
    saveAsDraft: boolean
    categoryId: number | null
    customerVisibility: CustomerVisibility
}

const useAILibraryActions = (
    helpCenter: HelpCenter,
    articles: AILibraryArticleItem[],
    markArticleAsReviewed: (
        templateKey: string,
        reviewAction:
            | 'publish'
            | 'archive'
            | 'saveAsDraft'
            | 'dismissFromTopQuestions',
    ) => void,
) => {
    const { createArticle } = useCreateAIArticle(
        helpCenter.id,
        helpCenter.default_locale,
    )
    const { onKnowledgeContentCreated } = useKnowledgeTracking({
        shopName: helpCenter.shop_name || '',
    })
    const queryClient = useQueryClient()
    const appDispatch = useAppDispatch()

    const editorPayloadDetails = useRef<{
        title: string
        content: string
        saveAsDraft: boolean
        categoryId: number | null
        customerVisibility: CustomerVisibility
    } | null>(null)

    const reviewArticle = useUpsertArticleTemplateReview({
        onSuccess: async (__data, [__client, __pathParameters, body]) => {
            const successMessages: Record<ArticleTemplateReviewAction, string> =
                {
                    publish:
                        'Article published and added to your ‘Articles’ tab.',
                    saveAsDraft:
                        'Article saved as a draft and added to your ‘Articles’ tab.',
                    archive: 'Article archived.',
                    dismissFromTopQuestions:
                        'Article dismissed from Top Questions section',
                }

            void appDispatch(
                notify({
                    message: successMessages[body.action],
                    status: NotificationStatus.Success,
                }),
            )

            await queryClient.invalidateQueries(
                aiArticleKeys.list(helpCenter.id),
            )

            markArticleAsReviewed(body.template_key, body.action)

            if (body.action === 'archive') {
                return
            }

            const article = articles.find(
                (article) => article.key === body.template_key,
            )

            if (!article) return

            const articleTemplate = {
                ...article,
                title: editorPayloadDetails.current?.title || article.title,
                html_content:
                    editorPayloadDetails.current?.content ||
                    article.html_content,
            }

            void createArticle({
                articleTemplate,
                customerVisibility:
                    editorPayloadDetails.current?.customerVisibility ||
                    'PUBLIC',
                categoryId: editorPayloadDetails.current?.categoryId || null,
                publish: !editorPayloadDetails.current?.saveAsDraft,
                origin: ArticleOrigin.AI_LIBRARY_TAB,
            })

            onKnowledgeContentCreated({
                type: 'help-center-article',
                createdFrom: 'ai-library-tab',
                createdHow: 'from-ai',
            })

            editorPayloadDetails.current = null
        },
        onError: (__error, [__client, __pathParameters, body]) => {
            const errorActions: Record<ArticleTemplateReviewAction, string> = {
                publish: 'published',
                saveAsDraft: 'saved as draft',
                archive: 'archived',
                dismissFromTopQuestions: 'dismissed from Top Questions',
            }

            void appDispatch(
                notify({
                    message: `Article could not be ${
                        errorActions[body.action]
                    }.`,
                    status: NotificationStatus.Error,
                }),
            )
        },
    })

    const { setEditModal, editModal } = useEditionManager()

    const onEdit = () => {
        setEditModal({
            isOpened: true,
            view: null,
        })
    }

    const isEditModalOpen = editModal.isOpened

    const onEditorClose = () => {
        setEditModal({
            view: null,
            isOpened: false,
        })
    }

    const archiveModal = useRef<AIArticleArchiveModalHandle>(null)

    const onStartArchive = (article: AIArticle) => {
        archiveModal.current?.open(article)
    }

    const onArchive = (article: AIArticle, reason: string | undefined) => {
        return reviewArticle.mutate([
            undefined,
            { help_center_id: helpCenter.id },
            {
                action: 'archive',
                template_key: article.key,
                reason: reason?.length ? reason : null,
            },
        ])
    }

    const onPublish = (article: AIArticle) => {
        editorPayloadDetails.current = {
            title: article.title,
            content: article.html_content,
            saveAsDraft: false,
            categoryId: null,
            customerVisibility: 'PUBLIC',
        }

        return reviewArticle.mutate([
            undefined,
            { help_center_id: helpCenter.id },
            { action: 'publish', template_key: article.key },
        ])
    }

    const onEditorSave = ({
        article,
        title,
        content,
        saveAsDraft,
        categoryId,
        customerVisibility,
    }: onEditorSaveProps) => {
        editorPayloadDetails.current = {
            title,
            content,
            saveAsDraft,
            categoryId,
            customerVisibility,
        }

        onEditorClose()

        return reviewArticle.mutate([
            undefined,
            { help_center_id: helpCenter.id },
            {
                action: saveAsDraft ? 'saveAsDraft' : 'publish',
                template_key: article!.key,
            },
        ])
    }

    return {
        onEdit,
        onEditorClose,
        onStartArchive,
        archiveModal,
        onArchive,
        onPublish,
        onEditorSave,
        isEditModalOpen,
    }
}

export default useAILibraryActions
