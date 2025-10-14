import React, { FunctionComponent } from 'react'

import { userEvent } from '@repo/testing'
import { act, render, screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'

import client from 'models/api/resources'
import SearchInput from 'pages/common/forms/SearchInput/SearchInput'
import {
    SearchInputResultProps,
    SearchInputSubResultProps,
} from 'pages/common/forms/SearchInput/types'

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
        const SubResult: FunctionComponent<
            SearchInputSubResultProps<ResultType, SubResultType>
        > = ({
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
            const { container } = render(
                <SearchInput endpoint={endpoint} renderResult={Result} />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render a closed dropdown because input is empty', () => {
            const { container } = render(
                <SearchInput endpoint={endpoint} renderResult={Result} />,
            )

            const input = screen.getByRole('textbox')
            userEvent.click(input)

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render an open dropdown because input is focused and value is not empty', async () => {
            const { container } = render(
                <SearchInput
                    endpoint={endpoint}
                    renderResult={Result}
                    renderResultItemProps={({ result: { id } }) =>
                        id === 1 ? { disabled: true } : { disabled: false }
                    }
                />,
            )

            const results: ResultType[] = [
                { id: 1, subResults: [] },
                { id: 2, subResults: [] },
                { id: 3, subResults: [] },
            ]
            mockServer.onGet(endpoint).reply(200, { data: results })

            const input = screen.getByRole('textbox')
            userEvent.click(input)
            userEvent.paste(input, 'foo')

            await waitFor(() => {
                expect(container.firstChild).toMatchSnapshot()
            })
        })

        it('should render sub results', async () => {
            const { container } = render(
                <SearchInput
                    endpoint={endpoint}
                    onResultClicked={(result: ResultType) => result.subResults}
                    renderResult={Result}
                    renderSubResult={SubResult}
                />,
            )

            const subResults1: SubResultType[] = [{ id: 10 }, { id: 11 }]
            const subResults2: SubResultType[] = [{ id: 20 }, { id: 21 }]
            const results: ResultType[] = [
                { id: 1, subResults: subResults1 },
                { id: 2, subResults: subResults2 },
            ]
            mockServer.onGet(endpoint).reply(200, { data: results })

            const input = screen.getByRole('textbox')
            act(() => {
                userEvent.click(input)
                userEvent.paste(input, 'foo')
            })

            await waitFor(() => {
                const menuItems = screen.getAllByRole('menuitem')
                userEvent.click(menuItems[1])
            })

            await waitFor(() => {
                expect(container.firstChild).toMatchSnapshot()
            })
        })
    })
})
