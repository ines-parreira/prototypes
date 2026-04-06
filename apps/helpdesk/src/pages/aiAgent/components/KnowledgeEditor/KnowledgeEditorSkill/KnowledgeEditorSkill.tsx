import { useCallback, useEffect, useMemo } from 'react'

import { Card } from '@gorgias/axiom'

import { EditorWithPlayground } from 'common/knowledge-editor/components'
import { useNotify } from 'hooks/useNotify'
import { isGorgiasApiError } from 'models/api/types'

import { KnowledgeEditorSkillProvider, useSkillEditorStore } from './context'
import type { SkillContextConfig, SkillRouteState } from './context'
import { useKnowledgeEditorSkillData } from './hooks/useKnowledgeEditorSkillData'
import { KnowledgeEditorSkillContent } from './KnowledgeEditorSkillContent'
import { KnowledgeEditorSkillLoadingShell } from './KnowledgeEditorSkillLoadingShell'

import css from './KnowledgeEditorSkill.less'

const KnowledgeEditorSkillInner = () => {
    const playground = useSkillEditorStore(
        (storeState) => storeState.playground,
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

    return (
        <EditorWithPlayground
            playground={playground}
            draftKnowledge={draftKnowledgeForPlayground}
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
    } = useKnowledgeEditorSkillData({
        shopName,
        skillId,
        templateId,
    })

    const { error: notifyError } = useNotify()

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
    ])
    const isLoading = !!skillId && skillId !== 'new' && isArticleLoading

    if (isHelpCenterLoading || !memoizedConfig || isLoading) {
        return <KnowledgeEditorSkillLoadingShell />
    }

    return (
        <KnowledgeEditorSkillProvider config={memoizedConfig}>
            <KnowledgeEditorSkillInner />
        </KnowledgeEditorSkillProvider>
    )
}
