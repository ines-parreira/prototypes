import React from 'react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {render} from '@testing-library/react'

import {RootState, StoreDispatch} from 'state/types'

import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import {CampaignMessage} from '../CampaignMessage'

jest.mock('pages/common/forms/RichField/RichFieldEditor')

const mockStore = configureMockStore<RootState, StoreDispatch>()
const defaultState = {
    integrations: fromJS({integrations: []}),
} as RootState

describe('<CampaignMessage>', () => {
    beforeEach(() => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => false)
    })
    it('renders the warning if the content is too big and merchant is a revenue subscriber', () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <CampaignMessage
                    showContentWarning
                    isConvertSubscriber
                    richAreaRef={jest.fn()}
                    attachments={fromJS([])}
                    agents={[]}
                    html=""
                    text=""
                    selectedAgent=""
                    onSelectAgent={jest.fn()}
                    onChangeMessage={jest.fn()}
                    onDeleteAttachment={jest.fn()}
                />
            </Provider>
        )

        getByText(
            'Your campaign might be too large for mobile devices or small screens. We advise limiting the content to maximum 170 characters and maximum 5 lines of text.'
        )
    })

    it('does not render the warning if the content is too big and merchant is not a revenue subscriber', () => {
        const {queryByText} = render(
            <Provider store={mockStore(defaultState)}>
                <CampaignMessage
                    showContentWarning
                    isConvertSubscriber={false}
                    richAreaRef={jest.fn()}
                    attachments={fromJS([])}
                    agents={[]}
                    html=""
                    text=""
                    selectedAgent=""
                    onSelectAgent={jest.fn()}
                    onChangeMessage={jest.fn()}
                    onDeleteAttachment={jest.fn()}
                />
            </Provider>
        )

        expect(
            queryByText(
                'Your campaign might be too large for mobile devices or small screens. We advise limiting the content to maximum 170 characters and maximum 5 lines of text.'
            )
        ).toBeNull()
    })
})
