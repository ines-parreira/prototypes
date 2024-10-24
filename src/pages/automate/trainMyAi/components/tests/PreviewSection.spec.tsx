import {QueryClientProvider} from '@tanstack/react-query'
import {screen, render} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {getSingleHelpCenterResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {RootState, StoreDispatch} from 'state/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import PreviewSection from '../PreviewSection'

const queryClient = mockQueryClient()

const mockStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>([
    thunk,
])

describe('<PreviewSection />', () => {
    const initialState: DeepPartial<RootState> = {
        ui: {
            helpCenter: {
                currentId: 1,
                currentLanguage: 'en-US',
            },
        },
    }
    it('should render component', () => {
        render(
            <Provider store={mockStore(initialState)}>
                <QueryClientProvider client={queryClient}>
                    <PreviewSection
                        helpCenter={getSingleHelpCenterResponseFixture}
                        onConfirmFeedback={jest.fn()}
                        page={1}
                        recommendations={{
                            accountId: 1,
                            articleId: 1,
                            articleIdFeedback: 1,
                            conversationId: '1',
                            createdDatetime: '',
                            helpCenterId: 1,
                            id: 1,
                            isHelpful: true,
                            locale: 'en-US',
                            message: 'message',
                            updatedDatetime: '',
                        }}
                    />
                </QueryClientProvider>
            </Provider>
        )

        expect(
            screen.getByText(/which article should have been sent/i)
        ).toBeInTheDocument()
    })
})
