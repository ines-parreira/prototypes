import { forwardRef } from 'react'

import classNames from 'classnames'

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
    }

export const NavigationSectionItem = forwardRef(function NavigationSectionItem<
    E extends React.ElementType = 'div',
>(
    {
        children,
        isSelected,
        displayType = DisplayType.Default,
        className,
        as,
        ...props
    }: NavigationSectionItemProps<E>,
    ref: React.ComponentPropsWithRef<E>['ref'],
) {
    const Component = as || 'div'

    return (
        <Component
            {...props}
            ref={ref}
            data-selected={isSelected}
            data-display-type={displayType}
            className={classNames(css.item, className)}
        >
            {children}
        </Component>
    )
})
