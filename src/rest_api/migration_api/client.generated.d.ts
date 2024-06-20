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
         * AnalysisColumn
         */
        export interface AnalysisColumn {
            /**
             * Name
             */
            name: string
            /**
             * Samples
             */
            samples: string[]
        }
        /**
         * AnalysisRequestBody
         */
        export interface AnalysisRequestBody {
            /**
             * File Url
             */
            file_url: string // uri
        }
        /**
         * AnalysisResponse
         */
        export interface AnalysisResponse {
            result: AnalysisResult
        }
        /**
         * AnalysisResult
         */
        export interface AnalysisResult {
            /**
             * Columns
             */
            columns?: AnalysisColumn[]
            /**
             * Error
             */
            error?: string
            /**
             * Num Rows
             */
            num_rows?: number
            /**
             * Status
             */
            status: string
        }
        /**
         * ArticleColumnLocale
         */
        export interface ArticleColumnLocale {
            content: ColumnDescription
            excerpt?: ColumnDescription
            id?: ColumnDescription
            slug: ColumnDescription
            title: ColumnDescription
        }
        /**
         * CSVHelpCenterProvider
         * Base class for HelpCenter providers
         */
        export interface CSVHelpCenterProvider {
            article_columns?: Columns
            category_columns?: Columns
            /**
             * File Url
             */
            file_url: string /* uri */ | string /* path */
            /**
             * Type
             */
            type?: 'CSV'
        }
        /**
         * CategoryColumnLocale
         */
        export interface CategoryColumnLocale {
            description?: ColumnDescription
            id?: ColumnDescription
            name: ColumnDescription
            slug: ColumnDescription
        }
        /**
         * ColumnDescription
         */
        export interface ColumnDescription {
            source: ColumnSource
        }
        /**
         * ColumnSource
         */
        export interface ColumnSource {
            /**
             * Csv Column
             */
            csv_column?: string
            /**
             * Kind
             */
            kind: string
        }
        /**
         * Columns
         */
        export interface Columns {
            /**
             * Locales
             */
            locales: {
                [name: string]: ArticleColumnLocale | CategoryColumnLocale
            }
        }
        /**
         * Detail
         */
        export interface Detail {
            /**
             * Message
             */
            message: string
        }
        /**
         * ErrorDetail
         */
        export interface ErrorDetail {
            /**
             * Error Message
             */
            error_message: string
            /**
             * Instance Id
             */
            instance_id: string
            /**
             * Instance Title
             */
            instance_title?: any
            /**
             * Locale
             */
            locale?: string
        }
        /**
         * GorgiasHelpCenterReceiver
         * Import a HelpCenter into Gorgias
         */
        export interface GorgiasHelpCenterReceiver {
            /**
             * Access token
             */
            access_token: string // password
            /**
             * Help Center Id
             */
            help_center_id: number
            /**
             * Type
             */
            type?: 'Gorgias'
        }
        /**
         * HelpCenterMigration
         * Base class for HelpCenter migrations
         */
        export interface HelpCenterMigration {
            /**
             * Is Rollback
             */
            is_rollback?: boolean
            /**
             * Provider
             */
            provider:
                | ZendeskHelpCenterProvider
                | HelpDocsHelpCenterProvider
                | ReAmazeHelpCenterProvider
                | IntercomHelpCenterProvider
                | CSVHelpCenterProvider
            receiver: GorgiasHelpCenterReceiver
            /**
             * MigrationStats
             */
            stats?: {
                /**
                 * Stats
                 */
                articles?: {
                    /**
                     * Errors Count
                     */
                    errors_count?: number
                    /**
                     * Errors Details
                     */
                    errors_details?: ErrorDetail[]
                    /**
                     * Export Count
                     */
                    export_count?: number
                    /**
                     * Import Count
                     */
                    import_count?: number
                    /**
                     * Import Mapping
                     */
                    import_mapping?: {
                        [name: string]: ImportMappingItem
                    }
                }
                /**
                 * Stats
                 */
                categories?: {
                    /**
                     * Errors Count
                     */
                    errors_count?: number
                    /**
                     * Errors Details
                     */
                    errors_details?: ErrorDetail[]
                    /**
                     * Export Count
                     */
                    export_count?: number
                    /**
                     * Import Count
                     */
                    import_count?: number
                    /**
                     * Import Mapping
                     */
                    import_mapping?: {
                        [name: string]: ImportMappingItem
                    }
                }
                /**
                 * Stats
                 */
                redirects?: {
                    /**
                     * Errors Count
                     */
                    errors_count?: number
                    /**
                     * Errors Details
                     */
                    errors_details?: ErrorDetail[]
                    /**
                     * Export Count
                     */
                    export_count?: number
                    /**
                     * Import Count
                     */
                    import_count?: number
                    /**
                     * Import Mapping
                     */
                    import_mapping?: {
                        [name: string]: ImportMappingItem
                    }
                }
            }
            /**
             * Type
             */
            type?: 'HelpCenter'
        }
        /**
         * HelpCenterProvider
         */
        export interface HelpCenterProvider {
            /**
             * Docs Url
             */
            docs_url?: string
            /**
             * Logo Url
             */
            logo_url?: string
            /**
             * Properties
             */
            properties?: PropertySchema[]
            /**
             * Site Url
             */
            site_url?: string
            /**
             * Title
             */
            title?: string
            /**
             * Type
             */
            type: string
        }
        /**
         * HelpCenterProviderList
         */
        export type HelpCenterProviderList = HelpCenterProvider[]
        /**
         * HelpDocsHelpCenterProvider
         * Base class for HelpCenter providers
         */
        export interface HelpDocsHelpCenterProvider {
            /**
             * Api Key
             */
            api_key: string // password
            /**
             * Type
             */
            type?: 'HelpDocs'
        }
        /**
         * ImportMappingItem
         */
        export interface ImportMappingItem {
            /**
             * Instance Id
             */
            instance_id: string
            /**
             * Translation Id
             */
            translation_id?: string
        }
        /**
         * IntercomHelpCenterProvider
         * Base class for HelpCenter providers
         */
        export interface IntercomHelpCenterProvider {
            /**
             * Api Key
             */
            api_key: string // password
            /**
             * Type
             */
            type?: 'Intercom'
        }
        /**
         * Message
         */
        export interface Message {
            /**
             * Level
             */
            level: 'INFO' | 'ERROR' | 'WARNING'
            /**
             * Message
             */
            message: string
        }
        /**
         * MigrationParams
         */
        export interface MigrationParams {
            provider: MigrationProvider
            receiver: MigrationReceiver
            /**
             * Type
             */
            type: string
        }
        /**
         * MigrationProvider
         */
        export interface MigrationProvider {
            meta?: MigrationProviderMeta
            /**
             * Type
             */
            type: string
        }
        /**
         * MigrationProviderMeta
         */
        export interface MigrationProviderMeta {
            /**
             * Docs Url
             */
            docs_url?: string
            /**
             * Logo Url
             */
            logo_url?: string
            /**
             * Site Url
             */
            site_url?: string
            /**
             * Title
             */
            title?: string
        }
        /**
         * MigrationReceiver
         */
        export interface MigrationReceiver {
            /**
             * Help Center Id
             */
            help_center_id: number
            /**
             * Type
             */
            type: string
        }
        /**
         * MigrationResult
         */
        export interface MigrationResult {
            current?: Segment
            /**
             * Progress
             */
            progress: number
            /**
             * Segments
             */
            segments: Segment[]
            /**
             * Status
             */
            status: string
        }
        /**
         * MigrationStats
         */
        export interface MigrationStats {
            /**
             * Stats
             */
            articles?: {
                /**
                 * Errors Count
                 */
                errors_count?: number
                /**
                 * Errors Details
                 */
                errors_details?: ErrorDetail[]
                /**
                 * Export Count
                 */
                export_count?: number
                /**
                 * Import Count
                 */
                import_count?: number
                /**
                 * Import Mapping
                 */
                import_mapping?: {
                    [name: string]: ImportMappingItem
                }
            }
            /**
             * Stats
             */
            categories?: {
                /**
                 * Errors Count
                 */
                errors_count?: number
                /**
                 * Errors Details
                 */
                errors_details?: ErrorDetail[]
                /**
                 * Export Count
                 */
                export_count?: number
                /**
                 * Import Count
                 */
                import_count?: number
                /**
                 * Import Mapping
                 */
                import_mapping?: {
                    [name: string]: ImportMappingItem
                }
            }
            /**
             * Stats
             */
            redirects?: {
                /**
                 * Errors Count
                 */
                errors_count?: number
                /**
                 * Errors Details
                 */
                errors_details?: ErrorDetail[]
                /**
                 * Export Count
                 */
                export_count?: number
                /**
                 * Import Count
                 */
                import_count?: number
                /**
                 * Import Mapping
                 */
                import_mapping?: {
                    [name: string]: ImportMappingItem
                }
            }
        }
        /**
         * Process
         */
        export interface Process {
            /**
             * Segments
             */
            segments?: Segment[]
        }
        /**
         * PropertySchema
         */
        export interface PropertySchema {
            /**
             * Description
             */
            description?: string
            /**
             * Format
             */
            format?: string
            /**
             * Name
             */
            name: string
            /**
             * Title
             */
            title?: string
            /**
             * Type
             */
            type: string
            /**
             * Writeonly
             */
            writeOnly?: boolean
        }
        /**
         * ReAmazeHelpCenterProvider
         * Base class for HelpCenter providers
         */
        export interface ReAmazeHelpCenterProvider {
            /**
             * API Key
             */
            api_key: string // password
            /**
             * Email
             * Your work email
             */
            email: string // email
            /**
             * Subdomain
             */
            subdomain: string
            /**
             * Type
             */
            type?: 'ReAmaze'
        }
        /**
         * Segment
         */
        export interface Segment {
            /**
             * Messages
             */
            messages?: Message[]
            parent?: Process
            /**
             * Status
             */
            status?: 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILURE'
            /**
             * Title
             */
            title: string
        }
        /**
         * Session
         */
        export interface Session {
            migration: HelpCenterMigration
            /**
             * Webhook Url
             */
            webhook_url?: string // uri
        }
        /**
         * SessionCreateQueryParams
         */
        export interface SessionCreateQueryParams {
            /**
             * Check
             */
            check?: boolean
        }
        /**
         * SessionListQueryParams
         */
        export interface SessionListQueryParams {
            /**
             * Help Center Id
             */
            help_center_id?: number
            /**
             * Provider Type
             */
            provider_type?: string
            /**
             * Receiver Type
             */
            receiver_type?: string
        }
        /**
         * SessionLong
         */
        export interface SessionLong {
            /**
             * Is Rollback
             */
            is_rollback?: boolean
            result: MigrationResult
            session: SessionParams
            /**
             * Session Id
             */
            session_id: string // uuid
            stats: MigrationStats
            /**
             * Status
             */
            status: string
        }
        /**
         * SessionParams
         */
        export interface SessionParams {
            migration: MigrationParams
            /**
             * Webhook Url
             */
            webhook_url?: string
        }
        /**
         * SessionShort
         */
        export interface SessionShort {
            /**
             * Is Rollback
             */
            is_rollback?: boolean
            session: SessionParams
            /**
             * Session Id
             */
            session_id: string // uuid
            /**
             * Status
             */
            status: string
        }
        /**
         * SessionShortList
         */
        export type SessionShortList = SessionShort[]
        /**
         * Stats
         */
        export interface Stats {
            /**
             * Errors Count
             */
            errors_count?: number
            /**
             * Errors Details
             */
            errors_details?: ErrorDetail[]
            /**
             * Export Count
             */
            export_count?: number
            /**
             * Import Count
             */
            import_count?: number
            /**
             * Import Mapping
             */
            import_mapping?: {
                [name: string]: ImportMappingItem
            }
        }
        /**
         * ValidationErrorListModel
         */
        export type ValidationErrorListModel = ValidationErrorModel[]
        /**
         * ValidationErrorModel
         */
        export interface ValidationErrorModel {
            /**
             * Loc
             */
            loc: (number | string)[]
            /**
             * Msg
             */
            msg: string
            /**
             * Type
             */
            type: string
        }
        /**
         * ZendeskHelpCenterProvider
         * Base class for HelpCenter providers
         */
        export interface ZendeskHelpCenterProvider {
            /**
             * API Key
             */
            api_key: string // password
            /**
             * Email
             * Your work email
             */
            email: string // email
            /**
             * Subdomain
             */
            subdomain: string
            /**
             * Type
             */
            type?: 'Zendesk'
        }
    }
}
declare namespace Paths {
    namespace Analysis {
        export type RequestBody = Components.Schemas.AnalysisRequestBody
        namespace Responses {
            export type $200 = Components.Schemas.AnalysisResponse
            export type $401 = Components.Schemas.Detail
        }
    }
    namespace ProviderStaticList {
        namespace Responses {
            export type $200 = Components.Schemas.HelpCenterProviderList
            export type $401 = Components.Schemas.Detail
        }
    }
    namespace ProviderStaticRetrieve {
        namespace Parameters {
            export type ProviderType = string
        }
        export interface PathParameters {
            provider_type: Parameters.ProviderType
        }
        namespace Responses {
            export type $200 = Components.Schemas.HelpCenterProvider
            export type $401 = Components.Schemas.Detail
        }
    }
    namespace ProviderValidate {
        namespace Parameters {
            export type ProviderType = string
        }
        export interface PathParameters {
            provider_type: Parameters.ProviderType
        }
        namespace Responses {
            export type $200 = Components.Schemas.Detail
            export type $401 = Components.Schemas.Detail
            export type $422 = Components.Schemas.ValidationErrorListModel
        }
    }
    namespace SessionCreate {
        namespace Parameters {
            /**
             * Check
             */
            export type Check = boolean
        }
        export interface QueryParameters {
            check?: Parameters.Check
        }
        export type RequestBody = Components.Schemas.Session
        namespace Responses {
            export type $200 = Components.Schemas.Detail
            export type $201 = Components.Schemas.SessionShort
            export type $401 = Components.Schemas.Detail
            export type $422 = Components.Schemas.ValidationErrorListModel
        }
    }
    namespace SessionList {
        namespace Parameters {
            /**
             * Help Center Id
             */
            export type HelpCenterId = number
            /**
             * Provider Type
             */
            export type ProviderType = string
            /**
             * Receiver Type
             */
            export type ReceiverType = string
        }
        export interface QueryParameters {
            help_center_id?: Parameters.HelpCenterId
            receiver_type?: Parameters.ReceiverType
            provider_type?: Parameters.ProviderType
        }
        namespace Responses {
            export type $200 = Components.Schemas.SessionShortList
            export type $401 = Components.Schemas.Detail
            export type $422 = Components.Schemas.ValidationErrorListModel
        }
    }
    namespace SessionRetrieve {
        namespace Parameters {
            export type Uuid = string
        }
        export interface PathParameters {
            uuid: Parameters.Uuid
        }
        namespace Responses {
            export type $200 = Components.Schemas.SessionLong
            export type $401 = Components.Schemas.Detail
        }
    }
    namespace SessionRetry {
        namespace Parameters {
            export type Uuid = string
        }
        export interface PathParameters {
            uuid: Parameters.Uuid
        }
        namespace Responses {
            export type $201 = Components.Schemas.SessionShort
            export type $401 = Components.Schemas.Detail
        }
    }
    namespace SessionRollback {
        namespace Parameters {
            export type Uuid = string
        }
        export interface PathParameters {
            uuid: Parameters.Uuid
        }
        namespace Responses {
            export type $201 = Components.Schemas.SessionShort
            export type $401 = Components.Schemas.Detail
        }
    }
}

