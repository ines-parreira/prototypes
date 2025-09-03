import { render, screen } from '@testing-library/react'

import { setPriorityAction } from 'fixtures/macro'

import { SetPriorityPreview } from '../SetPriorityPreview'

describe('<SetPriorityPreview />', () => {
    it('should render priority preview when feature flag is enabled', () => {
        render(<SetPriorityPreview setPriorityAction={setPriorityAction} />)

        expect(screen.getByText('Set priority:')).toBeInTheDocument()
        expect(
            screen.getByText(setPriorityAction.arguments.priority!),
        ).toBeInTheDocument()
    })

    it('should return null when no priority action is provided', () => {
        const { container } = render(
            <SetPriorityPreview setPriorityAction={undefined} />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should handle different priority values', () => {
        const highPriorityAction = {
            ...setPriorityAction,
            arguments: { priority: 'high' },
        }

        render(<SetPriorityPreview setPriorityAction={highPriorityAction} />)

        expect(screen.getByText('Set priority:')).toBeInTheDocument()
        expect(screen.getByText('high')).toBeInTheDocument()
    })
})
