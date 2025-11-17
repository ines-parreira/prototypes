import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useEffect, useState } from 'react'

import classNames from 'classnames'

import css from './Selector.less'

type SelectorProps<T> = {
    options: T[]
    value?: T | null
    onChange?: ((option: T) => void) | Dispatch<SetStateAction<T>>
    enableUnselect?: boolean
}

export const Selector = <T,>({
    options,
    value,
    onChange,
    enableUnselect = false,
}: SelectorProps<T>) => {
    const [selectedOptionIndex, setSelectedOptionIndex] = useState<
        number | undefined
    >(options.findIndex((option) => option === value))

    useEffect(() => {
        if (value) {
            const index = options.findIndex((option) => option === value)
            setSelectedOptionIndex(index >= 0 ? index : undefined)
        }
    }, [options, value])

    const handleOptionChange = useCallback(
        (optionIndex: number) => {
            if (enableUnselect && selectedOptionIndex === optionIndex) {
                setSelectedOptionIndex(undefined)
                onChange?.(undefined as T)
            } else {
                setSelectedOptionIndex(optionIndex)
                onChange?.(options[optionIndex])
            }
        },
        [options, onChange, enableUnselect, selectedOptionIndex],
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
