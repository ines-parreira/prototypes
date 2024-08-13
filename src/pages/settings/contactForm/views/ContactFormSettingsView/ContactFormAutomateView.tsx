import React from 'react'
import {ConnectedChannelsContactFormView} from 'pages/automate/connectedChannels/components/ConnectedChannelsContactFormView'
import {useCurrentContactForm} from '../../hooks/useCurrentContactForm'

export const ContactFormAutomateView = () => {
    const contactForm = useCurrentContactForm()

    return (
        <ConnectedChannelsContactFormView
            contactForm={contactForm}
            hideDropdown
        />
    )
}
