import { logEvent, SegmentEvent } from '@repo/logging'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { ConnectLink } from '../ConnectLink'

jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    logEvent: jest.fn(),
}))

const mockLogEvent = logEvent as jest.Mock

const storeState = {
    currentAccount: fromJS({ domain: '20-1 rpz' }),
}

const connectLinkProps = {
    connectUrl: 'https://iamconnecting.com',
    integrationTitle: 'Integration',
}

const contentText = 'click'
const content = <span>{contentText}</span>

describe('ConnectLink', () => {
    afterEach(() => {
        mockLogEvent.mockClear()
    })

    it('renders an external link with the domain query param when isApp is true', () => {
        render(
            <ConnectLink {...connectLinkProps} isApp>
                {content}
            </ConnectLink>,
            { storeState },
        )

        const link = screen.getByRole('link', { name: contentText })
        expect(link).toHaveAttribute(
            'href',
            'https://iamconnecting.com/?account=20-1+rpz',
        )
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('falls back to the docs URL when connectUrl is invalid and isApp is true', () => {
        render(
            <ConnectLink {...connectLinkProps} connectUrl="not a url" isApp>
                {content}
            </ConnectLink>,
            { storeState },
        )

        const link = screen.getByRole('link', { name: contentText })
        expect(link).toHaveAttribute(
            'href',
            'https://docs.gorgias.com/?account=20-1+rpz',
        )
    })

    it('renders an external link without the domain query param when isExternal is true', () => {
        render(
            <ConnectLink {...connectLinkProps} isExternal>
                {content}
            </ConnectLink>,
            { storeState },
        )

        const link = screen.getByRole('link', { name: contentText })
        expect(link).toHaveAttribute('href', 'https://iamconnecting.com')
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('renders an internal Router link when not isApp and not isExternal', () => {
        render(<ConnectLink {...connectLinkProps}>{content}</ConnectLink>, {
            storeState,
        })

        const link = screen.getByRole('link', { name: contentText })
        expect(link).toHaveAttribute('href', '/https://iamconnecting.com')
        expect(link).not.toHaveAttribute('target')
    })

    it('renders the children inside a wrapper without a link when isDisabled', () => {
        render(
            <ConnectLink
                {...connectLinkProps}
                isDisabled
                disabledMessage="Cannot connect"
            >
                {content}
            </ConnectLink>,
            { storeState },
        )

        expect(
            screen.queryByRole('link', { name: contentText }),
        ).not.toBeInTheDocument()
        expect(screen.getByText(contentText)).toBeInTheDocument()
    })

    it('logs the install event and calls onClick when the external link is clicked', async () => {
        const user = userEvent.setup()
        const onClick = jest.fn()

        render(
            <ConnectLink {...connectLinkProps} isApp onClick={onClick}>
                {content}
            </ConnectLink>,
            { storeState },
        )

        await user.click(screen.getByRole('link', { name: contentText }))

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.IntegrationConnectClicked,
            {
                integration: 'integration',
                is_openchannel_app: true,
                account_domain: '20-1 rpz',
            },
        )
        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('logs the install event and calls onClick when the internal link is clicked', async () => {
        const user = userEvent.setup()
        const onClick = jest.fn()

        render(
            <ConnectLink {...connectLinkProps} onClick={onClick}>
                {content}
            </ConnectLink>,
            { storeState },
        )

        await user.click(screen.getByRole('link', { name: contentText }))

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.IntegrationConnectClicked,
            {
                integration: 'integration',
                is_openchannel_app: false,
                account_domain: '20-1 rpz',
            },
        )
        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('still logs the install event when onClick is not provided', async () => {
        const user = userEvent.setup()

        render(<ConnectLink {...connectLinkProps}>{content}</ConnectLink>, {
            storeState,
        })

        await user.click(screen.getByRole('link', { name: contentText }))

        expect(mockLogEvent).toHaveBeenCalledTimes(1)
    })
})
