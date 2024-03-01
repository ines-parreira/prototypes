import React, {useMemo} from 'react'
import {Map} from 'immutable'

import {LEAF_TYPES} from 'models/widget/constants'
import {isLeafType, LeafTypes} from 'models/widget/types'
import {
    removeEditedWidget,
    startWidgetEdition,
    stopWidgetEdition,
    updateEditedWidget,
} from 'state/widgets/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import UIField from 'infobar/ui/Field'
import {FormData, TypeOption} from 'infobar/ui/Field/FieldEditForm'
import {IntegrationType} from 'models/integration/constants'
import CopyButton from 'infobar/components/CopyButton'

export const EDIT_BUTTON_TEXT = 'edit'
export const DELETE_BUTTON_TEXT = 'delete'

export const LEAF_TYPE_LABELS = {
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
    [LEAF_TYPES.EDITABLE_LIST]: 'Editable List',
} as const

export const TYPE_OPTIONS: TypeOption<LeafTypes>[] = Object.values(
    LEAF_TYPES
).map((type) => {
    return {
        value: type,
        label: LEAF_TYPE_LABELS[type],
    }
})

type Props = {
    value: unknown
    type: string
    isEditing: boolean
    widget: Map<string, unknown>
    template: Map<string, unknown>
    copyableValue: string | null
}

export default function Field({
    isEditing = false,
    template,
    value,
    type,
    copyableValue,
    widget,
}: Props) {
    const dispatch = useAppDispatch()

    const title = template.get('title') as string
    const absolutePath = template.get('absolutePath') as string[]
    const templatePath = template.get('templatePath') as string

    const handleEditionStart = () =>
        dispatch(startWidgetEdition(template.get('templatePath', '') as string))

    const handleEditionStop = () => {
        dispatch(stopWidgetEdition())
    }

    const handleDelete = () => {
        dispatch(removeEditedWidget(templatePath, absolutePath))
    }

    const handleSubmit = (formData: FormData<LeafTypes>) => {
        dispatch(updateEditedWidget(formData))
    }

    let path = template.get('path')
    if (Array.isArray(path) && path.length) path = path[0]
    const availableTypes = useMemo(() => {
        if (widget.get('type') === IntegrationType.Shopify && path === 'tags') {
            return TYPE_OPTIONS
        }
        return TYPE_OPTIONS.filter((option) => option.value !== 'editableList')
    }, [widget, path])

    return (
        <UIField
            title={title}
            value={value}
            type={isLeafType(type) ? type : LEAF_TYPES.TEXT}
            availableTypes={availableTypes}
            isEditionMode={isEditing}
            valueShouldOverflow={type === LEAF_TYPES.EDITABLE_LIST}
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
