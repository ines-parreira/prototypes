import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import useMacrosSearch from 'pages/common/editor/hooks/useMacrosSearch'
import { RootState, StoreDispatch } from 'state/types'

import { ModalProps } from '../components/MacroModal'
import MacroContainer from '../MacroContainer'
import { getDefaultSelectedMacroId } from '../utils'

jest.mock('../utils')
const getDefaultSelectedMacroIdMock = assumeMock(getDefaultSelectedMacroId)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock(
    '../components/MacroModal',
    () =>
        ({
            fetchMacros,
            handleClickItem,
            onSearch,
            searchParams,
        }: ModalProps) => (
            <div>
                MacroModal
                <div>
                    params:
                    {Object.keys(searchParams).length === 0
                        ? 'empty'
                        : Object.entries(searchParams).map(
                              ([key, value]) =>
                                  `${key}: ${JSON.stringify(value)}`,
                          )}
                </div>
                <div onClick={() => fetchMacros()}>fetchMacros</div>
                <div onClick={() => fetchMacros(true)}>fetchMacrosReset</div>
                <div onClick={() => handleClickItem(11)}>handleClickItem</div>
                <div onClick={() => onSearch({ search: 'new search' })}>
                    onSearch
                </div>
            </div>
        ),
)

jest.mock('pages/common/editor/hooks/useMacrosSearch')
const refetchMock = jest.fn()
const fetchNextPageMock = jest.fn()
const useMacrosSearchMock: jest.SpyInstance =
    useMacrosSearch as jest.MockedFunction<typeof useMacrosSearch>
useMacrosSearchMock.mockImplementation(() => ({
    data: [],
    fetchNextPage: fetchNextPageMock,
    isLoading: false,
    nextCursor: null,
    refetch: refetchMock,
}))

describe('<MacroContainer />', () => {
    const defaultStore: Partial<RootState> = {}

    const props = {
        closeModal: jest.fn(),
        isCreatingMacro: false,
        toggleCreateMacro: jest.fn(),
        onComplete: jest.fn(),
    }

    it('should render MacroContainer', () => {
        render(
            <Provider store={mockStore(defaultStore)}>
                <MacroContainer {...props} />
            </Provider>,
        )

        expect(screen.getByText('MacroModal'))
        expect(useMacrosSearchMock).toHaveBeenCalledTimes(1)
    })

    it('should not set params when creating a new macro', () => {
        render(
            <Provider store={mockStore(defaultStore)}>
                <MacroContainer {...props} isCreatingMacro />
            </Provider>,
        )

        expect(
            screen.getByText(new RegExp('params:empty', 'i')),
        ).toBeInTheDocument()
    })

    it('should refetch macros', () => {
        render(
            <Provider store={mockStore(defaultStore)}>
                <MacroContainer {...props} />
            </Provider>,
        )

        screen.getByText('fetchMacrosReset').click()

        expect(refetchMock).toHaveBeenCalledTimes(1)
    })

    it('should update current macro', () => {
        render(
            <Provider store={mockStore(defaultStore)}>
                <MacroContainer {...props} />
            </Provider>,
        )

        screen.getByText('fetchMacros').click()

        expect(getDefaultSelectedMacroIdMock).toHaveBeenCalledTimes(1)
    })

    it('should fetch next page of macros', () => {
        render(
            <Provider store={mockStore(defaultStore)}>
                <MacroContainer {...props} />
            </Provider>,
        )

        screen.getByText('fetchMacros').click()

        expect(fetchNextPageMock).toHaveBeenCalledTimes(1)
    })

    it('should set selected macro', () => {
        getDefaultSelectedMacroIdMock.mockReturnValue(22)
        render(
            <Provider store={mockStore(defaultStore)}>
                <MacroContainer {...props} selectedMacro={{ id: 1 }} />
            </Provider>,
        )

        expect(getDefaultSelectedMacroIdMock).toHaveBeenCalledTimes(1)
    })

    it('should trigger update of displayed macro on click', async () => {
        render(
            <Provider store={mockStore(defaultStore)}>
                <MacroContainer {...props} />
            </Provider>,
        )

        await screen.findByText('handleClickItem')
        screen.getByText('handleClickItem').click()

        await waitFor(() => {
            expect(props.toggleCreateMacro).toHaveBeenCalledWith(false)
            expect(getDefaultSelectedMacroIdMock).toHaveBeenNthCalledWith(
                1,
                [],
                null,
                false,
            )
            expect(getDefaultSelectedMacroIdMock).toHaveBeenNthCalledWith(
                2,
                [],
                11,
                false,
            )
        })
    })

    it('should trigger search update', async () => {
        render(
            <Provider store={mockStore(defaultStore)}>
                <MacroContainer {...props} />
            </Provider>,
        )

        expect(useMacrosSearchMock).toHaveBeenNthCalledWith(1, {
            params: {},
            ticket: undefined,
        })

        await screen.findByText('onSearch')
        screen.getByText('onSearch').click()
        await waitFor(() => {
            expect(useMacrosSearchMock).toHaveBeenNthCalledWith(2, {
                params: {
                    search: 'new search',
                },
                ticket: undefined,
            })
        })
    })
})
