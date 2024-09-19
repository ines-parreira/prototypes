import React, {memo, useEffect, useMemo, useState} from 'react'
import classnames from 'classnames'

import {EditorState} from 'draft-js'

import {UploadType} from 'common/types'
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

import {toJS} from 'utils'
import {
    attachmentIsDiscountOffer,
    attachmentIsProduct,
    attachmentIsProductRecommendation,
    AttachmentType,
} from 'pages/convert/campaigns/types/CampaignAttachment'
import {ProductCardAttachment} from 'pages/common/draftjs/plugins/toolbar/components/AddProductLink'
import {useAreConvertLLMProductRecommendationsEnabled} from 'pages/convert/common/hooks/useAreConvertLLMProductRecommendationsEnabled'
import useCanAddUtm from 'pages/convert/common/hooks/useUtmFlag'
import {RichFieldEditorPlacement} from 'pages/common/forms/RichField/enums'
import css from './CampaignMessage.less'

type Props = {
    richAreaRef: (ref: RichField | null) => void
    agents: User[]
    html: string
    isConvertSubscriber?: boolean
    showAgentSelector?: boolean
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
        html,
        isConvertSubscriber = false,
        showAgentSelector = true,
        text,
        selectedAgent,
        showContentWarning,
        onSelectAgent,
        onChangeMessage,
        onDeleteAttachment,
    }: Props): JSX.Element => {
        const {shopifyIntegration} = useIntegrationContext()
        const {getStepConfiguration, getTourConfiguration} =
            useCampaignFormContext()
        const areProductRecommendationsEnabled =
            useAreConvertLLMProductRecommendationsEnabled()
        const stepConfiguration = useMemo(() => {
            return getStepConfiguration(CampaignStepsKeys.Message)
        }, [getStepConfiguration])
        const tourConfiguration = useMemo(() => {
            return getTourConfiguration()
        }, [getTourConfiguration])

        const isConvertUniqueDiscountCodesEnabled =
            useIsConvertUniqueDiscountCodesEnabled()

        const attachments = useAppSelector(getNewMessageAttachments)

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
            attachments.toJS() as AttachmentType[]
        ).find((att) => attachmentIsDiscountOffer(att))

        const supportsUniqueDiscountOffer =
            isConvertUniqueDiscountCodesEnabled && isConvertSubscriber

        const canAddUniqueDiscountOffer = !anyDiscountOfferAttached

        const anyProductRecommendationAttached = (
            attachments.toJS() as AttachmentType[]
        ).find((att) => attachmentIsProductRecommendation(att))

        const canAddProductRecommendation =
            isConvertSubscriber &&
            !anyProductRecommendationAttached &&
            areProductRecommendationsEnabled

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
            ) as ProductCardAttachment | undefined

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

            if (isConvertSubscriber) {
                actions.push(ActionName.DiscountCodePicker)
            }

            const productAttachments = attachments.filter((att) =>
                attachmentIsProduct(toJS(att))
            )
            if (
                productAttachments.size < 5 &&
                !anyProductRecommendationAttached
            ) {
                actions.push(ActionName.ProductPicker)
            }

            actions.push(ActionName.Video)

            return actions
        }, [attachments, anyProductRecommendationAttached, isConvertSubscriber])

        const canAddUtm = useCanAddUtm(isConvertSubscriber)
        return (
            <div>
                {showAgentSelector && (
                    <div className={classnames('mb-2', css.authorWrapper)}>
                        <span>From: </span>
                        <SelectField
                            className={css.authorInput}
                            value={selectedAgent}
                            options={options}
                            onChange={onSelectAgent}
                        />
                    </div>
                )}

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
                    <div className="mb-2 mt-4">
                        <ConvertInfoBanner
                            type={stepConfiguration.banner.type}
                            text={stepConfiguration.banner.content}
                            aria-label="Banner information for campaign message step"
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
                        canAddProductAutomations={canAddProductRecommendation}
                        currentShopifyIntegration={shopifyIntegration}
                        sortAttachments={true}
                        canAddUtm={canAddUtm}
                        placementType={RichFieldEditorPlacement.ConvertDetail}
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
