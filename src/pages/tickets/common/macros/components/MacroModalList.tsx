import {Macro} from '@gorgias/api-queries'
import classnames from 'classnames'
import {List, Map} from 'immutable'
import React, {useCallback, useEffect, useMemo, useState} from 'react'

import useConditionalShortcuts from 'hooks/useConditionalShortcuts'
import {FetchMacrosOptions} from 'models/macro/types'
import MacroFilters from 'pages/common/components/MacroFilters/MacroFilters'
import TextInput from 'pages/common/forms/input/TextInput'
import {moveIndex, MoveIndexDirection} from 'pages/common/utils/keyboard'
import {isMacroDisabled} from 'pages/tickets/common/macros/utils'

import MacroList from './MacroList'
import css from './MacroModalList.less'

type Props = {
    currentMacro: Map<any, any>
    fetchMacros: (params?: FetchMacrosOptions) => Promise<Macro[] | void>
    handleClickItem: (id: number) => void
    onSearch: (searchParams: FetchMacrosOptions) => void
    hasDataToLoad?: boolean
    searchParams: FetchMacrosOptions
    searchResults: List<any>
    areExternalActionsDisabled?: boolean
}

export default function MacroModalList({
    currentMacro,
    fetchMacros,
    hasDataToLoad,
    handleClickItem,
    onSearch,
    searchParams,
    searchResults,
    areExternalActionsDisabled = false,
}: Props) {
    const [macroCursor, setMacroCursor] = useState(0)
    const areKeyboardNavigationEnabled = useMemo(
        () =>
            areExternalActionsDisabled
                ? !searchResults.every((macro) => isMacroDisabled(macro, true))
                : !searchResults.isEmpty(),
        [areExternalActionsDisabled, searchResults]
    )

    useEffect(() => {
        setMacroCursor(
            searchResults.findIndex(
                (macro: Map<any, any>) =>
                    macro.get('id') === currentMacro.get('id')
            )
        )
    }, [currentMacro, searchResults])

    const moveCursor = useCallback(
        (direction: MoveIndexDirection, currentMacroCursor?: number) => {
            const cursor = currentMacroCursor ?? macroCursor

            const index = moveIndex(cursor, searchResults.size, {
                direction,
                rotate: true,
            })
            setMacroCursor(index)
            const macro = searchResults.get(index) as Map<any, any>
            // skip disabled macros
            if (isMacroDisabled(macro, areExternalActionsDisabled)) {
                moveCursor(
                    direction,
                    cursor + (direction === MoveIndexDirection.Next ? 1 : -1)
                )
                return
            }

            handleClickItem(macro.get('id'))
        },
        [
            areExternalActionsDisabled,
            handleClickItem,
            macroCursor,
            searchResults,
        ]
    )

    const actions = useMemo(
        () => ({
            GO_NEXT_MACRO: {
                action: (e: Event) => {
                    e.preventDefault()
                    moveCursor(MoveIndexDirection.Next)
                },
            },
            GO_PREV_MACRO: {
                action: (e: Event) => {
                    e.preventDefault()
                    moveCursor(MoveIndexDirection.Prev)
                },
            },
        }),
        [moveCursor]
    )

    useConditionalShortcuts(areKeyboardNavigationEnabled, 'MacroModal', actions)

    return (
        <div className={css.component}>
            <TextInput
                value={searchParams.search}
                onChange={(value) => onSearch({...searchParams, search: value})}
                placeholder="Search macros by name, tags or body..."
                autoFocus={!searchResults.isEmpty()}
                className={classnames(
                    css.search,
                    'shortcuts-enable',
                    'mt-3',
                    'mb-3'
                )}
            />
            <MacroFilters
                selectedProperties={{
                    languages: searchParams.languages,
                    tags: searchParams.tags,
                }}
                onChange={(values) =>
                    onSearch({
                        ...searchParams,
                        ...values,
                    })
                }
                tagDropdownMenuProps={{
                    className: css.tags,
                }}
            />
            <MacroList
                className={css.scroller}
                searchResults={searchResults}
                loadMore={() => fetchMacros()}
                currentMacro={currentMacro}
                areExternalActionsDisabled={areExternalActionsDisabled}
                onClickItem={(macro) => handleClickItem(macro.get('id'))}
                hasDataToLoad={hasDataToLoad}
            />
        </div>
    )
}
