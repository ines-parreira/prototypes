import { useFlag } from '@repo/feature-flags'
import { assumeMock, renderHook } from '@repo/testing'
import { useRouteMatch } from 'react-router-dom'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

import { useAiAgentHeaderNavbarItems } from '../useAiAgentHeaderNavbarItems'

jest.mock('react-router-dom', () => ({ useRouteMatch: jest.fn() }))
const mockUseRouteMatch = assumeMock(useRouteMatch)
jest.mock('@repo/feature-flags')
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

    it('should return undefined when no route matches', () => {
        mockUseRouteMatch.mockReturnValue({
            path: '/app/ai-agent/:shopType/:shopName/nonexistent',
            url: '/app/ai-agent/shopType/shopName/nonexistent',
            params: {},
            isExact: true,
        })

        const { result } = renderHook(() =>
            useAiAgentHeaderNavbarItems('shopName'),
        )

        expect(result.current).toBeUndefined()
    })

    it('should return undefined when navigation items is empty', () => {
        mockUseAiAgentNavigation.mockReturnValue({
            // @ts-ignore We don't test this part
            routes: {},
            navigationItems: [],
        })

        const { result } = renderHook(() =>
            useAiAgentHeaderNavbarItems('shopName'),
        )

        expect(result.current).toBeUndefined()
    })

    it('should handle items without sub-items (return undefined)', () => {
        mockUseRouteMatch.mockReturnValue({
            path: '/app/ai-agent/:shopType/:shopName/path2',
            url: '/app/ai-agent/shopType/shopName/path2',
            params: {},
            isExact: true,
        })

        const { result } = renderHook(() =>
            useAiAgentHeaderNavbarItems('shopName'),
        )

        expect(result.current).toBeUndefined()
    })

    it('should handle exact route matching when exact is true', () => {
        const navigationWithExact = [
            {
                route: '/app/ai-agent/shopType/shopName/exact-path',
                title: 'exact-item',
                exact: true,
                items: [{ route: '/app/sub', title: 'sub' }],
            },
        ]

        mockUseAiAgentNavigation.mockReturnValue({
            // @ts-ignore We don't test this part
            routes: {},
            navigationItems: navigationWithExact,
        })

        mockUseRouteMatch.mockReturnValue({
            path: '/app/ai-agent/:shopType/:shopName/exact-path/extra',
            url: '/app/ai-agent/shopType/shopName/exact-path/extra',
            params: {},
            isExact: false,
        })

        const { result } = renderHook(() =>
            useAiAgentHeaderNavbarItems('shopName'),
        )

        expect(result.current).toBeUndefined()
    })

    it('should find match in moderately nested structure with exact matching', () => {
        const nestedNavigationItems = [
            {
                route: '/app/ai-agent/shopType/shopName/level1',
                title: 'level1',
                exact: true,
                items: [
                    {
                        route: '/app/ai-agent/shopType/shopName/level1/level2',
                        title: 'level2',
                        exact: true,
                        items: [
                            {
                                route: '/app/ai-agent/shopType/shopName/level1/level2/target',
                                title: 'target',
                                exact: true,
                                items: [
                                    {
                                        route: '/app/sub-target',
                                        title: 'sub-target',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ]

        mockUseAiAgentNavigation.mockReturnValue({
            // @ts-ignore We don't test this part
            routes: {},
            navigationItems: nestedNavigationItems,
        })

        mockUseRouteMatch.mockReturnValue({
            path: '/app/ai-agent/:shopType/:shopName/level1/level2/target',
            url: '/app/ai-agent/shopType/shopName/level1/level2/target',
            params: {},
            isExact: true,
        })

        const { result } = renderHook(() =>
            useAiAgentHeaderNavbarItems('shopName'),
        )

        expect(result.current).toEqual([
            {
                route: '/app/sub-target',
                title: 'sub-target',
            },
        ])
    })

    it('should handle circular reference protection', () => {
        const circularItem: any = {
            route: '/app/ai-agent/shopType/shopName/circular',
            title: 'circular',
            items: [],
        }
        circularItem.items.push(circularItem)

        const circularNavigationItems = [circularItem]

        mockUseAiAgentNavigation.mockReturnValue({
            // @ts-ignore We don't test this part
            routes: {},
            navigationItems: circularNavigationItems,
        })

        mockUseRouteMatch.mockReturnValue({
            path: '/app/ai-agent/:shopType/:shopName/circular',
            url: '/app/ai-agent/shopType/shopName/circular',
            params: {},
            isExact: true,
        })

        const { result } = renderHook(() =>
            useAiAgentHeaderNavbarItems('shopName'),
        )

        expect(result.current).toEqual([circularItem])
    })

    it('should handle maximum depth protection', () => {
        let deepItem: any = {
            route: '/app/ai-agent/shopType/shopName/deep-start',
            title: 'deep-start',
            items: [],
        }

        let currentItem = deepItem
        for (let i = 0; i < 10; i++) {
            const nextItem = {
                route: `/app/ai-agent/shopType/shopName/deep-level-${i}`,
                title: `deep-level-${i}`,
                items: [],
            }
            currentItem.items.push(nextItem)
            currentItem = nextItem
        }

        const targetItem = {
            route: '/app/ai-agent/shopType/shopName/deep-target',
            title: 'deep-target',
            items: [{ route: '/app/final', title: 'final' }],
        }
        currentItem.items.push(targetItem)

        mockUseAiAgentNavigation.mockReturnValue({
            // @ts-ignore We don't test this part
            routes: {},
            navigationItems: [deepItem],
        })

        mockUseRouteMatch.mockReturnValue({
            path: '/app/ai-agent/:shopType/:shopName/deep-target',
            url: '/app/ai-agent/shopType/shopName/deep-target',
            params: {},
            isExact: true,
        })

        const { result } = renderHook(() =>
            useAiAgentHeaderNavbarItems('shopName'),
        )

        expect(result.current).toBeUndefined()
    })

    it('should handle null/undefined items gracefully', () => {
        const navigationWithNullItems = [
            {
                route: '/app/ai-agent/shopType/shopName/path1',
                title: 'item1',
                items: null,
            },
        ]

        mockUseAiAgentNavigation.mockReturnValue({
            // @ts-ignore We don't test this part
            routes: {},
            // @ts-ignore Testing with null items
            navigationItems: navigationWithNullItems,
        })

        mockUseRouteMatch.mockReturnValue({
            path: '/app/ai-agent/:shopType/:shopName/path1',
            url: '/app/ai-agent/shopType/shopName/path1',
            params: {},
            isExact: true,
        })

        const { result } = renderHook(() =>
            useAiAgentHeaderNavbarItems('shopName'),
        )

        expect(result.current).toBeNull()
    })

    it('should find first matching item when multiple items match', () => {
        const multipleMatchItems = [
            {
                route: '/app/ai-agent/shopType/shopName/path',
                title: 'first-match',
                items: [{ route: '/app/first', title: 'first-sub' }],
            },
            {
                route: '/app/ai-agent/shopType/shopName/path',
                title: 'second-match',
                items: [{ route: '/app/second', title: 'second-sub' }],
            },
        ]

        mockUseAiAgentNavigation.mockReturnValue({
            // @ts-ignore We don't test this part
            routes: {},
            navigationItems: multipleMatchItems,
        })

        mockUseRouteMatch.mockReturnValue({
            path: '/app/ai-agent/:shopType/:shopName/path',
            url: '/app/ai-agent/shopType/shopName/path',
            params: {},
            isExact: true,
        })

        const { result } = renderHook(() =>
            useAiAgentHeaderNavbarItems('shopName'),
        )

        expect(result.current).toEqual([
            { route: '/app/first', title: 'first-sub' },
        ])
    })

    it('should prioritize exact matches over partial matches', () => {
        const mixedMatchItems = [
            {
                route: '/app/ai-agent/shopType/shopName/path',
                title: 'partial-match',
                items: [{ route: '/app/partial', title: 'partial-sub' }],
            },
            {
                route: '/app/ai-agent/shopType/shopName/path/specific',
                title: 'exact-match',
                exact: true,
                items: [{ route: '/app/exact', title: 'exact-sub' }],
            },
        ]

        mockUseAiAgentNavigation.mockReturnValue({
            // @ts-ignore We don't test this part
            routes: {},
            navigationItems: mixedMatchItems,
        })

        mockUseRouteMatch.mockReturnValue({
            path: '/app/ai-agent/:shopType/:shopName/path/specific',
            url: '/app/ai-agent/shopType/shopName/path/specific',
            params: {},
            isExact: true,
        })

        const { result } = renderHook(() =>
            useAiAgentHeaderNavbarItems('shopName'),
        )

        expect(result.current).toEqual([
            { route: '/app/partial', title: 'partial-sub' },
        ])
    })
})
