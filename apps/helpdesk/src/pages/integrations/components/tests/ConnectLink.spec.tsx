import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { renderWithRouter } from 'utils/testing'

import ConnectLink from '../ConnectLink'

const mockStore = configureMockStore([thunk])
const store = mockStore({ currentAccount: fromJS({ domain: '20-1 rpz' }) })

global.Math.random = jest.fn(() => 0.123456789)

const connectLinkProps = {
    connectUrl: 'https://iamconnecting.com',
    integrationTitle: 'Integration',
}

describe(`ConnectLink`, () => {
    const contentText = 'click'
    const content = <span>{contentText}</span>
    it('should add a domain query param to connectUrl if an App', () => {
        const { container } = renderWithRouter(
            <Provider store={store}>
                <ConnectLink {...connectLinkProps} isApp>
                    {content}
                </ConnectLink>
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render an internal link if not an app or not external', () => {
        const { container } = renderWithRouter(
            <Provider store={store}>
                <ConnectLink {...connectLinkProps}>{content}</ConnectLink>
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a span with a tooltip if disabled', () => {
        const { container } = renderWithRouter(
            <Provider store={store}>
                <ConnectLink
                    {...connectLinkProps}
                    isDisabled
                    disabledMessage="20-1 Rpz"
                >
                    {content}
                </ConnectLink>
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
