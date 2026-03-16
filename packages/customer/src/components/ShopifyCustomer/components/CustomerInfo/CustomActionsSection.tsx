import { useCallback, useState } from 'react'

import {
    Box,
    Button,
    Icon,
    Link,
    Menu,
    MenuItem,
    MenuPlacement,
    Separator,
    Text,
} from '@gorgias/axiom'

import {
    ButtonActionDialog,
    LinkActionDialog,
    useCustomActions,
} from './CustomActions'
import type { ButtonConfig, LinkConfig } from './CustomActions'
import { EditableActionRow } from './EditableActionRow'

import css from './IntermediateEditPanel.less'

type ButtonDialogState =
    | { mode: 'closed' }
    | { mode: 'add' }
    | { mode: 'edit'; index: number; button: ButtonConfig }

type LinkDialogState =
    | { mode: 'closed' }
    | { mode: 'add' }
    | { mode: 'edit'; index: number; link: LinkConfig }

type CustomActionsSectionProps = {
    integrationName?: string
}

export function CustomActionsSection({
    integrationName,
}: CustomActionsSectionProps) {
    const [linkDialog, setLinkDialog] = useState<LinkDialogState>({
        mode: 'closed',
    })
    const [buttonDialog, setButtonDialog] = useState<ButtonDialogState>({
        mode: 'closed',
    })

    const {
        links,
        buttons,
        addLink,
        addButton,
        editLink,
        editButton,
        removeLink,
        removeButton,
        isLoading,
    } = useCustomActions()

    const handleLinkSubmit = async (link: LinkConfig) => {
        if (linkDialog.mode === 'edit') {
            await editLink(linkDialog.index, link)
        } else {
            await addLink(link)
        }
    }

    const handleButtonSubmit = async (button: ButtonConfig) => {
        if (buttonDialog.mode === 'edit') {
            await editButton(buttonDialog.index, button)
        } else {
            await addButton(button)
        }
    }

    const handleLinkDialogOpenChange = useCallback((open: boolean) => {
        if (!open) setLinkDialog({ mode: 'closed' })
    }, [])

    const handleButtonDialogOpenChange = useCallback((open: boolean) => {
        if (!open) setButtonDialog({ mode: 'closed' })
    }, [])

    return (
        <>
            <Box
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                padding="md"
            >
                <Box flexDirection="row" alignItems="center" gap="xs">
                    <Icon name="app-shopify" size="md" />
                    <Text size="md" variant="bold">
                        {integrationName}
                    </Text>
                </Box>
                <Menu
                    trigger={
                        <Button
                            size="sm"
                            variant="secondary"
                            leadingSlot="add-plus"
                            isDisabled={isLoading}
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
                        onAction={() => setButtonDialog({ mode: 'add' })}
                    />
                    <MenuItem
                        id="add-link"
                        label="Add link"
                        leadingSlot="add-plus"
                        onAction={() => setLinkDialog({ mode: 'add' })}
                    />
                </Menu>
            </Box>
            {(links.length > 0 || buttons.length > 0) && (
                <>
                    <Separator />
                    <div className={css.section}>
                        <Box flexDirection="column" gap="xxxs">
                            {buttons.map((button, index) => (
                                <EditableActionRow
                                    key={`button-${index}-${button.label}-${button.action.url}`}
                                    label={
                                        <Button variant="secondary" size="sm">
                                            {button.label}
                                        </Button>
                                    }
                                    editAriaLabel={`Edit ${button.label}`}
                                    deleteAriaLabel={`Delete ${button.label}`}
                                    onEdit={() =>
                                        setButtonDialog({
                                            mode: 'edit',
                                            index,
                                            button,
                                        })
                                    }
                                    onDelete={() => removeButton(index)}
                                />
                            ))}
                            {links.map((link, index) => (
                                <EditableActionRow
                                    key={`link-${index}-${link.label}-${link.url}`}
                                    label={
                                        <Link
                                            target="_blank"
                                            trailingSlot="external-link"
                                            size="sm"
                                        >
                                            {link.label}
                                        </Link>
                                    }
                                    editAriaLabel={`Edit ${link.label}`}
                                    deleteAriaLabel={`Delete ${link.label}`}
                                    onEdit={() =>
                                        setLinkDialog({
                                            mode: 'edit',
                                            index,
                                            link,
                                        })
                                    }
                                    onDelete={() => removeLink(index)}
                                />
                            ))}
                        </Box>
                    </div>
                </>
            )}

            <LinkActionDialog
                isOpen={linkDialog.mode !== 'closed'}
                onOpenChange={handleLinkDialogOpenChange}
                onSubmit={handleLinkSubmit}
                editLink={
                    linkDialog.mode === 'edit' ? linkDialog.link : undefined
                }
            />

            <ButtonActionDialog
                isOpen={buttonDialog.mode !== 'closed'}
                onOpenChange={handleButtonDialogOpenChange}
                onSubmit={handleButtonSubmit}
                editButton={
                    buttonDialog.mode === 'edit'
                        ? buttonDialog.button
                        : undefined
                }
            />
        </>
    )
}
