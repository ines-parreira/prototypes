import { renderHook } from '@testing-library/react'

import { mockGetAnalyticsManagedDashboardResponse } from '@gorgias/helpdesk-mocks'
import type { AnalyticsManagedDashboard } from '@gorgias/helpdesk-types'

import type { DashboardLayoutConfig } from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

import { useDashboardConfig } from '../useDashboardConfig'

const mockDashboard: AnalyticsManagedDashboard = {
    ...mockGetAnalyticsManagedDashboardResponse(),
    id: 'ai-agent-overview',
    account_id: 123,
    user_id: 456,
    config: {
        id: 'ai-agent-overview',
        tabs: [
            {
                id: 'tab_main',
                name: 'Main',
                sections: [
                    {
                        section_id: 'section_kpis',
                        type: 'card',
                        items: [
                            {
                                chart_id: 'chart_1',
                                metadata: {
                                    visible: true,
                                    grid_size: 3,
                                },
                            },
                        ],
                    },
                ],
            },
        ],
    },
    created_datetime: '2026-02-18T00:00:00Z',
    updated_datetime: '2026-02-18T00:00:00Z',
}

const defaultConfig: DashboardLayoutConfig = {
    sections: [
        {
            id: 'section_kpis',
            type: 'kpis',
            items: [
                {
                    chartId: 'chart_1' as any,
                    gridSize: 3,
                    visibility: true,
                },
                {
                    chartId: 'chart_2' as any,
                    gridSize: 3,
                    visibility: true,
                },
            ],
        },
    ],
}

const defaultConfigWithNewSection: DashboardLayoutConfig = {
    sections: [
        {
            id: 'section_kpis',
            type: 'kpis',
            items: [
                {
                    chartId: 'chart_1' as any,
                    gridSize: 3,
                    visibility: true,
                },
            ],
        },
        {
            id: 'section_new',
            type: 'charts',
            items: [
                {
                    chartId: 'chart_3' as any,
                    gridSize: 12,
                    visibility: true,
                },
            ],
        },
    ],
}

const mockDashboardWithUpdatedItem: AnalyticsManagedDashboard = {
    ...mockDashboard,
    config: {
        id: 'ai-agent-overview',
        tabs: [
            {
                id: 'tab_main',
                name: 'Main',
                sections: [
                    {
                        section_id: 'section_kpis',
                        type: 'card',
                        items: [
                            {
                                chart_id: 'chart_1',
                                metadata: {
                                    visible: false,
                                    grid_size: 6,
                                },
                            },
                        ],
                    },
                ],
            },
        ],
    },
}

describe('useDashboardConfig', () => {
    it('should return saved config when dashboard exists', () => {
        const { result } = renderHook(() =>
            useDashboardConfig(defaultConfig, mockDashboard),
        )

        expect(result.current.layoutConfig.sections).toHaveLength(1)
        expect(result.current.layoutConfig.sections[0].items).toHaveLength(1)
        expect(result.current.layoutConfig.sections[0].items[0].chartId).toBe(
            'chart_1',
        )
    })

    it('should return default config when no saved dashboard exists', () => {
        const { result } = renderHook(() =>
            useDashboardConfig(defaultConfig, undefined),
        )

        expect(result.current.layoutConfig).toEqual(defaultConfig)
    })

    it('should merge saved config with defaults for new sections', () => {
        const { result } = renderHook(() =>
            useDashboardConfig(
                defaultConfigWithNewSection,
                mockDashboardWithUpdatedItem,
            ),
        )

        expect(result.current.layoutConfig.sections).toHaveLength(2)
        expect(result.current.layoutConfig.sections[0].id).toBe('section_kpis')
        expect(result.current.layoutConfig.sections[1].id).toBe('section_new')
        expect(
            result.current.layoutConfig.sections[0].items[0].visibility,
        ).toBe(false)
        expect(result.current.layoutConfig.sections[0].items[0].gridSize).toBe(
            6,
        )
    })
})
