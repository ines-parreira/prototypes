import React, { useRef, useState } from 'react'

import classNames from 'classnames'
import { useRouteMatch } from 'react-router-dom'

import type { ArchiveMacroAsUserResult, Macro } from '@gorgias/helpdesk-queries'

import { useBulkArchiveMacros, useBulkUnarchiveMacros } from 'hooks/macros'
import IconButton from 'pages/common/components/button/IconButton'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import BodyCellContent from 'pages/common/components/table/cells/BodyCellContent'

import css from './MoreActions.less'

type Props = {
    onMacroDelete: (macroId: number) => void
    onMacroDuplicate: (macro: Macro) => void
    onMacroArchiveOrUnarchived: (macroId: number) => void
    hasAgentPrivileges: boolean
    macro: Macro
}

export default function MoreActions({
    onMacroDelete,
    onMacroDuplicate,
    onMacroArchiveOrUnarchived,
    hasAgentPrivileges,
    macro,
}: Props) {
    const isArchiveTab = !!useRouteMatch('/app/settings/macros/archived')

    const { mutate: bulkArchiveMacros } = useBulkArchiveMacros()
    const { mutate: bulkUnarchiveMacros } = useBulkUnarchiveMacros()

    const handleMacroArchiveOrUnarchive = () => {
        if (isArchiveTab) {
            bulkUnarchiveMacros(
                { data: { ids: [macro.id!] } },
                {
                    onSettled: () => {
                        onMacroArchiveOrUnarchived(macro.id!)
                    },
                },
            )
        } else {
            bulkArchiveMacros(
                { data: { ids: [macro.id!] } },
                {
                    onSettled: (resp) => {
                        const msg = resp?.data.data as unknown as {
                            data?: ArchiveMacroAsUserResult[]
                        }
                        const error = msg?.data?.[0]?.error

                        if (!error) {
                            onMacroArchiveOrUnarchived(macro.id!)
                        }
                    },
                },
            )
        }
    }

    const ref = useRef<HTMLButtonElement>(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const archiveLabel = `${isArchiveTab ? 'Unarchive' : 'Archive'} macro`

    return (
        <BodyCellContent className={css.wrapperActions}>
            <IconButton
                fillStyle="ghost"
                intent="secondary"
                onClick={() => {
                    void handleMacroArchiveOrUnarchive()
                }}
                title={archiveLabel}
                aria-label={archiveLabel}
                isDisabled={!hasAgentPrivileges}
            >
                {isArchiveTab ? 'unarchive' : 'archive'}
            </IconButton>
            <ConfirmationPopover
                buttonProps={{
                    intent: 'destructive',
                }}
                content={
                    <>
                        You are about to delete <b>{macro.name || 'this'}</b>{' '}
                        macro.
                    </>
                }
                id={`new-delete-button-${macro.id}`}
                onConfirm={() => {
                    onMacroDelete(macro.id!)
                    setIsDropdownOpen(false)
                }}
                placement="left"
            >
                {({ uid, onDisplayConfirmation }) => (
                    <>
                        <IconButton
                            id={uid}
                            ref={ref}
                            fillStyle="ghost"
                            intent="secondary"
                            onClick={() => {
                                setIsDropdownOpen(true)
                            }}
                            title="More actions on macro"
                            aria-label="More actions on macro"
                            isDisabled={!hasAgentPrivileges}
                        >
                            more_vert
                        </IconButton>
                        <Dropdown
                            isOpen={isDropdownOpen}
                            offset={4}
                            placement="bottom-end"
                            target={ref}
                            onToggle={setIsDropdownOpen}
                        >
                            <DropdownBody>
                                <DropdownItem
                                    className={css.dropdownItem}
                                    onClick={() => onMacroDuplicate(macro)}
                                    option={{
                                        label: '',
                                        value: '',
                                    }}
                                    shouldCloseOnSelect
                                >
                                    <i className="material-icons">file_copy</i>
                                    Make a copy
                                </DropdownItem>
                                <DropdownItem
                                    className={classNames(
                                        css.dropdownItem,
                                        css.destructive,
                                    )}
                                    onClick={() => onDisplayConfirmation()}
                                    option={{
                                        label: '',
                                        value: '',
                                    }}
                                    shouldCloseOnSelect
                                >
                                    <i className="material-icons">delete</i>
                                    Delete
                                </DropdownItem>
                            </DropdownBody>
                        </Dropdown>
                    </>
                )}
            </ConfirmationPopover>
        </BodyCellContent>
    )
}
