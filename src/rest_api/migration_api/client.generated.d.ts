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
         * Detail
         */
        export interface Detail {
            /**
             * Message
             */
            message: string
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
            provider: ZendeskHelpCenterProvider
            receiver: GorgiasHelpCenterReceiver
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
         * Message
         */
        export interface Message {
            /**
             * Level
             */
            level: 'MESSAGE' | 'WARNING' | 'FAILURE'
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
            meta: MigrationProviderMeta
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
         * Segment
         */
        export interface Segment {
            /**
             * Failures
             */
            failures?: string[]
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
            /**
             * Warnings
             */
            warnings?: string[]
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
            result: MigrationResult
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
            export type $200 = Components.Schemas.SessionShort
            export type $401 = Components.Schemas.Detail
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
}

export interface OperationMethods {
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
    >
    /**
     * sessionList - session_list <GET>
     */
    'sessionList'(
        parameters?: Parameters<Paths.SessionList.QueryParameters> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        Paths.SessionList.Responses.$200 | Paths.SessionList.Responses.$401
    >
    /**
     * sessionCreate - session_create <POST>
     */
    'sessionCreate'(
        parameters?: Parameters<Paths.SessionCreate.QueryParameters> | null,
        data?: Paths.SessionCreate.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        Paths.SessionCreate.Responses.$200 | Paths.SessionCreate.Responses.$401
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
            Paths.SessionList.Responses.$200 | Paths.SessionList.Responses.$401
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
            | Paths.SessionCreate.Responses.$401
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
