import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ActivityCard } from '../ActivityCard'

describe('<ActivityCard />', () => {
    const baseProps = {
        appName: 'Loop Returns',
        message:
            'Credentials expired or were revoked. Reconnect to resume this action.',
        actionButtonLabel: 'Reconnect',
    }

    it('renders the app name, message, and CTA label', () => {
        render(<ActivityCard {...baseProps} onActionClick={jest.fn()} />)

        expect(screen.getByText('Loop Returns')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Credentials expired or were revoked. Reconnect to resume this action.',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /reconnect/i }),
        ).toBeInTheDocument()
    })

    it('exposes the card as an accessible group with the app name and alert type', () => {
        render(<ActivityCard {...baseProps} onActionClick={jest.fn()} />)

        const group = screen.getByRole('group', {
            name: /loop returns.*reconnection required/i,
        })
        expect(group).toBeInTheDocument()
    })

    it('hides the decorative app icon from assistive tech', () => {
        const { container } = render(
            <ActivityCard
                {...baseProps}
                appIcon="https://example.com/loop.png"
                onActionClick={jest.fn()}
            />,
        )

        const img = container.querySelector('img')
        expect(img).not.toBeNull()
        expect(img).toHaveAttribute('aria-hidden', 'true')
        expect(img).toHaveAttribute('alt', '')
    })

    it('renders without an icon when appIcon is omitted', () => {
        const { container } = render(
            <ActivityCard {...baseProps} onActionClick={jest.fn()} />,
        )

        expect(container.querySelector('img')).toBeNull()
    })

    it('invokes onActionClick when the CTA is clicked', async () => {
        const user = userEvent.setup()
        const onActionClick = jest.fn()
        render(<ActivityCard {...baseProps} onActionClick={onActionClick} />)

        await user.click(screen.getByRole('button', { name: /reconnect/i }))

        expect(onActionClick).toHaveBeenCalledTimes(1)
    })
})
