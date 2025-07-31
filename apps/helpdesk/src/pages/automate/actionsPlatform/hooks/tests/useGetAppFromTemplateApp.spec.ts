import { renderHook } from '@repo/testing'

import { IntegrationType } from 'models/integration/constants'

import { App } from '../../types'
import useGetAppFromTemplateApp from '../useGetAppFromTemplateApp'

describe('useGetAppFromTemplateApp()', () => {
    const shopifyApp: App = {
        icon: '/assets/img/integrations/shopify.png',
        id: 'shopify',
        name: 'Shopify',
        type: IntegrationType.Shopify,
    }
    const rechargeApp: App = {
        icon: '/assets/img/integrations/recharge.svg',
        id: 'recharge',
        name: 'Recharge',
        type: IntegrationType.Recharge,
    }
    const testApp: App = {
        icon: 'https://ok.com/1.png',
        id: 'someid',
        name: 'My test app',
        type: IntegrationType.App,
    }

    const apps: App[] = [shopifyApp, rechargeApp, testApp]

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should get Shopify app from template', () => {
        const { result } = renderHook(() => useGetAppFromTemplateApp({ apps }))

        expect(result.current({ type: 'shopify' })).toEqual(shopifyApp)
    })

    it('should get Recharge app from template', () => {
        const { result } = renderHook(() => useGetAppFromTemplateApp({ apps }))

        expect(result.current({ type: 'recharge' })).toEqual(rechargeApp)
    })

    it('should get existing non native app from template', () => {
        const { result } = renderHook(() => useGetAppFromTemplateApp({ apps }))

        expect(result.current({ type: 'app', app_id: 'someid' })).toEqual(
            testApp,
        )
    })

    it('should return undefined is app does not exist', () => {
        const { result } = renderHook(() => useGetAppFromTemplateApp({ apps }))

        expect(
            result.current({ type: 'app', app_id: 'someid2' }),
        ).toBeUndefined()
    })
})
