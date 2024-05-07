import React, {memo, useMemo, useState, useEffect} from 'react'
import classnames from 'classnames'
import {List} from 'immutable'

import {EditorState} from 'draft-js'

import {
    AttachmentType,
    ProductAttachment,
    UploadType,
    attachmentIsDiscountOffer,
    attachmentIsProduct,
} from 'common/types'
import {User} from 'config/types/user'
import {AgentLabel} from 'pages/common/utils/labels'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import TicketRichField from 'pages/common/forms/RichField/TicketRichField'
import {useCampaignFormContext} from 'pages/convert/campaigns/hooks/useCampaignFormContext'
import {CampaignStepsKeys} from 'pages/convert/campaigns/types/CampaignSteps'
import ConvertInfoBanner from 'pages/convert/campaigns/components/ConvertInfoBanner'

import {useIntegrationContext} from 'pages/convert/campaigns/containers/IntegrationProvider'
import {ActionName} from 'pages/common/draftjs/plugins/toolbar/types'
import {checkShopifyProductAvailabity} from 'pages/convert/campaigns/utils/checkProductAvailability'
import TicketAttachments from 'pages/tickets/detail/components/ReplyArea/TicketAttachments'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

import {Option, Value} from 'pages/common/forms/SelectField/types'

import RichField from 'pages/common/forms/RichField/RichField'
import {useIsConvertUniqueDiscountCodesEnabled} from 'pages/convert/common/hooks/useIsConvertUniqueDiscountCodesEnabled'
import useAppSelector from 'hooks/useAppSelector'
import {getNewMessageAttachments} from 'state/newMessage/selectors'
import {useIsAllowedToAddDiscountCode} from '../../hooks/useIsAllowedToAddDiscountCode'

import css from './CampaignMessage.less'

type Props = {
    richAreaRef: (ref: RichField | null) => void
    agents: User[]
    attachments: List<any>
    html: string
    isConvertSubscriber?: boolean
    text: string
    selectedAgent: string
    showContentWarning?: boolean
    onSelectAgent: (agent: Value) => void
    onChangeMessage: (value: EditorState) => void
    onDeleteAttachment: (index: number) => void
}

