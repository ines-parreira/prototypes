import React from 'react'
import {Location} from 'history'
import {Map} from 'immutable'
import _noop from 'lodash/noop'
import {browserHistory, InjectedRouter} from 'react-router'
import {render} from '@testing-library/react'
import {compressToEncodedURIComponent} from 'lz-string'

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
    query: string,
    filters?: string
) => Map<any, any>

const createLocation = ({
    search,
    filters,
}: {
    search?: string
    filters?: string
} = {}) => {
    return {
        query: {
            q: search,
            filters: filters
                ? compressToEncodedURIComponent(filters)
                : undefined,
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
    activeView: searchView(''),
    updateView: jest.fn(),
    areFiltersValid: true,
}

const ticketChannelEqualChatFilter = "eq('ticket.channel', 'chat')"

jest.spyOn(browserHistory, 'push')

beforeEach(() => {
    jest.clearAllMocks()
    ;(browserHistory.push as jest.MockedFunction<
        typeof browserHistory.push
    >).mockImplementation(_noop)
})

describe('withViewSearchUrlSync', () => {
    it('should inject urlSearchView', () => {
        const {container} = render(
            <WrappedComponent
                {...defaultProps}
                location={createLocation({
                    search: 'foo search query',
                    filters: ticketChannelEqualChatFilter,
                })}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    describe('url sync', () => {
        it('should not sync view with url on mount', () => {
            render(
                <WrappedComponent
                    {...defaultProps}
                    activeView={searchView('foo')}
                    location={createLocation({search: 'bar'})}
                />
            )
            expect(browserHistory.push).not.toHaveBeenCalled()
            expect(defaultProps.updateView).not.toHaveBeenCalled()
        })

        it('should update url search query on active view search change', () => {
            const newQuery = 'foo search query'
            const {rerender} = render(<WrappedComponent {...defaultProps} />)
            rerender(
                <WrappedComponent
                    {...defaultProps}
                    activeView={searchView(newQuery)}
                />
            )
            expect(browserHistory.push).toHaveBeenLastCalledWith(
                createLocation({search: newQuery})
            )
        })

        it('should not update url search query when view and url queries are the same', () => {
            const newQuery = 'foo search query'
            const {rerender} = render(
                <WrappedComponent
                    {...defaultProps}
                    location={createLocation({search: newQuery})}
                />
            )
            rerender(
                <WrappedComponent
                    {...defaultProps}
                    location={createLocation({search: newQuery})}
                    activeView={searchView(newQuery)}
                />
            )
            expect(browserHistory.push).not.toHaveBeenCalled()
        })

        it('should not update url search query when not in search mode', () => {
            const {rerender} = render(<WrappedComponent {...defaultProps} />)
            rerender(
                <WrappedComponent
                    {...defaultProps}
                    isSearch={false}
                    activeView={searchView('foo search query')}
                />
            )
            expect(browserHistory.push).not.toHaveBeenCalled()
        })

        it('should update active view search on url search query change ', () => {
            const newQuery = 'foo search query'
            const {rerender} = render(<WrappedComponent {...defaultProps} />)
            rerender(
                <WrappedComponent
                    {...defaultProps}
                    location={createLocation({search: newQuery})}
                />
            )
            expect(defaultProps.updateView).toHaveBeenLastCalledWith(
                searchView(newQuery),
                false
            )
        })

        it('should not update active view search when search query is the same as the view query ', () => {
            const newQuery = 'foo search query'
            const {rerender} = render(
                <WrappedComponent
                    {...defaultProps}
                    activeView={searchView(newQuery)}
                />
            )
            rerender(
                <WrappedComponent
                    {...defaultProps}
                    activeView={searchView(newQuery)}
                    location={createLocation({search: newQuery})}
                />
            )
            expect(defaultProps.updateView).not.toHaveBeenCalled()
        })

        it('should not update active view search when not in search mode', () => {
            const {rerender} = render(<WrappedComponent {...defaultProps} />)
            rerender(
                <WrappedComponent
                    {...defaultProps}
                    isSearch={false}
                    location={createLocation({search: 'foo search query'})}
                />
            )
            expect(defaultProps.updateView).not.toHaveBeenCalled()
        })
    })

    describe('filters sync', () => {
        it('should not sync view with filters on mount', () => {
            render(
                <WrappedComponent
                    {...defaultProps}
                    activeView={searchView('foo')}
                    location={createLocation({
                        search: 'foo',
                        filters: ticketChannelEqualChatFilter,
                    })}
                />
            )
            expect(browserHistory.push).not.toHaveBeenCalled()
            expect(defaultProps.updateView).not.toHaveBeenCalled()
        })

        it('should update url filters on active view filters change', () => {
            const {rerender} = render(<WrappedComponent {...defaultProps} />)
            rerender(
                <WrappedComponent
                    {...defaultProps}
                    activeView={searchView('', ticketChannelEqualChatFilter)}
                />
            )
            expect(browserHistory.push).toHaveBeenLastCalledWith(
                createLocation({filters: ticketChannelEqualChatFilter})
            )
        })

        it('should not update url filters when view and url filters are the same', () => {
            const {rerender} = render(
                <WrappedComponent
                    {...defaultProps}
                    location={createLocation({
                        filters: ticketChannelEqualChatFilter,
                    })}
                />
            )
            rerender(
                <WrappedComponent
                    {...defaultProps}
                    location={createLocation({
                        filters: ticketChannelEqualChatFilter,
                    })}
                    activeView={searchView('', ticketChannelEqualChatFilter)}
                />
            )
            expect(browserHistory.push).not.toHaveBeenCalled()
        })

        it('should not update url filters when not in search mode', () => {
            const {rerender} = render(<WrappedComponent {...defaultProps} />)
            rerender(
                <WrappedComponent
                    {...defaultProps}
                    isSearch={false}
                    activeView={searchView('', ticketChannelEqualChatFilter)}
                />
            )
            expect(browserHistory.push).not.toHaveBeenCalled()
        })

        it('should update active view filters on url filters change ', () => {
            const {rerender} = render(<WrappedComponent {...defaultProps} />)
            rerender(
                <WrappedComponent
                    {...defaultProps}
                    location={createLocation({
                        filters: ticketChannelEqualChatFilter,
                    })}
                />
            )
            expect(defaultProps.updateView).toHaveBeenLastCalledWith(
                searchView('', ticketChannelEqualChatFilter),
                false
            )
        })

        it('should not update active view filters when url and view filters are the same ', () => {
            const {rerender} = render(
                <WrappedComponent
                    {...defaultProps}
                    activeView={searchView('', ticketChannelEqualChatFilter)}
                />
            )
            rerender(
                <WrappedComponent
                    {...defaultProps}
                    activeView={searchView('', ticketChannelEqualChatFilter)}
                    location={createLocation({
                        filters: ticketChannelEqualChatFilter,
                    })}
                />
            )
            expect(defaultProps.updateView).not.toHaveBeenCalled()
        })

        it('should not update active view filters when not in search mode', () => {
            const {rerender} = render(<WrappedComponent {...defaultProps} />)
            rerender(
                <WrappedComponent
                    {...defaultProps}
                    isSearch={false}
                    location={createLocation({
                        filters: ticketChannelEqualChatFilter,
                    })}
                />
            )
            expect(defaultProps.updateView).not.toHaveBeenCalled()
        })
    })
})
