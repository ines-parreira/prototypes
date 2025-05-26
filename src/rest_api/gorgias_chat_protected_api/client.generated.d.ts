import type {
    AxiosRequestConfig,
    OpenAPIClient,
    OperationResponse,
    Parameters,
    UnknownParamsObject,
} from 'openapi-client-axios'

declare namespace Paths {
    namespace GetApplicationAgents {
        export interface HeaderParameters {
            'Content-Type'?: Parameters.ContentType
            Authorization?: Parameters.Authorization
        }
        namespace Parameters {
            export type ApplicationId = string
            export type Authorization = string
            export type ContentType = string
        }
        export interface PathParameters {
            applicationId: Parameters.ApplicationId
        }
    }
    namespace GetApplicationAutomationSettings {
        export interface HeaderParameters {
            'Content-Type'?: Parameters.ContentType
            Authorization?: Parameters.Authorization
        }
        namespace Parameters {
            export type ApplicationId = string
            export type Authorization = string
            export type ContentType = string
        }
        export interface PathParameters {
            applicationId: Parameters.ApplicationId
        }
    }
    namespace GetApplicationTexts {
        export interface HeaderParameters {
            'Content-Type'?: Parameters.ContentType
            Authorization?: Parameters.Authorization
        }
        namespace Parameters {
            export type ApplicationId = string
            export type Authorization = string
            export type ContentType = string
        }
        export interface PathParameters {
            applicationId: Parameters.ApplicationId
        }
    }
    namespace GetApplications {
        export interface HeaderParameters {
            'Content-Type'?: Parameters.ContentType
            Authorization?: Parameters.Authorization
        }
        namespace Parameters {
            export type Authorization = string
            export type ContentType = string
        }
    }
    namespace GetInstallationSnippet {
        export interface HeaderParameters {
            'Content-Type'?: Parameters.ContentType
            Authorization?: Parameters.Authorization
        }
        namespace Parameters {
            export type ApplicationId = string
            export type Authorization = string
            export type ContentType = string
        }
        export interface PathParameters {
            applicationId: Parameters.ApplicationId
        }
    }
    namespace GetInstallationStatus {
        export interface HeaderParameters {
            'Content-Type'?: Parameters.ContentType
            Authorization?: Parameters.Authorization
        }
        namespace Parameters {
            export type ApplicationId = string
            export type Authorization = string
            export type ContentType = string
        }
        export interface PathParameters {
            applicationId: Parameters.ApplicationId
        }
    }
    namespace GetTranslations {
        export interface HeaderParameters {
            'Content-Type'?: Parameters.ContentType
            Authorization?: Parameters.Authorization
        }
        namespace Parameters {
            export type Authorization = string
            export type ContentType = string
            export type Lang = string
        }
        export interface QueryParameters {
            lang?: Parameters.Lang
        }
    }
    namespace UpdateApplicationTexts {
        export interface HeaderParameters {
            'Content-Type'?: Parameters.ContentType
            Authorization?: Parameters.Authorization
        }
        namespace Parameters {
            export type ApplicationId = string
            export type Authorization = string
            export type ContentType = string
        }
        export interface PathParameters {
            applicationId: Parameters.ApplicationId
        }
    }
    namespace UpsertApplicationAutomationSettings {
        export interface HeaderParameters {
            'Content-Type'?: Parameters.ContentType
            Authorization?: Parameters.Authorization
        }
        namespace Parameters {
            export type ApplicationId = string
            export type Authorization = string
            export type ContentType = string
        }
        export interface PathParameters {
            applicationId: Parameters.ApplicationId
        }
    }
}

