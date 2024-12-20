import {
    ListMacrosParams,
    queryKeys,
    useListMacros,
    useCreateMacro,
    useDeleteMacro,
    Macro,
} from '@gorgias/api-queries'
import {useQueryClient} from '@tanstack/react-query'
import classnames from 'classnames'
import React, {useCallback, useEffect, useState} from 'react'
import {NavLink, useParams} from 'react-router-dom'

import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppDispatch from 'hooks/useAppDispatch'
import {GorgiasApiError, OrderDirection} from 'models/api/types'
import {MacroSortableProperties} from 'models/macro/types'
import MacroFilters from 'pages/common/components/MacroFilters/MacroFilters'
import Navigation from 'pages/common/components/Navigation/Navigation'
import PageHeader from 'pages/common/components/PageHeader'
import Search from 'pages/common/components/Search'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import Video from 'pages/common/components/Video/Video'
import history from 'pages/history'
import settingsCss from 'pages/settings/settings.less'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {errorToChildren} from 'utils'

import {MacrosCreateDropdown} from './MacrosCreateDropdown'
import css from './MacrosSettingsContent.less'
import MacrosSettingsTable from './MacrosSettingsTable'

export const STALE_TIME_MS = 15 * 60 * 1000 // 15 minutes

export function MacrosSettingsContent() {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()
    const queryKey = queryKeys.macros.listMacros() as string[]
    queryKey.pop()
    const isArchivingAvailable = useFlag(FeatureFlagKey.MacroArchives, false)
    const {activeTab} = useParams<{activeTab: string}>()
    const isArchiveTab = activeTab === 'archived'

    const [listMacrosParams, setListMacrosParams] = useState<ListMacrosParams>({
        order_by: 'created_datetime:asc',
    })
    const {data, isLoading, isError} = useListMacros(
        {
            ...listMacrosParams,
            ...(isArchivingAvailable && isArchiveTab ? {archived: true} : {}),
        },
        {
            query: {
                staleTime: STALE_TIME_MS,
            },
        }
    )

    const {mutateAsync: createMacro} = useCreateMacro()
    const {mutateAsync: deleteMacro} = useDeleteMacro()
    const [selectedMacrosIds, setSelectedMacrosIds] = useState<number[]>([])

    useEffect(() => {
        if (isError) {
            void dispatch(
                notify({
                    message: 'Failed to fetch macros',
                    status: NotificationStatus.Error,
                })
            )
        }
    }, [dispatch, isError])

    const onMacroDelete = async (id: number) => {
        await deleteMacro(
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

                    void queryClient.invalidateQueries({
                        queryKey,
                    })
                },
                onError: (error) => {
                    void dispatch(
                        notify({
                            title: (error as GorgiasApiError).response.data
                                .error.msg,
                            message: errorToChildren(error)!,
                            allowHTML: true,
                            status: NotificationStatus.Error,
                        })
                    )
                },
                onSuccess: () => {
                    void dispatch(
                        notify({
                            message: 'Successfully deleted macro',
                            status: NotificationStatus.Success,
                        })
                    )
                },
            }
        )
    }

    const onMacroDuplicate = async (macro: Macro) => {
        if (!macro) {
            return
        }
        const {actions, name, language} = macro
        await createMacro(
            {
                data: {
                    actions,
                    name: `(Copy) ${name}`,
                    language,
                },
            },
            {
                onSettled: () => {
                    void queryClient.invalidateQueries({
                        queryKey,
                    })
                },
                onError: () => {
                    void notify({
                        message: 'Failed to duplicate macro',
                        status: NotificationStatus.Error,
                    })
                },
                onSuccess: (resp) => {
                    history.push(`/app/settings/macros/${resp.data.id}/edit`)
                },
            }
        )
    }

    const onSortOptionsChange = useCallback(
        (order_by: MacroSortableProperties, order_dir: OrderDirection) =>
            !listMacrosParams.search &&
            setListMacrosParams({
                ...listMacrosParams,
                order_by: `${order_by}:${order_dir}`,
            }),
        [listMacrosParams]
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

    return (
        <div className={classnames('full-width', css.wrapper)}>
            <PageHeader title="Macros">
                <div className="d-flex">
                    <Search
                        className="mr-2"
                        value={listMacrosParams.search || ''}
                        onChange={(search: string) => {
                            setListMacrosParams({
                                ...listMacrosParams,
                                order_by: 'created_datetime:asc',
                                search,
                            })
                        }}
                        placeholder="Search macros..."
                        searchDebounceTime={300}
                    />
                    <MacroFilters
                        selectedProperties={{
                            languages: listMacrosParams.languages,
                            tags: listMacrosParams.tags,
                        }}
                        onChange={(values) =>
                            setListMacrosParams({
                                ...listMacrosParams,
                                ...values,
                            })
                        }
                    />
                    <MacrosCreateDropdown />
                </div>
            </PageHeader>
            <div
                className={classnames(
                    settingsCss.pageContainer,
                    {[settingsCss.pb0]: !isArchivingAvailable},
                    'd-flex',
                    'justify-content-between'
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

            {isArchivingAvailable && (
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
            )}

            <div className={css.table}>
                <MacrosSettingsTable
                    isLoading={isLoading}
                    macros={data?.data.data}
                    onSortOptionsChange={onSortOptionsChange}
                    options={listMacrosParams}
                    onMacroDelete={onMacroDelete}
                    onMacroDuplicate={onMacroDuplicate}
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
