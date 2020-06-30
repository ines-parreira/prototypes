//@flow
import _pick from 'lodash/pick'
import {mount, shallow} from 'enzyme'
import React, {type ElementProps} from 'react'
import {browserHistory} from 'react-router'
import {Button} from 'reactstrap'

import {macros as macrosFixtures} from '../../../../fixtures/macro'
import {fetchMacros} from '../../../../models/macro'
import Pagination from '../../../common/components/Pagination'
import Search from '../../../common/components/Search'
import {MacrosSettingsContentContainer} from '../MacrosSettingsContent'
import MacroSettingsTable from '../MacrosSettingsTable'

jest.mock('../../../../models/macro')
jest.mock(
    '../../../common/components/Pagination',
    () => ({onChange}: ElementProps<typeof Pagination>) => (
        <div onClick={() => onChange(2)} />
    )
)
jest.mock(
    '../../../common/components/Search',
    () => ({onChange}: ElementProps<typeof Search>) => (
        <div onChange={(e) => onChange(e.target.value)} />
    )
)
jest.mock('react-router')
jest.mock(
    '../MacrosSettingsTable',
    () => ({onSortOptionsChange}: ElementProps<typeof MacroSettingsTable>) => (
        <div onClick={() => onSortOptionsChange('name', 'asc')} />
    )
)

describe('<MacrosSettingsContent/>', () => {
    const mappedMacrosFixtures = macrosFixtures
    const mockFetchMacros = (fetchMacros: any)
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
    }

    mockFetchMacros.mockResolvedValue({
        data: mappedMacrosFixtures,
        meta: {
            page: 1,
            nb_pages: 2,
        },
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

        expect(mockFetchMacros).toHaveBeenNthCalledWith(1, {
            orderBy: 'createdDatetime',
            orderDir: 'asc',
        })
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
        expect(mockFetchMacros).toHaveBeenNthCalledWith(2, {
            orderBy: 'createdDatetime',
            orderDir: 'asc',
            page: 2,
        })
    })

    it('should redirect when creating new macro', () => {
        const component = mount(
            <MacrosSettingsContentContainer {...minProps} />
        )

        component.find(Button).simulate('click')
        expect(browserHistory.push).toHaveBeenNthCalledWith(
            1,
            '/app/settings/macros/new'
        )
    })

    it('should fetch macros when sorting options change', () => {
        const component = mount(
            <MacrosSettingsContentContainer {...minProps} />
        )

        component.find(MacroSettingsTable).simulate('click')
        expect(mockFetchMacros).toHaveBeenNthCalledWith(2, {
            orderBy: 'name',
            orderDir: 'asc',
        })
    })

    it('should refetch macros when deleting macro', (done) => {
        mockFetchMacros.mockResolvedValueOnce({
            data: [{id: 2}],
            meta: {
                page: 2,
                nb_pages: 3,
            },
        })
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
            expect(mockFetchMacros).toHaveBeenNthCalledWith(2, {
                orderBy: 'createdDatetime',
                orderDir: 'asc',
                page: 2,
            })
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
        })
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
            expect(mockFetchMacros).toHaveBeenNthCalledWith(2, {
                orderBy: 'createdDatetime',
                orderDir: 'asc',
                page: 1,
            })
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
        expect(mockFetchMacros).toHaveBeenNthCalledWith(2, {
            orderBy: 'createdDatetime',
            orderDir: 'asc',
            search: 'foobar',
        })
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
