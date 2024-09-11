import React from 'react'
import {EmailIntegration} from 'models/integration/types'
import {useEmailOnboarding} from './hooks/useEmailOnboarding'

type Props = {
    integration?: EmailIntegration | undefined
}

export default function EmailIntegrationOnboarding({integration}: Props) {
    const {currentStep} = useEmailOnboarding({integration})
    return <>{currentStep}</>
}
