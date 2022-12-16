import React, {useState} from 'react'
import uniqueId from 'lodash/uniqueId'

import Caption from 'pages/common/forms/Caption/Caption'
import DropdownInputRow from './DropdownInputRow'

import css from './DropdownInput.less'

interface DropdownInputProps {
    value: string[]
    onChange: (value: string[]) => void
}

interface InternalValue {
    value: string
    id: string
}

export default function DropdownInput(props: DropdownInputProps) {
    // Generate an internal ID for all values to handle drag and drop
    const [values, setValues] = useState<InternalValue[]>(
        props.value.concat(['']).map((value: string) => ({
            value,
            id: uniqueId('dropdown-choice-'),
        }))
    )

    const handleChange = (value: InternalValue[]) => {
        let toSend = value
        if (!value[values.length - 1].value) {
            toSend = toSend.slice(0, value.length - 1)
        } else {
            setValues(
                values.concat([
                    {
                        value: '',
                        id: uniqueId('dropdown-choice-'),
                    },
                ])
            )
        }
        props.onChange(toSend.map((value) => value.value))
    }

    const setValue = (value: string, index: number) => {
        values[index].value = value
        handleChange(values)
    }
    const removeValue = (index: number) => {
        values.splice(index, 1)
        handleChange(values)
    }

    const handleHover = (dragIndex: number, hoverIndex: number) => {
        const next = values.slice()
        next.splice(dragIndex, 1)
        next.splice(hoverIndex, 0, values[dragIndex])
        setValues(next)
    }
    const handleDrop = () => {
        handleChange(values)
    }

    return (
        <>
            {values.map((value, index: number) => (
                <DropdownInputRow
                    key={value.id}
                    value={value.value}
                    onChange={(val) => setValue(val, index)}
                    onRemove={() => removeValue(index)}
                    position={index}
                    id={value.id}
                    onHover={handleHover}
                    onDrop={handleDrop}
                    isLast={index === values.length - 1}
                />
            ))}
            <Caption className={css.lastInput}>
                Use :: to separate nesting levels (e.g.
                Category::Subcategory::Item). Max 5 nesting levels allowed.
            </Caption>
        </>
    )
}
