import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import type { OutboundAuth } from 'models/integration/types/app'
import { useCreateTrackstarLink } from 'models/workflows/queries'
import OutboundConnectionCard from 'pages/integrations/integration/components/app/SetupCards/OutboundConnectionCard'

jest.mock('models/workflows/queries', () => ({
    useCreateTrackstarLink: jest.fn(),
}))

const mockTrackstarOpen = jest.fn()
let trackstarCallbacks: {
    getLinkToken?: () => Promise<string>
    onSuccess?: (authCode: string) => Promise<void> | void
} = {}

jest.mock('@trackstar/react-trackstar-link', () => ({
    useTrackstarLink: jest.fn(
        (params: {
            getLinkToken?: () => Promise<string>
            onSuccess?: (authCode: string) => Promise<void> | void
        }) => {
            trackstarCallbacks = params
            return { open: mockTrackstarOpen }
        },
    ),
}))

const mockUseCreateTrackstarLink = jest.mocked(useCreateTrackstarLink)

const apiKeyAuth: OutboundAuth = {
    type: 'api-key',
    url: 'https://api.example.com',
    setup_description: '',
    location: 'header',
    key: 'X-Api-Key',
    vendor: null,
}

const trackstarAuth: OutboundAuth = {
    type: 'api-key',
    url: 'https://api.trackstar.com',
    setup_description: '',
    location: 'header',
    key: 'X-Api-Key',
    vendor: 'trackstar',
    trackstar_integration_name: 'shipmonk',
}

describe('<OutboundConnectionCard />', () => {
    beforeEach(() => {
        mockTrackstarOpen.mockClear()
        trackstarCallbacks = {}
        mockUseCreateTrackstarLink.mockReturnValue({
            mutateAsync: jest.fn().mockResolvedValue({
                data: { link_token: 'fake-link-token' },
            }),
        } as unknown as ReturnType<typeof useCreateTrackstarLink>)
    })

    it('renders the default Connect button when the vendor is not trackstar', async () => {
        const onOpenAuthModal = jest.fn()
        const { user } = render(
            <OutboundConnectionCard
                appTitle="ShipMonk"
                outboundAuth={apiKeyAuth}
                isSubmitting={false}
                onOpenAuthModal={onOpenAuthModal}
                onTrackstarAuthCode={jest.fn()}
            />,
        )

        expect(
            screen.getByRole('heading', {
                name: 'Let Gorgias take action in ShipMonk',
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                /Gorgias can do things in ShipMonk on your behalf/,
            ),
        ).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'Connect' }))
        expect(onOpenAuthModal).toHaveBeenCalledTimes(1)
    })

    it('renders the trackstar Connect button when the vendor is trackstar with an integration name', async () => {
        const onTrackstarAuthCode = jest.fn().mockResolvedValue(undefined)
        const { user } = render(
            <OutboundConnectionCard
                appTitle="ShipMonk"
                outboundAuth={trackstarAuth}
                isSubmitting={false}
                onOpenAuthModal={jest.fn()}
                onTrackstarAuthCode={onTrackstarAuthCode}
            />,
        )

        await user.click(screen.getByRole('button', { name: 'Connect' }))
        expect(mockTrackstarOpen).toHaveBeenCalledTimes(1)

        await trackstarCallbacks.onSuccess?.('auth-code-123')
        expect(onTrackstarAuthCode).toHaveBeenCalledWith('auth-code-123')
    })

    it('fetches a link token through useCreateTrackstarLink when getLinkToken is invoked', async () => {
        const mutateAsync = jest
            .fn()
            .mockResolvedValue({ data: { link_token: 'fresh-token' } })
        mockUseCreateTrackstarLink.mockReturnValue({
            mutateAsync,
        } as unknown as ReturnType<typeof useCreateTrackstarLink>)

        render(
            <OutboundConnectionCard
                appTitle="ShipMonk"
                outboundAuth={trackstarAuth}
                isSubmitting={false}
                onOpenAuthModal={jest.fn()}
                onTrackstarAuthCode={jest.fn()}
            />,
        )

        const token = await trackstarCallbacks.getLinkToken?.()
        expect(mutateAsync).toHaveBeenCalledWith([{ connection_id: '' }])
        expect(token).toBe('fresh-token')
    })

    it('disables the trackstar Connect button when isSubmitting is true', async () => {
        render(
            <OutboundConnectionCard
                appTitle="ShipMonk"
                outboundAuth={trackstarAuth}
                isSubmitting={true}
                onOpenAuthModal={jest.fn()}
                onTrackstarAuthCode={jest.fn()}
            />,
        )

        const button = screen.getByText('Connect').closest('button')
        expect(button).toBeAriaDisabled()
    })
})
