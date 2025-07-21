import React from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import { executeAction } from 'state/infobar/actions'
import { ShopifyContext } from 'Widgets/modules/Shopify/contexts/ShopifyContext'
import { ShopifyActionType } from 'Widgets/modules/Shopify/types'

import { OrderNotesField } from '../OrderNotesField'

// Mock the dependencies
jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        ShopifyEditOrderNoteEditStarted: 'ShopifyEditOrderNoteEditStarted',
    },
}))
const integrationId = 1234
const customerId = 4321
const orderId = 9876
const mockedDispatch = jest.fn()
const mockUseFlags = useFlags as jest.MockedFunction<typeof useFlags>

mockUseFlags.mockReturnValue({
    [FeatureFlagKey.ShopifyOrderNotes]: true,
})

jest.mock('hooks/useAppSelector', () => () => customerId)
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/infobar/actions', () => ({
    executeAction: jest.fn(),
}))

describe('OrderNotesField', () => {
    const renderComponent = (source: string) => {
        return render(
            <IntegrationContext.Provider
                value={{
                    integration: fromJS({ id: integrationId }),
                    integrationId: integrationId,
                }}
            >
                <ShopifyContext.Provider
                    value={{
                        data_source: 'Customer' as const,
                        widget_resource_ids: {
                            target_id: orderId,
                            customer_id: customerId,
                        },
                    }}
                >
                    <OrderNotesField source={source} />
                </ShopifyContext.Provider>
            </IntegrationContext.Provider>,
        )
    }

    it('renders correctly with the initial source value', () => {
        const { getByPlaceholderText } = renderComponent('Initial note')

        const textArea = getByPlaceholderText(
            'Add note...',
        ) as HTMLTextAreaElement

        expect(textArea.value).toBe('Initial note')
    })

    it('updates the value when the user types into the text area', () => {
        const { getByPlaceholderText } = renderComponent('Initial note')

        const textArea = getByPlaceholderText(
            'Add note...',
        ) as HTMLTextAreaElement

        // Simulate typing a new note
        fireEvent.change(textArea, { target: { value: 'Updated note' } })

        // Check if the value has been updated
        expect(textArea.value).toBe('Updated note')
    })

    it('calls submitChanges when the value changes and the input is blurred', async () => {
        const { getByPlaceholderText } = renderComponent('Initial note')

        const textArea = getByPlaceholderText(
            'Add note...',
        ) as HTMLTextAreaElement

        // Simulate changing the value
        fireEvent.change(textArea, { target: { value: 'Updated note' } })

        await waitFor(() => {
            expect(textArea.value).toBe('Updated note')
        })
        // Simulate the blur event
        fireEvent.blur(textArea)

        // Check if performAction is called with the right arguments
        await waitFor(() => {
            expect(mockedDispatch).toHaveBeenCalledWith(
                executeAction({
                    actionName: ShopifyActionType.ShopifyEditNoteOfOrder,
                    integrationId: integrationId,
                    customerId: String(customerId),
                    payload: {
                        note: 'Updated note',
                        order_id: orderId,
                    },
                }),
            )
        })
    })

    it('does not call submitChanges if the value has not changed', () => {
        const { getByPlaceholderText } = renderComponent('Initial note')

        const textArea = getByPlaceholderText(
            'Add note...',
        ) as HTMLTextAreaElement

        // Simulate the blur event without changing the value
        fireEvent.blur(textArea)

        // Since the value hasn't changed, logEvent and performAction should not be called
        expect(mockedDispatch).not.toHaveBeenCalled()
    })

    it('auto-resizes the text area when the value changes', () => {
        const { getByPlaceholderText } = renderComponent('Initial note')

        const textArea = getByPlaceholderText(
            'Add note...',
        ) as HTMLTextAreaElement

        // Mock scrollHeight to simulate auto-resize behavior
        Object.defineProperty(textArea, 'scrollHeight', {
            value: 100,
            configurable: true,
        })

        // Simulate changing the value
        fireEvent.change(textArea, { target: { value: 'Updated note' } })

        // Check if the height of the text area has been updated
        expect(textArea.style.height).toBe('100px')
    })

    it('does not use the textarea to display the order notes', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.ShopifyOrderNotes]: false,
        })

        renderComponent('Initial note')

        // Check that the source text is in the document
        expect(screen.getByText('Initial note')).toBeInTheDocument()

        // Check that the element is not a textbox
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })
})
