import type {
    AxiosRequestConfig,
    OpenAPIClient,
    OperationResponse,
    Parameters,
    UnknownParamsObject,
} from 'openapi-client-axios'

declare namespace Components {
    namespace Schemas {
        /**
         * ABGroupResponseSchema
         */
        export interface ABGroupResponseSchema {
            /**
             * Winner Variant Id
             */
            winner_variant_id?: /* Winner Variant Id */ string | null
            status: /* ABGroupStatus */ ABGroupStatus
            /**
             * Started Datetime
             */
            started_datetime?: /* Started Datetime */
            string /* date-time */ | null
            /**
             * Stopped Datetime
             */
            stopped_datetime?: /* Stopped Datetime */
            string /* date-time */ | null
            /**
             * Campaign Id
             */
            campaign_id?: /* Campaign Id */ string | null
            /**
             * Generated Campaign Id
             */
            generated_campaign_id?: /* Generated Campaign Id */ string | null
        }
        /**
         * ABGroupStatus
         */
        export type ABGroupStatus = 'draft' | 'started' | 'paused' | 'completed'
        /**
         * ABGroupStopRequestSchema
         */
        export interface ABGroupStopRequestSchema {
            /**
             * Winner Variant Id
             */
            winner_variant_id?: /* Winner Variant Id */ string | null
        }
        /**
         * ABTestConfigurationResponseSchema
         */
        export interface ABTestConfigurationResponseSchema {
            /**
             * Active
             */
            active?: boolean
            configuration: /* ABTestConfigurationSchema */ ABTestConfigurationSchema | null
        }
        /**
         * ABTestConfigurationSchema
         */
        export interface ABTestConfigurationSchema {
            /**
             * Ratio
             */
            ratio: number
            /**
             * Campaigns
             */
            campaigns?: string[]
        }
        /**
         * ABTestCreateRequestSchema
         */
        export interface ABTestCreateRequestSchema {
            /**
             * Channel Connection Id
             */
            channel_connection_id: string
            /**
             * Store Integration Id
             */
            store_integration_id?: /* Store Integration Id */ number | null
            /**
             * Ratio
             */
            ratio?: number
            /**
             * Start Datetime
             */
            start_datetime?: string // date-time
        }
        /**
         * ABTestPatchRequestSchema
         */
        export interface ABTestPatchRequestSchema {
            /**
             * State
             */
            state?: /* State */ 'inactive' | null
            /**
             * Report Link
             */
            report_link?: /* Report Link */ string /* uri */ | null
        }
        /**
         * ABTestResponseSchema
         */
        export interface ABTestResponseSchema {
            /**
             * Id
             */
            id: string
            /**
             * Ratio
             */
            ratio: number
            state: /* ABTestState */ ABTestState
            /**
             * Start Datetime
             */
            start_datetime: string // date-time
            /**
             * End Datetime
             */
            end_datetime: /* End Datetime */ string /* date-time */ | null
            /**
             * Report Link
             */
            report_link: /* Report Link */ string | null
            /**
             * Campaigns
             */
            campaigns?: /* Campaigns */ string[] | null
        }
        /**
         * ABTestState
         */
        export type ABTestState = 'active' | 'inactive'
        /**
         * BaseCampaignTriggerSchema
         */
        export interface BaseCampaignTriggerSchema {
            type: /* CampaignTriggerType */ CampaignTriggerType
            operator: /* CampaignTriggerOperator */ CampaignTriggerOperator
            /**
             * Value
             */
            value: /* Value */
            | number
                | boolean
                | string
                | any[]
                | {
                      [key: string]: any
                  }
        }
        /**
         * BundleOnboardingStatus
         */
        export type BundleOnboardingStatus = 'installed' | 'not_installed'
        /**
         * CampaignAttachmentDiscountOfferExtraSchema
         */
        export interface CampaignAttachmentDiscountOfferExtraSchema {
            /**
             * Discount Offer Id
             */
            discount_offer_id: string
        }
        /**
         * CampaignAttachmentDiscountOfferSchema
         */
        export interface CampaignAttachmentDiscountOfferSchema {
            /**
             * Contenttype
             */
            contentType: 'application/discountOffer'
            /**
             * Name
             */
            name: string
            /**
             * Url
             */
            url?: /* Url */ string | null
            extra?: /* CampaignAttachmentDiscountOfferExtraSchema */ CampaignAttachmentDiscountOfferExtraSchema | null
        }
        /**
         * CampaignAttachmentProductExtraSchema
         */
        export interface CampaignAttachmentProductExtraSchema {
            /**
             * Product Id
             */
            product_id: number
            /**
             * Price
             */
            price?: /* Price */ number | null
            /**
             * Compare At Price
             */
            compare_at_price?: /* Compare At Price */ number | null
            /**
             * Currency
             */
            currency?: /* Currency */ string | null
            /**
             * Product Link
             */
            product_link?: /* Product Link */ string | null
            /**
             * Variant Name
             */
            variant_name?: /* Variant Name */ string | null
            position?: /* CampaignAttachmentProductPositionSchema */ CampaignAttachmentProductPositionSchema | null
        }
        /**
         * CampaignAttachmentProductPositionSchema
         */
        export interface CampaignAttachmentProductPositionSchema {
            /**
             * X
             */
            x: number
            /**
             * Y
             */
            y: number
            /**
             * Offsetx
             */
            offsetX: number
            /**
             * Offsety
             */
            offsetY: number
            /**
             * Size
             */
            size: number
        }
        /**
         * CampaignAttachmentProductRecommendationExtraSchema
         */
        export interface CampaignAttachmentProductRecommendationExtraSchema {
            /**
             * Id
             */
            id: string
            scenario: /* ProductRecommendationScenarioType */ ProductRecommendationScenarioType
        }
        /**
         * CampaignAttachmentProductRecommendationSchema
         */
        export interface CampaignAttachmentProductRecommendationSchema {
            /**
             * Contenttype
             */
            contentType: 'application/productRecommendation'
            /**
             * Name
             */
            name: string
            extra: /* CampaignAttachmentProductRecommendationExtraSchema */ CampaignAttachmentProductRecommendationExtraSchema
        }
        /**
         * CampaignAttachmentProductSchema
         */
        export interface CampaignAttachmentProductSchema {
            /**
             * Contenttype
             */
            contentType: 'application/productCard'
            /**
             * Name
             */
            name: string
            /**
             * Url
             */
            url?: /* Url */ string | null
            /**
             * Size
             */
            size?: /* Size */ number | null
            extra?: /* CampaignAttachmentProductExtraSchema */ CampaignAttachmentProductExtraSchema | null
        }
        /**
         * CampaignAttachmentVisitorFormExtraSchema
         */
        export interface CampaignAttachmentVisitorFormExtraSchema {
            /**
             * Steps
             */
            steps: /* VisitorFormStepSchema */ VisitorFormStepSchema[]
            on_success_content?: /* VisitorFormOnSuccessContentSchema */ VisitorFormOnSuccessContentSchema | null
            /**
             * Targets
             */
            targets: /* VisitorFormTargetsSchema */ VisitorFormTargetsSchema[]
        }
        /**
         * CampaignAttachmentVisitorFormSchema
         */
        export interface CampaignAttachmentVisitorFormSchema {
            /**
             * Contenttype
             */
            contentType: 'application/visitorForm'
            /**
             * Name
             */
            name: string
            extra?: /* CampaignAttachmentVisitorFormExtraSchema */ CampaignAttachmentVisitorFormExtraSchema | null
        }
        /**
         * CampaignCopySuggestionRequestSchema
         */
        export interface CampaignCopySuggestionRequestSchema {
            /**
             * Store Domain
             */
            store_domain: string
            /**
             * Title
             */
            title?: /* Title */ string | null
            /**
             * Language
             */
            language?: string
            /**
             * Message
             */
            message?: /* Message */ string | null
            /**
             * Triggers
             */
            triggers?: /* Triggers */ /* BaseCampaignTriggerSchema */
            BaseCampaignTriggerSchema[] | null
        }
        /**
         * CampaignCopySuggestionResponseSchema
         */
        export interface CampaignCopySuggestionResponseSchema {
            /**
             * Suggestions
             */
            suggestions: string[]
        }
        /**
         * CampaignCreateRequestSchema
         */
        export interface CampaignCreateRequestSchema {
            /**
             * Name
             */
            name: string
            /**
             * Description
             */
            description?: /* Description */ string | null
            /**
             * Message Text
             */
            message_text: string
            /**
             * Message Html
             */
            message_html?: /* Message Html */ string | null
            /**
             * Language
             */
            language?: /* Language */ string | null
            status: /* CampaignStatus */ CampaignStatus
            /**
             * Trigger Rule
             */
            trigger_rule: string
            /**
             * Attachments
             */
            attachments?: /* Attachments */
            | /* CampaignAttachmentProductSchema */ (
                      | CampaignAttachmentProductSchema
                      | /* CampaignAttachmentDiscountOfferSchema */ CampaignAttachmentDiscountOfferSchema
                      | /* CampaignAttachmentVisitorFormSchema */ CampaignAttachmentVisitorFormSchema
                      | /* CampaignAttachmentProductRecommendationSchema */ CampaignAttachmentProductRecommendationSchema
                  )[]
                | null
            meta?: /* CampaignMetaSchema */ CampaignMetaSchema | null
            /**
             * Triggers
             */
            triggers: /* CampaignTriggerSchema */ CampaignTriggerSchema[]
            /**
             * Channel Connection Id
             */
            channel_connection_id: string
            publish_mode?: /* CampaignPublishType */ CampaignPublishType | null
            /**
             * External Tag Id
             */
            external_tag_id?: /* External Tag Id */ number | null
            /**
             * Template Id
             */
            template_id?: /* Template Id */ string | null
            schedule?: /* ScheduleRequestSchema */ ScheduleRequestSchema | null
            /**
             * Variants
             */
            variants?: [
                /* CampaignVariantRequestSchema */ CampaignVariantRequestSchema?,
                /* CampaignVariantRequestSchema */ CampaignVariantRequestSchema?,
            ]
        }
        /**
         * CampaignMetaSchema
         */
        export interface CampaignMetaSchema {
            /**
             * Noreply
             */
            noReply?: /* Noreply */ boolean | null
            /**
             * Delay
             */
            delay?: /* Delay */ number | null
            /**
             * Agentemail
             */
            agentEmail?: /* Agentemail */ string | null
            /**
             * Agentname
             */
            agentName?: /* Agentname */ string | null
            /**
             * Agentavatarurl
             */
            agentAvatarUrl?: /* Agentavatarurl */ string | null
            minimumTimeBetweenCampaigns?: /* MinimumTimeBetweenCampaigns */ MinimumTimeBetweenCampaigns | null
            maxCampaignDisplaysInSession?: /* MaxCampaignDisplaysInSession */ MaxCampaignDisplaysInSession | null
            /**
             * Copysuggestion
             */
            copySuggestion?: /* Copysuggestion */ string | null
        }
        /**
         * CampaignPatchRequestSchema
         * Defines the fields that can be patched and accepts any subset of the fields.
         * Validates `triggers` and `trigger_rule` fields as required together - it has to be done this way
         * as long as the IDs are generated on the frontend.
         * Skips advanced validation, it will be handled in PATCH endpoint:
         *     see https://fastapi.tiangolo.com/tutorial/body-updates/#partial-updates-with-patch
         */
        export interface CampaignPatchRequestSchema {
            /**
             * Name
             */
            name?: /* Name */ string | null
            /**
             * Description
             */
            description?: /* Description */ string | null
            /**
             * Message Text
             */
            message_text?: /* Message Text */ string | null
            /**
             * Message Html
             */
            message_html?: /* Message Html */ string | null
            /**
             * Language
             */
            language?: /* Language */ string | null
            status?: /* CampaignStatus */ CampaignStatus | null
            /**
             * Trigger Rule
             */
            trigger_rule?: /* Trigger Rule */ string | null
            /**
             * Attachments
             */
            attachments?: /* Attachments */
            | /* CampaignAttachmentProductSchema */ (
                      | CampaignAttachmentProductSchema
                      | /* CampaignAttachmentDiscountOfferSchema */ CampaignAttachmentDiscountOfferSchema
                      | /* CampaignAttachmentVisitorFormSchema */ CampaignAttachmentVisitorFormSchema
                      | /* CampaignAttachmentProductRecommendationSchema */ CampaignAttachmentProductRecommendationSchema
                  )[]
                | null
            meta?: /* CampaignMetaSchema */ CampaignMetaSchema | null
            publish_mode?: /* CampaignPublishType */ CampaignPublishType | null
            /**
             * Triggers
             */
            triggers?: /* Triggers */ /* CampaignTriggerSchema */
            CampaignTriggerSchema[] | null
            schedule?: /* ScheduleRequestSchema */ ScheduleRequestSchema | null
            /**
             * Variants
             */
            variants?: /* Variants */
            | [
                      /* CampaignVariantRequestSchema */ CampaignVariantRequestSchema?,
                      /* CampaignVariantRequestSchema */ CampaignVariantRequestSchema?,
                  ]
                | null
            /**
             * External Tag Id
             */
            external_tag_id?: /* External Tag Id */ number | null
            /**
             * Template Id
             */
            template_id?: /* Template Id */ string | null
        }
        /**
         * CampaignPublishType
         */
        export type CampaignPublishType =
            | 'publish_now'
            | 'schedule'
            | 'publish_later'
        /**
         * CampaignResponseSchema
         */
        export interface CampaignResponseSchema {
            /**
             * Name
             */
            name: string
            /**
             * Description
             */
            description?: /* Description */ string | null
            /**
             * Message Text
             */
            message_text: string
            /**
             * Message Html
             */
            message_html?: /* Message Html */ string | null
            /**
             * Language
             */
            language?: /* Language */ string | null
            status: /* CampaignStatus */ CampaignStatus
            /**
             * Trigger Rule
             */
            trigger_rule: string
            /**
             * Attachments
             */
            attachments?: /* Attachments */
            | /* CampaignAttachmentProductSchema */ (
                      | CampaignAttachmentProductSchema
                      | /* CampaignAttachmentDiscountOfferSchema */ CampaignAttachmentDiscountOfferSchema
                      | /* CampaignAttachmentVisitorFormSchema */ CampaignAttachmentVisitorFormSchema
                      | /* CampaignAttachmentProductRecommendationSchema */ CampaignAttachmentProductRecommendationSchema
                  )[]
                | null
            /**
             * Meta
             */
            meta?: /* Meta */ {
                [key: string]: any
            } | null
            /**
             * Id
             */
            id: string
            /**
             * Triggers
             */
            triggers: /* CampaignTriggerSchema */ CampaignTriggerSchema[]
            ab_group?: /* ABGroupResponseSchema */ ABGroupResponseSchema | null
            /**
             * Variants
             */
            variants: /* CampaignVariantResponseSchema */ CampaignVariantResponseSchema[]
            schedule?: /* ScheduleResponseSchema */ ScheduleResponseSchema | null
            /**
             * Is Light
             */
            is_light: boolean
            /**
             * Created Datetime
             */
            created_datetime: string // date-time
            /**
             * Updated Datetime
             */
            updated_datetime: string // date-time
            /**
             * Deleted Datetime
             */
            deleted_datetime?: /* Deleted Datetime */
            string /* date-time */ | null
            /**
             * Template Id
             */
            template_id?: /* Template Id */ string | null
        }
        /**
         * CampaignSchema
         */
        export interface CampaignSchema {
            /**
             * Id
             */
            id: string
            /**
             * Rules
             */
            rules: /* RuleSchema */ RuleSchema[]
        }
        /**
         * CampaignStatus
         */
        export type CampaignStatus = 'active' | 'inactive'
        /**
         * CampaignTriggerOperator
         */
        export type CampaignTriggerOperator =
            | 'eq'
            | 'neq'
            | 'gt'
            | 'gte'
            | 'lt'
            | 'lte'
            | 'in'
            | 'notIn'
            | 'startsWith'
            | 'endsWith'
            | 'contains'
            | 'containsAll'
            | 'containsAny'
            | 'notContains'
        /**
         * CampaignTriggerSchema
         */
        export interface CampaignTriggerSchema {
            type: /* CampaignTriggerType */ CampaignTriggerType
            operator: /* CampaignTriggerOperator */ CampaignTriggerOperator
            /**
             * Value
             */
            value: /* Value */
            | number
                | boolean
                | string
                | any[]
                | {
                      [key: string]: any
                  }
            /**
             * Id
             */
            id: string
        }
        /**
         * CampaignTriggerType
         */
        export type CampaignTriggerType =
            | 'time_spent_on_page'
            | 'current_url'
            | 'business_hours'
            | 'cart_value'
            | 'product_tags'
            | 'cart_product_tags'
            | 'visit_count'
            | 'session_time'
            | 'single_in_view'
            | 'exit_intent'
            | 'device_type'
            | 'orders_count'
            | 'amount_spent'
            | 'ordered_products'
            | 'customer_tags'
            | 'country_code'
            | 'incognito_visitor'
            | 'out_of_stock_product_pages'
        /**
         * CampaignVariantRequestSchema
         */
        export interface CampaignVariantRequestSchema {
            /**
             * Message Text
             */
            message_text: string
            /**
             * Message Html
             */
            message_html?: /* Message Html */ string | null
            /**
             * Attachments
             */
            attachments?: /* Attachments */
            | /* CampaignAttachmentProductSchema */ (
                      | CampaignAttachmentProductSchema
                      | /* CampaignAttachmentDiscountOfferSchema */ CampaignAttachmentDiscountOfferSchema
                      | /* CampaignAttachmentVisitorFormSchema */ CampaignAttachmentVisitorFormSchema
                      | /* CampaignAttachmentProductRecommendationSchema */ CampaignAttachmentProductRecommendationSchema
                  )[]
                | null
            /**
             * Id
             */
            id: string
        }
        /**
         * CampaignVariantResponseSchema
         */
        export interface CampaignVariantResponseSchema {
            /**
             * Message Text
             */
            message_text: string
            /**
             * Message Html
             */
            message_html?: /* Message Html */ string | null
            /**
             * Attachments
             */
            attachments?: /* Attachments */
            | /* CampaignAttachmentProductSchema */ (
                      | CampaignAttachmentProductSchema
                      | /* CampaignAttachmentDiscountOfferSchema */ CampaignAttachmentDiscountOfferSchema
                      | /* CampaignAttachmentVisitorFormSchema */ CampaignAttachmentVisitorFormSchema
                      | /* CampaignAttachmentProductRecommendationSchema */ CampaignAttachmentProductRecommendationSchema
                  )[]
                | null
            /**
             * Id
             */
            id: string
            /**
             * Started Datetime
             */
            started_datetime?: /* Started Datetime */
            string /* date-time */ | null
            /**
             * Stopped Datetime
             */
            stopped_datetime?: /* Stopped Datetime */
            string /* date-time */ | null
        }
        /**
         * CartAbandonedCartTestApiDTO
         */
        export interface CartAbandonedCartTestApiDTO {
            /**
             * Phone Number
             */
            phone_number: string
            /**
             * Products
             */
            products: /* CartAbandonedProductApiDTO */ CartAbandonedProductApiDTO[]
        }
        /**
         * CartAbandonedJourneyConfigurationApiDTO
         */
        export interface CartAbandonedJourneyConfigurationApiDTO {
            /**
             * Max Follow Up Messages
             */
            max_follow_up_messages?: /* Max Follow Up Messages */ number | null
            /**
             * Sms Sender Number
             */
            sms_sender_number?: /* Sms Sender Number */ string | null
            /**
             * Sms Sender Integration Id
             */
            sms_sender_integration_id?: /* Sms Sender Integration Id */
            number | null
            /**
             * Offer Discount
             */
            offer_discount?: boolean
            /**
             * Max Discount Percent
             */
            max_discount_percent?: /* Max Discount Percent */ number | null
            /**
             * Discount Code Message Threshold
             */
            discount_code_message_threshold?: /* Discount Code Message Threshold */
            number | null
            /**
             * Include Image
             */
            include_image?: boolean
        }
        /**
         * CartAbandonedJourneyConfigurationPrivateApiDTO
         */
        export interface CartAbandonedJourneyConfigurationPrivateApiDTO {
            /**
             * Cart Abandoned Wait Minutes
             */
            cart_abandoned_wait_minutes?: /* Cart Abandoned Wait Minutes */
            number | null
        }
        /**
         * CartAbandonedProductApiDTO
         */
        export interface CartAbandonedProductApiDTO {
            /**
             * Product Id
             */
            product_id: string
            /**
             * Variant Id
             */
            variant_id: string
            /**
             * Title
             */
            title?: /* Title */ string | null
            /**
             * Price
             */
            price?: /* Price */ number | null
        }
        /**
         * CartItemSchema
         */
        export interface CartItemSchema {
            product: /* InteractedProductSchema */ InteractedProductSchema
            /**
             * Quantity
             */
            quantity?: number
            /**
             * Total
             */
            total: /* Total */ string | number
            /**
             * Original Total
             */
            original_total?: /* Original Total */ string | number | null
        }
        /**
         * CartSchema
         */
        export interface CartSchema {
            /**
             * Last Update Datetime
             */
            last_update_datetime: string // date-time
            /**
             * Currency
             */
            currency: string
            /**
             * Items
             */
            items?: /* CartItemSchema */ CartItemSchema[]
        }
        /**
         * ChannelConnectionCreateRequestSchema
         */
        export interface ChannelConnectionCreateRequestSchema {
            /**
             * Store Integration Id
             */
            store_integration_id?: /* Store Integration Id */ number | null
            /**
             * External Id
             */
            external_id?: /* External Id */ string | null
            /**
             * External Installation Status
             */
            external_installation_status?: /* External Installation Status */
            string | null
            /**
             * Is Setup
             */
            is_setup?: boolean
            /**
             * Is Onboarded
             */
            is_onboarded?: boolean
            /**
             * Utm Query String
             */
            utm_query_string?: string
            /**
             * Utm Enabled
             */
            utm_enabled?: boolean
            channel: /* ChannelType */ ChannelType
        }
        /**
         * ChannelConnectionResponseSchema
         */
        export interface ChannelConnectionResponseSchema {
            /**
             * Store Integration Id
             */
            store_integration_id?: /* Store Integration Id */ number | null
            /**
             * External Id
             */
            external_id?: /* External Id */ string | null
            /**
             * External Installation Status
             */
            external_installation_status?: /* External Installation Status */
            string | null
            /**
             * Is Setup
             */
            is_setup?: boolean
            /**
             * Is Onboarded
             */
            is_onboarded?: boolean
            /**
             * Utm Query String
             */
            utm_query_string?: string
            /**
             * Utm Enabled
             */
            utm_enabled?: boolean
            channel: /* ChannelType */ ChannelType
            /**
             * Account Id
             */
            account_id: number
            /**
             * Id
             */
            id: string
        }
        /**
         * ChannelPatchRequestSchema
         * Defines the fields that can be patched and accepts any subset of the fields.
         * Skips advanced validation, it will be handled in PATCH endpoint:
         *     see https://fastapi.tiangolo.com/tutorial/body-updates/#partial-updates-with-patch
         */
        export interface ChannelPatchRequestSchema {
            /**
             * Store Integration Id
             */
            store_integration_id?: /* Store Integration Id */ number | null
            /**
             * External Id
             */
            external_id?: /* External Id */ string | null
            /**
             * External Installation Status
             */
            external_installation_status?: /* External Installation Status */
            string | null
            /**
             * Is Setup
             */
            is_setup?: boolean
            /**
             * Is Onboarded
             */
            is_onboarded?: boolean
            /**
             * Utm Query String
             */
            utm_query_string?: string
            /**
             * Utm Enabled
             */
            utm_enabled?: boolean
        }
        /**
         * ChannelType
         */
        export type ChannelType = 'widget'
        /**
         * CommunicationOptInSchema
         */
        export interface CommunicationOptInSchema {
            /**
             * Email
             */
            email?: boolean
            /**
             * Sms
             */
            sms?: boolean
        }
        /**
         * ConfigResponseSchema
         */
        export interface ConfigResponseSchema {
            subscription: /* SubscriptionStatusSchema */ SubscriptionStatusSchema
            /**
             * Campaigns
             */
            campaigns: /**
             * PublicCampaignResponseSchema
             * Contains only fields allowed to be seen by the public, e.g. no channel_connection_id.
             */
            PublicCampaignResponseSchema[]
            ab_test?: /* ABTestConfigurationResponseSchema */ ABTestConfigurationResponseSchema | null
            /**
             * Settings
             */
            settings?: {
                [name: string]: {
                    [key: string]: any
                }
            }
            /**
             * Id
             */
            id: string
        }
        /**
         * CreateJourneyApiDTO
         */
        export interface CreateJourneyApiDTO {
            type: /* JourneyTypeEnum */ JourneyTypeEnum
            /**
             * Store Integration Id
             */
            store_integration_id: number
            /**
             * Store Name
             */
            store_name: string
            /**
             * Store Type
             */
            store_type: string
            /**
             * Message Instructions
             */
            message_instructions?: /* Message Instructions */ string | null
            configuration?: /* CartAbandonedJourneyConfigurationApiDTO */ CartAbandonedJourneyConfigurationApiDTO | null
        }
        /**
         * CustomDomainOperationSchema
         */
        export interface CustomDomainOperationSchema {
            /**
             * Hostname
             */
            hostname: string
            zone?: /* CustomDomainZone */ CustomDomainZone | null
        }
        /**
         * CustomDomainSchema
         */
        export interface CustomDomainSchema {
            /**
             * Hostname
             */
            hostname: string
            /**
             * Status
             */
            status: string
        }
        /**
         * CustomDomainZone
         */
        export type CustomDomainZone = 'gorgias-convert.com' | 'gorgias.win'
        /**
         * CustomScheduleSchema
         */
        export interface CustomScheduleSchema {
            /**
             * Days
             */
            days: string
            /**
             * From Time
             */
            from_time: string
            /**
             * To Time
             */
            to_time: string
        }
        /**
         * DiscountOfferApiDTO
         */
        export interface DiscountOfferApiDTO {
            type: /* DiscountOfferTypeEnum */ DiscountOfferTypeEnum
            /**
             * Prefix
             */
            prefix: string
            /**
             * Value
             */
            value?: /* Value */ number | string | null
            /**
             * Minimum Purchase Amount
             */
            minimum_purchase_amount?: /* Minimum Purchase Amount */
            number | string | null
            /**
             * External Customer Segment Ids
             */
            external_customer_segment_ids?: /* External Customer Segment Ids */
            string[] | null
            /**
             * External Collection Ids
             */
            external_collection_ids?: /* External Collection Ids */
            string[] | null
            /**
             * External Product Ids
             */
            external_product_ids?: /* External Product Ids */ string[] | null
            /**
             * Id
             */
            id: string
            /**
             * Store Integration Id
             */
            store_integration_id: string
            /**
             * Updated Datetime
             */
            updated_datetime: string // date-time
            /**
             * Created Datetime
             */
            created_datetime: string // date-time
        }
        /**
         * DiscountOfferCreateApiDTO
         */
        export interface DiscountOfferCreateApiDTO {
            type: /* DiscountOfferTypeEnum */ DiscountOfferTypeEnum
            /**
             * Prefix
             */
            prefix: string
            /**
             * Value
             */
            value?: /* Value */ number | string | null
            /**
             * Minimum Purchase Amount
             */
            minimum_purchase_amount?: /* Minimum Purchase Amount */
            number | string | null
            /**
             * External Customer Segment Ids
             */
            external_customer_segment_ids?: /* External Customer Segment Ids */
            string[] | null
            /**
             * External Collection Ids
             */
            external_collection_ids?: /* External Collection Ids */
            string[] | null
            /**
             * External Product Ids
             */
            external_product_ids?: /* External Product Ids */ string[] | null
            /**
             * Store Integration Id
             */
            store_integration_id: string
        }
        /**
         * DiscountOfferPatchApiDTO
         */
        export interface DiscountOfferPatchApiDTO {
            type?: /* DiscountOfferTypeEnum */ DiscountOfferTypeEnum | null
            /**
             * Prefix
             */
            prefix?: /* Prefix */ string | null
            /**
             * Value
             */
            value?: /* Value */ number | string | null
            /**
             * Minimum Purchase Amount
             */
            minimum_purchase_amount?: /* Minimum Purchase Amount */
            number | string | null
            /**
             * External Customer Segment Ids
             */
            external_customer_segment_ids?: /* External Customer Segment Ids */
            string[] | null
            /**
             * External Collection Ids
             */
            external_collection_ids?: /* External Collection Ids */
            string[] | null
            /**
             * External Product Ids
             */
            external_product_ids?: /* External Product Ids */ string[] | null
        }
        /**
         * DiscountOfferTypeEnum
         */
        export type DiscountOfferTypeEnum =
            | 'fixed'
            | 'percentage'
            | 'free_shipping'
        /**
         * EvaluatedCampaignSchema
         */
        export interface EvaluatedCampaignSchema {
            /**
             * Id
             */
            id: string
            /**
             * Rules
             */
            rules: /* EvaluatedRuleSchema */ EvaluatedRuleSchema[]
        }
        /**
         * EvaluatedRuleSchema
         */
        export interface EvaluatedRuleSchema {
            key: /* RuleType */ RuleType
            operator: /* RuleOperator */ RuleOperator
            /**
             * Value
             */
            value: string
            /**
             * Matches
             */
            matches: boolean
        }
        /**
         * EvaluationRequestSchema
         */
        export interface EvaluationRequestSchema {
            /**
             * Guest Id
             */
            guest_id: string
            /**
             * Customer Id
             */
            customer_id?: /* Customer Id */ number | null
            /**
             * Account Id
             */
            account_id: number
            /**
             * Campaigns
             */
            campaigns: /* CampaignSchema */ CampaignSchema[]
        }
        /**
         * EvaluationResponseSchema
         */
        export interface EvaluationResponseSchema {
            /**
             * Campaigns
             */
            campaigns: /* EvaluatedCampaignSchema */ EvaluatedCampaignSchema[]
            /**
             * Visitor Identified
             */
            visitor_identified: boolean
        }
        /**
         * HTTPValidationError
         */
        export interface HTTPValidationError {
            /**
             * Detail
             */
            detail?: /* ValidationError */ ValidationError[]
        }
        /**
         * InstallationSchema
         */
        export interface InstallationSchema {
            /**
             * Id
             */
            id: string
            /**
             * Account Id
             */
            account_id: number
            /**
             * Shop Integration Id
             */
            shop_integration_id: number
            /**
             * Shop Name
             */
            shop_name?: /* Shop Name */ string | null
            /**
             * Script Tag Id
             */
            script_tag_id?: /* Script Tag Id */ string | null
            status: /* StatusEnum */ StatusEnum
            method: /* MethodEnum */ MethodEnum
            /**
             * Config
             */
            config: {
                [key: string]: any
            }
            /**
             * Last Loaded Datetime
             */
            last_loaded_datetime?: /* Last Loaded Datetime */
            string /* date-time */ | null
            /**
             * Created Datetime
             */
            created_datetime: string // date-time
            /**
             * Deactivated Datetime
             */
            deactivated_datetime?: /* Deactivated Datetime */
            string /* date-time */ | null
            /**
             * Bundle Url
             */
            bundle_url?: string
        }
        /**
         * InstallationUpdateConfigSchema
         */
        export interface InstallationUpdateConfigSchema {
            /**
             * Config
             */
            config: {
                [key: string]: any
            }
        }
        /**
         * InteractedProductSchema
         */
        export interface InteractedProductSchema {
            /**
             * Id
             */
            id: number
            /**
             * Variant Id
             */
            variant_id?: /* Variant Id */ number | null
            /**
             * Title
             */
            title: string
            /**
             * Handle
             */
            handle: string
        }
        /**
         * JWTTokenSchema
         */
        export interface JWTTokenSchema {
            /**
             * Token
             */
            token: string
        }
        /**
         * JourneyApiDTO
         */
        export interface JourneyApiDTO {
            /**
             * Id
             */
            id: string
            type: /* JourneyTypeEnum */ JourneyTypeEnum
            /**
             * Account Id
             */
            account_id: number
            /**
             * Store Integration Id
             */
            store_integration_id: number
            /**
             * Store Name
             */
            store_name: string
            /**
             * Store Type
             */
            store_type: string
            state: /* JourneyStatusEnum */ JourneyStatusEnum
            /**
             * Message Instructions
             */
            message_instructions?: /* Message Instructions */ string | null
            /**
             * Created Datetime
             */
            created_datetime: string // date-time
            /**
             * Meta
             */
            meta?: {
                [key: string]: any
            }
        }
        /**
         * JourneyDetailApiDTO
         */
        export interface JourneyDetailApiDTO {
            /**
             * Id
             */
            id: string
            type: /* JourneyTypeEnum */ JourneyTypeEnum
            /**
             * Account Id
             */
            account_id: number
            /**
             * Store Integration Id
             */
            store_integration_id: number
            /**
             * Store Name
             */
            store_name: string
            /**
             * Store Type
             */
            store_type: string
            state: /* JourneyStatusEnum */ JourneyStatusEnum
            /**
             * Message Instructions
             */
            message_instructions?: /* Message Instructions */ string | null
            /**
             * Created Datetime
             */
            created_datetime: string // date-time
            /**
             * Meta
             */
            meta?: {
                [key: string]: any
            }
            configuration: /* CartAbandonedJourneyConfigurationApiDTO */ CartAbandonedJourneyConfigurationApiDTO
        }
        /**
         * JourneyPrivateApiDTO
         */
        export interface JourneyPrivateApiDTO {
            /**
             * Id
             */
            id: string
            type: /* JourneyTypeEnum */ JourneyTypeEnum
            /**
             * Account Id
             */
            account_id: number
            /**
             * Store Integration Id
             */
            store_integration_id: number
            /**
             * Store Name
             */
            store_name: string
            /**
             * Store Type
             */
            store_type: string
            state: /* JourneyStatusEnum */ JourneyStatusEnum
            /**
             * Message Instructions
             */
            message_instructions?: /* Message Instructions */ string | null
            /**
             * Created Datetime
             */
            created_datetime: string // date-time
            configuration: /* CartAbandonedJourneyConfigurationPrivateApiDTO */ CartAbandonedJourneyConfigurationPrivateApiDTO
        }
        /**
         * JourneyStatusEnum
         */
        export type JourneyStatusEnum = 'active' | 'draft' | 'paused'
        /**
         * JourneyTypeEnum
         */
        export type JourneyTypeEnum = 'cart_abandoned'
        /**
         * MaxCampaignDisplaysInSession
         */
        export interface MaxCampaignDisplaysInSession {
            /**
             * Value
             */
            value: number
        }
        /**
         * MethodEnum
         */
        export type MethodEnum = 'theme_app' | 'one_click' | 'manual'
        /**
         * MinimumTimeBetweenCampaigns
         */
        export interface MinimumTimeBetweenCampaigns {
            /**
             * Value
             */
            value: number
            unit: /* TimeUnit */ TimeUnit
        }
        /**
         * PastActivitySchema
         */
        export interface PastActivitySchema {
            /**
             * Past Sessions
             */
            past_sessions?: /* ShopperSessionSchema */ ShopperSessionSchema[]
            /**
             * Top Visited Pages
             */
            top_visited_pages?: /* VisitedPageSchema */ VisitedPageSchema[]
            /**
             * Top Visited Product Pages
             */
            top_visited_product_pages?: /* VisitedProductPageSchema */ VisitedProductPageSchema[]
            /**
             * Last Cart Abandonment Datetime
             */
            last_cart_abandonment_datetime?: /* Last Cart Abandonment Datetime */
            string /* date-time */ | null
        }
        /**
         * ProductInfoSchema
         */
        export interface ProductInfoSchema {
            /**
             * Id
             */
            id: number
            /**
             * Title
             */
            title: string
        }
        /**
         * ProductOption
         */
        export interface ProductOption {
            /**
             * Id
             */
            id: number
            /**
             * Name
             */
            name: string
            /**
             * Values
             */
            values: string[]
        }
        /**
         * ProductRecommendationRequestSchema
         */
        export interface ProductRecommendationRequestSchema {
            /**
             * Shop Name
             */
            shop_name?: /* Shop Name */ string | null
            /**
             * Installation Id
             */
            installation_id?: /* Installation Id */ string | null
            /**
             * Widget App Id
             */
            widget_app_id: string
            /**
             * Campaign Id
             */
            campaign_id: string
            scenario: /* ProductRecommendationScenarioType */ ProductRecommendationScenarioType
            /**
             * Guest Id
             */
            guest_id: string
            /**
             * Customer Id
             */
            customer_id?: /* Customer Id */ number | null
            current_product?: /* ProductInfoSchema */ ProductInfoSchema | null
            /**
             * Visited Products
             */
            visited_products: /* ProductInfoSchema */ ProductInfoSchema[]
            /**
             * Cart Products
             */
            cart_products: /* ProductInfoSchema */ ProductInfoSchema[]
        }
        /**
         * ProductRecommendationResponseSchema
         */
        export interface ProductRecommendationResponseSchema {
            /**
             * Products
             */
            products: /* ProductSchema */ ProductSchema[]
        }
        /**
         * ProductRecommendationScenarioType
         */
        export type ProductRecommendationScenarioType =
            | 'similar_seen'
            | 'similar_bought'
            | 'out_of_stock_alternatives'
            | 'best_seller'
            | 'newest'
        /**
         * ProductSchema
         */
        export interface ProductSchema {
            /**
             * Id
             */
            id: number
            /**
             * Title
             */
            title: string
            /**
             * Handle
             */
            handle: string
            /**
             * Variants
             */
            variants: /* ProductVariant */ ProductVariant[]
            /**
             * Options
             */
            options: /* ProductOption */ ProductOption[]
            /**
             * Image Url
             */
            image_url: /* Image Url */ string | null
        }
        /**
         * ProductVariant
         */
        export interface ProductVariant {
            /**
             * Id
             */
            id: number
            /**
             * Title
             */
            title: string
            /**
             * Price
             */
            price: /* Price */ number | string
            /**
             * Options
             */
            options: string[]
        }
        /**
         * PublicABGroupResponseSchema
         */
        export interface PublicABGroupResponseSchema {
            status: /* ABGroupStatus */ ABGroupStatus
        }
        /**
         * PublicCampaignResponseSchema
         * Contains only fields allowed to be seen by the public, e.g. no channel_connection_id.
         */
        export interface PublicCampaignResponseSchema {
            /**
             * Name
             */
            name: string
            /**
             * Description
             */
            description?: /* Description */ string | null
            /**
             * Message Text
             */
            message_text: string
            /**
             * Message Html
             */
            message_html?: /* Message Html */ string | null
            /**
             * Language
             */
            language?: /* Language */ string | null
            status: /* CampaignStatus */ CampaignStatus
            /**
             * Trigger Rule
             */
            trigger_rule: string
            /**
             * Attachments
             */
            attachments?: /* Attachments */
            | /* CampaignAttachmentProductSchema */ (
                      | CampaignAttachmentProductSchema
                      | /* CampaignAttachmentDiscountOfferSchema */ CampaignAttachmentDiscountOfferSchema
                      | /* CampaignAttachmentVisitorFormSchema */ CampaignAttachmentVisitorFormSchema
                      | /* CampaignAttachmentProductRecommendationSchema */ CampaignAttachmentProductRecommendationSchema
                  )[]
                | null
            /**
             * Meta
             */
            meta?: /* Meta */ {
                [key: string]: any
            } | null
            /**
             * Triggers
             */
            triggers: /* CampaignTriggerSchema */ CampaignTriggerSchema[]
            /**
             * Id
             */
            id: string
            /**
             * Is Light
             */
            is_light: boolean
            /**
             * Created Datetime
             */
            created_datetime: string // date-time
            /**
             * Updated Datetime
             */
            updated_datetime: string // date-time
            /**
             * Deleted Datetime
             */
            deleted_datetime?: /* Deleted Datetime */
            string /* date-time */ | null
            /**
             * Variants
             */
            variants: /* PublicCampaignVariantResponseSchema */ PublicCampaignVariantResponseSchema[]
            ab_group?: /* PublicABGroupResponseSchema */ PublicABGroupResponseSchema | null
            schedule?: /* ScheduleResponseSchema */ ScheduleResponseSchema | null
        }
        /**
         * PublicCampaignVariantResponseSchema
         */
        export interface PublicCampaignVariantResponseSchema {
            /**
             * Message Text
             */
            message_text: string
            /**
             * Message Html
             */
            message_html?: /* Message Html */ string | null
            /**
             * Attachments
             */
            attachments?: /* Attachments */
            | /* CampaignAttachmentProductSchema */ (
                      | CampaignAttachmentProductSchema
                      | /* CampaignAttachmentDiscountOfferSchema */ CampaignAttachmentDiscountOfferSchema
                      | /* CampaignAttachmentVisitorFormSchema */ CampaignAttachmentVisitorFormSchema
                      | /* CampaignAttachmentProductRecommendationSchema */ CampaignAttachmentProductRecommendationSchema
                  )[]
                | null
            /**
             * Id
             */
            id: string
        }
        /**
         * PurchasesSchema
         */
        export interface PurchasesSchema {
            /**
             * Products
             */
            products: /* InteractedProductSchema */ InteractedProductSchema[]
            /**
             * Total Amount Spent
             */
            total_amount_spent?: /* Total Amount Spent */ number | null
            /**
             * Total Orders Count
             */
            total_orders_count?: /* Total Orders Count */ number | null
        }
        /**
         * RequestSettingSchema
         */
        export interface RequestSettingSchema {
            /**
             * Data
             */
            data: {
                [key: string]: any
            }
            type: /* SettingType */ SettingType
        }
        /**
         * RevealDiscountCodeRequestSchema
         */
        export interface RevealDiscountCodeRequestSchema {
            /**
             * Account Id
             */
            account_id: number
            /**
             * Campaign Id
             */
            campaign_id: string
        }
        /**
         * RevealDiscountCodeResponseSchema
         */
        export interface RevealDiscountCodeResponseSchema {
            /**
             * Code
             */
            code: string
            type: /* DiscountOfferTypeEnum */ DiscountOfferTypeEnum
            /**
             * Value
             */
            value: number
        }
        /**
         * RuleOperator
         */
        export type RuleOperator =
            | 'eq'
            | 'neq'
            | 'gt'
            | 'gte'
            | 'lt'
            | 'lte'
            | 'in'
            | 'notIn'
            | 'contains'
            | 'containsAll'
            | 'containsAny'
            | 'notContains'
        /**
         * RuleSchema
         */
        export interface RuleSchema {
            key: /* RuleType */ RuleType
            operator: /* RuleOperator */ RuleOperator
            /**
             * Value
             */
            value: string
        }
        /**
         * RuleType
         */
        export type RuleType =
            | 'orders_count'
            | 'amount_spent'
            | 'ordered_products'
            | 'customer_tags'
            | 'country_code'
        /**
         * RunAiJourneyEngineResponseApiDTO
         */
        export interface RunAiJourneyEngineResponseApiDTO {
            /**
             * Event
             */
            event: {
                [key: string]: any
            }
            /**
             * Success
             */
            success: boolean
        }
        /**
         * SMSIntegrationApiDTO
         */
        export interface SMSIntegrationApiDTO {
            /**
             * Account Id
             */
            account_id: number
            /**
             * Store Integration Id
             */
            store_integration_id: number
            /**
             * Phone Number
             */
            phone_number?: /* Phone Number */ string | null
            /**
             * Sms Integration Id
             */
            sms_integration_id?: /* Sms Integration Id */ number | null
        }
        /**
         * ScheduleRequestSchema
         */
        export interface ScheduleRequestSchema {
            /**
             * Start Datetime
             */
            start_datetime: string // date-time
            /**
             * End Datetime
             */
            end_datetime?: /* End Datetime */ string /* date-time */ | null
            schedule_rule: /* ScheduleRule */ ScheduleRule
            /**
             * Custom Schedule
             */
            custom_schedule: /* Custom Schedule */ /* CustomScheduleSchema */
            CustomScheduleSchema[] | null
        }
        /**
         * ScheduleResponseSchema
         */
        export interface ScheduleResponseSchema {
            /**
             * Start Datetime
             */
            start_datetime: string // date-time
            /**
             * End Datetime
             */
            end_datetime?: /* End Datetime */ string /* date-time */ | null
            schedule_rule: /* ScheduleRule */ ScheduleRule
            /**
             * Custom Schedule
             */
            custom_schedule: /* Custom Schedule */ /* CustomScheduleSchema */
            CustomScheduleSchema[] | null
        }
        /**
         * ScheduleRule
         */
        export type ScheduleRule = 'anytime' | 'during' | 'outside' | 'custom'
        /**
         * SettingResponseSchema
         */
        export interface SettingResponseSchema {
            type: /* SettingType */ SettingType
            /**
             * Data
             */
            data: {
                [key: string]: any
            }
        }
        /**
         * SettingType
         */
        export type SettingType =
            | 'performance_report_visible_fields'
            | 'email_disclaimer'
            | 'campaign_frequency'
            | 'ai_journey'
        /**
         * ShopifyCartItemApiDTO
         */
        export interface ShopifyCartItemApiDTO {
            /**
             * Variant Id
             */
            variant_id: number
            /**
             * Product Id
             */
            product_id: number
            /**
             * Quantity
             */
            quantity: number
            /**
             * Price
             */
            price: number
            /**
             * Original Price
             */
            original_price: number
        }
        /**
         * ShopifyCartPayloadApiDTO
         */
        export interface ShopifyCartPayloadApiDTO {
            /**
             * Token
             */
            token: string
            /**
             * Currency
             */
            currency: string
            /**
             * Items
             */
            items: /* ShopifyCartItemApiDTO */ ShopifyCartItemApiDTO[]
            /**
             * Total Price
             */
            total_price: number
            /**
             * Item Count
             */
            item_count: number
        }
        /**
         * ShopperInterestLookupRequest
         */
        export interface ShopperInterestLookupRequest {
            /**
             * Account Id
             * Helpdesk account ID
             */
            account_id: number
            /**
             * Store Integration Id
             * Helpdesk store integration ID
             */
            store_integration_id: number
            /**
             * Marketing Id
             * Marketing ID of the shopper (revenue_id)
             */
            marketing_id?: /**
             * Marketing Id
             * Marketing ID of the shopper (revenue_id)
             */
            string | null
            /**
             * Customer Id
             * Helpdesk Customer ID
             */
            customer_id?: /**
             * Customer Id
             * Helpdesk Customer ID
             */
            number | null
            /**
             * Email
             * Email of the shopper
             */
            email?: /**
             * Email
             * Email of the shopper
             */
            string | null
            /**
             * Phone
             * Phone of the shopper
             */
            phone?: /**
             * Phone
             * Phone of the shopper
             */
            string | null
        }
        /**
         * ShopperInterestLookupResponse
         */
        export interface ShopperInterestLookupResponse {
            current_session: /* ShopperSessionSchema */ ShopperSessionSchema | null
            latest_session: /* ShopperSessionSchema */ ShopperSessionSchema | null
            past_activity: /* PastActivitySchema */ PastActivitySchema
            communication_opt_in: /* CommunicationOptInSchema */ CommunicationOptInSchema
            attributed_orders?: /* PurchasesSchema */ PurchasesSchema | null
            /**
             * Customer Id
             */
            customer_id?: /* Customer Id */ number | null
        }
        /**
         * ShopperSessionSchema
         */
        export interface ShopperSessionSchema {
            /**
             * Start Datetime
             */
            start_datetime: string // date-time
            /**
             * End Datetime
             */
            end_datetime?: /* End Datetime */ string /* date-time */ | null
            /**
             * Duration Seconds
             */
            duration_seconds?: /* Duration Seconds */ number | null
            /**
             * Top Visited Pages
             */
            top_visited_pages?: /* VisitedPageSchema */ VisitedPageSchema[]
            /**
             * Top Visited Product Pages
             */
            top_visited_product_pages?: /* VisitedProductPageSchema */ VisitedProductPageSchema[]
            /**
             * Total Visited Pages Count
             */
            total_visited_pages_count?: number
            traffic_source?: /* TrafficSource */ TrafficSource | null
            traffic_metadata?: /* TrafficMetadata */ TrafficMetadata | null
            cart?: /* CartSchema */ CartSchema | null
        }
        /**
         * StatusEnum
         */
        export type StatusEnum = 'draft' | 'installed' | 'uninstalled'
        /**
         * SubscriptionStatus
         */
        export type SubscriptionStatus = 'active' | 'inactive' | 'trial'
        /**
         * SubscriptionStatusSchema
         */
        export interface SubscriptionStatusSchema {
            status: /* SubscriptionStatus */ SubscriptionStatus
            usage_status: /* SubscriptionUsageStatus */ SubscriptionUsageStatus
        }
        /**
         * SubscriptionUsageAndBundleStatusSchema
         */
        export interface SubscriptionUsageAndBundleStatusSchema {
            status: /* SubscriptionStatus */ SubscriptionStatus
            usage_status: /* SubscriptionUsageStatus */ SubscriptionUsageStatus
            /**
             * Usage
             */
            usage?: /* Usage */ number | null
            /**
             * Limit
             */
            limit?: /* Limit */ number | null
            /**
             * Auto Upgrade Enabled
             */
            auto_upgrade_enabled?: boolean
            /**
             * Last Auto Upgrade At
             */
            last_auto_upgrade_at?: /* Last Auto Upgrade At */
            string /* date-time */ | null
            /**
             * Last Warning 90 At
             */
            last_warning_90_at?: /* Last Warning 90 At */
            string /* date-time */ | null
            /**
             * Last Warning 100 At
             */
            last_warning_100_at?: /* Last Warning 100 At */
            string /* date-time */ | null
            /**
             * Last Block At
             */
            last_block_at?: /* Last Block At */ string /* date-time */ | null
            /**
             * Estimated Usage Percentage
             */
            estimated_usage_percentage?: /* Estimated Usage Percentage */
            number | null
            /**
             * Estimated Reach Date
             */
            estimated_reach_date?: /* Estimated Reach Date */
            string /* date-time */ | null
            /**
             * Cycle Start
             */
            cycle_start?: /* Cycle Start */ string /* date-time */ | null
            /**
             * Cycle End
             */
            cycle_end?: /* Cycle End */ string /* date-time */ | null
            bundle_status: /* BundleOnboardingStatus */ BundleOnboardingStatus
        }
        /**
         * SubscriptionUsageStatus
         */
        export type SubscriptionUsageStatus = 'ok' | 'limit-reached'
        /**
         * TimeUnit
         */
        export type TimeUnit = 'seconds' | 'minutes' | 'hours'
        /**
         * TrafficMetadata
         */
        export interface TrafficMetadata {
            /**
             * Referrer
             */
            referrer?: /* Referrer */ string | null
            /**
             * Utm Source
             */
            utm_source?: /* Utm Source */ string | null
            /**
             * Utm Medium
             */
            utm_medium?: /* Utm Medium */ string | null
            /**
             * Utm Campaign
             */
            utm_campaign?: /* Utm Campaign */ string | null
            /**
             * Utm Term
             */
            utm_term?: /* Utm Term */ string | null
            /**
             * Utm Content
             */
            utm_content?: /* Utm Content */ string | null
            /**
             * Gclid
             */
            gclid?: /* Gclid */ string | null
            /**
             * Fbclid
             */
            fbclid?: /* Fbclid */ string | null
        }
        /**
         * TrafficSource
         */
        export type TrafficSource =
            | 'paid-search'
            | 'direct-traffic'
            | 'referral'
            | 'social-traffic'
            | 'organic-search'
        /**
         * URLBulkSchema
         */
        export interface URLBulkSchema {
            /**
             * Urls
             */
            urls: /* URLSchema */ URLSchema[]
        }
        /**
         * URLClickSchema
         */
        export interface URLClickSchema {
            /**
             * Client Ip
             */
            client_ip?: /* Client Ip */ string | null
            /**
             * Client Agent
             */
            client_agent?: /* Client Agent */ string | null
            /**
             * Client Referrer
             */
            client_referrer?: /* Client Referrer */ string | null
            /**
             * Created Datetime
             */
            created_datetime: string // date-time
        }
        /**
         * URLCreateBulkSchema
         */
        export interface URLCreateBulkSchema {
            /**
             * Urls
             */
            urls: [
                /* URLCreateSchema */ URLCreateSchema,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
                /* URLCreateSchema */ URLCreateSchema?,
            ]
        }
        /**
         * URLCreateSchema
         */
        export interface URLCreateSchema {
            /**
             * Is Shortened
             */
            is_shortened?: boolean
            /**
             * Account Id
             */
            account_id: number
            /**
             * Channel
             */
            channel?: /* Channel */ string | null
            /**
             * Url
             */
            url: string // uri
            /**
             * Meta
             */
            meta?: {
                [key: string]: any
            }
            /**
             * Alias
             */
            alias: string
        }
        /**
         * URLSchema
         */
        export interface URLSchema {
            /**
             * Id
             */
            id: number
            /**
             * Account Id
             */
            account_id: number
            /**
             * Url
             */
            url: string // uri
            /**
             * Created Datetime
             */
            created_datetime: string // date-time
            /**
             * Is Shortened
             */
            is_shortened: boolean
            /**
             * Alias
             */
            alias: string
            /**
             * Short Url
             */
            short_url?: /* Short Url */ string | null
            /**
             * Channel
             */
            channel?: /* Channel */ string | null
            custom_domain?: /* CustomDomainSchema */ CustomDomainSchema | null
        }
        /**
         * URLWithClicksSchema
         */
        export interface URLWithClicksSchema {
            /**
             * Id
             */
            id: number
            /**
             * Account Id
             */
            account_id: number
            /**
             * Url
             */
            url: string // uri
            /**
             * Created Datetime
             */
            created_datetime: string // date-time
            /**
             * Is Shortened
             */
            is_shortened: boolean
            /**
             * Alias
             */
            alias: string
            /**
             * Short Url
             */
            short_url?: /* Short Url */ string | null
            /**
             * Channel
             */
            channel?: /* Channel */ string | null
            custom_domain?: /* CustomDomainSchema */ CustomDomainSchema | null
            /**
             * Clicks
             */
            clicks: /* URLClickSchema */ URLClickSchema[]
        }
        /**
         * UpdateAutoUpgradeSchema
         */
        export interface UpdateAutoUpgradeSchema {
            /**
             * Enabled
             */
            enabled: boolean
        }
        /**
         * UpdateJourneyApiDTO
         */
        export interface UpdateJourneyApiDTO {
            state?: /* JourneyStatusEnum */ JourneyStatusEnum | null
            /**
             * Message Instructions
             */
            message_instructions?: /* Message Instructions */ string | null
            configuration?: /* CartAbandonedJourneyConfigurationApiDTO */ CartAbandonedJourneyConfigurationApiDTO | null
        }
        /**
         * ValidationError
         */
        export interface ValidationError {
            /**
             * Location
             */
            loc: (string | number)[]
            /**
             * Message
             */
            msg: string
            /**
             * Error Type
             */
            type: string
        }
        /**
         * VisitedPageSchema
         */
        export interface VisitedPageSchema {
            /**
             * Url
             */
            url?: /* Url */ string | null
            /**
             * Page Title
             */
            page_title?: /* Page Title */ string | null
            /**
             * Search Query
             */
            search_query?: /* Search Query */ string | null
            /**
             * Visit Count
             */
            visit_count?: number
            /**
             * Last Visit Datetime
             */
            last_visit_datetime: string // date-time
            /**
             * Type
             */
            type?: 'other'
        }
        /**
         * VisitedProductPageSchema
         */
        export interface VisitedProductPageSchema {
            /**
             * Url
             */
            url?: /* Url */ string | null
            /**
             * Page Title
             */
            page_title?: /* Page Title */ string | null
            /**
             * Search Query
             */
            search_query?: /* Search Query */ string | null
            /**
             * Visit Count
             */
            visit_count?: number
            /**
             * Last Visit Datetime
             */
            last_visit_datetime: string // date-time
            /**
             * Type
             */
            type?: 'product'
            product: /* InteractedProductSchema */ InteractedProductSchema
        }
        /**
         * VisitorFormFieldName
         */
        export type VisitorFormFieldName =
            | 'email'
            | 'phone'
            | 'first_name'
            | 'last_name'
        /**
         * VisitorFormFieldType
         */
        export type VisitorFormFieldType = 'email' | 'phone' | 'text'
        /**
         * VisitorFormFieldsSchema
         */
        export interface VisitorFormFieldsSchema {
            name: /* VisitorFormFieldName */ VisitorFormFieldName
            /**
             * Label
             */
            label?: /* Label */ string | null
            type: /* VisitorFormFieldType */ VisitorFormFieldType
            /**
             * Required
             */
            required: boolean
        }
        /**
         * VisitorFormOnSuccessContentSchema
         */
        export interface VisitorFormOnSuccessContentSchema {
            /**
             * Message
             */
            message?: /* Message */ string | null
        }
        /**
         * VisitorFormStepSchema
         */
        export interface VisitorFormStepSchema {
            /**
             * Cta
             */
            cta?: /* Cta */ string | null
            /**
             * Fields
             */
            fields: /* VisitorFormFieldsSchema */ VisitorFormFieldsSchema[]
        }
        /**
         * VisitorFormSubmissionSchema
         */
        export interface VisitorFormSubmissionSchema {
            /**
             * First Name
             */
            first_name?: /* First Name */ string | null
            /**
             * Last Name
             */
            last_name?: /* Last Name */ string | null
            /**
             * Phone
             */
            phone?: /* Phone */ string /* phone */ | null
            /**
             * Email
             */
            email?: /* Email */ string /* email */ | null
            /**
             * Campaign Id
             */
            campaign_id: string
            /**
             * Shop Name
             */
            shop_name: string
            /**
             * Guest Id
             */
            guest_id?: /* Guest Id */ string | null
            /**
             * Session Id
             */
            session_id?: /* Session Id */ string | null
            /**
             * Ab Variant
             */
            ab_variant?: /* Ab Variant */ string | null
        }
        /**
         * VisitorFormSubscriberType
         */
        export type VisitorFormSubscriberType = 'email' | 'sms'
        /**
         * VisitorFormTargetType
         */
        export type VisitorFormTargetType = 'shopify' | 'gorgias'
        /**
         * VisitorFormTargetsSchema
         */
        export interface VisitorFormTargetsSchema {
            type: /* VisitorFormTargetType */ VisitorFormTargetType
            /**
             * Subscriber Types
             */
            subscriber_types: /* VisitorFormSubscriberType */ VisitorFormSubscriberType[]
            /**
             * Tags
             */
            tags?: /* Tags */ string[] | null
        }
    }
}
declare namespace Paths {
    namespace CheckCustomDomain {
        namespace Responses {
            export type $200 =
                /* CustomDomainSchema */ Components.Schemas.CustomDomainSchema
        }
    }
    namespace CheckCustomDomainsCheckPost {
        namespace Responses {
            export type $200 =
                /* CustomDomainSchema */ Components.Schemas.CustomDomainSchema
        }
    }
    namespace CreateAbGroup {
        namespace Parameters {
            /**
             * Campaign Id
             */
            export type CampaignId = string
        }
        export interface PathParameters {
            campaign_id: /* Campaign Id */ Parameters.CampaignId
        }
        namespace Responses {
            export type $200 =
                /* ABGroupResponseSchema */ Components.Schemas.ABGroupResponseSchema
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace CreateAbTest {
        export type RequestBody =
            /* ABTestCreateRequestSchema */ Components.Schemas.ABTestCreateRequestSchema
        namespace Responses {
            export type $201 =
                /* ABTestResponseSchema */ Components.Schemas.ABTestResponseSchema
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace CreateBulkClickTrackingBulkPost {
        export type RequestBody =
            /* JWTTokenSchema */ Components.Schemas.JWTTokenSchema
        namespace Responses {
            export type $201 =
                /* URLBulkSchema */ Components.Schemas.URLBulkSchema
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace CreateCampaign {
        export type RequestBody =
            /* CampaignCreateRequestSchema */ Components.Schemas.CampaignCreateRequestSchema
        namespace Responses {
            export type $201 =
                /* CampaignResponseSchema */ Components.Schemas.CampaignResponseSchema
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace CreateChannelConnection {
        export type RequestBody =
            /* ChannelConnectionCreateRequestSchema */ Components.Schemas.ChannelConnectionCreateRequestSchema
        namespace Responses {
            export type $201 =
                /* ChannelConnectionResponseSchema */ Components.Schemas.ChannelConnectionResponseSchema
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace CreateClickTrackingPost {
        export type RequestBody =
            /* JWTTokenSchema */ Components.Schemas.JWTTokenSchema
        namespace Responses {
            export type $201 = /* URLSchema */ Components.Schemas.URLSchema
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace CreateCustomDomain {
        export type RequestBody =
            /* CustomDomainOperationSchema */ Components.Schemas.CustomDomainOperationSchema
        namespace Responses {
            export type $201 =
                /* CustomDomainSchema */ Components.Schemas.CustomDomainSchema
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace CreateCustomDomainsPost {
        export type RequestBody =
            /* CustomDomainOperationSchema */ Components.Schemas.CustomDomainOperationSchema
        namespace Responses {
            export type $201 =
                /* CustomDomainSchema */ Components.Schemas.CustomDomainSchema
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace CreateDiscountOffer {
        export type RequestBody =
            /* DiscountOfferCreateApiDTO */ Components.Schemas.DiscountOfferCreateApiDTO
        namespace Responses {
            export type $201 =
                /* DiscountOfferApiDTO */ Components.Schemas.DiscountOfferApiDTO
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace CreateJourney {
        export type RequestBody =
            /* CreateJourneyApiDTO */ Components.Schemas.CreateJourneyApiDTO
        namespace Responses {
            export type $201 =
                /* JourneyDetailApiDTO */ Components.Schemas.JourneyDetailApiDTO
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace DeleteCampaign {
        namespace Parameters {
            /**
             * Campaign Id
             */
            export type CampaignId = string
        }
        export interface PathParameters {
            campaign_id: /* Campaign Id */ Parameters.CampaignId
        }
        namespace Responses {
            export interface $204 {}
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace DeleteChannelConnection {
        namespace Parameters {
            /**
             * Channel Connection Id
             */
            export type ChannelConnectionId = string
        }
        export interface PathParameters {
            channel_connection_id: /* Channel Connection Id */ Parameters.ChannelConnectionId
        }
        namespace Responses {
            export interface $204 {}
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace DeleteCustomDomain {
        namespace Responses {
            export interface $204 {}
        }
    }
    namespace DeleteCustomDomainsDelete {
        namespace Responses {
            export interface $204 {}
        }
    }
    namespace DeleteDiscountOffer {
        namespace Parameters {
            /**
             * Discount Offer Id
             */
            export type DiscountOfferId = string
        }
        export interface PathParameters {
            discount_offer_id: /* Discount Offer Id */ Parameters.DiscountOfferId
        }
        namespace Responses {
            export interface $204 {}
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace EvaluateCampaignRules {
        export interface HeaderParameters {
            'cf-ipcountry'?: /* Cf-Ipcountry */ Parameters.CfIpcountry
        }
        namespace Parameters {
            /**
             * Cf-Ipcountry
             */
            export type CfIpcountry = /* Cf-Ipcountry */ string | null
        }
        export type RequestBody =
            /* EvaluationRequestSchema */ Components.Schemas.EvaluationRequestSchema
        namespace Responses {
            export type $200 =
                /* EvaluationResponseSchema */ Components.Schemas.EvaluationResponseSchema
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace GetAbTest {
        namespace Parameters {
            /**
             * Ab Test Id
             */
            export type AbTestId = string
        }
        export interface PathParameters {
            ab_test_id: /* Ab Test Id */ Parameters.AbTestId
        }
        namespace Responses {
            export type $200 =
                /* ABTestResponseSchema */ Components.Schemas.ABTestResponseSchema
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace GetAbTests {
        namespace Parameters {
            /**
             * Channel Connection Id
             * Channel connection ID to which AB tests belong
             */
            export type ChannelConnectionId =
                /**
                 * Channel Connection Id
                 * Channel connection ID to which AB tests belong
                 */
                string | null
            /**
             * State
             * State of A/B test
             */
            export type State =
                /**
                 * State
                 * State of A/B test
                 */
                /* ABTestState */ Components.Schemas.ABTestState | null
        }
        export interface QueryParameters {
            channel_connection_id?: /**
             * Channel Connection Id
             * Channel connection ID to which AB tests belong
             */
            Parameters.ChannelConnectionId
            state?: /**
             * State
             * State of A/B test
             */
            Parameters.State
        }
        namespace Responses {
            /**
             * Response Get Ab Tests
             */
            export type $200 =
                /* ABTestResponseSchema */ Components.Schemas.ABTestResponseSchema[]
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace GetAllCampaigns {
        export interface HeaderParameters {
            'data-token'?: /* Data-Token */ Parameters.DataToken
        }
        namespace Parameters {
            /**
             * Data-Token
             */
            export type DataToken = /* Data-Token */ string | null
        }
        namespace Responses {
            /**
             * Response Get All Campaigns
             */
            export type $200 =
                /* CampaignResponseSchema */ Components.Schemas.CampaignResponseSchema[]
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace GetAllJourneysPrivate {
        namespace Parameters {
            /**
             * Type
             * Filter by type
             */
            export type Type =
                /**
                 * Type
                 * Filter by type
                 */
                /* JourneyTypeEnum */ Components.Schemas.JourneyTypeEnum | null
        }
        export interface QueryParameters {
            type?: /**
             * Type
             * Filter by type
             */
            Parameters.Type
        }
        namespace Responses {
            /**
             * Response Get All Journeys Private
             */
            export type $200 =
                /* JourneyPrivateApiDTO */ Components.Schemas.JourneyPrivateApiDTO[]
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace GetAllJourneysPublic {
        namespace Parameters {
            /**
             * Integration Id
             * Filter by integration ID
             */
            export type IntegrationId = number
        }
        export interface QueryParameters {
            integration_id: /**
             * Integration Id
             * Filter by integration ID
             */
            Parameters.IntegrationId
        }
        namespace Responses {
            /**
             * Response Get All Journeys Public
             */
            export type $200 =
                /* JourneyApiDTO */ Components.Schemas.JourneyApiDTO[]
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace GetBundleInstallation {
        namespace Parameters {
            /**
             * Id
             */
            export type Id = string
        }
        export interface PathParameters {
            id: /* Id */ Parameters.Id
        }
        namespace Responses {
            export type $200 =
                /* InstallationSchema */ Components.Schemas.InstallationSchema
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace GetCampaign {
        namespace Parameters {
            /**
             * Campaign Id
             */
            export type CampaignId = string
        }
        export interface PathParameters {
            campaign_id: /* Campaign Id */ Parameters.CampaignId
        }
        namespace Responses {
            export type $200 =
                /* CampaignResponseSchema */ Components.Schemas.CampaignResponseSchema
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace GetCampaigns {
        namespace Parameters {
            /**
             * Channel Connection External Ids
             * Channel connection external ID
             */
            export type ChannelConnectionExternalIds =
                /**
                 * Channel Connection External Ids
                 * Channel connection external ID
                 */
                string[] | null
            /**
             * Channel Connection Id
             * Channel connection ID to which campaigns belong
             */
            export type ChannelConnectionId =
                /**
                 * Channel Connection Id
                 * Channel connection ID to which campaigns belong
                 */
                string | null
            /**
             * Deleted
             * Include deleted campaigns
             */
            export type Deleted = boolean
        }
        export interface QueryParameters {
            channel_connection_id?: /**
             * Channel Connection Id
             * Channel connection ID to which campaigns belong
             */
            Parameters.ChannelConnectionId
            channel_connection_external_ids?: /**
             * Channel Connection External Ids
             * Channel connection external ID
             */
            Parameters.ChannelConnectionExternalIds
            deleted?: /**
             * Deleted
             * Include deleted campaigns
             */
            Parameters.Deleted
        }
        namespace Responses {
            /**
             * Response Get Campaigns
             */
            export type $200 =
                /* CampaignResponseSchema */ Components.Schemas.CampaignResponseSchema[]
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace GetChannelConnection {
        namespace Parameters {
            /**
             * Channel Connection Id
             */
            export type ChannelConnectionId = string
        }
        export interface PathParameters {
            channel_connection_id: /* Channel Connection Id */ Parameters.ChannelConnectionId
        }
        namespace Responses {
            export type $200 =
                /* ChannelConnectionResponseSchema */ Components.Schemas.ChannelConnectionResponseSchema
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace GetChannelConnections {
        namespace Parameters {
            /**
             * Channel
             * Channel type, e.g. widget
             */
            export type Channel =
                /**
                 * Channel
                 * Channel type, e.g. widget
                 */
                /* ChannelType */ Components.Schemas.ChannelType | null
            /**
             * External Id
             * External ID connected to the Channel connection, usually dependent on the channel type
             */
            export type ExternalId =
                /**
                 * External Id
                 * External ID connected to the Channel connection, usually dependent on the channel type
                 */
                string | null
            /**
             * Store Integration Id
             * Gorgias integration ID for the store
             */
            export type StoreIntegrationId =
                /**
                 * Store Integration Id
                 * Gorgias integration ID for the store
                 */
                number | null
        }
        export interface QueryParameters {
            store_integration_id?: /**
             * Store Integration Id
             * Gorgias integration ID for the store
             */
            Parameters.StoreIntegrationId
            external_id?: /**
             * External Id
             * External ID connected to the Channel connection, usually dependent on the channel type
             */
            Parameters.ExternalId
            channel?: /**
             * Channel
             * Channel type, e.g. widget
             */
            Parameters.Channel
        }
        namespace Responses {
            /**
             * Response Get Channel Connections
             */
            export type $200 =
                /* ChannelConnectionResponseSchema */ Components.Schemas.ChannelConnectionResponseSchema[]
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace GetConfigAssistantConfigsRevenueInstallationIdGet {
        namespace Parameters {
            /**
             * Installation Id
             */
            export type InstallationId = string
            /**
             * Widget-App-Id
             */
            export type WidgetAppId = /* Widget-App-Id */ string | null
        }
        export interface PathParameters {
            installation_id: /* Installation Id */ Parameters.InstallationId
        }
        export interface QueryParameters {
            'widget-app-id'?: /* Widget-App-Id */ Parameters.WidgetAppId
        }
        namespace Responses {
            export type $200 =
                /* ConfigResponseSchema */ Components.Schemas.ConfigResponseSchema
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace GetConfigByRevenueId {
        namespace Parameters {
            /**
             * Installation Id
             */
            export type InstallationId = string
            /**
             * Widget-App-Id
             */
            export type WidgetAppId = /* Widget-App-Id */ string | null
        }
        export interface PathParameters {
            installation_id: /* Installation Id */ Parameters.InstallationId
        }
        export interface QueryParameters {
            'widget-app-id'?: /* Widget-App-Id */ Parameters.WidgetAppId
        }
        namespace Responses {
            export type $200 =
                /* ConfigResponseSchema */ Components.Schemas.ConfigResponseSchema
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace GetConfigByShopName {
        namespace Parameters {
            /**
             * Shop Name
             */
            export type ShopName = string
            /**
             * Widget-App-Id
             */
            export type WidgetAppId = /* Widget-App-Id */ string | null
        }
        export interface PathParameters {
            shop_name: /* Shop Name */ Parameters.ShopName
        }
        export interface QueryParameters {
            'widget-app-id'?: /* Widget-App-Id */ Parameters.WidgetAppId
        }
        namespace Responses {
            export type $200 =
                /* ConfigResponseSchema */ Components.Schemas.ConfigResponseSchema
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace GetCustomDomain {
        namespace Responses {
            export type $200 =
                /* CustomDomainSchema */ Components.Schemas.CustomDomainSchema
        }
    }
    namespace GetDiscountOffer {
        namespace Parameters {
            /**
             * Discount Offer Id
             */
            export type DiscountOfferId = string
        }
        export interface PathParameters {
            discount_offer_id: /* Discount Offer Id */ Parameters.DiscountOfferId
        }
        namespace Responses {
            export type $200 =
                /* DiscountOfferApiDTO */ Components.Schemas.DiscountOfferApiDTO
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace GetDiscountOffers {
        namespace Parameters {
            /**
             * Search
             * Search by prefix
             */
            export type Search =
                /**
                 * Search
                 * Search by prefix
                 */
                string | null
            /**
             * Store Integration Id
             * Helpdesk store integration id
             */
            export type StoreIntegrationId = string
        }
        export interface QueryParameters {
            search?: /**
             * Search
             * Search by prefix
             */
            Parameters.Search
            store_integration_id: /**
             * Store Integration Id
             * Helpdesk store integration id
             */
            Parameters.StoreIntegrationId
        }
        namespace Responses {
            /**
             * Response Get Discount Offers
             */
            export type $200 =
                /* DiscountOfferApiDTO */ Components.Schemas.DiscountOfferApiDTO[]
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace GetJourneyDetails {
        namespace Parameters {
            /**
             * Journey Id
             */
            export type JourneyId = string
        }
        export interface PathParameters {
            journey_id: /* Journey Id */ Parameters.JourneyId
        }
        namespace Responses {
            export type $200 =
                /* JourneyDetailApiDTO */ Components.Schemas.JourneyDetailApiDTO
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace GetSettings {
        namespace Parameters {
            /**
             * Channel Connection Id
             */
            export type ChannelConnectionId = string
            /**
             * Setting Type
             * Get settings by type
             */
            export type SettingType =
                /**
                 * Setting Type
                 * Get settings by type
                 */
                string | null
        }
        export interface PathParameters {
            channel_connection_id: /* Channel Connection Id */ Parameters.ChannelConnectionId
        }
        export interface QueryParameters {
            setting_type?: /**
             * Setting Type
             * Get settings by type
             */
            Parameters.SettingType
        }
        namespace Responses {
            /**
             * Response Get Settings
             */
            export type $200 =
                /* SettingResponseSchema */ Components.Schemas.SettingResponseSchema[]
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace GetSmsIntegrations {
        namespace Responses {
            /**
             * Response Get Sms Integrations
             */
            export type $200 =
                /* SMSIntegrationApiDTO */ Components.Schemas.SMSIntegrationApiDTO[]
        }
    }
    namespace GetStatusAndUsage {
        namespace Parameters {
            /**
             * Shop Integration Id
             */
            export type ShopIntegrationId =
                /* Shop Integration Id */
                number | null
        }
        export interface QueryParameters {
            shop_integration_id?: /* Shop Integration Id */ Parameters.ShopIntegrationId
        }
        namespace Responses {
            export type $200 =
                /* SubscriptionUsageAndBundleStatusSchema */ Components.Schemas.SubscriptionUsageAndBundleStatusSchema
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace GetSubscriptionStatuses {
        namespace Responses {
            /**
             * Response Get Subscription Statuses
             */
            export interface $200 {
                [name: string]: string
            }
        }
    }
    namespace HealthCheckGet {
        namespace Responses {
            /**
             * Response Health Check  Get
             */
            export interface $200 {
                [name: string]: string
            }
        }
    }
    namespace HealthCheckHealthCheckGet {
        namespace Responses {
            /**
             * Response Health Check Health Check Get
             */
            export interface $200 {
                [name: string]: string
            }
        }
    }
    namespace ListBundleInstallation {
        namespace Responses {
            /**
             * Response List Bundle Installation
             */
            export type $200 =
                /* InstallationSchema */ Components.Schemas.InstallationSchema[]
        }
    }
    namespace PatchAbTest {
        namespace Parameters {
            /**
             * Ab Test Id
             */
            export type AbTestId = string
        }
        export interface PathParameters {
            ab_test_id: /* Ab Test Id */ Parameters.AbTestId
        }
        export type RequestBody =
            /* ABTestPatchRequestSchema */ Components.Schemas.ABTestPatchRequestSchema
        namespace Responses {
            export type $200 =
                /* ABTestResponseSchema */ Components.Schemas.ABTestResponseSchema
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace PatchCampaign {
        namespace Parameters {
            /**
             * Campaign Id
             */
            export type CampaignId = string
        }
        export interface PathParameters {
            campaign_id: /* Campaign Id */ Parameters.CampaignId
        }
        export type RequestBody =
            /**
             * CampaignPatchRequestSchema
             * Defines the fields that can be patched and accepts any subset of the fields.
             * Validates `triggers` and `trigger_rule` fields as required together - it has to be done this way
             * as long as the IDs are generated on the frontend.
             * Skips advanced validation, it will be handled in PATCH endpoint:
             *     see https://fastapi.tiangolo.com/tutorial/body-updates/#partial-updates-with-patch
             */
            Components.Schemas.CampaignPatchRequestSchema
        namespace Responses {
            export type $200 =
                /* CampaignResponseSchema */ Components.Schemas.CampaignResponseSchema
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace PatchChannelConnection {
        namespace Parameters {
            /**
             * Channel Connection Id
             */
            export type ChannelConnectionId = string
        }
        export interface PathParameters {
            channel_connection_id: /* Channel Connection Id */ Parameters.ChannelConnectionId
        }
        export type RequestBody =
            /**
             * ChannelPatchRequestSchema
             * Defines the fields that can be patched and accepts any subset of the fields.
             * Skips advanced validation, it will be handled in PATCH endpoint:
             *     see https://fastapi.tiangolo.com/tutorial/body-updates/#partial-updates-with-patch
             */
            Components.Schemas.ChannelPatchRequestSchema
        namespace Responses {
            export type $200 =
                /* ChannelConnectionResponseSchema */ Components.Schemas.ChannelConnectionResponseSchema
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace PatchDiscountOffer {
        namespace Parameters {
            /**
             * Discount Offer Id
             */
            export type DiscountOfferId = string
        }
        export interface PathParameters {
            discount_offer_id: /* Discount Offer Id */ Parameters.DiscountOfferId
        }
        export type RequestBody =
            /* DiscountOfferPatchApiDTO */ Components.Schemas.DiscountOfferPatchApiDTO
        namespace Responses {
            export type $200 =
                /* DiscountOfferApiDTO */ Components.Schemas.DiscountOfferApiDTO
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace PatchJourney {
        namespace Parameters {
            /**
             * Journey Id
             */
            export type JourneyId = string
        }
        export interface PathParameters {
            journey_id: /* Journey Id */ Parameters.JourneyId
        }
        export type RequestBody =
            /* UpdateJourneyApiDTO */ Components.Schemas.UpdateJourneyApiDTO
        namespace Responses {
            export type $200 =
                /* JourneyDetailApiDTO */ Components.Schemas.JourneyDetailApiDTO
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace PauseAbGroup {
        namespace Parameters {
            /**
             * Campaign Id
             */
            export type CampaignId = string
        }
        export interface PathParameters {
            campaign_id: /* Campaign Id */ Parameters.CampaignId
        }
        namespace Responses {
            export type $200 =
                /* ABGroupResponseSchema */ Components.Schemas.ABGroupResponseSchema
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace RecommendationsProduct {
        export type RequestBody =
            /* ProductRecommendationRequestSchema */ Components.Schemas.ProductRecommendationRequestSchema
        namespace Responses {
            export type $200 =
                /* ProductRecommendationResponseSchema */ Components.Schemas.ProductRecommendationResponseSchema
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace RedirectRAliasGet {
        export interface HeaderParameters {
            referrer?: /* Referrer */ Parameters.Referrer
            'user-agent'?: /* User-Agent */ Parameters.UserAgent
        }
        namespace Parameters {
            /**
             * Alias
             */
            export type Alias = string
            /**
             * Referrer
             */
            export type Referrer = /* Referrer */ string | null
            /**
             * User-Agent
             */
            export type UserAgent = string
        }
        export interface PathParameters {
            alias: /* Alias */ Parameters.Alias
        }
        namespace Responses {
            export type $302 = any
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace RetrieveCustomDomainsGet {
        namespace Responses {
            export type $200 =
                /* CustomDomainSchema */ Components.Schemas.CustomDomainSchema
        }
    }
    namespace RetrieveUrlsByMetaClickTrackingCheckPost {
        export type RequestBody =
            /* JWTTokenSchema */ Components.Schemas.JWTTokenSchema
        namespace Responses {
            /**
             * Response Retrieve Urls By Meta Click Tracking Check Post
             */
            export type $201 =
                /* URLWithClicksSchema */ Components.Schemas.URLWithClicksSchema[]
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace RevealDiscountCode {
        export type RequestBody =
            /* RevealDiscountCodeRequestSchema */ Components.Schemas.RevealDiscountCodeRequestSchema
        namespace Responses {
            export type $200 =
                /* RevealDiscountCodeResponseSchema */ Components.Schemas.RevealDiscountCodeResponseSchema
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace RunAiJourneyEngine {
        namespace Parameters {
            /**
             * Account Id
             */
            export type AccountId = number
            /**
             * Customer Id
             * Customer ID for the cart
             */
            export type CustomerId =
                /**
                 * Customer Id
                 * Customer ID for the cart
                 */
                number | null
            /**
             * Store Integration Id
             */
            export type StoreIntegrationId = number
        }
        export interface PathParameters {
            account_id: /* Account Id */ Parameters.AccountId
            store_integration_id: /* Store Integration Id */ Parameters.StoreIntegrationId
        }
        export interface QueryParameters {
            customer_id?: /**
             * Customer Id
             * Customer ID for the cart
             */
            Parameters.CustomerId
        }
        export type RequestBody =
            /* ShopifyCartPayloadApiDTO */ Components.Schemas.ShopifyCartPayloadApiDTO
        namespace Responses {
            export type $200 =
                /* RunAiJourneyEngineResponseApiDTO */ Components.Schemas.RunAiJourneyEngineResponseApiDTO
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace ServiceInstallationGetOrCreateBundleInstallationsManagePost {
        export type RequestBody =
            /* JWTTokenSchema */ Components.Schemas.JWTTokenSchema
        namespace Responses {
            export type $201 =
                /* InstallationSchema */ Components.Schemas.InstallationSchema
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace ServiceInstallationStatusUpdateBundleInstallationsManagePut {
        export type RequestBody =
            /* JWTTokenSchema */ Components.Schemas.JWTTokenSchema
        namespace Responses {
            export type $200 =
                /* InstallationSchema */ Components.Schemas.InstallationSchema
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace ServiceRetrieveInstallationBundleInstallationsManageRetrievePost {
        export type RequestBody =
            /* JWTTokenSchema */ Components.Schemas.JWTTokenSchema
        namespace Responses {
            export type $200 =
                /* InstallationSchema */ Components.Schemas.InstallationSchema
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace ShopperInterestLookup {
        namespace Parameters {
            /**
             * Account Id
             * Helpdesk account ID
             */
            export type AccountId = number
            /**
             * Customer Id
             * Helpdesk Customer ID
             */
            export type CustomerId =
                /**
                 * Customer Id
                 * Helpdesk Customer ID
                 */
                number | null
            /**
             * Marketing Id
             * Marketing ID of the shopper (revenue_id)
             */
            export type MarketingId =
                /**
                 * Marketing Id
                 * Marketing ID of the shopper (revenue_id)
                 */
                string | null
            /**
             * Store Integration Id
             * Helpdesk store integration ID
             */
            export type StoreIntegrationId = number
            /**
             * Version
             */
            export type Version = /* Version */ ('v1.0' | 'v2.0') | null
        }
        export interface QueryParameters {
            account_id: /**
             * Account Id
             * Helpdesk account ID
             */
            Parameters.AccountId
            store_integration_id: /**
             * Store Integration Id
             * Helpdesk store integration ID
             */
            Parameters.StoreIntegrationId
            marketing_id?: /**
             * Marketing Id
             * Marketing ID of the shopper (revenue_id)
             */
            Parameters.MarketingId
            customer_id?: /**
             * Customer Id
             * Helpdesk Customer ID
             */
            Parameters.CustomerId
            version?: /* Version */ Parameters.Version
        }
        namespace Responses {
            export type $200 =
                /* ShopperInterestLookupResponse */ Components.Schemas.ShopperInterestLookupResponse
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace ShopperInterestLookupPost {
        namespace Parameters {
            /**
             * Version
             */
            export type Version = /* Version */ ('v1.0' | 'v2.0') | null
        }
        export interface QueryParameters {
            version?: /* Version */ Parameters.Version
        }
        export type RequestBody =
            /* ShopperInterestLookupRequest */ Components.Schemas.ShopperInterestLookupRequest
        namespace Responses {
            export type $200 =
                /* ShopperInterestLookupResponse */ Components.Schemas.ShopperInterestLookupResponse
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace ShortenShortenPost {
        export type RequestBody =
            /* URLCreateBulkSchema */ Components.Schemas.URLCreateBulkSchema
        namespace Responses {
            export type $201 =
                /* URLBulkSchema */ Components.Schemas.URLBulkSchema
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace StartAbGroup {
        namespace Parameters {
            /**
             * Campaign Id
             */
            export type CampaignId = string
        }
        export interface PathParameters {
            campaign_id: /* Campaign Id */ Parameters.CampaignId
        }
        namespace Responses {
            export type $200 =
                /* ABGroupResponseSchema */ Components.Schemas.ABGroupResponseSchema
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace StopAbGroup {
        namespace Parameters {
            /**
             * Campaign Id
             */
            export type CampaignId = string
        }
        export interface PathParameters {
            campaign_id: /* Campaign Id */ Parameters.CampaignId
        }
        export type RequestBody =
            /* ABGroupStopRequestSchema */ Components.Schemas.ABGroupStopRequestSchema
        namespace Responses {
            export type $200 =
                /* ABGroupResponseSchema */ Components.Schemas.ABGroupResponseSchema
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace SubmitContactForm {
        namespace Parameters {
            /**
             * Revenue Id
             */
            export type RevenueId = string
        }
        export interface PathParameters {
            revenue_id: /* Revenue Id */ Parameters.RevenueId
        }
        export type RequestBody =
            /* VisitorFormSubmissionSchema */ Components.Schemas.VisitorFormSubmissionSchema
        namespace Responses {
            /**
             * Response Submit Contact Form
             */
            export interface $202 {}
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace SuggestCampaignCopy {
        export type RequestBody =
            /* CampaignCopySuggestionRequestSchema */ Components.Schemas.CampaignCopySuggestionRequestSchema
        namespace Responses {
            export type $200 =
                /* CampaignCopySuggestionResponseSchema */ Components.Schemas.CampaignCopySuggestionResponseSchema
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace TestJourney {
        namespace Parameters {
            /**
             * Journey Id
             */
            export type JourneyId = string
        }
        export interface PathParameters {
            journey_id: /* Journey Id */ Parameters.JourneyId
        }
        export type RequestBody =
            /* CartAbandonedCartTestApiDTO */ Components.Schemas.CartAbandonedCartTestApiDTO
        namespace Responses {
            export type $201 = any
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace UpdateAutoUpgradeFlag {
        export type RequestBody =
            /* UpdateAutoUpgradeSchema */ Components.Schemas.UpdateAutoUpgradeSchema
        namespace Responses {
            export type $200 =
                /* UpdateAutoUpgradeSchema */ Components.Schemas.UpdateAutoUpgradeSchema
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace UpdateBundleInstallation {
        namespace Parameters {
            /**
             * Id
             */
            export type Id = string
        }
        export interface PathParameters {
            id: /* Id */ Parameters.Id
        }
        export type RequestBody =
            /* InstallationUpdateConfigSchema */ Components.Schemas.InstallationUpdateConfigSchema
        namespace Responses {
            export type $200 =
                /* InstallationSchema */ Components.Schemas.InstallationSchema
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
    namespace UpdateSetting {
        namespace Parameters {
            /**
             * Channel Connection Id
             */
            export type ChannelConnectionId = string
        }
        export interface PathParameters {
            channel_connection_id: /* Channel Connection Id */ Parameters.ChannelConnectionId
        }
        /**
         * Payload
         */
        export type RequestBody =
            /* Payload */ /* RequestSettingSchema */
            | Components.Schemas.RequestSettingSchema
            | /* RequestSettingSchema */ Components.Schemas.RequestSettingSchema[]
        namespace Responses {
            /**
             * Response Update Setting
             */
            export type $202 =
                /* Response Update Setting */ /* SettingResponseSchema */
                | Components.Schemas.SettingResponseSchema
                | /* SettingResponseSchema */ Components.Schemas.SettingResponseSchema[]
            export type $422 =
                /* HTTPValidationError */ Components.Schemas.HTTPValidationError
        }
    }
}

export interface OperationMethods {
    /**
     * get_ab_tests - Get Ab Tests
     */
    'get_ab_tests'(
        parameters?: Parameters<Paths.GetAbTests.QueryParameters> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetAbTests.Responses.$200>
    /**
     * create_ab_test - Create Ab Test
     */
    'create_ab_test'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.CreateAbTest.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.CreateAbTest.Responses.$201>
    /**
     * get_ab_test - Get Ab Test
     */
    'get_ab_test'(
        parameters: Parameters<Paths.GetAbTest.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetAbTest.Responses.$200>
    /**
     * patch_ab_test - Patch Ab Test
     */
    'patch_ab_test'(
        parameters: Parameters<Paths.PatchAbTest.PathParameters>,
        data?: Paths.PatchAbTest.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.PatchAbTest.Responses.$200>
    /**
     * evaluate_campaign_rules - Evaluate Campaign Rules
     */
    'evaluate_campaign_rules'(
        parameters?: Parameters<Paths.EvaluateCampaignRules.HeaderParameters> | null,
        data?: Paths.EvaluateCampaignRules.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.EvaluateCampaignRules.Responses.$200>
    /**
     * get_config_assistant_configs_revenue__installation_id__get - Get Config
     */
    'get_config_assistant_configs_revenue__installation_id__get'(
        parameters: Parameters<
            Paths.GetConfigAssistantConfigsRevenueInstallationIdGet.QueryParameters &
                Paths.GetConfigAssistantConfigsRevenueInstallationIdGet.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetConfigAssistantConfigsRevenueInstallationIdGet.Responses.$200>
    /**
     * get_config_by_revenue_id - Get Config
     */
    'get_config_by_revenue_id'(
        parameters: Parameters<
            Paths.GetConfigByRevenueId.QueryParameters &
                Paths.GetConfigByRevenueId.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetConfigByRevenueId.Responses.$200>
    /**
     * get_config_by_shop_name - Get Config By Shop Name
     */
    'get_config_by_shop_name'(
        parameters: Parameters<
            Paths.GetConfigByShopName.QueryParameters &
                Paths.GetConfigByShopName.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetConfigByShopName.Responses.$200>
    /**
     * reveal_discount_code - Reveal
     */
    'reveal_discount_code'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.RevealDiscountCode.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.RevealDiscountCode.Responses.$200>
    /**
     * recommendations_product - Recommend Products
     */
    'recommendations_product'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.RecommendationsProduct.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.RecommendationsProduct.Responses.$200>
    /**
     * submit_contact_form - Submit Contact Form
     */
    'submit_contact_form'(
        parameters: Parameters<Paths.SubmitContactForm.PathParameters>,
        data?: Paths.SubmitContactForm.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.SubmitContactForm.Responses.$202>
    /**
     * get_settings - Get Settings For Channel Connection
     */
    'get_settings'(
        parameters: Parameters<
            Paths.GetSettings.QueryParameters & Paths.GetSettings.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetSettings.Responses.$200>
    /**
     * update_setting - Update Setting For Channel Connection
     */
    'update_setting'(
        parameters: Parameters<Paths.UpdateSetting.PathParameters>,
        data?: Paths.UpdateSetting.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.UpdateSetting.Responses.$202>
    /**
     * get_discount_offers - Get Discount Offers
     */
    'get_discount_offers'(
        parameters?: Parameters<Paths.GetDiscountOffers.QueryParameters> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetDiscountOffers.Responses.$200>
    /**
     * create_discount_offer - Create Discount Offer
     */
    'create_discount_offer'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.CreateDiscountOffer.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.CreateDiscountOffer.Responses.$201>
    /**
     * get_discount_offer - Get Discount Offer
     */
    'get_discount_offer'(
        parameters: Parameters<Paths.GetDiscountOffer.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetDiscountOffer.Responses.$200>
    /**
     * patch_discount_offer - Patch Discount Offer
     */
    'patch_discount_offer'(
        parameters: Parameters<Paths.PatchDiscountOffer.PathParameters>,
        data?: Paths.PatchDiscountOffer.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.PatchDiscountOffer.Responses.$200>
    /**
     * delete_discount_offer - Delete Discount Offer
     */
    'delete_discount_offer'(
        parameters: Parameters<Paths.DeleteDiscountOffer.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.DeleteDiscountOffer.Responses.$204>
    /**
     * service_installation_status_update_bundle_installations_manage_put - Service Installation Status Update
     */
    'service_installation_status_update_bundle_installations_manage_put'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.ServiceInstallationStatusUpdateBundleInstallationsManagePut.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ServiceInstallationStatusUpdateBundleInstallationsManagePut.Responses.$200>
    /**
     * service_installation_get_or_create_bundle_installations_manage_post - Service Installation Get Or Create
     */
    'service_installation_get_or_create_bundle_installations_manage_post'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.ServiceInstallationGetOrCreateBundleInstallationsManagePost.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ServiceInstallationGetOrCreateBundleInstallationsManagePost.Responses.$201>
    /**
     * service_retrieve_installation_bundle_installations_manage_retrieve_post - Service Retrieve Installation
     */
    'service_retrieve_installation_bundle_installations_manage_retrieve_post'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.ServiceRetrieveInstallationBundleInstallationsManageRetrievePost.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ServiceRetrieveInstallationBundleInstallationsManageRetrievePost.Responses.$200>
    /**
     * list_bundle_installation - Installation List
     */
    'list_bundle_installation'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ListBundleInstallation.Responses.$200>
    /**
     * get_bundle_installation - Retrieve
     */
    'get_bundle_installation'(
        parameters: Parameters<Paths.GetBundleInstallation.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetBundleInstallation.Responses.$200>
    /**
     * update_bundle_installation - Update
     */
    'update_bundle_installation'(
        parameters: Parameters<Paths.UpdateBundleInstallation.PathParameters>,
        data?: Paths.UpdateBundleInstallation.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.UpdateBundleInstallation.Responses.$200>
    /**
     * create_click_tracking_post - Create
     */
    'create_click_tracking_post'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.CreateClickTrackingPost.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.CreateClickTrackingPost.Responses.$201>
    /**
     * create_bulk_click_tracking_bulk_post - Create Bulk
     */
    'create_bulk_click_tracking_bulk_post'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.CreateBulkClickTrackingBulkPost.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.CreateBulkClickTrackingBulkPost.Responses.$201>
    /**
     * shorten_shorten_post - Shorten
     */
    'shorten_shorten_post'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.ShortenShortenPost.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ShortenShortenPost.Responses.$201>
    /**
     * retrieve_urls_by_meta_click_tracking_check_post - Retrieve Urls By Meta
     */
    'retrieve_urls_by_meta_click_tracking_check_post'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.RetrieveUrlsByMetaClickTrackingCheckPost.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.RetrieveUrlsByMetaClickTrackingCheckPost.Responses.$201>
    /**
     * redirect_r__alias__get - Redirect
     */
    'redirect_r__alias__get'(
        parameters: Parameters<
            Paths.RedirectRAliasGet.HeaderParameters &
                Paths.RedirectRAliasGet.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<any>
    /**
     * get_custom_domain - Retrieve
     */
    'get_custom_domain'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetCustomDomain.Responses.$200>
    /**
     * create_custom_domain - Create
     */
    'create_custom_domain'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.CreateCustomDomain.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.CreateCustomDomain.Responses.$201>
    /**
     * delete_custom_domain - Delete
     */
    'delete_custom_domain'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.DeleteCustomDomain.Responses.$204>
    /**
     * check_custom_domain - Check
     */
    'check_custom_domain'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.CheckCustomDomain.Responses.$200>
    /**
     * retrieve_custom_domains_get - Retrieve
     */
    'retrieve_custom_domains_get'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.RetrieveCustomDomainsGet.Responses.$200>
    /**
     * create_custom_domains_post - Create
     */
    'create_custom_domains_post'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.CreateCustomDomainsPost.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.CreateCustomDomainsPost.Responses.$201>
    /**
     * delete_custom_domains_delete - Delete
     */
    'delete_custom_domains_delete'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.DeleteCustomDomainsDelete.Responses.$204>
    /**
     * check_custom_domains_check_post - Check
     */
    'check_custom_domains_check_post'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.CheckCustomDomainsCheckPost.Responses.$200>
    /**
     * get_campaigns - Get Campaigns
     */
    'get_campaigns'(
        parameters?: Parameters<Paths.GetCampaigns.QueryParameters> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetCampaigns.Responses.$200>
    /**
     * create_campaign - Create Campaign
     */
    'create_campaign'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.CreateCampaign.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.CreateCampaign.Responses.$201>
    /**
     * get_all_campaigns - Get All Campaigns
     */
    'get_all_campaigns'(
        parameters?: Parameters<Paths.GetAllCampaigns.HeaderParameters> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetAllCampaigns.Responses.$200>
    /**
     * get_campaign - Get Campaign
     */
    'get_campaign'(
        parameters: Parameters<Paths.GetCampaign.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetCampaign.Responses.$200>
    /**
     * patch_campaign - Patch Campaign
     */
    'patch_campaign'(
        parameters: Parameters<Paths.PatchCampaign.PathParameters>,
        data?: Paths.PatchCampaign.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.PatchCampaign.Responses.$200>
    /**
     * delete_campaign - Delete Campaign
     */
    'delete_campaign'(
        parameters: Parameters<Paths.DeleteCampaign.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.DeleteCampaign.Responses.$204>
    /**
     * create_ab_group - Create Ab Group
     */
    'create_ab_group'(
        parameters: Parameters<Paths.CreateAbGroup.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.CreateAbGroup.Responses.$200>
    /**
     * start_ab_group - Start Ab Group
     */
    'start_ab_group'(
        parameters: Parameters<Paths.StartAbGroup.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.StartAbGroup.Responses.$200>
    /**
     * pause_ab_group - Pause Ab Group
     */
    'pause_ab_group'(
        parameters: Parameters<Paths.PauseAbGroup.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.PauseAbGroup.Responses.$200>
    /**
     * stop_ab_group - Stop Ab Group
     */
    'stop_ab_group'(
        parameters: Parameters<Paths.StopAbGroup.PathParameters>,
        data?: Paths.StopAbGroup.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.StopAbGroup.Responses.$200>
    /**
     * suggest_campaign_copy - Suggest Campaign Copy
     */
    'suggest_campaign_copy'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.SuggestCampaignCopy.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.SuggestCampaignCopy.Responses.$200>
    /**
     * get_channel_connections - Get Channel Connections
     */
    'get_channel_connections'(
        parameters?: Parameters<Paths.GetChannelConnections.QueryParameters> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetChannelConnections.Responses.$200>
    /**
     * create_channel_connection - Create Channel Connection
     */
    'create_channel_connection'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.CreateChannelConnection.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.CreateChannelConnection.Responses.$201>
    /**
     * get_channel_connection - Get Channel Connection
     */
    'get_channel_connection'(
        parameters: Parameters<Paths.GetChannelConnection.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetChannelConnection.Responses.$200>
    /**
     * patch_channel_connection - Patch Channel Connection
     */
    'patch_channel_connection'(
        parameters: Parameters<Paths.PatchChannelConnection.PathParameters>,
        data?: Paths.PatchChannelConnection.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.PatchChannelConnection.Responses.$200>
    /**
     * delete_channel_connection - Delete Channel Connection
     */
    'delete_channel_connection'(
        parameters: Parameters<Paths.DeleteChannelConnection.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.DeleteChannelConnection.Responses.$204>
    /**
     * get_all_journeys_private - Get All Journeys For Apps
     *
     * Get enabled journeys for the Flink app to process the events.
     */
    'get_all_journeys_private'(
        parameters?: Parameters<Paths.GetAllJourneysPrivate.QueryParameters> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetAllJourneysPrivate.Responses.$200>
    /**
     * get_all_journeys_public - Get All Journeys
     */
    'get_all_journeys_public'(
        parameters?: Parameters<Paths.GetAllJourneysPublic.QueryParameters> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetAllJourneysPublic.Responses.$200>
    /**
     * create_journey - Create Journey
     */
    'create_journey'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.CreateJourney.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.CreateJourney.Responses.$201>
    /**
     * get_journey_details - Get Journey Details
     */
    'get_journey_details'(
        parameters: Parameters<Paths.GetJourneyDetails.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetJourneyDetails.Responses.$200>
    /**
     * patch_journey - Patch Journey
     */
    'patch_journey'(
        parameters: Parameters<Paths.PatchJourney.PathParameters>,
        data?: Paths.PatchJourney.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.PatchJourney.Responses.$200>
    /**
     * get_sms_integrations - Get Sms Integration
     */
    'get_sms_integrations'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetSmsIntegrations.Responses.$200>
    /**
     * test_journey - Test Journey
     */
    'test_journey'(
        parameters: Parameters<Paths.TestJourney.PathParameters>,
        data?: Paths.TestJourney.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.TestJourney.Responses.$201>
    /**
     * run_ai_journey_engine - Run Ai Journey Engine
     */
    'run_ai_journey_engine'(
        parameters: Parameters<
            Paths.RunAiJourneyEngine.QueryParameters &
                Paths.RunAiJourneyEngine.PathParameters
        >,
        data?: Paths.RunAiJourneyEngine.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.RunAiJourneyEngine.Responses.$200>
    /**
     * shopper_interest_lookup - Interest Lookup
     */
    'shopper_interest_lookup'(
        parameters?: Parameters<Paths.ShopperInterestLookup.QueryParameters> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ShopperInterestLookup.Responses.$200>
    /**
     * shopper_interest_lookup_post - Interest Lookup Post
     */
    'shopper_interest_lookup_post'(
        parameters?: Parameters<Paths.ShopperInterestLookupPost.QueryParameters> | null,
        data?: Paths.ShopperInterestLookupPost.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ShopperInterestLookupPost.Responses.$200>
    /**
     * get_status_and_usage - Get Status And Usage
     */
    'get_status_and_usage'(
        parameters?: Parameters<Paths.GetStatusAndUsage.QueryParameters> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetStatusAndUsage.Responses.$200>
    /**
     * update_auto_upgrade_flag - Update Auto Upgrade Flag
     */
    'update_auto_upgrade_flag'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.UpdateAutoUpgradeFlag.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.UpdateAutoUpgradeFlag.Responses.$200>
    /**
     * get_subscription_statuses - Get Subscription Statuses
     */
    'get_subscription_statuses'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetSubscriptionStatuses.Responses.$200>
    /**
     * health_check_health_check_get - Health Check
     */
    'health_check_health_check_get'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.HealthCheckHealthCheckGet.Responses.$200>
    /**
     * health_check__get - Health Check
     */
    'health_check__get'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.HealthCheckGet.Responses.$200>
}

export interface PathsDictionary {
    ['/ab-tests']: {
        /**
         * create_ab_test - Create Ab Test
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.CreateAbTest.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.CreateAbTest.Responses.$201>
        /**
         * get_ab_tests - Get Ab Tests
         */
        'get'(
            parameters?: Parameters<Paths.GetAbTests.QueryParameters> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetAbTests.Responses.$200>
    }
    ['/ab-tests/{ab_test_id}']: {
        /**
         * get_ab_test - Get Ab Test
         */
        'get'(
            parameters: Parameters<Paths.GetAbTest.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetAbTest.Responses.$200>
        /**
         * patch_ab_test - Patch Ab Test
         */
        'patch'(
            parameters: Parameters<Paths.PatchAbTest.PathParameters>,
            data?: Paths.PatchAbTest.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.PatchAbTest.Responses.$200>
    }
    ['/assistant/evaluations']: {
        /**
         * evaluate_campaign_rules - Evaluate Campaign Rules
         */
        'post'(
            parameters?: Parameters<Paths.EvaluateCampaignRules.HeaderParameters> | null,
            data?: Paths.EvaluateCampaignRules.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.EvaluateCampaignRules.Responses.$200>
    }
    ['/assistant/configs/revenue/{installation_id}']: {
        /**
         * get_config_assistant_configs_revenue__installation_id__get - Get Config
         */
        'get'(
            parameters: Parameters<
                Paths.GetConfigAssistantConfigsRevenueInstallationIdGet.QueryParameters &
                    Paths.GetConfigAssistantConfigsRevenueInstallationIdGet.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetConfigAssistantConfigsRevenueInstallationIdGet.Responses.$200>
    }
    ['/assistant/configs/{installation_id}']: {
        /**
         * get_config_by_revenue_id - Get Config
         */
        'get'(
            parameters: Parameters<
                Paths.GetConfigByRevenueId.QueryParameters &
                    Paths.GetConfigByRevenueId.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetConfigByRevenueId.Responses.$200>
    }
    ['/assistant/configs/shop/{shop_name}']: {
        /**
         * get_config_by_shop_name - Get Config By Shop Name
         */
        'get'(
            parameters: Parameters<
                Paths.GetConfigByShopName.QueryParameters &
                    Paths.GetConfigByShopName.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetConfigByShopName.Responses.$200>
    }
    ['/assistant/discount-codes/reveal']: {
        /**
         * reveal_discount_code - Reveal
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.RevealDiscountCode.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.RevealDiscountCode.Responses.$200>
    }
    ['/assistant/recommend/p']: {
        /**
         * recommendations_product - Recommend Products
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.RecommendationsProduct.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.RecommendationsProduct.Responses.$200>
    }
    ['/assistant/contact-form/{revenue_id}']: {
        /**
         * submit_contact_form - Submit Contact Form
         */
        'post'(
            parameters: Parameters<Paths.SubmitContactForm.PathParameters>,
            data?: Paths.SubmitContactForm.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.SubmitContactForm.Responses.$202>
    }
    ['/settings/{channel_connection_id}']: {
        /**
         * get_settings - Get Settings For Channel Connection
         */
        'get'(
            parameters: Parameters<
                Paths.GetSettings.QueryParameters &
                    Paths.GetSettings.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetSettings.Responses.$200>
        /**
         * update_setting - Update Setting For Channel Connection
         */
        'put'(
            parameters: Parameters<Paths.UpdateSetting.PathParameters>,
            data?: Paths.UpdateSetting.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.UpdateSetting.Responses.$202>
    }
    ['/discount-offers']: {
        /**
         * create_discount_offer - Create Discount Offer
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.CreateDiscountOffer.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.CreateDiscountOffer.Responses.$201>
        /**
         * get_discount_offers - Get Discount Offers
         */
        'get'(
            parameters?: Parameters<Paths.GetDiscountOffers.QueryParameters> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetDiscountOffers.Responses.$200>
    }
    ['/discount-offers/{discount_offer_id}']: {
        /**
         * get_discount_offer - Get Discount Offer
         */
        'get'(
            parameters: Parameters<Paths.GetDiscountOffer.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetDiscountOffer.Responses.$200>
        /**
         * patch_discount_offer - Patch Discount Offer
         */
        'patch'(
            parameters: Parameters<Paths.PatchDiscountOffer.PathParameters>,
            data?: Paths.PatchDiscountOffer.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.PatchDiscountOffer.Responses.$200>
        /**
         * delete_discount_offer - Delete Discount Offer
         */
        'delete'(
            parameters: Parameters<Paths.DeleteDiscountOffer.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.DeleteDiscountOffer.Responses.$204>
    }
    ['/bundle/installations/manage']: {
        /**
         * service_installation_status_update_bundle_installations_manage_put - Service Installation Status Update
         */
        'put'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.ServiceInstallationStatusUpdateBundleInstallationsManagePut.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ServiceInstallationStatusUpdateBundleInstallationsManagePut.Responses.$200>
        /**
         * service_installation_get_or_create_bundle_installations_manage_post - Service Installation Get Or Create
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.ServiceInstallationGetOrCreateBundleInstallationsManagePost.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ServiceInstallationGetOrCreateBundleInstallationsManagePost.Responses.$201>
    }
    ['/bundle/installations/manage/retrieve']: {
        /**
         * service_retrieve_installation_bundle_installations_manage_retrieve_post - Service Retrieve Installation
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.ServiceRetrieveInstallationBundleInstallationsManageRetrievePost.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ServiceRetrieveInstallationBundleInstallationsManageRetrievePost.Responses.$200>
    }
    ['/bundle/installations']: {
        /**
         * list_bundle_installation - Installation List
         */
        'get'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ListBundleInstallation.Responses.$200>
    }
    ['/bundle/installations/{id}']: {
        /**
         * get_bundle_installation - Retrieve
         */
        'get'(
            parameters: Parameters<Paths.GetBundleInstallation.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetBundleInstallation.Responses.$200>
        /**
         * update_bundle_installation - Update
         */
        'patch'(
            parameters: Parameters<Paths.UpdateBundleInstallation.PathParameters>,
            data?: Paths.UpdateBundleInstallation.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.UpdateBundleInstallation.Responses.$200>
    }
    ['/click-tracking']: {
        /**
         * create_click_tracking_post - Create
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.CreateClickTrackingPost.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.CreateClickTrackingPost.Responses.$201>
    }
    ['/click-tracking/bulk']: {
        /**
         * create_bulk_click_tracking_bulk_post - Create Bulk
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.CreateBulkClickTrackingBulkPost.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.CreateBulkClickTrackingBulkPost.Responses.$201>
    }
    ['/shorten']: {
        /**
         * shorten_shorten_post - Shorten
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.ShortenShortenPost.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ShortenShortenPost.Responses.$201>
    }
    ['/click-tracking/check']: {
        /**
         * retrieve_urls_by_meta_click_tracking_check_post - Retrieve Urls By Meta
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.RetrieveUrlsByMetaClickTrackingCheckPost.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.RetrieveUrlsByMetaClickTrackingCheckPost.Responses.$201>
    }
    ['/r/{alias}']: {
        /**
         * redirect_r__alias__get - Redirect
         */
        'get'(
            parameters: Parameters<
                Paths.RedirectRAliasGet.HeaderParameters &
                    Paths.RedirectRAliasGet.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<any>
    }
    ['/click-tracking/custom-domains']: {
        /**
         * get_custom_domain - Retrieve
         */
        'get'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetCustomDomain.Responses.$200>
        /**
         * create_custom_domain - Create
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.CreateCustomDomain.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.CreateCustomDomain.Responses.$201>
        /**
         * delete_custom_domain - Delete
         */
        'delete'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.DeleteCustomDomain.Responses.$204>
    }
    ['/click-tracking/custom-domains/check']: {
        /**
         * check_custom_domain - Check
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.CheckCustomDomain.Responses.$200>
    }
    ['/custom-domains']: {
        /**
         * retrieve_custom_domains_get - Retrieve
         */
        'get'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.RetrieveCustomDomainsGet.Responses.$200>
        /**
         * create_custom_domains_post - Create
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.CreateCustomDomainsPost.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.CreateCustomDomainsPost.Responses.$201>
        /**
         * delete_custom_domains_delete - Delete
         */
        'delete'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.DeleteCustomDomainsDelete.Responses.$204>
    }
    ['/custom-domains/check']: {
        /**
         * check_custom_domains_check_post - Check
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.CheckCustomDomainsCheckPost.Responses.$200>
    }
    ['/campaigns']: {
        /**
         * create_campaign - Create Campaign
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.CreateCampaign.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.CreateCampaign.Responses.$201>
        /**
         * get_campaigns - Get Campaigns
         */
        'get'(
            parameters?: Parameters<Paths.GetCampaigns.QueryParameters> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetCampaigns.Responses.$200>
    }
    ['/campaigns/all']: {
        /**
         * get_all_campaigns - Get All Campaigns
         */
        'get'(
            parameters?: Parameters<Paths.GetAllCampaigns.HeaderParameters> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetAllCampaigns.Responses.$200>
    }
    ['/campaigns/{campaign_id}']: {
        /**
         * get_campaign - Get Campaign
         */
        'get'(
            parameters: Parameters<Paths.GetCampaign.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetCampaign.Responses.$200>
        /**
         * patch_campaign - Patch Campaign
         */
        'patch'(
            parameters: Parameters<Paths.PatchCampaign.PathParameters>,
            data?: Paths.PatchCampaign.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.PatchCampaign.Responses.$200>
        /**
         * delete_campaign - Delete Campaign
         */
        'delete'(
            parameters: Parameters<Paths.DeleteCampaign.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.DeleteCampaign.Responses.$204>
    }
    ['/campaigns/{campaign_id}/ab-test']: {
        /**
         * create_ab_group - Create Ab Group
         */
        'post'(
            parameters: Parameters<Paths.CreateAbGroup.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.CreateAbGroup.Responses.$200>
    }
    ['/campaigns/{campaign_id}/ab-test/start']: {
        /**
         * start_ab_group - Start Ab Group
         */
        'post'(
            parameters: Parameters<Paths.StartAbGroup.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.StartAbGroup.Responses.$200>
    }
    ['/campaigns/{campaign_id}/ab-test/pause']: {
        /**
         * pause_ab_group - Pause Ab Group
         */
        'post'(
            parameters: Parameters<Paths.PauseAbGroup.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.PauseAbGroup.Responses.$200>
    }
    ['/campaigns/{campaign_id}/ab-test/stop']: {
        /**
         * stop_ab_group - Stop Ab Group
         */
        'post'(
            parameters: Parameters<Paths.StopAbGroup.PathParameters>,
            data?: Paths.StopAbGroup.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.StopAbGroup.Responses.$200>
    }
    ['/campaigns/suggest-copy']: {
        /**
         * suggest_campaign_copy - Suggest Campaign Copy
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.SuggestCampaignCopy.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.SuggestCampaignCopy.Responses.$200>
    }
    ['/channel-connections']: {
        /**
         * create_channel_connection - Create Channel Connection
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.CreateChannelConnection.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.CreateChannelConnection.Responses.$201>
        /**
         * get_channel_connections - Get Channel Connections
         */
        'get'(
            parameters?: Parameters<Paths.GetChannelConnections.QueryParameters> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetChannelConnections.Responses.$200>
    }
    ['/channel-connections/{channel_connection_id}']: {
        /**
         * get_channel_connection - Get Channel Connection
         */
        'get'(
            parameters: Parameters<Paths.GetChannelConnection.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetChannelConnection.Responses.$200>
        /**
         * patch_channel_connection - Patch Channel Connection
         */
        'patch'(
            parameters: Parameters<Paths.PatchChannelConnection.PathParameters>,
            data?: Paths.PatchChannelConnection.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.PatchChannelConnection.Responses.$200>
        /**
         * delete_channel_connection - Delete Channel Connection
         */
        'delete'(
            parameters: Parameters<Paths.DeleteChannelConnection.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.DeleteChannelConnection.Responses.$204>
    }
    ['/private/journeys']: {
        /**
         * get_all_journeys_private - Get All Journeys For Apps
         *
         * Get enabled journeys for the Flink app to process the events.
         */
        'get'(
            parameters?: Parameters<Paths.GetAllJourneysPrivate.QueryParameters> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetAllJourneysPrivate.Responses.$200>
    }
    ['/journeys']: {
        /**
         * get_all_journeys_public - Get All Journeys
         */
        'get'(
            parameters?: Parameters<Paths.GetAllJourneysPublic.QueryParameters> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetAllJourneysPublic.Responses.$200>
        /**
         * create_journey - Create Journey
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.CreateJourney.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.CreateJourney.Responses.$201>
    }
    ['/journeys/{journey_id}']: {
        /**
         * get_journey_details - Get Journey Details
         */
        'get'(
            parameters: Parameters<Paths.GetJourneyDetails.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetJourneyDetails.Responses.$200>
        /**
         * patch_journey - Patch Journey
         */
        'patch'(
            parameters: Parameters<Paths.PatchJourney.PathParameters>,
            data?: Paths.PatchJourney.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.PatchJourney.Responses.$200>
    }
    ['/sms-integrations']: {
        /**
         * get_sms_integrations - Get Sms Integration
         */
        'get'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetSmsIntegrations.Responses.$200>
    }
    ['/journeys/{journey_id}/test']: {
        /**
         * test_journey - Test Journey
         */
        'post'(
            parameters: Parameters<Paths.TestJourney.PathParameters>,
            data?: Paths.TestJourney.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.TestJourney.Responses.$201>
    }
    ['/accounts/{account_id}/stores/{store_integration_id}/run']: {
        /**
         * run_ai_journey_engine - Run Ai Journey Engine
         */
        'post'(
            parameters: Parameters<
                Paths.RunAiJourneyEngine.QueryParameters &
                    Paths.RunAiJourneyEngine.PathParameters
            >,
            data?: Paths.RunAiJourneyEngine.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.RunAiJourneyEngine.Responses.$200>
    }
    ['/shoppers/interest-lookup']: {
        /**
         * shopper_interest_lookup - Interest Lookup
         */
        'get'(
            parameters?: Parameters<Paths.ShopperInterestLookup.QueryParameters> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ShopperInterestLookup.Responses.$200>
        /**
         * shopper_interest_lookup_post - Interest Lookup Post
         */
        'post'(
            parameters?: Parameters<Paths.ShopperInterestLookupPost.QueryParameters> | null,
            data?: Paths.ShopperInterestLookupPost.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ShopperInterestLookupPost.Responses.$200>
    }
    ['/billing/subscriptions/account-status']: {
        /**
         * get_status_and_usage - Get Status And Usage
         */
        'get'(
            parameters?: Parameters<Paths.GetStatusAndUsage.QueryParameters> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetStatusAndUsage.Responses.$200>
    }
    ['/billing/subscriptions/auto-upgrade']: {
        /**
         * update_auto_upgrade_flag - Update Auto Upgrade Flag
         */
        'put'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.UpdateAutoUpgradeFlag.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.UpdateAutoUpgradeFlag.Responses.$200>
    }
    ['/billing/subscriptions/account-status/all']: {
        /**
         * get_subscription_statuses - Get Subscription Statuses
         */
        'get'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetSubscriptionStatuses.Responses.$200>
    }
    ['/health-check']: {
        /**
         * health_check_health_check_get - Health Check
         */
        'get'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.HealthCheckHealthCheckGet.Responses.$200>
    }
    ['/']: {
        /**
         * health_check__get - Health Check
         */
        'get'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.HealthCheckGet.Responses.$200>
    }
}

export type Client = OpenAPIClient<OperationMethods, PathsDictionary>
