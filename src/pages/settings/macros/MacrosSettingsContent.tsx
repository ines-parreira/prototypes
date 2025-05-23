import React, { useCallback, useEffect, useState } from 'react'

import classnames from 'classnames'
import { NavLink, useRouteMatch } from 'react-router-dom'

import {
    ListMacrosParams,
    Macro,
    useListMacros,
} from '@gorgias/helpdesk-queries'

import { useCreateMacro, useDeleteMacro } from 'hooks/macros'
import useAppDispatch from 'hooks/useAppDispatch'
import { OrderDirection } from 'models/api/types'
import { MacroSortableProperties } from 'models/macro/types'
import MacroFilters from 'pages/common/components/MacroFilters/MacroFilters'
import Navigation from 'pages/common/components/Navigation/Navigation'
import PageHeader from 'pages/common/components/PageHeader'
import Search from 'pages/common/components/Search'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import Video from 'pages/common/components/Video/Video'
import history from 'pages/history'
import settingsCss from 'pages/settings/settings.less'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { MacrosCreateDropdown } from './MacrosCreateDropdown'
import MacrosSettingsTable from './MacrosSettingsTable'

import css from './MacrosSettingsContent.less'

export const STALE_TIME_MS = 15 * 60 * 1000 // 15 minutes

export function MacrosSettingsContent() {
    const dispatch = useAppDispatch()
    const isArchiveTab = !!useRouteMatch('/app/settings/macros/archived')

    const [listMacrosParams, setListMacrosParams] = useState<ListMacrosParams>({
        order_by: 'created_datetime:asc',
    })
    const { data, isLoading, isError } = useListMacros(
        {
            ...listMacrosParams,
            ...(isArchiveTab ? { archived: true } : {}),
        },
        {
            query: {
                staleTime: STALE_TIME_MS,
            },
        },
    )

    const { mutate: createMacro } = useCreateMacro('Failed to duplicate macro')
    const { mutate: deleteMacro } = useDeleteMacro()
    const [selectedMacrosIds, setSelectedMacrosIds] = useState<number[]>([])

    useEffect(() => {
        if (isError) {
            void dispatch(
                notify({
                    message: 'Failed to fetch macros',
                    status: NotificationStatus.Error,
                }),
            )
        }
    }, [dispatch, isError])

    const onMacroDelete = (id: number) => {
        deleteMacro(
            {
                id,
            },
            {
                onSettled: () => {
                    // we are on the first page
                    if (
                        !data?.data.meta.prev_cursor &&
                        !!listMacrosParams.cursor
                    ) {
                        setListMacrosParams({
                            ...listMacrosParams,
                            cursor: undefined,
                        })
                    } else if (data?.data.data.length === 1) {
                        // there is no other item so go back to previous page
                        setListMacrosParams({
                            ...listMacrosParams,
                            cursor: data?.data.meta.prev_cursor ?? undefined,
                        })
                    }
                },
            },
        )
    }

    const onMacroDuplicate = (macro: Macro) => {
        if (!macro) {
            return
        }
        const { actions, name, language } = macro
        createMacro(
            {
                data: {
                    actions,
                    name: `(Copy) ${name}`,
                    language,
                },
            },
            {
                onSuccess: (resp) => {
                    history.push(`/app/settings/macros/${resp.data.id}`)
                },
            },
        )
    }

    const onMacroArchiveOrUnarchived = (macroId: number) => {
        setSelectedMacrosIds((ids) => ids.filter((id) => id !== macroId))
    }

    const onSortOptionsChange = useCallback(
        (order_by: MacroSortableProperties, order_dir: OrderDirection) =>
            !listMacrosParams.search &&
            setListMacrosParams({
                ...listMacrosParams,
                order_by: `${order_by}:${order_dir}`,
            }),
        [listMacrosParams],
    )

    const fetchNextItems = useCallback(() => {
        setListMacrosParams({
            ...listMacrosParams,
            cursor: data?.data.meta.next_cursor ?? undefined,
        })
        setSelectedMacrosIds([])
    }, [data?.data.meta.next_cursor, listMacrosParams])

    const fetchPrevItems = useCallback(() => {
        setListMacrosParams({
            ...listMacrosParams,
            cursor: data?.data.meta.prev_cursor ?? undefined,
        })
        setSelectedMacrosIds([])
    }, [data?.data.meta.prev_cursor, listMacrosParams])

    const onMacroSearchChange = useCallback(
        (search: string) => {
            setListMacrosParams({
                ...listMacrosParams,
                search,
                // Any changes to the search terms should reset the cursor
                cursor: undefined,
            })
        },
        [listMacrosParams],
    )

    const onMacroFilterChange = useCallback(
        (params: Partial<ListMacrosParams>) => {
            setListMacrosParams({
                ...listMacrosParams,
                ...params,
                // Any changes to the search filters should reset the cursor
                cursor: undefined,
            })
        },
        [listMacrosParams],
    )

    return (
        <div className={classnames('full-width', css.wrapper)}>
            <PageHeader title="Macros">
                <div className="d-flex">
                    <Search
                        className="mr-2"
                        value={listMacrosParams.search || ''}
                        onChange={onMacroSearchChange}
                        placeholder="Search macros..."
                        searchDebounceTime={300}
                    />
                    <MacroFilters
                        selectedProperties={{
                            languages: listMacrosParams.languages,
                            tags: listMacrosParams.tags,
                        }}
                        onChange={onMacroFilterChange}
                    />
                    <MacrosCreateDropdown />
                </div>
            </PageHeader>
            <div
                className={classnames(
                    settingsCss.pageContainer,
                    'd-flex',
                    'justify-content-between',
                )}
                data-candu-id="setting-macros-description"
            >
                <div className={css.description}>
                    <div className={css.descriptionText}>
                        <p>
                            Macros are pre-made responses to customer questions
                            that can be applied to tickets directly from the
                            ticket view. You can personalize macros with
                            customer variables and configure actions to trigger
                            when macros are sent.
                        </p>
                    </div>
                </div>
                <Video youtubeId="RevBOdLYeYo" legend="Working with macros" />
            </div>

            <SecondaryNavbar>
                <NavLink
                    onClick={() => setSelectedMacrosIds([])}
                    to="/app/settings/macros/active"
                    exact
                >
                    Active
                </NavLink>
                <NavLink
                    onClick={() => setSelectedMacrosIds([])}
                    to="/app/settings/macros/archived"
                    exact
                >
                    Archived
                </NavLink>
            </SecondaryNavbar>

            <div className={css.table}>
                <MacrosSettingsTable
                    isLoading={isLoading}
                    macros={data?.data.data}
                    onSortOptionsChange={onSortOptionsChange}
                    options={listMacrosParams}
                    onMacroDelete={onMacroDelete}
                    onMacroDuplicate={onMacroDuplicate}
                    onMacroArchiveOrUnarchived={onMacroArchiveOrUnarchived}
                    selectedMacrosIds={selectedMacrosIds}
                    setSelectedMacrosIds={setSelectedMacrosIds}
                />

                <Navigation
                    className={css.navigation}
                    hasNextItems={!!data?.data.meta.next_cursor}
                    hasPrevItems={!!data?.data.meta.prev_cursor}
                    fetchNextItems={fetchNextItems}
                    fetchPrevItems={fetchPrevItems}
                />
            </div>
        </div>
    )
}

export default MacrosSettingsContent
