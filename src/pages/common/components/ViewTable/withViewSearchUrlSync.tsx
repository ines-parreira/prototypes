import React, {ComponentType, useMemo} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {browserHistory, withRouter, WithRouterProps} from 'react-router'
import {useUpdateEffect} from 'react-use'
import {Map} from 'immutable'

import * as viewsSelectors from '../../../../state/views/selectors'
import {RootState} from '../../../../state/types'
import * as viewsActions from '../../../../state/views/actions'
import * as viewsConfig from '../../../../config/views'
import withCancellableRequest, {
    CancellableRequestInjectedProps,
} from '../../utils/withCancellableRequest'

type QueryString = {
    q?: string
}

type InjectedProps = {
    urlSearchView: Map<any, any>
}

export type ViewSearchUrlSyncInjectedProps = InjectedProps &
    ConnectedProps<typeof connector> &
    WithRouterProps<Record<string, unknown>, QueryString> &
    CancellableRequestInjectedProps<
        'fetchViewItemsCancellable',
        'cancelFetchViewItemsCancellable',
        typeof viewsActions.fetchViewItems
    >

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
            fetchViewItemsCancellable,
            isSearch,
        } = props
        const {q: urlQuery = ''} = location.query
        const viewQuery = activeView.get('search') || ''

        const urlSearchView = useMemo(() => {
            return (config.get('searchView') as (
                query: string
            ) => Map<any, any>)(urlQuery)
        }, [urlQuery])

        useUpdateEffect(() => {
            if (isSearch && viewQuery !== urlQuery) {
                updateView(urlSearchView, false)
                void fetchViewItemsCancellable(null, null, null)
            }
        }, [urlQuery])

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

        return <WrappedComponent {...props} urlSearchView={urlSearchView} />
    }
}

const connector = connect(
    (state: RootState, ownProps: Props) => {
        const config = viewsConfig.getConfigByName(ownProps.type)
        return {
            config,
            activeView: viewsSelectors.getActiveView(state),
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
            withCancellableRequest<
                'fetchViewItemsCancellable',
                'cancelFetchViewItemsCancellable',
                typeof viewsActions.fetchViewItems
            >(
                'fetchViewItemsCancellable',
                viewsActions.fetchViewItems
            )(withViewSearchUrlSyncContainer<P>(WrappedComponent)) as any
        )
    ) as ComponentType<P>
}
