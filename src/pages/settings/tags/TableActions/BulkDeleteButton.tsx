import React, {useCallback, useState} from 'react'
import {Popover, PopoverBody, PopoverHeader} from 'reactstrap'

import Button, {ButtonIntent} from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

export type Props = {
    disabled: boolean
    onBulkDelete: () => void
}

const BulkDeleteButton = ({onBulkDelete, disabled}: Props) => {
    const [askRemoveConfirmation, setAskRemoveConfirmation] = useState(false)

    const toggleRemoveConfirmation = useCallback(() => {
        setAskRemoveConfirmation(!askRemoveConfirmation)
    }, [askRemoveConfirmation])

    const handleDeleteClick = useCallback(() => {
        setAskRemoveConfirmation(false)
        onBulkDelete()
    }, [onBulkDelete])

    return (
        <>
            <Button
                isDisabled={disabled}
                id="bulk-remove-button"
                intent={ButtonIntent.Secondary}
                className="mr-2 skip-default"
                onClick={toggleRemoveConfirmation}
            >
                <ButtonIconLabel icon="delete">Delete</ButtonIconLabel>
            </Button>
            <Popover
                placement="bottom"
                isOpen={askRemoveConfirmation}
                target="bulk-remove-button"
                toggle={toggleRemoveConfirmation}
                trigger="legacy"
            >
                <PopoverHeader>Are you sure?</PopoverHeader>
                <PopoverBody>
                    <p>
                        Are you sure you want to delete these tags?{' '}
                        <b>They will be removed from all tickets</b>.
                    </p>
                    <Button onClick={handleDeleteClick}>Confirm</Button>
                </PopoverBody>
            </Popover>
        </>
    )
}

export default BulkDeleteButton
