import { Box, Icon, Text } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

type SectionHeaderProps = {
    icon: IconName
    label: string
}

export function SectionHeader({ icon, label }: SectionHeaderProps) {
    return (
        <Box alignItems="center" gap="xxxxs">
            <Icon name={icon} size="sm" color="content-neutral-secondary" />
            <Text size="sm" color="content-neutral-secondary">
                {label}
            </Text>
        </Box>
    )
}
