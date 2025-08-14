import React, {
    FormEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react'

import { useEffectOnce } from '@repo/hooks'
import classnames from 'classnames'
import { fromJS, List, Map } from 'immutable'
import _uniqWith from 'lodash/uniqWith'
import { Col, Container, Row } from 'reactstrap'

import { Button } from '@gorgias/axiom'
import { Language, Macro, MacroAction } from '@gorgias/helpdesk-queries'

import { logEvent, SegmentEvent } from 'common/segment'
import { DEFAULT_ACTIONS } from 'config'
import {
    useBulkArchiveMacros,
    useCreateMacro,
    useDeleteMacro,
    useUpdateMacro,
} from 'hooks/macros'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { JobParams, JobType } from 'models/job/types'
import { Filters } from 'models/macro/types'
import { MacroActionName } from 'models/macroAction/types'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import Loader from 'pages/common/components/Loader/Loader'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import shortcutManager from 'services/shortcutManager/index'
import { createJob as createTicketJob } from 'state/tickets/actions'
import { createJob as createViewJob } from 'state/views/actions'
import { makeGetViewCount } from 'state/views/selectors'

import MacroEdit from './MacroEdit'
import MacroModalList from './MacroModalList'
import MacroNoResults from './MacroNoResults'
import MacroPreview from './MacroPreview'

import css from './MacroModal.less'

export type ModalProps = {
    activeView: Map<any, any>
    agents: List<any>
    allViewItemsSelected?: boolean
    closeModal: () => void
    currentMacro?: Macro
    areExternalActionsDisabled: boolean
    fetchMacros: (reset?: boolean) => Promise<any>
    firstLoad: boolean
    handleClickItem: (id: number) => void
    hasDataToLoad?: boolean
    isCreatingMacro?: boolean
    onComplete?: (ids: List<any>) => void
    onSearch: (searchParams: Filters) => void
    searchParams: Filters
    searchResults: Macro[]
    selectedItemsIds: List<any>
    selectionMode: boolean
    toggleCreateMacro?: (toggle?: boolean) => void
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
}: ModalProps) => {
    const dispatch = useAppDispatch()
    const { mutate: bulkArchiveMacros } = useBulkArchiveMacros()

    const modalRef = useRef<HTMLDivElement>(null)
    // We don't use directly `currentMacro` to avoid an out-of-sync state between
    // the selected macro and the local `actions` state.
    // Not using this intermediate state results in the response text <RichField />
    // (https://github.com/gorgias/helpdesk-web-app/blob/54527379c7597adcb902bafb4c7427ee04910be2/src/pages/common/forms/RichField/RichField.tsx#L45)
    // being initialized on mount with the value of the previous macro's action.
    const [macro, setMacro] = useState<Macro>()
    const [actions, setActions] = useState<MacroAction[]>(
        currentMacro?.actions || [],
    )
    const [name, setName] = useState<string>(currentMacro?.name || '')
    const [language, setLanguage] = useState<string | null>(
        currentMacro?.language || null,
    )
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleAddNewMacro = useCallback(() => {
        if (!toggleCreateMacro) return

        toggleCreateMacro(true)
        setMacro({
            actions: [],
            name: '',
        })
        setName('')
        setActions([])
        setLanguage(null)
    }, [toggleCreateMacro])

    useEffect(() => {
        if (isCreatingMacro) {
            handleAddNewMacro()
        } else if (!!currentMacro) {
            setMacro(currentMacro)
            setName(currentMacro.name ?? '')
            setActions(currentMacro.actions ?? [])
            setLanguage(currentMacro.language ?? null)
        }
    }, [currentMacro, handleAddNewMacro, isCreatingMacro])

    const getViewCount = useAppSelector(makeGetViewCount)
    const currentViewCount = activeView.isEmpty()
        ? 0
        : getViewCount(activeView.get('id'))

    useEffectOnce(() => {
        shortcutManager.bind('MacroModal')
        shortcutManager.pause(['MacroModal'])
        logEvent(SegmentEvent.ModalToggled, {
            open: true,
            name: 'macros',
        })

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
                      jobPartialParams,
                  ),
              )
            : dispatch(
                  createTicketJob(
                      selectedItemsIds,
                      JobType.ApplyMacro,
                      jobPartialParams,
                  ),
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
            macro_id: currentMacro?.id,
            apply_and_close: false,
        })
    }

    const applyMacroAndClose = () => {
        closeModal()
        launchApplyMacroJob({
            macro_id: currentMacro?.id,
            apply_and_close: true,
        })
    }

    const filterActions = (actions: MacroAction[]) =>
        actions.filter(
            (action) =>
                action.name !== MacroActionName.AddTags ||
                !!(action.arguments.tags as string | null),
        )

    const { mutateAsync: createMacro } = useCreateMacro()
    const { mutate: updateMacro } = useUpdateMacro()
    const { mutate: deleteMacro } = useDeleteMacro()

    const handleCreateMacro = async (e: FormEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const newMacro = {
            actions: filterActions(actions),
            name,
            language: language === '' ? null : (language as Language),
        }

        try {
            const res = await createMacro({ data: newMacro })
            onSearch({ search: res.data.name || '' })
            toggleCreateMacro?.(false)
        } catch {
            // handled in hook
        }
    }

    const handleUpdateMacro = (e: FormEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const updatedMacro = {
            ...currentMacro,
            actions: filterActions(actions),
            name,
            language: language === '' ? null : (language as Language),
        }

        updateMacro(
            { id: updatedMacro.id!, data: updatedMacro },
            {
                onSettled: (data) => {
                    const newMacro = data?.data

                    const macros = searchResults
                    macros.some(((macro: Macro) => {
                        if (
                            macro.id === newMacro!.id &&
                            macro.name !== newMacro!.name
                        ) {
                            onSearch({ search: newMacro!.name || '' })
                        }
                    }) as any)
                },
            },
        )
    }

    const handleDuplicateMacro = async (e: FormEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!!currentMacro) {
            const { id: __id, ...rest } = currentMacro
            const duplicatedMacro = {
                ...rest,
                name: `(Copy) ${currentMacro?.name || ''}`,
            }

            const res = await createMacro({ data: duplicatedMacro })
            // once the macro is created - search it in the list
            onSearch({ search: res.data.name || '' })
        }
    }

    const handleDiscardChanges = (e: FormEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (currentMacro) {
            setActions(currentMacro.actions!)
        }
    }

    const handleDeleteMacro = () => {
        const id = currentMacro?.id

        if (id) {
            deleteMacro(
                {
                    id,
                },
                {
                    onSettled: () => {
                        onSearch({ search: undefined })
                    },
                },
            )
        }
    }

    const handlArchiveMacro = () => {
        bulkArchiveMacros({ data: { ids: [currentMacro!.id!] } })
        void fetchMacros(true)
    }

    const updateActions = (actions?: List<any> | null) => {
        // filter actions that exist in configuration

        const filteredActions = actions?.filter((action: Map<any, any>) => {
            return DEFAULT_ACTIONS.includes(action.get('name'))
        })

        // keep only one action by type
        const uniqActions = fromJS(
            _uniqWith(
                filteredActions ? filteredActions.toJS() : {},
                (first: Record<string, unknown>, second) => {
                    if (
                        multipleActionsNames.includes(
                            first.name as MacroActionName,
                        )
                    ) {
                        return false
                    }

                    return first.name === second.name
                },
            ),
        )

        setActions(uniqActions)
    }
    const noResults = !searchResults.length && !isCreatingMacro

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
                                currentMacro={
                                    isCreatingMacro ? undefined : currentMacro
                                }
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
                                            {!isCreatingMacro && (
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
                                                        currentMacro?.name ?? ''
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
