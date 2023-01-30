import React, {
    MouseEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react'
import {fromJS, Map, List} from 'immutable'
import classnames from 'classnames'
import {usePrevious} from 'react-use'
import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Popover,
    PopoverBody,
} from 'reactstrap'

import {TicketMessageSourceType} from 'business/types/ticket'
import {UserRole} from 'config/types/user'
import history from 'pages/history'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {FetchMacrosOptions} from 'models/macro/types'
import Button from 'pages/common/components/button/Button'
import Loader from 'pages/common/components/Loader/Loader'
import Preview from 'pages/tickets/common/macros/Preview'
import MacroList from 'pages/tickets/common/macros/components/MacroList'
import MacroNoResults from 'pages/tickets/common/macros/components/MacroNoResults'
import MacroContainer from 'pages/tickets/common/macros/MacroContainer'
import {getCurrentUser} from 'state/currentUser/selectors'
import {CurrentUserState} from 'state/currentUser/types'
import {deleteMacro} from 'state/macro/actions'
import {getNewMessageType} from 'state/newMessage/selectors'
import {hasRole} from 'utils'

import css from './TicketMacros.less'

type Props = {
    applyMacro: (macro: Map<any, any>) => void
    className?: string
    currentMacro: Map<any, any>
    fetchMacros: (
        params: FetchMacrosOptions,
        retainPreviousResults?: boolean
    ) => Promise<void>
    isInitialMacrosLoading: boolean
    macros: List<any>
    selectMacro: (macro: Map<any, any>) => void
    searchParams: FetchMacrosOptions
    hasDataToLoad?: boolean
}

export function TicketMacrosContainer({
    applyMacro,
    className,
    currentMacro,
    fetchMacros,
    hasDataToLoad,
    isInitialMacrosLoading,
    macros = fromJS([]),
    searchParams = {search: ''},
    selectMacro,
}: Props) {
    const dispatch = useAppDispatch()
    const currentUser = useAppSelector<CurrentUserState>(getCurrentUser)
    const newMessageType =
        useAppSelector<TicketMessageSourceType>(getNewMessageType)
    const previewContainerRef = useRef<HTMLDivElement | null>(null)
    const [macroDropdownOpen, setMacroDropdownOpen] = useState(false)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isCreatingMacro, setIsCreatingMacro] = useState(false)
    const prevIsDeleting = usePrevious(isDeleting)

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

        // reload macros, in case they changed in the modal
        void fetchMacros({...searchParams, cursor: null})
    }, [fetchMacros, searchParams])

    const toggleCreateMacro = useCallback((isCreatingMacro = false): void => {
        setIsCreatingMacro(isCreatingMacro)
    }, [])

    const handleDeleteMacro = useCallback(async () => {
        toggleMacroDeleteConfirmOpen()
        const macroId = currentMacro.get('id', '')
        setIsDeleting(true)

        await dispatch(deleteMacro(macroId))
        setIsDeleting(false)
    }, [currentMacro, dispatch, toggleMacroDeleteConfirmOpen])

    useEffect(() => {
        if (prevIsDeleting && isDeleting !== prevIsDeleting) {
            void fetchMacros({...searchParams, cursor: null})
        }
    }, [fetchMacros, isDeleting, prevIsDeleting, searchParams])

    let content = null
    if (macros.isEmpty() && isInitialMacrosLoading) {
        content = <Loader minHeight="100%" message="Loading macros..." />
    } else if (macros.isEmpty()) {
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
                    loadMore={() => fetchMacros(searchParams, true)}
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
                                                '/app/settings/profile'
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
                            >
                                <PopoverBody>
                                    <p>
                                        Are you sure you want to delete '
                                        {currentMacro.get('name')}'?
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
                        actions={currentMacro.get('actions')}
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

export default TicketMacrosContainer
