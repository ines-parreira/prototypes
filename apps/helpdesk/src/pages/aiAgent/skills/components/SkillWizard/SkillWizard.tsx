import type { ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'

import { Box, Card } from '@gorgias/axiom'

import { EditorWithPlayground } from 'common/knowledge-editor/components'
import { usePlaygroundPanelInKnowledgeEditor } from 'pages/aiAgent/hooks/usePlaygroundPanelInKnowledgeEditor'
import type { DraftKnowledge } from 'pages/aiAgent/PlaygroundV2/types'

import { SkillWizardContext } from './SkillWizardContext'
import { SkillWizardHeader } from './SkillWizardHeader'

import css from './SkillWizard.less'

type Props<T> = {
    items: T[]
    renderItem: (item: T, index: number) => ReactNode
    renderRecap: () => ReactNode
    draftKnowledge?: (item: T, index: number) => DraftKnowledge | undefined
    initialStep?: number
    isSaving?: boolean
    onClose: () => void
    onStepChange?: (step: number) => void
}

const clampStep = (step: number, totalSteps: number) => {
    if (totalSteps <= 0) return 1
    return Math.min(Math.max(step, 1), totalSteps)
}

export function SkillWizard<T>({
    items,
    renderItem,
    renderRecap,
    draftKnowledge,
    initialStep = 1,
    isSaving,
    onClose,
    onStepChange,
}: Props<T>) {
    const reviewStepsCount = items.length
    const totalSteps = reviewStepsCount + 1
    const [currentStep, setCurrentStep] = useState(() =>
        clampStep(initialStep, totalSteps),
    )

    const updateStep = useCallback(
        (computeNext: (prev: number) => number) => {
            setCurrentStep((prev) => {
                const next = clampStep(computeNext(prev), totalSteps)
                if (prev === next) return prev
                onStepChange?.(next)
                return next
            })
        },
        [onStepChange, totalSteps],
    )

    const goNext = useCallback(
        () => updateStep((prev) => prev + 1),
        [updateStep],
    )
    const goBack = useCallback(
        () => updateStep((prev) => prev - 1),
        [updateStep],
    )
    const goToStep = useCallback(
        (step: number) => updateStep(() => step),
        [updateStep],
    )

    const {
        isPlaygroundOpen,
        onTest,
        onClosePlayground,
        sidePanelWidth,
        shouldHideFullscreenButton,
    } = usePlaygroundPanelInKnowledgeEditor(false)

    const playground = useMemo(
        () => ({
            isOpen: isPlaygroundOpen,
            onTest,
            onClose: onClosePlayground,
            sidePanelWidth,
            shouldHideFullscreenButton,
        }),
        [
            isPlaygroundOpen,
            onTest,
            onClosePlayground,
            sidePanelWidth,
            shouldHideFullscreenButton,
        ],
    )

    const isRecapStep = currentStep >= totalSteps

    const activeItem = isRecapStep ? undefined : items[currentStep - 1]
    const activeDraftKnowledge = useMemo(() => {
        if (!draftKnowledge || activeItem === undefined) return undefined
        return draftKnowledge(activeItem, currentStep - 1)
    }, [draftKnowledge, activeItem, currentStep])

    const contextValue = useMemo(
        () => ({
            currentStep,
            totalSteps,
            reviewStepsCount,
            isFirstStep: currentStep <= 1,
            isLastStep: isRecapStep,
            isRecapStep,
            goNext,
            goBack,
            goToStep,
            onTest,
        }),
        [
            currentStep,
            goBack,
            goNext,
            goToStep,
            isRecapStep,
            onTest,
            reviewStepsCount,
            totalSteps,
        ],
    )

    return (
        <SkillWizardContext.Provider value={contextValue}>
            <EditorWithPlayground
                playground={playground}
                draftKnowledge={activeDraftKnowledge}
            >
                <Card elevation="mid" padding={0} className={css.editor}>
                    <Box flexDirection="column" className={css.wizard}>
                        <SkillWizardHeader
                            isSaving={isSaving}
                            onClose={onClose}
                        />
                        <Box
                            flexDirection="column"
                            flex={1}
                            className={css.content}
                        >
                            {isRecapStep || activeItem === undefined
                                ? renderRecap()
                                : renderItem(activeItem, currentStep - 1)}
                        </Box>
                    </Box>
                </Card>
            </EditorWithPlayground>
        </SkillWizardContext.Provider>
    )
}
