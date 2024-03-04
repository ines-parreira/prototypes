import React from 'react'
import {render, fireEvent, screen, waitFor} from '@testing-library/react'
import {fromJS} from 'immutable'

import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import MockAdapter from 'axios-mock-adapter'
import {RootState, StoreDispatch} from 'state/types'
import client from 'models/api/resources'
import ConvertInstallModal from '../ConvertInstallModal'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const chatIntegration = fromJS({
    type: 'gorgias_chat',
    id: '174',
})

jest.mock('models/api/resources')

const mockedServer = new MockAdapter(client)

describe('ConvertInstallModal', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    it('renders without crashing', () => {
        render(
            <Provider store={mockStore({})}>
                <ConvertInstallModal
                    isOpen={true}
                    integration={chatIntegration}
                    onSubmit={jest.fn()}
                    onClose={jest.fn()}
                />
            </Provider>
        )
        expect(
            screen.getByText('Install the campaign bundle')
        ).toBeInTheDocument()

        // renders radio buttons for installation methods
        const oneClickRadioButton = screen.getByText(
            '1-click installation for Shopify'
        )
        const manualRadioButton = screen.getByText('Manual install')
        expect(oneClickRadioButton).toBeInTheDocument()
        expect(manualRadioButton).toBeInTheDocument()
    })

    it('calls onClose when cancel button is clicked', () => {
        const onClose = jest.fn()
        render(
            <Provider store={mockStore({})}>
                <ConvertInstallModal
                    isOpen={true}
                    integration={chatIntegration}
                    onSubmit={jest.fn()}
                    onClose={onClose}
                />
            </Provider>
        )
        const cancelButton = screen.getByText('Cancel')
        fireEvent.click(cancelButton)
        expect(onClose).toHaveBeenCalled()
    })

    it('calls API when button is clicked', async () => {
        mockedServer
            .onPost('/api/revenue-addon-bundle/manual-install/')
            .reply(200, {})

        const onSubmit = jest.fn()

        render(
            <Provider store={mockStore({})}>
                <ConvertInstallModal
                    isOpen={true}
                    integration={chatIntegration}
                    onSubmit={onSubmit}
                    onClose={jest.fn()}
                />
            </Provider>
        )

        const installButton = screen.getByText('Next')
        fireEvent.click(installButton)

        await waitFor(() => {
            expect(mockedServer.history['post'].length).toBe(1)
            expect(screen.getByText('Finish Setup')).toBeInTheDocument()
        })

        const finishButton = screen.getByText('Finish Setup')
        fireEvent.click(finishButton)

        expect(onSubmit).toHaveBeenCalled()
    })
})
