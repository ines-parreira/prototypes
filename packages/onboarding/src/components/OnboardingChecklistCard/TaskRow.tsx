import { Box, Icon, Text } from '@gorgias/axiom'

import type { ChecklistTask } from './OnboardingChecklistCard.types'

import styles from './OnboardingChecklistCard.module.less'

export type TaskRowProps = {
    task: ChecklistTask
}

export function TaskRow({ task }: TaskRowProps) {
    const isCompleted = task.status === 'completed'
    const colorToken = isCompleted
        ? 'content-neutral-tertiary'
        : 'content-neutral-default'

    return (
        <Box flexDirection="row" alignItems="center" gap="xs" w="100%">
            <Icon
                name={isCompleted ? 'check-circle' : 'shape-circle'}
                size="sm"
                color={colorToken}
                alt={isCompleted ? 'Completed' : 'Not completed'}
            />
            <Text
                size="sm"
                color={colorToken}
                className={isCompleted ? styles.taskLabelCompleted : undefined}
            >
                {task.content}
            </Text>
        </Box>
    )
}
