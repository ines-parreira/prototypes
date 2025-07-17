import { setDefaultConfig } from '@gorgias/knowledge-service-client'

import { isProduction, isStaging } from 'utils/environment'
import { GorgiasAppAuthService } from 'utils/gorgiasAppsAuth'

import { getKsApiBaseURL, setKSDefaultConfig } from '../utils'

jest.mock('utils/environment', () => ({
    isProduction: jest.fn(),
    isStaging: jest.fn(),
}))

jest.mock('@gorgias/knowledge-service-client', () => ({
    setDefaultConfig: jest.fn(),
}))

jest.mock('utils/gorgiasAppsAuth', () => ({
    GorgiasAppAuthService: jest.fn(),
}))

describe('knowledgeService utils', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('getKsApiBaseURL', () => {
        it('should return production URL when isProduction returns true', () => {
            ;(isProduction as jest.Mock).mockReturnValue(true)
            ;(isStaging as jest.Mock).mockReturnValue(false)

            const result = getKsApiBaseURL()

            expect(result).toBe('https://knowledge-service.gorgias.help')
        })

        it('should return staging URL when isProduction returns false and isStaging returns true', () => {
            ;(isProduction as jest.Mock).mockReturnValue(false)
            ;(isStaging as jest.Mock).mockReturnValue(true)

            const result = getKsApiBaseURL()

            expect(result).toBe('https://knowledge-service.gorgias.rehab')
        })

        it('should return localhost URL when both isProduction and isStaging return false', () => {
            ;(isProduction as jest.Mock).mockReturnValue(false)
            ;(isStaging as jest.Mock).mockReturnValue(false)

            const result = getKsApiBaseURL()

            expect(result).toBe('http://localhost:9500')
        })
    })

    describe('setKSDefaultConfig', () => {
        const mockGetAccessToken = jest.fn()

        beforeEach(() => {
            ;(GorgiasAppAuthService as jest.Mock).mockImplementation(() => ({
                getAccessToken: mockGetAccessToken,
            }))
            ;(isProduction as jest.Mock).mockReturnValue(false)
            ;(isStaging as jest.Mock).mockReturnValue(false)
        })

        it('should call setDefaultConfig with async function', () => {
            setKSDefaultConfig()

            expect(setDefaultConfig).toHaveBeenCalledTimes(1)
            expect(setDefaultConfig).toHaveBeenCalledWith(expect.any(Function))
        })

        it('should return correct config when async function is called', async () => {
            const mockAccessToken = 'Bearer test-token'
            mockGetAccessToken.mockResolvedValue(mockAccessToken)

            setKSDefaultConfig()

            const asyncConfigFn = (setDefaultConfig as jest.Mock).mock
                .calls[0][0]
            const config = await asyncConfigFn()

            expect(GorgiasAppAuthService).toHaveBeenCalledTimes(1)
            expect(mockGetAccessToken).toHaveBeenCalledTimes(1)
            expect(config).toEqual({
                baseURL: 'http://localhost:9500',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: mockAccessToken,
                },
            })
        })

        it('should work with production environment', async () => {
            ;(isProduction as jest.Mock).mockReturnValue(true)
            ;(isStaging as jest.Mock).mockReturnValue(false)

            const mockAccessToken = 'Bearer prod-token'
            mockGetAccessToken.mockResolvedValue(mockAccessToken)

            setKSDefaultConfig()

            const asyncConfigFn = (setDefaultConfig as jest.Mock).mock
                .calls[0][0]
            const config = await asyncConfigFn()

            expect(config.baseURL).toBe(
                'https://knowledge-service.gorgias.help',
            )
            expect(config.headers.Authorization).toBe(mockAccessToken)
        })
    })
})
