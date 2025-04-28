import React from 'react'

import { act } from '@testing-library/react-hooks'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { customer } from 'fixtures/customer'
import { useCustomerSearch } from 'pages/common/components/infobar/Infobar/useCustomerSearch'
import { searchWithHighlights } from 'state/infobar/actions'
import * as constants from 'state/infobar/constants'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

const mockStore = configureMockStore([thunk])
jest.mock('state/infobar/actions')
const searchWithHighlightsMock = assumeMock(searchWithHighlights)

describe('useCustomerSearch', () => {
    describe('Search with Highlights', () => {
        beforeEach(() => {
            searchWithHighlightsMock.mockReturnValue({
                type: constants.SEARCH_CUSTOMERS_SUCCESS,
                resp: {
                    data: { data: [{ entity: customer, highlights: {} }] },
                },
            } as any)
        })

        it('should return customers with highlights', async () => {
            const query = 'some query'

            const { result } = renderHook(() => useCustomerSearch(), {
                wrapper: ({ children }) => (
                    <Provider store={mockStore({})}>{children}</Provider>
                ),
            })
            await act(async () => {
                result.current.setSearchTerm(query)
                await result.current.onSearchSubmit(query)
            })

            expect(searchWithHighlightsMock).toHaveBeenCalledWith(
                query,
                expect.anything(),
            )
        })
    })
})
