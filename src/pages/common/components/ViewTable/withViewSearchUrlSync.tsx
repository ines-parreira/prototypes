import React, {ComponentType, useMemo} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {browserHistory, withRouter, WithRouterProps} from 'react-router'
import {useUpdateEffect} from 'react-use'
import {Map} from 'immutable'
import {
    compressToEncodedURIComponent,
    decompressFromEncodedURIComponent,
} from 'lz-string'

import * as viewsSelectors from '../../../../state/views/selectors'
import {RootState} from '../../../../state/types'
import * as viewsActions from '../../../../state/views/actions'
import * as viewsConfig from '../../../../config/views'

type QueryString = {
    q?: string
    filters?: string
}

type InjectedProps = {
    urlSearchView: Map<any, any>
}

export type ViewSearchUrlSyncInjectedProps = InjectedProps &
    ConnectedProps<typeof connector> &
    WithRouterProps<Record<string, unknown>, QueryString>

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
        const {q: urlQuery = '', filters = ''} = location.query
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
                browserHistory.push({
                    ...location,
                    query: {
                        ...location.query,
                        q: viewQuery,
                    },
                })
            }
        }, [viewQuery])

        useUpdateEffect(() => {
            if (isSearch && viewFilters !== urlFilters && areFiltersValid) {
                browserHistory.push({
                    ...location,
                    query: {
                        ...location.query,
                        filters: viewFilters
                            ? compressToEncodedURIComponent(viewFilters)
                            : undefined,
                    },
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
        withRouter(withViewSearchUrlSyncContainer<P>(WrappedComponent) as any)
    ) as ComponentType<P>
}
