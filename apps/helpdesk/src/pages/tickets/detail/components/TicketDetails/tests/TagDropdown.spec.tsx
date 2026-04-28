import type { ComponentProps } from 'react'

import { assumeMock, render, userEvent } from '@repo/testing'
import { useConditionalShortcuts } from '@repo/utils'
import { waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import type { Tag, TicketTag } from '@gorgias/helpdesk-queries'

import { createMockStandaloneAiAccess } from 'fixtures/standaloneAiAccess'
import { useStandaloneAiContext as useStandaloneAiAccess } from 'providers/standalone-ai/StandaloneAiContext'
import type { TagDropdownMenu } from 'tags'

import TagDropdown from '../TagDropdown'

jest.mock('@repo/utils', () => ({
    ...jest.requireActual('@repo/utils'),
    useConditionalShortcuts: jest.fn(),
}))
const useConditionalShortcutsMock = assumeMock(useConditionalShortcuts)

jest.mock('providers/standalone-ai/StandaloneAiContext', () => ({
    useStandaloneAiContext: jest.fn(() => createMockStandaloneAiAccess()),
}))
const useStandaloneAiAccessMock = assumeMock(useStandaloneAiAccess)

jest.mock(
    'tags/TagDropdownMenu',
    () =>
        ({ filterBy, onClick }: ComponentProps<typeof TagDropdownMenu>) => (
            <div onClick={onClick}>
                {'filterBy test: angry ' +
                    filterBy?.({ name: 'angry' } as Tag).toString()}
                {'filterBy test: pop ' +
                    filterBy?.({ name: 'pop' } as Tag).toString()}
                {'filterBy test: ai_intent ' +
                    filterBy?.({ name: 'ai_intent' } as Tag).toString()}
                {'filterBy test: ai_status ' +
                    filterBy?.({ name: 'ai_status' } as Tag).toString()}
                TagDropdownMenuMock
            </div>
        ),
)

describe('<TagDropdown />', () => {
    const props = {
        addTag: jest.fn(),
        shouldBindKeys: false,
        ticketTags: [
            { name: 'refund' },
            { name: 'ai_intent' },
            { name: 'angry' },
            { name: 'return' },
            { name: 'customer' },
        ] as TicketTag[],
    }

    beforeEach(() => {
        useStandaloneAiAccessMock.mockReturnValue(
            createMockStandaloneAiAccess(),
        )
    })

    it('should open tag dropdown by using keyboard shortcut', () => {
        const { getByText } = render(<TagDropdown {...props} />)

        act(() => {
            useConditionalShortcutsMock.mock.calls[0][2].OPEN_TAGS.action?.(
                new Event('keydown'),
            )
        })

        expect(getByText(/TagDropdownMenuMock/)).toBeInTheDocument()
    })

    it('should filter out tags already added to ticket', async () => {
        const { getByText } = render(<TagDropdown {...props} />)

        await userEvent.click(getByText(/Add tags/))

        await waitFor(() => {
            expect(getByText(/filterBy test: angry false/)).toBeInTheDocument()
            expect(getByText(/filterBy test: pop true/)).toBeInTheDocument()
            expect(
                getByText(/filterBy test: ai_intent false/),
            ).toBeInTheDocument()
            expect(
                getByText(/filterBy test: ai_status true/),
            ).toBeInTheDocument()
        })
    })

    it('should only list ai tags for standalone ai agents', async () => {
        useStandaloneAiAccessMock.mockReturnValue(
            createMockStandaloneAiAccess({
                isStandaloneAiAgent: true,
            }),
        )

        const { getByText } = render(<TagDropdown {...props} />)

        await userEvent.click(getByText(/Add tags/))

        await waitFor(() => {
            expect(getByText(/filterBy test: angry false/)).toBeInTheDocument()
            expect(getByText(/filterBy test: pop false/)).toBeInTheDocument()
            expect(
                getByText(/filterBy test: ai_intent false/),
            ).toBeInTheDocument()
            expect(
                getByText(/filterBy test: ai_status true/),
            ).toBeInTheDocument()
        })
    })
})
