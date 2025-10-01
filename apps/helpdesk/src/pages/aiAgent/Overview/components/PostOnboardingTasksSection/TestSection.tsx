import { Button, Text } from '@gorgias/axiom'

import { PostOnboardingTask } from './types'

import css from './TestSection.less'

type Props = {
    task: PostOnboardingTask
}
export const TestSection = ({ task }: Props) => {
    return (
        <div className={css.container}>
            <div className={css.leftContent}>
                <Text size="md" variant="regular">
                    {task.stepDescription}
                </Text>
                <Button className={css.testButton}>Test</Button>
            </div>

            <div className={css.rightContent}>
                <img
                    src={task.stepImage}
                    alt="AI Agent testing"
                    className={css.image}
                />
            </div>
        </div>
    )
}
