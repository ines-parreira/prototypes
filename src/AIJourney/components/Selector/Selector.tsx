import { useCallback, useState } from 'react'

import classNames from 'classnames'

import css from './Selector.less'

type SelectorProps = {
    options?: number[]
    value?: number | null
    onChange?: (option?: number) => void
}

export const Selector = ({ options, value, onChange }: SelectorProps) => {
    const [selectedOptionIndex, setSelectedOptionIndex] = useState(
        options?.findIndex((option) => option === value),
    )

    const handleOptionChange = useCallback(
        (optionIndex: number) => {
            setSelectedOptionIndex(optionIndex)
            onChange?.(options?.[optionIndex])
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
                        {option}
                    </button>
                ))}
            </div>
        </>
    )
}
