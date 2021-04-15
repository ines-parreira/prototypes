import React from 'react'
import {Container} from 'reactstrap'

import PageHeader from '../common/components/PageHeader'

export const OnboardingContent = () => {
    return (
        <div className="full-width">
            <PageHeader title="Home" />
            <Container fluid id="candu-home" />
        </div>
    )
}

export default OnboardingContent
