import { useCallback, useMemo, useState } from 'react'

import classNames from 'classnames'

import css from './Switch.less'

type SwitchProps = {
    isChecked: boolean
    onChange: () => void
}

export const Switch = ({ isChecked, onChange }: SwitchProps) => {
    const [isHovered, setIsHovered] = useState(false)

    const handleClick = useCallback(() => {
        onChange?.()
    }, [onChange])

    const switchClass = useMemo(() => {
        return classNames(css.switch, {
            [css['switch--checked']]: isChecked,
        })
    }, [isChecked])

    const handleOnMouseOver = useCallback(() => {
        setIsHovered(true)
    }, [])
    const handleOnMouseOut = useCallback(() => {
        setIsHovered(false)
    }, [])

    return (
        <>
            <div
                className={switchClass}
                onMouseOver={handleOnMouseOver}
                onFocus={handleOnMouseOver}
                onMouseOut={handleOnMouseOut}
                onBlur={handleOnMouseOut}
            >
                <input
                    checked={isChecked}
                    className={css.switchInput}
                    onChange={handleClick}
                    type="checkbox"
                />
                <div
                    className={classNames(css.switchKnob, {
                        [css['switchKnob--hovered']]: isHovered,
                        [css['switchKnob--checked']]: isChecked,
                    })}
                />
            </div>
        </>
    )
}
