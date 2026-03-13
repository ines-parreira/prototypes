import React from 'react'

import { render } from '@testing-library/react'

import { ContactFormAutomateView } from '../ContactFormAutomateView'

jest.mock(
    'pages/automate/connectedChannels/legacy/components/ConnectedChannelsContactFormView',
    () => ({
        ConnectedChannelsContactFormView: ({
            contactForm,
        }: {
            contactForm: { id: string }
        }) => (
            <div data-testid="ConnectedChannelsContactFormView">
                {contactForm.id}
            </div>
        ),
    }),
)

jest.mock('pages/settings/contactForm/hooks/useCurrentContactForm', () => ({
    useCurrentContactForm: jest.fn(() => ({
        id: 1,
        name: 'contactForm',
        description: 'description',
    })),
}))

describe('ContactFormAutomateView', () => {
    it('should render', () => {
        render(<ContactFormAutomateView />)
    })

    it('should render ConnectedChannelsContactFormView', () => {
        const { getByTestId } = render(<ContactFormAutomateView />)
        expect(
            getByTestId('ConnectedChannelsContactFormView'),
        ).toHaveTextContent('1')
    })
})
