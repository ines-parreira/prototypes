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

const renderBulkAddTagSelect = ({
    onChange = vi.fn(),
    isOpen = false,
    onOpenChange = vi.fn(),
}: {
    onChange?: (typeof BulkAddTagSelect extends (props: infer P) => unknown
        ? P
        : never)['onChange']
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
} = {}) =>
    render(
        <BulkAddTagSelect
            onChange={onChange}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
        />,
    )

const waitForOptions = async () => {
    await waitFor(() => {
        expect(screen.getByRole('searchbox')).toBeInTheDocument()
    })
}

describe('BulkAddTagSelect', () => {
    it('loads tags on render', () => {
        renderBulkAddTagSelect()

        expect(mockUseListTagsSearch).toHaveBeenCalledWith()
    })

    it('opens the dropdown when the trigger is clicked', async () => {
        const onOpenChange = vi.fn()
        const { user } = renderBulkAddTagSelect({ onOpenChange })

        await user.click(getAddTagTrigger())

        expect(onOpenChange).toHaveBeenCalledWith(true)
    })

    it('calls onChange with the selected tag', async () => {
        const onChange = vi.fn()
        const { user } = renderBulkAddTagSelect({ onChange, isOpen: true })

        await waitForOptions()
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

        renderBulkAddTagSelect({ isOpen: true })

        await waitForOptions()

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

        renderBulkAddTagSelect({ isOpen: true })

        await waitForOptions()

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
        const { user } = renderBulkAddTagSelect({ onChange, isOpen: true })

        await waitForOptions()
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
        const onOpenChange = vi.fn()
        mockUseListTagsSearch.mockReturnValue({
            tags: [tag1, tag2],
            search: '',
            setSearch: mockSetSearch,
            isLoading: false,
            shouldLoadMore: false,
            onLoad: vi.fn(),
        } as unknown as ReturnType<typeof useListTagsSearch>)

        const { user } = renderBulkAddTagSelect({
            isOpen: true,
            onOpenChange,
        })

        await waitForOptions()
        await user.keyboard('{Escape}')

        expect(onOpenChange).toHaveBeenCalledWith(false)
        expect(mockSetSearch).toHaveBeenCalledWith('')
    })
})
