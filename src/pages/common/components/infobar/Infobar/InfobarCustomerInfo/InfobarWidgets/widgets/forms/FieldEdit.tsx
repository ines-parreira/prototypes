import React, {useState, SyntheticEvent} from 'react'
import {Form} from 'reactstrap'
import {Map} from 'immutable'

import {PartialTemplate} from 'models/widget/types'
import {IntegrationType} from 'models/integration/types'
import Button from 'pages/common/components/button/Button'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'

export const TITLE_FIELD_LABEL = 'Title'
export const TYPE_FIELD_LABEL = 'Type'
export const SUBMIT_BUTTON_TEXT = 'Submit'
export const CANCEL_BUTTON_TEXT = 'Cancel'

type Props = {
    template: Map<string, unknown>
    widget: Map<string, unknown>
    onSubmit: (partialTemplate: PartialTemplate) => void
    onCancel: () => void
}

export default function FieldEdit({
    template,
    widget,
    onCancel,
    onSubmit,
}: Props) {
    const [title, setTitle] = useState(template.get('title', ''))
    const [type, setType] = useState(template.get('type', ''))

    let path = template.get('path')
    if (Array.isArray(path) && path.length) path = path[0]

    const handleCancelClick = (e: SyntheticEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        onCancel()
    }

    const handleFormSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        onSubmit({title, type} as PartialTemplate)
    }

    return (
        <Form onSubmit={handleFormSubmit}>
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
                <option value="text">Text</option>
                <option value="date">Date</option>
                <option value="age">Age</option>
                <option value="url">Url</option>
                <option value="email">Email</option>
                <option value="boolean">Boolean (true/false)</option>
                {path === 'tags' &&
                    widget.get('type') === IntegrationType.Shopify && (
                        <option value="editableList">Editable List</option>
                    )}
                <option value="array">List</option>
                <option value="sentiment">Sentiment</option>
                <option value="rating">Rating</option>
                <option value="points">Points</option>
                <option value="percent">Percent</option>
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
        </Form>
    )
}
