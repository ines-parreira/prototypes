import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {RootState, StoreDispatch} from 'state/types'

import VoiceIntegrationBasicLabel from './VoiceIntegrationBasicLabel'

describe('VoiceIntegrationBasicLabel', () => {
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([])

    const renderComponent = ({
        integrationId,
        phoneNumber,
    }: {
        integrationId: number
        phoneNumber?: string
    }) => {
        const store = mockStore({
            integrations: fromJS({
                integrations: [
                    {
                        id: 1,
                        name: 'Test',
                    },
                ],
            }),
        } as RootState)
        return render(
            <Provider store={store}>
                <VoiceIntegrationBasicLabel
                    integrationId={integrationId}
                    phoneNumber={phoneNumber}
                />
            </Provider>
        )
    }

    it('should render integration name', () => {
        const {getByText} = renderComponent({integrationId: 1})

        expect(getByText('Test')).toBeInTheDocument()
    })

    it('should render phone number for unknown integration', () => {
        const testData = {integrationId: 2, phoneNumber: '+1234567890'}
        const {getByText} = renderComponent(testData)

        expect(getByText(testData.phoneNumber)).toBeInTheDocument()
    })

    it('should render unknown integration', () => {
        const testData = {integrationId: 2, phoneNumber: ''}
        const {getByText} = renderComponent(testData)

        expect(getByText('Unknown integration')).toBeInTheDocument()
    })
})
