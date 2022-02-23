import classnames from 'classnames'
import React, {
    Children,
    cloneElement,
    isValidElement,
    ReactNode,
    useMemo,
} from 'react'

import css from './Group.less'

export type AppendPosition =
    | 'left'
    | 'right'
    | 'center'
    | 'top'
    | 'bottom'
    | 'middle'

type Props = {
    children: ReactNode
    className?: string
    orientation?: 'horizontal' | 'vertical'
}

export default function Group({
    children,
    className,
    orientation = 'horizontal',
}: Props) {
    const length = useMemo(() => Children.count(children), [children])
    const appendPosition = useMemo(
        () =>
            orientation === 'vertical'
                ? ['top', 'middle', 'bottom']
                : ['left', 'center', 'right'],
        [orientation]
    )

    return (
        <span className={classnames(className, css.group, css[orientation])}>
            {Children.map(children, (child, index) =>
                isValidElement(child)
                    ? cloneElement(child, {
                          appendPosition:
                              length < 2
                                  ? undefined
                                  : index > 0 && index < length - 1
                                  ? appendPosition[1]
                                  : index === 0
                                  ? appendPosition[0]
                                  : appendPosition[2],
                      })
                    : null
            )}
        </span>
    )
}
