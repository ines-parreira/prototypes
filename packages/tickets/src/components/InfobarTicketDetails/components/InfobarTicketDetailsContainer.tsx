import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import classNames from 'classnames'
import { Box } from '@gorgias/axiom'

import css from './InfobarTicketDetailsContainer.less'

export function InfobarTicketDetailsContainer({
    children,
}: {
    children: React.ReactNode
}) {
    const hasNewOrdersSidebar = useFlag(FeatureFlagKey.NewOrdersSidebar)

    return (
        <Box
            className={classNames(css.container, {
                [css.containerNoBottomBorder]: hasNewOrdersSidebar,
            })}
            flexDirection="column"
            gap="xs"
            paddingTop={hasNewOrdersSidebar ? undefined : 'md'}
            paddingBottom={hasNewOrdersSidebar ? undefined : 'sm'}
        >
            {children}
        </Box>
    )
}
