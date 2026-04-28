import Clarity from '@microsoft/clarity'
import * as featureFlags from '@repo/feature-flags'
import * as envUtils from '@repo/utils'

import { initClarity } from '../initClarity'

jest.mock('@microsoft/clarity', () => ({
    __esModule: true,
    default: {
        init: jest.fn(),
    },
}))

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    fetchFlag: jest.fn(),
}))

jest.mock('@repo/utils', () => ({
    ...jest.requireActual('@repo/utils'),
    isProduction: jest.fn(),
    isStaging: jest.fn(),
}))

const fetchFlagMock = featureFlags.fetchFlag as jest.Mock
const clarityInitMock = Clarity.init as jest.Mock
const isProductionMock = envUtils.isProduction as jest.Mock
const isStagingMock = envUtils.isStaging as jest.Mock
const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()

describe('initClarity', () => {
    beforeEach(() => {
        isStagingMock.mockReturnValue(false)
        isProductionMock.mockReturnValue(false)
        fetchFlagMock.mockResolvedValue({ flag: false, error: null })
        clarityInitMock.mockReset()
        consoleLogMock.mockClear()
    })

    afterAll(() => {
        consoleLogMock.mockRestore()
    })

    it('logs and skips in unsupported environments', async () => {
        await initClarity()

        expect(fetchFlagMock).not.toHaveBeenCalled()
        expect(clarityInitMock).not.toHaveBeenCalled()
        expect(consoleLogMock).toHaveBeenCalledWith(
            '[Clarity] skipped: unsupported environment',
        )
    })

    it('logs and skips when the flag is disabled', async () => {
        isStagingMock.mockReturnValue(true)

        await initClarity()

        expect(fetchFlagMock).toHaveBeenCalledWith(
            featureFlags.FeatureFlagKey.HelpdeskMicrosoftClarity,
            false,
        )
        expect(consoleLogMock).toHaveBeenCalledWith(
            '[Clarity] flag evaluation',
            {
                error: null,
                isClarityEnabled: false,
                projectId: 'wgwg1vy3fk',
            },
        )
        expect(clarityInitMock).not.toHaveBeenCalled()
        expect(consoleLogMock).toHaveBeenCalledWith(
            '[Clarity] skipped: flag disabled',
        )
    })

    it('calls Clarity in production when the flag is enabled', async () => {
        isProductionMock.mockReturnValue(true)
        fetchFlagMock.mockResolvedValue({ flag: true, error: null })

        await initClarity()

        expect(clarityInitMock).toHaveBeenCalledWith('wgwg1vy3fk')
        expect(consoleLogMock).not.toHaveBeenCalled()
    })

    it('calls Clarity and logs success in staging when the flag is enabled', async () => {
        isStagingMock.mockReturnValue(true)
        fetchFlagMock.mockResolvedValue({ flag: true, error: null })

        await initClarity()

        expect(clarityInitMock).toHaveBeenCalledWith('wgwg1vy3fk')
        expect(consoleLogMock).toHaveBeenCalledWith(
            '[Clarity] flag evaluation',
            {
                error: null,
                isClarityEnabled: true,
                projectId: 'wgwg1vy3fk',
            },
        )
        expect(consoleLogMock).toHaveBeenCalledWith(
            '[Clarity] init succeeded',
            {
                projectId: 'wgwg1vy3fk',
            },
        )
    })

    it('logs failure without escalating the error when Clarity init throws', async () => {
        isStagingMock.mockReturnValue(true)
        fetchFlagMock.mockResolvedValue({ flag: true, error: null })
        const error = new Error('clarity init failed')
        clarityInitMock.mockImplementation(() => {
            throw error
        })

        await initClarity()

        expect(consoleLogMock).toHaveBeenCalledWith(
            '[Clarity] init failed',
            error,
        )
    })

    it('logs feature flag fetch errors without initializing Clarity', async () => {
        isStagingMock.mockReturnValue(true)
        fetchFlagMock.mockResolvedValue({
            flag: false,
            error: new Error('flag fetch failed'),
        })

        await initClarity()

        expect(consoleLogMock).toHaveBeenCalledWith(
            '[Clarity] flag evaluation',
            {
                error: 'flag fetch failed',
                isClarityEnabled: false,
                projectId: 'wgwg1vy3fk',
            },
        )
        expect(clarityInitMock).not.toHaveBeenCalled()
    })
})
