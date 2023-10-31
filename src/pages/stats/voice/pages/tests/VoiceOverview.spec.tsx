import React from 'react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {render, fireEvent} from '@testing-library/react'
import {
    VOICE_LEARN_MORE_URL,
    VOICE_OVERVIEW_PAGE_TITLE,
} from 'pages/stats/voice/constants/voiceOverview'
import {RootState, StoreDispatch} from 'state/types'
import {account} from 'fixtures/account'
import {AccountFeature} from 'state/currentAccount/types'
import {billingState} from 'fixtures/billing'
import VoiceOverview from '../VoiceOverview'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('VoiceOverview', () => {
    const renderVoiceOverview = (featureEnabled = true) => {
        const state: Partial<RootState> = {
            currentAccount: fromJS({
                current_subscription: account.current_subscription,
                features: fromJS({
                    [AccountFeature.PhoneNumber]: {
                        enabled: featureEnabled,
                    },
                }),
            }),
            billing: fromJS(billingState),
        }
        return render(
            <Provider store={mockStore(state)}>
                <VoiceOverview />
            </Provider>
        )
    }

    it('should render page title', () => {
        const {queryByText} = renderVoiceOverview()

        expect(queryByText(VOICE_OVERVIEW_PAGE_TITLE)).toBeInTheDocument()
        expect(queryByText('Voice add-on features')).toBeNull()
    })

    it('should render paywall page', async () => {
        const {findByText, getByText} = renderVoiceOverview(false)

        expect(await findByText(VOICE_OVERVIEW_PAGE_TITLE)).toBeInTheDocument()
        expect(await findByText('Voice add-on features')).toBeInTheDocument()
        expect(await findByText('Learn more')).toBeInTheDocument()
        fireEvent.click(getByText('Learn more'))
        expect(window.open).toHaveBeenCalledWith(
            VOICE_LEARN_MORE_URL,
            '_blank',
            'noopener noreferrer'
        )
    })
})
