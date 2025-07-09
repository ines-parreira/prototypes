import { Dispatch, SetStateAction, useCallback } from 'react'

import classNames from 'classnames'

import css from './Selector.less'

type SelectorProps<T> = {
    options: T[]
    value?: T | null
    onChange?: ((option: T) => void) | Dispatch<SetStateAction<T>>
}

export const Selector = <T,>({
    options,
    value,
    onChange,
}: SelectorProps<T>) => {
    const selectedOptionIndex = options?.findIndex((option) => option === value)

    const handleOptionChange = useCallback(
        (optionIndex: number) => {
            onChange?.(options[optionIndex])
        },
        [options, onChange],
    )

    return (
        <>
            <div className={css.selector} role="group">
                {options?.map((option, index) => (
                    <button
                        key={index}
                        className={classNames(css.selectorOption, {
                            [css['selectorOption--selected']]:
                                selectedOptionIndex === index,
                        })}
                        onClick={() => handleOptionChange(index)}
                    >
                        {String(option)}
                    </button>
                ))}
            </div>
        </>
    )
}
