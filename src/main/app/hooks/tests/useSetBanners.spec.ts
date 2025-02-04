import {renderHook} from '@testing-library/react-hooks'

import {useAccountNotVerifiedBanner} from '../useAccountNotVerifiedBanner'
import {useImpersonatedBanner} from '../useImpersonatedBanner'
import {useScriptTagMigrationBanner} from '../useScriptTagMigrationBanner'
import {useSetBanners} from '../useSetBanners'
import {useStatusPageManager} from '../useStatusPageManager'
import {useUsageBanner} from '../useUsageBanner'

jest.mock('../useAccountNotVerifiedBanner', () => ({
    useAccountNotVerifiedBanner: jest.fn(),
}))
jest.mock('../useImpersonatedBanner', () => ({
    useImpersonatedBanner: jest.fn(),
}))
jest.mock('../useStatusPageManager', () => ({
    useStatusPageManager: jest.fn(),
}))
jest.mock('../useUsageBanner', () => ({
    useUsageBanner: jest.fn(),
}))

jest.mock('../useScriptTagMigrationBanner', () => ({
    useScriptTagMigrationBanner: jest.fn(),
}))

describe('useSetBanners', () => {
    it('should call the correct underlying hooks', () => {
        renderHook(useSetBanners)

        expect(useAccountNotVerifiedBanner).toHaveBeenCalledTimes(1)
        expect(useImpersonatedBanner).toHaveBeenCalledTimes(1)
        expect(useStatusPageManager).toHaveBeenCalledTimes(1)
        expect(useUsageBanner).toHaveBeenCalledTimes(1)
        expect(useScriptTagMigrationBanner).toHaveBeenCalledTimes(1)
    })
})
