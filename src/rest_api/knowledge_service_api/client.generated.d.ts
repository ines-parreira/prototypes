import type {
    AxiosRequestConfig,
    OpenAPIClient,
    OperationResponse,
    Parameters,
    UnknownParamsObject,
} from 'openapi-client-axios'

declare namespace Components {
    namespace Schemas {
        export interface FeedbackDto {
            /**
             * Account ID
             * example:
             * 1
             */
            accountId: number
            /**
             * Type of object
             * example:
             * TICKET
             */
            objectType: 'TICKET' | 'SEARCH_BAR'
            /**
             * Object identifier
             * example:
             * 789
             */
            objectId: string
            executions: {
                /**
                 * Execution identifier
                 * example:
                 * 571ec9ca-2adb-4e68-b5c7-c31d1b0a9630
                 */
                executionId: string
                /**
                 * Resources used in the execution
                 */
                resources: {
                    /**
                     * Internal resource id. Use it as targetId to create feedback.
                     */
                    id: string
                    /**
                     * Resource identifier
                     */
                    resourceId: string
                    /**
                     * Resource type
                     */
                    resourceType:
                        | 'ORDER'
                        | 'GUIDANCE'
                        | 'ACTION'
                        | 'ARTICLE'
                        | 'MACRO'
                        | 'EXTERNAL_SNIPPET'
                        | 'FILE_EXTERNAL_SNIPPET'
                    /**
                     * Resource set ID
                     */
                    resourceSetId: string
                    /**
                     * Resource locale
                     */
                    resourceLocale: /* Resource locale */ string | null
                    /**
                     * Resource title
                     */
                    resourceTitle: string
                    /**
                     * Resource feedback
                     */
                    feedback: /* Resource feedback */ {
                        /**
                         * Optional feedback ID
                         * example:
                         * 123
                         */
                        id?: number
                        /**
                         * example:
                         * TICKET
                         */
                        objectType: 'TICKET'
                        /**
                         * Object identifier
                         * example:
                         * 789
                         */
                        objectId: string
                        /**
                         * Execution identifier
                         * example:
                         * exec-123
                         */
                        executionId: string
                        /**
                         * example:
                         * KNOWLEDGE_RESOURCE
                         */
                        targetType: 'KNOWLEDGE_RESOURCE'
                        /**
                         * example:
                         * article-123
                         */
                        targetId: string
                        /**
                         * example:
                         * UP
                         */
                        feedbackValue: 'UP' | 'DOWN'
                        /**
                         * User ID who submitted the feedback
                         */
                        submittedBy: number
                        /**
                         * Feedback creation datetime
                         */
                        createdDatetime: string // date-time
                        /**
                         * Feedback update datetime
                         */
                        updatedDatetime: string // date-time
                        feedbackType: 'KNOWLEDGE_RESOURCE_BINARY'
                    } | null
                }[]
                /**
                 * Store configuration at the time of the execution
                 */
                storeConfiguration: /* Store configuration at the time of the execution */ {
                    /**
                     * example:
                     * My Shop
                     */
                    shopName: string
                    /**
                     * example:
                     * shopify
                     */
                    shopType: string
                    /**
                     * example:
                     * 1
                     */
                    faqHelpCenterId: /**
                     * example:
                     * 1
                     */
                    number | null
                    /**
                     * example:
                     * 2
                     */
                    guidanceHelpCenterId: number
                    /**
                     * example:
                     * 3
                     */
                    snippetHelpCenterId: number
                } | null
                /**
                 * Feedback given at the object level
                 */
                feedback: /* Feedback given at object level */ (
                    | {
                          /**
                           * Optional feedback ID
                           * example:
                           * 123
                           */
                          id?: number
                          /**
                           * example:
                           * TICKET
                           */
                          objectType: 'TICKET'
                          /**
                           * Object identifier
                           * example:
                           * 789
                           */
                          objectId: string
                          /**
                           * Execution identifier
                           * example:
                           * exec-123
                           */
                          executionId: string
                          /**
                           * example:
                           * TICKET
                           */
                          targetType: 'TICKET'
                          /**
                           * Target identifier
                           * example:
                           * target-123
                           */
                          targetId: string
                          /**
                           * example:
                           * UP
                           */
                          feedbackValue: 'UP' | 'DOWN'
                          /**
                           * User ID who submitted the feedback
                           */
                          submittedBy: number
                          /**
                           * Feedback creation datetime
                           */
                          createdDatetime: string // date-time
                          /**
                           * Feedback update datetime
                           */
                          updatedDatetime: string // date-time
                          feedbackType: 'TICKET_BINARY'
                      }
                    | {
                          /**
                           * Optional feedback ID
                           * example:
                           * 123
                           */
                          id?: number
                          /**
                           * example:
                           * TICKET
                           */
                          objectType: 'TICKET'
                          /**
                           * Object identifier
                           * example:
                           * 789
                           */
                          objectId: string
                          /**
                           * Execution identifier
                           * example:
                           * exec-123
                           */
                          executionId: string
                          /**
                           * example:
                           * TICKET
                           */
                          targetType: 'TICKET'
                          /**
                           * Target identifier
                           * example:
                           * target-123
                           */
                          targetId: string
                          /**
                           * example:
                           * This was very helpful feedback
                           */
                          feedbackValue: /**
                           * example:
                           * This was very helpful feedback
                           */
                          string | null
                          /**
                           * User ID who submitted the feedback
                           */
                          submittedBy: number
                          /**
                           * Feedback creation datetime
                           */
                          createdDatetime: string // date-time
                          /**
                           * Feedback update datetime
                           */
                          updatedDatetime: string // date-time
                          feedbackType: 'TICKET_FREEFORM'
                      }
                    | {
                          /**
                           * Optional feedback ID
                           * example:
                           * 123
                           */
                          id?: number
                          /**
                           * example:
                           * TICKET
                           */
                          objectType: 'TICKET'
                          /**
                           * Object identifier
                           * example:
                           * 789
                           */
                          objectId: string
                          /**
                           * Execution identifier
                           * example:
                           * exec-123
                           */
                          executionId: string
                          /**
                           * example:
                           * TICKET
                           */
                          targetType: 'TICKET'
                          /**
                           * example:
                           * article-123
                           */
                          targetId: string
                          feedbackValue: string | null
                          /**
                           * User ID who submitted the feedback
                           */
                          submittedBy: number
                          /**
                           * Feedback creation datetime
                           */
                          createdDatetime: string // date-time
                          /**
                           * Feedback update datetime
                           */
                          updatedDatetime: string // date-time
                          feedbackType: 'SUGGESTED_RESOURCE'
                      }
                )[]
            }[]
        }
        /**
         * Feedback record for different types of content
         */
        export type FeedbackMutationDto =
            /* Feedback record for different types of content */
            | {
                  /**
                   * Optional feedback ID
                   * example:
                   * 123
                   */
                  id?: number
                  /**
                   * example:
                   * TICKET
                   */
                  objectType: 'TICKET'
                  /**
                   * Object identifier
                   * example:
                   * 789
                   */
                  objectId: string
                  /**
                   * Execution identifier
                   * example:
                   * exec-123
                   */
                  executionId: string
                  /**
                   * example:
                   * TICKET
                   */
                  targetType: 'TICKET'
                  /**
                   * Target identifier
                   * example:
                   * target-123
                   */
                  targetId: string
                  /**
                   * example:
                   * UP
                   */
                  feedbackValue: 'UP' | 'DOWN'
                  feedbackType: 'TICKET_BINARY'
              }
            | {
                  /**
                   * Optional feedback ID
                   * example:
                   * 123
                   */
                  id?: number
                  /**
                   * example:
                   * TICKET
                   */
                  objectType: 'TICKET'
                  /**
                   * Object identifier
                   * example:
                   * 789
                   */
                  objectId: string
                  /**
                   * Execution identifier
                   * example:
                   * exec-123
                   */
                  executionId: string
                  /**
                   * example:
                   * TICKET
                   */
                  targetType: 'TICKET'
                  /**
                   * Target identifier
                   * example:
                   * target-123
                   */
                  targetId: string
                  /**
                   * example:
                   * This was very helpful feedback
                   */
                  feedbackValue: /**
                   * example:
                   * This was very helpful feedback
                   */
                  string | null
                  feedbackType: 'TICKET_FREEFORM'
              }
            | {
                  /**
                   * Optional feedback ID
                   * example:
                   * 123
                   */
                  id?: number
                  /**
                   * example:
                   * TICKET
                   */
                  objectType: 'TICKET'
                  /**
                   * Object identifier
                   * example:
                   * 789
                   */
                  objectId: string
                  /**
                   * Execution identifier
                   * example:
                   * exec-123
                   */
                  executionId: string
                  /**
                   * example:
                   * KNOWLEDGE_RESOURCE
                   */
                  targetType: 'KNOWLEDGE_RESOURCE'
                  /**
                   * example:
                   * article-123
                   */
                  targetId: string
                  /**
                   * example:
                   * UP
                   */
                  feedbackValue: 'UP' | 'DOWN'
                  feedbackType: 'KNOWLEDGE_RESOURCE_BINARY'
              }
            | {
                  /**
                   * Optional feedback ID
                   * example:
                   * 123
                   */
                  id?: number
                  /**
                   * example:
                   * TICKET
                   */
                  objectType: 'TICKET'
                  /**
                   * Object identifier
                   * example:
                   * 789
                   */
                  objectId: string
                  /**
                   * Execution identifier
                   * example:
                   * exec-123
                   */
                  executionId: string
                  /**
                   * example:
                   * TICKET
                   */
                  targetType: 'TICKET'
                  /**
                   * example:
                   * article-123
                   */
                  targetId: string
                  feedbackValue: string | null
                  feedbackType: 'SUGGESTED_RESOURCE'
              }
        /**
         * Request to upsert multiple feedback records
         */
        export interface FeedbackUpsertRequestDto {
            /**
             * Array of feedback records to upsert
             * example:
             * [
             *   {
             *     "objectType": "TICKET",
             *     "objectId": "789",
             *     "executionId": "exec-123",
             *     "targetType": "TICKET",
             *     "feedbackType": "TICKET_BINARY",
             *     "feedbackValue": "UP"
             *   }
             * ]
             */
            feedbackToUpsert: [
                /* Feedback record for different types of content */ FeedbackMutationDto,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
                /* Feedback record for different types of content */ FeedbackMutationDto?,
            ]
        }
        export interface FindAllQueryDto {
            /**
             * Account ID to filter by
             * example:
             * 1
             */
            accountId: /**
             * Account ID to filter by
             * example:
             * 1
             */
            string | number
            /**
             * Source Set IDs to filter by (Ex. Help Center ID)
             * example:
             * [
             *   1,
             *   2
             * ]
             */
            sourceSetIds: /**
             * Source Set IDs to filter by (Ex. Help Center ID)
             * example:
             * [
             *   1,
             *   2
             * ]
             */
            number[] | number[] | number[]
            /**
             * Source IDs to filter by
             * example:
             * [
             *   "1",
             *   "2"
             * ]
             */
            sourceIds?: /**
             * Source IDs to filter by
             * example:
             * [
             *   "1",
             *   "2"
             * ]
             */
            string[] | string[]
            /**
             * Locale to filter by
             * example:
             * en-US
             */
            locale?: string
            /**
             * Tags to filter by
             * example:
             * [
             *   "DEFAULT",
             *   "CONTEXT_SPECIFIC"
             * ]
             */
            tags?: /**
             * Tags to filter by
             * example:
             * [
             *   "DEFAULT",
             *   "CONTEXT_SPECIFIC"
             * ]
             */
            string[] | string[]
            /**
             * Include resources with empty tags
             * example:
             * true
             */
            includeWithoutTags?: /**
             * Include resources with empty tags
             * example:
             * true
             */
            boolean | string
        }
        export interface KnowledgeResourceDto {
            id: number
            accountId: number
            sourceId: string
            sourceSetId: string
            processingState: 'pending' | 'completed' | 'failed'
            locale: string
            body: string
            title: string
            tags: string[]
            type: 'guidance' | 'article' | 'external_snippet'
            createdDatetime: string // date-time
            updatedDatetime: string // date-time
        }
    }
}
declare namespace Paths {
    namespace FindAllKnowledgeResources {
        namespace Parameters {
            /**
             * example:
             * 1
             */
            export type AccountId = any
            /**
             * example:
             * true
             */
            export type IncludeWithoutTags = any
            /**
             * example:
             * en-US
             */
            export type Locale = string
            /**
             * example:
             * [
             *   "1",
             *   "2"
             * ]
             */
            export type SourceIds = any[]
            /**
             * example:
             * [
             *   1,
             *   2
             * ]
             */
            export type SourceSetIds = any[]
            /**
             * example:
             * [
             *   "DEFAULT",
             *   "CONTEXT_SPECIFIC"
             * ]
             */
            export type Tags = any[]
        }
        export interface QueryParameters {
            accountId: /**
             * example:
             * 1
             */
            Parameters.AccountId
            sourceSetIds: /**
             * example:
             * [
             *   1,
             *   2
             * ]
             */
            Parameters.SourceSetIds
            sourceIds?: /**
             * example:
             * [
             *   "1",
             *   "2"
             * ]
             */
            Parameters.SourceIds
            locale?: /**
             * example:
             * en-US
             */
            Parameters.Locale
            tags?: /**
             * example:
             * [
             *   "DEFAULT",
             *   "CONTEXT_SPECIFIC"
             * ]
             */
            Parameters.Tags
            includeWithoutTags?: /**
             * example:
             * true
             */
            Parameters.IncludeWithoutTags
        }
        namespace Responses {
            export type $200 = Components.Schemas.KnowledgeResourceDto[]
        }
    }
    namespace FindFeedbackFeedback {
        namespace Parameters {
            /**
             * example:
             * 789
             */
            export type ObjectId = string
            /**
             * example:
             * TICKET
             */
            export type ObjectType = 'TICKET' | 'SEARCH_BAR'
        }
        export interface QueryParameters {
            objectType: /**
             * example:
             * TICKET
             */
            Parameters.ObjectType
            objectId: /**
             * example:
             * 789
             */
            Parameters.ObjectId
        }
        namespace Responses {
            export type $200 = Components.Schemas.FeedbackDto
            export interface $403 {}
        }
    }
    namespace FindOneKnowledgeResources {
        namespace Parameters {
            export type Id = number
        }
        export interface PathParameters {
            id: Parameters.Id
        }
        namespace Responses {
            export type $200 = Components.Schemas.KnowledgeResourceDto
        }
    }
    namespace LiveHealth {
        namespace Responses {
            export interface $200 {}
        }
    }
    namespace ReadyHealth {
        namespace Responses {
            export interface $200 {}
        }
    }
    namespace StartupHealth {
        namespace Responses {
            export interface $200 {
                /**
                 * example:
                 * ok
                 */
                status?: string
                /**
                 * example:
                 * {
                 *   "database": {
                 *     "status": "up"
                 *   }
                 * }
                 */
                info?: {
                    [name: string]: {
                        [name: string]: any
                        status: string
                    }
                } | null
                /**
                 * example:
                 * {}
                 */
                error?: {
                    [name: string]: {
                        [name: string]: any
                        status: string
                    }
                } | null
                /**
                 * example:
                 * {
                 *   "database": {
                 *     "status": "up"
                 *   }
                 * }
                 */
                details?: {
                    [name: string]: {
                        [name: string]: any
                        status: string
                    }
                }
            }
            export interface $503 {
                /**
                 * example:
                 * error
                 */
                status?: string
                /**
                 * example:
                 * {
                 *   "database": {
                 *     "status": "up"
                 *   }
                 * }
                 */
                info?: {
                    [name: string]: {
                        [name: string]: any
                        status: string
                    }
                } | null
                /**
                 * example:
                 * {
                 *   "redis": {
                 *     "status": "down",
                 *     "message": "Could not connect"
                 *   }
                 * }
                 */
                error?: {
                    [name: string]: {
                        [name: string]: any
                        status: string
                    }
                } | null
                /**
                 * example:
                 * {
                 *   "database": {
                 *     "status": "up"
                 *   },
                 *   "redis": {
                 *     "status": "down",
                 *     "message": "Could not connect"
                 *   }
                 * }
                 */
                details?: {
                    [name: string]: {
                        [name: string]: any
                        status: string
                    }
                }
            }
        }
    }
    namespace UpsertFeedbackFeedback {
        export type RequestBody =
            /* Request to upsert multiple feedback records */ Components.Schemas.FeedbackUpsertRequestDto
        namespace Responses {
            export interface $201 {}
            export interface $403 {}
        }
    }
}

