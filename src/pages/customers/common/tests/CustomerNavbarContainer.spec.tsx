import React, { ComponentProps } from 'react'

import { createMemoryHistory } from 'history'

import { Navbar } from 'common/navigation'
import { FeatureFlagKey } from 'config/featureFlags'
import { UserSettingType } from 'config/types/user'
import { useFlag } from 'core/flags'
import ViewNavbarView from 'pages/common/components/ViewNavbarView/ViewNavbarView'
import { renderWithRouter } from 'utils/testing'

import { CustomerNavbarContainer } from '../CustomerNavbarContainer'

jest.mock('core/flags')
const mockedUseFlag = useFlag as jest.Mock

jest.mock(
    'common/navigation',
    () =>
        ({
            ...jest.requireActual('common/navigation'),
            Navbar: ({ children }: ComponentProps<typeof Navbar>) => (
                <div>
                    Navbar: <div>children: {children}</div>
                </div>
            ),
        }) as typeof import('common/navigation'),
)

jest.mock(
    '../../../common/components/ViewNavbarView/ViewNavbarView',
    () => (props: ComponentProps<typeof ViewNavbarView>) => (
        <div data-testid="mock-view-navbar-view">
            MockViewNavbarView
            <div>isLoading: {JSON.stringify(props.isLoading)}</div>
            <div>settingType: {props.settingType}</div>
            <div>viewType: {props.viewType}</div>
        </div>
    ),
)

jest.mock('../components/CustomersNavbarViewV2', () => ({
    CustomersNavbarViewV2: (props: any) => (
        <div data-testid="mock-customers-navbar-view-v2">
            MockCustomersNavbarViewV2
            <div>Views</div>
            <div>isLoading: {JSON.stringify(props.isLoading)}</div>
            <div>settingType: {props.settingType}</div>
            <div>viewType: {props.viewType}</div>
        </div>
    ),
}))

describe('<CustomerNavbarContainer />', () => {
    const minProps = {
        fetchViews: jest.fn(),
        isLoading: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('when RevampNavBarUi feature flag is false', () => {
        beforeAll(() => {
            mockedUseFlag.mockImplementation((flagKey: FeatureFlagKey) => {
                if (flagKey === FeatureFlagKey.RevampNavBarUi) {
                    return false
                }
                return jest.requireActual('core/flags').useFlag(flagKey)
            })
        })

        it('should render ViewNavbarView', () => {
            const { getByTestId, getByText } = renderWithRouter(
                <CustomerNavbarContainer {...minProps} />,
            )
            expect(getByTestId('mock-view-navbar-view')).toBeInTheDocument()
            expect(
                getByText(`settingType: ${UserSettingType.CutomerViews}`),
            ).toBeInTheDocument()
            expect(
                document.querySelector(
                    '[data-testid="mock-customers-navbar-view-v2"]',
                ),
            ).not.toBeInTheDocument()
        })

        it('should fetch views on initial load and when route parameters are updated', () => {
            const history = createMemoryHistory()

            const { rerender } = renderWithRouter(
                <CustomerNavbarContainer {...minProps} />,
                {
                    history,
                    path: '/',
                },
            )
            expect(minProps.fetchViews).toHaveBeenCalledWith(undefined)

            const viewId = '11'
            history.push(`?viewId=${viewId}`)
            rerender(<CustomerNavbarContainer {...minProps} />)

            expect(minProps.fetchViews).toHaveBeenLastCalledWith(viewId)

            const newViewId = '12'
            history.push(`?q=search terms&viewId=${newViewId}`)

            rerender(<CustomerNavbarContainer {...minProps} />)

            expect(minProps.fetchViews).toHaveBeenLastCalledWith(newViewId)
        })
    })

    describe('when RevampNavBarUi feature flag is true', () => {
        beforeAll(() => {
            mockedUseFlag.mockImplementation((flagKey: FeatureFlagKey) => {
                if (flagKey === FeatureFlagKey.RevampNavBarUi) {
                    return true
                }
                return jest.requireActual('core/flags').useFlag(flagKey)
            })
        })

        it('should display CustomersNavbarViewV2 content', () => {
            const { getByTestId, getByText } = renderWithRouter(
                <CustomerNavbarContainer {...minProps} />,
            )
            expect(
                getByTestId('mock-customers-navbar-view-v2'),
            ).toBeInTheDocument()
            expect(getByText('Views')).toBeInTheDocument()
            expect(
                getByText(`settingType: ${UserSettingType.CutomerViews}`),
            ).toBeInTheDocument()
            expect(
                document.querySelector('[data-testid="mock-view-navbar-view"]'),
            ).not.toBeInTheDocument()
        })

        it('should fetch views on initial load and when route parameters are updated', () => {
            const history = createMemoryHistory()

            const { rerender } = renderWithRouter(
                <CustomerNavbarContainer {...minProps} />,
                {
                    history,
                    path: '/',
                },
            )
            expect(minProps.fetchViews).toHaveBeenCalledWith(undefined)

            const viewId = '11'
            history.push(`?viewId=${viewId}`)
            rerender(<CustomerNavbarContainer {...minProps} />)

            expect(minProps.fetchViews).toHaveBeenLastCalledWith(viewId)

            const newViewId = '12'
            history.push(`?q=search terms&viewId=${newViewId}`)

            rerender(<CustomerNavbarContainer {...minProps} />)

            expect(minProps.fetchViews).toHaveBeenLastCalledWith(newViewId)
        })
    })
})
