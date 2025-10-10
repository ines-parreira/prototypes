import React, { useState } from 'react'

import { useId } from '@repo/hooks'
import { Popover, PopoverBody } from 'reactstrap'

import { LegacyButton as Button } from '@gorgias/axiom'

import { useAppNode } from 'appNode'

import WrapperEditForm, { FormData } from './WrapperEditForm'

export type { FormData } from './WrapperEditForm'

type Props = {
    deleteButtonText: string
    onDelete: () => void
    editButtonText: string
    initialData?: FormData
    onEditStart: () => void
    onEditCancel: () => void
    onEditSubmit: (data: FormData) => void
}

export default function WrapperEditActions({
    deleteButtonText,
    onDelete,
    editButtonText,
    onEditStart,
    onEditCancel,
    onEditSubmit,
    initialData,
}: Props) {
    const appNode = useAppNode()
    const popoverId = 'wrapper-edit-actions-' + useId()
    const [isPopoverOpen, setPopoverOpen] = useState(false)
    return (
        <>
            {initialData && (
                <Button
                    id={popoverId}
                    type="button"
                    intent="primary"
                    fillStyle="ghost"
                    size="small"
                    onClick={() => {
                        onEditStart()
                        setPopoverOpen(true)
                    }}
                    leadingIcon="edit"
                >
                    {editButtonText}
                    <Popover
                        placement="left"
                        isOpen={isPopoverOpen}
                        target={popoverId}
                        toggle={() => {
                            setPopoverOpen(false)
                            onEditCancel()
                        }}
                        trigger="legacy"
                        container={appNode ?? undefined}
                    >
                        <PopoverBody>
                            <WrapperEditForm
                                initialData={initialData}
                                onCancel={() => {
                                    setPopoverOpen(false)
                                    onEditCancel()
                                }}
                                onSubmit={(data) => {
                                    setPopoverOpen(false)
                                    onEditSubmit(data)
                                }}
                            />
                        </PopoverBody>
                    </Popover>
                </Button>
            )}
            <Button
                intent="destructive"
                fillStyle="ghost"
                size="small"
                onClick={() => {
                    onDelete()
                }}
                leadingIcon="delete"
            >
                {deleteButtonText}
            </Button>
        </>
    )
}
