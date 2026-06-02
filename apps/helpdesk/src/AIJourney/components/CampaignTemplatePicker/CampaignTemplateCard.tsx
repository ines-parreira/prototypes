import { Box, Card, Text } from '@gorgias/axiom'

import type { CampaignTemplate } from 'AIJourney/data/CampaignTemplatesData'

import css from './CampaignTemplatePicker.less'

type CampaignTemplateCardProps = {
    template: CampaignTemplate
    onSelect: (template: CampaignTemplate) => void
}

export const CampaignTemplateCard = ({
    template,
    onSelect,
}: CampaignTemplateCardProps) => (
    <Card
        className={css.card}
        color="content-neutral-default"
        onClick={() => onSelect(template)}
        padding="md"
        gap="xxxs"
    >
        <Box flexDirection="column" gap="xxxs">
            <Text variant="bold" size="md">
                {template.name}
            </Text>
            <Text size="sm" color="content-neutral-secondary">
                {template.description}
            </Text>
        </Box>
    </Card>
)
