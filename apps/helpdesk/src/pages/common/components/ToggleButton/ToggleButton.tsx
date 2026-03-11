import type { ReactNode } from 'react'
import type React from 'react'
import { createContext, useContext } from 'react'

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
    size?: 'medium' | 'small' | 'extraSmall'
    children?: ReactNode
}

const ToggleButtonContext = createContext<ToggleButtonContextType>({})

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<ButtonGroup />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
export const Wrapper: React.FC<ToggleButtonContextType> = ({
    value,
    type,
    onChange,
    className,
    children,
    size = 'medium',
}) => (
    <ToggleButtonContext.Provider value={{ value, type, onChange, size }}>
        <div
            role="radiogroup"
            className={classnames(css.wrapper, css[size], className)}
        >
            {children}
        </div>
    </ToggleButtonContext.Provider>
)

type OptionProps = {
    value?: any
    className?: string
    children?: ReactNode
}

export const Option: React.FC<OptionProps> = ({
    children,
    value,
    className,
}) => {
    const {
        value: currentValue,
        type,
        onChange,
        size = 'medium',
    } = useContext(ToggleButtonContext)

    const isSelected = currentValue === value

    return (
        <div
            tabIndex={0}
            aria-checked={isSelected}
            role="radio"
            className={classnames(css.option, css[size], className, {
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
