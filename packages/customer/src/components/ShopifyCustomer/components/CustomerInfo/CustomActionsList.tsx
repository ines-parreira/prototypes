import { useCallback, useState } from 'react'

import { Box, Button, Link } from '@gorgias/axiom'

import { ButtonActionDialog, LinkActionDialog } from './CustomActions'
import type { ButtonConfig, LinkConfig } from './CustomActions'
import { EditableActionRow } from './EditableActionRow'

type ButtonDialogState =
    | { mode: 'closed' }
    | { mode: 'edit'; index: number; button: ButtonConfig }

type LinkDialogState =
    | { mode: 'closed' }
    | { mode: 'edit'; index: number; link: LinkConfig }

type CustomActionsListProps = {
    links: LinkConfig[]
    buttons: ButtonConfig[]
    onChange: (next: { links: LinkConfig[]; buttons: ButtonConfig[] }) => void
}

export function CustomActionsList({
    links,
    buttons,
    onChange,
}: CustomActionsListProps) {
    const [linkDialog, setLinkDialog] = useState<LinkDialogState>({
        mode: 'closed',
    })
    const [buttonDialog, setButtonDialog] = useState<ButtonDialogState>({
        mode: 'closed',
    })

    const handleLinkSubmit = async (link: LinkConfig) => {
        if (linkDialog.mode !== 'edit') return
        onChange({
            links: links.map((existing, i) =>
                i === linkDialog.index ? link : existing,
            ),
            buttons,
        })
    }

    const handleButtonSubmit = async (button: ButtonConfig) => {
        if (buttonDialog.mode !== 'edit') return
        onChange({
            links,
            buttons: buttons.map((existing, i) =>
                i === buttonDialog.index ? button : existing,
            ),
        })
    }

    const handleRemoveLink = (index: number) => {
        onChange({
            links: links.filter((_, i) => i !== index),
            buttons,
        })
    }

    const handleRemoveButton = (index: number) => {
        onChange({
            links,
            buttons: buttons.filter((_, i) => i !== index),
        })
    }

    const handleLinkDialogOpenChange = useCallback((open: boolean) => {
        if (!open) setLinkDialog({ mode: 'closed' })
    }, [])

    const handleButtonDialogOpenChange = useCallback((open: boolean) => {
        if (!open) setButtonDialog({ mode: 'closed' })
    }, [])

    if (links.length === 0 && buttons.length === 0) return null

    return (
        <>
            <Box flexDirection="column" gap="xxxs">
                {links.map((link, index) => (
                    <EditableActionRow
                        key={`link-${index}-${link.label}-${link.url}`}
                        label={
                            <Link target="_blank" trailingSlot="external-link">
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
                        onDelete={() => handleRemoveLink(index)}
                    />
                ))}
                {buttons.map((button, index) => (
                    <EditableActionRow
                        key={`button-${index}-${button.label}-${button.action.url}`}
                        label={
                            <Button variant="secondary">{button.label}</Button>
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
                        onDelete={() => handleRemoveButton(index)}
                    />
                ))}
            </Box>

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
