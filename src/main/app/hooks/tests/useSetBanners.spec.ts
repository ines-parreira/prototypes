import { renderHook } from 'utils/testing/renderHook'

import {
    useEmailDisconnectedBanner,
    useEmailDomainVerificationBanner,
    useEmailMigrationBanner,
    useScriptTagMigrationBanner,
    useZendeskImportFailedBanner,
} from '../banners'
import { useAccountNotVerifiedBanner } from '../useAccountNotVerifiedBanner'
import { useAiShoppingAssistantTrialBanner } from '../useAiShoppingAssistantTrialBanner'
import { useSetBanners } from '../useSetBanners'
import { useStatusPageManager } from '../useStatusPageManager'
import { useTrackingBundleInstallationWarningBanner } from '../useTrackingBundleInstallationWarningBanner'
import { useUsageBanner } from '../useUsageBanner'

jest.mock('../useAccountNotVerifiedBanner', () => ({
    useAccountNotVerifiedBanner: jest.fn(),
}))
jest.mock('../../../../AlertBanners/components/ImpersonationBanner', () => ({
    useImpersonatedBanner: jest.fn(),
}))
jest.mock('../useStatusPageManager', () => ({
    useStatusPageManager: jest.fn(),
}))
jest.mock('../useUsageBanner', () => ({
    useUsageBanner: jest.fn(),
}))
jest.mock('../useAiShoppingAssistantTrialBanner', () => ({
    useAiShoppingAssistantTrialBanner: jest.fn(),
}))

jest.mock('../banners', () => ({
    useScriptTagMigrationBanner: jest.fn(),
    useEmailDomainVerificationBanner: jest.fn(),
    useEmailMigrationBanner: jest.fn(),
    useEmailDisconnectedBanner: jest.fn(),
    useZendeskImportFailedBanner: jest.fn(),
}))

jest.mock('../useTrackingBundleInstallationWarningBanner', () => ({
    useTrackingBundleInstallationWarningBanner: jest.fn(),
}))

describe('useSetBanners', () => {
    it('should call the correct underlying hooks', () => {
        renderHook(useSetBanners)

        expect(useAccountNotVerifiedBanner).toHaveBeenCalledTimes(1)
        expect(useStatusPageManager).toHaveBeenCalledTimes(1)
        expect(useUsageBanner).toHaveBeenCalledTimes(1)
        expect(useScriptTagMigrationBanner).toHaveBeenCalledTimes(1)
        expect(useEmailDomainVerificationBanner).toHaveBeenCalledTimes(1)
        expect(useEmailMigrationBanner).toHaveBeenCalledTimes(1)
        expect(useEmailDisconnectedBanner).toHaveBeenCalledTimes(1)
        expect(useZendeskImportFailedBanner).toHaveBeenCalledTimes(1)
        expect(useAiShoppingAssistantTrialBanner).toHaveBeenCalledTimes(1)
        expect(
            useTrackingBundleInstallationWarningBanner,
        ).toHaveBeenCalledTimes(1)
    })
})
