import React from 'react'
import {Route, useRouteMatch} from 'react-router-dom'
import {render} from '@testing-library/react'

import {PageSection} from 'config/pages'
import {AGENT_ROLE} from 'config/user'
import RulesLibrary from 'pages/settings/rules/RulesLibrary'
import RulesView from 'pages/settings/rules/RulesList'
import RuleDetailForm from 'pages/settings/rules/accountRules/RuleDetailForm'
import {HelpCenterApiClientProvider} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {assumeMock} from 'utils/testing'

import {renderAppSettings} from '../helpers/settingsRenderer'
import {Rules} from '../Rules'

jest.mock('react-router-dom', () => ({
    Route: jest.fn(() => <div>route</div>),
    Switch: jest.fn(({children}) => <div>{children}</div>),
    useRouteMatch: jest.fn(),
}))
jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    HelpCenterApiClientProvider: jest.fn(({children}) => <div>{children}</div>),
}))

const ComponentToRender = () => <div>OK</div>
jest.mock('../helpers/settingsRenderer', () => ({
    renderAppSettings: jest.fn(() => ComponentToRender),
}))

const mockedRoute = Route as jest.Mock
const mockedRenderAppSettings = assumeMock(renderAppSettings)
const mockedUseRouteMatch = assumeMock(useRouteMatch)

const basePath = 'rules'

describe('Rules', () => {
    beforeEach(() => {
        mockedUseRouteMatch.mockReturnValue({
            path: basePath,
        } as ReturnType<typeof useRouteMatch>)
    })

    it('should call HelpCenterApiClientProvider', () => {
        render(<Rules />)

        expect(HelpCenterApiClientProvider).toHaveBeenCalled()
    })

    it.each([
        [
            {
                callOrder: 0,
                path: basePath,
                pageSection: undefined,
                role: undefined,
                component: RulesView,
            },
        ],
        [
            {
                callOrder: 1,
                path: basePath + '/library',
                pageSection: undefined,
                role: undefined,
                component: RulesLibrary,
            },
        ],
        [
            {
                callOrder: 2,
                path: basePath + '/new',
                pageSection: PageSection.SidebarSettings,
                role: AGENT_ROLE,
                component: RuleDetailForm,
            },
        ],
        [
            {
                callOrder: 3,
                path: basePath + '/:ruleId',
                pageSection: undefined,
                role: undefined,
                component: RuleDetailForm,
            },
        ],
    ])(
        'should call renderer and Route with correct props',
        ({callOrder, path, pageSection, role, component}) => {
            render(<Rules />)

            expect(mockedRenderAppSettings.mock.calls[callOrder]).toEqual([
                component,
                (role && {
                    roleParams: [role, pageSection],
                }) ||
                    undefined,
            ])
            expect(mockedRoute.mock.calls[callOrder]).toEqual([
                {
                    path,
                    exact: true,
                    children: ComponentToRender,
                },
                {},
            ])
        }
    )
})
