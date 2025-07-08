import React from 'react'

import { CheckBoxField } from '@gorgias/merchant-ui-kit'

import css from './AddMissingKnowledgeCheckbox.less'

interface AddMissingKnowledgeCheckboxProps {
    isChecked: boolean
    onChange: (checked: boolean) => void
}

export const AddMissingKnowledgeCheckbox: React.FC<
    AddMissingKnowledgeCheckboxProps
> = ({ isChecked, onChange }) => {
    return (
        <div className={css.wrapper}>
            <CheckBoxField
                value={isChecked}
                onChange={onChange}
                label="Use in similar requests"
            />
        </div>
    )
}
