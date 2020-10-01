// @flow
import React from 'react'
import ReactDOM from 'react-dom'
import {fromJS, Map} from 'immutable'
import classnames from 'classnames'
import {connect} from 'react-redux'
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Popover,
    PopoverBody,
} from 'reactstrap'

import type {TicketMessageSourceType} from '../../../../../business/types/ticket'
import {isRichType} from '../../../../../config/ticket.ts'
import * as newMessageSelectors from '../../../../../state/newMessage/selectors.ts'
import {deleteMacro, fetchMacros} from '../../../../../state/macro/actions.ts'
import Preview from '../../../common/macros/Preview'
import Tooltip from '../../../../common/components/Tooltip'
import Loader from '../../../../common/components/Loader'
import MacroList from '../../../common/macros/components/MacroList'
import MacroNoResults from '../../../common/macros/components/MacroNoResults'
import MacroContainer from '../../../common/macros/MacroContainer'

import {notify} from './../../../../../state/notifications/actions.ts'

import css from './TicketMacros.less'

type Props = {
    currentTicket: Map<*, *>,
    macros: Map<*, Map<*, *>>,
    isInitialMacrosLoading: boolean,
    newMessageType: TicketMessageSourceType,
    fetchMacros: typeof fetchMacros,
    deleteMacro: typeof deleteMacro,
    applyMacro: () => void,
    notify: typeof notify,
    currentMacro: Map<*, *>,
    onClearMacro: () => void,
    page: number,
    totalPages: number,
    selectMacro: () => void,
    searchQuery: string,
    className?: string,
}

type State = {
    page: number,
    macroDropdownOpen: boolean,
    isDeleteConfirmOpen: boolean,
    isModalOpen: boolean,
    isCreatingMacro: boolean,
}

export class TicketMacros extends React.Component<Props, State> {
    static defaultProps = {
        currentTicket: fromJS({}),
        macros: fromJS([]),
        searchQuery: '',
    }
    previewContainerRef: ?HTMLDivElement

    constructor() {
        super()

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
            const element: ?Node = ReactDOM.findDOMNode(
                this.previewContainerRef
            )

            if (element) {
                // $FlowFixMe
                element.scrollTop = 0
            }
        }
    }

    _toggleMacroDropdown = () => {
        this.setState({
            macroDropdownOpen: !this.state.macroDropdownOpen,
        })
    }

    _toggleMacroDeleteConfirmOpen = () => {
        this.setState({
            isDeleteConfirmOpen: !this.state.isDeleteConfirmOpen,
        })
    }

    _openMacroModal = ({create = false}: {create: boolean}) => {
        this.setState({
            isModalOpen: true,
            isCreatingMacro: create,
        })
    }

    _closeMacroModal = () => {
        this.setState({isModalOpen: false})
        // reload macros, in case they changed in the modal
        this.props.fetchMacros({search: this.props.searchQuery})
    }

    _toggleCreateMacro = (isCreatingMacro: boolean = false): Promise<*> => {
        return new Promise((resolve) => {
            this.setState({isCreatingMacro}, resolve)
        })
    }

    _deleteMacro = () => {
        this._toggleMacroDeleteConfirmOpen()
        const macroId = this.props.currentMacro.get('id', '')
        return this.props.deleteMacro(macroId).then(() => {
            this.props.fetchMacros({search: this.props.searchQuery})
        })
    }

    render() {
        const {
            macros,
            newMessageType,
            className,
            fetchMacros,
            onClearMacro,
            page,
            totalPages,
            currentMacro,
            selectMacro,
            isInitialMacrosLoading,
        } = this.props

        let content = null
        if (macros.isEmpty() && isInitialMacrosLoading) {
            content = <Loader minHeight="100%" message="Loading macros..." />
        } else if (macros.isEmpty()) {
            content = (
                <MacroNoResults
                    searchQuery={this.props.searchQuery}
                    newAction={() => this._openMacroModal({create: true})}
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
                        fetchMacros={fetchMacros}
                        search={this.props.searchQuery}
                        onClickItem={this.props.applyMacro}
                        onHoverItem={selectMacro}
                    />
                    <div
                        className={css.previewContainer}
                        ref={(ref) => (this.previewContainerRef = ref)}
                    >
                        <Dropdown
                            isOpen={this.state.macroDropdownOpen}
                            toggle={this._toggleMacroDropdown}
                        >
                            <DropdownToggle
                                caret
                                className={classnames(css.manageMacros)}
                                id="deleteMacroTarget"
                            >
                                <i className="material-icons">settings</i>
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem
                                    onClick={this._openMacroModal}
                                    className="cursor-pointer"
                                >
                                    <i className="material-icons">settings</i>{' '}
                                    Manage macros
                                </DropdownItem>
                                <DropdownItem
                                    onClick={this._openMacroModal}
                                    className="cursor-pointer"
                                >
                                    <i className="material-icons">mode_edit</i>{' '}
                                    Edit macro
                                </DropdownItem>
                                <DropdownItem
                                    onClick={() =>
                                        this._openMacroModal({create: true})
                                    }
                                    className="cursor-pointer"
                                >
                                    <i className="material-icons">add</i> Create
                                    new macro
                                </DropdownItem>
                                <DropdownItem
                                    id="deleteButtonMenuItem"
                                    onClick={this._toggleMacroDeleteConfirmOpen}
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
                            toggle={this._toggleMacroDeleteConfirmOpen}
                        >
                            <PopoverBody>
                                <p>
                                    Are you sure you want to delete '
                                    {currentMacro.get('name')}'?
                                </p>
                                <Button
                                    onClick={this._deleteMacro}
                                    color="danger"
                                >
                                    Delete macro
                                </Button>
                                <Button
                                    onClick={this._toggleMacroDeleteConfirmOpen}
                                    className="float-right"
                                >
                                    Cancel
                                </Button>
                            </PopoverBody>
                        </Popover>

                        <Preview
                            displayHTML={isRichType(newMessageType)}
                            macro={currentMacro}
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
                    <Button color="secondary" size="sm" className="d-md-none">
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
                        closeModal={this._closeMacroModal}
                        isCreatingMacro={this.state.isCreatingMacro}
                        toggleCreateMacro={this._toggleCreateMacro}
                    />
                )}
            </div>
        )
    }
}

export default connect(
    (state) => ({
        newMessageType: newMessageSelectors.getNewMessageType(state),
    }),
    {
        notify,
        deleteMacro,
    }
)(TicketMacros)
