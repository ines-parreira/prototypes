import { screen, waitFor } from '@testing-library/react'

import { mockTag } from '@gorgias/helpdesk-mocks'

import { useCreateTicketTag } from '../../../../../../../components/InfobarTicketDetails/components/InfobarTicketTags/hooks/useCreateTicketTag'
import { useListTagsSearch } from '../../../../../../../components/InfobarTicketDetails/components/InfobarTicketTags/hooks/useListTagsSearch'
import { render } from '../../../../../../../tests/render.utils'
import { BulkAddTagSelect } from '../BulkAddTagSelect'

vi.mock(
    '../../../../../../../components/InfobarTicketDetails/components/InfobarTicketTags/hooks/useListTagsSearch',
    () => ({
        useListTagsSearch: vi.fn(),
    }),
)

vi.mock(
    '../../../../../../../components/InfobarTicketDetails/components/InfobarTicketTags/hooks/useCreateTicketTag',
    () => ({
        useCreateTicketTag: vi.fn(),
    }),
)

const mockUseListTagsSearch = vi.mocked(useListTagsSearch)
const mockUseCreateTicketTag = vi.mocked(useCreateTicketTag)

const tag1 = mockTag({ id: 1, name: 'VIP' })
const tag2 = mockTag({ id: 2, name: 'Urgent' })

beforeEach(() => {
    mockUseListTagsSearch.mockReturnValue({
        tags: [tag1, tag2],
        search: '',
        setSearch: vi.fn(),
        isLoading: false,
        shouldLoadMore: false,
        onLoad: vi.fn(),
        data: undefined,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
        isFetching: false,
    } as unknown as ReturnType<typeof useListTagsSearch>)

    mockUseCreateTicketTag.mockReturnValue({
        createTicketTag: vi.fn(),
        isCreating: false,
    })
})

const getAddTagTrigger = () => screen.getByRole('button', { name: /^add tag/i })

const openAndWaitForOptions = async (
    user: ReturnType<typeof render>['user'],
) => {
    const trigger = getAddTagTrigger()
    await user.click(trigger)
    await waitFor(() => {
        expect(screen.getByRole('searchbox')).toBeInTheDocument()
    })
    return trigger
}

describe('BulkAddTagSelect', () => {
    it('loads tags on render', () => {
        render(<BulkAddTagSelect onChange={vi.fn()} />)

        expect(mockUseListTagsSearch).toHaveBeenCalledWith()
    })

    it('opens the dropdown when the trigger is clicked', async () => {
        const { user } = render(<BulkAddTagSelect onChange={vi.fn()} />)

        await openAndWaitForOptions(user)

        expect(screen.getByRole('searchbox')).toBeInTheDocument()
    })

    it('calls onChange with the selected tag', async () => {
        const onChange = vi.fn()
        const { user } = render(<BulkAddTagSelect onChange={onChange} />)

        await openAndWaitForOptions(user)
        const vipOptions = await screen.findAllByText('VIP')
        await user.click(vipOptions[vipOptions.length - 1])

        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({ id: 1, name: 'VIP' }),
        )
    })

    it('shows Create tag footer when searching for a non-existent tag', async () => {
        mockUseListTagsSearch.mockReturnValue({
            tags: [tag1],
            search: 'NewTag',
            setSearch: vi.fn(),
            isLoading: false,
            shouldLoadMore: false,
            onLoad: vi.fn(),
        } as unknown as ReturnType<typeof useListTagsSearch>)

        const { user } = render(<BulkAddTagSelect onChange={vi.fn()} />)

        await openAndWaitForOptions(user)

        await waitFor(() => {
            expect(screen.getByText('Create tag:')).toBeInTheDocument()
            expect(screen.getByText('NewTag')).toBeInTheDocument()
        })
    })

    it('does not show Create tag footer when search matches an existing tag exactly', async () => {
        mockUseListTagsSearch.mockReturnValue({
            tags: [tag1, tag2],
            search: 'VIP',
            setSearch: vi.fn(),
            isLoading: false,
            shouldLoadMore: false,
            onLoad: vi.fn(),
        } as unknown as ReturnType<typeof useListTagsSearch>)

        const { user } = render(<BulkAddTagSelect onChange={vi.fn()} />)

        await openAndWaitForOptions(user)

        expect(screen.queryByText('Create tag:')).not.toBeInTheDocument()
    })

    it('creates a new tag and calls onChange when the Create tag button is clicked', async () => {
        const newTag = mockTag({ id: 99, name: 'NewTag' })
        const mockCreateTicketTag = vi.fn().mockResolvedValue(newTag)
        mockUseCreateTicketTag.mockReturnValue({
            createTicketTag: mockCreateTicketTag,
            isCreating: false,
        })
        mockUseListTagsSearch.mockReturnValue({
            tags: [tag1],
            search: 'NewTag',
            setSearch: vi.fn(),
            isLoading: false,
            shouldLoadMore: false,
            onLoad: vi.fn(),
        } as unknown as ReturnType<typeof useListTagsSearch>)

        const onChange = vi.fn()
        const { user } = render(<BulkAddTagSelect onChange={onChange} />)

        await openAndWaitForOptions(user)
        await waitFor(() => {
            expect(screen.getByText('Create tag:')).toBeInTheDocument()
        })
        await user.click(screen.getByRole('button', { name: /create tag/i }))

        await waitFor(() => {
            expect(onChange).toHaveBeenCalledWith(
                expect.objectContaining({ id: 99, name: 'NewTag' }),
            )
        })
    })

    it('clears search when dropdown is closed', async () => {
        const mockSetSearch = vi.fn()
        mockUseListTagsSearch.mockReturnValue({
            tags: [tag1, tag2],
            search: '',
            setSearch: mockSetSearch,
            isLoading: false,
            shouldLoadMore: false,
            onLoad: vi.fn(),
        } as unknown as ReturnType<typeof useListTagsSearch>)

        const { user } = render(<BulkAddTagSelect onChange={vi.fn()} />)

        await openAndWaitForOptions(user)
        await user.keyboard('{Escape}')

        await waitFor(() => {
            expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
        })
        expect(mockSetSearch).toHaveBeenCalledWith('')
    })
})
