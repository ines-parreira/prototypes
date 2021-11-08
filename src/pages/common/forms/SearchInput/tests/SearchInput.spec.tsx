import React, {FunctionComponent} from 'react'
import {shallow} from 'enzyme'
import MockAdapter from 'axios-mock-adapter'
import {DropdownItem, Input} from 'reactstrap'

import SearchInput from '../SearchInput'
import {SearchInputResultProps, SearchInputSubResultProps} from '../types'
import client from '../../../../../models/api/resources'

type SubResultType = {
    id: number
}

type ResultType = {
    id: number
    subResults: SubResultType[]
}

jest.mock('lodash/debounce', () => (fn: (...args: any[]) => void) => fn)

describe('<SearchInput/>', () => {
    describe('render()', () => {
        const endpoint = '/api/foo'
        const Result: FunctionComponent<SearchInputResultProps<ResultType>> = ({
            result,
        }: SearchInputResultProps<ResultType>) => <div>{result.id}</div>
        const SubResult: FunctionComponent<SearchInputSubResultProps<
            ResultType,
            SubResultType
        >> = ({
            result,
            subResult,
        }: SearchInputSubResultProps<ResultType, SubResultType>) => (
            <div>{`${result.id} / ${subResult.id}`}</div>
        )
        let mockServer: MockAdapter

        beforeEach(() => {
            mockServer = new MockAdapter(client)
        })

        afterEach(() => {
            jest.resetAllMocks()
        })

        it('should render a closed dropdown because input is not focused', () => {
            const component = shallow(
                <SearchInput endpoint={endpoint} renderResult={Result} />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render a closed dropdown because input is empty', () => {
            const component = shallow(
                <SearchInput endpoint={endpoint} renderResult={Result} />
            )

            const input = component.find(Input).dive().find('input')
            input.simulate('focus', {target: {value: ''}})

            expect(component).toMatchSnapshot()
        })

        it('should render an open dropdown because input is focused and value is not empty', (done) => {
            const component = shallow(
                <SearchInput endpoint={endpoint} renderResult={Result} />
            )

            const results: ResultType[] = [
                {id: 1, subResults: []},
                {id: 2, subResults: []},
                {id: 3, subResults: []},
            ]
            mockServer.onGet(endpoint).reply(200, {data: results})

            const input = component.find(Input).dive().find('input')
            input.simulate('focus', {target: {value: ''}})
            input.simulate('change', {target: {value: 'foo'}})

            setTimeout(() => {
                expect(component).toMatchSnapshot()
                done()
            }, 0)
        })

        it('should render sub results', (done) => {
            const component = shallow(
                <SearchInput
                    endpoint={endpoint}
                    onResultClicked={(result: ResultType) => result.subResults}
                    renderResult={Result}
                    renderSubResult={SubResult}
                />
            )

            const subResults1: SubResultType[] = [{id: 10}, {id: 11}]
            const subResults2: SubResultType[] = [{id: 20}, {id: 21}]
            const results: ResultType[] = [
                {id: 1, subResults: subResults1},
                {id: 2, subResults: subResults2},
            ]
            mockServer.onGet(endpoint).reply(200, {data: results})

            const input = component.find(Input).dive().find('input')
            input.simulate('focus', {target: {value: ''}})
            input.simulate('change', {target: {value: 'foo'}})

            setTimeout(() => {
                component.find(DropdownItem).at(2).simulate('click')
                expect(component).toMatchSnapshot()
                done()
            }, 0)
        })
    })
})
