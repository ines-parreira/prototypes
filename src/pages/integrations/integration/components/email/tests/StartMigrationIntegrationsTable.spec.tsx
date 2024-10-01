import {
    cleanup,
    fireEvent,
    render,
    screen,
    within,
} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import {mockStore} from 'utils/testing'
import {IntegrationType} from 'models/integration/constants'
import * as actions from 'state/integrations/actions'
import StartMigrationIntegrationsTable from '../EmailMigration/StartMigrationIntegrationsTable'

jest.spyOn(actions, 'deleteIntegration')

const integrations = [
    {
        id: 1,
        type: IntegrationType.Email,
        meta: {
            address: 'test1@gorgias.com',
        },
    },
    {
        id: 2,
        type: IntegrationType.Email,
        meta: {
            address: 'test2@emails.gorgias.com',
        },
    },
    {
        id: 3,
        type: IntegrationType.Email,
        meta: {
            address: 'test3@gorgias.com',
        },
    },
]

describe('StartMigrationIntegrationsTable', () => {
    const renderComponent = (integrations: any = []) =>
        render(
            <Provider store={mockStore({} as any)}>
                <StartMigrationIntegrationsTable integrations={integrations} />
            </Provider>
        )

    afterEach(cleanup)

    it('should display all integrations except the base email one', () => {
        renderComponent(integrations)
        expect(screen.getByText('test1@gorgias.com')).toBeVisible()
        expect(screen.getByText('test3@gorgias.com')).toBeVisible()
        expect(screen.queryByText('test2@gorgias.com')).toBeNull()
    })

    it('should call delete integration', () => {
        renderComponent(integrations)
        const deleteButton = screen.getAllByTestId('delete-button')[0]
        fireEvent.click(deleteButton)
        const tooltip = screen.getByRole('tooltip')

        fireEvent.click(
            within(tooltip).getByRole('button', {
                name: /delete integration/i,
            })
        )
        expect(actions.deleteIntegration).toHaveBeenCalledWith(
            fromJS(integrations[0])
        )
    })

    it('should display empty state row', () => {
        renderComponent([])
        expect(
            screen.getByText(
                'All set! You have no email integrations to be migrated.'
            )
        ).toBeVisible()
    })
})
