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
         * CustomDomainOperationSchema
         */
        export interface CustomDomainOperationSchema {
            /**
             * Hostname
             */
            hostname: string // ^(((?!-))(xn--)?[a-z0-9][a-z0-9-_]{0,61}[a-z0-9]{0,1}\.){1,}([a-z]{2,})$
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
            status: StatusEnum
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
            deactivated_datetime?: string // date-time
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
         * RuleOperator
         * An enumeration.
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
         * An enumeration.
         */
        export type RuleType =
            | 'orders_count'
            | 'amount_spent'
            | 'ordered_products'
            | 'customer_tags'
            | 'country_code'
        /**
         * StatusEnum
         * An enumeration.
         */
        export type StatusEnum = 'draft' | 'installed' | 'uninstalled'

        /**
         * URLClickSchema
         */
        export interface URLClickSchema {
            /**
             * Client Ip
             */
            client_ip?: string
            /**
             * Client Agent
             */
            client_agent?: string
            /**
             * Client Referrer
             */
            client_referrer?: string
            /**
             * Created Datetime
             */
            created_datetime: string // date-time
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
            short_url?: string
            /**
             * Channel
             */
            channel?: string
            custom_domain?: CustomDomainSchema
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
            short_url?: string
            /**
             * Channel
             */
            channel?: string
            custom_domain?: CustomDomainSchema
            /**
             * Clicks
             */
            clicks: URLClickSchema[]
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
            export type $201 = any
            export type $422 = Components.Schemas.HTTPValidationError
        }
    }
    namespace CreateBulkTrackBulkPost {
        export type RequestBody = Components.Schemas.JWTTokenSchema
        namespace Responses {
            export type $201 = any
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
    namespace CreateTrackPost {
        export type RequestBody = Components.Schemas.JWTTokenSchema
        namespace Responses {
            export type $201 = Components.Schemas.URLSchema
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
    namespace GetCustomDomain {
        namespace Responses {
            export type $200 = Components.Schemas.CustomDomainSchema
        }
    }
    namespace HealthCheckAssistantHealthCheckGet {
        namespace Responses {
            export type $200 = any
        }
    }
    namespace HealthCheckAssistant_Get {
        namespace Responses {
            export type $200 = any
        }
    }
    namespace HealthCheckBundleHealthCheckGet {
        namespace Responses {
            export type $200 = any
        }
    }
    namespace HealthCheckClickTrackingHealthCheckGet {
        namespace Responses {
            export type $200 = any
        }
    }
    namespace HealthCheck_Get {
        namespace Responses {
            export type $200 = any
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
            export type Referrer = string
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
     * create_track_post - Create
     */
    'create_track_post'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.CreateTrackPost.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.CreateTrackPost.Responses.$201
        | Paths.CreateTrackPost.Responses.$422
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
     * create_bulk_track_bulk_post - Create Bulk
     */
    'create_bulk_track_bulk_post'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.CreateBulkTrackBulkPost.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.CreateBulkTrackBulkPost.Responses.$201
        | Paths.CreateBulkTrackBulkPost.Responses.$422
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
    ['/track']: {
        /**
         * create_track_post - Create
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.CreateTrackPost.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.CreateTrackPost.Responses.$201
            | Paths.CreateTrackPost.Responses.$422
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
    ['/track/bulk']: {
        /**
         * create_bulk_track_bulk_post - Create Bulk
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.CreateBulkTrackBulkPost.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.CreateBulkTrackBulkPost.Responses.$201
            | Paths.CreateBulkTrackBulkPost.Responses.$422
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
}

export type Client = OpenAPIClient<OperationMethods, PathsDictionary>
