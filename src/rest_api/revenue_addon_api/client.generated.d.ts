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
         * BundleOnboardingStatus
         */
        export type BundleOnboardingStatus = 'installed' | 'not_installed'
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
            attachments?: any
            /**
             * Meta
             */
            meta?: any
            /**
             * Triggers
             */
            triggers: CampaignTriggerSchema[]
            /**
             * Channel Connection Id
             */
            channel_connection_id: string
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
         * CampaignIdSchema
         */
        export interface CampaignIdSchema {
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
            attachments?: any
            /**
             * Meta
             */
            meta?: any
            /**
             * Triggers
             */
            triggers: CampaignTriggerSchema[]
            /**
             * Id
             */
            id: string
            /**
             * External Tag Id
             */
            external_tag_id?: number | null
            /**
             * Deleted Datetime
             */
            deleted_datetime?: string /* date-time */ | null
            /**
             * Created Datetime
             */
            created_datetime?: string /* date-time */ | null
        }
        /**
         * CampaignPatchRequestSchema
         * Defines the fields that can be patched and accepts any subset of the fields.
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
            attachments?: any
            /**
             * Meta
             */
            meta?: any
            /**
             * Triggers
             */
            triggers?: CampaignTriggerSchema[] | null
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
            attachments?: any
            /**
             * Meta
             */
            meta?: any
            /**
             * Triggers
             */
            triggers: CampaignTriggerSchema[]
            /**
             * Id
             */
            id: string
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
         * CampaignSyncSchema
         */
        export interface CampaignSyncSchema {
            /**
             * Account Id
             */
            account_id: number
            /**
             * External Id
             */
            external_id: string
            /**
             * External Installation Status
             */
            external_installation_status?: string | null
            /**
             * Store Integration Id
             */
            store_integration_id?: number | null
            /**
             * Campaigns
             */
            campaigns: CampaignIdSchema[]
        }
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
            /**
             * Id
             */
            id: string
            type: CampaignTriggerType
            operator: CampaignTriggerOperator
            /**
             * Value
             */
            value: number | boolean | string | any[] | any
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
         * ChannelConnectionWithCampaignsResponseSchema
         */
        export interface ChannelConnectionWithCampaignsResponseSchema {
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
            channel: ChannelType
            /**
             * Account Id
             */
            account_id: number
            /**
             * Id
             */
            id: string
            /**
             * Campaigns
             */
            campaigns: CampaignResponseSchema[]
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
        }
        /**
         * ChannelType
         */
        export type ChannelType = 'widget'
        /**
         * ConfigSchema
         */
        export interface ConfigSchema {
            subscription: SubscriptionStatusSchema
            /**
             * Campaigns
             */
            campaigns: PublicCampaignResponseSchema[]
        }
        /**
         * CustomDomainOperationSchema
         */
        export interface CustomDomainOperationSchema {
            /**
             * Hostname
             */
            hostname: string
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
             * Revenue Addon Id
             */
            revenue_addon_id: string
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
             * Script Tag Id
             */
            script_tag_id?: string | null
            status: StatusEnum
            method: MethodEnum
            /**
             * Config
             */
            config: any
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
            config: any
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
        export type MethodEnum = 'one_click' | 'manual'
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
            attachments?: any
            /**
             * Meta
             */
            meta?: any
            /**
             * Triggers
             */
            triggers: CampaignTriggerSchema[]
            /**
             * Id
             */
            id: string
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
            meta?: any
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
    }
}
declare namespace Paths {
    namespace CampaignsSync {
        export type RequestBody = Components.Schemas.CampaignSyncSchema
        namespace Responses {
            /**
             * Response Campaigns Sync
             */
            export type $200 = string[]
            export type $422 = Components.Schemas.HTTPValidationError
        }
    }
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
    namespace EvaluateCampaignRules {
        export type RequestBody = Components.Schemas.EvaluationRequestSchema
        namespace Responses {
            export type $200 = Components.Schemas.EvaluationResponseSchema
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
                Components.Schemas.ChannelConnectionWithCampaignsResponseSchema[]
            export type $422 = Components.Schemas.HTTPValidationError
        }
    }
    namespace GetConfigByRevenueId {
        namespace Parameters {
            /**
             * Revenue Id
             */
            export type RevenueId = string
            /**
             * Widget-App-Id
             */
            export type WidgetAppId = string | null
        }
        export interface PathParameters {
            revenue_id: Parameters.RevenueId
        }
        export interface QueryParameters {
            'widget-app-id'?: Parameters.WidgetAppId
        }
        namespace Responses {
            export type $200 = Components.Schemas.ConfigSchema
            export type $422 = Components.Schemas.HTTPValidationError
        }
    }
    namespace GetCustomDomain {
        namespace Responses {
            export type $200 = Components.Schemas.CustomDomainSchema
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
    namespace HealthCheckAssistantHealthCheckGet {
        namespace Responses {
            /**
             * Response Health Check Assistant Health Check Get
             */
            export interface $200 {
                [name: string]: string
            }
        }
    }
    namespace HealthCheckAssistant_Get {
        namespace Responses {
            /**
             * Response Health Check Assistant  Get
             */
            export interface $200 {
                [name: string]: string
            }
        }
    }
    namespace HealthCheckBillingHealthCheckGet {
        namespace Responses {
            /**
             * Response Health Check Billing Health Check Get
             */
            export interface $200 {
                [name: string]: string
            }
        }
    }
    namespace HealthCheckBilling_Get {
        namespace Responses {
            /**
             * Response Health Check Billing  Get
             */
            export interface $200 {
                [name: string]: string
            }
        }
    }
    namespace HealthCheckBundleHealthCheckGet {
        namespace Responses {
            /**
             * Response Health Check Bundle Health Check Get
             */
            export interface $200 {
                [name: string]: string
            }
        }
    }
    namespace HealthCheckClickTrackingHealthCheckGet {
        namespace Responses {
            /**
             * Response Health Check Click Tracking Health Check Get
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
}

export interface OperationMethods {
    /**
     * health_check_assistant_health_check_get - Health Check
     */
    'health_check_assistant_health_check_get'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<Paths.HealthCheckAssistantHealthCheckGet.Responses.$200>
    /**
     * health_check_assistant__get - Health Check
     */
    'health_check_assistant__get'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<Paths.HealthCheckAssistant_Get.Responses.$200>
    /**
     * evaluate_campaign_rules - Evaluate Campaign Rules
     */
    'evaluate_campaign_rules'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.EvaluateCampaignRules.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.EvaluateCampaignRules.Responses.$200
        | Paths.EvaluateCampaignRules.Responses.$422
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
     * health_check_bundle_health_check_get - Health Check
     */
    'health_check_bundle_health_check_get'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<Paths.HealthCheckBundleHealthCheckGet.Responses.$200>
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
     * health_check_click_tracking_health_check_get - Health Check
     */
    'health_check_click_tracking_health_check_get'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<Paths.HealthCheckClickTrackingHealthCheckGet.Responses.$200>
    /**
     * health_check__get - Health Check
     */
    'health_check__get'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<Paths.HealthCheck_Get.Responses.$200>
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
     * campaigns_sync - Update
     */
    'campaigns_sync'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.CampaignsSync.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        Paths.CampaignsSync.Responses.$200 | Paths.CampaignsSync.Responses.$422
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
     * health_check_billing_health_check_get - Health Check
     */
    'health_check_billing_health_check_get'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<Paths.HealthCheckBillingHealthCheckGet.Responses.$200>
    /**
     * health_check_billing__get - Health Check
     */
    'health_check_billing__get'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<Paths.HealthCheckBilling_Get.Responses.$200>
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
}

export interface PathsDictionary {
    ['/assistant/health-check']: {
        /**
         * health_check_assistant_health_check_get - Health Check
         */
        'get'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<Paths.HealthCheckAssistantHealthCheckGet.Responses.$200>
    }
    ['/assistant/']: {
        /**
         * health_check_assistant__get - Health Check
         */
        'get'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<Paths.HealthCheckAssistant_Get.Responses.$200>
    }
    ['/assistant/evaluations']: {
        /**
         * evaluate_campaign_rules - Evaluate Campaign Rules
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.EvaluateCampaignRules.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.EvaluateCampaignRules.Responses.$200
            | Paths.EvaluateCampaignRules.Responses.$422
        >
    }
    ['/assistant/configs/revenue/{revenue_id}']: {
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
    ['/assistant/configs/{revenue_id}']: {
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
    ['/bundle/health-check']: {
        /**
         * health_check_bundle_health_check_get - Health Check
         */
        'get'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<Paths.HealthCheckBundleHealthCheckGet.Responses.$200>
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
    ['/click-tracking/health-check']: {
        /**
         * health_check_click_tracking_health_check_get - Health Check
         */
        'get'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<Paths.HealthCheckClickTrackingHealthCheckGet.Responses.$200>
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
    ['/campaigns/sync']: {
        /**
         * campaigns_sync - Update
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.CampaignsSync.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.CampaignsSync.Responses.$200
            | Paths.CampaignsSync.Responses.$422
        >
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
    ['/billing/health-check']: {
        /**
         * health_check_billing_health_check_get - Health Check
         */
        'get'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<Paths.HealthCheckBillingHealthCheckGet.Responses.$200>
    }
    ['/billing/']: {
        /**
         * health_check_billing__get - Health Check
         */
        'get'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<Paths.HealthCheckBilling_Get.Responses.$200>
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
}

export type Client = OpenAPIClient<OperationMethods, PathsDictionary>
