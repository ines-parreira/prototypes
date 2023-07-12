import React from 'react'

export const testId = 'contact-form-auto-embed-installation-card'

const ContactFormAutoEmbedInstallationCard = () => {
    return (
        <div
            data-testid={testId}
            style={{
                marginTop: '2rem',
                backgroundColor: 'red',
                height: '10rem',
                padding: '16px',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1rem',
            }}
        >
            Feature Flag "contact-form-auto-embed" is Active! <br /> This will
            contain the new Contact From Auto Embed installation card
        </div>
    )
}

export default ContactFormAutoEmbedInstallationCard
