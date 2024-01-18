import {
  OpenAPIClient,
  Parameters,
  UnknownParamsObject,
  OperationResponse,
  AxiosRequestConfig,
} from 'openapi-client-axios'; 

declare namespace Components {
  namespace Schemas {
    export interface AccessTokenDto {
      access_token: string;
      token_type: string;
    }
    export interface AccountInfoDto {
      account_id: number;
      shop_name: string | null;
    }
    export interface AnalyseCsvRequestDto {
      /**
       * Configuration for analysing the CSV file.
       */
      file_url: string;
    }
    export interface AnalyseCsvResponseColumnDto {
      /**
       * example:
       * article_title
       */
      name: string;
      /**
       * example:
       * [
       *   "What is Gorgias?",
       *   "Installation Guide"
       * ]
       */
      samples: string[];
    }
    export interface AnalyseCsvResponseDto {
      result: AnalyseCsvResponseSuccessDto | AnalyseCsvResponseFailedDto;
    }
    export interface AnalyseCsvResponseFailedDto {
      /**
       * example:
       * FAILED
       */
      status: "FAILED";
      error: "MALFORMED_FILE" | "FILE_OVER_400_ROWS" | "INTERNAL";
    }
    export interface AnalyseCsvResponseSuccessDto {
      /**
       * example:
       * SUCCESS
       */
      status: "SUCCESS";
      columns: AnalyseCsvResponseColumnDto[];
      /**
       * example:
       * 1000
       */
      num_rows: number;
    }
    export interface ArticleColumns {
      locales: {
        [name: string]: ArticleLocaleColumns;
      };
    }
    export interface ArticleDto {
      /**
       * Creation date
       */
      created_datetime: string; // date-time
      /**
       * Update date
       */
      updated_datetime: string; // date-time
      /**
       * Deletion date
       */
      deleted_datetime?: string | null; // date-time
      category_id: number | null;
      available_locales: ("en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR")[];
      help_center_id: number;
      template_key?: "shippingPolicy" | "howToReturn" | "howToCancelOrder" | "howToTrackOrder" | "refundsOrExchanges" | "packageLostOrDamaged";
      id: number;
    }
    export interface ArticleListDataDto {
      id: number;
      unlisted_id: string;
      created_datetime: string; // date-time
      updated_datetime: string; // date-time
      deleted_datetime?: string | null; // date-time
      category_id: number | null;
      help_center_id: number;
      template_key?: "shippingPolicy" | "howToReturn" | "howToCancelOrder" | "howToTrackOrder" | "refundsOrExchanges" | "packageLostOrDamaged";
      available_locales: ("en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR")[];
      rating: {
        up: number;
        down: number;
      };
      translation: {
        created_datetime: string; // date-time
        updated_datetime: string; // date-time
        deleted_datetime?: string | null; // date-time
        title: string;
        excerpt: string;
        content: string;
        slug: string;
        locale: "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
        article_id: number;
        category_id: number | null;
        article_unlisted_id: string;
        seo_meta: {
          title: string | null;
          description: string | null;
        };
        visibility_status: "PUBLIC" | "UNLISTED";
        is_current: boolean;
        rating: Rating;
        /**
         * Gives details on how the translation fallback was chosen:
         * - `undefined`: the translation is the requested one
         * - `default`: the translation is in help center's default locale
         * - `available`: the translation corresponds to the first available one
         */
        locale_fallback?: "default" | "available";
      };
    }
    export interface ArticleListDataTranslationDto {
      created_datetime: string; // date-time
      updated_datetime: string; // date-time
      deleted_datetime?: string | null; // date-time
      title: string;
      excerpt: string;
      content: string;
      slug: string;
      locale: "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
      article_id: number;
      category_id: number | null;
      article_unlisted_id: string;
      seo_meta: {
        title: string | null;
        description: string | null;
      };
      visibility_status: "PUBLIC" | "UNLISTED";
      is_current: boolean;
      rating: Rating;
      /**
       * Gives details on how the translation fallback was chosen:
       * - `undefined`: the translation is the requested one
       * - `default`: the translation is in help center's default locale
       * - `available`: the translation corresponds to the first available one
       */
      locale_fallback?: "default" | "available";
    }
    export interface ArticleLocaleColumns {
      title: ColumnSourceCsvOnly;
      content: ColumnSourceCsvOnly;
      slug: ColumnSourceCsvOrAutoGenerated;
      excerpt?: ColumnSourceCsvOrAutoGenerated;
    }
    export interface ArticleTemplateDto {
      key: "shippingPolicy" | "howToReturn" | "howToCancelOrder" | "howToTrackOrder" | "refundsOrExchanges" | "packageLostOrDamaged";
      title: string;
      html_content: string;
    }
    export interface ArticleTranslationRatingDto {
      /**
       * Creation date
       */
      created_datetime: string; // date-time
      /**
       * Update date
       */
      updated_datetime: string; // date-time
      /**
       * Deletion date
       */
      deleted_datetime?: string | null; // date-time
      id: number;
      rating: "1" | "-1";
      context: RatingContextDto;
    }
    export interface ArticleTranslationResponseDto {
      created_datetime: string; // date-time
      updated_datetime: string; // date-time
      deleted_datetime?: string | null; // date-time
      title: string;
      excerpt: string;
      content: string;
      slug: string;
      locale: "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
      article_id: number;
      category_id: number | null;
      article_unlisted_id: string;
      seo_meta: {
        title: string | null;
        description: string | null;
      };
      visibility_status: "PUBLIC" | "UNLISTED";
      is_current: boolean;
    }
    export interface ArticleTranslationSeoMeta {
      title: string | null;
      description: string | null;
    }
    export interface ArticleTranslationWithRating {
      created_datetime: string; // date-time
      updated_datetime: string; // date-time
      deleted_datetime?: string | null; // date-time
      title: string;
      excerpt: string;
      content: string;
      slug: string;
      locale: "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
      article_id: number;
      category_id: number | null;
      article_unlisted_id: string;
      seo_meta: {
        title: string | null;
        description: string | null;
      };
      visibility_status: "PUBLIC" | "UNLISTED";
      is_current: boolean;
      rating: Rating;
    }
    export interface ArticleTranslationsListPageDto {
      meta: PageMetaDto;
      object: "list";
      data: ArticleTranslationWithRating[];
    }
    export interface ArticleWithLocalTranslation {
      created_datetime: string; // date-time
      updated_datetime: string; // date-time
      deleted_datetime?: string | null; // date-time
      unlisted_id: string;
      available_locales: ("en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR")[];
      category_id: number | null;
      help_center_id: number;
      template_key?: "shippingPolicy" | "howToReturn" | "howToCancelOrder" | "howToTrackOrder" | "refundsOrExchanges" | "packageLostOrDamaged";
      id: number;
      translation: LocalArticleTranslation;
    }
    export interface ArticlesListPageDto {
      meta: PageMetaDto;
      object: "list";
      data: ArticleListDataDto[];
    }
    export interface AttachmentChannelDto {
      /**
       * Channel ID
       * example:
       * 1
       */
      id: number;
      /**
       * Channel type
       * example:
       * CF
       */
      type: "HC" | "CF";
    }
    export interface AttachmentFileDto {
      /**
       * File name
       * example:
       * file.pdf
       */
      name: string;
      /**
       * File size in bytes
       * example:
       * 123456
       */
      size: number;
      /**
       * File mimetype
       * example:
       * application/pdf
       */
      mimetype: string;
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
      workflows: WorkflowVo[];
      /**
       * example:
       * {
       *   "enabled": true
       * }
       */
      order_management: {
        enabled: boolean;
      };
    }
    export interface CategoriesListPageDto {
      meta: PageMetaDto;
      object: "list";
      data: CategoryWithLocalTranslationDto[];
    }
    export interface CategoryColumns {
      locales: {
        [name: string]: CategoryLocaleColumns;
      };
    }
    export interface CategoryLocaleColumns {
      name: ColumnSourceCsvOnly;
      description?: ColumnSourceCsvOnly;
      slug: ColumnSourceCsvOrAutoGenerated;
    }
    export interface CategoryTranslationDto {
      /**
       * Creation date
       */
      created_datetime: string; // date-time
      /**
       * Update date
       */
      updated_datetime: string; // date-time
      /**
       * Deletion date
       */
      deleted_datetime?: string | null; // date-time
      category_id: number;
      category_unlisted_id: string;
      parent_category_id: number | null;
      locale: "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
      seo_meta: {
        title: string | null;
        description: string | null;
      };
      visibility_status: "PUBLIC" | "UNLISTED";
      /**
       * example:
       * https://cdn.shopify.com/image.jpg
       */
      image_url: string | null;
      title: string;
      description: string | null;
      slug: string;
    }
    export interface CategoryTranslationSeoMeta {
      title: string | null;
      description: string | null;
    }
    export interface CategoryTranslationsListPageDto {
      meta: PageMetaDto;
      object: "list";
      data: CategoryTranslationDto[];
    }
    export interface CategoryTreeArticleDto {
      /**
       * Creation date
       */
      created_datetime: string; // date-time
      /**
       * Update date
       */
      updated_datetime: string; // date-time
      /**
       * Deletion date
       */
      deleted_datetime?: string | null; // date-time
      unlisted_id: string;
      category_id: number | null;
      help_center_id: number;
      template_key?: "shippingPolicy" | "howToReturn" | "howToCancelOrder" | "howToTrackOrder" | "refundsOrExchanges" | "packageLostOrDamaged";
      available_locales: ("en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR")[];
      translation_versions: {
        current: {
          created_datetime: string; // date-time
          updated_datetime: string; // date-time
          deleted_datetime?: string | null; // date-time
          title: string;
          excerpt: string;
          slug: string;
          locale: "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
          article_id: number;
          category_id: number | null;
          article_unlisted_id: string;
          seo_meta: {
            title: string | null;
            description: string | null;
          };
          visibility_status: "PUBLIC" | "UNLISTED";
          is_current: boolean;
        } | null;
        draft: {
          created_datetime: string; // date-time
          updated_datetime: string; // date-time
          deleted_datetime?: string | null; // date-time
          title: string;
          excerpt: string;
          slug: string;
          locale: "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
          article_id: number;
          category_id: number | null;
          article_unlisted_id: string;
          seo_meta: {
            title: string | null;
            description: string | null;
          };
          visibility_status: "PUBLIC" | "UNLISTED";
          is_current: boolean;
        };
      };
      id: number;
    }
    export interface CategoryTreeArticleTranslationVersion {
      current: {
        created_datetime: string; // date-time
        updated_datetime: string; // date-time
        deleted_datetime?: string | null; // date-time
        title: string;
        excerpt: string;
        slug: string;
        locale: "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
        article_id: number;
        category_id: number | null;
        article_unlisted_id: string;
        seo_meta: {
          title: string | null;
          description: string | null;
        };
        visibility_status: "PUBLIC" | "UNLISTED";
        is_current: boolean;
      } | null;
      draft: {
        created_datetime: string; // date-time
        updated_datetime: string; // date-time
        deleted_datetime?: string | null; // date-time
        title: string;
        excerpt: string;
        slug: string;
        locale: "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
        article_id: number;
        category_id: number | null;
        article_unlisted_id: string;
        seo_meta: {
          title: string | null;
          description: string | null;
        };
        visibility_status: "PUBLIC" | "UNLISTED";
        is_current: boolean;
      };
    }
    export interface CategoryTreeDto {
      /**
       * Creation date
       */
      created_datetime: string; // date-time
      /**
       * Update date
       */
      updated_datetime: string; // date-time
      /**
       * Deletion date
       */
      deleted_datetime?: string | null; // date-time
      unlisted_id: string;
      help_center_id: number;
      available_locales: ("en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR")[];
      translation: {
        /**
         * Creation date
         */
        created_datetime: string; // date-time
        /**
         * Update date
         */
        updated_datetime: string; // date-time
        /**
         * Deletion date
         */
        deleted_datetime?: string | null; // date-time
        category_id: number;
        category_unlisted_id: string;
        parent_category_id: number | null;
        locale: "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
        seo_meta: {
          title: string | null;
          description: string | null;
        };
        visibility_status: "PUBLIC" | "UNLISTED";
        /**
         * example:
         * https://cdn.shopify.com/image.jpg
         */
        image_url: string | null;
        title: string;
        description: string | null;
        slug: string;
      } | null;
      children: CategoryTreeDto[];
      articles?: CategoryTreeArticleDto[];
      id: number;
    }
    export interface CategoryWithLocalTranslationDto {
      /**
       * Creation date
       */
      created_datetime: string; // date-time
      /**
       * Update date
       */
      updated_datetime: string; // date-time
      /**
       * Deletion date
       */
      deleted_datetime?: string | null; // date-time
      unlisted_id: string;
      help_center_id: number;
      available_locales: ("en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR")[];
      translation: LocalCategoryTranslation;
      id: number;
    }
    export interface ChatContactInfo {
      deactivated_datetime: string | null;
      description: string;
    }
    export interface ChatContactInfoDto {
      enabled: boolean;
      description: string;
    }
    export interface ColumnSourceAutoGenerated {
      /**
       * example:
       * AUTO_GENERATED
       */
      kind: string; // AUTO_GENERATED
    }
    export interface ColumnSourceCsv {
      /**
       * example:
       * CSV_COLUMN
       */
      kind: string; // CSV_COLUMN
      /**
       * example:
       * csv_file_column_1
       */
      csv_column: string;
    }
    export interface ColumnSourceCsvOnly {
      source: ColumnSourceCsv;
    }
    export interface ColumnSourceCsvOrAutoGenerated {
      source: ColumnSourceAutoGenerated | ColumnSourceCsv;
    }
    export interface ContactFormAttachmentDto {
      /**
       * The filename of the attachment
       * example:
       * image.png
       */
      filename: string;
      /**
       * The size of the attachment in bytes
       * example:
       * 123456
       */
      size: number;
      /**
       * The url of the attachment
       * example:
       * https://example.com/image.png
       */
      url: string;
    }
    export interface ContactFormDto {
      /**
       * Creation date
       */
      created_datetime: string; // date-time
      /**
       * Update date
       */
      updated_datetime: string; // date-time
      /**
       * Deletion date
       */
      deleted_datetime?: string | null; // date-time
      /**
       * Identifier
       * example:
       * 1
       */
      id: number;
      /**
       * Helpdesk account id
       * example:
       * 1
       */
      account_id: number;
      /**
       * Help center id
       * example:
       */
      help_center_id: number | null;
      /**
       * Name of the contact form instance
       * example:
       * My Contact Form
       */
      name: string;
      /**
       * Unique alphanumerical identifier
       * example:
       * g46hsfy6
       */
      uid: string;
      /**
       * Default supported locale
       * example:
       * en-US
       */
      default_locale: "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
      /**
       * Source of the creation of the contact form
       * example:
       * manual
       */
      source: "manual" | "help_center" | "migration";
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
        options: string[];
        /**
         * If true, the "Other" subject line option will be made available
         */
        allow_other: boolean;
      } | null;
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
        id: number;
        /**
         * Email value
         */
        email: string;
      } | null;
      /**
       * Code snippet template to use to embed this contact form
       */
      code_snippet_template: string;
      /**
       * Url template to use to construct the shareable Contact form link
       */
      url_template: string;
      shop_name: string | null;
      /**
       * Deactivation date
       */
      deactivated_datetime: string | null; // date-time
      /**
       * Automation settings id in contact form
       * example:
       * 2
       */
      automation_settings_id: number | null;
      integration_id: number | null;
    }
    export interface ContactFormPageDto {
      external_id: string;
      title: string;
      url_path: string;
      body_html: string | null;
    }
    export interface ContactFormSubmissionDto {
      /**
       * The full name of the user
       */
      full_name: string;
      /**
       * The email of the user
       * example:
       * test@test.com
       */
      email: string;
      /**
       * The subject of the message
       * example:
       * Feedback
       */
      subject: string;
      /**
       * The message of the user
       */
      message: string;
      /**
       * The url of the page where the form was submitted
       * example:
       * https://contact.gorgias.help/forms/abcde12345
       */
      url: string;
      /**
       * Whether the form was embedded or not
       * example:
       * true
       */
      is_embedded: boolean;
      attachments?: ContactFormAttachmentDto[];
    }
    export interface ContactFormsListPageDto {
      meta: PageMetaDto;
      object: "list";
      data: ContactFormDto[];
    }
    export interface ContactInfo {
      email: {
        deactivated_datetime: string | null;
        description: string;
        email: string;
      };
      phone: {
        deactivated_datetime: string | null;
        description: string;
        phone_numbers: ContactPhoneNumber[];
      };
      chat: {
        deactivated_datetime: string | null;
        description: string;
      };
    }
    export interface ContactInfoDto {
      email: EmailContactInfoDto;
      phone: PhoneContactInfoDto;
      chat: ChatContactInfoDto;
    }
    export interface ContactPhoneNumber {
      reference: string;
      phone_number: string;
    }
    export interface ContactPhoneNumberDto {
      reference: string;
      phone_number: string;
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
        locale: "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
        /**
         * The title of the article in the `locale`'s translation.
         * example:
         * How to cancel an order
         */
        title: string;
        /**
         * The excerpt of the article in the `locale`'s translation.
         * example:
         * Explains how to cancel an order
         */
        excerpt: string;
        /**
         * The content of the article in the `locale`'s translation.
         * 
         * Supports HTML formatted content.
         * example:
         * I can be <strong>HTML</strong>
         */
        content: string;
        /**
         * A slug for the article that'll be used to construct article's URLs.
         * 
         * Should only contains alphanumeric values and hyphens.
         * example:
         * cancel-an-order
         */
        slug: string;
        /**
         * The SEO meta attributes of the article in the `locale`'s translation.
         */
        seo_meta: {
          /**
           * The content of the `<title />` HTML tag for the article translation.
           */
          title: string | null;
          /**
           * The content of the `<meta name="description">` HTML tag for the article translation.
           */
          description: string | null;
        };
        /**
         * This field describes whether the translation is going to be published or not, and it defaults to true. If true, it means it will be the published version; if previously it was only in draft, it will become published. If false, it will be the draft version and therefore, unpublished.
         */
        is_current?: boolean;
        /**
         * The visibility status of the article.
         */
        visibility_status?: "PUBLIC" | "UNLISTED";
        /**
         * Used to change the categoryId of the article
         */
        category_id?: number | null;
      };
      category_id?: number | null;
      template_key?: "shippingPolicy" | "howToReturn" | "howToCancelOrder" | "howToTrackOrder" | "refundsOrExchanges" | "packageLostOrDamaged";
    }
    export interface CreateArticleTranslationDto {
      /**
       * The locale of the translation.
       * 
       * It should be in help center's supported locales.
       * example:
       * fr-FR
       */
      locale: "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
      /**
       * The title of the article in the `locale`'s translation.
       * example:
       * How to cancel an order
       */
      title: string;
      /**
       * The excerpt of the article in the `locale`'s translation.
       * example:
       * Explains how to cancel an order
       */
      excerpt: string;
      /**
       * The content of the article in the `locale`'s translation.
       * 
       * Supports HTML formatted content.
       * example:
       * I can be <strong>HTML</strong>
       */
      content: string;
      /**
       * A slug for the article that'll be used to construct article's URLs.
       * 
       * Should only contains alphanumeric values and hyphens.
       * example:
       * cancel-an-order
       */
      slug: string;
      /**
       * The SEO meta attributes of the article in the `locale`'s translation.
       */
      seo_meta: {
        /**
         * The content of the `<title />` HTML tag for the article translation.
         */
        title: string | null;
        /**
         * The content of the `<meta name="description">` HTML tag for the article translation.
         */
        description: string | null;
      };
      /**
       * This field describes whether the translation is going to be published or not, and it defaults to true. If true, it means it will be the published version; if previously it was only in draft, it will become published. If false, it will be the draft version and therefore, unpublished.
       */
      is_current?: boolean;
      /**
       * The visibility status of the article.
       */
      visibility_status?: "PUBLIC" | "UNLISTED";
      /**
       * Used to change the categoryId of the article
       */
      category_id?: number | null;
    }
    export interface CreateArticleTranslationRatingDto {
      /**
       * The rating of the article translation.
       * example:
       * -1
       */
      rating: "1" | "-1";
      context: {
      };
    }
    export interface CreateArticleTranslationSeoMetaDto {
      /**
       * The content of the `<title />` HTML tag for the article translation.
       */
      title: string | null;
      /**
       * The content of the `<meta name="description">` HTML tag for the article translation.
       */
      description: string | null;
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
        locale: "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
        /**
         * If the parent_category_is set to null change the category's parent to the root category
         * If it's set to a number set it to that specific category
         * If the property is not set, don't change anything
         */
        parent_category_id?: number | null;
        /**
         * The title of the category in the `locale`'s translation.
         * example:
         * Orders
         */
        title: string;
        /**
         * The description of the category in the `locale`'s translation.
         * example:
         * Information about orders
         */
        description: string | null;
        /**
         * A slug for the category that'll be used to construct category's URLs.
         * 
         * Should only contains alphanumeric values and hyphens.
         * example:
         * orders
         */
        slug: string;
        /**
         * The SEO meta attributes of the category in the `locale`'s translation.
         */
        seo_meta: {
          /**
           * The content of the `<title />` HTML tag for the category translation.
           */
          title: string | null;
          /**
           * The content of the `<meta name="description">` HTML tag for the category translation.
           */
          description: string | null;
        };
        /**
         * The visibility of the category. Can be either `PUBLIC` or `UNLISTED`.
         */
        visibility_status?: "PUBLIC" | "UNLISTED";
        /**
         * Category image URL
         * example:
         * https://cdn.shopify.com/image.jpg
         */
        image_url?: string | null;
      };
    }
    export interface CreateCategoryTranslationDto {
      /**
       * The locale of the translation.
       * 
       * It should be in help center's supported locales.
       * example:
       * fr-FR
       */
      locale: "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
      /**
       * If the parent_category_is set to null change the category's parent to the root category
       * If it's set to a number set it to that specific category
       * If the property is not set, don't change anything
       */
      parent_category_id?: number | null;
      /**
       * The title of the category in the `locale`'s translation.
       * example:
       * Orders
       */
      title: string;
      /**
       * The description of the category in the `locale`'s translation.
       * example:
       * Information about orders
       */
      description: string | null;
      /**
       * A slug for the category that'll be used to construct category's URLs.
       * 
       * Should only contains alphanumeric values and hyphens.
       * example:
       * orders
       */
      slug: string;
      /**
       * The SEO meta attributes of the category in the `locale`'s translation.
       */
      seo_meta: {
        /**
         * The content of the `<title />` HTML tag for the category translation.
         */
        title: string | null;
        /**
         * The content of the `<meta name="description">` HTML tag for the category translation.
         */
        description: string | null;
      };
      /**
       * The visibility of the category. Can be either `PUBLIC` or `UNLISTED`.
       */
      visibility_status?: "PUBLIC" | "UNLISTED";
      /**
       * Category image URL
       * example:
       * https://cdn.shopify.com/image.jpg
       */
      image_url?: string | null;
    }
    export interface CreateCategoryTranslationSeoMetaDto {
      /**
       * The content of the `<title />` HTML tag for the category translation.
       */
      title: string | null;
      /**
       * The content of the `<meta name="description">` HTML tag for the category translation.
       */
      description: string | null;
    }
    export interface CreateContactFormDto {
      /**
       * Name of the Contact Form
       * example:
       * My Contact Form
       */
      name: string;
      /**
       * Contact Form default locale
       * example:
       * en-US
       */
      default_locale: "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
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
        id: number;
        /**
         * Email value
         */
        email: string;
      };
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
      subject_lines?: {
        /**
         * List of options that will be displayed to the user in the subject line's select dropdown
         * Each option can be from 2 to 50 character long
         * Max 15 options
         */
        options: string[];
        /**
         * If true, the "Other" subject line option will be made available
         */
        allow_other: boolean;
      } | null;
      shop_name?: string | null;
    }
    export interface CreateCustomDomainDto {
      hostname: string;
    }
    export interface CreateHelpCenterTranslationDto {
      /**
       * The locale of the translation.
       * 
       * It should be in help center's supported locales.
       * example:
       * fr-FR
       */
      locale: "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
      /**
       * The SEO meta attributes of the help center in the `locale`'s translation.
       */
      seo_meta: {
        /**
         * The content of the `<title />` HTML tag for the help center translation.
         */
        title: string | null;
        /**
         * The content of the `<meta name="description">` HTML tag for the help center translation.
         */
        description: string | null;
      };
      chat_app_key?: string | null;
    }
    export interface CreateHelpCenterTranslationSeoMetaDto {
      /**
       * The content of the `<title />` HTML tag for the help center translation.
       */
      title: string | null;
      /**
       * The content of the `<meta name="description">` HTML tag for the help center translation.
       */
      description: string | null;
    }
    export interface CreateHelpCenterWithAccountIdDto {
      /**
       * example:
       * My Help Center
       */
      name: string;
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
      subdomain?: string;
      default_locale: "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
      /**
       * Should be a valid URL.
       */
      favicon_url?: string | null;
      /**
       * Should be a valid URL.
       */
      brand_logo_url?: string | null;
      /**
       * Should be a valid URL.
       */
      brand_logo_light_url?: string | null;
      /**
       * Boolean indicating if search feature is deactivated for this Help center.
       * example:
       * false
       */
      search_deactivated?: boolean;
      primary_color?: string | null;
      theme?: {
      } | null;
      shop_name?: string | null;
      /**
       * Boolean indicating if self service is deactivated for this Help center.
       * example:
       * false
       */
      self_service_deactivated?: boolean;
      /**
       * Contains the integration email and id which will be used to create tickets from the contact form.
       */
      contact_form?: {
        card_enabled?: boolean;
        helpdesk_integration_email: string | null;
        helpdesk_integration_id: number | null;
        subject_lines?: {
          [name: string]: SubjectLineDto;
        };
      };
      source?: "manual" | "automation";
      gaid?: string | null; // GOOGLE_ANALYTICS_ID_REGEXP
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
        id: number;
        /**
         * Email value
         */
        email: string;
      } | null;
      account_id?: number;
    }
    export interface CreateNavigationLinkDto {
      /**
       * The label of the navigation link.
       */
      label: string;
      /**
       * The URL of the navigation link.
       * 
       * Should be an absolute URL with protocol and host.
       * example:
       * https://gorgias.com/pricing
       */
      value: string;
      /**
       * The locale of the navigation link.
       * 
       * It should be in help center's supported locales.
       * example:
       * fr-FR
       */
      locale: "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
      /**
       * The group of the navigation link.
       */
      group: "header" | "footer";
      meta?: NavigationLinkMeta;
    }
    export interface CreateRedirectDto {
      from: string;
      to: string;
    }
    export interface CreateShopifyPageEmbedmentDto {
      /**
       * example:
       * 229672878386
       */
      page_external_id?: string;
      /**
       * example:
       * /pages/my-new-page
       */
      page_url_path?: string; // SHOPIFY_PAGE_HANDLE_REGEX
      position?: "TOP" | "BOTTOM";
      /**
       * example:
       * My new page
       */
      title?: string;
    }
    export interface CreateSubjectLinesDto {
      /**
       * List of options that will be displayed to the user in the subject line's select dropdown
       * Each option can be from 2 to 50 character long
       * Max 15 options
       */
      options: string[];
      /**
       * If true, the "Other" subject line option will be made available
       */
      allow_other: boolean;
    }
    export interface CustomDomain {
      /**
       * Creation date
       */
      created_datetime: string; // date-time
      /**
       * Update date
       */
      updated_datetime: string; // date-time
      /**
       * Deletion date
       */
      deleted_datetime?: string | null; // date-time
      verification_errors?: string[];
      id: number;
      hostname: string;
      help_center_id: number;
      /**
       * The status of this custom domain:
       * - `active`: the custom domain is validated and working
       * - `pending`: the custom domain is pending validation
       * - `unknown`: the custom domain is in an unknown status, check `verification_errors`
       * to know more.
       */
      status: "active" | "pending" | "unknown";
    }
    export interface CustomDomainsListPageDto {
      meta: PageMetaDto;
      object: "list";
      data: CustomDomain[];
    }
    export interface DeleteAccountDto {
      /**
       * The account id whose help centers should be deleted
       * example:
       * 1
       */
      account_id: number;
    }
    export interface EmailContactInfo {
      deactivated_datetime: string | null;
      description: string;
      email: string;
    }
    export interface EmailContactInfoDto {
      email: string;
      enabled: boolean;
      description: string;
    }
    export interface EmailIntegrationDto {
      /**
       * Identifier
       */
      id: number;
      /**
       * Email value
       */
      email: string;
    }
    export interface ExtraHTML {
      extra_head: string;
      extra_head_deactivated_datetime: string | null; // date-time
      custom_header: string;
      custom_header_deactivated_datetime: string | null; // date-time
      custom_footer: string;
      custom_footer_deactivated_datetime: string | null; // date-time
    }
    export interface ExtraHTMLDto {
      /**
       * The HTML injected in the head
       * 
       * It should be in help center's supported locales.
       * example:
       * <div>....</div>
       */
      extra_head?: string;
      /**
       * Boolean indicating if the extra head should be injected.
       * example:
       * false
       */
      extra_head_deactivated?: boolean;
      /**
       * The HTML of the custom header
       * 
       * It should be in help center's supported locales.
       * example:
       * <div>....</div>
       */
      custom_header?: string;
      /**
       * Boolean indicating if the custom header should be injected.
       * example:
       * false
       */
      custom_header_deactivated?: boolean;
      /**
       * The HTML of the custom footer
       * 
       * It should be in help center's supported locales.
       * example:
       * <div>....</div>
       */
      custom_footer?: string;
      /**
       * Boolean indicating if the custom footer should be injected.
       * example:
       * false
       */
      custom_footer_deactivated?: boolean;
    }
    export interface FallbackEmailIntegrationDto {
      /**
       * example:
       * 12345
       */
      id: number;
      /**
       * example:
       * acme-support@gorgias.xyz
       */
      email: string;
    }
    export interface GetHelpCenterDto {
      /**
       * Creation date
       */
      created_datetime: string; // date-time
      /**
       * Update date
       */
      updated_datetime: string; // date-time
      /**
       * Deletion date
       */
      deleted_datetime?: string | null; // date-time
      id: number;
      /**
       * Unique alphanumerical identifier
       * example:
       * hcuid123
       */
      uid: string;
      name: string;
      subdomain: string;
      deactivated_datetime: string | null; // date-time
      readonly default_locale: "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
      supported_locales: ("en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR")[];
      favicon_url?: string | null;
      brand_logo_url?: string | null;
      brand_logo_light_url?: string | null;
      search_deactivated_datetime: string | null; // date-time
      powered_by_deactivated_datetime: string | null; // date-time
      algolia_api_key: string | null;
      algolia_app_id: string;
      algolia_index_name: string;
      primary_color: string;
      primary_font_family: string;
      theme: string;
      shop_name: string | null;
      self_service_deactivated_datetime: string | null; // date-time
      hotswap_session_token: string | null;
      source: "manual" | "automation";
      gaid: string | null;
      email_integration: {
        /**
         * Identifier
         */
        id: number;
        /**
         * Email value
         */
        email: string;
      } | null;
      /**
       * Automation settings id in help center
       * example:
       * 2
       */
      automation_settings_id: number | null;
      /**
       * Code snippet template to use to embed this help center
       */
      code_snippet_template: string;
      integration_id: number | null;
      account_id: number;
      translations?: HelpCenterTranslationDto[];
      redirects?: RedirectDto[];
    }
    export interface HelpCenterDto {
      /**
       * Creation date
       */
      created_datetime: string; // date-time
      /**
       * Update date
       */
      updated_datetime: string; // date-time
      /**
       * Deletion date
       */
      deleted_datetime?: string | null; // date-time
      id: number;
      /**
       * Unique alphanumerical identifier
       * example:
       * hcuid123
       */
      uid: string;
      name: string;
      subdomain: string;
      deactivated_datetime: string | null; // date-time
      readonly default_locale: "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
      supported_locales: ("en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR")[];
      favicon_url?: string | null;
      brand_logo_url?: string | null;
      brand_logo_light_url?: string | null;
      search_deactivated_datetime: string | null; // date-time
      powered_by_deactivated_datetime: string | null; // date-time
      algolia_api_key: string | null;
      algolia_app_id: string;
      algolia_index_name: string;
      primary_color: string;
      primary_font_family: string;
      theme: string;
      shop_name: string | null;
      self_service_deactivated_datetime: string | null; // date-time
      hotswap_session_token: string | null;
      source: "manual" | "automation";
      gaid: string | null;
      email_integration: {
        /**
         * Identifier
         */
        id: number;
        /**
         * Email value
         */
        email: string;
      } | null;
      /**
       * Automation settings id in help center
       * example:
       * 2
       */
      automation_settings_id: number | null;
      /**
       * Code snippet template to use to embed this help center
       */
      code_snippet_template: string;
      integration_id: number | null;
    }
    export interface HelpCenterStorePageDto {
      external_id: string;
      title: string;
      url_path: string;
      body_html: string | null;
    }
    export interface HelpCenterTranslationDto {
      /**
       * Creation date
       */
      created_datetime: string; // date-time
      /**
       * Update date
       */
      updated_datetime: string; // date-time
      /**
       * Deletion date
       */
      deleted_datetime?: string | null; // date-time
      help_center_id: number;
      banner_text: string | null;
      banner_image_url?: string | null;
      banner_image_vertical_offset: number;
      locale: "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
      seo_meta: {
        title: string | null;
        description: string | null;
      };
      contact_info: {
        email: {
          deactivated_datetime: string | null;
          description: string;
          email: string;
        };
        phone: {
          deactivated_datetime: string | null;
          description: string;
          phone_numbers: ContactPhoneNumber[];
        };
        chat: {
          deactivated_datetime: string | null;
          description: string;
        };
      };
      extra_html: {
        extra_head: string;
        extra_head_deactivated_datetime: string | null; // date-time
        custom_header: string;
        custom_header_deactivated_datetime: string | null; // date-time
        custom_footer: string;
        custom_footer_deactivated_datetime: string | null; // date-time
      };
      chat_app_key: string | null;
      contact_form_id: number | null;
      logo_hyperlink?: string | null;
    }
    export interface HelpCenterTranslationSeoMeta {
      title: string | null;
      description: string | null;
    }
    export interface HelpCenterTranslationsListPageDto {
      meta: PageMetaDto;
      object: "list";
      data: HelpCenterTranslationDto[];
    }
    export interface HelpCentersListPageDto {
      meta: PageMetaDto;
      object: "list";
      data: GetHelpCenterDto[];
    }
    export interface HotswapProgressDto {
      progress: "NOT_STARTED" | "IN_PROGRESS" | "SUCCESS" | "FAILURE";
    }
    export interface HotswapResponseDto {
      /**
       * Session token generated for hotswap widget
       * example:
       * abcdef-abcdef-abcdef-abcdef
       */
      token: string;
    }
    export interface HotswapWebhookDto {
      /**
       * Session id generated by hotswap service
       */
      session_id: string;
      /**
       * Status of import
       */
      progress: "NOT_STARTED" | "IN_PROGRESS" | "SUCCESS" | "FAILURE";
    }
    export interface LocalArticleTranslation {
      created_datetime: string; // date-time
      updated_datetime: string; // date-time
      deleted_datetime?: string | null; // date-time
      title: string;
      excerpt: string;
      content: string;
      slug: string;
      locale: "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
      article_id: number;
      category_id: number | null;
      article_unlisted_id: string;
      seo_meta: {
        title: string | null;
        description: string | null;
      };
      visibility_status: "PUBLIC" | "UNLISTED";
      is_current: boolean;
      /**
       * Gives details on how the translation fallback was chosen:
       * - `undefined`: the translation is the requested one
       * - `default`: the translation is in help center's default locale
       * - `available`: the translation corresponds to the first available one
       */
      locale_fallback?: "default" | "available";
    }
    export interface LocalCategoryTranslation {
      /**
       * Creation date
       */
      created_datetime: string; // date-time
      /**
       * Update date
       */
      updated_datetime: string; // date-time
      /**
       * Deletion date
       */
      deleted_datetime?: string | null; // date-time
      category_id: number;
      category_unlisted_id: string;
      parent_category_id: number | null;
      locale: "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
      seo_meta: {
        title: string | null;
        description: string | null;
      };
      visibility_status: "PUBLIC" | "UNLISTED";
      /**
       * example:
       * https://cdn.shopify.com/image.jpg
       */
      image_url: string | null;
      /**
       * Gives details on how the translation fallback was chosen:
       * - `undefined`: the translation is the requested one
       * - `default`: the translation is in help center's default locale
       * - `available`: the translation corresponds to the first available one
       */
      locale_fallback?: "default" | "available";
      title: string;
      description: string | null;
      slug: string;
    }
    export interface LocaleDto {
      name: string;
      code: "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
    }
    export interface MailtoReplacementConfigDto {
      emails: string[];
      contactFormUid: string;
      shopifyShopName: string;
    }
    export interface MailtoReplacementConfigGetDto {
      emails: string[];
    }
    export interface NavigationLinkDto {
      /**
       * Creation date
       */
      created_datetime: string; // date-time
      /**
       * Update date
       */
      updated_datetime: string; // date-time
      /**
       * Deletion date
       */
      deleted_datetime?: string | null; // date-time
      id: number;
      label: string;
      value: string;
      locale: "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
      group: "header" | "footer";
      meta?: NavigationLinkMeta;
      help_center_id: number;
    }
    export interface NavigationLinkMeta {
      network?: "facebook" | "twitter" | "instagram";
    }
    export interface NavigationLinksListPageDto {
      meta: PageMetaDto;
      object: "list";
      data: NavigationLinkDto[];
    }
    export interface OmitTypeClass {
      created_datetime: string; // date-time
      updated_datetime: string; // date-time
      deleted_datetime?: string | null; // date-time
      title: string;
      excerpt: string;
      slug: string;
      locale: "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
      article_id: number;
      category_id: number | null;
      article_unlisted_id: string;
      seo_meta: {
        title: string | null;
        description: string | null;
      };
      visibility_status: "PUBLIC" | "UNLISTED";
      is_current: boolean;
    }
    export interface OrderManagementVo {
      enabled: boolean;
    }
    export interface PageEmbedmentDto {
      /**
       * example:
       * 1
       */
      id: number;
      /**
       * example:
       * 229672878386
       */
      page_external_id?: string;
      /**
       * example:
       * My page title
       */
      page_title: string;
      /**
       * example:
       * my-page-title
       */
      page_path_url: string;
      position: "TOP" | "BOTTOM";
      created_datetime: string; // date-time
      updated_datetime: string; // date-time
    }
    export interface PageMetaDto {
      /**
       * The current page index.
       * example:
       * 1
       */
      page: number;
      /**
       * The number of items returned in this response.
       * example:
       * 20
       */
      per_page: number;
      /**
       * The path to the current page.
       * example:
       * /my-items?page=1&per_page=20
       */
      current_page: string;
      /**
       * The total count of items.
       * example:
       * 32
       */
      item_count: number;
      /**
       * The number of pages in this pagination.
       * example:
       * 3
       */
      nb_pages: number;
      /**
       * The path to the next page.
       * 
       * If none, there is no next page.
       * example:
       * /my-items?page=2&per_page=20
       */
      next_page?: string;
    }
    export interface PhoneContactInfo {
      deactivated_datetime: string | null;
      description: string;
      phone_numbers: ContactPhoneNumber[];
    }
    export interface PhoneContactInfoDto {
      phone_numbers: ContactPhoneNumberDto[];
      enabled: boolean;
      description: string;
    }
    export interface ProcessCsvRequestDto {
      /**
       * Configuration for importing the CSV file.
       */
      file_url: string;
      article_columns: {
        locales: {
          [name: string]: ArticleLocaleColumns;
        };
      };
      category_columns: {
        locales: {
          [name: string]: CategoryLocaleColumns;
        };
      };
    }
    export interface ProcessCsvResponseDto {
      /**
       * example:
       * {
       *   "status": "SUCCESS",
       *   "num_imported_rows": 100
       * }
       */
      report: ProcessCsvResponseSuccessDto | ProcessCsvResponsePartialDto | ProcessCsvResponseFailedDto;
    }
    export interface ProcessCsvResponseFailedDto {
      /**
       * example:
       * FAILED
       */
      status: "FAILED";
      failed_reason?: string;
    }
    export interface ProcessCsvResponsePartialDto {
      /**
       * example:
       * PARTIAL
       */
      status: "PARTIAL";
      num_imported_csv_rows: number;
      num_erroneous_csv_rows: number;
      erroneous_csv_rows_file_url?: string;
    }
    export interface ProcessCsvResponseSuccessDto {
      /**
       * example:
       * SUCCESS
       */
      status: "SUCCESS";
      num_imported_csv_rows: number;
    }
    export interface PurgeCacheContactFormDto {
      shop_name: string;
    }
    export interface Rating {
      up: number;
      down: number;
    }
    export interface RatingContextDto {
      ip_address: string;
      user_agent: string;
    }
    export interface RedirectDto {
      /**
       * Creation date
       */
      created_datetime: string; // date-time
      /**
       * Update date
       */
      updated_datetime: string; // date-time
      /**
       * Deletion date
       */
      deleted_datetime?: string | null; // date-time
      id: number;
      from: string;
      to: string;
      help_center_id: number;
    }
    export interface SignedPostPolicyDto {
      url: string;
      fields: {
      };
    }
    export interface SubjectLineDto {
      allow_other: boolean;
      options: string[];
    }
    export interface SubjectLinesDto {
      /**
       * List of options that will be displayed to the user in the subject line's select dropdown
       * Each option can be from 2 to 50 character long
       * Max 15 options
       */
      options: string[];
      /**
       * If true, the "Other" subject line option will be made available
       */
      allow_other: boolean;
    }
    export interface UpdateArticleDto {
      category_id?: number | null;
    }
    export interface UpdateArticleTranslationDto {
      /**
       * The title of the article in the `locale`'s translation.
       * example:
       * How to cancel an order
       */
      title?: string;
      /**
       * The excerpt of the article in the `locale`'s translation.
       * example:
       * Explains how to cancel an order
       */
      excerpt?: string;
      /**
       * The content of the article in the `locale`'s translation.
       * 
       * Supports HTML formatted content.
       * example:
       * I can be <strong>HTML</strong>
       */
      content?: string;
      /**
       * A slug for the article that'll be used to construct article's URLs.
       * 
       * Should only contains alphanumeric values and hyphens.
       * example:
       * cancel-an-order
       */
      slug?: string;
      /**
       * The SEO meta attributes of the article in the `locale`'s translation.
       */
      seo_meta?: {
        /**
         * The content of the `<title />` HTML tag for the article translation.
         */
        title: string | null;
        /**
         * The content of the `<meta name="description">` HTML tag for the article translation.
         */
        description: string | null;
      };
      /**
       * This field describes whether the translation is going to be published or not, and it defaults to true. If true, it means it will be the published version; if previously it was only in draft, it will become published. If false, it will be the draft version and therefore, unpublished.
       */
      is_current?: boolean;
      /**
       * The visibility status of the article.
       */
      visibility_status?: "PUBLIC" | "UNLISTED";
      /**
       * Used to change the categoryId of the article
       */
      category_id?: number | null;
    }
    export interface UpdateArticleTranslationRatingDto {
      /**
       * The rating of the article translation.
       * example:
       * -1
       */
      rating: "1" | "-1";
      context: {
      };
    }
    export interface UpdateCategoryTranslationDto {
      /**
       * If the parent_category_is set to null change the category's parent to the root category
       * If it's set to a number set it to that specific category
       * If the property is not set, don't change anything
       */
      parent_category_id?: number | null;
      /**
       * The title of the category in the `locale`'s translation.
       * example:
       * Orders
       */
      title?: string;
      /**
       * The description of the category in the `locale`'s translation.
       * example:
       * Information about orders
       */
      description?: string | null;
      /**
       * A slug for the category that'll be used to construct category's URLs.
       * 
       * Should only contains alphanumeric values and hyphens.
       * example:
       * orders
       */
      slug?: string;
      /**
       * The SEO meta attributes of the category in the `locale`'s translation.
       */
      seo_meta?: {
        /**
         * The content of the `<title />` HTML tag for the category translation.
         */
        title: string | null;
        /**
         * The content of the `<meta name="description">` HTML tag for the category translation.
         */
        description: string | null;
      };
      /**
       * The visibility of the category. Can be either `PUBLIC` or `UNLISTED`.
       */
      visibility_status?: "PUBLIC" | "UNLISTED";
      /**
       * Category image URL
       * example:
       * https://cdn.shopify.com/image.jpg
       */
      image_url?: string | null;
    }
    export interface UpdateContactFormDto {
      /**
       * Name of the Contact Form
       * example:
       * My Contact Form
       */
      name?: string;
      /**
       * Contact Form default locale
       * example:
       * en-US
       */
      default_locale?: "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
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
        id: number;
        /**
         * Email value
         */
        email: string;
      };
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
      subject_lines?: {
        /**
         * List of options that will be displayed to the user in the subject line's select dropdown
         * Each option can be from 2 to 50 character long
         * Max 15 options
         */
        options: string[];
        /**
         * If true, the "Other" subject line option will be made available
         */
        allow_other: boolean;
      } | null;
      shop_name?: string | null;
      deactivated_datetime?: string | null; // date-time
    }
    export interface UpdateEmailIntegrationDto {
      /**
       * The account id whose help centers should be deleted
       * example:
       * 1
       */
      account_id: number;
      /**
       * The target email integration id
       * example:
       * 2
       */
      deactivated_integration_id: number;
      fallback_integration: {
        /**
         * example:
         * 12345
         */
        id: number;
        /**
         * example:
         * acme-support@gorgias.xyz
         */
        email: string;
      };
    }
    export interface UpdateExtraHTMLDto {
      /**
       * The HTML injected in the head
       * 
       * It should be in help center's supported locales.
       * example:
       * <div>....</div>
       */
      extra_head?: string;
      /**
       * Boolean indicating if the extra head should be injected.
       * example:
       * false
       */
      extra_head_deactivated?: boolean;
      /**
       * The HTML of the custom header
       * 
       * It should be in help center's supported locales.
       * example:
       * <div>....</div>
       */
      custom_header?: string;
      /**
       * Boolean indicating if the custom header should be injected.
       * example:
       * false
       */
      custom_header_deactivated?: boolean;
      /**
       * The HTML of the custom footer
       * 
       * It should be in help center's supported locales.
       * example:
       * <div>....</div>
       */
      custom_footer?: string;
      /**
       * Boolean indicating if the custom footer should be injected.
       * example:
       * false
       */
      custom_footer_deactivated?: boolean;
    }
    export interface UpdateHelpCenterContactFormDto {
      card_enabled?: boolean;
      helpdesk_integration_email: string | null;
      helpdesk_integration_id: number | null;
      subject_lines?: {
        [name: string]: SubjectLineDto;
      };
    }
    export interface UpdateHelpCenterDto {
      /**
       * example:
       * My Help Center
       */
      name?: string;
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
      subdomain?: string;
      default_locale?: "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
      /**
       * Should be a valid URL.
       */
      favicon_url?: string | null;
      /**
       * Should be a valid URL.
       */
      brand_logo_url?: string | null;
      /**
       * Should be a valid URL.
       */
      brand_logo_light_url?: string | null;
      /**
       * Boolean indicating if search feature is deactivated for this Help center.
       * example:
       * false
       */
      search_deactivated?: boolean;
      primary_color?: string | null;
      theme?: {
      } | null;
      shop_name?: string | null;
      /**
       * Boolean indicating if self service is deactivated for this Help center.
       * example:
       * false
       */
      self_service_deactivated?: boolean;
      /**
       * Contains the integration email and id which will be used to create tickets from the contact form.
       */
      contact_form?: {
        card_enabled?: boolean;
        helpdesk_integration_email: string | null;
        helpdesk_integration_id: number | null;
        subject_lines?: {
          [name: string]: SubjectLineDto;
        };
      };
      gaid?: string | null; // GOOGLE_ANALYTICS_ID_REGEXP
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
        id: number;
        /**
         * Email value
         */
        email: string;
      } | null;
      /**
       * Boolean indicating if "Powered By Gorgias" will be displayed in this help center footer
       * example:
       * false
       */
      powered_by_deactivated?: boolean;
      /**
       * Boolean indicating if the help center is deactivated.
       * example:
       * false
       */
      deactivated?: boolean;
      primary_font_family?: string | null;
    }
    export interface UpdateHelpCenterTranslationDto {
      /**
       * The SEO meta attributes of the help center in the `locale`'s translation.
       */
      seo_meta?: {
        /**
         * The content of the `<title />` HTML tag for the help center translation.
         */
        title: string | null;
        /**
         * The content of the `<meta name="description">` HTML tag for the help center translation.
         */
        description: string | null;
      };
      chat_app_key?: string | null;
      /**
       * The banner text of the help center in the `locale`'s translation.
       */
      banner_text?: string | null;
      banner_image_url?: string | null;
      banner_image_vertical_offset?: number;
      contact_info?: {
        email: EmailContactInfoDto;
        phone: PhoneContactInfoDto;
        chat: ChatContactInfoDto;
      };
      extra_html?: {
        /**
         * The HTML injected in the head
         * 
         * It should be in help center's supported locales.
         * example:
         * <div>....</div>
         */
        extra_head?: string;
        /**
         * Boolean indicating if the extra head should be injected.
         * example:
         * false
         */
        extra_head_deactivated?: boolean;
        /**
         * The HTML of the custom header
         * 
         * It should be in help center's supported locales.
         * example:
         * <div>....</div>
         */
        custom_header?: string;
        /**
         * Boolean indicating if the custom header should be injected.
         * example:
         * false
         */
        custom_header_deactivated?: boolean;
        /**
         * The HTML of the custom footer
         * 
         * It should be in help center's supported locales.
         * example:
         * <div>....</div>
         */
        custom_footer?: string;
        /**
         * Boolean indicating if the custom footer should be injected.
         * example:
         * false
         */
        custom_footer_deactivated?: boolean;
      };
      logo_hyperlink?: string | null;
    }
    export interface UpdateNavigationLinkDto {
      /**
       * The label of the navigation link.
       */
      label?: string;
      /**
       * The URL of the navigation link.
       * 
       * Should be an absolute URL with protocol and host.
       * example:
       * https://gorgias.com/pricing
       */
      value?: string;
      /**
       * The group of the navigation link.
       */
      group?: "header" | "footer";
      meta?: NavigationLinkMeta;
    }
    export interface UpdatePageEmbedmentDto {
      position: "TOP" | "BOTTOM";
    }
    export interface UploadAttachmentDto {
      file: AttachmentFileDto;
      channel: AttachmentChannelDto;
    }
    export interface UploadPolicyRequestDto {
      filename: string;
      size: number;
      mimetype: string;
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
      workflows?: WorkflowVo[];
      /**
       * example:
       * {
       *   "enabled": true
       * }
       */
      order_management?: {
        enabled: boolean;
      };
    }
    export interface UpsertMailtoReplacementConfigDto {
      emails: string[];
    }
    export interface WorkflowHandoverDto {
      contact_form_uid?: string;
      help_center_id?: number;
      locale: "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
      workflow_entrypoint_label: string;
      workflow_configuration_id: string;
      workflow_execution_id: string;
      conversation: WorkflowHandoverMessageDto[];
      sender_email: string;
      url: string;
      ticket_tags?: string[] | null;
      ticket_assignee_team_id?: number | null;
      ticket_assignee_user_id?: number | null;
    }
    export interface WorkflowHandoverMessageAttachmentDto {
      url: string;
      name: string;
      size: number | null;
      content_type: string;
      extra?: WorkflowHandoverMessageAttachmentExtraDto;
    }
    export interface WorkflowHandoverMessageAttachmentExtraDto {
      product_id: number;
      variant_id: number;
      price?: string;
      variant_name?: string;
      product_link: string;
      currency?: string;
      featured_image: string;
    }
    export interface WorkflowHandoverMessageDto {
      subject?: string;
      body_html?: string;
      attachments: WorkflowHandoverMessageAttachmentDto[];
      from_agent: boolean;
    }
    export interface WorkflowVo {
      id: string;
      enabled: boolean;
    }
  }
}
declare namespace Paths {
  namespace AnalyseCsv {
    namespace Parameters {
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    export type RequestBody = Components.Schemas.AnalyseCsvRequestDto;
    namespace Responses {
      export type $200 = Components.Schemas.AnalyseCsvResponseDto;
    }
  }
  namespace CheckContactFormNameExists {
    namespace Parameters {
      export type InputName = string;
    }
    export interface PathParameters {
      input_name: Parameters.InputName;
    }
  }
  namespace CheckCustomDomainStatus {
    namespace Parameters {
      export type HelpCenterId = number;
      export type Hostname = string;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
      hostname: Parameters.Hostname;
    }
    namespace Responses {
      export type $200 = Components.Schemas.CustomDomain;
    }
  }
  namespace CheckHelpCenterWithSubdomainExists {
    namespace Parameters {
      export type Subdomain = string;
    }
    export interface PathParameters {
      subdomain: Parameters.Subdomain;
    }
  }
  namespace Complete {
    namespace Parameters {
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    export type RequestBody = Components.Schemas.HotswapWebhookDto;
  }
  namespace ContactFormPurgeCache {
    export type RequestBody = Components.Schemas.PurgeCacheContactFormDto;
  }
  namespace CreateAccessToken {
    namespace Responses {
      export type $201 = Components.Schemas.AccessTokenDto;
    }
  }
  namespace CreateArticle {
    namespace Parameters {
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    export type RequestBody = Components.Schemas.CreateArticleDto;
    namespace Responses {
      export type $201 = Components.Schemas.ArticleWithLocalTranslation;
    }
  }
  namespace CreateArticleTranslation {
    namespace Parameters {
      export type ArticleId = number;
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
      article_id: Parameters.ArticleId;
    }
    export type RequestBody = Components.Schemas.CreateArticleTranslationDto;
    namespace Responses {
      export type $201 = Components.Schemas.ArticleTranslationResponseDto;
    }
  }
  namespace CreateArticleTranslationRating {
    namespace Parameters {
      export type ArticleId = number;
      export type HelpCenterId = number;
      export type Locale = string;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
      article_id: Parameters.ArticleId;
      locale: Parameters.Locale;
    }
    export type RequestBody = Components.Schemas.CreateArticleTranslationRatingDto;
    namespace Responses {
      export type $201 = Components.Schemas.ArticleTranslationRatingDto;
    }
  }
  namespace CreateCategory {
    namespace Parameters {
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    export type RequestBody = Components.Schemas.CreateCategoryDto;
    namespace Responses {
      export type $201 = Components.Schemas.CategoryWithLocalTranslationDto;
    }
  }
  namespace CreateCategoryTranslation {
    namespace Parameters {
      export type CategoryId = number;
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
      category_id: Parameters.CategoryId;
    }
    export type RequestBody = Components.Schemas.CreateCategoryTranslationDto;
    namespace Responses {
      export type $201 = Components.Schemas.CategoryTranslationDto;
    }
  }
  namespace CreateContactForm {
    export type RequestBody = Components.Schemas.CreateContactFormDto;
    namespace Responses {
      export type $201 = Components.Schemas.ContactFormDto;
    }
  }
  namespace CreateContactFormShopifyPageEmbedment {
    namespace Parameters {
      export type ContactFormId = number;
    }
    export interface PathParameters {
      contact_form_id: Parameters.ContactFormId;
    }
    export type RequestBody = Components.Schemas.CreateShopifyPageEmbedmentDto;
    namespace Responses {
      export type $201 = Components.Schemas.PageEmbedmentDto;
    }
  }
  namespace CreateCustomDomain {
    namespace Parameters {
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    export type RequestBody = Components.Schemas.CreateCustomDomainDto;
    namespace Responses {
      export type $201 = Components.Schemas.CustomDomain;
    }
  }
  namespace CreateHelpCenter {
    export type RequestBody = Components.Schemas.CreateHelpCenterWithAccountIdDto;
    namespace Responses {
      export type $201 = Components.Schemas.HelpCenterDto;
    }
  }
  namespace CreateHelpCenterShopifyPageEmbedment {
    namespace Parameters {
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    export type RequestBody = Components.Schemas.CreateShopifyPageEmbedmentDto;
    namespace Responses {
      export type $201 = Components.Schemas.PageEmbedmentDto;
    }
  }
  namespace CreateHelpCenterTranslation {
    namespace Parameters {
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    export type RequestBody = Components.Schemas.CreateHelpCenterTranslationDto;
    namespace Responses {
      export type $201 = Components.Schemas.HelpCenterTranslationDto;
    }
  }
  namespace CreateHotswapSessionToken {
    namespace Parameters {
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    namespace Responses {
      export type $201 = Components.Schemas.HotswapResponseDto;
    }
  }
  namespace CreateNavigationLink {
    namespace Parameters {
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    export type RequestBody = Components.Schemas.CreateNavigationLinkDto;
    namespace Responses {
      export type $201 = Components.Schemas.NavigationLinkDto;
    }
  }
  namespace CreateRedirect {
    namespace Parameters {
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    export type RequestBody = Components.Schemas.CreateRedirectDto;
    namespace Responses {
      export type $201 = Components.Schemas.RedirectDto;
    }
  }
  namespace DeleteAccountHelpCenters {
    export type RequestBody = Components.Schemas.DeleteAccountDto;
  }
  namespace DeleteArticle {
    namespace Parameters {
      export type HelpCenterId = number;
      export type Id = number;
    }
    export interface PathParameters {
      id: Parameters.Id;
      help_center_id: Parameters.HelpCenterId;
    }
  }
  namespace DeleteArticleTranslation {
    namespace Parameters {
      export type ArticleId = number;
      export type HelpCenterId = number;
      export type Locale = string;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
      article_id: Parameters.ArticleId;
      locale: Parameters.Locale;
    }
  }
  namespace DeleteArticleTranslationRating {
    namespace Parameters {
      export type HelpCenterId = number;
      export type RatingId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
      ratingId: Parameters.RatingId;
    }
  }
  namespace DeleteCategory {
    namespace Parameters {
      export type HelpCenterId = number;
      export type Id = number;
    }
    export interface PathParameters {
      id: Parameters.Id;
      help_center_id: Parameters.HelpCenterId;
    }
  }
  namespace DeleteCategoryArticles {
    namespace Parameters {
      export type CategoryId = number;
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
      category_id: Parameters.CategoryId;
    }
  }
  namespace DeleteCategoryTranslation {
    namespace Parameters {
      export type CategoryId = number;
      export type HelpCenterId = number;
      export type Locale = string;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
      category_id: Parameters.CategoryId;
      locale: Parameters.Locale;
    }
  }
  namespace DeleteContactForm {
    namespace Parameters {
      export type Id = number;
    }
    export interface PathParameters {
      id: Parameters.Id;
    }
  }
  namespace DeleteContactFormShopifyPageEmbedment {
    namespace Parameters {
      export type ContactFormId = number;
      export type EmbedmentId = number;
    }
    export interface PathParameters {
      embedment_id: Parameters.EmbedmentId;
      contact_form_id: Parameters.ContactFormId;
    }
  }
  namespace DeleteCustomDomain {
    namespace Parameters {
      export type HelpCenterId = number;
      export type Hostname = string;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
      hostname: Parameters.Hostname;
    }
  }
  namespace DeleteHelpCenter {
    namespace Parameters {
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
  }
  namespace DeleteHelpCenterShopifyPageEmbedment {
    namespace Parameters {
      export type EmbedmentId = number;
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      embedment_id: Parameters.EmbedmentId;
      help_center_id: Parameters.HelpCenterId;
    }
  }
  namespace DeleteHelpCenterTranslation {
    namespace Parameters {
      export type HelpCenterId = number;
      export type Locale = string;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
      locale: Parameters.Locale;
    }
  }
  namespace DeleteNavigationLink {
    namespace Parameters {
      export type HelpCenterId = number;
      export type Id = number;
    }
    export interface PathParameters {
      id: Parameters.Id;
      help_center_id: Parameters.HelpCenterId;
    }
  }
  namespace DeleteRedirect {
    namespace Parameters {
      export type From = string;
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    export interface QueryParameters {
      from: Parameters.From;
    }
  }
  namespace DuplicateHelpCenter {
    namespace Parameters {
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    namespace Responses {
      export type $201 = Components.Schemas.HelpCenterDto;
    }
  }
  namespace GenerateCsvTemplate {
    namespace Parameters {
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    namespace Responses {
      export type $200 = string;
    }
  }
  namespace GetAccountInfo {
    namespace Parameters {
      export type CustomDomain = string;
      export type Subdomain = string;
    }
    export interface QueryParameters {
      subdomain?: Parameters.Subdomain;
      custom_domain?: Parameters.CustomDomain;
    }
    namespace Responses {
      export type $200 = Components.Schemas.AccountInfoDto;
    }
  }
  namespace GetArticle {
    namespace Parameters {
      export type HelpCenterId = number;
      export type Id = number;
      export type Locale = "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
      export type LocaleFallback = boolean;
      export type VersionStatus = "latest_draft" | "current";
    }
    export interface PathParameters {
      id: Parameters.Id;
      help_center_id: Parameters.HelpCenterId;
    }
    export interface QueryParameters {
      version_status?: Parameters.VersionStatus;
      locale: Parameters.Locale;
      locale_fallback?: Parameters.LocaleFallback;
    }
    namespace Responses {
      export type $200 = Components.Schemas.ArticleWithLocalTranslation;
    }
  }
  namespace GetArticleTemplate {
    namespace Parameters {
      export type Locale = "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
      export type TemplateKey = "shippingPolicy" | "howToReturn" | "howToCancelOrder" | "howToTrackOrder" | "refundsOrExchanges" | "packageLostOrDamaged";
    }
    export interface PathParameters {
      template_key: Parameters.TemplateKey;
    }
    export interface QueryParameters {
      locale: Parameters.Locale;
    }
    namespace Responses {
      export type $200 = Components.Schemas.ArticleTemplateDto;
    }
  }
  namespace GetAttachmentUploadPolicy {
    export type RequestBody = Components.Schemas.UploadAttachmentDto;
    namespace Responses {
      export type $201 = Components.Schemas.SignedPostPolicyDto;
    }
  }
  namespace GetCategoriesPositions {
    namespace Parameters {
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    namespace Responses {
      export type $200 = number[];
    }
  }
  namespace GetCategory {
    namespace Parameters {
      export type HelpCenterId = number;
      export type Id = number;
      export type Locale = "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
      export type LocaleFallback = boolean;
    }
    export interface PathParameters {
      id: Parameters.Id;
      help_center_id: Parameters.HelpCenterId;
    }
    export interface QueryParameters {
      locale: Parameters.Locale;
      locale_fallback?: Parameters.LocaleFallback;
    }
    namespace Responses {
      export type $200 = Components.Schemas.CategoryWithLocalTranslationDto;
    }
  }
  namespace GetCategoryArticlesPositions {
    namespace Parameters {
      export type CategoryId = number;
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
      category_id: Parameters.CategoryId;
    }
    namespace Responses {
      export type $200 = number[];
    }
  }
  namespace GetCategoryTree {
    namespace Parameters {
      export type Depth = number;
      export type Fields = string[];
      export type HelpCenterId = number;
      export type Locale = "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
      export type OrderBy = "position";
      export type OrderDir = "asc" | "desc";
      export type ParentCategoryId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
      parent_category_id: Parameters.ParentCategoryId;
    }
    export interface QueryParameters {
      locale: Parameters.Locale;
      depth?: Parameters.Depth;
      fields?: Parameters.Fields;
      order_by?: Parameters.OrderBy;
      order_dir?: Parameters.OrderDir;
    }
    namespace Responses {
      export type $200 = Components.Schemas.CategoryTreeDto;
    }
  }
  namespace GetContactForm {
    namespace Parameters {
      export type Id = number;
    }
    export interface PathParameters {
      id: Parameters.Id;
    }
    namespace Responses {
      export type $200 = Components.Schemas.ContactFormDto;
    }
  }
  namespace GetContactFormAutomationSettings {
    namespace Parameters {
      export type Id = number;
    }
    export interface PathParameters {
      id: Parameters.Id;
    }
    namespace Responses {
      export type $200 = Components.Schemas.AutomationSettingsDto;
    }
  }
  namespace GetContactFormByUid {
    namespace Parameters {
      export type Uid = string;
    }
    export interface PathParameters {
      uid: Parameters.Uid;
    }
    namespace Responses {
      export type $200 = Components.Schemas.ContactFormDto;
    }
  }
  namespace GetContactFormMailtoReplacementConfig {
    namespace Parameters {
      export type ContactFormId = number;
    }
    export interface PathParameters {
      contact_form_id: Parameters.ContactFormId;
    }
    namespace Responses {
      export type $200 = Components.Schemas.MailtoReplacementConfigGetDto;
    }
  }
  namespace GetContactFormShopifyMailtoReplacementConfig {
    namespace Parameters {
      export type ShopName = string;
    }
    export interface PathParameters {
      shop_name: Parameters.ShopName;
    }
    namespace Responses {
      export type $200 = Components.Schemas.MailtoReplacementConfigDto;
    }
  }
  namespace GetCustomDomain {
    namespace Parameters {
      export type HelpCenterId = number;
      export type Hostname = string;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
      hostname: Parameters.Hostname;
    }
    namespace Responses {
      export type $200 = Components.Schemas.CustomDomain;
    }
  }
  namespace GetExtraHTML {
    namespace Parameters {
      export type HelpCenterId = number;
      export type Locale = string;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    export interface QueryParameters {
      locale: Parameters.Locale;
    }
    namespace Responses {
      export type $200 = Components.Schemas.ExtraHTML;
    }
  }
  namespace GetFileUploadPolicy {
    namespace Parameters {
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    export type RequestBody = Components.Schemas.UploadPolicyRequestDto;
    namespace Responses {
      export type $201 = Components.Schemas.SignedPostPolicyDto;
    }
  }
  namespace GetHelpCenter {
    namespace Parameters {
      export type Fields = string[];
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    export interface QueryParameters {
      fields?: Parameters.Fields;
    }
    namespace Responses {
      export type $200 = Components.Schemas.GetHelpCenterDto;
    }
  }
  namespace GetHelpCenterAutomationSettings {
    namespace Parameters {
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    namespace Responses {
      export type $200 = Components.Schemas.AutomationSettingsDto;
    }
  }
  namespace GetHelpCenterByUid {
    namespace Parameters {
      export type Fields = string[];
      export type Uid = string;
    }
    export interface PathParameters {
      uid: Parameters.Uid;
    }
    export interface QueryParameters {
      fields?: Parameters.Fields;
    }
    namespace Responses {
      export type $200 = Components.Schemas.GetHelpCenterDto;
    }
  }
  namespace GetHotswapStatus {
    namespace Parameters {
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    namespace Responses {
      export type $200 = Components.Schemas.HotswapProgressDto;
    }
  }
  namespace GetLocale {
    namespace Parameters {
      export type Locale = string;
    }
    export interface PathParameters {
      locale: Parameters.Locale;
    }
    namespace Responses {
      export type $200 = Components.Schemas.LocaleDto;
    }
  }
  namespace GetNavigationLinksPositions {
    namespace Parameters {
      export type Group = "header" | "footer";
      export type HelpCenterId = number;
      export type Locale = "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
      locale: Parameters.Locale;
      group: Parameters.Group;
    }
    namespace Responses {
      export type $200 = number[];
    }
  }
  namespace GetSubCategoriesPositions {
    namespace Parameters {
      export type HelpCenterId = number;
      export type ParentCategoryId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
      parent_category_id: Parameters.ParentCategoryId;
    }
    namespace Responses {
      export type $200 = number[];
    }
  }
  namespace GetUncategorizedArticlesPositions {
    namespace Parameters {
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    namespace Responses {
      export type $200 = number[];
    }
  }
  namespace HandoverWorkflowExecution {
    export type RequestBody = Components.Schemas.WorkflowHandoverDto;
  }
  namespace ImportCsv {
    namespace Parameters {
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    export type RequestBody = Components.Schemas.ProcessCsvRequestDto;
    namespace Responses {
      export type $201 = Components.Schemas.ProcessCsvResponseDto;
    }
  }
  namespace ListArticleTemplates {
    namespace Parameters {
      export type Locale = "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
    }
    export interface QueryParameters {
      locale: Parameters.Locale;
    }
    namespace Responses {
      export type $200 = Components.Schemas.ArticleTemplateDto[];
    }
  }
  namespace ListArticleTranslations {
    namespace Parameters {
      export type ArticleId = number;
      export type HelpCenterId = number;
      export type Page = any;
      export type PerPage = any;
      export type VersionStatus = "latest_draft" | "current";
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
      article_id: Parameters.ArticleId;
    }
    export interface QueryParameters {
      version_status?: Parameters.VersionStatus;
      per_page?: Parameters.PerPage;
      page?: Parameters.Page;
    }
    namespace Responses {
      export type $200 = Components.Schemas.ArticleTranslationsListPageDto;
    }
  }
  namespace ListArticles {
    namespace Parameters {
      export type HasCategory = boolean;
      export type HelpCenterId = number;
      export type Ids = number[];
      export type Locale = "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
      export type OrderBy = "position";
      export type OrderDir = "asc" | "desc";
      export type Page = any;
      export type PerPage = any;
      export type VersionStatus = "latest_draft" | "current";
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    export interface QueryParameters {
      has_category?: Parameters.HasCategory;
      locale?: Parameters.Locale;
      version_status?: Parameters.VersionStatus;
      ids?: Parameters.Ids;
      order_by?: Parameters.OrderBy;
      order_dir?: Parameters.OrderDir;
      per_page?: Parameters.PerPage;
      page?: Parameters.Page;
    }
    namespace Responses {
      export type $200 = Components.Schemas.ArticlesListPageDto;
    }
  }
  namespace ListCategories {
    namespace Parameters {
      export type HasArticles = boolean;
      export type HelpCenterId = number;
      export type Locale = "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
      export type OrderBy = "position";
      export type OrderDir = "asc" | "desc";
      export type Page = any;
      export type PerPage = any;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    export interface QueryParameters {
      locale?: Parameters.Locale;
      has_articles?: Parameters.HasArticles;
      order_by?: Parameters.OrderBy;
      order_dir?: Parameters.OrderDir;
      per_page?: Parameters.PerPage;
      page?: Parameters.Page;
    }
    namespace Responses {
      export type $200 = Components.Schemas.CategoriesListPageDto;
    }
  }
  namespace ListCategoryArticles {
    namespace Parameters {
      export type CategoryId = number;
      export type HelpCenterId = number;
      export type Ids = number[];
      export type Locale = "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
      export type OrderBy = "position";
      export type OrderDir = "asc" | "desc";
      export type Page = any;
      export type PerPage = any;
      export type VersionStatus = "latest_draft" | "current";
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
      category_id: Parameters.CategoryId;
    }
    export interface QueryParameters {
      locale?: Parameters.Locale;
      version_status?: Parameters.VersionStatus;
      ids?: Parameters.Ids;
      order_by?: Parameters.OrderBy;
      order_dir?: Parameters.OrderDir;
      per_page?: Parameters.PerPage;
      page?: Parameters.Page;
    }
    namespace Responses {
      export type $200 = Components.Schemas.ArticlesListPageDto;
    }
  }
  namespace ListCategoryTranslations {
    namespace Parameters {
      export type CategoryId = number;
      export type HelpCenterId = number;
      export type Page = any;
      export type PerPage = any;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
      category_id: Parameters.CategoryId;
    }
    export interface QueryParameters {
      per_page?: Parameters.PerPage;
      page?: Parameters.Page;
    }
    namespace Responses {
      export type $200 = Components.Schemas.CategoryTranslationsListPageDto;
    }
  }
  namespace ListContactFormShopifyPageEmbedments {
    namespace Parameters {
      export type ContactFormId = number;
    }
    export interface PathParameters {
      contact_form_id: Parameters.ContactFormId;
    }
    namespace Responses {
      export type $200 = Components.Schemas.PageEmbedmentDto[];
    }
  }
  namespace ListContactFormShopifyPages {
    namespace Parameters {
      export type ContactFormId = number;
    }
    export interface PathParameters {
      contact_form_id: Parameters.ContactFormId;
    }
    namespace Responses {
      export type $200 = Components.Schemas.ContactFormPageDto[];
    }
  }
  namespace ListContactForms {
    namespace Parameters {
      export type Page = any;
      export type PerPage = any;
    }
    export interface QueryParameters {
      per_page?: Parameters.PerPage;
      page?: Parameters.Page;
    }
    namespace Responses {
      export type $200 = Components.Schemas.ContactFormsListPageDto;
    }
  }
  namespace ListCustomDomains {
    namespace Parameters {
      export type HelpCenterId = number;
      export type Page = any;
      export type PerPage = any;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    export interface QueryParameters {
      per_page?: Parameters.PerPage;
      page?: Parameters.Page;
    }
    namespace Responses {
      export type $200 = Components.Schemas.CustomDomainsListPageDto;
    }
  }
  namespace ListHelpCenterShopifyPageEmbedments {
    namespace Parameters {
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    namespace Responses {
      export type $200 = Components.Schemas.PageEmbedmentDto[];
    }
  }
  namespace ListHelpCenterShopifyPages {
    namespace Parameters {
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    namespace Responses {
      export type $200 = Components.Schemas.HelpCenterStorePageDto[];
    }
  }
  namespace ListHelpCenterTranslations {
    namespace Parameters {
      export type HelpCenterId = number;
      export type Page = any;
      export type PerPage = any;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    export interface QueryParameters {
      per_page?: Parameters.PerPage;
      page?: Parameters.Page;
    }
    namespace Responses {
      export type $200 = Components.Schemas.HelpCenterTranslationsListPageDto;
    }
  }
  namespace ListHelpCenters {
    namespace Parameters {
      export type AccountId = string;
      export type Active = boolean;
      export type CustomDomain = string;
      export type Fields = string[];
      export type Page = any;
      export type PerPage = any;
      export type ShopName = string;
      export type Subdomain = string;
    }
    export interface QueryParameters {
      subdomain?: Parameters.Subdomain;
      custom_domain?: Parameters.CustomDomain;
      shop_name?: Parameters.ShopName;
      account_id?: Parameters.AccountId;
      active?: Parameters.Active;
      fields?: Parameters.Fields;
      per_page?: Parameters.PerPage;
      page?: Parameters.Page;
    }
    namespace Responses {
      export type $200 = Components.Schemas.HelpCentersListPageDto;
    }
  }
  namespace ListLocales {
    namespace Responses {
      export type $200 = Components.Schemas.LocaleDto[];
    }
  }
  namespace ListNavigationLinks {
    namespace Parameters {
      export type Group = "header" | "footer";
      export type HelpCenterId = number;
      export type Locale = "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
      export type OrderBy = "position";
      export type OrderDir = "asc" | "desc";
      export type Page = any;
      export type PerPage = any;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    export interface QueryParameters {
      locale?: Parameters.Locale;
      group?: Parameters.Group;
      order_by?: Parameters.OrderBy;
      order_dir?: Parameters.OrderDir;
      per_page?: Parameters.PerPage;
      page?: Parameters.Page;
    }
    namespace Responses {
      export type $200 = Components.Schemas.NavigationLinksListPageDto;
    }
  }
  namespace ListRedirects {
    namespace Parameters {
      export type From = string;
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    export interface QueryParameters {
      from?: Parameters.From;
    }
    namespace Responses {
      export type $200 = Components.Schemas.RedirectDto[];
    }
  }
  namespace PurgeCache {
    namespace Parameters {
      export type ShopName = string;
    }
    export interface PathParameters {
      shop_name: Parameters.ShopName;
    }
  }
  namespace SetArticlesPositionsInCategory {
    namespace Parameters {
      export type CategoryId = number;
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
      category_id: Parameters.CategoryId;
    }
    export type RequestBody = number[];
    namespace Responses {
      export type $200 = number[];
    }
  }
  namespace SetCategoriesPositions {
    namespace Parameters {
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    export type RequestBody = number[];
    namespace Responses {
      export type $200 = number[];
    }
  }
  namespace SetNavigationLinksPositions {
    namespace Parameters {
      export type Group = "header" | "footer";
      export type HelpCenterId = number;
      export type Locale = "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
      locale: Parameters.Locale;
      group: Parameters.Group;
    }
    export type RequestBody = number[];
    namespace Responses {
      export type $200 = number[];
    }
  }
  namespace SetSubCategoriesPositions {
    namespace Parameters {
      export type HelpCenterId = number;
      export type ParentCategoryId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
      parent_category_id: Parameters.ParentCategoryId;
    }
    export type RequestBody = number[];
    namespace Responses {
      export type $200 = number[];
    }
  }
  namespace SetUncategorizedArticlesPositions {
    namespace Parameters {
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    export type RequestBody = number[];
    namespace Responses {
      export type $200 = number[];
    }
  }
  namespace SubmitContactFormByUid {
    namespace Parameters {
      export type Uid = string;
    }
    export interface PathParameters {
      uid: Parameters.Uid;
    }
    export type RequestBody = Components.Schemas.ContactFormSubmissionDto;
  }
  namespace UpdateArticle {
    namespace Parameters {
      export type HelpCenterId = number;
      export type Id = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
      id: Parameters.Id;
    }
    export type RequestBody = Components.Schemas.UpdateArticleDto;
    namespace Responses {
      export type $200 = Components.Schemas.ArticleDto;
    }
  }
  namespace UpdateArticleTranslation {
    namespace Parameters {
      export type ArticleId = number;
      export type HelpCenterId = number;
      export type Locale = string;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
      article_id: Parameters.ArticleId;
      locale: Parameters.Locale;
    }
    export type RequestBody = Components.Schemas.UpdateArticleTranslationDto;
    namespace Responses {
      export type $200 = Components.Schemas.ArticleTranslationResponseDto;
    }
  }
  namespace UpdateArticleTranslationRating {
    namespace Parameters {
      export type ArticleId = number;
      export type HelpCenterId = number;
      export type Locale = string;
      export type RatingId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
      article_id: Parameters.ArticleId;
      locale: Parameters.Locale;
      ratingId: Parameters.RatingId;
    }
    export type RequestBody = Components.Schemas.UpdateArticleTranslationRatingDto;
    namespace Responses {
      export type $200 = Components.Schemas.ArticleTranslationRatingDto;
    }
  }
  namespace UpdateCategoryTranslation {
    namespace Parameters {
      export type CategoryId = number;
      export type HelpCenterId = number;
      export type Locale = string;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
      category_id: Parameters.CategoryId;
      locale: Parameters.Locale;
    }
    export type RequestBody = Components.Schemas.UpdateCategoryTranslationDto;
    namespace Responses {
      export type $200 = Components.Schemas.CategoryTranslationDto;
    }
  }
  namespace UpdateContactForm {
    namespace Parameters {
      export type Id = number;
    }
    export interface PathParameters {
      id: Parameters.Id;
    }
    export type RequestBody = Components.Schemas.UpdateContactFormDto;
    namespace Responses {
      export type $200 = Components.Schemas.ContactFormDto;
    }
  }
  namespace UpdateContactFormShopifyPageEmbedment {
    namespace Parameters {
      export type ContactFormId = number;
      export type EmbedmentId = number;
    }
    export interface PathParameters {
      embedment_id: Parameters.EmbedmentId;
      contact_form_id: Parameters.ContactFormId;
    }
    export type RequestBody = Components.Schemas.UpdatePageEmbedmentDto;
    namespace Responses {
      export type $200 = Components.Schemas.PageEmbedmentDto;
    }
  }
  namespace UpdateEmailIntegration {
    export type RequestBody = Components.Schemas.UpdateEmailIntegrationDto;
  }
  namespace UpdateExtraHTML {
    namespace Parameters {
      export type HelpCenterId = number;
      export type Locale = string;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
      locale: Parameters.Locale;
    }
    export type RequestBody = Components.Schemas.UpdateExtraHTMLDto;
    namespace Responses {
      export type $200 = Components.Schemas.ExtraHTML;
    }
  }
  namespace UpdateHelpCenter {
    namespace Parameters {
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    export type RequestBody = Components.Schemas.UpdateHelpCenterDto;
    namespace Responses {
      export type $200 = Components.Schemas.HelpCenterDto;
    }
  }
  namespace UpdateHelpCenterShopifyPageEmbedment {
    namespace Parameters {
      export type EmbedmentId = number;
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      embedment_id: Parameters.EmbedmentId;
      help_center_id: Parameters.HelpCenterId;
    }
    export type RequestBody = Components.Schemas.UpdatePageEmbedmentDto;
    namespace Responses {
      export type $200 = Components.Schemas.PageEmbedmentDto;
    }
  }
  namespace UpdateHelpCenterTranslation {
    namespace Parameters {
      export type HelpCenterId = number;
      export type Locale = string;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
      locale: Parameters.Locale;
    }
    export type RequestBody = Components.Schemas.UpdateHelpCenterTranslationDto;
    namespace Responses {
      export type $200 = Components.Schemas.HelpCenterTranslationDto;
    }
  }
  namespace UpdateNavigationLink {
    namespace Parameters {
      export type HelpCenterId = number;
      export type Id = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
      id: Parameters.Id;
    }
    export type RequestBody = Components.Schemas.UpdateNavigationLinkDto;
    namespace Responses {
      export type $200 = Components.Schemas.NavigationLinkDto;
    }
  }
  namespace UpsertContactFormAutomationSettings {
    namespace Parameters {
      export type Id = number;
    }
    export interface PathParameters {
      id: Parameters.Id;
    }
    export type RequestBody = Components.Schemas.UpsertAutomationSettingsDto;
    namespace Responses {
      export type $200 = Components.Schemas.AutomationSettingsDto;
    }
  }
  namespace UpsertContactFormShopifyMailtoReplacement {
    namespace Parameters {
      export type ContactFormId = number;
    }
    export interface PathParameters {
      contact_form_id: Parameters.ContactFormId;
    }
    export type RequestBody = Components.Schemas.UpsertMailtoReplacementConfigDto;
    namespace Responses {
      export type $200 = Components.Schemas.MailtoReplacementConfigDto;
    }
  }
  namespace UpsertHelpCenterAutomationSettings {
    namespace Parameters {
      export type HelpCenterId = number;
    }
    export interface PathParameters {
      help_center_id: Parameters.HelpCenterId;
    }
    export type RequestBody = Components.Schemas.UpsertAutomationSettingsDto;
    namespace Responses {
      export type $200 = Components.Schemas.AutomationSettingsDto;
    }
  }
}

export interface OperationMethods {
  /**
   * importCsv - Import a CSV file
   */
  'importCsv'(
    parameters?: Parameters<Paths.ImportCsv.PathParameters> | null,
    data?: Paths.ImportCsv.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ImportCsv.Responses.$201>
  /**
   * analyseCsv - Provide information on a CSV file with a preview of its rows
   */
  'analyseCsv'(
    parameters?: Parameters<Paths.AnalyseCsv.PathParameters> | null,
    data?: Paths.AnalyseCsv.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AnalyseCsv.Responses.$200>
  /**
   * generateCsvTemplate - Generate a template CSV based on the help-center's languages
   */
  'generateCsvTemplate'(
    parameters?: Parameters<Paths.GenerateCsvTemplate.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GenerateCsvTemplate.Responses.$200>
  /**
   * createHotswapSessionToken - Generate hotswap session token
   */
  'createHotswapSessionToken'(
    parameters?: Parameters<Paths.CreateHotswapSessionToken.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateHotswapSessionToken.Responses.$201>
  /**
   * complete - Webhook called by hotswap when import is completed
   */
  'complete'(
    parameters?: Parameters<Paths.Complete.PathParameters> | null,
    data?: Paths.Complete.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * getHotswapStatus - Get hotswap import status
   */
  'getHotswapStatus'(
    parameters?: Parameters<Paths.GetHotswapStatus.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetHotswapStatus.Responses.$200>
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
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ListHelpCenters.Responses.$200>
  /**
   * createHelpCenter - Create a help center
   */
  'createHelpCenter'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.CreateHelpCenter.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateHelpCenter.Responses.$201>
  /**
   * getAccountInfo - Get account information for a help center
   * 
   * When both subdomain and custom_domain are provided, the subdomain will be used to search the help center
   */
  'getAccountInfo'(
    parameters?: Parameters<Paths.GetAccountInfo.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetAccountInfo.Responses.$200>
  /**
   * checkHelpCenterWithSubdomainExists - Check that a help center with this subdomain exists
   */
  'checkHelpCenterWithSubdomainExists'(
    parameters?: Parameters<Paths.CheckHelpCenterWithSubdomainExists.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * getHelpCenter - Retrieve a help center
   */
  'getHelpCenter'(
    parameters?: Parameters<Paths.GetHelpCenter.PathParameters & Paths.GetHelpCenter.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetHelpCenter.Responses.$200>
  /**
   * updateHelpCenter - Update a help center
   */
  'updateHelpCenter'(
    parameters?: Parameters<Paths.UpdateHelpCenter.PathParameters> | null,
    data?: Paths.UpdateHelpCenter.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateHelpCenter.Responses.$200>
  /**
   * deleteHelpCenter - Delete a help center
   */
  'deleteHelpCenter'(
    parameters?: Parameters<Paths.DeleteHelpCenter.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * getHelpCenterByUid - Retrieve a Help Center by uid
   */
  'getHelpCenterByUid'(
    parameters?: Parameters<Paths.GetHelpCenterByUid.PathParameters & Paths.GetHelpCenterByUid.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetHelpCenterByUid.Responses.$200>
  /**
   * deleteAccountHelpCenters - Delete all Help centers of an account
   */
  'deleteAccountHelpCenters'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.DeleteAccountHelpCenters.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * purgeCache - Purge CDN cache
   */
  'purgeCache'(
    parameters?: Parameters<Paths.PurgeCache.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * duplicateHelpCenter - Duplicate a help center
   * 
   * Duplicate a help center with all its translations, categories, articles, navigation links and redirects.
   */
  'duplicateHelpCenter'(
    parameters?: Parameters<Paths.DuplicateHelpCenter.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DuplicateHelpCenter.Responses.$201>
  /**
   * getHelpCenterAutomationSettings - Get a Help center automation settings
   */
  'getHelpCenterAutomationSettings'(
    parameters?: Parameters<Paths.GetHelpCenterAutomationSettings.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetHelpCenterAutomationSettings.Responses.$200>
  /**
   * upsertHelpCenterAutomationSettings - Update a Help center automation settings
   */
  'upsertHelpCenterAutomationSettings'(
    parameters?: Parameters<Paths.UpsertHelpCenterAutomationSettings.PathParameters> | null,
    data?: Paths.UpsertHelpCenterAutomationSettings.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpsertHelpCenterAutomationSettings.Responses.$200>
  /**
   * listHelpCenterTranslations - List help center's translations
   */
  'listHelpCenterTranslations'(
    parameters?: Parameters<Paths.ListHelpCenterTranslations.PathParameters & Paths.ListHelpCenterTranslations.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ListHelpCenterTranslations.Responses.$200>
  /**
   * createHelpCenterTranslation - Create a help center translation
   */
  'createHelpCenterTranslation'(
    parameters?: Parameters<Paths.CreateHelpCenterTranslation.PathParameters> | null,
    data?: Paths.CreateHelpCenterTranslation.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateHelpCenterTranslation.Responses.$201>
  /**
   * updateHelpCenterTranslation - Update a help center translation
   */
  'updateHelpCenterTranslation'(
    parameters?: Parameters<Paths.UpdateHelpCenterTranslation.PathParameters> | null,
    data?: Paths.UpdateHelpCenterTranslation.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateHelpCenterTranslation.Responses.$200>
  /**
   * deleteHelpCenterTranslation - Delete a help center translation
   */
  'deleteHelpCenterTranslation'(
    parameters?: Parameters<Paths.DeleteHelpCenterTranslation.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * listCustomDomains - List custom domains
   */
  'listCustomDomains'(
    parameters?: Parameters<Paths.ListCustomDomains.PathParameters & Paths.ListCustomDomains.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ListCustomDomains.Responses.$200>
  /**
   * createCustomDomain - Create a custom domain
   */
  'createCustomDomain'(
    parameters?: Parameters<Paths.CreateCustomDomain.PathParameters> | null,
    data?: Paths.CreateCustomDomain.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateCustomDomain.Responses.$201>
  /**
   * getCustomDomain - Retrieve a custom domain
   */
  'getCustomDomain'(
    parameters?: Parameters<Paths.GetCustomDomain.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetCustomDomain.Responses.$200>
  /**
   * deleteCustomDomain - Delete a custom domain
   */
  'deleteCustomDomain'(
    parameters?: Parameters<Paths.DeleteCustomDomain.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * checkCustomDomainStatus - Check the status of a custom domain
   */
  'checkCustomDomainStatus'(
    parameters?: Parameters<Paths.CheckCustomDomainStatus.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CheckCustomDomainStatus.Responses.$200>
  /**
   * getExtraHTML - Get a help center's extra HTML
   */
  'getExtraHTML'(
    parameters?: Parameters<Paths.GetExtraHTML.PathParameters & Paths.GetExtraHTML.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetExtraHTML.Responses.$200>
  /**
   * updateExtraHTML - Update a help center's extra HTML
   */
  'updateExtraHTML'(
    parameters?: Parameters<Paths.UpdateExtraHTML.PathParameters> | null,
    data?: Paths.UpdateExtraHTML.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateExtraHTML.Responses.$200>
  /**
   * listLocales - List supported locales
   */
  'listLocales'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ListLocales.Responses.$200>
  /**
   * getLocale - Retrieve a locale
   */
  'getLocale'(
    parameters?: Parameters<Paths.GetLocale.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetLocale.Responses.$200>
  /**
   * listRedirects - List all redirects
   * 
   * TODO: pagination
   */
  'listRedirects'(
    parameters?: Parameters<Paths.ListRedirects.PathParameters & Paths.ListRedirects.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ListRedirects.Responses.$200>
  /**
   * createRedirect - Create a new redirect
   */
  'createRedirect'(
    parameters?: Parameters<Paths.CreateRedirect.PathParameters> | null,
    data?: Paths.CreateRedirect.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateRedirect.Responses.$201>
  /**
   * deleteRedirect - Delete a redirect
   */
  'deleteRedirect'(
    parameters?: Parameters<Paths.DeleteRedirect.PathParameters & Paths.DeleteRedirect.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * listCategories - List categories
   * 
   * List the top level categories with pagination metadata.
   */
  'listCategories'(
    parameters?: Parameters<Paths.ListCategories.PathParameters & Paths.ListCategories.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ListCategories.Responses.$200>
  /**
   * createCategory - Create a category
   * 
   * Create a category in a given help center. If the provided `parent_category_id` field is `null` or is not provided, the category will be created at the root category level.
   */
  'createCategory'(
    parameters?: Parameters<Paths.CreateCategory.PathParameters> | null,
    data?: Paths.CreateCategory.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateCategory.Responses.$201>
  /**
   * getCategoriesPositions - Retrieve categories' positions
   */
  'getCategoriesPositions'(
    parameters?: Parameters<Paths.GetCategoriesPositions.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetCategoriesPositions.Responses.$200>
  /**
   * setCategoriesPositions - Set categories' positions
   * 
   * If the provided `id`s is missing an item, this item will be sorted last.
   */
  'setCategoriesPositions'(
    parameters?: Parameters<Paths.SetCategoriesPositions.PathParameters> | null,
    data?: Paths.SetCategoriesPositions.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.SetCategoriesPositions.Responses.$200>
  /**
   * getCategory - Retrieve a category
   */
  'getCategory'(
    parameters?: Parameters<Paths.GetCategory.PathParameters & Paths.GetCategory.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetCategory.Responses.$200>
  /**
   * deleteCategory - Delete a category. Deletion is allowed for categories that have no articles or sub-categories.
   */
  'deleteCategory'(
    parameters?: Parameters<Paths.DeleteCategory.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * listCategoryTranslations - List category's translations
   */
  'listCategoryTranslations'(
    parameters?: Parameters<Paths.ListCategoryTranslations.PathParameters & Paths.ListCategoryTranslations.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ListCategoryTranslations.Responses.$200>
  /**
   * createCategoryTranslation - Create a category translation
   * 
   * Create a category translation in a given help center. If the provided `parent_category_id` field is `null` or is not provided, the category will be moved to the root level.
   */
  'createCategoryTranslation'(
    parameters?: Parameters<Paths.CreateCategoryTranslation.PathParameters> | null,
    data?: Paths.CreateCategoryTranslation.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateCategoryTranslation.Responses.$201>
  /**
   * updateCategoryTranslation - Update a category translation
   * 
   * Update a category translation in a given help center. If the provided `parent_category_id` field is `null` or is not provided, the category will be moved to the root level.
   */
  'updateCategoryTranslation'(
    parameters?: Parameters<Paths.UpdateCategoryTranslation.PathParameters> | null,
    data?: Paths.UpdateCategoryTranslation.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateCategoryTranslation.Responses.$200>
  /**
   * deleteCategoryTranslation - Delete a category translation
   * 
   * So that a category have at least 1
   *     translation, you can't delete a translation if it's the only
   *     non-deleted translation.
   */
  'deleteCategoryTranslation'(
    parameters?: Parameters<Paths.DeleteCategoryTranslation.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * getCategoryTree - Retrieve the category, its subcategories and subarticles in a tree structure
   */
  'getCategoryTree'(
    parameters?: Parameters<Paths.GetCategoryTree.PathParameters & Paths.GetCategoryTree.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetCategoryTree.Responses.$200>
  /**
   * getSubCategoriesPositions - Retrieve sub-categories' positions
   * 
   * The category id that will be used as the root node of the tree. If `0` is provided, the children ids of the top level categories of the help center will be returned
   */
  'getSubCategoriesPositions'(
    parameters?: Parameters<Paths.GetSubCategoriesPositions.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetSubCategoriesPositions.Responses.$200>
  /**
   * setSubCategoriesPositions - Set sub-categories' positions
   * 
   * The category id that will be used as the root node of the tree. If `0` is provided, the children ids of the top level categories of the help center will be returned
   */
  'setSubCategoriesPositions'(
    parameters?: Parameters<Paths.SetSubCategoriesPositions.PathParameters> | null,
    data?: Paths.SetSubCategoriesPositions.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.SetSubCategoriesPositions.Responses.$200>
  /**
   * listCategoryArticles - List category's articles
   */
  'listCategoryArticles'(
    parameters?: Parameters<Paths.ListCategoryArticles.PathParameters & Paths.ListCategoryArticles.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ListCategoryArticles.Responses.$200>
  /**
   * deleteCategoryArticles - Delete category's articles
   */
  'deleteCategoryArticles'(
    parameters?: Parameters<Paths.DeleteCategoryArticles.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * getCategoryArticlesPositions - Retrieve articles' positions in category
   */
  'getCategoryArticlesPositions'(
    parameters?: Parameters<Paths.GetCategoryArticlesPositions.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetCategoryArticlesPositions.Responses.$200>
  /**
   * setArticlesPositionsInCategory - Set articles' positions in category
   * 
   * If the provided `id`s is missing an item, this item will be sorted last.
   */
  'setArticlesPositionsInCategory'(
    parameters?: Parameters<Paths.SetArticlesPositionsInCategory.PathParameters> | null,
    data?: Paths.SetArticlesPositionsInCategory.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.SetArticlesPositionsInCategory.Responses.$200>
  /**
   * listArticles - List articles
   * 
   * If you want to get articles ordered by `position` in a category, prefer using
   * `/categories/:category_id/articles`.
   */
  'listArticles'(
    parameters?: Parameters<Paths.ListArticles.PathParameters & Paths.ListArticles.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ListArticles.Responses.$200>
  /**
   * createArticle - Create an article
   * 
   * Create an article for the given help center.
   * 
   * A translation should be provided when creating an article.
   */
  'createArticle'(
    parameters?: Parameters<Paths.CreateArticle.PathParameters> | null,
    data?: Paths.CreateArticle.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateArticle.Responses.$201>
  /**
   * getUncategorizedArticlesPositions - Retrieve uncategorized articles' positions
   */
  'getUncategorizedArticlesPositions'(
    parameters?: Parameters<Paths.GetUncategorizedArticlesPositions.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetUncategorizedArticlesPositions.Responses.$200>
  /**
   * setUncategorizedArticlesPositions - Set uncategorized articles' positions
   * 
   * If the provided `id`s is missing an item, this item will be sorted last.
   */
  'setUncategorizedArticlesPositions'(
    parameters?: Parameters<Paths.SetUncategorizedArticlesPositions.PathParameters> | null,
    data?: Paths.SetUncategorizedArticlesPositions.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.SetUncategorizedArticlesPositions.Responses.$200>
  /**
   * getArticle - Retrieve an article
   */
  'getArticle'(
    parameters?: Parameters<Paths.GetArticle.PathParameters & Paths.GetArticle.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetArticle.Responses.$200>
  /**
   * updateArticle - Update an article
   */
  'updateArticle'(
    parameters?: Parameters<Paths.UpdateArticle.PathParameters> | null,
    data?: Paths.UpdateArticle.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateArticle.Responses.$200>
  /**
   * deleteArticle - Delete an article
   */
  'deleteArticle'(
    parameters?: Parameters<Paths.DeleteArticle.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * listArticleTranslations - List article's translations
   */
  'listArticleTranslations'(
    parameters?: Parameters<Paths.ListArticleTranslations.PathParameters & Paths.ListArticleTranslations.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ListArticleTranslations.Responses.$200>
  /**
   * createArticleTranslation - Create an article translation
   */
  'createArticleTranslation'(
    parameters?: Parameters<Paths.CreateArticleTranslation.PathParameters> | null,
    data?: Paths.CreateArticleTranslation.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateArticleTranslation.Responses.$201>
  /**
   * updateArticleTranslation - Update an article translation
   */
  'updateArticleTranslation'(
    parameters?: Parameters<Paths.UpdateArticleTranslation.PathParameters> | null,
    data?: Paths.UpdateArticleTranslation.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateArticleTranslation.Responses.$200>
  /**
   * deleteArticleTranslation - Delete an article translation
   * 
   * So that an article have at least 1
   *     translation, you can't delete a translation if it's the only
   *     non-deleted translation.
   */
  'deleteArticleTranslation'(
    parameters?: Parameters<Paths.DeleteArticleTranslation.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * createArticleTranslationRating - Create an article translation rating
   */
  'createArticleTranslationRating'(
    parameters?: Parameters<Paths.CreateArticleTranslationRating.PathParameters> | null,
    data?: Paths.CreateArticleTranslationRating.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateArticleTranslationRating.Responses.$201>
  /**
   * updateArticleTranslationRating - Update an article translation rating
   */
  'updateArticleTranslationRating'(
    parameters?: Parameters<Paths.UpdateArticleTranslationRating.PathParameters> | null,
    data?: Paths.UpdateArticleTranslationRating.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateArticleTranslationRating.Responses.$200>
  /**
   * deleteArticleTranslationRating - Removes an article translation rating
   */
  'deleteArticleTranslationRating'(
    parameters?: Parameters<Paths.DeleteArticleTranslationRating.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * createAccessToken - Generate JWT token
   */
  'createAccessToken'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateAccessToken.Responses.$201>
  /**
   * getFileUploadPolicy - Generate a signed url to upload a file based on the declared policy
   */
  'getFileUploadPolicy'(
    parameters?: Parameters<Paths.GetFileUploadPolicy.PathParameters> | null,
    data?: Paths.GetFileUploadPolicy.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetFileUploadPolicy.Responses.$201>
  /**
   * getAttachmentUploadPolicy - Generate a signed url to upload a file based on the declared policy
   */
  'getAttachmentUploadPolicy'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.GetAttachmentUploadPolicy.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetAttachmentUploadPolicy.Responses.$201>
  /**
   * checkContactFormNameExists - Check that a contact form with the provided name exists
   */
  'checkContactFormNameExists'(
    parameters?: Parameters<Paths.CheckContactFormNameExists.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * listContactForms - List the contact forms
   */
  'listContactForms'(
    parameters?: Parameters<Paths.ListContactForms.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ListContactForms.Responses.$200>
  /**
   * createContactForm - Create a Contact Form
   */
  'createContactForm'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.CreateContactForm.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateContactForm.Responses.$201>
  /**
   * getContactForm - Retrieve a Contact form
   */
  'getContactForm'(
    parameters?: Parameters<Paths.GetContactForm.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetContactForm.Responses.$200>
  /**
   * updateContactForm - Update a Contact Form
   */
  'updateContactForm'(
    parameters?: Parameters<Paths.UpdateContactForm.PathParameters> | null,
    data?: Paths.UpdateContactForm.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateContactForm.Responses.$200>
  /**
   * deleteContactForm - Delete a Contact Form
   */
  'deleteContactForm'(
    parameters?: Parameters<Paths.DeleteContactForm.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * getContactFormByUid - Retrieve a Contact form by uid
   */
  'getContactFormByUid'(
    parameters?: Parameters<Paths.GetContactFormByUid.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetContactFormByUid.Responses.$200>
  /**
   * submitContactFormByUid - Submit a Contact Form by uid
   */
  'submitContactFormByUid'(
    parameters?: Parameters<Paths.SubmitContactFormByUid.PathParameters> | null,
    data?: Paths.SubmitContactFormByUid.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * getContactFormAutomationSettings - Get a Contact Form automation settings
   */
  'getContactFormAutomationSettings'(
    parameters?: Parameters<Paths.GetContactFormAutomationSettings.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetContactFormAutomationSettings.Responses.$200>
  /**
   * upsertContactFormAutomationSettings - Update a Contact Form automation settings
   */
  'upsertContactFormAutomationSettings'(
    parameters?: Parameters<Paths.UpsertContactFormAutomationSettings.PathParameters> | null,
    data?: Paths.UpsertContactFormAutomationSettings.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpsertContactFormAutomationSettings.Responses.$200>
  /**
   * contactFormPurgeCache - Purge cache for Contact Form
   */
  'contactFormPurgeCache'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.ContactFormPurgeCache.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * updateEmailIntegration - Update the contact form email integration values
   * 
   * This will update all the contact forms that are using the "deactivated_integration_id" for the contact form feature. If a "fallback_integration" is provided, those contact forms will use this new integration for the contact form feature. Else, the contact form feature will be disabled.
   */
  'updateEmailIntegration'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.UpdateEmailIntegration.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * listContactFormShopifyPageEmbedments - List the Contact Form Shopify Page Embedments
   */
  'listContactFormShopifyPageEmbedments'(
    parameters?: Parameters<Paths.ListContactFormShopifyPageEmbedments.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ListContactFormShopifyPageEmbedments.Responses.$200>
  /**
   * createContactFormShopifyPageEmbedment - Create a Contact Form Shopify Page Embedment
   * 
   * The creation endpoint accepts 2 payloads:
   *     - {title: string; pageUrlPath: string} - embed in a new page
   *     - {position: PageEmbedmentPosition, pageExternalId: string} - embed in an existing page
   */
  'createContactFormShopifyPageEmbedment'(
    parameters?: Parameters<Paths.CreateContactFormShopifyPageEmbedment.PathParameters> | null,
    data?: Paths.CreateContactFormShopifyPageEmbedment.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateContactFormShopifyPageEmbedment.Responses.$201>
  /**
   * updateContactFormShopifyPageEmbedment - Update a Contact Form Shopify Page Embedment
   */
  'updateContactFormShopifyPageEmbedment'(
    parameters?: Parameters<Paths.UpdateContactFormShopifyPageEmbedment.PathParameters> | null,
    data?: Paths.UpdateContactFormShopifyPageEmbedment.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateContactFormShopifyPageEmbedment.Responses.$200>
  /**
   * deleteContactFormShopifyPageEmbedment - Delete a Contact Form Shopify Page Embedment
   */
  'deleteContactFormShopifyPageEmbedment'(
    parameters?: Parameters<Paths.DeleteContactFormShopifyPageEmbedment.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * listContactFormShopifyPages - List the Contact Form Shopify Pages available for a Contact Form Embedment
   */
  'listContactFormShopifyPages'(
    parameters?: Parameters<Paths.ListContactFormShopifyPages.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ListContactFormShopifyPages.Responses.$200>
  /**
   * listHelpCenterShopifyPageEmbedments - List the Help Center Shopify Page Embedments
   */
  'listHelpCenterShopifyPageEmbedments'(
    parameters?: Parameters<Paths.ListHelpCenterShopifyPageEmbedments.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ListHelpCenterShopifyPageEmbedments.Responses.$200>
  /**
   * createHelpCenterShopifyPageEmbedment - Create a Help Center Form Shopify Page Embedment
   * 
   * The creation endpoint accepts 2 payloads:
   *     - {title: string; pageUrlPath: string} - embed in a new page
   *     - {position: PageEmbedmentPosition, pageExternalId: string} - embed in an existing page
   */
  'createHelpCenterShopifyPageEmbedment'(
    parameters?: Parameters<Paths.CreateHelpCenterShopifyPageEmbedment.PathParameters> | null,
    data?: Paths.CreateHelpCenterShopifyPageEmbedment.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateHelpCenterShopifyPageEmbedment.Responses.$201>
  /**
   * updateHelpCenterShopifyPageEmbedment - Update a Help Center Shopify Page Embedment
   */
  'updateHelpCenterShopifyPageEmbedment'(
    parameters?: Parameters<Paths.UpdateHelpCenterShopifyPageEmbedment.PathParameters> | null,
    data?: Paths.UpdateHelpCenterShopifyPageEmbedment.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateHelpCenterShopifyPageEmbedment.Responses.$200>
  /**
   * deleteHelpCenterShopifyPageEmbedment - Delete a Help Center Shopify Page Embedment
   */
  'deleteHelpCenterShopifyPageEmbedment'(
    parameters?: Parameters<Paths.DeleteHelpCenterShopifyPageEmbedment.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * listHelpCenterShopifyPages - List the Help Center Shopify Pages available for a Help Center Embedment
   */
  'listHelpCenterShopifyPages'(
    parameters?: Parameters<Paths.ListHelpCenterShopifyPages.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ListHelpCenterShopifyPages.Responses.$200>
  /**
   * listNavigationLinks - List navigation links
   */
  'listNavigationLinks'(
    parameters?: Parameters<Paths.ListNavigationLinks.PathParameters & Paths.ListNavigationLinks.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ListNavigationLinks.Responses.$200>
  /**
   * createNavigationLink - Create a navigation link
   */
  'createNavigationLink'(
    parameters?: Parameters<Paths.CreateNavigationLink.PathParameters> | null,
    data?: Paths.CreateNavigationLink.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateNavigationLink.Responses.$201>
  /**
   * updateNavigationLink - Update a navigation link
   */
  'updateNavigationLink'(
    parameters?: Parameters<Paths.UpdateNavigationLink.PathParameters> | null,
    data?: Paths.UpdateNavigationLink.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateNavigationLink.Responses.$200>
  /**
   * deleteNavigationLink - Delete a navigation link
   */
  'deleteNavigationLink'(
    parameters?: Parameters<Paths.DeleteNavigationLink.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * getNavigationLinksPositions - Retrieve navigation links' positions
   */
  'getNavigationLinksPositions'(
    parameters?: Parameters<Paths.GetNavigationLinksPositions.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetNavigationLinksPositions.Responses.$200>
  /**
   * setNavigationLinksPositions - Set navigation links' positions
   * 
   * If the provided `id`s is missing an item, this item will be sorted last.
   */
  'setNavigationLinksPositions'(
    parameters?: Parameters<Paths.SetNavigationLinksPositions.PathParameters> | null,
    data?: Paths.SetNavigationLinksPositions.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.SetNavigationLinksPositions.Responses.$200>
  /**
   * listGoogleFonts - List google fonts
   */
  'listGoogleFonts'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * handoverWorkflowExecution - Hand over a workflow execution
   */
  'handoverWorkflowExecution'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.HandoverWorkflowExecution.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * getContactFormMailtoReplacementConfig - Get a Contact Form Mailto Replacement Config
   */
  'getContactFormMailtoReplacementConfig'(
    parameters?: Parameters<Paths.GetContactFormMailtoReplacementConfig.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetContactFormMailtoReplacementConfig.Responses.$200>
  /**
   * upsertContactFormShopifyMailtoReplacement - Create, Update or Delete a Contact Form Mailto Replacement Config
   * 
   * If the emails array is empty, the config will be deleted
   */
  'upsertContactFormShopifyMailtoReplacement'(
    parameters?: Parameters<Paths.UpsertContactFormShopifyMailtoReplacement.PathParameters> | null,
    data?: Paths.UpsertContactFormShopifyMailtoReplacement.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpsertContactFormShopifyMailtoReplacement.Responses.$200>
  /**
   * getContactFormShopifyMailtoReplacementConfig
   */
  'getContactFormShopifyMailtoReplacementConfig'(
    parameters?: Parameters<Paths.GetContactFormShopifyMailtoReplacementConfig.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetContactFormShopifyMailtoReplacementConfig.Responses.$200>
  /**
   * listArticleTemplates - List article templates
   */
  'listArticleTemplates'(
    parameters?: Parameters<Paths.ListArticleTemplates.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ListArticleTemplates.Responses.$200>
  /**
   * getArticleTemplate - Retrieve article template
   */
  'getArticleTemplate'(
    parameters?: Parameters<Paths.GetArticleTemplate.PathParameters & Paths.GetArticleTemplate.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetArticleTemplate.Responses.$200>
}

export interface PathsDictionary {
  ['/api/help-center/help-centers/{help_center_id}/import/csv/process']: {
    /**
     * importCsv - Import a CSV file
     */
    'post'(
      parameters?: Parameters<Paths.ImportCsv.PathParameters> | null,
      data?: Paths.ImportCsv.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ImportCsv.Responses.$201>
  }
  ['/api/help-center/help-centers/{help_center_id}/import/csv/analysis']: {
    /**
     * analyseCsv - Provide information on a CSV file with a preview of its rows
     */
    'post'(
      parameters?: Parameters<Paths.AnalyseCsv.PathParameters> | null,
      data?: Paths.AnalyseCsv.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AnalyseCsv.Responses.$200>
  }
  ['/api/help-center/help-centers/{help_center_id}/import/csv/template']: {
    /**
     * generateCsvTemplate - Generate a template CSV based on the help-center's languages
     */
    'post'(
      parameters?: Parameters<Paths.GenerateCsvTemplate.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GenerateCsvTemplate.Responses.$200>
  }
  ['/api/help-center/help-centers/{help_center_id}/import/hotswap/token']: {
    /**
     * createHotswapSessionToken - Generate hotswap session token
     */
    'post'(
      parameters?: Parameters<Paths.CreateHotswapSessionToken.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateHotswapSessionToken.Responses.$201>
  }
  ['/api/help-center/help-centers/{help_center_id}/import/hotswap/complete']: {
    /**
     * complete - Webhook called by hotswap when import is completed
     */
    'post'(
      parameters?: Parameters<Paths.Complete.PathParameters> | null,
      data?: Paths.Complete.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/api/help-center/help-centers/{help_center_id}/import/hotswap/status']: {
    /**
     * getHotswapStatus - Get hotswap import status
     */
    'get'(
      parameters?: Parameters<Paths.GetHotswapStatus.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetHotswapStatus.Responses.$200>
  }
  ['/api/help-center/help-centers']: {
    /**
     * createHelpCenter - Create a help center
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.CreateHelpCenter.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateHelpCenter.Responses.$201>
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
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ListHelpCenters.Responses.$200>
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
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetAccountInfo.Responses.$200>
  }
  ['/api/help-center/help-centers/subdomain/{subdomain}']: {
    /**
     * checkHelpCenterWithSubdomainExists - Check that a help center with this subdomain exists
     */
    'head'(
      parameters?: Parameters<Paths.CheckHelpCenterWithSubdomainExists.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/api/help-center/help-centers/{help_center_id}']: {
    /**
     * getHelpCenter - Retrieve a help center
     */
    'get'(
      parameters?: Parameters<Paths.GetHelpCenter.PathParameters & Paths.GetHelpCenter.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetHelpCenter.Responses.$200>
    /**
     * updateHelpCenter - Update a help center
     */
    'put'(
      parameters?: Parameters<Paths.UpdateHelpCenter.PathParameters> | null,
      data?: Paths.UpdateHelpCenter.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateHelpCenter.Responses.$200>
    /**
     * deleteHelpCenter - Delete a help center
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteHelpCenter.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/api/help-center/help-centers/uid/{uid}']: {
    /**
     * getHelpCenterByUid - Retrieve a Help Center by uid
     */
    'get'(
      parameters?: Parameters<Paths.GetHelpCenterByUid.PathParameters & Paths.GetHelpCenterByUid.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetHelpCenterByUid.Responses.$200>
  }
  ['/api/help-center/help-centers/delete-account']: {
    /**
     * deleteAccountHelpCenters - Delete all Help centers of an account
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.DeleteAccountHelpCenters.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/api/help-center/help-centers/shop-name/{shop_name}/purge-cache']: {
    /**
     * purgeCache - Purge CDN cache
     */
    'post'(
      parameters?: Parameters<Paths.PurgeCache.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/api/help-center/help-centers/{help_center_id}/duplicate']: {
    /**
     * duplicateHelpCenter - Duplicate a help center
     * 
     * Duplicate a help center with all its translations, categories, articles, navigation links and redirects.
     */
    'post'(
      parameters?: Parameters<Paths.DuplicateHelpCenter.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DuplicateHelpCenter.Responses.$201>
  }
  ['/api/help-center/help-centers/{help_center_id}/automation-settings']: {
    /**
     * getHelpCenterAutomationSettings - Get a Help center automation settings
     */
    'get'(
      parameters?: Parameters<Paths.GetHelpCenterAutomationSettings.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetHelpCenterAutomationSettings.Responses.$200>
    /**
     * upsertHelpCenterAutomationSettings - Update a Help center automation settings
     */
    'put'(
      parameters?: Parameters<Paths.UpsertHelpCenterAutomationSettings.PathParameters> | null,
      data?: Paths.UpsertHelpCenterAutomationSettings.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpsertHelpCenterAutomationSettings.Responses.$200>
  }
  ['/api/help-center/help-centers/{help_center_id}/translations']: {
    /**
     * listHelpCenterTranslations - List help center's translations
     */
    'get'(
      parameters?: Parameters<Paths.ListHelpCenterTranslations.PathParameters & Paths.ListHelpCenterTranslations.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ListHelpCenterTranslations.Responses.$200>
    /**
     * createHelpCenterTranslation - Create a help center translation
     */
    'post'(
      parameters?: Parameters<Paths.CreateHelpCenterTranslation.PathParameters> | null,
      data?: Paths.CreateHelpCenterTranslation.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateHelpCenterTranslation.Responses.$201>
  }
  ['/api/help-center/help-centers/{help_center_id}/translations/{locale}']: {
    /**
     * updateHelpCenterTranslation - Update a help center translation
     */
    'put'(
      parameters?: Parameters<Paths.UpdateHelpCenterTranslation.PathParameters> | null,
      data?: Paths.UpdateHelpCenterTranslation.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateHelpCenterTranslation.Responses.$200>
    /**
     * deleteHelpCenterTranslation - Delete a help center translation
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteHelpCenterTranslation.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/api/help-center/help-centers/{help_center_id}/custom-domains']: {
    /**
     * listCustomDomains - List custom domains
     */
    'get'(
      parameters?: Parameters<Paths.ListCustomDomains.PathParameters & Paths.ListCustomDomains.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ListCustomDomains.Responses.$200>
    /**
     * createCustomDomain - Create a custom domain
     */
    'post'(
      parameters?: Parameters<Paths.CreateCustomDomain.PathParameters> | null,
      data?: Paths.CreateCustomDomain.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateCustomDomain.Responses.$201>
  }
  ['/api/help-center/help-centers/{help_center_id}/custom-domains/{hostname}']: {
    /**
     * getCustomDomain - Retrieve a custom domain
     */
    'get'(
      parameters?: Parameters<Paths.GetCustomDomain.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetCustomDomain.Responses.$200>
    /**
     * deleteCustomDomain - Delete a custom domain
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteCustomDomain.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/api/help-center/help-centers/{help_center_id}/custom-domains/{hostname}/check-status']: {
    /**
     * checkCustomDomainStatus - Check the status of a custom domain
     */
    'post'(
      parameters?: Parameters<Paths.CheckCustomDomainStatus.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CheckCustomDomainStatus.Responses.$200>
  }
  ['/api/help-center/help-centers/{help_center_id}/extra-html']: {
    /**
     * getExtraHTML - Get a help center's extra HTML
     */
    'get'(
      parameters?: Parameters<Paths.GetExtraHTML.PathParameters & Paths.GetExtraHTML.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetExtraHTML.Responses.$200>
  }
  ['/api/help-center/help-centers/{help_center_id}/extra-html/{locale}']: {
    /**
     * updateExtraHTML - Update a help center's extra HTML
     */
    'put'(
      parameters?: Parameters<Paths.UpdateExtraHTML.PathParameters> | null,
      data?: Paths.UpdateExtraHTML.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateExtraHTML.Responses.$200>
  }
  ['/api/help-center/locales']: {
    /**
     * listLocales - List supported locales
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ListLocales.Responses.$200>
  }
  ['/api/help-center/locales/{locale}']: {
    /**
     * getLocale - Retrieve a locale
     */
    'get'(
      parameters?: Parameters<Paths.GetLocale.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetLocale.Responses.$200>
  }
  ['/api/help-center/help-centers/{help_center_id}/redirects']: {
    /**
     * createRedirect - Create a new redirect
     */
    'post'(
      parameters?: Parameters<Paths.CreateRedirect.PathParameters> | null,
      data?: Paths.CreateRedirect.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateRedirect.Responses.$201>
    /**
     * listRedirects - List all redirects
     * 
     * TODO: pagination
     */
    'get'(
      parameters?: Parameters<Paths.ListRedirects.PathParameters & Paths.ListRedirects.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ListRedirects.Responses.$200>
    /**
     * deleteRedirect - Delete a redirect
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteRedirect.PathParameters & Paths.DeleteRedirect.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/api/help-center/help-centers/{help_center_id}/categories']: {
    /**
     * createCategory - Create a category
     * 
     * Create a category in a given help center. If the provided `parent_category_id` field is `null` or is not provided, the category will be created at the root category level.
     */
    'post'(
      parameters?: Parameters<Paths.CreateCategory.PathParameters> | null,
      data?: Paths.CreateCategory.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateCategory.Responses.$201>
    /**
     * listCategories - List categories
     * 
     * List the top level categories with pagination metadata.
     */
    'get'(
      parameters?: Parameters<Paths.ListCategories.PathParameters & Paths.ListCategories.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ListCategories.Responses.$200>
  }
  ['/api/help-center/help-centers/{help_center_id}/categories/positions']: {
    /**
     * getCategoriesPositions - Retrieve categories' positions
     */
    'get'(
      parameters?: Parameters<Paths.GetCategoriesPositions.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetCategoriesPositions.Responses.$200>
    /**
     * setCategoriesPositions - Set categories' positions
     * 
     * If the provided `id`s is missing an item, this item will be sorted last.
     */
    'put'(
      parameters?: Parameters<Paths.SetCategoriesPositions.PathParameters> | null,
      data?: Paths.SetCategoriesPositions.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.SetCategoriesPositions.Responses.$200>
  }
  ['/api/help-center/help-centers/{help_center_id}/categories/{id}']: {
    /**
     * getCategory - Retrieve a category
     */
    'get'(
      parameters?: Parameters<Paths.GetCategory.PathParameters & Paths.GetCategory.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetCategory.Responses.$200>
    /**
     * deleteCategory - Delete a category. Deletion is allowed for categories that have no articles or sub-categories.
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteCategory.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/api/help-center/help-centers/{help_center_id}/categories/{category_id}/translations']: {
    /**
     * listCategoryTranslations - List category's translations
     */
    'get'(
      parameters?: Parameters<Paths.ListCategoryTranslations.PathParameters & Paths.ListCategoryTranslations.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ListCategoryTranslations.Responses.$200>
    /**
     * createCategoryTranslation - Create a category translation
     * 
     * Create a category translation in a given help center. If the provided `parent_category_id` field is `null` or is not provided, the category will be moved to the root level.
     */
    'post'(
      parameters?: Parameters<Paths.CreateCategoryTranslation.PathParameters> | null,
      data?: Paths.CreateCategoryTranslation.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateCategoryTranslation.Responses.$201>
  }
  ['/api/help-center/help-centers/{help_center_id}/categories/{category_id}/translations/{locale}']: {
    /**
     * updateCategoryTranslation - Update a category translation
     * 
     * Update a category translation in a given help center. If the provided `parent_category_id` field is `null` or is not provided, the category will be moved to the root level.
     */
    'put'(
      parameters?: Parameters<Paths.UpdateCategoryTranslation.PathParameters> | null,
      data?: Paths.UpdateCategoryTranslation.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateCategoryTranslation.Responses.$200>
    /**
     * deleteCategoryTranslation - Delete a category translation
     * 
     * So that a category have at least 1
     *     translation, you can't delete a translation if it's the only
     *     non-deleted translation.
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteCategoryTranslation.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/api/help-center/help-centers/{help_center_id}/categories/{parent_category_id}/tree']: {
    /**
     * getCategoryTree - Retrieve the category, its subcategories and subarticles in a tree structure
     */
    'get'(
      parameters?: Parameters<Paths.GetCategoryTree.PathParameters & Paths.GetCategoryTree.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetCategoryTree.Responses.$200>
  }
  ['/api/help-center/help-centers/{help_center_id}/categories/{parent_category_id}/positions']: {
    /**
     * getSubCategoriesPositions - Retrieve sub-categories' positions
     * 
     * The category id that will be used as the root node of the tree. If `0` is provided, the children ids of the top level categories of the help center will be returned
     */
    'get'(
      parameters?: Parameters<Paths.GetSubCategoriesPositions.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetSubCategoriesPositions.Responses.$200>
    /**
     * setSubCategoriesPositions - Set sub-categories' positions
     * 
     * The category id that will be used as the root node of the tree. If `0` is provided, the children ids of the top level categories of the help center will be returned
     */
    'put'(
      parameters?: Parameters<Paths.SetSubCategoriesPositions.PathParameters> | null,
      data?: Paths.SetSubCategoriesPositions.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.SetSubCategoriesPositions.Responses.$200>
  }
  ['/api/help-center/help-centers/{help_center_id}/categories/{category_id}/articles']: {
    /**
     * listCategoryArticles - List category's articles
     */
    'get'(
      parameters?: Parameters<Paths.ListCategoryArticles.PathParameters & Paths.ListCategoryArticles.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ListCategoryArticles.Responses.$200>
    /**
     * deleteCategoryArticles - Delete category's articles
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteCategoryArticles.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/api/help-center/help-centers/{help_center_id}/categories/{category_id}/articles/positions']: {
    /**
     * getCategoryArticlesPositions - Retrieve articles' positions in category
     */
    'get'(
      parameters?: Parameters<Paths.GetCategoryArticlesPositions.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetCategoryArticlesPositions.Responses.$200>
    /**
     * setArticlesPositionsInCategory - Set articles' positions in category
     * 
     * If the provided `id`s is missing an item, this item will be sorted last.
     */
    'put'(
      parameters?: Parameters<Paths.SetArticlesPositionsInCategory.PathParameters> | null,
      data?: Paths.SetArticlesPositionsInCategory.RequestBody,
      config?: AxiosRequestConfig  
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
      parameters?: Parameters<Paths.ListArticles.PathParameters & Paths.ListArticles.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ListArticles.Responses.$200>
    /**
     * createArticle - Create an article
     * 
     * Create an article for the given help center.
     * 
     * A translation should be provided when creating an article.
     */
    'post'(
      parameters?: Parameters<Paths.CreateArticle.PathParameters> | null,
      data?: Paths.CreateArticle.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateArticle.Responses.$201>
  }
  ['/api/help-center/help-centers/{help_center_id}/articles/uncategorized/positions']: {
    /**
     * getUncategorizedArticlesPositions - Retrieve uncategorized articles' positions
     */
    'get'(
      parameters?: Parameters<Paths.GetUncategorizedArticlesPositions.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetUncategorizedArticlesPositions.Responses.$200>
    /**
     * setUncategorizedArticlesPositions - Set uncategorized articles' positions
     * 
     * If the provided `id`s is missing an item, this item will be sorted last.
     */
    'put'(
      parameters?: Parameters<Paths.SetUncategorizedArticlesPositions.PathParameters> | null,
      data?: Paths.SetUncategorizedArticlesPositions.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.SetUncategorizedArticlesPositions.Responses.$200>
  }
  ['/api/help-center/help-centers/{help_center_id}/articles/{id}']: {
    /**
     * getArticle - Retrieve an article
     */
    'get'(
      parameters?: Parameters<Paths.GetArticle.PathParameters & Paths.GetArticle.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetArticle.Responses.$200>
    /**
     * updateArticle - Update an article
     */
    'put'(
      parameters?: Parameters<Paths.UpdateArticle.PathParameters> | null,
      data?: Paths.UpdateArticle.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateArticle.Responses.$200>
    /**
     * deleteArticle - Delete an article
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteArticle.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/api/help-center/help-centers/{help_center_id}/articles/{article_id}/translations']: {
    /**
     * listArticleTranslations - List article's translations
     */
    'get'(
      parameters?: Parameters<Paths.ListArticleTranslations.PathParameters & Paths.ListArticleTranslations.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ListArticleTranslations.Responses.$200>
    /**
     * createArticleTranslation - Create an article translation
     */
    'post'(
      parameters?: Parameters<Paths.CreateArticleTranslation.PathParameters> | null,
      data?: Paths.CreateArticleTranslation.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateArticleTranslation.Responses.$201>
  }
  ['/api/help-center/help-centers/{help_center_id}/articles/{article_id}/translations/{locale}']: {
    /**
     * updateArticleTranslation - Update an article translation
     */
    'put'(
      parameters?: Parameters<Paths.UpdateArticleTranslation.PathParameters> | null,
      data?: Paths.UpdateArticleTranslation.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateArticleTranslation.Responses.$200>
    /**
     * deleteArticleTranslation - Delete an article translation
     * 
     * So that an article have at least 1
     *     translation, you can't delete a translation if it's the only
     *     non-deleted translation.
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteArticleTranslation.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/api/help-center/help-centers/{help_center_id}/articles/{article_id}/translations/{locale}/ratings']: {
    /**
     * createArticleTranslationRating - Create an article translation rating
     */
    'post'(
      parameters?: Parameters<Paths.CreateArticleTranslationRating.PathParameters> | null,
      data?: Paths.CreateArticleTranslationRating.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateArticleTranslationRating.Responses.$201>
  }
  ['/api/help-center/help-centers/{help_center_id}/articles/{article_id}/translations/{locale}/ratings/{ratingId}']: {
    /**
     * updateArticleTranslationRating - Update an article translation rating
     */
    'put'(
      parameters?: Parameters<Paths.UpdateArticleTranslationRating.PathParameters> | null,
      data?: Paths.UpdateArticleTranslationRating.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateArticleTranslationRating.Responses.$200>
    /**
     * deleteArticleTranslationRating - Removes an article translation rating
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteArticleTranslationRating.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/api/help-center/auth']: {
    /**
     * createAccessToken - Generate JWT token
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateAccessToken.Responses.$201>
  }
  ['/api/help-center/help-centers/{help_center_id}/attachments']: {
    /**
     * getFileUploadPolicy - Generate a signed url to upload a file based on the declared policy
     */
    'post'(
      parameters?: Parameters<Paths.GetFileUploadPolicy.PathParameters> | null,
      data?: Paths.GetFileUploadPolicy.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetFileUploadPolicy.Responses.$201>
  }
  ['/api/help-center/attachments']: {
    /**
     * getAttachmentUploadPolicy - Generate a signed url to upload a file based on the declared policy
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.GetAttachmentUploadPolicy.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetAttachmentUploadPolicy.Responses.$201>
  }
  ['/api/help-center/contact-forms/name/{input_name}']: {
    /**
     * checkContactFormNameExists - Check that a contact form with the provided name exists
     */
    'head'(
      parameters?: Parameters<Paths.CheckContactFormNameExists.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/api/help-center/contact-forms']: {
    /**
     * createContactForm - Create a Contact Form
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.CreateContactForm.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateContactForm.Responses.$201>
    /**
     * listContactForms - List the contact forms
     */
    'get'(
      parameters?: Parameters<Paths.ListContactForms.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ListContactForms.Responses.$200>
  }
  ['/api/help-center/contact-forms/{id}']: {
    /**
     * getContactForm - Retrieve a Contact form
     */
    'get'(
      parameters?: Parameters<Paths.GetContactForm.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetContactForm.Responses.$200>
    /**
     * updateContactForm - Update a Contact Form
     */
    'put'(
      parameters?: Parameters<Paths.UpdateContactForm.PathParameters> | null,
      data?: Paths.UpdateContactForm.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateContactForm.Responses.$200>
    /**
     * deleteContactForm - Delete a Contact Form
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteContactForm.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/api/help-center/contact-forms/uid/{uid}']: {
    /**
     * getContactFormByUid - Retrieve a Contact form by uid
     */
    'get'(
      parameters?: Parameters<Paths.GetContactFormByUid.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetContactFormByUid.Responses.$200>
  }
  ['/api/help-center/contact-forms/uid/{uid}/submit']: {
    /**
     * submitContactFormByUid - Submit a Contact Form by uid
     */
    'post'(
      parameters?: Parameters<Paths.SubmitContactFormByUid.PathParameters> | null,
      data?: Paths.SubmitContactFormByUid.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/api/help-center/contact-forms/{id}/automation-settings']: {
    /**
     * getContactFormAutomationSettings - Get a Contact Form automation settings
     */
    'get'(
      parameters?: Parameters<Paths.GetContactFormAutomationSettings.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetContactFormAutomationSettings.Responses.$200>
    /**
     * upsertContactFormAutomationSettings - Update a Contact Form automation settings
     */
    'put'(
      parameters?: Parameters<Paths.UpsertContactFormAutomationSettings.PathParameters> | null,
      data?: Paths.UpsertContactFormAutomationSettings.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpsertContactFormAutomationSettings.Responses.$200>
  }
  ['/api/help-center/contact-forms/purge-cache']: {
    /**
     * contactFormPurgeCache - Purge cache for Contact Form
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.ContactFormPurgeCache.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
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
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
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
      parameters?: Parameters<Paths.CreateContactFormShopifyPageEmbedment.PathParameters> | null,
      data?: Paths.CreateContactFormShopifyPageEmbedment.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateContactFormShopifyPageEmbedment.Responses.$201>
    /**
     * listContactFormShopifyPageEmbedments - List the Contact Form Shopify Page Embedments
     */
    'get'(
      parameters?: Parameters<Paths.ListContactFormShopifyPageEmbedments.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ListContactFormShopifyPageEmbedments.Responses.$200>
  }
  ['/api/help-center/contact-forms/{contact_form_id}/shopify-page-embedments/{embedment_id}']: {
    /**
     * updateContactFormShopifyPageEmbedment - Update a Contact Form Shopify Page Embedment
     */
    'put'(
      parameters?: Parameters<Paths.UpdateContactFormShopifyPageEmbedment.PathParameters> | null,
      data?: Paths.UpdateContactFormShopifyPageEmbedment.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateContactFormShopifyPageEmbedment.Responses.$200>
    /**
     * deleteContactFormShopifyPageEmbedment - Delete a Contact Form Shopify Page Embedment
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteContactFormShopifyPageEmbedment.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/api/help-center/contact-forms/{contact_form_id}/shopify-pages']: {
    /**
     * listContactFormShopifyPages - List the Contact Form Shopify Pages available for a Contact Form Embedment
     */
    'get'(
      parameters?: Parameters<Paths.ListContactFormShopifyPages.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
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
      parameters?: Parameters<Paths.CreateHelpCenterShopifyPageEmbedment.PathParameters> | null,
      data?: Paths.CreateHelpCenterShopifyPageEmbedment.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateHelpCenterShopifyPageEmbedment.Responses.$201>
    /**
     * listHelpCenterShopifyPageEmbedments - List the Help Center Shopify Page Embedments
     */
    'get'(
      parameters?: Parameters<Paths.ListHelpCenterShopifyPageEmbedments.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ListHelpCenterShopifyPageEmbedments.Responses.$200>
  }
  ['/api/help-center/help-centers/{help_center_id}/shopify-page-embedments/{embedment_id}']: {
    /**
     * updateHelpCenterShopifyPageEmbedment - Update a Help Center Shopify Page Embedment
     */
    'put'(
      parameters?: Parameters<Paths.UpdateHelpCenterShopifyPageEmbedment.PathParameters> | null,
      data?: Paths.UpdateHelpCenterShopifyPageEmbedment.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateHelpCenterShopifyPageEmbedment.Responses.$200>
    /**
     * deleteHelpCenterShopifyPageEmbedment - Delete a Help Center Shopify Page Embedment
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteHelpCenterShopifyPageEmbedment.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/api/help-center/help-centers/{help_center_id}/shopify-pages']: {
    /**
     * listHelpCenterShopifyPages - List the Help Center Shopify Pages available for a Help Center Embedment
     */
    'get'(
      parameters?: Parameters<Paths.ListHelpCenterShopifyPages.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ListHelpCenterShopifyPages.Responses.$200>
  }
  ['/api/help-center/help-centers/{help_center_id}/navigation-links']: {
    /**
     * createNavigationLink - Create a navigation link
     */
    'post'(
      parameters?: Parameters<Paths.CreateNavigationLink.PathParameters> | null,
      data?: Paths.CreateNavigationLink.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateNavigationLink.Responses.$201>
    /**
     * listNavigationLinks - List navigation links
     */
    'get'(
      parameters?: Parameters<Paths.ListNavigationLinks.PathParameters & Paths.ListNavigationLinks.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ListNavigationLinks.Responses.$200>
  }
  ['/api/help-center/help-centers/{help_center_id}/navigation-links/{id}']: {
    /**
     * updateNavigationLink - Update a navigation link
     */
    'put'(
      parameters?: Parameters<Paths.UpdateNavigationLink.PathParameters> | null,
      data?: Paths.UpdateNavigationLink.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateNavigationLink.Responses.$200>
    /**
     * deleteNavigationLink - Delete a navigation link
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteNavigationLink.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/api/help-center/help-centers/{help_center_id}/navigation-links/{locale}/{group}/positions']: {
    /**
     * getNavigationLinksPositions - Retrieve navigation links' positions
     */
    'get'(
      parameters?: Parameters<Paths.GetNavigationLinksPositions.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetNavigationLinksPositions.Responses.$200>
    /**
     * setNavigationLinksPositions - Set navigation links' positions
     * 
     * If the provided `id`s is missing an item, this item will be sorted last.
     */
    'put'(
      parameters?: Parameters<Paths.SetNavigationLinksPositions.PathParameters> | null,
      data?: Paths.SetNavigationLinksPositions.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.SetNavigationLinksPositions.Responses.$200>
  }
  ['/api/help-center/google-fonts']: {
    /**
     * listGoogleFonts - List google fonts
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/api/help-center/workflows/handover']: {
    /**
     * handoverWorkflowExecution - Hand over a workflow execution
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.HandoverWorkflowExecution.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/api/help-center/contact-forms/{contact_form_id}/mailto-replacement-config']: {
    /**
     * getContactFormMailtoReplacementConfig - Get a Contact Form Mailto Replacement Config
     */
    'get'(
      parameters?: Parameters<Paths.GetContactFormMailtoReplacementConfig.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetContactFormMailtoReplacementConfig.Responses.$200>
    /**
     * upsertContactFormShopifyMailtoReplacement - Create, Update or Delete a Contact Form Mailto Replacement Config
     * 
     * If the emails array is empty, the config will be deleted
     */
    'put'(
      parameters?: Parameters<Paths.UpsertContactFormShopifyMailtoReplacement.PathParameters> | null,
      data?: Paths.UpsertContactFormShopifyMailtoReplacement.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpsertContactFormShopifyMailtoReplacement.Responses.$200>
  }
  ['/api/help-center/contact-forms/shop-name/{shop_name}/mailto-replacement-config']: {
    /**
     * getContactFormShopifyMailtoReplacementConfig
     */
    'get'(
      parameters?: Parameters<Paths.GetContactFormShopifyMailtoReplacementConfig.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetContactFormShopifyMailtoReplacementConfig.Responses.$200>
  }
  ['/api/help-center/article-templates']: {
    /**
     * listArticleTemplates - List article templates
     */
    'get'(
      parameters?: Parameters<Paths.ListArticleTemplates.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ListArticleTemplates.Responses.$200>
  }
  ['/api/help-center/article-templates/{template_key}']: {
    /**
     * getArticleTemplate - Retrieve article template
     */
    'get'(
      parameters?: Parameters<Paths.GetArticleTemplate.PathParameters & Paths.GetArticleTemplate.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetArticleTemplate.Responses.$200>
  }
}

export type Client = OpenAPIClient<OperationMethods, PathsDictionary>
