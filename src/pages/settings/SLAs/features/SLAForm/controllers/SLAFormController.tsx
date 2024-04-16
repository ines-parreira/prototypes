import React from 'react'
import {useParams} from 'react-router-dom'

import SLAFormView from '../views/SLAFormView'

export default function SLAFormController() {
    const params = useParams<{policyId?: string}>()
    const isNewPolicy = params.policyId === 'new'

    return (
        <>
            <SLAFormView isNew={isNewPolicy} />
        </>
    )
}
