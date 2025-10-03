import { useParams } from 'react-router-dom'

import { Heading, Icon, Text } from '@gorgias/axiom'

import loadingStaticIcon from 'assets/img/icons/loading-static.svg'
import Accordion from 'pages/common/components/accordion/Accordion'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'

import { usePostOnboardingTasksSection } from '../../hooks/usePostOnboardingTasksSection'
import { DeploySection } from './DeploySection'
import { TestSection } from './TestSection'
import { TrainSection } from './TrainSection'
import { PostOnboardingStepMetadata } from './types'
import { POST_ONBOARDING_STEPS_METADATA } from './utils'

import css from './PostOnboardingTasksSection.less'

export const PostOnboardingTasksSection = () => {
    const stepsMetadata = Object.values(POST_ONBOARDING_STEPS_METADATA)
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()

    const { step, completedStepsCount, isStepCompleted, updateStep } =
        usePostOnboardingTasksSection({ shopName, shopType })

    return (
        <div className={css.container}>
            <div className={css.header}>
                <Heading size="md">Get started with AI Agent</Heading>
                <div className={css.progress}>
                    <img src={loadingStaticIcon} alt="loading icon" />
                    <Text size="sm" variant="bold">
                        {completedStepsCount} / 3 steps
                    </Text>
                </div>
            </div>

            <Accordion className={css.stepsAccordion}>
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
                                    <TrainSection stepMetadata={stepMetadata} />
                                ) : stepMetadata.stepName === 'TEST' ? (
                                    <TestSection
                                        stepMetadata={stepMetadata}
                                        step={step(stepMetadata.stepName)!}
                                        updateStep={updateStep}
                                    />
                                ) : stepMetadata.stepName === 'DEPLOY' ? (
                                    <DeploySection
                                        stepMetadata={stepMetadata}
                                    />
                                ) : null}
                            </AccordionBody>
                        </AccordionItem>
                    ),
                )}
            </Accordion>
        </div>
    )
}
