import React, {Component, FormEvent} from 'react'
import {fromJS, Map, List} from 'immutable'
import _uniqWith from 'lodash/uniqWith'
import classnames from 'classnames'
import {Button, Container, Row, Col} from 'reactstrap'
import {connect, ConnectedProps} from 'react-redux'

import {ButtonIntent} from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import Loader from '../../../../common/components/Loader/Loader'
import Modal from '../../../../common/components/Modal'
import {DEFAULT_ACTIONS} from '../../../../../config'
import {
    logEvent,
    SegmentEvent,
} from '../../../../../store/middlewares/segmentTracker'
import shortcutManager from '../../../../../services/shortcutManager/index'
import {
    createMacro,
    updateMacro,
    deleteMacro,
} from '../../../../../state/macro/actions'
import {createJob as createTicketJob} from '../../../../../state/tickets/actions'
import {
    createJob as createViewJob,
    updateSelectedItemsIds,
} from '../../../../../state/views/actions'
import {JobParams, JobType} from '../../../../../models/job/types'
import {RootState} from '../../../../../state/types'
import {makeGetViewCount} from '../../../../../state/views/selectors'

import css from './MacroModal.less'
import MacroNoResults from './MacroNoResults'
import MacroPreview from './MacroPreview.js'
import MacroEdit from './MacroEdit'
import MacroModalList from './MacroModalList'

type Props = {
    macros: List<any>
    agents: List<any>
    handleClickItem: (id: number) => void
    disableExternalActions: boolean
    selectionMode: boolean
    page: number
    totalPages: number
    isCreatingMacro?: boolean
    closeModal: () => void
    updateMacros: (macros: List<any>) => void
    activeView: Map<any, any>
    currentMacro: Map<any, any>
    toggleCreateMacro?: (toggle?: boolean) => Promise<void>
    onSearch: (search: string, forceSearch?: boolean) => void
    search: string
    firstLoad: boolean
    selectedItemsIds: List<any>
    allViewItemsSelected: boolean
    fetchMacros: (opts?: {search?: string; page?: number}) => Promise<void>
} & ConnectedProps<typeof connector>

type State = {
    actions: List<any>
    name: string
}

