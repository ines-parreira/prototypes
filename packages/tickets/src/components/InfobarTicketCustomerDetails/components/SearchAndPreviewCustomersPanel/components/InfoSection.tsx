import {
    Box,
    Icon,
    LegacyLoadingSpinner as LoadingSpinner,
    Text,
} from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import css from './InfoSection.less'

export interface InfoSectionProps {
    icon?: IconName | 'loader'
    description?: string
}

export function InfoSection({ icon, description }: InfoSectionProps) {
    const isLoader = icon === 'loader'

    return (
        <Box
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap="sm"
            paddingTop="xxl"
            paddingBottom="xxl"
        >
            {isLoader ? (
                <LoadingSpinner size={24} />
            ) : (
                icon && (
                    <Icon
                        name={icon}
                        size="lg"
                        color="var(--content-neutral-tertiary)"
                    />
                )
            )}
            {description && (
                <Text size="sm" align="center" className={css.infoText}>
                    {description}
                </Text>
            )}
        </Box>
    )
}
