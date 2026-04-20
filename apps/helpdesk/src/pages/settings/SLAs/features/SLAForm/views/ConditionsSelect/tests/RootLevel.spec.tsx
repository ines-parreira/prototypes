import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { Tag } from '@gorgias/helpdesk-queries'

import type { CustomField } from 'custom-fields/types'

import { RootLevel } from '../RootLevel'
import type { ConditionsFormValue } from '../types'
import { makeConditionItem } from '../types'

const tags: Tag[] = [
    { id: 1, name: 'urgent' } as Tag,
    { id: 2, name: 'vip' } as Tag,
    { id: 3, name: 'other' } as Tag,
]

const fields = [
    { id: 10, label: 'Priority' },
    { id: 20, label: 'Region' },
] as CustomField[]

const choicesByField: Record<number, string[]> = {
    10: ['high', 'medium', 'low'],
    20: ['EU', 'US'],
}

const getFieldChoices = (fieldId: number) => choicesByField[fieldId] ?? []

function renderRootLevel(
    overrides: Partial<React.ComponentProps<typeof RootLevel>> = {},
) {
    const props: React.ComponentProps<typeof RootLevel> = {
        searchQuery: '',
        tags,
        dropdownFields: fields,
        getFieldChoices,
        selectedConditions: [] as ConditionsFormValue,
        isLoadingTags: false,
        isLoadingFields: false,
        isAtLimit: false,
        onLoadMoreTags: jest.fn().mockResolvedValue(undefined),
        shouldLoadMoreTags: false,
        onNavigate: jest.fn(),
        onToggleCondition: jest.fn(),
        ...overrides,
    }
    render(<RootLevel {...props} />)
    return props
}

describe('RootLevel', () => {
    describe('no search', () => {
        it('renders Tags and Ticket fields category buttons', () => {
            renderRootLevel()

            expect(
                screen.getByRole('button', { name: /^Tags/ }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /^Ticket fields/ }),
            ).toBeInTheDocument()
        })

        it('navigates to the tags level when the Tags button is clicked', async () => {
            const user = userEvent.setup()
            const { onNavigate } = renderRootLevel()

            await user.click(screen.getByRole('button', { name: /^Tags/ }))

            expect(onNavigate).toHaveBeenCalledWith({ type: 'tags' })
        })

        it('navigates to the ticket_fields level when the Ticket fields button is clicked', async () => {
            const user = userEvent.setup()
            const { onNavigate } = renderRootLevel()

            await user.click(
                screen.getByRole('button', { name: /^Ticket fields/ }),
            )

            expect(onNavigate).toHaveBeenCalledWith({ type: 'ticket_fields' })
        })
    })

    describe('search', () => {
        it('filters tags case-insensitively', () => {
            renderRootLevel({ searchQuery: 'UR' })

            expect(screen.getByLabelText('urgent')).toBeInTheDocument()
            expect(screen.queryByLabelText('vip')).not.toBeInTheDocument()
            expect(screen.queryByLabelText('other')).not.toBeInTheDocument()
        })

        it('filters field choices across all dropdown fields case-insensitively', () => {
            renderRootLevel({ searchQuery: 'E' })

            expect(
                screen.getByLabelText('Priority / medium'),
            ).toBeInTheDocument()
            expect(screen.getByLabelText('Region / EU')).toBeInTheDocument()
            expect(
                screen.queryByLabelText('Priority / high'),
            ).not.toBeInTheDocument()
        })

        it('renders both Tags and Ticket fields groups when both have matches', () => {
            renderRootLevel({ searchQuery: 'e' })

            expect(screen.getByText('Tags')).toBeInTheDocument()
            expect(screen.getByText('Ticket fields')).toBeInTheDocument()
        })

        it('renders only Tags group when only tags match', () => {
            renderRootLevel({
                searchQuery: 'vip',
                dropdownFields: [],
            })

            expect(screen.getByText('Tags')).toBeInTheDocument()
            expect(screen.queryByText('Ticket fields')).not.toBeInTheDocument()
        })

        it('renders only Ticket fields group when only field values match', () => {
            renderRootLevel({
                searchQuery: 'high',
                tags: [],
            })

            expect(screen.getByText('Ticket fields')).toBeInTheDocument()
            expect(screen.queryByText('Tags')).not.toBeInTheDocument()
        })

        it('renders Loading... in both groups while fetching', () => {
            renderRootLevel({
                searchQuery: 'urgent',
                isLoadingTags: true,
                isLoadingFields: true,
            })

            expect(screen.getAllByText('Loading...')).toHaveLength(2)
        })

        it('renders the empty state when not loading and no matches exist', () => {
            renderRootLevel({ searchQuery: 'nothingmatches' })

            expect(screen.getByText('No results')).toBeInTheDocument()
        })

        it('renders the Load more button and triggers onLoadMoreTags when clicked', async () => {
            const user = userEvent.setup()
            const { onLoadMoreTags } = renderRootLevel({
                searchQuery: 'urgent',
                shouldLoadMoreTags: true,
            })

            const loadMore = screen.getByRole('button', { name: 'Load more' })
            await user.click(loadMore)

            expect(onLoadMoreTags).toHaveBeenCalledTimes(1)
        })

        it('does not render the Load more button when shouldLoadMoreTags is false', () => {
            renderRootLevel({
                searchQuery: 'urgent',
                shouldLoadMoreTags: false,
            })

            expect(
                screen.queryByRole('button', { name: 'Load more' }),
            ).not.toBeInTheDocument()
        })

        it('toggles a tag match when its checkbox is clicked', async () => {
            const user = userEvent.setup()
            const { onToggleCondition } = renderRootLevel({
                searchQuery: 'urgent',
            })

            await user.click(screen.getByLabelText('urgent'))

            expect(onToggleCondition).toHaveBeenCalledWith(
                makeConditionItem('tags', 1, 'urgent', 'urgent'),
            )
        })

        it('toggles a field-value match when its checkbox is clicked', async () => {
            const user = userEvent.setup()
            const { onToggleCondition } = renderRootLevel({
                searchQuery: 'high',
            })

            await user.click(screen.getByLabelText('Priority / high'))

            expect(onToggleCondition).toHaveBeenCalledWith(
                makeConditionItem(
                    'ticket_fields',
                    10,
                    'high',
                    'Priority / high',
                ),
            )
        })
    })
})
