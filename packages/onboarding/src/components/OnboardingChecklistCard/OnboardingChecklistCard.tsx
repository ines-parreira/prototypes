import { useMemo, useState } from 'react'

import { AnimatedChevronIcon, Box, Card, Separator, Text } from '@gorgias/axiom'

import type { ChecklistTask } from './OnboardingChecklistCard.types'
import { ProgressRing } from './ProgressRing'
import { TaskRow } from './TaskRow'

import styles from './OnboardingChecklistCard.module.less'

export type OnboardingChecklistCardProps = {
    tasks: ChecklistTask[]
    /** Header label. Defaults to "Get started". */
    title?: string
    defaultCollapsed?: boolean
}

export function OnboardingChecklistCard({
    tasks,
    title = 'Get started',
    defaultCollapsed = false,
}: OnboardingChecklistCardProps) {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

    const completed = useMemo(
        () => tasks.filter((task) => task.status === 'completed').length,
        [tasks],
    )

    const toggleCollapsed = () => setIsCollapsed((collapsed) => !collapsed)

    if (tasks.length === 0) return null

    if (isCollapsed) {
        return (
            <Box
                as="button"
                type="button"
                aria-label="Expand checklist"
                onClick={toggleCollapsed}
                display="inline-flex"
                flexDirection="row"
                alignItems="center"
                gap="xxxs"
                p="xs"
                className={styles.pill}
            >
                <ProgressRing value={completed} total={tasks.length} />
                <Box flexDirection="row" alignItems="center" gap="xs">
                    <Text
                        as="span"
                        size="sm"
                        variant="bold"
                        color="content-neutral-default"
                    >
                        {title}
                    </Text>
                    <Text as="span" size="xs" color="content-neutral-tertiary">
                        {completed} of {tasks.length}
                    </Text>
                </Box>
                <AnimatedChevronIcon direction="right" size="sm" />
            </Box>
        )
    }

    return (
        <Card elevation="mid" flexDirection="column" gap="sm" p="md" w="100%">
            <Box
                as="button"
                type="button"
                aria-label="Collapse checklist"
                onClick={toggleCollapsed}
                flexDirection="row"
                alignItems="center"
                gap="xxxs"
                w="100%"
                className={styles.titleBar}
            >
                <ProgressRing value={completed} total={tasks.length} />
                <Text
                    as="span"
                    size="sm"
                    variant="bold"
                    color="content-neutral-default"
                >
                    {title}
                </Text>
                <Box flexGrow={1} />
                <Text as="span" size="xs" color="content-neutral-tertiary">
                    {completed} of {tasks.length}
                </Text>
                <AnimatedChevronIcon direction="down" size="sm" />
            </Box>
            <Separator />
            <Box flexDirection="column" gap="sm" w="100%">
                {tasks.map((task) => (
                    <TaskRow key={task.content} task={task} />
                ))}
            </Box>
        </Card>
    )
}
