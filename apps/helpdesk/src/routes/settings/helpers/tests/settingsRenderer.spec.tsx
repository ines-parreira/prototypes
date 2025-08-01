import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { PageSection } from 'config/pages'
import { UserRole } from 'config/types/user'
import App from 'pages/App'
import withFeaturePaywall from 'pages/common/utils/withFeaturePaywall'
import withUserRoleRequired from 'pages/common/utils/withUserRoleRequired'
import SettingsNavbar from 'pages/settings/common/SettingsNavbar/SettingsNavbar'
import { AccountFeature } from 'state/currentAccount/types'

import { renderAppSettings } from '../settingsRenderer'

jest.mock('pages/App', () =>
    jest.fn(({ children }) => (
        <>
            <div>App</div>
            <div>{children}</div>
        </>
    )),
)
const mockedUserRoleRequiredComponent = jest.fn(() => 'roleContent')
jest.mock('pages/common/utils/withUserRoleRequired', () =>
    jest.fn(() => mockedUserRoleRequiredComponent),
)
const mockedPageComponent = jest.fn(() => 'paywalledContent')
const mockedInBetweenFeaturePaywall = jest.fn(() => mockedPageComponent)
jest.mock('pages/common/utils/withFeaturePaywall', () =>
    jest.fn(() => mockedInBetweenFeaturePaywall),
)

const mockedApp = assumeMock(App)
const mockedWithUserRoleRequired = assumeMock(withUserRoleRequired)
const mockedwithFeaturePaywall = assumeMock(withFeaturePaywall)

const PageComponent = () => <div>PageComponent</div>

describe('renderAppSettings', () => {
    it("should call HOCs and App without additional settings if they're not defined", () => {
        render(renderAppSettings(PageComponent))

        expect(mockedWithUserRoleRequired).toHaveBeenCalledWith(PageComponent)
        expect(mockedApp).toHaveBeenCalledWith(
            {
                navbar: SettingsNavbar,
                children: expect.anything(),
            },
            {},
        )
    })

    it('should call withUserRoleRequired with passed params', () => {
        render(
            renderAppSettings(PageComponent, {
                roleParams: [UserRole.Admin, PageSection.TicketFields],
            }),
        )

        expect(mockedWithUserRoleRequired).toHaveBeenCalledWith(
            PageComponent,
            UserRole.Admin,
            PageSection.TicketFields,
        )
    })

    it('should call withFeaturePaywall with passed params', () => {
        render(
            renderAppSettings(PageComponent, {
                paywallParams: [AccountFeature.HelpCenter],
            }),
        )

        expect(mockedwithFeaturePaywall).toHaveBeenCalledWith(
            AccountFeature.HelpCenter,
        )
        expect(mockedInBetweenFeaturePaywall).toHaveBeenCalledWith(
            mockedUserRoleRequiredComponent,
        )
        expect(screen.getByText('paywalledContent')).toBeInTheDocument()
    })

    it('should render App with passed props and enforced SettingsNavbar', () => {
        render(
            renderAppSettings(() => null, {
                appProps: { containerPadding: false },
            }),
        )

        expect(screen.getByText('App')).toBeInTheDocument()
        expect(screen.getByText('roleContent')).toBeInTheDocument()
        expect(mockedApp).toHaveBeenCalledWith(
            {
                navbar: SettingsNavbar,
                containerPadding: false,
                children: expect.anything(),
            },
            {},
        )
    })
})
