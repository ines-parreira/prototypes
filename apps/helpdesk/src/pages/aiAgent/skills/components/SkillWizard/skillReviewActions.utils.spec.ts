import { IntegrationType } from 'models/integration/constants'
import type { GetAppFromTemplateApp } from 'pages/automate/actionsPlatform/hooks/useGetAppFromTemplateApp'
import type { App } from 'pages/automate/actionsPlatform/types'

import { groupActionsByIntegration } from './skillReviewActions.utils'

const shopifyApp: App = {
    id: 'shopify',
    type: IntegrationType.Shopify,
    name: 'Shopify',
    icon: 'shopify.png',
}
const loopApp: App = {
    id: 'loop',
    type: IntegrationType.App,
    name: 'Loop',
    icon: 'loop.png',
}

const getAppFromTemplateApp: GetAppFromTemplateApp = (templateApp) => {
    if (templateApp.type === 'shopify') return shopifyApp
    if (templateApp.type === 'app' && templateApp.app_id === 'loop')
        return loopApp
    return undefined
}

const action = (id: string, name: string, apps: any[]) =>
    ({ id, name, apps }) as any

describe('groupActionsByIntegration', () => {
    it('groups multiple actions sharing the same integration into a single entry', () => {
        const groups = groupActionsByIntegration(
            ['1', '2'],
            [
                action('1', 'Remove item', [{ type: 'shopify' }]),
                action('2', 'Replace item', [{ type: 'shopify' }]),
            ],
            getAppFromTemplateApp,
        )

        expect(groups).toEqual([
            {
                key: 'shopify',
                integration: shopifyApp,
                actionNames: ['Remove item', 'Replace item'],
            },
        ])
    })

    it('keeps actions from different integrations in separate groups', () => {
        const groups = groupActionsByIntegration(
            ['1', '2'],
            [
                action('1', 'Send return portal link', [
                    { type: 'app', app_id: 'loop' },
                ]),
                action('2', 'Refund order', [{ type: 'shopify' }]),
            ],
            getAppFromTemplateApp,
        )

        expect(groups).toHaveLength(2)
        expect(groups[0]).toMatchObject({
            key: 'loop',
            actionNames: ['Send return portal link'],
        })
        expect(groups[1]).toMatchObject({
            key: 'shopify',
            actionNames: ['Refund order'],
        })
    })

    it('skips action ids that are not present in the raw action list', () => {
        const groups = groupActionsByIntegration(
            ['1', '999'],
            [action('1', 'Remove item', [{ type: 'shopify' }])],
            getAppFromTemplateApp,
        )

        expect(groups).toHaveLength(1)
        expect(groups[0].actionNames).toEqual(['Remove item'])
    })

    it('falls back to an "unknown" group when an action has no apps', () => {
        const groups = groupActionsByIntegration(
            ['1'],
            [action('1', 'Send email', [])],
            getAppFromTemplateApp,
        )

        expect(groups).toEqual([
            {
                key: 'unknown',
                integration: undefined,
                actionNames: ['Send email'],
            },
        ])
    })
})
