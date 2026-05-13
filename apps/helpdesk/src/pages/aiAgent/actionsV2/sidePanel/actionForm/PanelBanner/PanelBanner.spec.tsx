import { render } from '@repo/testing'
import userEvent from '@testing-library/user-event'

import { PanelBanner } from './PanelBanner'

describe('PanelBanner', () => {
    it('renders the message for the info variant', () => {
        const { getByText } = render(
            <PanelBanner variant="info" message="Shared across surfaces." />,
        )
        expect(getByText('Shared across surfaces.')).toBeInTheDocument()
    })

    it('renders the title when provided', () => {
        const { getByText } = render(
            <PanelBanner
                variant="error"
                title="Connection lost"
                message="We could not reach the store."
            />,
        )
        expect(getByText('Connection lost')).toBeInTheDocument()
        expect(getByText('We could not reach the store.')).toBeInTheDocument()
    })

    it('renders an inline link with onClick', async () => {
        const user = userEvent.setup()
        const onClick = jest.fn()
        const { getByText } = render(
            <PanelBanner
                variant="warning"
                message="Action is failing."
                link={{ label: 'Fix it', onClick }}
            />,
        )
        await user.click(getByText('Fix it'))
        expect(onClick).toHaveBeenCalled()
    })

    it('renders an external link when href is supplied', () => {
        const { getByRole } = render(
            <PanelBanner
                variant="info"
                message="Read the docs."
                link={{ label: 'Docs', href: 'https://example.com/docs' }}
            />,
        )
        expect(getByRole('link', { name: /docs/i })).toHaveAttribute(
            'href',
            'https://example.com/docs',
        )
    })

    it('renders a close button that calls onClose', async () => {
        const user = userEvent.setup()
        const onClose = jest.fn()
        const { getByLabelText } = render(
            <PanelBanner
                variant="info"
                message="Closable banner"
                isClosable
                onClose={onClose}
            />,
        )
        await user.click(getByLabelText('Dismiss'))
        expect(onClose).toHaveBeenCalled()
    })
})
