import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'

import { Text } from '@gorgias/axiom'

import { useOrderFieldPreferences } from '../../widget/useOrderFieldPreferences'
import { OrderDetailsSection } from '../sections/OrderDetailsSection'

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
                    type: 'component' as const,
                    label: 'Note',
                    getValue: () => 'Handle with care',
                    render: () => <Text size="md">Handle with care</Text>,
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

    describe('copyable fields', () => {
        it('renders a copy button only for copyable fields', () => {
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
                screen.getByRole('button', { name: /copy id/i }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /copy note/i }),
            ).not.toBeInTheDocument()
        })

        it('copies the raw value to the clipboard when the copy button is clicked', async () => {
            const writeTextSpy = vi
                .spyOn(navigator.clipboard, 'writeText')
                .mockResolvedValue(undefined)

            mockUseOrderFieldPreferences.mockReturnValue({
                preferences: {
                    sections: {
                        orderDetails: {
                            fields: [{ id: 'id', visible: true }],
                            sectionVisible: true,
                        },
                    },
                },
                getVisibleFields: () => [
                    {
                        id: 'id',
                        type: 'readonly' as const,
                        label: 'ID',
                        copyable: true,
                        getValue: () => 12345,
                    },
                ],
                savePreferences: vi.fn(),
                isLoading: false,
            })

            const { user } = render(<OrderDetailsSection order={mockOrder} />)

            await user.click(screen.getByRole('button', { name: /copy id/i }))

            expect(writeTextSpy).toHaveBeenCalledWith('12345')
        })
    })
})
