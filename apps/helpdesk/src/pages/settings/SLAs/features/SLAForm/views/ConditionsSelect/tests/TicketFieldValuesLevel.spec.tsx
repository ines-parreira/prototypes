import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { buildTreeOfChoices } from 'custom-fields/components/MultiLevelSelect/helpers/buildTreeOfChoices'

import { TicketFieldValuesLevel } from '../TicketFieldValuesLevel'
import type { ConditionsFormValue } from '../types'
import { makeConditionItem } from '../types'

const FIELD_ID = 10
const FIELD_LABEL = 'Priority'

const buildProps = (
    overrides: Partial<
        React.ComponentProps<typeof TicketFieldValuesLevel>
    > = {},
): React.ComponentProps<typeof TicketFieldValuesLevel> => ({
    tree: buildTreeOfChoices([
        'optA',
        'optB',
        'Parent::Child1',
        'Parent::Child2',
        'Parent::SubParent::Leaf',
    ]),
    path: [],
    fieldId: FIELD_ID,
    fieldLabel: FIELD_LABEL,
    searchQuery: '',
    selectedConditions: [] as ConditionsFormValue,
    maxSelections: undefined,
    onNavigate: jest.fn(),
    onToggle: jest.fn(),
    ...overrides,
})

describe('TicketFieldValuesLevel', () => {
    describe('no search', () => {
        it('renders leaves as checkboxes and branches as navigable buttons at the root path', () => {
            render(<TicketFieldValuesLevel {...buildProps()} />)

            expect(screen.getByLabelText('optA')).toBeInTheDocument()
            expect(screen.getByLabelText('optB')).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /^Parent/ }),
            ).toBeInTheDocument()
            expect(screen.queryByLabelText('Parent')).not.toBeInTheDocument()
        })

        it('calls onNavigate with the extended path when a branch button is clicked', async () => {
            const user = userEvent.setup()
            const props = buildProps()
            render(<TicketFieldValuesLevel {...props} />)

            await user.click(screen.getByRole('button', { name: /^Parent/ }))

            expect(props.onNavigate).toHaveBeenCalledWith({
                type: 'ticket_field_values',
                fieldId: FIELD_ID,
                fieldLabel: FIELD_LABEL,
                path: ['Parent::branch'],
            })
        })

        it('toggles a leaf with the full value and display label when its checkbox is clicked', async () => {
            const user = userEvent.setup()
            const props = buildProps()
            render(<TicketFieldValuesLevel {...props} />)

            await user.click(screen.getByLabelText('optA'))

            expect(props.onToggle).toHaveBeenCalledWith(
                makeConditionItem(
                    'ticket_fields',
                    FIELD_ID,
                    'optA',
                    'Priority / optA',
                ),
            )
        })

        it('renders only the children of the current path when drilled down', () => {
            render(
                <TicketFieldValuesLevel
                    {...buildProps({ path: ['Parent::branch'] })}
                />,
            )

            expect(screen.getByLabelText('Child1')).toBeInTheDocument()
            expect(screen.getByLabelText('Child2')).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /^SubParent/ }),
            ).toBeInTheDocument()
            expect(screen.queryByLabelText('optA')).not.toBeInTheDocument()
        })

        it('builds a nested full value for leaves under a non-empty path', async () => {
            const user = userEvent.setup()
            const props = buildProps({ path: ['Parent::branch'] })
            render(<TicketFieldValuesLevel {...props} />)

            await user.click(screen.getByLabelText('Child1'))

            expect(props.onToggle).toHaveBeenCalledWith(
                makeConditionItem(
                    'ticket_fields',
                    FIELD_ID,
                    'Parent::Child1',
                    'Priority / Parent > Child1',
                ),
            )
        })

        it('renders the empty state when the current path has no entries', () => {
            render(
                <TicketFieldValuesLevel {...buildProps({ tree: new Map() })} />,
            )

            expect(screen.getByText('No results')).toBeInTheDocument()
        })
    })

    describe('search', () => {
        it('collects matching leaves recursively and shows their full display labels', () => {
            render(
                <TicketFieldValuesLevel
                    {...buildProps({ searchQuery: 'child' })}
                />,
            )

            expect(
                screen.getByLabelText('Priority / Parent > Child1'),
            ).toBeInTheDocument()
            expect(
                screen.getByLabelText('Priority / Parent > Child2'),
            ).toBeInTheDocument()
        })

        it('toggles a recursively matched leaf with the full nested value', async () => {
            const user = userEvent.setup()
            const props = buildProps({ searchQuery: 'child1' })
            render(<TicketFieldValuesLevel {...props} />)

            await user.click(
                screen.getByLabelText('Priority / Parent > Child1'),
            )

            expect(props.onToggle).toHaveBeenCalledWith(
                makeConditionItem(
                    'ticket_fields',
                    FIELD_ID,
                    'Parent::Child1',
                    'Priority / Parent > Child1',
                ),
            )
        })

        it('renders the empty state when a search yields no matches', () => {
            render(
                <TicketFieldValuesLevel
                    {...buildProps({ searchQuery: 'zzz' })}
                />,
            )

            expect(screen.getByText('No results')).toBeInTheDocument()
        })
    })

    describe('per-root-field single-value rule', () => {
        it('disables every other leaf at the current level when a value for the same field is already selected', () => {
            const alreadySelected = makeConditionItem(
                'ticket_fields',
                FIELD_ID,
                'optA',
                'Priority / optA',
            )
            render(
                <TicketFieldValuesLevel
                    {...buildProps({
                        selectedConditions: [alreadySelected],
                        maxSelections: 5,
                    })}
                />,
            )

            expect(screen.getByLabelText('optA')).toBeChecked()
            expect(screen.getByLabelText('optA')).toBeEnabled()
            expect(screen.getByLabelText('optB')).toBeDisabled()
        })

        it('disables leaves at a drilled-down level when a sibling branch already has a selection', () => {
            const alreadySelected = makeConditionItem(
                'ticket_fields',
                FIELD_ID,
                'optA',
                'Priority / optA',
            )
            render(
                <TicketFieldValuesLevel
                    {...buildProps({
                        path: ['Parent::branch'],
                        selectedConditions: [alreadySelected],
                        maxSelections: 5,
                    })}
                />,
            )

            expect(screen.getByLabelText('Child1')).toBeDisabled()
            expect(screen.getByLabelText('Child2')).toBeDisabled()
        })

        it('disables search-result leaves for the same root when one is selected', () => {
            const alreadySelected = makeConditionItem(
                'ticket_fields',
                FIELD_ID,
                'Parent::Child1',
                'Priority / Parent > Child1',
            )
            render(
                <TicketFieldValuesLevel
                    {...buildProps({
                        searchQuery: 'child',
                        selectedConditions: [alreadySelected],
                        maxSelections: 5,
                    })}
                />,
            )

            expect(
                screen.getByLabelText('Priority / Parent > Child1'),
            ).toBeChecked()
            expect(
                screen.getByLabelText('Priority / Parent > Child2'),
            ).toBeDisabled()
        })
    })

    describe('selected-value caption', () => {
        const captionText = `Only one ticket field [${FIELD_LABEL}] can be applied to the same ticket`

        it('renders the restriction caption under the selected leaf', () => {
            const alreadySelected = makeConditionItem(
                'ticket_fields',
                FIELD_ID,
                'optA',
                'Priority / optA',
            )
            render(
                <TicketFieldValuesLevel
                    {...buildProps({
                        selectedConditions: [alreadySelected],
                    })}
                />,
            )

            expect(screen.getByText(captionText)).toBeInTheDocument()
        })

        it('does not render the caption when no leaf is selected', () => {
            render(<TicketFieldValuesLevel {...buildProps()} />)

            expect(
                screen.queryByText(/Only one ticket field/),
            ).not.toBeInTheDocument()
        })

        it('renders the caption for a selected leaf in search results', () => {
            const alreadySelected = makeConditionItem(
                'ticket_fields',
                FIELD_ID,
                'Parent::Child1',
                'Priority / Parent > Child1',
            )
            render(
                <TicketFieldValuesLevel
                    {...buildProps({
                        searchQuery: 'child1',
                        selectedConditions: [alreadySelected],
                    })}
                />,
            )

            expect(screen.getByText(captionText)).toBeInTheDocument()
        })
    })
})
