import { useCallback, useEffect, useMemo, useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { useQueryClient } from '@tanstack/react-query'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import useFlag from 'core/flags/hooks/useFlag'
import { AI_AGENT_OUTCOME_DISPLAY_LABELS } from 'domains/reporting/hooks/automate/types'
import { useNotify } from 'hooks/useNotify'
import {
    helpCenterArticleKeys,
    useCreateArticleTranslation,
    useDeleteArticle,
    useDeleteArticleTranslation,
    useGetHelpCenterArticle,
    useUpdateArticleTranslation,
} from 'models/helpCenter/queries'
import type {
    ArticleWithLocalTranslation,
    Category,
    HelpCenter,
    Locale,
    LocaleCode,
    UpdateArticleTranslationDto,
} from 'models/helpCenter/types'
import type {
    ActionType as LocaleActionType,
    OptionItem,
} from 'pages/settings/helpCenter/components/articles/ArticleLanguageSelect'
import { slugify } from 'pages/settings/helpCenter/utils/helpCenter.utils'

import { KnowledgeEditorSidePanelHelpCenterArticle } from '../KnowledgeEditorSidePanel/KnowledgeEditorSidePanelHelpCenterArticle/KnowledgeEditorSidePanelHelpCenterArticle'
import {
    defaultProps as defaultTopBarProps,
    KnowledgeEditorTopBar,
} from '../KnowledgeEditorTopBar/KnowledgeEditorTopBar'
import type { ArticleMode } from '../KnowledgeEditorTopBar/KnowledgeEditorTopBarHelpCenterArticlesControls'
import {
    ArticleModes,
    KnowledgeEditorTopBarHelpCenterArticlesControls,
} from '../KnowledgeEditorTopBar/KnowledgeEditorTopBarHelpCenterArticlesControls'
import { useKnowledgeEditorHelpCenterArticleDetails } from './hooks/useKnowledgeEditorHelpCenterArticleDetails'
import { useKnowledgeEditorHelpCenterArticleModal } from './hooks/useKnowledgeEditorHelpCenterArticleModal'
import { useKnowledgeEditorHelpCenterArticleMode } from './hooks/useKnowledgeEditorHelpCenterArticleMode'
import { useKnowledgeEditorHelpCenterArticleSettings } from './hooks/useKnowledgeEditorHelpCenterArticleSettings'
import { KnowledgeEditorHelpCenterArticleEditView } from './KnowledgeEditorHelpCenterArticleEditView'
import { KnowledgeEditorHelpCenterArticleReadView } from './KnowledgeEditorHelpCenterArticleReadView'
import { KnowledgeEditorHelpCenterArticleUnsavedChangesModal } from './KnowledgeEditorHelpCenterArticleUnsavedChangesModal'
import type { ArticleState } from './KnowledgeEditorHelpCenterExistingArticle.utils'
import {
    editModeFromVisibilityStatus,
    mergeResponseContentAndTitleInArticle,
    mergeResponseSettingsInArticle,
    newTranslation,
} from './KnowledgeEditorHelpCenterExistingArticle.utils'
import { KnowledgeEditorHelpCenterExistingArticleDeleteModal } from './KnowledgeEditorHelpCenterExistingArticleDeleteModal'

import css from './KnowledgeEditorHelpCenterArticle.less'

export enum InitialArticleMode {
    READ = 'read',
    EDIT = 'edit',
}

type Props = {
    helpCenter: HelpCenter
    supportedLocales: Locale[]
    categories: Category[]
    onClickPrevious: () => void
    onClickNext: () => void
    onClose: () => void
    onUpdated?: () => void
    onDeleted?: () => void
    initialArticleMode: InitialArticleMode
    isFullscreen: boolean
    onToggleFullscreen: () => void
    onTest: () => void
}

const KnowledgeEditorHelpCenterExistingArticleLoaded = (
    props: Props & { article: ArticleWithLocalTranslation },
) => {
    const { error: notifyError } = useNotify()
    const queryClient = useQueryClient()
    const isPerformanceStatsEnabled = useFlag(
        FeatureFlagKey.PerformanceStatsOnIndividualKnowledge,
    )

    const { modal, openUnsavedChangesModal, openConfirmDeleteModal } =
        useKnowledgeEditorHelpCenterArticleModal()

    const [locale, setLocale] = useState<LocaleCode>(
        props.article.translation.locale,
    )
    const [isDetailsView, setIsDetailsView] = useState(true)
    const onToggleDetailsView = useCallback(() => {
        setIsDetailsView(!isDetailsView)
    }, [isDetailsView])

    const getArticle = useGetHelpCenterArticle(
        props.article.id,
        props.helpCenter.id,
        locale,
    )

    const [article, setArticle] = useState<ArticleState>({
        ...props.article,
        translationMode: 'existing',
    })

    useEffect(() => {
        if (!getArticle.isLoading && locale !== article.translation.locale) {
            const translationMode = getArticle.data?.translation
                ? 'existing'
                : 'new'

            setArticle((prev) => ({
                ...prev,
                ...getArticle.data,
                translation:
                    getArticle.data?.translation ??
                    newTranslation(article, locale),
                translationMode,
            }))

            if (translationMode === 'new') {
                setModeType(ArticleModes.EDIT_PUBLISHED)
            }
        }
    }, [getArticle.data, getArticle.isLoading, article, locale])

    const deleteArticle = useDeleteArticle()
    const createArticleTranslation = useCreateArticleTranslation()
    const updateArticleTranslation = useUpdateArticleTranslation()
    const deleteArticleTranslation = useDeleteArticleTranslation()

    const upsertArticleContentAndTitle = useCallback(
        async (publish: boolean) => {
            try {
                if (article.translationMode === 'new') {
                    const response = await createArticleTranslation.mutateAsync(
                        [
                            undefined,
                            {
                                help_center_id: props.helpCenter.id,
                                article_id: props.article.id,
                            },
                            {
                                locale,
                                title: article.translation.title,
                                excerpt: article.translation.content,
                                content: article.translation.content,
                                slug: slugify(article.translation.title),
                                seo_meta: {
                                    title: article.translation.seo_meta.title,
                                    description:
                                        article.translation.seo_meta
                                            .description,
                                },
                                is_current: publish,
                                visibility_status:
                                    article.translation.visibility_status,
                                category_id: article.translation.category_id,
                            },
                        ],
                    )

                    if (response?.data) {
                        setArticle((prev) => ({
                            ...prev,
                            translation: response.data,
                        }))
                    }

                    return response?.data
                }

                const response = await updateArticleTranslation.mutateAsync([
                    undefined,
                    {
                        help_center_id: props.helpCenter.id,
                        article_id: props.article.id,
                        locale,
                    },
                    {
                        title: article.translation.title,
                        content: article.translation.content,
                    },
                ])

                setArticle(
                    mergeResponseContentAndTitleInArticle(response?.data),
                )

                return response?.data
            } catch {
                notifyError(
                    `An error occurred while ${article.translationMode === 'new' ? 'creating' : 'updating'} the article.`,
                )

                return undefined
            }
        },
        [
            props.helpCenter.id,
            props.article.id,
            locale,
            createArticleTranslation,
            updateArticleTranslation,
            article,
            notifyError,
        ],
    )

    const updateArticleSettings = useCallback(
        async (payload: UpdateArticleTranslationDto) => {
            const response = await updateArticleTranslation.mutateAsync([
                undefined,
                {
                    help_center_id: props.helpCenter.id,
                    article_id: props.article.id,
                    locale,
                },
                payload,
            ])

            setArticle(mergeResponseSettingsInArticle(response))

            await queryClient.invalidateQueries({
                queryKey: helpCenterArticleKeys(
                    props.helpCenter.id,
                    props.article.id,
                    locale,
                ),
            })

            props.onUpdated?.()
        },
        [props, locale, updateArticleTranslation, queryClient],
    )

    const details = useKnowledgeEditorHelpCenterArticleDetails({
        article: {
            visibilityStatus: article.translation.visibility_status,
            createdDatetime: article.translation.created_datetime,
            lastUpdatedDatetime: article.translation.updated_datetime,
            slug:
                article.translationMode === 'new'
                    ? undefined
                    : article.translation.slug,
            articleId: article.id,
            unlistedId: article.unlisted_id,
        },
        locale: locale,
        helpCenter: props.helpCenter,
    })

    const [modeType, setModeType] = useState<ArticleMode['mode']>(
        props.initialArticleMode === InitialArticleMode.READ
            ? ArticleModes.READ
            : editModeFromVisibilityStatus(
                  article.translation.visibility_status,
              ),
    )

    const hasUnsavedChanges = useMemo(
        () =>
            article.translation.title !== getArticle.data?.translation.title ||
            article.translation.content !==
                getArticle.data?.translation.content,
        [
            article.translation.title,
            article.translation.content,
            getArticle.data?.translation.title,
            getArticle.data?.translation.content,
        ],
    )

    const onClose = useCallback(() => {
        if (hasUnsavedChanges) {
            openUnsavedChangesModal({
                onDiscardChanges: props.onClose,
                onSaveChanges: async () => {
                    const response = await upsertArticleContentAndTitle(false)
                    if (response) {
                        props.onUpdated?.()
                        props.onClose()
                    }
                },
            })
        } else {
            props.onClose()
        }
    }, [
        props,
        hasUnsavedChanges,
        openUnsavedChangesModal,
        upsertArticleContentAndTitle,
    ])

    const mode = useKnowledgeEditorHelpCenterArticleMode({
        mode: modeType,
        onCancel: () => {
            const cancelChanges = () => {
                if (article.translationMode === 'new') {
                    props.onClose()
                } else {
                    setArticle(
                        mergeResponseContentAndTitleInArticle(
                            getArticle.data?.translation,
                        ),
                    )
                    setModeType(ArticleModes.READ)
                }
            }

            if (hasUnsavedChanges) {
                openUnsavedChangesModal({
                    onDiscardChanges: cancelChanges,
                    onSaveChanges: async () => {
                        const response =
                            await upsertArticleContentAndTitle(false)
                        if (response) {
                            props.onUpdated?.()
                            setModeType(ArticleModes.READ)
                        }
                    },
                })
            } else {
                cancelChanges()
            }
        },
        onEdit: () =>
            setModeType(
                article.translationMode === 'new'
                    ? ArticleModes.EDIT_DRAFT
                    : editModeFromVisibilityStatus(
                          article.translation.visibility_status,
                      ),
            ),
        onSaveAndPublish: async () => {
            const response = await upsertArticleContentAndTitle(true)
            if (response) {
                props.onUpdated?.()
                setModeType(ArticleModes.READ)
            }
        },
        onSaveDraft: async () => {
            const response = await upsertArticleContentAndTitle(false)
            if (response) {
                props.onUpdated?.()
                setModeType(ArticleModes.READ)
            }
        },
        onDelete: async () => {
            openConfirmDeleteModal({
                resource: { kind: 'article' },
                onConfirm: async () => {
                    try {
                        await deleteArticle.mutateAsync([
                            undefined,
                            {
                                help_center_id: props.helpCenter.id,
                                id: props.article.id,
                            },
                        ])
                        props.onDeleted?.()
                        props.onClose()
                    } catch {
                        notifyError(
                            'An error occurred while deleting the article.',
                        )
                    }
                },
            })
        },
        onTest: props.onTest,
    })

    const onLocaleActionClick = useCallback(
        (action: LocaleActionType, currentOption: OptionItem) => {
            if (action === 'delete') {
                openConfirmDeleteModal({
                    resource: {
                        kind: 'article-translation',
                        locale: currentOption,
                    },
                    onConfirm: async () => {
                        try {
                            await deleteArticleTranslation.mutateAsync([
                                undefined,
                                {
                                    help_center_id: props.helpCenter.id,
                                    article_id: props.article.id,
                                    locale: currentOption.value,
                                },
                            ])
                            props.onClose()
                        } catch {
                            notifyError(
                                'An error occurred while deleting the article translation.',
                            )
                        }
                    },
                })
            } else if (action === 'view') {
                if (hasUnsavedChanges) {
                    openUnsavedChangesModal({
                        onDiscardChanges: () => setLocale(currentOption.value),
                        onSaveChanges: async () => {
                            const response =
                                await upsertArticleContentAndTitle(false)
                            if (response) {
                                setLocale(currentOption.value)
                            }
                        },
                    })
                } else {
                    setLocale(currentOption.value)
                }
            } else if (action === 'create') {
                if (hasUnsavedChanges) {
                    openUnsavedChangesModal({
                        onDiscardChanges: () => setLocale(currentOption.value),
                        onSaveChanges: async () => {
                            const response =
                                await upsertArticleContentAndTitle(false)
                            if (response) {
                                setLocale(currentOption.value)
                            }
                        },
                    })
                } else {
                    setLocale(currentOption.value)
                }
            }
        },
        [
            props,
            deleteArticleTranslation,
            upsertArticleContentAndTitle,
            openConfirmDeleteModal,
            hasUnsavedChanges,
            openUnsavedChangesModal,
            notifyError,
        ],
    )

    const settings = useKnowledgeEditorHelpCenterArticleSettings({
        helpCenter: props.helpCenter,
        supportedLocales: props.supportedLocales,
        currentLocale: locale,
        categories: props.categories,
        article: article.translationMode === 'existing' ? article : undefined,
        articleLocales: article.available_locales,
        onChangeLocale: setLocale,
        onLocaleActionClick: onLocaleActionClick,
        behavior:
            article.translationMode === 'existing'
                ? {
                      type: 'autosave',
                      updateArticle: updateArticleSettings,
                  }
                : {
                      type: 'controlled',
                      onChanges: (changes) =>
                          setArticle((prev) => ({
                              ...prev,
                              translation: { ...prev.translation, ...changes },
                          })),
                  },
    })

    const controlsDisabled = useMemo(
        () =>
            getArticle.isLoading ||
            updateArticleTranslation.isLoading ||
            createArticleTranslation.isLoading ||
            deleteArticle.isLoading,
        [
            getArticle.isLoading,
            updateArticleTranslation.isLoading,
            createArticleTranslation.isLoading,
            deleteArticle.isLoading,
        ],
    )

    const mockedOneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const mockedRelatedTicketsData = {
        tickets: [
            {
                title: 'Still waiting on my order?',
                lastUpdatedDatetime: mockedOneHourAgo,
                url: 'https://gorgias.gorgias.com/app/views/123/456',
                messageCount: 2,
                aiAgentOutcome: AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated,
            },
            {
                title: 'How to cancel my order?',
                lastUpdatedDatetime: mockedOneHourAgo,
                url: 'https://gorgias.gorgias.com/app/views/123/456',
                messageCount: 1,
                aiAgentOutcome: AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover,
            },
            {
                title: 'How to track my order?',
                lastUpdatedDatetime: mockedOneHourAgo,
                url: 'https://gorgias.gorgias.com/app/views/123/456',
                messageCount: 5,
                aiAgentOutcome: AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated,
            },
            {
                title: 'Issue with my order',
                lastUpdatedDatetime: mockedOneHourAgo,
                url: 'https://gorgias.gorgias.com/app/views/123/456',
                messageCount: 5,
                aiAgentOutcome: AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated,
            },
        ],
        relatedTicketsUrl: 'https://gorgias.gorgias.com/app/views',
    }

    return (
        <div className={css.container}>
            {modal.type === 'unsaved-changes' && (
                <KnowledgeEditorHelpCenterArticleUnsavedChangesModal
                    isOpen={true}
                    onCancel={modal.onClose}
                    onDiscard={modal.onDiscard}
                    onSave={modal.onSave}
                />
            )}
            {modal.type === 'confirm-delete' && (
                <KnowledgeEditorHelpCenterExistingArticleDeleteModal
                    {...modal}
                />
            )}

            <KnowledgeEditorTopBar
                onClickPrevious={props.onClickPrevious}
                onClickNext={props.onClickNext}
                title={
                    mode.mode === ArticleModes.READ
                        ? 'Help Center article'
                        : article.translation.title
                }
                onChangeTitle={
                    mode.mode === ArticleModes.READ
                        ? undefined
                        : (newTitle) =>
                              setArticle((prev) => ({
                                  ...prev,
                                  translation: {
                                      ...prev.translation,
                                      title: newTitle,
                                  },
                              }))
                }
                isFullscreen={props.isFullscreen}
                onToggleFullscreen={props.onToggleFullscreen}
                onClose={onClose}
                isDetailsView={isDetailsView}
                onToggleDetailsView={onToggleDetailsView}
                disabled={controlsDisabled}
            >
                <KnowledgeEditorTopBarHelpCenterArticlesControls
                    {...mode}
                    disabled={controlsDisabled}
                />
            </KnowledgeEditorTopBar>

            {getArticle.isLoading || !article ? (
                <div className={css.loadingSpinner}>
                    <LoadingSpinner size="big" />
                </div>
            ) : (
                <div className={css.contentContainer}>
                    {mode.mode === ArticleModes.READ ? (
                        <KnowledgeEditorHelpCenterArticleReadView
                            content={article.translation?.content ?? ''}
                            title={article.translation?.title ?? ''}
                        />
                    ) : (
                        <KnowledgeEditorHelpCenterArticleEditView
                            locale={locale}
                            articleId={props.article.id}
                            content={article.translation?.content ?? ''}
                            onChangeContent={(newContent) =>
                                setArticle((prev) => ({
                                    ...prev,
                                    translation: {
                                        ...prev.translation,
                                        content: newContent,
                                    },
                                }))
                            }
                        />
                    )}

                    {article && isDetailsView && (
                        <KnowledgeEditorSidePanelHelpCenterArticle
                            details={details}
                            impact={
                                isPerformanceStatsEnabled
                                    ? {
                                          tickets: {
                                              value: 40,
                                              onClick: () => {},
                                          },
                                          handoverTickets: {
                                              value: 3,
                                              onClick: () => {},
                                          },
                                          csat: {
                                              value: 4.1,
                                              onClick: () => {},
                                          },
                                          intents: [
                                              'Orders/Returns',
                                              'Product/Issues',
                                          ],
                                      }
                                    : undefined
                            }
                            relatedTickets={
                                isPerformanceStatsEnabled
                                    ? mockedRelatedTicketsData
                                    : undefined
                            }
                            settings={settings}
                        />
                    )}
                </div>
            )}
        </div>
    )
}

export const KnowledgeEditorHelpCenterExistingArticle = ({
    articleId,
    ...props
}: Props & { articleId: number }) => {
    const getArticle = useGetHelpCenterArticle(
        articleId,
        props.helpCenter.id,
        props.helpCenter.default_locale,
    )

    if (getArticle.isLoading || !getArticle.data) {
        return (
            <div>
                <KnowledgeEditorTopBar {...defaultTopBarProps}>
                    <KnowledgeEditorTopBarHelpCenterArticlesControls
                        disabled={true}
                        mode={ArticleModes.READ}
                        onEdit={() => {}}
                        onDelete={() => {}}
                        onTest={() => {}}
                    />
                </KnowledgeEditorTopBar>

                <div className={css.loadingSpinner}>
                    <LoadingSpinner size="big" />
                </div>
            </div>
        )
    }

    return (
        <KnowledgeEditorHelpCenterExistingArticleLoaded
            {...props}
            article={getArticle.data}
        />
    )
}
