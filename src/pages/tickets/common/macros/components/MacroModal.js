import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import _uniqWith from 'lodash/uniqWith'
import classnames from 'classnames'
import {
    Button,
    Container,
    Row,
    Col,
} from 'reactstrap'

import Modal from '../../../../common/components/Modal'
import MacroList from './MacroList'
import MacroEdit from './MacroEdit'
import MacroPreview from './MacroPreview'
import {DEFAULT_ACTIONS} from '../../../../../config'
import shortcutManager from '../../../../common/utils/shortcutManager'
import {logEvent} from '../../../../../store/middlewares/amplitudeTracker'
import ConfirmButton from '../../../../common/components/ConfirmButton'

import css from './MacroModal.less'

export default class MacroModal extends React.Component {
    multipleActionsNames = ['http'] // actions names that can be set multiple times in the same macro

    constructor(props) {
        super(props)
        this.state = {
            modal: false,
            actions: props.currentMacro ? props.currentMacro.get('actions') : fromJS([]),
        }
    }

    componentDidMount() {
        logEvent('Opened macro modal')

        shortcutManager.bind('MacroModal', {
            PREVIEW_PREV_MACRO: {
                action: (e) => {
                    e.preventDefault()
                    this.props.actions.macro.previewAdjacentMacroInModal('prev', this.props.disableExternalActions)
                }
            },
            PREVIEW_NEXT_MACRO: {
                action: (e) => {
                    e.preventDefault()
                    this.props.actions.macro.previewAdjacentMacroInModal('next', this.props.disableExternalActions)
                }
            },
            APPLY_MACRO: {
                action: (e) => {
                    if (!this.props.selectionMode) {
                        return
                    }

                    e.preventDefault()
                    this._toggle()
                    this.props.actions.tickets.bulkUpdate(
                        this.props.selectedItemsIds,
                        'macro',
                        this.props.currentMacro.toJS()
                    )
                }
            }
        })
    }

    componentWillReceiveProps(nextProps) {
        // if it is the first time we receive a macro, set its actions
        if (!this.props.currentMacro && nextProps.currentMacro) {
            this._setActions(nextProps.currentMacro.get('actions'))
        }

        if (this.props.currentMacro && nextProps.currentMacro) {
            // if selected macro changes, initialize actions again
            if (nextProps.currentMacro.get('id') !== this.props.currentMacro.get('id')) {
                this._setActions(nextProps.currentMacro.get('actions'))
            }
        }
    }

    _applyMacro = () => {
        const {activeView, currentMacro, actions, selectedItemsIds} = this.props

        this._toggle()
        const value = currentMacro ? currentMacro.toJS() : null
        return actions.views.bulkUpdate(activeView, selectedItemsIds, 'macro', value)
    }

    _addNewMacro = () => {
        return this.props.actions.macro.addNewMacro()
    }

    _createMacro = () => {
        return this.props.actions.macro.createMacro(this.props.currentMacro.set('actions', this.state.actions))
    }

    _updateMacro = () => {
        return this.props.actions.macro.updateMacro(this.props.currentMacro.set('actions', this.state.actions))
    }

    _deleteMacro = () => {
        return this.props.actions.macro.deleteMacro(this.props.currentMacro.get('id', ''))
    }

    _toggle = () => {
        return this.props.actions.macro.closeModal()
    }

    _setActions = (actions) => {
        // filter actions that exist in configuration
        actions = actions.filter(action => DEFAULT_ACTIONS.includes(action.get('name')))

        // keep only one action by type
        actions = fromJS(_uniqWith(actions.toJS(), (first, second) => {
            if (this.multipleActionsNames.includes(first.name)) {
                return false
            }

            return first.name === second.name
        }))

        this.setState({actions})
    }

    render() {
        const {macros, currentMacro, actions, selectionMode, selectedItemsIds} = this.props

        const isUpdate = !!currentMacro && currentMacro.get('id') !== 'new'

        return (
            <Modal
                isOpen={this.props.isOpen}
                onClose={this._toggle}
                className="MacroModal"
                size="lg"
                header={selectionMode ? 'Macros' : 'Manage macros'}
                footer={
                    <Container fluid>
                        <Row>
                            <Col
                                xs="4"
                                className={classnames(css.divider, css.footer)}
                            >
                                {
                                    !selectionMode && (
                                        <Button
                                            type="submit"
                                            color="info"
                                            onClick={this._addNewMacro}
                                            block
                                        >
                                            Create macro
                                        </Button>
                                    )
                                }
                            </Col>
                            <Col xs="8">
                                {
                                    selectionMode ? (
                                            <div className="d-inline-block pull-right">
                                                <Button
                                                    type="submit"
                                                    color="primary"
                                                    onClick={this._applyMacro}
                                                >
                                                    Apply macro to {selectedItemsIds.size} tickets
                                                </Button>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="d-inline-block">
                                                    {
                                                        isUpdate && (
                                                            <ConfirmButton
                                                                color="danger"
                                                                outline
                                                                confirm={this._deleteMacro}
                                                                content={`Do you really want to delete the macro ${this.props.currentMacro.get('name', '')}?`}
                                                            >
                                                                Delete macro
                                                            </ConfirmButton>
                                                        )
                                                    }
                                                </div>
                                                <div className="d-inline-block pull-right">
                                                    {
                                                        isUpdate ? (
                                                                <Button
                                                                    type="submit"
                                                                    color="primary"
                                                                    onClick={this._updateMacro}
                                                                >
                                                                    Update macro
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    type="submit"
                                                                    color="primary"
                                                                    onClick={this._createMacro}
                                                                >
                                                                    Create macro
                                                                </Button>
                                                            )
                                                    }
                                                </div>
                                            </div>
                                        )
                                }
                            </Col>
                        </Row>
                    </Container>
                }
            >
                <Container fluid>
                    <Row>
                        <Col
                            xs="4"
                            className={css.divider}
                        >
                            <MacroList
                                macros={macros}
                                currentMacro={currentMacro}
                                actions={actions.macro}
                                disableExternalActions={this.props.disableExternalActions}
                            />
                        </Col>
                        <Col xs="8">
                            {
                                selectionMode ? (
                                        <MacroPreview
                                            currentMacro={currentMacro}
                                        />
                                    ) : (
                                        <MacroEdit
                                            currentMacro={currentMacro}
                                            agents={this.props.agents}
                                            actions={this.state.actions}
                                            setActions={this._setActions}
                                        />
                                    )
                            }
                        </Col>
                    </Row>
                </Container>
            </Modal>
        )
    }
}

MacroModal.propTypes = {
    activeView: PropTypes.object,
    macros: PropTypes.object.isRequired,
    currentMacro: PropTypes.object,
    agents: PropTypes.object.isRequired,

    actions: PropTypes.object.isRequired,

    disableExternalActions: PropTypes.bool.isRequired,
    selectionMode: PropTypes.bool.isRequired,
    selectedItemsIds: PropTypes.object,
    isOpen: PropTypes.bool.isRequired,
}

MacroModal.defaultProps = {
    activeView: fromJS({}),
    isOpen: false,
}
