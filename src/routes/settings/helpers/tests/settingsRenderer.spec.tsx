import React from 'react'
import {render, screen} from '@testing-library/react'

import {UserRole} from 'config/types/user'
import App from 'pages/App'
import withUserRoleRequired from 'pages/common/utils/withUserRoleRequired'
import SettingsNavbar from 'pages/settings/common/SettingsNavbar/SettingsNavbar'
import {assumeMock} from 'utils/testing'

import {renderer} from '../settingsRenderer'

jest.mock('pages/common/utils/withUserRoleRequired', () =>
    jest.fn(() => 'content')
)

jest.mock('pages/App', () => jest.fn(() => <div>App</div>))

const mockedWithUserRoleRequired = assumeMock(withUserRoleRequired)
const mockedApp = assumeMock(App)

describe('renderer', () => {
    it('should render App with withUserRoleRequired and SettingsNavbar', () => {
        const settings = [() => null, UserRole.Admin] as Parameters<
            typeof withUserRoleRequired
        >

        render(renderer(...settings)())

        expect(screen.getByText('App')).toBeInTheDocument()
        expect(mockedWithUserRoleRequired).toHaveBeenCalledWith(...settings)
        expect(mockedApp).toHaveBeenCalledWith(
            {content: 'content', navbar: SettingsNavbar},
            {}
        )
    })
})
