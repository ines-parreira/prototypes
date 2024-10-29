import classnames from 'classnames'

import {EditorState} from 'draft-js'

import objectHash from 'object-hash'
import React, {memo, useEffect, useMemo, useState} from 'react'

import {UploadType} from 'common/types'
import {User} from 'config/types/user'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {ProductCardAttachment} from 'pages/common/draftjs/plugins/toolbar/components/AddProductLink'
import {ActionName} from 'pages/common/draftjs/plugins/toolbar/types'
import {RichFieldEditorPlacement} from 'pages/common/forms/RichField/enums'
import RichField from 'pages/common/forms/RichField/RichField'
import TicketRichField from 'pages/common/forms/RichField/TicketRichField'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {Option, Value} from 'pages/common/forms/SelectField/types'
import {AgentLabel} from 'pages/common/utils/labels'
import {AICopyAssistant} from 'pages/convert/campaigns/components/AICopyAssistant/AICopyAssistant'
import AddContactCaptureForm from 'pages/convert/campaigns/components/ContactCaptureForm/AddContactCaptureForm'
import {handleContactFormSubmitted} from 'pages/convert/campaigns/components/ContactCaptureForm/utils'
import ConvertInfoBanner from 'pages/convert/campaigns/components/ConvertInfoBanner'
import {useIntegrationContext} from 'pages/convert/campaigns/containers/IntegrationProvider'
import {useCampaignDetailsContext} from 'pages/convert/campaigns/hooks/useCampaignDetailsContext'
import {useCampaignFormContext} from 'pages/convert/campaigns/hooks/useCampaignFormContext'
import {
    attachmentIsDiscountOffer,
    attachmentIsProduct,
    attachmentIsProductRecommendation,
    AttachmentType,
    CampaignFormExtra,
} from 'pages/convert/campaigns/types/CampaignAttachment'
import {CampaignStepsKeys} from 'pages/convert/campaigns/types/CampaignSteps'

import {checkShopifyProductAvailabity} from 'pages/convert/campaigns/utils/checkProductAvailability'
import {transformAttachmentsToContactCaptureForms} from 'pages/convert/campaigns/utils/transformAttachmentsToContactCaptureForms'
import {useAreConvertLLMProductRecommendationsEnabled} from 'pages/convert/common/hooks/useAreConvertLLMProductRecommendationsEnabled'
import useCanAddContactFormFlag from 'pages/convert/common/hooks/useContactFormFlag'
import TicketAttachments from 'pages/tickets/detail/components/ReplyArea/TicketAttachments'

import {getNewMessageAttachments} from 'state/newMessage/selectors'

import {getTicketState} from 'state/ticket/selectors'
import {toJS} from 'utils'

import css from './CampaignMessage.less'

const SUBSCRIBERS_PLACEHOLDER =
    'Write your campaign message or prompt, ' +
    'and let the AI Copy Assistant enhance it for maximum impact. ' +
    'Highlight key values and include a call-to-action with URLs or discount codes.'

const NONSUBSCRIBERS_PLACEHOLDER = 'Write your message'

