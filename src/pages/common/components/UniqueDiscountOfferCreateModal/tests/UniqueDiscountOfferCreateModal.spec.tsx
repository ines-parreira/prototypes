import React from 'react'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {render, waitFor, fireEvent} from '@testing-library/react'
import {Provider} from 'react-redux'
import {QueryClientProvider} from '@tanstack/react-query'
import {within} from '@testing-library/dom'
import {fromJS} from 'immutable'
import userEvent from '@testing-library/user-event'
import {assumeMock} from 'utils/testing'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {
    useCreateDiscountOffer,
    useUpdateDiscountOffer,
} from 'models/convert/discountOffer/queries'
import {
    useCollectionsFromShopifyIntegration,
    useListShopifyCustomerSegments,
} from 'models/integration/queries'
import {integrationsState} from 'fixtures/integrations'
import {useModalManager, useModalManagerApi} from 'hooks/useModalManager'
import {testIds} from 'pages/common/components/UniqueDiscountOfferCreateModal/utils'
import {
    UniqueDiscountOfferCreateModal,
    UniqueDiscountOfferCreateModalProps,
} from '../UniqueDiscountOfferCreateModal'

jest.mock('models/integration/queries')
jest.mock('models/convert/discountOffer/queries')
jest.mock('hooks/useModalManager')

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
const queryClient = mockQueryClient()
const store = mockStore({})

const useCreateDiscountOfferMock = assumeMock(useCreateDiscountOffer)
const useUpdateDiscountOffersMock = assumeMock(useUpdateDiscountOffer)
const useModalManagerMock = assumeMock(useModalManager)
const useCollectionsFromShopifyIntegrationMock = assumeMock(
    useCollectionsFromShopifyIntegration
)
const useListShopifyCustomerSegmentsMock = assumeMock(
    useListShopifyCustomerSegments
)

