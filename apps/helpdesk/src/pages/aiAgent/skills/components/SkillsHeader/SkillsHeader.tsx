import { useState } from 'react'

import { Box, Button, Heading, Link, Menu, MenuItem } from '@gorgias/axiom'

import { HowSkillsWorkSidePanel } from './HowSkillsWorkSidePanel'

import css from './SkillsHeader.less'

export type SkillsHeaderProps = {
    onViewIntents?: () => void
    onCreateSkillFromScratch?: () => void
    onCreateSkillFromTemplate?: () => void
    showActions?: boolean
}

export const SkillsHeader = ({
    onViewIntents,
    onCreateSkillFromScratch,
    onCreateSkillFromTemplate,
    showActions = true,
}: SkillsHeaderProps) => {
    const [isHowSkillsWorkOpen, setIsHowSkillsWorkOpen] = useState(false)

    return (
        <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            className={css.header}
        >
            <Box flexDirection="row" alignItems="center" gap="sm">
                <Heading size="xl">Skills</Heading>
                <Link
                    size="sm"
                    onClick={(event) => {
                        event.preventDefault()
                        setIsHowSkillsWorkOpen(true)
                    }}
                    href="#"
                >
                    How skills work
                </Link>
            </Box>
            {showActions && (
                <Box flexDirection="row" alignItems="center" gap="xs">
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
                            onAction={onCreateSkillFromScratch}
                        />
                        <MenuItem
                            id="create-skill-from-template"
                            label="From template"
                            onAction={onCreateSkillFromTemplate}
                        />
                    </Menu>
                </Box>
            )}
            <HowSkillsWorkSidePanel
                isOpen={isHowSkillsWorkOpen}
                onOpenChange={setIsHowSkillsWorkOpen}
            />
        </Box>
    )
}
