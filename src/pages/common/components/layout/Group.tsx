import classnames from 'classnames'
import React, {
    Children,
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

type GroupPositionContextState = AppendPosition

export const GroupContext = createContext<GroupContextState | null>(null)
export const GroupPositionContext =
    createContext<GroupPositionContextState | null>(null)

export default function Group({
    children,
    className,
    isDisabled,
    orientation = 'horizontal',
}: Props) {
    const appendPosition: AppendPosition[] = useMemo(
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
                {validChildren.map((child, index) => (
                    <GroupPositionContext.Provider
                        key={index}
                        value={
                            validChildren.length < 2
                                ? null
                                : index > 0 && index < validChildren.length - 1
                                ? appendPosition[1]
                                : index === 0
                                ? appendPosition[0]
                                : appendPosition[2]
                        }
                    >
                        {child}
                    </GroupPositionContext.Provider>
                ))}
            </span>
        </GroupContext.Provider>
    )
}
