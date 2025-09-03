import { render, screen } from '@testing-library/react'

import { forwardByEmailAction } from 'fixtures/macro'

import { ForwardByEmailPreview } from '../ForwardByEmailPreview'

describe('<ForwardByEmailPreview />', () => {
    it('should render forward by email preview when feature flag is enabled', () => {
        render(
            <ForwardByEmailPreview
                action={forwardByEmailAction}
                isMacroForwardByEmailEnabled={true}
            />,
        )

        expect(
            screen.getByText(new RegExp(forwardByEmailAction.title, 'i')),
        ).toBeInTheDocument()
        expect(
            screen.getByText(forwardByEmailAction.arguments.to!),
        ).toBeInTheDocument()
        expect(screen.getByText('forward')).toBeInTheDocument()
    })

    it('should not render forward by email preview when feature flag is disabled', () => {
        const { container } = render(
            <ForwardByEmailPreview
                action={forwardByEmailAction}
                isMacroForwardByEmailEnabled={false}
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should return null when no action is provided', () => {
        const { container } = render(
            <ForwardByEmailPreview
                action={undefined}
                isMacroForwardByEmailEnabled={true}
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should handle different email addresses', () => {
        const customEmailAction = {
            ...forwardByEmailAction,
            arguments: { to: 'support@example.com' },
        }

        render(
            <ForwardByEmailPreview
                action={customEmailAction}
                isMacroForwardByEmailEnabled={true}
            />,
        )

        expect(screen.getByText('support@example.com')).toBeInTheDocument()
    })
})
