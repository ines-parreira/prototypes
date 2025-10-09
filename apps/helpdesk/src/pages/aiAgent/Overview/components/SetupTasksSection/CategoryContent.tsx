import cn from 'classnames'

import { Icon, Text } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import Accordion from 'pages/common/components/accordion/Accordion'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'
import { getCurrentDomain } from 'state/currentAccount/selectors'

import { usePostStoreInstallationStepsMutation } from '../../../hooks/usePostStoreInstallationStepsMutation'
import { TaskConfig } from './types'

import css from './CategoryContent.less'

export const CategoryContent = ({
    selectedCategoryTasks,
    shopName,
    postGoLiveStepId,
}: {
    selectedCategoryTasks: TaskConfig[]
    shopName: string
    postGoLiveStepId?: string
}) => {
    const accountDomain = useAppSelector(getCurrentDomain)

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
    }
    return (
        <div className={css.groupContent}>
            <Accordion className={css.stepsAccordion}>
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
                                />
                            </AccordionBody>
                        </AccordionItem>
                    )
                })}
            </Accordion>
        </div>
    )
}
