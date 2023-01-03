import {
    OpenAPIClient,
    Parameters,
    OperationResponse,
    AxiosRequestConfig,
} from 'openapi-client-axios'

declare namespace Paths {
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
}

export interface OperationMethods {
    /**
     * getApplicationTexts - GET application texts
     */
    'getApplicationTexts'(
        parameters?: Parameters<
            Paths.GetApplicationTexts.PathParameters &
                Paths.GetApplicationTexts.HeaderParameters
        > | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<any>
    /**
     * updateApplicationTexts - Update application texts
     */
    'updateApplicationTexts'(
        parameters?: Parameters<
            Paths.UpdateApplicationTexts.PathParameters &
                Paths.UpdateApplicationTexts.HeaderParameters
        > | null,
        data?: any,
        config?: AxiosRequestConfig
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
        config?: AxiosRequestConfig
    ): OperationResponse<any>
}

export interface PathsDictionary {
    ['/applications/{applicationId}/texts']: {
        /**
         * getApplicationTexts - GET application texts
         */
        'get'(
            parameters?: Parameters<
                Paths.GetApplicationTexts.PathParameters &
                    Paths.GetApplicationTexts.HeaderParameters
            > | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<any>
        /**
         * updateApplicationTexts - Update application texts
         */
        'put'(
            parameters?: Parameters<
                Paths.UpdateApplicationTexts.PathParameters &
                    Paths.UpdateApplicationTexts.HeaderParameters
            > | null,
            data?: any,
            config?: AxiosRequestConfig
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
            config?: AxiosRequestConfig
        ): OperationResponse<any>
    }
}

export type Client = OpenAPIClient<OperationMethods, PathsDictionary>