export interface OperationMethods {
    /**
     * getInstallationSnippet - Get installation snippet
     */
    'getInstallationSnippet'(
        parameters: Parameters<
            Paths.GetInstallationSnippet.HeaderParameters &
                Paths.GetInstallationSnippet.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<any>
    /**
     * getApplications - Get applications
     */
    'getApplications'(
        parameters?: Parameters<Paths.GetApplications.HeaderParameters> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<any>
    /**
     * getApplicationAgents - Get application agents
     */
    'getApplicationAgents'(
        parameters: Parameters<
            Paths.GetApplicationAgents.HeaderParameters &
                Paths.GetApplicationAgents.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<any>
    /**
     * getApplicationTexts - GET application texts
     */
    'getApplicationTexts'(
        parameters: Parameters<
            Paths.GetApplicationTexts.HeaderParameters &
                Paths.GetApplicationTexts.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<any>
    /**
     * updateApplicationTexts - Update application texts
     */
    'updateApplicationTexts'(
        parameters: Parameters<
            Paths.UpdateApplicationTexts.HeaderParameters &
                Paths.UpdateApplicationTexts.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<any>
    /**
     * getInstallationStatus - GET installation status
     */
    'getInstallationStatus'(
        parameters: Parameters<
            Paths.GetInstallationStatus.HeaderParameters &
                Paths.GetInstallationStatus.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<any>
    /**
     * getTranslations - Get translations
     */
    'getTranslations'(
        parameters?: Parameters<
            Paths.GetTranslations.QueryParameters &
                Paths.GetTranslations.HeaderParameters
        > | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<any>
    /**
     * getApplicationAutomationSettings - GET application automation settings
     */
    'getApplicationAutomationSettings'(
        parameters: Parameters<
            Paths.GetApplicationAutomationSettings.HeaderParameters &
                Paths.GetApplicationAutomationSettings.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<any>
    /**
     * upsertApplicationAutomationSettings - Upsert application automation settings
     */
    'upsertApplicationAutomationSettings'(
        parameters: Parameters<
            Paths.UpsertApplicationAutomationSettings.HeaderParameters &
                Paths.UpsertApplicationAutomationSettings.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<any>
}

export interface PathsDictionary {
    ['/helpdesk/applications/{applicationId}/installation-snippet/manual']: {
        /**
         * getInstallationSnippet - Get installation snippet
         */
        'get'(
            parameters: Parameters<
                Paths.GetInstallationSnippet.HeaderParameters &
                    Paths.GetInstallationSnippet.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<any>
    }
    ['/helpdesk/applications']: {
        /**
         * getApplications - Get applications
         */
        'get'(
            parameters?: Parameters<Paths.GetApplications.HeaderParameters> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<any>
    }
    ['/helpdesk/applications/{applicationId}/agents']: {
        /**
         * getApplicationAgents - Get application agents
         */
        'get'(
            parameters: Parameters<
                Paths.GetApplicationAgents.HeaderParameters &
                    Paths.GetApplicationAgents.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<any>
    }
    ['/applications/{applicationId}/texts']: {
        /**
         * getApplicationTexts - GET application texts
         */
        'get'(
            parameters: Parameters<
                Paths.GetApplicationTexts.HeaderParameters &
                    Paths.GetApplicationTexts.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<any>
        /**
         * updateApplicationTexts - Update application texts
         */
        'put'(
            parameters: Parameters<
                Paths.UpdateApplicationTexts.HeaderParameters &
                    Paths.UpdateApplicationTexts.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<any>
    }
    ['/applications/{applicationId}/installation-status']: {
        /**
         * getInstallationStatus - GET installation status
         */
        'get'(
            parameters: Parameters<
                Paths.GetInstallationStatus.HeaderParameters &
                    Paths.GetInstallationStatus.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<any>
    }
    ['/translations']: {
        /**
         * getTranslations - Get translations
         */
        'get'(
            parameters?: Parameters<
                Paths.GetTranslations.QueryParameters &
                    Paths.GetTranslations.HeaderParameters
            > | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<any>
    }
    ['/applications/{applicationId}/automation-settings']: {
        /**
         * upsertApplicationAutomationSettings - Upsert application automation settings
         */
        'put'(
            parameters: Parameters<
                Paths.UpsertApplicationAutomationSettings.HeaderParameters &
                    Paths.UpsertApplicationAutomationSettings.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<any>
        /**
         * getApplicationAutomationSettings - GET application automation settings
         */
        'get'(
            parameters: Parameters<
                Paths.GetApplicationAutomationSettings.HeaderParameters &
                    Paths.GetApplicationAutomationSettings.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<any>
    }
}

export type Client = OpenAPIClient<OperationMethods, PathsDictionary>
