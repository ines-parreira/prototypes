import React from 'react'

import { useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'
import { Route, useRouteMatch } from 'react-router-dom'

import { PageSection } from 'config/pages'
import { AGENT_ROLE } from 'config/user'
import { SLAForm, SLAList, SLATemplateList } from 'pages/settings/SLAs'

import { renderAppSettings } from '../helpers/settingsRenderer'
import { SLA } from '../SLA'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
const useFlagMock = assumeMock(useFlag)

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Route: jest.fn(() => <div>route</div>),
    Switch: jest.fn(({ children }) => <div>{children}</div>),
    useRouteMatch: jest.fn(),
}))

const ComponentToRender = () => <div>OK</div>
jest.mock('../helpers/settingsRenderer', () => ({
    renderAppSettings: jest.fn(() => ComponentToRender),
}))

const mockedRoute = Route as jest.Mock
const mockedRenderAppSettings = assumeMock(renderAppSettings)
const mockedUseRouteMatch = assumeMock(useRouteMatch)

const basePath = 'sla'

describe('SLA', () => {
    beforeEach(() => {
        mockedUseRouteMatch.mockReturnValue({
            path: basePath,
        } as ReturnType<typeof useRouteMatch>)
    })

    it.each([
        [
            {
                callOrder: 0,
                path: basePath,
                exact: true,
                component: SLAList,
            },
        ],
        [
            {
                callOrder: 1,
                path: basePath + '/templates',
                exact: undefined,
                component: SLATemplateList,
            },
        ],
        [
            {
                callOrder: 2,
                path: basePath + '/:policyId',
                exact: true,
                component: SLAForm,
            },
        ],
    ])(
        'should call renderer and Route with correct props when voiceSLAFeatureFlag is OFF',
        ({ callOrder, path, exact, component }) => {
            useFlagMock.mockImplementation((flagName: string) => {
                if (flagName === 'voiceSLAFeatureFlag') {
                    return false
                }
            })

            render(<SLA />)

            expect(mockedRenderAppSettings.mock.calls[callOrder]).toEqual([
                component,
                {
                    roleParams: [AGENT_ROLE, PageSection.SLAPolicies],
                },
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
    it.each([
        [
            {
                callOrder: 0,
                path: basePath,
                exact: true,
                component: SLAList,
            },
        ],
        [
            {
                callOrder: 1,
                path: basePath + '/templates',
                exact: undefined,
                component: SLATemplateList,
            },
        ],
        [
            {
                callOrder: 2,
                path: basePath + '/:policyId',
                exact: true,
                component: SLAForm,
            },
        ],
    ])(
        'should call renderer and Route with correct props',
        ({ callOrder, path, exact, component }) => {
            useFlagMock.mockImplementation((flagName: string) => {
                if (flagName === 'voiceSLAFeatureFlag') {
                    return true
                }
            })

            render(<SLA />)

            expect(mockedRenderAppSettings.mock.calls[callOrder]).toEqual([
                component,
                {
                    roleParams: [AGENT_ROLE, PageSection.SLAPolicies],
                },
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
