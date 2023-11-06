import {render, waitFor} from '@testing-library/react'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import userEvent from '@testing-library/user-event'
import {fromJS, Map} from 'immutable'

import SidebarSettings from 'pages/settings/sidebar/SidebarSettings'
import {RootState, StoreDispatch} from 'state/types'
import {AccountSettingType} from 'state/currentAccount/types'
import * as accountActions from 'state/currentAccount/actions'
import {ViewCategory} from 'models/view/types'
import {logEvent, SegmentEvent} from 'common/segment'

const mockViewsStore = fromJS({
    items: [
        {name: 'Inbox', id: 0, category: ViewCategory.SystemTop},
        {name: 'Spam', id: 1, category: ViewCategory.SystemBottom},
    ],
})
const mockAccount = fromJS({
    settings: [
        {
            id: 1,
            type: AccountSettingType.ViewsVisibility,
            data: {hidden_views: []},
        },
    ],
}) as Map<any, any>
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
    thunk,
])({
    views: mockViewsStore,
    currentAccount: mockAccount,
})
const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('common/segment')

const WrappedGeneralSettings = () => (
    <Provider store={mockStore}>
        <SidebarSettings />
    </Provider>
)

describe('SidebarSettings', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        jest.restoreAllMocks()
    })

    it('should render sidebar system views settings', () => {
        const {getByText} = render(<WrappedGeneralSettings />)
        expect(getByText('Sidebar')).toBeInTheDocument()
        expect(getByText('System views')).toBeInTheDocument()
    })

    it('should render checkboxes for the system views', () => {
        const {getByText, getByRole} = render(<WrappedGeneralSettings />)
        expect(getByText('Inbox')).toBeInTheDocument()
        expect(getByRole('checkbox', {name: 'Inbox'})).toHaveAttribute(
            'checked'
        )
    })

    it('should render unchecked checkboxes if the system view is hidden', () => {
        const store = configureMockStore<Partial<RootState>, StoreDispatch>([
            thunk,
        ])({
            views: mockViewsStore,
            currentAccount: mockAccount.setIn(
                ['settings', 0, 'data', 'hidden_views'],
                [1]
            ),
        })

        const {getByRole} = render(
            <Provider store={store}>
                <SidebarSettings />
            </Provider>
        )
        expect(getByRole('checkbox', {name: 'Spam'})).not.toHaveAttribute(
            'checked'
        )
    })

    it('should disable the save button if no views have been modified', () => {
        const {getByText} = render(<WrappedGeneralSettings />)
        expect(getByText('Save Changes').getAttribute('aria-disabled')).toBe(
            'true'
        )
    })

    it('should enable the save button if a view has been modified', () => {
        const {getByText, rerender} = render(<WrappedGeneralSettings />)
        userEvent.click(getByText('Spam'))
        rerender(<WrappedGeneralSettings />)

        expect(getByText('Save Changes').getAttribute('aria-disabled')).toBe(
            'false'
        )
    })

    it('should disable the save button if a view has been modified and then unmodified', () => {
        const {getByText, rerender} = render(<WrappedGeneralSettings />)
        userEvent.click(getByText('Spam'))
        rerender(<WrappedGeneralSettings />)
        userEvent.click(getByText('Spam'))
        rerender(<WrappedGeneralSettings />)

        expect(getByText('Save Changes').getAttribute('aria-disabled')).toBe(
            'true'
        )
    })

    it('should enable saving the performed changes and logging them via segment', async () => {
        const submitSettingSpy = jest.spyOn(accountActions, 'submitSetting')
        const {getByText} = render(<WrappedGeneralSettings />)
        userEvent.click(getByText('Spam'))
        userEvent.click(getByText('Save Changes'))

        await waitFor(() => {
            expect(submitSettingSpy).toHaveBeenCalledWith(
                expect.objectContaining({data: {hidden_views: [1]}})
            )
            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.SidebarViewsChanged,
                {enabled_views: ['Inbox']}
            )
        })
    })

    it('should create a new settings object if settings is missing from store', async () => {
        const submitSettingSpy = jest.spyOn(accountActions, 'submitSetting')
        const store = configureMockStore<Partial<RootState>, StoreDispatch>([
            thunk,
        ])({
            views: mockViewsStore,
        })
        const {getByText} = render(
            <Provider store={store}>
                <SidebarSettings />
            </Provider>
        )
        userEvent.click(getByText('Spam'))
        userEvent.click(getByText('Save Changes'))

        await waitFor(() => {
            expect(submitSettingSpy).toHaveBeenCalledWith({
                type: AccountSettingType.ViewsVisibility,
                data: {hidden_views: [1]},
            })
        })
    })

    it('should disable the save button while saving is in progress', async () => {
        const {getByText} = render(<WrappedGeneralSettings />)
        userEvent.click(getByText('Spam'))
        userEvent.click(getByText('Save Changes'))

        await waitFor(() => {
            expect(
                getByText('Save Changes').getAttribute('aria-disabled')
            ).toBe('true')
        })
    })
})
