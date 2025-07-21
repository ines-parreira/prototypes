import React, { useCallback, useEffect, useMemo, useState } from 'react'

import classnames from 'classnames'

import { ListMacrosParams, Macro } from '@gorgias/helpdesk-queries'

import useConditionalShortcuts from 'hooks/useConditionalShortcuts'
import MacroFilters from 'pages/common/components/MacroFilters/MacroFilters'
import TextInput from 'pages/common/forms/input/TextInput'
import { moveIndex, MoveIndexDirection } from 'pages/common/utils/keyboard'
import { isMacroDisabled } from 'pages/tickets/common/macros/utils'

import MacroList from './MacroList'

import css from './MacroModalList.less'

type Filters = Pick<
    ListMacrosParams,
    'languages' | 'tags' | 'cursor' | 'search'
>

type Props = {
    currentMacro?: Macro
    fetchMacros: () => Promise<any>
    handleClickItem: (id: number) => void
    onSearch: (searchParams: Filters) => void
    hasDataToLoad?: boolean
    searchParams: Filters
    searchResults: Macro[]
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
                : !!searchResults.length,
        [areExternalActionsDisabled, searchResults],
    )

    useEffect(() => {
        setMacroCursor(
            searchResults.findIndex((macro) => macro.id === currentMacro?.id),
        )
    }, [currentMacro, searchResults])

    const moveCursor = useCallback(
        (direction: MoveIndexDirection, currentMacroCursor?: number) => {
            const cursor = currentMacroCursor ?? macroCursor

            const index = moveIndex(cursor, searchResults.length, {
                direction,
                rotate: true,
            })
            setMacroCursor(index)
            const macro = searchResults[index]
            // skip disabled macros
            if (isMacroDisabled(macro, areExternalActionsDisabled)) {
                moveCursor(
                    direction,
                    cursor + (direction === MoveIndexDirection.Next ? 1 : -1),
                )
                return
            }

            handleClickItem(macro.id!)
        },
        [
            areExternalActionsDisabled,
            handleClickItem,
            macroCursor,
            searchResults,
        ],
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
        [moveCursor],
    )

    useConditionalShortcuts(areKeyboardNavigationEnabled, 'MacroModal', actions)

    return (
        <div className={css.component}>
            <TextInput
                value={searchParams.search ?? undefined}
                onChange={(value) =>
                    onSearch({ ...searchParams, search: value })
                }
                placeholder="Search macros by name, tags or body..."
                autoFocus={!!searchResults.length}
                className={classnames(
                    css.search,
                    'shortcuts-enable',
                    'mt-3',
                    'mb-3',
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
                loadMore={fetchMacros}
                currentMacro={currentMacro}
                areExternalActionsDisabled={areExternalActionsDisabled}
                onClickItem={(macro) => handleClickItem(macro.id!)}
                hasDataToLoad={hasDataToLoad}
            />
        </div>
    )
}
