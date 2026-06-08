import React from 'react'

import { useFlagWithLoading } from '@repo/feature-flags'
import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { renderAppSettings } from '../helpers/settingsRenderer'
import { UserDetailRoute } from '../Users'

const mockPage = jest.fn(({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
))

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: { NewUsersListPage: 'new-users-list-page' },
    useFlagWithLoading: jest.fn(),
}))
jest.mock('pages/settings/users/Detail', () => ({
    __esModule: true,
    default: () => <div>new user detail page</div>,
}))
jest.mock('pages/Page', () => ({
    __esModule: true,
    default: (props: { children: React.ReactNode }) => mockPage(props),
}))
jest.mock('pages/common/utils/withUserRoleRequired', () => ({
    __esModule: true,
    default: (Component: unknown) => Component,
}))
jest.mock('pages/settings/common/SettingsNavbar/SettingsNavbar', () => ({
    __esModule: true,
    default: () => null,
}))
jest.mock('../helpers/settingsRenderer', () => ({
    renderAppSettings: jest.fn(() => <div>legacy user detail</div>),
}))

const mockUseFlagWithLoading = assumeMock(useFlagWithLoading)
const mockRenderAppSettings = assumeMock(renderAppSettings)

describe('UserDetailRoute', () => {
    it('renders an empty full-bleed page while the flag is loading', () => {
        mockUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: true,
        })

        render(<UserDetailRoute />)

        expect(mockPage).toHaveBeenCalledWith(
            expect.objectContaining({ children: null }),
        )
        expect(
            screen.queryByText('new user detail page'),
        ).not.toBeInTheDocument()
        expect(mockRenderAppSettings).not.toHaveBeenCalled()
    })

    it('renders the new detail page in a full-bleed page when enabled', () => {
        mockUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: false,
        })

        render(<UserDetailRoute />)

        expect(screen.getByText('new user detail page')).toBeInTheDocument()
        expect(mockRenderAppSettings).not.toHaveBeenCalled()
    })

    it('renders the legacy detail via renderAppSettings when disabled', () => {
        mockUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: false,
        })

        render(<UserDetailRoute />)

        expect(screen.getByText('legacy user detail')).toBeInTheDocument()
        expect(mockRenderAppSettings).toHaveBeenCalledTimes(1)
    })
})
