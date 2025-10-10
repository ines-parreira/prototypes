import React, {
    MouseEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react'

import classnames from 'classnames'
import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Popover,
    PopoverBody,
} from 'reactstrap'

import { LegacyButton as Button } from '@gorgias/axiom'
import { Macro } from '@gorgias/helpdesk-queries'

import { useAppNode } from 'appNode'
import { TicketMessageSourceType } from 'business/types/ticket'
import { UserRole } from 'config/types/user'
import { useDeleteMacro } from 'hooks/macros'
import useAppSelector from 'hooks/useAppSelector'
import { Filters } from 'models/macro/types'
import Loader from 'pages/common/components/Loader/Loader'
import history from 'pages/history'
import MacroList from 'pages/tickets/common/macros/components/MacroList'
import MacroNoResults from 'pages/tickets/common/macros/components/MacroNoResults'
import MacroContainer from 'pages/tickets/common/macros/MacroContainer'
import { Preview } from 'pages/tickets/common/macros/Preview/Preview'
import { getCurrentUser } from 'state/currentUser/selectors'
import { CurrentUserState } from 'state/currentUser/types'
import { getNewMessageType } from 'state/newMessage/selectors'
import { hasRole } from 'utils'

import css from './TicketMacros.less'

type Props = {
    applyMacro: (macro: Macro) => void
    className?: string
    currentMacro?: Macro
    isLoading: boolean
    loadMacros: () => Promise<any>
    macros: Macro[]
    selectMacro: (macro: Macro) => void
    searchParams?: Filters
    hasDataToLoad?: boolean
}

export function TicketMacros({
    applyMacro,
    className,
    currentMacro,
    hasDataToLoad,
    isLoading,
    loadMacros,
    macros = [],
    searchParams = { search: '' },
    selectMacro,
}: Props) {
    const currentUser = useAppSelector<CurrentUserState>(getCurrentUser)
    const newMessageType =
        useAppSelector<TicketMessageSourceType>(getNewMessageType)
    const previewContainerRef = useRef<HTMLDivElement | null>(null)
    const [macroDropdownOpen, setMacroDropdownOpen] = useState(false)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isCreatingMacro, setIsCreatingMacro] = useState(false)
    const appNode = useAppNode()
    const { mutate: deleteMacro } = useDeleteMacro()

    // brings the preview to top when previewing another macro
    useEffect(() => {
        if (!previewContainerRef.current) return
        previewContainerRef.current.scrollTop = 0
    }, [currentMacro])

    const toggleMacroDropdown = useCallback(() => {
        setMacroDropdownOpen((s) => !s)
    }, [])

    const toggleMacroDeleteConfirmOpen = useCallback(() => {
        setIsDeleteConfirmOpen((s) => !s)
    }, [])

    const openMacroModal = useCallback((e?: MouseEvent, create = false) => {
        setIsModalOpen(true)
        setIsCreatingMacro(create)
    }, [])

    const closeMacroModal = useCallback(() => {
        setIsModalOpen(false)
    }, [])

    const toggleCreateMacro = useCallback((isCreatingMacro = false): void => {
        setIsCreatingMacro(isCreatingMacro)
    }, [])

    const handleDeleteMacro = useCallback(() => {
        toggleMacroDeleteConfirmOpen()
        const id = currentMacro?.id

        if (id)
            deleteMacro({
                id,
            })
    }, [currentMacro, deleteMacro, toggleMacroDeleteConfirmOpen])

    let content = null
    if (isLoading) {
        content = <Loader minHeight="100%" message="Loading macros..." />
    } else if (!macros.length) {
        content = (
            <MacroNoResults
                searchParams={searchParams}
                newAction={() => openMacroModal(undefined, true)}
            />
        )
    } else {
        content = (
            <div className={css.content}>
                <MacroList
                    className={css.macroList}
                    currentMacro={currentMacro}
                    searchResults={macros}
                    onClickItem={applyMacro}
                    onHoverItem={selectMacro}
                    loadMore={loadMacros}
                    hasDataToLoad={hasDataToLoad}
                />
                <div className={css.previewContainer} ref={previewContainerRef}>
                    {hasRole(currentUser, UserRole.Agent) && (
                        <>
                            <Dropdown
                                isOpen={macroDropdownOpen}
                                toggle={toggleMacroDropdown}
                            >
                                <DropdownToggle
                                    caret
                                    className={classnames(css.manageMacros)}
                                >
                                    <i className="material-icons">settings</i>
                                    <div
                                        className={css.deletePopoverTarget}
                                        id="deleteMacroTarget"
                                    />
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem
                                        onClick={openMacroModal}
                                        className="cursor-pointer"
                                    >
                                        <i className="material-icons">
                                            settings
                                        </i>{' '}
                                        Manage macros
                                    </DropdownItem>
                                    <DropdownItem
                                        onClick={openMacroModal}
                                        className="cursor-pointer"
                                    >
                                        <i className="material-icons">
                                            mode_edit
                                        </i>{' '}
                                        Edit macro
                                    </DropdownItem>
                                    <DropdownItem
                                        onClick={(e) => openMacroModal(e, true)}
                                        className="cursor-pointer"
                                    >
                                        <i className="material-icons">add</i>{' '}
                                        Create new macro
                                    </DropdownItem>
                                    <DropdownItem
                                        id="deleteButtonMenuItem"
                                        onClick={toggleMacroDeleteConfirmOpen}
                                        className="cursor-pointer"
                                    >
                                        <i className="material-icons text-danger">
                                            delete
                                        </i>{' '}
                                        Delete macro
                                    </DropdownItem>
                                    <DropdownItem
                                        onClick={() =>
                                            history.push(
                                                '/app/settings/profile',
                                            )
                                        }
                                        className="cursor-pointer"
                                    >
                                        <i className="material-icons-round">
                                            how_to_reg
                                        </i>{' '}
                                        My macro preferences
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>

                            <Popover
                                placement="bottom"
                                target="deleteMacroTarget"
                                isOpen={isDeleteConfirmOpen}
                                toggle={toggleMacroDeleteConfirmOpen}
                                trigger="legacy"
                                fade={false}
                                container={appNode ?? undefined}
                            >
                                <PopoverBody>
                                    <p>
                                        {`Are you sure you want to delete '${currentMacro?.name}'?`}
                                    </p>
                                    <Button
                                        onClick={handleDeleteMacro}
                                        intent="destructive"
                                    >
                                        Delete macro
                                    </Button>
                                    <Button
                                        onClick={toggleMacroDeleteConfirmOpen}
                                        className="float-right"
                                        intent="secondary"
                                    >
                                        Cancel
                                    </Button>
                                </PopoverBody>
                            </Popover>
                        </>
                    )}

                    <Preview
                        ticketMessageSourceType={newMessageType}
                        actions={currentMacro?.actions}
                        className={css.preview}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className={classnames(css.component, className)}>
            {content}
            {isModalOpen && (
                <MacroContainer
                    selectedMacro={currentMacro}
                    closeModal={closeMacroModal}
                    isCreatingMacro={isCreatingMacro}
                    toggleCreateMacro={toggleCreateMacro}
                />
            )}
        </div>
    )
}

export default TicketMacros
