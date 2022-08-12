import {CancelToken} from 'axios'
import React, {useEffect, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Container} from 'reactstrap'
import classnames from 'classnames'

import useDelayedAsyncFn from 'hooks/useDelayedAsyncFn'
import useCancellableRequest from 'hooks/useCancellableRequest'
import {OrderDirection} from 'models/api/types'
import {fetchMacros} from 'models/macro/resources'
import MacroFilters from 'pages/common/components/MacroFilters/MacroFilters'
import {
    FetchMacrosOptions,
    MacroSortableProperties,
    Macro,
} from 'models/macro/types'
import Video from 'pages/common/components/Video/Video'
import {macrosFetched} from 'state/entities/macros/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import PageHeader from 'pages/common/components/PageHeader'
import Pagination from 'pages/common/components/Pagination'
import Search from 'pages/common/components/Search'
import {RootState} from 'state/types'
import settingsCss from 'pages/settings/settings.less'

import css from './MacrosSettingsContent.less'
import MacrosSettingsTable from './MacrosSettingsTable'
import {MacrosCreateDropdown} from './MacrosCreateDropdown'

type PaginationState = {
    page: number
    nbPages: number
}

export function MacrosSettingsContentContainer({
    macros,
    macrosFetched,
    notify,
}: ConnectedProps<typeof connector>) {
    const [options, setOptions] = useState<FetchMacrosOptions>({
        orderBy: MacroSortableProperties.CreatedDatetime,
        orderDir: OrderDirection.Asc,
    })
    const [macroIds, setMacroIds] = useState<number[]>([])
    const [pagination, setPagination] = useState<PaginationState>({
        page: 1,
        nbPages: 1,
    })
    const [cancellableFetchMacros] = useCancellableRequest(
        (cancelToken: CancelToken) => async (options: FetchMacrosOptions) =>
            await fetchMacros(options, cancelToken)
    )
    const [{loading: isFetchPending}, handleFetchMacros] = useDelayedAsyncFn(
        async () => {
            try {
                const res = await cancellableFetchMacros(options)
                if (!res) {
                    return
                }
                macrosFetched(res.data)
                setMacroIds(res.data.map((macro: Macro) => macro.id))
                setPagination({page: res.meta.page, nbPages: res.meta.nb_pages})
            } catch (error) {
                void notify({
                    message: 'Failed to fetch macros',
                    status: NotificationStatus.Error,
                })
            }
        },
        [options],
        200
    )
    useEffect(() => {
        void handleFetchMacros()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options])
    useEffect(() => {
        const {page, nbPages} = pagination
        const nextMacroIds = macroIds.filter((macroId) => macros[macroId])
        if (
            nbPages > 1 &&
            nextMacroIds.length < macroIds.length &&
            !isFetchPending
        ) {
            setMacroIds(nextMacroIds)
            setOptions({...options, page: page === nbPages ? page - 1 : page})
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [macros])

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
                                orderBy:
                                    MacroSortableProperties.CreatedDatetime,
                                orderDir: OrderDirection.Asc,
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
                        orderBy,
                        orderDir,
                    })
                }
                options={options}
            />

            <Pagination
                className="pagination-transparent"
                currentPage={pagination.page}
                onChange={(page: number) => setOptions({...options, page})}
                pageCount={pagination.nbPages}
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
