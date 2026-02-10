import { render, screen } from '@testing-library/react'

import { mockTicketTag } from '@gorgias/helpdesk-mocks'

import * as useListTagsSearchModule from './hooks/useListTagsSearch'
import { TagsMultiSelect } from './TagsMultiSelect'

vi.mock('./hooks/useListTagsSearch')

const mockTags = [
    mockTicketTag({ id: 1, name: 'Bug', decoration: { color: 'red' } }),
    mockTicketTag({ id: 2, name: 'Feature', decoration: null }),
]

describe('TagsMultiSelect', () => {
    it('renders correctly', () => {
        vi.mocked(useListTagsSearchModule.useListTagsSearch).mockReturnValue(
            {} as any,
        )

        render(<TagsMultiSelect value={mockTags} onChange={vi.fn()} />)

        expect(screen.getByText('Bug')).toBeInTheDocument()
        expect(screen.getByText('Feature')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /show.*more/i }),
        ).toBeInTheDocument()
    })
})
