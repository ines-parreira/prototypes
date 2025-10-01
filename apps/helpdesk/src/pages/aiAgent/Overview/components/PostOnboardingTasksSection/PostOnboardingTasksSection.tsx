import { Heading, Icon, Text } from '@gorgias/axiom'

import loadingStaticIcon from 'assets/img/icons/loading-static.svg'
import Accordion from 'pages/common/components/accordion/Accordion'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'

import { DeploySection } from './DeploySection'
import { TestSection } from './TestSection'
import { TrainSection } from './TrainSection'
import { POST_ONBOARDING_TASKS } from './utils'

import css from './PostOnboardingTasksSection.less'

export const PostOnboardingTasksSection = () => {
    const items = Object.values(POST_ONBOARDING_TASKS)

    return (
        <div className={css.container}>
            <div className={css.header}>
                <Heading size="md">Get started with AI Agent</Heading>
                <div className={css.progress}>
                    <img src={loadingStaticIcon} alt="loading icon" />
                    <Text size="sm" variant="bold">
                        0 / 3 steps
                    </Text>
                </div>
            </div>

            <Accordion className={css.stepsAccordion}>
                {items.map((task: any) => (
                    <AccordionItem
                        key={task.stepName}
                        id={task.stepName}
                        className={css.stepItem}
                        highlightOnExpand={false}
                    >
                        <AccordionHeader className={css.stepHeader}>
                            <div className={css.stepTitleContainer}>
                                {task.isCompleted ? (
                                    <Icon name="circle-check" />
                                ) : (
                                    <Icon name="shape-circle" />
                                )}
                                <Heading size="sm">{task.stepTitle}</Heading>
                            </div>
                        </AccordionHeader>
                        <AccordionBody>
                            {task.stepName === 'TRAIN' ? (
                                <TrainSection task={task} />
                            ) : task.stepName === 'TEST' ? (
                                <TestSection task={task} />
                            ) : task.stepName === 'DEPLOY' ? (
                                <DeploySection task={task} />
                            ) : null}
                        </AccordionBody>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}
