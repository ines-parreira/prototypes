import classnames from 'classnames'
import React, {
    Children,
    cloneElement,
    createContext,
    isValidElement,
    ReactElement,
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
    isDisabled?: boolean
    orientation?: 'horizontal' | 'vertical'
}

type GroupContextState = {
    isDisabled?: boolean
}

export const GroupContext = createContext<GroupContextState>({})

export default function Group({
    children,
    className,
    isDisabled,
    orientation = 'horizontal',
}: Props) {
    const appendPosition = useMemo(
        () =>
            orientation === 'vertical'
                ? ['top', 'middle', 'bottom']
                : ['left', 'center', 'right'],
        [orientation]
    )
    const validChildren = useMemo<ReactElement[]>(
        () => Children.toArray(children).filter(isValidElement),
        [children]
    )

    return (
        <GroupContext.Provider value={{isDisabled}}>
            <span
                className={classnames(className, css.group, css[orientation])}
            >
                {validChildren.map((child, index) =>
                    cloneElement(child, {
                        appendPosition:
                            validChildren.length < 2
                                ? undefined
                                : index > 0 && index < validChildren.length - 1
                                ? appendPosition[1]
                                : index === 0
                                ? appendPosition[0]
                                : appendPosition[2],
                    })
                )}
            </span>
        </GroupContext.Provider>
    )
}
