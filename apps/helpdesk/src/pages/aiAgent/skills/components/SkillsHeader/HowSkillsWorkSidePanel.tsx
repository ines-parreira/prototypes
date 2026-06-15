import { SCREEN_SIZE, useScreenSize } from '@gorgias/toolkit-react'

import {
    Box,
    Button,
    Card,
    Disclosure,
    DisclosureHeader,
    DisclosurePanel,
    Heading,
    OverlayContent,
    OverlayHeader,
    SidePanel,
    Text,
} from '@gorgias/axiom'

import { SkillsVideo } from '../SkillsVideo/SkillsVideo'

import css from './HowSkillsWorkSidePanel.less'

const LEARNING_RESOURCES_URL = 'https://link.gorgias.com/9a19f9'

const SECTIONS = [
    {
        id: 'what-are-skills',
        title: 'What are skills?',
        content:
            'Skills are step-by-step instructions tied to specific customer intents, like a return or cancellation request. An intent is the underlying reason a customer is reaching out, detected automatically from their message. When a conversation’s intent is detected, AI Agent follows the matching skill.',
    },
    {
        id: 'how-skills-knowledge-guidance-work-together',
        title: 'How do skills, knowledge and guidance work together?',
        content:
            'Skills are the main instructions for handling specific conversation types like returns or order issues. Knowledge (including guidance) works alongside skills as reference material. When a conversation matches a skill, AI Agent follows your skill instructions and can draw on your knowledge and guidance to fill in details that skills don’t cover.',
    },
    {
        id: 'do-i-need-to-set-up-everything-manually',
        title: 'Do I need to set up everything manually?',
        content:
            'No. We’ve built recommended skills for you, covering the most common ecommerce conversation types. Most merchants can get started with these alone. You can customize these to fit your needs, and can always find the recommended templates to reference as needed.',
    },
    {
        id: 'how-many-skills-do-i-need',
        title: 'How many skills do I need?',
        content:
            'Fewer than you might think. We’ve built a core set of templates that cover the majority of e-commerce support conversations. Most merchants need around 8-10 skills. A small, focused set is easier to maintain and gives you one clear place to manage each conversation type.',
    },
] as const

type HowSkillsWorkSidePanelProps = {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export const HowSkillsWorkSidePanel = ({
    isOpen,
    onOpenChange,
}: HowSkillsWorkSidePanelProps) => {
    const screenSize = useScreenSize()
    const isSmallScreen =
        screenSize === SCREEN_SIZE.SMALL || screenSize === SCREEN_SIZE.MEDIUM

    const handleLearningResources = () => {
        window.open(LEARNING_RESOURCES_URL, '_blank', 'noopener,noreferrer')
    }

    return (
        <SidePanel
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size={isSmallScreen ? undefined : 'md'}
            width={isSmallScreen ? '100vw' : undefined}
        >
            <OverlayHeader
                title={
                    <Box
                        flexDirection="row"
                        alignItems="center"
                        gap="xs"
                        flexWrap="wrap"
                    >
                        <Heading size="lg">How skills work</Heading>
                        <Button
                            onClick={handleLearningResources}
                            variant="tertiary"
                            trailingSlot="external-link"
                            aria-label="Learning resources"
                        >
                            Learning resources
                        </Button>
                    </Box>
                }
                description={
                    <Text size="md" color="var(--content-neutral-secondary)">
                        Skills give you control over how AI Agent handles each
                        conversation type. Knowledge and guidance work alongside
                        skills to support questions they don’t cover.
                    </Text>
                }
            />
            <OverlayContent flexDirection="column" gap="lg">
                <SkillsVideo inline />
                <Box flexDirection="column" gap="xs" className={css.sections}>
                    {SECTIONS.map((section) => (
                        <Card key={section.id}>
                            <Disclosure>
                                <DisclosureHeader
                                    title={
                                        <Text size="md" variant="medium">
                                            {section.title}
                                        </Text>
                                    }
                                />
                                <DisclosurePanel>
                                    <Text
                                        size="md"
                                        color="var(--content-neutral-default)"
                                    >
                                        {section.content}
                                    </Text>
                                </DisclosurePanel>
                            </Disclosure>
                        </Card>
                    ))}
                </Box>
            </OverlayContent>
        </SidePanel>
    )
}
