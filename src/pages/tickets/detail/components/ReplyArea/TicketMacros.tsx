import React, {Component, MouseEvent} from 'react'
import ReactDOM from 'react-dom'
import {fromJS, Map, List} from 'immutable'
import classnames from 'classnames'
import {connect, ConnectedProps} from 'react-redux'
import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Popover,
    PopoverBody,
} from 'reactstrap'

import Button from 'pages/common/components/button/Button'
import {RootState} from '../../../../../state/types'
import * as newMessageSelectors from '../../../../../state/newMessage/selectors'
import {
    deleteMacro,
    fetchMacrosParamsTypes,
} from '../../../../../state/macro/actions'
import Preview from '../../../common/macros/Preview'
import Tooltip from '../../../../common/components/Tooltip'
import Loader from '../../../../common/components/Loader/Loader'
import MacroList from '../../../common/macros/components/MacroList'
import MacroNoResults from '../../../common/macros/components/MacroNoResults'
import MacroContainer from '../../../common/macros/MacroContainer'
import {hasRole} from '../../../../../utils'
import {UserRole} from '../../../../../config/types/user'
import {notify} from '../../../../../state/notifications/actions'

import css from './TicketMacros.less'

type OwnProps = {
    applyMacro: (macro: Map<any, any>) => void
    className?: string
    currentMacro: Map<any, any>
    currentTicket: Map<any, any>
    fetchMacros: (params: fetchMacrosParamsTypes) => Promise<void>
    isInitialMacrosLoading: boolean
    macros: List<any>
    onClearMacro: () => void
    page: number
    selectMacro: (macro: Map<any, any>) => void
    searchQuery: string
    totalPages: number
}

type Props = OwnProps & ConnectedProps<typeof connector>

type State = {
    isCreatingMacro: boolean
    isDeleteConfirmOpen: boolean
    isModalOpen: boolean
    macroDropdownOpen: boolean
    page: number
}

export class TicketMacrosContainer extends Component<Props, State> {
    static defaultProps: Pick<
        Props,
        'currentTicket' | 'macros' | 'searchQuery'
    > = {
        currentTicket: fromJS({}),
        macros: fromJS([]),
        searchQuery: '',
    }
    previewContainerRef: Maybe<HTMLDivElement>

    constructor(props: Props) {
        super(props)

        this.state = {
            page: 1,
            macroDropdownOpen: false,
            isDeleteConfirmOpen: false,
            isModalOpen: false,
            isCreatingMacro: false,
        }
    }

    componentDidUpdate(prevProps: Props) {
        // brings the preview to top when previewing another macro
        if (
            this.props.currentMacro.get('id') !==
            prevProps.currentMacro.get('id')
        ) {
            const element = ReactDOM.findDOMNode(
                this.previewContainerRef
            ) as HTMLDivElement

            if (element) {
                element.scrollTop = 0
            }
        }
    }

    _toggleMacroDropdown = () => {
        this.setState({
            macroDropdownOpen: !this.state.macroDropdownOpen,
        })
    }

    toggleMacroDeleteConfirmOpen = () => {
        this.setState({
            isDeleteConfirmOpen: !this.state.isDeleteConfirmOpen,
        })
    }

    openMacroModal = (e?: MouseEvent, create = false) => {
        this.setState({
            isModalOpen: true,
            isCreatingMacro: create,
        })
    }

    closeMacroModal = () => {
        this.setState({isModalOpen: false})
        // reload macros, in case they changed in the modal
        void this.props.fetchMacros({search: this.props.searchQuery})
    }

    toggleCreateMacro = (isCreatingMacro = false): Promise<void> => {
        return new Promise((resolve) => {
            this.setState({isCreatingMacro}, resolve)
        })
    }

    deleteMacro = () => {
        this.toggleMacroDeleteConfirmOpen()
        const macroId = this.props.currentMacro.get('id', '')
        return this.props.deleteMacro(macroId).then(() => {
            void this.props.fetchMacros({search: this.props.searchQuery})
        })
    }

