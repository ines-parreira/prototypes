import {
    OpenAPIClient,
    Parameters,
    OperationResponse,
    AxiosRequestConfig,
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
}

export interface OperationMethods {
    /**
     * getApplicationAgents - Get application agents
     */
    'getApplicationAgents'(
        parameters?: Parameters<
            Paths.GetApplicationAgents.PathParameters &
                Paths.GetApplicationAgents.HeaderParameters
        > | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<any>
}

export interface PathsDictionary {
    ['/applications/{applicationId}/agents']: {
        /**
         * getApplicationAgents - Get application agents
         */
        'get'(
            parameters?: Parameters<
                Paths.GetApplicationAgents.PathParameters &
                    Paths.GetApplicationAgents.HeaderParameters
            > | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<any>
    }
}

export type Client = OpenAPIClient<OperationMethods, PathsDictionary>
