import {
    OpenAPIClient,
    Parameters,
    UnknownParamsObject,
    OperationResponse,
    AxiosRequestConfig,
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
            winner_variant_id?: string | null
            status: ABGroupStatus
            /**
             * Started Datetime
             */
            started_datetime?: string /* date-time */ | null
            /**
             * Stopped Datetime
             */
            stopped_datetime?: string /* date-time */ | null
            /**
             * Campaign Id
             */
            campaign_id?: string | null
            /**
             * Generated Campaign Id
             */
            generated_campaign_id?: string | null
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
            winner_variant_id?: string | null
        }
        /**
         * ABTestConfigurationResponseSchema
         */
        export interface ABTestConfigurationResponseSchema {
            /**
             * Active
             */
            active?: boolean
            configuration: ABTestConfigurationSchema | null
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
            store_integration_id?: number | null
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
            state?: 'inactive' | null
            /**
             * Report Link
             */
            report_link?: string /* uri */ | null
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
            state: ABTestState
            /**
             * Start Datetime
             */
            start_datetime: string // date-time
            /**
             * End Datetime
             */
            end_datetime: string /* date-time */ | null
            /**
             * Report Link
             */
            report_link: string | null
            /**
             * Campaigns
             */
            campaigns?: string[] | null
        }
        /**
         * ABTestState
         */
        export type ABTestState = 'active' | 'inactive'
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
            url?: string | null
            extra?: CampaignAttachmentDiscountOfferExtraSchema | null
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
            price?: number | null
            /**
             * Currency
             */
            currency?: string | null
            /**
             * Product Link
             */
            product_link?: string | null
            /**
             * Variant Name
             */
            variant_name?: string | null
            position?: CampaignAttachmentProductPositionSchema | null
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
            scenario: ProductRecommendationScenarioType
        }
        /**
         * CampaignAttachmentProductRecommendationSchema
         */
        export interface CampaignAttachmentProductRecommendationSchemaInput {
            /**
             * Contenttype
             */
            contentType: 'application/productRecommendation'
            /**
             * Name
             */
            name: string
            extra: CampaignAttachmentProductRecommendationExtraSchema
        }
        /**
         * CampaignAttachmentProductRecommendationSchema
         */
        export interface CampaignAttachmentProductRecommendationSchemaOutput {
            /**
             * Contenttype
             */
            contentType: 'application/productRecommendation'
            /**
             * Name
             */
            name: string
            extra: CampaignAttachmentProductRecommendationExtraSchema
        }
        /**
         * CampaignAttachmentProductSchema
         */
        export interface CampaignAttachmentProductSchemaInput {
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
            url?: string | null
            /**
             * Size
             */
            size?: number | null
            extra?: CampaignAttachmentProductExtraSchema | null
        }
        /**
         * CampaignAttachmentProductSchema
         */
        export interface CampaignAttachmentProductSchemaOutput {
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
            url?: string | null
            /**
             * Size
             */
            size?: number | null
            extra?: CampaignAttachmentProductExtraSchema | null
        }
        /**
         * CampaignAttachmentVisitorFormExtraSchema
         */
        export interface CampaignAttachmentVisitorFormExtraSchemaInput {
            /**
             * Steps
             */
            steps: VisitorFormStepSchemaInput[]
            on_success_content?: VisitorFormOnSuccessContentSchema | null
            /**
             * Targets
             */
            targets: VisitorFormTargetsSchema[]
            /**
             * Disclaimer
             */
            disclaimer?: string | null
            /**
             * Disclaimer Default Accepted
             */
            disclaimer_default_accepted?: boolean
        }
        /**
         * CampaignAttachmentVisitorFormExtraSchema
         */
        export interface CampaignAttachmentVisitorFormExtraSchemaOutput {
            /**
             * Steps
             */
            steps: VisitorFormStepSchemaOutput[]
            on_success_content?: VisitorFormOnSuccessContentSchema | null
            /**
             * Targets
             */
            targets: VisitorFormTargetsSchema[]
            /**
             * Disclaimer
             */
            disclaimer?: string | null
            /**
             * Disclaimer Default Accepted
             */
            disclaimer_default_accepted?: boolean
        }
        /**
         * CampaignAttachmentVisitorFormSchema
         */
        export interface CampaignAttachmentVisitorFormSchemaInput {
            /**
             * Contenttype
             */
            contentType: 'application/visitorForm'
            /**
             * Name
             */
            name: string
            extra?: CampaignAttachmentVisitorFormExtraSchemaInput | null
        }
        /**
         * CampaignAttachmentVisitorFormSchema
         */
        export interface CampaignAttachmentVisitorFormSchemaOutput {
            /**
             * Contenttype
             */
            contentType: 'application/visitorForm'
            /**
             * Name
             */
            name: string
            extra?: CampaignAttachmentVisitorFormExtraSchemaOutput | null
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
            description?: string | null
            /**
             * Message Text
             */
            message_text: string
            /**
             * Message Html
             */
            message_html?: string | null
            /**
             * Language
             */
            language?: string | null
            status: CampaignStatus
            /**
             * Trigger Rule
             */
            trigger_rule: string
            /**
             * Attachments
             */
            attachments?:
                | (
                      | CampaignAttachmentProductSchemaInput
                      | CampaignAttachmentDiscountOfferSchema
                      | CampaignAttachmentVisitorFormSchemaInput
                      | CampaignAttachmentProductRecommendationSchemaInput
                  )[]
                | null
            /**
             * Meta
             */
            meta?: {} | null
            /**
             * Triggers
             */
            triggers: CampaignTriggerSchema[]
            /**
             * Channel Connection Id
             */
            channel_connection_id: string
            publish_mode?: CampaignPublishType | null
            /**
             * External Tag Id
             */
            external_tag_id?: number | null
            /**
             * Template Id
             */
            template_id?: string | null
            schedule?: ScheduleRequestSchema | null
            /**
             * Variants
             */
            variants?: CampaignVariantRequestSchema[]
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
            name?: string | null
            /**
             * Description
             */
            description?: string | null
            /**
             * Message Text
             */
            message_text?: string | null
            /**
             * Message Html
             */
            message_html?: string | null
            /**
             * Language
             */
            language?: string | null
            status?: CampaignStatus | null
            /**
             * Trigger Rule
             */
            trigger_rule?: string | null
            /**
             * Attachments
             */
            attachments?:
                | (
                      | CampaignAttachmentProductSchemaInput
                      | CampaignAttachmentDiscountOfferSchema
                      | CampaignAttachmentVisitorFormSchemaInput
                      | CampaignAttachmentProductRecommendationSchemaInput
                  )[]
                | null
            /**
             * Meta
             */
            meta?: {} | null
            publish_mode?: CampaignPublishType | null
            /**
             * Triggers
             */
            triggers?: CampaignTriggerSchema[] | null
            schedule?: ScheduleRequestSchema | null
            /**
             * Variants
             */
            variants?: CampaignVariantRequestSchema[] | null
            /**
             * External Tag Id
             */
            external_tag_id?: number | null
            /**
             * Template Id
             */
            template_id?: string | null
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
            description?: string | null
            /**
             * Message Text
             */
            message_text: string
            /**
             * Message Html
             */
            message_html?: string | null
            /**
             * Language
             */
            language?: string | null
            status: CampaignStatus
            /**
             * Trigger Rule
             */
            trigger_rule: string
            /**
             * Attachments
             */
            attachments?:
                | (
                      | CampaignAttachmentProductSchemaOutput
                      | CampaignAttachmentDiscountOfferSchema
                      | CampaignAttachmentVisitorFormSchemaOutput
                      | CampaignAttachmentProductRecommendationSchemaOutput
                  )[]
                | null
            /**
             * Meta
             */
            meta?: {} | null
            /**
             * Id
             */
            id: string
            /**
             * Triggers
             */
            triggers: CampaignTriggerSchema[]
            ab_group?: ABGroupResponseSchema | null
            /**
             * Variants
             */
            variants: CampaignVariantResponseSchema[]
            schedule?: ScheduleResponseSchema | null
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
            deleted_datetime?: string /* date-time */ | null
            /**
             * Template Id
             */
            template_id?: string | null
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
            rules: RuleSchema[]
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
            type: CampaignTriggerType
            operator: CampaignTriggerOperator
            /**
             * Value
             */
            value: number | boolean | string | any[] | {}
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
            message_html?: string | null
            /**
             * Attachments
             */
            attachments?:
                | (
                      | CampaignAttachmentProductSchemaInput
                      | CampaignAttachmentDiscountOfferSchema
                      | CampaignAttachmentVisitorFormSchemaInput
                      | CampaignAttachmentProductRecommendationSchemaInput
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
            message_html?: string | null
            /**
             * Attachments
             */
            attachments?:
                | (
                      | CampaignAttachmentProductSchemaOutput
                      | CampaignAttachmentDiscountOfferSchema
                      | CampaignAttachmentVisitorFormSchemaOutput
                      | CampaignAttachmentProductRecommendationSchemaOutput
                  )[]
                | null
            /**
             * Id
             */
            id: string
            /**
             * Started Datetime
             */
            started_datetime?: string /* date-time */ | null
            /**
             * Stopped Datetime
             */
            stopped_datetime?: string /* date-time */ | null
        }
        /**
         * ChannelConnectionCreateRequestSchema
         */
        export interface ChannelConnectionCreateRequestSchema {
            /**
             * Store Integration Id
             */
            store_integration_id?: number | null
            /**
             * External Id
             */
            external_id?: string | null
            /**
             * External Installation Status
             */
            external_installation_status?: string | null
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
            channel: ChannelType
        }
        /**
         * ChannelConnectionResponseSchema
         */
        export interface ChannelConnectionResponseSchema {
            /**
             * Store Integration Id
             */
            store_integration_id?: number | null
            /**
             * External Id
             */
            external_id?: string | null
            /**
             * External Installation Status
             */
            external_installation_status?: string | null
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
            channel: ChannelType
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
            store_integration_id?: number | null
            /**
             * External Id
             */
            external_id?: string | null
            /**
             * External Installation Status
             */
            external_installation_status?: string | null
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
         * ConfigResponseSchema
         */
        export interface ConfigResponseSchema {
            subscription: SubscriptionStatusSchema
            /**
             * Campaigns
             */
            campaigns: PublicCampaignResponseSchema[]
            ab_test?: ABTestConfigurationResponseSchema | null
            /**
             * Id
             */
            id: string
        }
        /**
         * CustomDomainOperationSchema
         */
        export interface CustomDomainOperationSchema {
            /**
             * Hostname
             */
            hostname: string
            zone?: CustomDomainZone | null
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
         * DeprecatedProductRecommendationRequestSchema
         */
        export interface DeprecatedProductRecommendationRequestSchema {
            scenario: Scenario
            /**
             * Shop Name
             */
            shop_name: string
            /**
             * Guest Id
             */
            guest_id?: string | null
            /**
             * Session Id
             */
            session_id?: string | null
            /**
             * Customer Id
             */
            customer_id?: number | null
            /**
             * Context Items
             */
            context_items?: string[] | null
        }
        /**
         * DeprecatedProductRecommendationResponseSchema
         */
        export interface DeprecatedProductRecommendationResponseSchema {
            /**
             * Items
             */
            items: DeprecatedRecommendationItemSchema[]
        }
        /**
         * DeprecatedRecommendationItemSchema
         */
        export interface DeprecatedRecommendationItemSchema {
            /**
             * Item Id
             */
            item_id: string
            /**
             * Handle
             */
            handle: string
        }
        /**
         * DiscountOfferCreateRequestSchema
         */
        export interface DiscountOfferCreateRequestSchema {
            type: DiscountOfferTypeEnum
            /**
             * Prefix
             */
            prefix: string
            /**
             * Value
             */
            value?: number | string | null
            /**
             * Minimum Purchase Amount
             */
            minimum_purchase_amount?: number | string | null
            /**
             * External Customer Segment Ids
             */
            external_customer_segment_ids?: string[] | null
            /**
             * External Collection Ids
             */
            external_collection_ids?: string[] | null
            /**
             * External Product Ids
             */
            external_product_ids?: string[] | null
            /**
             * Store Integration Id
             */
            store_integration_id: string
        }
        /**
         * DiscountOfferPatchRequestSchema
         */
        export interface DiscountOfferPatchRequestSchema {
            type?: DiscountOfferTypeEnum | null
            /**
             * Prefix
             */
            prefix?: string | null
            /**
             * Value
             */
            value?: number | string | null
            /**
             * Minimum Purchase Amount
             */
            minimum_purchase_amount?: number | string | null
            /**
             * External Customer Segment Ids
             */
            external_customer_segment_ids?: string[] | null
            /**
             * External Collection Ids
             */
            external_collection_ids?: string[] | null
            /**
             * External Product Ids
             */
            external_product_ids?: string[] | null
        }
        /**
         * DiscountOfferResponseSchema
         */
        export interface DiscountOfferResponseSchema {
            type: DiscountOfferTypeEnum
            /**
             * Prefix
             */
            prefix: string
            /**
             * Value
             */
            value?: string | null
            /**
             * Minimum Purchase Amount
             */
            minimum_purchase_amount?: string | null
            /**
             * External Customer Segment Ids
             */
            external_customer_segment_ids?: string[] | null
            /**
             * External Collection Ids
             */
            external_collection_ids?: string[] | null
            /**
             * External Product Ids
             */
            external_product_ids?: string[] | null
            /**
             * Id
             */
            id: string
            /**
             * Store Integration Id
             */
            store_integration_id: string
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
            rules: EvaluatedRuleSchema[]
        }
        /**
         * EvaluatedRuleSchema
         */
        export interface EvaluatedRuleSchema {
            key: RuleType
            operator: RuleOperator
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
            customer_id?: number | null
            /**
             * Account Id
             */
            account_id: number
            /**
             * Campaigns
             */
            campaigns: CampaignSchema[]
        }
        /**
         * EvaluationResponseSchema
         */
        export interface EvaluationResponseSchema {
            /**
             * Campaigns
             */
            campaigns: EvaluatedCampaignSchema[]
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
            detail?: ValidationError[]
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
            shop_name?: string | null
            /**
             * Script Tag Id
             */
            script_tag_id?: string | null
            status: StatusEnum
            method: MethodEnum
            /**
             * Config
             */
            config: {}
            /**
             * Created Datetime
             */
            created_datetime: string // date-time
            /**
             * Deactivated Datetime
             */
            deactivated_datetime?: string /* date-time */ | null
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
            config: {}
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
         * MethodEnum
         */
        export type MethodEnum = 'theme_app' | 'one_click' | 'manual'
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
            shop_name?: string | null
            /**
             * Installation Id
             */
            installation_id?: string | null
            /**
             * Widget App Id
             */
            widget_app_id: string
            /**
             * Campaign Id
             */
            campaign_id: string
            scenario: ProductRecommendationScenarioType
            /**
             * Guest Id
             */
            guest_id: string
            /**
             * Customer Id
             */
            customer_id?: number | null
            current_product?: ProductInfoSchema | null
            /**
             * Visited Products
             */
            visited_products: ProductInfoSchema[]
            /**
             * Cart Products
             */
            cart_products: ProductInfoSchema[]
        }
        /**
         * ProductRecommendationResponseSchema
         */
        export interface ProductRecommendationResponseSchema {
            /**
             * Products
             */
            products: ProductSchema[]
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
            variants: ProductVariant[]
            /**
             * Options
             */
            options: ProductOption[]
            /**
             * Image Url
             */
            image_url: string | null
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
            price: string
            /**
             * Options
             */
            options: string[]
        }
        /**
         * PublicABGroupResponseSchema
         */
        export interface PublicABGroupResponseSchema {
            status: ABGroupStatus
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
            description?: string | null
            /**
             * Message Text
             */
            message_text: string
            /**
             * Message Html
             */
            message_html?: string | null
            /**
             * Language
             */
            language?: string | null
            status: CampaignStatus
            /**
             * Trigger Rule
             */
            trigger_rule: string
            /**
             * Attachments
             */
            attachments?:
                | (
                      | CampaignAttachmentProductSchemaOutput
                      | CampaignAttachmentDiscountOfferSchema
                      | CampaignAttachmentVisitorFormSchemaOutput
                      | CampaignAttachmentProductRecommendationSchemaOutput
                  )[]
                | null
            /**
             * Meta
             */
            meta?: {} | null
            /**
             * Triggers
             */
            triggers: CampaignTriggerSchema[]
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
            deleted_datetime?: string /* date-time */ | null
            /**
             * Variants
             */
            variants: PublicCampaignVariantResponseSchema[]
            ab_group?: PublicABGroupResponseSchema | null
            schedule?: ScheduleResponseSchema | null
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
            message_html?: string | null
            /**
             * Attachments
             */
            attachments?:
                | (
                      | CampaignAttachmentProductSchemaOutput
                      | CampaignAttachmentDiscountOfferSchema
                      | CampaignAttachmentVisitorFormSchemaOutput
                      | CampaignAttachmentProductRecommendationSchemaOutput
                  )[]
                | null
            /**
             * Id
             */
            id: string
        }
        /**
         * RequestSettingSchema
         */
        export interface RequestSettingSchema {
            /**
             * Data
             */
            data: {}
            type: SettingType
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
            type: DiscountOfferTypeEnum
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
            key: RuleType
            operator: RuleOperator
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
         * Scenario
         */
        export type Scenario =
            | 'most_popular_for_you_user'
            | 'most_popular_for_you_session'
            | 'recommended_for_you_user'
            | 'recommended_for_you_user_cart'
            | 'recommended_for_you_session'
            | 'recommended_for_you_session_cart'
            | 'complementary_products_user'
            | 'complementary_products_session'
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
            end_datetime?: string /* date-time */ | null
            schedule_rule: ScheduleRule
            /**
             * Custom Schedule
             */
            custom_schedule: CustomScheduleSchema[] | null
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
            end_datetime?: string /* date-time */ | null
            schedule_rule: ScheduleRule
            /**
             * Custom Schedule
             */
            custom_schedule: CustomScheduleSchema[] | null
        }
        /**
         * ScheduleRule
         */
        export type ScheduleRule = 'anytime' | 'during' | 'outside' | 'custom'
        /**
         * SettingResponseSchema
         */
        export interface SettingResponseSchema {
            type: SettingType
            /**
             * Data
             */
            data: {}
        }
        /**
         * SettingType
         */
        export type SettingType = 'performance_report_visible_fields'
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
            status: SubscriptionStatus
            usage_status: SubscriptionUsageStatus
        }
        /**
         * SubscriptionUsageAndBundleStatusSchema
         */
        export interface SubscriptionUsageAndBundleStatusSchema {
            status: SubscriptionStatus
            usage_status: SubscriptionUsageStatus
            /**
             * Usage
             */
            usage?: number | null
            /**
             * Limit
             */
            limit?: number | null
            /**
             * Auto Upgrade Enabled
             */
            auto_upgrade_enabled?: boolean
            /**
             * Last Auto Upgrade At
             */
            last_auto_upgrade_at?: string /* date-time */ | null
            /**
             * Last Warning 90 At
             */
            last_warning_90_at?: string /* date-time */ | null
            /**
             * Last Warning 100 At
             */
            last_warning_100_at?: string /* date-time */ | null
            /**
             * Last Block At
             */
            last_block_at?: string /* date-time */ | null
            /**
             * Estimated Usage Percentage
             */
            estimated_usage_percentage?: number | null
            /**
             * Estimated Reach Date
             */
            estimated_reach_date?: string /* date-time */ | null
            /**
             * Cycle Start
             */
            cycle_start?: string /* date-time */ | null
            /**
             * Cycle End
             */
            cycle_end?: string /* date-time */ | null
            bundle_status: BundleOnboardingStatus
        }
        /**
         * SubscriptionUsageStatus
         */
        export type SubscriptionUsageStatus = 'ok' | 'limit-reached'
        /**
         * URLBulkSchema
         */
        export interface URLBulkSchema {
            /**
             * Urls
             */
            urls: URLSchema[]
        }
        /**
         * URLClickSchema
         */
        export interface URLClickSchema {
            /**
             * Client Ip
             */
            client_ip?: string | null
            /**
             * Client Agent
             */
            client_agent?: string | null
            /**
             * Client Referrer
             */
            client_referrer?: string | null
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
            urls: URLCreateSchema[]
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
            channel?: string | null
            /**
             * Url
             */
            url: string // uri
            /**
             * Meta
             */
            meta?: {}
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
            short_url?: string | null
            /**
             * Channel
             */
            channel?: string | null
            custom_domain?: CustomDomainSchema | null
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
            short_url?: string | null
            /**
             * Channel
             */
            channel?: string | null
            custom_domain?: CustomDomainSchema | null
            /**
             * Clicks
             */
            clicks: URLClickSchema[]
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
            name: VisitorFormFieldName
            /**
             * Label
             */
            label?: string | null
            type: VisitorFormFieldType
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
            message?: string | null
        }
        /**
         * VisitorFormStepSchema
         */
        export interface VisitorFormStepSchemaInput {
            /**
             * Cta
             */
            cta?: string | null
            /**
             * Fields
             */
            fields: VisitorFormFieldsSchema[]
        }
        /**
         * VisitorFormStepSchema
         */
        export interface VisitorFormStepSchemaOutput {
            /**
             * Cta
             */
            cta?: string | null
            /**
             * Fields
             */
            fields: VisitorFormFieldsSchema[]
        }
        /**
         * VisitorFormSubmissionSchema
         */
        export interface VisitorFormSubmissionSchema {
            /**
             * First Name
             */
            first_name?: string | null
            /**
             * Last Name
             */
            last_name?: string | null
            /**
             * Phone
             */
            phone?: string /* phone */ | null
            /**
             * Email
             */
            email?: string /* email */ | null
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
            guest_id?: string | null
            /**
             * Session Id
             */
            session_id?: string | null
            /**
             * Ab Variant
             */
            ab_variant?: string | null
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
            type: VisitorFormTargetType
            /**
             * Subscriber Types
             */
            subscriber_types: VisitorFormSubscriberType[]
            /**
             * Tags
             */
            tags?: string[] | null
        }
    }
}
declare namespace Paths {
    namespace CheckCustomDomain {
        namespace Responses {
            export type $200 = Components.Schemas.CustomDomainSchema
        }
    }
    namespace CheckCustomDomainsCheckPost {
        namespace Responses {
            export type $200 = Components.Schemas.CustomDomainSchema
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
            campaign_id: Parameters.CampaignId
        }
        namespace Responses {
            export type $200 = Components.Schemas.ABGroupResponseSchema
            export type $422 = Components.Schemas.HTTPValidationError
        }
    }
    namespace CreateAbTest {
        export type RequestBody = Components.Schemas.ABTestCreateRequestSchema
        namespace Responses {
            export type $201 = Components.Schemas.ABTestResponseSchema
            export type $422 = Components.Schemas.HTTPValidationError
        }
    }
    namespace CreateBulkClickTrackingBulkPost {
        export type RequestBody = Components.Schemas.JWTTokenSchema
        namespace Responses {
            export type $201 = Components.Schemas.URLBulkSchema
            export type $422 = Components.Schemas.HTTPValidationError
        }
    }
    namespace CreateCampaign {
        export type RequestBody = Components.Schemas.CampaignCreateRequestSchema
        namespace Responses {
            export type $201 = Components.Schemas.CampaignResponseSchema
            export type $422 = Components.Schemas.HTTPValidationError
        }
    }
    namespace CreateChannelConnection {
        export type RequestBody =
            Components.Schemas.ChannelConnectionCreateRequestSchema
        namespace Responses {
            export type $201 =
                Components.Schemas.ChannelConnectionResponseSchema
            export type $422 = Components.Schemas.HTTPValidationError
        }
    }
    namespace CreateClickTrackingPost {
        export type RequestBody = Components.Schemas.JWTTokenSchema
        namespace Responses {
            export type $201 = Components.Schemas.URLSchema
            export type $422 = Components.Schemas.HTTPValidationError
        }
    }
    namespace CreateCustomDomain {
        export type RequestBody = Components.Schemas.CustomDomainOperationSchema
        namespace Responses {
            export type $201 = Components.Schemas.CustomDomainSchema
            export type $422 = Components.Schemas.HTTPValidationError
        }
    }
    namespace CreateCustomDomainsPost {
        export type RequestBody = Components.Schemas.CustomDomainOperationSchema
        namespace Responses {
            export type $201 = Components.Schemas.CustomDomainSchema
            export type $422 = Components.Schemas.HTTPValidationError
        }
    }
    namespace CreateDiscountOffer {
        export type RequestBody =
            Components.Schemas.DiscountOfferCreateRequestSchema
        namespace Responses {
            export type $201 = Components.Schemas.DiscountOfferResponseSchema
            export type $422 = Components.Schemas.HTTPValidationError
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
            campaign_id: Parameters.CampaignId
        }
        namespace Responses {
            export type $422 = Components.Schemas.HTTPValidationError
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
            channel_connection_id: Parameters.ChannelConnectionId
        }
        namespace Responses {
            export type $422 = Components.Schemas.HTTPValidationError
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
            discount_offer_id: Parameters.DiscountOfferId
        }
        namespace Responses {
            export type $422 = Components.Schemas.HTTPValidationError
        }
    }
    namespace EvaluateCampaignRules {
        export interface HeaderParameters {
            'cf-ipcountry'?: Parameters.CfIpcountry
        }
        namespace Parameters {
            /**
             * Cf-Ipcountry
             */
            export type CfIpcountry = string | null
        }
        export type RequestBody = Components.Schemas.EvaluationRequestSchema
        namespace Responses {
            export type $200 = Components.Schemas.EvaluationResponseSchema
            export type $422 = Components.Schemas.HTTPValidationError
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
            ab_test_id: Parameters.AbTestId
        }
        namespace Responses {
            export type $200 = Components.Schemas.ABTestResponseSchema
            export type $422 = Components.Schemas.HTTPValidationError
        }
    }
    namespace GetAbTests {
        namespace Parameters {
            /**
             * Channel Connection Id
             * Channel connection ID to which AB tests belong
             */
            export type ChannelConnectionId = string | null
            /**
             * State
             * State of A/B test
             */
            export type State = Components.Schemas.ABTestState | null
        }
        export interface QueryParameters {
            channel_connection_id?: Parameters.ChannelConnectionId
            state?: Parameters.State
        }
        namespace Responses {
            /**
             * Response Get Ab Tests
             */
            export type $200 = Components.Schemas.ABTestResponseSchema[]
            export type $422 = Components.Schemas.HTTPValidationError
        }
    }
    namespace GetAllCampaigns {
        export interface HeaderParameters {
            'data-token'?: Parameters.DataToken
        }
        namespace Parameters {
            /**
             * Data-Token
             */
            export type DataToken = string | null
        }
        namespace Responses {
            /**
             * Response Get All Campaigns
             */
            export type $200 = Components.Schemas.CampaignResponseSchema[]
            export type $422 = Components.Schemas.HTTPValidationError
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
            id: Parameters.Id
        }
        namespace Responses {
            export type $200 = Components.Schemas.InstallationSchema
            export type $422 = Components.Schemas.HTTPValidationError
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
            campaign_id: Parameters.CampaignId
        }
        namespace Responses {
            export type $200 = Components.Schemas.CampaignResponseSchema
            export type $422 = Components.Schemas.HTTPValidationError
        }
    }
    namespace GetCampaigns {
        namespace Parameters {
            /**
             * Channel Connection External Ids
             * Channel connection external ID
             */
            export type ChannelConnectionExternalIds = string[] | null
            /**
             * Channel Connection Id
             * Channel connection ID to which campaigns belong
             */
            export type ChannelConnectionId = string | null
            /**
             * Deleted
             * Include deleted campaigns
             */
            export type Deleted = boolean
        }
        export interface QueryParameters {
            channel_connection_id?: Parameters.ChannelConnectionId
            channel_connection_external_ids?: Parameters.ChannelConnectionExternalIds
            deleted?: Parameters.Deleted
        }
        namespace Responses {
            /**
             * Response Get Campaigns
             */
            export type $200 = Components.Schemas.CampaignResponseSchema[]
            export type $422 = Components.Schemas.HTTPValidationError
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
            channel_connection_id: Parameters.ChannelConnectionId
        }
        namespace Responses {
            export type $200 =
                Components.Schemas.ChannelConnectionResponseSchema
            export type $422 = Components.Schemas.HTTPValidationError
        }
    }
    namespace GetChannelConnections {
        namespace Parameters {
            /**
             * Channel
             * Channel type, e.g. widget
             */
            export type Channel = Components.Schemas.ChannelType | null
            /**
             * External Id
             * External ID connected to the Channel connection, usually dependent on the channel type
             */
            export type ExternalId = string | null
            /**
             * Store Integration Id
             * Gorgias integration ID for the store
             */
            export type StoreIntegrationId = number | null
        }
        export interface QueryParameters {
            store_integration_id?: Parameters.StoreIntegrationId
            external_id?: Parameters.ExternalId
            channel?: Parameters.Channel
        }
        namespace Responses {
            /**
             * Response Get Channel Connections
             */
            export type $200 =
                Components.Schemas.ChannelConnectionResponseSchema[]
            export type $422 = Components.Schemas.HTTPValidationError
        }
    }
    namespace GetConfigAssistantConfigsRevenue_InstallationId_Get {
        namespace Parameters {
            /**
             * Installation Id
             */
            export type InstallationId = string
            /**
             * Widget-App-Id
             */
            export type WidgetAppId = string | null
        }
        export interface PathParameters {
            installation_id: Parameters.InstallationId
        }
        export interface QueryParameters {
            'widget-app-id'?: Parameters.WidgetAppId
        }
        namespace Responses {
            export type $200 = Components.Schemas.ConfigResponseSchema
            export type $422 = Components.Schemas.HTTPValidationError
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
            export type WidgetAppId = string | null
        }
        export interface PathParameters {
            installation_id: Parameters.InstallationId
        }
        export interface QueryParameters {
            'widget-app-id'?: Parameters.WidgetAppId
        }
        namespace Responses {
            export type $200 = Components.Schemas.ConfigResponseSchema
            export type $422 = Components.Schemas.HTTPValidationError
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
            export type WidgetAppId = string | null
        }
        export interface PathParameters {
            shop_name: Parameters.ShopName
        }
        export interface QueryParameters {
            'widget-app-id'?: Parameters.WidgetAppId
        }
        namespace Responses {
            export type $200 = Components.Schemas.ConfigResponseSchema
            export type $422 = Components.Schemas.HTTPValidationError
        }
    }
    namespace GetCustomDomain {
        namespace Responses {
            export type $200 = Components.Schemas.CustomDomainSchema
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
            discount_offer_id: Parameters.DiscountOfferId
        }
        namespace Responses {
            export type $200 = Components.Schemas.DiscountOfferResponseSchema
            export type $422 = Components.Schemas.HTTPValidationError
        }
    }
    namespace GetDiscountOffers {
        namespace Parameters {
            /**
             * Search
             * Search by prefix
             */
            export type Search = string | null
            /**
             * Store Integration Id
             * Helpdesk store integration id
             */
            export type StoreIntegrationId = string
        }
        export interface QueryParameters {
            search?: Parameters.Search
            store_integration_id: Parameters.StoreIntegrationId
        }
        namespace Responses {
            /**
             * Response Get Discount Offers
             */
            export type $200 = Components.Schemas.DiscountOfferResponseSchema[]
            export type $422 = Components.Schemas.HTTPValidationError
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
            export type SettingType = string | null
        }
        export interface PathParameters {
            channel_connection_id: Parameters.ChannelConnectionId
        }
        export interface QueryParameters {
            setting_type?: Parameters.SettingType
        }
        namespace Responses {
            /**
             * Response Get Settings
             */
            export type $200 = Components.Schemas.SettingResponseSchema[]
            export type $422 = Components.Schemas.HTTPValidationError
        }
    }
    namespace GetStatusAndUsage {
        namespace Parameters {
            /**
             * Shop Integration Id
             */
            export type ShopIntegrationId = number | null
        }
        export interface QueryParameters {
            shop_integration_id?: Parameters.ShopIntegrationId
        }
        namespace Responses {
            export type $200 =
                Components.Schemas.SubscriptionUsageAndBundleStatusSchema
            export type $422 = Components.Schemas.HTTPValidationError
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
    namespace HealthCheck_Get {
        namespace Responses {
            /**
             * Response Health Check  Get
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
            export type $200 = Components.Schemas.InstallationSchema[]
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
            ab_test_id: Parameters.AbTestId
        }
        export type RequestBody = Components.Schemas.ABTestPatchRequestSchema
        namespace Responses {
            export type $200 = Components.Schemas.ABTestResponseSchema
            export type $422 = Components.Schemas.HTTPValidationError
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
            campaign_id: Parameters.CampaignId
        }
        export type RequestBody = Components.Schemas.CampaignPatchRequestSchema
        namespace Responses {
            export type $200 = Components.Schemas.CampaignResponseSchema
            export type $422 = Components.Schemas.HTTPValidationError
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
            channel_connection_id: Parameters.ChannelConnectionId
        }
        export type RequestBody = Components.Schemas.ChannelPatchRequestSchema
        namespace Responses {
            export type $200 =
                Components.Schemas.ChannelConnectionResponseSchema
            export type $422 = Components.Schemas.HTTPValidationError
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
            discount_offer_id: Parameters.DiscountOfferId
        }
        export type RequestBody =
            Components.Schemas.DiscountOfferPatchRequestSchema
        namespace Responses {
            export type $200 = Components.Schemas.DiscountOfferResponseSchema
            export type $422 = Components.Schemas.HTTPValidationError
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
            campaign_id: Parameters.CampaignId
        }
        namespace Responses {
            export type $200 = Components.Schemas.ABGroupResponseSchema
            export type $422 = Components.Schemas.HTTPValidationError
        }
    }
    namespace ProductRecommendations {
        export type RequestBody =
            Components.Schemas.DeprecatedProductRecommendationRequestSchema
        namespace Responses {
            export type $200 =
                Components.Schemas.DeprecatedProductRecommendationResponseSchema
            export type $422 = Components.Schemas.HTTPValidationError
        }
    }
    namespace RecommendationsProduct {
        export type RequestBody =
            Components.Schemas.ProductRecommendationRequestSchema
        namespace Responses {
            export type $200 =
                Components.Schemas.ProductRecommendationResponseSchema
            export type $422 = Components.Schemas.HTTPValidationError
        }
    }
    namespace RedirectR_Alias_Get {
        export interface HeaderParameters {
            referrer?: Parameters.Referrer
            'user-agent'?: Parameters.UserAgent
        }
        namespace Parameters {
            /**
             * Alias
             */
            export type Alias = string
            /**
             * Referrer
             */
            export type Referrer = string | null
            /**
             * User-Agent
             */
            export type UserAgent = string
        }
        export interface PathParameters {
            alias: Parameters.Alias
        }
        namespace Responses {
            export type $302 = any
            export type $422 = Components.Schemas.HTTPValidationError
        }
    }
    namespace RetrieveCustomDomainsGet {
        namespace Responses {
            export type $200 = Components.Schemas.CustomDomainSchema
        }
    }
    namespace RetrieveUrlsByMetaClickTrackingCheckPost {
        export type RequestBody = Components.Schemas.JWTTokenSchema
        namespace Responses {
            /**
             * Response Retrieve Urls By Meta Click Tracking Check Post
             */
            export type $201 = Components.Schemas.URLWithClicksSchema[]
            export type $422 = Components.Schemas.HTTPValidationError
        }
    }
    namespace RevealDiscountCode {
        export type RequestBody =
            Components.Schemas.RevealDiscountCodeRequestSchema
        namespace Responses {
            export type $200 =
                Components.Schemas.RevealDiscountCodeResponseSchema
            export type $422 = Components.Schemas.HTTPValidationError
        }
    }
    namespace ServiceInstallationGetOrCreateBundleInstallationsManagePost {
        export type RequestBody = Components.Schemas.JWTTokenSchema
        namespace Responses {
            export type $201 = Components.Schemas.InstallationSchema
            export type $422 = Components.Schemas.HTTPValidationError
        }
    }
    namespace ServiceInstallationStatusUpdateBundleInstallationsManagePut {
        export type RequestBody = Components.Schemas.JWTTokenSchema
        namespace Responses {
            export type $200 = Components.Schemas.InstallationSchema
            export type $422 = Components.Schemas.HTTPValidationError
        }
    }
    namespace ServiceRetrieveInstallationBundleInstallationsManageRetrievePost {
        export type RequestBody = Components.Schemas.JWTTokenSchema
        namespace Responses {
            export type $200 = Components.Schemas.InstallationSchema
            export type $422 = Components.Schemas.HTTPValidationError
        }
    }
    namespace ShortenShortenPost {
        export type RequestBody = Components.Schemas.URLCreateBulkSchema
        namespace Responses {
            export type $201 = Components.Schemas.URLBulkSchema
            export type $422 = Components.Schemas.HTTPValidationError
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
            campaign_id: Parameters.CampaignId
        }
        namespace Responses {
            export type $200 = Components.Schemas.ABGroupResponseSchema
            export type $422 = Components.Schemas.HTTPValidationError
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
            campaign_id: Parameters.CampaignId
        }
        export type RequestBody = Components.Schemas.ABGroupStopRequestSchema
        namespace Responses {
            export type $200 = Components.Schemas.ABGroupResponseSchema
            export type $422 = Components.Schemas.HTTPValidationError
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
            revenue_id: Parameters.RevenueId
        }
        export type RequestBody = Components.Schemas.VisitorFormSubmissionSchema
        namespace Responses {
            export type $202 = any
            export type $422 = Components.Schemas.HTTPValidationError
        }
    }
    namespace UpdateAutoUpgradeFlag {
        export type RequestBody = Components.Schemas.UpdateAutoUpgradeSchema
        namespace Responses {
            export type $200 = Components.Schemas.UpdateAutoUpgradeSchema
            export type $422 = Components.Schemas.HTTPValidationError
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
            id: Parameters.Id
        }
        export type RequestBody =
            Components.Schemas.InstallationUpdateConfigSchema
        namespace Responses {
            export type $200 = Components.Schemas.InstallationSchema
            export type $422 = Components.Schemas.HTTPValidationError
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
            channel_connection_id: Parameters.ChannelConnectionId
        }
        export type RequestBody = Components.Schemas.RequestSettingSchema
        namespace Responses {
            export type $202 = Components.Schemas.SettingResponseSchema
            export type $422 = Components.Schemas.HTTPValidationError
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
        config?: AxiosRequestConfig
    ): OperationResponse<
        Paths.GetAbTests.Responses.$200 | Paths.GetAbTests.Responses.$422
    >
    /**
     * create_ab_test - Create Ab Test
     */
    'create_ab_test'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.CreateAbTest.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        Paths.CreateAbTest.Responses.$201 | Paths.CreateAbTest.Responses.$422
    >
    /**
     * get_ab_test - Get Ab Test
     */
    'get_ab_test'(
        parameters?: Parameters<Paths.GetAbTest.PathParameters> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        Paths.GetAbTest.Responses.$200 | Paths.GetAbTest.Responses.$422
    >
    /**
     * patch_ab_test - Patch Ab Test
     */
    'patch_ab_test'(
        parameters?: Parameters<Paths.PatchAbTest.PathParameters> | null,
        data?: Paths.PatchAbTest.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        Paths.PatchAbTest.Responses.$200 | Paths.PatchAbTest.Responses.$422
    >
    /**
     * evaluate_campaign_rules - Evaluate Campaign Rules
     */
    'evaluate_campaign_rules'(
        parameters?: Parameters<Paths.EvaluateCampaignRules.HeaderParameters> | null,
        data?: Paths.EvaluateCampaignRules.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.EvaluateCampaignRules.Responses.$200
        | Paths.EvaluateCampaignRules.Responses.$422
    >
    /**
     * get_config_assistant_configs_revenue__installation_id__get - Get Config
     */
    'get_config_assistant_configs_revenue__installation_id__get'(
        parameters?: Parameters<
            Paths.GetConfigAssistantConfigsRevenue_InstallationId_Get.PathParameters &
                Paths.GetConfigAssistantConfigsRevenue_InstallationId_Get.QueryParameters
        > | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.GetConfigAssistantConfigsRevenue_InstallationId_Get.Responses.$200
        | Paths.GetConfigAssistantConfigsRevenue_InstallationId_Get.Responses.$422
    >
    /**
     * get_config_by_revenue_id - Get Config
     */
    'get_config_by_revenue_id'(
        parameters?: Parameters<
            Paths.GetConfigByRevenueId.PathParameters &
                Paths.GetConfigByRevenueId.QueryParameters
        > | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.GetConfigByRevenueId.Responses.$200
        | Paths.GetConfigByRevenueId.Responses.$422
    >
    /**
     * get_config_by_shop_name - Get Config By Shop Name
     */
    'get_config_by_shop_name'(
        parameters?: Parameters<
            Paths.GetConfigByShopName.PathParameters &
                Paths.GetConfigByShopName.QueryParameters
        > | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.GetConfigByShopName.Responses.$200
        | Paths.GetConfigByShopName.Responses.$422
    >
    /**
     * reveal_discount_code - Reveal
     */
    'reveal_discount_code'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.RevealDiscountCode.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.RevealDiscountCode.Responses.$200
        | Paths.RevealDiscountCode.Responses.$422
    >
    /**
     * product_recommendations - Deprecated Product Recommendations
     */
    'product_recommendations'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.ProductRecommendations.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.ProductRecommendations.Responses.$200
        | Paths.ProductRecommendations.Responses.$422
    >
    /**
     * recommendations_product - Recommend Products
     */
    'recommendations_product'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.RecommendationsProduct.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.RecommendationsProduct.Responses.$200
        | Paths.RecommendationsProduct.Responses.$422
    >
    /**
     * submit_contact_form - Submit Contact Form
     */
    'submit_contact_form'(
        parameters?: Parameters<Paths.SubmitContactForm.PathParameters> | null,
        data?: Paths.SubmitContactForm.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.SubmitContactForm.Responses.$202
        | Paths.SubmitContactForm.Responses.$422
    >
    /**
     * get_settings - Get Settings For Channel Connection
     */
    'get_settings'(
        parameters?: Parameters<
            Paths.GetSettings.PathParameters & Paths.GetSettings.QueryParameters
        > | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        Paths.GetSettings.Responses.$200 | Paths.GetSettings.Responses.$422
    >
    /**
     * update_setting - Update Setting For Channel Connection
     */
    'update_setting'(
        parameters?: Parameters<Paths.UpdateSetting.PathParameters> | null,
        data?: Paths.UpdateSetting.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        Paths.UpdateSetting.Responses.$202 | Paths.UpdateSetting.Responses.$422
    >
    /**
     * get_discount_offers - Get Discount Offers
     */
    'get_discount_offers'(
        parameters?: Parameters<Paths.GetDiscountOffers.QueryParameters> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.GetDiscountOffers.Responses.$200
        | Paths.GetDiscountOffers.Responses.$422
    >
    /**
     * create_discount_offer - Create Discount Offer
     */
    'create_discount_offer'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.CreateDiscountOffer.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.CreateDiscountOffer.Responses.$201
        | Paths.CreateDiscountOffer.Responses.$422
    >
    /**
     * get_discount_offer - Get Discount Offer
     */
    'get_discount_offer'(
        parameters?: Parameters<Paths.GetDiscountOffer.PathParameters> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.GetDiscountOffer.Responses.$200
        | Paths.GetDiscountOffer.Responses.$422
    >
    /**
     * patch_discount_offer - Patch Discount Offer
     */
    'patch_discount_offer'(
        parameters?: Parameters<Paths.PatchDiscountOffer.PathParameters> | null,
        data?: Paths.PatchDiscountOffer.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.PatchDiscountOffer.Responses.$200
        | Paths.PatchDiscountOffer.Responses.$422
    >
    /**
     * delete_discount_offer - Delete Discount Offer
     */
    'delete_discount_offer'(
        parameters?: Parameters<Paths.DeleteDiscountOffer.PathParameters> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<Paths.DeleteDiscountOffer.Responses.$422>
    /**
     * service_installation_status_update_bundle_installations_manage_put - Service Installation Status Update
     */
    'service_installation_status_update_bundle_installations_manage_put'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.ServiceInstallationStatusUpdateBundleInstallationsManagePut.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.ServiceInstallationStatusUpdateBundleInstallationsManagePut.Responses.$200
        | Paths.ServiceInstallationStatusUpdateBundleInstallationsManagePut.Responses.$422
    >
    /**
     * service_installation_get_or_create_bundle_installations_manage_post - Service Installation Get Or Create
     */
    'service_installation_get_or_create_bundle_installations_manage_post'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.ServiceInstallationGetOrCreateBundleInstallationsManagePost.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.ServiceInstallationGetOrCreateBundleInstallationsManagePost.Responses.$201
        | Paths.ServiceInstallationGetOrCreateBundleInstallationsManagePost.Responses.$422
    >
    /**
     * service_retrieve_installation_bundle_installations_manage_retrieve_post - Service Retrieve Installation
     */
    'service_retrieve_installation_bundle_installations_manage_retrieve_post'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.ServiceRetrieveInstallationBundleInstallationsManageRetrievePost.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.ServiceRetrieveInstallationBundleInstallationsManageRetrievePost.Responses.$200
        | Paths.ServiceRetrieveInstallationBundleInstallationsManageRetrievePost.Responses.$422
    >
    /**
     * list_bundle_installation - Installation List
     */
    'list_bundle_installation'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<Paths.ListBundleInstallation.Responses.$200>
    /**
     * get_bundle_installation - Retrieve
     */
    'get_bundle_installation'(
        parameters?: Parameters<Paths.GetBundleInstallation.PathParameters> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.GetBundleInstallation.Responses.$200
        | Paths.GetBundleInstallation.Responses.$422
    >
    /**
     * update_bundle_installation - Update
     */
    'update_bundle_installation'(
        parameters?: Parameters<Paths.UpdateBundleInstallation.PathParameters> | null,
        data?: Paths.UpdateBundleInstallation.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.UpdateBundleInstallation.Responses.$200
        | Paths.UpdateBundleInstallation.Responses.$422
    >
    /**
     * create_click_tracking_post - Create
     */
    'create_click_tracking_post'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.CreateClickTrackingPost.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.CreateClickTrackingPost.Responses.$201
        | Paths.CreateClickTrackingPost.Responses.$422
    >
    /**
     * create_bulk_click_tracking_bulk_post - Create Bulk
     */
    'create_bulk_click_tracking_bulk_post'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.CreateBulkClickTrackingBulkPost.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.CreateBulkClickTrackingBulkPost.Responses.$201
        | Paths.CreateBulkClickTrackingBulkPost.Responses.$422
    >
    /**
     * shorten_shorten_post - Shorten
     */
    'shorten_shorten_post'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.ShortenShortenPost.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.ShortenShortenPost.Responses.$201
        | Paths.ShortenShortenPost.Responses.$422
    >
    /**
     * retrieve_urls_by_meta_click_tracking_check_post - Retrieve Urls By Meta
     */
    'retrieve_urls_by_meta_click_tracking_check_post'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.RetrieveUrlsByMetaClickTrackingCheckPost.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.RetrieveUrlsByMetaClickTrackingCheckPost.Responses.$201
        | Paths.RetrieveUrlsByMetaClickTrackingCheckPost.Responses.$422
    >
    /**
     * redirect_r__alias__get - Redirect
     */
    'redirect_r__alias__get'(
        parameters?: Parameters<
            Paths.RedirectR_Alias_Get.PathParameters &
                Paths.RedirectR_Alias_Get.HeaderParameters
        > | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.RedirectR_Alias_Get.Responses.$302
        | Paths.RedirectR_Alias_Get.Responses.$422
    >
    /**
     * get_custom_domain - Retrieve
     */
    'get_custom_domain'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<Paths.GetCustomDomain.Responses.$200>
    /**
     * create_custom_domain - Create
     */
    'create_custom_domain'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.CreateCustomDomain.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.CreateCustomDomain.Responses.$201
        | Paths.CreateCustomDomain.Responses.$422
    >
    /**
     * delete_custom_domain - Delete
     */
    'delete_custom_domain'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<any>
    /**
     * check_custom_domain - Check
     */
    'check_custom_domain'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<Paths.CheckCustomDomain.Responses.$200>
    /**
     * retrieve_custom_domains_get - Retrieve
     */
    'retrieve_custom_domains_get'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<Paths.RetrieveCustomDomainsGet.Responses.$200>
    /**
     * create_custom_domains_post - Create
     */
    'create_custom_domains_post'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.CreateCustomDomainsPost.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.CreateCustomDomainsPost.Responses.$201
        | Paths.CreateCustomDomainsPost.Responses.$422
    >
    /**
     * delete_custom_domains_delete - Delete
     */
    'delete_custom_domains_delete'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<any>
    /**
     * check_custom_domains_check_post - Check
     */
    'check_custom_domains_check_post'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<Paths.CheckCustomDomainsCheckPost.Responses.$200>
    /**
     * get_campaigns - Get Campaigns
     */
    'get_campaigns'(
        parameters?: Parameters<Paths.GetCampaigns.QueryParameters> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        Paths.GetCampaigns.Responses.$200 | Paths.GetCampaigns.Responses.$422
    >
    /**
     * create_campaign - Create Campaign
     */
    'create_campaign'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.CreateCampaign.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.CreateCampaign.Responses.$201
        | Paths.CreateCampaign.Responses.$422
    >
    /**
     * get_all_campaigns - Get All Campaigns
     */
    'get_all_campaigns'(
        parameters?: Parameters<Paths.GetAllCampaigns.HeaderParameters> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.GetAllCampaigns.Responses.$200
        | Paths.GetAllCampaigns.Responses.$422
    >
    /**
     * get_campaign - Get Campaign
     */
    'get_campaign'(
        parameters?: Parameters<Paths.GetCampaign.PathParameters> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        Paths.GetCampaign.Responses.$200 | Paths.GetCampaign.Responses.$422
    >
    /**
     * patch_campaign - Patch Campaign
     */
    'patch_campaign'(
        parameters?: Parameters<Paths.PatchCampaign.PathParameters> | null,
        data?: Paths.PatchCampaign.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        Paths.PatchCampaign.Responses.$200 | Paths.PatchCampaign.Responses.$422
    >
    /**
     * delete_campaign - Delete Campaign
     */
    'delete_campaign'(
        parameters?: Parameters<Paths.DeleteCampaign.PathParameters> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<Paths.DeleteCampaign.Responses.$422>
    /**
     * create_ab_group - Create Ab Group
     */
    'create_ab_group'(
        parameters?: Parameters<Paths.CreateAbGroup.PathParameters> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        Paths.CreateAbGroup.Responses.$200 | Paths.CreateAbGroup.Responses.$422
    >
    /**
     * start_ab_group - Start Ab Group
     */
    'start_ab_group'(
        parameters?: Parameters<Paths.StartAbGroup.PathParameters> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        Paths.StartAbGroup.Responses.$200 | Paths.StartAbGroup.Responses.$422
    >
    /**
     * pause_ab_group - Pause Ab Group
     */
    'pause_ab_group'(
        parameters?: Parameters<Paths.PauseAbGroup.PathParameters> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        Paths.PauseAbGroup.Responses.$200 | Paths.PauseAbGroup.Responses.$422
    >
    /**
     * stop_ab_group - Stop Ab Group
     */
    'stop_ab_group'(
        parameters?: Parameters<Paths.StopAbGroup.PathParameters> | null,
        data?: Paths.StopAbGroup.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        Paths.StopAbGroup.Responses.$200 | Paths.StopAbGroup.Responses.$422
    >
    /**
     * get_channel_connections - Get Channel Connections
     */
    'get_channel_connections'(
        parameters?: Parameters<Paths.GetChannelConnections.QueryParameters> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.GetChannelConnections.Responses.$200
        | Paths.GetChannelConnections.Responses.$422
    >
    /**
     * create_channel_connection - Create Channel Connection
     */
    'create_channel_connection'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.CreateChannelConnection.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.CreateChannelConnection.Responses.$201
        | Paths.CreateChannelConnection.Responses.$422
    >
    /**
     * get_channel_connection - Get Channel Connection
     */
    'get_channel_connection'(
        parameters?: Parameters<Paths.GetChannelConnection.PathParameters> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.GetChannelConnection.Responses.$200
        | Paths.GetChannelConnection.Responses.$422
    >
    /**
     * patch_channel_connection - Patch Channel Connection
     */
    'patch_channel_connection'(
        parameters?: Parameters<Paths.PatchChannelConnection.PathParameters> | null,
        data?: Paths.PatchChannelConnection.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.PatchChannelConnection.Responses.$200
        | Paths.PatchChannelConnection.Responses.$422
    >
    /**
     * delete_channel_connection - Delete Channel Connection
     */
    'delete_channel_connection'(
        parameters?: Parameters<Paths.DeleteChannelConnection.PathParameters> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<Paths.DeleteChannelConnection.Responses.$422>
    /**
     * get_status_and_usage - Get Status And Usage
     */
    'get_status_and_usage'(
        parameters?: Parameters<Paths.GetStatusAndUsage.QueryParameters> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.GetStatusAndUsage.Responses.$200
        | Paths.GetStatusAndUsage.Responses.$422
    >
    /**
     * update_auto_upgrade_flag - Update Auto Upgrade Flag
     */
    'update_auto_upgrade_flag'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.UpdateAutoUpgradeFlag.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.UpdateAutoUpgradeFlag.Responses.$200
        | Paths.UpdateAutoUpgradeFlag.Responses.$422
    >
    /**
     * get_subscription_statuses - Get Subscription Statuses
     */
    'get_subscription_statuses'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<Paths.GetSubscriptionStatuses.Responses.$200>
    /**
     * health_check_health_check_get - Health Check
     */
    'health_check_health_check_get'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<Paths.HealthCheckHealthCheckGet.Responses.$200>
    /**
     * health_check__get - Health Check
     */
    'health_check__get'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<Paths.HealthCheck_Get.Responses.$200>
}

export interface PathsDictionary {
    ['/ab-tests']: {
        /**
         * create_ab_test - Create Ab Test
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.CreateAbTest.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.CreateAbTest.Responses.$201
            | Paths.CreateAbTest.Responses.$422
        >
        /**
         * get_ab_tests - Get Ab Tests
         */
        'get'(
            parameters?: Parameters<Paths.GetAbTests.QueryParameters> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            Paths.GetAbTests.Responses.$200 | Paths.GetAbTests.Responses.$422
        >
    }
    ['/ab-tests/{ab_test_id}']: {
        /**
         * get_ab_test - Get Ab Test
         */
        'get'(
            parameters?: Parameters<Paths.GetAbTest.PathParameters> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            Paths.GetAbTest.Responses.$200 | Paths.GetAbTest.Responses.$422
        >
        /**
         * patch_ab_test - Patch Ab Test
         */
        'patch'(
            parameters?: Parameters<Paths.PatchAbTest.PathParameters> | null,
            data?: Paths.PatchAbTest.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            Paths.PatchAbTest.Responses.$200 | Paths.PatchAbTest.Responses.$422
        >
    }
    ['/assistant/evaluations']: {
        /**
         * evaluate_campaign_rules - Evaluate Campaign Rules
         */
        'post'(
            parameters?: Parameters<Paths.EvaluateCampaignRules.HeaderParameters> | null,
            data?: Paths.EvaluateCampaignRules.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.EvaluateCampaignRules.Responses.$200
            | Paths.EvaluateCampaignRules.Responses.$422
        >
    }
    ['/assistant/configs/revenue/{installation_id}']: {
        /**
         * get_config_assistant_configs_revenue__installation_id__get - Get Config
         */
        'get'(
            parameters?: Parameters<
                Paths.GetConfigAssistantConfigsRevenue_InstallationId_Get.PathParameters &
                    Paths.GetConfigAssistantConfigsRevenue_InstallationId_Get.QueryParameters
            > | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.GetConfigAssistantConfigsRevenue_InstallationId_Get.Responses.$200
            | Paths.GetConfigAssistantConfigsRevenue_InstallationId_Get.Responses.$422
        >
    }
    ['/assistant/configs/{installation_id}']: {
        /**
         * get_config_by_revenue_id - Get Config
         */
        'get'(
            parameters?: Parameters<
                Paths.GetConfigByRevenueId.PathParameters &
                    Paths.GetConfigByRevenueId.QueryParameters
            > | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.GetConfigByRevenueId.Responses.$200
            | Paths.GetConfigByRevenueId.Responses.$422
        >
    }
    ['/assistant/configs/shop/{shop_name}']: {
        /**
         * get_config_by_shop_name - Get Config By Shop Name
         */
        'get'(
            parameters?: Parameters<
                Paths.GetConfigByShopName.PathParameters &
                    Paths.GetConfigByShopName.QueryParameters
            > | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.GetConfigByShopName.Responses.$200
            | Paths.GetConfigByShopName.Responses.$422
        >
    }
    ['/assistant/discount-codes/reveal']: {
        /**
         * reveal_discount_code - Reveal
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.RevealDiscountCode.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.RevealDiscountCode.Responses.$200
            | Paths.RevealDiscountCode.Responses.$422
        >
    }
    ['/assistant/pr']: {
        /**
         * product_recommendations - Deprecated Product Recommendations
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.ProductRecommendations.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.ProductRecommendations.Responses.$200
            | Paths.ProductRecommendations.Responses.$422
        >
    }
    ['/assistant/recommend/p']: {
        /**
         * recommendations_product - Recommend Products
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.RecommendationsProduct.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.RecommendationsProduct.Responses.$200
            | Paths.RecommendationsProduct.Responses.$422
        >
    }
    ['/assistant/contact-form/{revenue_id}']: {
        /**
         * submit_contact_form - Submit Contact Form
         */
        'post'(
            parameters?: Parameters<Paths.SubmitContactForm.PathParameters> | null,
            data?: Paths.SubmitContactForm.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.SubmitContactForm.Responses.$202
            | Paths.SubmitContactForm.Responses.$422
        >
    }
    ['/settings/{channel_connection_id}']: {
        /**
         * get_settings - Get Settings For Channel Connection
         */
        'get'(
            parameters?: Parameters<
                Paths.GetSettings.PathParameters &
                    Paths.GetSettings.QueryParameters
            > | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            Paths.GetSettings.Responses.$200 | Paths.GetSettings.Responses.$422
        >
        /**
         * update_setting - Update Setting For Channel Connection
         */
        'put'(
            parameters?: Parameters<Paths.UpdateSetting.PathParameters> | null,
            data?: Paths.UpdateSetting.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.UpdateSetting.Responses.$202
            | Paths.UpdateSetting.Responses.$422
        >
    }
    ['/discount-offers']: {
        /**
         * create_discount_offer - Create Discount Offer
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.CreateDiscountOffer.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.CreateDiscountOffer.Responses.$201
            | Paths.CreateDiscountOffer.Responses.$422
        >
        /**
         * get_discount_offers - Get Discount Offers
         */
        'get'(
            parameters?: Parameters<Paths.GetDiscountOffers.QueryParameters> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.GetDiscountOffers.Responses.$200
            | Paths.GetDiscountOffers.Responses.$422
        >
    }
    ['/discount-offers/{discount_offer_id}']: {
        /**
         * get_discount_offer - Get Discount Offer
         */
        'get'(
            parameters?: Parameters<Paths.GetDiscountOffer.PathParameters> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.GetDiscountOffer.Responses.$200
            | Paths.GetDiscountOffer.Responses.$422
        >
        /**
         * patch_discount_offer - Patch Discount Offer
         */
        'patch'(
            parameters?: Parameters<Paths.PatchDiscountOffer.PathParameters> | null,
            data?: Paths.PatchDiscountOffer.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.PatchDiscountOffer.Responses.$200
            | Paths.PatchDiscountOffer.Responses.$422
        >
        /**
         * delete_discount_offer - Delete Discount Offer
         */
        'delete'(
            parameters?: Parameters<Paths.DeleteDiscountOffer.PathParameters> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<Paths.DeleteDiscountOffer.Responses.$422>
    }
    ['/bundle/installations/manage']: {
        /**
         * service_installation_status_update_bundle_installations_manage_put - Service Installation Status Update
         */
        'put'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.ServiceInstallationStatusUpdateBundleInstallationsManagePut.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.ServiceInstallationStatusUpdateBundleInstallationsManagePut.Responses.$200
            | Paths.ServiceInstallationStatusUpdateBundleInstallationsManagePut.Responses.$422
        >
        /**
         * service_installation_get_or_create_bundle_installations_manage_post - Service Installation Get Or Create
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.ServiceInstallationGetOrCreateBundleInstallationsManagePost.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.ServiceInstallationGetOrCreateBundleInstallationsManagePost.Responses.$201
            | Paths.ServiceInstallationGetOrCreateBundleInstallationsManagePost.Responses.$422
        >
    }
    ['/bundle/installations/manage/retrieve']: {
        /**
         * service_retrieve_installation_bundle_installations_manage_retrieve_post - Service Retrieve Installation
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.ServiceRetrieveInstallationBundleInstallationsManageRetrievePost.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.ServiceRetrieveInstallationBundleInstallationsManageRetrievePost.Responses.$200
            | Paths.ServiceRetrieveInstallationBundleInstallationsManageRetrievePost.Responses.$422
        >
    }
    ['/bundle/installations']: {
        /**
         * list_bundle_installation - Installation List
         */
        'get'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<Paths.ListBundleInstallation.Responses.$200>
    }
    ['/bundle/installations/{id}']: {
        /**
         * get_bundle_installation - Retrieve
         */
        'get'(
            parameters?: Parameters<Paths.GetBundleInstallation.PathParameters> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.GetBundleInstallation.Responses.$200
            | Paths.GetBundleInstallation.Responses.$422
        >
        /**
         * update_bundle_installation - Update
         */
        'patch'(
            parameters?: Parameters<Paths.UpdateBundleInstallation.PathParameters> | null,
            data?: Paths.UpdateBundleInstallation.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.UpdateBundleInstallation.Responses.$200
            | Paths.UpdateBundleInstallation.Responses.$422
        >
    }
    ['/click-tracking']: {
        /**
         * create_click_tracking_post - Create
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.CreateClickTrackingPost.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.CreateClickTrackingPost.Responses.$201
            | Paths.CreateClickTrackingPost.Responses.$422
        >
    }
    ['/click-tracking/bulk']: {
        /**
         * create_bulk_click_tracking_bulk_post - Create Bulk
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.CreateBulkClickTrackingBulkPost.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.CreateBulkClickTrackingBulkPost.Responses.$201
            | Paths.CreateBulkClickTrackingBulkPost.Responses.$422
        >
    }
    ['/shorten']: {
        /**
         * shorten_shorten_post - Shorten
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.ShortenShortenPost.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.ShortenShortenPost.Responses.$201
            | Paths.ShortenShortenPost.Responses.$422
        >
    }
    ['/click-tracking/check']: {
        /**
         * retrieve_urls_by_meta_click_tracking_check_post - Retrieve Urls By Meta
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.RetrieveUrlsByMetaClickTrackingCheckPost.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.RetrieveUrlsByMetaClickTrackingCheckPost.Responses.$201
            | Paths.RetrieveUrlsByMetaClickTrackingCheckPost.Responses.$422
        >
    }
    ['/r/{alias}']: {
        /**
         * redirect_r__alias__get - Redirect
         */
        'get'(
            parameters?: Parameters<
                Paths.RedirectR_Alias_Get.PathParameters &
                    Paths.RedirectR_Alias_Get.HeaderParameters
            > | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.RedirectR_Alias_Get.Responses.$302
            | Paths.RedirectR_Alias_Get.Responses.$422
        >
    }
    ['/click-tracking/custom-domains']: {
        /**
         * get_custom_domain - Retrieve
         */
        'get'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<Paths.GetCustomDomain.Responses.$200>
        /**
         * create_custom_domain - Create
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.CreateCustomDomain.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.CreateCustomDomain.Responses.$201
            | Paths.CreateCustomDomain.Responses.$422
        >
        /**
         * delete_custom_domain - Delete
         */
        'delete'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<any>
    }
    ['/click-tracking/custom-domains/check']: {
        /**
         * check_custom_domain - Check
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<Paths.CheckCustomDomain.Responses.$200>
    }
    ['/custom-domains']: {
        /**
         * retrieve_custom_domains_get - Retrieve
         */
        'get'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<Paths.RetrieveCustomDomainsGet.Responses.$200>
        /**
         * create_custom_domains_post - Create
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.CreateCustomDomainsPost.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.CreateCustomDomainsPost.Responses.$201
            | Paths.CreateCustomDomainsPost.Responses.$422
        >
        /**
         * delete_custom_domains_delete - Delete
         */
        'delete'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<any>
    }
    ['/custom-domains/check']: {
        /**
         * check_custom_domains_check_post - Check
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<Paths.CheckCustomDomainsCheckPost.Responses.$200>
    }
    ['/campaigns']: {
        /**
         * create_campaign - Create Campaign
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.CreateCampaign.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.CreateCampaign.Responses.$201
            | Paths.CreateCampaign.Responses.$422
        >
        /**
         * get_campaigns - Get Campaigns
         */
        'get'(
            parameters?: Parameters<Paths.GetCampaigns.QueryParameters> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.GetCampaigns.Responses.$200
            | Paths.GetCampaigns.Responses.$422
        >
    }
    ['/campaigns/all']: {
        /**
         * get_all_campaigns - Get All Campaigns
         */
        'get'(
            parameters?: Parameters<Paths.GetAllCampaigns.HeaderParameters> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.GetAllCampaigns.Responses.$200
            | Paths.GetAllCampaigns.Responses.$422
        >
    }
    ['/campaigns/{campaign_id}']: {
        /**
         * get_campaign - Get Campaign
         */
        'get'(
            parameters?: Parameters<Paths.GetCampaign.PathParameters> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            Paths.GetCampaign.Responses.$200 | Paths.GetCampaign.Responses.$422
        >
        /**
         * patch_campaign - Patch Campaign
         */
        'patch'(
            parameters?: Parameters<Paths.PatchCampaign.PathParameters> | null,
            data?: Paths.PatchCampaign.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.PatchCampaign.Responses.$200
            | Paths.PatchCampaign.Responses.$422
        >
        /**
         * delete_campaign - Delete Campaign
         */
        'delete'(
            parameters?: Parameters<Paths.DeleteCampaign.PathParameters> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<Paths.DeleteCampaign.Responses.$422>
    }
    ['/campaigns/{campaign_id}/ab-test']: {
        /**
         * create_ab_group - Create Ab Group
         */
        'post'(
            parameters?: Parameters<Paths.CreateAbGroup.PathParameters> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.CreateAbGroup.Responses.$200
            | Paths.CreateAbGroup.Responses.$422
        >
    }
    ['/campaigns/{campaign_id}/ab-test/start']: {
        /**
         * start_ab_group - Start Ab Group
         */
        'post'(
            parameters?: Parameters<Paths.StartAbGroup.PathParameters> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.StartAbGroup.Responses.$200
            | Paths.StartAbGroup.Responses.$422
        >
    }
    ['/campaigns/{campaign_id}/ab-test/pause']: {
        /**
         * pause_ab_group - Pause Ab Group
         */
        'post'(
            parameters?: Parameters<Paths.PauseAbGroup.PathParameters> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.PauseAbGroup.Responses.$200
            | Paths.PauseAbGroup.Responses.$422
        >
    }
    ['/campaigns/{campaign_id}/ab-test/stop']: {
        /**
         * stop_ab_group - Stop Ab Group
         */
        'post'(
            parameters?: Parameters<Paths.StopAbGroup.PathParameters> | null,
            data?: Paths.StopAbGroup.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            Paths.StopAbGroup.Responses.$200 | Paths.StopAbGroup.Responses.$422
        >
    }
    ['/channel-connections']: {
        /**
         * create_channel_connection - Create Channel Connection
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.CreateChannelConnection.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.CreateChannelConnection.Responses.$201
            | Paths.CreateChannelConnection.Responses.$422
        >
        /**
         * get_channel_connections - Get Channel Connections
         */
        'get'(
            parameters?: Parameters<Paths.GetChannelConnections.QueryParameters> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.GetChannelConnections.Responses.$200
            | Paths.GetChannelConnections.Responses.$422
        >
    }
    ['/channel-connections/{channel_connection_id}']: {
        /**
         * get_channel_connection - Get Channel Connection
         */
        'get'(
            parameters?: Parameters<Paths.GetChannelConnection.PathParameters> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.GetChannelConnection.Responses.$200
            | Paths.GetChannelConnection.Responses.$422
        >
        /**
         * patch_channel_connection - Patch Channel Connection
         */
        'patch'(
            parameters?: Parameters<Paths.PatchChannelConnection.PathParameters> | null,
            data?: Paths.PatchChannelConnection.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.PatchChannelConnection.Responses.$200
            | Paths.PatchChannelConnection.Responses.$422
        >
        /**
         * delete_channel_connection - Delete Channel Connection
         */
        'delete'(
            parameters?: Parameters<Paths.DeleteChannelConnection.PathParameters> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<Paths.DeleteChannelConnection.Responses.$422>
    }
    ['/billing/subscriptions/account-status']: {
        /**
         * get_status_and_usage - Get Status And Usage
         */
        'get'(
            parameters?: Parameters<Paths.GetStatusAndUsage.QueryParameters> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.GetStatusAndUsage.Responses.$200
            | Paths.GetStatusAndUsage.Responses.$422
        >
    }
    ['/billing/subscriptions/auto-upgrade']: {
        /**
         * update_auto_upgrade_flag - Update Auto Upgrade Flag
         */
        'put'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.UpdateAutoUpgradeFlag.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.UpdateAutoUpgradeFlag.Responses.$200
            | Paths.UpdateAutoUpgradeFlag.Responses.$422
        >
    }
    ['/billing/subscriptions/account-status/all']: {
        /**
         * get_subscription_statuses - Get Subscription Statuses
         */
        'get'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<Paths.GetSubscriptionStatuses.Responses.$200>
    }
    ['/health-check']: {
        /**
         * health_check_health_check_get - Health Check
         */
        'get'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<Paths.HealthCheckHealthCheckGet.Responses.$200>
    }
    ['/']: {
        /**
         * health_check__get - Health Check
         */
        'get'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<Paths.HealthCheck_Get.Responses.$200>
    }
}

export type Client = OpenAPIClient<OperationMethods, PathsDictionary>
