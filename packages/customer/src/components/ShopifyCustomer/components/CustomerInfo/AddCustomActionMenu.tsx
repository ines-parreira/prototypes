import { useCallback, useState } from 'react'

import { Button, Menu, MenuItem, MenuPlacement } from '@gorgias/axiom'

import { ButtonActionDialog, LinkActionDialog } from './CustomActions'
import type { ButtonConfig, LinkConfig } from './CustomActions'

type DialogMode = 'closed' | 'add'

type AddCustomActionMenuProps = {
    links: LinkConfig[]
    buttons: ButtonConfig[]
    onChange: (next: { links: LinkConfig[]; buttons: ButtonConfig[] }) => void
    isLoading: boolean
    isDisabled?: boolean
}

export function AddCustomActionMenu({
    links,
    buttons,
    onChange,
    isLoading,
    isDisabled = false,
}: AddCustomActionMenuProps) {
    const [linkDialog, setLinkDialog] = useState<DialogMode>('closed')
    const [buttonDialog, setButtonDialog] = useState<DialogMode>('closed')

    const handleLinkSubmit = async (link: LinkConfig) => {
        onChange({ links: [...links, link], buttons })
    }

    const handleButtonSubmit = async (button: ButtonConfig) => {
        onChange({ links, buttons: [...buttons, button] })
    }

    const handleLinkDialogOpenChange = useCallback((open: boolean) => {
        if (!open) setLinkDialog('closed')
    }, [])

    const handleButtonDialogOpenChange = useCallback((open: boolean) => {
        if (!open) setButtonDialog('closed')
    }, [])

    return (
        <>
            <Menu
                trigger={
                    <Button
                        variant="secondary"
                        leadingSlot="add-plus"
                        isDisabled={isLoading || isDisabled}
                    >
                        Add
                    </Button>
                }
                placement={MenuPlacement.BottomRight}
            >
                <MenuItem
                    id="add-button"
                    label="Add button"
                    leadingSlot="add-plus"
                    onAction={() => setButtonDialog('add')}
                />
                <MenuItem
                    id="add-link"
                    label="Add link"
                    leadingSlot="add-plus"
                    onAction={() => setLinkDialog('add')}
                />
            </Menu>

            <LinkActionDialog
                isOpen={linkDialog !== 'closed'}
                onOpenChange={handleLinkDialogOpenChange}
                onSubmit={handleLinkSubmit}
            />

            <ButtonActionDialog
                isOpen={buttonDialog !== 'closed'}
                onOpenChange={handleButtonDialogOpenChange}
                onSubmit={handleButtonSubmit}
            />
        </>
    )
}
