import { useCallback, useEffect, useState } from 'react'

import classNames from 'classnames'
import _noop from 'lodash/noop'

import {
    LegacyLoadingSpinner as LoadingSpinner,
    SidePanel,
} from '@gorgias/axiom'

import { useNotify } from 'hooks/useNotify'
import type {
    ArticleTranslationResponseDto,
    ArticleWithLocalTranslation,
    LocaleCode,
} from 'models/helpCenter/types'
import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { guidanceVariables } from 'pages/aiAgent/components/GuidanceEditor/variables'
import { useAiAgentHelpCenter } from 'pages/aiAgent/hooks/useAiAgentHelpCenter'
import { useGuidanceArticle } from 'pages/aiAgent/hooks/useGuidanceArticle'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import { usePlaygroundPanelInKnowledgeEditor } from 'pages/aiAgent/hooks/usePlaygroundPanelInKnowledgeEditor'
import type {
    GuidanceArticle,
    GuidanceFormFields,
    GuidanceTemplate,
} from 'pages/aiAgent/types'
import { mapGuidanceFormFieldsToGuidanceArticle } from 'pages/aiAgent/utils/guidance.utils'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'

import { PlaygroundPanel } from '../../PlaygroundPanel/PlaygroundPanel'
import type { BaseProps } from './KnowledgeEditorGuidanceView'
import { KnowledgeEditorGuidanceView } from './KnowledgeEditorGuidanceView'

import css from '../shared.less'

const KnowledgeEditorGuidanceStatefulEdit = ({
    shopName,
    guidanceArticle,
    availableActions,
    onSave: onSaveFn,
    onDelete,
    onDuplicate,
    isGuidanceArticleUpdating,
    onClose,
    onClickPrevious,
    onClickNext,
    guidanceMode,
    isFullscreen,
    onToggleFullscreen,
    onTest,
}: BaseProps & {
    guidanceArticle: GuidanceArticle
    availableActions: GuidanceAction[]
    onSave: (
        guidanceArticle: GuidanceFormFields,
    ) => Promise<ArticleTranslationResponseDto | undefined>
    onDelete: () => Promise<void>
    onDuplicate: () => Promise<void>
    isGuidanceArticleUpdating: boolean
}) => {
    const [title, setTitle] = useState(guidanceArticle.title)
    const [content, setContent] = useState(guidanceArticle.content)
    const [guidanceArticleId, setGuidanceArticleId] = useState(
        guidanceArticle.id,
    )

    useEffect(() => {
        if (guidanceArticleId !== guidanceArticle.id) {
            setTitle(guidanceArticle.title)
            setContent(guidanceArticle.content)
            setGuidanceArticleId(guidanceArticle.id)
        }
    }, [guidanceArticle, guidanceArticleId])

    const onSave = useCallback(
        async (guidanceFormFields: GuidanceFormFields) => {
            const response = await onSaveFn(guidanceFormFields)

            if (response) {
                setTitle(response.title)
                setContent(response.content)
            }

            return response
        },
        [onSaveFn],
    )

    const onToggleAIAgentEnabled = useCallback(
        async () =>
            onSaveFn({
                name: title,
                content,
                isVisible:
                    guidanceArticle.visibility === 'PUBLIC' ? false : true,
            }),
        [onSaveFn, title, content, guidanceArticle.visibility],
    )

    return (
        <KnowledgeEditorGuidanceView
            onClose={onClose}
            onClickPrevious={onClickPrevious}
            onClickNext={onClickNext}
            availableActions={availableActions}
            availableVariables={guidanceVariables}
            onSave={onSave}
            onCreate={_noop}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            title={title}
            content={content}
            aiAgentEnabled={guidanceArticle.visibility === 'PUBLIC'}
            onToggleAIAgentEnabled={onToggleAIAgentEnabled}
            shopName={shopName}
            createdDatetime={new Date(guidanceArticle.createdDatetime)}
            lastUpdatedDatetime={new Date(guidanceArticle.lastUpdated)}
            onChangeTitle={setTitle}
            onChangeContent={setContent}
            isGuidanceArticleUpdating={isGuidanceArticleUpdating}
            guidanceMode={guidanceMode}
            isFullscreen={isFullscreen}
            onToggleFullscreen={onToggleFullscreen}
            onTest={onTest}
        />
    )
}

