type SetAttachmentDataCallback = (
    state: TransitoryAttachmentData,
) => TransitoryAttachmentData

export type StepProps = {
    setNextButtonActive: (state: boolean) => void
    attachmentData: TransitoryAttachmentData
    setAttachmentData: (
        data: TransitoryAttachmentData | SetAttachmentDataCallback,
    ) => void | TransitoryAttachmentData
}

export type TransitoryAttachmentSubscriber = {
    enabled: boolean
    isEmailSubscriber: boolean
    isSmsSubscriber: boolean
    tags: string[]
}

export type TransitoryAttachmentForm = {
    label: string
    cta: string
}

export type TransitoryAttachmentData = {
    subscriberTypes: {
        shopify: TransitoryAttachmentSubscriber
    }
    forms: {
        email: TransitoryAttachmentForm
    }
    postSubmissionMessage: {
        enabled: boolean
        message: string
    }
}
