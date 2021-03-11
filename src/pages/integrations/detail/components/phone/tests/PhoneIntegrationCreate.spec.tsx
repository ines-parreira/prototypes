import React from 'react'
import {fireEvent, render} from '@testing-library/react'

import PhoneIntegrationCreate from '../PhoneIntegrationCreate'

describe('<PhoneIntegrationCreate/>', () => {
    let updateOrCreateIntegration: jest.MockedFunction<any>

    beforeEach(() => {
        updateOrCreateIntegration = jest.fn()
    })

    describe('render()', () => {
        it('should render', () => {
            const {container} = render(
                <PhoneIntegrationCreate actions={{updateOrCreateIntegration}} />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render when a country and a state are selected', () => {
            const {container, getByText} = render(
                <PhoneIntegrationCreate actions={{updateOrCreateIntegration}} />
            )

            // Select country "Canada"
            fireEvent.click(getByText('Canada'))

            // Select state "Alberta"
            fireEvent.click(getByText('Alberta'))

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
