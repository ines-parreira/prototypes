import React from 'react'

import { useFlagWithLoading } from '@repo/feature-flags'
import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { renderAppSettings } from '../helpers/settingsRenderer'
import { UsersListRoute } from '../Users'

const mockPage = jest.fn(({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
))

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: { NewUsersListPage: 'new-users-list-page' },
    useFlagWithLoading: jest.fn(),
}))
jest.mock('@repo/users', () => ({
    UsersListPage: () => <div>new users list page</div>,
}))
jest.mock('pages/Page', () => ({
    __esModule: true,
    DefaultExportPage: (props: { children: React.ReactNode }) =>
        mockPage(props),
}))
jest.mock('pages/common/utils/withUserRoleRequired', () => ({
    __esModule: true,
    memoizedWithUserRoleRequired: (Component: unknown) => Component,
}))
jest.mock('pages/settings/common/SettingsNavbar/SettingsNavbar', () => ({
    __esModule: true,
    SettingsNavbar: () => null,
}))
jest.mock('../helpers/settingsRenderer', () => ({
    renderAppSettings: jest.fn(() => <div>legacy users list</div>),
}))

const mockUseFlagWithLoading = assumeMock(useFlagWithLoading)
const mockRenderAppSettings = assumeMock(renderAppSettings)

describe('UsersListRoute', () => {
    it('renders an empty full-bleed page while the flag is loading', () => {
        mockUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: true,
        })

        render(<UsersListRoute />)

        expect(mockPage).toHaveBeenCalledWith(
            expect.objectContaining({ children: null }),
        )
        expect(
            screen.queryByText('new users list page'),
        ).not.toBeInTheDocument()
        expect(mockRenderAppSettings).not.toHaveBeenCalled()
    })

    it('renders the new list page in a full-bleed page when enabled', () => {
        mockUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: false,
        })

        render(<UsersListRoute />)

        expect(screen.getByText('new users list page')).toBeInTheDocument()
        expect(mockRenderAppSettings).not.toHaveBeenCalled()
    })

    it('renders the legacy list via renderAppSettings when disabled', () => {
        mockUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: false,
        })

        render(<UsersListRoute />)

        expect(screen.getByText('legacy users list')).toBeInTheDocument()
        expect(mockRenderAppSettings).toHaveBeenCalledTimes(1)
    })
})
