import React from 'react'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {fromJS} from 'immutable'

import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {RootState, StoreDispatch} from 'state/types'
import {assumeMock} from 'utils/testing'
import {useGetConvertBundle} from 'pages/convert/bundles/hooks/useGetConvertBundle'
import {
    convertBundle,
    installBundleMockImplementation,
} from 'fixtures/convertBundle'
import {useInstallBundle} from 'pages/convert/bundles/hooks/useInstallBundle'
import ConvertInstallModal from '../ConvertInstallModal'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const chatIntegration = fromJS({
    type: 'gorgias_chat',
    id: '174',
})

jest.mock('models/api/resources')

jest.mock('pages/convert/bundles/hooks/useGetConvertBundle')
const useGetConvertBundleMock = assumeMock(useGetConvertBundle)

jest.mock('pages/convert/bundles/hooks/useInstallBundle')
const useInstallBundleMock = assumeMock(useInstallBundle)

describe('ConvertInstallModal', () => {
    beforeEach(() => {
        useGetConvertBundleMock.mockReturnValue({
            bundle: convertBundle,
            isLoading: false,
        })

        useInstallBundleMock.mockImplementation(installBundleMockImplementation)
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

    it('goes to the next step when button is clicked', async () => {
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
            expect(screen.getByText('Finish Setup')).toBeInTheDocument()
        })

        const finishButton = screen.getByText('Finish Setup')
        fireEvent.click(finishButton)

        expect(onSubmit).toHaveBeenCalled()
    })
})
