import axios from 'axios'
import _pick from 'lodash/pick'
import {mount, shallow} from 'enzyme'
import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'

import {macros as macrosFixtures} from 'fixtures/macro'
import {OrderDirection} from 'models/api/types'
import {fetchMacros} from 'models/macro/resources'
import {Macro, MacroSortableProperties} from 'models/macro/types'
import Navigation from 'pages/common/components/Navigation/Navigation'
import Search from 'pages/common/components/Search'
import {MacrosSettingsContentContainer} from '../MacrosSettingsContent'
import MacroSettingsTable from '../MacrosSettingsTable'

jest.mock('models/macro/resources')
jest.mock(
    'pages/common/components/Navigation/Navigation',
    () =>
        ({
            fetchPrevItems,
            fetchNextItems,
        }: Partial<ComponentProps<typeof Navigation>>) =>
            (
                <>
                    <div id="previous" onClick={() => fetchPrevItems?.()} />
                    <div id="next" onClick={() => fetchNextItems?.()} />
                </>
            )
)
jest.mock(
    'pages/common/components/Search',
    () =>
        ({onChange}: {onChange: (value: string) => void}) =>
            (
                <div
                    onChange={(e) =>
                        onChange((e.target as HTMLInputElement).value)
                    }
                />
            )
)
jest.mock(
    '../MacrosSettingsTable',
    () =>
        ({onSortOptionsChange}: ComponentProps<typeof MacroSettingsTable>) => {
            //eslint-disable-next-line  @typescript-eslint/no-var-requires
            const {OrderDirection} = require('models/api/types')
            const {
                MacroSortableProperties,
                //eslint-disable-next-line  @typescript-eslint/no-var-requires
            } = require('models/macro/types')
            return (
                <div
                    onClick={() =>
                        onSortOptionsChange(
                            //eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            MacroSortableProperties.Name,
                            //eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            OrderDirection.Asc
                        )
                    }
                />
            )
        }
)

jest.mock('../MacrosCreateDropdown', () => ({
    MacrosCreateDropdown: () => <div />,
}))

jest.mock(
    'pages/common/components/MacroFilters/MacroFilters',
    () => 'MacroFilters'
)

const cancelToken = axios.CancelToken.source().token

