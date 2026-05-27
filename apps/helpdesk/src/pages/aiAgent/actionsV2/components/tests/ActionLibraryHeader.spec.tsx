import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ActionLibraryHeader from '../ActionLibraryHeader'

jest.mock(
    'pages/aiAgent/components/AiAgentLayout/usePlaygroundButtonInLayoutHeader',
    () => ({
        useDisplayPlaygroundButtonInLayoutHeader: jest.fn(),
    }),
)
jest.mock('pages/aiAgent/hooks/usePlaygroundPanel', () => ({
    usePlaygroundPanel: jest.fn(),
}))

const {
    useDisplayPlaygroundButtonInLayoutHeader,
} = require('pages/aiAgent/components/AiAgentLayout/usePlaygroundButtonInLayoutHeader')
const { usePlaygroundPanel } = require('pages/aiAgent/hooks/usePlaygroundPanel')

const SHOP = { shopName: 'my-shop', shopType: 'shopify' as const }

describe('ActionLibraryHeader', () => {
    const togglePlayground = jest.fn()

    beforeEach(() => {
        jest.resetAllMocks()
        usePlaygroundPanel.mockReturnValue({
            togglePlayground,
            isPlaygroundOpen: false,
        })
        useDisplayPlaygroundButtonInLayoutHeader.mockReturnValue(true)
    })

    it('renders the Learning resources link', () => {
        render(<ActionLibraryHeader {...SHOP} onCreate={jest.fn()} />)

        expect(
            screen.getByRole('link', { name: /learning resources/i }),
        ).toBeInTheDocument()
    })

    it('renders the Test button when the playground is allowed and closed', () => {
        render(<ActionLibraryHeader {...SHOP} onCreate={jest.fn()} />)

        expect(
            screen.getByRole('button', { name: /test/i }),
        ).toBeInTheDocument()
    })

    it('hides the Test button when the playground is already open', () => {
        usePlaygroundPanel.mockReturnValue({
            togglePlayground,
            isPlaygroundOpen: true,
        })

        render(<ActionLibraryHeader {...SHOP} onCreate={jest.fn()} />)

        expect(
            screen.queryByRole('button', { name: /^test$/i }),
        ).not.toBeInTheDocument()
    })

    it('opens the playground when the Test button is clicked', async () => {
        const user = userEvent.setup()
        render(<ActionLibraryHeader {...SHOP} onCreate={jest.fn()} />)

        await user.click(screen.getByRole('button', { name: /test/i }))

        expect(togglePlayground).toHaveBeenCalledTimes(1)
    })

    it('invokes onCreate when Create action is clicked', async () => {
        const user = userEvent.setup()
        const onCreate = jest.fn()

        render(<ActionLibraryHeader {...SHOP} onCreate={onCreate} />)

        await user.click(screen.getByRole('button', { name: /create action/i }))

        expect(onCreate).toHaveBeenCalledTimes(1)
    })
})
