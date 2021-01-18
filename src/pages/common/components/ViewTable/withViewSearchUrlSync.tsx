import React, {ComponentType, useMemo} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import {useUpdateEffect} from 'react-use'
import {Map} from 'immutable'
import {
    compressToEncodedURIComponent,
    decompressFromEncodedURIComponent,
} from 'lz-string'
import {parse, stringify} from 'query-string'

import * as viewsSelectors from '../../../../state/views/selectors'
import {RootState} from '../../../../state/types'
import * as viewsActions from '../../../../state/views/actions'
import * as viewsConfig from '../../../../config/views'
import history from '../../../history'

type QueryString = {
    q?: string
    filters?: string
}

type InjectedProps = {
    urlSearchView: Map<any, any>
}

export type ViewSearchUrlSyncInjectedProps = InjectedProps &
    ConnectedProps<typeof connector> &
    RouteComponentProps

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
        const {
            config,
            location,
            updateView,
            activeView,
            isSearch,
            areFiltersValid,
        } = props
        const {q: urlQuery = '', filters = ''} = parse(location.search) as {
            q: string | undefined
            filters: string | undefined
        }
        const viewQuery = activeView.get('search') || ''
        const urlFilters = useMemo(() => {
            return decompressFromEncodedURIComponent(filters) || ''
        }, [filters])
        const viewFilters = activeView.get('filters') || ''

        const urlSearchView = useMemo(() => {
            return (config.get('searchView') as (
                query: string,
                filters: string
            ) => Map<any, any>)(urlQuery, urlFilters)
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
                        ...parse(location.search),
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
                        ...parse(location.search),
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
        const config = viewsConfig.getConfigByName(ownProps.type)
        return {
            config,
            activeView: viewsSelectors.getActiveView(state),
            areFiltersValid: viewsSelectors.areFiltersValid(state),
        }
    },
    {
        updateView: viewsActions.updateView,
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
