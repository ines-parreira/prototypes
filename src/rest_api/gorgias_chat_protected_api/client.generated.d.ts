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
    }
}

export type Client = OpenAPIClient<OperationMethods, PathsDictionary>
