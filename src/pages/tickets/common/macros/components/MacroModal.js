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
import ConfirmButton from '../../../../common/components/ConfirmButton'
import * as segmentTracker from '../../../../../store/middlewares/segmentTracker'
import shortcutManager from '../../../../../services/shortcutManager'

import {macroInitial} from '../../../../../state/macro/reducers'

import css from './MacroModal.less'

export default class MacroModal extends React.Component {
    multipleActionsNames = ['http'] // actions names that can be set multiple times in the same macro

    constructor(props) {
        super(props)

        this.state = {
            modal: false,
            isCreatingMacro: false,
            actions: props.currentMacro.get('actions') || fromJS([]),
            name: props.currentMacro.get('name') || '',
        }
    }

    componentDidMount() {
        shortcutManager.pause(['MacroModal'])

        segmentTracker.logEvent(segmentTracker.EVENTS.MODAL_TOGGLED, {
            open: true,
            name: 'macros',
        })
    }

    componentWillReceiveProps(nextProps) {
        // if it is the first time we receive a macro, set its actions
        if (this.props.currentMacro.isEmpty() && !nextProps.currentMacro.isEmpty()) {
            this._setName(nextProps.currentMacro.get('name'))
            this._setActions(nextProps.currentMacro.get('actions'))
        }

        // if selected macro changes, initialize actions again
        if (!this.props.currentMacro.isEmpty() && !nextProps.currentMacro.isEmpty()) {
            if (nextProps.currentMacro.get('id') !== this.props.currentMacro.get('id')) {
                this._setName(nextProps.currentMacro.get('name'))
                this._setActions(nextProps.currentMacro.get('actions'))
            }
        }

        // if we don't have any macros anymore (have been deleted), close modal
        if (!this.props.macros.isEmpty() && nextProps.macros.isEmpty()) {
            this._toggle()
        }
    }

    componentWillUnmount() {
        shortcutManager.unpause()
    }

    _applyMacro = () => {
        const {activeView, currentMacro, actions, selectedItemsIds} = this.props

        this._toggle()
        const value = currentMacro ? currentMacro.toJS() : null
        return actions.views.bulkUpdate(activeView, selectedItemsIds, 'macro', value)
    }

    _addNewMacro = () => {
        this.setState({isCreatingMacro: true})
        this._setName(macroInitial.get('name'))
        this._setActions(macroInitial.get('actions'))
    }

    _handleClickItem = (macroId) => {
        this.setState({isCreatingMacro: false})
        return this.props.handleClickItem(macroId)
    }

    _createMacro = (e) => {
        e.preventDefault()
        return this.props.actions.macro.createMacro(this.props.currentMacro.set('actions', this.state.actions).set('name', this.state.name))
            .then((resp) => {
                this._handleClickItem(resp.id)
            })
    }

    _updateMacro = (e) => {
        e.preventDefault()
        return this.props.actions.macro.updateMacro(this.props.currentMacro.set('actions', this.state.actions).set('name', this.state.name))
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

    _setName = (name) => {
        this.setState({name})
    }

    render() {
        const {macros, selectionMode, selectedItemsIds} = this.props
        let {currentMacro} = this.props

        if (this.state.isCreatingMacro) {
            currentMacro = macroInitial
        }

        const isUpdate = !!currentMacro && currentMacro.get('id') !== 'new'

        return (
            <Modal
                isOpen={this.props.isOpen}
                onClose={this._toggle}
                className={css.component}
                bodyClassName={css.body}
                size="lg"
                header={selectionMode ? 'Macros' : 'Manage Macros'}
                autoFocus={false}
                footerClassName={css.footer}
                footer={
                    <Container fluid>
                        <Row>
                            <Col
                                xs="3"
                                className={classnames(css.primaryAction)}
                            >
                                {
                                    !selectionMode && (
                                        <Button
                                            type="submit"
                                            color="primary"
                                            onClick={this._addNewMacro}
                                            block
                                        >
                                            <div className="d-flex">
                                                <div>
                                                    <i className="material-icons">
                                                        add
                                                    </i>
                                                </div>
                                                <div className="flex-grow">
                                                    Create macro
                                                </div>
                                            </div>
                                        </Button>
                                    )
                                }
                            </Col>
                            <Col xs="9">
                                {
                                    selectionMode ? (
                                        <div className="d-inline-block float-right">
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
                                            <div className="d-inline-block float-right">
                                                {
                                                    isUpdate && (
                                                        <ConfirmButton
                                                            color="secondary"
                                                            confirm={this._deleteMacro}
                                                            content={`Do you really want to delete the macro ${this.props.currentMacro.get('name', '')}?`}
                                                        >
                                                            <i className="material-icons md-2 text-danger mr-2">
                                                                delete
                                                            </i>
                                                            Delete macro
                                                        </ConfirmButton>
                                                    )
                                                }
                                            </div>
                                            <div className="d-inline-block">
                                                {
                                                    isUpdate ? (
                                                        <form id="macro_form"
                                                              onSubmit={(e) => (this._updateMacro(e))}
                                                        >
                                                            <Button
                                                                type="submit"
                                                                color="success"
                                                            >
                                                                Update macro
                                                            </Button>
                                                        </form>
                                                    ) : (
                                                        <form id="macro_form"
                                                              onSubmit={(e) => (this._createMacro(e))}
                                                        >
                                                            <Button
                                                                type="submit"
                                                                color="success"
                                                            >
                                                                Create macro
                                                            </Button>
                                                        </form>
                                                    )}
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
                            xs="3"
                            className={classnames(css.list, css.content)}
                        >
                            <MacroList
                                macros={macros}
                                currentMacro={currentMacro}
                                disableExternalActions={this.props.disableExternalActions}
                                handleClickItem={this._handleClickItem}
                            />
                        </Col>
                        <Col
                            xs="9"
                            className={css.content}
                        >
                            {
                                selectionMode ? (
                                    <MacroPreview
                                        currentMacro={currentMacro}
                                    />
                                ) : (
                                    <MacroEdit
                                        currentMacro={currentMacro}
                                        agents={this.props.agents}
                                        name={this.state.name}
                                        actions={this.state.actions}
                                        setActions={this._setActions}
                                        setName={this._setName}
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
    handleClickItem: PropTypes.func.isRequired,

    disableExternalActions: PropTypes.bool.isRequired,
    selectionMode: PropTypes.bool.isRequired,
    selectedItemsIds: PropTypes.object,
    isOpen: PropTypes.bool.isRequired,
}

MacroModal.defaultProps = {
    activeView: fromJS({}),
    isOpen: false,
}