const KnowledgeEditorGuidanceStatefulCreate = ({
    shopName,
    guidanceTemplate,
    availableActions,
    onCreate: onCreateFn,
    isGuidanceArticleUpdating,
    onClose,
    onClickPrevious,
    onClickNext,
    guidanceMode,
    isFullscreen,
    onToggleFullscreen,
    onTest,
}: BaseProps & {
    guidanceTemplate?: GuidanceTemplate
    availableActions: GuidanceAction[]
    onCreate: (
        guidanceArticle: GuidanceFormFields,
    ) => Promise<ArticleWithLocalTranslation | undefined>
    isGuidanceArticleUpdating: boolean
}) => {
    const [title, setTitle] = useState(guidanceTemplate?.name || '')
    const [content, setContent] = useState(guidanceTemplate?.content || '')
    const [aiAgentEnabled, setAiAgentEnabled] = useState(true)

    const onCreate = useCallback(
        async (guidanceFormFields: GuidanceFormFields) => {
            const response = await onCreateFn({
                ...guidanceFormFields,
                isVisible: aiAgentEnabled,
            })
            return response
        },
        [onCreateFn, aiAgentEnabled],
    )

    const onToggleAIAgentEnabled = () => {
        setAiAgentEnabled((prev) => !prev)
    }

    return (
        <KnowledgeEditorGuidanceView
            onClose={onClose}
            onClickPrevious={onClickPrevious}
            onClickNext={onClickNext}
            availableActions={availableActions}
            availableVariables={guidanceVariables}
            onSave={_noop}
            onCreate={onCreate}
            onDelete={_noop}
            onDuplicate={_noop}
            title={title}
            content={content}
            aiAgentEnabled={aiAgentEnabled}
            onToggleAIAgentEnabled={onToggleAIAgentEnabled}
            shopName={shopName}
            onChangeTitle={setTitle}
            onChangeContent={setContent}
            isGuidanceArticleUpdating={isGuidanceArticleUpdating}
            guidanceMode={guidanceMode}
            isFullscreen={isFullscreen}
            onToggleFullscreen={onToggleFullscreen}
            onTest={onTest}
        />
    )
}

const KnowledgeEditorGuidanceLoaderForEdit = ({
    shopName,
    shopType,
    guidanceArticleId,
    guidanceHelpCenterId,
    locale,
    onClose,
    onClickPrevious,
    onClickNext,
    guidanceMode,
    onDeleteFn,
    onUpdateFn,
    onCopyFn,
    isFullscreen,
    onToggleFullscreen,
    onTest,
}: BaseProps & {
    shopType: string
    guidanceArticleId: number
    guidanceHelpCenterId: number
    locale: LocaleCode
    onDeleteFn?: () => void
    onUpdateFn?: () => void
    onCopyFn?: () => void
}) => {
    const { error: notifyError } = useNotify()

    const { guidanceArticle, isGuidanceArticleLoading } = useGuidanceArticle({
        guidanceHelpCenterId,
        guidanceArticleId,
        locale,
    })

    const { guidanceActions, isLoading: isLoadingActions } =
        useGetGuidancesAvailableActions(shopName, shopType)

    const {
        updateGuidanceArticle,
        deleteGuidanceArticle,
        duplicateGuidanceArticle,
        isGuidanceArticleUpdating,
    } = useGuidanceArticleMutation({
        guidanceHelpCenterId,
    })

    const onSave = useCallback(
        async (guidanceFormFields: GuidanceFormFields) => {
            try {
                const response = await updateGuidanceArticle(
                    mapGuidanceFormFieldsToGuidanceArticle(
                        guidanceFormFields,
                        locale,
                    ),
                    { articleId: guidanceArticleId, locale },
                )
                onUpdateFn?.()
                return response
            } catch {
                notifyError('An error occurred while editing guidance.')
            }
        },
        [
            updateGuidanceArticle,
            guidanceArticleId,
            locale,
            onUpdateFn,
            notifyError,
        ],
    )

    const onDelete = useCallback(async () => {
        try {
            await deleteGuidanceArticle(guidanceArticleId)
            onDeleteFn?.()
        } catch {
            notifyError('An error occurred while deleting guidance.')
        }
    }, [deleteGuidanceArticle, guidanceArticleId, onDeleteFn, notifyError])

    const onDuplicate = useCallback(async () => {
        try {
            await duplicateGuidanceArticle(guidanceArticleId, shopName)
            onCopyFn?.()
        } catch {
            notifyError('An error occurred while duplicating guidance.')
        }
    }, [
        duplicateGuidanceArticle,
        guidanceArticleId,
        shopName,
        onCopyFn,
        notifyError,
    ])

    if (!guidanceArticle || isGuidanceArticleLoading || isLoadingActions) {
        return <LoadingSpinner size="big" />
    }

    return (
        <KnowledgeEditorGuidanceStatefulEdit
            shopName={shopName}
            availableActions={guidanceActions}
            guidanceArticle={guidanceArticle}
            onSave={onSave}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            isGuidanceArticleUpdating={isGuidanceArticleUpdating}
            onClose={onClose}
            onClickPrevious={onClickPrevious}
            onClickNext={onClickNext}
            guidanceMode={guidanceMode}
            isFullscreen={isFullscreen}
            onToggleFullscreen={onToggleFullscreen}
            onTest={onTest}
        />
    )
}

