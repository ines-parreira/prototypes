import React, {useState, SyntheticEvent} from 'react'
import {Form} from 'reactstrap'
import {Map} from 'immutable'

import {PartialTemplate} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/types'
import {IntegrationType} from 'models/integration/types'
import Button from 'pages/common/components/button/Button'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import {WidgetsActionsType} from 'pages/common/components/infobar/Infobar/Infobar'

type Props = {
    template: Map<string, unknown>
    actions: WidgetsActionsType
    widget: Map<string, unknown>
}

export default function FieldEdit({template, actions, widget}: Props) {
    const [title, setTitle] = useState(template.get('title', ''))
    const [type, setType] = useState(template.get('type', ''))

    let path = template.get('path')
    if (Array.isArray(path) && path.length) path = path[0]

    const closePopup = (e?: SyntheticEvent<HTMLButtonElement>) => {
        e?.stopPropagation()
        actions.stopWidgetEdition()
    }

    const handleSubmit = (e?: SyntheticEvent<HTMLFormElement>) => {
        e?.preventDefault()
        actions.updateEditedWidget({title, type} as PartialTemplate)
        closePopup()
    }

    return (
        <Form onSubmit={handleSubmit}>
            <DEPRECATED_InputField
                type="text"
                name="title"
                label="Title"
                required
                value={title}
                onChange={(title) => setTitle(title)}
            />
            <DEPRECATED_InputField
                type="select"
                name="type"
                label="Type"
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
                    Submit
                </Button>
                <Button intent="secondary" type="button" onClick={closePopup}>
                    Cancel
                </Button>
            </div>
        </Form>
    )
}
