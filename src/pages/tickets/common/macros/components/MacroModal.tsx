import {Macro} from '@gorgias/api-queries'
import classnames from 'classnames'
import {fromJS, Map, List} from 'immutable'
import _uniqWith from 'lodash/uniqWith'
import React, {Component, createRef, FormEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Container, Row, Col} from 'reactstrap'
import {UpsertNotificationAction} from 'reapop/dist/reducers/notifications/actions'

import {logEvent, SegmentEvent} from 'common/segment'
import {DEFAULT_ACTIONS} from 'config'
import {JobParams, JobType} from 'models/job/types'
import {FetchMacrosOptions} from 'models/macro/types'
import {MacroActionName} from 'models/macroAction/types'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import Loader from 'pages/common/components/Loader/Loader'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import shortcutManager from 'services/shortcutManager/index'
import {createMacro, updateMacro, deleteMacro} from 'state/macro/actions'
import {createJob as createTicketJob} from 'state/tickets/actions'
import {RootState} from 'state/types'
import {createJob as createViewJob} from 'state/views/actions'
import {makeGetViewCount} from 'state/views/selectors'

import MacroEdit from './MacroEdit'
import css from './MacroModal.less'
import MacroModalList from './MacroModalList'
import MacroNoResults from './MacroNoResults'
import MacroPreview from './MacroPreview'

type Props = {
    activeView: Map<any, any>
    agents: List<any>
    allViewItemsSelected?: boolean
    closeModal: () => void
    currentMacro: Map<any, any>
    areExternalActionsDisabled: boolean
    fetchMacros: (
        opts?: FetchMacrosOptions,
        retainPreviousResults?: boolean
    ) => Promise<Macro[] | void>
    firstLoad: boolean
    handleClickItem: (id: number) => void
    hasDataToLoad?: boolean
    isCreatingMacro?: boolean
    onComplete?: (ids: List<any>) => void
    onSearch: (searchParams: FetchMacrosOptions) => void
    searchParams: FetchMacrosOptions
    searchResults: List<any>
    selectedItemsIds: List<any>
    selectionMode: boolean
    toggleCreateMacro?: (toggle?: boolean) => void
    updateMacros: (macro: Macro) => void
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
    modalRef = createRef<HTMLDivElement>()

    multipleActionsNames = [
        MacroActionName.Http,
        MacroActionName.SetCustomFieldValue,
    ] // actions names that can be set multiple times in the same macro

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
        shortcutManager.bind('MacroModal')
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

    UNSAFE_componentWillReceiveProps(nextProps: Props) {
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
        shortcutManager.unbind('MacroModal')
        shortcutManager.unpause()
    }

    _launchApplyMacroJob = (jobPartialParams: Partial<JobParams>) => {
        const {
            activeView,
            allViewItemsSelected,
            createTicketJob,
            createViewJob,
            selectedItemsIds,
            onComplete,
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
                onComplete?.(fromJS([]))
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
        if (!toggleCreateMacro) return

        toggleCreateMacro(true)
        this._setName(this.props.currentMacro.get('name'))
        this._setActions(this.props.currentMacro.get('actions'))
        this._setLanguage(this.props.currentMacro.get('language'))
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
                this.props.onSearch({search: newMacro.get('name')})
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
        return updateMacro(updatedMacro).then((newMacro) => {
            const macros = this.props.searchResults
            macros.some(((macro: Map<any, any>) => {
                if (macro.get('id') === newMacro.id) {
                    if (macro.get('name') !== newMacro.name) {
                        // if the name changed, reload macro list
                        void fetchMacros(
                            {
                                search: newMacro.name,
                            },
                            false
                        )
                    } else {
                        this.props.updateMacros(newMacro)
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
            .set('name', `(Copy) ${currentMacro.get('name', '') as string}`)

        return createMacro(duplicateMacro).then((res) => {
            // once the macro is created - search it in the list
            this.props.onSearch({search: res.name || ''})
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
            void fetchMacros(
                {
                    search: this.props.searchParams.search,
                },
                false
            )
        })
    }

    _setActions = (actions?: List<any> | null) => {
        // filter actions that exist in configuration
        const filteredActions = actions?.filter((action: Map<any, any>) =>
            DEFAULT_ACTIONS.includes(action.get('name'))
        )

        // keep only one action by type
        const uniqActions = fromJS(
            _uniqWith(
                filteredActions ? filteredActions.toJS() : {},
                (first: Record<string, unknown>, second) => {
                    if (
                        this.multipleActionsNames.includes(
                            first.name as MacroActionName
                        )
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
            areExternalActionsDisabled,
            closeModal,
            onSearch,
            currentMacro,
            isCreatingMacro,
            handleClickItem,
            firstLoad,
            activeView,
            getViewCount,
            hasDataToLoad,
            allViewItemsSelected,
            selectedItemsIds,
            selectionMode,
        } = this.props

        const noResults = searchResults.isEmpty() && !isCreatingMacro

        const selectedCount = allViewItemsSelected
            ? getViewCount(activeView.get('id'))
            : selectedItemsIds.size

        return (
            <Modal
                isOpen={this.state.isModalOpen}
                onClose={closeModal}
                className={css.component}
                size="huge"
                ref={this.modalRef}
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
                                    areExternalActionsDisabled={
                                        areExternalActionsDisabled
                                    }
                                    handleClickItem={handleClickItem}
                                    onSearch={onSearch}
                                    hasDataToLoad={hasDataToLoad}
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
                                        container={this.modalRef}
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
                                                    className="d-inline-block float-right"
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
        createMacro,
        updateMacro,
        deleteMacro,
    }
)

export default connector(MacroModalContainer)