export interface OperationMethods {
    /**
     * analysis - analysis <POST>
     */
    'analysis'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.Analysis.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        Paths.Analysis.Responses.$200 | Paths.Analysis.Responses.$401
    >
    /**
     * providerStaticList - provider_static_list <GET>
     */
    'providerStaticList'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.ProviderStaticList.Responses.$200
        | Paths.ProviderStaticList.Responses.$401
    >
    /**
     * providerStaticRetrieve - provider_static_retrieve <GET>
     */
    'providerStaticRetrieve'(
        parameters?: Parameters<Paths.ProviderStaticRetrieve.PathParameters> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.ProviderStaticRetrieve.Responses.$200
        | Paths.ProviderStaticRetrieve.Responses.$401
    >
    /**
     * providerValidate - provider_validate <POST>
     */
    'providerValidate'(
        parameters?: Parameters<Paths.ProviderValidate.PathParameters> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.ProviderValidate.Responses.$200
        | Paths.ProviderValidate.Responses.$401
        | Paths.ProviderValidate.Responses.$422
    >
    /**
     * sessionList - session_list <GET>
     */
    'sessionList'(
        parameters?: Parameters<Paths.SessionList.QueryParameters> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.SessionList.Responses.$200
        | Paths.SessionList.Responses.$401
        | Paths.SessionList.Responses.$422
    >
    /**
     * sessionCreate - session_create <POST>
     */
    'sessionCreate'(
        parameters?: Parameters<Paths.SessionCreate.QueryParameters> | null,
        data?: Paths.SessionCreate.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.SessionCreate.Responses.$200
        | Paths.SessionCreate.Responses.$201
        | Paths.SessionCreate.Responses.$401
        | Paths.SessionCreate.Responses.$422
    >
    /**
     * sessionRetrieve - session_retrieve <GET>
     */
    'sessionRetrieve'(
        parameters?: Parameters<Paths.SessionRetrieve.PathParameters> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.SessionRetrieve.Responses.$200
        | Paths.SessionRetrieve.Responses.$401
    >
    /**
     * sessionRetry - session_retry <POST>
     */
    'sessionRetry'(
        parameters?: Parameters<Paths.SessionRetry.PathParameters> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        Paths.SessionRetry.Responses.$201 | Paths.SessionRetry.Responses.$401
    >
    /**
     * sessionRollback - session_rollback <POST>
     */
    'sessionRollback'(
        parameters?: Parameters<Paths.SessionRollback.PathParameters> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.SessionRollback.Responses.$201
        | Paths.SessionRollback.Responses.$401
    >
    /**
     * echoView - echo_view <GET>
     */
    'echoView'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<any>
    /**
     * echoView - echo_view <POST>
     */
    'echoView'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<any>
    /**
     * errorView - error_view <GET>
     */
    'errorView'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<any>
    /**
     * health - health <GET>
     */
    'health'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<any>
}

export interface PathsDictionary {
    ['/api/help_center/csv/analysis']: {
        /**
         * analysis - analysis <POST>
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.Analysis.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            Paths.Analysis.Responses.$200 | Paths.Analysis.Responses.$401
        >
    }
    ['/api/help_center/providers']: {
        /**
         * providerStaticList - provider_static_list <GET>
         */
        'get'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.ProviderStaticList.Responses.$200
            | Paths.ProviderStaticList.Responses.$401
        >
    }
    ['/api/help_center/providers/{provider_type}']: {
        /**
         * providerStaticRetrieve - provider_static_retrieve <GET>
         */
        'get'(
            parameters?: Parameters<Paths.ProviderStaticRetrieve.PathParameters> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.ProviderStaticRetrieve.Responses.$200
            | Paths.ProviderStaticRetrieve.Responses.$401
        >
        /**
         * providerValidate - provider_validate <POST>
         */
        'post'(
            parameters?: Parameters<Paths.ProviderValidate.PathParameters> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.ProviderValidate.Responses.$200
            | Paths.ProviderValidate.Responses.$401
            | Paths.ProviderValidate.Responses.$422
        >
    }
    ['/api/sessions']: {
        /**
         * sessionList - session_list <GET>
         */
        'get'(
            parameters?: Parameters<Paths.SessionList.QueryParameters> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.SessionList.Responses.$200
            | Paths.SessionList.Responses.$401
            | Paths.SessionList.Responses.$422
        >
        /**
         * sessionCreate - session_create <POST>
         */
        'post'(
            parameters?: Parameters<Paths.SessionCreate.QueryParameters> | null,
            data?: Paths.SessionCreate.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.SessionCreate.Responses.$200
            | Paths.SessionCreate.Responses.$201
            | Paths.SessionCreate.Responses.$401
            | Paths.SessionCreate.Responses.$422
        >
    }
    ['/api/sessions/{uuid}']: {
        /**
         * sessionRetrieve - session_retrieve <GET>
         */
        'get'(
            parameters?: Parameters<Paths.SessionRetrieve.PathParameters> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.SessionRetrieve.Responses.$200
            | Paths.SessionRetrieve.Responses.$401
        >
    }
    ['/api/sessions/{uuid}/retry']: {
        /**
         * sessionRetry - session_retry <POST>
         */
        'post'(
            parameters?: Parameters<Paths.SessionRetry.PathParameters> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.SessionRetry.Responses.$201
            | Paths.SessionRetry.Responses.$401
        >
    }
    ['/api/sessions/{uuid}/rollback']: {
        /**
         * sessionRollback - session_rollback <POST>
         */
        'post'(
            parameters?: Parameters<Paths.SessionRollback.PathParameters> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.SessionRollback.Responses.$201
            | Paths.SessionRollback.Responses.$401
        >
    }
    ['/debug/echo']: {
        /**
         * echoView - echo_view <GET>
         */
        'get'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<any>
        /**
         * echoView - echo_view <POST>
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<any>
    }
    ['/debug/error']: {
        /**
         * errorView - error_view <GET>
         */
        'get'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<any>
    }
    ['/health']: {
        /**
         * health - health <GET>
         */
        'get'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<any>
    }
}

export type Client = OpenAPIClient<OperationMethods, PathsDictionary>
