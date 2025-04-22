import { forwardRef } from 'react'

import type { AccordionRootProps } from 'components/Accordion/components/AccordionRoot'

import { Accordion } from '../../Accordion/Accordion'

export const NavigationRoot = forwardRef<HTMLDivElement, AccordionRootProps>(
    ({ children, ...props }, ref) => {
        return (
            <Accordion.Root ref={ref} {...props}>
                {children}
            </Accordion.Root>
        )
    },
)
