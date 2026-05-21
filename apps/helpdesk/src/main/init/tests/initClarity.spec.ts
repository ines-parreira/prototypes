import Clarity from '@microsoft/clarity'
import * as featureFlags from '@repo/feature-flags'
import { UserRole } from '@repo/permissions'
import * as envUtils from '@repo/utils'

import type { ClarityContext } from '../initClarity'
import { buildClarityTags, initClarity } from '../initClarity'

jest.mock('@microsoft/clarity', () => ({
    __esModule: true,
    default: {
        init: jest.fn(),
        identify: jest.fn(),
        setTag: jest.fn(),
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
const clarityIdentifyMock = Clarity.identify as jest.Mock
const claritySetTagMock = Clarity.setTag as jest.Mock
const isProductionMock = envUtils.isProduction as jest.Mock
const isStagingMock = envUtils.isStaging as jest.Mock
const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()

const fullContext: ClarityContext = {
    user: {
        id: 42,
        role: { name: UserRole.Admin },
        language: 'en',
    },
    account: {
        id: 12345,
        domain: 'acme.gorgias.com',
        created_datetime: '2024-01-01T00:00:00Z',
    },
    helpdeskPriceId: 'price_hd_pro',
    automationPriceId: 'price_auto_starter',
}

const tagPayload = () =>
    Object.fromEntries(
        claritySetTagMock.mock.calls.map(([key, value]) => [key, value]),
    )

describe('initClarity', () => {
    beforeEach(() => {
        isStagingMock.mockReturnValue(false)
        isProductionMock.mockReturnValue(false)
        fetchFlagMock.mockResolvedValue({ flag: false, error: null })
        clarityInitMock.mockReset()
        clarityIdentifyMock.mockReset()
        claritySetTagMock.mockReset()
        consoleLogMock.mockClear()
        window.USER_IMPERSONATED = null
        window.GORGIAS_CLUSTER = 'us-east-1'
        window.GORGIAS_RELEASE = 'abc1234'
    })

    afterAll(() => {
        consoleLogMock.mockRestore()
    })

    it('logs and skips in unsupported environments', async () => {
        await initClarity(fullContext)

        expect(fetchFlagMock).not.toHaveBeenCalled()
        expect(clarityInitMock).not.toHaveBeenCalled()
        expect(clarityIdentifyMock).not.toHaveBeenCalled()
        expect(claritySetTagMock).not.toHaveBeenCalled()
        expect(consoleLogMock).toHaveBeenCalledWith(
            '[Clarity] skipped: unsupported environment',
        )
    })

    it('logs and skips when the flag is disabled', async () => {
        isStagingMock.mockReturnValue(true)

        await initClarity(fullContext)

        expect(fetchFlagMock).toHaveBeenCalledWith(
            featureFlags.FeatureFlagKey.HelpdeskMicrosoftClarity,
            false,
        )
        expect(clarityInitMock).not.toHaveBeenCalled()
        expect(clarityIdentifyMock).not.toHaveBeenCalled()
        expect(claritySetTagMock).not.toHaveBeenCalled()
        expect(consoleLogMock).toHaveBeenCalledWith(
            '[Clarity] skipped: flag disabled',
        )
    })

    it('initialises, identifies, and tags when enabled in production', async () => {
        isProductionMock.mockReturnValue(true)
        fetchFlagMock.mockResolvedValue({ flag: true, error: null })

        await initClarity(fullContext)

        expect(clarityInitMock).toHaveBeenCalledWith('wgwg1vy3fk')
        expect(clarityIdentifyMock).toHaveBeenCalledWith(
            '12345',
            undefined,
            undefined,
            'acme.gorgias.com',
        )
        expect(tagPayload()).toEqual({
            account_id: '12345',
            account_domain: 'acme.gorgias.com',
            user_id: '42',
            user_role: UserRole.Admin,
            user_type: 'external',
            impersonated: 'false',
            cluster: 'us-east-1',
            env: 'production',
            app_version: 'abc1234',
            user_language: 'en',
            account_created_at: '2024-01-01T00:00:00Z',
            helpdesk_price_id: 'price_hd_pro',
            automation_price_id: 'price_auto_starter',
        })
        expect(consoleLogMock).not.toHaveBeenCalled()
    })

    it('logs failure and skips tagging when Clarity init throws', async () => {
        isStagingMock.mockReturnValue(true)
        fetchFlagMock.mockResolvedValue({ flag: true, error: null })
        const error = new Error('clarity init failed')
        clarityInitMock.mockImplementation(() => {
            throw error
        })

        await initClarity(fullContext)

        expect(consoleLogMock).toHaveBeenCalledWith(
            '[Clarity] init failed',
            error,
        )
        expect(clarityIdentifyMock).not.toHaveBeenCalled()
        expect(claritySetTagMock).not.toHaveBeenCalled()
    })

    it('logs feature flag fetch errors without initializing Clarity', async () => {
        isStagingMock.mockReturnValue(true)
        fetchFlagMock.mockResolvedValue({
            flag: false,
            error: new Error('flag fetch failed'),
        })

        await initClarity(fullContext)

        expect(consoleLogMock).toHaveBeenCalledWith(
            '[Clarity] flag evaluation',
            {
                error: 'flag fetch failed',
                isClarityEnabled: false,
                projectId: 'wgwg1vy3fk',
            },
        )
        expect(clarityInitMock).not.toHaveBeenCalled()
        expect(clarityIdentifyMock).not.toHaveBeenCalled()
    })

    it('skips identify when account id is missing but still emits tags', async () => {
        isProductionMock.mockReturnValue(true)
        fetchFlagMock.mockResolvedValue({ flag: true, error: null })

        await initClarity({
            user: { id: 7, role: { name: UserRole.Agent } },
            account: { domain: 'no-id.example.com' },
        })

        expect(clarityInitMock).toHaveBeenCalled()
        expect(clarityIdentifyMock).not.toHaveBeenCalled()
        const tags = tagPayload()
        expect(tags).toMatchObject({
            account_domain: 'no-id.example.com',
            user_id: '7',
            user_role: UserRole.Agent,
            user_type: 'external',
        })
        expect(tags.account_id).toBeUndefined()
    })

    it('falls back to safe defaults when context is empty', async () => {
        isProductionMock.mockReturnValue(true)
        fetchFlagMock.mockResolvedValue({ flag: true, error: null })

        await initClarity()

        expect(clarityInitMock).toHaveBeenCalled()
        expect(clarityIdentifyMock).not.toHaveBeenCalled()
        expect(tagPayload()).toMatchObject({
            user_type: 'external',
            impersonated: 'false',
            cluster: 'us-east-1',
            env: 'production',
            app_version: 'abc1234',
        })
    })

    it('continues tagging when identify throws', async () => {
        isProductionMock.mockReturnValue(true)
        fetchFlagMock.mockResolvedValue({ flag: true, error: null })
        clarityIdentifyMock.mockImplementation(() => {
            throw new Error('identify exploded')
        })

        await initClarity(fullContext)

        expect(claritySetTagMock).toHaveBeenCalled()
        expect(tagPayload()).toMatchObject({ account_id: '12345' })
    })

    it('continues when individual setTag calls throw', async () => {
        isProductionMock.mockReturnValue(true)
        fetchFlagMock.mockResolvedValue({ flag: true, error: null })
        claritySetTagMock.mockImplementationOnce(() => {
            throw new Error('first tag exploded')
        })

        await initClarity(fullContext)

        expect(claritySetTagMock.mock.calls.length).toBeGreaterThan(1)
    })
})

describe('buildClarityTags', () => {
    beforeEach(() => {
        isStagingMock.mockReturnValue(false)
        isProductionMock.mockReturnValue(true)
        window.USER_IMPERSONATED = null
        window.GORGIAS_CLUSTER = 'us-east-1'
        window.GORGIAS_RELEASE = 'abc1234'
    })

    it('marks internal-agent role as internal', () => {
        const tags = buildClarityTags({
            user: { id: 1, role: { name: UserRole.GorgiasAgent } },
            account: { id: 9, domain: 'x.gorgias.com' },
        })
        expect(tags.user_type).toBe('internal')
        expect(tags.impersonated).toBe('false')
    })

    it('marks impersonated sessions as internal regardless of role', () => {
        window.USER_IMPERSONATED = true
        const tags = buildClarityTags({
            user: { id: 1, role: { name: UserRole.Admin } },
            account: { id: 9, domain: 'x.gorgias.com' },
        })
        expect(tags.user_type).toBe('internal')
        expect(tags.impersonated).toBe('true')
    })

    it('omits keys when values are missing or empty', () => {
        const tags = buildClarityTags({
            user: { id: null, role: { name: '' } },
            account: { id: undefined, domain: '' },
        })
        expect(tags.account_id).toBeUndefined()
        expect(tags.account_domain).toBeUndefined()
        expect(tags.user_id).toBeUndefined()
        expect(tags.user_role).toBeUndefined()
        expect(tags.user_type).toBe('external')
    })

    it('coerces numeric ids to strings', () => {
        const tags = buildClarityTags({
            user: { id: 42 },
            account: { id: 12345, domain: 'acme.gorgias.com' },
        })
        expect(tags.user_id).toBe('42')
        expect(tags.account_id).toBe('12345')
    })

    it('reports env as development when neither prod nor staging', () => {
        isProductionMock.mockReturnValue(false)
        isStagingMock.mockReturnValue(false)
        const tags = buildClarityTags({})
        expect(tags.env).toBe('development')
    })

    it('reports env as staging when staging is true', () => {
        isProductionMock.mockReturnValue(false)
        isStagingMock.mockReturnValue(true)
        const tags = buildClarityTags({})
        expect(tags.env).toBe('staging')
    })
})
