import {Macro, MacroAction} from '@gorgias/api-queries'
import classnames from 'classnames'
import {fromJS, Map, List} from 'immutable'
import _uniqWith from 'lodash/uniqWith'
import React, {FormEvent, useEffect, useRef, useState} from 'react'
import {Container, Row, Col} from 'reactstrap'
import {UpsertNotificationAction} from 'reapop/dist/reducers/notifications/actions'

import {logEvent, SegmentEvent} from 'common/segment'
import {DEFAULT_ACTIONS} from 'config'
import {FeatureFlagKey} from 'config/featureFlags'
import {useFlag} from 'core/flags'
import {useBulkArchiveMacros} from 'hooks/macros'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useEffectOnce from 'hooks/useEffectOnce'
import {JobParams, JobType} from 'models/job/types'
import {FetchMacrosOptions} from 'models/macro/types'
import {MacroActionName} from 'models/macroAction/types'
import Button from 'pages/common/components/button/Button'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import Loader from 'pages/common/components/Loader/Loader'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import shortcutManager from 'services/shortcutManager/index'
import {createMacro, updateMacro, deleteMacro} from 'state/macro/actions'
import {createJob as createTicketJob} from 'state/tickets/actions'
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
}

const multipleActionsNames = [
    MacroActionName.Http,
    MacroActionName.SetCustomFieldValue,
] // actions names that can be set multiple times in the same macro

