import { render, screen, waitFor } from '@testing-library/react'

import { TokenProvider, useAccessToken } from './TokenProvider'

jest.mock('utils/gorgiasAppsAuth', () => ({
    GorgiasAppAuthService: jest.fn().mockImplementation(() => ({
        getAccessToken: jest.fn().mockResolvedValue('mocked-token'),
    })),
}))

const TestComponent = () => {
    const token = useAccessToken()
    return <div data-testid="token">{token}</div>
}

describe('<TokenProvider />', () => {
    it('provides the token to children after fetching', async () => {
        render(
            <TokenProvider>
                <TestComponent />
            </TokenProvider>,
        )
        expect(screen.queryByTestId('token')).not.toBeInTheDocument()

        await waitFor(() => {
            expect(screen.getByTestId('token')).toHaveTextContent(
                'mocked-token',
            )
        })
    })

    it('returns null if used outside provider', () => {
        const OutsideComponent = () => {
            const token = useAccessToken()
            return <div data-testid="token">{String(token)}</div>
        }
        render(<OutsideComponent />)
        expect(screen.getByTestId('token')).toHaveTextContent('null')
    })
})
