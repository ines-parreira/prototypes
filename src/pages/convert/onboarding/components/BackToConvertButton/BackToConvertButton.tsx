import {Link} from 'react-router-dom'
import React, {useMemo} from 'react'
import {
    BACK_TO_CONVERT_HOME,
    useBackToConvert,
} from 'pages/convert/onboarding/hooks/useBackToConvert'
import {useIsConvertOnboardingUiEnabled} from 'pages/convert/common/hooks/useIsConvertOnboardingUiEnabled'
import css from './BackToConvertButton.less'

type Props = {
    integrationId?: number
}

const BackToConvertButton = ({integrationId}: Props) => {
    const {backIntegrationId, removeBackIntegrationId} = useBackToConvert()

    const isConvertOnboardingUiEnabled = useIsConvertOnboardingUiEnabled()

    const backUrl = useMemo(() => {
        if (backIntegrationId === BACK_TO_CONVERT_HOME) {
            if (!!integrationId) {
                return `/app/convert/${integrationId}/setup`
            }
            return '/app/convert/setup'
        }

        return `/app/convert/${backIntegrationId}/setup`
    }, [backIntegrationId, integrationId])

    if (!backIntegrationId || !isConvertOnboardingUiEnabled) return null

    return (
        <Link
            to={backUrl}
            onClick={removeBackIntegrationId}
            className={css.button}
        >
            <i className="material-icons">arrow_back</i>
            Back To Convert
        </Link>
    )
}

export default BackToConvertButton
