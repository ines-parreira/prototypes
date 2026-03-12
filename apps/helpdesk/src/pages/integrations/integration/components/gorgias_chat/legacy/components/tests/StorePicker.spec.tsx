import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import type {
    GorgiasChatIntegration,
    StoreIntegration,
} from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'

import { StorePicker } from '../StorePicker'

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}))

jest.mock('../../hooks/useThemeAppExtensionInstallation', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        shouldUseThemeAppExtensionInstallation: false,
    })),
}))

const mockStoreIntegrations: StoreIntegration[] = [
    {
        id: 1,
        name: 'My Shopify Store',
        type: IntegrationType.Shopify,
        deactivated_datetime: null,
    } as StoreIntegration,
    {
        id: 2,
        name: 'My BigCommerce Store',
        type: IntegrationType.BigCommerce,
        deactivated_datetime: null,
    } as StoreIntegration,
    {
        id: 3,
        name: 'Disconnected Store',
        type: IntegrationType.Magento2,
        deactivated_datetime: '2024-01-01T00:00:00Z',
    } as StoreIntegration,
]

const mockGorgiasChatIntegrations: GorgiasChatIntegration[] = [
    {
        id: 100,
        meta: { shop_integration_id: 1 },
    } as GorgiasChatIntegration,
    {
        id: 101,
        meta: { shop_integration_id: 1 },
    } as GorgiasChatIntegration,
    {
        id: 102,
        meta: { shop_integration_id: 2 },
    } as GorgiasChatIntegration,
]

const defaultProps = {
    storeIntegrations: mockStoreIntegrations,
    gorgiasChatIntegrations: mockGorgiasChatIntegrations,
    selectedStoreIntegrationId: null,
    onChange: jest.fn(),
}

describe('<StorePicker />', () => {
    it('should render with placeholder when no store is selected', () => {
        render(<StorePicker {...defaultProps} />)

        expect(screen.getByText('Connect a store')).toBeInTheDocument()
        expect(
            screen.getByPlaceholderText('Select a store'),
        ).toBeInTheDocument()
    })

    it('should render with custom placeholder', () => {
        render(<StorePicker {...defaultProps} placeholder="Choose a store" />)

        expect(
            screen.getByPlaceholderText('Choose a store'),
        ).toBeInTheDocument()
    })

    it('should display selected store name', () => {
        render(<StorePicker {...defaultProps} selectedStoreIntegrationId={1} />)

        expect(screen.getByRole('textbox')).toHaveValue('My Shopify Store')
    })

    it('should render helper text', () => {
        render(<StorePicker {...defaultProps} />)

        expect(
            screen.getByText(/Link your store to enable AI Agent features/),
        ).toBeInTheDocument()
    })

    it('renders a leading icon when a store is selected', () => {
        render(<StorePicker {...defaultProps} selectedStoreIntegrationId={1} />)

        expect(
            screen.getByRole('img', { name: 'app-shopify' }),
        ).toBeInTheDocument()
    })

    it('should call onChange when selecting a store from the dropdown', async () => {
        const onChange = jest.fn()
        render(<StorePicker {...defaultProps} onChange={onChange} />)

        await act(() => userEvent.click(screen.getByRole('textbox')))
        await act(() =>
            userEvent.click(
                screen.getByRole('option', { name: /My BigCommerce Store/i }),
            ),
        )

        expect(onChange).toHaveBeenCalledWith(2)
    })

    it('should display chat counts per store in the dropdown', async () => {
        render(<StorePicker {...defaultProps} />)

        await act(() => userEvent.click(screen.getByRole('textbox')))

        expect(screen.getByText('2 connected chats')).toBeInTheDocument()
        expect(screen.getByText('1 connected chat')).toBeInTheDocument()
    })

    it('should display "Disconnected store" caption for deactivated stores', async () => {
        render(<StorePicker {...defaultProps} />)

        await act(() => userEvent.click(screen.getByRole('textbox')))

        expect(screen.getByText('Disconnected store')).toBeInTheDocument()
    })

    it('should be disabled when isDisabled prop is true', () => {
        render(<StorePicker {...defaultProps} isDisabled />)

        expect(screen.getByRole('textbox')).toBeDisabled()
    })
})
