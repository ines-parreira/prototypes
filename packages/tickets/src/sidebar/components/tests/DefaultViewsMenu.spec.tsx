import { screen, waitFor } from '@testing-library/react'

import { render, testAppQueryClient } from '../../../tests/render.utils'
import { useDefaultViews } from '../../hooks/useDefaultViews'
import { useUpdateDefaultViewsVisibility } from '../../hooks/useUpdateDefaultViewsVisibility'
import type { SystemView } from '../../types/views'
import { DefaultViewsMenu } from '../DefaultViewsMenu'

vi.mock('../../hooks/useDefaultViews')
vi.mock('../../hooks/useUpdateDefaultViewsVisibility')

const mockUseDefaultViews = vi.mocked(useDefaultViews)
const mockUseUpdateDefaultViewsVisibility = vi.mocked(
    useUpdateDefaultViewsVisibility,
)

const systemViews: SystemView[] = [
    { id: 1, name: 'Inbox', category: 'system', slug: 'inbox' },
    { id: 2, name: 'Unassigned', category: 'system', slug: 'unassigned' },
    { id: 3, name: 'All', category: 'system', slug: 'all' },
]

describe('DefaultViewsMenu', () => {
    const mockUpdateVisibility = vi.fn()

    beforeEach(() => {
        testAppQueryClient.clear()
        mockUseDefaultViews.mockReturnValue({
            defaultSystemViews: systemViews,
            visibleSystemViews: systemViews,
            visibilitySettingId: 42,
            isLoading: false,
            isError: false,
        })
        mockUseUpdateDefaultViewsVisibility.mockReturnValue(
            mockUpdateVisibility,
        )
    })

    it('should render the filter button', () => {
        render(<DefaultViewsMenu />)

        expect(
            screen.getByRole('button', { name: /filter default views/i }),
        ).toBeInTheDocument()
    })

    it('should show system view labels in the menu after opening', async () => {
        const { user } = render(<DefaultViewsMenu />)

        await user.click(
            screen.getByRole('button', { name: /filter default views/i }),
        )

        await waitFor(() => {
            expect(screen.getByText('Assigned to me')).toBeInTheDocument()
            expect(screen.getByText('Unassigned')).toBeInTheDocument()
            expect(screen.getByText('All')).toBeInTheDocument()
        })
    })

    it('should show view name as label if the label was not found', async () => {
        const customView = {
            id: 4,
            name: 'Custom',
            category: 'system',
            slug: 'custom',
        } as SystemView

        mockUseDefaultViews.mockReturnValue({
            defaultSystemViews: [...systemViews, customView],
            visibleSystemViews: [...systemViews, customView],
            visibilitySettingId: 42,
            isLoading: false,
            isError: false,
        })

        const { user } = render(<DefaultViewsMenu />)

        await user.click(
            screen.getByRole('button', { name: /filter default views/i }),
        )

        await waitFor(() => {
            expect(screen.getByText('Assigned to me')).toBeInTheDocument()
            expect(screen.getByText('Unassigned')).toBeInTheDocument()
            expect(screen.getByText('All')).toBeInTheDocument()
            expect(screen.getByText('Custom')).toBeInTheDocument()
        })
    })

    it('should disable the filter button when there is an error', () => {
        mockUseDefaultViews.mockReturnValue({
            defaultSystemViews: systemViews,
            visibleSystemViews: systemViews,
            visibilitySettingId: 42,
            isLoading: false,
            isError: true,
        })

        render(<DefaultViewsMenu />)

        expect(
            screen.getByRole('button', { name: /filter default views/i }),
        ).toBeDisabled()
    })

    it('should disable the filter button when loading', () => {
        mockUseDefaultViews.mockReturnValue({
            defaultSystemViews: systemViews,
            visibleSystemViews: systemViews,
            visibilitySettingId: 42,
            isLoading: true,
            isError: false,
        })

        render(<DefaultViewsMenu />)

        expect(
            screen.getByRole('button', { name: /filter default views/i }),
        ).toBeDisabled()
    })

    it('should not call updateVisibility when visibilitySettingId is not set', async () => {
        mockUseDefaultViews.mockReturnValue({
            defaultSystemViews: systemViews,
            visibleSystemViews: systemViews,
            visibilitySettingId: undefined,
            isLoading: false,
            isError: false,
        })

        const { user } = render(<DefaultViewsMenu />)

        await user.click(
            screen.getByRole('button', { name: /filter default views/i }),
        )

        await waitFor(() => {
            expect(screen.getByText('Assigned to me')).toBeInTheDocument()
        })

        await user.click(screen.getByText('Assigned to me'))

        expect(mockUpdateVisibility).not.toHaveBeenCalled()
    })

    it('should call updateVisibility with correct hidden views when a view is deselected', async () => {
        const { user } = render(<DefaultViewsMenu />)

        await user.click(
            screen.getByRole('button', { name: /filter default views/i }),
        )

        await waitFor(() => {
            expect(screen.getByText('Assigned to me')).toBeInTheDocument()
        })

        await user.click(screen.getByText('Assigned to me'))

        await waitFor(() => {
            expect(mockUpdateVisibility).toHaveBeenCalledWith({
                id: 42,
                data: {
                    type: 'views-visibility',
                    data: { hidden_views: [1] },
                },
            })
        })
    })
})
