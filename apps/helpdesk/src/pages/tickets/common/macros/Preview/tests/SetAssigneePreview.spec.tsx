import { render, screen } from '@testing-library/react'

import { setAssigneeAction } from 'fixtures/macro'

import { SetAssigneePreview } from '../SetAssigneePreview'

describe('<SetAssigneePreview />', () => {
    it('should render user assignee preview', () => {
        render(<SetAssigneePreview setAssigneeAction={setAssigneeAction} />)

        expect(screen.getByText('Assign to user:')).toBeInTheDocument()
        expect(
            screen.getByText(setAssigneeAction.arguments.assignee_user!.name),
        ).toBeInTheDocument()
    })

    it('should return null when no assignee action is provided', () => {
        const { container } = render(
            <SetAssigneePreview setAssigneeAction={undefined} />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should handle different user names', () => {
        const customAssigneeAction = {
            ...setAssigneeAction,
            arguments: {
                assignee_user: { name: 'John Doe' },
            },
        }

        render(<SetAssigneePreview setAssigneeAction={customAssigneeAction} />)

        expect(screen.getByText('Assign to user:')).toBeInTheDocument()
        expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('should handle null assignee user', () => {
        const nullAssigneeAction = {
            ...setAssigneeAction,
            arguments: {
                assignee_user: null,
            },
        }

        render(<SetAssigneePreview setAssigneeAction={nullAssigneeAction} />)

        expect(screen.getByText('Assign to user:')).toBeInTheDocument()
    })
})
