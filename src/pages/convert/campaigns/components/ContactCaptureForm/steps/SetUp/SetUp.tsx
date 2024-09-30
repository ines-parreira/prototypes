import React, {useEffect, useState} from 'react'
import {UncontrolledTooltip} from 'reactstrap'
import {
    StepProps,
    TransitoryAttachmentData,
    TransitoryAttachmentSubscriber,
} from 'pages/convert/campaigns/components/ContactCaptureForm/types'
import {getIconFromType} from 'state/integrations/helpers'
import {IntegrationType} from 'models/integration/constants'
import {ShopifyCustomerTagsInput} from 'pages/convert/campaigns/components/ContactCaptureForm/ShopifyCustomerTagsInput'
import css from './SetUp.less'

export const SetUp = (props: StepProps) => {
    const {attachmentData, setAttachmentData, setNextButtonActive} = props

    const [shopifyTarget, setShopifyTarget] =
        useState<TransitoryAttachmentSubscriber>({
            ...attachmentData.subscriberTypes.shopify,
            tags:
                attachmentData.subscriberTypes.shopify.tags.length > 0
                    ? attachmentData.subscriberTypes.shopify.tags
                    : ['source: Gorgias Convert'],
        })

    const handleTagsChanged = (
        tags: {
            label: string
            value: string
        }[]
    ) => {
        setShopifyTarget((state) => {
            return {
                ...state,
                tags: Array.from(new Set(tags.map((tag) => tag.value))),
            }
        })
    }

    useEffect(() => {
        setAttachmentData((state: TransitoryAttachmentData) => {
            return {
                ...state,
                subscriberTypes: {
                    ...state.subscriberTypes,
                    shopify: shopifyTarget,
                },
            } as TransitoryAttachmentData
        })
        setNextButtonActive(
            shopifyTarget.isEmailSubscriber || shopifyTarget.isSmsSubscriber
        )
    }, [setAttachmentData, setNextButtonActive, shopifyTarget])

    return (
        <>
            <span className={css.title}>
                The collected data will be sent to
            </span>
            <div className={css.cardContainer}>
                <div>
                    <img
                        className={css.shopifyLogo}
                        alt="Shopify logo"
                        src={getIconFromType(IntegrationType.Shopify)}
                    />
                </div>
                <div className={css.contentColumn}>
                    <span className={css.title}>Shopify</span>
                    <span className={css.subText}>
                        To collect Email and SMS marketing consent, you need to
                        set up a terms of service and privacy policy according
                        to your regions’ regulations. You will be able to so in
                        the next step.
                    </span>
                    <div className={css.tagsContainer}>
                        <span className={css.text}>
                            Automatically add tags to new profiles&nbsp;
                            <span className={css.infoIcon}>
                                <i id="info-icon" className="material-icons">
                                    info_outline
                                </i>
                                <UncontrolledTooltip target="info-icon">
                                    If you wish, the new tags will be
                                    automatically pulled from the Shopify store
                                    linked to your Convert instance
                                </UncontrolledTooltip>
                            </span>
                        </span>
                        <ShopifyCustomerTagsInput
                            value={shopifyTarget.tags.map((tag) => ({
                                label: tag,
                                value: tag,
                            }))}
                            onChange={handleTagsChanged}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}
