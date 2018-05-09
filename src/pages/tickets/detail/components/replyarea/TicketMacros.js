// @flow
import React from 'react'
import ReactDOM from 'react-dom'
import {fromJS, Map} from 'immutable'
import classnames from 'classnames'
import {connect} from 'react-redux'
import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Popover, PopoverBody} from 'reactstrap'

import {isRichType} from '../../../../../config/ticket'
import * as newMessageSelectors from '../../../../../state/newMessage/selectors'
import Preview from '../../../common/macros/Preview'
import Tooltip from '../../../../common/components/Tooltip'

import {notify} from './../../../../../state/notifications/actions'
import {openModal, deleteMacro} from './../../../../../state/macro/actions'


import css from './TicketMacros.less'
import MacroContainer from '../../../common/macros/MacroContainer'

type macroType = Map<*, *>

type Props = {
    macros: Map<*, macroType>,
    macrosVisible: boolean,
    applyMacro: (T: macroType) => void,
    openModal: typeof openModal,
    deleteMacro: typeof deleteMacro,
    newMessageType: string,
    setMacrosVisible: (T: boolean) => void,
    setSelectedMacroId: (T: number) => void,
    notify: () => void,
    searchQuery?: string,
    selectedMacroId?: number,
    className?: string,
}

type State = {
    macroDropdownOpen: boolean,
    macroDeleteConfirmOpen: boolean,
}

@connect((state) => ({
    newMessageType: newMessageSelectors.getNewMessageType(state),
}), {
    notify,
    openModal,
    deleteMacro
})
export default class TicketMacros extends React.Component<Props, State> {
    defaultProps = {
        macros: fromJS([]),
        macrosVisible: false,
    }

    state = {
        macroDropdownOpen: false,
        macroDeleteConfirmOpen: false,
    }

    componentDidUpdate(prevProps: Props) {
        // brings the preview to top when previewing another macro
        if (this.props.selectedMacroId !== prevProps.selectedMacroId) {
            const element: ?Node = ReactDOM.findDOMNode(this.refs.previewContainer)

            if (element) {
                // $FlowFixMe
                element.scrollTop = 0
            }
        }
    }

    renderMacroListItem = (macro: macroType) => {
        if (!macro) {
            return null
        }

        return (
            <div
                key={macro.get('id')}
                className={classnames('macro-item', {
                    active: macro.get('id') === this.props.selectedMacroId
                })}
                onMouseEnter={() => this.props.setSelectedMacroId(macro.get('id'))}
                onClick={() => this.props.applyMacro(macro)}
            >
                <div className="content">
                    {macro.get('name')}
                </div>
            </div>
        )
    }

    _toggleMacroDropdown = () => {
        this.setState({
            macroDropdownOpen: !this.state.macroDropdownOpen
        })
    }

    _toggleMacroDeleteConfirmOpen = () => {
        this.setState({
            macroDeleteConfirmOpen: !this.state.macroDeleteConfirmOpen
        })
    }

    render() {
        const {macros, macrosVisible, newMessageType, openModal, searchQuery, setMacrosVisible, className} = this.props
        const macro = macros.find((macro) => macro.get('id') === this.props.selectedMacroId) || fromJS({})

        let content = (
            <div
                className={css.content}
            >
                <div
                    className={classnames(css.macroList, 'macro-list')}
                >
                    {macros.map(this.renderMacroListItem)}
                </div>
                <div
                    className={css.previewContainer}
                    ref="previewContainer"
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
                            <i className="material-icons">
                                settings
                            </i>
                        </DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem
                                onClick={openModal}
                                className="cursor-pointer"
                            >
                                <i className="material-icons">settings</i> Manage macros
                            </DropdownItem>
                            <DropdownItem
                                onClick={openModal}
                                className="cursor-pointer"
                            >
                                <i className="material-icons">mode_edit</i> Edit macro
                            </DropdownItem>
                            <DropdownItem
                                onClick={openModal}
                                className="cursor-pointer"
                            >
                                <i className="material-icons">add</i> Create new macro
                            </DropdownItem>
                            <DropdownItem
                                id="deleteButtonMenuItem"
                                onClick={this._toggleMacroDeleteConfirmOpen}
                                className="cursor-pointer"
                            >
                                <i className="material-icons text-danger">delete</i> Delete macro
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>

                    <Popover
                        placement="bottom"
                        target="deleteMacroTarget"
                        isOpen={this.state.macroDeleteConfirmOpen}
                        toggle={this._toggleMacroDeleteConfirmOpen}
                    >
                        <PopoverBody>
                            <p>Are you sure you want to delete '{macro.get('name')}'?</p>
                            <Button
                                onClick={() => this.props.deleteMacro(macro.get('id'))}
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
                        macro={macro}
                        className={css.preview}
                    />
                </div>
            </div>
        )

        if (macros.isEmpty()) {
            content = (
                <div className="no-result-container">
                    <p>
                        {
                            !!searchQuery ? (
                                <span>No macro for <b>{searchQuery}</b></span>
                            ) : 'You don\'t have any macros yet'
                        }
                    </p>
                    <Button
                        type="button"
                        color="info"
                        onClick={openModal}
                    >
                        <i className="fa fa-fw fa-plus mr-2"/>
                        Create a new macro
                    </Button>
                </div>
            )
        }
        return (
            <div className={classnames(css.component, className)}>
                {
                    macrosVisible && (
                        <a
                            id="clear-macro-button"
                            className={css.clearMacros}
                            onClick={() => setMacrosVisible(false)}
                        >
                            <i className="material-icons d-none d-md-inline-block">
                                close
                            </i>
                            <Button
                                color="secondary"
                                size="sm"
                                className="d-md-none"
                            >
                                Close
                            </Button>
                            <Tooltip
                                placement="top"
                                target="clear-macro-button"
                            >
                                <strong>Esc</strong> to close the macro list.
                            </Tooltip>
                        </a>
                    )
                }

                {content}

                <MacroContainer selectedMacroIdOnOpen={this.props.selectedMacroId}/>
            </div>
        )
    }
}
