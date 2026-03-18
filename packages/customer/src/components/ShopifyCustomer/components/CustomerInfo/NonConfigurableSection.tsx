import { useState } from 'react'

import { Box, Button, Text, ToggleField } from '@gorgias/axiom'

import css from './EditShopifyFieldsSidePanel.less'

type NonConfigurableSectionProps = {
    label: string
    sectionVisible: boolean
    onToggleSectionVisibility: () => void
    isToggleDisabled?: boolean
    disclaimer?: string
}

export function NonConfigurableSection({
    label,
    sectionVisible,
    onToggleSectionVisibility,
    isToggleDisabled,
    disclaimer = 'Unable to edit this section',
}: NonConfigurableSectionProps) {
    const [isExpanded, setIsExpanded] = useState(true)

    return (
        <div className={css.sectionContainer}>
            <Box
                pt="sm"
                pb="sm"
                pl="md"
                pr="md"
                justifyContent="space-between"
                alignItems="center"
                className={css.sectionHeader}
            >
                <Text variant="bold">{label}</Text>
                <Box gap="sm" alignItems="center">
                    <ToggleField
                        value={sectionVisible}
                        onChange={onToggleSectionVisibility}
                        isDisabled={isToggleDisabled}
                    />
                    <Button
                        variant="tertiary"
                        icon={
                            isExpanded
                                ? 'arrow-chevron-up'
                                : 'arrow-chevron-down'
                        }
                        aria-label={
                            isExpanded
                                ? `Collapse ${label} fields`
                                : `Expand ${label} fields`
                        }
                        onClick={() => setIsExpanded((v) => !v)}
                    />
                </Box>
            </Box>
            {isExpanded && (
                <Box padding="md">
                    <Text size="md" color="content-neutral-secondary">
                        {disclaimer}
                    </Text>
                </Box>
            )}
        </div>
    )
}
