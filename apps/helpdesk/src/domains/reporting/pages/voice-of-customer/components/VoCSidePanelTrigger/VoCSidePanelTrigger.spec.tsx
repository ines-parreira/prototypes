import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, userEvent } from '@repo/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { VoCSidePanelTrigger } from 'domains/reporting/pages/voice-of-customer/components/VoCSidePanelTrigger/VoCSidePanelTrigger'
import { setSidePanelData } from 'domains/reporting/state/ui/stats/sidePanelSlice'
import { RootState, StoreDispatch } from 'state/types'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('@repo/logging')
const logEventMock = assumeMock(logEvent)

describe('VoCSidePanelTrigger', () => {
    const defaultState = {
        ui: {
            stats: {
                sidePanel: {},
            },
        },
    } as RootState

    const store = mockStore(defaultState)

    const productName = 'Some Product Name'
    const productId = 'product-id'
    const product = {
        id: productId,
        name: productName,
        thumbnail_url: 'someThumbnailUrl',
    }
    const defaultProps = {
        product,
        children: <span>Test Content</span>,
    }

    it('renders children when enabled', () => {
        render(
            <Provider store={store}>
                <VoCSidePanelTrigger {...defaultProps} />
            </Provider>,
        )

        expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('renders children without wrapper when disabled', () => {
        render(
            <Provider store={store}>
                <VoCSidePanelTrigger {...defaultProps} enabled={false} />
            </Provider>,
        )

        const content = screen.getByText('Test Content')
        expect(content).toBeInTheDocument()
        expect(content.parentElement).not.toHaveClass('text')
    })

    it('dispatches setSidePanelData when clicked', async () => {
        render(
            <Provider store={store}>
                <VoCSidePanelTrigger {...defaultProps} />
            </Provider>,
        )

        fireEvent.click(screen.getByText('Test Content'))

        await waitFor(() => {
            expect(store.getActions()).toContainEqual(setSidePanelData(product))
            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.StatClicked,
                { product: defaultProps.product.id },
            )
        })
    })

    it('should call logEvent when clicked with the correct event name', async () => {
        render(
            <Provider store={store}>
                <VoCSidePanelTrigger
                    {...defaultProps}
                    segmentEventName={SegmentEvent.StatVoCSidePanelIntentClick}
                />
            </Provider>,
        )

        fireEvent.click(screen.getByText('Test Content'))

        await waitFor(() => {
            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.StatVoCSidePanelIntentClick,
                { product: defaultProps.product.id },
            )
        })
    })

    it('applies highlighted class when highlighted prop is true', () => {
        render(
            <Provider store={store}>
                <VoCSidePanelTrigger {...defaultProps} highlighted={true} />
            </Provider>,
        )

        expect(screen.getByText('Test Content').parentElement).toHaveClass(
            'highlighted',
        )
    })

    it('renders tooltip when tooltipText is provided', async () => {
        const tooltipText = 'Test Tooltip'
        render(
            <Provider store={store}>
                <VoCSidePanelTrigger
                    {...defaultProps}
                    tooltipText={tooltipText}
                />
            </Provider>,
        )

        userEvent.hover(screen.getByText('Test Content'))

        await waitFor(() => {
            expect(screen.getByText(tooltipText)).toBeInTheDocument()
        })
    })

    it('does not render tooltip when tooltipText is not provided', () => {
        render(
            <Provider store={store}>
                <VoCSidePanelTrigger {...defaultProps} />
            </Provider>,
        )

        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })
})
