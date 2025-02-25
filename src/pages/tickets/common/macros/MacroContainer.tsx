import React, { useEffect, useMemo, useState } from 'react'

import { fromJS, List, Map } from 'immutable'

import { Macro } from '@gorgias/api-queries'

import useAppSelector from 'hooks/useAppSelector'
import { Filters } from 'models/macro/types'
import useMacrosSearch from 'pages/common/editor/hooks/useMacrosSearch'
import { getHumanAgents } from 'state/agents/selectors'

import MacroModal from './components/MacroModal'
import { getDefaultSelectedMacroId } from './utils'

type Props = {
    activeView?: Map<any, any>
    allViewItemsSelected?: boolean
    closeModal: () => void
    isCreatingMacro?: boolean
    onComplete?: (ids: List<any>) => void
    toggleCreateMacro?: (toggle?: boolean) => void
    // macro to select when modal opens, selects first macro of list otherwise
    selectedMacro?: Macro
    selectedItemsIds?: List<any>
    areExternalActionsDisabled?: boolean
    selectionMode?: boolean
}

const MacroContainer = ({
    activeView = fromJS({}),
    allViewItemsSelected,
    closeModal,
    areExternalActionsDisabled = false,
    isCreatingMacro,
    onComplete,
    selectedMacro,
    selectedItemsIds = fromJS([]),
    selectionMode,
    toggleCreateMacro,
}: Props) => {
    const agents = useAppSelector(getHumanAgents)

    const [params, setParams] = useState<Filters>(() =>
        !!selectedMacro && !isCreatingMacro
            ? { search: selectedMacro.name }
            : {},
    )
    const [selectedMacroId, setSelectedMacroId] = useState<number | null>(
        selectedMacro?.id ?? null,
    )

    useEffect(() => {
        if (!!selectedMacro?.id) {
            setSelectedMacroId(selectedMacro.id)
        }
    }, [selectedMacro?.id])

    const { data, fetchNextPage, isLoading, nextCursor, refetch } =
        useMacrosSearch({
            params,
            ticket: undefined,
        })

    const currentMacro = useMemo(() => {
        const macroId = getDefaultSelectedMacroId(
            data,
            selectedMacroId,
            isCreatingMacro,
        )

        return data.find((macro) => macro.id === macroId)
    }, [data, selectedMacroId, isCreatingMacro])

    const fetchMacros = async (reset?: boolean) => {
        if (reset) {
            await refetch()
        } else {
            await fetchNextPage()
        }
    }

    const handleClickItem = (macroId: number) => {
        toggleCreateMacro?.(false)
        setSelectedMacroId(macroId)
    }

    const onSearch = (args: Filters = {}) => {
        const newParams = { ...params, ...args, cursor: undefined }
        setParams(newParams)
    }

    return (
        <MacroModal
            closeModal={closeModal}
            activeView={activeView}
            searchParams={params}
            searchResults={data}
            fetchMacros={fetchMacros}
            firstLoad={isLoading}
            currentMacro={currentMacro}
            agents={agents}
            areExternalActionsDisabled={areExternalActionsDisabled}
            selectionMode={selectionMode || false}
            selectedItemsIds={selectedItemsIds}
            handleClickItem={handleClickItem}
            onSearch={onSearch}
            isCreatingMacro={isCreatingMacro}
            toggleCreateMacro={toggleCreateMacro}
            allViewItemsSelected={allViewItemsSelected}
            hasDataToLoad={!!nextCursor}
            onComplete={onComplete}
        />
    )
}

export default MacroContainer
