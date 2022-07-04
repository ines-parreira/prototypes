import React from 'react'
import {fromJS} from 'immutable'
import {act, screen, fireEvent, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {RootState, StoreDispatch} from 'state/types'
import {renderWithRouter} from 'utils/testing'
import {getLocalesResponseFixture} from '../../fixtures/getLocalesResponse.fixtures'
import {useHelpCenterApi} from '../../hooks/useHelpCenterApi'
import {useSupportedLocales} from '../../providers/SupportedLocales'
import HelpCenterNewView from '../HelpCenterNewView'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

const defaultState: Partial<RootState> = {
    billing: fromJS({
        plans: fromJS({
            ['AutomationAddon']: {automation_addon_included: true},
        }),
    }),
}
const store = mockStore(defaultState)

jest.mock('../../hooks/useHelpCenterApi', () => {
    return {
        useHelpCenterApi: () => ({
            isReady: true,
            client: {
                createHelpCenter: jest
                    .fn()
                    .mockReturnValue(Promise.resolve({})),
            },
        }),
    }
})

jest.mock('../../hooks/useShopifyStoreWithChatConnectionsOptions', () => {
    return {
        useShopifyStoreWithChatConnectionsOptions: jest
            .fn()
            .mockReturnValue([]),
    }
})

jest.mock('../../providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)

jest.mock('../../hooks/useEnableArticleRecommendation', () => ({
    useEnableArticleRecommendation: () => jest.fn(),
}))

describe('<HelpCenterNewView />', () => {
    const props = {}

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the component', async () => {
        const {container, findByTestId} = renderWithRouter(
            <Provider store={store}>
                <HelpCenterNewView {...props} />
            </Provider>
        )
        await findByTestId('name')
        expect(container).toMatchSnapshot()
    })

    describe('Submit form', () => {
        it('should disable the submit button if all the required fields are not filled', async () => {
            const {findByRole, findByTestId} = renderWithRouter(
                <Provider store={store}>
                    <HelpCenterNewView {...props} />
                </Provider>
            )
            const brandInput = await findByTestId('name')
            fireEvent.change(brandInput, {target: {value: 'My brand'}})
            fireEvent.change(brandInput, {target: {value: ''}})
            const submitButton = await findByRole('button', {
                name: /add new help center/i,
            })
            expect(submitButton.className).toMatch(/disabled/i)
        })

        it('should enable the submit button when all the required fields are filled', async () => {
            const {findByRole, getByRole, findByTestId} = renderWithRouter(
                <Provider store={store}>
                    <HelpCenterNewView {...props} />
                </Provider>
            )

            const brandInput = await findByTestId('name')
            fireEvent.change(brandInput, {target: {value: 'My brand'}})

            const subdomainInput = getByRole('textbox', {
                name: /subdomain/i,
            }) as HTMLInputElement

            expect(subdomainInput.value).toEqual('my-brand')

            fireEvent.change(subdomainInput, {
                target: {value: 'custom-subdomain'},
            })
            fireEvent.change(brandInput, {target: {value: 'My custom brand'}})

            expect(subdomainInput.value).toEqual('custom-subdomain')

            const submitButton = await findByRole('button', {
                name: /add new help center/i,
            })
            expect(submitButton.className).not.toMatch(/disabled/i)
        })

        it('should have an error message if brand name is one character long', async () => {
            const {findByRole, findByTestId} = renderWithRouter(
                <Provider store={store}>
                    <HelpCenterNewView {...props} />
                </Provider>
            )

            const brandInput = (await findByTestId('name')) as HTMLInputElement
            fireEvent.change(brandInput, {target: {value: 'M'}})
            const submitButton = await findByRole('button', {
                name: /add new help center/i,
            })
            expect(brandInput.value).toEqual('M')
            screen.getByText(/Name should be at least 2 characters long/i)
            expect(submitButton.className).toMatch(/disabled/i)
        })

        it('should call helpcenter API on submit a new help center', async () => {
            const {findByRole, getByTestId, findByTestId} = renderWithRouter(
                <Provider store={store}>
                    <HelpCenterNewView {...props} />
                </Provider>
            )
            const brandInput = await findByTestId('name')
            const submitButton = await findByRole('button', {
                name: /add new help center/i,
            })

            void act(async () => {
                fireEvent.change(brandInput, {target: {value: 'My brand'}})
                fireEvent.click(submitButton)

                await waitFor(() => getByTestId('loading'))

                expect(
                    useHelpCenterApi().client?.createHelpCenter
                ).toHaveBeenLastCalledWith(null, {
                    name: 'My brand',
                    default_locale: 'en-US',
                })
            })
        })
    })
})
