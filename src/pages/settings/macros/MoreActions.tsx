import {Macro} from '@gorgias/api-queries'
import classNames from 'classnames'
import React, {useRef, useState} from 'react'
import {useParams} from 'react-router-dom'

import IconButton from 'pages/common/components/button/IconButton'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import BodyCellContent from 'pages/common/components/table/cells/BodyCellContent'

import css from './MoreActions.less'

type Props = {
    handleMacroDelete: (macroId: number) => Promise<void>
    handleMacroDuplicate: (macro: Macro) => Promise<void>
    hasAgentPrivileges: boolean
    macro: Macro
}

export default function MoreActions({
    handleMacroDelete,
    handleMacroDuplicate,
    hasAgentPrivileges,
    macro,
}: Props) {
    const handleMacroArchive = (__macro: Macro) => {}
    const ref = useRef<HTMLButtonElement>(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const {activeTab} = useParams<{activeTab: string}>()
    const isArchiveTab = activeTab === 'archived'

    const archiveLabel = `${isArchiveTab ? 'Unarchive' : 'Archive'} macro`

    return (
        <BodyCellContent className={css.wrapperActions}>
            <IconButton
                fillStyle="ghost"
                intent="secondary"
                onClick={() => {
                    void handleMacroArchive(macro)
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
                    void handleMacroDelete(macro.id!)
                    setIsDropdownOpen(false)
                }}
                placement="left"
            >
                {({uid, onDisplayConfirmation}) => (
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
                                    onClick={() => handleMacroDuplicate(macro)}
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
                                        css.destructive
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
