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
         * CustomDomainOperationSchema
         */
        export interface CustomDomainOperationSchema {
            /**
             * Hostname
             */
            hostname: string // ^((?!-))(xn--)?[a-z0-9][a-z0-9-_]{0,61}[a-z0-9]{0,1}\.(xn--)?([a-z0-9\-]{1,61}|[a-z0-9-]{1,30}\.[a-z]{2,})$
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
         * HTTPValidationError
         */
        export interface HTTPValidationError {
            /**
             * Detail
             */
            detail?: ValidationError[]
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
    namespace GetCustomDomain {
        namespace Responses {
            export type $200 = Components.Schemas.CustomDomainSchema
        }
    }
    namespace HealthCheckAttributionHealthCheckGet {
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
}

export interface OperationMethods {
    /**
     * health_check_attribution_health_check_get - Health Check
     */
    'health_check_attribution_health_check_get'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<Paths.HealthCheckAttributionHealthCheckGet.Responses.$200>
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
    ['/attribution/health-check']: {
        /**
         * health_check_attribution_health_check_get - Health Check
         */
        'get'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<Paths.HealthCheckAttributionHealthCheckGet.Responses.$200>
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
