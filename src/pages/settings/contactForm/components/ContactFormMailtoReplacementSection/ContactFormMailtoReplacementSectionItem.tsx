import React from 'react'
import CheckBox from 'pages/common/forms/CheckBox'

type ContactFormMailtoReplacementSectionItemProps = {
    value: string
    checkedItems: string[]
    onChange: (checkedItems: string[]) => void
}

const ContactFormMailtoReplacementSectionItem = ({
    checkedItems,
    value,
    onChange,
}: ContactFormMailtoReplacementSectionItemProps) => {
    const isChecked = checkedItems.includes(value)
    const handleChange = () => {
        const newSelectedItems = isChecked
            ? checkedItems.filter((item) => item !== value)
            : [...checkedItems, value]

        onChange(newSelectedItems)
    }

    return (
        <CheckBox isChecked={isChecked} onChange={handleChange}>
            {value}
        </CheckBox>
    )
}

export default ContactFormMailtoReplacementSectionItem
