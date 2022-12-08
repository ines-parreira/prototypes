import {CancelToken} from 'axios'
import React, {useEffect, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Container} from 'reactstrap'
import classnames from 'classnames'

import useCancellableRequest from 'hooks/useCancellableRequest'
import useDelayedAsyncFn from 'hooks/useDelayedAsyncFn'
import {CursorDirection, CursorMeta, OrderDirection} from 'models/api/types'
import {fetchMacros} from 'models/macro/resources'
import {
    FetchMacrosOptions,
    MacroSortableProperties,
    Macro,
} from 'models/macro/types'
import MacroFilters from 'pages/common/components/MacroFilters/MacroFilters'
import Video from 'pages/common/components/Video/Video'
import Navigation from 'pages/common/components/Navigation/Navigation'
import PageHeader from 'pages/common/components/PageHeader'
import Search from 'pages/common/components/Search'
import settingsCss from 'pages/settings/settings.less'
import {macrosFetched} from 'state/entities/macros/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {RootState} from 'state/types'

import {MacrosCreateDropdown} from './MacrosCreateDropdown'
import MacrosSettingsTable from './MacrosSettingsTable'
import css from './MacrosSettingsContent.less'

export function MacrosSettingsContentContainer({
    macros,
    macrosFetched,
    notify,
}: ConnectedProps<typeof connector>) {
    const [options, setOptions] = useState<FetchMacrosOptions>({
        orderBy: `${MacroSortableProperties.CreatedDatetime}:${OrderDirection.Asc}`,
    })
    const [macroIds, setMacroIds] = useState<number[]>([])
    const [meta, setMeta] = useState<CursorMeta | null>(null)
    const [currentCursor, setCurrentCursor] = useState<string | null>()
    const [cancellableFetchMacros] = useCancellableRequest(
        (cancelToken: CancelToken) => async (options: FetchMacrosOptions) =>
            await fetchMacros(options, {cancelToken})
    )
    const [{loading: isFetchPending}, handleFetchMacros] = useDelayedAsyncFn(
        async (direction?: CursorDirection, cursor?: string) => {
            const params = {...options}

            if (direction === CursorDirection.PrevCursor && meta?.prev_cursor) {
                params.cursor = meta?.prev_cursor
            } else if (
                direction === CursorDirection.NextCursor &&
                meta?.next_cursor
            ) {
                params.cursor = meta?.next_cursor
            } else if (!!cursor) {
                params.cursor = cursor
            }
            try {
                const {data} = await cancellableFetchMacros(params)
                if (!data) {
                    return
                }
                macrosFetched(data.data)
                setMacroIds(data.data.map((macro: Macro) => macro.id))
                setMeta(data.meta)
                setCurrentCursor(params.cursor)
            } catch (error) {
                void notify({
                    message: 'Failed to fetch macros',
                    status: NotificationStatus.Error,
                })
            }
        },
        [meta, options],
        200
    )

    useEffect(() => {
        void handleFetchMacros()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options])

    useEffect(() => {
        const filteredMacroIds = macroIds.filter((macroId) => macros[macroId])
        if (filteredMacroIds.length < macroIds.length && !isFetchPending) {
            setMacroIds(filteredMacroIds)

            // we deleted the last macro of the current page which is not the first one
            if (
                filteredMacroIds.length === 0 &&
                !meta?.next_cursor &&
                !!meta?.prev_cursor
            ) {
                void handleFetchMacros(undefined, meta?.prev_cursor)
            }

            // we deleted a macro and will refetch the same page which is not the first and only one
            if (!!filteredMacroIds.length && !!meta?.next_cursor) {
                void handleFetchMacros(undefined, currentCursor)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentCursor, macros, meta])

    return (
        <div className="full-width">
            <PageHeader title="Manage macros">
                <div className="d-flex">
                    <Search
                        bindKey
                        className="mr-2"
                        forcedQuery={options.search || ''}
                        onChange={(search: string) =>
                            setOptions({
                                ...options,
                                orderBy: `${MacroSortableProperties.CreatedDatetime}:${OrderDirection.Asc}`,
                                search,
                            })
                        }
                        placeholder="Search macros..."
                        searchDebounceTime={300}
                    />
                    <MacroFilters
                        selectedProperties={{
                            languages: options.languages,
                            tags: options.tags,
                        }}
                        onChange={(values) =>
                            setOptions({...options, ...values})
                        }
                    />
                    <MacrosCreateDropdown />
                </div>
            </PageHeader>
            <Container
                fluid
                className={classnames(
                    settingsCss.pageContainer,
                    settingsCss.pb0,
                    'd-flex',
                    'justify-content-between'
                )}
                data-candu-id="setting-macros-description"
            >
                <div className={css.description}>
                    <div className={css.descriptionText}>
                        <p>
                            Macros are used to automatize your agent support
                            responses. You can create new macros or delete
                            existing ones.
                        </p>
                        <p>
                            For example, you can create a macro for letting your
                            clients know the shipment status of their order or
                            for sending a gift card. Check out the video on the
                            right to find out more about working with macros.
                        </p>
                    </div>
                </div>
                <Video videoId="RevBOdLYeYo" legend="Working with macros" />
            </Container>

            <MacrosSettingsTable
                isLoading={isFetchPending}
                macroIds={macroIds}
                onSortOptionsChange={(
                    orderBy: MacroSortableProperties,
                    orderDir: OrderDirection
                ) =>
                    !options.search &&
                    setOptions({
                        ...options,
                        orderBy: `${orderBy}:${orderDir}`,
                    })
                }
                options={options}
            />

            <Navigation
                className={css.navigation}
                hasNextItems={!!meta?.next_cursor}
                hasPrevItems={!!meta?.prev_cursor}
                fetchNextItems={() =>
                    handleFetchMacros(CursorDirection.NextCursor)
                }
                fetchPrevItems={() =>
                    handleFetchMacros(CursorDirection.PrevCursor)
                }
            />
        </div>
    )
}

const connector = connect(
    (state: RootState) => ({
        macros: state.entities.macros,
    }),
    {
        macrosFetched,
        notify,
    }
)

export default connector(MacrosSettingsContentContainer)
