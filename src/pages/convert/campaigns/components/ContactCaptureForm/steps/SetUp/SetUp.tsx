import React, {useEffect, useMemo, useState} from 'react'
import {UncontrolledTooltip} from 'reactstrap'
import classnames from 'classnames'
import {Link} from 'react-router-dom'
import {
    StepProps,
    TransitoryAttachmentData,
    TransitoryAttachmentSubscriber,
} from 'pages/convert/campaigns/components/ContactCaptureForm/types'
import {getIconFromType} from 'state/integrations/helpers'
import {IntegrationType} from 'models/integration/constants'
import {ShopifyCustomerTagsInput} from 'pages/convert/campaigns/components/ContactCaptureForm/ShopifyCustomerTagsInput'
import {ErrorMessage} from 'pages/convert/campaigns/components/ContactCaptureForm/styled'
import {useIntegrationContext} from 'pages/convert/campaigns/containers/IntegrationProvider'
import css from './SetUp.less'

export const SetUp = (props: StepProps) => {
    const tagsLimit = 5
    const {attachmentData, setAttachmentData, setNextButtonActive} = props

    const {chatIntegration} = useIntegrationContext()

    const [shopifyTarget, setShopifyTarget] =
        useState<TransitoryAttachmentSubscriber>({
            ...attachmentData.subscriberTypes.shopify,
            tags:
                attachmentData.subscriberTypes.shopify.tags.length > 0
                    ? attachmentData.subscriberTypes.shopify.tags
                    : ['source: Gorgias Convert'],
        })

    const [onError, errorMessage] = useMemo(() => {
        if (shopifyTarget.tags.length > tagsLimit) {
            return [true, `You are allowed up to ${tagsLimit} tags.`]
        }
        return [false, '']
    }, [shopifyTarget.tags])

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
        const atListOneSubscriberType =
            shopifyTarget.isEmailSubscriber || shopifyTarget.isSmsSubscriber
        setAttachmentData((state: TransitoryAttachmentData) => {
            return {
                ...state,
                subscriberTypes: {
                    ...state.subscriberTypes,
                    shopify: shopifyTarget,
                },
            } as TransitoryAttachmentData
        })
        setNextButtonActive(atListOneSubscriberType && !onError)
    }, [setAttachmentData, setNextButtonActive, shopifyTarget, onError])

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
                        To collect Email marketing consent, you must set up
                        terms of service and a privacy policy in line with your
                        region’s regulations. Manage your privacy policy
                        disclaimer in{' '}
                        <Link
                            to={`/app/convert/${chatIntegration?.id}/settings`}
                            target="_blank"
                        >
                            Settings
                        </Link>
                        .
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
                            className={classnames({
                                [css.fieldOnError]: onError,
                            })}
                        />
                        {onError && <ErrorMessage>{errorMessage}</ErrorMessage>}
                    </div>
                </div>
            </div>
        </>
    )
}
