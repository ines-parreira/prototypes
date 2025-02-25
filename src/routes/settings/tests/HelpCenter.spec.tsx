import React from 'react'

import { render } from '@testing-library/react'
import { Route, useRouteMatch } from 'react-router-dom'

import { useFlag } from 'core/flags'
import HelpCenterCreationWizard from 'pages/settings/helpCenter/components/HelpCenterCreationWizard'
import HelpCenterNewView from 'pages/settings/helpCenter/components/HelpCenterNewView'
import HelpCenterStartView from 'pages/settings/helpCenter/components/HelpCenterStartView'
import { HelpCenterApiClientProvider } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import { MigrationApiClientProvider } from 'pages/settings/helpCenter/hooks/useMigrationApi'
import CurrentHelpCenter from 'pages/settings/helpCenter/providers/CurrentHelpCenter/CurrentHelpCenter'
import { SupportedLocalesProvider } from 'pages/settings/helpCenter/providers/SupportedLocales'
import { assumeMock } from 'utils/testing'

import { HelpCenter } from '../HelpCenter'
import { renderAppSettings } from '../helpers/settingsRenderer'

jest.mock('react-router-dom', () => ({
    Route: jest.fn(() => <div>route</div>),
    Switch: jest.fn(({ children }) => <div>{children}</div>),
    useRouteMatch: jest.fn(),
}))
jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))
jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    HelpCenterApiClientProvider: jest.fn(({ children }) => (
        <div>{children}</div>
    )),
}))
jest.mock('pages/settings/helpCenter/hooks/useMigrationApi', () => ({
    MigrationApiClientProvider: jest.fn(({ children }) => (
        <div>{children}</div>
    )),
}))
jest.mock('pages/settings/helpCenter/providers/SupportedLocales', () => ({
    SupportedLocalesProvider: jest.fn(({ children }) => <div>{children}</div>),
}))

const ComponentToRender = () => <div>OK</div>
jest.mock('../helpers/settingsRenderer', () => ({
    renderAppSettings: jest.fn(() => ComponentToRender),
}))

const mockedUseFlag = assumeMock(useFlag)
const mockedRoute = Route as jest.Mock
const mockedRenderAppSettings = assumeMock(renderAppSettings)
const mockedUseRouteMatch = assumeMock(useRouteMatch)

const basePath = 'help-center'

describe('ContactForm', () => {
    beforeEach(() => {
        mockedUseFlag.mockReturnValue(true)
        mockedUseRouteMatch.mockReturnValue({
            path: basePath,
        } as ReturnType<typeof useRouteMatch>)
    })

    it('should call HelpCenterApiClientProvider, MigrationApiClientProvider, and SupportedLocalesProvider', () => {
        render(<HelpCenter />)

        expect(HelpCenterApiClientProvider).toHaveBeenCalled()
        expect(MigrationApiClientProvider).toHaveBeenCalled()
        expect(SupportedLocalesProvider).toHaveBeenCalled()
    })

    it.each([
        [
            {
                callOrder: 0,
                creationFlagEnabled: undefined,
                exact: true,
                path: [
                    basePath + '/',
                    basePath + '/about',
                    basePath + '/manage',
                ],
                component: HelpCenterStartView,
            },
        ],
        [
            {
                callOrder: 1,
                creationFlagEnabled: true,
                exact: true,
                path: basePath + '/new',
                component: HelpCenterCreationWizard,
            },
        ],
        [
            {
                callOrder: 1,
                creationFlagEnabled: false,
                exact: true,
                path: basePath + '/new',
                component: HelpCenterNewView,
            },
        ],
        [
            {
                callOrder: 2,
                creationFlagEnabled: undefined,
                exact: undefined,
                path: basePath + '/:helpCenterId',
                component: CurrentHelpCenter,
            },
        ],
    ])(
        'should call renderer and Route with correct props',
        ({ callOrder, creationFlagEnabled, exact, path, component }) => {
            mockedUseFlag.mockReturnValue(creationFlagEnabled)

            render(<HelpCenter />)

            expect(mockedRenderAppSettings.mock.calls[callOrder]).toEqual([
                component,
            ])
            expect(mockedRoute.mock.calls[callOrder]).toEqual([
                {
                    path,
                    exact,
                    children: ComponentToRender,
                },
                {},
            ])
        },
    )
})
