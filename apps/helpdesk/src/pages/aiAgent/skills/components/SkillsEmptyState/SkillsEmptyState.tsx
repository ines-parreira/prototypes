import { Box, Button, Heading, Menu, MenuItem, Text } from '@gorgias/axiom'

import aiAgentNoSkills from 'assets/img/ai-agent/ai-agent-no-skill.svg'

import css from './SkillsEmptyState.less'

export type SkillsEmptyStateProps = {
    onCreateSkill?: () => void
}

export const SkillsEmptyState = ({ onCreateSkill }: SkillsEmptyStateProps) => {
    return (
        <Box
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            width="100%"
            className={css.container}
        >
            <img
                className={css.media}
                src={aiAgentNoSkills}
                alt="No skills yet"
            />
            <Box
                flexDirection="column"
                gap="xs"
                alignItems="center"
                width={600}
                className={css.description}
            >
                <Heading size="lg">No skills yet</Heading>
                <Text size="md" variant="regular" align="center">
                    Skills give you more precise control over how AI Agent
                    handles specific types of conversations. Set up one of the
                    suggested skills above, or create your own from scratch.
                </Text>
            </Box>
            <Menu
                trigger={
                    <Button
                        variant="secondary"
                        trailingSlot="arrow-chevron-down"
                    >
                        Create skill
                    </Button>
                }
            >
                <MenuItem
                    id="create-skill-from-scratch"
                    label="From scratch"
                    onAction={onCreateSkill}
                />
                <MenuItem
                    id="create-skill-from-template"
                    label="From template"
                    onAction={onCreateSkill}
                />
            </Menu>
        </Box>
    )
}
