import { screen } from '@testing-library/react'

import { render } from '../../../../../tests/render.utils'
import { SmartFollowUps } from '../SmartFollowUps'

const smartFollowUps = [
    {
        text: 'More than 20 miles',
        type: 'dynamic_follow_up' as const,
    },
    {
        text: 'Less than 5 miles',
        type: 'dynamic_follow_up' as const,
    },
    {
        text: '5-10 miles',
        type: 'dynamic_follow_up' as const,
    },
]

describe('SmartFollowUps', () => {
    it('renders nothing when no smart follow-up should be visible', () => {
        const { container } = render(
            <SmartFollowUps smartFollowUps={smartFollowUps} />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('renders every smart follow-up when show-all is enabled without a selection', () => {
        render(
            <SmartFollowUps
                smartFollowUps={smartFollowUps}
                showAllSmartFollowUps
            />,
        )

        expect(screen.getByText('More than 20 miles')).toBeInTheDocument()
        expect(screen.getByText('Less than 5 miles')).toBeInTheDocument()
        expect(screen.getByText('5-10 miles')).toBeInTheDocument()
    })

    it('renders the selected smart follow-up only once when show-all is enabled', () => {
        render(
            <SmartFollowUps
                selectedSmartFollowUpIndex={1}
                showAllSmartFollowUps
                smartFollowUps={smartFollowUps}
            />,
        )

        expect(screen.getAllByText('Less than 5 miles')).toHaveLength(1)
        expect(screen.getByText('More than 20 miles')).toBeInTheDocument()
        expect(screen.getByText('5-10 miles')).toBeInTheDocument()
    })
})