    render() {
        const {
            currentUser,
            macros,
            newMessageType,
            className,
            onClearMacro,
            page,
            totalPages,
            currentMacro,
            selectMacro,
            isInitialMacrosLoading,
            fetchMacros,
        } = this.props

        let content = null
        if (macros.isEmpty() && isInitialMacrosLoading) {
            content = <Loader minHeight="100%" message="Loading macros..." />
        } else if (macros.isEmpty()) {
            content = (
                <MacroNoResults
                    searchQuery={this.props.searchQuery}
                    newAction={() => this.openMacroModal(undefined, true)}
                />
            )
        } else {
            content = (
                <div className={css.content}>
                    <MacroList
                        className={css.macroList}
                        currentMacro={currentMacro}
                        macros={macros}
                        page={page}
                        totalPages={totalPages}
                        search={this.props.searchQuery}
                        onClickItem={this.props.applyMacro}
                        onHoverItem={selectMacro}
                        fetchMacros={fetchMacros}
                    />
                    <div
                        className={css.previewContainer}
                        ref={(ref) => (this.previewContainerRef = ref)}
                    >
                        {hasRole(currentUser, UserRole.Agent) && (
                            <>
                                <Dropdown
                                    isOpen={this.state.macroDropdownOpen}
                                    toggle={this._toggleMacroDropdown}
                                >
                                    <DropdownToggle
                                        caret
                                        className={classnames(css.manageMacros)}
                                    >
                                        <i className="material-icons">
                                            settings
                                        </i>
                                        <div
                                            className={
                                                css['deletePopoverTarget']
                                            }
                                            id="deleteMacroTarget"
                                        />
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem
                                            onClick={this.openMacroModal}
                                            className="cursor-pointer"
                                        >
                                            <i className="material-icons">
                                                settings
                                            </i>{' '}
                                            Manage macros
                                        </DropdownItem>
                                        <DropdownItem
                                            onClick={this.openMacroModal}
                                            className="cursor-pointer"
                                        >
                                            <i className="material-icons">
                                                mode_edit
                                            </i>{' '}
                                            Edit macro
                                        </DropdownItem>
                                        <DropdownItem
                                            onClick={(e) =>
                                                this.openMacroModal(e, true)
                                            }
                                            className="cursor-pointer"
                                        >
                                            <i className="material-icons">
                                                add
                                            </i>{' '}
                                            Create new macro
                                        </DropdownItem>
                                        <DropdownItem
                                            id="deleteButtonMenuItem"
                                            onClick={
                                                this
                                                    .toggleMacroDeleteConfirmOpen
                                            }
                                            className="cursor-pointer"
                                        >
                                            <i className="material-icons text-danger">
                                                delete
                                            </i>{' '}
                                            Delete macro
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>

                                <Popover
                                    placement="bottom"
                                    target="deleteMacroTarget"
                                    isOpen={this.state.isDeleteConfirmOpen}
                                    toggle={this.toggleMacroDeleteConfirmOpen}
                                    trigger="legacy"
                                    fade={false}
                                >
                                    <PopoverBody>
                                        <p>
                                            Are you sure you want to delete '
                                            {currentMacro.get('name')}'?
                                        </p>
                                        <Button
                                            onClick={this.deleteMacro}
                                            intent="destructive"
                                        >
                                            Delete macro
                                        </Button>
                                        <Button
                                            onClick={
                                                this
                                                    .toggleMacroDeleteConfirmOpen
                                            }
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
                <a
                    id="clear-macro-button"
                    className={css.clearMacros}
                    onClick={onClearMacro}
                >
                    <i className="material-icons d-none d-md-inline-block">
                        close
                    </i>
                    <Button
                        className="d-md-none"
                        intent="secondary"
                        size="small"
                    >
                        Close
                    </Button>
                    <Tooltip placement="top" target="clear-macro-button">
                        <strong>Esc</strong> to close the macro list.
                    </Tooltip>
                </a>
                {content}
                {this.state.isModalOpen && (
                    <MacroContainer
                        selectedMacro={this.props.currentMacro}
                        closeModal={this.closeMacroModal}
                        isCreatingMacro={this.state.isCreatingMacro}
                        toggleCreateMacro={this.toggleCreateMacro}
                    />
                )}
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        currentUser: state.currentUser,
        newMessageType: newMessageSelectors.getNewMessageType(state),
    }),
    {
        notify,
        deleteMacro,
    }
)

export default connector(TicketMacrosContainer)
