import {
    GorgiasUIEnv,
    getEnvironment,
    isProduction,
    isStaging,
    isDevelopment,
    getEnvVars,
    NodeEnv,
} from '../environment'

describe('environment utils', () => {
    describe('getEnvironment()', () => {
        it('returns GorgiasUIEnv.Development when no env is set', () => {
            expect(getEnvironment()).toEqual(GorgiasUIEnv.Development)
        })
        it('returns GorgiasUIEnv.Staging when window.STAGING is set', () => {
            window.STAGING = true
            window.PRODUCTION = false
            expect(getEnvironment()).toEqual(GorgiasUIEnv.Staging)
        })
        it('returns GorgiasUIEnv.Production when window.PRODUCTION is set', () => {
            window.STAGING = false
            window.PRODUCTION = true
            expect(getEnvironment()).toEqual(GorgiasUIEnv.Production)
        })
        it('returns GorgiasUIEnv.Staging when both window.STAGING and window.PRODUCTION are set', () => {
            window.STAGING = true
            window.PRODUCTION = true
            expect(getEnvironment()).toEqual(GorgiasUIEnv.Staging)
        })
    })

    describe('isProduction()', () => {
        beforeEach(() => {
            window.STAGING = false
            window.PRODUCTION = false
        })
        it('returns true when window.PRODUCTION is set', () => {
            window.PRODUCTION = true
            expect(isProduction()).toBeTruthy()
        })
        it('returns false when window.PRODUCTION is not set', () => {
            expect(isProduction()).toBeFalsy()
        })
    })

    describe('isStaging()', () => {
        beforeEach(() => {
            window.STAGING = false
            window.PRODUCTION = false
        })
        it('returns true when window.STAGING is set', () => {
            window.STAGING = true
            expect(isStaging()).toBeTruthy()
        })
        it('returns false when window.STAGING is not set', () => {
            expect(isStaging()).toBeFalsy()
        })
    })

    describe('isDevelopment()', () => {
        beforeEach(() => {
            window.STAGING = false
            window.PRODUCTION = false
        })

        it('returns true when window.PRODUCTION AND window.STAGING are not set', () => {
            expect(isDevelopment()).toBeTruthy()
        })
        it('returns false when window.PRODUCTION OR window.STAGING are set', () => {
            window.STAGING = true
            window.PRODUCTION = true
            expect(isDevelopment()).toBeFalsy()
        })
    })

    describe('getEnvVars()', () => {
        it.each([
            ...Object.values(NodeEnv).map((env) => ['NODE_ENV', env]),
            ['GORGIAS_ASSETS_URL', 'https://example.com'],
            ['TZ', 'UTC'],
            ['WEB_APP_RELEASE', 'test-release'],
        ])(
            'should return %s property with "%s" value from process.env',
            (key, value) => {
                expect(getEnvVars({[key]: value})).toHaveProperty(key, value)
            }
        )

        it('should return NODE_ENV property set to undefined if process.env.NODE_ENV does not match the allowed values', () => {
            expect(getEnvVars({NODE_ENV: 'foo'})).toHaveProperty(
                'NODE_ENV',
                undefined
            )
        })
    })
})
