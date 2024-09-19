import React, {useEffect, useState} from 'react'
import {fromJS} from 'immutable'
import {UncontrolledTooltip} from 'reactstrap'
import {StepProps} from 'pages/convert/campaigns/components/ContactForm/types'
import {
    CampaignFormExtra,
    ContactFormSubscriberType,
} from 'pages/convert/campaigns/types/CampaignAttachment'
import {getIconFromType} from 'state/integrations/helpers'
import {IntegrationType} from 'models/integration/constants'
import TicketTags from 'pages/tickets/detail/components/TicketDetails/TicketTags'
import css from './SetUp.less'

export const SetUp = (props: StepProps) => {
    const {attachmentData, setAttachmentData, setNextButtonActive} = props

    const attachmentTargetToState = (type: string) => {
        const target = attachmentData.targets.filter(
            (target) => target.type === type
        )[0]
        return {
            type: target ? target.type : type,
            subscriber_types: {
                sms: target ? target.subscriber_types.includes('sms') : false,
                email: target
                    ? target.subscriber_types.includes('email')
                    : false,
            },
            tags: target ? target.tags : [],
        }
    }

    const [shopifyTarget, setShopifyTarget] = useState<{
        type: string
        subscriber_types: {
            sms: boolean
            email: boolean
        }
        tags: string[]
    }>(() => attachmentTargetToState('shopify'))

    const handleAddTag = (tag: string) => {
        setShopifyTarget((state) => ({
            ...state,
            tags: Array.from(new Set([...state.tags, tag])),
        }))
    }

    const handleDeleteTag = (tag: string) => {
        const tags = shopifyTarget.tags.filter((name) => name !== tag)
        setShopifyTarget((state) => ({
            ...state,
            tags,
        }))
    }

    useEffect(() => {
        const newSubscribers: ContactFormSubscriberType[] = []
        if (shopifyTarget.subscriber_types.email) newSubscribers.push('email')
        if (shopifyTarget.subscriber_types.sms) newSubscribers.push('sms')
        setAttachmentData((state: CampaignFormExtra) => {
            const targets = [
                {
                    type: 'shopify',
                    subscriber_types: newSubscribers,
                    tags: shopifyTarget.tags,
                },
            ]
            return {
                ...state,
                targets,
            } as CampaignFormExtra
        })
        setNextButtonActive(
            Object.values(shopifyTarget.subscriber_types).some((item) => !!item)
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
                        <TicketTags
                            ticketTags={fromJS(
                                shopifyTarget.tags.map((tag) => ({
                                    name: tag,
                                }))
                            )}
                            addTag={handleAddTag}
                            removeTag={handleDeleteTag}
                            transparent
                        />
                    </div>
                </div>
            </div>
        </>
    )
}