const KnowledgeEditorGuidanceLoaderForCreate = ({
    shopName,
    shopType,
    guidanceTemplate,
    guidanceHelpCenterId,
    locale,
    onClose,
    onClickPrevious,
    onClickNext,
    onArticleCreated,
    onCreateFn,
    guidanceMode,
    isFullscreen,
    onToggleFullscreen,
    onTest,
}: BaseProps & {
    shopType: string
    guidanceTemplate?: GuidanceTemplate
    guidanceHelpCenterId: number
    locale: LocaleCode
    onArticleCreated: (articleId: number) => void
    onCreateFn?: () => void
}) => {
    const { error: notifyError } = useNotify()

    const { guidanceActions, isLoading: isLoadingActions } =
        useGetGuidancesAvailableActions(shopName, shopType)

    const { createGuidanceArticle, isGuidanceArticleUpdating } =
        useGuidanceArticleMutation({
            guidanceHelpCenterId,
        })

    const onCreate = useCallback(
        async (guidanceFormFields: GuidanceFormFields) => {
            try {
                const response = await createGuidanceArticle(
                    mapGuidanceFormFieldsToGuidanceArticle(
                        guidanceFormFields,
                        locale,
                        guidanceTemplate
                            ? `template_guidance_${guidanceTemplate.id}`
                            : undefined,
                    ),
                )
                if (response) {
                    onArticleCreated(response.id)
                    onCreateFn?.()
                }
                return response
            } catch {
                notifyError('An error occurred while creating guidance.')
            }
        },
        [
            createGuidanceArticle,
            locale,
            guidanceTemplate,
            onArticleCreated,
            onCreateFn,
            notifyError,
        ],
    )

    if (isLoadingActions) {
        return <LoadingSpinner size="big" />
    }

    return (
        <KnowledgeEditorGuidanceStatefulCreate
            shopName={shopName}
            availableActions={guidanceActions}
            guidanceTemplate={guidanceTemplate}
            onCreate={onCreate}
            isGuidanceArticleUpdating={isGuidanceArticleUpdating}
            onClose={onClose}
            onClickPrevious={onClickPrevious}
            onClickNext={onClickNext}
            guidanceMode={guidanceMode}
            isFullscreen={isFullscreen}
            onToggleFullscreen={onToggleFullscreen}
            onTest={onTest}
        />
    )
}

