import React, {Component, FormEvent} from 'react'
import {fromJS, Map, List} from 'immutable'
import _uniqWith from 'lodash/uniqWith'
import classnames from 'classnames'
import {Container, Row, Col} from 'reactstrap'
import {connect, ConnectedProps} from 'react-redux'

import {UpsertNotificationAction} from 'reapop/dist/reducers/notifications/actions'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import {
    createMacro,
    updateMacro,
    deleteMacro,
    fetchMacrosParamsTypes,
    MacrosSearchResult,
} from 'state/macro/actions'
import {MacroActionName} from 'models/macroAction/types'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import Loader from '../../../../common/components/Loader/Loader'
import {DEFAULT_ACTIONS} from '../../../../../config'
import {
    logEvent,
    SegmentEvent,
} from '../../../../../store/middlewares/segmentTracker'
import shortcutManager from '../../../../../services/shortcutManager/index'
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
import MacroPreview from './MacroPreview'
import MacroEdit from './MacroEdit'
import MacroModalList from './MacroModalList'

type Props = {
    searchParams: fetchMacrosParamsTypes
    searchResults: MacrosSearchResult
    agents: List<any>
    handleClickItem: (id: number) => void
    disableExternalActions: boolean
    selectionMode: boolean
    isCreatingMacro?: boolean
    closeModal: () => void
    updateMacros: (macros: List<any>) => void
    activeView: Map<any, any>
    currentMacro: Map<any, any>
    toggleCreateMacro?: (toggle?: boolean) => Promise<void>
    onSearch: (
        searchParams: fetchMacrosParamsTypes,
        forceSearch?: boolean
    ) => void
    firstLoad: boolean
    selectedItemsIds: List<any>
    allViewItemsSelected: boolean
    fetchMacros: (opts?: {search?: string; page?: number}) => Promise<void>
} & ConnectedProps<typeof connector>

