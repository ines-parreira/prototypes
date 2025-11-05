import { useCallback, useEffect, useMemo, useState } from 'react'

import { AxiosResponse } from 'axios'

import { LoadingSpinner } from '@gorgias/axiom'

import {
    useCreateArticleTranslation,
    useDeleteArticle,
    useDeleteArticleTranslation,
    useGetHelpCenterArticle,
    useUpdateArticleTranslation,
} from 'models/helpCenter/queries'
import {
    ArticleTranslationResponseDto,
    ArticleWithLocalTranslation,
    Category,
    HelpCenter,
    LocalArticleTranslation,
    Locale,
    LocaleCode,
    UpdateArticleTranslationDto,
    VisibilityStatus,
} from 'models/helpCenter/types'
import {
    ActionType as LocaleActionType,
    OptionItem,
} from 'pages/settings/helpCenter/components/articles/ArticleLanguageSelect'
import { slugify } from 'pages/settings/helpCenter/utils/helpCenter.utils'

import { KnowledgeEditorSidePanelHelpCenterArticle } from '../KnowledgeEditorSidePanel/KnowledgeEditorSidePanelHelpCenterArticle/KnowledgeEditorSidePanelHelpCenterArticle'
import {
    defaultProps as defaultTopBarProps,
    KnowledgeEditorTopBar,
} from '../KnowledgeEditorTopBar/KnowledgeEditorTopBar'
import {
    ArticleMode,
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
    initialArticleMode: InitialArticleMode
}

type ArticleState = ArticleWithLocalTranslation & {
    translationMode: 'existing' | 'new'
}

const newTranslation = (
    article: Omit<ArticleWithLocalTranslation, 'translation'>,
    locale: LocaleCode,
): LocalArticleTranslation => {
    const now = new Date().toISOString()
    return {
        created_datetime: now,
        updated_datetime: now,
        title: '',
        excerpt: '',
        content: '',
        slug: '',
        locale,
        article_id: article.id,
        category_id: null,
        article_unlisted_id: article.unlisted_id,
        seo_meta: {
            title: null,
            description: null,
        },
        visibility_status: 'PUBLIC',
        is_current: true,
    }
}

const mergeResponseSettingsInArticle =
    (response: AxiosResponse<ArticleTranslationResponseDto, any> | null) =>
    (prev: ArticleState): ArticleState => {
        if (!response?.data || !prev) {
            return prev
        }

        const {
            title: __title,
            content: __content,
            ...updatedFields
        } = response.data

        return {
            ...prev,
            translation: {
                ...prev.translation,
                ...updatedFields,
            },
        }
    }

const mergeContentAndTitleInArticle =
    (content: string, title: string) =>
    (prev: ArticleState): ArticleState => ({
        ...prev,
        translation: {
            ...prev.translation,
            content,
            title,
        },
    })

const mergeResponseContentAndTitleInArticle =
    (response: ArticleTranslationResponseDto | undefined) =>
    (prev: ArticleState): ArticleState =>
        response
            ? mergeContentAndTitleInArticle(
                  response.content,
                  response.title,
              )(prev)
            : prev

const editModeFromVisibilityStatus = (
    visibilityStatus: VisibilityStatus,
): ArticleModes =>
    visibilityStatus === 'PUBLIC'
        ? ArticleModes.EDIT_PUBLISHED
        : ArticleModes.EDIT_DRAFT

const KnowledgeEditorHelpCenterExistingArticleLoaded = (
    props: Props & { article: ArticleWithLocalTranslation },
) => {
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

    const upsertArticleContentAndTitle = useCallback(async () => {
        if (article.translationMode === 'new') {
            const response = await createArticleTranslation.mutateAsync([
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
                        description: article.translation.seo_meta.description,
                    },
                    is_current: article.translation.is_current,
                    visibility_status: article.translation.visibility_status,
                    category_id: article.translation.category_id,
                },
            ])

            if (response?.data) {
                setArticle((prev) => ({
                    ...prev,
                    translation: response.data,
                }))
            }
        } else {
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

            setArticle(mergeResponseContentAndTitleInArticle(response?.data))
        }
    }, [
        props.helpCenter.id,
        props.article.id,
        locale,
        createArticleTranslation,
        updateArticleTranslation,
        article,
    ])

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
        },
        [
            props.helpCenter.id,
            props.article.id,
            locale,
            updateArticleTranslation,
        ],
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
                    await upsertArticleContentAndTitle()
                    props.onClose()
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
                        await upsertArticleContentAndTitle()
                        setModeType(ArticleModes.READ)
                    },
                })
            } else {
                cancelChanges()
            }
        },
        onEdit: () =>
            setModeType(
                article.translationMode === 'new'
                    ? ArticleModes.EDIT_PUBLISHED
                    : editModeFromVisibilityStatus(
                          article.translation.visibility_status,
                      ),
            ),
        onSave: async () => {
            await upsertArticleContentAndTitle()
            setModeType(ArticleModes.READ)
        },
        onDelete: async () => {
            openConfirmDeleteModal({
                resource: { kind: 'article' },
                onConfirm: async () => {
                    await deleteArticle.mutateAsync([
                        undefined,
                        {
                            help_center_id: props.helpCenter.id,
                            id: props.article.id,
                        },
                    ])
                    props.onClose()
                },
            })
        },
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
                        await deleteArticleTranslation.mutateAsync([
                            undefined,
                            {
                                help_center_id: props.helpCenter.id,
                                article_id: props.article.id,
                                locale: currentOption.value,
                            },
                        ])
                        props.onClose()
                    },
                })
            } else if (action === 'view') {
                if (hasUnsavedChanges) {
                    openUnsavedChangesModal({
                        onDiscardChanges: () => setLocale(currentOption.value),
                        onSaveChanges: async () => {
                            await upsertArticleContentAndTitle()
                            setLocale(currentOption.value)
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
                            await upsertArticleContentAndTitle()
                            setLocale(currentOption.value)
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

    return (
        <div>
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
                isFullscreen={false}
                onToggleFullscreen={() => {}}
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
                <div className={css.container}>
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