const KnowledgeEditorGuidanceRouter = ({
    shopName,
    shopType,
    guidanceArticleId,
    guidanceTemplate,
    guidanceHelpCenterId,
    locale,
    onClose,
    onClickPrevious,
    onClickNext,
    onDeleteFn,
    onCreateFn,
    onUpdateFn,
    onCopyFn,
    guidanceMode,
    isFullscreen,
    onToggleFullscreen,
    onTest,
}: BaseProps & {
    shopType: string
    guidanceArticleId?: number
    guidanceTemplate?: GuidanceTemplate
    guidanceHelpCenterId: number
    locale: LocaleCode
    onDeleteFn?: () => void
    onCreateFn?: () => void
    onUpdateFn?: () => void
    onCopyFn?: () => void
}) => {
    const [currentGuidanceArticleId, setCurrentGuidanceArticleId] =
        useState(guidanceArticleId)
    const [currentGuidanceMode, setCurrentGuidanceMode] = useState(guidanceMode)

    const handleArticleCreated = useCallback((articleId: number) => {
        setCurrentGuidanceArticleId(articleId)
        setCurrentGuidanceMode('read')
    }, [])

    if (currentGuidanceArticleId && currentGuidanceMode !== 'create') {
        return (
            <KnowledgeEditorGuidanceLoaderForEdit
                shopName={shopName}
                shopType={shopType}
                guidanceArticleId={currentGuidanceArticleId}
                guidanceHelpCenterId={guidanceHelpCenterId}
                locale={locale}
                onClose={onClose}
                onClickPrevious={onClickPrevious}
                onClickNext={onClickNext}
                onDeleteFn={onDeleteFn}
                onUpdateFn={onUpdateFn}
                onCopyFn={onCopyFn}
                guidanceMode={currentGuidanceMode}
                isFullscreen={isFullscreen}
                onToggleFullscreen={onToggleFullscreen}
                onTest={onTest}
            />
        )
    }

    return (
        <KnowledgeEditorGuidanceLoaderForCreate
            shopName={shopName}
            shopType={shopType}
            guidanceTemplate={guidanceTemplate}
            guidanceHelpCenterId={guidanceHelpCenterId}
            locale={locale}
            onClose={onClose}
            onClickPrevious={onClickPrevious}
            onClickNext={onClickNext}
            onArticleCreated={handleArticleCreated}
            onCreateFn={onCreateFn}
            guidanceMode={guidanceMode}
            isFullscreen={isFullscreen}
            onToggleFullscreen={onToggleFullscreen}
            onTest={onTest}
        />
    )
}

const KnowledgeEditorGuidanceHelpCenterLoader = ({
    shopName,
    shopType,
    guidanceArticleId,
    guidanceTemplate,
    onClose,
    onClickPrevious,
    onClickNext,
    guidanceMode,
    onDelete,
    onCreate,
    onUpdate,
    onCopy,
    isOpen,
}: Omit<BaseProps, 'isFullscreen' | 'onToggleFullscreen' | 'onTest'> & {
    shopName: string
    shopType: string
    guidanceArticleId?: number
    guidanceTemplate?: GuidanceTemplate
    onDelete?: () => void
    onCreate?: () => void
    onUpdate?: () => void
    onCopy?: () => void
    isOpen: boolean
}) => {
    const guidanceHelpCenter = useAiAgentHelpCenter({
        shopName,
        helpCenterType: 'guidance',
    })

    const [isFullscreen, setIsFullscreen] = useState(false)

    const onToggleFullscreen = useCallback(() => {
        setIsFullscreen(!isFullscreen)
    }, [isFullscreen])

    const { isPlaygroundOpen, onTest, onClosePlayground, sidePanelWidth } =
        usePlaygroundPanelInKnowledgeEditor(isFullscreen)

    return (
        <SidePanel
            isOpen={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    onClose()
                }
            }}
            isDismissable
            withoutPadding
            width={sidePanelWidth}
        >
            <div className={css.splitView}>
                <div
                    className={classNames(css.editor, {
                        [css.loader]: !guidanceHelpCenter,
                    })}
                >
                    {guidanceHelpCenter ? (
                        <KnowledgeEditorGuidanceRouter
                            shopName={shopName}
                            shopType={shopType}
                            guidanceArticleId={guidanceArticleId}
                            guidanceTemplate={guidanceTemplate}
                            guidanceHelpCenterId={guidanceHelpCenter.id}
                            locale={guidanceHelpCenter.default_locale}
                            onClose={onClose}
                            onClickPrevious={onClickPrevious}
                            onClickNext={onClickNext}
                            guidanceMode={guidanceMode}
                            onDeleteFn={onDelete}
                            onCreateFn={onCreate}
                            onUpdateFn={onUpdate}
                            onCopyFn={onCopy}
                            isFullscreen={isFullscreen}
                            onToggleFullscreen={onToggleFullscreen}
                            onTest={onTest}
                        />
                    ) : (
                        <LoadingSpinner size="big" />
                    )}
                </div>
                {isPlaygroundOpen && (
                    <div className={css.playground}>
                        <PlaygroundPanel onClose={onClosePlayground} />
                    </div>
                )}
            </div>
        </SidePanel>
    )
}

export const KnowledgeEditorGuidance = KnowledgeEditorGuidanceHelpCenterLoader
