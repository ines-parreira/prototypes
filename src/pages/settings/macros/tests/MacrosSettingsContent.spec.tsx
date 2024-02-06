import axios from 'axios'
import _pick from 'lodash/pick'
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react'
import React, {ComponentProps} from 'react'

import userEvent from '@testing-library/user-event'
import {macros as macrosFixtures} from 'fixtures/macro'
import {OrderDirection} from 'models/api/types'
import {fetchMacros} from 'models/macro/resources'
import {Macro, MacroSortableProperties} from 'models/macro/types'
import Navigation from 'pages/common/components/Navigation/Navigation'
import {axiosSuccessResponse} from 'fixtures/axiosResponse'
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
                <input
                    placeholder={'Search macros...'}
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
                <table
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
    () => () => 'MacroFilters'
)

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

    mockFetchMacros.mockResolvedValue(
        axiosSuccessResponse({
            data: mappedMacrosFixtures,
            meta: {
                prev_cursor: 'xxx',
                next_cursor: 'yyy',
            },
            uri: '',
            object: '',
        })
    )

    it('should match snapshot', () => {
        const {container} = render(
            <MacrosSettingsContentContainer {...minProps} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should fetch macros on mount', (done) => {
        render(<MacrosSettingsContentContainer {...minProps} />)

        expect(mockFetchMacros).toHaveBeenNthCalledWith(
            1,
            {
                orderBy: `${MacroSortableProperties.CreatedDatetime}:${OrderDirection.Asc}`,
            },
            {cancelToken: expect.any(axios.CancelToken)}
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
        render(<MacrosSettingsContentContainer {...minProps} />)

        setImmediate(() => {
            expect(mockNotify).toHaveBeenNthCalledWith(1, {
                message: 'Failed to fetch macros',
                status: 'error',
            })
            done()
        })
    })

    it('should fetch the next macros when changing page', () => {
        render(<MacrosSettingsContentContainer {...minProps} />)

        const next = document.getElementById('next')
        if (next) {
            userEvent.click(next)
        }

        expect(mockFetchMacros).toHaveBeenNthCalledWith(
            2,
            {
                orderBy: `${MacroSortableProperties.CreatedDatetime}:${OrderDirection.Asc}`,
            },
            {cancelToken: expect.any(axios.CancelToken)}
        )
    })

    it('should fetch macros when sorting options change', () => {
        render(<MacrosSettingsContentContainer {...minProps} />)

        act(() => {
            userEvent.click(screen.getByRole('table'))
        })

        expect(mockFetchMacros).toHaveBeenNthCalledWith(
            2,
            {
                orderBy: `${MacroSortableProperties.Name}:${OrderDirection.Asc}`,
            },
            {cancelToken: expect.any(axios.CancelToken)}
        )
    })

    it('should refetch macros when deleting macro', async () => {
        const {rerender} = render(
            <MacrosSettingsContentContainer
                {...minProps}
                macros={macrosState}
            />
        )

        act(() => {
            rerender(
                <MacrosSettingsContentContainer
                    {...minProps}
                    macros={_pick(macrosState, ['1', '3'])}
                />
            )
        })

        await waitFor(() => {
            expect(mockFetchMacros).toHaveBeenNthCalledWith(
                2,
                {
                    orderBy: `${MacroSortableProperties.CreatedDatetime}:${OrderDirection.Asc}`,
                },
                {cancelToken: expect.any(axios.CancelToken)}
            )
        })
    })

    it('should refetch macros at previous page if last page is empty', async () => {
        const prevCursor = 'prevCursor'
        mockFetchMacros.mockResolvedValue(
            axiosSuccessResponse({
                data: mappedMacrosFixtures,
                meta: {
                    prev_cursor: prevCursor,
                    next_cursor: null,
                },
                uri: '',
                object: '',
            })
        )

        const {rerender} = render(
            <MacrosSettingsContentContainer
                {...minProps}
                macros={macrosState}
            />
        )

        act(() => {
            rerender(
                <MacrosSettingsContentContainer {...minProps} macros={{}} />
            )
        })

        await waitFor(() => {
            expect(mockFetchMacros).toHaveBeenNthCalledWith(
                2,
                {
                    orderBy: `${MacroSortableProperties.CreatedDatetime}:${OrderDirection.Asc}`,
                    cursor: prevCursor,
                },
                {cancelToken: expect.any(axios.CancelToken)}
            )
        })
    })

    it('should not refetch macros when the only page is empty', async () => {
        mockFetchMacros.mockResolvedValueOnce(
            axiosSuccessResponse({
                data: [{id: 1} as unknown as Macro],
                meta: {
                    prev_cursor: null,
                    next_cursor: null,
                },
                uri: '',
                object: '',
            })
        )
        render(
            <MacrosSettingsContentContainer
                {...minProps}
                macros={macrosState}
            />
        )

        await waitFor(() => {
            expect(mockFetchMacros).toHaveBeenCalledTimes(1)
        })
    })

    it('should fetch macros when searching', () => {
        render(<MacrosSettingsContentContainer {...minProps} />)

        act(() => {
            fireEvent.change(screen.getByPlaceholderText('Search macros...'), {
                target: {value: 'foobar'},
            })
        })

        expect(mockFetchMacros).toHaveBeenNthCalledWith(
            2,
            {
                orderBy: `${MacroSortableProperties.CreatedDatetime}:${OrderDirection.Asc}`,
                search: 'foobar',
            },
            {cancelToken: expect.any(axios.CancelToken)}
        )
    })

    it('should not sort when searching', () => {
        render(<MacrosSettingsContentContainer {...minProps} />)

        act(() => {
            fireEvent.change(screen.getByPlaceholderText('Search macros...'), {
                target: {value: 'foobar'},
            })
        })
        jest.resetAllMocks()
        act(() => {
            userEvent.click(screen.getByRole('table'))
        })

        expect(mockFetchMacros).not.toHaveBeenCalled()
    })
})
