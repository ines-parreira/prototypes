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
    const appendPosition = useMemo(
        () =>
            orientation === 'vertical'
                ? ['top', 'middle', 'bottom']
                : ['left', 'center', 'right'],
        [orientation]
    )

    const childrenArray = Children.toArray(children)
    const validChildrenArray = childrenArray.filter((child) =>
        isValidElement(child)
    ) as React.ReactElement[]

    return (
        <span className={classnames(className, css.group, css[orientation])}>
            {validChildrenArray.map((child, index) =>
                cloneElement(child, {
                    appendPosition:
                        validChildrenArray.length < 2
                            ? undefined
                            : index > 0 && index < validChildrenArray.length - 1
                            ? appendPosition[1]
                            : index === 0
                            ? appendPosition[0]
                            : appendPosition[2],
                })
            )}
        </span>
    )
}
