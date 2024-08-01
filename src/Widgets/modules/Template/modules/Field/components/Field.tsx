import React from 'react'

import {LEAF_TYPES} from 'models/widget/constants'
import {LeafTemplate, LeafType} from 'models/widget/types'
import {
    removeEditedWidget,
    startWidgetEdition,
    stopWidgetEdition,
    updateEditedWidget,
} from 'state/widgets/actions'
import useAppDispatch from 'hooks/useAppDispatch'

import {FieldEditFormData, HiddenFields} from '../types'
import {TypeOption} from './views/FieldEditForm'
import UIField from './views'
import CopyButton from './CopyButton'

export const EDIT_BUTTON_TEXT = 'edit'
export const DELETE_BUTTON_TEXT = 'delete'

export const LEAF_TYPE_LABELS: Record<LeafType, string> = {
    [LEAF_TYPES.TEXT]: 'Text',
    [LEAF_TYPES.BOOLEAN]: 'Boolean (true/false)',
    [LEAF_TYPES.DATE]: 'Date',
    [LEAF_TYPES.ARRAY]: 'List',
    [LEAF_TYPES.EMAIL]: 'Email',
    [LEAF_TYPES.AGE]: 'Age',
    [LEAF_TYPES.URL]: 'URL',
    [LEAF_TYPES.SENTIMENT]: 'Sentiment',
    [LEAF_TYPES.RATING]: 'Rating',
    [LEAF_TYPES.POINT]: 'Points',
    [LEAF_TYPES.PERCENT]: 'Percent',
} as const

export const TYPE_OPTIONS: TypeOption<LeafType>[] = Object.values(
    LEAF_TYPES
).map((type) => {
    return {
        value: type,
        label: LEAF_TYPE_LABELS[type],
    }
})

type Props = {
    value: unknown
    type: LeafType
    isEditing: boolean
    template: LeafTemplate
    copyableValue: string | null
    valueCanOverflow?: boolean
    editionHiddenFields?: HiddenFields
}

export default function Field({
    isEditing = false,
    template,
    value,
    type,
    copyableValue,
    valueCanOverflow = false,
    editionHiddenFields,
}: Props) {
    const dispatch = useAppDispatch()

    const title = template.title || ''
    const absolutePath = template.absolutePath || []
    const templatePath = template.templatePath || ''

    const handleEditionStart = () =>
        dispatch(startWidgetEdition(template.templatePath || ''))

    const handleEditionStop = () => {
        dispatch(stopWidgetEdition())
    }

    const handleDelete = () => {
        dispatch(removeEditedWidget(templatePath, absolutePath))
    }

    const handleSubmit = (formData: FieldEditFormData<LeafType>) => {
        dispatch(updateEditedWidget(formData))
    }

    return (
        <UIField
            title={title}
            value={value}
            type={type}
            availableTypes={TYPE_OPTIONS}
            isEditionMode={isEditing}
            valueCanOverflow={valueCanOverflow}
            editionHiddenFields={editionHiddenFields}
            copyButton={
                !isEditing && copyableValue ? (
                    <CopyButton
                        value={copyableValue}
                        onCopyMessage={`${title} copied to clipboard`}
                    />
                ) : null
            }
            onEditionStart={handleEditionStart}
            onEditionStop={handleEditionStop}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
        />
    )
}
