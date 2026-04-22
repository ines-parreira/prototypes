import { useCallback, useEffect, useMemo } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { Card } from '@gorgias/axiom'

import { EditorWithPlayground } from 'common/knowledge-editor/components'
import { isGorgiasApiError } from 'models/api/types'
import { getVersionImpactDateRange } from 'pages/aiAgent/components/KnowledgeEditor/shared/useVersionHistoryBase/useVersionHistoryBase'

import type { KnowledgeEditorSharedPanelState } from '../sharedPanel.types'
import { KnowledgeEditorSkillProvider, useSkillEditorStore } from './context'
import type {
    SkillContextConfig,
    SkillModeType,
    SkillRouteState,
} from './context'
import { useKnowledgeEditorSkillData } from './hooks/useKnowledgeEditorSkillData'
import { useSkillNotify } from './hooks/useSkillNotify'
import { KnowledgeEditorSkillContent } from './KnowledgeEditorSkillContent'
import { KnowledgeEditorSkillLoadingShell } from './KnowledgeEditorSkillLoadingShell'
import { SkillEditorPlaygroundBanner } from './SkillEditorPlaygroundBanner'

import css from './KnowledgeEditorSkill.less'

const KnowledgeEditorSkillInner = ({
    onSharedPanelStateChange,
}: {
    onSharedPanelStateChange?: (state: KnowledgeEditorSharedPanelState) => void
}) => {
    const { playground, onClose } = useSkillEditorStore(
        useShallow((storeState) => ({
            playground: storeState.playground,
            onClose: storeState.config.onClose,
        })),
    )
    const skill = useSkillEditorStore((storeState) => storeState.state.skill)
    const helpCenterId = useSkillEditorStore(
        (storeState) => storeState.config.helpCenter.id,
    )

    const isInDraftState =
        skill?.isCurrent === undefined ? false : !skill?.isCurrent

    const draftKnowledgeForPlayground =
        isInDraftState && skill
            ? { sourceId: skill.id, sourceSetId: helpCenterId }
            : undefined

    useEffect(() => {
        if (!onSharedPanelStateChange) {
            return
        }

        onSharedPanelStateChange({
            width: playground.sidePanelWidth,
            onRequestClose: onClose,
        })
    }, [onSharedPanelStateChange, playground.sidePanelWidth, onClose])

    return (
        <EditorWithPlayground
            playground={playground}
            draftKnowledge={draftKnowledgeForPlayground}
            playgroundBanner={<SkillEditorPlaygroundBanner />}
        >
            <Card elevation="mid" className={css.editor} padding={0}>
                <KnowledgeEditorSkillContent />
            </Card>
        </EditorWithPlayground>
    )
}

type Props = {
    shopName: string
    shopType: string
    skillId?: string
    templateId?: string
    routeState?: SkillRouteState
    onClose: () => void
    onDelete?: () => void
    onCreate?: (article: { id: number; locale: string }) => void
    onUpdate?: () => void
    onEdit?: () => void
    handleVisibilityUpdate?: (visibility: string) => void
    isPreviewMode?: boolean
    initialVersionId?: number
    skillMode?: SkillModeType
    onSharedPanelStateChange?: (state: KnowledgeEditorSharedPanelState) => void
}

export const KnowledgeEditorSkill = ({
    shopName,
    shopType,
    skillId,
    templateId,
    routeState,
    onClose,
    onDelete,
    onCreate,
    onUpdate,
    onEdit,
    handleVisibilityUpdate,
    isPreviewMode,
    initialVersionId,
    skillMode,
    onSharedPanelStateChange,
}: Props) => {
    const {
        helpCenter,
        isHelpCenterLoading,
        article,
        isArticleLoading,
        isError,
        error,
        skillTemplate,
        initialMode,
        initialVersionData,
        isInitialVersionLoading,
    } = useKnowledgeEditorSkillData({
        shopName,
        skillId,
        templateId,
        initialVersionId,
        skillMode,
    })

    const { error: notifyError } = useSkillNotify()

    useEffect(() => {
        if (isError && skillId && error) {
            const is404 =
                isGorgiasApiError(error) && error.response.status === 404

            const message = is404
                ? 'This skill is no longer available. It may have been deleted.'
                : 'Unable to load this skill. Please try again or contact support.'

            notifyError(message)
            onClose()
        }
    }, [isError, skillId, error, notifyError, onClose])

    const onCreateFn = useCallback(
        (createdArticle: { id: number; locale: string }) => {
            onCreate?.(createdArticle)
        },
        [onCreate],
    )

    const computedInitialVersionData = useMemo(() => {
        if (!initialVersionData) return undefined
        return {
            versionId: initialVersionData.id,
            version: initialVersionData.version,
            title: initialVersionData.title,
            content: initialVersionData.content,
            publishedDatetime: initialVersionData.published_datetime,
            publisherUserId: initialVersionData.publisher_user_id,
            commitMessage: initialVersionData.commit_message,
            impactDateRange: getVersionImpactDateRange(initialVersionData.id, [
                initialVersionData,
            ]),
        }
    }, [initialVersionData])

    const memoizedConfig = useMemo<SkillContextConfig | null>(() => {
        if (!helpCenter) {
            return null
        }

        return {
            shopName,
            shopType,
            skillTemplate,
            initialMode,
            skill: article,
            helpCenter,
            onClose,
            onDeleteFn: onDelete,
            onCreateFn,
            onUpdateFn: onUpdate,
            onEditFn: onEdit,
            handleVisibilityUpdate,
            routeState,
            isPreviewMode,
            initialVersionData: computedInitialVersionData,
        }
    }, [
        shopName,
        shopType,
        skillTemplate,
        initialMode,
        article,
        helpCenter,
        onClose,
        onDelete,
        onCreateFn,
        onUpdate,
        onEdit,
        handleVisibilityUpdate,
        routeState,
        isPreviewMode,
        computedInitialVersionData,
    ])
    const isLoading =
        (!!skillId && skillId !== 'new' && isArticleLoading) ||
        isInitialVersionLoading

    if (isHelpCenterLoading || !memoizedConfig || isLoading) {
        return (
            <KnowledgeEditorSkillLoadingShell
                isPreview={isPreviewMode ?? false}
            />
        )
    }

    return (
        <KnowledgeEditorSkillProvider config={memoizedConfig}>
            <KnowledgeEditorSkillInner
                onSharedPanelStateChange={onSharedPanelStateChange}
            />
        </KnowledgeEditorSkillProvider>
    )
}
