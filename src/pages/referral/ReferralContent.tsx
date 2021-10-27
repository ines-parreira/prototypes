import React from 'react'
import {Container} from 'reactstrap'

import PageHeader from '../common/components/PageHeader'

export const ReferralContent = () => {
    return (
        <div className="full-width">
            <PageHeader title="Referral program" />
            <Container fluid id="candu-referral" />
        </div>
    )
}

export default ReferralContent
