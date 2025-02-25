import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore, { MockStore } from 'redux-mock-store'
import thunk from 'redux-thunk'

import { AttachmentEnum } from 'common/types'
import { useModalManager, useModalManagerApi } from 'hooks/useModalManager'
import {
    useCreateDiscountOffer,
    useGetDiscountOffer,
    useUpdateDiscountOffer,
} from 'models/convert/discountOffer/queries'
import { UniqueDiscountOffer } from 'models/convert/discountOffer/types'
import { UNIQUE_DISCOUNT_MODAL_NAME } from 'models/discountCodes/constants'
import { testIds } from 'pages/tickets/detail/components/ReplyArea/DiscountOfferTicketAttachment/utils'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import {
    DiscountOfferTicketAttachment,
    DiscountOfferTicketAttachmentType,
} from '../DiscountOfferTicketAttachment'

jest.mock('models/convert/discountOffer/queries')
jest.mock('hooks/useModalManager')

const useGetDiscountOfferMock = assumeMock(useGetDiscountOffer)
const useModalManagerMock = assumeMock(useModalManager)
const useCreateDiscountOfferMock = assumeMock(useCreateDiscountOffer)
const useUpdateDiscountOffersMock = assumeMock(useUpdateDiscountOffer)

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
const queryClient = mockQueryClient()
let store: MockStore

const openModalMock = jest.fn()

describe('<DiscountOfferTicketAttachment />', () => {
    const props: DiscountOfferTicketAttachmentType = {
        supportsEdit: true,
        onRemove: jest.fn(),
        discountOffer: {
            content_type: AttachmentEnum.DiscountOffer,
            name: 'test',
            extra: {
                discount_offer_id: '3',
            },
        },
    }

    store = mockStore({
        integrations: fromJS({
            integrations: [
                {
                    id: '3',
                    meta: { currency: 'USD' },
                },
            ],
        }),
    })

    beforeEach(() => {
        useModalManagerMock.mockReturnValue({
            openModal: openModalMock,
            isOpen: () => false,
            getParams: () => undefined,
        } as unknown as useModalManagerApi)
        useCreateDiscountOfferMock.mockReturnValue({
            mutateAsync: jest.fn(),
        } as any)
        useUpdateDiscountOffersMock.mockReturnValue({
            mutateAsync: jest.fn(),
        } as any)
    })

    it('does not render edit icon if discount does not exist', async () => {
        useGetDiscountOfferMock.mockReturnValue({ data: undefined } as any)

        const { getByTestId, queryByTestId } = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <DiscountOfferTicketAttachment {...props} />
                </QueryClientProvider>
            </Provider>,
        )

        userEvent.hover(getByTestId(testIds.wrapper))

        await waitFor(() => {
            expect(queryByTestId(testIds.editIntentBtn)).not.toBeInTheDocument()
            expect(getByTestId(testIds.removeBtn)).toBeInTheDocument()
        })
    })
    it('renders renders edit icon if async payload exists', async () => {
        const mockDiscountResponse: UniqueDiscountOffer = {
            type: 'fixed',
            id: '3',
            prefix: 'test',
            store_integration_id: '3',
        }
        useGetDiscountOfferMock.mockReturnValue({
            data: mockDiscountResponse,
        } as any)

        const { getByTestId, queryByTestId } = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <DiscountOfferTicketAttachment {...props} />
                </QueryClientProvider>
            </Provider>,
        )

        userEvent.hover(getByTestId(testIds.wrapper))

        await waitFor(() => {
            expect(queryByTestId(testIds.editIntentBtn)).toBeInTheDocument()
            expect(getByTestId(testIds.removeBtn)).toBeInTheDocument()
        })
    })
    it('it updates summary from async payload', async () => {
        const mockDiscountResponse: UniqueDiscountOffer = {
            type: 'fixed',
            id: '3',
            prefix: 'test',
            store_integration_id: '3',
            value: '20',
        }
        useGetDiscountOfferMock.mockReturnValue({
            data: mockDiscountResponse,
        } as any)

        const { getByTestId } = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <DiscountOfferTicketAttachment {...props} />
                </QueryClientProvider>
            </Provider>,
        )

        userEvent.hover(getByTestId(testIds.wrapper))

        await waitFor(() => {
            expect(getByTestId(testIds.summary).textContent).toContain(
                '$20 off',
            )
        })
    })

    it('removes the attachment onRemove', async () => {
        const mockDiscountResponse: UniqueDiscountOffer = {
            type: 'fixed',
            id: '3',
            prefix: 'test',
            store_integration_id: '3',
            value: '20',
        }
        useGetDiscountOfferMock.mockReturnValue({
            data: mockDiscountResponse,
        } as any)

        const { getByTestId } = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <DiscountOfferTicketAttachment {...props} />
                </QueryClientProvider>
            </Provider>,
        )

        userEvent.hover(getByTestId(testIds.wrapper))
        userEvent.click(getByTestId(testIds.removeBtn))

        await waitFor(() => {
            expect(props.onRemove).toHaveBeenCalled()
        })
    })
    it('opens the edit modal on edit', async () => {
        const mockDiscountResponse: UniqueDiscountOffer = {
            type: 'fixed',
            id: '3',
            prefix: 'test',
            store_integration_id: '3',
            value: '20',
        }
        useGetDiscountOfferMock.mockReturnValue({
            data: mockDiscountResponse,
        } as any)

        const { getByTestId } = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <DiscountOfferTicketAttachment {...props} />
                </QueryClientProvider>
            </Provider>,
        )

        userEvent.hover(getByTestId(testIds.wrapper))
        userEvent.click(getByTestId(testIds.editIntentBtn))

        await waitFor(() => {
            expect(openModalMock).toHaveBeenCalledWith(
                UNIQUE_DISCOUNT_MODAL_NAME,
                false,
                mockDiscountResponse,
            )
        })
    })
    it('displays meaningful snapshot if it does not support edit', async () => {
        useGetDiscountOfferMock.mockReturnValue({
            data: undefined,
        } as any)

        const { getByTestId } = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <DiscountOfferTicketAttachment
                        {...props}
                        supportsEdit={false}
                        discountOffer={{
                            ...props.discountOffer,
                            extra: {
                                ...props.discountOffer.extra,
                                discount_offer_code: 'Test-ABCD',
                            },
                        }}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        await waitFor(() => {
            expect(getByTestId(testIds.summary).textContent).toContain(
                'Test-ABCD',
            )
        })
    })
})
