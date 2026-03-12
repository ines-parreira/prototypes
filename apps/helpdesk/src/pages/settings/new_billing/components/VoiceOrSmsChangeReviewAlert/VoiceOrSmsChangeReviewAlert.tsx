import type React from 'react'
import { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { ProductType } from 'models/billing/types'
import Alert from 'pages/common/components/Alert/Alert'
import {
    getIsVettedForPhone,
    getVoiceOrSmsPlanChanged,
} from 'state/billing/selectors'

import type { SelectedPlans } from '../../types'

import css from './VoiceOrSmsChangeReviewAlert.less'

interface VoiceOrSmsChangeReviewAlertProps {
    selectedPlans: SelectedPlans
}

const VoiceOrSmsChangeReviewAlert: React.FC<
    VoiceOrSmsChangeReviewAlertProps
> = ({ selectedPlans }) => {
    const isVettedForPhone = useAppSelector(getIsVettedForPhone)

    const voiceOrSMSChanged = useAppSelector(
        getVoiceOrSmsPlanChanged({
            selectedVoicePlan: selectedPlans[ProductType.Voice].plan,
            selectedSmsPlan: selectedPlans[ProductType.SMS].plan,
        }),
    )
    const voiceOrSMSText = useMemo(() => {
        if (
            selectedPlans[ProductType.Voice].isSelected &&
            selectedPlans[ProductType.SMS].isSelected
        ) {
            return 'Voice & SMS'
        } else if (selectedPlans[ProductType.SMS].isSelected) {
            return 'SMS'
        }
        return 'Voice'
    }, [selectedPlans])

    if (voiceOrSMSChanged && !isVettedForPhone) {
        return (
            <Alert className={css.alert} icon>
                Your {voiceOrSMSText} subscription will have to be reviewed by
                our team before you can start using it
            </Alert>
        )
    }

    return null
}

export default VoiceOrSmsChangeReviewAlert
