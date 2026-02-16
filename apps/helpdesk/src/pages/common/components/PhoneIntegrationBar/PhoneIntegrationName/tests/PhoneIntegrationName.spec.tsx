import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import type { MockStoreEnhanced } from 'redux-mock-store'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { RootState, StoreDispatch } from '../../../../../../state/types'
import PhoneIntegrationName from '../PhoneIntegrationName'

jest.mock('@repo/feature-flags')

const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

describe('<PhoneIntegrationName/>', () => {
    let store: MockStoreEnhanced
    const integrationId = 1
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])

    beforeEach(() => {
        jest.resetAllMocks()
        mockUseFlag.mockReturnValue(true)

        store = mockStore({
            integrations: fromJS({
                integrations: [
                    {
                        id: integrationId,
                        name: 'My Phone Integration',
                        meta: { emoji: '❤️' },
                    },
                ],
            }),
        })
    })

    it('should render', () => {
        render(
            <Provider store={store}>
                <PhoneIntegrationName integrationId={integrationId} />
            </Provider>,
        )

        expect(screen.getByText(/My Phone Integration/)).toBeInTheDocument()
    })

    it('should render as span with restyling FF OFF', () => {
        mockUseFlag.mockImplementation((flagKey) => {
            if (flagKey === FeatureFlagKey.CallBarRestyling) {
                return false
            }
            return false
        })

        const { container } = render(
            <Provider store={store}>
                <PhoneIntegrationName integrationId={integrationId} />
            </Provider>,
        )

        const element = container.querySelector('[data-name="tag"]')
        expect(element).not.toBeInTheDocument()
    })

    it('should render with primary true', () => {
        const { container } = render(
            <Provider store={store}>
                <PhoneIntegrationName integrationId={integrationId} primary />
            </Provider>,
        )

        expect(
            container.querySelector('[data-color="green"]'),
        ).toBeInTheDocument()
    })
})
