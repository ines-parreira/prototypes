import { screen } from '@testing-library/react'

import { render } from '../../../../tests/render.utils'
import { OrderDetailsSection } from './OrderDetailsSection'
import { useOrderFieldPreferences } from './useOrderFieldPreferences'

vi.mock('./useOrderFieldPreferences', () => ({
    useOrderFieldPreferences: vi.fn(),
}))

vi.mock('@repo/preferences', () => ({
    useUserDateTimePreferences: () => ({
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '24h',
    }),
}))

vi.mock('./MetafieldsSection', () => ({
    MetafieldsSection: () => null,
}))

const mockUseOrderFieldPreferences = vi.mocked(useOrderFieldPreferences)

const mockOrder = {
    id: 12345,
    tags: 'vip,returning',
    note: 'Handle with care',
    created_at: '2024-01-15T10:00:00Z',
}

describe('OrderDetailsSection', () => {
    beforeEach(() => {
        mockUseOrderFieldPreferences.mockReturnValue({
            preferences: {
                sections: {
                    orderDetails: {
                        fields: [
                            { id: 'id', visible: true },
                            { id: 'note', visible: true },
                        ],
                        sectionVisible: true,
                    },
                },
            },
            getVisibleFields: () => [
                {
                    id: 'id',
                    type: 'readonly' as const,
                    label: 'ID',
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

        expect(screen.getByText('Order details')).toBeInTheDocument()
        expect(screen.getByText('ID')).toBeInTheDocument()
        expect(screen.getByText('12345')).toBeInTheDocument()
        expect(screen.getByText('Note')).toBeInTheDocument()
        expect(screen.getByText('Handle with care')).toBeInTheDocument()
    })

    it('renders nothing when sectionVisible is false', () => {
        mockUseOrderFieldPreferences.mockReturnValue({
            preferences: {
                sections: {
                    orderDetails: {
                        fields: [{ id: 'id', visible: true }],
                        sectionVisible: false,
                    },
                },
            },
            getVisibleFields: () => [
                {
                    id: 'id',
                    type: 'readonly' as const,
                    label: 'ID',
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
                    orderDetails: {
                        fields: [],
                        sectionVisible: true,
                    },
                },
            },
            getVisibleFields: () => [],
            savePreferences: vi.fn(),
            isLoading: false,
        })

        const { container } = render(<OrderDetailsSection order={mockOrder} />)
        expect(container).toBeEmptyDOMElement()
    })
})
