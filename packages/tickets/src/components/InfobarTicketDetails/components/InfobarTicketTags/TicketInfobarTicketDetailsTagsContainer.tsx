import { Box } from '@gorgias/axiom'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import css from './TicketInfobarTicketDetailsTagsContainer.module.less'

export function TicketInfobarTicketDetailsTagsContainer({
    children,
}: {
    children: React.ReactNode
}) {
    const hasNewOrdersSidebar = useFlag(FeatureFlagKey.NewOrdersSidebar)
    return (
        <Box className={hasNewOrdersSidebar ? css.containerFF : css.container}>
            {children}
        </Box>
    )
}
