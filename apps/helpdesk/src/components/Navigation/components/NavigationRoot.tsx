import { forwardRef } from 'react'

import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'

import { Box } from '@gorgias/axiom'

import type { AccordionRootProps } from 'components/Accordion/components/AccordionRoot'

import { Accordion } from '../../Accordion/Accordion'

export const NavigationRoot = forwardRef<HTMLDivElement, AccordionRootProps>(
    ({ children, ...props }, ref) => {
        const hasWayfindingMS1Flag = useHelpdeskV2WayfindingMS1Flag()

        return (
            <Accordion.Root ref={ref} {...props}>
                {hasWayfindingMS1Flag ? (
                    <Box gap="xxs" flexDirection="column">
                        {children}
                    </Box>
                ) : (
                    children
                )}
            </Accordion.Root>
        )
    },
)
