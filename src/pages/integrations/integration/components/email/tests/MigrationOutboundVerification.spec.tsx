import {cleanup, fireEvent, render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import React from 'react'
import {mockStore} from 'utils/testing'
import MigrationOutboundVerification from '../EmailMigration/MigrationOutboundVerification'

describe('MigrationOutboundVerification', () => {
    const onBackClick = jest.fn()

    const renderComponent = () =>
        render(
            <Provider store={mockStore({} as any)}>
                <MigrationOutboundVerification onBackClick={onBackClick} />
            </Provider>
        )

    afterEach(cleanup)

    it('should call onBackClick when clicking Back button', () => {
        renderComponent()

        fireEvent.click(
            screen.getByRole('button', {
                name: /back/i,
            })
        )
        expect(onBackClick).toHaveBeenCalled()
    })
})
