import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'

import { useOrderFieldPreferences } from '../../widget/useOrderFieldPreferences'
import { OrderDetailsSection } from './OrderDetailsSection'

vi.mock('@repo/hooks', async (importOriginal) => ({
    ...((await importOriginal()) as Record<string, unknown>),
    useCopyToClipboard: () => [
        {},
        (text: string) => navigator.clipboard.writeText(text),
    ],
}))

vi.mock('../../widget/useOrderFieldPreferences', () => ({
    useOrderFieldPreferences: vi.fn(),
}))

vi.mock('@repo/preferences', () => ({
    useUserDateTimePreferences: () => ({
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '24h',
        timezone: undefined,
    }),
}))

vi.mock('../../MetafieldsSection', () => ({
    MetafieldsSection: () => null,
}))

const mockUseOrderFieldPreferences = vi.mocked(useOrderFieldPreferences)

const mockOrder = { id: 12345, note: 'Handle with care' }

describe('OrderDetailsSection (V2)', () => {
    beforeEach(() => {
        mockUseOrderFieldPreferences.mockReturnValue({
            preferences: {
                sections: {
                    orderDetails: { fields: [], sectionVisible: true },
                },
            },
            getVisibleFields: () => [
                {
                    id: 'id',
                    type: 'readonly' as const,
                    label: 'Order ID',
                    getValue: () => 12345,
                },
                {
                    id: 'note',
                    type: 'readonly' as const,
                    label: 'Note',
                    getValue: () => 'Handle with care',
                },
            ],
            savePreferences: vi.fn(),
            isLoading: false,
        })
    })

    it('renders visible fields', () => {
        render(<OrderDetailsSection order={mockOrder} />)

        expect(screen.getByText('Order ID')).toBeInTheDocument()
        expect(screen.getByText('12345')).toBeInTheDocument()
        expect(screen.getByText('Note')).toBeInTheDocument()
        expect(screen.getByText('Handle with care')).toBeInTheDocument()
    })

    it('renders nothing when sectionVisible is false', () => {
        mockUseOrderFieldPreferences.mockReturnValue({
            preferences: {
                sections: {
                    orderDetails: { fields: [], sectionVisible: false },
                },
            },
            getVisibleFields: () => [
                {
                    id: 'id',
                    type: 'readonly' as const,
                    label: 'Order ID',
                    getValue: () => 12345,
                },
            ],
            savePreferences: vi.fn(),
            isLoading: false,
        })

        const { container } = render(<OrderDetailsSection order={mockOrder} />)
        expect(container).toBeEmptyDOMElement()
    })

    it('renders nothing when no visible fields', () => {
        mockUseOrderFieldPreferences.mockReturnValue({
            preferences: {
                sections: {
                    orderDetails: { fields: [], sectionVisible: true },
                },
            },
            getVisibleFields: () => [],
            savePreferences: vi.fn(),
            isLoading: false,
        })

        const { container } = render(<OrderDetailsSection order={mockOrder} />)
        expect(container).toBeEmptyDOMElement()
    })

    it('does not render a tags field even when returned by getVisibleFields', () => {
        mockUseOrderFieldPreferences.mockReturnValue({
            preferences: {
                sections: {
                    orderDetails: { fields: [], sectionVisible: true },
                },
            },
            getVisibleFields: () => [
                {
                    id: 'tags',
                    type: 'readonly' as const,
                    label: 'Tags',
                    getValue: () => 'vip, sale',
                },
            ],
            savePreferences: vi.fn(),
            isLoading: false,
        })

        const { container } = render(<OrderDetailsSection order={mockOrder} />)
        expect(container).toBeEmptyDOMElement()
    })

    it('renders a copy button only for copyable fields', () => {
        mockUseOrderFieldPreferences.mockReturnValue({
            preferences: {
                sections: {
                    orderDetails: { fields: [], sectionVisible: true },
                },
            },
            getVisibleFields: () => [
                {
                    id: 'id',
                    type: 'readonly' as const,
                    label: 'Order ID',
                    copyable: true,
                    getValue: () => 12345,
                },
                {
                    id: 'note',
                    type: 'readonly' as const,
                    label: 'Note',
                    getValue: () => 'Handle with care',
                },
            ],
            savePreferences: vi.fn(),
            isLoading: false,
        })

        render(<OrderDetailsSection order={mockOrder} />)

        expect(
            screen.getByRole('button', { name: /copy order id/i }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /copy note/i }),
        ).not.toBeInTheDocument()
    })
})
