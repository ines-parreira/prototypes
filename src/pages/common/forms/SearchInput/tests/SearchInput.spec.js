// @flow

import React, {type Node} from 'react'
import {shallow} from 'enzyme'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import {DropdownItem, Input} from 'reactstrap'

import SearchInput from '../SearchInput'
import type {SearchInputResultProps, SearchInputSubResultProps} from '../types'

type SubResultType = {
    id: number,
}

type ResultType = {
    id: number,
    subResults: SubResultType[],
}

jest.mock('lodash/debounce', () => (fn) => fn)

describe('<SearchInput/>', () => {
    describe('render()', () => {
        const endpoint = '/api/foo'
        const Result = ({result}: SearchInputResultProps<ResultType>): Node => result.id
        const SubResult = ({result, subResult}: SearchInputSubResultProps<ResultType, SubResultType>): Node =>
            `${result.id} / ${subResult.id}`
        let mockServer

        beforeEach(() => {
            mockServer = new MockAdapter(axios)
        })

        afterEach(() => {
            jest.resetAllMocks()
        })

        it('should render a closed dropdown because input is not focused', () => {
            const component = shallow(
                <SearchInput
                    endpoint={endpoint}
                    renderResult={Result}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render a closed dropdown because input is empty', async () => {
            const component = shallow(
                <SearchInput
                    endpoint={endpoint}
                    renderResult={Result}
                />
            )

            const input = component.find(Input).dive().find('input')
            input.simulate('focus')

            expect(component).toMatchSnapshot()
        })

        it('should render an open dropdown because input is focused and value is not empty', (done) => {
            const component = shallow(
                <SearchInput
                    endpoint={endpoint}
                    renderResult={Result}
                />
            )

            const results: ResultType[] = [{id: 1, subResults: []}, {id: 2, subResults: []}, {id: 3, subResults: []}]
            mockServer.onGet(endpoint).reply(200, {data: results})

            const input = component.find(Input).dive().find('input')
            input.simulate('focus')
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
            const results: ResultType[] = [{id: 1, subResults: subResults1}, {id: 2, subResults: subResults2}]
            mockServer.onGet(endpoint).reply(200, {data: results})

            const input = component.find(Input).dive().find('input')
            input.simulate('focus')
            input.simulate('change', {target: {value: 'foo'}})

            setTimeout(() => {
                component.find(DropdownItem).at(2).simulate('click')
                expect(component).toMatchSnapshot()
                done()
            }, 0)
        })
    })
})
