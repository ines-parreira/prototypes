import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'

import copy from 'copy-to-clipboard'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import {initialState} from 'state/infobarActions/shopify/createOrder/reducers'
import {IntegrationType} from 'models/integration/constants'
import {notify} from 'state/notifications/actions'
import {EditionContext} from 'providers/infobar/EditionContext'
import {SegmentEvent, logEvent} from 'store/middlewares/segmentTracker'
import Order, {Copy} from '../OrderWidget'

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')

const orderWidgets = Order()

const TitleWrapper = orderWidgets.TitleWrapper

describe('<TitleWrapper/>', () => {
    const mockStore = configureMockStore()
    const integrationId = 1
    const integration = {
        id: integrationId,
        name: 'My Shopify Integration',
        total_spent: '100.0',
        currency: 'USD',
        admin_graphql_api_id: 'https://test.myshopify.com',
        meta: {
            currency: 'GBP',
            store_url: 'https://test.myshopify.com',
        },
        integrationType: IntegrationType.Shopify,
        shopify: IntegrationType.Shopify,
    }
    beforeEach(() => {
        jest.resetAllMocks()
    })
    describe('render()', () => {
        it('should render copy button if not editing', () => {
            const store = mockStore({
                integrations: fromJS({
                    integrations: [integration],
                }),
                infobarActions: {
                    [IntegrationType.Shopify]: {
                        createOrder: initialState,
                    },
                },
            })
            const {container} = render(
                <Provider store={store}>
                    <IntegrationContext.Provider
                        value={{
                            integration: fromJS(integration),
                            integrationId: integrationId,
                        }}
                    >
                        <TitleWrapper
                            source={fromJS({
                                order_number: 123,
                                name: 'name',
                                meta: {
                                    shop_name: 'shopify.gorgi.us',
                                    admin_url_suffix: 'admin_12df',
                                },
                            })}
                        >
                            <div>foo bar</div>
                        </TitleWrapper>
                    </IntegrationContext.Provider>
                </Provider>
            )
            expect(screen.getByRole('button')).toBeVisible()

            expect(container).toMatchSnapshot()
        })

        it('should not render copy button if editing', () => {
            const store = mockStore({
                integrations: fromJS({
                    integrations: [integration],
                }),
                infobarActions: {
                    [IntegrationType.Shopify]: {
                        createOrder: initialState,
                    },
                },
            })
            const {container} = render(
                <Provider store={store}>
                    <EditionContext.Provider value={{isEditing: true}}>
                        <IntegrationContext.Provider
                            value={{
                                integration: fromJS(integration),
                                integrationId: integrationId,
                            }}
                        >
                            <TitleWrapper
                                source={fromJS({
                                    order_number: 123,
                                    meta: {
                                        shop_name: 'shopify.gorgi.us',
                                        admin_url_suffix: 'admin_12df',
                                    },
                                })}
                            >
                                <div>foo bar</div>
                            </TitleWrapper>
                        </IntegrationContext.Provider>
                    </EditionContext.Provider>
                </Provider>
            )

            expect(screen.queryByRole('button')).toBeNull()

            expect(container).toMatchSnapshot()
        })
    })
})

jest.mock('copy-to-clipboard', () => jest.fn())
const copyMock = copy as jest.MockedFunction<typeof copy>

jest.mock('store/middlewares/segmentTracker')
const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>

describe('<Copy/>', () => {
    const mockStore = configureMockStore()
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should copy on clipboard', () => {
        const store = mockStore({currentAccount: fromJS({domain: 'domain'})})
        render(
            <Provider store={store}>
                <Copy value="test" />
            </Provider>
        )
        const button = screen.getByRole('button')
        expect(button).toBeVisible()
        fireEvent.click(button)
        expect(copyMock).toHaveBeenCalledWith('test')
        expect(logEventMock).toHaveBeenLastCalledWith(
            SegmentEvent.InfobarFieldCopied,
            {account_domain: 'domain'}
        )
    })

    it('should notify the user about the copy', () => {
        const store = mockStore({})
        render(
            <Provider store={store}>
                <Copy value="test" />
            </Provider>
        )
        const button = screen.getByRole('button')
        expect(button).toBeVisible()
        fireEvent.click(button)
        expect(notify).toHaveBeenCalledWith({
            status: 'success',
            title: 'Copied!',
        })
        expect(mockedDispatch).toHaveBeenCalled()
    })

    it('should notify the user about the copy with a custom message', () => {
        const store = mockStore({})
        render(
            <Provider store={store}>
                <Copy value="test" onCopyMessage="Test Message" />
            </Provider>
        )
        const button = screen.getByRole('button')
        expect(button).toBeVisible()
        fireEvent.click(button)
        expect(notify).toHaveBeenCalledWith({
            status: 'success',
            title: 'Test Message',
        })
        expect(mockedDispatch).toHaveBeenCalled()
    })

    it('should notify the user about the copy error', () => {
        const store = mockStore({})
        copyMock.mockImplementation(() => {
            throw new Error('User not found')
        })
        render(
            <Provider store={store}>
                <Copy value="test" onCopyMessage="Test Message" />
            </Provider>
        )
        const button = screen.getByRole('button')
        expect(button).toBeVisible()
        fireEvent.click(button)
        expect(notify).toHaveBeenCalledWith({
            status: 'error',
            title: 'Failed to copy',
        })
        expect(mockedDispatch).toHaveBeenCalled()
    })
})
