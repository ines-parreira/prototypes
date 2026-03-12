import type {
    AxiosRequestConfig,
    OpenAPIClient,
    OperationResponse,
    Parameters,
    UnknownParamsObject,
} from 'openapi-client-axios'

declare namespace Components {
    namespace Schemas {
        export interface AIArticleTemplateDto {
            key: string
            title: string
            html_content: string
            /**
             *
             *       A short summary of the article.
             *       Usually the first paragraph of the article.
             *
             */
            excerpt: string
            category: string
            /**
             *
             *       The relevancy of the article template.
             *       The higher being the more relevant.
             *       Static article templates have a score between 0 and -1.
             *       Expecting AI articles to have a score between 0 and 1 in the future.
             *
             */
            score: number
            /**
             *
             *       The number of tickets used to generate the article.
             *       Value can be -1 if this data is not available.
             *
             */
            related_tickets_count?: number
            batch_datetime?: string // date-time
            review_action?:
                | 'archive'
                | 'dismissFromTopQuestions'
                | 'publish'
                | 'saveAsDraft'
            reviews?: ArticleTemplateReviewDto[]
        }
        export interface AIGuidanceDto {
            key: string
            name: string
            content: string
            batch_datetime: string // date-time
            review_action?: 'created' | 'none'
        }
        export interface AccessTokenDto {
            access_token: string
            token_type: string
        }
        export interface AccountInfoDto {
            account_id: number
            shop_name: string | null
            shop_integration_id: number | null
        }
        export interface AnalyseCsvRequestDto {
            /**
             * Configuration for analysing the CSV file.
             */
            file_url: string
        }
        export interface AnalyseCsvResponseColumnDto {
            /**
             * example:
             * article_title
             */
            name: string
            /**
             * example:
             * [
             *   "What is Gorgias?",
             *   "Installation Guide"
             * ]
             */
            samples: string[]
        }
        export interface AnalyseCsvResponseDto {
            result: AnalyseCsvResponseSuccessDto | AnalyseCsvResponseFailedDto
        }
        export interface AnalyseCsvResponseFailedDto {
            /**
             * example:
             * FAILED
             */
            status: 'FAILED'
            error: 'FILE_OVER_400_ROWS' | 'INTERNAL' | 'MALFORMED_FILE'
        }
        export interface AnalyseCsvResponseSuccessDto {
            /**
             * example:
             * SUCCESS
             */
            status: 'SUCCESS'
            columns: AnalyseCsvResponseColumnDto[]
            /**
             * example:
             * 1000
             */
            num_rows: number
        }
        export interface ApifyFailedIngestionDto {
            defaultDatasetId: string
        }
        export interface ApifyWebhookDto {
            userId: string
            createdAt: string
            eventType: string
            eventData: EventDataDto
            resource: ResourceDto
        }
        export interface ArticleColumns {
            locales: {
                [name: string]: ArticleLocaleColumns
            }
        }
        export interface ArticleDto {
            /**
             * Creation date
             */
            created_datetime: string // date-time
            /**
             * Update date
             */
            updated_datetime: string // date-time
            /**
             * Deletion date
             */
            deleted_datetime?: string | null // date-time
            category_id: number | null
            available_locales: (
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            )[]
            help_center_id: number
            template_key?: string | null
            origin?:
                | 'aiGenerated'
                | 'aiLibraryTab'
                | 'allRecommendationsPage'
                | 'helpCenterWizard'
                | 'topQuestionsSection'
            ingested_resource_id: number | null
            id: number
        }
        export interface ArticleIngestionLogDto {
            help_center_id: number
            article_ids: number[]
            source_name?: string | null
            raw_text?: string | null
            dataset_id: string | null
            scraping_id?: string | null
            latest_sync?: string | null // date-time
            created_datetime: string // date-time
            id: number
            url: string | null
            domain: string | null
            source: 'domain' | 'file' | 'url'
            status: 'DISABLED' | 'FAILED' | 'PENDING' | 'SUCCESSFUL'
            meta?: {
                /**
                 * Gorgias account domain name
                 */
                'x-gorgias-domain': string | null
                /**
                 * UID for this call. e.g. snippet_transformation_{account_name}{help_center_id}_{timestamp}
                 */
                'x-execution-id': string | null
                /**
                 * File type (MIME type) - only for file ingestion
                 */
                file_type?: string
                /**
                 * File size in bytes - only for file ingestion
                 */
                file_size_bytes?: number
            } | null
        }
        export interface ArticleListDataDto {
            id: number
            unlisted_id: string
            created_datetime: string // date-time
            updated_datetime: string // date-time
            deleted_datetime?: string | null // date-time
            category_id: number | null
            help_center_id: number
            template_key?: string | null
            origin?:
                | 'aiGenerated'
                | 'aiLibraryTab'
                | 'allRecommendationsPage'
                | 'helpCenterWizard'
                | 'topQuestionsSection'
            ingested_resource_id: number | null
            available_locales: (
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            )[]
            rating: Rating
            translation: ArticleListDataTranslationDto
        }
        export interface ArticleListDataTranslationDto {
            created_datetime: string // date-time
            updated_datetime: string // date-time
            deleted_datetime?: string | null // date-time
            title: string
            excerpt: string
            content: string
            slug: string
            locale:
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            article_id: number
            category_id: number | null
            article_unlisted_id: string
            seo_meta: {
                title: string | null
                description: string | null
            }
            visibility_status: 'PUBLIC' | 'UNLISTED'
            customer_visibility: 'PUBLIC' | 'UNLISTED'
            is_current: boolean
            draft_version_id: number | null
            published_version_id: number | null
            published_datetime: string | null // date-time
            publisher_user_id: number | null
            commit_message: string | null
            version: number | null
            intents?:
                | (
                      | 'account::deletion'
                      | 'account::login'
                      | 'account::other'
                      | 'account::registration'
                      | 'account::update'
                      | 'exchange::other'
                      | 'exchange::request'
                      | 'exchange::status'
                      | 'feedback::negative'
                      | 'feedback::other'
                      | 'feedback::positive'
                      | 'marketing::advertising'
                      | 'marketing::collaboration'
                      | 'marketing::other'
                      | 'marketing::unsubscribe'
                      | 'order::cancel'
                      | 'order::damaged'
                      | 'order::edit'
                      | 'order::missing item'
                      | 'order::other'
                      | 'order::payment'
                      | 'order::placement'
                      | 'order::refund'
                      | 'order::status'
                      | 'order::wrong item'
                      | 'other::no reply'
                      | 'other::other'
                      | 'other::spam'
                      | 'product::availability'
                      | 'product::customization'
                      | 'product::details'
                      | 'product::other'
                      | 'product::quality issues'
                      | 'product::usage'
                      | 'promotion & discount::information'
                      | 'promotion & discount::issue'
                      | 'promotion & discount::other'
                      | 'return::information'
                      | 'return::other'
                      | 'return::request'
                      | 'return::status'
                      | 'shipping::change address'
                      | 'shipping::delay'
                      | 'shipping::delivered not received'
                      | 'shipping::information'
                      | 'shipping::other'
                      | 'subscription::cancel'
                      | 'subscription::information'
                      | 'subscription::modification'
                      | 'subscription::other'
                      | 'warranty::claim'
                      | 'warranty::information'
                      | 'warranty::other'
                      | 'wholesale::information'
                      | 'wholesale::other'
                  )[]
                | null
            is_intent_usage_enabled?: boolean | null
            use_supporting_content?: boolean | null
            rating: Rating
            /**
             * Gives details on how the translation fallback was chosen:
             * - `undefined`: the translation is the requested one
             * - `default`: the translation is in help center's default locale
             * - `available`: the translation corresponds to the first available one
             */
            locale_fallback?: 'available' | 'default'
        }
        export interface ArticleLocaleColumns {
            title: ColumnSourceCsvOnly
            content: ColumnSourceCsvOnly
            slug: ColumnSourceCsvOrAutoGenerated
            excerpt?: ColumnSourceCsvOrAutoGenerated
        }
        export interface ArticleSourceTypeResponseDto {
            /**
             * Article ID
             * example:
             * 1
             */
            id: number
            /**
             * Source type of the article
             * example:
             * faq-helpcenter
             */
            source_type:
                | 'document'
                | 'faq-helpcenter'
                | 'guidance-helpcenter'
                | 'store-domain'
                | 'url'
        }
        export interface ArticleStatisticsDto {
            /**
             * Article ID
             */
            articleId: number
            /**
             * Rating statistics
             */
            rating: {
                up: number
                down: number
            }
        }
        export interface ArticleTemplateDto {
            key: string
            title: string
            html_content: string
            /**
             *
             *       A short summary of the article.
             *       Usually the first paragraph of the article.
             *
             */
            excerpt: string
            category: string
            /**
             *
             *       The relevancy of the article template.
             *       The higher being the more relevant.
             *       Static article templates have a score between 0 and -1.
             *       Expecting AI articles to have a score between 0 and 1 in the future.
             *
             */
            score: number
        }
        export interface ArticleTemplateReviewDto {
            template_key: string
            help_center_id: number
            action:
                | 'archive'
                | 'dismissFromTopQuestions'
                | 'publish'
                | 'saveAsDraft'
            reason?: string | null
        }
        export interface ArticleTranslationIntentDto {
            name: string
            intent:
                | 'account::deletion'
                | 'account::login'
                | 'account::other'
                | 'account::registration'
                | 'account::update'
                | 'exchange::other'
                | 'exchange::request'
                | 'exchange::status'
                | 'feedback::negative'
                | 'feedback::other'
                | 'feedback::positive'
                | 'marketing::advertising'
                | 'marketing::collaboration'
                | 'marketing::other'
                | 'marketing::unsubscribe'
                | 'order::cancel'
                | 'order::damaged'
                | 'order::edit'
                | 'order::missing item'
                | 'order::other'
                | 'order::payment'
                | 'order::placement'
                | 'order::refund'
                | 'order::status'
                | 'order::wrong item'
                | 'other::no reply'
                | 'other::other'
                | 'other::spam'
                | 'product::availability'
                | 'product::customization'
                | 'product::details'
                | 'product::other'
                | 'product::quality issues'
                | 'product::usage'
                | 'promotion & discount::information'
                | 'promotion & discount::issue'
                | 'promotion & discount::other'
                | 'return::information'
                | 'return::other'
                | 'return::request'
                | 'return::status'
                | 'shipping::change address'
                | 'shipping::delay'
                | 'shipping::delivered not received'
                | 'shipping::information'
                | 'shipping::other'
                | 'subscription::cancel'
                | 'subscription::information'
                | 'subscription::modification'
                | 'subscription::other'
                | 'warranty::claim'
                | 'warranty::information'
                | 'warranty::other'
                | 'wholesale::information'
                | 'wholesale::other'
            is_available: boolean
            used_by_article?: ArticleTranslationIntentUsedByArticleDto
        }
        export interface ArticleTranslationIntentGroupDto {
            name: string
            children: ArticleTranslationIntentDto[]
        }
        export interface ArticleTranslationIntentUsedByArticleDto {
            id: number
            version: number
            title: string
            locale: string
        }
        export interface ArticleTranslationIntentsResponseDto {
            intents: ArticleTranslationIntentGroupDto[]
        }
        export interface ArticleTranslationRatingDto {
            /**
             * Creation date
             */
            created_datetime: string // date-time
            /**
             * Update date
             */
            updated_datetime: string // date-time
            /**
             * Deletion date
             */
            deleted_datetime?: string | null // date-time
            id: number
            rating: '-1' | '1'
            context: RatingContextDto
        }
        export interface ArticleTranslationResponseDto {
            created_datetime: string // date-time
            updated_datetime: string // date-time
            deleted_datetime?: string | null // date-time
            title: string
            excerpt: string
            content: string
            slug: string
            locale:
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            article_id: number
            category_id: number | null
            article_unlisted_id: string
            seo_meta: {
                title: string | null
                description: string | null
            }
            visibility_status: 'PUBLIC' | 'UNLISTED'
            customer_visibility: 'PUBLIC' | 'UNLISTED'
            is_current: boolean
            draft_version_id: number | null
            published_version_id: number | null
            published_datetime: string | null // date-time
            publisher_user_id: number | null
            commit_message: string | null
            version: number | null
            intents?:
                | (
                      | 'account::deletion'
                      | 'account::login'
                      | 'account::other'
                      | 'account::registration'
                      | 'account::update'
                      | 'exchange::other'
                      | 'exchange::request'
                      | 'exchange::status'
                      | 'feedback::negative'
                      | 'feedback::other'
                      | 'feedback::positive'
                      | 'marketing::advertising'
                      | 'marketing::collaboration'
                      | 'marketing::other'
                      | 'marketing::unsubscribe'
                      | 'order::cancel'
                      | 'order::damaged'
                      | 'order::edit'
                      | 'order::missing item'
                      | 'order::other'
                      | 'order::payment'
                      | 'order::placement'
                      | 'order::refund'
                      | 'order::status'
                      | 'order::wrong item'
                      | 'other::no reply'
                      | 'other::other'
                      | 'other::spam'
                      | 'product::availability'
                      | 'product::customization'
                      | 'product::details'
                      | 'product::other'
                      | 'product::quality issues'
                      | 'product::usage'
                      | 'promotion & discount::information'
                      | 'promotion & discount::issue'
                      | 'promotion & discount::other'
                      | 'return::information'
                      | 'return::other'
                      | 'return::request'
                      | 'return::status'
                      | 'shipping::change address'
                      | 'shipping::delay'
                      | 'shipping::delivered not received'
                      | 'shipping::information'
                      | 'shipping::other'
                      | 'subscription::cancel'
                      | 'subscription::information'
                      | 'subscription::modification'
                      | 'subscription::other'
                      | 'warranty::claim'
                      | 'warranty::information'
                      | 'warranty::other'
                      | 'wholesale::information'
                      | 'wholesale::other'
                  )[]
                | null
            is_intent_usage_enabled?: boolean | null
            use_supporting_content?: boolean | null
        }
        export interface ArticleTranslationSeoMeta {
            title: string | null
            description: string | null
        }
        export interface ArticleTranslationVersionResponseDto {
            id: number
            version: number
            title: string
            excerpt: string
            content: string
            slug: string
            seo_meta: {
                title: string | null
                description: string | null
            } | null
            created_datetime: string // date-time
            published_datetime: string | null // date-time
            commit_message?: string
            publisher_user_id?: number
            intents?:
                | (
                      | 'account::deletion'
                      | 'account::login'
                      | 'account::other'
                      | 'account::registration'
                      | 'account::update'
                      | 'exchange::other'
                      | 'exchange::request'
                      | 'exchange::status'
                      | 'feedback::negative'
                      | 'feedback::other'
                      | 'feedback::positive'
                      | 'marketing::advertising'
                      | 'marketing::collaboration'
                      | 'marketing::other'
                      | 'marketing::unsubscribe'
                      | 'order::cancel'
                      | 'order::damaged'
                      | 'order::edit'
                      | 'order::missing item'
                      | 'order::other'
                      | 'order::payment'
                      | 'order::placement'
                      | 'order::refund'
                      | 'order::status'
                      | 'order::wrong item'
                      | 'other::no reply'
                      | 'other::other'
                      | 'other::spam'
                      | 'product::availability'
                      | 'product::customization'
                      | 'product::details'
                      | 'product::other'
                      | 'product::quality issues'
                      | 'product::usage'
                      | 'promotion & discount::information'
                      | 'promotion & discount::issue'
                      | 'promotion & discount::other'
                      | 'return::information'
                      | 'return::other'
                      | 'return::request'
                      | 'return::status'
                      | 'shipping::change address'
                      | 'shipping::delay'
                      | 'shipping::delivered not received'
                      | 'shipping::information'
                      | 'shipping::other'
                      | 'subscription::cancel'
                      | 'subscription::information'
                      | 'subscription::modification'
                      | 'subscription::other'
                      | 'warranty::claim'
                      | 'warranty::information'
                      | 'warranty::other'
                      | 'wholesale::information'
                      | 'wholesale::other'
                  )[]
                | null
            is_intent_usage_enabled?: boolean | null
            use_supporting_content?: boolean | null
        }
        export interface ArticleTranslationVersionsListPageDto {
            meta: PageMetaDto
            object: 'list'
            data: ArticleTranslationVersionResponseDto[]
        }
        export interface ArticleTranslationWithRating {
            created_datetime: string // date-time
            updated_datetime: string // date-time
            deleted_datetime?: string | null // date-time
            title: string
            excerpt: string
            content: string
            slug: string
            locale:
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            article_id: number
            category_id: number | null
            article_unlisted_id: string
            seo_meta: {
                title: string | null
                description: string | null
            }
            visibility_status: 'PUBLIC' | 'UNLISTED'
            customer_visibility: 'PUBLIC' | 'UNLISTED'
            is_current: boolean
            draft_version_id: number | null
            published_version_id: number | null
            published_datetime: string | null // date-time
            publisher_user_id: number | null
            commit_message: string | null
            version: number | null
            intents?:
                | (
                      | 'account::deletion'
                      | 'account::login'
                      | 'account::other'
                      | 'account::registration'
                      | 'account::update'
                      | 'exchange::other'
                      | 'exchange::request'
                      | 'exchange::status'
                      | 'feedback::negative'
                      | 'feedback::other'
                      | 'feedback::positive'
                      | 'marketing::advertising'
                      | 'marketing::collaboration'
                      | 'marketing::other'
                      | 'marketing::unsubscribe'
                      | 'order::cancel'
                      | 'order::damaged'
                      | 'order::edit'
                      | 'order::missing item'
                      | 'order::other'
                      | 'order::payment'
                      | 'order::placement'
                      | 'order::refund'
                      | 'order::status'
                      | 'order::wrong item'
                      | 'other::no reply'
                      | 'other::other'
                      | 'other::spam'
                      | 'product::availability'
                      | 'product::customization'
                      | 'product::details'
                      | 'product::other'
                      | 'product::quality issues'
                      | 'product::usage'
                      | 'promotion & discount::information'
                      | 'promotion & discount::issue'
                      | 'promotion & discount::other'
                      | 'return::information'
                      | 'return::other'
                      | 'return::request'
                      | 'return::status'
                      | 'shipping::change address'
                      | 'shipping::delay'
                      | 'shipping::delivered not received'
                      | 'shipping::information'
                      | 'shipping::other'
                      | 'subscription::cancel'
                      | 'subscription::information'
                      | 'subscription::modification'
                      | 'subscription::other'
                      | 'warranty::claim'
                      | 'warranty::information'
                      | 'warranty::other'
                      | 'wholesale::information'
                      | 'wholesale::other'
                  )[]
                | null
            is_intent_usage_enabled?: boolean | null
            use_supporting_content?: boolean | null
            rating: Rating
        }
        export interface ArticleTranslationsListPageDto {
            meta: PageMetaDto
            object: 'list'
            data: ArticleTranslationWithRating[]
        }
        export interface ArticleWithLocalTranslation {
            created_datetime: string // date-time
            updated_datetime: string // date-time
            deleted_datetime?: string | null // date-time
            unlisted_id: string
            available_locales: (
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            )[]
            category_id: number | null
            help_center_id: number
            template_key?: string | null
            origin?:
                | 'aiGenerated'
                | 'aiLibraryTab'
                | 'allRecommendationsPage'
                | 'helpCenterWizard'
                | 'topQuestionsSection'
            ingested_resource_id: number | null
            ingested_resource?: IngestedResourceDto
            id: number
            translation: LocalArticleTranslation
        }
        export interface ArticlesListPageDto {
            meta: PageMetaDto
            object: 'list'
            data: ArticleListDataDto[]
        }
        export interface AttachmentChannelDto {
            /**
             * Channel ID
             * example:
             * 1
             */
            id: number
            /**
             * Channel type
             * example:
             * CF
             */
            type: 'HC' | 'CF'
        }
        export interface AttachmentFileDto {
            /**
             * File name
             * example:
             * file.pdf
             */
            name: string
            /**
             * File size in bytes
             * example:
             * 123456
             */
            size: number
            /**
             * File mimetype
             * example:
             * application/pdf
             */
            mimetype: string
        }
        export interface AutomationSettingsDto {
            /**
             * example:
             * [
             *   {
             *     "id": "workflowId",
             *     "enabled": true
             *   }
             * ]
             */
            workflows: WorkflowVo[]
            /**
             * example:
             * {
             *   "enabled": true
             * }
             */
            order_management: {
                /**
                 * Is order management enabled
                 */
                enabled: boolean
            }
        }
        export interface BatchArticlesRequestDto {
            /**
             * Array of article IDs to retrieve source types for
             * example:
             * [
             *   1,
             *   2,
             *   3
             * ]
             */
            article_ids: [
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
                number?,
            ]
        }
        export interface BatchDeleteArticlesRequestDto {
            /**
             * Array of article IDs to delete
             * example:
             * [
             *   1,
             *   2,
             *   3,
             *   100,
             *   250
             * ]
             */
            article_ids: number[]
        }
        export interface BatchUpdateArticleTranslationsVisibilityRequestDto {
            /**
             * Array of article IDs to update translations for
             * example:
             * [
             *   1,
             *   2,
             *   3,
             *   100,
             *   250
             * ]
             */
            article_ids: number[]
            /**
             * Locale code for translations to update (all articles must have translation in this locale)
             * example:
             * en-US
             */
            locale_code:
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            /**
             * New visibility status for all translations
             * example:
             * PUBLIC
             */
            visibility_status: 'PUBLIC' | 'UNLISTED'
        }
        export interface BulkCopyArticlesRequestDto {
            /**
             * Array of article IDs to copy
             * example:
             * [
             *   1,
             *   2,
             *   3,
             *   100,
             *   250
             * ]
             */
            article_ids: number[]
            /**
             * List of shop names where to copy given articles
             * example:
             * [
             *   "shop-1, shop-2",
             *   [
             *     "shop-3"
             *   ]
             * ]
             */
            shop_names: string[]
        }
        export interface CategoriesListPageDto {
            meta: PageMetaDto
            object: 'list'
            data: CategoryWithLocalTranslationDto[]
        }
        export interface CategoryColumns {
            locales: {
                [name: string]: CategoryLocaleColumns
            }
        }
        export interface CategoryLocaleColumns {
            name: ColumnSourceCsvOnly
            description?: ColumnSourceCsvOnly
            slug: ColumnSourceCsvOrAutoGenerated
        }
        export interface CategoryTranslationDto {
            /**
             * Creation date
             */
            created_datetime: string // date-time
            /**
             * Update date
             */
            updated_datetime: string // date-time
            /**
             * Deletion date
             */
            deleted_datetime?: string | null // date-time
            category_id: number
            category_unlisted_id: string
            parent_category_id: number | null
            locale:
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            seo_meta: {
                title: string | null
                description: string | null
            }
            customer_visibility: 'PUBLIC' | 'UNLISTED'
            /**
             * example:
             * https://cdn.shopify.com/image.jpg
             */
            image_url: string | null
            title: string
            description: string | null
            slug: string
        }
        export interface CategoryTranslationSeoMeta {
            title: string | null
            description: string | null
        }
        export interface CategoryTranslationsListPageDto {
            meta: PageMetaDto
            object: 'list'
            data: CategoryTranslationDto[]
        }
        export interface CategoryTreeArticleDto {
            /**
             * Creation date
             */
            created_datetime: string // date-time
            /**
             * Update date
             */
            updated_datetime: string // date-time
            /**
             * Deletion date
             */
            deleted_datetime?: string | null // date-time
            unlisted_id: string
            category_id: number | null
            help_center_id: number
            template_key?: string | null
            origin?:
                | 'aiGenerated'
                | 'aiLibraryTab'
                | 'allRecommendationsPage'
                | 'helpCenterWizard'
                | 'topQuestionsSection'
            ingested_resource_id: number | null
            available_locales: (
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            )[]
            translation_versions: CategoryTreeArticleTranslationVersion
            id: number
        }
        export interface CategoryTreeArticleTranslationVersion {
            current: {
                created_datetime: string // date-time
                updated_datetime: string // date-time
                deleted_datetime?: string | null // date-time
                title: string
                excerpt: string
                content: string
                slug: string
                locale:
                    | 'cs-CZ'
                    | 'da-DK'
                    | 'nl-NL'
                    | 'en-GB'
                    | 'en-US'
                    | 'fi-FI'
                    | 'fr-CA'
                    | 'fr-FR'
                    | 'de-DE'
                    | 'it-IT'
                    | 'ja-JP'
                    | 'no-NO'
                    | 'pt-BR'
                    | 'es-ES'
                    | 'sv-SE'
                article_id: number
                category_id: number | null
                article_unlisted_id: string
                seo_meta: {
                    title: string | null
                    description: string | null
                }
                visibility_status: 'PUBLIC' | 'UNLISTED'
                customer_visibility: 'PUBLIC' | 'UNLISTED'
                is_current: boolean
                draft_version_id: number | null
                published_version_id: number | null
                published_datetime: string | null // date-time
                publisher_user_id: number | null
                commit_message: string | null
                version: number | null
                intents?:
                    | (
                          | 'account::deletion'
                          | 'account::login'
                          | 'account::other'
                          | 'account::registration'
                          | 'account::update'
                          | 'exchange::other'
                          | 'exchange::request'
                          | 'exchange::status'
                          | 'feedback::negative'
                          | 'feedback::other'
                          | 'feedback::positive'
                          | 'marketing::advertising'
                          | 'marketing::collaboration'
                          | 'marketing::other'
                          | 'marketing::unsubscribe'
                          | 'order::cancel'
                          | 'order::damaged'
                          | 'order::edit'
                          | 'order::missing item'
                          | 'order::other'
                          | 'order::payment'
                          | 'order::placement'
                          | 'order::refund'
                          | 'order::status'
                          | 'order::wrong item'
                          | 'other::no reply'
                          | 'other::other'
                          | 'other::spam'
                          | 'product::availability'
                          | 'product::customization'
                          | 'product::details'
                          | 'product::other'
                          | 'product::quality issues'
                          | 'product::usage'
                          | 'promotion & discount::information'
                          | 'promotion & discount::issue'
                          | 'promotion & discount::other'
                          | 'return::information'
                          | 'return::other'
                          | 'return::request'
                          | 'return::status'
                          | 'shipping::change address'
                          | 'shipping::delay'
                          | 'shipping::delivered not received'
                          | 'shipping::information'
                          | 'shipping::other'
                          | 'subscription::cancel'
                          | 'subscription::information'
                          | 'subscription::modification'
                          | 'subscription::other'
                          | 'warranty::claim'
                          | 'warranty::information'
                          | 'warranty::other'
                          | 'wholesale::information'
                          | 'wholesale::other'
                      )[]
                    | null
                is_intent_usage_enabled?: boolean | null
                use_supporting_content?: boolean | null
            } | null
            draft: ArticleTranslationResponseDto
        }
        export interface CategoryTreeDto {
            /**
             * Creation date
             */
            created_datetime: string // date-time
            /**
             * Update date
             */
            updated_datetime: string // date-time
            /**
             * Deletion date
             */
            deleted_datetime?: string | null // date-time
            unlisted_id: string
            help_center_id: number
            available_locales: (
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            )[]
            translation: {
                /**
                 * Creation date
                 */
                created_datetime: string // date-time
                /**
                 * Update date
                 */
                updated_datetime: string // date-time
                /**
                 * Deletion date
                 */
                deleted_datetime?: string | null // date-time
                category_id: number
                category_unlisted_id: string
                parent_category_id: number | null
                locale:
                    | 'cs-CZ'
                    | 'da-DK'
                    | 'nl-NL'
                    | 'en-GB'
                    | 'en-US'
                    | 'fi-FI'
                    | 'fr-CA'
                    | 'fr-FR'
                    | 'de-DE'
                    | 'it-IT'
                    | 'ja-JP'
                    | 'no-NO'
                    | 'pt-BR'
                    | 'es-ES'
                    | 'sv-SE'
                seo_meta: {
                    title: string | null
                    description: string | null
                }
                customer_visibility: 'PUBLIC' | 'UNLISTED'
                /**
                 * example:
                 * https://cdn.shopify.com/image.jpg
                 */
                image_url: string | null
                title: string
                description: string | null
                slug: string
            } | null
            children: CategoryTreeDto[]
            articles?: CategoryTreeArticleDto[]
            id: number
        }
        export interface CategoryWithLocalTranslationDto {
            /**
             * Creation date
             */
            created_datetime: string // date-time
            /**
             * Update date
             */
            updated_datetime: string // date-time
            /**
             * Deletion date
             */
            deleted_datetime?: string | null // date-time
            unlisted_id: string
            help_center_id: number
            available_locales: (
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            )[]
            translation: LocalCategoryTranslation
            id: number
        }
        export interface ChatContactInfo {
            deactivated_datetime: string | null
            description: string
        }
        export interface ChatContactInfoDto {
            enabled: boolean
            description: string
        }
        export interface ColumnSourceAutoGenerated {
            /**
             * example:
             * AUTO_GENERATED
             */
            kind: string // AUTO_GENERATED
        }
        export interface ColumnSourceCsv {
            /**
             * example:
             * CSV_COLUMN
             */
            kind: string // CSV_COLUMN
            /**
             * example:
             * csv_file_column_1
             */
            csv_column: string
        }
        export interface ColumnSourceCsvOnly {
            source: ColumnSourceCsv
        }
        export interface ColumnSourceCsvOrAutoGenerated {
            source: ColumnSourceAutoGenerated | ColumnSourceCsv
        }
        export interface ContactFormAttachmentDto {
            /**
             * The filename of the attachment
             * example:
             * image.png
             */
            filename: string
            /**
             * The size of the attachment in bytes
             * example:
             * 123456
             */
            size: number
            /**
             * The url of the attachment
             * example:
             * https://example.com/image.png
             */
            url: string
        }
        export interface ContactFormDto {
            /**
             * Creation date
             */
            created_datetime: string // date-time
            /**
             * Update date
             */
            updated_datetime: string // date-time
            /**
             * Deletion date
             */
            deleted_datetime?: string | null // date-time
            /**
             * Identifier
             * example:
             * 1
             */
            id: number
            /**
             * Helpdesk account id
             * example:
             * 1
             */
            account_id: number
            /**
             * Help center id
             * example:
             */
            help_center_id: number | null
            /**
             * Name of the contact form instance
             * example:
             * My Contact Form
             */
            name: string
            /**
             * Unique alphanumerical identifier
             * example:
             * g46hsfy6
             */
            uid: string
            /**
             * Default supported locale
             * example:
             * en-US
             */
            default_locale:
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            /**
             * Source of the creation of the contact form
             * example:
             * manual
             */
            source: 'help_center' | 'manual' | 'migration'
            /**
             * Custom subject lines
             * example:
             * {
             *   "options": [
             *     "Order status",
             *     "Feedback",
             *     "Report an issue",
             *     "Product questions",
             *     "Request refund or discount"
             *   ],
             *   "allow_other": true
             * }
             */
            subject_lines: {
                /**
                 * List of options that will be displayed to the user in the subject line's select dropdown
                 * Each option can be from 2 to 50 character long
                 * Max 15 options
                 */
                options: string[]
                /**
                 * If true, the "Other" subject line option will be made available
                 */
                allow_other: boolean
            } | null
            /**
             * Email integration details used to create Helpdesk tickets
             * example:
             * {
             *   "id": 1,
             *   "email": "jonh@example.com"
             * }
             */
            email_integration: {
                /**
                 * Identifier
                 */
                id: number
                /**
                 * Email value
                 */
                email: string
            } | null
            /**
             * Code snippet template to use to embed this contact form
             */
            code_snippet_template: string
            /**
             * Url template to use to construct the shareable Contact form link
             */
            url_template: string
            shop_name: string | null
            shop_integration_id: number | null
            /**
             * Deactivation date
             */
            deactivated_datetime: string | null // date-time
            /**
             * Automation settings id in contact form
             * example:
             * 2
             */
            automation_settings_id: number | null
            integration_id: number | null
            form_display_mode: 'show_after_button_click' | 'show_immediately'
            shop_integration?: {
                shop_name: string
                shop_type: 'bigcommerce' | 'magento2' | 'shopify'
                integration_id: number
                account_id: number
            } | null
            extra_html?: ContactFormExtraHTMLDto
        }
        export interface ContactFormExtraHTMLDto {
            extra_head: string
            extra_head_deactivated_datetime: string | null // date-time
        }
        export interface ContactFormPageDto {
            external_id: string
            title: string
            url_path: string
            body_html: string | null
        }
        export interface ContactFormSubmissionDto {
            /**
             * The full name of the user
             */
            full_name: string
            /**
             * The email of the user
             * example:
             * test@test.com
             */
            email: string
            /**
             * The subject of the message
             * example:
             * Feedback
             */
            subject: string
            /**
             * The message of the user
             */
            message: string
            /**
             * The url of the page where the form was submitted
             * example:
             * https://contact.gorgias.help/forms/abcde12345
             */
            url: string
            /**
             * Whether the form was embedded or not
             * example:
             * true
             */
            is_embedded: boolean
            attachments?: ContactFormAttachmentDto[]
        }
        export interface ContactFormsListPageDto {
            meta: PageMetaDto
            object: 'list'
            data: ContactFormDto[]
        }
        export interface ContactInfo {
            email: EmailContactInfo
            phone: PhoneContactInfo
            chat: ChatContactInfo
        }
        export interface ContactInfoDto {
            email: EmailContactInfoDto
            phone: PhoneContactInfoDto
            chat: ChatContactInfoDto
        }
        export interface ContactPhoneNumber {
            reference: string
            phone_number: string
        }
        export interface ContactPhoneNumberDto {
            reference: string
            phone_number: string
        }
        export interface CreateArticleDto {
            /**
             * A translation for the article.
             *
             * When creating an article, a translation should be provided.
             */
            translation: {
                /**
                 * The locale of the translation.
                 *
                 * It should be in help center's supported locales.
                 * example:
                 * fr-FR
                 */
                locale:
                    | 'cs-CZ'
                    | 'da-DK'
                    | 'nl-NL'
                    | 'en-GB'
                    | 'en-US'
                    | 'fi-FI'
                    | 'fr-CA'
                    | 'fr-FR'
                    | 'de-DE'
                    | 'it-IT'
                    | 'ja-JP'
                    | 'no-NO'
                    | 'pt-BR'
                    | 'es-ES'
                    | 'sv-SE'
                /**
                 * The title of the article in the `locale`'s translation.
                 * example:
                 * How to cancel an order
                 */
                title: string
                /**
                 * The excerpt of the article in the `locale`'s translation.
                 * example:
                 * Explains how to cancel an order
                 */
                excerpt: string
                /**
                 * The content of the article in the `locale`'s translation.
                 *
                 * Supports HTML formatted content.
                 * example:
                 * I can be <strong>HTML</strong>
                 */
                content: string
                /**
                 * A slug for the article that'll be used to construct article's URLs.
                 *
                 * Should only contains alphanumeric values and hyphens.
                 * example:
                 * cancel-an-order
                 */
                slug: string
                /**
                 * The SEO meta attributes of the article in the `locale`'s translation.
                 */
                seo_meta: {
                    /**
                     * The content of the `<title />` HTML tag for the article translation.
                     */
                    title: string | null
                    /**
                     * The content of the `<meta name="description">` HTML tag for the article translation.
                     */
                    description: string | null
                }
                /**
                 * This field describes whether the translation is going to be published or not, and it defaults to true. If true, it means it will be the published version; if previously it was only in draft, it will become published. If false, it will be the draft version and therefore, unpublished.
                 * example:
                 * "false" it means it is a draft version
                 */
                is_current?: boolean
                /**
                 * A short description of the changes in this version. Only stored when publishing (isCurrent=true).
                 * example:
                 * Updated pricing information
                 */
                commit_message?: string
                /**
                 * The visibility status of the article.
                 */
                visibility_status?: 'PUBLIC' | 'UNLISTED'
                /**
                 * The customer-facing visibility of the article.
                 *
                 * When provided, this value is used directly instead of being derived
                 * from `visibility_status` and the article's `sourceType`.
                 * When omitted, `customer_visibility` is derived automatically.
                 */
                customer_visibility?: 'PUBLIC' | 'UNLISTED'
                /**
                 * Used to change the categoryId of the article
                 */
                category_id?: number | null
                /**
                 * The list of intents linked to this article translation.
                 * example:
                 * [
                 *   "order::status",
                 *   "order::refund"
                 * ]
                 */
                intents?: (
                    | 'account::deletion'
                    | 'account::login'
                    | 'account::other'
                    | 'account::registration'
                    | 'account::update'
                    | 'exchange::other'
                    | 'exchange::request'
                    | 'exchange::status'
                    | 'feedback::negative'
                    | 'feedback::other'
                    | 'feedback::positive'
                    | 'marketing::advertising'
                    | 'marketing::collaboration'
                    | 'marketing::other'
                    | 'marketing::unsubscribe'
                    | 'order::cancel'
                    | 'order::damaged'
                    | 'order::edit'
                    | 'order::missing item'
                    | 'order::other'
                    | 'order::payment'
                    | 'order::placement'
                    | 'order::refund'
                    | 'order::status'
                    | 'order::wrong item'
                    | 'other::no reply'
                    | 'other::other'
                    | 'other::spam'
                    | 'product::availability'
                    | 'product::customization'
                    | 'product::details'
                    | 'product::other'
                    | 'product::quality issues'
                    | 'product::usage'
                    | 'promotion & discount::information'
                    | 'promotion & discount::issue'
                    | 'promotion & discount::other'
                    | 'return::information'
                    | 'return::other'
                    | 'return::request'
                    | 'return::status'
                    | 'shipping::change address'
                    | 'shipping::delay'
                    | 'shipping::delivered not received'
                    | 'shipping::information'
                    | 'shipping::other'
                    | 'subscription::cancel'
                    | 'subscription::information'
                    | 'subscription::modification'
                    | 'subscription::other'
                    | 'warranty::claim'
                    | 'warranty::information'
                    | 'warranty::other'
                    | 'wholesale::information'
                    | 'wholesale::other'
                )[]
                /**
                 * Whether intent-based usage is enabled for this article translation.
                 * example:
                 * true
                 */
                is_intent_usage_enabled?: boolean
                /**
                 * Whether the article content can be used as supporting content for AI responses.
                 * example:
                 * true
                 */
                use_supporting_content?: boolean
            }
            category_id?: number | null
            template_key?: string | null
            origin?:
                | 'aiGenerated'
                | 'aiLibraryTab'
                | 'allRecommendationsPage'
                | 'helpCenterWizard'
                | 'topQuestionsSection'
            ingested_resource_id?: number | null
        }
        export interface CreateArticleTranslationDto {
            /**
             * The locale of the translation.
             *
             * It should be in help center's supported locales.
             * example:
             * fr-FR
             */
            locale:
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            /**
             * The title of the article in the `locale`'s translation.
             * example:
             * How to cancel an order
             */
            title: string
            /**
             * The excerpt of the article in the `locale`'s translation.
             * example:
             * Explains how to cancel an order
             */
            excerpt: string
            /**
             * The content of the article in the `locale`'s translation.
             *
             * Supports HTML formatted content.
             * example:
             * I can be <strong>HTML</strong>
             */
            content: string
            /**
             * A slug for the article that'll be used to construct article's URLs.
             *
             * Should only contains alphanumeric values and hyphens.
             * example:
             * cancel-an-order
             */
            slug: string
            /**
             * The SEO meta attributes of the article in the `locale`'s translation.
             */
            seo_meta: {
                /**
                 * The content of the `<title />` HTML tag for the article translation.
                 */
                title: string | null
                /**
                 * The content of the `<meta name="description">` HTML tag for the article translation.
                 */
                description: string | null
            }
            /**
             * This field describes whether the translation is going to be published or not, and it defaults to true. If true, it means it will be the published version; if previously it was only in draft, it will become published. If false, it will be the draft version and therefore, unpublished.
             * example:
             * "false" it means it is a draft version
             */
            is_current?: boolean
            /**
             * A short description of the changes in this version. Only stored when publishing (isCurrent=true).
             * example:
             * Updated pricing information
             */
            commit_message?: string
            /**
             * The visibility status of the article.
             */
            visibility_status?: 'PUBLIC' | 'UNLISTED'
            /**
             * The customer-facing visibility of the article.
             *
             * When provided, this value is used directly instead of being derived
             * from `visibility_status` and the article's `sourceType`.
             * When omitted, `customer_visibility` is derived automatically.
             */
            customer_visibility?: 'PUBLIC' | 'UNLISTED'
            /**
             * Used to change the categoryId of the article
             */
            category_id?: number | null
            /**
             * The list of intents linked to this article translation.
             * example:
             * [
             *   "order::status",
             *   "order::refund"
             * ]
             */
            intents?: (
                | 'account::deletion'
                | 'account::login'
                | 'account::other'
                | 'account::registration'
                | 'account::update'
                | 'exchange::other'
                | 'exchange::request'
                | 'exchange::status'
                | 'feedback::negative'
                | 'feedback::other'
                | 'feedback::positive'
                | 'marketing::advertising'
                | 'marketing::collaboration'
                | 'marketing::other'
                | 'marketing::unsubscribe'
                | 'order::cancel'
                | 'order::damaged'
                | 'order::edit'
                | 'order::missing item'
                | 'order::other'
                | 'order::payment'
                | 'order::placement'
                | 'order::refund'
                | 'order::status'
                | 'order::wrong item'
                | 'other::no reply'
                | 'other::other'
                | 'other::spam'
                | 'product::availability'
                | 'product::customization'
                | 'product::details'
                | 'product::other'
                | 'product::quality issues'
                | 'product::usage'
                | 'promotion & discount::information'
                | 'promotion & discount::issue'
                | 'promotion & discount::other'
                | 'return::information'
                | 'return::other'
                | 'return::request'
                | 'return::status'
                | 'shipping::change address'
                | 'shipping::delay'
                | 'shipping::delivered not received'
                | 'shipping::information'
                | 'shipping::other'
                | 'subscription::cancel'
                | 'subscription::information'
                | 'subscription::modification'
                | 'subscription::other'
                | 'warranty::claim'
                | 'warranty::information'
                | 'warranty::other'
                | 'wholesale::information'
                | 'wholesale::other'
            )[]
            /**
             * Whether intent-based usage is enabled for this article translation.
             * example:
             * true
             */
            is_intent_usage_enabled?: boolean
            /**
             * Whether the article content can be used as supporting content for AI responses.
             * example:
             * true
             */
            use_supporting_content?: boolean
        }
        export interface CreateArticleTranslationRatingDto {
            /**
             * The rating of the article translation.
             * example:
             * -1
             */
            rating: '-1' | '1'
            /**
             * The context of the client.
             * example:
             * "{"ip_address": "89.912.12.11", "user_agent": "Chrome"}"
             */
            context: {
                [key: string]: any
            }
        }
        export interface CreateArticleTranslationSeoMetaDto {
            /**
             * The content of the `<title />` HTML tag for the article translation.
             */
            title: string | null
            /**
             * The content of the `<meta name="description">` HTML tag for the article translation.
             */
            description: string | null
        }
        export interface CreateCategoryDto {
            /**
             * A translation for the category.
             *
             * When creating a category, a translation should be provided.
             */
            translation: {
                /**
                 * The locale of the translation.
                 *
                 * It should be in help center's supported locales.
                 * example:
                 * fr-FR
                 */
                locale:
                    | 'cs-CZ'
                    | 'da-DK'
                    | 'nl-NL'
                    | 'en-GB'
                    | 'en-US'
                    | 'fi-FI'
                    | 'fr-CA'
                    | 'fr-FR'
                    | 'de-DE'
                    | 'it-IT'
                    | 'ja-JP'
                    | 'no-NO'
                    | 'pt-BR'
                    | 'es-ES'
                    | 'sv-SE'
                /**
                 * If the parent_category_is set to null change the category's parent to the root category
                 * If it's set to a number set it to that specific category
                 * If the property is not set, don't change anything
                 */
                parent_category_id?: number | null
                /**
                 * The title of the category in the `locale`'s translation.
                 * example:
                 * Orders
                 */
                title: string
                /**
                 * The description of the category in the `locale`'s translation.
                 * example:
                 * Information about orders
                 */
                description: string | null
                /**
                 * A slug for the category that'll be used to construct category's URLs.
                 *
                 * Should only contains alphanumeric values and hyphens.
                 * example:
                 * orders
                 */
                slug: string
                /**
                 * The SEO meta attributes of the category in the `locale`'s translation.
                 */
                seo_meta: {
                    /**
                     * The content of the `<title />` HTML tag for the category translation.
                     */
                    title: string | null
                    /**
                     * The content of the `<meta name="description">` HTML tag for the category translation.
                     */
                    description: string | null
                }
                /**
                 * The customer-facing visibility of the category.
                 */
                customer_visibility?: 'PUBLIC' | 'UNLISTED'
                /**
                 * Category image URL
                 * example:
                 * https://cdn.shopify.com/image.jpg
                 */
                image_url?: string | null
            }
        }
        export interface CreateCategoryTranslationDto {
            /**
             * The locale of the translation.
             *
             * It should be in help center's supported locales.
             * example:
             * fr-FR
             */
            locale:
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            /**
             * If the parent_category_is set to null change the category's parent to the root category
             * If it's set to a number set it to that specific category
             * If the property is not set, don't change anything
             */
            parent_category_id?: number | null
            /**
             * The title of the category in the `locale`'s translation.
             * example:
             * Orders
             */
            title: string
            /**
             * The description of the category in the `locale`'s translation.
             * example:
             * Information about orders
             */
            description: string | null
            /**
             * A slug for the category that'll be used to construct category's URLs.
             *
             * Should only contains alphanumeric values and hyphens.
             * example:
             * orders
             */
            slug: string
            /**
             * The SEO meta attributes of the category in the `locale`'s translation.
             */
            seo_meta: {
                /**
                 * The content of the `<title />` HTML tag for the category translation.
                 */
                title: string | null
                /**
                 * The content of the `<meta name="description">` HTML tag for the category translation.
                 */
                description: string | null
            }
            /**
             * The customer-facing visibility of the category.
             */
            customer_visibility?: 'PUBLIC' | 'UNLISTED'
            /**
             * Category image URL
             * example:
             * https://cdn.shopify.com/image.jpg
             */
            image_url?: string | null
        }
        export interface CreateCategoryTranslationSeoMetaDto {
            /**
             * The content of the `<title />` HTML tag for the category translation.
             */
            title: string | null
            /**
             * The content of the `<meta name="description">` HTML tag for the category translation.
             */
            description: string | null
        }
        export interface CreateContactFormDto {
            /**
             * Name of the Contact Form
             * example:
             * My Contact Form
             */
            name: string
            /**
             * Contact Form default locale
             * example:
             * en-US
             */
            default_locale:
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            /**
             * Email integration used to receive this contact form inquiries
             * example:
             * {
             *   "id": 1,
             *   "email": "jonh@example.com"
             * }
             */
            email_integration: {
                /**
                 * Identifier
                 */
                id: number
                /**
                 * Email value
                 */
                email: string
            }
            /**
             * example:
             * {
             *   "options": [
             *     "Order status",
             *     "Feedback",
             *     "Report an issue",
             *     "Product questions",
             *     "Request refund or discount"
             *   ],
             *   "allow_other": true
             * }
             */
            subject_lines?: {
                /**
                 * List of options that will be displayed to the user in the subject line's select dropdown
                 * Each option can be from 2 to 50 character long
                 * Max 15 options
                 */
                options: string[]
                /**
                 * If true, the "Other" subject line option will be made available
                 */
                allow_other: boolean
            } | null
            shop_name?: string | null
            shop_integration_id?: number | null
            form_display_mode?: 'show_after_button_click' | 'show_immediately'
        }
        export interface CreateCustomDomainDto {
            hostname: string
        }
        export interface CreateFileIngestionLogDto {
            filename: string
            type: string
            size_bytes: number
            google_storage_url: string
        }
        export interface CreateHelpCenterTranslationDto {
            /**
             * The locale of the translation.
             *
             * It should be in help center's supported locales.
             * example:
             * fr-FR
             */
            locale:
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            /**
             * The SEO meta attributes of the help center in the `locale`'s translation.
             */
            seo_meta: {
                /**
                 * The content of the `<title />` HTML tag for the help center translation.
                 */
                title: string | null
                /**
                 * The content of the `<meta name="description">` HTML tag for the help center translation.
                 */
                description: string | null
            }
            chat_app_key?: string | null
        }
        export interface CreateHelpCenterTranslationSeoMetaDto {
            /**
             * The content of the `<title />` HTML tag for the help center translation.
             */
            title: string | null
            /**
             * The content of the `<meta name="description">` HTML tag for the help center translation.
             */
            description: string | null
        }
        export interface CreateHelpCenterWithAccountIdDto {
            /**
             * example:
             * My Help Center
             */
            name: string
            /**
             * A valid subdomain for the Help center.
             *
             * Should be:
             * - length no greater than 63
             * - must begin and end with an alpha-numeric
             * - may contain hyphens (dashes)
             * - may not begin or end with a hyphen
             *
             * If not provided, a subdomain will be generated.
             * example:
             * mysubdomain
             */
            subdomain?: string
            default_locale:
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            /**
             * Should be a valid URL.
             */
            favicon_url?: string | null
            /**
             * Should be a valid URL.
             */
            brand_logo_url?: string | null
            /**
             * Should be a valid URL.
             */
            brand_logo_light_url?: string | null
            /**
             * Boolean indicating if search feature is deactivated for this Help center.
             * example:
             * false
             */
            search_deactivated?: boolean
            primary_color?: string | null
            theme?: string | null
            shop_name?: string | null
            shop_integration_id?: number | null
            /**
             * Boolean indicating if self service is deactivated for this Help center.
             * example:
             * false
             */
            self_service_deactivated?: boolean
            source?: 'automation' | 'manual'
            gaid?: string | null // GOOGLE_ANALYTICS_ID_REGEXP
            /**
             * Email integration used to receive this contact form inquiries
             * example:
             * {
             *   "id": 1,
             *   "email": "jonh@example.com"
             * }
             */
            email_integration?: {
                /**
                 * Identifier
                 */
                id: number
                /**
                 * Email value
                 */
                email: string
            } | null
            wizard?: {
                /**
                 * example:
                 * automate
                 */
                step_name: string
                step_data?: {
                    /**
                     * example:
                     * ecommerce
                     */
                    platform_type?: 'ecommerce' | 'website'
                } | null
                completed?: boolean | null
            } | null
            type?: 'faq' | 'guidance' | 'snippet'
            /**
             * Boolean indicating if the help center is deactivated.
             * example:
             * false
             */
            deactivated?: boolean
            layout?: 'default' | '1-pager'
            account_id?: number
        }
        export interface CreateNavigationLinkDto {
            /**
             * The label of the navigation link.
             */
            label: string
            /**
             * The URL of the navigation link.
             *
             * Should be an absolute URL with protocol and host.
             * example:
             * https://gorgias.com/pricing
             */
            value: string
            /**
             * The locale of the navigation link.
             *
             * It should be in help center's supported locales.
             * example:
             * fr-FR
             */
            locale:
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            /**
             * The group of the navigation link.
             */
            group: 'footer' | 'header'
            meta?: NavigationLinkMeta
        }
        export interface CreateRedirectDto {
            from: string
            to: string
        }
        export interface CreateShopifyPageEmbedmentDto {
            /**
             * example:
             * 229672878386
             */
            page_external_id?: string
            /**
             * example:
             * /pages/my-new-page
             */
            page_url_path?: string // SHOPIFY_PAGE_HANDLE_REGEX
            position?: 'BOTTOM' | 'TOP'
            /**
             * example:
             * My new page
             */
            title?: string
        }
        export interface CreateSubjectLinesDto {
            /**
             * List of options that will be displayed to the user in the subject line's select dropdown
             * Each option can be from 2 to 50 character long
             * Max 15 options
             */
            options: string[]
            /**
             * If true, the "Other" subject line option will be made available
             */
            allow_other: boolean
        }
        export interface CustomDomain {
            /**
             * Creation date
             */
            created_datetime: string // date-time
            /**
             * Update date
             */
            updated_datetime: string // date-time
            /**
             * Deletion date
             */
            deleted_datetime?: string | null // date-time
            verification_errors?: string[]
            id: number
            hostname: string
            help_center_id: number
            /**
             * The status of this custom domain:
             * - `active`: the custom domain is validated and working
             * - `pending`: the custom domain is pending validation
             * - `unknown`: the custom domain is in an unknown status, check `verification_errors`
             *   to know more.
             */
            status: 'active' | 'pending' | 'unknown'
        }
        export interface CustomDomainsListPageDto {
            meta: PageMetaDto
            object: 'list'
            data: CustomDomain[]
        }
        export interface DeleteAccountDto {
            /**
             * The account id whose help centers should be deleted
             * example:
             * 1
             */
            account_id: number
        }
        export interface EmailContactInfo {
            deactivated_datetime: string | null
            description: string
            email: string
        }
        export interface EmailContactInfoDto {
            email: string
            enabled: boolean
            description: string
        }
        export interface EmailIntegrationDto {
            /**
             * Identifier
             */
            id: number
            /**
             * Email value
             */
            email: string
        }
        export interface EventDataDto {
            actorId: string
            actorRunId: string
        }
        export interface ExtraHTML {
            extra_head: string
            extra_head_deactivated_datetime: string | null // date-time
            custom_header: string
            custom_header_deactivated_datetime: string | null // date-time
            custom_footer: string
            custom_footer_deactivated_datetime: string | null // date-time
        }
        export interface ExtraHTMLDto {
            /**
             * The HTML injected in the head
             *
             * It should be in help center's supported locales.
             * example:
             * <div>....</div>
             */
            extra_head?: string
            /**
             * Boolean indicating if the extra head should be injected.
             * example:
             * false
             */
            extra_head_deactivated?: boolean
            /**
             * The HTML of the custom header
             *
             * It should be in help center's supported locales.
             * example:
             * <div>....</div>
             */
            custom_header?: string
            /**
             * Boolean indicating if the custom header should be injected.
             * example:
             * false
             */
            custom_header_deactivated?: boolean
            /**
             * The HTML of the custom footer
             *
             * It should be in help center's supported locales.
             * example:
             * <div>....</div>
             */
            custom_footer?: string
            /**
             * Boolean indicating if the custom footer should be injected.
             * example:
             * false
             */
            custom_footer_deactivated?: boolean
        }
        export interface FallbackEmailIntegrationDto {
            /**
             * example:
             * 12345
             */
            id: number
            /**
             * example:
             * acme-support@gorgias.xyz
             */
            email: string
        }
        export interface FileIngestionLogDto {
            id: number
            help_center_id: number
            snippets_article_ids: number[]
            filename: string
            type: string
            size_bytes: number
            google_storage_url: string
            status: 'FAILED' | 'PENDING' | 'SUCCESSFUL'
            meta: {
                /**
                 * Gorgias account domain name
                 */
                'x-gorgias-domain': string | null
                /**
                 * UID for this call. e.g. snippet_transformation_{account_name}{help_center_id}_{timestamp}
                 */
                'x-execution-id': string | null
                /**
                 * File type (MIME type) - only for file ingestion
                 */
                file_type?: string
                /**
                 * File size in bytes - only for file ingestion
                 */
                file_size_bytes?: number
            } | null
        }
        export interface GetHelpCenterDto {
            /**
             * Creation date
             */
            created_datetime: string // date-time
            /**
             * Update date
             */
            updated_datetime: string // date-time
            /**
             * Deletion date
             */
            deleted_datetime?: string | null // date-time
            id: number
            /**
             * Unique alphanumerical identifier
             * example:
             * hcuid123
             */
            uid: string
            name: string
            subdomain: string
            deactivated_datetime: string | null // date-time
            default_locale:
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            supported_locales: (
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            )[]
            favicon_url?: string | null
            brand_logo_url?: string | null
            brand_logo_light_url?: string | null
            search_deactivated_datetime: string | null // date-time
            powered_by_deactivated_datetime: string | null // date-time
            algolia_api_key: string | null
            algolia_app_id: string
            algolia_index_name: string
            primary_color: string
            primary_font_family: string
            theme: string
            shop_name: string | null
            shop_integration_id: number | null
            shop_integration?: {
                shop_name: string
                shop_type: 'bigcommerce' | 'magento2' | 'shopify'
                integration_id: number
                account_id: number
            } | null
            self_service_deactivated_datetime: string | null // date-time
            hotswap_session_token: string | null
            source: 'automation' | 'manual'
            gaid: string | null
            email_integration: {
                /**
                 * Identifier
                 */
                id: number
                /**
                 * Email value
                 */
                email: string
            } | null
            /**
             * Automation settings id in help center
             * example:
             * 2
             */
            automation_settings_id: number | null
            /**
             * Code snippet template to use to embed this help center
             */
            code_snippet_template: string
            integration_id: number | null
            wizard?: {
                /**
                 * example:
                 * automate
                 */
                step_name: string
                step_data?: {
                    /**
                     * example:
                     * ecommerce
                     */
                    platform_type?: 'ecommerce' | 'website'
                } | null
                completed?: boolean | null
            } | null
            type: 'faq' | 'guidance' | 'snippet'
            layout: 'default' | '1-pager'
            main_embedment_base_url: string | null
            account_id: number
            translations?: [
                HelpCenterTranslationDto,
                ...HelpCenterTranslationDto[],
            ]
            redirects?: RedirectDto[]
        }
        export interface HelpCenterDto {
            /**
             * Creation date
             */
            created_datetime: string // date-time
            /**
             * Update date
             */
            updated_datetime: string // date-time
            /**
             * Deletion date
             */
            deleted_datetime?: string | null // date-time
            id: number
            /**
             * Unique alphanumerical identifier
             * example:
             * hcuid123
             */
            uid: string
            name: string
            subdomain: string
            deactivated_datetime: string | null // date-time
            default_locale:
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            supported_locales: (
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            )[]
            favicon_url?: string | null
            brand_logo_url?: string | null
            brand_logo_light_url?: string | null
            search_deactivated_datetime: string | null // date-time
            powered_by_deactivated_datetime: string | null // date-time
            algolia_api_key: string | null
            algolia_app_id: string
            algolia_index_name: string
            primary_color: string
            primary_font_family: string
            theme: string
            shop_name: string | null
            shop_integration_id: number | null
            shop_integration?: {
                shop_name: string
                shop_type: 'bigcommerce' | 'magento2' | 'shopify'
                integration_id: number
                account_id: number
            } | null
            self_service_deactivated_datetime: string | null // date-time
            hotswap_session_token: string | null
            source: 'automation' | 'manual'
            gaid: string | null
            email_integration: {
                /**
                 * Identifier
                 */
                id: number
                /**
                 * Email value
                 */
                email: string
            } | null
            /**
             * Automation settings id in help center
             * example:
             * 2
             */
            automation_settings_id: number | null
            /**
             * Code snippet template to use to embed this help center
             */
            code_snippet_template: string
            integration_id: number | null
            wizard?: {
                /**
                 * example:
                 * automate
                 */
                step_name: string
                step_data?: {
                    /**
                     * example:
                     * ecommerce
                     */
                    platform_type?: 'ecommerce' | 'website'
                } | null
                completed?: boolean | null
            } | null
            type: 'faq' | 'guidance' | 'snippet'
            layout: 'default' | '1-pager'
            main_embedment_base_url: string | null
        }
        export interface HelpCenterSiteMapUrlDto {
            url: string
            type: 'article' | 'category' | 'contact_form'
            updated_datetime: string // date-time
            localized_urls: HelpCenterSiteMapUrlLocalizedUrlDto[]
        }
        export interface HelpCenterSiteMapUrlLocalizedUrlDto {
            locale:
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            url: string
        }
        export interface HelpCenterStorePageDto {
            external_id: string
            title: string
            url_path: string
            body_html: string | null
        }
        export interface HelpCenterTranslationDto {
            /**
             * Creation date
             */
            created_datetime: string // date-time
            /**
             * Update date
             */
            updated_datetime: string // date-time
            /**
             * Deletion date
             */
            deleted_datetime?: string | null // date-time
            help_center_id: number
            banner_text: string | null
            banner_image_url?: string | null
            banner_image_vertical_offset: number
            locale:
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            seo_meta: {
                title: string | null
                description: string | null
            }
            contact_info: {
                email: EmailContactInfo
                phone: PhoneContactInfo
                chat: ChatContactInfo
            }
            extra_html: {
                extra_head: string
                extra_head_deactivated_datetime: string | null // date-time
                custom_header: string
                custom_header_deactivated_datetime: string | null // date-time
                custom_footer: string
                custom_footer_deactivated_datetime: string | null // date-time
            }
            chat_app_key: string | null
            contact_form_id: number | null
            logo_hyperlink?: string | null
        }
        export interface HelpCenterTranslationSeoMeta {
            title: string | null
            description: string | null
        }
        export interface HelpCenterTranslationsListPageDto {
            meta: PageMetaDto
            object: 'list'
            data: HelpCenterTranslationDto[]
        }
        export interface HelpCenterWizardDto {
            /**
             * example:
             * automate
             */
            step_name: string
            step_data?: {
                /**
                 * example:
                 * ecommerce
                 */
                platform_type?: 'ecommerce' | 'website'
            } | null
            completed?: boolean | null
        }
        export interface HelpCentersListPageDto {
            meta: PageMetaDto
            object: 'list'
            data: GetHelpCenterDto[]
        }
        export interface HotswapProgressDto {
            progress: 'FAILURE' | 'IN_PROGRESS' | 'NOT_STARTED' | 'SUCCESS'
        }
        export interface HotswapResponseDto {
            /**
             * Session token generated for hotswap widget
             * example:
             * abcdef-abcdef-abcdef-abcdef
             */
            token: string
        }
        export interface HotswapWebhookDto {
            /**
             * Session id generated by hotswap service
             */
            session_id: string
            /**
             * Status of import
             */
            progress: 'FAILURE' | 'IN_PROGRESS' | 'NOT_STARTED' | 'SUCCESS'
        }
        export interface IngestedResourceDto {
            article_ingestion_log_id: number
            scraping_id: string
            snippet_id: string
            execution_id: string
            status: 'disabled' | 'enabled'
            web_pages: string[]
            article_ingestion_log?: ArticleIngestionLogDto
            id: number
            title: string
        }
        export interface IngestedResourceListDataDto {
            article_ingestion_log_id: number
            scraping_id: string
            snippet_id: string
            execution_id: string
            status: 'disabled' | 'enabled'
            web_pages: string[]
            article_ingestion_log?: ArticleIngestionLogDto
            article_id: number
            id: number
            title: string
        }
        export interface IngestedResourceListPageDto {
            meta: PageMetaDto
            object: 'list'
            data: IngestedResourceListDataDto[]
        }
        export interface IngestionLogDto {
            help_center_id: number
            article_ids: number[]
            source_name?: string | null
            raw_text?: string | null
            dataset_id: string | null
            scraping_id?: string | null
            latest_sync?: string | null // date-time
            created_datetime: string // date-time
            id: number
            url: string | null
            domain: string | null
            source: 'domain' | 'file' | 'url'
            status: 'DISABLED' | 'FAILED' | 'PENDING' | 'SUCCESSFUL'
            meta: MLSnippetsIngestionMeta
        }
        export interface IngestionRequestDto {
            url: string
            accountId?: number
            type: 'url' | 'domain'
        }
        export interface KnowledgeStatusDto {
            help_center_id: number
            shop_name: string
            has_public_resources: boolean
            has_external_documents: boolean
            is_store_domain_synced: boolean
        }
        export interface LocalArticleTranslation {
            created_datetime: string // date-time
            updated_datetime: string // date-time
            deleted_datetime?: string | null // date-time
            title: string
            excerpt: string
            content: string
            slug: string
            locale:
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            article_id: number
            category_id: number | null
            article_unlisted_id: string
            seo_meta: {
                title: string | null
                description: string | null
            }
            visibility_status: 'PUBLIC' | 'UNLISTED'
            customer_visibility: 'PUBLIC' | 'UNLISTED'
            is_current: boolean
            draft_version_id: number | null
            published_version_id: number | null
            published_datetime: string | null // date-time
            publisher_user_id: number | null
            commit_message: string | null
            version: number | null
            intents?:
                | (
                      | 'account::deletion'
                      | 'account::login'
                      | 'account::other'
                      | 'account::registration'
                      | 'account::update'
                      | 'exchange::other'
                      | 'exchange::request'
                      | 'exchange::status'
                      | 'feedback::negative'
                      | 'feedback::other'
                      | 'feedback::positive'
                      | 'marketing::advertising'
                      | 'marketing::collaboration'
                      | 'marketing::other'
                      | 'marketing::unsubscribe'
                      | 'order::cancel'
                      | 'order::damaged'
                      | 'order::edit'
                      | 'order::missing item'
                      | 'order::other'
                      | 'order::payment'
                      | 'order::placement'
                      | 'order::refund'
                      | 'order::status'
                      | 'order::wrong item'
                      | 'other::no reply'
                      | 'other::other'
                      | 'other::spam'
                      | 'product::availability'
                      | 'product::customization'
                      | 'product::details'
                      | 'product::other'
                      | 'product::quality issues'
                      | 'product::usage'
                      | 'promotion & discount::information'
                      | 'promotion & discount::issue'
                      | 'promotion & discount::other'
                      | 'return::information'
                      | 'return::other'
                      | 'return::request'
                      | 'return::status'
                      | 'shipping::change address'
                      | 'shipping::delay'
                      | 'shipping::delivered not received'
                      | 'shipping::information'
                      | 'shipping::other'
                      | 'subscription::cancel'
                      | 'subscription::information'
                      | 'subscription::modification'
                      | 'subscription::other'
                      | 'warranty::claim'
                      | 'warranty::information'
                      | 'warranty::other'
                      | 'wholesale::information'
                      | 'wholesale::other'
                  )[]
                | null
            is_intent_usage_enabled?: boolean | null
            use_supporting_content?: boolean | null
            /**
             * Gives details on how the translation fallback was chosen:
             * - `undefined`: the translation is the requested one
             * - `default`: the translation is in help center's default locale
             * - `available`: the translation corresponds to the first available one
             */
            locale_fallback?: 'available' | 'default'
        }
        export interface LocalCategoryTranslation {
            /**
             * Creation date
             */
            created_datetime: string // date-time
            /**
             * Update date
             */
            updated_datetime: string // date-time
            /**
             * Deletion date
             */
            deleted_datetime?: string | null // date-time
            category_id: number
            category_unlisted_id: string
            parent_category_id: number | null
            locale:
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            seo_meta: {
                title: string | null
                description: string | null
            }
            customer_visibility: 'PUBLIC' | 'UNLISTED'
            /**
             * example:
             * https://cdn.shopify.com/image.jpg
             */
            image_url: string | null
            /**
             * Gives details on how the translation fallback was chosen:
             * - `undefined`: the translation is the requested one
             * - `default`: the translation is in help center's default locale
             * - `available`: the translation corresponds to the first available one
             */
            locale_fallback?: 'available' | 'default'
            title: string
            description: string | null
            slug: string
        }
        export interface LocaleDto {
            name: string
            code:
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
        }
        export interface MLSnippetsIngestionMeta {
            /**
             * Gorgias account domain name
             */
            'x-gorgias-domain': string | null
            /**
             * UID for this call. e.g. snippet_transformation_{account_name}{help_center_id}_{timestamp}
             */
            'x-execution-id': string | null
            /**
             * File type (MIME type) - only for file ingestion
             */
            file_type?: string
            /**
             * File size in bytes - only for file ingestion
             */
            file_size_bytes?: number
        }
        export interface MailtoReplacementConfigDto {
            emails: string[]
            contactFormUid: string
            shopifyShopName: string
        }
        export interface MailtoReplacementConfigGetDto {
            emails: string[]
        }
        export interface NavigationLinkDto {
            /**
             * Creation date
             */
            created_datetime: string // date-time
            /**
             * Update date
             */
            updated_datetime: string // date-time
            /**
             * Deletion date
             */
            deleted_datetime?: string | null // date-time
            id: number
            label: string
            value: string
            locale:
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            group: 'footer' | 'header'
            meta?: NavigationLinkMeta
            help_center_id: number
        }
        export interface NavigationLinkMeta {
            network?: 'facebook' | 'instagram' | 'twitter'
        }
        export interface NavigationLinksListPageDto {
            meta: PageMetaDto
            object: 'list'
            data: NavigationLinkDto[]
        }
        export interface OrderManagementVo {
            /**
             * Is order management enabled
             */
            enabled: boolean
        }
        export interface PageEmbedmentDto {
            /**
             * example:
             * 1
             */
            id: number
            /**
             * example:
             * 229672878386
             */
            page_external_id?: string
            /**
             * example:
             * My page title
             */
            page_title: string
            /**
             * example:
             * my-page-title
             */
            page_path_url: string
            position: 'BOTTOM' | 'TOP'
            created_datetime: string // date-time
            updated_datetime: string // date-time
        }
        export interface PageMetaDto {
            /**
             * The current page index.
             * example:
             * 1
             */
            page: number
            /**
             * The number of items returned in this response.
             * example:
             * 20
             */
            per_page: number
            /**
             * The path to the current page.
             * example:
             * /my-items?page=1&per_page=20
             */
            current_page: string
            /**
             * The total count of items.
             * example:
             * 32
             */
            item_count: number
            /**
             * The number of pages in this pagination.
             * example:
             * 3
             */
            nb_pages: number
            /**
             * The path to the next page.
             *
             * If none, there is no next page.
             * example:
             * /my-items?page=2&per_page=20
             */
            next_page?: string
        }
        export interface PhoneContactInfo {
            deactivated_datetime: string | null
            description: string
            phone_numbers: ContactPhoneNumber[]
        }
        export interface PhoneContactInfoDto {
            phone_numbers: ContactPhoneNumberDto[]
            enabled: boolean
            description: string
        }
        export interface ProcessCsvRequestDto {
            /**
             * Configuration for importing the CSV file.
             */
            file_url: string
            article_columns: ArticleColumns
            category_columns: CategoryColumns
        }
        export interface ProcessCsvResponseDto {
            /**
             * example:
             * {
             *   "status": "SUCCESS",
             *   "num_imported_rows": 100
             * }
             */
            report: /**
             * example:
             * {
             *   "status": "SUCCESS",
             *   "num_imported_rows": 100
             * }
             */
            | ProcessCsvResponseSuccessDto
                | ProcessCsvResponsePartialDto
                | ProcessCsvResponseFailedDto
        }
        export interface ProcessCsvResponseFailedDto {
            /**
             * example:
             * FAILED
             */
            status: 'FAILED'
            failed_reason?: string
        }
        export interface ProcessCsvResponsePartialDto {
            /**
             * example:
             * PARTIAL
             */
            status: 'PARTIAL'
            num_imported_csv_rows: number
            num_erroneous_csv_rows: number
            erroneous_csv_rows_file_url?: string
        }
        export interface ProcessCsvResponseSuccessDto {
            /**
             * example:
             * SUCCESS
             */
            status: 'SUCCESS'
            num_imported_csv_rows: number
        }
        export interface PurgeCacheContactFormDto {
            shop_name: string
        }
        export interface Rating {
            up: number
            down: number
        }
        export interface RatingContextDto {
            ip_address: string
            user_agent: string
        }
        export interface RebaseArticleTranslationDto {
            /**
             * The list of intents to publish on top of the currently published version.
             */
            intents: (
                | 'account::deletion'
                | 'account::login'
                | 'account::other'
                | 'account::registration'
                | 'account::update'
                | 'exchange::other'
                | 'exchange::request'
                | 'exchange::status'
                | 'feedback::negative'
                | 'feedback::other'
                | 'feedback::positive'
                | 'marketing::advertising'
                | 'marketing::collaboration'
                | 'marketing::other'
                | 'marketing::unsubscribe'
                | 'order::cancel'
                | 'order::damaged'
                | 'order::edit'
                | 'order::missing item'
                | 'order::other'
                | 'order::payment'
                | 'order::placement'
                | 'order::refund'
                | 'order::status'
                | 'order::wrong item'
                | 'other::no reply'
                | 'other::other'
                | 'other::spam'
                | 'product::availability'
                | 'product::customization'
                | 'product::details'
                | 'product::other'
                | 'product::quality issues'
                | 'product::usage'
                | 'promotion & discount::information'
                | 'promotion & discount::issue'
                | 'promotion & discount::other'
                | 'return::information'
                | 'return::other'
                | 'return::request'
                | 'return::status'
                | 'shipping::change address'
                | 'shipping::delay'
                | 'shipping::delivered not received'
                | 'shipping::information'
                | 'shipping::other'
                | 'subscription::cancel'
                | 'subscription::information'
                | 'subscription::modification'
                | 'subscription::other'
                | 'warranty::claim'
                | 'warranty::information'
                | 'warranty::other'
                | 'wholesale::information'
                | 'wholesale::other'
            )[]
            /**
             * The ID of the user publishing this translation. Required when using API key authentication.
             */
            publisher_user_id?: number
            /**
             * Optional commit message describing the publication.
             */
            commit_message?: string
        }
        export interface RedirectDto {
            /**
             * Creation date
             */
            created_datetime: string // date-time
            /**
             * Update date
             */
            updated_datetime: string // date-time
            /**
             * Deletion date
             */
            deleted_datetime?: string | null // date-time
            id: number
            from: string
            to: string
            help_center_id: number
        }
        export interface ResourceDto {
            id: string
            actId: string
            userId: string
            startedAt: string
            finishedAt: string
            status: string
            statusMessage: string
            isStatusMessageTerminal: boolean
            meta: {
                [key: string]: any
            }
            stats: {
                [key: string]: any
            }
            options: {
                [key: string]: any
            }
            buildId: string
            exitCode: number
            defaultKeyValueStoreId: string
            defaultDatasetId: string
            defaultRequestQueueId: string
            buildNumber: string
            containerUrl: string
            usage: {
                [key: string]: any
            }
            usageTotalUsd: number
            usageUsd: {
                [key: string]: any
            }
        }
        export interface RetrieveFileIngestionLogDto {
            id: number
            help_center_id: number
            snippets_article_ids: number[]
            filename: string
            google_storage_url: string
            status: 'FAILED' | 'PENDING' | 'SUCCESSFUL'
            uploaded_datetime: string // date-time
        }
        export interface ShopIntegrationDto {
            shop_name: string
            shop_type: 'bigcommerce' | 'magento2' | 'shopify'
            integration_id: number
            account_id: number
        }
        export interface ShopIntegrationMappingsDto {
            /**
             * The name of the channel (help-center or contact-form)
             */
            channel_name: string
            /**
             * The integration ID of the channel
             */
            channel_integration_id: number
            /**
             * The integration_id from shop_integration
             */
            shop_integration_id: number
            /**
             * The name of the shop
             */
            shop_name: string
            /**
             * The type of the shop
             */
            shop_type: string
            /**
             * The id of the channel (help-center or contact-form)
             */
            channel_id: number
        }
        export interface SignedPostPolicyDto {
            url: string
            fields: {
                [key: string]: any
            }
        }
        export interface StartIngestionResponseDto {
            scraping_id: string
        }
        export interface SubjectLinesDto {
            /**
             * List of options that will be displayed to the user in the subject line's select dropdown
             * Each option can be from 2 to 50 character long
             * Max 15 options
             */
            options: string[]
            /**
             * If true, the "Other" subject line option will be made available
             */
            allow_other: boolean
        }
        export interface UpdateArticleDto {
            category_id?: number | null
        }
        export interface UpdateArticleTranslationDto {
            /**
             * The title of the article in the `locale`'s translation.
             * example:
             * How to cancel an order
             */
            title?: string
            /**
             * The excerpt of the article in the `locale`'s translation.
             * example:
             * Explains how to cancel an order
             */
            excerpt?: string
            /**
             * The content of the article in the `locale`'s translation.
             *
             * Supports HTML formatted content.
             * example:
             * I can be <strong>HTML</strong>
             */
            content?: string
            /**
             * A slug for the article that'll be used to construct article's URLs.
             *
             * Should only contains alphanumeric values and hyphens.
             * example:
             * cancel-an-order
             */
            slug?: string
            /**
             * The SEO meta attributes of the article in the `locale`'s translation.
             */
            seo_meta?: {
                /**
                 * The content of the `<title />` HTML tag for the article translation.
                 */
                title: string | null
                /**
                 * The content of the `<meta name="description">` HTML tag for the article translation.
                 */
                description: string | null
            }
            /**
             * This field describes whether the translation is going to be published or not, and it defaults to true. If true, it means it will be the published version; if previously it was only in draft, it will become published. If false, it will be the draft version and therefore, unpublished.
             * example:
             * "false" it means it is a draft version
             */
            is_current?: boolean
            /**
             * A short description of the changes in this version. Only stored when publishing (isCurrent=true).
             * example:
             * Updated pricing information
             */
            commit_message?: string
            /**
             * The visibility status of the article.
             */
            visibility_status?: 'PUBLIC' | 'UNLISTED'
            /**
             * The customer-facing visibility of the article.
             *
             * When provided, this value is used directly instead of being derived
             * from `visibility_status` and the article's `sourceType`.
             * When omitted, `customer_visibility` is derived automatically.
             */
            customer_visibility?: 'PUBLIC' | 'UNLISTED'
            /**
             * Used to change the categoryId of the article
             */
            category_id?: number | null
            /**
             * The list of intents linked to this article translation.
             * example:
             * [
             *   "order::status",
             *   "order::refund"
             * ]
             */
            intents?: (
                | 'account::deletion'
                | 'account::login'
                | 'account::other'
                | 'account::registration'
                | 'account::update'
                | 'exchange::other'
                | 'exchange::request'
                | 'exchange::status'
                | 'feedback::negative'
                | 'feedback::other'
                | 'feedback::positive'
                | 'marketing::advertising'
                | 'marketing::collaboration'
                | 'marketing::other'
                | 'marketing::unsubscribe'
                | 'order::cancel'
                | 'order::damaged'
                | 'order::edit'
                | 'order::missing item'
                | 'order::other'
                | 'order::payment'
                | 'order::placement'
                | 'order::refund'
                | 'order::status'
                | 'order::wrong item'
                | 'other::no reply'
                | 'other::other'
                | 'other::spam'
                | 'product::availability'
                | 'product::customization'
                | 'product::details'
                | 'product::other'
                | 'product::quality issues'
                | 'product::usage'
                | 'promotion & discount::information'
                | 'promotion & discount::issue'
                | 'promotion & discount::other'
                | 'return::information'
                | 'return::other'
                | 'return::request'
                | 'return::status'
                | 'shipping::change address'
                | 'shipping::delay'
                | 'shipping::delivered not received'
                | 'shipping::information'
                | 'shipping::other'
                | 'subscription::cancel'
                | 'subscription::information'
                | 'subscription::modification'
                | 'subscription::other'
                | 'warranty::claim'
                | 'warranty::information'
                | 'warranty::other'
                | 'wholesale::information'
                | 'wholesale::other'
            )[]
            /**
             * Whether intent-based usage is enabled for this article translation.
             * example:
             * true
             */
            is_intent_usage_enabled?: boolean
            /**
             * Whether the article content can be used as supporting content for AI responses.
             * example:
             * true
             */
            use_supporting_content?: boolean
            /**
             * The ID of the user publishing this translation. Required when authenticating with an API key. When using token authentication, this field is ignored and the user ID is extracted from the token.
             * example:
             * 12345
             */
            publisher_user_id?: number
        }
        export interface UpdateArticleTranslationRatingDto {
            /**
             * The rating of the article translation.
             * example:
             * -1
             */
            rating: '-1' | '1'
            /**
             * The context of the client.
             * example:
             * "{"ip_address": "89.912.12.11", "user_agent": "Chrome"}"
             */
            context: {
                [key: string]: any
            }
        }
        export interface UpdateCategoryTranslationDto {
            /**
             * If the parent_category_is set to null change the category's parent to the root category
             * If it's set to a number set it to that specific category
             * If the property is not set, don't change anything
             */
            parent_category_id?: number | null
            /**
             * The title of the category in the `locale`'s translation.
             * example:
             * Orders
             */
            title?: string
            /**
             * The description of the category in the `locale`'s translation.
             * example:
             * Information about orders
             */
            description?: string | null
            /**
             * A slug for the category that'll be used to construct category's URLs.
             *
             * Should only contains alphanumeric values and hyphens.
             * example:
             * orders
             */
            slug?: string
            /**
             * The SEO meta attributes of the category in the `locale`'s translation.
             */
            seo_meta?: {
                /**
                 * The content of the `<title />` HTML tag for the category translation.
                 */
                title: string | null
                /**
                 * The content of the `<meta name="description">` HTML tag for the category translation.
                 */
                description: string | null
            }
            /**
             * The customer-facing visibility of the category.
             */
            customer_visibility?: 'PUBLIC' | 'UNLISTED'
            /**
             * Category image URL
             * example:
             * https://cdn.shopify.com/image.jpg
             */
            image_url?: string | null
        }
        export interface UpdateContactFormDto {
            /**
             * Name of the Contact Form
             * example:
             * My Contact Form
             */
            name?: string
            /**
             * Contact Form default locale
             * example:
             * en-US
             */
            default_locale?:
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            /**
             * Email integration used to receive this contact form inquiries
             * example:
             * {
             *   "id": 1,
             *   "email": "jonh@example.com"
             * }
             */
            email_integration?: {
                /**
                 * Identifier
                 */
                id: number
                /**
                 * Email value
                 */
                email: string
            }
            /**
             * example:
             * {
             *   "options": [
             *     "Order status",
             *     "Feedback",
             *     "Report an issue",
             *     "Product questions",
             *     "Request refund or discount"
             *   ],
             *   "allow_other": true
             * }
             */
            subject_lines?: {
                /**
                 * List of options that will be displayed to the user in the subject line's select dropdown
                 * Each option can be from 2 to 50 character long
                 * Max 15 options
                 */
                options: string[]
                /**
                 * If true, the "Other" subject line option will be made available
                 */
                allow_other: boolean
            } | null
            shop_name?: string | null
            shop_integration_id?: number | null
            form_display_mode?: 'show_after_button_click' | 'show_immediately'
            deactivated_datetime?: string | null // date-time
            extra_html?: {
                extra_head: string
                extra_head_deactivated_datetime: string | null // date-time
            } | null
        }
        export interface UpdateEmailIntegrationDto {
            /**
             * The account id whose help centers should be deleted
             * example:
             * 1
             */
            account_id: number
            /**
             * The target email integration id
             * example:
             * 2
             */
            deactivated_integration_id: number
            fallback_integration: FallbackEmailIntegrationDto
        }
        export interface UpdateExtraHTMLDto {
            /**
             * The HTML injected in the head
             *
             * It should be in help center's supported locales.
             * example:
             * <div>....</div>
             */
            extra_head?: string
            /**
             * Boolean indicating if the extra head should be injected.
             * example:
             * false
             */
            extra_head_deactivated?: boolean
            /**
             * The HTML of the custom header
             *
             * It should be in help center's supported locales.
             * example:
             * <div>....</div>
             */
            custom_header?: string
            /**
             * Boolean indicating if the custom header should be injected.
             * example:
             * false
             */
            custom_header_deactivated?: boolean
            /**
             * The HTML of the custom footer
             *
             * It should be in help center's supported locales.
             * example:
             * <div>....</div>
             */
            custom_footer?: string
            /**
             * Boolean indicating if the custom footer should be injected.
             * example:
             * false
             */
            custom_footer_deactivated?: boolean
        }
        export interface UpdateHelpCenterDto {
            /**
             * example:
             * My Help Center
             */
            name?: string
            /**
             * A valid subdomain for the Help center.
             *
             * Should be:
             * - length no greater than 63
             * - must begin and end with an alpha-numeric
             * - may contain hyphens (dashes)
             * - may not begin or end with a hyphen
             *
             * If not provided, a subdomain will be generated.
             * example:
             * mysubdomain
             */
            subdomain?: string
            default_locale?:
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            /**
             * Should be a valid URL.
             */
            favicon_url?: string | null
            /**
             * Should be a valid URL.
             */
            brand_logo_url?: string | null
            /**
             * Should be a valid URL.
             */
            brand_logo_light_url?: string | null
            /**
             * Boolean indicating if search feature is deactivated for this Help center.
             * example:
             * false
             */
            search_deactivated?: boolean
            primary_color?: string | null
            theme?: string | null
            shop_name?: string | null
            shop_integration_id?: number | null
            /**
             * Boolean indicating if self service is deactivated for this Help center.
             * example:
             * false
             */
            self_service_deactivated?: boolean
            gaid?: string | null // GOOGLE_ANALYTICS_ID_REGEXP
            /**
             * Email integration used to receive this contact form inquiries
             * example:
             * {
             *   "id": 1,
             *   "email": "jonh@example.com"
             * }
             */
            email_integration?: {
                /**
                 * Identifier
                 */
                id: number
                /**
                 * Email value
                 */
                email: string
            } | null
            wizard?: {
                /**
                 * example:
                 * automate
                 */
                step_name: string
                step_data?: {
                    /**
                     * example:
                     * ecommerce
                     */
                    platform_type?: 'ecommerce' | 'website'
                } | null
                completed?: boolean | null
            } | null
            /**
             * Boolean indicating if the help center is deactivated.
             * example:
             * false
             */
            deactivated?: boolean
            layout?: 'default' | '1-pager'
            /**
             * Boolean indicating if "Powered By Gorgias" will be displayed in this help center footer
             * example:
             * false
             */
            powered_by_deactivated?: boolean
            primary_font_family?: string | null
        }
        export interface UpdateHelpCenterTranslationDto {
            /**
             * The SEO meta attributes of the help center in the `locale`'s translation.
             */
            seo_meta?: {
                /**
                 * The content of the `<title />` HTML tag for the help center translation.
                 */
                title: string | null
                /**
                 * The content of the `<meta name="description">` HTML tag for the help center translation.
                 */
                description: string | null
            }
            chat_app_key?: string | null
            /**
             * The banner text of the help center in the `locale`'s translation.
             */
            banner_text?: string | null
            banner_image_url?: string | null
            banner_image_vertical_offset?: number
            contact_info?: ContactInfoDto
            extra_html?: ExtraHTMLDto
            logo_hyperlink?: string | null
        }
        export interface UpdateIngestedResourceDto {
            status: 'disabled' | 'enabled'
        }
        export interface UpdateNavigationLinkDto {
            /**
             * The label of the navigation link.
             */
            label?: string
            /**
             * The URL of the navigation link.
             *
             * Should be an absolute URL with protocol and host.
             * example:
             * https://gorgias.com/pricing
             */
            value?: string
            /**
             * The group of the navigation link.
             */
            group?: 'footer' | 'header'
            meta?: NavigationLinkMeta
        }
        export interface UpdatePageEmbedmentDto {
            position: 'BOTTOM' | 'TOP'
        }
        export interface UploadAttachmentDto {
            file: AttachmentFileDto
            channel: AttachmentChannelDto
        }
        export interface UpsertArticleTemplateReviewDto {
            template_key: string
            action:
                | 'archive'
                | 'dismissFromTopQuestions'
                | 'publish'
                | 'saveAsDraft'
            reason?: string | null
        }
        export interface UpsertAutomationSettingsDto {
            /**
             * example:
             * [
             *   {
             *     "id": "workflowId",
             *     "enabled": true
             *   }
             * ]
             */
            workflows?: WorkflowVo[]
            /**
             * example:
             * {
             *   "enabled": true
             * }
             */
            order_management?: {
                /**
                 * Is order management enabled
                 */
                enabled: boolean
            }
        }
        export interface UpsertMailtoReplacementConfigDto {
            emails: string[]
        }
        export interface WizardStepDataVo {
            /**
             * example:
             * ecommerce
             */
            platform_type?: 'ecommerce' | 'website'
        }
        export interface WorkflowHandoverDto {
            contact_form_uid?: string
            help_center_id?: number
            locale:
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            workflow_entrypoint_label: string
            workflow_configuration_id: string
            workflow_execution_id: string
            conversation: WorkflowHandoverMessageDto[]
            sender_email: string
            url: string
            ticket_tags?: string[] | null
            ticket_assignee_team_id?: number | null
            ticket_assignee_user_id?: number | null
        }
        export interface WorkflowHandoverMessageAttachmentDto {
            url: string
            name: string
            size: number | null
            content_type: string
            extra?: WorkflowHandoverMessageAttachmentExtraDto
        }
        export interface WorkflowHandoverMessageAttachmentExtraDto {
            product_id: number
            variant_id: number
            price?: string
            variant_name?: string
            product_link: string
            currency?: string
            featured_image: string
        }
        export interface WorkflowHandoverMessageDto {
            subject?: string
            body_html?: string
            body_text?: string
            attachments: WorkflowHandoverMessageAttachmentDto[]
            from_agent: boolean
            sent_datetime?: string
        }
        export interface WorkflowVo {
            /**
             * Workflow identifier
             */
            id: string
            /**
             * Is workflow enabled
             */
            enabled: boolean
        }
    }
}
declare namespace Paths {
    namespace AnalyseCsv {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export type RequestBody = Components.Schemas.AnalyseCsvRequestDto
        namespace Responses {
            export type $200 = Components.Schemas.AnalyseCsvResponseDto
        }
    }
    namespace BatchGetArticlesSourceType {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export type RequestBody = Components.Schemas.BatchArticlesRequestDto
        namespace Responses {
            export type $200 = Components.Schemas.ArticleSourceTypeResponseDto[]
        }
    }
    namespace BulkCopyArticles {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export type RequestBody = Components.Schemas.BulkCopyArticlesRequestDto
        namespace Responses {
            export interface $200 {
                /**
                 * Number of articles successfully copied
                 */
                copied_count?: number
            }
        }
    }
    namespace BulkDeleteArticles {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export type RequestBody =
            Components.Schemas.BatchDeleteArticlesRequestDto
        namespace Responses {
            export interface $200 {
                /**
                 * Number of articles successfully deleted
                 */
                deleted_count?: number
            }
        }
    }
    namespace BulkUpdateArticleTranslationsVisibility {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export type RequestBody =
            Components.Schemas.BatchUpdateArticleTranslationsVisibilityRequestDto
        namespace Responses {
            export interface $200 {
                /**
                 * List of articles that were updated
                 */
                articles?: {
                    /**
                     * Article ID
                     */
                    id?: number
                }[]
            }
        }
    }
    namespace CheckContactFormNameExists {
        namespace Parameters {
            export type InputName = string
        }
        export interface PathParameters {
            input_name: Parameters.InputName
        }
        namespace Responses {
            export interface $204 {}
        }
    }
    namespace CheckCustomDomainStatus {
        namespace Parameters {
            export type HelpCenterId = number
            export type Hostname = string
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            hostname: Parameters.Hostname
        }
        namespace Responses {
            export type $200 = Components.Schemas.CustomDomain
        }
    }
    namespace CheckHelpCenterWithSubdomainExists {
        namespace Parameters {
            export type Subdomain = string
        }
        export interface PathParameters {
            subdomain: Parameters.Subdomain
        }
        namespace Responses {
            export interface $204 {}
        }
    }
    namespace Complete {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export type RequestBody = Components.Schemas.HotswapWebhookDto
        namespace Responses {
            export interface $201 {}
        }
    }
    namespace ContactFormPurgeCache {
        export type RequestBody = Components.Schemas.PurgeCacheContactFormDto
        namespace Responses {
            export interface $201 {}
        }
    }
    namespace CopyArticle {
        namespace Parameters {
            export type HelpCenterId = number
            export type Id = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            id: Parameters.Id
        }
        namespace Responses {
            export type $201 = Components.Schemas.ArticleWithLocalTranslation
        }
    }
    namespace CreateAccessToken {
        namespace Responses {
            export type $201 = Components.Schemas.AccessTokenDto
        }
    }
    namespace CreateArticle {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export type RequestBody = Components.Schemas.CreateArticleDto
        namespace Responses {
            export type $201 = Components.Schemas.ArticleWithLocalTranslation
        }
    }
    namespace CreateArticleTranslation {
        namespace Parameters {
            export type ArticleId = number
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            article_id: Parameters.ArticleId
        }
        export type RequestBody = Components.Schemas.CreateArticleTranslationDto
        namespace Responses {
            export type $201 = Components.Schemas.ArticleTranslationResponseDto
        }
    }
    namespace CreateArticleTranslationRating {
        namespace Parameters {
            export type ArticleId = number
            export type HelpCenterId = number
            export type Locale = string
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            article_id: Parameters.ArticleId
            locale: Parameters.Locale
        }
        export type RequestBody =
            Components.Schemas.CreateArticleTranslationRatingDto
        namespace Responses {
            export type $201 = Components.Schemas.ArticleTranslationRatingDto
        }
    }
    namespace CreateCategory {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export type RequestBody = Components.Schemas.CreateCategoryDto
        namespace Responses {
            export type $201 =
                Components.Schemas.CategoryWithLocalTranslationDto
        }
    }
    namespace CreateCategoryTranslation {
        namespace Parameters {
            export type CategoryId = number
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            category_id: Parameters.CategoryId
        }
        export type RequestBody =
            Components.Schemas.CreateCategoryTranslationDto
        namespace Responses {
            export type $201 = Components.Schemas.CategoryTranslationDto
        }
    }
    namespace CreateContactForm {
        export type RequestBody = Components.Schemas.CreateContactFormDto
        namespace Responses {
            export type $201 = Components.Schemas.ContactFormDto
        }
    }
    namespace CreateContactFormShopifyPageEmbedment {
        namespace Parameters {
            export type ContactFormId = number
        }
        export interface PathParameters {
            contact_form_id: Parameters.ContactFormId
        }
        export type RequestBody =
            Components.Schemas.CreateShopifyPageEmbedmentDto
        namespace Responses {
            export type $201 = Components.Schemas.PageEmbedmentDto
        }
    }
    namespace CreateCustomDomain {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export type RequestBody = Components.Schemas.CreateCustomDomainDto
        namespace Responses {
            export type $201 = Components.Schemas.CustomDomain
        }
    }
    namespace CreateFileIngestion {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export type RequestBody = Components.Schemas.CreateFileIngestionLogDto
        namespace Responses {
            export type $201 = Components.Schemas.FileIngestionLogDto
        }
    }
    namespace CreateHelpCenter {
        export type RequestBody =
            Components.Schemas.CreateHelpCenterWithAccountIdDto
        namespace Responses {
            export type $200 = Components.Schemas.HelpCenterDto
        }
    }
    namespace CreateHelpCenterShopifyPageEmbedment {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export type RequestBody =
            Components.Schemas.CreateShopifyPageEmbedmentDto
        namespace Responses {
            export type $201 = Components.Schemas.PageEmbedmentDto
        }
    }
    namespace CreateHelpCenterTranslation {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export type RequestBody =
            Components.Schemas.CreateHelpCenterTranslationDto
        namespace Responses {
            export type $201 = Components.Schemas.HelpCenterTranslationDto
        }
    }
    namespace CreateHotswapSessionToken {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        namespace Responses {
            export type $201 = Components.Schemas.HotswapResponseDto
        }
    }
    namespace CreateNavigationLink {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export type RequestBody = Components.Schemas.CreateNavigationLinkDto
        namespace Responses {
            export type $201 = Components.Schemas.NavigationLinkDto
        }
    }
    namespace CreateRedirect {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export type RequestBody = Components.Schemas.CreateRedirectDto
        namespace Responses {
            export type $201 = Components.Schemas.RedirectDto
        }
    }
    namespace DeleteAccountHelpCenters {
        export type RequestBody = Components.Schemas.DeleteAccountDto
        namespace Responses {
            export interface $201 {}
        }
    }
    namespace DeleteArticle {
        namespace Parameters {
            export type HelpCenterId = number
            export type Id = number
        }
        export interface PathParameters {
            id: Parameters.Id
            help_center_id: Parameters.HelpCenterId
        }
        namespace Responses {
            export interface $200 {}
        }
    }
    namespace DeleteArticleIngestionLog {
        namespace Parameters {
            export type ArticleIngestionLogId = number
            export type HelpCenterId = number
        }
        export interface PathParameters {
            article_ingestion_log_id: Parameters.ArticleIngestionLogId
            help_center_id: Parameters.HelpCenterId
        }
        namespace Responses {
            export interface $204 {}
        }
    }
    namespace DeleteArticleTranslation {
        namespace Parameters {
            export type ArticleId = number
            export type HelpCenterId = number
            export type Locale = string
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            article_id: Parameters.ArticleId
            locale: Parameters.Locale
        }
        namespace Responses {
            export interface $200 {}
        }
    }
    namespace DeleteArticleTranslationDraft {
        namespace Parameters {
            export type ArticleId = number
            export type HelpCenterId = number
            export type Locale = string
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            article_id: Parameters.ArticleId
            locale: Parameters.Locale
        }
        namespace Responses {
            export type $200 = Components.Schemas.ArticleTranslationResponseDto
            export interface $204 {}
        }
    }
    namespace DeleteArticleTranslationRating {
        namespace Parameters {
            export type HelpCenterId = number
            export type RatingId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            ratingId: Parameters.RatingId
        }
        namespace Responses {
            export interface $200 {}
        }
    }
    namespace DeleteCategory {
        namespace Parameters {
            export type HelpCenterId = number
            export type Id = number
        }
        export interface PathParameters {
            id: Parameters.Id
            help_center_id: Parameters.HelpCenterId
        }
        namespace Responses {
            export interface $200 {}
        }
    }
    namespace DeleteCategoryArticles {
        namespace Parameters {
            export type CategoryId = number
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            category_id: Parameters.CategoryId
        }
        namespace Responses {
            export interface $200 {}
        }
    }
    namespace DeleteCategoryTranslation {
        namespace Parameters {
            export type CategoryId = number
            export type HelpCenterId = number
            export type Locale = string
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            category_id: Parameters.CategoryId
            locale: Parameters.Locale
        }
        namespace Responses {
            export interface $200 {}
        }
    }
    namespace DeleteContactForm {
        namespace Parameters {
            export type Id = number
        }
        export interface PathParameters {
            id: Parameters.Id
        }
        namespace Responses {
            export interface $204 {}
        }
    }
    namespace DeleteContactFormShopifyPageEmbedment {
        namespace Parameters {
            export type ContactFormId = number
            export type EmbedmentId = number
        }
        export interface PathParameters {
            embedment_id: Parameters.EmbedmentId
            contact_form_id: Parameters.ContactFormId
        }
        namespace Responses {
            export interface $204 {}
        }
    }
    namespace DeleteCustomDomain {
        namespace Parameters {
            export type HelpCenterId = number
            export type Hostname = string
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            hostname: Parameters.Hostname
        }
        namespace Responses {
            export interface $200 {}
        }
    }
    namespace DeleteFileIngestion {
        namespace Parameters {
            export type FileIngestionId = number
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            file_ingestion_id: Parameters.FileIngestionId
        }
        namespace Responses {
            export type $200 = Components.Schemas.FileIngestionLogDto
        }
    }
    namespace DeleteHelpCenter {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        namespace Responses {
            export interface $200 {}
        }
    }
    namespace DeleteHelpCenterShopifyPageEmbedment {
        namespace Parameters {
            export type EmbedmentId = number
            export type HelpCenterId = number
        }
        export interface PathParameters {
            embedment_id: Parameters.EmbedmentId
            help_center_id: Parameters.HelpCenterId
        }
        namespace Responses {
            export interface $204 {}
        }
    }
    namespace DeleteHelpCenterTranslation {
        namespace Parameters {
            export type HelpCenterId = number
            export type Locale = string
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            locale: Parameters.Locale
        }
        namespace Responses {
            export interface $200 {}
        }
    }
    namespace DeleteNavigationLink {
        namespace Parameters {
            export type HelpCenterId = number
            export type Id = number
        }
        export interface PathParameters {
            id: Parameters.Id
            help_center_id: Parameters.HelpCenterId
        }
        namespace Responses {
            export interface $200 {}
        }
    }
    namespace DeleteRedirect {
        namespace Parameters {
            export type From = string
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export interface QueryParameters {
            from: Parameters.From
        }
        namespace Responses {
            export interface $200 {}
        }
    }
    namespace DuplicateHelpCenter {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        namespace Responses {
            export type $200 = Components.Schemas.HelpCenterDto
        }
    }
    namespace GenerateCsvTemplate {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        namespace Responses {
            export type $200 = string
        }
    }
    namespace GetAccountInfo {
        namespace Parameters {
            export type CustomDomain = string
            export type Subdomain = string
        }
        export interface QueryParameters {
            custom_domain?: Parameters.CustomDomain
            subdomain?: Parameters.Subdomain
        }
        namespace Responses {
            export type $200 = Components.Schemas.AccountInfoDto
        }
    }
    namespace GetArticle {
        namespace Parameters {
            export type HelpCenterId = number
            export type Id = number
            export type Locale =
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            export type LocaleFallback = boolean
            export type VersionStatus = 'current' | 'latest_draft'
            export type WithIngestion = boolean
        }
        export interface PathParameters {
            id: Parameters.Id
            help_center_id: Parameters.HelpCenterId
        }
        export interface QueryParameters {
            version_status?: Parameters.VersionStatus
            with_ingestion?: Parameters.WithIngestion
            locale: Parameters.Locale
            locale_fallback?: Parameters.LocaleFallback
        }
        namespace Responses {
            export type $200 = Components.Schemas.ArticleWithLocalTranslation
        }
    }
    namespace GetArticleIngestionArticleTitlesAndStatus {
        namespace Parameters {
            export type AccountId = any
            export type ArticleIngestionId = number
            export type HelpCenterId = number
        }
        export interface PathParameters {
            article_ingestion_id: Parameters.ArticleIngestionId
            help_center_id: Parameters.HelpCenterId
        }
        export interface QueryParameters {
            account_id?: Parameters.AccountId
        }
        namespace Responses {
            export type $200 = {
                id?: number
                title?: string
                visibilityStatus?: string
            }[]
        }
    }
    namespace GetArticleIngestionLogs {
        namespace Parameters {
            export type AccountId = any
            export type HelpCenterId = number
            export type Ids = number[]
            export type Sources = ('domain' | 'file' | 'url')[]
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export interface QueryParameters {
            sources?: Parameters.Sources
            ids?: Parameters.Ids
            account_id?: Parameters.AccountId
        }
        namespace Responses {
            export type $200 = Components.Schemas.ArticleIngestionLogDto[]
        }
    }
    namespace GetArticleTemplate {
        namespace Parameters {
            export type Locale =
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            export type TemplateKey =
                | 'applyDiscount'
                | 'cancelMembership'
                | 'cancellationPolicy'
                | 'damagedItem'
                | 'editOrder'
                | 'expeditedShipping'
                | 'freeShipping'
                | 'howLongDelivery'
                | 'howToCancelOrder'
                | 'howToReturn'
                | 'howToTrackOrder'
                | 'loginIssue'
                | 'missingDelivery'
                | 'packageLostOrDamaged'
                | 'refundPolicy'
                | 'refundTiming'
                | 'refundsOrExchanges'
                | 'rewards'
                | 'shippingCost'
                | 'shippingPolicy'
                | 'skipShipment'
                | 'startReturn'
                | 'trackOrder'
                | 'updateSubscription'
                | 'worldwideShipping'
                | 'wrongItem'
        }
        export interface PathParameters {
            template_key: Parameters.TemplateKey
        }
        export interface QueryParameters {
            locale: Parameters.Locale
        }
        namespace Responses {
            export type $200 = Components.Schemas.ArticleTemplateDto
        }
    }
    namespace GetArticleTranslationIntents {
        namespace Parameters {
            export type ArticleId = number
            export type HelpCenterId = number
            export type Locale = string
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            article_id: Parameters.ArticleId
            locale: Parameters.Locale
        }
        namespace Responses {
            export type $200 =
                Components.Schemas.ArticleTranslationIntentsResponseDto
        }
    }
    namespace GetArticleTranslationVersion {
        namespace Parameters {
            export type ArticleId = number
            export type HelpCenterId = number
            export type Locale = string
            export type VersionId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            article_id: Parameters.ArticleId
            locale: Parameters.Locale
            version_id: Parameters.VersionId
        }
        namespace Responses {
            export type $200 =
                Components.Schemas.ArticleTranslationVersionResponseDto
            export interface $404 {}
        }
    }
    namespace GetAttachmentUploadPolicy {
        namespace Parameters {
            export type IsPrivate = string
        }
        export interface QueryParameters {
            is_private?: Parameters.IsPrivate
        }
        export type RequestBody = Components.Schemas.UploadAttachmentDto
        namespace Responses {
            export type $201 = Components.Schemas.SignedPostPolicyDto
        }
    }
    namespace GetCategoriesPositions {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        namespace Responses {
            export type $200 = number[]
        }
    }
    namespace GetCategory {
        namespace Parameters {
            export type HelpCenterId = number
            export type Id = number
            export type Locale =
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            export type LocaleFallback = boolean
        }
        export interface PathParameters {
            id: Parameters.Id
            help_center_id: Parameters.HelpCenterId
        }
        export interface QueryParameters {
            locale: Parameters.Locale
            locale_fallback?: Parameters.LocaleFallback
        }
        namespace Responses {
            export type $200 =
                Components.Schemas.CategoryWithLocalTranslationDto
        }
    }
    namespace GetCategoryArticlesPositions {
        namespace Parameters {
            export type CategoryId = number
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            category_id: Parameters.CategoryId
        }
        namespace Responses {
            export type $200 = number[]
        }
    }
    namespace GetCategoryTree {
        namespace Parameters {
            export type Depth = number
            export type Fields = string[]
            export type HelpCenterId = number
            export type Locale =
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            export type OrderBy = 'position'
            export type OrderDir = 'asc' | 'desc'
            export type ParentCategoryId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            parent_category_id: Parameters.ParentCategoryId
        }
        export interface QueryParameters {
            locale: Parameters.Locale
            depth?: Parameters.Depth
            fields?: Parameters.Fields
            order_by?: Parameters.OrderBy
            order_dir?: Parameters.OrderDir
        }
        namespace Responses {
            export type $200 = Components.Schemas.CategoryTreeDto
        }
    }
    namespace GetContactForm {
        namespace Parameters {
            export type Id = number
        }
        export interface PathParameters {
            id: Parameters.Id
        }
        namespace Responses {
            export type $200 = Components.Schemas.ContactFormDto
        }
    }
    namespace GetContactFormAutomationSettings {
        namespace Parameters {
            export type Id = number
        }
        export interface PathParameters {
            id: Parameters.Id
        }
        namespace Responses {
            export type $200 = Components.Schemas.AutomationSettingsDto
        }
    }
    namespace GetContactFormByUid {
        namespace Parameters {
            export type Uid = string
        }
        export interface PathParameters {
            uid: Parameters.Uid
        }
        namespace Responses {
            export type $200 = Components.Schemas.ContactFormDto
        }
    }
    namespace GetContactFormEmailIntegrationByIntegrationId {
        namespace Parameters {
            export type AccountId = string
            export type IntegrationId = number
        }
        export interface PathParameters {
            integration_id: Parameters.IntegrationId
        }
        export interface QueryParameters {
            account_id: Parameters.AccountId
        }
        namespace Responses {
            export type $200 = Components.Schemas.EmailIntegrationDto
        }
    }
    namespace GetContactFormMailtoReplacementConfig {
        namespace Parameters {
            export type ContactFormId = number
        }
        export interface PathParameters {
            contact_form_id: Parameters.ContactFormId
        }
        namespace Responses {
            export type $200 = Components.Schemas.MailtoReplacementConfigGetDto
        }
    }
    namespace GetContactFormShopifyMailtoReplacementConfig {
        namespace Parameters {
            export type ShopName = string
        }
        export interface PathParameters {
            shop_name: Parameters.ShopName
        }
        namespace Responses {
            export type $200 = Components.Schemas.MailtoReplacementConfigDto
        }
    }
    namespace GetCustomDomain {
        namespace Parameters {
            export type HelpCenterId = number
            export type Hostname = string
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            hostname: Parameters.Hostname
        }
        namespace Responses {
            export type $200 = Components.Schemas.CustomDomain
        }
    }
    namespace GetExtraHTML {
        namespace Parameters {
            export type HelpCenterId = number
            export type Locale = string
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export interface QueryParameters {
            locale: Parameters.Locale
        }
        namespace Responses {
            export type $200 = Components.Schemas.ExtraHTML
        }
    }
    namespace GetFileIngestion {
        namespace Parameters {
            export type AccountId = string
            export type HelpCenterId = number
            export type Ids = number[]
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export interface QueryParameters {
            account_id?: Parameters.AccountId
            ids?: Parameters.Ids
        }
        namespace Responses {
            export type $200 = Components.Schemas.RetrieveFileIngestionLogDto[]
        }
    }
    namespace GetFileIngestionArticleTitlesAndStatus {
        namespace Parameters {
            export type AccountId = string
            export type FileIngestionId = number
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            file_ingestion_id: Parameters.FileIngestionId
        }
        export interface QueryParameters {
            account_id?: Parameters.AccountId
        }
        namespace Responses {
            export interface $200 {}
        }
    }
    namespace GetHelpCenter {
        namespace Parameters {
            export type Fields = string[]
            export type HelpCenterId = number
            export type WithWizard = boolean
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export interface QueryParameters {
            fields?: Parameters.Fields
            with_wizard?: Parameters.WithWizard
        }
        namespace Responses {
            export type $200 = Components.Schemas.GetHelpCenterDto
        }
    }
    namespace GetHelpCenterAutomationSettings {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        namespace Responses {
            export type $200 = Components.Schemas.AutomationSettingsDto
        }
    }
    namespace GetHelpCenterByUid {
        namespace Parameters {
            export type Fields = string[]
            export type Uid = string
        }
        export interface PathParameters {
            uid: Parameters.Uid
        }
        export interface QueryParameters {
            fields?: Parameters.Fields
        }
        namespace Responses {
            export type $200 = Components.Schemas.GetHelpCenterDto
        }
    }
    namespace GetHelpCenterEmailIntegrationByIntegrationId {
        namespace Parameters {
            export type AccountId = string
            export type IntegrationId = number
        }
        export interface PathParameters {
            integration_id: Parameters.IntegrationId
        }
        export interface QueryParameters {
            account_id: Parameters.AccountId
        }
        namespace Responses {
            export type $200 = Components.Schemas.EmailIntegrationDto
        }
    }
    namespace GetHelpCenterSiteMapUrls {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        namespace Responses {
            export type $200 = Components.Schemas.HelpCenterSiteMapUrlDto[]
        }
    }
    namespace GetHotswapStatus {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        namespace Responses {
            export type $200 = Components.Schemas.HotswapProgressDto
        }
    }
    namespace GetIngestedResource {
        namespace Parameters {
            export type HelpCenterId = number
            export type Id = number
        }
        export interface PathParameters {
            id: Parameters.Id
            help_center_id: Parameters.HelpCenterId
        }
        namespace Responses {
            export type $200 = Components.Schemas.IngestedResourceListDataDto
        }
    }
    namespace GetIngestionLogs {
        namespace Parameters {
            export type AccountId = string
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export interface QueryParameters {
            account_id?: Parameters.AccountId
        }
        namespace Responses {
            export type $200 = Components.Schemas.IngestionLogDto[]
        }
    }
    namespace GetKnowledgeHubArticles {
        namespace Parameters {
            export type AccountId = number
            export type FaqHelpCenterId = number
            export type GuidanceHelpCenterId = number
            export type SnippetHelpCenterId = number
        }
        export interface QueryParameters {
            faq_help_center_id?: Parameters.FaqHelpCenterId
            snippet_help_center_id?: Parameters.SnippetHelpCenterId
            guidance_help_center_id?: Parameters.GuidanceHelpCenterId
            account_id: Parameters.AccountId
        }
        namespace Responses {
            export interface $200 {}
        }
    }
    namespace GetKnowledgeStatus {
        namespace Responses {
            export type $200 = Components.Schemas.KnowledgeStatusDto[]
        }
    }
    namespace GetLocale {
        namespace Parameters {
            export type Locale = string
        }
        export interface PathParameters {
            locale: Parameters.Locale
        }
        namespace Responses {
            export type $200 = Components.Schemas.LocaleDto
        }
    }
    namespace GetNavigationLinksPositions {
        namespace Parameters {
            export type Group = 'footer' | 'header'
            export type HelpCenterId = number
            export type Locale =
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            locale: Parameters.Locale
            group: Parameters.Group
        }
        namespace Responses {
            export type $200 = number[]
        }
    }
    namespace GetStatistics {
        namespace Parameters {
            export type EndDate = string
            export type HelpCenterId = number
            export type Ids = number[]
            export type Page = any
            export type PerPage = any
            export type StartDate = string
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export interface QueryParameters {
            start_date: Parameters.StartDate
            end_date: Parameters.EndDate
            ids?: Parameters.Ids
            per_page?: Parameters.PerPage
            page?: Parameters.Page
        }
        namespace Responses {
            export type $200 = Components.Schemas.ArticleStatisticsDto[]
        }
    }
    namespace GetSubCategoriesPositions {
        namespace Parameters {
            export type HelpCenterId = number
            export type ParentCategoryId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            parent_category_id: Parameters.ParentCategoryId
        }
        namespace Responses {
            export type $200 = number[]
        }
    }
    namespace GetUncategorizedArticlesPositions {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        namespace Responses {
            export type $200 = number[]
        }
    }
    namespace HandleArticleIngestionDone {
        export type RequestBody = Components.Schemas.ApifyWebhookDto
        namespace Responses {
            export interface $201 {}
        }
    }
    namespace HandleIngestionFail {
        export type RequestBody = Components.Schemas.ApifyFailedIngestionDto
        namespace Responses {
            export interface $204 {}
        }
    }
    namespace HandoverWorkflowExecution {
        export type RequestBody = Components.Schemas.WorkflowHandoverDto
        namespace Responses {
            export interface $204 {}
        }
    }
    namespace ImportCsv {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export type RequestBody = Components.Schemas.ProcessCsvRequestDto
        namespace Responses {
            export type $201 = Components.Schemas.ProcessCsvResponseDto
        }
    }
    namespace List {
        namespace Parameters {
            export type AccountId = number
        }
        export interface QueryParameters {
            account_id: Parameters.AccountId
        }
        namespace Responses {
            export type $200 = Components.Schemas.ShopIntegrationMappingsDto[]
        }
    }
    namespace ListAIArticleTemplates {
        namespace Responses {
            export type $200 = Components.Schemas.AIArticleTemplateDto[]
        }
    }
    namespace ListAIArticleTemplatesByHelpCenter {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        namespace Responses {
            export type $200 = Components.Schemas.AIArticleTemplateDto[]
        }
    }
    namespace ListAIArticleTemplatesByHelpCenterAndStore {
        namespace Parameters {
            export type HelpCenterId = number
            export type StoreIntegrationId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            store_integration_id: Parameters.StoreIntegrationId
        }
        namespace Responses {
            export type $200 = Components.Schemas.AIArticleTemplateDto[]
        }
    }
    namespace ListAIGuidancesByHelpCenterAndStore {
        namespace Parameters {
            export type HelpCenterId = number
            export type StoreIntegrationId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            store_integration_id: Parameters.StoreIntegrationId
        }
        namespace Responses {
            export type $200 = Components.Schemas.AIGuidanceDto[]
        }
    }
    namespace ListArticleTemplates {
        namespace Parameters {
            export type Locale =
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
        }
        export interface QueryParameters {
            locale: Parameters.Locale
        }
        namespace Responses {
            export type $200 = Components.Schemas.ArticleTemplateDto[]
        }
    }
    namespace ListArticleTranslationVersions {
        namespace Parameters {
            export type ArticleId = number
            export type HelpCenterId = number
            export type Locale = string
            export type Number = number
            export type Page = any
            export type PerPage = any
            export type Published = boolean
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            article_id: Parameters.ArticleId
            locale: Parameters.Locale
        }
        export interface QueryParameters {
            published?: Parameters.Published
            number?: Parameters.Number
            per_page?: Parameters.PerPage
            page?: Parameters.Page
        }
        namespace Responses {
            export type $200 =
                Components.Schemas.ArticleTranslationVersionsListPageDto
        }
    }
    namespace ListArticleTranslations {
        namespace Parameters {
            export type ArticleId = number
            export type HelpCenterId = number
            export type Page = any
            export type PerPage = any
            export type VersionStatus = 'current' | 'latest_draft'
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            article_id: Parameters.ArticleId
        }
        export interface QueryParameters {
            version_status?: Parameters.VersionStatus
            per_page?: Parameters.PerPage
            page?: Parameters.Page
        }
        namespace Responses {
            export type $200 = Components.Schemas.ArticleTranslationsListPageDto
        }
    }
    namespace ListArticles {
        namespace Parameters {
            export type Content = string
            export type HasCategory = boolean
            export type HelpCenterId = number
            export type Ids = number[]
            export type Locale =
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            export type OrderBy = 'position'
            export type OrderDir = 'asc' | 'desc'
            export type Page = any
            export type PerPage = any
            export type Title = string
            export type VersionStatus = 'current' | 'latest_draft'
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export interface QueryParameters {
            has_category?: Parameters.HasCategory
            content?: Parameters.Content
            title?: Parameters.Title
            locale?: Parameters.Locale
            version_status?: Parameters.VersionStatus
            ids?: Parameters.Ids
            order_by?: Parameters.OrderBy
            order_dir?: Parameters.OrderDir
            per_page?: Parameters.PerPage
            page?: Parameters.Page
        }
        namespace Responses {
            export type $200 = Components.Schemas.ArticlesListPageDto
        }
    }
    namespace ListCategories {
        namespace Parameters {
            export type HasArticles = boolean
            export type HelpCenterId = number
            export type Locale =
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            export type OrderBy = 'position'
            export type OrderDir = 'asc' | 'desc'
            export type Page = any
            export type PerPage = any
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export interface QueryParameters {
            locale?: Parameters.Locale
            has_articles?: Parameters.HasArticles
            order_by?: Parameters.OrderBy
            order_dir?: Parameters.OrderDir
            per_page?: Parameters.PerPage
            page?: Parameters.Page
        }
        namespace Responses {
            export type $200 = Components.Schemas.CategoriesListPageDto
        }
    }
    namespace ListCategoryArticles {
        namespace Parameters {
            export type CategoryId = number
            export type HelpCenterId = number
            export type Ids = number[]
            export type Locale =
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            export type OrderBy = 'position'
            export type OrderDir = 'asc' | 'desc'
            export type Page = any
            export type PerPage = any
            export type VersionStatus = 'current' | 'latest_draft'
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            category_id: Parameters.CategoryId
        }
        export interface QueryParameters {
            locale?: Parameters.Locale
            version_status?: Parameters.VersionStatus
            ids?: Parameters.Ids
            order_by?: Parameters.OrderBy
            order_dir?: Parameters.OrderDir
            per_page?: Parameters.PerPage
            page?: Parameters.Page
        }
        namespace Responses {
            export type $200 = Components.Schemas.ArticlesListPageDto
        }
    }
    namespace ListCategoryTranslations {
        namespace Parameters {
            export type CategoryId = number
            export type HelpCenterId = number
            export type Page = any
            export type PerPage = any
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            category_id: Parameters.CategoryId
        }
        export interface QueryParameters {
            per_page?: Parameters.PerPage
            page?: Parameters.Page
        }
        namespace Responses {
            export type $200 =
                Components.Schemas.CategoryTranslationsListPageDto
        }
    }
    namespace ListContactFormShopifyPageEmbedments {
        namespace Parameters {
            export type ContactFormId = number
        }
        export interface PathParameters {
            contact_form_id: Parameters.ContactFormId
        }
        namespace Responses {
            export type $200 = Components.Schemas.PageEmbedmentDto[]
        }
    }
    namespace ListContactFormShopifyPages {
        namespace Parameters {
            export type ContactFormId = number
        }
        export interface PathParameters {
            contact_form_id: Parameters.ContactFormId
        }
        namespace Responses {
            export type $200 = Components.Schemas.ContactFormPageDto[]
        }
    }
    namespace ListContactForms {
        namespace Parameters {
            export type Page = any
            export type PerPage = any
        }
        export interface QueryParameters {
            per_page?: Parameters.PerPage
            page?: Parameters.Page
        }
        namespace Responses {
            export type $200 = Components.Schemas.ContactFormsListPageDto
        }
    }
    namespace ListCustomDomains {
        namespace Parameters {
            export type HelpCenterId = number
            export type Page = any
            export type PerPage = any
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export interface QueryParameters {
            per_page?: Parameters.PerPage
            page?: Parameters.Page
        }
        namespace Responses {
            export type $200 = Components.Schemas.CustomDomainsListPageDto
        }
    }
    namespace ListGoogleFonts {
        namespace Responses {
            export interface $200 {}
        }
    }
    namespace ListHelpCenterShopifyPageEmbedments {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        namespace Responses {
            export type $200 = Components.Schemas.PageEmbedmentDto[]
        }
    }
    namespace ListHelpCenterShopifyPages {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        namespace Responses {
            export type $200 = Components.Schemas.HelpCenterStorePageDto[]
        }
    }
    namespace ListHelpCenterTranslations {
        namespace Parameters {
            export type HelpCenterId = number
            export type Page = any
            export type PerPage = any
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export interface QueryParameters {
            per_page?: Parameters.PerPage
            page?: Parameters.Page
        }
        namespace Responses {
            export type $200 =
                Components.Schemas.HelpCenterTranslationsListPageDto
        }
    }
    namespace ListHelpCenters {
        namespace Parameters {
            export type AccountId = string
            export type Active = boolean
            export type CustomDomain = string
            export type Fields = string[]
            export type Name = string
            export type Page = number
            export type PerPage = number
            export type ShopIntegrationId = number
            export type ShopName = string
            export type ShopType = string
            export type Subdomain = string
            export type Type = 'faq' | 'guidance' | 'snippet'
            export type WithWizard = boolean
        }
        export interface QueryParameters {
            page?: Parameters.Page
            per_page?: Parameters.PerPage
            fields?: Parameters.Fields
            with_wizard?: Parameters.WithWizard
            type?: Parameters.Type
            active?: Parameters.Active
            account_id?: Parameters.AccountId
            shop_integration_id?: Parameters.ShopIntegrationId
            shop_type?: Parameters.ShopType
            name?: Parameters.Name
            shop_name?: Parameters.ShopName
            custom_domain?: Parameters.CustomDomain
            subdomain?: Parameters.Subdomain
        }
        namespace Responses {
            export type $200 = Components.Schemas.HelpCentersListPageDto
        }
    }
    namespace ListIngestedResources {
        namespace Parameters {
            export type ArticleIngestionLogId = number
            export type Filter = string
            export type HelpCenterId = number
            export type Page = any
            export type PerPage = any
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            article_ingestion_log_id: Parameters.ArticleIngestionLogId
        }
        export interface QueryParameters {
            filter?: Parameters.Filter
            per_page?: Parameters.PerPage
            page?: Parameters.Page
        }
        namespace Responses {
            export type $200 = Components.Schemas.IngestedResourceListPageDto
        }
    }
    namespace ListLocales {
        namespace Responses {
            export type $200 = Components.Schemas.LocaleDto[]
        }
    }
    namespace ListNavigationLinks {
        namespace Parameters {
            export type Group = 'footer' | 'header'
            export type HelpCenterId = number
            export type Locale =
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
            export type OrderBy = 'position'
            export type OrderDir = 'asc' | 'desc'
            export type Page = any
            export type PerPage = any
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export interface QueryParameters {
            locale?: Parameters.Locale
            group?: Parameters.Group
            order_by?: Parameters.OrderBy
            order_dir?: Parameters.OrderDir
            per_page?: Parameters.PerPage
            page?: Parameters.Page
        }
        namespace Responses {
            export type $200 = Components.Schemas.NavigationLinksListPageDto
        }
    }
    namespace ListRedirects {
        namespace Parameters {
            export type From = string
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export interface QueryParameters {
            from?: Parameters.From
        }
        namespace Responses {
            export type $200 = Components.Schemas.RedirectDto[]
        }
    }
    namespace PublishAndRebaseArticleTranslation {
        namespace Parameters {
            export type ArticleId = number
            export type HelpCenterId = number
            export type Locale = string
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            article_id: Parameters.ArticleId
            locale: Parameters.Locale
        }
        export type RequestBody = Components.Schemas.RebaseArticleTranslationDto
        namespace Responses {
            export type $201 = Components.Schemas.ArticleTranslationResponseDto
        }
    }
    namespace PurgeCache {
        namespace Parameters {
            export type ShopName = string
        }
        export interface PathParameters {
            shop_name: Parameters.ShopName
        }
        namespace Responses {
            export interface $201 {}
        }
    }
    namespace SetArticlesPositionsInCategory {
        namespace Parameters {
            export type CategoryId = number
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            category_id: Parameters.CategoryId
        }
        export type RequestBody = number[]
        namespace Responses {
            export type $200 = number[]
        }
    }
    namespace SetCategoriesPositions {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export type RequestBody = number[]
        namespace Responses {
            export type $200 = number[]
        }
    }
    namespace SetNavigationLinksPositions {
        namespace Parameters {
            export type Group = 'footer' | 'header'
            export type HelpCenterId = number
            export type Locale =
                | 'cs-CZ'
                | 'da-DK'
                | 'nl-NL'
                | 'en-GB'
                | 'en-US'
                | 'fi-FI'
                | 'fr-CA'
                | 'fr-FR'
                | 'de-DE'
                | 'it-IT'
                | 'ja-JP'
                | 'no-NO'
                | 'pt-BR'
                | 'es-ES'
                | 'sv-SE'
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            locale: Parameters.Locale
            group: Parameters.Group
        }
        export type RequestBody = number[]
        namespace Responses {
            export type $200 = number[]
        }
    }
    namespace SetSubCategoriesPositions {
        namespace Parameters {
            export type HelpCenterId = number
            export type ParentCategoryId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            parent_category_id: Parameters.ParentCategoryId
        }
        export type RequestBody = number[]
        namespace Responses {
            export type $200 = number[]
        }
    }
    namespace SetUncategorizedArticlesPositions {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export type RequestBody = number[]
        namespace Responses {
            export type $200 = number[]
        }
    }
    namespace StartIngestion {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export type RequestBody = Components.Schemas.IngestionRequestDto
        namespace Responses {
            export type $201 = Components.Schemas.StartIngestionResponseDto
        }
    }
    namespace SubmitContactFormByUid {
        namespace Parameters {
            export type Uid = string
        }
        export interface PathParameters {
            uid: Parameters.Uid
        }
        export type RequestBody = Components.Schemas.ContactFormSubmissionDto
        namespace Responses {
            export interface $204 {}
        }
    }
    namespace UpdateAllIngestedResourcesStatus {
        namespace Parameters {
            export type ArticleIngestionLogId = number
            export type HelpCenterId = number
        }
        export interface PathParameters {
            article_ingestion_log_id: Parameters.ArticleIngestionLogId
            help_center_id: Parameters.HelpCenterId
        }
        export type RequestBody = Components.Schemas.UpdateIngestedResourceDto
        namespace Responses {
            export interface $200 {}
        }
    }
    namespace UpdateArticle {
        namespace Parameters {
            export type HelpCenterId = number
            export type Id = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            id: Parameters.Id
        }
        export type RequestBody = Components.Schemas.UpdateArticleDto
        namespace Responses {
            export type $200 = Components.Schemas.ArticleDto
        }
    }
    namespace UpdateArticleTranslation {
        namespace Parameters {
            export type ArticleId = number
            export type HelpCenterId = number
            export type Locale = string
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            article_id: Parameters.ArticleId
            locale: Parameters.Locale
        }
        export type RequestBody = Components.Schemas.UpdateArticleTranslationDto
        namespace Responses {
            export type $200 = Components.Schemas.ArticleTranslationResponseDto
        }
    }
    namespace UpdateArticleTranslationRating {
        namespace Parameters {
            export type ArticleId = number
            export type HelpCenterId = number
            export type Locale = string
            export type RatingId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            article_id: Parameters.ArticleId
            locale: Parameters.Locale
            ratingId: Parameters.RatingId
        }
        export type RequestBody =
            Components.Schemas.UpdateArticleTranslationRatingDto
        namespace Responses {
            export type $200 = Components.Schemas.ArticleTranslationRatingDto
        }
    }
    namespace UpdateCategoryTranslation {
        namespace Parameters {
            export type CategoryId = number
            export type HelpCenterId = number
            export type Locale = string
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            category_id: Parameters.CategoryId
            locale: Parameters.Locale
        }
        export type RequestBody =
            Components.Schemas.UpdateCategoryTranslationDto
        namespace Responses {
            export type $200 = Components.Schemas.CategoryTranslationDto
        }
    }
    namespace UpdateContactForm {
        namespace Parameters {
            export type Id = number
        }
        export interface PathParameters {
            id: Parameters.Id
        }
        export type RequestBody = Components.Schemas.UpdateContactFormDto
        namespace Responses {
            export type $200 = Components.Schemas.ContactFormDto
        }
    }
    namespace UpdateContactFormShopifyPageEmbedment {
        namespace Parameters {
            export type ContactFormId = number
            export type EmbedmentId = number
        }
        export interface PathParameters {
            embedment_id: Parameters.EmbedmentId
            contact_form_id: Parameters.ContactFormId
        }
        export type RequestBody = Components.Schemas.UpdatePageEmbedmentDto
        namespace Responses {
            export type $200 = Components.Schemas.PageEmbedmentDto
        }
    }
    namespace UpdateEmailIntegration {
        export type RequestBody = Components.Schemas.UpdateEmailIntegrationDto
        namespace Responses {
            export interface $204 {}
        }
    }
    namespace UpdateExtraHTML {
        namespace Parameters {
            export type HelpCenterId = number
            export type Locale = string
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            locale: Parameters.Locale
        }
        export type RequestBody = Components.Schemas.UpdateExtraHTMLDto
        namespace Responses {
            export type $200 = Components.Schemas.ExtraHTML
        }
    }
    namespace UpdateHelpCenter {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export type RequestBody = Components.Schemas.UpdateHelpCenterDto
        namespace Responses {
            export type $200 = Components.Schemas.HelpCenterDto
        }
    }
    namespace UpdateHelpCenterShopifyPageEmbedment {
        namespace Parameters {
            export type EmbedmentId = number
            export type HelpCenterId = number
        }
        export interface PathParameters {
            embedment_id: Parameters.EmbedmentId
            help_center_id: Parameters.HelpCenterId
        }
        export type RequestBody = Components.Schemas.UpdatePageEmbedmentDto
        namespace Responses {
            export type $200 = Components.Schemas.PageEmbedmentDto
        }
    }
    namespace UpdateHelpCenterTranslation {
        namespace Parameters {
            export type HelpCenterId = number
            export type Locale = string
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            locale: Parameters.Locale
        }
        export type RequestBody =
            Components.Schemas.UpdateHelpCenterTranslationDto
        namespace Responses {
            export type $200 = Components.Schemas.HelpCenterTranslationDto
        }
    }
    namespace UpdateIngestedResource {
        namespace Parameters {
            export type HelpCenterId = number
            export type IngestedResourceId = number
        }
        export interface PathParameters {
            ingested_resource_id: Parameters.IngestedResourceId
            help_center_id: Parameters.HelpCenterId
        }
        export type RequestBody = Components.Schemas.UpdateIngestedResourceDto
        namespace Responses {
            export type $200 = Components.Schemas.IngestedResourceDto
        }
    }
    namespace UpdateNavigationLink {
        namespace Parameters {
            export type HelpCenterId = number
            export type Id = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
            id: Parameters.Id
        }
        export type RequestBody = Components.Schemas.UpdateNavigationLinkDto
        namespace Responses {
            export type $200 = Components.Schemas.NavigationLinkDto
        }
    }
    namespace UpsertArticleTemplateReview {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export type RequestBody =
            Components.Schemas.UpsertArticleTemplateReviewDto
        namespace Responses {
            export interface $204 {}
        }
    }
    namespace UpsertContactFormAutomationSettings {
        namespace Parameters {
            export type Id = number
        }
        export interface PathParameters {
            id: Parameters.Id
        }
        export type RequestBody = Components.Schemas.UpsertAutomationSettingsDto
        namespace Responses {
            export type $200 = Components.Schemas.AutomationSettingsDto
        }
    }
    namespace UpsertContactFormShopifyMailtoReplacement {
        namespace Parameters {
            export type ContactFormId = number
        }
        export interface PathParameters {
            contact_form_id: Parameters.ContactFormId
        }
        export type RequestBody =
            Components.Schemas.UpsertMailtoReplacementConfigDto
        namespace Responses {
            export type $200 = Components.Schemas.MailtoReplacementConfigDto
        }
    }
    namespace UpsertHelpCenterAutomationSettings {
        namespace Parameters {
            export type HelpCenterId = number
        }
        export interface PathParameters {
            help_center_id: Parameters.HelpCenterId
        }
        export type RequestBody = Components.Schemas.UpsertAutomationSettingsDto
        namespace Responses {
            export type $200 = Components.Schemas.AutomationSettingsDto
        }
    }
}

export interface OperationMethods {
    /**
     * deleteArticleIngestionLog - Delete article ingestion log
     */
    'deleteArticleIngestionLog'(
        parameters: Parameters<Paths.DeleteArticleIngestionLog.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.DeleteArticleIngestionLog.Responses.$204>
    /**
     * getArticleIngestionLogs - Get article ingestion logs
     */
    'getArticleIngestionLogs'(
        parameters: Parameters<
            Paths.GetArticleIngestionLogs.QueryParameters &
                Paths.GetArticleIngestionLogs.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetArticleIngestionLogs.Responses.$200>
    /**
     * getArticleIngestionArticleTitlesAndStatus - Get article titles and visibility status for an article ingestion log
     */
    'getArticleIngestionArticleTitlesAndStatus'(
        parameters: Parameters<
            Paths.GetArticleIngestionArticleTitlesAndStatus.QueryParameters &
                Paths.GetArticleIngestionArticleTitlesAndStatus.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetArticleIngestionArticleTitlesAndStatus.Responses.$200>
    /**
     * getKnowledgeStatus - Get snippet help centers knowledge status
     */
    'getKnowledgeStatus'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetKnowledgeStatus.Responses.$200>
    /**
     * listCategoryArticles - List category's articles
     */
    'listCategoryArticles'(
        parameters: Parameters<
            Paths.ListCategoryArticles.QueryParameters &
                Paths.ListCategoryArticles.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ListCategoryArticles.Responses.$200>
    /**
     * deleteCategoryArticles - Delete category's articles
     */
    'deleteCategoryArticles'(
        parameters: Parameters<Paths.DeleteCategoryArticles.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.DeleteCategoryArticles.Responses.$200>
    /**
     * getCategoryArticlesPositions - Retrieve articles' positions in category
     */
    'getCategoryArticlesPositions'(
        parameters: Parameters<Paths.GetCategoryArticlesPositions.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetCategoryArticlesPositions.Responses.$200>
    /**
     * setArticlesPositionsInCategory - Set articles' positions in category
     *
     * If the provided `id`s is missing an item, this item will be sorted last.
     */
    'setArticlesPositionsInCategory'(
        parameters: Parameters<Paths.SetArticlesPositionsInCategory.PathParameters>,
        data?: Paths.SetArticlesPositionsInCategory.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.SetArticlesPositionsInCategory.Responses.$200>
    /**
     * listArticles - List articles
     *
     * If you want to get articles ordered by `position` in a category, prefer using
     * `/categories/:category_id/articles`.
     */
    'listArticles'(
        parameters: Parameters<
            Paths.ListArticles.QueryParameters &
                Paths.ListArticles.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ListArticles.Responses.$200>
    /**
     * createArticle - Create an article
     *
     * Create an article for the given help center.
     *
     * A translation should be provided when creating an article.
     */
    'createArticle'(
        parameters: Parameters<Paths.CreateArticle.PathParameters>,
        data?: Paths.CreateArticle.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.CreateArticle.Responses.$201>
    /**
     * getStatistics - Get article statistics for a date range
     */
    'getStatistics'(
        parameters: Parameters<
            Paths.GetStatistics.QueryParameters &
                Paths.GetStatistics.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetStatistics.Responses.$200>
    /**
     * getUncategorizedArticlesPositions - Retrieve uncategorized articles' positions
     */
    'getUncategorizedArticlesPositions'(
        parameters: Parameters<Paths.GetUncategorizedArticlesPositions.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetUncategorizedArticlesPositions.Responses.$200>
    /**
     * setUncategorizedArticlesPositions - Set uncategorized articles' positions
     *
     * If the provided `id`s is missing an item, this item will be sorted last.
     */
    'setUncategorizedArticlesPositions'(
        parameters: Parameters<Paths.SetUncategorizedArticlesPositions.PathParameters>,
        data?: Paths.SetUncategorizedArticlesPositions.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.SetUncategorizedArticlesPositions.Responses.$200>
    /**
     * batchGetArticlesSourceType - Retrieve source types for multiple articles
     *
     * Returns the source type for each requested article ID
     */
    'batchGetArticlesSourceType'(
        parameters: Parameters<Paths.BatchGetArticlesSourceType.PathParameters>,
        data?: Paths.BatchGetArticlesSourceType.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.BatchGetArticlesSourceType.Responses.$200>
    /**
     * bulkCopyArticles - Bulk copy articles
     *
     * Copies multiple articles and their translations across multiple help center. This operation is supported only for Help Center type GUIDANCE
     */
    'bulkCopyArticles'(
        parameters: Parameters<Paths.BulkCopyArticles.PathParameters>,
        data?: Paths.BulkCopyArticles.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.BulkCopyArticles.Responses.$200>
    /**
     * bulkDeleteArticles - Bulk delete articles
     *
     * Deletes multiple articles and their translations in a single transaction. This operation is supported only for Help Center type GUIDANCE and FAQ
     */
    'bulkDeleteArticles'(
        parameters: Parameters<Paths.BulkDeleteArticles.PathParameters>,
        data?: Paths.BulkDeleteArticles.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.BulkDeleteArticles.Responses.$200>
    /**
     * getArticle - Retrieve an article
     */
    'getArticle'(
        parameters: Parameters<
            Paths.GetArticle.QueryParameters & Paths.GetArticle.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetArticle.Responses.$200>
    /**
     * updateArticle - Update an article
     */
    'updateArticle'(
        parameters: Parameters<Paths.UpdateArticle.PathParameters>,
        data?: Paths.UpdateArticle.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.UpdateArticle.Responses.$200>
    /**
     * deleteArticle - Delete an article
     */
    'deleteArticle'(
        parameters: Parameters<Paths.DeleteArticle.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.DeleteArticle.Responses.$200>
    /**
     * copyArticle - Copy an article to another help center
     *
     * Copy an article from one help center to another.
     */
    'copyArticle'(
        parameters: Parameters<Paths.CopyArticle.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.CopyArticle.Responses.$201>
    /**
     * listArticleTranslations - List article's translations
     */
    'listArticleTranslations'(
        parameters: Parameters<
            Paths.ListArticleTranslations.QueryParameters &
                Paths.ListArticleTranslations.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ListArticleTranslations.Responses.$200>
    /**
     * createArticleTranslation - Create an article translation
     */
    'createArticleTranslation'(
        parameters: Parameters<Paths.CreateArticleTranslation.PathParameters>,
        data?: Paths.CreateArticleTranslation.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.CreateArticleTranslation.Responses.$201>
    /**
     * getArticleTranslationIntents - List available intents for an article translation
     */
    'getArticleTranslationIntents'(
        parameters: Parameters<Paths.GetArticleTranslationIntents.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetArticleTranslationIntents.Responses.$200>
    /**
     * updateArticleTranslation - Update an article translation
     */
    'updateArticleTranslation'(
        parameters: Parameters<Paths.UpdateArticleTranslation.PathParameters>,
        data?: Paths.UpdateArticleTranslation.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.UpdateArticleTranslation.Responses.$200>
    /**
     * deleteArticleTranslation - Delete an article translation
     *
     * So that an article have at least 1
     *     translation, you can't delete a translation if it's the only
     *     non-deleted translation.
     */
    'deleteArticleTranslation'(
        parameters: Parameters<Paths.DeleteArticleTranslation.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.DeleteArticleTranslation.Responses.$200>
    /**
     * publishAndRebaseArticleTranslation - Rebase draft and publish from current published version
     */
    'publishAndRebaseArticleTranslation'(
        parameters: Parameters<Paths.PublishAndRebaseArticleTranslation.PathParameters>,
        data?: Paths.PublishAndRebaseArticleTranslation.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.PublishAndRebaseArticleTranslation.Responses.$201>
    /**
     * listArticleTranslationVersions - List all versions for an article translation
     *
     * Returns all versions for an article translation, optionally filtered to only published versions. When the "number" query parameter is provided, returns a single version by its version number instead of a paginated list.
     */
    'listArticleTranslationVersions'(
        parameters: Parameters<
            Paths.ListArticleTranslationVersions.QueryParameters &
                Paths.ListArticleTranslationVersions.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ListArticleTranslationVersions.Responses.$200>
    /**
     * getArticleTranslationVersion - Get a specific version of an article translation
     *
     * Returns a specific version by ID for an article translation.
     */
    'getArticleTranslationVersion'(
        parameters: Parameters<Paths.GetArticleTranslationVersion.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetArticleTranslationVersion.Responses.$200>
    /**
     * deleteArticleTranslationDraft - Delete draft version of article translation
     *
     * Discards unpublished draft changes and reverts the translation to the current
     *       published version. This operation will delete the article as a whole if there is no published version.
     *       Otherwise, it will delete the latest draft version of the translation. It will fail if there is no latest draft version.
     *
     *       The endpoint will return the current published version of the translation if it exists, otherwise it will return nothing.
     */
    'deleteArticleTranslationDraft'(
        parameters: Parameters<Paths.DeleteArticleTranslationDraft.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<
        | Paths.DeleteArticleTranslationDraft.Responses.$200
        | Paths.DeleteArticleTranslationDraft.Responses.$204
    >
    /**
     * bulkUpdateArticleTranslationsVisibility - Bulk update article translations visibility status
     *
     * Updates visibility status for all translations of multiple articles. Creates new versions for all translations and updates visibility status across all locales.
     */
    'bulkUpdateArticleTranslationsVisibility'(
        parameters: Parameters<Paths.BulkUpdateArticleTranslationsVisibility.PathParameters>,
        data?: Paths.BulkUpdateArticleTranslationsVisibility.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.BulkUpdateArticleTranslationsVisibility.Responses.$200>
    /**
     * createArticleTranslationRating - Create an article translation rating
     */
    'createArticleTranslationRating'(
        parameters: Parameters<Paths.CreateArticleTranslationRating.PathParameters>,
        data?: Paths.CreateArticleTranslationRating.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.CreateArticleTranslationRating.Responses.$201>
    /**
     * updateArticleTranslationRating - Update an article translation rating
     */
    'updateArticleTranslationRating'(
        parameters: Parameters<Paths.UpdateArticleTranslationRating.PathParameters>,
        data?: Paths.UpdateArticleTranslationRating.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.UpdateArticleTranslationRating.Responses.$200>
    /**
     * deleteArticleTranslationRating - Removes an article translation rating
     */
    'deleteArticleTranslationRating'(
        parameters: Parameters<Paths.DeleteArticleTranslationRating.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.DeleteArticleTranslationRating.Responses.$200>
    /**
     * listHelpCenters - List help centers
     *
     * List help centers.
     *
     * If authenticated as agent, returns the list of help centers associated with the account domain
     * the agent belongs to.
     */
    'listHelpCenters'(
        parameters?: Parameters<Paths.ListHelpCenters.QueryParameters> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ListHelpCenters.Responses.$200>
    /**
     * createHelpCenter - Create a help center
     */
    'createHelpCenter'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.CreateHelpCenter.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.CreateHelpCenter.Responses.$200>
    /**
     * getKnowledgeHubArticles - Get knowledge hub articles for guidance, FAQ, and snippet help centers
     *
     * Retrieves articles from guidance, FAQ, and/or snippet help centers. At least one help center ID must be provided. Agent authentication is restricted to their own account.
     */
    'getKnowledgeHubArticles'(
        parameters?: Parameters<Paths.GetKnowledgeHubArticles.QueryParameters> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetKnowledgeHubArticles.Responses.$200>
    /**
     * getAccountInfo - Get account information for a help center
     *
     * When both subdomain and custom_domain are provided, the subdomain will be used to search the help center
     */
    'getAccountInfo'(
        parameters?: Parameters<Paths.GetAccountInfo.QueryParameters> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetAccountInfo.Responses.$200>
    /**
     * checkHelpCenterWithSubdomainExists - Check that a help center with this subdomain exists
     */
    'checkHelpCenterWithSubdomainExists'(
        parameters: Parameters<Paths.CheckHelpCenterWithSubdomainExists.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.CheckHelpCenterWithSubdomainExists.Responses.$204>
    /**
     * getHelpCenter - Retrieve a help center
     */
    'getHelpCenter'(
        parameters: Parameters<
            Paths.GetHelpCenter.QueryParameters &
                Paths.GetHelpCenter.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetHelpCenter.Responses.$200>
    /**
     * updateHelpCenter - Update a help center
     */
    'updateHelpCenter'(
        parameters: Parameters<Paths.UpdateHelpCenter.PathParameters>,
        data?: Paths.UpdateHelpCenter.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.UpdateHelpCenter.Responses.$200>
    /**
     * deleteHelpCenter - Delete a help center
     */
    'deleteHelpCenter'(
        parameters: Parameters<Paths.DeleteHelpCenter.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.DeleteHelpCenter.Responses.$200>
    /**
     * getHelpCenterByUid - Retrieve a Help Center by uid
     */
    'getHelpCenterByUid'(
        parameters: Parameters<
            Paths.GetHelpCenterByUid.QueryParameters &
                Paths.GetHelpCenterByUid.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetHelpCenterByUid.Responses.$200>
    /**
     * deleteAccountHelpCenters - Delete all Help centers of an account
     */
    'deleteAccountHelpCenters'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.DeleteAccountHelpCenters.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.DeleteAccountHelpCenters.Responses.$201>
    /**
     * purgeCache - Purge CDN cache
     */
    'purgeCache'(
        parameters: Parameters<Paths.PurgeCache.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.PurgeCache.Responses.$201>
    /**
     * duplicateHelpCenter - Duplicate a help center
     *
     * Duplicate a help center with all its translations, categories, articles, navigation links and redirects.
     */
    'duplicateHelpCenter'(
        parameters: Parameters<Paths.DuplicateHelpCenter.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.DuplicateHelpCenter.Responses.$200>
    /**
     * getHelpCenterAutomationSettings - Get a Help center automation settings
     */
    'getHelpCenterAutomationSettings'(
        parameters: Parameters<Paths.GetHelpCenterAutomationSettings.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetHelpCenterAutomationSettings.Responses.$200>
    /**
     * upsertHelpCenterAutomationSettings - Update a Help center automation settings
     */
    'upsertHelpCenterAutomationSettings'(
        parameters: Parameters<Paths.UpsertHelpCenterAutomationSettings.PathParameters>,
        data?: Paths.UpsertHelpCenterAutomationSettings.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.UpsertHelpCenterAutomationSettings.Responses.$200>
    /**
     * getHelpCenterEmailIntegrationByIntegrationId - Retrieve a Help Center email integration by integration_id
     */
    'getHelpCenterEmailIntegrationByIntegrationId'(
        parameters: Parameters<
            Paths.GetHelpCenterEmailIntegrationByIntegrationId.QueryParameters &
                Paths.GetHelpCenterEmailIntegrationByIntegrationId.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetHelpCenterEmailIntegrationByIntegrationId.Responses.$200>
    /**
     * getHelpCenterSiteMapUrls - Get all the site map urls for the help center with the given id
     */
    'getHelpCenterSiteMapUrls'(
        parameters: Parameters<Paths.GetHelpCenterSiteMapUrls.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetHelpCenterSiteMapUrls.Responses.$200>
    /**
     * listHelpCenterTranslations - List help center's translations
     */
    'listHelpCenterTranslations'(
        parameters: Parameters<
            Paths.ListHelpCenterTranslations.QueryParameters &
                Paths.ListHelpCenterTranslations.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ListHelpCenterTranslations.Responses.$200>
    /**
     * createHelpCenterTranslation - Create a help center translation
     */
    'createHelpCenterTranslation'(
        parameters: Parameters<Paths.CreateHelpCenterTranslation.PathParameters>,
        data?: Paths.CreateHelpCenterTranslation.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.CreateHelpCenterTranslation.Responses.$201>
    /**
     * updateHelpCenterTranslation - Update a help center translation
     */
    'updateHelpCenterTranslation'(
        parameters: Parameters<Paths.UpdateHelpCenterTranslation.PathParameters>,
        data?: Paths.UpdateHelpCenterTranslation.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.UpdateHelpCenterTranslation.Responses.$200>
    /**
     * deleteHelpCenterTranslation - Delete a help center translation
     */
    'deleteHelpCenterTranslation'(
        parameters: Parameters<Paths.DeleteHelpCenterTranslation.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.DeleteHelpCenterTranslation.Responses.$200>
    /**
     * listCustomDomains - List custom domains
     */
    'listCustomDomains'(
        parameters: Parameters<
            Paths.ListCustomDomains.QueryParameters &
                Paths.ListCustomDomains.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ListCustomDomains.Responses.$200>
    /**
     * createCustomDomain - Create a custom domain
     */
    'createCustomDomain'(
        parameters: Parameters<Paths.CreateCustomDomain.PathParameters>,
        data?: Paths.CreateCustomDomain.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.CreateCustomDomain.Responses.$201>
    /**
     * getCustomDomain - Retrieve a custom domain
     */
    'getCustomDomain'(
        parameters: Parameters<Paths.GetCustomDomain.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetCustomDomain.Responses.$200>
    /**
     * deleteCustomDomain - Delete a custom domain
     */
    'deleteCustomDomain'(
        parameters: Parameters<Paths.DeleteCustomDomain.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.DeleteCustomDomain.Responses.$200>
    /**
     * checkCustomDomainStatus - Check the status of a custom domain
     */
    'checkCustomDomainStatus'(
        parameters: Parameters<Paths.CheckCustomDomainStatus.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.CheckCustomDomainStatus.Responses.$200>
    /**
     * getExtraHTML - Get a help center's extra HTML
     */
    'getExtraHTML'(
        parameters: Parameters<
            Paths.GetExtraHTML.QueryParameters &
                Paths.GetExtraHTML.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetExtraHTML.Responses.$200>
    /**
     * updateExtraHTML - Update a help center's extra HTML
     */
    'updateExtraHTML'(
        parameters: Parameters<Paths.UpdateExtraHTML.PathParameters>,
        data?: Paths.UpdateExtraHTML.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.UpdateExtraHTML.Responses.$200>
    /**
     * listLocales - List supported locales
     */
    'listLocales'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ListLocales.Responses.$200>
    /**
     * getLocale - Retrieve a locale
     */
    'getLocale'(
        parameters: Parameters<Paths.GetLocale.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetLocale.Responses.$200>
    /**
     * listRedirects - List all redirects
     *
     * TODO: pagination
     */
    'listRedirects'(
        parameters: Parameters<
            Paths.ListRedirects.QueryParameters &
                Paths.ListRedirects.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ListRedirects.Responses.$200>
    /**
     * createRedirect - Create a new redirect
     */
    'createRedirect'(
        parameters: Parameters<Paths.CreateRedirect.PathParameters>,
        data?: Paths.CreateRedirect.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.CreateRedirect.Responses.$201>
    /**
     * deleteRedirect - Delete a redirect
     */
    'deleteRedirect'(
        parameters: Parameters<
            Paths.DeleteRedirect.QueryParameters &
                Paths.DeleteRedirect.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.DeleteRedirect.Responses.$200>
    /**
     * listCategories - List categories
     *
     * List the top level categories with pagination metadata.
     */
    'listCategories'(
        parameters: Parameters<
            Paths.ListCategories.QueryParameters &
                Paths.ListCategories.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ListCategories.Responses.$200>
    /**
     * createCategory - Create a category
     *
     * Create a category in a given help center. If the provided `parent_category_id` field is `null` or is not provided, the category will be created at the root category level.
     */
    'createCategory'(
        parameters: Parameters<Paths.CreateCategory.PathParameters>,
        data?: Paths.CreateCategory.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.CreateCategory.Responses.$201>
    /**
     * getCategoriesPositions - Retrieve categories' positions
     */
    'getCategoriesPositions'(
        parameters: Parameters<Paths.GetCategoriesPositions.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetCategoriesPositions.Responses.$200>
    /**
     * setCategoriesPositions - Set categories' positions
     *
     * If the provided `id`s is missing an item, this item will be sorted last.
     */
    'setCategoriesPositions'(
        parameters: Parameters<Paths.SetCategoriesPositions.PathParameters>,
        data?: Paths.SetCategoriesPositions.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.SetCategoriesPositions.Responses.$200>
    /**
     * getCategory - Retrieve a category
     */
    'getCategory'(
        parameters: Parameters<
            Paths.GetCategory.QueryParameters & Paths.GetCategory.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetCategory.Responses.$200>
    /**
     * deleteCategory - Delete a category. Deletion is allowed for categories that have no articles or sub-categories.
     */
    'deleteCategory'(
        parameters: Parameters<Paths.DeleteCategory.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.DeleteCategory.Responses.$200>
    /**
     * listCategoryTranslations - List category's translations
     */
    'listCategoryTranslations'(
        parameters: Parameters<
            Paths.ListCategoryTranslations.QueryParameters &
                Paths.ListCategoryTranslations.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ListCategoryTranslations.Responses.$200>
    /**
     * createCategoryTranslation - Create a category translation
     *
     * Create a category translation in a given help center. If the provided `parent_category_id` field is `null` or is not provided, the category will be moved to the root level.
     */
    'createCategoryTranslation'(
        parameters: Parameters<Paths.CreateCategoryTranslation.PathParameters>,
        data?: Paths.CreateCategoryTranslation.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.CreateCategoryTranslation.Responses.$201>
    /**
     * updateCategoryTranslation - Update a category translation
     *
     * Update a category translation in a given help center. If the provided `parent_category_id` field is `null` or is not provided, the category will be moved to the root level.
     */
    'updateCategoryTranslation'(
        parameters: Parameters<Paths.UpdateCategoryTranslation.PathParameters>,
        data?: Paths.UpdateCategoryTranslation.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.UpdateCategoryTranslation.Responses.$200>
    /**
     * deleteCategoryTranslation - Delete a category translation
     *
     * So that a category have at least 1
     *     translation, you can't delete a translation if it's the only
     *     non-deleted translation.
     */
    'deleteCategoryTranslation'(
        parameters: Parameters<Paths.DeleteCategoryTranslation.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.DeleteCategoryTranslation.Responses.$200>
    /**
     * getCategoryTree - Retrieve the category, its subcategories and subarticles in a tree structure
     */
    'getCategoryTree'(
        parameters: Parameters<
            Paths.GetCategoryTree.QueryParameters &
                Paths.GetCategoryTree.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetCategoryTree.Responses.$200>
    /**
     * getSubCategoriesPositions - Retrieve sub-categories' positions
     *
     * The category id that will be used as the root node of the tree. If `0` is provided, the children ids of the top level categories of the help center will be returned
     */
    'getSubCategoriesPositions'(
        parameters: Parameters<Paths.GetSubCategoriesPositions.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetSubCategoriesPositions.Responses.$200>
    /**
     * setSubCategoriesPositions - Set sub-categories' positions
     *
     * The category id that will be used as the root node of the tree. If `0` is provided, the children ids of the top level categories of the help center will be returned
     */
    'setSubCategoriesPositions'(
        parameters: Parameters<Paths.SetSubCategoriesPositions.PathParameters>,
        data?: Paths.SetSubCategoriesPositions.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.SetSubCategoriesPositions.Responses.$200>
    /**
     * list - List all shop-mappings
     */
    'list'(
        parameters?: Parameters<Paths.List.QueryParameters> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.List.Responses.$200>
    /**
     * upsertArticleTemplateReview - Review an AI article template
     */
    'upsertArticleTemplateReview'(
        parameters: Parameters<Paths.UpsertArticleTemplateReview.PathParameters>,
        data?: Paths.UpsertArticleTemplateReview.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.UpsertArticleTemplateReview.Responses.$204>
    /**
     * listAIArticleTemplatesByHelpCenter - Retrieve AI article templates by help center
     */
    'listAIArticleTemplatesByHelpCenter'(
        parameters: Parameters<Paths.ListAIArticleTemplatesByHelpCenter.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ListAIArticleTemplatesByHelpCenter.Responses.$200>
    /**
     * listAIArticleTemplatesByHelpCenterAndStore - Retrieve AI article templates by help center
     */
    'listAIArticleTemplatesByHelpCenterAndStore'(
        parameters: Parameters<Paths.ListAIArticleTemplatesByHelpCenterAndStore.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ListAIArticleTemplatesByHelpCenterAndStore.Responses.$200>
    /**
     * listAIArticleTemplates - Retrieve AI article templates for account
     */
    'listAIArticleTemplates'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ListAIArticleTemplates.Responses.$200>
    /**
     * listArticleTemplates - List article templates
     */
    'listArticleTemplates'(
        parameters?: Parameters<Paths.ListArticleTemplates.QueryParameters> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ListArticleTemplates.Responses.$200>
    /**
     * getArticleTemplate - Retrieve article template
     */
    'getArticleTemplate'(
        parameters: Parameters<
            Paths.GetArticleTemplate.QueryParameters &
                Paths.GetArticleTemplate.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetArticleTemplate.Responses.$200>
    /**
     * getAttachmentUploadPolicy - Generate a signed url to upload a file based on the declared policy
     */
    'getAttachmentUploadPolicy'(
        parameters?: Parameters<Paths.GetAttachmentUploadPolicy.QueryParameters> | null,
        data?: Paths.GetAttachmentUploadPolicy.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetAttachmentUploadPolicy.Responses.$201>
    /**
     * checkContactFormNameExists - Check that a contact form with the provided name exists
     */
    'checkContactFormNameExists'(
        parameters: Parameters<Paths.CheckContactFormNameExists.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.CheckContactFormNameExists.Responses.$204>
    /**
     * listContactForms - List the contact forms
     */
    'listContactForms'(
        parameters?: Parameters<Paths.ListContactForms.QueryParameters> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ListContactForms.Responses.$200>
    /**
     * createContactForm - Create a Contact Form
     */
    'createContactForm'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.CreateContactForm.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.CreateContactForm.Responses.$201>
    /**
     * getContactForm - Retrieve a Contact form
     */
    'getContactForm'(
        parameters: Parameters<Paths.GetContactForm.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetContactForm.Responses.$200>
    /**
     * updateContactForm - Update a Contact Form
     */
    'updateContactForm'(
        parameters: Parameters<Paths.UpdateContactForm.PathParameters>,
        data?: Paths.UpdateContactForm.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.UpdateContactForm.Responses.$200>
    /**
     * deleteContactForm - Delete a Contact Form
     */
    'deleteContactForm'(
        parameters: Parameters<Paths.DeleteContactForm.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.DeleteContactForm.Responses.$204>
    /**
     * getContactFormByUid - Retrieve a Contact form by uid
     */
    'getContactFormByUid'(
        parameters: Parameters<Paths.GetContactFormByUid.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetContactFormByUid.Responses.$200>
    /**
     * submitContactFormByUid - Submit a Contact Form by uid
     */
    'submitContactFormByUid'(
        parameters: Parameters<Paths.SubmitContactFormByUid.PathParameters>,
        data?: Paths.SubmitContactFormByUid.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.SubmitContactFormByUid.Responses.$204>
    /**
     * getContactFormAutomationSettings - Get a Contact Form automation settings
     */
    'getContactFormAutomationSettings'(
        parameters: Parameters<Paths.GetContactFormAutomationSettings.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetContactFormAutomationSettings.Responses.$200>
    /**
     * upsertContactFormAutomationSettings - Update a Contact Form automation settings
     */
    'upsertContactFormAutomationSettings'(
        parameters: Parameters<Paths.UpsertContactFormAutomationSettings.PathParameters>,
        data?: Paths.UpsertContactFormAutomationSettings.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.UpsertContactFormAutomationSettings.Responses.$200>
    /**
     * contactFormPurgeCache - Purge cache for Contact Form
     */
    'contactFormPurgeCache'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.ContactFormPurgeCache.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ContactFormPurgeCache.Responses.$201>
    /**
     * updateEmailIntegration - Update the contact form email integration values
     *
     * This will update all the contact forms that are using the "deactivated_integration_id" for the contact form feature. If a "fallback_integration" is provided, those contact forms will use this new integration for the contact form feature. Else, the contact form feature will be disabled.
     */
    'updateEmailIntegration'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.UpdateEmailIntegration.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.UpdateEmailIntegration.Responses.$204>
    /**
     * getContactFormEmailIntegrationByIntegrationId - Retrieve a Contact Form email integration by integration id
     */
    'getContactFormEmailIntegrationByIntegrationId'(
        parameters: Parameters<
            Paths.GetContactFormEmailIntegrationByIntegrationId.QueryParameters &
                Paths.GetContactFormEmailIntegrationByIntegrationId.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetContactFormEmailIntegrationByIntegrationId.Responses.$200>
    /**
     * listContactFormShopifyPageEmbedments - List the Contact Form Shopify Page Embedments
     */
    'listContactFormShopifyPageEmbedments'(
        parameters: Parameters<Paths.ListContactFormShopifyPageEmbedments.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ListContactFormShopifyPageEmbedments.Responses.$200>
    /**
     * createContactFormShopifyPageEmbedment - Create a Contact Form Shopify Page Embedment
     *
     * The creation endpoint accepts 2 payloads:
     *     - {title: string; pageUrlPath: string} - embed in a new page
     *     - {position: PageEmbedmentPosition, pageExternalId: string} - embed in an existing page
     */
    'createContactFormShopifyPageEmbedment'(
        parameters: Parameters<Paths.CreateContactFormShopifyPageEmbedment.PathParameters>,
        data?: Paths.CreateContactFormShopifyPageEmbedment.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.CreateContactFormShopifyPageEmbedment.Responses.$201>
    /**
     * updateContactFormShopifyPageEmbedment - Update a Contact Form Shopify Page Embedment
     */
    'updateContactFormShopifyPageEmbedment'(
        parameters: Parameters<Paths.UpdateContactFormShopifyPageEmbedment.PathParameters>,
        data?: Paths.UpdateContactFormShopifyPageEmbedment.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.UpdateContactFormShopifyPageEmbedment.Responses.$200>
    /**
     * deleteContactFormShopifyPageEmbedment - Delete a Contact Form Shopify Page Embedment
     */
    'deleteContactFormShopifyPageEmbedment'(
        parameters: Parameters<Paths.DeleteContactFormShopifyPageEmbedment.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.DeleteContactFormShopifyPageEmbedment.Responses.$204>
    /**
     * listContactFormShopifyPages - List the Contact Form Shopify Pages available for a Contact Form Embedment
     */
    'listContactFormShopifyPages'(
        parameters: Parameters<Paths.ListContactFormShopifyPages.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ListContactFormShopifyPages.Responses.$200>
    /**
     * listHelpCenterShopifyPageEmbedments - List the Help Center Shopify Page Embedments
     */
    'listHelpCenterShopifyPageEmbedments'(
        parameters: Parameters<Paths.ListHelpCenterShopifyPageEmbedments.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ListHelpCenterShopifyPageEmbedments.Responses.$200>
    /**
     * createHelpCenterShopifyPageEmbedment - Create a Help Center Form Shopify Page Embedment
     *
     * The creation endpoint accepts 2 payloads:
     *     - {title: string; pageUrlPath: string} - embed in a new page
     *     - {position: PageEmbedmentPosition, pageExternalId: string} - embed in an existing page
     */
    'createHelpCenterShopifyPageEmbedment'(
        parameters: Parameters<Paths.CreateHelpCenterShopifyPageEmbedment.PathParameters>,
        data?: Paths.CreateHelpCenterShopifyPageEmbedment.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.CreateHelpCenterShopifyPageEmbedment.Responses.$201>
    /**
     * updateHelpCenterShopifyPageEmbedment - Update a Help Center Shopify Page Embedment
     */
    'updateHelpCenterShopifyPageEmbedment'(
        parameters: Parameters<Paths.UpdateHelpCenterShopifyPageEmbedment.PathParameters>,
        data?: Paths.UpdateHelpCenterShopifyPageEmbedment.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.UpdateHelpCenterShopifyPageEmbedment.Responses.$200>
    /**
     * deleteHelpCenterShopifyPageEmbedment - Delete a Help Center Shopify Page Embedment
     */
    'deleteHelpCenterShopifyPageEmbedment'(
        parameters: Parameters<Paths.DeleteHelpCenterShopifyPageEmbedment.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.DeleteHelpCenterShopifyPageEmbedment.Responses.$204>
    /**
     * listHelpCenterShopifyPages - List the Help Center Shopify Pages available for a Help Center Embedment
     */
    'listHelpCenterShopifyPages'(
        parameters: Parameters<Paths.ListHelpCenterShopifyPages.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ListHelpCenterShopifyPages.Responses.$200>
    /**
     * createAccessToken - Generate JWT token
     */
    'createAccessToken'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.CreateAccessToken.Responses.$201>
    /**
     * getFileIngestion - List file ingestion logs
     */
    'getFileIngestion'(
        parameters: Parameters<
            Paths.GetFileIngestion.QueryParameters &
                Paths.GetFileIngestion.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetFileIngestion.Responses.$200>
    /**
     * createFileIngestion - Create and start file ingestion
     */
    'createFileIngestion'(
        parameters: Parameters<Paths.CreateFileIngestion.PathParameters>,
        data?: Paths.CreateFileIngestion.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.CreateFileIngestion.Responses.$201>
    /**
     * deleteFileIngestion - Delete file ingestion
     */
    'deleteFileIngestion'(
        parameters: Parameters<Paths.DeleteFileIngestion.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.DeleteFileIngestion.Responses.$200>
    /**
     * getFileIngestionArticleTitlesAndStatus - Get article titles and visibility status for a file ingestion log
     */
    'getFileIngestionArticleTitlesAndStatus'(
        parameters: Parameters<
            Paths.GetFileIngestionArticleTitlesAndStatus.QueryParameters &
                Paths.GetFileIngestionArticleTitlesAndStatus.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetFileIngestionArticleTitlesAndStatus.Responses.$200>
    /**
     * listGoogleFonts - List google fonts
     */
    'listGoogleFonts'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ListGoogleFonts.Responses.$200>
    /**
     * listAIGuidancesByHelpCenterAndStore - Retrieve AI guidances by help center
     */
    'listAIGuidancesByHelpCenterAndStore'(
        parameters: Parameters<Paths.ListAIGuidancesByHelpCenterAndStore.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ListAIGuidancesByHelpCenterAndStore.Responses.$200>
    /**
     * importCsv - Import a CSV file
     */
    'importCsv'(
        parameters: Parameters<Paths.ImportCsv.PathParameters>,
        data?: Paths.ImportCsv.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ImportCsv.Responses.$201>
    /**
     * analyseCsv - Provide information on a CSV file with a preview of its rows
     */
    'analyseCsv'(
        parameters: Parameters<Paths.AnalyseCsv.PathParameters>,
        data?: Paths.AnalyseCsv.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.AnalyseCsv.Responses.$200>
    /**
     * generateCsvTemplate - Generate a template CSV based on the help-center's languages
     */
    'generateCsvTemplate'(
        parameters: Parameters<Paths.GenerateCsvTemplate.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GenerateCsvTemplate.Responses.$200>
    /**
     * createHotswapSessionToken - Generate hotswap session token
     */
    'createHotswapSessionToken'(
        parameters: Parameters<Paths.CreateHotswapSessionToken.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.CreateHotswapSessionToken.Responses.$201>
    /**
     * complete - Webhook called by hotswap when import is completed
     */
    'complete'(
        parameters: Parameters<Paths.Complete.PathParameters>,
        data?: Paths.Complete.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.Complete.Responses.$201>
    /**
     * getHotswapStatus - Get hotswap import status
     */
    'getHotswapStatus'(
        parameters: Parameters<Paths.GetHotswapStatus.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetHotswapStatus.Responses.$200>
    /**
     * listIngestedResources - List ingested resources by ingestion log id
     */
    'listIngestedResources'(
        parameters: Parameters<
            Paths.ListIngestedResources.QueryParameters &
                Paths.ListIngestedResources.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ListIngestedResources.Responses.$200>
    /**
     * getIngestedResource - Get an ingested resource by id
     */
    'getIngestedResource'(
        parameters: Parameters<Paths.GetIngestedResource.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetIngestedResource.Responses.$200>
    /**
     * updateIngestedResource - Update ingested resource
     */
    'updateIngestedResource'(
        parameters: Parameters<Paths.UpdateIngestedResource.PathParameters>,
        data?: Paths.UpdateIngestedResource.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.UpdateIngestedResource.Responses.$200>
    /**
     * updateAllIngestedResourcesStatus - Update status of all ingested resources by ingestion log id
     */
    'updateAllIngestedResourcesStatus'(
        parameters: Parameters<Paths.UpdateAllIngestedResourcesStatus.PathParameters>,
        data?: Paths.UpdateAllIngestedResourcesStatus.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.UpdateAllIngestedResourcesStatus.Responses.$200>
    /**
     * getIngestionLogs - Get ingestion logs
     */
    'getIngestionLogs'(
        parameters: Parameters<
            Paths.GetIngestionLogs.QueryParameters &
                Paths.GetIngestionLogs.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetIngestionLogs.Responses.$200>
    /**
     * startIngestion - Trigger external content ingestion
     */
    'startIngestion'(
        parameters: Parameters<Paths.StartIngestion.PathParameters>,
        data?: Paths.StartIngestion.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.StartIngestion.Responses.$201>
    /**
     * handleArticleIngestionDone - Webhook integration with Apify
     */
    'handleArticleIngestionDone'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.HandleArticleIngestionDone.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.HandleArticleIngestionDone.Responses.$201>
    /**
     * handleIngestionFail - Webhook integration with Apify to update status
     */
    'handleIngestionFail'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.HandleIngestionFail.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.HandleIngestionFail.Responses.$204>
    /**
     * getContactFormMailtoReplacementConfig - Get a Contact Form Mailto Replacement Config
     */
    'getContactFormMailtoReplacementConfig'(
        parameters: Parameters<Paths.GetContactFormMailtoReplacementConfig.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetContactFormMailtoReplacementConfig.Responses.$200>
    /**
     * upsertContactFormShopifyMailtoReplacement - Create, Update or Delete a Contact Form Mailto Replacement Config
     *
     * If the emails array is empty, the config will be deleted
     */
    'upsertContactFormShopifyMailtoReplacement'(
        parameters: Parameters<Paths.UpsertContactFormShopifyMailtoReplacement.PathParameters>,
        data?: Paths.UpsertContactFormShopifyMailtoReplacement.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.UpsertContactFormShopifyMailtoReplacement.Responses.$200>
    /**
     * getContactFormShopifyMailtoReplacementConfig
     */
    'getContactFormShopifyMailtoReplacementConfig'(
        parameters: Parameters<Paths.GetContactFormShopifyMailtoReplacementConfig.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetContactFormShopifyMailtoReplacementConfig.Responses.$200>
    /**
     * listNavigationLinks - List navigation links
     */
    'listNavigationLinks'(
        parameters: Parameters<
            Paths.ListNavigationLinks.QueryParameters &
                Paths.ListNavigationLinks.PathParameters
        >,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.ListNavigationLinks.Responses.$200>
    /**
     * createNavigationLink - Create a navigation link
     */
    'createNavigationLink'(
        parameters: Parameters<Paths.CreateNavigationLink.PathParameters>,
        data?: Paths.CreateNavigationLink.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.CreateNavigationLink.Responses.$201>
    /**
     * updateNavigationLink - Update a navigation link
     */
    'updateNavigationLink'(
        parameters: Parameters<Paths.UpdateNavigationLink.PathParameters>,
        data?: Paths.UpdateNavigationLink.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.UpdateNavigationLink.Responses.$200>
    /**
     * deleteNavigationLink - Delete a navigation link
     */
    'deleteNavigationLink'(
        parameters: Parameters<Paths.DeleteNavigationLink.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.DeleteNavigationLink.Responses.$200>
    /**
     * getNavigationLinksPositions - Retrieve navigation links' positions
     */
    'getNavigationLinksPositions'(
        parameters: Parameters<Paths.GetNavigationLinksPositions.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.GetNavigationLinksPositions.Responses.$200>
    /**
     * setNavigationLinksPositions - Set navigation links' positions
     *
     * If the provided `id`s is missing an item, this item will be sorted last.
     */
    'setNavigationLinksPositions'(
        parameters: Parameters<Paths.SetNavigationLinksPositions.PathParameters>,
        data?: Paths.SetNavigationLinksPositions.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.SetNavigationLinksPositions.Responses.$200>
    /**
     * handoverWorkflowExecution - Hand over a workflow execution
     */
    'handoverWorkflowExecution'(
        parameters?: Parameters<UnknownParamsObject> | null,
        data?: Paths.HandoverWorkflowExecution.RequestBody,
        config?: AxiosRequestConfig,
    ): OperationResponse<Paths.HandoverWorkflowExecution.Responses.$204>
}

export interface PathsDictionary {
    ['/api/help-center/help-centers/{help_center_id}/article-ingestion-log/{article_ingestion_log_id}']: {
        /**
         * deleteArticleIngestionLog - Delete article ingestion log
         */
        'delete'(
            parameters: Parameters<Paths.DeleteArticleIngestionLog.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.DeleteArticleIngestionLog.Responses.$204>
    }
    ['/api/help-center/help-centers/{help_center_id}/article-ingestion-log']: {
        /**
         * getArticleIngestionLogs - Get article ingestion logs
         */
        'get'(
            parameters: Parameters<
                Paths.GetArticleIngestionLogs.QueryParameters &
                    Paths.GetArticleIngestionLogs.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetArticleIngestionLogs.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/article-ingestion-log/{article_ingestion_id}/articles']: {
        /**
         * getArticleIngestionArticleTitlesAndStatus - Get article titles and visibility status for an article ingestion log
         */
        'get'(
            parameters: Parameters<
                Paths.GetArticleIngestionArticleTitlesAndStatus.QueryParameters &
                    Paths.GetArticleIngestionArticleTitlesAndStatus.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetArticleIngestionArticleTitlesAndStatus.Responses.$200>
    }
    ['/api/help-center/help-centers/article-ingestion/knowledge-status']: {
        /**
         * getKnowledgeStatus - Get snippet help centers knowledge status
         */
        'get'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetKnowledgeStatus.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/categories/{category_id}/articles']: {
        /**
         * listCategoryArticles - List category's articles
         */
        'get'(
            parameters: Parameters<
                Paths.ListCategoryArticles.QueryParameters &
                    Paths.ListCategoryArticles.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ListCategoryArticles.Responses.$200>
        /**
         * deleteCategoryArticles - Delete category's articles
         */
        'delete'(
            parameters: Parameters<Paths.DeleteCategoryArticles.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.DeleteCategoryArticles.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/categories/{category_id}/articles/positions']: {
        /**
         * getCategoryArticlesPositions - Retrieve articles' positions in category
         */
        'get'(
            parameters: Parameters<Paths.GetCategoryArticlesPositions.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetCategoryArticlesPositions.Responses.$200>
        /**
         * setArticlesPositionsInCategory - Set articles' positions in category
         *
         * If the provided `id`s is missing an item, this item will be sorted last.
         */
        'put'(
            parameters: Parameters<Paths.SetArticlesPositionsInCategory.PathParameters>,
            data?: Paths.SetArticlesPositionsInCategory.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.SetArticlesPositionsInCategory.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/articles']: {
        /**
         * listArticles - List articles
         *
         * If you want to get articles ordered by `position` in a category, prefer using
         * `/categories/:category_id/articles`.
         */
        'get'(
            parameters: Parameters<
                Paths.ListArticles.QueryParameters &
                    Paths.ListArticles.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ListArticles.Responses.$200>
        /**
         * createArticle - Create an article
         *
         * Create an article for the given help center.
         *
         * A translation should be provided when creating an article.
         */
        'post'(
            parameters: Parameters<Paths.CreateArticle.PathParameters>,
            data?: Paths.CreateArticle.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.CreateArticle.Responses.$201>
    }
    ['/api/help-center/help-centers/{help_center_id}/stats']: {
        /**
         * getStatistics - Get article statistics for a date range
         */
        'get'(
            parameters: Parameters<
                Paths.GetStatistics.QueryParameters &
                    Paths.GetStatistics.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetStatistics.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/articles/uncategorized/positions']: {
        /**
         * getUncategorizedArticlesPositions - Retrieve uncategorized articles' positions
         */
        'get'(
            parameters: Parameters<Paths.GetUncategorizedArticlesPositions.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetUncategorizedArticlesPositions.Responses.$200>
        /**
         * setUncategorizedArticlesPositions - Set uncategorized articles' positions
         *
         * If the provided `id`s is missing an item, this item will be sorted last.
         */
        'put'(
            parameters: Parameters<Paths.SetUncategorizedArticlesPositions.PathParameters>,
            data?: Paths.SetUncategorizedArticlesPositions.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.SetUncategorizedArticlesPositions.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/articles/batch']: {
        /**
         * batchGetArticlesSourceType - Retrieve source types for multiple articles
         *
         * Returns the source type for each requested article ID
         */
        'post'(
            parameters: Parameters<Paths.BatchGetArticlesSourceType.PathParameters>,
            data?: Paths.BatchGetArticlesSourceType.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.BatchGetArticlesSourceType.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/articles/bulk-copy']: {
        /**
         * bulkCopyArticles - Bulk copy articles
         *
         * Copies multiple articles and their translations across multiple help center. This operation is supported only for Help Center type GUIDANCE
         */
        'post'(
            parameters: Parameters<Paths.BulkCopyArticles.PathParameters>,
            data?: Paths.BulkCopyArticles.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.BulkCopyArticles.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/articles/bulk']: {
        /**
         * bulkDeleteArticles - Bulk delete articles
         *
         * Deletes multiple articles and their translations in a single transaction. This operation is supported only for Help Center type GUIDANCE and FAQ
         */
        'delete'(
            parameters: Parameters<Paths.BulkDeleteArticles.PathParameters>,
            data?: Paths.BulkDeleteArticles.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.BulkDeleteArticles.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/articles/{id}']: {
        /**
         * getArticle - Retrieve an article
         */
        'get'(
            parameters: Parameters<
                Paths.GetArticle.QueryParameters &
                    Paths.GetArticle.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetArticle.Responses.$200>
        /**
         * updateArticle - Update an article
         */
        'put'(
            parameters: Parameters<Paths.UpdateArticle.PathParameters>,
            data?: Paths.UpdateArticle.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.UpdateArticle.Responses.$200>
        /**
         * deleteArticle - Delete an article
         */
        'delete'(
            parameters: Parameters<Paths.DeleteArticle.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.DeleteArticle.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/articles/{id}/copy']: {
        /**
         * copyArticle - Copy an article to another help center
         *
         * Copy an article from one help center to another.
         */
        'post'(
            parameters: Parameters<Paths.CopyArticle.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.CopyArticle.Responses.$201>
    }
    ['/api/help-center/help-centers/{help_center_id}/articles/{article_id}/translations']: {
        /**
         * listArticleTranslations - List article's translations
         */
        'get'(
            parameters: Parameters<
                Paths.ListArticleTranslations.QueryParameters &
                    Paths.ListArticleTranslations.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ListArticleTranslations.Responses.$200>
        /**
         * createArticleTranslation - Create an article translation
         */
        'post'(
            parameters: Parameters<Paths.CreateArticleTranslation.PathParameters>,
            data?: Paths.CreateArticleTranslation.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.CreateArticleTranslation.Responses.$201>
    }
    ['/api/help-center/help-centers/{help_center_id}/articles/{article_id}/translations/{locale}/intents']: {
        /**
         * getArticleTranslationIntents - List available intents for an article translation
         */
        'get'(
            parameters: Parameters<Paths.GetArticleTranslationIntents.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetArticleTranslationIntents.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/articles/{article_id}/translations/{locale}']: {
        /**
         * updateArticleTranslation - Update an article translation
         */
        'put'(
            parameters: Parameters<Paths.UpdateArticleTranslation.PathParameters>,
            data?: Paths.UpdateArticleTranslation.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.UpdateArticleTranslation.Responses.$200>
        /**
         * deleteArticleTranslation - Delete an article translation
         *
         * So that an article have at least 1
         *     translation, you can't delete a translation if it's the only
         *     non-deleted translation.
         */
        'delete'(
            parameters: Parameters<Paths.DeleteArticleTranslation.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.DeleteArticleTranslation.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/articles/{article_id}/translations/{locale}/publish-and-rebase']: {
        /**
         * publishAndRebaseArticleTranslation - Rebase draft and publish from current published version
         */
        'post'(
            parameters: Parameters<Paths.PublishAndRebaseArticleTranslation.PathParameters>,
            data?: Paths.PublishAndRebaseArticleTranslation.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.PublishAndRebaseArticleTranslation.Responses.$201>
    }
    ['/api/help-center/help-centers/{help_center_id}/articles/{article_id}/translations/{locale}/versions']: {
        /**
         * listArticleTranslationVersions - List all versions for an article translation
         *
         * Returns all versions for an article translation, optionally filtered to only published versions. When the "number" query parameter is provided, returns a single version by its version number instead of a paginated list.
         */
        'get'(
            parameters: Parameters<
                Paths.ListArticleTranslationVersions.QueryParameters &
                    Paths.ListArticleTranslationVersions.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ListArticleTranslationVersions.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/articles/{article_id}/translations/{locale}/versions/{version_id}']: {
        /**
         * getArticleTranslationVersion - Get a specific version of an article translation
         *
         * Returns a specific version by ID for an article translation.
         */
        'get'(
            parameters: Parameters<Paths.GetArticleTranslationVersion.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetArticleTranslationVersion.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/articles/{article_id}/translations/{locale}/draft']: {
        /**
         * deleteArticleTranslationDraft - Delete draft version of article translation
         *
         * Discards unpublished draft changes and reverts the translation to the current
         *       published version. This operation will delete the article as a whole if there is no published version.
         *       Otherwise, it will delete the latest draft version of the translation. It will fail if there is no latest draft version.
         *
         *       The endpoint will return the current published version of the translation if it exists, otherwise it will return nothing.
         */
        'delete'(
            parameters: Parameters<Paths.DeleteArticleTranslationDraft.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<
            | Paths.DeleteArticleTranslationDraft.Responses.$200
            | Paths.DeleteArticleTranslationDraft.Responses.$204
        >
    }
    ['/api/help-center/help-centers/{help_center_id}/articles/translations/bulk/visibility']: {
        /**
         * bulkUpdateArticleTranslationsVisibility - Bulk update article translations visibility status
         *
         * Updates visibility status for all translations of multiple articles. Creates new versions for all translations and updates visibility status across all locales.
         */
        'put'(
            parameters: Parameters<Paths.BulkUpdateArticleTranslationsVisibility.PathParameters>,
            data?: Paths.BulkUpdateArticleTranslationsVisibility.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.BulkUpdateArticleTranslationsVisibility.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/articles/{article_id}/translations/{locale}/ratings']: {
        /**
         * createArticleTranslationRating - Create an article translation rating
         */
        'post'(
            parameters: Parameters<Paths.CreateArticleTranslationRating.PathParameters>,
            data?: Paths.CreateArticleTranslationRating.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.CreateArticleTranslationRating.Responses.$201>
    }
    ['/api/help-center/help-centers/{help_center_id}/articles/{article_id}/translations/{locale}/ratings/{ratingId}']: {
        /**
         * updateArticleTranslationRating - Update an article translation rating
         */
        'put'(
            parameters: Parameters<Paths.UpdateArticleTranslationRating.PathParameters>,
            data?: Paths.UpdateArticleTranslationRating.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.UpdateArticleTranslationRating.Responses.$200>
        /**
         * deleteArticleTranslationRating - Removes an article translation rating
         */
        'delete'(
            parameters: Parameters<Paths.DeleteArticleTranslationRating.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.DeleteArticleTranslationRating.Responses.$200>
    }
    ['/api/help-center/help-centers']: {
        /**
         * createHelpCenter - Create a help center
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.CreateHelpCenter.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.CreateHelpCenter.Responses.$200>
        /**
         * listHelpCenters - List help centers
         *
         * List help centers.
         *
         * If authenticated as agent, returns the list of help centers associated with the account domain
         * the agent belongs to.
         */
        'get'(
            parameters?: Parameters<Paths.ListHelpCenters.QueryParameters> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ListHelpCenters.Responses.$200>
    }
    ['/api/help-center/help-centers/knowledge-hub-articles']: {
        /**
         * getKnowledgeHubArticles - Get knowledge hub articles for guidance, FAQ, and snippet help centers
         *
         * Retrieves articles from guidance, FAQ, and/or snippet help centers. At least one help center ID must be provided. Agent authentication is restricted to their own account.
         */
        'get'(
            parameters?: Parameters<Paths.GetKnowledgeHubArticles.QueryParameters> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetKnowledgeHubArticles.Responses.$200>
    }
    ['/api/help-center/help-centers/account']: {
        /**
         * getAccountInfo - Get account information for a help center
         *
         * When both subdomain and custom_domain are provided, the subdomain will be used to search the help center
         */
        'get'(
            parameters?: Parameters<Paths.GetAccountInfo.QueryParameters> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetAccountInfo.Responses.$200>
    }
    ['/api/help-center/help-centers/subdomain/{subdomain}']: {
        /**
         * checkHelpCenterWithSubdomainExists - Check that a help center with this subdomain exists
         */
        'head'(
            parameters: Parameters<Paths.CheckHelpCenterWithSubdomainExists.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.CheckHelpCenterWithSubdomainExists.Responses.$204>
    }
    ['/api/help-center/help-centers/{help_center_id}']: {
        /**
         * getHelpCenter - Retrieve a help center
         */
        'get'(
            parameters: Parameters<
                Paths.GetHelpCenter.QueryParameters &
                    Paths.GetHelpCenter.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetHelpCenter.Responses.$200>
        /**
         * updateHelpCenter - Update a help center
         */
        'put'(
            parameters: Parameters<Paths.UpdateHelpCenter.PathParameters>,
            data?: Paths.UpdateHelpCenter.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.UpdateHelpCenter.Responses.$200>
        /**
         * deleteHelpCenter - Delete a help center
         */
        'delete'(
            parameters: Parameters<Paths.DeleteHelpCenter.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.DeleteHelpCenter.Responses.$200>
    }
    ['/api/help-center/help-centers/uid/{uid}']: {
        /**
         * getHelpCenterByUid - Retrieve a Help Center by uid
         */
        'get'(
            parameters: Parameters<
                Paths.GetHelpCenterByUid.QueryParameters &
                    Paths.GetHelpCenterByUid.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetHelpCenterByUid.Responses.$200>
    }
    ['/api/help-center/help-centers/delete-account']: {
        /**
         * deleteAccountHelpCenters - Delete all Help centers of an account
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.DeleteAccountHelpCenters.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.DeleteAccountHelpCenters.Responses.$201>
    }
    ['/api/help-center/help-centers/shop-name/{shop_name}/purge-cache']: {
        /**
         * purgeCache - Purge CDN cache
         */
        'post'(
            parameters: Parameters<Paths.PurgeCache.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.PurgeCache.Responses.$201>
    }
    ['/api/help-center/help-centers/{help_center_id}/duplicate']: {
        /**
         * duplicateHelpCenter - Duplicate a help center
         *
         * Duplicate a help center with all its translations, categories, articles, navigation links and redirects.
         */
        'post'(
            parameters: Parameters<Paths.DuplicateHelpCenter.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.DuplicateHelpCenter.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/automation-settings']: {
        /**
         * getHelpCenterAutomationSettings - Get a Help center automation settings
         */
        'get'(
            parameters: Parameters<Paths.GetHelpCenterAutomationSettings.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetHelpCenterAutomationSettings.Responses.$200>
        /**
         * upsertHelpCenterAutomationSettings - Update a Help center automation settings
         */
        'put'(
            parameters: Parameters<Paths.UpsertHelpCenterAutomationSettings.PathParameters>,
            data?: Paths.UpsertHelpCenterAutomationSettings.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.UpsertHelpCenterAutomationSettings.Responses.$200>
    }
    ['/api/help-center/help-centers/integrations/{integration_id}/email-integration']: {
        /**
         * getHelpCenterEmailIntegrationByIntegrationId - Retrieve a Help Center email integration by integration_id
         */
        'get'(
            parameters: Parameters<
                Paths.GetHelpCenterEmailIntegrationByIntegrationId.QueryParameters &
                    Paths.GetHelpCenterEmailIntegrationByIntegrationId.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetHelpCenterEmailIntegrationByIntegrationId.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/sitemap-urls']: {
        /**
         * getHelpCenterSiteMapUrls - Get all the site map urls for the help center with the given id
         */
        'get'(
            parameters: Parameters<Paths.GetHelpCenterSiteMapUrls.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetHelpCenterSiteMapUrls.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/translations']: {
        /**
         * listHelpCenterTranslations - List help center's translations
         */
        'get'(
            parameters: Parameters<
                Paths.ListHelpCenterTranslations.QueryParameters &
                    Paths.ListHelpCenterTranslations.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ListHelpCenterTranslations.Responses.$200>
        /**
         * createHelpCenterTranslation - Create a help center translation
         */
        'post'(
            parameters: Parameters<Paths.CreateHelpCenterTranslation.PathParameters>,
            data?: Paths.CreateHelpCenterTranslation.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.CreateHelpCenterTranslation.Responses.$201>
    }
    ['/api/help-center/help-centers/{help_center_id}/translations/{locale}']: {
        /**
         * updateHelpCenterTranslation - Update a help center translation
         */
        'put'(
            parameters: Parameters<Paths.UpdateHelpCenterTranslation.PathParameters>,
            data?: Paths.UpdateHelpCenterTranslation.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.UpdateHelpCenterTranslation.Responses.$200>
        /**
         * deleteHelpCenterTranslation - Delete a help center translation
         */
        'delete'(
            parameters: Parameters<Paths.DeleteHelpCenterTranslation.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.DeleteHelpCenterTranslation.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/custom-domains']: {
        /**
         * listCustomDomains - List custom domains
         */
        'get'(
            parameters: Parameters<
                Paths.ListCustomDomains.QueryParameters &
                    Paths.ListCustomDomains.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ListCustomDomains.Responses.$200>
        /**
         * createCustomDomain - Create a custom domain
         */
        'post'(
            parameters: Parameters<Paths.CreateCustomDomain.PathParameters>,
            data?: Paths.CreateCustomDomain.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.CreateCustomDomain.Responses.$201>
    }
    ['/api/help-center/help-centers/{help_center_id}/custom-domains/{hostname}']: {
        /**
         * getCustomDomain - Retrieve a custom domain
         */
        'get'(
            parameters: Parameters<Paths.GetCustomDomain.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetCustomDomain.Responses.$200>
        /**
         * deleteCustomDomain - Delete a custom domain
         */
        'delete'(
            parameters: Parameters<Paths.DeleteCustomDomain.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.DeleteCustomDomain.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/custom-domains/{hostname}/check-status']: {
        /**
         * checkCustomDomainStatus - Check the status of a custom domain
         */
        'post'(
            parameters: Parameters<Paths.CheckCustomDomainStatus.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.CheckCustomDomainStatus.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/extra-html']: {
        /**
         * getExtraHTML - Get a help center's extra HTML
         */
        'get'(
            parameters: Parameters<
                Paths.GetExtraHTML.QueryParameters &
                    Paths.GetExtraHTML.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetExtraHTML.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/extra-html/{locale}']: {
        /**
         * updateExtraHTML - Update a help center's extra HTML
         */
        'put'(
            parameters: Parameters<Paths.UpdateExtraHTML.PathParameters>,
            data?: Paths.UpdateExtraHTML.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.UpdateExtraHTML.Responses.$200>
    }
    ['/api/help-center/locales']: {
        /**
         * listLocales - List supported locales
         */
        'get'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ListLocales.Responses.$200>
    }
    ['/api/help-center/locales/{locale}']: {
        /**
         * getLocale - Retrieve a locale
         */
        'get'(
            parameters: Parameters<Paths.GetLocale.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetLocale.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/redirects']: {
        /**
         * createRedirect - Create a new redirect
         */
        'post'(
            parameters: Parameters<Paths.CreateRedirect.PathParameters>,
            data?: Paths.CreateRedirect.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.CreateRedirect.Responses.$201>
        /**
         * listRedirects - List all redirects
         *
         * TODO: pagination
         */
        'get'(
            parameters: Parameters<
                Paths.ListRedirects.QueryParameters &
                    Paths.ListRedirects.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ListRedirects.Responses.$200>
        /**
         * deleteRedirect - Delete a redirect
         */
        'delete'(
            parameters: Parameters<
                Paths.DeleteRedirect.QueryParameters &
                    Paths.DeleteRedirect.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.DeleteRedirect.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/categories']: {
        /**
         * createCategory - Create a category
         *
         * Create a category in a given help center. If the provided `parent_category_id` field is `null` or is not provided, the category will be created at the root category level.
         */
        'post'(
            parameters: Parameters<Paths.CreateCategory.PathParameters>,
            data?: Paths.CreateCategory.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.CreateCategory.Responses.$201>
        /**
         * listCategories - List categories
         *
         * List the top level categories with pagination metadata.
         */
        'get'(
            parameters: Parameters<
                Paths.ListCategories.QueryParameters &
                    Paths.ListCategories.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ListCategories.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/categories/positions']: {
        /**
         * getCategoriesPositions - Retrieve categories' positions
         */
        'get'(
            parameters: Parameters<Paths.GetCategoriesPositions.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetCategoriesPositions.Responses.$200>
        /**
         * setCategoriesPositions - Set categories' positions
         *
         * If the provided `id`s is missing an item, this item will be sorted last.
         */
        'put'(
            parameters: Parameters<Paths.SetCategoriesPositions.PathParameters>,
            data?: Paths.SetCategoriesPositions.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.SetCategoriesPositions.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/categories/{id}']: {
        /**
         * getCategory - Retrieve a category
         */
        'get'(
            parameters: Parameters<
                Paths.GetCategory.QueryParameters &
                    Paths.GetCategory.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetCategory.Responses.$200>
        /**
         * deleteCategory - Delete a category. Deletion is allowed for categories that have no articles or sub-categories.
         */
        'delete'(
            parameters: Parameters<Paths.DeleteCategory.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.DeleteCategory.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/categories/{category_id}/translations']: {
        /**
         * listCategoryTranslations - List category's translations
         */
        'get'(
            parameters: Parameters<
                Paths.ListCategoryTranslations.QueryParameters &
                    Paths.ListCategoryTranslations.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ListCategoryTranslations.Responses.$200>
        /**
         * createCategoryTranslation - Create a category translation
         *
         * Create a category translation in a given help center. If the provided `parent_category_id` field is `null` or is not provided, the category will be moved to the root level.
         */
        'post'(
            parameters: Parameters<Paths.CreateCategoryTranslation.PathParameters>,
            data?: Paths.CreateCategoryTranslation.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.CreateCategoryTranslation.Responses.$201>
    }
    ['/api/help-center/help-centers/{help_center_id}/categories/{category_id}/translations/{locale}']: {
        /**
         * updateCategoryTranslation - Update a category translation
         *
         * Update a category translation in a given help center. If the provided `parent_category_id` field is `null` or is not provided, the category will be moved to the root level.
         */
        'put'(
            parameters: Parameters<Paths.UpdateCategoryTranslation.PathParameters>,
            data?: Paths.UpdateCategoryTranslation.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.UpdateCategoryTranslation.Responses.$200>
        /**
         * deleteCategoryTranslation - Delete a category translation
         *
         * So that a category have at least 1
         *     translation, you can't delete a translation if it's the only
         *     non-deleted translation.
         */
        'delete'(
            parameters: Parameters<Paths.DeleteCategoryTranslation.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.DeleteCategoryTranslation.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/categories/{parent_category_id}/tree']: {
        /**
         * getCategoryTree - Retrieve the category, its subcategories and subarticles in a tree structure
         */
        'get'(
            parameters: Parameters<
                Paths.GetCategoryTree.QueryParameters &
                    Paths.GetCategoryTree.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetCategoryTree.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/categories/{parent_category_id}/positions']: {
        /**
         * getSubCategoriesPositions - Retrieve sub-categories' positions
         *
         * The category id that will be used as the root node of the tree. If `0` is provided, the children ids of the top level categories of the help center will be returned
         */
        'get'(
            parameters: Parameters<Paths.GetSubCategoriesPositions.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetSubCategoriesPositions.Responses.$200>
        /**
         * setSubCategoriesPositions - Set sub-categories' positions
         *
         * The category id that will be used as the root node of the tree. If `0` is provided, the children ids of the top level categories of the help center will be returned
         */
        'put'(
            parameters: Parameters<Paths.SetSubCategoriesPositions.PathParameters>,
            data?: Paths.SetSubCategoriesPositions.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.SetSubCategoriesPositions.Responses.$200>
    }
    ['/api/help-center/shop-integration-mappings']: {
        /**
         * list - List all shop-mappings
         */
        'get'(
            parameters?: Parameters<Paths.List.QueryParameters> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.List.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/article-templates/review']: {
        /**
         * upsertArticleTemplateReview - Review an AI article template
         */
        'put'(
            parameters: Parameters<Paths.UpsertArticleTemplateReview.PathParameters>,
            data?: Paths.UpsertArticleTemplateReview.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.UpsertArticleTemplateReview.Responses.$204>
    }
    ['/api/help-center/help-centers/{help_center_id}/article-templates/ai']: {
        /**
         * listAIArticleTemplatesByHelpCenter - Retrieve AI article templates by help center
         */
        'get'(
            parameters: Parameters<Paths.ListAIArticleTemplatesByHelpCenter.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ListAIArticleTemplatesByHelpCenter.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/article-templates/ai/{store_integration_id}']: {
        /**
         * listAIArticleTemplatesByHelpCenterAndStore - Retrieve AI article templates by help center
         */
        'get'(
            parameters: Parameters<Paths.ListAIArticleTemplatesByHelpCenterAndStore.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ListAIArticleTemplatesByHelpCenterAndStore.Responses.$200>
    }
    ['/api/help-center/article-templates/ai']: {
        /**
         * listAIArticleTemplates - Retrieve AI article templates for account
         */
        'get'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ListAIArticleTemplates.Responses.$200>
    }
    ['/api/help-center/article-templates']: {
        /**
         * listArticleTemplates - List article templates
         */
        'get'(
            parameters?: Parameters<Paths.ListArticleTemplates.QueryParameters> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ListArticleTemplates.Responses.$200>
    }
    ['/api/help-center/article-templates/{template_key}']: {
        /**
         * getArticleTemplate - Retrieve article template
         */
        'get'(
            parameters: Parameters<
                Paths.GetArticleTemplate.QueryParameters &
                    Paths.GetArticleTemplate.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetArticleTemplate.Responses.$200>
    }
    ['/api/help-center/attachments']: {
        /**
         * getAttachmentUploadPolicy - Generate a signed url to upload a file based on the declared policy
         */
        'post'(
            parameters?: Parameters<Paths.GetAttachmentUploadPolicy.QueryParameters> | null,
            data?: Paths.GetAttachmentUploadPolicy.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetAttachmentUploadPolicy.Responses.$201>
    }
    ['/api/help-center/contact-forms/name/{input_name}']: {
        /**
         * checkContactFormNameExists - Check that a contact form with the provided name exists
         */
        'head'(
            parameters: Parameters<Paths.CheckContactFormNameExists.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.CheckContactFormNameExists.Responses.$204>
    }
    ['/api/help-center/contact-forms']: {
        /**
         * createContactForm - Create a Contact Form
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.CreateContactForm.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.CreateContactForm.Responses.$201>
        /**
         * listContactForms - List the contact forms
         */
        'get'(
            parameters?: Parameters<Paths.ListContactForms.QueryParameters> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ListContactForms.Responses.$200>
    }
    ['/api/help-center/contact-forms/{id}']: {
        /**
         * getContactForm - Retrieve a Contact form
         */
        'get'(
            parameters: Parameters<Paths.GetContactForm.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetContactForm.Responses.$200>
        /**
         * updateContactForm - Update a Contact Form
         */
        'put'(
            parameters: Parameters<Paths.UpdateContactForm.PathParameters>,
            data?: Paths.UpdateContactForm.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.UpdateContactForm.Responses.$200>
        /**
         * deleteContactForm - Delete a Contact Form
         */
        'delete'(
            parameters: Parameters<Paths.DeleteContactForm.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.DeleteContactForm.Responses.$204>
    }
    ['/api/help-center/contact-forms/uid/{uid}']: {
        /**
         * getContactFormByUid - Retrieve a Contact form by uid
         */
        'get'(
            parameters: Parameters<Paths.GetContactFormByUid.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetContactFormByUid.Responses.$200>
    }
    ['/api/help-center/contact-forms/uid/{uid}/submit']: {
        /**
         * submitContactFormByUid - Submit a Contact Form by uid
         */
        'post'(
            parameters: Parameters<Paths.SubmitContactFormByUid.PathParameters>,
            data?: Paths.SubmitContactFormByUid.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.SubmitContactFormByUid.Responses.$204>
    }
    ['/api/help-center/contact-forms/{id}/automation-settings']: {
        /**
         * getContactFormAutomationSettings - Get a Contact Form automation settings
         */
        'get'(
            parameters: Parameters<Paths.GetContactFormAutomationSettings.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetContactFormAutomationSettings.Responses.$200>
        /**
         * upsertContactFormAutomationSettings - Update a Contact Form automation settings
         */
        'put'(
            parameters: Parameters<Paths.UpsertContactFormAutomationSettings.PathParameters>,
            data?: Paths.UpsertContactFormAutomationSettings.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.UpsertContactFormAutomationSettings.Responses.$200>
    }
    ['/api/help-center/contact-forms/purge-cache']: {
        /**
         * contactFormPurgeCache - Purge cache for Contact Form
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.ContactFormPurgeCache.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ContactFormPurgeCache.Responses.$201>
    }
    ['/api/help-center/contact-forms/update-email-integration']: {
        /**
         * updateEmailIntegration - Update the contact form email integration values
         *
         * This will update all the contact forms that are using the "deactivated_integration_id" for the contact form feature. If a "fallback_integration" is provided, those contact forms will use this new integration for the contact form feature. Else, the contact form feature will be disabled.
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.UpdateEmailIntegration.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.UpdateEmailIntegration.Responses.$204>
    }
    ['/api/help-center/contact-forms/integrations/{integration_id}/email-integration']: {
        /**
         * getContactFormEmailIntegrationByIntegrationId - Retrieve a Contact Form email integration by integration id
         */
        'get'(
            parameters: Parameters<
                Paths.GetContactFormEmailIntegrationByIntegrationId.QueryParameters &
                    Paths.GetContactFormEmailIntegrationByIntegrationId.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetContactFormEmailIntegrationByIntegrationId.Responses.$200>
    }
    ['/api/help-center/contact-forms/{contact_form_id}/shopify-page-embedments']: {
        /**
         * createContactFormShopifyPageEmbedment - Create a Contact Form Shopify Page Embedment
         *
         * The creation endpoint accepts 2 payloads:
         *     - {title: string; pageUrlPath: string} - embed in a new page
         *     - {position: PageEmbedmentPosition, pageExternalId: string} - embed in an existing page
         */
        'post'(
            parameters: Parameters<Paths.CreateContactFormShopifyPageEmbedment.PathParameters>,
            data?: Paths.CreateContactFormShopifyPageEmbedment.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.CreateContactFormShopifyPageEmbedment.Responses.$201>
        /**
         * listContactFormShopifyPageEmbedments - List the Contact Form Shopify Page Embedments
         */
        'get'(
            parameters: Parameters<Paths.ListContactFormShopifyPageEmbedments.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ListContactFormShopifyPageEmbedments.Responses.$200>
    }
    ['/api/help-center/contact-forms/{contact_form_id}/shopify-page-embedments/{embedment_id}']: {
        /**
         * updateContactFormShopifyPageEmbedment - Update a Contact Form Shopify Page Embedment
         */
        'put'(
            parameters: Parameters<Paths.UpdateContactFormShopifyPageEmbedment.PathParameters>,
            data?: Paths.UpdateContactFormShopifyPageEmbedment.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.UpdateContactFormShopifyPageEmbedment.Responses.$200>
        /**
         * deleteContactFormShopifyPageEmbedment - Delete a Contact Form Shopify Page Embedment
         */
        'delete'(
            parameters: Parameters<Paths.DeleteContactFormShopifyPageEmbedment.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.DeleteContactFormShopifyPageEmbedment.Responses.$204>
    }
    ['/api/help-center/contact-forms/{contact_form_id}/shopify-pages']: {
        /**
         * listContactFormShopifyPages - List the Contact Form Shopify Pages available for a Contact Form Embedment
         */
        'get'(
            parameters: Parameters<Paths.ListContactFormShopifyPages.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ListContactFormShopifyPages.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/shopify-page-embedments']: {
        /**
         * createHelpCenterShopifyPageEmbedment - Create a Help Center Form Shopify Page Embedment
         *
         * The creation endpoint accepts 2 payloads:
         *     - {title: string; pageUrlPath: string} - embed in a new page
         *     - {position: PageEmbedmentPosition, pageExternalId: string} - embed in an existing page
         */
        'post'(
            parameters: Parameters<Paths.CreateHelpCenterShopifyPageEmbedment.PathParameters>,
            data?: Paths.CreateHelpCenterShopifyPageEmbedment.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.CreateHelpCenterShopifyPageEmbedment.Responses.$201>
        /**
         * listHelpCenterShopifyPageEmbedments - List the Help Center Shopify Page Embedments
         */
        'get'(
            parameters: Parameters<Paths.ListHelpCenterShopifyPageEmbedments.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ListHelpCenterShopifyPageEmbedments.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/shopify-page-embedments/{embedment_id}']: {
        /**
         * updateHelpCenterShopifyPageEmbedment - Update a Help Center Shopify Page Embedment
         */
        'put'(
            parameters: Parameters<Paths.UpdateHelpCenterShopifyPageEmbedment.PathParameters>,
            data?: Paths.UpdateHelpCenterShopifyPageEmbedment.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.UpdateHelpCenterShopifyPageEmbedment.Responses.$200>
        /**
         * deleteHelpCenterShopifyPageEmbedment - Delete a Help Center Shopify Page Embedment
         */
        'delete'(
            parameters: Parameters<Paths.DeleteHelpCenterShopifyPageEmbedment.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.DeleteHelpCenterShopifyPageEmbedment.Responses.$204>
    }
    ['/api/help-center/help-centers/{help_center_id}/shopify-pages']: {
        /**
         * listHelpCenterShopifyPages - List the Help Center Shopify Pages available for a Help Center Embedment
         */
        'get'(
            parameters: Parameters<Paths.ListHelpCenterShopifyPages.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ListHelpCenterShopifyPages.Responses.$200>
    }
    ['/api/help-center/auth']: {
        /**
         * createAccessToken - Generate JWT token
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.CreateAccessToken.Responses.$201>
    }
    ['/api/help-center/help-centers/{help_center_id}/file-ingestion']: {
        /**
         * createFileIngestion - Create and start file ingestion
         */
        'post'(
            parameters: Parameters<Paths.CreateFileIngestion.PathParameters>,
            data?: Paths.CreateFileIngestion.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.CreateFileIngestion.Responses.$201>
        /**
         * getFileIngestion - List file ingestion logs
         */
        'get'(
            parameters: Parameters<
                Paths.GetFileIngestion.QueryParameters &
                    Paths.GetFileIngestion.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetFileIngestion.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/file-ingestion/{file_ingestion_id}']: {
        /**
         * deleteFileIngestion - Delete file ingestion
         */
        'delete'(
            parameters: Parameters<Paths.DeleteFileIngestion.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.DeleteFileIngestion.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/file-ingestion/{file_ingestion_id}/articles']: {
        /**
         * getFileIngestionArticleTitlesAndStatus - Get article titles and visibility status for a file ingestion log
         */
        'get'(
            parameters: Parameters<
                Paths.GetFileIngestionArticleTitlesAndStatus.QueryParameters &
                    Paths.GetFileIngestionArticleTitlesAndStatus.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetFileIngestionArticleTitlesAndStatus.Responses.$200>
    }
    ['/api/help-center/google-fonts']: {
        /**
         * listGoogleFonts - List google fonts
         */
        'get'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ListGoogleFonts.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/guidances/ai/{store_integration_id}']: {
        /**
         * listAIGuidancesByHelpCenterAndStore - Retrieve AI guidances by help center
         */
        'get'(
            parameters: Parameters<Paths.ListAIGuidancesByHelpCenterAndStore.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ListAIGuidancesByHelpCenterAndStore.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/import/csv/process']: {
        /**
         * importCsv - Import a CSV file
         */
        'post'(
            parameters: Parameters<Paths.ImportCsv.PathParameters>,
            data?: Paths.ImportCsv.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ImportCsv.Responses.$201>
    }
    ['/api/help-center/help-centers/{help_center_id}/import/csv/analysis']: {
        /**
         * analyseCsv - Provide information on a CSV file with a preview of its rows
         */
        'post'(
            parameters: Parameters<Paths.AnalyseCsv.PathParameters>,
            data?: Paths.AnalyseCsv.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.AnalyseCsv.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/import/csv/template']: {
        /**
         * generateCsvTemplate - Generate a template CSV based on the help-center's languages
         */
        'post'(
            parameters: Parameters<Paths.GenerateCsvTemplate.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GenerateCsvTemplate.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/import/hotswap/token']: {
        /**
         * createHotswapSessionToken - Generate hotswap session token
         */
        'post'(
            parameters: Parameters<Paths.CreateHotswapSessionToken.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.CreateHotswapSessionToken.Responses.$201>
    }
    ['/api/help-center/help-centers/{help_center_id}/import/hotswap/complete']: {
        /**
         * complete - Webhook called by hotswap when import is completed
         */
        'post'(
            parameters: Parameters<Paths.Complete.PathParameters>,
            data?: Paths.Complete.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.Complete.Responses.$201>
    }
    ['/api/help-center/help-centers/{help_center_id}/import/hotswap/status']: {
        /**
         * getHotswapStatus - Get hotswap import status
         */
        'get'(
            parameters: Parameters<Paths.GetHotswapStatus.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetHotswapStatus.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/ingested-resources/{article_ingestion_log_id}']: {
        /**
         * listIngestedResources - List ingested resources by ingestion log id
         */
        'get'(
            parameters: Parameters<
                Paths.ListIngestedResources.QueryParameters &
                    Paths.ListIngestedResources.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ListIngestedResources.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/ingested-resource/{id}']: {
        /**
         * getIngestedResource - Get an ingested resource by id
         */
        'get'(
            parameters: Parameters<Paths.GetIngestedResource.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetIngestedResource.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/ingested-resource/{ingested_resource_id}']: {
        /**
         * updateIngestedResource - Update ingested resource
         */
        'put'(
            parameters: Parameters<Paths.UpdateIngestedResource.PathParameters>,
            data?: Paths.UpdateIngestedResource.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.UpdateIngestedResource.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/ingested-resources/{article_ingestion_log_id}/status']: {
        /**
         * updateAllIngestedResourcesStatus - Update status of all ingested resources by ingestion log id
         */
        'put'(
            parameters: Parameters<Paths.UpdateAllIngestedResourcesStatus.PathParameters>,
            data?: Paths.UpdateAllIngestedResourcesStatus.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.UpdateAllIngestedResourcesStatus.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/ingestions']: {
        /**
         * getIngestionLogs - Get ingestion logs
         */
        'get'(
            parameters: Parameters<
                Paths.GetIngestionLogs.QueryParameters &
                    Paths.GetIngestionLogs.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetIngestionLogs.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/ingestions/start']: {
        /**
         * startIngestion - Trigger external content ingestion
         */
        'post'(
            parameters: Parameters<Paths.StartIngestion.PathParameters>,
            data?: Paths.StartIngestion.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.StartIngestion.Responses.$201>
    }
    ['/api/help-center/ingestion/done']: {
        /**
         * handleArticleIngestionDone - Webhook integration with Apify
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.HandleArticleIngestionDone.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.HandleArticleIngestionDone.Responses.$201>
    }
    ['/api/help-center/ingestions/fail']: {
        /**
         * handleIngestionFail - Webhook integration with Apify to update status
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.HandleIngestionFail.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.HandleIngestionFail.Responses.$204>
    }
    ['/api/help-center/contact-forms/{contact_form_id}/mailto-replacement-config']: {
        /**
         * getContactFormMailtoReplacementConfig - Get a Contact Form Mailto Replacement Config
         */
        'get'(
            parameters: Parameters<Paths.GetContactFormMailtoReplacementConfig.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetContactFormMailtoReplacementConfig.Responses.$200>
        /**
         * upsertContactFormShopifyMailtoReplacement - Create, Update or Delete a Contact Form Mailto Replacement Config
         *
         * If the emails array is empty, the config will be deleted
         */
        'put'(
            parameters: Parameters<Paths.UpsertContactFormShopifyMailtoReplacement.PathParameters>,
            data?: Paths.UpsertContactFormShopifyMailtoReplacement.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.UpsertContactFormShopifyMailtoReplacement.Responses.$200>
    }
    ['/api/help-center/contact-forms/shop-name/{shop_name}/mailto-replacement-config']: {
        /**
         * getContactFormShopifyMailtoReplacementConfig
         */
        'get'(
            parameters: Parameters<Paths.GetContactFormShopifyMailtoReplacementConfig.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetContactFormShopifyMailtoReplacementConfig.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/navigation-links']: {
        /**
         * createNavigationLink - Create a navigation link
         */
        'post'(
            parameters: Parameters<Paths.CreateNavigationLink.PathParameters>,
            data?: Paths.CreateNavigationLink.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.CreateNavigationLink.Responses.$201>
        /**
         * listNavigationLinks - List navigation links
         */
        'get'(
            parameters: Parameters<
                Paths.ListNavigationLinks.QueryParameters &
                    Paths.ListNavigationLinks.PathParameters
            >,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.ListNavigationLinks.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/navigation-links/{id}']: {
        /**
         * updateNavigationLink - Update a navigation link
         */
        'put'(
            parameters: Parameters<Paths.UpdateNavigationLink.PathParameters>,
            data?: Paths.UpdateNavigationLink.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.UpdateNavigationLink.Responses.$200>
        /**
         * deleteNavigationLink - Delete a navigation link
         */
        'delete'(
            parameters: Parameters<Paths.DeleteNavigationLink.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.DeleteNavigationLink.Responses.$200>
    }
    ['/api/help-center/help-centers/{help_center_id}/navigation-links/{locale}/{group}/positions']: {
        /**
         * getNavigationLinksPositions - Retrieve navigation links' positions
         */
        'get'(
            parameters: Parameters<Paths.GetNavigationLinksPositions.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.GetNavigationLinksPositions.Responses.$200>
        /**
         * setNavigationLinksPositions - Set navigation links' positions
         *
         * If the provided `id`s is missing an item, this item will be sorted last.
         */
        'put'(
            parameters: Parameters<Paths.SetNavigationLinksPositions.PathParameters>,
            data?: Paths.SetNavigationLinksPositions.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.SetNavigationLinksPositions.Responses.$200>
    }
    ['/api/help-center/workflows/handover']: {
        /**
         * handoverWorkflowExecution - Hand over a workflow execution
         */
        'post'(
            parameters?: Parameters<UnknownParamsObject> | null,
            data?: Paths.HandoverWorkflowExecution.RequestBody,
            config?: AxiosRequestConfig,
        ): OperationResponse<Paths.HandoverWorkflowExecution.Responses.$204>
    }
}

export type Client = OpenAPIClient<OperationMethods, PathsDictionary>
