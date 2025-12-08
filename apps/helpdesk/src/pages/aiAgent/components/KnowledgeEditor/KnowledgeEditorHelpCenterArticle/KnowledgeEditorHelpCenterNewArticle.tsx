import { useCallback, useState } from 'react'

import { useNotify } from 'hooks/useNotify'
import { useCreateArticle } from 'models/helpCenter/queries'
import type {
    ArticleWithLocalTranslation,
    Category,
    HelpCenter,
    Locale,
    LocaleCode,
} from 'models/helpCenter/types'
import type {
    ActionType as LocaleActionType,
    OptionItem,
} from 'pages/settings/helpCenter/components/articles/ArticleLanguageSelect'
import { slugify } from 'pages/settings/helpCenter/utils/helpCenter.utils'

import { KnowledgeEditorSidePanelHelpCenterArticle } from '../KnowledgeEditorSidePanel/KnowledgeEditorSidePanelHelpCenterArticle/KnowledgeEditorSidePanelHelpCenterArticle'
import { KnowledgeEditorTopBar } from '../KnowledgeEditorTopBar/KnowledgeEditorTopBar'
import {
    ArticleModes,
    KnowledgeEditorTopBarHelpCenterArticlesControls,
} from '../KnowledgeEditorTopBar/KnowledgeEditorTopBarHelpCenterArticlesControls'
import { useKnowledgeEditorHelpCenterArticleDetails } from './hooks/useKnowledgeEditorHelpCenterArticleDetails'
import { useKnowledgeEditorHelpCenterArticleModal } from './hooks/useKnowledgeEditorHelpCenterArticleModal'
import { useKnowledgeEditorHelpCenterArticleMode } from './hooks/useKnowledgeEditorHelpCenterArticleMode'
import type { Changes as SettingsChanges } from './hooks/useKnowledgeEditorHelpCenterArticleSettings'
import { useKnowledgeEditorHelpCenterArticleSettings } from './hooks/useKnowledgeEditorHelpCenterArticleSettings'
import { KnowledgeEditorHelpCenterArticleEditView } from './KnowledgeEditorHelpCenterArticleEditView'
import { KnowledgeEditorHelpCenterArticleUnsavedChangesModal } from './KnowledgeEditorHelpCenterArticleUnsavedChangesModal'

import css from './KnowledgeEditorHelpCenterArticle.less'

type Props = {
    helpCenter: HelpCenter
    supportedLocales: Locale[]
    categories: Category[]
    onClickPrevious: () => void
    onClickNext: () => void
    onClose: () => void
    template?: {
        title: string
        content: string
        key: string
    }
    onCreated: (article: ArticleWithLocalTranslation) => void
    isFullscreen: boolean
    onToggleFullscreen: () => void
}

const createArticlePayload = (
    locale: LocaleCode,
    title: string,
    content: string,
    settingsChanges: SettingsChanges,
    isPublished: boolean,
    templateKey?: string,
) => ({
    template_key: templateKey,
    translation: {
        locale,
        title,
        content,
        excerpt: settingsChanges.excerpt ?? '',
        slug: slugify(title),
        seo_meta: {
            title: settingsChanges.seo_meta?.title ?? null,
            description: settingsChanges.seo_meta?.description ?? null,
        },
        category_id: settingsChanges.category_id ?? null,
        is_current: isPublished,
        visibility_status:
            settingsChanges.visibility_status ??
            (isPublished ? 'PUBLIC' : 'UNLISTED'),
    },
})

