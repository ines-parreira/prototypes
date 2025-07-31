import { renderHook } from '@repo/testing'
import { useRouteMatch } from 'react-router-dom'

import { useFlag } from 'core/flags'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { assumeMock } from 'utils/testing'

import { useAiAgentHeaderNavbarItems } from '../useAiAgentHeaderNavbarItems'

jest.mock('react-router-dom', () => ({ useRouteMatch: jest.fn() }))
const mockUseRouteMatch = assumeMock(useRouteMatch)
jest.mock('core/flags')
const mockUseFlag = assumeMock(useFlag)
jest.mock('pages/aiAgent/hooks/useAiAgentNavigation')
const mockUseAiAgentNavigation = assumeMock(useAiAgentNavigation)

describe('useAiAgentHeaderNavbarItems', () => {
    const item1SubItems = [
        {
            route: '/app/ai-agent/shopType/shopName/path1',
            title: 'subitem1',
        },
        {
            route: '/app/ai-agent/shopType/shopName/path1/subpath1',
            title: 'subitem2',
        },
        {
            route: '/app/ai-agent/shopType/shopName/path1/subpath2',
            title: 'subitem3',
        },
    ]
    const navigationItems = [
        {
            route: '/app/ai-agent/shopType/shopName/path1',
            title: 'item1',
            items: item1SubItems,
        },
        {
            route: '/app/ai-agent/shopType/shopName/path2',
            title: 'item2',
        },
    ]

    beforeEach(() => {
        mockUseRouteMatch.mockReturnValue({
            path: '/app/ai-agent/:shopType/:shopName/path1',
            url: '/app/ai-agent/shopType/shopName/path1',
            params: {},
            isExact: true,
        })
        mockUseFlag.mockReturnValue(false)
        mockUseAiAgentNavigation.mockReturnValue({
            // @ts-ignore We don't test this part
            routes: {},
            navigationItems,
        })
    })

    it("should return current navigation item's items when standalone menu is enabled", () => {
        mockUseFlag.mockReturnValue(true)

        const { result } = renderHook(() =>
            useAiAgentHeaderNavbarItems('shopName'),
        )

        expect(result.current).toEqual(item1SubItems)
    })

    it("should return current navigation item's items when standalone menu is enabled and current route is on a subpath of item1", () => {
        mockUseFlag.mockReturnValue(true)
        mockUseRouteMatch.mockReturnValue({
            path: '/app/ai-agent/:shopType/:shopName/path1/subpath1',
            url: '/app/ai-agent/shopType/shopName/path1/subpath1',
            params: {},
            isExact: true,
        })

        const { result } = renderHook(() =>
            useAiAgentHeaderNavbarItems('shopName'),
        )

        expect(result.current).toEqual(item1SubItems)
    })
})
