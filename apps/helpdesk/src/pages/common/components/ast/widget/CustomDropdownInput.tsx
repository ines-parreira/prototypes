import { ForwardedRef, forwardRef } from 'react'

import { CustomInputProps } from 'custom-fields/components/MultiLevelSelect/types'

import css from './CustomDropdownInput.less'

export const CustomDropdownInput = forwardRef(
    (
        { value, placeholder, onFocus }: CustomInputProps,
        ref: ForwardedRef<HTMLDivElement>,
    ) => {
        const values = value.split(',')

        return (
            <div
                ref={ref}
                className={css.customDropdownInput}
                onClick={onFocus}
            >
                {!!value ? (
                    values.map((v) => <span key={v}>{v}</span>)
                ) : (
                    <span>{placeholder}</span>
                )}
            </div>
        )
    },
)
