import React, {useState, SyntheticEvent} from 'react'

import Button from 'pages/common/components/button/Button'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'

export const TITLE_FIELD_LABEL = 'Title'
export const TYPE_FIELD_LABEL = 'Type'
export const SUBMIT_BUTTON_TEXT = 'Submit'
export const CANCEL_BUTTON_TEXT = 'Cancel'

export type FormData<T> = {
    title: string
    type: T
}

export type TypeOption<T> = {
    value: T
    label: string
}

type Props<T extends string> = {
    initialData: Partial<FormData<T>>
    availableTypes: TypeOption<T>[]
    onSubmit: (formData: FormData<T>) => void
    onCancel: () => void
}

export default function FieldEditForm<T extends string>({
    initialData,
    availableTypes,
    onCancel,
    onSubmit,
}: Props<T>) {
    const [title, setTitle] = useState(initialData.title || '')
    const [type, setType] = useState<T | ''>(initialData.type || '')

    const handleCancelClick = (e: SyntheticEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        onCancel()
    }

    const handleFormSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!type) {
            return
        }
        onSubmit({title, type})
    }

    return (
        <form onSubmit={handleFormSubmit}>
            <DEPRECATED_InputField
                type="text"
                name="title"
                label={TITLE_FIELD_LABEL}
                required
                value={title}
                onChange={(title) => setTitle(title)}
            />
            <DEPRECATED_InputField
                type="select"
                name="type"
                label={TYPE_FIELD_LABEL}
                required
                value={type}
                onChange={(type) => setType(type)}
            >
                {availableTypes.map(({value, label}) => (
                    <option key={value} value={value}>
                        {label}
                    </option>
                ))}
            </DEPRECATED_InputField>

            <div>
                <Button type="submit" className="mr-2">
                    {SUBMIT_BUTTON_TEXT}
                </Button>
                <Button
                    intent="secondary"
                    type="button"
                    onClick={handleCancelClick}
                >
                    {CANCEL_BUTTON_TEXT}
                </Button>
            </div>
        </form>
    )
}
