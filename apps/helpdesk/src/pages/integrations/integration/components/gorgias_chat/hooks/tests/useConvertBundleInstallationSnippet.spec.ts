import { renderHook } from '@repo/testing'
import * as environment from '@repo/utils'

import { useConvertBundleInstallationSnippet } from '../useConvertBundleInstallationSnippet'

describe('getConvertBundleInstallationSnippet', () => {
    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should return production bundle URL when in production', () => {
        jest.spyOn(environment, 'isProduction').mockReturnValue(true)
        const { result } = renderHook(() =>
            useConvertBundleInstallationSnippet('1'),
        )
        expect(result.current).toContain(
            `<script src="${process.env.CONVERT_BUNDLE_PRODUCTION_URL ?? 'https://static.9gtb.com/loader.js?g_cvt_id=1'}" async></script>`,
        )
    })

    it('should return staging bundle URL when in staging', () => {
        jest.spyOn(environment, 'isStaging').mockReturnValue(true)
        const { result } = renderHook(() =>
            useConvertBundleInstallationSnippet('1'),
        )
        expect(result.current).toContain(
            `<script src="${process.env.CONVERT_BUNDLE_STAGING_URL ?? 'https://cdn-staging.9gtb.com/loader.js?g_cvt_id=1'}" async></script>`,
        )
    })

    it('should return development bundle URL when not in production or staging', () => {
        jest.spyOn(environment, 'isProduction').mockReturnValue(false)
        jest.spyOn(environment, 'isStaging').mockReturnValue(false)
        const { result } = renderHook(() =>
            useConvertBundleInstallationSnippet('1'),
        )
        expect(result.current).toContain(
            `<script src="${process.env.CONVERT_BUNDLE_DEVELOPMENT_URL ?? 'https://bundle-{your-name}.eu.ngrok.io/loader.js?g_cvt_id=1'}" async></script>`,
        )
    })

    it('should not contains an empty ?g_cvt_id= if there is no installation id', () => {
        jest.spyOn(environment, 'isProduction').mockReturnValue(true)
        const { result } = renderHook(() =>
            useConvertBundleInstallationSnippet(),
        )
        expect(result.current).toContain(
            `<script src="${process.env.CONVERT_BUNDLE_PRODUCTION_URL ?? 'https://static.9gtb.com/loader.js'}" async></script>`,
        )
    })
})
