// @flow
import React from 'react'
import {fromJS} from 'immutable'
import _uniqWith from 'lodash/uniqWith'
import classnames from 'classnames'
import {
    Button,
    Container,
    Row,
    Col,
} from 'reactstrap'

import Loader from '../../../../common/components/Loader'
import Modal from '../../../../common/components/Modal'
import MacroModalList from './MacroModalList'
import MacroEdit from './MacroEdit'
import MacroPreview from './MacroPreview'
import MacroNoResults from './MacroNoResults'
import {DEFAULT_ACTIONS} from '../../../../../config'
import ConfirmButton from '../../../../common/components/ConfirmButton'
import * as segmentTracker from '../../../../../store/middlewares/segmentTracker'
import shortcutManager from '../../../../../services/shortcutManager'

import css from './MacroModal.less'

import type {Map, List} from 'immutable'
import * as macroActions from '../../../../../state/macro/actions'
import * as viewsActions from '../../../../../state/views/actions'

import type {fetchMacrosType} from '../types'

type Props = {
    macros: Map<*,*>,
    agents: {},
    actions: {
        macro: typeof macroActions,
        views: typeof viewsActions,
    },
    handleClickItem: (T: number) => void,
    disableExternalActions: boolean,
    selectionMode: boolean,
    page: number,
    totalPages: number,
    isCreatingMacro: boolean,
    closeModal: () => void,
    updateMacros: (T: Map<*,*>) => void,
    fetchMacros: fetchMacrosType,
    activeView: Map<*,*>,
    currentMacro: Map<*,*>,
    toggleCreateMacro?: (T?: boolean) => Promise<*>,
    onSearch: (S: string, F?: boolean) => void,
    search: string,
    firstLoad: boolean,
    selectedItemsIds: List<*>,
}

type State = {
    actions: Map<*,*>,
    name: string,
}

export default class MacroModal extends React.Component<Props, State> {
    static defaultProps = {
        activeView: fromJS({}),
    }

    multipleActionsNames = ['http'] // actions names that can be set multiple times in the same macro

    constructor(props: Props) {
        super(props)

        this.state = {
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

        if (this.props.isCreatingMacro) {
            this._addNewMacro()
        }
    }

    componentWillReceiveProps(nextProps: Props) {
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
    }

    componentWillUnmount() {
        shortcutManager.unpause()
    }

    _applyMacro = () => {
        const {activeView, currentMacro, actions, selectedItemsIds, closeModal} = this.props

        closeModal()
        const value = currentMacro ? currentMacro.toJS() : null
        return actions.views.bulkUpdate(activeView, selectedItemsIds, 'macro', value)
    }

    _addNewMacro = () => {
        const { toggleCreateMacro } = this.props
        toggleCreateMacro && toggleCreateMacro(true).then(() => {
            this._setName(this.props.currentMacro.get('name'))
            this._setActions(this.props.currentMacro.get('actions'))
        })
    }

    _createMacro = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        const newMacro = this.props.currentMacro
            .set('actions', this.state.actions)
            .set('name', this.state.name)
        return this.props.actions.macro.createMacro(newMacro)
            .then((resp) => {
                // $FlowFixMe
                this.props.onSearch(newMacro.get('name'), true)
                this.props.handleClickItem(resp.id)
            })
    }

    _updateMacro = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        const updatedMacro = this.props.currentMacro.set('actions', this.state.actions).set('name', this.state.name)
        return this.props.actions.macro.updateMacro(updatedMacro)
            .then((res) => {
                const macros = this.props.macros
                macros.some((macro, index) => {
                    if (macro.get('id') === res.id) {
                        const newMacro = fromJS(res)
                        if (macro.get('name') !== newMacro.get('name')) {
                            // if the name changed, reload macro list
                            this.props.fetchMacros({search: this.props.search})
                        } else {
                            this.props.updateMacros(macros.set(index, newMacro))
                        }
                        return true
                    }
                })
            })
    }

    _deleteMacro = () => {
        const macroId = this.props.currentMacro.get('id', '')
        return this.props.actions.macro.deleteMacro(macroId)
            .then(() => {
                this.props.fetchMacros({search: this.props.search})
            })
    }

    _setActions = (actions: Map<*,*>) => {
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

    _setName = (name: string) => {
        this.setState({name})
    }

    render() {
        const {
            macros,
            selectionMode,
            selectedItemsIds,
            page,
            totalPages,
            disableExternalActions,
            closeModal,
            onSearch,
            currentMacro,
            isCreatingMacro,
            handleClickItem,
            firstLoad,
        } = this.props

        const noResults = macros.isEmpty() && !isCreatingMacro

        return (
            <Modal
                isOpen
                onClose={closeModal}
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
                                    !noResults && !firstLoad && (
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
                                                        !isCreatingMacro && (
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
                                                        isCreatingMacro ? (
                                                            <form id="macro_form"
                                                                onSubmit={(e) => (this._createMacro(e))}
                                                            >
                                                                <Button
                                                                    type="submit"
                                                                    color="success"
                                                                >
                                                                    Save new macro
                                                                </Button>
                                                            </form>
                                                        ) : (
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
                                                        )}
                                                </div>
                                            </div>
                                        )
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
                            <MacroModalList
                                currentMacro={currentMacro}
                                macros={macros}
                                page={page}
                                totalPages={totalPages}
                                fetchMacros={this.props.fetchMacros}
                                disableExternalActions={disableExternalActions}
                                handleClickItem={handleClickItem}
                                onSearch={(e: {target: {value: string}}) => onSearch(e.target.value)}
                                search={this.props.search}
                            />
                        </Col>
                        <Col
                            xs="9"
                            className={css.content}
                        >
                            {
                                firstLoad ? (
                                    <Loader
                                        minHeight="0"
                                    />
                                ) : noResults ? (
                                    <MacroNoResults
                                        searchQuery={this.props.search}
                                        newAction={this._addNewMacro}
                                    />
                                ) : selectionMode ? (
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
