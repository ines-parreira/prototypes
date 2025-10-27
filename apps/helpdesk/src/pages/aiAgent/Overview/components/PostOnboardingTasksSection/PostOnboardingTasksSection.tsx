import { useEffect, useState } from 'react'

import { useLocation, useParams } from 'react-router-dom'

import { Heading, Icon, Text } from '@gorgias/axiom'

import loadingStaticIcon33 from 'assets/img/icons/loading-static-33.svg'
import loadingStaticIcon66 from 'assets/img/icons/loading-static-66.svg'
import loadingStaticIcon100 from 'assets/img/icons/loading-static-100.svg'
import { KnowledgeEditor } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditor'
import Accordion from 'pages/common/components/accordion/Accordion'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'

import { usePostOnboardingKnowledgeEditor } from '../../hooks/usePostOnboardingKnowledgeEditor'
import { usePostOnboardingTasksSection } from '../../hooks/usePostOnboardingTasksSection'
import { DeploySection } from './DeploySection'
import { TestSection } from './TestSection'
import { TrainSection } from './TrainSection'
import { PostOnboardingStepMetadata } from './types'
import { mapTabToStepName, POST_ONBOARDING_STEPS_METADATA } from './utils'

import css from './PostOnboardingTasksSection.less'

export const PostOnboardingTasksSection = () => {
    const stepsMetadata = Object.values(POST_ONBOARDING_STEPS_METADATA)
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()
    const location = useLocation<{ openTab?: string }>()

    const {
        step,
        completedStepsCount,
        isStepCompleted,
        updateStep,
        markPostStoreInstallationAsCompleted,
        firstUncompletedStepName,
    } = usePostOnboardingTasksSection({ shopName, shopType })

    const {
        openEditorForCreate,
        openEditorForEdit,
        knowledgeEditorProps,
        isEditorOpen,
    } = usePostOnboardingKnowledgeEditor({
        shopName,
        shopType,
    })

    const [expandedStep, setExpandedStep] = useState<string | null>(
        firstUncompletedStepName,
    )

    useEffect(() => {
        const stepFromState = location.state?.openTab
            ? mapTabToStepName(location.state.openTab)
            : null
        setExpandedStep(stepFromState ?? firstUncompletedStepName)
    }, [location.state, firstUncompletedStepName])

    const getProgressIcon = () => {
        if (completedStepsCount >= 3) return loadingStaticIcon100
        if (completedStepsCount >= 2) return loadingStaticIcon66
        return loadingStaticIcon33
    }

    return (
        <div className={css.container}>
            <div className={css.header}>
                <Heading size="md">Get started with AI Agent</Heading>
                <div className={css.progress}>
                    <img
                        alt="loading icon"
                        src={getProgressIcon()}
                        className={css.progressIcon}
                    />
                    <Text size="sm" variant="bold">
                        {completedStepsCount} / 3 steps
                    </Text>
                </div>
            </div>
            <Accordion
                className={css.stepsAccordion}
                expandedItem={expandedStep}
                onChange={setExpandedStep}
            >
                {stepsMetadata.map(
                    (stepMetadata: PostOnboardingStepMetadata) => (
                        <AccordionItem
                            key={stepMetadata.stepName}
                            id={stepMetadata.stepName}
                            className={css.stepItem}
                            highlightOnExpand={false}
                        >
                            <AccordionHeader className={css.stepHeader}>
                                <div className={css.stepTitleContainer}>
                                    {isStepCompleted(stepMetadata.stepName) ? (
                                        <Icon name="circle-check" />
                                    ) : (
                                        <Icon name="shape-circle" />
                                    )}
                                    <Heading size="sm">
                                        {stepMetadata.stepTitle}
                                    </Heading>
                                </div>
                            </AccordionHeader>
                            <AccordionBody>
                                {stepMetadata.stepName === 'TRAIN' ? (
                                    <TrainSection
                                        stepMetadata={stepMetadata}
                                        step={step(stepMetadata.stepName)!}
                                        updateStep={updateStep}
                                        onEditGuidance={openEditorForEdit}
                                        onCreateGuidance={openEditorForCreate}
                                        isEditorOpen={isEditorOpen}
                                    />
                                ) : stepMetadata.stepName === 'TEST' ? (
                                    <TestSection
                                        stepMetadata={stepMetadata}
                                        step={step(stepMetadata.stepName)!}
                                        updateStep={updateStep}
                                        onEditGuidanceArticle={
                                            openEditorForEdit
                                        }
                                    />
                                ) : stepMetadata.stepName === 'DEPLOY' ? (
                                    <DeploySection
                                        stepMetadata={stepMetadata}
                                        step={step(stepMetadata.stepName)!}
                                        updateStep={updateStep}
                                        markPostStoreInstallationAsCompleted={
                                            markPostStoreInstallationAsCompleted
                                        }
                                    />
                                ) : null}
                            </AccordionBody>
                        </AccordionItem>
                    ),
                )}
            </Accordion>
            <KnowledgeEditor {...knowledgeEditorProps} />
        </div>
    )
}
