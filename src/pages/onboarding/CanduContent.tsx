import React from 'react'
import {Container} from 'reactstrap'

import PageHeader from '../common/components/PageHeader'

type Props = {
    title: string
    containerId: string
}

export const CanduContent = ({title, containerId}: Props) => {
    return (
        <div className="full-width">
            <PageHeader title={title} />
            <Container fluid id={containerId} />
        </div>
    )
}

export default CanduContent
