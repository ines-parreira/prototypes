import { forwardRef } from 'react'

import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import classNames from 'classnames'

import { Box, Icon } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import type { PolymorphicProps } from 'types'

import css from './NavigationSectionItem.less'

export const DisplayType = {
    Default: 'default',
    Indent: 'indent',
} as const

type NavigationSectionItemProps<E extends React.ElementType> =
    PolymorphicProps<E> & {
        isSelected?: boolean
        displayType?: (typeof DisplayType)[keyof typeof DisplayType]
        icon?: IconName
    }

export const NavigationSectionItem = forwardRef(function NavigationSectionItem<
    E extends React.ElementType = 'div',
>(
    {
        children,
        isSelected,
        displayType = DisplayType.Default,
        icon,
        className,
        as,
        ...props
    }: NavigationSectionItemProps<E>,
    ref: React.ComponentPropsWithRef<E>['ref'],
) {
    const hasWayfindingMS1Flag = useHelpdeskV2WayfindingMS1Flag()

    const Component = as || 'div'

    if (hasWayfindingMS1Flag) {
        return (
            <Component
                {...props}
                ref={ref}
                data-selected={isSelected}
                data-display-type={displayType}
                {...(props.id
                    ? { 'data-candu-id': `navbar-section-item-${props.id}` }
                    : {})}
                className={css.item}
            >
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
            </Component>
        )
    }

    return (
        <Component
            {...props}
            ref={ref}
            data-selected={isSelected}
            data-display-type={displayType}
            {...(props.id
                ? { 'data-candu-id': `navbar-section-item-${props.id}` }
                : {})}
            className={classNames(css.item, className)}
        >
            {children}
        </Component>
    )
})
