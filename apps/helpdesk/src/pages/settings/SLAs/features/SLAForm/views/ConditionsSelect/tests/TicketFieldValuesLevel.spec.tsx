import { render, screen } from '@testing-library/react'
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
    isAtLimit: false,
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
})
