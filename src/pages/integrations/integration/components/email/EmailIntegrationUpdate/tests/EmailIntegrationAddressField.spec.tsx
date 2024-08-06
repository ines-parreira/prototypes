import React, {ComponentProps} from 'react'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {useFlag} from 'common/flags'
import {assumeMock} from 'utils/testing'
import useAppDispatch from 'hooks/useAppDispatch'
import {RootState, StoreDispatch} from 'state/types'
import {submitSetting} from 'state/currentAccount/actions'
import {AccountSettingType} from 'state/currentAccount/types'
import {EmailIntegration} from 'models/integration/types'

import EmailIntegrationAddressField from '../EmailIntegrationAddressField'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('common/flags', () => ({
    useFlag: jest.fn(),
}))
jest.mock('hooks/useAppDispatch')
jest.mock('state/currentAccount/actions')

const mockDispatch = jest.fn()
assumeMock(useAppDispatch).mockReturnValue(mockDispatch)
const mockUseFlag = assumeMock(useFlag).mockReturnValue(true)
const mockSubmitSetting = assumeMock(submitSetting)

describe('<EmailIntegrationAddressField />', () => {
    const minProps: ComponentProps<typeof EmailIntegrationAddressField> = {
        integration: {
            id: 1,
            meta: {
                address: 'test@gorgias.com',
            },
        } as any,
    }

    const defaultState = {}
    const defaultStore = mockStore(defaultState)
    const renderComponent = (props = minProps, store = defaultStore) => {
        return {
            ...render(
                <Provider store={store}>
                    <EmailIntegrationAddressField {...props} />
                </Provider>
            ),
            store,
        }
    }

    beforeEach(() => {
        mockUseFlag.mockReturnValue(true)
    })

    it('should not render if the feature flag is disabled', () => {
        mockUseFlag.mockReturnValue(false)
        renderComponent()
        expect(screen.queryByText('Email Address')).toBeNull()
    })

    it('should render the button when not setting is found', () => {
        renderComponent()
        expect(screen.getByText('Email Address')).toBeInTheDocument()
        expect(screen.getByText('test@gorgias.com')).toBeInTheDocument()
        expect(screen.getByText('Set As Default')).toBeInTheDocument()
    })

    it('should render if the address is missing', () => {
        renderComponent({integration: {id: 1} as EmailIntegration})
        expect(screen.getByText('Email Address')).toBeInTheDocument()
        expect(screen.getByText('Set As Default')).toBeInTheDocument()
    })

    it('should render the default badge if the integration is set as default', () => {
        const store = mockStore({
            currentAccount: fromJS({
                settings: [{type: 'default-integration', data: {email: 1}}],
            }),
        })
        renderComponent(minProps, store)
        expect(screen.getByText('Email Address')).toBeInTheDocument()
        expect(screen.getByText('test@gorgias.com')).toBeInTheDocument()
        expect(screen.getByText('DEFAULT')).toBeInTheDocument()
        expect(screen.queryByText('Set As Default')).not.toBeInTheDocument()
    })

    it('should render a tooltip for the button', async () => {
        renderComponent()
        expect(screen.getByText('Email Address')).toBeInTheDocument()
        expect(screen.getByText('test@gorgias.com')).toBeInTheDocument()
        expect(screen.getByText('Set As Default')).toBeInTheDocument()

        fireEvent.mouseEnter(screen.getByText('Set As Default'))

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Set this email address as your default when creating email tickets or switching to the email channel.'
                )
            ).toBeInTheDocument()
        })
    })

    it('should render a tooltip for the default badge', async () => {
        const store = mockStore({
            currentAccount: fromJS({
                settings: [{type: 'default-integration', data: {email: 1}}],
            }),
        })
        renderComponent(minProps, store)
        expect(screen.getByText('Email Address')).toBeInTheDocument()
        expect(screen.getByText('test@gorgias.com')).toBeInTheDocument()
        expect(screen.getByText('DEFAULT')).toBeInTheDocument()

        fireEvent.mouseEnter(screen.getByText('DEFAULT'))

        await waitFor(() => {
            expect(
                screen.getByText(
                    'This email address is used as the default when creating email tickets or switching to the email channel. To remove this as the default, you must set another email as the default first.'
                )
            ).toBeInTheDocument()
        })
    })

    it('should trigger a setting change action when clicking on the button', async () => {
        renderComponent()
        expect(screen.getByText('Email Address')).toBeInTheDocument()
        expect(screen.getByText('test@gorgias.com')).toBeInTheDocument()
        expect(screen.getByText('Set As Default')).toBeInTheDocument()

        fireEvent.click(screen.getByText('Set As Default'))

        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalled()
            expect(mockSubmitSetting).toHaveBeenCalledWith({
                type: AccountSettingType.DefaultIntegration,
                data: {email: 1},
            })
        })
    })

    it('should keep other integration setting untouched when updating', async () => {
        const store = mockStore({
            currentAccount: fromJS({
                settings: [
                    {type: 'default-integration', data: {email: 2, phone: 3}},
                ],
            }),
        })

        renderComponent(minProps, store)
        expect(screen.getByText('Email Address')).toBeInTheDocument()
        expect(screen.getByText('test@gorgias.com')).toBeInTheDocument()
        expect(screen.getByText('Set As Default')).toBeInTheDocument()

        fireEvent.click(screen.getByText('Set As Default'))

        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalled()
            expect(mockSubmitSetting).toHaveBeenCalledWith({
                type: AccountSettingType.DefaultIntegration,
                data: {email: 1, phone: 3},
            })
        })
    })
})