describe('<MacrosSettingsContent/>', () => {
    const mappedMacrosFixtures = macrosFixtures
    const mockFetchMacros: jest.MockedFunction<typeof fetchMacros> =
        fetchMacros as any
    const mockMacrosFetched = jest.fn()
    const mockNotify = jest.fn()
    const macrosState = {
        '1': mappedMacrosFixtures[0],
        '2': mappedMacrosFixtures[0],
        '3': mappedMacrosFixtures[0],
    }
    const minProps = {
        macros: {},
        macrosFetched: mockMacrosFetched,
        notify: mockNotify,
    } as any as ComponentProps<typeof MacrosSettingsContentContainer>

    mockFetchMacros.mockResolvedValue({
        data: {
            data: mappedMacrosFixtures,
            meta: {
                prev_cursor: 'xxx',
                next_cursor: 'yyy',
            },
            uri: '',
            object: '',
        },
        status: 200,
        statusText: 'ok',
        config: {},
        headers: {},
    })

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should match snapshot', () => {
        const component = shallow(
            <MacrosSettingsContentContainer {...minProps} />
        )

        expect(component).toMatchSnapshot()
    })

    it('should fetch macros on mount', (done) => {
        mount(<MacrosSettingsContentContainer {...minProps} />)

        expect(mockFetchMacros).toHaveBeenNthCalledWith(
            1,
            {
                orderBy: `${MacroSortableProperties.CreatedDatetime}:${OrderDirection.Asc}`,
            },
            {cancelToken}
        )
        setImmediate(() => {
            expect(mockMacrosFetched).toHaveBeenNthCalledWith(
                1,
                mappedMacrosFixtures
            )
            done()
        })
    })

    it('should notify when fetching macros fails', (done) => {
        mockFetchMacros.mockRejectedValueOnce('error')
        mount(<MacrosSettingsContentContainer {...minProps} />)

        setImmediate(() => {
            expect(mockNotify).toHaveBeenNthCalledWith(1, {
                message: 'Failed to fetch macros',
                status: 'error',
            })
            done()
        })
    })

    it('should fetch the next macros when changing page', () => {
        const component = mount(
            <MacrosSettingsContentContainer {...minProps} />
        )
        component.find(Navigation).find({id: 'next'}).simulate('click')

        expect(mockFetchMacros).toHaveBeenNthCalledWith(
            2,
            {
                orderBy: `${MacroSortableProperties.CreatedDatetime}:${OrderDirection.Asc}`,
            },
            {cancelToken}
        )
    })

    it('should fetch macros when sorting options change', () => {
        const component = mount(
            <MacrosSettingsContentContainer {...minProps} />
        )

        component.find(MacroSettingsTable).simulate('click')
        expect(mockFetchMacros).toHaveBeenNthCalledWith(
            2,
            {
                orderBy: `${MacroSortableProperties.Name}:${OrderDirection.Asc}`,
            },
            {cancelToken}
        )
    })

    it('should refetch macros when deleting macro', (done) => {
        const component = mount(
            <MacrosSettingsContentContainer
                {...minProps}
                macros={macrosState}
            />
        )

        setImmediate(() => {
            component.setProps({
                macros: _pick(macrosState, ['1', '3']),
            })
            expect(mockFetchMacros).toHaveBeenNthCalledWith(
                2,
                {
                    orderBy: `${MacroSortableProperties.CreatedDatetime}:${OrderDirection.Asc}`,
                },
                {cancelToken}
            )
            done()
        })
    })

    it('should refetch macros at previous page if last page is empty', (done) => {
        const prevCursor = 'prevCursor'
        mockFetchMacros.mockResolvedValue({
            data: {
                data: mappedMacrosFixtures,
                meta: {
                    prev_cursor: prevCursor,
                    next_cursor: null,
                },
                uri: '',
                object: '',
            },
            status: 200,
            statusText: 'ok',
            config: {},
            headers: {},
        })

        const component = mount(
            <MacrosSettingsContentContainer
                {...minProps}
                macros={macrosState}
            />
        )

        setImmediate(() => {
            component.setProps({
                macros: fromJS({}),
            })
            expect(mockFetchMacros).toHaveBeenNthCalledWith(
                2,
                {
                    orderBy: `${MacroSortableProperties.CreatedDatetime}:${OrderDirection.Asc}`,
                    cursor: prevCursor,
                },
                {cancelToken}
            )
            done()
        })
    })

    it('should not refetch macros when the only page is empty', (done) => {
        mockFetchMacros.mockResolvedValueOnce({
            data: {
                data: [{id: 1} as unknown as Macro],
                meta: {
                    prev_cursor: null,
                    next_cursor: null,
                },
                uri: '',
                object: '',
            },
            status: 200,
            statusText: 'ok',
            config: {},
            headers: {},
        })
        const component = mount(
            <MacrosSettingsContentContainer
                {...minProps}
                macros={macrosState}
            />
        )

        setImmediate(() => {
            component.setProps({
                macros: {},
            })
            expect(mockFetchMacros).toHaveBeenCalledTimes(1)
            done()
        })
    })

    it('should fetch macros when searching', () => {
        const component = mount(
            <MacrosSettingsContentContainer {...minProps} />
        )

        component.find(Search).simulate('change', {
            target: {value: 'foobar'},
        })
        expect(mockFetchMacros).toHaveBeenNthCalledWith(
            2,
            {
                orderBy: `${MacroSortableProperties.CreatedDatetime}:${OrderDirection.Asc}`,
                search: 'foobar',
            },
            {cancelToken}
        )
    })

    it('should not sort when searching', () => {
        const component = mount(
            <MacrosSettingsContentContainer {...minProps} />
        )

        component.find(Search).simulate('change', {
            target: {value: 'foobar'},
        })
        jest.resetAllMocks()
        component.find(MacroSettingsTable).simulate('click')
        expect(mockFetchMacros).not.toHaveBeenCalled()
    })
})
