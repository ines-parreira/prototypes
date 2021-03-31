import React from 'react'
import {Location} from 'history'
import {Map} from 'immutable'
import _noop from 'lodash/noop'
import {render} from '@testing-library/react'
import {compressToEncodedURIComponent} from 'lz-string'
import {stringify} from 'query-string'
import reactRouterDom from 'react-router-dom'

import {
    ViewSearchUrlSyncInjectedProps,
    withViewSearchUrlSyncContainer,
} from '../withViewSearchUrlSync'
import * as viewsConfig from '../../../../../config/views'
import history from '../../../../history'

jest.spyOn(reactRouterDom, 'useLocation')
const mockedUseLocation = reactRouterDom.useLocation as jest.MockedFunction<
    typeof reactRouterDom.useLocation
>

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
        search: stringify({
            q: search,
            filters: filters
                ? compressToEncodedURIComponent(filters)
                : undefined,
        }),
    } as Location<any>
}

const defaultProps = ({
    config: viewsConfig.getConfigByName('ticket'),
    isSearch: true,
    activeView: searchView(''),
    updateView: jest.fn(),
    areFiltersValid: true,
} as unknown) as Omit<ViewSearchUrlSyncInjectedProps, 'urlSearchView'> & {
    isSearch: boolean
}

const ticketChannelEqualChatFilter = "eq('ticket.channel', 'chat')"

jest.mock('../../../../history')

beforeEach(() => {
    jest.clearAllMocks()
    mockedUseLocation.mockReturnValue(createLocation())
    ;(history.push as jest.MockedFunction<
        typeof history.push
    >).mockImplementation(_noop)
})

describe('withViewSearchUrlSync', () => {
    it('should inject urlSearchView', () => {
        mockedUseLocation.mockReturnValue(
            createLocation({
                search: 'foo search query',
                filters: ticketChannelEqualChatFilter,
            })
        )
        const {container} = render(<WrappedComponent {...defaultProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    describe('url sync', () => {
        it('should not sync view with url on mount', () => {
            mockedUseLocation.mockReturnValue(createLocation({search: 'bar'}))
            render(
                <WrappedComponent
                    {...defaultProps}
                    activeView={searchView('foo')}
                />
            )
            expect(history.push).not.toHaveBeenCalled()
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
            expect(history.push).toHaveBeenLastCalledWith(
                createLocation({search: newQuery})
            )
        })

        it('should not update url search query when view and url queries are the same', () => {
            const newQuery = 'foo search query'
            mockedUseLocation.mockReturnValue(
                createLocation({search: newQuery})
            )
            const {rerender} = render(<WrappedComponent {...defaultProps} />)
            mockedUseLocation.mockReturnValue(
                createLocation({search: newQuery})
            )
            rerender(
                <WrappedComponent
                    {...defaultProps}
                    activeView={searchView(newQuery)}
                />
            )
            expect(history.push).not.toHaveBeenCalled()
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
            expect(history.push).not.toHaveBeenCalled()
        })

        it('should update active view search on url search query change ', () => {
            const newQuery = 'foo search query'
            const {rerender} = render(<WrappedComponent {...defaultProps} />)
            mockedUseLocation.mockReturnValue(
                createLocation({search: newQuery})
            )
            rerender(<WrappedComponent {...defaultProps} />)
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
            mockedUseLocation.mockReturnValue(
                createLocation({search: newQuery})
            )
            rerender(
                <WrappedComponent
                    {...defaultProps}
                    activeView={searchView(newQuery)}
                />
            )
            expect(defaultProps.updateView).not.toHaveBeenCalled()
        })

        it('should not update active view search when not in search mode', () => {
            const {rerender} = render(<WrappedComponent {...defaultProps} />)
            mockedUseLocation.mockReturnValue(
                createLocation({search: 'foo search query'})
            )
            rerender(<WrappedComponent {...defaultProps} isSearch={false} />)
            expect(defaultProps.updateView).not.toHaveBeenCalled()
        })
    })

    describe('filters sync', () => {
        it('should not sync view with filters on mount', () => {
            mockedUseLocation.mockReturnValue(
                createLocation({
                    search: 'foo',
                    filters: ticketChannelEqualChatFilter,
                })
            )
            render(
                <WrappedComponent
                    {...defaultProps}
                    activeView={searchView('foo')}
                />
            )
            expect(history.push).not.toHaveBeenCalled()
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
            expect(history.push).toHaveBeenLastCalledWith(
                createLocation({filters: ticketChannelEqualChatFilter})
            )
        })

        it('should not update url filters when view and url filters are the same', () => {
            mockedUseLocation.mockReturnValue(
                createLocation({
                    filters: ticketChannelEqualChatFilter,
                })
            )
            const {rerender} = render(<WrappedComponent {...defaultProps} />)
            mockedUseLocation.mockReturnValue(
                createLocation({
                    filters: ticketChannelEqualChatFilter,
                })
            )
            rerender(
                <WrappedComponent
                    {...defaultProps}
                    activeView={searchView('', ticketChannelEqualChatFilter)}
                />
            )
            expect(history.push).not.toHaveBeenCalled()
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
            expect(history.push).not.toHaveBeenCalled()
        })

        it('should update active view filters on url filters change ', () => {
            const {rerender} = render(<WrappedComponent {...defaultProps} />)
            mockedUseLocation.mockReturnValue(
                createLocation({
                    filters: ticketChannelEqualChatFilter,
                })
            )
            rerender(<WrappedComponent {...defaultProps} />)
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
            mockedUseLocation.mockReturnValue(
                createLocation({
                    filters: ticketChannelEqualChatFilter,
                })
            )
            rerender(
                <WrappedComponent
                    {...defaultProps}
                    activeView={searchView('', ticketChannelEqualChatFilter)}
                />
            )
            expect(defaultProps.updateView).not.toHaveBeenCalled()
        })

        it('should not update active view filters when not in search mode', () => {
            const {rerender} = render(<WrappedComponent {...defaultProps} />)
            mockedUseLocation.mockReturnValue(
                createLocation({
                    filters: ticketChannelEqualChatFilter,
                })
            )
            rerender(<WrappedComponent {...defaultProps} isSearch={false} />)
            expect(defaultProps.updateView).not.toHaveBeenCalled()
        })
    })
})
