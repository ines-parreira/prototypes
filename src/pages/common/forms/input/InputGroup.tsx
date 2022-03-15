import classnames from 'classnames'
import React, {createContext, ReactNode, useMemo, useState} from 'react'

import Group, {AppendPosition} from 'pages/common/components/layout/Group'

import css from './InputGroup.less'

type Props = {
    appendPosition?: AppendPosition
    children?: ReactNode
    className?: string
    hasError?: boolean
    isDisabled?: boolean
}

type InputGroupContextState = {
    isFocused: boolean
    setIsFocused: (value: boolean) => void
}

export const InputGroupContext = createContext<InputGroupContextState | null>(
    null
)

export default function InputGroup({
    appendPosition,
    children,
    className,
    hasError,
    isDisabled,
}: Props) {
    const [isFocused, setIsFocused] = useState(false)
    const contextValue = useMemo<InputGroupContextState>(
        () => ({
            isFocused,
            setIsFocused,
        }),
        [isFocused, setIsFocused]
    )

    return (
        <InputGroupContext.Provider value={contextValue}>
            <Group
                className={classnames(
                    className,
                    css.wrapper,
                    css[appendPosition || ''],
                    {
                        [css.hasError]: hasError,
                        [css.isFocused]: isFocused,
                    }
                )}
                isDisabled={isDisabled}
            >
                {children}
            </Group>
        </InputGroupContext.Provider>
    )
}
