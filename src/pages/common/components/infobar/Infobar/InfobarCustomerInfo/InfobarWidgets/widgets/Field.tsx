import React, {SyntheticEvent, useState} from 'react'
import classnames from 'classnames'
import {Popover, PopoverBody} from 'reactstrap'
import {Map} from 'immutable'

import {useAppNode} from 'appNode'
import {PartialTemplate} from 'models/widget/types'
import {
    removeEditedWidget,
    startWidgetEdition,
    stopWidgetEdition,
    updateEditedWidget,
} from 'state/widgets/actions'
import useId from 'hooks/useId'
import useAppDispatch from 'hooks/useAppDispatch'

import FieldEdit from './forms/FieldEdit'
import css from './Field.less'
import {Copy} from './CopyButton'

export const EDIT_BUTTON_TEXT = 'edit'
export const DELETE_BUTTON_TEXT = 'delete'

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
            dispatch(stopWidgetEdition())
        }
    }

    const handleFieldEditCancel = () => {
        setIsPopoverOpen(false)
        dispatch(stopWidgetEdition())
    }

    const handleFieldEditSubmit = (partialTemplate: PartialTemplate) => {
        setIsPopoverOpen(false)
        dispatch(updateEditedWidget(partialTemplate))
        dispatch(stopWidgetEdition())
    }

    // keep the unscoped class here to have drag and drop greying feature
    const className = classnames(`${css.widgetField} widget-field draggable`, {
        [css.widgetFieldEditing]: isEditing,
    })

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
                            <FieldEdit
                                template={template}
                                widget={widget}
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
