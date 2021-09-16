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

        it('should render when IVR function is selected', () => {
            const {container, getByText} = render(
                <PhoneIntegrationCreate actions={{updateOrCreateIntegration}} />
            )

            // Select function "IVR"
            fireEvent.click(getByText('Interactive Voice Response (IVR)'))

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render when a country and a state are selected', () => {
            const {container, getByText} = render(
                <PhoneIntegrationCreate actions={{updateOrCreateIntegration}} />
            )

            // Select country "United States"
            fireEvent.click(getByText('United States'))

            // Select type "Local"
            fireEvent.click(getByText('Local'))

            // Select state "Alabama"
            fireEvent.click(getByText('Alabama'))

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render when type "Toll-free" is selected', () => {
            const {container, getByText} = render(
                <PhoneIntegrationCreate actions={{updateOrCreateIntegration}} />
            )

            // Select country "Canada"
            fireEvent.click(getByText('Canada'))

            // Select type "Toll-free"
            fireEvent.click(getByText('Toll-free'))

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
