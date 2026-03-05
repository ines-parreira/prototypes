import { forwardRef } from 'react'

import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import classNames from 'classnames'

import type { IconName } from '@gorgias/axiom'
import { Box, Icon } from '@gorgias/axiom'

import { Accordion } from 'components/Accordion/Accordion'
import type { AccordionItemTriggerProps } from 'components/Accordion/components/AccordionItemTrigger'

import css from './NavigationSectionTrigger.less'

type NavigationSectionTriggerProps = AccordionItemTriggerProps & {
    icon?: IconName
}

export const NavigationSectionTrigger = forwardRef<
    HTMLButtonElement,
    NavigationSectionTriggerProps
>(function NavigationSectionTrigger(
    { children, icon, className, ...props },
    ref,
) {
    const hasWayfindingMS1Flag = useHelpdeskV2WayfindingMS1Flag()

    return (
        <Accordion.ItemTrigger
            ref={ref}
            {...props}
            className={classNames(css.trigger, className)}
        >
            {hasWayfindingMS1Flag ? (
                <Box alignItems="center" gap="xs" w="100%">
                    {icon && <Icon name={icon} size="sm" />}
                    <Box
                        alignItems="center"
                        gap="xs"
                        justifyContent="space-between"
                        w="100%"
                    >
                        {children}
                    </Box>
                </Box>
            ) : (
                children
            )}
        </Accordion.ItemTrigger>
    )
})
