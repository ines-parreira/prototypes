import { Box, Button, Heading, Menu, MenuItem } from '@gorgias/axiom'

import css from './SkillsHeader.less'

export type SkillsHeaderProps = {
    onViewIntents?: () => void
    onCreateSkill?: () => void
}

const LEARNING_RESOURCES_URL = 'https://link.gorgias.com/bdb652'

export const SkillsHeader = ({
    onViewIntents,
    onCreateSkill,
}: SkillsHeaderProps) => {
    const handleLearningResources = () => {
        window.open(LEARNING_RESOURCES_URL, '_blank', 'noopener,noreferrer')
    }

    return (
        <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            className={css.header}
        >
            <Heading size="xl">Skills</Heading>
            <Box flexDirection="row" alignItems="center" gap="xs">
                <Button
                    onClick={handleLearningResources}
                    variant="tertiary"
                    trailingSlot="external-link"
                    aria-label="Learning resources"
                >
                    Learning resources
                </Button>
                <Button
                    onClick={onViewIntents}
                    aria-label="View intents"
                    variant="secondary"
                >
                    View intents
                </Button>
                <Menu
                    trigger={
                        <Button
                            variant="primary"
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
        </Box>
    )
}