type Props = {
    richAreaRef: (ref: RichField | null) => void
    agents: User[]
    html: string
    isConvertSubscriber?: boolean
    showAgentSelector?: boolean
    text: string
    selectedAgent: string
    showContentWarning?: boolean
    shouldGenerateInitialSuggestion: boolean
    isAiCopyAssistantEnabled: boolean
    onSelectAgent: (agent: Value) => void
    onChangeMessage: (value: EditorState) => void
    onDeleteAttachment: (index: number) => void
    onSuggestionApply: (suggestion: string) => void
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
        shouldGenerateInitialSuggestion,
        isAiCopyAssistantEnabled,
        onSelectAgent,
        onChangeMessage,
        onSuggestionApply,
        onDeleteAttachment,
    }: Props): JSX.Element => {
        const dispatch = useAppDispatch()
        const ticket = useAppSelector(getTicketState)
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

        const attachments = useAppSelector(getNewMessageAttachments)

        const [lastAppliedSuggestion, setLastAppliedSuggestion] = useState<
            string | null
        >(null)
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
        const {campaign, triggers, updateCampaign} = useCampaignDetailsContext()
        const canAddContactForm =
            useCanAddContactFormFlag() &&
            !campaign.is_light &&
            isConvertSubscriber

        const displayedActions = useMemo(() => {
            const actions = [
                ActionName.Bold,
                ActionName.Italic,
                ActionName.Underline,
                ActionName.Link,
                ActionName.Image,
                ActionName.Emoji,
            ]

            if (canAddContactForm) {
                actions.push(ActionName.ContactCaptureForm)
            }

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
        }, [
            attachments,
            anyProductRecommendationAttached,
            isConvertSubscriber,
            canAddContactForm,
        ])

        const contactFormAttachment = useMemo(
            () => transformAttachmentsToContactCaptureForms(attachments)[0],
            [attachments]
        )
        const contactFormButtonEnabled = useMemo(
            () => !contactFormAttachment,
            [contactFormAttachment]
        )
        const [isContactFormOpen, onContactFormOpenChange] = useState(false)
        const onContactFormSubmit = (
            newAttachmentExtra: CampaignFormExtra,
            isEditing: boolean
        ) => {
            handleContactFormSubmitted(
                dispatch,
                attachments,
                newAttachmentExtra,
                ticket,
                false
            )
            if (!isEditing) {
                updateCampaign('noReply', true)
            }
        }

        const onSuggestionApplyHandler = (suggestion: string) => {
            onSuggestionApply(suggestion)
            setLastAppliedSuggestion(suggestion)
        }

        const placeholder =
            isConvertSubscriber && isAiCopyAssistantEnabled
                ? SUBSCRIBERS_PLACEHOLDER
                : NONSUBSCRIBERS_PLACEHOLDER

        useEffect(() => {
            if (!!lastAppliedSuggestion) {
                updateCampaign('copySuggestion', lastAppliedSuggestion)
            }
        }, [lastAppliedSuggestion, updateCampaign])

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

                <AddContactCaptureForm
                    key={objectHash(contactFormAttachment ?? {})}
                    open={isContactFormOpen}
                    onOpenChange={onContactFormOpenChange}
                    onSubmit={onContactFormSubmit}
                    buttonDisabled={!contactFormButtonEnabled}
                    initialAttachment={contactFormAttachment}
                />

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
                        placeholder={placeholder}
                        displayedActions={displayedActions}
                        isRequired
                        countCharacters={isConvertSubscriber}
                        uploadType={UploadType.PublicAttachment}
                        supportsUniqueDiscountOffer={isConvertSubscriber}
                        canAddUniqueDiscountOffer={canAddUniqueDiscountOffer}
                        canAddProductAutomations={canAddProductRecommendation}
                        currentShopifyIntegration={shopifyIntegration}
                        sortAttachments={true}
                        contactFormButtonEnabled={contactFormButtonEnabled}
                        onContactFormOpenChange={onContactFormOpenChange}
                        placementType={RichFieldEditorPlacement.ConvertDetail}
                        canAddUtm={isConvertSubscriber}
                    />
                    {isConvertSubscriber &&
                        shopifyIntegration?.meta?.shop_name && (
                            <AICopyAssistant
                                campaign={campaign}
                                triggers={Object.values(triggers)}
                                shopName={shopifyIntegration.meta.shop_name}
                                shouldGenerateInitialSuggestion={
                                    shouldGenerateInitialSuggestion
                                }
                                isEnabled={isAiCopyAssistantEnabled}
                                onApply={onSuggestionApplyHandler}
                            />
                        )}
                    <TicketAttachments
                        context="campaign-message"
                        removable
                        attachments={attachments}
                        className="d-flex flex-wrap"
                        deleteAttachment={onDeleteAttachment}
                        onCampaignFormEdit={() => onContactFormOpenChange(true)}
                    />
                </div>
            </div>
        )
    }
)
