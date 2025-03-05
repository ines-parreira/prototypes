import { renderHook } from '@testing-library/react-hooks'

import {
    useEmailDisconnectedBanner,
    useEmailDomainVerificationBanner,
    useEmailMigrationBanner,
    useScriptTagMigrationBanner,
} from '../banners'
import { useAccountNotVerifiedBanner } from '../useAccountNotVerifiedBanner'
import { useSetBanners } from '../useSetBanners'
import { useStatusPageManager } from '../useStatusPageManager'
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

jest.mock('../banners', () => ({
    useScriptTagMigrationBanner: jest.fn(),
    useEmailDomainVerificationBanner: jest.fn(),
    useEmailMigrationBanner: jest.fn(),
    useEmailDisconnectedBanner: jest.fn(),
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
    })
})
