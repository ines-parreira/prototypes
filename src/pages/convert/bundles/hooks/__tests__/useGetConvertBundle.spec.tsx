import { renderHook } from '@testing-library/react-hooks'

import { convertBundle } from 'fixtures/convertBundle'
import { useListBundles } from 'models/convert/bundle/queries'
import { assumeMock } from 'utils/testing'

import { useGetConvertBundle } from '../useGetConvertBundle'

jest.mock('models/convert/bundle/queries')
const useListBundlesMock = assumeMock(useListBundles)

describe('useGetConvertBundle', () => {
    it('should return bundle', () => {
        useListBundlesMock.mockReturnValue({
            data: [convertBundle],
        } as any)

        const { result } = renderHook(() =>
            useGetConvertBundle(
                convertBundle.shop_integration_id,
                convertBundle.shop_integration_id,
            ),
        )

        const { bundle } = result.current

        expect(bundle).toBe(convertBundle)
    })
    it('should not return any bundle', () => {
        useListBundlesMock.mockReturnValue({
            data: [],
        } as any)

        const { result } = renderHook(() =>
            useGetConvertBundle(
                convertBundle.shop_integration_id,
                convertBundle.shop_integration_id,
            ),
        )

        const { bundle } = result.current

        expect(bundle).toBe(undefined)
    })
})
