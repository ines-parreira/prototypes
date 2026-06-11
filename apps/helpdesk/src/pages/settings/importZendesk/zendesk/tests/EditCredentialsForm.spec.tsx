import React from 'react'

import { render } from '@repo/testing'
import { cleanup, fireEvent, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import type {
    ZendeskIntegration,
    ZendeskIntegrationMeta,
} from 'models/integration/types'

import { EditCredentialsForm } from '../EditCredentialsForm'
import { ImportStatus } from '../types'

const mockUpdateOrCreateIntegration = jest.fn()

jest.mock('state/integrations/actions', () => ({
    updateOrCreateIntegration: () => mockUpdateOrCreateIntegration,
}))

describe('EditCredentialsForm', () => {
    const renderComponent = (integrationStatus: ImportStatus) =>
        render(
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
            />,
            {
                storeState: {
                    integrations: fromJS({}),
                } as any,
            },
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