const MacroModal = ({
    activeView,
    agents,
    allViewItemsSelected,
    areExternalActionsDisabled,
    closeModal,
    currentMacro,
    fetchMacros,
    firstLoad,
    handleClickItem,
    hasDataToLoad,
    isCreatingMacro,
    onComplete,
    onSearch,
    searchParams,
    searchResults,
    selectedItemsIds,
    selectionMode,
    toggleCreateMacro,
    updateMacros,
}: Props) => {
    const dispatch = useAppDispatch()
    const isArchivingAvailable = useFlag(FeatureFlagKey.MacroArchives)
    const {mutateAsync: bulkArchiveMacros} = useBulkArchiveMacros()

    const modalRef = useRef<HTMLDivElement>(null)
    // We don't use directly `currentMacro` to avoid an out-of-sync state between
    // the selected macro and the local `actions` state.
    // Not using this intermediate state results in the response text <RichField />
    // (https://github.com/gorgias/helpdesk-web-app/blob/54527379c7597adcb902bafb4c7427ee04910be2/src/pages/common/forms/RichField/RichField.tsx#L45)
    // being initialized on mount with the value of the previous macro's action.
    const [macro, setMacro] = useState<Map<any, any>>()
    const [actions, setActions] = useState<MacroAction[]>(
        (currentMacro.get('actions') as List<any>)?.toJS() || []
    )
    const [name, setName] = useState<string>(currentMacro.get('name') || '')
    const [language, setLanguage] = useState<string | null>(
        currentMacro.get('language') || null
    )
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        setMacro(currentMacro)
        setName(currentMacro.get('name'))
        setActions(currentMacro.get('actions'))
        setLanguage(currentMacro.get('language'))
    }, [currentMacro])

    const getViewCount = useAppSelector(makeGetViewCount)
    const currentViewCount = activeView.get('id')
        ? getViewCount(activeView.get('id'))
        : null

    useEffectOnce(() => {
        shortcutManager.bind('MacroModal')
        shortcutManager.pause(['MacroModal'])
        logEvent(SegmentEvent.ModalToggled, {
            open: true,
            name: 'macros',
        })

        if (isCreatingMacro) {
            handleAddNewMacro()
        }

        setIsModalOpen(true)

        return () => {
            shortcutManager.unbind('MacroModal')
            shortcutManager.unpause()
        }
    })

    const launchApplyMacroJob = (jobPartialParams: Partial<JobParams>) => {
        const job = allViewItemsSelected
            ? dispatch(
                  createViewJob(
                      activeView,
                      JobType.ApplyMacro,
                      jobPartialParams
                  )
              )
            : dispatch(
                  createTicketJob(
                      selectedItemsIds,
                      JobType.ApplyMacro,
                      jobPartialParams
                  )
              )

        void job
            .then(() => {
                onComplete?.(fromJS([]))
            })
            .catch()
    }

    const applyMacro = () => {
        closeModal()
        launchApplyMacroJob({
            macro_id: currentMacro.get('id'),
            apply_and_close: false,
        })
    }

    const applyMacroAndClose = () => {
        closeModal()
        launchApplyMacroJob({
            macro_id: currentMacro.get('id'),
            apply_and_close: true,
        })
    }

    const handleAddNewMacro = () => {
        if (!toggleCreateMacro) return

        toggleCreateMacro(true)
        setMacro(currentMacro)
        setName(currentMacro.get('name'))
        setActions(currentMacro.get('actions'))
        setLanguage(currentMacro.get('language'))
    }

    const filterActions = (actions: MacroAction[]) =>
        actions.filter(
            (action) =>
                action.name !== MacroActionName.AddTags ||
                !!(action.arguments.tags as string | null)
        )

    const handleCreateMacro = async (e: FormEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const newMacro = currentMacro
            .set('actions', filterActions(actions))
            .set('name', name)
            .set('language', language === '' ? null : language)

        const resp = await dispatch(createMacro(newMacro))
        if (
            resp?.id &&
            (resp as unknown as UpsertNotificationAction)?.payload?.status !==
                'error'
        ) {
            onSearch({search: newMacro.get('name')})
            handleClickItem(resp.id)
        }
    }

    const handleUpdateMacro = async (e: FormEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const updatedMacro = currentMacro
            .set('actions', filterActions(actions))
            .set('name', name)
            .set('language', language === '' ? null : language)

        const newMacro = await dispatch(updateMacro(updatedMacro))
        const macros = searchResults
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
                    updateMacros(newMacro)
                }
                return true
            }
        }) as any)
    }

    const handleDuplicateMacro = async (e: FormEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const duplicateMacro = currentMacro
            .delete('id')
            .set('name', `(Copy) ${currentMacro.get('name', '') as string}`)

        const res = await dispatch(createMacro(duplicateMacro))
        // once the macro is created - search it in the list
        onSearch({search: res.name || ''})
    }

    const handleDiscardChanges = (e: FormEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setActions(currentMacro.get('actions'))
    }

    const handleDeleteMacro = async () => {
        const macroId = currentMacro.get('id', '')
        await dispatch(deleteMacro(macroId))
        void fetchMacros(
            {
                search: searchParams.search,
            },
            false
        )
    }

    const handlArchiveMacro = async () => {
        try {
            await bulkArchiveMacros({data: {ids: [currentMacro.get('id')]}})
            void fetchMacros(
                {
                    search: searchParams.search,
                },
                false
            )
        } catch (error) {
            // handled in hooks
        }
    }

    const updateActions = (actions?: List<any> | null) => {
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
                        multipleActionsNames.includes(
                            first.name as MacroActionName
                        )
                    ) {
                        return false
                    }

                    return first.name === second.name
                }
            )
        )

        setActions(uniqActions)
    }
    const noResults = searchResults.isEmpty() && !isCreatingMacro

    const selectedCount = allViewItemsSelected
        ? currentViewCount
        : selectedItemsIds.size

    return (
        <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            className={css.component}
            size="huge"
            ref={modalRef}
        >
            <ModalHeader title={selectionMode ? 'Macros' : 'Manage Macros'} />
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
                                fetchMacros={fetchMacros}
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
                                    searchParams={searchParams}
                                    newAction={handleAddNewMacro}
                                />
                            ) : selectionMode ? (
                                <MacroPreview currentMacro={currentMacro} />
                            ) : (
                                <MacroEdit
                                    className="mt-3 mb-3"
                                    currentMacro={macro}
                                    agents={agents}
                                    name={name}
                                    language={language}
                                    actions={fromJS(actions)}
                                    setActions={updateActions}
                                    setName={setName}
                                    setLanguage={setLanguage}
                                    container={modalRef}
                                />
                            )}
                        </Col>
                    </Row>
                </Container>
            </ModalBody>
            <ModalFooter className={css.footer}>
                <Container fluid>
                    <Row>
                        <Col xs="3" className={classnames(css.primaryAction)}>
                            {!selectionMode && (
                                <Button
                                    intent="secondary"
                                    onClick={handleAddNewMacro}
                                    leadingIcon="add"
                                >
                                    Create macro
                                </Button>
                            )}
                        </Col>
                        <Col xs="9">
                            {!noResults &&
                                !firstLoad &&
                                (selectionMode ? (
                                    <div className="d-inline-block float-right">
                                        <Button onClick={applyMacroAndClose}>
                                            Apply macro and close{' '}
                                            {selectedCount} tickets
                                        </Button>
                                        <Button
                                            className="ml-3"
                                            intent="secondary"
                                            onClick={applyMacro}
                                        >
                                            Apply macro to {selectedCount}{' '}
                                            tickets
                                        </Button>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="d-inline-block">
                                            {isArchivingAvailable && (
                                                <Button
                                                    onClick={handlArchiveMacro}
                                                    intent="secondary"
                                                    className="d-inline-block mr-1"
                                                >
                                                    Archive macro
                                                </Button>
                                            )}
                                            {!isCreatingMacro && (
                                                <ConfirmButton
                                                    intent="destructive"
                                                    onConfirm={
                                                        handleDeleteMacro
                                                    }
                                                    confirmationContent={`Do you really want to delete the macro ${
                                                        currentMacro.get(
                                                            'name'
                                                        ) ?? ''
                                                    }?`}
                                                    leadingIcon="delete"
                                                >
                                                    Delete macro
                                                </ConfirmButton>
                                            )}
                                        </div>
                                        {isCreatingMacro ? (
                                            <form
                                                id="macro_form"
                                                className="d-inline-block float-right"
                                                onSubmit={handleCreateMacro}
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
                                                    onSubmit={
                                                        handleDiscardChanges
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
                                                    onSubmit={
                                                        handleDuplicateMacro
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
                                                    onSubmit={handleUpdateMacro}
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

export default MacroModal
