import React, {useCallback, useState} from 'react'
import {CancelToken} from 'axios'
import {fromJS, Map, List} from 'immutable'
import _debounce from 'lodash/debounce'
import {useAsyncFn, useEffectOnce} from 'react-use'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useCancellableRequest from 'hooks/useCancellableRequest'
import {CursorMeta, OrderDirection} from 'models/api/types'
import {
    FetchMacrosOptions,
    Macro,
    MacroSortableProperties,
} from 'models/macro/types'
import {getAgents} from 'state/agents/selectors'
import {fetchMacros} from 'state/macro/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {areAllActiveViewItemsSelected} from 'state/views/selectors'

import MacroModal from './components/MacroModal'
import {getDefaultSelectedMacroId, getCurrentMacro} from './utils'

type Props = {
    activeView?: Map<any, any>
    closeModal: () => void
    isCreatingMacro?: boolean
    toggleCreateMacro?: (toggle?: boolean) => Promise<void>
    // macro to select when modal opens, selects first macro of list otherwise
    selectedMacro?: Map<any, any>
    selectedItemsIds?: List<any>
    disableExternalActions?: boolean
    selectionMode?: boolean
}

const MacroContainer = ({
    activeView = fromJS({}),
    closeModal,
    disableExternalActions = false,
    isCreatingMacro,
    selectedMacro = fromJS({}),
    selectedItemsIds = fromJS([]),
    selectionMode,
    toggleCreateMacro,
}: Props) => {
    const dispatch = useAppDispatch()

    const agents = useAppSelector(getAgents)
    const allViewItemsSelected = useAppSelector(areAllActiveViewItemsSelected)

    const [searchParams, setSearchParams] = useState<FetchMacrosOptions>({})
    const [selectedMacroId, setSelectedMacroId] = useState<number | null>(null)

    const [macros, setMacros] = useState<Macro[]>([])
    const [meta, setMeta] = useState<CursorMeta | null>(null)

    const [cancellableFetchMacros] = useCancellableRequest(
        (cancelToken: CancelToken) => async (options: FetchMacrosOptions) =>
            await dispatch(fetchMacros(options, cancelToken))
    )

    const [{loading: isFetchPending}, loadMacros] = useAsyncFn(
        async (
            {
                cursor,
                orderBy = `${MacroSortableProperties.Name}:${OrderDirection.Asc}`,
                search,
            }: FetchMacrosOptions = {
                cursor: meta?.next_cursor,
                orderBy: `${MacroSortableProperties.Name}:${OrderDirection.Asc}`,
                search: searchParams.search,
            },
            retainPreviousResults = true
        ) => {
            try {
                const res = await cancellableFetchMacros({
                    cursor,
                    orderBy,
                    search,
                })
                if (res) {
                    const newMacros = retainPreviousResults
                        ? macros.concat(res.data)
                        : res.data
                    setMeta(res.meta)
                    setMacros(newMacros)
                    setSearchParams({cursor, orderBy, search})

                    const macroId = getDefaultSelectedMacroId(
                        fromJS(newMacros),
                        selectedMacroId,
                        isCreatingMacro
                    )

                    macroId && setSelectedMacroId(macroId)

                    return res.data
                }
            } catch (error) {
                void dispatch(
                    notify({
                        message: 'Failed to fetch macros',
                        status: NotificationStatus.Error,
                    })
                )
            }
        },
        [meta, macros, searchParams, selectedMacroId],
        {loading: true}
    )

    useEffectOnce(() => {
        async function load() {
            const params: FetchMacrosOptions = {
                search: selectedMacro.isEmpty()
                    ? ''
                    : selectedMacro.get('name'),
            }
            await loadMacros(params)

            if (!selectedMacro.isEmpty()) {
                setSelectedMacroId(selectedMacro.get('id'))
            }
        }

        void load()
    })

    const handleClickItem = (macroId: number) => {
        toggleCreateMacro?.(false)
        setSelectedMacroId(macroId)
    }

    const updateMacros = (macro: Macro) => {
        const updatedMacroIndex = macros.findIndex(({id}) => id === macro.id)

        const newMacros = [...macros]
        newMacros[updatedMacroIndex] = macro
        setMacros(newMacros)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedLoadMacros = useCallback(
        _debounce(
            async (
                params: FetchMacrosOptions = {},
                retainPreviousResults?: boolean
            ) => await loadMacros(params, retainPreviousResults),
            350
        ),
        []
    )

    const onSearch = async (params: FetchMacrosOptions = {}) => {
        const newParams = {...searchParams, ...params, cursor: null}
        setSearchParams(newParams)
        await debouncedLoadMacros(newParams, false)
    }

    const currentMacro = getCurrentMacro(
        fromJS(macros),
        selectedMacroId,
        isCreatingMacro
    )

    return (
        <MacroModal
            closeModal={closeModal}
            activeView={activeView}
            searchParams={searchParams}
            searchResults={fromJS(macros)}
            fetchMacros={async (...params) => await loadMacros(...params)}
            firstLoad={isFetchPending}
            currentMacro={currentMacro}
            agents={agents}
            disableExternalActions={disableExternalActions || false}
            selectionMode={selectionMode || false}
            selectedItemsIds={selectedItemsIds}
            handleClickItem={handleClickItem}
            updateMacros={updateMacros}
            onSearch={onSearch}
            isCreatingMacro={isCreatingMacro}
            toggleCreateMacro={toggleCreateMacro}
            allViewItemsSelected={allViewItemsSelected}
            hasDataToLoad={!isFetchPending && !!meta?.next_cursor}
        />
    )
}

export default MacroContainer
