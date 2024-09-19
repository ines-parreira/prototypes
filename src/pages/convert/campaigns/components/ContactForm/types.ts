import {CampaignFormExtra} from 'pages/convert/campaigns/types/CampaignAttachment'

type SetAttachmentDataCallback = (state: CampaignFormExtra) => CampaignFormExtra

export type StepProps = {
    setNextButtonActive: (state: boolean) => void
    attachmentData: CampaignFormExtra
    setAttachmentData: (
        data: CampaignFormExtra | SetAttachmentDataCallback
    ) => void | CampaignFormExtra
}
