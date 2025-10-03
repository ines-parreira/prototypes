import { Icon, Text } from '@gorgias/axiom'

import Accordion from 'pages/common/components/accordion/Accordion'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'

import { Task } from './types'

import css from './CategoryContent.less'

export const CategoryContent = ({
    selectedCategoryTasks,
}: {
    selectedCategoryTasks: Task[]
}) => {
    return (
        <div className={css.groupContent}>
            <Accordion className={css.stepsAccordion}>
                {selectedCategoryTasks.map((task) => (
                    <AccordionItem
                        key={task.name}
                        id={task.name}
                        highlightOnExpand={false}
                        className={css.accordionItem}
                    >
                        <AccordionHeader className={css.stepTitleContainer}>
                            {task.isCompleted ? (
                                <Icon size="md" name="circle-check" />
                            ) : (
                                <Icon name="shape-circle" size="md" />
                            )}
                            <div className={css.stepTitle}>
                                <Text size="md" variant="bold">
                                    {task.name}
                                </Text>
                            </div>
                        </AccordionHeader>
                        <AccordionBody>{task.body}</AccordionBody>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}
