import { useEffect, useRef, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import cn from 'classnames'

import { Icon, Text } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { usePostStoreInstallationStepsMutation } from 'pages/aiAgent/hooks/usePostStoreInstallationStepsMutation'
import Accordion from 'pages/common/components/accordion/Accordion'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'
import { getCurrentDomain } from 'state/currentAccount/selectors'

import type { TaskConfig } from './types'
import { getFirstIncompleteStep } from './utils/utils'

import css from './CategoryContent.less'

export const CategoryContent = ({
    selectedCategoryTasks,
    shopName,
    shopType,
    postGoLiveStepId,
}: {
    selectedCategoryTasks: TaskConfig[]
    shopName: string
    shopType: string
    postGoLiveStepId?: string
}) => {
    const accountDomain = useAppSelector(getCurrentDomain)
    const [expandedStep, setExpandedStep] = useState<string | null>(
        getFirstIncompleteStep(selectedCategoryTasks),
    )
    const previousTasksRef = useRef(selectedCategoryTasks)

    useEffect(() => {
        const hasTasksChanged =
            previousTasksRef.current !== selectedCategoryTasks
        const hasTaskListChanged =
            previousTasksRef.current.length !== selectedCategoryTasks.length ||
            previousTasksRef.current[0]?.stepName !==
                selectedCategoryTasks[0]?.stepName

        if (hasTasksChanged && hasTaskListChanged) {
            setExpandedStep(getFirstIncompleteStep(selectedCategoryTasks))
        }

        previousTasksRef.current = selectedCategoryTasks
    }, [selectedCategoryTasks])

    const { updateStepConfiguration } = usePostStoreInstallationStepsMutation({
        accountDomain: accountDomain,
        shopName,
    })
    const toggleIsCompleted = (task: TaskConfig) => {
        const newIsCompleted = !task.isCompleted
        if (!postGoLiveStepId) {
            return
        }

        updateStepConfiguration(postGoLiveStepId, {
            stepName: task.stepName,
            stepCompletedDatetime: newIsCompleted
                ? new Date().toISOString()
                : null,
        })

        logEvent(SegmentEvent.PostGoLiveMarkedAsCompletedManually, {
            step: task.stepName,
            shop_name: shopName,
            shop_type: shopType,
            action: newIsCompleted ? 'completed' : 'not_completed',
        })
    }

    return (
        <div className={css.groupContent}>
            <Accordion
                className={css.accordionSteps}
                expandedItem={expandedStep}
                onChange={setExpandedStep}
            >
                {selectedCategoryTasks.map((task) => {
                    const BodyComponent = task.body

                    return (
                        <AccordionItem
                            key={task.stepName}
                            id={task.stepName}
                            highlightOnExpand={false}
                            className={css.accordionItem}
                        >
                            <AccordionHeader
                                className={cn(css.stepTitleContainer, {
                                    [css.completed]: task.isCompleted,
                                    [css.expanded]:
                                        expandedStep === task.stepName,
                                })}
                            >
                                <span onClick={() => toggleIsCompleted(task)}>
                                    {task.isCompleted ? (
                                        <Icon size="md" name="circle-check" />
                                    ) : (
                                        <Icon name="shape-circle" size="md" />
                                    )}
                                </span>
                                <div className={css.stepTitle}>
                                    <Text size="md" variant="bold">
                                        {task.displayName}
                                    </Text>
                                </div>
                            </AccordionHeader>
                            <AccordionBody>
                                <BodyComponent
                                    featureUrl={task.featureUrl}
                                    isCompleted={task.isCompleted}
                                    shopName={task.shopName}
                                    shopType={task.shopType}
                                    stepName={task.stepName}
                                    postGoLiveStepId={postGoLiveStepId}
                                    stepStartedDatetime={
                                        task.stepStartedDatetime
                                    }
                                />
                            </AccordionBody>
                        </AccordionItem>
                    )
                })}
            </Accordion>
        </div>
    )
}
