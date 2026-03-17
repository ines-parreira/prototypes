import { render, screen } from '@testing-library/react'
import { useParams } from 'react-router-dom'

import { THEME_NAME } from '@gorgias/design-tokens'

import { TicketChannel } from 'business/types/ticket'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'

import { ConnectedChannelsPreviewPanel } from './ConnectedChannelsPreviewPanel'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))

jest.mock('pages/automate/common/hooks/useSelfServiceChatChannels')

jest.mock('core/theme', () => ({
    ...jest.requireActual('core/theme'),
    useTheme: jest.fn().mockReturnValue({
        name: THEME_NAME.Light,
        resolvedName: THEME_NAME.Light,
        tokens: {} as any,
    }),
}))

const mockUseParams = useParams as jest.MockedFunction<typeof useParams>
const mockUseSelfServiceChatChannels =
    useSelfServiceChatChannels as jest.MockedFunction<
        typeof useSelfServiceChatChannels
    >

const mockChatChannels = [
    {
        type: TicketChannel.Chat,
        value: { id: 1, name: 'My Chat Channel', meta: { app_id: 'app-1' } },
    },
    {
        type: TicketChannel.Chat,
        value: {
            id: 2,
            name: 'Second Chat Channel',
            meta: { app_id: 'app-2' },
        },
    },
] as any

describe('ConnectedChannelsPreviewPanel', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseParams.mockReturnValue({
            shopType: 'shopify',
            shopName: 'my-store',
        })
    })

    it('renders the Chat preview heading', () => {
        mockUseSelfServiceChatChannels.mockReturnValue(mockChatChannels)

        render(<ConnectedChannelsPreviewPanel />)

        expect(
            screen.getByRole('heading', { name: 'Chat preview' }),
        ).toBeInTheDocument()
    })

    it('renders the chat channel selector with the first channel selected', () => {
        mockUseSelfServiceChatChannels.mockReturnValue(mockChatChannels)

        render(<ConnectedChannelsPreviewPanel />)

        expect(
            screen.getByRole('button', { name: /My Chat Channel/i }),
        ).toBeInTheDocument()
    })

    it('does not render the selector when there are no chat channels', () => {
        mockUseSelfServiceChatChannels.mockReturnValue([])

        render(<ConnectedChannelsPreviewPanel />)

        expect(
            screen.getByRole('heading', { name: 'Chat preview' }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /channel/i }),
        ).not.toBeInTheDocument()
    })
})
