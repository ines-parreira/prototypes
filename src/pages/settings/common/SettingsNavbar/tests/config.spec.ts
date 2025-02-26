import { FeatureFlagKey } from 'config/featureFlags'

import { NavbarConfig } from '../config'

describe('NavbarConfig', () => {
    it('should return true for only one productivity section if the feature flag is not enabled', () => {
        const categories = NavbarConfig.filter((c) => c.name === 'Productivity')
        const flags = {
            [FeatureFlagKey.AutomateSettingsRevamp]: false,
        }
        expect(categories[0]!.shouldRender!(flags)).toBe(false)
        expect(categories[1]!.shouldRender!(flags)).toBe(true)
    })

    it('should return true for only one productivity section if the feature flag is enabled', () => {
        const categories = NavbarConfig.filter((c) => c.name === 'Productivity')
        const flags = {
            [FeatureFlagKey.AutomateSettingsRevamp]: true,
        }
        expect(categories[0]!.shouldRender!(flags)).toBe(true)
        expect(categories[1]!.shouldRender!(flags)).toBe(false)
    })
})
