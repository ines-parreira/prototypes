import { useCallback } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { Button } from '@gorgias/axiom'

import { useSkillEditorStore } from '../KnowledgeEditorSkill/context'
import {
    EditIconButton,
    TestButton,
} from './KnowledgeEditorTopBarCommonControls'

export const SkillToolbarControls = () => {
    const { mode, isUpdating, isAutoSaving, canEditSkill } =
        useSkillEditorStore(
            useShallow((storeState) => ({
                mode: storeState.state.mode,
                isUpdating: storeState.state.isUpdating,
                isAutoSaving: storeState.state.isAutoSaving,
                canEditSkill: !!storeState.state.skill,
            })),
        )

    const dispatch = useSkillEditorStore((storeState) => storeState.dispatch)
    const playground = useSkillEditorStore(
        (storeState) => storeState.playground,
    )

    const isDisabled = isUpdating || isAutoSaving

    const onEdit = useCallback(() => {
        dispatch({ type: 'SET_MODE', payload: 'edit' })
    }, [dispatch])

    const onOpenPublishModal = useCallback(() => {
        dispatch({ type: 'SET_MODAL', payload: 'publish' })
    }, [dispatch])

    if (mode === 'read') {
        return (
            <>
                {canEditSkill && (
                    <EditIconButton onEdit={onEdit} disabled={isDisabled} />
                )}
                {playground.onTest && (
                    <TestButton
                        onTest={playground.onTest}
                        disabled={isDisabled}
                    />
                )}
            </>
        )
    }

    if (mode === 'edit' || mode === 'create') {
        return (
            <>
                <Button
                    variant="primary"
                    onClick={onOpenPublishModal}
                    isDisabled={isDisabled}
                >
                    Publish changes
                </Button>
                {playground.onTest && (
                    <TestButton
                        onTest={playground.onTest}
                        disabled={isDisabled}
                    />
                )}
            </>
        )
    }

    return null
}
