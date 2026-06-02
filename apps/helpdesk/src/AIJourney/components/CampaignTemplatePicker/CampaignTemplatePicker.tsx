import { Box, Heading, Modal, OverlayHeader } from '@gorgias/axiom'

import type { CampaignTemplate } from 'AIJourney/data/CampaignTemplatesData'
import { CampaignTemplatesList } from 'AIJourney/data/CampaignTemplatesData'

import { CampaignTemplateCard } from './CampaignTemplateCard'

import css from './CampaignTemplatePicker.less'

type CampaignTemplatePickerProps = {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSelectTemplate: (template: CampaignTemplate) => void
}

export const CampaignTemplatePicker = ({
    isOpen,
    onOpenChange,
    onSelectTemplate,
}: CampaignTemplatePickerProps) => (
    <Modal size="xl" isOpen={isOpen} isDismissable onOpenChange={onOpenChange}>
        <OverlayHeader title={<Heading>Templates</Heading>} />
        <Box display="grid" gap="md" className={css.templateGrid}>
            {CampaignTemplatesList.map((template) => (
                <CampaignTemplateCard
                    key={template.id}
                    template={template}
                    onSelect={onSelectTemplate}
                />
            ))}
        </Box>
    </Modal>
)
