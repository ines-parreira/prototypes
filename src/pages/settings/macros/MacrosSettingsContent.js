//@flow
import _pick from 'lodash/pick'
//$FlowFixMe
import React, {useEffect, useState} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import {Button, Container} from 'reactstrap'

import {useDelayedAsyncFn} from '../../../hooks'
import type {OrderDirection} from '../../../models/api'
import {fetchMacros, type FetchMacrosOptions, type MacroSortableProperties} from '../../../models/macro'
import {macrosFetched, type MacrosState} from '../../../state/entities/macros'
import {notify} from '../../../state/notifications/actions'
import PageHeader from '../../common/components/PageHeader'
import Pagination from '../../common/components/Pagination'
import Search from '../../common/components/Search'

import css from './MacrosSettingsContent.less'
import MacrosSettingsTable from './MacrosSettingsTable'

type OwnProps = {}

type Props = OwnProps & {
    macros: MacrosState,
    macrosFetched: typeof macrosFetched,
    notify: typeof notify,
}

type PaginationState = {
    page: number,
    nbPages: number,
}

export function MacrosSettingsContentContainer({
    macros,
    macrosFetched,
    notify,
}: Props) {
    const [options, setOptions] = useState<FetchMacrosOptions>({
        orderBy: 'createdDatetime',
        orderDir: 'asc',
    })
    const [macroIds, setMacroIds] = useState<number[]>([])
    const [pagination, setPagination]= useState<PaginationState>({
        page: 1,
        nbPages: 1,
    })
    const [{loading: isFetchPending}, handleFetchMacros] = useDelayedAsyncFn(async () => {
        try {
            const {data, meta: {page, nbPages}} = await fetchMacros(options)
            macrosFetched(data)
            setMacroIds(data.map((macro) => macro.id))
            setPagination({page, nbPages})
        } catch (error) {
            notify({
                message: 'Failed to fetch macros',
                status: 'error',
            })
        }
    }, [options], 200)
    useEffect(() => {
        handleFetchMacros()
    }, [options])
    useEffect(() => {
        const {page, nbPages} = pagination
        const nextMacroIds = macroIds.filter((macroId) => macros[macroId])
        if (
            nbPages > 1
            && nextMacroIds.length < macroIds.length
            && !isFetchPending
        ) {
            setMacroIds(nextMacroIds)
            setOptions({...options, page: page === nbPages ? page - 1 : page})
        }
    }, [macros])

    return (
        <div className="full-width">
            <PageHeader title="Manage macros">
                <div className="d-flex">
                    <Search
                        bindKey
                        className="mr-2"
                        forcedQuery={options.search || ''}
                        onChange={(search) => setOptions({
                            ...options,
                            orderBy: 'createdDatetime',
                            orderDir: 'asc',
                            search,
                        })}
                        placeholder="Search macros..."
                        searchDebounceTime={300}
                    />
                    <Button
                        color="success"
                        onClick={() => {
                            browserHistory.push('/app/settings/macros/new')
                        }}
                        type="button"
                    >
                        Create macro
                    </Button>
                </div>
            </PageHeader>
            <Container
                className="page-container"
                fluid
            >
                <div className={css.description}>
                    <div className={css.descriptionText}>
                        <p>
                            Macros are used to automatise your client support responses. You can create new macros, delete or disable existing ones.
                        </p>
                        <p>
                            For example you can create a macro for letting your clients know the shipment status of their order or for sending gift-card. Check out the video on the right to find out more about working with macros.
                        </p>
                    </div>
                </div>
            </Container>

            <MacrosSettingsTable
                isLoading={isFetchPending}
                macroIds={macroIds}
                onSortOptionsChange={(orderBy: MacroSortableProperties, orderDir: OrderDirection) => !options.search && setOptions({
                    ...options,
                    orderBy,
                    orderDir,
                })}
                sortOptions={_pick(options, ['orderBy', 'orderDir'])}
            />

            <Pagination
                className="pagination-transparent"
                currentPage={pagination.page}
                onChange={(page) => setOptions({...options, page})}
                pageCount={pagination.nbPages}
            />
        </div>
    )
}

const mapStateToProps = (state) => ({
    macros: state.entities.macros,
})

const mapDispatchToProps = {
    macrosFetched,
    notify,
}

export default connect<Props, OwnProps>(mapStateToProps, mapDispatchToProps)(MacrosSettingsContentContainer)
