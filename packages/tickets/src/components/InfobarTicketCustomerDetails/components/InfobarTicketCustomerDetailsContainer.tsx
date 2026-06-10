import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { Box } from '@gorgias/axiom'

import css from './InfobarTicketCustomerDetailsContainer.less'

type InfobarTicketCustomerDetailsContainerProps = {
    children: React.ReactNode
}

export function InfobarTicketCustomerDetailsContainer({
    children,
}: InfobarTicketCustomerDetailsContainerProps) {
    const hasNewOrdersSidebar = useFlag(FeatureFlagKey.NewOrdersSidebar)

    return (
        <Box
            className={css.container}
            flexDirection="column"
            gap="xs"
            paddingTop={hasNewOrdersSidebar ? undefined : 'md'}
            paddingBottom="sm"
        >
            {children}
        </Box>
    )
}
