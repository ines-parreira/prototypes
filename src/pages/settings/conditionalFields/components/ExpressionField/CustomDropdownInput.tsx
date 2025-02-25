import React, { forwardRef } from 'react'

import { CustomInputProps } from 'custom-fields/components/MultiLevelSelect/types'
import TextInput from 'pages/common/forms/input/TextInput'

import css from './CustomDropdownInput.less'

export const CustomDropdownInput = forwardRef<
    HTMLInputElement,
    CustomInputProps
>(({ isOpen, ...props }, ref) => {
    return (
        <TextInput
            {...props}
            ref={ref}
            suffix={
                <span className={`material-icons ${css.dropdownArrow}`}>
                    {isOpen ? 'arrow_drop_up' : 'arrow_drop_down'}
                </span>
            }
        />
    )
})
