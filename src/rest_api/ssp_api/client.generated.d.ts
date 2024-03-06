import {
  OpenAPIClient,
  Parameters,
  UnknownParamsObject,
  OperationResponse,
  AxiosRequestConfig,
} from 'openapi-client-axios'; 

declare namespace Components {
  namespace Schemas {
    export interface PredictionResponseDataDTO {
      /**
       * example:
       * 1
       */
      id: number;
      /**
       * example:
       * What's my order status?
       */
      message: string;
      /**
       * example:
       * 7a53c1de-993c-4cc3-992c-3f973df46e2e
       */
      conversationId: string;
      /**
       * example:
       * my-store
       */
      shopName?: string;
      /**
       * example:
       * shopify
       */
      shopType?: string;
      /**
       * example:
       * en-US
       */
      locale: "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
      /**
       * example:
       * 1
       */
      accountId: number;
      /**
       * example:
       * 1
       */
      helpCenterId: number;
      /**
       * example:
       * 1
       */
      articleId: number;
      /**
       * example:
       * 1
       */
      articleIdFeedback: number | null;
      /**
       * example:
       * 1
       */
      isHelpful: boolean | null;
      /**
       * example:
       * 2023-11-09T12:51:05.141Z
       */
      createdDatetime: string;
      /**
       * example:
       * 2023-11-09T12:51:05.141Z
       */
      updatedDatetime: string;
    }
    export interface PredictionResponseMetaDTO {
      pagination: {
        /**
         * example:
         * 1
         */
        currentPage: number;
        /**
         * example:
         * 2
         */
        nextPage: number | null;
        /**
         * example:
         * 2
         */
        totalPages: number;
        /**
         * example:
         * 72
         */
        totalSize: number;
        /**
         * example:
         * 50
         */
        pageSize: number;
        /**
         * example:
         * 50
         */
        pageLimit: number;
      };
      progress: {
        /**
         * example:
         * 10
         */
        value: number;
        /**
         * example:
         * 100
         */
        maxValue: number;
      };
      /**
       * example:
       * false
       */
      completed?: boolean;
      /**
       * example:
       * 5
       */
      totalDistinctArticles: number;
      /**
       * example:
       * 2
       */
      totalLabeledArticles: number;
    }
  }
}
declare namespace Paths {
  namespace GetArticleRecommendationPredictions {
    export interface HeaderParameters {
      "Content-Type"?: Parameters.ContentType;
      Authorization?: Parameters.Authorization;
    }
    namespace Parameters {
      export type ArticleId = number;
      export type Authorization = string;
      export type Completed = boolean;
      export type ContentType = string;
      export type FeedbackOptions = ("helpful" | "not-helpful" | "no-feedback")[];
      export type HelpCenterId = number;
      export type Page = number;
      export type ShopName = string;
      export type ShopType = string;
    }
    export interface QueryParameters {
      page: Parameters.Page;
      shop_type: Parameters.ShopType;
      shop_name: Parameters.ShopName;
      help_center_id: Parameters.HelpCenterId;
      article_id?: Parameters.ArticleId;
      completed?: Parameters.Completed;
      feedback_options?: Parameters.FeedbackOptions;
    }
    namespace Responses {
      export interface $200 {
        data?: Components.Schemas.PredictionResponseDataDTO[];
        meta?: Components.Schemas.PredictionResponseMetaDTO;
      }
    }
  }
  namespace UpdateArticleRecommendationPredictions {
    export interface HeaderParameters {
      "Content-Type"?: Parameters.ContentType;
      Authorization?: Parameters.Authorization;
    }
    namespace Parameters {
      export type Authorization = string;
      export type ContentType = string;
      export type Id = number;
    }
    export interface PathParameters {
      id: Parameters.Id;
    }
    export interface RequestBody {
      /**
       * Resource data
       */
      data: {
        /**
         * example:
         * 1
         */
        articleIdFeedback?: number;
      };
      /**
       * Resource metadata
       */
      meta?: {
        /**
         * example:
         * Article Title
         */
        articleTitleFeedback: string;
        /**
         * example:
         * article-slug
         */
        articleSlugFeedback: string;
      };
    }
    namespace Responses {
      export type $200 = Components.Schemas.PredictionResponseDataDTO;
    }
  }
}

export interface OperationMethods {
  /**
   * getArticleRecommendationPredictions - Get Article Recommendation Predictions
   */
  'getArticleRecommendationPredictions'(
    parameters?: Parameters<Paths.GetArticleRecommendationPredictions.QueryParameters & Paths.GetArticleRecommendationPredictions.HeaderParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetArticleRecommendationPredictions.Responses.$200>
  /**
   * updateArticleRecommendationPredictions - Update Article Recommendation Predictions
   */
  'updateArticleRecommendationPredictions'(
    parameters?: Parameters<Paths.UpdateArticleRecommendationPredictions.PathParameters & Paths.UpdateArticleRecommendationPredictions.HeaderParameters> | null,
    data?: Paths.UpdateArticleRecommendationPredictions.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateArticleRecommendationPredictions.Responses.$200>
}

export interface PathsDictionary {
  ['/article-recommendation/predictions']: {
    /**
     * getArticleRecommendationPredictions - Get Article Recommendation Predictions
     */
    'get'(
      parameters?: Parameters<Paths.GetArticleRecommendationPredictions.QueryParameters & Paths.GetArticleRecommendationPredictions.HeaderParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetArticleRecommendationPredictions.Responses.$200>
  }
  ['/article-recommendation/predictions/{id}']: {
    /**
     * updateArticleRecommendationPredictions - Update Article Recommendation Predictions
     */
    'patch'(
      parameters?: Parameters<Paths.UpdateArticleRecommendationPredictions.PathParameters & Paths.UpdateArticleRecommendationPredictions.HeaderParameters> | null,
      data?: Paths.UpdateArticleRecommendationPredictions.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateArticleRecommendationPredictions.Responses.$200>
  }
}

export type Client = OpenAPIClient<OperationMethods, PathsDictionary>