describe('<UniqueDiscountOfferCreateModal />', () => {
    const props: UniqueDiscountOfferCreateModalProps = {
        isOpen: true,
        onClose: jest.fn(),
        integration: fromJS({
            ...integrationsState.integration,
            oauth: {
                scope: ['read_discounts', 'write_discounts'],
            },
        }),
        onSubmit: jest.fn(),
    }

    beforeEach(() => {
        useCreateDiscountOfferMock.mockReturnValue({
            mutateAsync: jest.fn(),
        } as any)
        useUpdateDiscountOffersMock.mockReturnValue({
            mutateAsync: jest.fn(),
        } as any)

        useCollectionsFromShopifyIntegrationMock.mockReturnValue({
            data: [
                {
                    id: 1,
                    title: 'Lorem Ipsum',
                },
            ],
        } as any)
        useListShopifyCustomerSegmentsMock.mockReturnValue([] as any)
    })

    it('opens in create mode event if collections is not returned', async () => {
        useModalManagerMock.mockReturnValue({
            getParams: () => undefined,
        } as unknown as useModalManagerApi)

        useCollectionsFromShopifyIntegrationMock.mockReturnValue({} as any)
        useListShopifyCustomerSegmentsMock.mockReturnValue([] as any)

        const {getByTestId} = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <UniqueDiscountOfferCreateModal {...props} />
                </QueryClientProvider>
            </Provider>
        )

        await waitFor(() => {
            const header = getByTestId(testIds.header)
            expect(header.textContent).toContain('Create')
            const prefixInput = getByTestId(testIds.prefixInput)
            expect(prefixInput).toHaveValue('')
            const saveBtn = getByTestId(testIds.saveBtn)
            expect(saveBtn.textContent).toContain('Save')
        })
    })

    it('opens in create mode if there is no params', async () => {
        useModalManagerMock.mockReturnValue({
            getParams: () => undefined,
        } as unknown as useModalManagerApi)

        const {getByTestId} = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <UniqueDiscountOfferCreateModal {...props} />
                </QueryClientProvider>
            </Provider>
        )

        await waitFor(() => {
            const header = getByTestId(testIds.header)
            expect(header.textContent).toContain('Create')
            const prefixInput = getByTestId(testIds.prefixInput)
            expect(prefixInput).toHaveValue('')
            const saveBtn = getByTestId(testIds.saveBtn)
            expect(saveBtn.textContent).toContain('Save')
        })
    })

    it('opens in edit mode if there is offer params', async () => {
        useModalManagerMock.mockReturnValue({
            getParams: () => ({
                prefix: 'testPrefix',
                id: 'testId',
                type: 'percentage',
            }),
        } as unknown as useModalManagerApi)

        const {getByTestId} = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <UniqueDiscountOfferCreateModal {...props} />
                </QueryClientProvider>
            </Provider>
        )

        await waitFor(() => {
            const header = getByTestId(testIds.header)
            expect(header.textContent).toContain('Edit')
            const prefixInput = getByTestId(testIds.prefixInput)
            expect(prefixInput).toHaveValue('testPrefix')
            const saveBtn = getByTestId(testIds.saveBtn)
            expect(saveBtn.textContent).toContain('Save Changes')
            expect(saveBtn.getAttribute('aria-disabled')).toBeTruthy()
        })
    })

    it('opens in edit mode with `applies to` visible', () => {
        useModalManagerMock.mockReturnValue({
            getParams: () => ({
                prefix: 'testPrefix',
                id: 'testId',
                type: 'percentage',
                external_collection_ids: ['1'],
            }),
        } as unknown as useModalManagerApi)

        const {getByTestId, getByText} = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <UniqueDiscountOfferCreateModal {...props} />
                </QueryClientProvider>
            </Provider>
        )

        const selectApplyToElemnt = getByTestId(`${testIds.appliesTo}`)
        expect(selectApplyToElemnt).toBeTruthy()

        const inputElement = getByText('Select a product collection')
        fireEvent.focus(inputElement)
        expect(getByText('Lorem Ipsum')).toBeVisible()
    })

    it('opens in edit mode and select applies to', async () => {
        useModalManagerMock.mockReturnValue({
            getParams: () => ({}),
        } as unknown as useModalManagerApi)

        const {getByTestId, getByText} = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <UniqueDiscountOfferCreateModal {...props} />
                </QueryClientProvider>
            </Provider>
        )

        const prefixInput = getByTestId(testIds.prefixInput)
        await userEvent.type(prefixInput, 'TEST')

        const discountValueInput = getByTestId(testIds.discountValueInput)
        await userEvent.type(discountValueInput, '1')

        const selectApplyToElemnt = getByTestId(`${testIds.appliesTo}`)
        const buttonEl = within(selectApplyToElemnt).getByText(
            'To specific collection'
        )
        userEvent.click(buttonEl)

        const inputElement = getByText('Select a product collection')
        fireEvent.focus(inputElement)
        fireEvent.click(getByText(/Lorem Ipsum/))

        const saveBtn = getByTestId(testIds.saveBtn)
        saveBtn.click()

        await waitFor(() => {
            expect(
                useCreateDiscountOfferMock().mutateAsync
            ).toHaveBeenCalledWith([
                undefined,
                expect.objectContaining({
                    prefix: 'TEST',
                    type: 'fixed',
                    value: 1,
                    external_collection_ids: ['1'],
                }),
            ])
        })
    })

    it('creates a new discount offer', async () => {
        useModalManagerMock.mockReturnValue({
            getParams: () => undefined,
        } as unknown as useModalManagerApi)

        const {getByTestId, getByRole} = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <UniqueDiscountOfferCreateModal {...props} />
                </QueryClientProvider>
            </Provider>
        )
        const expected = {
            type: 'percentage',
            prefix: 'hello',
            value: 20,
            minimum_purchase_amount: 199,
        }

        // setup
        const prefixInput = getByTestId(testIds.prefixInput)

        const discountTypeSelect = getByTestId(
            `selected-${testIds.discountTypeSelect}`
        )
        const discountValueInput = getByTestId(testIds.discountValueInput)
        const minRequirementsRadio = getByTestId(testIds.minRequirementsRadio)
        const noMinRequirementsRadio = getByTestId(
            testIds.noMinRequirementsRadio
        )

        const saveBtn = getByTestId(testIds.saveBtn)

        userEvent.click(discountTypeSelect)

        userEvent.click(getByRole('menuitem', {name: 'Percentage'}))

        // set discount value to invalid
        await userEvent.type(discountValueInput, '200')

        // set discount min amount
        userEvent.click(noMinRequirementsRadio)
        userEvent.click(minRequirementsRadio)
        const minPurchaseAmountInput = getByTestId(
            testIds.minPurchaseAmountInput
        )
        userEvent.clear(minPurchaseAmountInput)
        await userEvent.type(
            minPurchaseAmountInput,
            expected.minimum_purchase_amount.toString()
        )

        // press save with invalid fields
        saveBtn.click()

        await waitFor(() => {
            expect(
                useCreateDiscountOfferMock().mutateAsync
            ).not.toHaveBeenCalled()
        })

        // fix empty prefix
        await userEvent.type(prefixInput, expected.prefix)

        saveBtn.click()

        await waitFor(() => {
            expect(
                useCreateDiscountOfferMock().mutateAsync
            ).not.toHaveBeenCalled()
        })

        // fix max percentage
        userEvent.clear(discountValueInput)
        await userEvent.type(discountValueInput, expected.value.toString())

        saveBtn.click()

        await waitFor(() => {
            expect(
                useCreateDiscountOfferMock().mutateAsync
            ).toHaveBeenCalledWith([
                undefined,
                expect.objectContaining({
                    ...expected,
                }),
            ])
        })
    })

    it('updates an existing offer if modal is in edit mode', async () => {
        useModalManagerMock.mockReturnValue({
            getParams: () => ({
                prefix: 'testPrefix',
                id: 'testId',
                type: 'percentage',
                minimum_purchase_amount: null,
                store_integration_id: '3',
            }),
        } as unknown as useModalManagerApi)

        const {getByTestId} = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <UniqueDiscountOfferCreateModal {...props} />
                </QueryClientProvider>
            </Provider>
        )

        const prefixInput = getByTestId(testIds.prefixInput)
        const saveBtn = getByTestId(testIds.saveBtn)

        userEvent.clear(prefixInput)
        await userEvent.type(prefixInput, 'discount')

        saveBtn.click()

        await waitFor(() => {
            expect(saveBtn.textContent).toContain('Save Changes')
            expect(saveBtn.getAttribute('aria-disabled')).toBe('false')
            expect(
                useUpdateDiscountOffersMock().mutateAsync
            ).toHaveBeenCalledWith([
                undefined,
                {discount_offer_id: 'testId'},
                expect.objectContaining({
                    prefix: 'discount',
                }),
            ])
        })
    })

    it('updates an existing offer - changing applies to', async () => {
        useModalManagerMock.mockReturnValue({
            getParams: () => ({
                prefix: 'testPrefix',
                id: 'testId',
                type: 'percentage',
                minimum_purchase_amount: null,
                store_integration_id: '3',
                external_collection_ids: ['1'],
            }),
        } as unknown as useModalManagerApi)

        const {getByTestId} = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <UniqueDiscountOfferCreateModal {...props} />
                </QueryClientProvider>
            </Provider>
        )

        const selectApplyToElemnt = getByTestId(`${testIds.appliesTo}`)
        const buttonEl =
            within(selectApplyToElemnt).getByText('Total order amount')
        userEvent.click(buttonEl)

        const saveBtn = getByTestId(testIds.saveBtn)

        saveBtn.click()

        await waitFor(() => {
            expect(saveBtn.textContent).toContain('Save Changes')
            expect(saveBtn.getAttribute('aria-disabled')).toBe('false')
            expect(
                useUpdateDiscountOffersMock().mutateAsync
            ).toHaveBeenCalledWith([
                undefined,
                {discount_offer_id: 'testId'},
                expect.objectContaining({
                    external_collection_ids: null,
                }),
            ])
        })
    })
})
