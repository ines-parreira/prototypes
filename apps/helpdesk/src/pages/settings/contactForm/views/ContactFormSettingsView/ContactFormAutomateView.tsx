import { ConnectedChannelsContactFormView } from 'pages/automate/connectedChannels/legacy/components/ConnectedChannelsContactFormView'

import { useCurrentContactForm } from '../../hooks/useCurrentContactForm'

import css from './ContactFormAutomateView.less'

export const ContactFormAutomateView = () => {
    const contactForm = useCurrentContactForm()

    return (
        <div className={css.container}>
            <ConnectedChannelsContactFormView
                contactForm={contactForm}
                hideDropdown
            />
        </div>
    )
}
