import React, {createContext, useContext} from 'react'

import classnames from 'classnames'

import css from './ToggleButton.less'

export enum Type {
    Label,
    Icon,
}

type ToggleButtonContextType = {
    value?: any
    type?: Type
    onChange?: (value: any) => void
    className?: string
}

const ToggleButtonContext = createContext<ToggleButtonContextType>({})

export const Wrapper: React.FC<ToggleButtonContextType> = ({
    value,
    type,
    onChange,
    className,
    children,
}) => (
    <ToggleButtonContext.Provider value={{value, type, onChange}}>
        <div role="radiogroup" className={classnames(css.wrapper, className)}>
            {children}
        </div>
    </ToggleButtonContext.Provider>
)

type OptionProps = {
    value?: any
}

export const Option: React.FC<OptionProps> = ({children, value}) => {
    const {
        value: currentValue,
        type,
        onChange,
    } = useContext(ToggleButtonContext)

    const isSelected = currentValue === value

    return (
        <div
            tabIndex={0}
            aria-checked={isSelected}
            role="radio"
            className={classnames(css.option, {
                [css.active]: isSelected,
                [css.withLabel]: type === Type.Label,
                [css.withIcon]: type === Type.Icon,
            })}
            onClick={() => onChange && onChange(value)}
        >
            {children}
        </div>
    )
}
