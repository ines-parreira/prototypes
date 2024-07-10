import React, {useContext, useMemo} from 'react'

import {LEAF_TYPES} from 'models/widget/constants'
import {isLeafType, LeafTemplate, LeafTypes} from 'models/widget/types'
import {
    removeEditedWidget,
    startWidgetEdition,
    stopWidgetEdition,
    updateEditedWidget,
} from 'state/widgets/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import UIField from 'Infobar/features/Field/display'
import {
    FormData,
    TypeOption,
} from 'Infobar/features/Field/display/FieldEditForm'
import {IntegrationType} from 'models/integration/constants'
import CopyButton from 'Infobar/features/Field/components/CopyButton'
import {WidgetContext} from 'Infobar/features/Widget/contexts/WidgetContext'

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
    template: LeafTemplate
    copyableValue: string | null
}

export default function Field({
    isEditing = false,
    template,
    value,
    type,
    copyableValue,
}: Props) {
    const dispatch = useAppDispatch()
    const widget = useContext(WidgetContext)

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

    const handleSubmit = (formData: FormData<LeafTypes>) => {
        dispatch(updateEditedWidget(formData))
    }

    const availableTypes = useMemo(() => {
        if (
            widget.type === IntegrationType.Shopify &&
            template.path === 'tags'
        ) {
            return TYPE_OPTIONS
        }
        return TYPE_OPTIONS.filter((option) => option.value !== 'editableList')
    }, [widget, template.path])

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