export const KnowledgeEditorHelpCenterNewArticle = (props: Props) => {
    const { error: notifyError } = useNotify()

    const { modal, openUnsavedChangesModal } =
        useKnowledgeEditorHelpCenterArticleModal()

    const [locale, setLocale] = useState<LocaleCode>(
        props.helpCenter.default_locale,
    )
    const [isDetailsView, setIsDetailsView] = useState(true)
    const onToggleDetailsView = useCallback(() => {
        setIsDetailsView(!isDetailsView)
    }, [isDetailsView])

    const [content, setContent] = useState<string>(
        props.template?.content || '',
    )
    const [title, setTitle] = useState<string>(props.template?.title || '')

    const [settingsChanges, setSettingsChanges] = useState<SettingsChanges>({})

    const details = useKnowledgeEditorHelpCenterArticleDetails({
        locale,
        helpCenter: props.helpCenter,
    })

    const createArticleMutation = useCreateArticle()

    const createArticle = useCallback(
        async (publish: boolean) => {
            try {
                const response = await createArticleMutation.mutateAsync([
                    undefined,
                    { help_center_id: props.helpCenter.id },
                    createArticlePayload(
                        locale,
                        title,
                        content,
                        settingsChanges,
                        publish,
                        props.template?.key,
                    ),
                ])

                return response?.data
            } catch {
                notifyError('An error occurred while creating the article.')
                return undefined
            }
        },
        [
            props.helpCenter.id,
            locale,
            title,
            content,
            createArticleMutation,
            props.template?.key,
            settingsChanges,
            notifyError,
        ],
    )

    const onCancel = useCallback(() => {
        if (title !== '' || content !== '') {
            openUnsavedChangesModal({
                onDiscardChanges: props.onClose,
                onSaveChanges: async () => {
                    const article = await createArticle(false)
                    if (article) {
                        props.onCreated(article)
                        props.onClose()
                    }
                },
            })
        } else {
            props.onClose()
        }
    }, [content, props, title, createArticle, openUnsavedChangesModal])

    const [modeType, setModeType] = useState<ArticleModes>(
        ArticleModes.EDIT_DRAFT,
    )

    const mode = useKnowledgeEditorHelpCenterArticleMode({
        mode: modeType,
        onCancel,
        onEdit: () => {
            setModeType(ArticleModes.EDIT_DRAFT)
        },
        onSaveAndPublish: async () => {
            const article = await createArticle(true)
            if (article) {
                props.onCreated(article)
            }
        },
        onSaveDraft: async () => {
            const article = await createArticle(false)
            if (article) {
                props.onCreated(article)
            }
        },
        onDelete: async () => onCancel(),
    })

    const settings = useKnowledgeEditorHelpCenterArticleSettings({
        helpCenter: props.helpCenter,
        supportedLocales: props.supportedLocales,
        articleLocales: [],
        categories: props.categories,
        article: undefined,
        currentLocale: locale,
        onChangeLocale: setLocale,
        behavior: {
            type: 'controlled',
            onChanges: setSettingsChanges,
        },
        onLocaleActionClick: (
            __action: LocaleActionType,
            currentOption: OptionItem,
        ) => setLocale(currentOption.value),
    })

    const controlsDisabled = createArticleMutation.isLoading

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
            <KnowledgeEditorTopBar
                onClickPrevious={props.onClickPrevious}
                onClickNext={props.onClickNext}
                title={title}
                onChangeTitle={setTitle}
                isFullscreen={props.isFullscreen}
                onToggleFullscreen={props.onToggleFullscreen}
                onClose={onCancel}
                isDetailsView={isDetailsView}
                onToggleDetailsView={onToggleDetailsView}
                disabled={controlsDisabled}
            >
                <KnowledgeEditorTopBarHelpCenterArticlesControls
                    {...mode}
                    disabled={controlsDisabled}
                />
            </KnowledgeEditorTopBar>

            <div className={css.contentContainer}>
                <KnowledgeEditorHelpCenterArticleEditView
                    locale={locale}
                    content={content}
                    onChangeContent={setContent}
                />

                {isDetailsView && (
                    <KnowledgeEditorSidePanelHelpCenterArticle
                        details={details}
                        settings={settings}
                    />
                )}
            </div>
        </div>
    )
}
