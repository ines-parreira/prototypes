import { useFormContext, useWatch } from 'react-hook-form'

import {
    Button,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    SidePanel,
} from '@gorgias/axiom'

import { UpdatableJourneyCampaignState } from 'AIJourney/constants'
import { useJourneyUpdateHandler } from 'AIJourney/hooks'
import { buildScheduledDatetime } from 'AIJourney/pages/AiJourneyOnboarding/AiJourneyOnboarding'
import { ScheduleOrSend } from 'AIJourney/pages/ScheduleOrSend/ScheduleOrSend'
import type { SetupFormValues } from 'AIJourney/pages/Setup/Setup'
import { useJourneyContext } from 'AIJourney/providers'

const SCHEDULE_TYPE_LATER = 'later'

type Props = {
    isOpen: boolean
    onClose: () => void
}

export const ScheduleCampaignPanel = ({ isOpen, onClose }: Props) => {
    const { journeyData, currentIntegration } = useJourneyContext()
    const { control, getValues } = useFormContext<SetupFormValues>()

    const scheduleType = useWatch({ control, name: 'scheduleType' })
    const scheduledDate = useWatch({ control, name: 'scheduledDate' })
    const scheduledTime = useWatch({ control, name: 'scheduledTime' })

    const { handleUpdate, isLoading } = useJourneyUpdateHandler({
        integrationId: currentIntegration?.id,
        journeyId: journeyData?.id,
        entityLabel: 'campaign',
    })

    const handleSendCampaign = async () => {
        const scheduledDatetime = buildScheduledDatetime(getValues)
        if (scheduleType === SCHEDULE_TYPE_LATER) {
            await handleUpdate({
                campaignState: UpdatableJourneyCampaignState.Scheduled,
                scheduledDatetime,
            })
        } else {
            await handleUpdate({
                campaignState: UpdatableJourneyCampaignState.Active,
                scheduledDatetime: null,
            })
        }
        onClose()
    }

    const isMissingAudience =
        !journeyData?.included_audience_list_ids ||
        journeyData.included_audience_list_ids.length === 0
    const isMissingMessageGuidance = !journeyData?.message_instructions

    const isSendDisabled =
        isLoading ||
        (scheduleType === SCHEDULE_TYPE_LATER &&
            (!scheduledDate || !scheduledTime)) ||
        isMissingAudience ||
        isMissingMessageGuidance

    return (
        <SidePanel
            size="sm"
            isOpen={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose()
            }}
        >
            <OverlayHeader title="Schedule campaign" />
            <OverlayContent>
                <ScheduleOrSend isV3Architecture />
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Button
                    onClick={handleSendCampaign}
                    isDisabled={isSendDisabled}
                >
                    {scheduleType === SCHEDULE_TYPE_LATER
                        ? 'Schedule campaign'
                        : 'Send campaign'}
                </Button>
            </OverlayFooter>
        </SidePanel>
    )
}
