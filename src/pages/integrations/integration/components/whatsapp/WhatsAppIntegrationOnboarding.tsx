import React from 'react'

import { Container } from 'reactstrap'

import Loader from 'pages/common/components/Loader/Loader'
import css from 'pages/settings/settings.less'

export default function WhatsAppIntegrationOnboarding(): JSX.Element | null {
    return (
        <Container fluid className={css.pageContainer}>
            <>
                <h3 className="mb-1">Connecting WhatsApp</h3>
                <p>Creating your WhatsApp integration(s)...</p>
                <Loader />
            </>
        </Container>
    )
}
