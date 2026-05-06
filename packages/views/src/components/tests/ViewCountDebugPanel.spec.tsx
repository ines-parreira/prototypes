import type { ReactNode } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'

import { useAllViews } from '../../hooks/useAllViews'
import { viewEventLogStore } from '../../store/viewEventLog'
import {
    clearViewsCount,
    setScores,
    setViewportViewIds,
    setViewsCount,
    viewsCountStore,
} from '../../store/viewsCountStore'
import { ViewCountDebugPanel } from '../ViewCountDebugPanel'

vi.mock('@repo/browser-storage', () => ({
    localForageManager: {
        getTable: vi.fn(() => ({
            getItem: vi.fn().mockResolvedValue(null),
            setItem: vi.fn().mockResolvedValue(undefined),
            removeItem: vi.fn().mockResolvedValue(undefined),
        })),
    },
}))

vi.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        UIVisionBetaBaseline: 'ui-vision-beta-baseline',
    },
    useFlag: vi.fn(),
}))

vi.mock('../../hooks/useAllViews', () => ({
    useAllViews: vi.fn(),
}))

vi.mock('@gorgias/axiom', () => {
    const Passthrough = ({
        children,
        title,
        description,
        trigger,
    }: {
        children?: ReactNode
        title?: string
        description?: string
        trigger?: ReactNode
    }) => (
        <div>
            {trigger}
            {title}
            {description}
            {children}
        </div>
    )

    return {
        Banner: Passthrough,
        Box: Passthrough,
        Card: Passthrough,
        createColumnHelper: () => ({
            accessor: (id: string, options: unknown) => ({ id, options }),
        }),
        DataTable: ({
            data,
        }: {
            data: Array<{ name?: string; count?: number }>
        }) => (
            <div>
                {data.map((row) => (
                    <div key={row.name ?? String(row.count)}>
                        {row.name}
                        {row.count}
                    </div>
                ))}
            </div>
        ),
        DataTableBaseCell: Passthrough,
        DataTableTextCell: Passthrough,
        Disclosure: Passthrough,
        DisclosureHeader: Passthrough,
        DisclosurePanel: Passthrough,
        Dot: Passthrough,
        Heading: Passthrough,
        Icon: Passthrough,
        OverlayContent: Passthrough,
        OverlayHeader: Passthrough,
        Quantity: ({ value }: { value: number }) => <span>{value}</span>,
        SidePanel: Passthrough,
        Tag: Passthrough,
        Text: Passthrough,
        Toaster: Passthrough,
        Tooltip: Passthrough,
        TooltipContent: Passthrough,
    }
})

const useFlagMock = vi.mocked(useFlag)
const useAllViewsMock = vi.mocked(useAllViews)

const view = {
    id: 1,
    uri: '/api/views/1',
    name: 'Open tickets',
    category: 'system',
    deactivated_datetime: null,
    filters: `ticket.channel = "chat"`,
    section_id: null,
    visibility: 'shared' as const,
}

beforeEach(() => {
    clearViewsCount()
    viewEventLogStore.setState({ events: [] })
    viewsCountStore.setState({ isLeader: true, activeViewId: 1 })
    setViewportViewIds([1])
    setScores({ 1: 42 })
    useFlagMock.mockReturnValue(false)
    useAllViewsMock.mockReturnValue([view])
})

describe('ViewCountDebugPanel', () => {
    it('uses the Helpdesk v2 beta flag to gate scheduler debug rows', () => {
        render(<ViewCountDebugPanel isOpen />)

        expect(useFlagMock).toHaveBeenCalledWith(
            FeatureFlagKey.UIVisionBetaBaseline,
        )
    })

    it('shows Helpdesk v2 beta flag fallback copy when disabled', () => {
        render(<ViewCountDebugPanel isOpen />)

        expect(
            screen.getAllByText((_content, element) =>
                Boolean(
                    element?.textContent?.includes(
                        'The Helpdesk v2 beta flag is disabled, so view counts are fetched by the legacy scheduler.',
                    ),
                ),
            ),
        ).not.toHaveLength(0)
    })

    it('builds debug rows when the Helpdesk v2 beta flag is enabled', () => {
        useFlagMock.mockReturnValue(true)
        setViewsCount({ 1: 12 })

        render(<ViewCountDebugPanel isOpen />)

        expect(
            screen.getAllByText((_content, element) =>
                Boolean(
                    element?.textContent?.includes('Open tickets') &&
                        element.textContent.includes('12'),
                ),
            ),
        ).not.toHaveLength(0)
    })
})
