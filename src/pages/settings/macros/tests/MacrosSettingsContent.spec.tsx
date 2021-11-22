import axios from 'axios'
import _pick from 'lodash/pick'
import {mount, shallow} from 'enzyme'
import React, {ComponentProps} from 'react'
import {Button} from 'reactstrap'

import {macros as macrosFixtures} from '../../../../fixtures/macro'
import {fetchMacros} from '../../../../models/macro/resources'
import Pagination from '../../../common/components/Pagination'
import Search from '../../../common/components/Search'
import {MacrosSettingsContentContainer} from '../MacrosSettingsContent'
import MacroSettingsTable from '../MacrosSettingsTable'
import history from '../../../history'

jest.mock('../../../../models/macro/resources')
jest.mock(
    '../../../common/components/Pagination',
    //$TsFixMe Replace Props type to ComponentProps<typeof Pagination> on Pagination migration
    () =>
        ({onChange}: {onChange: (value: number) => void}) =>
            <div onClick={() => onChange(2)} />
)
jest.mock(
    '../../../common/components/Search',
    //$TsFixMe Replace Props type to ComponentProps<typeof Search> on Search migration
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
jest.mock('../../../history')
jest.mock(
    '../MacrosSettingsTable',
    () =>
        ({onSortOptionsChange}: ComponentProps<typeof MacroSettingsTable>) => {
            //eslint-disable-next-line  @typescript-eslint/no-var-requires
            const {OrderDirection} = require('../../../../models/api/types')
            const {
                MacroSortableProperties,
                //eslint-disable-next-line  @typescript-eslint/no-var-requires
            } = require('../../../../models/macro/types')
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

const mockToken = axios.CancelToken.source().token

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
        data: mappedMacrosFixtures,
        meta: {
            page: 1,
            nb_pages: 2,
            current_page: '',
            item_count: 10,
            per_page: 10,
        },
        uri: '',
        object: '',
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
                orderBy: 'createdDatetime',
                orderDir: 'asc',
            },
            mockToken
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
        mockFetchMacros.mockRejectedValue('error')
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

        component.find(Pagination).simulate('click')
        expect(mockFetchMacros).toHaveBeenNthCalledWith(
            2,
            {
                orderBy: 'createdDatetime',
                orderDir: 'asc',
                page: 2,
            },
            mockToken
        )
    })

    it('should redirect when creating new macro', () => {
        const component = mount(
            <MacrosSettingsContentContainer {...minProps} />
        )

        component.find(Button).simulate('click')
        expect(history.push).toHaveBeenNthCalledWith(
            1,
            '/app/settings/macros/new'
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
                orderBy: 'name',
                orderDir: 'asc',
            },
            mockToken
        )
    })

    it('should refetch macros when deleting macro', (done) => {
        mockFetchMacros.mockResolvedValueOnce({
            data: [{id: 2}],
            meta: {
                page: 2,
                nb_pages: 3,
            },
        } as any)
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
                    orderBy: 'createdDatetime',
                    orderDir: 'asc',
                    page: 2,
                },
                mockToken
            )
            done()
        })
    })

    it('should refetch macros at previous page index if last page is empty', (done) => {
        mockFetchMacros.mockResolvedValueOnce({
            data: [{id: 2}],
            meta: {
                page: 2,
                nb_pages: 2,
            },
        } as any)
        const component = mount(
            <MacrosSettingsContentContainer
                {...minProps}
                macros={macrosState}
            />
        )

        setImmediate(() => {
            component.setProps({
                macros: _pick(macrosState, ['1']),
            })
            expect(mockFetchMacros).toHaveBeenNthCalledWith(
                2,
                {
                    orderBy: 'createdDatetime',
                    orderDir: 'asc',
                    page: 1,
                },
                mockToken
            )
            done()
        })
    })

    it('should not refetch macros when the only page is empty', (done) => {
        mockFetchMacros.mockResolvedValueOnce({
            data: [{id: 1}],
            meta: {
                page: 1,
                nb_pages: 1,
            },
        } as any)
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
                orderBy: 'createdDatetime',
                orderDir: 'asc',
                search: 'foobar',
            },
            mockToken
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