export class MacroModalContainer extends Component<Props, State> {
    static defaultProps: Pick<Props, 'activeView'> = {
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

        logEvent(SegmentEvent.ModalToggled, {
            open: true,
            name: 'macros',
        })

        if (this.props.isCreatingMacro) {
            this._addNewMacro()
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        // if it is the first time we receive a macro, set its actions
        if (
            this.props.currentMacro.isEmpty() &&
            !nextProps.currentMacro.isEmpty()
        ) {
            this._setName(nextProps.currentMacro.get('name'))
            this._setActions(nextProps.currentMacro.get('actions'))
        }

        // if selected macro changes, initialize actions again
        if (
            !this.props.currentMacro.isEmpty() &&
            !nextProps.currentMacro.isEmpty()
        ) {
            if (
                nextProps.currentMacro.get('id') !==
                this.props.currentMacro.get('id')
            ) {
                this._setName(nextProps.currentMacro.get('name'))
                this._setActions(nextProps.currentMacro.get('actions'))
            }
        }
    }

    componentWillUnmount() {
        shortcutManager.unpause()
    }

    _launchApplyMacroJob = (jobPartialParams: Partial<JobParams>) => {
        const {
            activeView,
            allViewItemsSelected,
            createTicketJob,
            createViewJob,
            selectedItemsIds,
            updateSelectedItemsIds,
        } = this.props
        const job = allViewItemsSelected
            ? createViewJob(activeView, JobType.ApplyMacro, jobPartialParams)
            : createTicketJob(
                  selectedItemsIds,
                  JobType.ApplyMacro,
                  jobPartialParams
              )

        void job
            .then(() => {
                updateSelectedItemsIds(fromJS([]))
            })
            .catch()
    }

    _applyMacro = () => {
        const {closeModal, currentMacro} = this.props

        closeModal()
        this._launchApplyMacroJob({
            macro_id: currentMacro.get('id'),
            apply_and_close: false,
        })
    }

    _applyMacroAndClose = () => {
        const {closeModal, currentMacro} = this.props

        closeModal()
        this._launchApplyMacroJob({
            macro_id: currentMacro.get('id'),
            apply_and_close: true,
        })
    }

    _addNewMacro = () => {
        const {toggleCreateMacro} = this.props
        toggleCreateMacro &&
            toggleCreateMacro(true).then(() => {
                this._setName(this.props.currentMacro.get('name'))
                this._setActions(this.props.currentMacro.get('actions'))
            })
    }

    _createMacro = (e: FormEvent) => {
        const {createMacro} = this.props
        e.preventDefault()
        e.stopPropagation()
        const newMacro = this.props.currentMacro
            .set('actions', this.state.actions)
            .set('name', this.state.name)
        return createMacro(newMacro).then((resp) => {
            if ((resp as Record<string, unknown>).status !== 'error') {
                this.props.onSearch(newMacro.get('name'), true)
                this.props.handleClickItem(resp.id)
            }
        })
    }

    _updateMacro = (e: FormEvent) => {
        const {fetchMacros, updateMacro} = this.props
        e.preventDefault()
        e.stopPropagation()
        const updatedMacro = this.props.currentMacro
            .set('actions', this.state.actions)
            .set('name', this.state.name)
        return updateMacro(updatedMacro).then((res) => {
            const macros = this.props.macros
            macros.some(((macro: Map<any, any>, index: number) => {
                if (macro.get('id') === res.id) {
                    const newMacro = fromJS(res) as Map<any, any>
                    if (macro.get('name') !== newMacro.get('name')) {
                        // if the name changed, reload macro list
                        void fetchMacros({search: this.props.search})
                    } else {
                        this.props.updateMacros(macros.set(index, newMacro))
                    }
                    return true
                }
            }) as any)
        })
    }

    _duplicateMacro = (e: FormEvent) => {
        const {createMacro} = this.props
        e.preventDefault()
        e.stopPropagation()

        const {currentMacro} = this.props
        const duplicateMacro = currentMacro
            .delete('id')
            .set('name', `Copy of ${currentMacro.get('name', '') as string}`)

        return createMacro(duplicateMacro).then((res) => {
            // once the macro is created - search it in the list
            this.props.onSearch(res.name || '', true)
        })
    }

    _deleteMacro = () => {
        const {fetchMacros, deleteMacro} = this.props
        const macroId = this.props.currentMacro.get('id', '')
        return deleteMacro(macroId).then(() => {
            void fetchMacros({search: this.props.search})
        })
    }

    _setActions = (actions: List<any>) => {
        // filter actions that exist in configuration
        const filteredActions = actions.filter((action: Map<any, any>) =>
            DEFAULT_ACTIONS.includes(action.get('name'))
        )

        // keep only one action by type
        const uniqActions = fromJS(
            _uniqWith(
                filteredActions.toJS(),
                (first: Record<string, unknown>, second) => {
                    if (
                        this.multipleActionsNames.includes(first.name as string)
                    ) {
                        return false
                    }

                    return first.name === second.name
                }
            )
        )

        this.setState({actions: uniqActions})
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
            activeView,
            getViewCount,
            allViewItemsSelected,
        } = this.props

        const noResults = macros.isEmpty() && !isCreatingMacro

        const selectedCount = allViewItemsSelected
            ? getViewCount(activeView.get('id'))
            : selectedItemsIds.size

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
                                {!selectionMode && (
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
                                )}
                            </Col>
                            <Col xs="9">
                                {!noResults &&
                                    !firstLoad &&
                                    (selectionMode ? (
                                        <div className="d-inline-block float-right">
                                            <Button
                                                type="submit"
                                                color="primary"
                                                onClick={
                                                    this._applyMacroAndClose
                                                }
                                            >
                                                Apply macro and close{' '}
                                                {selectedCount} tickets
                                            </Button>
                                            <Button
                                                className="ml-3"
                                                type="submit"
                                                color="secondary"
                                                onClick={this._applyMacro}
                                            >
                                                Apply macro to {selectedCount}{' '}
                                                tickets
                                            </Button>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="d-inline-block float-right">
                                                {!isCreatingMacro && (
                                                    <ConfirmButton
                                                        intent={
                                                            ButtonIntent.Destructive
                                                        }
                                                        onConfirm={
                                                            this._deleteMacro
                                                        }
                                                        confirmationContent={`Do you really want to delete the macro ${
                                                            this.props.currentMacro.get(
                                                                'name',
                                                                ''
                                                            ) as string
                                                        }?`}
                                                        type="button"
                                                    >
                                                        <ButtonIconLabel icon="delete">
                                                            Delete macro
                                                        </ButtonIconLabel>
                                                    </ConfirmButton>
                                                )}
                                            </div>
                                            {isCreatingMacro ? (
                                                <form
                                                    id="macro_form"
                                                    className="d-inline-block"
                                                    onSubmit={(e) =>
                                                        this._createMacro(e)
                                                    }
                                                >
                                                    <Button
                                                        type="submit"
                                                        color="success"
                                                    >
                                                        Save new macro
                                                    </Button>
                                                </form>
                                            ) : (
                                                <div>
                                                    <form
                                                        id="update_macro_form"
                                                        className="d-inline-block"
                                                        onSubmit={(e) =>
                                                            this._updateMacro(e)
                                                        }
                                                    >
                                                        <Button
                                                            type="submit"
                                                            color="success"
                                                        >
                                                            Update macro
                                                        </Button>
                                                    </form>
                                                    <form
                                                        id="duplicate_macro_form"
                                                        className="d-inline-block ml-1"
                                                        onSubmit={(e) =>
                                                            this._duplicateMacro(
                                                                e
                                                            )
                                                        }
                                                    >
                                                        <Button
                                                            type="submit"
                                                            color="secondary"
                                                        >
                                                            Duplicate macro
                                                        </Button>
                                                    </form>
                                                </div>
                                            )}
                                        </div>
                                    ))}
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
                                onSearch={(e: {
                                    target: {
                                        value: string
                                    }
                                }) => onSearch(e.target.value)}
                                search={this.props.search}
                            />
                        </Col>
                        <Col xs="9" className={css.content}>
                            {firstLoad ? (
                                <Loader minHeight="0" />
                            ) : noResults ? (
                                <MacroNoResults
                                    searchQuery={this.props.search}
                                    newAction={this._addNewMacro}
                                />
                            ) : selectionMode ? (
                                <MacroPreview currentMacro={currentMacro} />
                            ) : (
                                <MacroEdit
                                    className="mt-3 mb-3"
                                    currentMacro={currentMacro}
                                    agents={this.props.agents}
                                    name={this.state.name}
                                    actions={this.state.actions}
                                    setActions={this._setActions}
                                    setName={this._setName}
                                />
                            )}
                        </Col>
                    </Row>
                </Container>
            </Modal>
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        getViewCount: makeGetViewCount(state),
    }),
    {
        createTicketJob,
        createViewJob,
        updateSelectedItemsIds,
        createMacro,
        updateMacro,
        deleteMacro,
    }
)

export default connector(MacroModalContainer)