type State = {
    actions: List<any>
    name: string
    language: string | null
    isModalOpen: boolean
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
            language: props.currentMacro.get('language') || null,
            isModalOpen: false,
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

        this.setState({isModalOpen: true})
    }

    componentWillReceiveProps(nextProps: Props) {
        // if it is the first time we receive a macro, set its actions
        if (
            this.props.currentMacro.isEmpty() &&
            !nextProps.currentMacro.isEmpty()
        ) {
            this._setName(nextProps.currentMacro.get('name'))
            this._setActions(nextProps.currentMacro.get('actions'))
            this._setLanguage(nextProps.currentMacro.get('language'))
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
                this._setLanguage(nextProps.currentMacro.get('language'))
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
                this._setLanguage(this.props.currentMacro.get('language'))
            })
    }

    filterActions = (actions: List<any>) =>
        actions.filter(
            (action: Map<any, any>) =>
                (action.get('name') as string) !== MacroActionName.AddTags ||
                !!(action.getIn(['arguments', 'tags']) as string | null)
        )

    _createMacro = (e: FormEvent) => {
        const {createMacro} = this.props
        e.preventDefault()
        e.stopPropagation()
        const newMacro = this.props.currentMacro
            .set('actions', this.filterActions(this.state.actions))
            .set('name', this.state.name)
            .set(
                'language',
                this.state.language === '' ? null : this.state.language
            )
        return createMacro(newMacro).then((resp) => {
            if (
                resp?.id &&
                (resp as unknown as UpsertNotificationAction)?.payload
                    ?.status !== 'error'
            ) {
                this.props.onSearch({search: newMacro.get('name')}, true)
                this.props.handleClickItem(resp.id)
            }
        })
    }

    _updateMacro = (e: FormEvent) => {
        const {fetchMacros, updateMacro} = this.props
        e.preventDefault()
        e.stopPropagation()
        const updatedMacro = this.props.currentMacro
            .set('actions', this.filterActions(this.state.actions))
            .set('name', this.state.name)
            .set(
                'language',
                this.state.language === '' ? null : this.state.language
            )
        return updateMacro(updatedMacro).then((res) => {
            const macros = this.props.searchResults.macros
            macros.some(((macro: Map<any, any>, index: number) => {
                if (macro.get('id') === res.id) {
                    const newMacro = fromJS(res) as Map<any, any>
                    if (macro.get('name') !== newMacro.get('name')) {
                        // if the name changed, reload macro list
                        void fetchMacros({
                            search: this.props.searchParams.search,
                        })
                    } else {
                        this.props.updateMacros(macros.set(index, newMacro))
                    }
                    return true
                }
            }) as any)
        })
    }

    _duplicateMacro = (e: FormEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const {createMacro, currentMacro} = this.props
        const duplicateMacro = currentMacro
            .delete('id')
            .set('name', `${currentMacro.get('name', '') as string} (copy)`)

        return createMacro(duplicateMacro).then((res) => {
            // once the macro is created - search it in the list
            this.props.onSearch({search: res.name || ''}, true)
        })
    }

    _discardChanges = (e: FormEvent) => {
        e.preventDefault()
        e.stopPropagation()
        this._setActions(this.props.currentMacro.get('actions'))
    }

    _deleteMacro = () => {
        const {fetchMacros, deleteMacro} = this.props
        const macroId = this.props.currentMacro.get('id', '')
        return deleteMacro(macroId).then(() => {
            void fetchMacros({search: this.props.searchParams.search})
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

    _setName = (name: string) => this.setState({name})
    _setLanguage = (language: string | null) => this.setState({language})

    render() {
        const {
            searchParams,
            searchResults,
            selectionMode,
            selectedItemsIds,
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

        const noResults = searchResults.macros.isEmpty() && !isCreatingMacro

        const selectedCount = allViewItemsSelected
            ? getViewCount(activeView.get('id'))
            : selectedItemsIds.size

        return (
            <Modal
                isOpen={this.state.isModalOpen}
                onClose={closeModal}
                className={css.component}
                size="huge"
            >
                <ModalHeader
                    title={selectionMode ? 'Macros' : 'Manage Macros'}
                />
                <ModalBody className={css.body}>
                    <Container fluid>
                        <Row>
                            <Col
                                xs="3"
                                className={classnames(css.list, css.content)}
                            >
                                <MacroModalList
                                    currentMacro={currentMacro}
                                    searchResults={searchResults}
                                    searchParams={searchParams}
                                    fetchMacros={this.props.fetchMacros}
                                    disableExternalActions={
                                        disableExternalActions
                                    }
                                    handleClickItem={handleClickItem}
                                    onSearch={onSearch}
                                />
                            </Col>
                            <Col xs="9" className={css.content}>
                                {firstLoad ? (
                                    <Loader minHeight="0" />
                                ) : noResults ? (
                                    <MacroNoResults
                                        searchParams={this.props.searchParams}
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
                                        language={this.state.language}
                                        actions={this.state.actions}
                                        setActions={this._setActions}
                                        setName={this._setName}
                                        setLanguage={this._setLanguage}
                                    />
                                )}
                            </Col>
                        </Row>
                    </Container>
                </ModalBody>
                <ModalFooter className={css.footer}>
                    <Container fluid>
                        <Row>
                            <Col
                                xs="3"
                                className={classnames(css.primaryAction)}
                            >
                                {!selectionMode && (
                                    <Button
                                        intent="secondary"
                                        onClick={this._addNewMacro}
                                    >
                                        <ButtonIconLabel icon="add">
                                            Create macro
                                        </ButtonIconLabel>
                                    </Button>
                                )}
                            </Col>
                            <Col xs="9">
                                {!noResults &&
                                    !firstLoad &&
                                    (selectionMode ? (
                                        <div className="d-inline-block float-right">
                                            <Button
                                                onClick={
                                                    this._applyMacroAndClose
                                                }
                                            >
                                                Apply macro and close{' '}
                                                {selectedCount} tickets
                                            </Button>
                                            <Button
                                                className="ml-3"
                                                intent="secondary"
                                                onClick={this._applyMacro}
                                            >
                                                Apply macro to {selectedCount}{' '}
                                                tickets
                                            </Button>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="d-inline-block">
                                                {!isCreatingMacro && (
                                                    <ConfirmButton
                                                        intent="destructive"
                                                        onConfirm={
                                                            this._deleteMacro
                                                        }
                                                        confirmationContent={`Do you really want to delete the macro ${
                                                            this.props.currentMacro.get(
                                                                'name',
                                                                ''
                                                            ) as string
                                                        }?`}
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
                                                    <Button type="submit">
                                                        Save new macro
                                                    </Button>
                                                </form>
                                            ) : (
                                                <div className="float-right">
                                                    <form
                                                        id="discard_macro_form"
                                                        className="d-inline-block mr-1"
                                                        onSubmit={(e) =>
                                                            this._discardChanges(
                                                                e
                                                            )
                                                        }
                                                    >
                                                        <Button
                                                            type="submit"
                                                            intent="secondary"
                                                        >
                                                            Discard Changes
                                                        </Button>
                                                    </form>
                                                    <form
                                                        id="duplicate_macro_form"
                                                        className="d-inline-block mr-1"
                                                        onSubmit={(e) =>
                                                            this._duplicateMacro(
                                                                e
                                                            )
                                                        }
                                                    >
                                                        <Button
                                                            type="submit"
                                                            intent="secondary"
                                                        >
                                                            Duplicate
                                                        </Button>
                                                    </form>
                                                    <form
                                                        id="update_macro_form"
                                                        className="d-inline-block"
                                                        onSubmit={(e) =>
                                                            this._updateMacro(e)
                                                        }
                                                    >
                                                        <Button type="submit">
                                                            Update
                                                        </Button>
                                                    </form>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </Col>
                        </Row>
                    </Container>
                </ModalFooter>
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