export interface OperationMethods {
    /**
     * findAllKnowledgeResources - Get all knowledge resources
     */
    'findAllKnowledgeResources'(
        parameters?: Parameters<Paths.FindAllKnowledgeResources.QueryParameters> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.FindAllKnowledgeResources.Responses.$200>
    /**
     * findOneKnowledgeResources - Get a knowledge resource by ID
     */
    'findOneKnowledgeResources'(
        parameters: Parameters<Paths.FindOneKnowledgeResources.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.FindOneKnowledgeResources.Responses.$200>
    /**
     * findFeedbackFeedback - Get all resources used by AI Agent and the related feedback
     */
    'findFeedbackFeedback'(
        parameters?: Parameters<Paths.FindFeedbackFeedback.QueryParameters> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.FindFeedbackFeedback.Responses.$200>
    /**
     * upsertFeedbackFeedback - Upsert feedback
     *
     * Creates or updates feedback records. To delete knowledge resource feedback records, provide the ID and set feedbackValue to null.
     */
    'upsertFeedbackFeedback'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.UpsertFeedbackFeedback.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.UpsertFeedbackFeedback.Responses.$201>
    /**
     * readyHealth
     */
    'readyHealth'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ReadyHealth.Responses.$200>
    /**
     * startupHealth
     */
    'startupHealth'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.StartupHealth.Responses.$200>
    /**
     * liveHealth
     */
    'liveHealth'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.LiveHealth.Responses.$200>
}

export interface PathsDictionary {
    ['/api/knowledge-resources']: {
        /**
         * findAllKnowledgeResources - Get all knowledge resources
         */
        'get'(
            parameters?: Parameters<Paths.FindAllKnowledgeResources.QueryParameters> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.FindAllKnowledgeResources.Responses.$200>
    }
    ['/api/knowledge-resources/{id}']: {
        /**
         * findOneKnowledgeResources - Get a knowledge resource by ID
         */
        'get'(
            parameters: Parameters<Paths.FindOneKnowledgeResources.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.FindOneKnowledgeResources.Responses.$200>
    }
    ['/api/feedback']: {
        /**
         * findFeedbackFeedback - Get all resources used by AI Agent and the related feedback
         */
        'get'(
            parameters?: Parameters<Paths.FindFeedbackFeedback.QueryParameters> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.FindFeedbackFeedback.Responses.$200>
        /**
         * upsertFeedbackFeedback - Upsert feedback
         *
         * Creates or updates feedback records. To delete knowledge resource feedback records, provide the ID and set feedbackValue to null.
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.UpsertFeedbackFeedback.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.UpsertFeedbackFeedback.Responses.$201>
    }
    ['/api/health/ready']: {
        /**
         * readyHealth
         */
        'get'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ReadyHealth.Responses.$200>
    }
    ['/api/health/startup']: {
        /**
         * startupHealth
         */
        'get'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.StartupHealth.Responses.$200>
    }
    ['/api/health/live']: {
        /**
         * liveHealth
         */
        'get'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.LiveHealth.Responses.$200>
    }
}

export type Client = OpenAPIClient<OperationMethods, PathsDictionary>