export const CampaignMessage = memo(
    ({
        richAreaRef,
        agents,
        attachments,
        html,
        isConvertSubscriber = false,
        text,
        selectedAgent,
        showContentWarning,
        onSelectAgent,
        onChangeMessage,
        onDeleteAttachment,
    }: Props): JSX.Element => {
        const {shopifyIntegration} = useIntegrationContext()
        const isAllowedToAddDiscountCode = useIsAllowedToAddDiscountCode()
        const {getStepConfiguration, getTourConfiguration} =
            useCampaignFormContext()
        const stepConfiguration = useMemo(() => {
            return getStepConfiguration(CampaignStepsKeys.Message)
        }, [getStepConfiguration])
        const tourConfiguration = useMemo(() => {
            return getTourConfiguration()
        }, [getTourConfiguration])

        const isConvertUniqueDiscountCodesEnabled =
            useIsConvertUniqueDiscountCodesEnabled()

        const messageAttachments = useAppSelector(getNewMessageAttachments)

        const [previousFirstProductId, setPreviousFirstProductId] = useState<
            number | null
        >(null)
        const [showWarningOutOfStock, setshowWarningOutOfStock] =
            useState<boolean>(false)
        const options = useMemo<Option[]>(() => {
            const initialArr: Option[] = [
                {
                    value: '',
                    text: 'randomagent',
                    label: (
                        <AgentLabel
                            name={'Random agent'}
                            maxWidth="100"
                            shouldDisplayAvatar
                        />
                    ),
                },
            ]

            return agents.reduce((acc, agent) => {
                const props: Record<string, string> = {
                    name: agent.name,
                }

                if (agent.meta?.profile_picture_url) {
                    props['profilePictureUrl'] = agent.meta
                        .profile_picture_url as unknown as string
                }

                return [
                    ...acc,
                    {
                        label: <AgentLabel {...props} shouldDisplayAvatar />,
                        value: agent.email,
                        text: agent.name,
                    },
                ]
            }, initialArr)
        }, [agents])

        const value = useMemo(
            () => ({
                html,
                text,
            }),
            [html, text]
        )

        // Discount offer can be attached if it is convert subscriber and there is no other offer attached
        const anyDiscountOfferAttached = (
            messageAttachments.toJS() as AttachmentType[]
        ).find((att) => attachmentIsDiscountOffer(att))

        const supportsUniqueDiscountOffer =
            isConvertUniqueDiscountCodesEnabled && isConvertSubscriber
        const canAddUniqueDiscountOffer = !anyDiscountOfferAttached

        useEffect(() => {
            if (attachments.isEmpty() && showWarningOutOfStock) {
                // if no products and warning is visible, hide it
                setshowWarningOutOfStock(false)
                setPreviousFirstProductId(null)
                return
            }
            if (attachments.isEmpty()) return

            const attachmentsJS: AttachmentType[] = attachments.toJS()
            const anyAttachmentIsProduct = attachmentsJS.some((att) =>
                attachmentIsProduct(att)
            )
            if (!anyAttachmentIsProduct) {
                if (showWarningOutOfStock) {
                    setshowWarningOutOfStock(false)
                    setPreviousFirstProductId(null)
                }
                return
            }

            const product = attachmentsJS.find((att) =>
                attachmentIsProduct(att)
            ) as ProductAttachment | undefined

            const productId = product?.extra?.product_id

            if (!productId) return
            // trigger request to API only if first product change
            if (previousFirstProductId === productId) {
                return
            }

            setPreviousFirstProductId(productId)

            if (shopifyIntegration?.id && productId) {
                checkShopifyProductAvailabity(shopifyIntegration.id, productId)
                    .then((isAvailable) =>
                        setshowWarningOutOfStock(!isAvailable)
                    )
                    .catch(console.error)
            }
        }, [
            setshowWarningOutOfStock,
            setPreviousFirstProductId,
            previousFirstProductId,
            showWarningOutOfStock,
            attachments,
            shopifyIntegration?.id,
        ])

        const displayedActions = useMemo(() => {
            const actions = [
                ActionName.Bold,
                ActionName.Italic,
                ActionName.Underline,
                ActionName.Link,
                ActionName.Image,
                ActionName.Emoji,
            ]

            if (isAllowedToAddDiscountCode) {
                actions.push(ActionName.DiscountCodePicker)
            }

            if (attachments.size < 5) {
                actions.push(ActionName.ProductPicker)
            }

            actions.push(ActionName.Video)

            return actions
        }, [attachments, isAllowedToAddDiscountCode])

        return (
            <div>
                <div
                    data-testid="campaign-agent-section"
                    className={classnames('mb-2', css.authorWrapper)}
                >
                    <span>From: </span>
                    <SelectField
                        className={css.authorInput}
                        value={selectedAgent}
                        options={options}
                        onChange={onSelectAgent}
                    />
                </div>

                {isConvertSubscriber && showContentWarning && (
                    <div className="mb-4 mt-4">
                        <Alert icon type={AlertType.Warning}>
                            Your campaign might be too large for mobile devices
                            or small screens. We advise limiting the content to
                            maximum 170 characters and maximum 5 lines of text.
                        </Alert>
                    </div>
                )}
                {isConvertSubscriber && showWarningOutOfStock && (
                    <div className="mb-4 mt-4">
                        <Alert icon type={AlertType.Warning}>
                            Your campaign is currently not displayed because
                            there is no product stock for your first product
                            card. Remove the first product card to see have your
                            campaign displayed.
                        </Alert>
                    </div>
                )}

                {stepConfiguration && stepConfiguration.banner && (
                    <div
                        className="mb-2 mt-4"
                        data-testid="campaign-message-step-info-banner"
                    >
                        <ConvertInfoBanner
                            type={stepConfiguration.banner.type}
                            text={stepConfiguration.banner.content}
                        />
                    </div>
                )}

                <div className={css.textEditorWrapper}>
                    <TicketRichField
                        ref={(ref) => richAreaRef(ref)}
                        value={value}
                        attachments={attachments}
                        allowExternalChanges
                        toolbarTour={tourConfiguration}
                        disableOutOfStockProducts={true}
                        disableProductCards={!isConvertSubscriber}
                        disableVariantSelection={isConvertSubscriber}
                        onChange={onChangeMessage}
                        placeholder={'Write your message'}
                        displayedActions={displayedActions}
                        isRequired
                        countCharacters={isConvertSubscriber}
                        uploadType={UploadType.PublicAttachment}
                        supportsUniqueDiscountOffer={
                            supportsUniqueDiscountOffer
                        }
                        canAddUniqueDiscountOffer={canAddUniqueDiscountOffer}
                        currentShopifyIntegration={shopifyIntegration}
                    />
                    <TicketAttachments
                        context="campaign-message"
                        removable
                        attachments={attachments}
                        className="d-flex flex-wrap"
                        deleteAttachment={onDeleteAttachment}
                    />
                </div>
            </div>
        )
    }
)
