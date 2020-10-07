import React from 'react'
import {mount} from 'enzyme'
import {Location} from 'history'
import {Map} from 'immutable'
import _noop from 'lodash/noop'
import {browserHistory, InjectedRouter} from 'react-router'

import {
    ViewSearchUrlSyncInjectedProps,
    withViewSearchUrlSyncContainer,
} from '../withViewSearchUrlSync'
import * as viewsConfig from '../../../../../config/views'

const InnerComponent = ({urlSearchView}: ViewSearchUrlSyncInjectedProps) => {
    return <div>Search view: {JSON.stringify(urlSearchView.toJS())}</div>
}

const Component = withViewSearchUrlSyncContainer(InnerComponent)

const WrappedComponent = (props: typeof defaultProps) => {
    return <Component {...props} type="ticket" />
}

const searchView = viewsConfig.getConfigByName('ticket').get('searchView') as (
    query: string
) => Map<any, any>

const createLocation = (query?: string) => {
    return {
        query: {
            q: query,
        },
    } as Location<any>
}

const defaultProps: Omit<ViewSearchUrlSyncInjectedProps, 'urlSearchView'> & {
    isSearch: boolean
} = {
    config: viewsConfig.getConfigByName('ticket'),
    isSearch: true,
    location: createLocation(),
    params: {},
    router: {} as InjectedRouter,
    routes: [],
    fetchViewItemsCancellable: jest.fn(),
    cancelFetchViewItemsCancellable: jest.fn(),
    activeView: searchView(''),
    updateView: jest.fn(),
}

jest.spyOn(browserHistory, 'push')

beforeEach(() => {
    jest.clearAllMocks()
    ;(browserHistory.push as jest.MockedFunction<
        typeof browserHistory.push
    >).mockImplementation(_noop)
})

describe('withViewSearchUrlSync', () => {
    it('should inject urlSearchView', () => {
        const component = mount(
            <WrappedComponent
                {...defaultProps}
                location={createLocation('foo search query')}
            />
        )
        expect(component).toMatchSnapshot()
    })

    describe('url sync', () => {
        it('should not sync view with url on mount', () => {
            mount(
                <WrappedComponent
                    {...defaultProps}
                    activeView={searchView('foo')}
                    location={createLocation('bar')}
                />
            )
            expect(browserHistory.push).not.toHaveBeenCalled()
            expect(defaultProps.updateView).not.toHaveBeenCalled()
            expect(
                defaultProps.fetchViewItemsCancellable
            ).not.toHaveBeenCalled()
        })

        it('should update url search query on active view search change', () => {
            const newQuery = 'foo search query'
            const component = mount(<WrappedComponent {...defaultProps} />)
            component.setProps({
                activeView: searchView(newQuery),
            })
            expect(browserHistory.push).toHaveBeenLastCalledWith(
                createLocation(newQuery)
            )
        })

        it('should not update url search query when view and url queries are the same', () => {
            const newQuery = 'foo search query'
            const component = mount(
                <WrappedComponent
                    {...defaultProps}
                    location={createLocation(newQuery)}
                />
            )
            component.setProps({
                activeView: searchView(newQuery),
            })
            expect(browserHistory.push).not.toHaveBeenCalled()
        })

        it('should not update url search query when not in search mode', () => {
            const component = mount(<WrappedComponent {...defaultProps} />)
            component.setProps({
                isSearch: false,
                activeView: searchView('foo search query'),
            })
            expect(browserHistory.push).not.toHaveBeenCalled()
        })

        it('should update active view search and fetch new items on url search query change ', () => {
            const newQuery = 'foo search query'
            const component = mount(<WrappedComponent {...defaultProps} />)
            component.setProps({
                location: createLocation(newQuery),
            })
            expect(defaultProps.updateView).toHaveBeenLastCalledWith(
                searchView(newQuery),
                false
            )
            expect(
                defaultProps.fetchViewItemsCancellable
            ).toHaveBeenLastCalledWith(null, null, null)
        })

        it('should not update active view search nor fetch new items when search query is the same as the view query ', () => {
            const newQuery = 'foo search query'
            const component = mount(
                <WrappedComponent
                    {...defaultProps}
                    activeView={searchView(newQuery)}
                />
            )
            component.setProps({
                location: createLocation(newQuery),
            })
            expect(defaultProps.updateView).not.toHaveBeenCalled()
            expect(
                defaultProps.fetchViewItemsCancellable
            ).not.toHaveBeenCalled()
        })

        it('should not update active view search nor fetch new items when not in search mode', () => {
            const component = mount(<WrappedComponent {...defaultProps} />)
            component.setProps({
                isSearch: false,
                location: createLocation('foo search query'),
            })
            expect(defaultProps.updateView).not.toHaveBeenCalled()
            expect(
                defaultProps.fetchViewItemsCancellable
            ).not.toHaveBeenCalled()
        })
    })
})
