import React from 'react'
import {fromJS} from 'immutable'
import {render, screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'

import {getLDClient} from 'utils/launchDarkly'
import {RootState, StoreDispatch} from 'state/types'

import {
    usePropagateError,
    useQuickResponsesViewContext,
} from '../../QuickResponsesViewContext'
import QuickResponseResponseMessageContent from '../QuickResponseResponseMessageContent'

jest.mock('utils/launchDarkly')
jest.mock('../../QuickResponsesViewContext')

const allFlagsMock = getLDClient().allFlags as jest.MockedFunction<
    ReturnType<typeof getLDClient>['allFlags']
>
allFlagsMock.mockReturnValue({})
const useQuickResponsesViewContextMock =
    useQuickResponsesViewContext as jest.Mock
useQuickResponsesViewContextMock.mockReturnValue({})

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

describe('<QuickResponseResponseMessageContent />', () => {
    it('should render the response message content component', () => {
        const text = 'Use code FRIENDS10 for 10% off!'

        render(
            <Provider store={mockStore()}>
                <QuickResponseResponseMessageContent
                    responseMessageContent={{
                        html: `<div>${text}</div>`,
                        text,
                        attachments: fromJS([]),
                    }}
                    onChange={jest.fn()}
                />
            </Provider>
        )

        expect(screen.getByText(text)).toBeVisible()
    })

    it('should render the response message attachments', () => {
        window.IMAGE_PROXY_URL = 'http://proxy-url/'
        window.IMAGE_PROXY_SIGN_KEY = 'test-key'

        const productName = 'Lorem ipsum dolor sit amet.'

        render(
            <Provider store={mockStore()}>
                <QuickResponseResponseMessageContent
                    responseMessageContent={{
                        html: '<div></div>',
                        text: '',
                        attachments: fromJS([
                            {
                                name: productName,
                                content_type: 'application/productCard',
                                url: 'http://gorgias.io/bar',
                                extra: {
                                    price: 2,
                                    variant_name: 'bar',
                                    product_link: 'http://gorgias.io/bar',
                                    currency: 'USD',
                                },
                            },
                        ]),
                    }}
                    onChange={jest.fn()}
                />
            </Provider>
        )

        expect(screen.getByText(productName)).toBeVisible()
    })

    it('should display error state & propagate error if response message is too long', () => {
        const text = 'x'.repeat(5001)

        const {container} = render(
            <Provider store={mockStore()}>
                <QuickResponseResponseMessageContent
                    responseMessageContent={{
                        html: `<div>${text}</div>`,
                        text,
                        attachments: fromJS([]),
                    }}
                    onChange={jest.fn()}
                />
            </Provider>
        )

        expect(container.querySelector('.richField')).toHaveClass('hasError')
        expect(usePropagateError).toBeCalledWith(
            'response_message_content',
            true
        )
    })

    it('should trim empty spaces from the text content', () => {
        const onChangeMock = jest.fn()
        render(
            <Provider store={mockStore()}>
                <QuickResponseResponseMessageContent
                    responseMessageContent={{
                        html: `<div><strong>  Hello  </strong></div>`,
                        text: '',
                        attachments: fromJS([]),
                    }}
                    onChange={onChangeMock}
                />
            </Provider>
        )
        expect(onChangeMock).toHaveBeenCalledWith(
            expect.objectContaining({
                text: 'Hello',
            })
        )
    })
})
