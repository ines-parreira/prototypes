import { ComponentProps } from 'react'

import { assumeMock, userEvent } from '@repo/testing'
import { useConditionalShortcuts } from '@repo/utils'
import { render, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import { Tag, TicketTag } from '@gorgias/helpdesk-queries'

import { TagDropdownMenu } from 'tags'

import TagDropdown from '../TagDropdown'

jest.mock('@repo/utils', () => ({
    useConditionalShortcuts: jest.fn(),
}))
const useConditionalShortcutsMock = assumeMock(useConditionalShortcuts)

jest.mock(
    'tags/TagDropdownMenu',
    () =>
        ({ filterBy, onClick }: ComponentProps<typeof TagDropdownMenu>) => (
            <div onClick={onClick}>
                {'filterBy test: angry ' +
                    filterBy?.({ name: 'angry' } as Tag).toString()}
                {'filterBy test: pop ' +
                    filterBy?.({ name: 'pop' } as Tag).toString()}
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
            { name: 'angry' },
            { name: 'return' },
            { name: 'customer' },
        ] as TicketTag[],
    }

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
        })
    })
})
