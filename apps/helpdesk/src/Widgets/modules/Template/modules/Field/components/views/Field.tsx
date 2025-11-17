import type { ReactNode, SyntheticEvent } from 'react'
import type React from 'react'
import { useState } from 'react'

import { useId } from '@repo/hooks'
import cs from 'classnames'
import { Popover, PopoverBody } from 'reactstrap'

import { useAppNode } from 'appNode'
import type { LeafType } from 'models/widget/types'

import type { FieldEditFormData, HiddenFields } from '../../types'
import FieldContainer from './FieldContainer'
import type { TypeOption } from './FieldEditForm'
import FieldEditForm from './FieldEditForm'
import FieldLabel from './FieldLabel'
import FieldValue from './FieldValue'

import css from './Field.less'

export const EDIT_BUTTON_TEXT = 'edit'
export const DELETE_BUTTON_TEXT = 'delete'

type Props<T extends LeafType> = {
    title: string
    value: unknown
    type: T
    availableTypes: TypeOption<T>[]
    copyButton: React.ReactNode
    isEditionMode?: boolean
    editionHiddenFields?: HiddenFields
    valueCanOverflow?: boolean
    onEditionStart: () => void
    onEditionStop: () => void
    onSubmit: (formData: FieldEditFormData<T>) => void
    onDelete: () => void
}

export default function Field<T extends LeafType>({
    title,
    value,
    type,
    availableTypes,
    copyButton,
    isEditionMode = false,
    editionHiddenFields,
    valueCanOverflow = false,
    onEditionStart,
    onEditionStop,
    onSubmit,
    onDelete,
}: Props<T>) {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const appNode = useAppNode()
    const uniqueId = 'field-widget-' + useId()

    const handleDeleteClick = (e: SyntheticEvent<HTMLElement>) => {
        e.stopPropagation()
        onDelete()
    }

    const handleEditClick = (e: SyntheticEvent<HTMLElement>) => {
        e.stopPropagation()
        onEditionStart()
        setIsPopoverOpen(true)
    }

    const handleEditStop = () => {
        setIsPopoverOpen(false)
        onEditionStop()
    }

    const handlePopoverToggle = () => {
        if (isPopoverOpen) {
            handleEditStop()
        }
    }

    const handleEditSubmit = (formData: FieldEditFormData<T>) => {
        onSubmit(formData)
        handleEditStop()
    }

    // keep the unscoped class here to have drag and drop greying feature
    const className = cs(`${css.field} draggable`, {
        [css.fieldEditing]: isEditionMode,
    })

    return (
        <FieldContainer id={uniqueId} className={className}>
            <FieldLabel className={css.fieldLabel}>{title}:</FieldLabel>
            <FieldValue canOverflow={valueCanOverflow}>
                {/* TODO(React18): Find a solution to casting to ReactNode once we upgrade to React 18 types */}
                {value as ReactNode}
                {!isEditionMode && copyButton && (
                    <span className={css.copyButton}>{copyButton}</span>
                )}
            </FieldValue>
            {isEditionMode && (
                <>
                    <span className={css.fieldTools}>
                        <i
                            className={`material-icons ${css.fieldToolIcon}`}
                            onClick={handleEditClick}
                        >
                            {EDIT_BUTTON_TEXT}
                        </i>
                        <i
                            className={`material-icons text-danger ${css.fieldToolIcon}`}
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
                                    title,
                                    type,
                                }}
                                availableTypes={availableTypes}
                                hiddenFields={editionHiddenFields}
                                onCancel={handleEditStop}
                                onSubmit={handleEditSubmit}
                            />
                        </PopoverBody>
                    </Popover>
                </>
            )}
        </FieldContainer>
    )
}
