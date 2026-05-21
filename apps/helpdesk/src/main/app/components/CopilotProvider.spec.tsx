import { screen } from '@testing-library/react'

import { GorgiasAppAuthService } from '@repo/api-resources/gorgiasAppsAuth'
import { assumeMock, render } from '@repo/testing'

import { CopilotProvider as BaseCopilotProvider } from '@gorgias/copilot'

import { CopilotProvider } from './CopilotProvider'

const mockGetRawAccessToken = jest.fn()
const mockClearAccessToken = jest.fn()

jest.mock('@repo/api-resources/gorgiasAppsAuth', () => ({
    GorgiasAppAuthService: jest.fn().mockImplementation(() => ({
        getRawAccessToken: mockGetRawAccessToken,
        clearAccessToken: mockClearAccessToken,
    })),
}))

describe('CopilotProvider', () => {
    const baseCopilotProviderMock = assumeMock(BaseCopilotProvider)
    const authServiceMock = assumeMock(GorgiasAppAuthService)

    beforeEach(() => {
        baseCopilotProviderMock.mockClear()
        authServiceMock.mockClear()
        mockGetRawAccessToken.mockReset()
        mockClearAccessToken.mockReset()
        window.GORGIAS_STATE = {
            currentAccount: { domain: 'acme' },
        } as typeof window.GORGIAS_STATE
        window.STAGING = false
        window.PRODUCTION = false
    })

    it('configures copilot with Gorgias auth and service URLs', async () => {
        mockGetRawAccessToken.mockResolvedValue('copilot-token')

        render(
            <CopilotProvider>
                <div>Helpdesk</div>
            </CopilotProvider>,
        )

        expect(screen.getByText('Helpdesk')).toBeInTheDocument()
        expect(authServiceMock).toHaveBeenCalledWith({ client: 'copilot' })

        const props = baseCopilotProviderMock.mock.calls[0][0]

        expect(props.accountDomain).toBe('acme')
        expect(props.gorgias).toMatchObject({
            baseUrl: '/api/copilot',
            knowledgeServiceBaseUrl: 'http://localhost:9500',
            aiAgentBaseUrl: 'http://localhost:9402/api',
        })
        await expect(props.gorgias?.getToken()).resolves.toBe('copilot-token')

        props.gorgias?.onTokenInvalid?.()
        expect(mockClearAccessToken).toHaveBeenCalledTimes(1)
    })

    it('uses production URLs when running in production', () => {
        window.PRODUCTION = true

        render(
            <CopilotProvider>
                <div>Helpdesk</div>
            </CopilotProvider>,
        )

        const props = baseCopilotProviderMock.mock.calls[0][0]

        expect(props.gorgias).toMatchObject({
            baseUrl: 'https://copilot.gorgias.help/api/copilot',
            knowledgeServiceBaseUrl: 'https://knowledge-service.gorgias.help',
            aiAgentBaseUrl: 'https://aiagent.gorgias.help/api',
        })
    })

    it('uses staging URLs when running in staging', () => {
        window.STAGING = true

        render(
            <CopilotProvider>
                <div>Helpdesk</div>
            </CopilotProvider>,
        )

        const props = baseCopilotProviderMock.mock.calls[0][0]

        expect(props.gorgias).toMatchObject({
            baseUrl: 'https://copilot.gorgias.rehab/api/copilot',
            knowledgeServiceBaseUrl: 'https://knowledge-service.gorgias.rehab',
            aiAgentBaseUrl: 'https://aiagent.gorgias.rehab/api',
        })
    })

    it('uses local-dev URLs when on a *.gorgias.localhost host', () => {
        Object.defineProperty(window, 'location', {
            value: { hostname: 'acme.gorgias.localhost' },
            writable: true,
        })

        render(
            <CopilotProvider>
                <div>Helpdesk</div>
            </CopilotProvider>,
        )

        const props = baseCopilotProviderMock.mock.calls[0][0]

        expect(props.gorgias).toMatchObject({
            baseUrl: 'https://copilot.gorgias.localhost/api/copilot',
            knowledgeServiceBaseUrl:
                'https://knowledge-service.gorgias.localhost',
            aiAgentBaseUrl: 'https://aiagent.gorgias.localhost/api',
        })
    })
})
