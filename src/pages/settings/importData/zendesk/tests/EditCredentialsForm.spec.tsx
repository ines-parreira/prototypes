import {cleanup, fireEvent, render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'

import {
    ZendeskIntegration,
    ZendeskIntegrationMeta,
} from 'models/integration/types'
import {mockStore} from 'utils/testing'

import EditCredentialsForm from '../EditCredentialsForm'
import {ImportStatus} from '../types'

const mockUpdateOrCreateIntegration = jest.fn()

jest.mock('state/integrations/actions', () => ({
    updateOrCreateIntegration: () => mockUpdateOrCreateIntegration,
}))

describe('EditCredentialsForm', () => {
    const renderComponent = (integrationStatus: ImportStatus) =>
        render(
            <Provider
                store={mockStore({
                    integrations: fromJS({}),
                } as any)}
            >
                <EditCredentialsForm
                    integration={
                        {
                            id: 1,
                            name: 'gorgias',
                            meta: {
                                status: integrationStatus,
                            } as ZendeskIntegrationMeta,
                        } as ZendeskIntegration
                    }
                />
            </Provider>
        )

    afterEach(() => {
        cleanup()
        jest.resetAllMocks()
    })

    it('should be able to restart import when status is "failure"', () => {
        renderComponent(ImportStatus.Failure)

        fireEvent.click(screen.getByText(/restart import/i))

        expect(mockUpdateOrCreateIntegration).toHaveBeenCalled()
    })

    it('should not display "restart import" button when status is "pending"', () => {
        renderComponent(ImportStatus.Pending)

        expect(screen.queryByText(/restart import/i)).toBeFalsy()
    })

    it('should not display "restart import" button when status is "success"', () => {
        renderComponent(ImportStatus.Success)

        expect(screen.queryByText(/restart import/i)).toBeFalsy()
    })

    it('should not update integration if only one of the inputs is filled - email', () => {
        renderComponent(ImportStatus.Failure)

        const input = screen.getByRole('textbox', {
            name: /login email/i,
        })
        fireEvent.change(input, {
            target: {
                value: 'abc',
            },
        })
        fireEvent.click(screen.getByText(/restart import/i))

        expect(mockUpdateOrCreateIntegration).not.toHaveBeenCalled()
    })

    it('should not update integration if only one of the inputs is filled - API key', () => {
        renderComponent(ImportStatus.Failure)

        const input = screen.getByRole('textbox', {
            name: /api key info_outline/i,
        })
        fireEvent.change(input, {
            target: {
                value: 'abc',
            },
        })
        fireEvent.click(screen.getByText(/restart import/i))

        expect(mockUpdateOrCreateIntegration).not.toHaveBeenCalled()
    })
})
