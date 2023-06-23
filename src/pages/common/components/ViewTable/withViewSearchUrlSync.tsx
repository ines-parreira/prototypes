import React, {ComponentType, useMemo} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {useLocation} from 'react-router-dom'
import {useUpdateEffect} from 'react-use'
import {Map} from 'immutable'
import {
    compressToEncodedURIComponent,
    decompressFromEncodedURIComponent,
} from 'lz-string'
import {stringify} from 'qs'

import {getConfigByName} from 'config/views'
import useSearch from 'hooks/useSearch'
import history from 'pages/history'
import {RootState} from 'state/types'
import {updateView} from 'state/views/actions'
import {areFiltersValid, getActiveView} from 'state/views/selectors'
import withRouter from 'pages/common/utils/withRouter'

type InjectedProps = {
    urlSearchView: Map<any, any>
}

export type ViewSearchUrlSyncInjectedProps = InjectedProps &
    ConnectedProps<typeof connector>

type Props = {
    isSearch: boolean
    type: string
}

export function withViewSearchUrlSyncContainer<P extends Props>(
    WrappedComponent: ComponentType<P & ViewSearchUrlSyncInjectedProps>
) {
    return (
        props: P & Omit<ViewSearchUrlSyncInjectedProps, keyof InjectedProps>
    ) => {
        const {config, updateView, activeView, isSearch, areFiltersValid} =
            props
        const location = useLocation()
        const {q: urlQuery = '', filters = ''} = useSearch<{
            q?: string
            filters?: string
        }>()
        const viewQuery = activeView.get('search') || ''
        const urlFilters = useMemo(() => {
            return decompressFromEncodedURIComponent(filters) || ''
        }, [filters])
        const viewFilters = activeView.get('filters') || ''

        const urlSearchView = useMemo(() => {
            return (
                config.get('searchView') as (
                    query: string,
                    filters: string
                ) => Map<any, any>
            )(urlQuery, urlFilters)
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [urlQuery, urlFilters])

        useUpdateEffect(() => {
            if (
                isSearch &&
                (urlQuery !== viewQuery || urlFilters !== viewFilters)
            ) {
                updateView(urlSearchView, false)
            }
        }, [urlQuery, urlFilters])

        useUpdateEffect(() => {
            if (isSearch && viewQuery !== urlQuery) {
                history.push({
                    ...location,
                    search: stringify({
                        ...(filters ? {filters} : {}),
                        q: viewQuery,
                    }),
                })
            }
        }, [viewQuery])

        useUpdateEffect(() => {
            if (isSearch && viewFilters !== urlFilters && areFiltersValid) {
                history.push({
                    ...location,
                    search: stringify({
                        ...(urlQuery ? {q: urlQuery} : {}),
                        filters: viewFilters
                            ? compressToEncodedURIComponent(viewFilters)
                            : undefined,
                    }),
                })
            }
        }, [viewFilters])

        return <WrappedComponent {...props} urlSearchView={urlSearchView} />
    }
}

const connector = connect(
    (state: RootState, ownProps: Props) => {
        const config = getConfigByName(ownProps.type)
        return {
            config,
            activeView: getActiveView(state),
            areFiltersValid: areFiltersValid(state),
        }
    },
    {
        updateView,
    }
)

export default function withViewSearchUrlSync<P extends Props>(
    WrappedComponent: ComponentType<P & ViewSearchUrlSyncInjectedProps>
): ComponentType<P> {
    return connector(
        withRouter(
            withViewSearchUrlSyncContainer<P>(WrappedComponent) as any
        ) as any
    ) as ComponentType<P>
}
