import { screen, waitFor } from '@testing-library/react'

import { mockTicketTag } from '@gorgias/helpdesk-mocks'

import { render } from '../../../../tests/render.utils'
import * as useListTagsSearchModule from './hooks/useListTagsSearch'
import { TagsMultiSelect } from './TagsMultiSelect'

vi.mock('./hooks/useListTagsSearch')
vi.mock('@repo/utils', async () => {
    const actual = await vi.importActual('@repo/utils')
    return {
        ...actual,
        useShortcuts: vi.fn(),
    }
})

const mockTags = [
    mockTicketTag({ id: 1, name: 'Bug', decoration: { color: 'red' } }),
    mockTicketTag({ id: 2, name: 'Feature', decoration: null }),
]

const mockUseListTagsSearchReturn = {
    data: {
        pages: [
            {
                data: {
                    data: mockTags,
                },
            },
        ],
    },
    search: '',
    setSearch: vi.fn(),
    isLoading: false,
    isFetching: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    onLoad: vi.fn(),
    shouldLoadMore: false,
}

describe('TagsMultiSelect', () => {
    beforeEach(() => {
        vi.mocked(useListTagsSearchModule.useListTagsSearch).mockReturnValue(
            mockUseListTagsSearchReturn as any,
        )
    })

    it('renders correctly with selected tags', () => {
        render(<TagsMultiSelect value={mockTags} onChange={vi.fn()} />)

        expect(screen.getAllByText('Bug')[0]).toBeInTheDocument()
        expect(screen.getAllByText('Feature')[0]).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /show.*more/i }),
        ).toBeInTheDocument()
    })

    it('renders add tags button when no tags are selected', () => {
        render(<TagsMultiSelect value={[]} onChange={vi.fn()} />)

        expect(
            screen.getByRole('button', { name: /add tags/i }),
        ).toBeInTheDocument()
    })

    it('calls onChange with remaining tags when close button is clicked', async () => {
        const onChange = vi.fn()

        const { user } = render(
            <TagsMultiSelect value={mockTags} onChange={onChange} />,
        )

        const closeTags = screen.getAllByRole('button', { name: /remove tag/i })
        await user.click(closeTags[0])

        expect(onChange).toHaveBeenCalledWith([mockTags[1]])
    })

    it('allows selecting a tag from the dropdown and removing it', async () => {
        const onChange = vi.fn()

        const { user, rerender } = render(
            <TagsMultiSelect value={[mockTags[0]]} onChange={onChange} />,
        )

        const addButton = screen.getByRole('button', { name: /add-plus/i })
        await user.click(addButton)

        await waitFor(() => {
            expect(
                screen.getByRole('option', { name: 'Feature' }),
            ).toBeInTheDocument()
        })

        await user.click(screen.getByRole('option', { name: 'Feature' }))

        expect(onChange).toHaveBeenCalledWith([mockTags[0], mockTags[1]])

        await user.keyboard('{Escape}')
        onChange.mockClear()
        rerender(<TagsMultiSelect value={mockTags} onChange={onChange} />)

        const closeTags = screen.getAllByRole('button', { name: /remove tag/i })
        await user.click(closeTags[0])

        expect(onChange).toHaveBeenCalledWith([mockTags[1]])
    })
})
