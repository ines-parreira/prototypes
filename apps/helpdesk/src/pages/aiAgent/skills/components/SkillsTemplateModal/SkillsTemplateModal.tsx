import { Box, Heading, Modal, OverlayHeader, Text } from '@gorgias/axiom'

import { SkillsTemplateCard } from 'pages/aiAgent/skills/components/SkillsTemplateCard/SkillsTemplateCard'
import type { SkillTemplate } from 'pages/aiAgent/skills/types'

import css from './SkillsTemplateModal.less'

type Props = {
    skillsTemplates: SkillTemplate[]
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onCreateSkillsFromTemplate: (templateId: string) => void
}

export const SkillsTemplateModal: React.FC<Props> = ({
    skillsTemplates,
    isOpen,
    onOpenChange,
    onCreateSkillsFromTemplate,
}) => {
    return (
        <Modal
            size="xl"
            isOpen={isOpen}
            isDismissable
            onOpenChange={onOpenChange}
        >
            <Box flexDirection="column" paddingBottom="26px">
                <OverlayHeader title={<Heading>Skill templates</Heading>} />
                <Text>
                    Start with a template built on best practices from
                    top-performing merchants. These templates cover the majority
                    of conversations most merchants encounter.
                </Text>
            </Box>
            <Box display="grid" gap="md" className={css.templateGrid}>
                {skillsTemplates.map((template) => (
                    <SkillsTemplateCard
                        key={template.id}
                        skillTemplate={template}
                        onCreateSkillsFromTemplate={() =>
                            onCreateSkillsFromTemplate(template.id)
                        }
                    />
                ))}
            </Box>
        </Modal>
    )
}
