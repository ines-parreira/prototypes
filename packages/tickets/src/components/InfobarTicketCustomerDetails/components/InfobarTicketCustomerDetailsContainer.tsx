import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import classNames from 'classnames'

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
        <>
            <Box
                className={classNames(css.container, {
                    [css.withBorder]: !hasNewOrdersSidebar,
                })}
                flexDirection="column"
                gap="xs"
                paddingTop={hasNewOrdersSidebar ? undefined : 'md'}
                paddingBottom="sm"
            >
                {children}
            </Box>
            {hasNewOrdersSidebar && <div className={css.spacer} />}
        </>
    )
}
