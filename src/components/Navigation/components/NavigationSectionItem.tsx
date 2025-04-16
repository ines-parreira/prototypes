import classNames from 'classnames'

import css from './NavigationSectionItem.less'

export const DisplayType = {
    Default: 'default',
    Indent: 'indent',
} as const

type PolymorphicProps<E extends React.ElementType> = React.PropsWithChildren<
    React.ComponentPropsWithoutRef<E> & {
        as?: E
    }
>

type NavigationSectionItemProps<E extends React.ElementType> =
    PolymorphicProps<E> & {
        isSelected?: boolean
        displayType?: (typeof DisplayType)[keyof typeof DisplayType]
    }

export function NavigationSectionItem<E extends React.ElementType = 'div'>({
    children,
    isSelected,
    displayType = DisplayType.Default,
    className,
    as,
    ...props
}: NavigationSectionItemProps<E>) {
    const Component = as || 'div'

    return (
        <Component
            {...props}
            data-selected={isSelected}
            data-display-type={displayType}
            className={classNames(css.item, className)}
        >
            {children}
        </Component>
    )
}
