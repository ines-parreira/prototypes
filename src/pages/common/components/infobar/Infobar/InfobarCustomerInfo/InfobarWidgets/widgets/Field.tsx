import React, {SyntheticEvent, useMemo, useState} from 'react'
import classnames from 'classnames'
import {Popover, PopoverBody} from 'reactstrap'
import {Map} from 'immutable'

import {useAppNode} from 'appNode'
import {LeafTypes} from 'models/widget/types'
import {
    removeEditedWidget,
    startWidgetEdition,
    stopWidgetEdition,
    updateEditedWidget,
} from 'state/widgets/actions'
import useId from 'hooks/useId'
import useAppDispatch from 'hooks/useAppDispatch'
import FieldEditForm, {FormData, TypeOption} from 'infobar/ui/FieldEditForm'
import {IntegrationType} from 'models/integration/constants'

import css from './Field.less'
import {Copy} from './CopyButton'

export const EDIT_BUTTON_TEXT = 'edit'
export const DELETE_BUTTON_TEXT = 'delete'
export const TYPE_OPTIONS: TypeOption<LeafTypes>[] = [
    {
        value: 'text',
        label: 'Text',
    },
    {
        value: 'age',
        label: 'Age',
    },
    {
        value: 'email',
        label: 'Email',
    },
    {
        value: 'boolean',
        label: 'Boolean (true/false)',
    },
    {value: 'editableList', label: 'Editable List'},
    {
        value: 'array',
        label: 'List',
    },
    {
        value: 'sentiment',
        label: 'Sentiment',
    },
    {
        value: 'rating',
        label: 'Rating',
    },
    {
        value: 'points',
        label: 'Points',
    },
    {
        value: 'percent',
        label: 'Percent',
    },
]

type Props = {
    value: (string | number | boolean | Record<string, unknown>)[] | unknown
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
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const appNode = useAppNode()
    const uniqueId = 'field-widget-' + useId()
    const title = template.get('title') as string

    const handleEditClick = (e: SyntheticEvent<HTMLElement>) => {
        e.stopPropagation()
        if (isEditing) {
            dispatch(
                startWidgetEdition(template.get('templatePath', '') as string)
            )
            setIsPopoverOpen(true)
        }
    }

    const handleDeleteClick = (e: SyntheticEvent<HTMLElement>) => {
        e.stopPropagation()
        if (isEditing) {
            const ap = template.get('absolutePath') as string[]
            const tp = template.get('templatePath') as string
            dispatch(removeEditedWidget(tp, ap))
        }
    }

    const handlePopoverToggle = () => {
        if (isPopoverOpen) {
            setIsPopoverOpen(false)
            dispatch(stopWidgetEdition())
        }
    }

    const handleFieldEditCancel = () => {
        setIsPopoverOpen(false)
        dispatch(stopWidgetEdition())
    }

    const handleFieldEditSubmit = (formData: FormData<LeafTypes>) => {
        setIsPopoverOpen(false)
        dispatch(updateEditedWidget(formData))
        dispatch(stopWidgetEdition())
    }

    // keep the unscoped class here to have drag and drop greying feature
    const className = classnames(`${css.widgetField} widget-field draggable`, {
        [css.widgetFieldEditing]: isEditing,
    })

    let path = template.get('path')
    if (Array.isArray(path) && path.length) path = path[0]
    const availableTypes = useMemo(() => {
        if (widget.get('type') === IntegrationType.Shopify && path === 'tags') {
            return TYPE_OPTIONS
        }
        return TYPE_OPTIONS.filter((option) => option.value !== 'editableList')
    }, [widget, path])

    return (
        <div id={uniqueId} className={className}>
            <span className={css.widgetFieldLabel}>{title}:</span>
            <span
                className={classnames(css.widgetFieldValue, {
                    [css.overflow]: type === 'editableList',
                })}
            >
                {value}
                {!isEditing && copyableValue && (
                    <Copy
                        value={copyableValue}
                        className={css.copyButton}
                        name={title}
                        onCopyMessage={`${title} copied to clipboard`}
                    />
                )}
            </span>
            {isEditing && (
                <>
                    <span className={css.widgetFieldTools}>
                        <i
                            className={`material-icons ${css.widgetFieldToolIcon}`}
                            onClick={handleEditClick}
                        >
                            {EDIT_BUTTON_TEXT}
                        </i>
                        <i
                            className={`material-icons text-danger ${css.widgetFieldToolIcon}`}
                            onClick={handleDeleteClick}
                        >
                            {DELETE_BUTTON_TEXT}
                        </i>
                    </span>
                    <Popover
                        placement="left"
                        isOpen={isPopoverOpen}
                        target={uniqueId}
                        toggle={handlePopoverToggle}
                        trigger="legacy"
                        container={appNode ?? document.body}
                    >
                        <PopoverBody>
                            <FieldEditForm
                                initialData={{
                                    title: template.get('title') as string,
                                    type: template.get('type') as LeafTypes,
                                }}
                                availableTypes={availableTypes}
                                onCancel={handleFieldEditCancel}
                                onSubmit={handleFieldEditSubmit}
                            />
                        </PopoverBody>
                    </Popover>
                </>
            )}
        </div>
    )
}
