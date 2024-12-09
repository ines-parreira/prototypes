import {
  OpenAPIClient,
  Parameters,
  UnknownParamsObject,
  OperationResponse,
  AxiosRequestConfig,
} from 'openapi-client-axios'; 

declare namespace Components {
  namespace Schemas {
    export interface DuplicateWfConfigurationRequestDto {
      integration_id: number;
    }
    export interface DuplicateWfConfigurationResponseDto {
      internal_id: string;
      id: string;
      account_id: number | null;
      template_internal_id?: string | null;
      name: string;
      description?: string | null;
      short_description?: string | null;
      is_draft: boolean;
      initial_step_id: string;
      entrypoint?: {
        label: string;
        label_tkey: string;
      } | null;
      steps: ({
        id: string;
        kind: "choices";
        settings: {
          choices: {
            event_id: string;
            label: string;
            label_tkey: string;
          }[];
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "handover";
        settings?: {
          ticket_tags?: string[] | null;
          ticket_assignee_user_id?: null | number;
          ticket_assignee_team_id?: null | number;
        } | null;
      } | {
        id: string;
        kind: "workflow_call";
        settings: {
          configuration_id: string;
        };
      } | {
        id: string;
        kind: "text-input";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "attachments-input";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "shopper-authentication";
        settings: {
          integration_id: number;
        };
      } | {
        id: string;
        kind: "order-selection";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "http-request";
        settings: {
          name: string;
          url: string /* uri */  | ("");
          method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
          headers?: {
            [name: string]: string;
          } | null;
          body?: string | null;
          oauth2_token_settings?: {
            account_oauth2_token_id: string;
            refresh_token_url: string;
          } | null;
          variables: {
            id: string;
            name: string;
            jsonpath: string;
            data_type?: "string" | "number" | "date" | "boolean";
          }[];
        };
      } | {
        id: string;
        kind: "helpful-prompt";
        settings?: {
          ticket_tags?: string[] | null;
          ticket_assignee_user_id?: null | number;
          ticket_assignee_team_id?: null | number;
        } | null;
      } | {
        id: string;
        kind: "message";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "end";
        settings?: {
          success: boolean;
        } | null;
      } | {
        id: string;
        kind: "conditions";
        settings: {
          name: string;
        };
      } | {
        id: string;
        kind: "order-line-item-selection";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "cancel-order";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "refund-order";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "update-shipping-address";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          name: string;
          address1: string;
          address2: string;
          city: string;
          zip: string;
          province: string;
          country: string;
          phone: string;
          last_name: string;
          first_name: string;
        };
      } | {
        id: string;
        kind: "cancel-subscription";
        settings: {
          customer_id: string;
          integration_id: string;
          subscription_id: string;
          reason: string;
        };
      } | {
        id: string;
        kind: "skip-charge";
        settings: {
          customer_id: string;
          integration_id: string;
          subscription_id: string;
          charge_id: string;
        };
      } | {
        id: string;
        kind: "remove-item";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          product_variant_id: string;
          quantity: string;
        };
      } | {
        id: string;
        kind: "replace-item";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          product_variant_id: string;
          quantity: string;
          added_product_variant_id: string;
          added_quantity: string;
        };
      } | {
        id: string;
        kind: "create-discount-code";
        settings: {
          customer_id: string;
          integration_id: string;
          type: string;
          amount: string;
          valid_for: string;
        };
      } | {
        id: string;
        kind: "reship-for-free";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "refund-shipping-costs";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "reusable-llm-prompt-call";
        settings: {
          configuration_id: string;
          configuration_internal_id: string;
          objects?: {
            customer?: string | null;
            order?: string | null;
            products?: {
              [name: string]: string;
            } | null;
          } | null;
          custom_inputs?: {
            [name: string]: string;
          } | null;
          values: {
            [name: string]: string | number | boolean;
          };
        };
      })[];
      inputs?: ({
        id: string;
        name: string;
        description: string;
        data_type: "string";
        options?: {
          label: string;
          value: string;
        }[] | null;
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "number";
        options?: {
          label: string;
          value: number;
        }[] | null;
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "boolean";
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "date";
      })[] | null;
      values?: {
        [name: string]: number | boolean | string /* date-time */  | string;
      } | null;
      transitions: {
        id: string;
        from_step_id: string;
        to_step_id: string;
        event?: {
          id: string;
          kind: "choices";
        } | null;
        name?: string | null;
        conditions?: {
          or: ({
            equals: any;
          } | {
            notEqual: any;
          } | {
            contains: any;
          } | {
            doesNotContain: any;
          } | {
            endsWith: any;
          } | {
            startsWith: any;
          } | {
            exists: any;
          } | {
            doesNotExist: any;
          } | {
            lessThan: any;
          } | {
            lessThanInterval: any;
          } | {
            lessOrEqual: any;
          } | {
            greaterThan: any;
          } | {
            greaterThanInterval: any;
          } | {
            greaterOrEqual: any;
          })[];
        } | {
          and: ({
            equals: any;
          } | {
            notEqual: any;
          } | {
            contains: any;
          } | {
            doesNotContain: any;
          } | {
            endsWith: any;
          } | {
            startsWith: any;
          } | {
            exists: any;
          } | {
            doesNotExist: any;
          } | {
            lessThan: any;
          } | {
            lessThanInterval: any;
          } | {
            lessOrEqual: any;
          } | {
            greaterThan: any;
          } | {
            greaterThanInterval: any;
          } | {
            greaterOrEqual: any;
          })[];
        };
      }[];
      available_languages: ("en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR")[];
      category?: string | null;
      created_datetime?: string | null; // date-time
      updated_datetime?: string | null; // date-time
      deleted_datetime?: string | null; // date-time
      triggers?: ({
        kind: "llm-prompt";
        settings: {
          custom_inputs: {
            id: string;
            name: string;
            instructions: string;
            data_type: "string" | "number" | "date" | "boolean";
          }[];
          object_inputs: ({
            kind: "customer";
            integration_id: number | string;
          } | {
            kind: "order";
            integration_id: number | string;
          } | {
            kind: "product";
            integration_id: number | string;
            name: string;
            instructions: string;
            id: string;
          })[];
          conditions?: {
            or: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          } | {
            and: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          };
          outputs: {
            id: string;
            description: string;
            path: string;
          }[];
        };
      } | {
        kind: "channel";
        settings: {
        };
      } | {
        kind: "reusable-llm-prompt";
        settings: {
          custom_inputs: {
            id: string;
            name: string;
            instructions: string;
            data_type: "string" | "number" | "date" | "boolean";
          }[];
          object_inputs: ({
            kind: "customer";
          } | {
            kind: "order";
          } | {
            kind: "product";
            name: string;
            instructions: string;
            id: string;
          })[];
          outputs: {
            id: string;
            name: string;
            description: string;
            path: string;
            data_type?: "string" | "number" | "date" | "boolean";
          }[];
        };
      })[] | null;
      entrypoints?: ({
        deactivated_datetime?: string | null; // date-time
        kind: "llm-conversation";
        trigger: "llm-prompt";
        settings: {
          requires_confirmation?: boolean | null;
          instructions: string;
        };
      } | {
        deactivated_datetime?: string | null; // date-time
        kind: "reusable-llm-prompt-call-step";
        trigger: "reusable-llm-prompt";
        settings: {
          requires_confirmation: boolean;
          conditions: {
            or: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          } | {
            and: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          };
        };
      })[] | null;
      apps?: ({
        type: "shopify";
      } | {
        type: "recharge";
      } | {
        app_id: string;
        api_key?: string | null;
        account_oauth2_token_id?: string | null;
        type: "app";
        refresh_token?: string | null;
      })[] | null;
    }
    export type GetAppResponseDto = {
      id: string;
      auth_type: "api-key" | "oauth2-token";
      auth_settings: {
        refresh_token_url?: string | null;
        input_label?: string | null;
        instruction_url_text?: string | null;
        url?: string | null;
      };
    };
    export interface GetAutomationEventResponseDto {
      uuid: string; // uuid
      account_id: number;
      event_type: "flow_prompt_started" | "flow_prompt_not_helpful" | "flow_ended_without_action" | "flow_started" | "flow_ended_with_ticket_handover" | "flow_handover_ticket_created" | "flow_step_started" | "flow_step_ended" | "action_trigger_tested" | "action_triggered" | "action_succeeded" | "action_failed";
      channel: "chat" | "help-center" | "contact-form" | "email";
      flow_id: string;
      flow_step_id?: string | null;
      flow_execution_id?: string | null;
      user_journey_id: string;
      flow_failure_reason?: "invalid_custom_inputs" | "invalid_object_inputs" | "invalid_conditions" | "upstream_error";
      created_datetime?: string | null; // date-time
    }
    export interface GetExecutionsPaginationResponseDto {
      meta: {
        pagination: {
          current_page: number;
          next_page?: null | number;
          total_pages: number;
          total_size: number;
          page_size: number;
          page_limit: number;
        };
      };
      data: {
        id: string;
        configuration_id: string;
        configuration_internal_id: string;
        current_step_id: string;
        done?: boolean | null;
        state: {
          [name: string]: any;
          trigger?: "channel" | "llm-prompt";
        };
        channel_actions: ({
          kind: "messages";
          messages: {
            content: {
              html: string;
              text: string;
            };
            author: {
              kind: "shopper" | "bot";
            };
          }[];
        } | {
          kind: "choices";
          choices: {
            label: string;
            event_id: string;
          }[];
        } | {
          kind: "handover";
          messages: {
            content: {
              html?: string | null;
              text?: string | null;
              attachments?: {
                content_type: string;
                url: string;
              }[] | null;
            };
            author: {
              kind: "shopper" | "bot";
            };
          }[];
          ticket_tags?: string[] | null;
          ticket_assignee_user_id?: null | number;
          ticket_assignee_team_id?: null | number;
          not_automatable?: boolean | null;
          shopper_email?: string | null;
        } | {
          kind: "text-input";
          content?: {
            text: string;
          } | null;
        } | {
          kind: "attachments-input";
          attachments?: {
            content_type: string;
            url: string;
          }[] | null;
        } | {
          kind: "shopper-authentication";
        } | {
          kind: "shopper-authentication-success";
          access_token: string;
        } | {
          kind: "order-selection";
          orders: {
            name: string;
            external_id?: string | null;
            shopper_external_id?: string | null;
            number?: string | null;
            currency: {
              code: string;
              decimals: number;
            };
            discount_amount?: number | null;
            subtotal_amount?: number | null;
            shipping_amount?: number | null;
            tax_amount?: number | null;
            cancelled_datetime?: string | null; // date-time
            created_datetime: string; // date-time
            external_status?: string | null;
            external_fulfillment_status?: string | null;
            billing_address?: {
              line_1: string | null;
              line_2: string | null;
              city: string | null;
              country: string | null;
              state: string | null;
              zip_code: string | null;
              first_name: string | null;
              last_name: string | null;
              phone_number: string | null;
            } | null;
            shipping_address?: {
              line_1: string | null;
              line_2: string | null;
              city: string | null;
              country: string | null;
              state: string | null;
              zip_code: string | null;
              first_name: string | null;
              last_name: string | null;
              phone_number: string | null;
            } | null;
            external_payment_status?: string | null;
            total_amount: number;
            tracking_url?: string | null;
            shipping_datetime?: string | null; // date-time
            tracking_number?: string | null;
            status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
            line_items: {
              name: string;
              total_amount: number;
              quantity: number;
              external_id?: string | null;
              external_product_id?: string | null;
              product?: {
                external_id: string;
                images: string[];
                name?: string | null;
                external_type?: string | null;
                variants?: {
                  external_id: string;
                  external_gid?: string | null;
                  quantity?: number | null;
                  name?: string | null;
                }[] | null;
              } | null;
            }[];
            fulfillments?: {
              status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
              external_shipment_status?: string | null;
              updated_datetime?: string | null; // date-time
            }[] | null;
            shipping_lines?: {
              external_method_id?: string | null;
              method_name?: string | null;
            }[] | null;
            tags_stringified?: string | null;
            note?: string | null;
          }[];
          message?: {
            html: string;
            text: string;
          } | null;
        } | {
          kind: "order-line-item-selection";
          order: {
            name: string;
            external_id?: string | null;
            shopper_external_id?: string | null;
            number?: string | null;
            currency: {
              code: string;
              decimals: number;
            };
            discount_amount?: number | null;
            subtotal_amount?: number | null;
            shipping_amount?: number | null;
            tax_amount?: number | null;
            cancelled_datetime?: string | null; // date-time
            created_datetime: string; // date-time
            external_status?: string | null;
            external_fulfillment_status?: string | null;
            billing_address?: {
              line_1: string | null;
              line_2: string | null;
              city: string | null;
              country: string | null;
              state: string | null;
              zip_code: string | null;
              first_name: string | null;
              last_name: string | null;
              phone_number: string | null;
            } | null;
            shipping_address?: {
              line_1: string | null;
              line_2: string | null;
              city: string | null;
              country: string | null;
              state: string | null;
              zip_code: string | null;
              first_name: string | null;
              last_name: string | null;
              phone_number: string | null;
            } | null;
            external_payment_status?: string | null;
            total_amount: number;
            tracking_url?: string | null;
            shipping_datetime?: string | null; // date-time
            tracking_number?: string | null;
            status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
            line_items: {
              name: string;
              total_amount: number;
              quantity: number;
              external_id?: string | null;
              external_product_id?: string | null;
              product?: {
                external_id: string;
                images: string[];
                name?: string | null;
                external_type?: string | null;
                variants?: {
                  external_id: string;
                  external_gid?: string | null;
                  quantity?: number | null;
                  name?: string | null;
                }[] | null;
              } | null;
            }[];
            fulfillments?: {
              status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
              external_shipment_status?: string | null;
              updated_datetime?: string | null; // date-time
            }[] | null;
            shipping_lines?: {
              external_method_id?: string | null;
              method_name?: string | null;
            }[] | null;
            tags_stringified?: string | null;
            note?: string | null;
          };
          message?: {
            html: string;
            text: string;
          } | null;
        })[];
        awaited_callbacks: ({
          kind: "edit-order";
        } | {
          kind: "create-discount-code";
        } | {
          kind: "refund-shipping-costs";
        } | {
          kind: "reship-for-free";
        })[];
        event?: {
          id: string;
          kind: "choices";
          choice_label?: string | null;
        } | {
          kind: "go-back";
        } | {
          kind: "go-next";
        } | {
          kind: "text-input";
          content: {
            text: string;
          };
        } | {
          kind: "attachments-input";
          attachments: {
            content_type: string;
            url: string;
          }[];
        } | {
          kind: "shopper-authentication";
          id_token: string;
        } | {
          id: string;
          kind: "order-selection";
          order?: {
            name: string;
            external_id?: string | null;
            shopper_external_id?: string | null;
            number?: string | null;
            currency: {
              code: string;
              decimals: number;
            };
            discount_amount?: number | null;
            subtotal_amount?: number | null;
            shipping_amount?: number | null;
            tax_amount?: number | null;
            cancelled_datetime?: string | null; // date-time
            created_datetime: string; // date-time
            external_status?: string | null;
            external_fulfillment_status?: string | null;
            billing_address?: {
              line_1: string | null;
              line_2: string | null;
              city: string | null;
              country: string | null;
              state: string | null;
              zip_code: string | null;
              first_name: string | null;
              last_name: string | null;
              phone_number: string | null;
            } | null;
            shipping_address?: {
              line_1: string | null;
              line_2: string | null;
              city: string | null;
              country: string | null;
              state: string | null;
              zip_code: string | null;
              first_name: string | null;
              last_name: string | null;
              phone_number: string | null;
            } | null;
            external_payment_status?: string | null;
            total_amount: number;
            tracking_url?: string | null;
            shipping_datetime?: string | null; // date-time
            tracking_number?: string | null;
            status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
            line_items: {
              name: string;
              total_amount: number;
              quantity: number;
              external_id?: string | null;
              external_product_id?: string | null;
              product?: {
                external_id: string;
                images: string[];
                name?: string | null;
                external_type?: string | null;
                variants?: {
                  external_id: string;
                  external_gid?: string | null;
                  quantity?: number | null;
                  name?: string | null;
                }[] | null;
              } | null;
            }[];
            fulfillments?: {
              status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
              external_shipment_status?: string | null;
              updated_datetime?: string | null; // date-time
            }[] | null;
            shipping_lines?: {
              external_method_id?: string | null;
              method_name?: string | null;
            }[] | null;
            tags_stringified?: string | null;
            note?: string | null;
          } | null;
        } | {
          items: {
            external_id: string;
            quantity: number;
            name?: string | null;
          }[];
          kind: "order-line-item-selection";
        } | {
          success: boolean;
          errors: {
            message: string;
          }[];
          kind: "edit-order";
        } | {
          success: boolean;
          errors: {
            message: string;
          }[];
          kind: "create-discount-code";
          discount_code?: string | null;
        } | {
          success: boolean;
          errors: {
            message: string;
          }[];
          kind: "refund-shipping-costs";
        } | {
          success: boolean;
          errors: {
            message: string;
          }[];
          kind: "reship-for-free";
        };
        parent_configuration_id?: string | null;
        parent_configuration_internal_id?: string | null;
        parent_step_id?: string | null;
        created_datetime?: string | null; // date-time
        updated_datetime?: string | null; // date-time
        history_index?: number | null;
        max_history_index?: number | null;
        needs_auth?: boolean | null;
        success?: boolean | null;
      }[];
    }
    export interface GetWfConfigurationResponseDto {
      internal_id: string;
      id: string;
      account_id: number | null;
      template_internal_id?: string | null;
      name: string;
      description?: string | null;
      short_description?: string | null;
      is_draft: boolean;
      initial_step_id?: string | null;
      entrypoint?: {
        label: string;
        label_tkey: string;
      } | null;
      steps: ({
        id: string;
        kind: "choices";
        settings: {
          choices: {
            event_id: string;
            label: string;
            label_tkey: string;
          }[];
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "handover";
        settings?: {
          ticket_tags?: string[] | null;
          ticket_assignee_user_id?: null | number;
          ticket_assignee_team_id?: null | number;
        } | null;
      } | {
        id: string;
        kind: "workflow_call";
        settings: {
          configuration_id: string;
        };
      } | {
        id: string;
        kind: "text-input";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "attachments-input";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "shopper-authentication";
        settings: {
          integration_id: number;
        };
      } | {
        id: string;
        kind: "order-selection";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "http-request";
        settings: {
          name: string;
          url: string /* uri */  | ("");
          method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
          headers?: {
            [name: string]: string;
          } | null;
          body?: string | null;
          oauth2_token_settings?: {
            account_oauth2_token_id: string;
            refresh_token_url: string;
          } | null;
          variables: {
            id: string;
            name: string;
            jsonpath: string;
            data_type?: "string" | "number" | "date" | "boolean";
          }[];
        };
      } | {
        id: string;
        kind: "helpful-prompt";
        settings?: {
          ticket_tags?: string[] | null;
          ticket_assignee_user_id?: null | number;
          ticket_assignee_team_id?: null | number;
        } | null;
      } | {
        id: string;
        kind: "message";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "end";
        settings?: {
          success: boolean;
        } | null;
      } | {
        id: string;
        kind: "conditions";
        settings: {
          name: string;
        };
      } | {
        id: string;
        kind: "order-line-item-selection";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "cancel-order";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "refund-order";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "update-shipping-address";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          name: string;
          address1: string;
          address2: string;
          city: string;
          zip: string;
          province: string;
          country: string;
          phone: string;
          last_name: string;
          first_name: string;
        };
      } | {
        id: string;
        kind: "cancel-subscription";
        settings: {
          customer_id: string;
          integration_id: string;
          subscription_id: string;
          reason: string;
        };
      } | {
        id: string;
        kind: "skip-charge";
        settings: {
          customer_id: string;
          integration_id: string;
          subscription_id: string;
          charge_id: string;
        };
      } | {
        id: string;
        kind: "remove-item";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          product_variant_id: string;
          quantity: string;
        };
      } | {
        id: string;
        kind: "replace-item";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          product_variant_id: string;
          quantity: string;
          added_product_variant_id: string;
          added_quantity: string;
        };
      } | {
        id: string;
        kind: "create-discount-code";
        settings: {
          customer_id: string;
          integration_id: string;
          type: string;
          amount: string;
          valid_for: string;
        };
      } | {
        id: string;
        kind: "reship-for-free";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "refund-shipping-costs";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "reusable-llm-prompt-call";
        settings: {
          configuration_id: string;
          configuration_internal_id: string;
          objects?: {
            customer?: string | null;
            order?: string | null;
            products?: {
              [name: string]: string;
            } | null;
          } | null;
          custom_inputs?: {
            [name: string]: string;
          } | null;
          values: {
            [name: string]: string | number | boolean;
          };
        };
      })[];
      inputs?: ({
        id: string;
        name: string;
        description: string;
        data_type: "string";
        options?: {
          label: string;
          value: string;
        }[] | null;
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "number";
        options?: {
          label: string;
          value: number;
        }[] | null;
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "boolean";
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "date";
      })[] | null;
      values?: {
        [name: string]: number | boolean | string /* date-time */  | string;
      } | null;
      transitions: {
        id: string;
        from_step_id: string;
        to_step_id: string;
        event?: {
          id: string;
          kind: "choices";
        } | null;
        name?: string | null;
        conditions?: {
          or: ({
            equals: any;
          } | {
            notEqual: any;
          } | {
            contains: any;
          } | {
            doesNotContain: any;
          } | {
            endsWith: any;
          } | {
            startsWith: any;
          } | {
            exists: any;
          } | {
            doesNotExist: any;
          } | {
            lessThan: any;
          } | {
            lessThanInterval: any;
          } | {
            lessOrEqual: any;
          } | {
            greaterThan: any;
          } | {
            greaterThanInterval: any;
          } | {
            greaterOrEqual: any;
          })[];
        } | {
          and: ({
            equals: any;
          } | {
            notEqual: any;
          } | {
            contains: any;
          } | {
            doesNotContain: any;
          } | {
            endsWith: any;
          } | {
            startsWith: any;
          } | {
            exists: any;
          } | {
            doesNotExist: any;
          } | {
            lessThan: any;
          } | {
            lessThanInterval: any;
          } | {
            lessOrEqual: any;
          } | {
            greaterThan: any;
          } | {
            greaterThanInterval: any;
          } | {
            greaterOrEqual: any;
          })[];
        };
      }[];
      available_languages: ("en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR")[];
      category?: string | null;
      created_datetime?: string | null; // date-time
      updated_datetime?: string | null; // date-time
      deleted_datetime?: string | null; // date-time
      triggers: ({
        kind: "llm-prompt";
        settings: {
          custom_inputs: {
            id: string;
            name: string;
            instructions: string;
            data_type: "string" | "number" | "date" | "boolean";
          }[];
          object_inputs: ({
            kind: "customer";
            integration_id: number | string;
          } | {
            kind: "order";
            integration_id: number | string;
          } | {
            kind: "product";
            integration_id: number | string;
            name: string;
            instructions: string;
            id: string;
          })[];
          conditions?: {
            or: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          } | {
            and: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          };
          outputs: {
            id: string;
            description: string;
            path: string;
          }[];
        };
      } | {
        kind: "channel";
        settings: {
        };
      } | {
        kind: "reusable-llm-prompt";
        settings: {
          custom_inputs: {
            id: string;
            name: string;
            instructions: string;
            data_type: "string" | "number" | "date" | "boolean";
          }[];
          object_inputs: ({
            kind: "customer";
          } | {
            kind: "order";
          } | {
            kind: "product";
            name: string;
            instructions: string;
            id: string;
          })[];
          outputs: {
            id: string;
            name: string;
            description: string;
            path: string;
            data_type?: "string" | "number" | "date" | "boolean";
          }[];
        };
      })[];
      entrypoints: ({
        deactivated_datetime?: string | null; // date-time
        kind: "llm-conversation";
        trigger: "llm-prompt";
        settings: {
          requires_confirmation?: boolean | null;
          instructions: string;
        };
      } | {
        deactivated_datetime?: string | null; // date-time
        kind: "reusable-llm-prompt-call-step";
        trigger: "reusable-llm-prompt";
        settings: {
          requires_confirmation: boolean;
          conditions: {
            or: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          } | {
            and: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          };
        };
      })[];
      apps?: ({
        type: "shopify";
      } | {
        type: "recharge";
      } | {
        app_id: string;
        api_key?: string | null;
        account_oauth2_token_id?: string | null;
        type: "app";
        refresh_token?: string | null;
      })[] | null;
    }
    export interface GetWfConfigurationTemplateResponseDto {
      internal_id: string;
      id: string;
      name: string;
      description?: string | null;
      short_description?: string | null;
      is_draft: boolean;
      initial_step_id: string;
      entrypoint?: {
        label: string;
        label_tkey: string;
      } | null;
      steps: ({
        id: string;
        kind: "http-request";
        settings: {
          name: string;
          url: string /* uri */  | ("");
          method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
          headers?: {
            [name: string]: string;
          } | null;
          body?: string | null;
          oauth2_token_settings?: {
            account_oauth2_token_id: string;
            refresh_token_url: string;
          } | null;
          variables: {
            id: string;
            name: string;
            jsonpath: string;
            data_type?: "string" | "number" | "date" | "boolean";
          }[];
        };
      } | {
        id: string;
        kind: "cancel-order";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "refund-order";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "update-shipping-address";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          name: string;
          address1: string;
          address2: string;
          city: string;
          zip: string;
          province: string;
          country: string;
          phone: string;
          last_name: string;
          first_name: string;
        };
      } | {
        id: string;
        kind: "cancel-subscription";
        settings: {
          customer_id: string;
          integration_id: string;
          subscription_id: string;
          reason: string;
        };
      } | {
        id: string;
        kind: "skip-charge";
        settings: {
          customer_id: string;
          integration_id: string;
          subscription_id: string;
          charge_id: string;
        };
      } | {
        id: string;
        kind: "remove-item";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          product_variant_id: string;
          quantity: string;
        };
      } | {
        id: string;
        kind: "replace-item";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          product_variant_id: string;
          quantity: string;
          added_product_variant_id: string;
          added_quantity: string;
        };
      } | {
        id: string;
        kind: "create-discount-code";
        settings: {
          customer_id: string;
          integration_id: string;
          type: string;
          amount: string;
          valid_for: string;
        };
      } | {
        id: string;
        kind: "refund-shipping-costs";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "reship-for-free";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "conditions";
        settings: {
          name: string;
        };
      } | {
        id: string;
        kind: "end";
        settings?: {
          success: boolean;
        } | null;
      })[];
      inputs?: ({
        id: string;
        name: string;
        description: string;
        data_type: "string";
        options?: {
          label: string;
          value: string;
        }[] | null;
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "number";
        options?: {
          label: string;
          value: number;
        }[] | null;
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "boolean";
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "date";
      })[] | null;
      values?: {
        [name: string]: number | boolean | string /* date-time */  | string;
      } | null;
      transitions: {
        id: string;
        from_step_id: string;
        to_step_id: string;
        event?: {
          id: string;
          kind: "choices";
        } | null;
        name?: string | null;
        conditions?: {
          or: ({
            equals: any;
          } | {
            notEqual: any;
          } | {
            contains: any;
          } | {
            doesNotContain: any;
          } | {
            endsWith: any;
          } | {
            startsWith: any;
          } | {
            exists: any;
          } | {
            doesNotExist: any;
          } | {
            lessThan: any;
          } | {
            lessThanInterval: any;
          } | {
            lessOrEqual: any;
          } | {
            greaterThan: any;
          } | {
            greaterThanInterval: any;
          } | {
            greaterOrEqual: any;
          })[];
        } | {
          and: ({
            equals: any;
          } | {
            notEqual: any;
          } | {
            contains: any;
          } | {
            doesNotContain: any;
          } | {
            endsWith: any;
          } | {
            startsWith: any;
          } | {
            exists: any;
          } | {
            doesNotExist: any;
          } | {
            lessThan: any;
          } | {
            lessThanInterval: any;
          } | {
            lessOrEqual: any;
          } | {
            greaterThan: any;
          } | {
            greaterThanInterval: any;
          } | {
            greaterOrEqual: any;
          })[];
        };
      }[];
      available_languages: ("en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR")[];
      created_datetime: string; // date-time
      updated_datetime: string; // date-time
      deleted_datetime?: string | null; // date-time
      triggers: ({
        kind: "llm-prompt";
        settings: {
          custom_inputs: {
            id: string;
            name: string;
            instructions: string;
            data_type: "string" | "number" | "date" | "boolean";
          }[];
          object_inputs: ({
            kind: "customer";
            integration_id: number | string;
          } | {
            kind: "order";
            integration_id: number | string;
          } | {
            kind: "product";
            integration_id: number | string;
            name: string;
            instructions: string;
            id: string;
          })[];
          conditions?: {
            or: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          } | {
            and: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          };
          outputs: {
            id: string;
            description: string;
            path: string;
          }[];
        };
      } | {
        kind: "channel";
        settings: {
        };
      } | {
        kind: "reusable-llm-prompt";
        settings: {
          custom_inputs: {
            id: string;
            name: string;
            instructions: string;
            data_type: "string" | "number" | "date" | "boolean";
          }[];
          object_inputs: ({
            kind: "customer";
          } | {
            kind: "order";
          } | {
            kind: "product";
            name: string;
            instructions: string;
            id: string;
          })[];
          outputs: {
            id: string;
            name: string;
            description: string;
            path: string;
            data_type?: "string" | "number" | "date" | "boolean";
          }[];
        };
      })[];
      entrypoints: ({
        deactivated_datetime?: string | null; // date-time
        kind: "llm-conversation";
        trigger: "llm-prompt";
        settings: {
          requires_confirmation: boolean;
          instructions: string;
        };
      } | {
        deactivated_datetime?: string | null; // date-time
        kind: "reusable-llm-prompt-call-step";
        trigger: "reusable-llm-prompt";
        settings: {
          requires_confirmation: boolean;
          conditions: {
            or: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          } | {
            and: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          };
        };
      })[];
      apps: ({
        type: "shopify";
      } | {
        type: "recharge";
      } | {
        app_id: string;
        api_key?: string | null;
        account_oauth2_token_id?: string | null;
        type: "app";
        refresh_token?: string | null;
      })[];
    }
    export interface GetWfConfigurationTranslationsResponseDto {
      [name: string]: string;
    }
    export interface GetWfExecutionDto {
      id: string;
      configuration_id: string;
      configuration_internal_id: string;
      current_step_id: string;
      done?: boolean | null;
      state: {
        [name: string]: any;
        trigger?: "channel" | "llm-prompt";
      };
      channel_actions: ({
        kind: "messages";
        messages: {
          content: {
            html: string;
            text: string;
          };
          author: {
            kind: "shopper" | "bot";
          };
        }[];
      } | {
        kind: "choices";
        choices: {
          label: string;
          event_id: string;
        }[];
      } | {
        kind: "handover";
        messages: {
          content: {
            html?: string | null;
            text?: string | null;
            attachments?: {
              content_type: string;
              url: string;
            }[] | null;
          };
          author: {
            kind: "shopper" | "bot";
          };
        }[];
        ticket_tags?: string[] | null;
        ticket_assignee_user_id?: null | number;
        ticket_assignee_team_id?: null | number;
        not_automatable?: boolean | null;
        shopper_email?: string | null;
      } | {
        kind: "text-input";
        content?: {
          text: string;
        } | null;
      } | {
        kind: "attachments-input";
        attachments?: {
          content_type: string;
          url: string;
        }[] | null;
      } | {
        kind: "shopper-authentication";
      } | {
        kind: "shopper-authentication-success";
        access_token: string;
      } | {
        kind: "order-selection";
        orders: {
          name: string;
          external_id?: string | null;
          shopper_external_id?: string | null;
          number?: string | null;
          currency: {
            code: string;
            decimals: number;
          };
          discount_amount?: number | null;
          subtotal_amount?: number | null;
          shipping_amount?: number | null;
          tax_amount?: number | null;
          cancelled_datetime?: string | null; // date-time
          created_datetime: string; // date-time
          external_status?: string | null;
          external_fulfillment_status?: string | null;
          billing_address?: {
            line_1: string | null;
            line_2: string | null;
            city: string | null;
            country: string | null;
            state: string | null;
            zip_code: string | null;
            first_name: string | null;
            last_name: string | null;
            phone_number: string | null;
          } | null;
          shipping_address?: {
            line_1: string | null;
            line_2: string | null;
            city: string | null;
            country: string | null;
            state: string | null;
            zip_code: string | null;
            first_name: string | null;
            last_name: string | null;
            phone_number: string | null;
          } | null;
          external_payment_status?: string | null;
          total_amount: number;
          tracking_url?: string | null;
          shipping_datetime?: string | null; // date-time
          tracking_number?: string | null;
          status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
          line_items: {
            name: string;
            total_amount: number;
            quantity: number;
            external_id?: string | null;
            external_product_id?: string | null;
            product?: {
              external_id: string;
              images: string[];
              name?: string | null;
              external_type?: string | null;
              variants?: {
                external_id: string;
                external_gid?: string | null;
                quantity?: number | null;
                name?: string | null;
              }[] | null;
            } | null;
          }[];
          fulfillments?: {
            status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
            external_shipment_status?: string | null;
            updated_datetime?: string | null; // date-time
          }[] | null;
          shipping_lines?: {
            external_method_id?: string | null;
            method_name?: string | null;
          }[] | null;
          tags_stringified?: string | null;
          note?: string | null;
        }[];
        message?: {
          html: string;
          text: string;
        } | null;
      } | {
        kind: "order-line-item-selection";
        order: {
          name: string;
          external_id?: string | null;
          shopper_external_id?: string | null;
          number?: string | null;
          currency: {
            code: string;
            decimals: number;
          };
          discount_amount?: number | null;
          subtotal_amount?: number | null;
          shipping_amount?: number | null;
          tax_amount?: number | null;
          cancelled_datetime?: string | null; // date-time
          created_datetime: string; // date-time
          external_status?: string | null;
          external_fulfillment_status?: string | null;
          billing_address?: {
            line_1: string | null;
            line_2: string | null;
            city: string | null;
            country: string | null;
            state: string | null;
            zip_code: string | null;
            first_name: string | null;
            last_name: string | null;
            phone_number: string | null;
          } | null;
          shipping_address?: {
            line_1: string | null;
            line_2: string | null;
            city: string | null;
            country: string | null;
            state: string | null;
            zip_code: string | null;
            first_name: string | null;
            last_name: string | null;
            phone_number: string | null;
          } | null;
          external_payment_status?: string | null;
          total_amount: number;
          tracking_url?: string | null;
          shipping_datetime?: string | null; // date-time
          tracking_number?: string | null;
          status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
          line_items: {
            name: string;
            total_amount: number;
            quantity: number;
            external_id?: string | null;
            external_product_id?: string | null;
            product?: {
              external_id: string;
              images: string[];
              name?: string | null;
              external_type?: string | null;
              variants?: {
                external_id: string;
                external_gid?: string | null;
                quantity?: number | null;
                name?: string | null;
              }[] | null;
            } | null;
          }[];
          fulfillments?: {
            status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
            external_shipment_status?: string | null;
            updated_datetime?: string | null; // date-time
          }[] | null;
          shipping_lines?: {
            external_method_id?: string | null;
            method_name?: string | null;
          }[] | null;
          tags_stringified?: string | null;
          note?: string | null;
        };
        message?: {
          html: string;
          text: string;
        } | null;
      })[];
      awaited_callbacks: ({
        kind: "edit-order";
      } | {
        kind: "create-discount-code";
      } | {
        kind: "refund-shipping-costs";
      } | {
        kind: "reship-for-free";
      })[];
      event?: {
        id: string;
        kind: "choices";
        choice_label?: string | null;
      } | {
        kind: "go-back";
      } | {
        kind: "go-next";
      } | {
        kind: "text-input";
        content: {
          text: string;
        };
      } | {
        kind: "attachments-input";
        attachments: {
          content_type: string;
          url: string;
        }[];
      } | {
        kind: "shopper-authentication";
        id_token: string;
      } | {
        id: string;
        kind: "order-selection";
        order?: {
          name: string;
          external_id?: string | null;
          shopper_external_id?: string | null;
          number?: string | null;
          currency: {
            code: string;
            decimals: number;
          };
          discount_amount?: number | null;
          subtotal_amount?: number | null;
          shipping_amount?: number | null;
          tax_amount?: number | null;
          cancelled_datetime?: string | null; // date-time
          created_datetime: string; // date-time
          external_status?: string | null;
          external_fulfillment_status?: string | null;
          billing_address?: {
            line_1: string | null;
            line_2: string | null;
            city: string | null;
            country: string | null;
            state: string | null;
            zip_code: string | null;
            first_name: string | null;
            last_name: string | null;
            phone_number: string | null;
          } | null;
          shipping_address?: {
            line_1: string | null;
            line_2: string | null;
            city: string | null;
            country: string | null;
            state: string | null;
            zip_code: string | null;
            first_name: string | null;
            last_name: string | null;
            phone_number: string | null;
          } | null;
          external_payment_status?: string | null;
          total_amount: number;
          tracking_url?: string | null;
          shipping_datetime?: string | null; // date-time
          tracking_number?: string | null;
          status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
          line_items: {
            name: string;
            total_amount: number;
            quantity: number;
            external_id?: string | null;
            external_product_id?: string | null;
            product?: {
              external_id: string;
              images: string[];
              name?: string | null;
              external_type?: string | null;
              variants?: {
                external_id: string;
                external_gid?: string | null;
                quantity?: number | null;
                name?: string | null;
              }[] | null;
            } | null;
          }[];
          fulfillments?: {
            status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
            external_shipment_status?: string | null;
            updated_datetime?: string | null; // date-time
          }[] | null;
          shipping_lines?: {
            external_method_id?: string | null;
            method_name?: string | null;
          }[] | null;
          tags_stringified?: string | null;
          note?: string | null;
        } | null;
      } | {
        items: {
          external_id: string;
          quantity: number;
          name?: string | null;
        }[];
        kind: "order-line-item-selection";
      } | {
        success: boolean;
        errors: {
          message: string;
        }[];
        kind: "edit-order";
      } | {
        success: boolean;
        errors: {
          message: string;
        }[];
        kind: "create-discount-code";
        discount_code?: string | null;
      } | {
        success: boolean;
        errors: {
          message: string;
        }[];
        kind: "refund-shipping-costs";
      } | {
        success: boolean;
        errors: {
          message: string;
        }[];
        kind: "reship-for-free";
      };
      parent_configuration_id?: string | null;
      parent_configuration_internal_id?: string | null;
      parent_step_id?: string | null;
      created_datetime?: string | null; // date-time
      updated_datetime?: string | null; // date-time
      history_index?: number | null;
      max_history_index?: number | null;
      needs_auth?: boolean | null;
      success?: boolean | null;
    }
    export type GetWfExecutionResponseDto = {
      trigger: "llm-prompt";
      triggerable: boolean;
      entrypoint?: {
        requires_confirmation: boolean;
        instructions: string;
        configuration_name: string;
        configuration_template_slug: string | null;
        trigger: {
          custom_inputs: {
            [name: string]: {
              name: string;
              instructions: string;
              data_type: "string" | "number" | "date" | "boolean";
            };
          };
          object_inputs: {
            customer_id?: {
              instructions: string;
              data_type: "number";
            };
            customer_email?: {
              instructions: string;
              data_type: "string";
            };
            customer_phone_number?: {
              instructions: string;
              data_type: "string";
            };
            order_external_id?: {
              instructions: string;
              data_type: "string";
            };
            order_name?: {
              instructions: string;
              data_type: "string";
            };
            order_number?: {
              instructions: string;
              data_type: "string";
            };
            products?: {
              [name: string]: {
                name: string;
                instructions: string;
                inputs: {
                  product_id: {
                    instructions: string;
                    data_type: "string";
                  };
                  product_variant_id: {
                    instructions: string;
                    data_type: "string";
                  };
                };
              };
            };
          };
        };
      } | null;
      errors?: {
        code: string;
        message: string;
        path: string[];
      }[] | null;
      state?: {
        steps_state?: {
          [name: string]: {
            kind: "choices";
            selected_choice: {
              event_id: string;
              label: string;
            };
            at: string; // date-time
          } | {
            kind: "text-input";
            content: {
              text: string;
            };
            at: string; // date-time
          } | {
            kind: "attachments-input";
            attachments?: {
              content_type: string;
              url: string;
            }[] | null;
            at: string; // date-time
          } | {
            kind: "shopper-authentication";
            customer: {
              id: number;
              email?: string | null;
              firstname?: string | null;
              lastname?: string | null;
              name?: string | null;
              phone_number?: string | null;
              orders: {
                name: string;
                external_id?: string | null;
                shopper_external_id?: string | null;
                number?: string | null;
                currency: {
                  code: string;
                  decimals: number;
                };
                discount_amount?: number | null;
                subtotal_amount?: number | null;
                shipping_amount?: number | null;
                tax_amount?: number | null;
                cancelled_datetime?: string | null; // date-time
                created_datetime: string; // date-time
                external_status?: string | null;
                external_fulfillment_status?: string | null;
                billing_address?: {
                  line_1: string | null;
                  line_2: string | null;
                  city: string | null;
                  country: string | null;
                  state: string | null;
                  zip_code: string | null;
                  first_name: string | null;
                  last_name: string | null;
                  phone_number: string | null;
                } | null;
                shipping_address?: {
                  line_1: string | null;
                  line_2: string | null;
                  city: string | null;
                  country: string | null;
                  state: string | null;
                  zip_code: string | null;
                  first_name: string | null;
                  last_name: string | null;
                  phone_number: string | null;
                } | null;
                external_payment_status?: string | null;
                total_amount: number;
                tracking_url?: string | null;
                shipping_datetime?: string | null; // date-time
                tracking_number?: string | null;
                status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
                line_items: {
                  name: string;
                  total_amount: number;
                  quantity: number;
                  external_id?: string | null;
                  external_product_id?: string | null;
                  product?: {
                    external_id: string;
                    images: string[];
                    name?: string | null;
                    external_type?: string | null;
                    variants?: {
                      external_id: string;
                      external_gid?: string | null;
                      quantity?: number | null;
                      name?: string | null;
                    }[] | null;
                  } | null;
                }[];
                fulfillments?: {
                  status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
                  external_shipment_status?: string | null;
                  updated_datetime?: string | null; // date-time
                }[] | null;
                shipping_lines?: {
                  external_method_id?: string | null;
                  method_name?: string | null;
                }[] | null;
                tags_stringified?: string | null;
                note?: string | null;
              }[];
              tags_stringified?: string | null;
            };
            at: string; // date-time
          } | {
            kind: "order-selection";
            order: {
              name: string;
              external_id?: string | null;
              shopper_external_id?: string | null;
              number?: string | null;
              currency: {
                code: string;
                decimals: number;
              };
              discount_amount?: number | null;
              subtotal_amount?: number | null;
              shipping_amount?: number | null;
              tax_amount?: number | null;
              cancelled_datetime?: string | null; // date-time
              created_datetime: string; // date-time
              external_status?: string | null;
              external_fulfillment_status?: string | null;
              billing_address?: {
                line_1: string | null;
                line_2: string | null;
                city: string | null;
                country: string | null;
                state: string | null;
                zip_code: string | null;
                first_name: string | null;
                last_name: string | null;
                phone_number: string | null;
              } | null;
              shipping_address?: {
                line_1: string | null;
                line_2: string | null;
                city: string | null;
                country: string | null;
                state: string | null;
                zip_code: string | null;
                first_name: string | null;
                last_name: string | null;
                phone_number: string | null;
              } | null;
              external_payment_status?: string | null;
              total_amount: number;
              tracking_url?: string | null;
              shipping_datetime?: string | null; // date-time
              tracking_number?: string | null;
              status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
              line_items: {
                name: string;
                total_amount: number;
                quantity: number;
                external_id?: string | null;
                external_product_id?: string | null;
                product?: {
                  external_id: string;
                  images: string[];
                  name?: string | null;
                  external_type?: string | null;
                  variants?: {
                    external_id: string;
                    external_gid?: string | null;
                    quantity?: number | null;
                    name?: string | null;
                  }[] | null;
                } | null;
              }[];
              fulfillments?: {
                status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
                external_shipment_status?: string | null;
                updated_datetime?: string | null; // date-time
              }[] | null;
              shipping_lines?: {
                external_method_id?: string | null;
                method_name?: string | null;
              }[] | null;
              tags_stringified?: string | null;
              note?: string | null;
            };
            at: string; // date-time
          } | {
            kind: "workflow_call";
            steps_state?: {
              [name: string]: {
                kind: "choices";
                selected_choice: {
                  event_id: string;
                  label: string;
                };
                at: string; // date-time
              } | {
                kind: "text-input";
                content: {
                  text: string;
                };
                at: string; // date-time
              } | {
                kind: "attachments-input";
                attachments?: {
                  content_type: string;
                  url: string;
                }[] | null;
                at: string; // date-time
              } | {
                kind: "shopper-authentication";
                customer: {
                  id: number;
                  email?: string | null;
                  firstname?: string | null;
                  lastname?: string | null;
                  name?: string | null;
                  phone_number?: string | null;
                  orders: {
                    name: string;
                    external_id?: string | null;
                    shopper_external_id?: string | null;
                    number?: string | null;
                    currency: {
                      code: string;
                      decimals: number;
                    };
                    discount_amount?: number | null;
                    subtotal_amount?: number | null;
                    shipping_amount?: number | null;
                    tax_amount?: number | null;
                    cancelled_datetime?: string | null; // date-time
                    created_datetime: string; // date-time
                    external_status?: string | null;
                    external_fulfillment_status?: string | null;
                    billing_address?: {
                      line_1: string | null;
                      line_2: string | null;
                      city: string | null;
                      country: string | null;
                      state: string | null;
                      zip_code: string | null;
                      first_name: string | null;
                      last_name: string | null;
                      phone_number: string | null;
                    } | null;
                    shipping_address?: {
                      line_1: string | null;
                      line_2: string | null;
                      city: string | null;
                      country: string | null;
                      state: string | null;
                      zip_code: string | null;
                      first_name: string | null;
                      last_name: string | null;
                      phone_number: string | null;
                    } | null;
                    external_payment_status?: string | null;
                    total_amount: number;
                    tracking_url?: string | null;
                    shipping_datetime?: string | null; // date-time
                    tracking_number?: string | null;
                    status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
                    line_items: {
                      name: string;
                      total_amount: number;
                      quantity: number;
                      external_id?: string | null;
                      external_product_id?: string | null;
                      product?: {
                        external_id: string;
                        images: string[];
                        name?: string | null;
                        external_type?: string | null;
                        variants?: {
                          external_id: string;
                          external_gid?: string | null;
                          quantity?: number | null;
                          name?: string | null;
                        }[] | null;
                      } | null;
                    }[];
                    fulfillments?: {
                      status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
                      external_shipment_status?: string | null;
                      updated_datetime?: string | null; // date-time
                    }[] | null;
                    shipping_lines?: {
                      external_method_id?: string | null;
                      method_name?: string | null;
                    }[] | null;
                    tags_stringified?: string | null;
                    note?: string | null;
                  }[];
                  tags_stringified?: string | null;
                };
                at: string; // date-time
              } | {
                kind: "order-selection";
                order: {
                  name: string;
                  external_id?: string | null;
                  shopper_external_id?: string | null;
                  number?: string | null;
                  currency: {
                    code: string;
                    decimals: number;
                  };
                  discount_amount?: number | null;
                  subtotal_amount?: number | null;
                  shipping_amount?: number | null;
                  tax_amount?: number | null;
                  cancelled_datetime?: string | null; // date-time
                  created_datetime: string; // date-time
                  external_status?: string | null;
                  external_fulfillment_status?: string | null;
                  billing_address?: {
                    line_1: string | null;
                    line_2: string | null;
                    city: string | null;
                    country: string | null;
                    state: string | null;
                    zip_code: string | null;
                    first_name: string | null;
                    last_name: string | null;
                    phone_number: string | null;
                  } | null;
                  shipping_address?: {
                    line_1: string | null;
                    line_2: string | null;
                    city: string | null;
                    country: string | null;
                    state: string | null;
                    zip_code: string | null;
                    first_name: string | null;
                    last_name: string | null;
                    phone_number: string | null;
                  } | null;
                  external_payment_status?: string | null;
                  total_amount: number;
                  tracking_url?: string | null;
                  shipping_datetime?: string | null; // date-time
                  tracking_number?: string | null;
                  status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
                  line_items: {
                    name: string;
                    total_amount: number;
                    quantity: number;
                    external_id?: string | null;
                    external_product_id?: string | null;
                    product?: {
                      external_id: string;
                      images: string[];
                      name?: string | null;
                      external_type?: string | null;
                      variants?: {
                        external_id: string;
                        external_gid?: string | null;
                        quantity?: number | null;
                        name?: string | null;
                      }[] | null;
                    } | null;
                  }[];
                  fulfillments?: {
                    status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
                    external_shipment_status?: string | null;
                    updated_datetime?: string | null; // date-time
                  }[] | null;
                  shipping_lines?: {
                    external_method_id?: string | null;
                    method_name?: string | null;
                  }[] | null;
                  tags_stringified?: string | null;
                  note?: string | null;
                };
                at: string; // date-time
              } | {
                kind: "http-request";
                status_code: number;
                success: boolean;
                content?: ({
                  [name: string]: number | boolean | string /* date-time */  | string | any;
                } | null) | any;
                at: string; // date-time
              } | {
                kind: "cancel-order";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "refund-order";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "update-shipping-address";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "cancel-subscription";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "skip-charge";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "remove-item";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "replace-item";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "create-discount-code";
                discount_code?: string | null;
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "reship-for-free";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "refund-shipping-costs";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "end";
                success: boolean;
                at: string; // date-time
              };
            } | null;
            at: string; // date-time
          } | {
            kind: "http-request";
            status_code: number;
            success: boolean;
            content?: ({
              [name: string]: number | boolean | string /* date-time */  | string | any;
            } | null) | any;
            at: string; // date-time
          } | {
            kind: "cancel-order";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "refund-order";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "update-shipping-address";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "cancel-subscription";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "skip-charge";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "remove-item";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "replace-item";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "create-discount-code";
            discount_code?: string | null;
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "reship-for-free";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "refund-shipping-costs";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "end";
            success: boolean;
            at: string; // date-time
          };
        } | null;
        store?: {
          type: "shopify";
          name: string;
          helpdesk_integration_id: number;
        } | null;
        preview_mode?: boolean | null;
        trigger: "llm-prompt";
        entrypoint?: "llm-conversation";
        objects?: {
          customer?: {
            id: number;
            email?: string | null;
            firstname?: string | null;
            lastname?: string | null;
            name?: string | null;
            phone_number?: string | null;
            orders: {
              name: string;
              external_id?: string | null;
              shopper_external_id?: string | null;
              number?: string | null;
              currency: {
                code: string;
                decimals: number;
              };
              discount_amount?: number | null;
              subtotal_amount?: number | null;
              shipping_amount?: number | null;
              tax_amount?: number | null;
              cancelled_datetime?: string | null; // date-time
              created_datetime: string; // date-time
              external_status?: string | null;
              external_fulfillment_status?: string | null;
              billing_address?: {
                line_1: string | null;
                line_2: string | null;
                city: string | null;
                country: string | null;
                state: string | null;
                zip_code: string | null;
                first_name: string | null;
                last_name: string | null;
                phone_number: string | null;
              } | null;
              shipping_address?: {
                line_1: string | null;
                line_2: string | null;
                city: string | null;
                country: string | null;
                state: string | null;
                zip_code: string | null;
                first_name: string | null;
                last_name: string | null;
                phone_number: string | null;
              } | null;
              external_payment_status?: string | null;
              total_amount: number;
              tracking_url?: string | null;
              shipping_datetime?: string | null; // date-time
              tracking_number?: string | null;
              status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
              line_items: {
                name: string;
                total_amount: number;
                quantity: number;
                external_id?: string | null;
                external_product_id?: string | null;
                product?: {
                  external_id: string;
                  images: string[];
                  name?: string | null;
                  external_type?: string | null;
                  variants?: {
                    external_id: string;
                    external_gid?: string | null;
                    quantity?: number | null;
                    name?: string | null;
                  }[] | null;
                } | null;
              }[];
              fulfillments?: {
                status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
                external_shipment_status?: string | null;
                updated_datetime?: string | null; // date-time
              }[] | null;
              shipping_lines?: {
                external_method_id?: string | null;
                method_name?: string | null;
              }[] | null;
              tags_stringified?: string | null;
              note?: string | null;
            }[];
            tags_stringified?: string | null;
          } | null;
          order?: {
            name: string;
            external_id?: string | null;
            shopper_external_id?: string | null;
            number?: string | null;
            currency: {
              code: string;
              decimals: number;
            };
            discount_amount?: number | null;
            subtotal_amount?: number | null;
            shipping_amount?: number | null;
            tax_amount?: number | null;
            cancelled_datetime?: string | null; // date-time
            created_datetime: string; // date-time
            external_status?: string | null;
            external_fulfillment_status?: string | null;
            billing_address?: {
              line_1: string | null;
              line_2: string | null;
              city: string | null;
              country: string | null;
              state: string | null;
              zip_code: string | null;
              first_name: string | null;
              last_name: string | null;
              phone_number: string | null;
            } | null;
            shipping_address?: {
              line_1: string | null;
              line_2: string | null;
              city: string | null;
              country: string | null;
              state: string | null;
              zip_code: string | null;
              first_name: string | null;
              last_name: string | null;
              phone_number: string | null;
            } | null;
            external_payment_status?: string | null;
            total_amount: number;
            tracking_url?: string | null;
            shipping_datetime?: string | null; // date-time
            tracking_number?: string | null;
            status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
            line_items: {
              name: string;
              total_amount: number;
              quantity: number;
              external_id?: string | null;
              external_product_id?: string | null;
              product?: {
                external_id: string;
                images: string[];
                name?: string | null;
                external_type?: string | null;
                variants?: {
                  external_id: string;
                  external_gid?: string | null;
                  quantity?: number | null;
                  name?: string | null;
                }[] | null;
              } | null;
            }[];
            fulfillments?: {
              status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
              external_shipment_status?: string | null;
              updated_datetime?: string | null; // date-time
            }[] | null;
            shipping_lines?: {
              external_method_id?: string | null;
              method_name?: string | null;
            }[] | null;
            tags_stringified?: string | null;
            note?: string | null;
          } | null;
          products?: {
            [name: string]: {
              external_id: string;
              images: string[];
              name?: string | null;
              external_type?: string | null;
              variants?: {
                external_id: string;
                external_gid?: string | null;
                quantity?: number | null;
                name?: string | null;
              }[] | null;
              selected_variant?: {
                external_id: string;
                external_gid?: string | null;
                quantity?: number | null;
                name?: string | null;
              } | null;
            };
          } | null;
        } | null;
        custom_inputs?: {
          [name: string]: number | boolean | string /* date-time */  | string;
        } | null;
        values?: {
          [name: string]: number | boolean | string /* date-time */  | string;
        } | null;
        user_journey_id?: string | null;
        channel?: "email";
        callback_url?: string | null;
      } | null;
      outputs?: {
        [name: string]: {
          description: string;
          value?: any;
        };
      } | null;
    };
    export type HttpRequestEventsResponseDto = {
      id: string;
      request_url: string;
      request_method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
      request_body?: string | null;
      request_headers?: string | null;
      request_datetime: string; // date-time
      response_status_code: number;
      response_headers?: string | null;
      response_body?: string | null;
    }[];
    export type ListAppResponseDto = ({
      id: string;
      auth_type: "api-key" | "oauth2-token";
      auth_settings: {
        refresh_token_url?: string | null;
        input_label?: string | null;
        instruction_url_text?: string | null;
        url?: string | null;
      };
    })[];
    export type ListStoreAppResponseDto = {
      store_type: "shopify";
      store_name: string;
      account_id: number;
      integration_id: number;
      type: "recharge";
    }[];
    export type ListStoreWfConfigurationsResponseDto = {
      internal_id: string;
      id: string;
      account_id: number | null;
      template_internal_id?: string | null;
      name: string;
      description?: string | null;
      short_description?: string | null;
      is_draft: boolean;
      initial_step_id?: string | null;
      entrypoint?: {
        label: string;
        label_tkey: string;
      } | null;
      steps: ({
        id: string;
        kind: "choices";
        settings: {
          choices: {
            event_id: string;
            label: string;
            label_tkey: string;
          }[];
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "handover";
        settings?: {
          ticket_tags?: string[] | null;
          ticket_assignee_user_id?: null | number;
          ticket_assignee_team_id?: null | number;
        } | null;
      } | {
        id: string;
        kind: "workflow_call";
        settings: {
          configuration_id: string;
        };
      } | {
        id: string;
        kind: "text-input";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "attachments-input";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "shopper-authentication";
        settings: {
          integration_id: number;
        };
      } | {
        id: string;
        kind: "order-selection";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "http-request";
        settings: {
          name: string;
          url: string /* uri */  | ("");
          method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
          headers?: {
            [name: string]: string;
          } | null;
          body?: string | null;
          oauth2_token_settings?: {
            account_oauth2_token_id: string;
            refresh_token_url: string;
          } | null;
          variables: {
            id: string;
            name: string;
            jsonpath: string;
            data_type?: "string" | "number" | "date" | "boolean";
          }[];
        };
      } | {
        id: string;
        kind: "helpful-prompt";
        settings?: {
          ticket_tags?: string[] | null;
          ticket_assignee_user_id?: null | number;
          ticket_assignee_team_id?: null | number;
        } | null;
      } | {
        id: string;
        kind: "message";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "end";
        settings?: {
          success: boolean;
        } | null;
      } | {
        id: string;
        kind: "conditions";
        settings: {
          name: string;
        };
      } | {
        id: string;
        kind: "order-line-item-selection";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "cancel-order";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "refund-order";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "update-shipping-address";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          name: string;
          address1: string;
          address2: string;
          city: string;
          zip: string;
          province: string;
          country: string;
          phone: string;
          last_name: string;
          first_name: string;
        };
      } | {
        id: string;
        kind: "cancel-subscription";
        settings: {
          customer_id: string;
          integration_id: string;
          subscription_id: string;
          reason: string;
        };
      } | {
        id: string;
        kind: "skip-charge";
        settings: {
          customer_id: string;
          integration_id: string;
          subscription_id: string;
          charge_id: string;
        };
      } | {
        id: string;
        kind: "remove-item";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          product_variant_id: string;
          quantity: string;
        };
      } | {
        id: string;
        kind: "replace-item";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          product_variant_id: string;
          quantity: string;
          added_product_variant_id: string;
          added_quantity: string;
        };
      } | {
        id: string;
        kind: "create-discount-code";
        settings: {
          customer_id: string;
          integration_id: string;
          type: string;
          amount: string;
          valid_for: string;
        };
      } | {
        id: string;
        kind: "reship-for-free";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "refund-shipping-costs";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "reusable-llm-prompt-call";
        settings: {
          configuration_id: string;
          configuration_internal_id: string;
          objects?: {
            customer?: string | null;
            order?: string | null;
            products?: {
              [name: string]: string;
            } | null;
          } | null;
          custom_inputs?: {
            [name: string]: string;
          } | null;
          values: {
            [name: string]: string | number | boolean;
          };
        };
      })[];
      inputs?: ({
        id: string;
        name: string;
        description: string;
        data_type: "string";
        options?: {
          label: string;
          value: string;
        }[] | null;
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "number";
        options?: {
          label: string;
          value: number;
        }[] | null;
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "boolean";
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "date";
      })[] | null;
      values?: {
        [name: string]: number | boolean | string /* date-time */  | string;
      } | null;
      transitions: {
        id: string;
        from_step_id: string;
        to_step_id: string;
        event?: {
          id: string;
          kind: "choices";
        } | null;
        name?: string | null;
        conditions?: {
          or: ({
            equals: any;
          } | {
            notEqual: any;
          } | {
            contains: any;
          } | {
            doesNotContain: any;
          } | {
            endsWith: any;
          } | {
            startsWith: any;
          } | {
            exists: any;
          } | {
            doesNotExist: any;
          } | {
            lessThan: any;
          } | {
            lessThanInterval: any;
          } | {
            lessOrEqual: any;
          } | {
            greaterThan: any;
          } | {
            greaterThanInterval: any;
          } | {
            greaterOrEqual: any;
          })[];
        } | {
          and: ({
            equals: any;
          } | {
            notEqual: any;
          } | {
            contains: any;
          } | {
            doesNotContain: any;
          } | {
            endsWith: any;
          } | {
            startsWith: any;
          } | {
            exists: any;
          } | {
            doesNotExist: any;
          } | {
            lessThan: any;
          } | {
            lessThanInterval: any;
          } | {
            lessOrEqual: any;
          } | {
            greaterThan: any;
          } | {
            greaterThanInterval: any;
          } | {
            greaterOrEqual: any;
          })[];
        };
      }[];
      available_languages: ("en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR")[];
      category?: string | null;
      created_datetime?: string | null; // date-time
      updated_datetime?: string | null; // date-time
      deleted_datetime?: string | null; // date-time
      triggers: ({
        kind: "llm-prompt";
        settings: {
          custom_inputs: {
            id: string;
            name: string;
            instructions: string;
            data_type: "string" | "number" | "date" | "boolean";
          }[];
          object_inputs: ({
            kind: "customer";
            integration_id: number | string;
          } | {
            kind: "order";
            integration_id: number | string;
          } | {
            kind: "product";
            integration_id: number | string;
            name: string;
            instructions: string;
            id: string;
          })[];
          conditions?: {
            or: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          } | {
            and: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          };
          outputs: {
            id: string;
            description: string;
            path: string;
          }[];
        };
      } | {
        kind: "channel";
        settings: {
        };
      } | {
        kind: "reusable-llm-prompt";
        settings: {
          custom_inputs: {
            id: string;
            name: string;
            instructions: string;
            data_type: "string" | "number" | "date" | "boolean";
          }[];
          object_inputs: ({
            kind: "customer";
          } | {
            kind: "order";
          } | {
            kind: "product";
            name: string;
            instructions: string;
            id: string;
          })[];
          outputs: {
            id: string;
            name: string;
            description: string;
            path: string;
            data_type?: "string" | "number" | "date" | "boolean";
          }[];
        };
      })[];
      entrypoints: ({
        deactivated_datetime?: string | null; // date-time
        kind: "llm-conversation";
        trigger: "llm-prompt";
        settings: {
          requires_confirmation?: boolean | null;
          instructions: string;
        };
      } | {
        deactivated_datetime?: string | null; // date-time
        kind: "reusable-llm-prompt-call-step";
        trigger: "reusable-llm-prompt";
        settings: {
          requires_confirmation: boolean;
          conditions: {
            or: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          } | {
            and: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          };
        };
      })[];
      apps?: ({
        type: "shopify";
      } | {
        type: "recharge";
      } | {
        app_id: string;
        api_key?: string | null;
        account_oauth2_token_id?: string | null;
        type: "app";
        refresh_token?: string | null;
      })[] | null;
    }[];
    export type ListStoreWfEntrypointsResponseDto = {
      requires_confirmation: boolean;
      instructions: string;
      configuration_id: string;
      configuration_name: string;
      configuration_template_slug: string | null;
      trigger: {
        custom_inputs: {
          [name: string]: {
            name: string;
            instructions: string;
            data_type: "string" | "number" | "date" | "boolean";
          };
        };
        object_inputs: {
          customer_id?: {
            instructions: string;
            data_type: "number";
          };
          customer_email?: {
            instructions: string;
            data_type: "string";
          };
          customer_phone_number?: {
            instructions: string;
            data_type: "string";
          };
          order_external_id?: {
            instructions: string;
            data_type: "string";
          };
          order_name?: {
            instructions: string;
            data_type: "string";
          };
          order_number?: {
            instructions: string;
            data_type: "string";
          };
          products?: {
            [name: string]: {
              name: string;
              instructions: string;
              inputs: {
                product_id: {
                  instructions: string;
                  data_type: "string";
                };
                product_variant_id: {
                  instructions: string;
                  data_type: "string";
                };
              };
            };
          };
        };
      };
    }[];
    export type ListWfConfigurationTemplatesResponseDto = {
      internal_id: string;
      id: string;
      name: string;
      description?: string | null;
      short_description?: string | null;
      is_draft: boolean;
      initial_step_id: string;
      entrypoint?: {
        label: string;
        label_tkey: string;
      } | null;
      steps: ({
        id: string;
        kind: "http-request";
        settings: {
          name: string;
          url: string /* uri */  | ("");
          method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
          headers?: {
            [name: string]: string;
          } | null;
          body?: string | null;
          oauth2_token_settings?: {
            account_oauth2_token_id: string;
            refresh_token_url: string;
          } | null;
          variables: {
            id: string;
            name: string;
            jsonpath: string;
            data_type?: "string" | "number" | "date" | "boolean";
          }[];
        };
      } | {
        id: string;
        kind: "cancel-order";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "refund-order";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "update-shipping-address";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          name: string;
          address1: string;
          address2: string;
          city: string;
          zip: string;
          province: string;
          country: string;
          phone: string;
          last_name: string;
          first_name: string;
        };
      } | {
        id: string;
        kind: "cancel-subscription";
        settings: {
          customer_id: string;
          integration_id: string;
          subscription_id: string;
          reason: string;
        };
      } | {
        id: string;
        kind: "skip-charge";
        settings: {
          customer_id: string;
          integration_id: string;
          subscription_id: string;
          charge_id: string;
        };
      } | {
        id: string;
        kind: "remove-item";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          product_variant_id: string;
          quantity: string;
        };
      } | {
        id: string;
        kind: "replace-item";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          product_variant_id: string;
          quantity: string;
          added_product_variant_id: string;
          added_quantity: string;
        };
      } | {
        id: string;
        kind: "create-discount-code";
        settings: {
          customer_id: string;
          integration_id: string;
          type: string;
          amount: string;
          valid_for: string;
        };
      } | {
        id: string;
        kind: "refund-shipping-costs";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "reship-for-free";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "conditions";
        settings: {
          name: string;
        };
      } | {
        id: string;
        kind: "end";
        settings?: {
          success: boolean;
        } | null;
      } | {
        id: string;
        kind: "reusable-llm-prompt-call";
        settings: {
          configuration_id: string;
          configuration_internal_id: string;
          objects?: {
            customer?: string | null;
            order?: string | null;
            products?: {
              [name: string]: string;
            } | null;
          } | null;
          custom_inputs?: {
            [name: string]: string;
          } | null;
          values: {
            [name: string]: string | number | boolean;
          };
        };
      })[];
      inputs?: ({
        id: string;
        name: string;
        description: string;
        data_type: "string";
        options?: {
          label: string;
          value: string;
        }[] | null;
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "number";
        options?: {
          label: string;
          value: number;
        }[] | null;
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "boolean";
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "date";
      })[] | null;
      values?: {
        [name: string]: number | boolean | string /* date-time */  | string;
      } | null;
      transitions: {
        id: string;
        from_step_id: string;
        to_step_id: string;
        event?: {
          id: string;
          kind: "choices";
        } | null;
        name?: string | null;
        conditions?: {
          or: ({
            equals: any;
          } | {
            notEqual: any;
          } | {
            contains: any;
          } | {
            doesNotContain: any;
          } | {
            endsWith: any;
          } | {
            startsWith: any;
          } | {
            exists: any;
          } | {
            doesNotExist: any;
          } | {
            lessThan: any;
          } | {
            lessThanInterval: any;
          } | {
            lessOrEqual: any;
          } | {
            greaterThan: any;
          } | {
            greaterThanInterval: any;
          } | {
            greaterOrEqual: any;
          })[];
        } | {
          and: ({
            equals: any;
          } | {
            notEqual: any;
          } | {
            contains: any;
          } | {
            doesNotContain: any;
          } | {
            endsWith: any;
          } | {
            startsWith: any;
          } | {
            exists: any;
          } | {
            doesNotExist: any;
          } | {
            lessThan: any;
          } | {
            lessThanInterval: any;
          } | {
            lessOrEqual: any;
          } | {
            greaterThan: any;
          } | {
            greaterThanInterval: any;
          } | {
            greaterOrEqual: any;
          })[];
        };
      }[];
      available_languages: ("en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR")[];
      category?: string | null;
      created_datetime: string; // date-time
      updated_datetime: string; // date-time
      deleted_datetime?: string | null; // date-time
      triggers: ({
        kind: "llm-prompt";
        settings: {
          custom_inputs: {
            id: string;
            name: string;
            instructions: string;
            data_type: "string" | "number" | "date" | "boolean";
          }[];
          object_inputs: ({
            kind: "customer";
            integration_id: number | string;
          } | {
            kind: "order";
            integration_id: number | string;
          } | {
            kind: "product";
            integration_id: number | string;
            name: string;
            instructions: string;
            id: string;
          })[];
          conditions?: {
            or: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          } | {
            and: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          };
          outputs: {
            id: string;
            description: string;
            path: string;
          }[];
        };
      } | {
        kind: "channel";
        settings: {
        };
      } | {
        kind: "reusable-llm-prompt";
        settings: {
          custom_inputs: {
            id: string;
            name: string;
            instructions: string;
            data_type: "string" | "number" | "date" | "boolean";
          }[];
          object_inputs: ({
            kind: "customer";
          } | {
            kind: "order";
          } | {
            kind: "product";
            name: string;
            instructions: string;
            id: string;
          })[];
          outputs: {
            id: string;
            name: string;
            description: string;
            path: string;
            data_type?: "string" | "number" | "date" | "boolean";
          }[];
        };
      })[];
      entrypoints: ({
        deactivated_datetime?: string | null; // date-time
        kind: "llm-conversation";
        trigger: "llm-prompt";
        settings: {
          requires_confirmation: boolean;
          instructions: string;
        };
      } | {
        deactivated_datetime?: string | null; // date-time
        kind: "reusable-llm-prompt-call-step";
        trigger: "reusable-llm-prompt";
        settings: {
          requires_confirmation: boolean;
          conditions: {
            or: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          } | {
            and: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          };
        };
      })[];
      apps: ({
        type: "shopify";
      } | {
        type: "recharge";
      } | {
        app_id: string;
        api_key?: string | null;
        account_oauth2_token_id?: string | null;
        type: "app";
        refresh_token?: string | null;
      })[];
    }[];
    export type ListWfConfigurationsResponseDto = {
      internal_id: string;
      id: string;
      account_id: number | null;
      template_internal_id?: string | null;
      name: string;
      description?: string | null;
      short_description?: string | null;
      is_draft: boolean;
      initial_step_id: string;
      entrypoint?: {
        label: string;
        label_tkey: string;
      } | null;
      steps: ({
        id: string;
        kind: "choices";
        settings: {
          choices: {
            event_id: string;
            label: string;
            label_tkey: string;
          }[];
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "handover";
        settings?: {
          ticket_tags?: string[] | null;
          ticket_assignee_user_id?: null | number;
          ticket_assignee_team_id?: null | number;
        } | null;
      } | {
        id: string;
        kind: "workflow_call";
        settings: {
          configuration_id: string;
        };
      } | {
        id: string;
        kind: "text-input";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "attachments-input";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "shopper-authentication";
        settings: {
          integration_id: number;
        };
      } | {
        id: string;
        kind: "order-selection";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "http-request";
      } | {
        id: string;
        kind: "helpful-prompt";
        settings?: {
          ticket_tags?: string[] | null;
          ticket_assignee_user_id?: null | number;
          ticket_assignee_team_id?: null | number;
        } | null;
      } | {
        id: string;
        kind: "message";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "end";
        settings?: {
          success: boolean;
        } | null;
      } | {
        id: string;
        kind: "conditions";
        settings: {
          name: string;
        };
      } | {
        id: string;
        kind: "order-line-item-selection";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "cancel-order";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "refund-order";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "update-shipping-address";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          name: string;
          address1: string;
          address2: string;
          city: string;
          zip: string;
          province: string;
          country: string;
          phone: string;
          last_name: string;
          first_name: string;
        };
      } | {
        id: string;
        kind: "cancel-subscription";
        settings: {
          customer_id: string;
          integration_id: string;
          subscription_id: string;
          reason: string;
        };
      } | {
        id: string;
        kind: "skip-charge";
        settings: {
          customer_id: string;
          integration_id: string;
          subscription_id: string;
          charge_id: string;
        };
      } | {
        id: string;
        kind: "remove-item";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          product_variant_id: string;
          quantity: string;
        };
      } | {
        id: string;
        kind: "replace-item";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          product_variant_id: string;
          quantity: string;
          added_product_variant_id: string;
          added_quantity: string;
        };
      } | {
        id: string;
        kind: "create-discount-code";
        settings: {
          customer_id: string;
          integration_id: string;
          type: string;
          amount: string;
          valid_for: string;
        };
      } | {
        id: string;
        kind: "reship-for-free";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "refund-shipping-costs";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "reusable-llm-prompt-call";
        settings: {
          configuration_id: string;
          configuration_internal_id: string;
          objects?: {
            customer?: string | null;
            order?: string | null;
            products?: {
              [name: string]: string;
            } | null;
          } | null;
          custom_inputs?: {
            [name: string]: string;
          } | null;
          values: {
            [name: string]: string | number | boolean;
          };
        };
      })[];
      inputs?: ({
        id: string;
        name: string;
        description: string;
        data_type: "string";
        options?: {
          label: string;
          value: string;
        }[] | null;
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "number";
        options?: {
          label: string;
          value: number;
        }[] | null;
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "boolean";
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "date";
      })[] | null;
      values?: {
        [name: string]: number | boolean | string /* date-time */  | string;
      } | null;
      transitions: {
        id: string;
        from_step_id: string;
        to_step_id: string;
        event?: {
          id: string;
          kind: "choices";
        } | null;
        name?: string | null;
        conditions?: {
          or: ({
            equals: any;
          } | {
            notEqual: any;
          } | {
            contains: any;
          } | {
            doesNotContain: any;
          } | {
            endsWith: any;
          } | {
            startsWith: any;
          } | {
            exists: any;
          } | {
            doesNotExist: any;
          } | {
            lessThan: any;
          } | {
            lessThanInterval: any;
          } | {
            lessOrEqual: any;
          } | {
            greaterThan: any;
          } | {
            greaterThanInterval: any;
          } | {
            greaterOrEqual: any;
          })[];
        } | {
          and: ({
            equals: any;
          } | {
            notEqual: any;
          } | {
            contains: any;
          } | {
            doesNotContain: any;
          } | {
            endsWith: any;
          } | {
            startsWith: any;
          } | {
            exists: any;
          } | {
            doesNotExist: any;
          } | {
            lessThan: any;
          } | {
            lessThanInterval: any;
          } | {
            lessOrEqual: any;
          } | {
            greaterThan: any;
          } | {
            greaterThanInterval: any;
          } | {
            greaterOrEqual: any;
          })[];
        };
      }[];
      available_languages: ("en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR")[];
      category?: string | null;
      created_datetime?: string | null; // date-time
      updated_datetime?: string | null; // date-time
      deleted_datetime?: string | null; // date-time
    }[];
    export interface ListWfEntrypointsResponseDto {
      [name: string]: {
        label: string;
      };
    }
    export interface SendWfExecutionEventRequestDto {
      execution_id: string;
      event: {
        id: string;
        kind: "choices";
        choice_label?: string | null;
      } | {
        kind: "go-back";
      } | {
        kind: "go-next";
      } | {
        kind: "text-input";
        content: {
          text: string;
        };
      } | {
        kind: "attachments-input";
        attachments: {
          content_type: string;
          url: string;
        }[];
      } | {
        kind: "shopper-authentication";
        id_token: string;
      } | {
        id: string;
        kind: "order-selection";
        order?: {
          name: string;
          external_id?: string | null;
          shopper_external_id?: string | null;
          number?: string | null;
          currency: {
            code: string;
            decimals: number;
          };
          discount_amount?: number | null;
          subtotal_amount?: number | null;
          shipping_amount?: number | null;
          tax_amount?: number | null;
          cancelled_datetime?: string | null; // date-time
          created_datetime: string; // date-time
          external_status?: string | null;
          external_fulfillment_status?: string | null;
          billing_address?: {
            line_1: string | null;
            line_2: string | null;
            city: string | null;
            country: string | null;
            state: string | null;
            zip_code: string | null;
            first_name: string | null;
            last_name: string | null;
            phone_number: string | null;
          } | null;
          shipping_address?: {
            line_1: string | null;
            line_2: string | null;
            city: string | null;
            country: string | null;
            state: string | null;
            zip_code: string | null;
            first_name: string | null;
            last_name: string | null;
            phone_number: string | null;
          } | null;
          external_payment_status?: string | null;
          total_amount: number;
          tracking_url?: string | null;
          shipping_datetime?: string | null; // date-time
          tracking_number?: string | null;
          status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
          line_items: {
            name: string;
            total_amount: number;
            quantity: number;
            external_id?: string | null;
            external_product_id?: string | null;
            product?: {
              external_id: string;
              images: string[];
              name?: string | null;
              external_type?: string | null;
              variants?: {
                external_id: string;
                external_gid?: string | null;
                quantity?: number | null;
                name?: string | null;
              }[] | null;
            } | null;
          }[];
          fulfillments?: {
            status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
            external_shipment_status?: string | null;
            updated_datetime?: string | null; // date-time
          }[] | null;
          shipping_lines?: {
            external_method_id?: string | null;
            method_name?: string | null;
          }[] | null;
          tags_stringified?: string | null;
          note?: string | null;
        } | null;
      } | {
        items: {
          external_id: string;
          quantity: number;
          name?: string | null;
        }[];
        kind: "order-line-item-selection";
      };
    }
    export type SendWfExecutionEventResponseDto = {
      execution_id: string;
      trigger: "channel";
      channel_actions: ({
        kind: "messages";
        messages: {
          content: {
            html: string;
            text: string;
          };
          author: {
            kind: "shopper" | "bot";
          };
        }[];
      } | {
        kind: "choices";
        choices: {
          label: string;
          event_id: string;
        }[];
      } | {
        kind: "handover";
        messages: {
          content: {
            html?: string | null;
            text?: string | null;
            attachments?: {
              content_type: string;
              url: string;
            }[] | null;
          };
          author: {
            kind: "shopper" | "bot";
          };
        }[];
        ticket_tags?: string[] | null;
        ticket_assignee_user_id?: null | number;
        ticket_assignee_team_id?: null | number;
        not_automatable?: boolean | null;
        shopper_email?: string | null;
      } | {
        kind: "text-input";
        content?: {
          text: string;
        } | null;
      } | {
        kind: "attachments-input";
        attachments?: {
          content_type: string;
          url: string;
        }[] | null;
      } | {
        kind: "shopper-authentication";
      } | {
        kind: "shopper-authentication-success";
        access_token: string;
      } | {
        kind: "order-selection";
        orders: {
          name: string;
          external_id?: string | null;
          shopper_external_id?: string | null;
          number?: string | null;
          currency: {
            code: string;
            decimals: number;
          };
          discount_amount?: number | null;
          subtotal_amount?: number | null;
          shipping_amount?: number | null;
          tax_amount?: number | null;
          cancelled_datetime?: string | null; // date-time
          created_datetime: string; // date-time
          external_status?: string | null;
          external_fulfillment_status?: string | null;
          billing_address?: {
            line_1: string | null;
            line_2: string | null;
            city: string | null;
            country: string | null;
            state: string | null;
            zip_code: string | null;
            first_name: string | null;
            last_name: string | null;
            phone_number: string | null;
          } | null;
          shipping_address?: {
            line_1: string | null;
            line_2: string | null;
            city: string | null;
            country: string | null;
            state: string | null;
            zip_code: string | null;
            first_name: string | null;
            last_name: string | null;
            phone_number: string | null;
          } | null;
          external_payment_status?: string | null;
          total_amount: number;
          tracking_url?: string | null;
          shipping_datetime?: string | null; // date-time
          tracking_number?: string | null;
          status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
          line_items: {
            name: string;
            total_amount: number;
            quantity: number;
            external_id?: string | null;
            external_product_id?: string | null;
            product?: {
              external_id: string;
              images: string[];
              name?: string | null;
              external_type?: string | null;
              variants?: {
                external_id: string;
                external_gid?: string | null;
                quantity?: number | null;
                name?: string | null;
              }[] | null;
            } | null;
          }[];
          fulfillments?: {
            status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
            external_shipment_status?: string | null;
            updated_datetime?: string | null; // date-time
          }[] | null;
          shipping_lines?: {
            external_method_id?: string | null;
            method_name?: string | null;
          }[] | null;
          tags_stringified?: string | null;
          note?: string | null;
        }[];
        message?: {
          html: string;
          text: string;
        } | null;
      } | {
        kind: "order-line-item-selection";
        order: {
          name: string;
          external_id?: string | null;
          shopper_external_id?: string | null;
          number?: string | null;
          currency: {
            code: string;
            decimals: number;
          };
          discount_amount?: number | null;
          subtotal_amount?: number | null;
          shipping_amount?: number | null;
          tax_amount?: number | null;
          cancelled_datetime?: string | null; // date-time
          created_datetime: string; // date-time
          external_status?: string | null;
          external_fulfillment_status?: string | null;
          billing_address?: {
            line_1: string | null;
            line_2: string | null;
            city: string | null;
            country: string | null;
            state: string | null;
            zip_code: string | null;
            first_name: string | null;
            last_name: string | null;
            phone_number: string | null;
          } | null;
          shipping_address?: {
            line_1: string | null;
            line_2: string | null;
            city: string | null;
            country: string | null;
            state: string | null;
            zip_code: string | null;
            first_name: string | null;
            last_name: string | null;
            phone_number: string | null;
          } | null;
          external_payment_status?: string | null;
          total_amount: number;
          tracking_url?: string | null;
          shipping_datetime?: string | null; // date-time
          tracking_number?: string | null;
          status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
          line_items: {
            name: string;
            total_amount: number;
            quantity: number;
            external_id?: string | null;
            external_product_id?: string | null;
            product?: {
              external_id: string;
              images: string[];
              name?: string | null;
              external_type?: string | null;
              variants?: {
                external_id: string;
                external_gid?: string | null;
                quantity?: number | null;
                name?: string | null;
              }[] | null;
            } | null;
          }[];
          fulfillments?: {
            status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
            external_shipment_status?: string | null;
            updated_datetime?: string | null; // date-time
          }[] | null;
          shipping_lines?: {
            external_method_id?: string | null;
            method_name?: string | null;
          }[] | null;
          tags_stringified?: string | null;
          note?: string | null;
        };
        message?: {
          html: string;
          text: string;
        } | null;
      })[];
      done?: boolean | null;
      can_go_back?: boolean | null;
      can_go_next?: boolean | null;
      needs_auth?: boolean | null;
    } | {
      execution_id: string;
      trigger: "llm-prompt";
      entrypoint: {
        requires_confirmation: boolean;
        instructions: string;
        configuration_name: string;
        configuration_template_slug: string | null;
        trigger: {
          custom_inputs: {
            [name: string]: {
              name: string;
              instructions: string;
              data_type: "string" | "number" | "date" | "boolean";
            };
          };
          object_inputs: {
            customer_id?: {
              instructions: string;
              data_type: "number";
            };
            customer_email?: {
              instructions: string;
              data_type: "string";
            };
            customer_phone_number?: {
              instructions: string;
              data_type: "string";
            };
            order_external_id?: {
              instructions: string;
              data_type: "string";
            };
            order_name?: {
              instructions: string;
              data_type: "string";
            };
            order_number?: {
              instructions: string;
              data_type: "string";
            };
            products?: {
              [name: string]: {
                name: string;
                instructions: string;
                inputs: {
                  product_id: {
                    instructions: string;
                    data_type: "string";
                  };
                  product_variant_id: {
                    instructions: string;
                    data_type: "string";
                  };
                };
              };
            };
          };
        };
      };
      channel_actions: ({
        kind: "messages";
        messages: {
          content: {
            html: string;
            text: string;
          };
          author: {
            kind: "shopper" | "bot";
          };
        }[];
      } | {
        kind: "choices";
        choices: {
          label: string;
          event_id: string;
        }[];
      } | {
        kind: "handover";
        messages: {
          content: {
            html?: string | null;
            text?: string | null;
            attachments?: {
              content_type: string;
              url: string;
            }[] | null;
          };
          author: {
            kind: "shopper" | "bot";
          };
        }[];
        ticket_tags?: string[] | null;
        ticket_assignee_user_id?: null | number;
        ticket_assignee_team_id?: null | number;
        not_automatable?: boolean | null;
        shopper_email?: string | null;
      } | {
        kind: "text-input";
        content?: {
          text: string;
        } | null;
      } | {
        kind: "attachments-input";
        attachments?: {
          content_type: string;
          url: string;
        }[] | null;
      } | {
        kind: "shopper-authentication";
      } | {
        kind: "shopper-authentication-success";
        access_token: string;
      } | {
        kind: "order-selection";
        orders: {
          name: string;
          external_id?: string | null;
          shopper_external_id?: string | null;
          number?: string | null;
          currency: {
            code: string;
            decimals: number;
          };
          discount_amount?: number | null;
          subtotal_amount?: number | null;
          shipping_amount?: number | null;
          tax_amount?: number | null;
          cancelled_datetime?: string | null; // date-time
          created_datetime: string; // date-time
          external_status?: string | null;
          external_fulfillment_status?: string | null;
          billing_address?: {
            line_1: string | null;
            line_2: string | null;
            city: string | null;
            country: string | null;
            state: string | null;
            zip_code: string | null;
            first_name: string | null;
            last_name: string | null;
            phone_number: string | null;
          } | null;
          shipping_address?: {
            line_1: string | null;
            line_2: string | null;
            city: string | null;
            country: string | null;
            state: string | null;
            zip_code: string | null;
            first_name: string | null;
            last_name: string | null;
            phone_number: string | null;
          } | null;
          external_payment_status?: string | null;
          total_amount: number;
          tracking_url?: string | null;
          shipping_datetime?: string | null; // date-time
          tracking_number?: string | null;
          status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
          line_items: {
            name: string;
            total_amount: number;
            quantity: number;
            external_id?: string | null;
            external_product_id?: string | null;
            product?: {
              external_id: string;
              images: string[];
              name?: string | null;
              external_type?: string | null;
              variants?: {
                external_id: string;
                external_gid?: string | null;
                quantity?: number | null;
                name?: string | null;
              }[] | null;
            } | null;
          }[];
          fulfillments?: {
            status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
            external_shipment_status?: string | null;
            updated_datetime?: string | null; // date-time
          }[] | null;
          shipping_lines?: {
            external_method_id?: string | null;
            method_name?: string | null;
          }[] | null;
          tags_stringified?: string | null;
          note?: string | null;
        }[];
        message?: {
          html: string;
          text: string;
        } | null;
      } | {
        kind: "order-line-item-selection";
        order: {
          name: string;
          external_id?: string | null;
          shopper_external_id?: string | null;
          number?: string | null;
          currency: {
            code: string;
            decimals: number;
          };
          discount_amount?: number | null;
          subtotal_amount?: number | null;
          shipping_amount?: number | null;
          tax_amount?: number | null;
          cancelled_datetime?: string | null; // date-time
          created_datetime: string; // date-time
          external_status?: string | null;
          external_fulfillment_status?: string | null;
          billing_address?: {
            line_1: string | null;
            line_2: string | null;
            city: string | null;
            country: string | null;
            state: string | null;
            zip_code: string | null;
            first_name: string | null;
            last_name: string | null;
            phone_number: string | null;
          } | null;
          shipping_address?: {
            line_1: string | null;
            line_2: string | null;
            city: string | null;
            country: string | null;
            state: string | null;
            zip_code: string | null;
            first_name: string | null;
            last_name: string | null;
            phone_number: string | null;
          } | null;
          external_payment_status?: string | null;
          total_amount: number;
          tracking_url?: string | null;
          shipping_datetime?: string | null; // date-time
          tracking_number?: string | null;
          status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
          line_items: {
            name: string;
            total_amount: number;
            quantity: number;
            external_id?: string | null;
            external_product_id?: string | null;
            product?: {
              external_id: string;
              images: string[];
              name?: string | null;
              external_type?: string | null;
              variants?: {
                external_id: string;
                external_gid?: string | null;
                quantity?: number | null;
                name?: string | null;
              }[] | null;
            } | null;
          }[];
          fulfillments?: {
            status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
            external_shipment_status?: string | null;
            updated_datetime?: string | null; // date-time
          }[] | null;
          shipping_lines?: {
            external_method_id?: string | null;
            method_name?: string | null;
          }[] | null;
          tags_stringified?: string | null;
          note?: string | null;
        };
        message?: {
          html: string;
          text: string;
        } | null;
      })[];
      done?: boolean | null;
      success?: boolean | null;
      state: {
        steps_state?: {
          [name: string]: {
            kind: "choices";
            selected_choice: {
              event_id: string;
              label: string;
            };
            at: string; // date-time
          } | {
            kind: "text-input";
            content: {
              text: string;
            };
            at: string; // date-time
          } | {
            kind: "attachments-input";
            attachments?: {
              content_type: string;
              url: string;
            }[] | null;
            at: string; // date-time
          } | {
            kind: "shopper-authentication";
            customer: {
              id: number;
              email?: string | null;
              firstname?: string | null;
              lastname?: string | null;
              name?: string | null;
              phone_number?: string | null;
              orders: {
                name: string;
                external_id?: string | null;
                shopper_external_id?: string | null;
                number?: string | null;
                currency: {
                  code: string;
                  decimals: number;
                };
                discount_amount?: number | null;
                subtotal_amount?: number | null;
                shipping_amount?: number | null;
                tax_amount?: number | null;
                cancelled_datetime?: string | null; // date-time
                created_datetime: string; // date-time
                external_status?: string | null;
                external_fulfillment_status?: string | null;
                billing_address?: {
                  line_1: string | null;
                  line_2: string | null;
                  city: string | null;
                  country: string | null;
                  state: string | null;
                  zip_code: string | null;
                  first_name: string | null;
                  last_name: string | null;
                  phone_number: string | null;
                } | null;
                shipping_address?: {
                  line_1: string | null;
                  line_2: string | null;
                  city: string | null;
                  country: string | null;
                  state: string | null;
                  zip_code: string | null;
                  first_name: string | null;
                  last_name: string | null;
                  phone_number: string | null;
                } | null;
                external_payment_status?: string | null;
                total_amount: number;
                tracking_url?: string | null;
                shipping_datetime?: string | null; // date-time
                tracking_number?: string | null;
                status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
                line_items: {
                  name: string;
                  total_amount: number;
                  quantity: number;
                  external_id?: string | null;
                  external_product_id?: string | null;
                  product?: {
                    external_id: string;
                    images: string[];
                    name?: string | null;
                    external_type?: string | null;
                    variants?: {
                      external_id: string;
                      external_gid?: string | null;
                      quantity?: number | null;
                      name?: string | null;
                    }[] | null;
                  } | null;
                }[];
                fulfillments?: {
                  status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
                  external_shipment_status?: string | null;
                  updated_datetime?: string | null; // date-time
                }[] | null;
                shipping_lines?: {
                  external_method_id?: string | null;
                  method_name?: string | null;
                }[] | null;
                tags_stringified?: string | null;
                note?: string | null;
              }[];
              tags_stringified?: string | null;
            };
            at: string; // date-time
          } | {
            kind: "order-selection";
            order: {
              name: string;
              external_id?: string | null;
              shopper_external_id?: string | null;
              number?: string | null;
              currency: {
                code: string;
                decimals: number;
              };
              discount_amount?: number | null;
              subtotal_amount?: number | null;
              shipping_amount?: number | null;
              tax_amount?: number | null;
              cancelled_datetime?: string | null; // date-time
              created_datetime: string; // date-time
              external_status?: string | null;
              external_fulfillment_status?: string | null;
              billing_address?: {
                line_1: string | null;
                line_2: string | null;
                city: string | null;
                country: string | null;
                state: string | null;
                zip_code: string | null;
                first_name: string | null;
                last_name: string | null;
                phone_number: string | null;
              } | null;
              shipping_address?: {
                line_1: string | null;
                line_2: string | null;
                city: string | null;
                country: string | null;
                state: string | null;
                zip_code: string | null;
                first_name: string | null;
                last_name: string | null;
                phone_number: string | null;
              } | null;
              external_payment_status?: string | null;
              total_amount: number;
              tracking_url?: string | null;
              shipping_datetime?: string | null; // date-time
              tracking_number?: string | null;
              status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
              line_items: {
                name: string;
                total_amount: number;
                quantity: number;
                external_id?: string | null;
                external_product_id?: string | null;
                product?: {
                  external_id: string;
                  images: string[];
                  name?: string | null;
                  external_type?: string | null;
                  variants?: {
                    external_id: string;
                    external_gid?: string | null;
                    quantity?: number | null;
                    name?: string | null;
                  }[] | null;
                } | null;
              }[];
              fulfillments?: {
                status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
                external_shipment_status?: string | null;
                updated_datetime?: string | null; // date-time
              }[] | null;
              shipping_lines?: {
                external_method_id?: string | null;
                method_name?: string | null;
              }[] | null;
              tags_stringified?: string | null;
              note?: string | null;
            };
            at: string; // date-time
          } | {
            kind: "workflow_call";
            steps_state?: {
              [name: string]: {
                kind: "choices";
                selected_choice: {
                  event_id: string;
                  label: string;
                };
                at: string; // date-time
              } | {
                kind: "text-input";
                content: {
                  text: string;
                };
                at: string; // date-time
              } | {
                kind: "attachments-input";
                attachments?: {
                  content_type: string;
                  url: string;
                }[] | null;
                at: string; // date-time
              } | {
                kind: "shopper-authentication";
                customer: {
                  id: number;
                  email?: string | null;
                  firstname?: string | null;
                  lastname?: string | null;
                  name?: string | null;
                  phone_number?: string | null;
                  orders: {
                    name: string;
                    external_id?: string | null;
                    shopper_external_id?: string | null;
                    number?: string | null;
                    currency: {
                      code: string;
                      decimals: number;
                    };
                    discount_amount?: number | null;
                    subtotal_amount?: number | null;
                    shipping_amount?: number | null;
                    tax_amount?: number | null;
                    cancelled_datetime?: string | null; // date-time
                    created_datetime: string; // date-time
                    external_status?: string | null;
                    external_fulfillment_status?: string | null;
                    billing_address?: {
                      line_1: string | null;
                      line_2: string | null;
                      city: string | null;
                      country: string | null;
                      state: string | null;
                      zip_code: string | null;
                      first_name: string | null;
                      last_name: string | null;
                      phone_number: string | null;
                    } | null;
                    shipping_address?: {
                      line_1: string | null;
                      line_2: string | null;
                      city: string | null;
                      country: string | null;
                      state: string | null;
                      zip_code: string | null;
                      first_name: string | null;
                      last_name: string | null;
                      phone_number: string | null;
                    } | null;
                    external_payment_status?: string | null;
                    total_amount: number;
                    tracking_url?: string | null;
                    shipping_datetime?: string | null; // date-time
                    tracking_number?: string | null;
                    status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
                    line_items: {
                      name: string;
                      total_amount: number;
                      quantity: number;
                      external_id?: string | null;
                      external_product_id?: string | null;
                      product?: {
                        external_id: string;
                        images: string[];
                        name?: string | null;
                        external_type?: string | null;
                        variants?: {
                          external_id: string;
                          external_gid?: string | null;
                          quantity?: number | null;
                          name?: string | null;
                        }[] | null;
                      } | null;
                    }[];
                    fulfillments?: {
                      status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
                      external_shipment_status?: string | null;
                      updated_datetime?: string | null; // date-time
                    }[] | null;
                    shipping_lines?: {
                      external_method_id?: string | null;
                      method_name?: string | null;
                    }[] | null;
                    tags_stringified?: string | null;
                    note?: string | null;
                  }[];
                  tags_stringified?: string | null;
                };
                at: string; // date-time
              } | {
                kind: "order-selection";
                order: {
                  name: string;
                  external_id?: string | null;
                  shopper_external_id?: string | null;
                  number?: string | null;
                  currency: {
                    code: string;
                    decimals: number;
                  };
                  discount_amount?: number | null;
                  subtotal_amount?: number | null;
                  shipping_amount?: number | null;
                  tax_amount?: number | null;
                  cancelled_datetime?: string | null; // date-time
                  created_datetime: string; // date-time
                  external_status?: string | null;
                  external_fulfillment_status?: string | null;
                  billing_address?: {
                    line_1: string | null;
                    line_2: string | null;
                    city: string | null;
                    country: string | null;
                    state: string | null;
                    zip_code: string | null;
                    first_name: string | null;
                    last_name: string | null;
                    phone_number: string | null;
                  } | null;
                  shipping_address?: {
                    line_1: string | null;
                    line_2: string | null;
                    city: string | null;
                    country: string | null;
                    state: string | null;
                    zip_code: string | null;
                    first_name: string | null;
                    last_name: string | null;
                    phone_number: string | null;
                  } | null;
                  external_payment_status?: string | null;
                  total_amount: number;
                  tracking_url?: string | null;
                  shipping_datetime?: string | null; // date-time
                  tracking_number?: string | null;
                  status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
                  line_items: {
                    name: string;
                    total_amount: number;
                    quantity: number;
                    external_id?: string | null;
                    external_product_id?: string | null;
                    product?: {
                      external_id: string;
                      images: string[];
                      name?: string | null;
                      external_type?: string | null;
                      variants?: {
                        external_id: string;
                        external_gid?: string | null;
                        quantity?: number | null;
                        name?: string | null;
                      }[] | null;
                    } | null;
                  }[];
                  fulfillments?: {
                    status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
                    external_shipment_status?: string | null;
                    updated_datetime?: string | null; // date-time
                  }[] | null;
                  shipping_lines?: {
                    external_method_id?: string | null;
                    method_name?: string | null;
                  }[] | null;
                  tags_stringified?: string | null;
                  note?: string | null;
                };
                at: string; // date-time
              } | {
                kind: "http-request";
                status_code: number;
                success: boolean;
                content?: ({
                  [name: string]: number | boolean | string /* date-time */  | string | any;
                } | null) | any;
                at: string; // date-time
              } | {
                kind: "cancel-order";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "refund-order";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "update-shipping-address";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "cancel-subscription";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "skip-charge";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "remove-item";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "replace-item";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "create-discount-code";
                discount_code?: string | null;
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "reship-for-free";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "refund-shipping-costs";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "end";
                success: boolean;
                at: string; // date-time
              };
            } | null;
            at: string; // date-time
          } | {
            kind: "http-request";
            status_code: number;
            success: boolean;
            content?: ({
              [name: string]: number | boolean | string /* date-time */  | string | any;
            } | null) | any;
            at: string; // date-time
          } | {
            kind: "cancel-order";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "refund-order";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "update-shipping-address";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "cancel-subscription";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "skip-charge";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "remove-item";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "replace-item";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "create-discount-code";
            discount_code?: string | null;
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "reship-for-free";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "refund-shipping-costs";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "end";
            success: boolean;
            at: string; // date-time
          };
        } | null;
        store?: {
          type: "shopify";
          name: string;
          helpdesk_integration_id: number;
        } | null;
        preview_mode?: boolean | null;
        trigger: "llm-prompt";
        entrypoint?: "llm-conversation";
        objects?: {
          customer?: {
            id: number;
            email?: string | null;
            firstname?: string | null;
            lastname?: string | null;
            name?: string | null;
            phone_number?: string | null;
            orders: {
              name: string;
              external_id?: string | null;
              shopper_external_id?: string | null;
              number?: string | null;
              currency: {
                code: string;
                decimals: number;
              };
              discount_amount?: number | null;
              subtotal_amount?: number | null;
              shipping_amount?: number | null;
              tax_amount?: number | null;
              cancelled_datetime?: string | null; // date-time
              created_datetime: string; // date-time
              external_status?: string | null;
              external_fulfillment_status?: string | null;
              billing_address?: {
                line_1: string | null;
                line_2: string | null;
                city: string | null;
                country: string | null;
                state: string | null;
                zip_code: string | null;
                first_name: string | null;
                last_name: string | null;
                phone_number: string | null;
              } | null;
              shipping_address?: {
                line_1: string | null;
                line_2: string | null;
                city: string | null;
                country: string | null;
                state: string | null;
                zip_code: string | null;
                first_name: string | null;
                last_name: string | null;
                phone_number: string | null;
              } | null;
              external_payment_status?: string | null;
              total_amount: number;
              tracking_url?: string | null;
              shipping_datetime?: string | null; // date-time
              tracking_number?: string | null;
              status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
              line_items: {
                name: string;
                total_amount: number;
                quantity: number;
                external_id?: string | null;
                external_product_id?: string | null;
                product?: {
                  external_id: string;
                  images: string[];
                  name?: string | null;
                  external_type?: string | null;
                  variants?: {
                    external_id: string;
                    external_gid?: string | null;
                    quantity?: number | null;
                    name?: string | null;
                  }[] | null;
                } | null;
              }[];
              fulfillments?: {
                status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
                external_shipment_status?: string | null;
                updated_datetime?: string | null; // date-time
              }[] | null;
              shipping_lines?: {
                external_method_id?: string | null;
                method_name?: string | null;
              }[] | null;
              tags_stringified?: string | null;
              note?: string | null;
            }[];
            tags_stringified?: string | null;
          } | null;
          order?: {
            name: string;
            external_id?: string | null;
            shopper_external_id?: string | null;
            number?: string | null;
            currency: {
              code: string;
              decimals: number;
            };
            discount_amount?: number | null;
            subtotal_amount?: number | null;
            shipping_amount?: number | null;
            tax_amount?: number | null;
            cancelled_datetime?: string | null; // date-time
            created_datetime: string; // date-time
            external_status?: string | null;
            external_fulfillment_status?: string | null;
            billing_address?: {
              line_1: string | null;
              line_2: string | null;
              city: string | null;
              country: string | null;
              state: string | null;
              zip_code: string | null;
              first_name: string | null;
              last_name: string | null;
              phone_number: string | null;
            } | null;
            shipping_address?: {
              line_1: string | null;
              line_2: string | null;
              city: string | null;
              country: string | null;
              state: string | null;
              zip_code: string | null;
              first_name: string | null;
              last_name: string | null;
              phone_number: string | null;
            } | null;
            external_payment_status?: string | null;
            total_amount: number;
            tracking_url?: string | null;
            shipping_datetime?: string | null; // date-time
            tracking_number?: string | null;
            status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
            line_items: {
              name: string;
              total_amount: number;
              quantity: number;
              external_id?: string | null;
              external_product_id?: string | null;
              product?: {
                external_id: string;
                images: string[];
                name?: string | null;
                external_type?: string | null;
                variants?: {
                  external_id: string;
                  external_gid?: string | null;
                  quantity?: number | null;
                  name?: string | null;
                }[] | null;
              } | null;
            }[];
            fulfillments?: {
              status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
              external_shipment_status?: string | null;
              updated_datetime?: string | null; // date-time
            }[] | null;
            shipping_lines?: {
              external_method_id?: string | null;
              method_name?: string | null;
            }[] | null;
            tags_stringified?: string | null;
            note?: string | null;
          } | null;
          products?: {
            [name: string]: {
              external_id: string;
              images: string[];
              name?: string | null;
              external_type?: string | null;
              variants?: {
                external_id: string;
                external_gid?: string | null;
                quantity?: number | null;
                name?: string | null;
              }[] | null;
              selected_variant?: {
                external_id: string;
                external_gid?: string | null;
                quantity?: number | null;
                name?: string | null;
              } | null;
            };
          } | null;
        } | null;
        custom_inputs?: {
          [name: string]: number | boolean | string /* date-time */  | string;
        } | null;
        values?: {
          [name: string]: number | boolean | string /* date-time */  | string;
        } | null;
        user_journey_id?: string | null;
        channel?: "email";
        callback_url?: string | null;
      };
      outputs: {
        [name: string]: {
          description: string;
          value?: any;
        };
      };
    };
    export type StartWfExecutionRequestDto = {
      configuration_id: string;
      preview_mode?: boolean | null;
      trigger: "channel";
      channel: "chat" | "help-center" | "contact-form";
      channel_language: "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
      shop_name: string;
      shop_type?: string;
      user_journey_id: string;
      trigger_type?: "recommendation";
      time_zone?: string | null;
    } | {
      configuration_id: string;
      preview_mode?: boolean | null;
      trigger: "llm-prompt";
      entrypoint?: "llm-conversation";
      custom_inputs?: {
        [name: string]: string;
      } | null;
      object_inputs?: {
        customer_id?: string | null;
        customer_email?: string | null;
        customer_phone_number?: string | null;
        order_external_id?: string | null;
        order_name?: string | null;
        order_number?: string | null;
        products?: {
          [name: string]: {
            product_id?: string | null;
            product_variant_id?: string | null;
          };
        } | null;
      } | null;
      user_journey_id?: string | null;
      callback_url?: string | null; // uri
      channel?: "email";
    };
    export type StartWfExecutionResponseDto = {
      execution_id: string;
      trigger: "channel";
      channel_actions: ({
        kind: "messages";
        messages: {
          content: {
            html: string;
            text: string;
          };
          author: {
            kind: "shopper" | "bot";
          };
        }[];
      } | {
        kind: "choices";
        choices: {
          label: string;
          event_id: string;
        }[];
      } | {
        kind: "handover";
        messages: {
          content: {
            html?: string | null;
            text?: string | null;
            attachments?: {
              content_type: string;
              url: string;
            }[] | null;
          };
          author: {
            kind: "shopper" | "bot";
          };
        }[];
        ticket_tags?: string[] | null;
        ticket_assignee_user_id?: null | number;
        ticket_assignee_team_id?: null | number;
        not_automatable?: boolean | null;
        shopper_email?: string | null;
      } | {
        kind: "text-input";
        content?: {
          text: string;
        } | null;
      } | {
        kind: "attachments-input";
        attachments?: {
          content_type: string;
          url: string;
        }[] | null;
      } | {
        kind: "shopper-authentication";
      } | {
        kind: "shopper-authentication-success";
        access_token: string;
      } | {
        kind: "order-selection";
        orders: {
          name: string;
          external_id?: string | null;
          shopper_external_id?: string | null;
          number?: string | null;
          currency: {
            code: string;
            decimals: number;
          };
          discount_amount?: number | null;
          subtotal_amount?: number | null;
          shipping_amount?: number | null;
          tax_amount?: number | null;
          cancelled_datetime?: string | null; // date-time
          created_datetime: string; // date-time
          external_status?: string | null;
          external_fulfillment_status?: string | null;
          billing_address?: {
            line_1: string | null;
            line_2: string | null;
            city: string | null;
            country: string | null;
            state: string | null;
            zip_code: string | null;
            first_name: string | null;
            last_name: string | null;
            phone_number: string | null;
          } | null;
          shipping_address?: {
            line_1: string | null;
            line_2: string | null;
            city: string | null;
            country: string | null;
            state: string | null;
            zip_code: string | null;
            first_name: string | null;
            last_name: string | null;
            phone_number: string | null;
          } | null;
          external_payment_status?: string | null;
          total_amount: number;
          tracking_url?: string | null;
          shipping_datetime?: string | null; // date-time
          tracking_number?: string | null;
          status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
          line_items: {
            name: string;
            total_amount: number;
            quantity: number;
            external_id?: string | null;
            external_product_id?: string | null;
            product?: {
              external_id: string;
              images: string[];
              name?: string | null;
              external_type?: string | null;
              variants?: {
                external_id: string;
                external_gid?: string | null;
                quantity?: number | null;
                name?: string | null;
              }[] | null;
            } | null;
          }[];
          fulfillments?: {
            status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
            external_shipment_status?: string | null;
            updated_datetime?: string | null; // date-time
          }[] | null;
          shipping_lines?: {
            external_method_id?: string | null;
            method_name?: string | null;
          }[] | null;
          tags_stringified?: string | null;
          note?: string | null;
        }[];
        message?: {
          html: string;
          text: string;
        } | null;
      } | {
        kind: "order-line-item-selection";
        order: {
          name: string;
          external_id?: string | null;
          shopper_external_id?: string | null;
          number?: string | null;
          currency: {
            code: string;
            decimals: number;
          };
          discount_amount?: number | null;
          subtotal_amount?: number | null;
          shipping_amount?: number | null;
          tax_amount?: number | null;
          cancelled_datetime?: string | null; // date-time
          created_datetime: string; // date-time
          external_status?: string | null;
          external_fulfillment_status?: string | null;
          billing_address?: {
            line_1: string | null;
            line_2: string | null;
            city: string | null;
            country: string | null;
            state: string | null;
            zip_code: string | null;
            first_name: string | null;
            last_name: string | null;
            phone_number: string | null;
          } | null;
          shipping_address?: {
            line_1: string | null;
            line_2: string | null;
            city: string | null;
            country: string | null;
            state: string | null;
            zip_code: string | null;
            first_name: string | null;
            last_name: string | null;
            phone_number: string | null;
          } | null;
          external_payment_status?: string | null;
          total_amount: number;
          tracking_url?: string | null;
          shipping_datetime?: string | null; // date-time
          tracking_number?: string | null;
          status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
          line_items: {
            name: string;
            total_amount: number;
            quantity: number;
            external_id?: string | null;
            external_product_id?: string | null;
            product?: {
              external_id: string;
              images: string[];
              name?: string | null;
              external_type?: string | null;
              variants?: {
                external_id: string;
                external_gid?: string | null;
                quantity?: number | null;
                name?: string | null;
              }[] | null;
            } | null;
          }[];
          fulfillments?: {
            status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
            external_shipment_status?: string | null;
            updated_datetime?: string | null; // date-time
          }[] | null;
          shipping_lines?: {
            external_method_id?: string | null;
            method_name?: string | null;
          }[] | null;
          tags_stringified?: string | null;
          note?: string | null;
        };
        message?: {
          html: string;
          text: string;
        } | null;
      })[];
      done?: boolean | null;
      can_go_back?: boolean | null;
      can_go_next?: boolean | null;
      needs_auth?: boolean | null;
    } | {
      execution_id: string;
      trigger: "llm-prompt";
      entrypoint: {
        requires_confirmation: boolean;
        instructions: string;
        configuration_name: string;
        configuration_template_slug: string | null;
        trigger: {
          custom_inputs: {
            [name: string]: {
              name: string;
              instructions: string;
              data_type: "string" | "number" | "date" | "boolean";
            };
          };
          object_inputs: {
            customer_id?: {
              instructions: string;
              data_type: "number";
            };
            customer_email?: {
              instructions: string;
              data_type: "string";
            };
            customer_phone_number?: {
              instructions: string;
              data_type: "string";
            };
            order_external_id?: {
              instructions: string;
              data_type: "string";
            };
            order_name?: {
              instructions: string;
              data_type: "string";
            };
            order_number?: {
              instructions: string;
              data_type: "string";
            };
            products?: {
              [name: string]: {
                name: string;
                instructions: string;
                inputs: {
                  product_id: {
                    instructions: string;
                    data_type: "string";
                  };
                  product_variant_id: {
                    instructions: string;
                    data_type: "string";
                  };
                };
              };
            };
          };
        };
      };
      channel_actions: ({
        kind: "messages";
        messages: {
          content: {
            html: string;
            text: string;
          };
          author: {
            kind: "shopper" | "bot";
          };
        }[];
      } | {
        kind: "choices";
        choices: {
          label: string;
          event_id: string;
        }[];
      } | {
        kind: "handover";
        messages: {
          content: {
            html?: string | null;
            text?: string | null;
            attachments?: {
              content_type: string;
              url: string;
            }[] | null;
          };
          author: {
            kind: "shopper" | "bot";
          };
        }[];
        ticket_tags?: string[] | null;
        ticket_assignee_user_id?: null | number;
        ticket_assignee_team_id?: null | number;
        not_automatable?: boolean | null;
        shopper_email?: string | null;
      } | {
        kind: "text-input";
        content?: {
          text: string;
        } | null;
      } | {
        kind: "attachments-input";
        attachments?: {
          content_type: string;
          url: string;
        }[] | null;
      } | {
        kind: "shopper-authentication";
      } | {
        kind: "shopper-authentication-success";
        access_token: string;
      } | {
        kind: "order-selection";
        orders: {
          name: string;
          external_id?: string | null;
          shopper_external_id?: string | null;
          number?: string | null;
          currency: {
            code: string;
            decimals: number;
          };
          discount_amount?: number | null;
          subtotal_amount?: number | null;
          shipping_amount?: number | null;
          tax_amount?: number | null;
          cancelled_datetime?: string | null; // date-time
          created_datetime: string; // date-time
          external_status?: string | null;
          external_fulfillment_status?: string | null;
          billing_address?: {
            line_1: string | null;
            line_2: string | null;
            city: string | null;
            country: string | null;
            state: string | null;
            zip_code: string | null;
            first_name: string | null;
            last_name: string | null;
            phone_number: string | null;
          } | null;
          shipping_address?: {
            line_1: string | null;
            line_2: string | null;
            city: string | null;
            country: string | null;
            state: string | null;
            zip_code: string | null;
            first_name: string | null;
            last_name: string | null;
            phone_number: string | null;
          } | null;
          external_payment_status?: string | null;
          total_amount: number;
          tracking_url?: string | null;
          shipping_datetime?: string | null; // date-time
          tracking_number?: string | null;
          status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
          line_items: {
            name: string;
            total_amount: number;
            quantity: number;
            external_id?: string | null;
            external_product_id?: string | null;
            product?: {
              external_id: string;
              images: string[];
              name?: string | null;
              external_type?: string | null;
              variants?: {
                external_id: string;
                external_gid?: string | null;
                quantity?: number | null;
                name?: string | null;
              }[] | null;
            } | null;
          }[];
          fulfillments?: {
            status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
            external_shipment_status?: string | null;
            updated_datetime?: string | null; // date-time
          }[] | null;
          shipping_lines?: {
            external_method_id?: string | null;
            method_name?: string | null;
          }[] | null;
          tags_stringified?: string | null;
          note?: string | null;
        }[];
        message?: {
          html: string;
          text: string;
        } | null;
      } | {
        kind: "order-line-item-selection";
        order: {
          name: string;
          external_id?: string | null;
          shopper_external_id?: string | null;
          number?: string | null;
          currency: {
            code: string;
            decimals: number;
          };
          discount_amount?: number | null;
          subtotal_amount?: number | null;
          shipping_amount?: number | null;
          tax_amount?: number | null;
          cancelled_datetime?: string | null; // date-time
          created_datetime: string; // date-time
          external_status?: string | null;
          external_fulfillment_status?: string | null;
          billing_address?: {
            line_1: string | null;
            line_2: string | null;
            city: string | null;
            country: string | null;
            state: string | null;
            zip_code: string | null;
            first_name: string | null;
            last_name: string | null;
            phone_number: string | null;
          } | null;
          shipping_address?: {
            line_1: string | null;
            line_2: string | null;
            city: string | null;
            country: string | null;
            state: string | null;
            zip_code: string | null;
            first_name: string | null;
            last_name: string | null;
            phone_number: string | null;
          } | null;
          external_payment_status?: string | null;
          total_amount: number;
          tracking_url?: string | null;
          shipping_datetime?: string | null; // date-time
          tracking_number?: string | null;
          status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
          line_items: {
            name: string;
            total_amount: number;
            quantity: number;
            external_id?: string | null;
            external_product_id?: string | null;
            product?: {
              external_id: string;
              images: string[];
              name?: string | null;
              external_type?: string | null;
              variants?: {
                external_id: string;
                external_gid?: string | null;
                quantity?: number | null;
                name?: string | null;
              }[] | null;
            } | null;
          }[];
          fulfillments?: {
            status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
            external_shipment_status?: string | null;
            updated_datetime?: string | null; // date-time
          }[] | null;
          shipping_lines?: {
            external_method_id?: string | null;
            method_name?: string | null;
          }[] | null;
          tags_stringified?: string | null;
          note?: string | null;
        };
        message?: {
          html: string;
          text: string;
        } | null;
      })[];
      done?: boolean | null;
      success?: boolean | null;
      state: {
        steps_state?: {
          [name: string]: {
            kind: "choices";
            selected_choice: {
              event_id: string;
              label: string;
            };
            at: string; // date-time
          } | {
            kind: "text-input";
            content: {
              text: string;
            };
            at: string; // date-time
          } | {
            kind: "attachments-input";
            attachments?: {
              content_type: string;
              url: string;
            }[] | null;
            at: string; // date-time
          } | {
            kind: "shopper-authentication";
            customer: {
              id: number;
              email?: string | null;
              firstname?: string | null;
              lastname?: string | null;
              name?: string | null;
              phone_number?: string | null;
              orders: {
                name: string;
                external_id?: string | null;
                shopper_external_id?: string | null;
                number?: string | null;
                currency: {
                  code: string;
                  decimals: number;
                };
                discount_amount?: number | null;
                subtotal_amount?: number | null;
                shipping_amount?: number | null;
                tax_amount?: number | null;
                cancelled_datetime?: string | null; // date-time
                created_datetime: string; // date-time
                external_status?: string | null;
                external_fulfillment_status?: string | null;
                billing_address?: {
                  line_1: string | null;
                  line_2: string | null;
                  city: string | null;
                  country: string | null;
                  state: string | null;
                  zip_code: string | null;
                  first_name: string | null;
                  last_name: string | null;
                  phone_number: string | null;
                } | null;
                shipping_address?: {
                  line_1: string | null;
                  line_2: string | null;
                  city: string | null;
                  country: string | null;
                  state: string | null;
                  zip_code: string | null;
                  first_name: string | null;
                  last_name: string | null;
                  phone_number: string | null;
                } | null;
                external_payment_status?: string | null;
                total_amount: number;
                tracking_url?: string | null;
                shipping_datetime?: string | null; // date-time
                tracking_number?: string | null;
                status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
                line_items: {
                  name: string;
                  total_amount: number;
                  quantity: number;
                  external_id?: string | null;
                  external_product_id?: string | null;
                  product?: {
                    external_id: string;
                    images: string[];
                    name?: string | null;
                    external_type?: string | null;
                    variants?: {
                      external_id: string;
                      external_gid?: string | null;
                      quantity?: number | null;
                      name?: string | null;
                    }[] | null;
                  } | null;
                }[];
                fulfillments?: {
                  status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
                  external_shipment_status?: string | null;
                  updated_datetime?: string | null; // date-time
                }[] | null;
                shipping_lines?: {
                  external_method_id?: string | null;
                  method_name?: string | null;
                }[] | null;
                tags_stringified?: string | null;
                note?: string | null;
              }[];
              tags_stringified?: string | null;
            };
            at: string; // date-time
          } | {
            kind: "order-selection";
            order: {
              name: string;
              external_id?: string | null;
              shopper_external_id?: string | null;
              number?: string | null;
              currency: {
                code: string;
                decimals: number;
              };
              discount_amount?: number | null;
              subtotal_amount?: number | null;
              shipping_amount?: number | null;
              tax_amount?: number | null;
              cancelled_datetime?: string | null; // date-time
              created_datetime: string; // date-time
              external_status?: string | null;
              external_fulfillment_status?: string | null;
              billing_address?: {
                line_1: string | null;
                line_2: string | null;
                city: string | null;
                country: string | null;
                state: string | null;
                zip_code: string | null;
                first_name: string | null;
                last_name: string | null;
                phone_number: string | null;
              } | null;
              shipping_address?: {
                line_1: string | null;
                line_2: string | null;
                city: string | null;
                country: string | null;
                state: string | null;
                zip_code: string | null;
                first_name: string | null;
                last_name: string | null;
                phone_number: string | null;
              } | null;
              external_payment_status?: string | null;
              total_amount: number;
              tracking_url?: string | null;
              shipping_datetime?: string | null; // date-time
              tracking_number?: string | null;
              status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
              line_items: {
                name: string;
                total_amount: number;
                quantity: number;
                external_id?: string | null;
                external_product_id?: string | null;
                product?: {
                  external_id: string;
                  images: string[];
                  name?: string | null;
                  external_type?: string | null;
                  variants?: {
                    external_id: string;
                    external_gid?: string | null;
                    quantity?: number | null;
                    name?: string | null;
                  }[] | null;
                } | null;
              }[];
              fulfillments?: {
                status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
                external_shipment_status?: string | null;
                updated_datetime?: string | null; // date-time
              }[] | null;
              shipping_lines?: {
                external_method_id?: string | null;
                method_name?: string | null;
              }[] | null;
              tags_stringified?: string | null;
              note?: string | null;
            };
            at: string; // date-time
          } | {
            kind: "workflow_call";
            steps_state?: {
              [name: string]: {
                kind: "choices";
                selected_choice: {
                  event_id: string;
                  label: string;
                };
                at: string; // date-time
              } | {
                kind: "text-input";
                content: {
                  text: string;
                };
                at: string; // date-time
              } | {
                kind: "attachments-input";
                attachments?: {
                  content_type: string;
                  url: string;
                }[] | null;
                at: string; // date-time
              } | {
                kind: "shopper-authentication";
                customer: {
                  id: number;
                  email?: string | null;
                  firstname?: string | null;
                  lastname?: string | null;
                  name?: string | null;
                  phone_number?: string | null;
                  orders: {
                    name: string;
                    external_id?: string | null;
                    shopper_external_id?: string | null;
                    number?: string | null;
                    currency: {
                      code: string;
                      decimals: number;
                    };
                    discount_amount?: number | null;
                    subtotal_amount?: number | null;
                    shipping_amount?: number | null;
                    tax_amount?: number | null;
                    cancelled_datetime?: string | null; // date-time
                    created_datetime: string; // date-time
                    external_status?: string | null;
                    external_fulfillment_status?: string | null;
                    billing_address?: {
                      line_1: string | null;
                      line_2: string | null;
                      city: string | null;
                      country: string | null;
                      state: string | null;
                      zip_code: string | null;
                      first_name: string | null;
                      last_name: string | null;
                      phone_number: string | null;
                    } | null;
                    shipping_address?: {
                      line_1: string | null;
                      line_2: string | null;
                      city: string | null;
                      country: string | null;
                      state: string | null;
                      zip_code: string | null;
                      first_name: string | null;
                      last_name: string | null;
                      phone_number: string | null;
                    } | null;
                    external_payment_status?: string | null;
                    total_amount: number;
                    tracking_url?: string | null;
                    shipping_datetime?: string | null; // date-time
                    tracking_number?: string | null;
                    status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
                    line_items: {
                      name: string;
                      total_amount: number;
                      quantity: number;
                      external_id?: string | null;
                      external_product_id?: string | null;
                      product?: {
                        external_id: string;
                        images: string[];
                        name?: string | null;
                        external_type?: string | null;
                        variants?: {
                          external_id: string;
                          external_gid?: string | null;
                          quantity?: number | null;
                          name?: string | null;
                        }[] | null;
                      } | null;
                    }[];
                    fulfillments?: {
                      status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
                      external_shipment_status?: string | null;
                      updated_datetime?: string | null; // date-time
                    }[] | null;
                    shipping_lines?: {
                      external_method_id?: string | null;
                      method_name?: string | null;
                    }[] | null;
                    tags_stringified?: string | null;
                    note?: string | null;
                  }[];
                  tags_stringified?: string | null;
                };
                at: string; // date-time
              } | {
                kind: "order-selection";
                order: {
                  name: string;
                  external_id?: string | null;
                  shopper_external_id?: string | null;
                  number?: string | null;
                  currency: {
                    code: string;
                    decimals: number;
                  };
                  discount_amount?: number | null;
                  subtotal_amount?: number | null;
                  shipping_amount?: number | null;
                  tax_amount?: number | null;
                  cancelled_datetime?: string | null; // date-time
                  created_datetime: string; // date-time
                  external_status?: string | null;
                  external_fulfillment_status?: string | null;
                  billing_address?: {
                    line_1: string | null;
                    line_2: string | null;
                    city: string | null;
                    country: string | null;
                    state: string | null;
                    zip_code: string | null;
                    first_name: string | null;
                    last_name: string | null;
                    phone_number: string | null;
                  } | null;
                  shipping_address?: {
                    line_1: string | null;
                    line_2: string | null;
                    city: string | null;
                    country: string | null;
                    state: string | null;
                    zip_code: string | null;
                    first_name: string | null;
                    last_name: string | null;
                    phone_number: string | null;
                  } | null;
                  external_payment_status?: string | null;
                  total_amount: number;
                  tracking_url?: string | null;
                  shipping_datetime?: string | null; // date-time
                  tracking_number?: string | null;
                  status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
                  line_items: {
                    name: string;
                    total_amount: number;
                    quantity: number;
                    external_id?: string | null;
                    external_product_id?: string | null;
                    product?: {
                      external_id: string;
                      images: string[];
                      name?: string | null;
                      external_type?: string | null;
                      variants?: {
                        external_id: string;
                        external_gid?: string | null;
                        quantity?: number | null;
                        name?: string | null;
                      }[] | null;
                    } | null;
                  }[];
                  fulfillments?: {
                    status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
                    external_shipment_status?: string | null;
                    updated_datetime?: string | null; // date-time
                  }[] | null;
                  shipping_lines?: {
                    external_method_id?: string | null;
                    method_name?: string | null;
                  }[] | null;
                  tags_stringified?: string | null;
                  note?: string | null;
                };
                at: string; // date-time
              } | {
                kind: "http-request";
                status_code: number;
                success: boolean;
                content?: ({
                  [name: string]: number | boolean | string /* date-time */  | string | any;
                } | null) | any;
                at: string; // date-time
              } | {
                kind: "cancel-order";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "refund-order";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "update-shipping-address";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "cancel-subscription";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "skip-charge";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "remove-item";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "replace-item";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "create-discount-code";
                discount_code?: string | null;
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "reship-for-free";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "refund-shipping-costs";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "end";
                success: boolean;
                at: string; // date-time
              };
            } | null;
            at: string; // date-time
          } | {
            kind: "http-request";
            status_code: number;
            success: boolean;
            content?: ({
              [name: string]: number | boolean | string /* date-time */  | string | any;
            } | null) | any;
            at: string; // date-time
          } | {
            kind: "cancel-order";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "refund-order";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "update-shipping-address";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "cancel-subscription";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "skip-charge";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "remove-item";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "replace-item";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "create-discount-code";
            discount_code?: string | null;
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "reship-for-free";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "refund-shipping-costs";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "end";
            success: boolean;
            at: string; // date-time
          };
        } | null;
        store?: {
          type: "shopify";
          name: string;
          helpdesk_integration_id: number;
        } | null;
        preview_mode?: boolean | null;
        trigger: "llm-prompt";
        entrypoint?: "llm-conversation";
        objects?: {
          customer?: {
            id: number;
            email?: string | null;
            firstname?: string | null;
            lastname?: string | null;
            name?: string | null;
            phone_number?: string | null;
            orders: {
              name: string;
              external_id?: string | null;
              shopper_external_id?: string | null;
              number?: string | null;
              currency: {
                code: string;
                decimals: number;
              };
              discount_amount?: number | null;
              subtotal_amount?: number | null;
              shipping_amount?: number | null;
              tax_amount?: number | null;
              cancelled_datetime?: string | null; // date-time
              created_datetime: string; // date-time
              external_status?: string | null;
              external_fulfillment_status?: string | null;
              billing_address?: {
                line_1: string | null;
                line_2: string | null;
                city: string | null;
                country: string | null;
                state: string | null;
                zip_code: string | null;
                first_name: string | null;
                last_name: string | null;
                phone_number: string | null;
              } | null;
              shipping_address?: {
                line_1: string | null;
                line_2: string | null;
                city: string | null;
                country: string | null;
                state: string | null;
                zip_code: string | null;
                first_name: string | null;
                last_name: string | null;
                phone_number: string | null;
              } | null;
              external_payment_status?: string | null;
              total_amount: number;
              tracking_url?: string | null;
              shipping_datetime?: string | null; // date-time
              tracking_number?: string | null;
              status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
              line_items: {
                name: string;
                total_amount: number;
                quantity: number;
                external_id?: string | null;
                external_product_id?: string | null;
                product?: {
                  external_id: string;
                  images: string[];
                  name?: string | null;
                  external_type?: string | null;
                  variants?: {
                    external_id: string;
                    external_gid?: string | null;
                    quantity?: number | null;
                    name?: string | null;
                  }[] | null;
                } | null;
              }[];
              fulfillments?: {
                status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
                external_shipment_status?: string | null;
                updated_datetime?: string | null; // date-time
              }[] | null;
              shipping_lines?: {
                external_method_id?: string | null;
                method_name?: string | null;
              }[] | null;
              tags_stringified?: string | null;
              note?: string | null;
            }[];
            tags_stringified?: string | null;
          } | null;
          order?: {
            name: string;
            external_id?: string | null;
            shopper_external_id?: string | null;
            number?: string | null;
            currency: {
              code: string;
              decimals: number;
            };
            discount_amount?: number | null;
            subtotal_amount?: number | null;
            shipping_amount?: number | null;
            tax_amount?: number | null;
            cancelled_datetime?: string | null; // date-time
            created_datetime: string; // date-time
            external_status?: string | null;
            external_fulfillment_status?: string | null;
            billing_address?: {
              line_1: string | null;
              line_2: string | null;
              city: string | null;
              country: string | null;
              state: string | null;
              zip_code: string | null;
              first_name: string | null;
              last_name: string | null;
              phone_number: string | null;
            } | null;
            shipping_address?: {
              line_1: string | null;
              line_2: string | null;
              city: string | null;
              country: string | null;
              state: string | null;
              zip_code: string | null;
              first_name: string | null;
              last_name: string | null;
              phone_number: string | null;
            } | null;
            external_payment_status?: string | null;
            total_amount: number;
            tracking_url?: string | null;
            shipping_datetime?: string | null; // date-time
            tracking_number?: string | null;
            status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
            line_items: {
              name: string;
              total_amount: number;
              quantity: number;
              external_id?: string | null;
              external_product_id?: string | null;
              product?: {
                external_id: string;
                images: string[];
                name?: string | null;
                external_type?: string | null;
                variants?: {
                  external_id: string;
                  external_gid?: string | null;
                  quantity?: number | null;
                  name?: string | null;
                }[] | null;
              } | null;
            }[];
            fulfillments?: {
              status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
              external_shipment_status?: string | null;
              updated_datetime?: string | null; // date-time
            }[] | null;
            shipping_lines?: {
              external_method_id?: string | null;
              method_name?: string | null;
            }[] | null;
            tags_stringified?: string | null;
            note?: string | null;
          } | null;
          products?: {
            [name: string]: {
              external_id: string;
              images: string[];
              name?: string | null;
              external_type?: string | null;
              variants?: {
                external_id: string;
                external_gid?: string | null;
                quantity?: number | null;
                name?: string | null;
              }[] | null;
              selected_variant?: {
                external_id: string;
                external_gid?: string | null;
                quantity?: number | null;
                name?: string | null;
              } | null;
            };
          } | null;
        } | null;
        custom_inputs?: {
          [name: string]: number | boolean | string /* date-time */  | string;
        } | null;
        values?: {
          [name: string]: number | boolean | string /* date-time */  | string;
        } | null;
        user_journey_id?: string | null;
        channel?: "email";
        callback_url?: string | null;
      };
      outputs: {
        [name: string]: {
          description: string;
          value?: any;
        };
      };
    };
    export type TestWfExecutionRequestDto = {
      configuration_id: string;
      preview_mode?: boolean | null;
      trigger: "llm-prompt";
      entrypoint?: "llm-conversation";
      custom_inputs?: {
        [name: string]: string;
      } | null;
      object_inputs?: {
        customer_id?: string | null;
        customer_email?: string | null;
        customer_phone_number?: string | null;
        order_external_id?: string | null;
        order_name?: string | null;
        order_number?: string | null;
        products?: {
          [name: string]: {
            product_id?: string | null;
            product_variant_id?: string | null;
          };
        } | null;
      } | null;
      user_journey_id?: string | null;
      callback_url?: string | null; // uri
      channel?: "email";
    };
    export type TestWfExecutionResponseDto = {
      trigger: "llm-prompt";
      triggerable: boolean;
      entrypoint?: {
        requires_confirmation: boolean;
        instructions: string;
        configuration_name: string;
        configuration_template_slug: string | null;
        trigger: {
          custom_inputs: {
            [name: string]: {
              name: string;
              instructions: string;
              data_type: "string" | "number" | "date" | "boolean";
            };
          };
          object_inputs: {
            customer_id?: {
              instructions: string;
              data_type: "number";
            };
            customer_email?: {
              instructions: string;
              data_type: "string";
            };
            customer_phone_number?: {
              instructions: string;
              data_type: "string";
            };
            order_external_id?: {
              instructions: string;
              data_type: "string";
            };
            order_name?: {
              instructions: string;
              data_type: "string";
            };
            order_number?: {
              instructions: string;
              data_type: "string";
            };
            products?: {
              [name: string]: {
                name: string;
                instructions: string;
                inputs: {
                  product_id: {
                    instructions: string;
                    data_type: "string";
                  };
                  product_variant_id: {
                    instructions: string;
                    data_type: "string";
                  };
                };
              };
            };
          };
        };
      } | null;
      errors?: {
        code: string;
        message: string;
        path: string[];
      }[] | null;
      state?: {
        steps_state?: {
          [name: string]: {
            kind: "choices";
            selected_choice: {
              event_id: string;
              label: string;
            };
            at: string; // date-time
          } | {
            kind: "text-input";
            content: {
              text: string;
            };
            at: string; // date-time
          } | {
            kind: "attachments-input";
            attachments?: {
              content_type: string;
              url: string;
            }[] | null;
            at: string; // date-time
          } | {
            kind: "shopper-authentication";
            customer: {
              id: number;
              email?: string | null;
              firstname?: string | null;
              lastname?: string | null;
              name?: string | null;
              phone_number?: string | null;
              orders: {
                name: string;
                external_id?: string | null;
                shopper_external_id?: string | null;
                number?: string | null;
                currency: {
                  code: string;
                  decimals: number;
                };
                discount_amount?: number | null;
                subtotal_amount?: number | null;
                shipping_amount?: number | null;
                tax_amount?: number | null;
                cancelled_datetime?: string | null; // date-time
                created_datetime: string; // date-time
                external_status?: string | null;
                external_fulfillment_status?: string | null;
                billing_address?: {
                  line_1: string | null;
                  line_2: string | null;
                  city: string | null;
                  country: string | null;
                  state: string | null;
                  zip_code: string | null;
                  first_name: string | null;
                  last_name: string | null;
                  phone_number: string | null;
                } | null;
                shipping_address?: {
                  line_1: string | null;
                  line_2: string | null;
                  city: string | null;
                  country: string | null;
                  state: string | null;
                  zip_code: string | null;
                  first_name: string | null;
                  last_name: string | null;
                  phone_number: string | null;
                } | null;
                external_payment_status?: string | null;
                total_amount: number;
                tracking_url?: string | null;
                shipping_datetime?: string | null; // date-time
                tracking_number?: string | null;
                status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
                line_items: {
                  name: string;
                  total_amount: number;
                  quantity: number;
                  external_id?: string | null;
                  external_product_id?: string | null;
                  product?: {
                    external_id: string;
                    images: string[];
                    name?: string | null;
                    external_type?: string | null;
                    variants?: {
                      external_id: string;
                      external_gid?: string | null;
                      quantity?: number | null;
                      name?: string | null;
                    }[] | null;
                  } | null;
                }[];
                fulfillments?: {
                  status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
                  external_shipment_status?: string | null;
                  updated_datetime?: string | null; // date-time
                }[] | null;
                shipping_lines?: {
                  external_method_id?: string | null;
                  method_name?: string | null;
                }[] | null;
                tags_stringified?: string | null;
                note?: string | null;
              }[];
              tags_stringified?: string | null;
            };
            at: string; // date-time
          } | {
            kind: "order-selection";
            order: {
              name: string;
              external_id?: string | null;
              shopper_external_id?: string | null;
              number?: string | null;
              currency: {
                code: string;
                decimals: number;
              };
              discount_amount?: number | null;
              subtotal_amount?: number | null;
              shipping_amount?: number | null;
              tax_amount?: number | null;
              cancelled_datetime?: string | null; // date-time
              created_datetime: string; // date-time
              external_status?: string | null;
              external_fulfillment_status?: string | null;
              billing_address?: {
                line_1: string | null;
                line_2: string | null;
                city: string | null;
                country: string | null;
                state: string | null;
                zip_code: string | null;
                first_name: string | null;
                last_name: string | null;
                phone_number: string | null;
              } | null;
              shipping_address?: {
                line_1: string | null;
                line_2: string | null;
                city: string | null;
                country: string | null;
                state: string | null;
                zip_code: string | null;
                first_name: string | null;
                last_name: string | null;
                phone_number: string | null;
              } | null;
              external_payment_status?: string | null;
              total_amount: number;
              tracking_url?: string | null;
              shipping_datetime?: string | null; // date-time
              tracking_number?: string | null;
              status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
              line_items: {
                name: string;
                total_amount: number;
                quantity: number;
                external_id?: string | null;
                external_product_id?: string | null;
                product?: {
                  external_id: string;
                  images: string[];
                  name?: string | null;
                  external_type?: string | null;
                  variants?: {
                    external_id: string;
                    external_gid?: string | null;
                    quantity?: number | null;
                    name?: string | null;
                  }[] | null;
                } | null;
              }[];
              fulfillments?: {
                status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
                external_shipment_status?: string | null;
                updated_datetime?: string | null; // date-time
              }[] | null;
              shipping_lines?: {
                external_method_id?: string | null;
                method_name?: string | null;
              }[] | null;
              tags_stringified?: string | null;
              note?: string | null;
            };
            at: string; // date-time
          } | {
            kind: "workflow_call";
            steps_state?: {
              [name: string]: {
                kind: "choices";
                selected_choice: {
                  event_id: string;
                  label: string;
                };
                at: string; // date-time
              } | {
                kind: "text-input";
                content: {
                  text: string;
                };
                at: string; // date-time
              } | {
                kind: "attachments-input";
                attachments?: {
                  content_type: string;
                  url: string;
                }[] | null;
                at: string; // date-time
              } | {
                kind: "shopper-authentication";
                customer: {
                  id: number;
                  email?: string | null;
                  firstname?: string | null;
                  lastname?: string | null;
                  name?: string | null;
                  phone_number?: string | null;
                  orders: {
                    name: string;
                    external_id?: string | null;
                    shopper_external_id?: string | null;
                    number?: string | null;
                    currency: {
                      code: string;
                      decimals: number;
                    };
                    discount_amount?: number | null;
                    subtotal_amount?: number | null;
                    shipping_amount?: number | null;
                    tax_amount?: number | null;
                    cancelled_datetime?: string | null; // date-time
                    created_datetime: string; // date-time
                    external_status?: string | null;
                    external_fulfillment_status?: string | null;
                    billing_address?: {
                      line_1: string | null;
                      line_2: string | null;
                      city: string | null;
                      country: string | null;
                      state: string | null;
                      zip_code: string | null;
                      first_name: string | null;
                      last_name: string | null;
                      phone_number: string | null;
                    } | null;
                    shipping_address?: {
                      line_1: string | null;
                      line_2: string | null;
                      city: string | null;
                      country: string | null;
                      state: string | null;
                      zip_code: string | null;
                      first_name: string | null;
                      last_name: string | null;
                      phone_number: string | null;
                    } | null;
                    external_payment_status?: string | null;
                    total_amount: number;
                    tracking_url?: string | null;
                    shipping_datetime?: string | null; // date-time
                    tracking_number?: string | null;
                    status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
                    line_items: {
                      name: string;
                      total_amount: number;
                      quantity: number;
                      external_id?: string | null;
                      external_product_id?: string | null;
                      product?: {
                        external_id: string;
                        images: string[];
                        name?: string | null;
                        external_type?: string | null;
                        variants?: {
                          external_id: string;
                          external_gid?: string | null;
                          quantity?: number | null;
                          name?: string | null;
                        }[] | null;
                      } | null;
                    }[];
                    fulfillments?: {
                      status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
                      external_shipment_status?: string | null;
                      updated_datetime?: string | null; // date-time
                    }[] | null;
                    shipping_lines?: {
                      external_method_id?: string | null;
                      method_name?: string | null;
                    }[] | null;
                    tags_stringified?: string | null;
                    note?: string | null;
                  }[];
                  tags_stringified?: string | null;
                };
                at: string; // date-time
              } | {
                kind: "order-selection";
                order: {
                  name: string;
                  external_id?: string | null;
                  shopper_external_id?: string | null;
                  number?: string | null;
                  currency: {
                    code: string;
                    decimals: number;
                  };
                  discount_amount?: number | null;
                  subtotal_amount?: number | null;
                  shipping_amount?: number | null;
                  tax_amount?: number | null;
                  cancelled_datetime?: string | null; // date-time
                  created_datetime: string; // date-time
                  external_status?: string | null;
                  external_fulfillment_status?: string | null;
                  billing_address?: {
                    line_1: string | null;
                    line_2: string | null;
                    city: string | null;
                    country: string | null;
                    state: string | null;
                    zip_code: string | null;
                    first_name: string | null;
                    last_name: string | null;
                    phone_number: string | null;
                  } | null;
                  shipping_address?: {
                    line_1: string | null;
                    line_2: string | null;
                    city: string | null;
                    country: string | null;
                    state: string | null;
                    zip_code: string | null;
                    first_name: string | null;
                    last_name: string | null;
                    phone_number: string | null;
                  } | null;
                  external_payment_status?: string | null;
                  total_amount: number;
                  tracking_url?: string | null;
                  shipping_datetime?: string | null; // date-time
                  tracking_number?: string | null;
                  status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
                  line_items: {
                    name: string;
                    total_amount: number;
                    quantity: number;
                    external_id?: string | null;
                    external_product_id?: string | null;
                    product?: {
                      external_id: string;
                      images: string[];
                      name?: string | null;
                      external_type?: string | null;
                      variants?: {
                        external_id: string;
                        external_gid?: string | null;
                        quantity?: number | null;
                        name?: string | null;
                      }[] | null;
                    } | null;
                  }[];
                  fulfillments?: {
                    status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
                    external_shipment_status?: string | null;
                    updated_datetime?: string | null; // date-time
                  }[] | null;
                  shipping_lines?: {
                    external_method_id?: string | null;
                    method_name?: string | null;
                  }[] | null;
                  tags_stringified?: string | null;
                  note?: string | null;
                };
                at: string; // date-time
              } | {
                kind: "http-request";
                status_code: number;
                success: boolean;
                content?: ({
                  [name: string]: number | boolean | string /* date-time */  | string | any;
                } | null) | any;
                at: string; // date-time
              } | {
                kind: "cancel-order";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "refund-order";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "update-shipping-address";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "cancel-subscription";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "skip-charge";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "remove-item";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "replace-item";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "create-discount-code";
                discount_code?: string | null;
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "reship-for-free";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "refund-shipping-costs";
                success: boolean;
                error?: {
                  [name: string]: any;
                } | {
                  message: string;
                }[];
                at: string; // date-time
              } | {
                kind: "end";
                success: boolean;
                at: string; // date-time
              };
            } | null;
            at: string; // date-time
          } | {
            kind: "http-request";
            status_code: number;
            success: boolean;
            content?: ({
              [name: string]: number | boolean | string /* date-time */  | string | any;
            } | null) | any;
            at: string; // date-time
          } | {
            kind: "cancel-order";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "refund-order";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "update-shipping-address";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "cancel-subscription";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "skip-charge";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "remove-item";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "replace-item";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "create-discount-code";
            discount_code?: string | null;
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "reship-for-free";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "refund-shipping-costs";
            success: boolean;
            error?: {
              [name: string]: any;
            } | {
              message: string;
            }[];
            at: string; // date-time
          } | {
            kind: "end";
            success: boolean;
            at: string; // date-time
          };
        } | null;
        store?: {
          type: "shopify";
          name: string;
          helpdesk_integration_id: number;
        } | null;
        preview_mode?: boolean | null;
        trigger: "llm-prompt";
        entrypoint?: "llm-conversation";
        objects?: {
          customer?: {
            id: number;
            email?: string | null;
            firstname?: string | null;
            lastname?: string | null;
            name?: string | null;
            phone_number?: string | null;
            orders: {
              name: string;
              external_id?: string | null;
              shopper_external_id?: string | null;
              number?: string | null;
              currency: {
                code: string;
                decimals: number;
              };
              discount_amount?: number | null;
              subtotal_amount?: number | null;
              shipping_amount?: number | null;
              tax_amount?: number | null;
              cancelled_datetime?: string | null; // date-time
              created_datetime: string; // date-time
              external_status?: string | null;
              external_fulfillment_status?: string | null;
              billing_address?: {
                line_1: string | null;
                line_2: string | null;
                city: string | null;
                country: string | null;
                state: string | null;
                zip_code: string | null;
                first_name: string | null;
                last_name: string | null;
                phone_number: string | null;
              } | null;
              shipping_address?: {
                line_1: string | null;
                line_2: string | null;
                city: string | null;
                country: string | null;
                state: string | null;
                zip_code: string | null;
                first_name: string | null;
                last_name: string | null;
                phone_number: string | null;
              } | null;
              external_payment_status?: string | null;
              total_amount: number;
              tracking_url?: string | null;
              shipping_datetime?: string | null; // date-time
              tracking_number?: string | null;
              status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
              line_items: {
                name: string;
                total_amount: number;
                quantity: number;
                external_id?: string | null;
                external_product_id?: string | null;
                product?: {
                  external_id: string;
                  images: string[];
                  name?: string | null;
                  external_type?: string | null;
                  variants?: {
                    external_id: string;
                    external_gid?: string | null;
                    quantity?: number | null;
                    name?: string | null;
                  }[] | null;
                } | null;
              }[];
              fulfillments?: {
                status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
                external_shipment_status?: string | null;
                updated_datetime?: string | null; // date-time
              }[] | null;
              shipping_lines?: {
                external_method_id?: string | null;
                method_name?: string | null;
              }[] | null;
              tags_stringified?: string | null;
              note?: string | null;
            }[];
            tags_stringified?: string | null;
          } | null;
          order?: {
            name: string;
            external_id?: string | null;
            shopper_external_id?: string | null;
            number?: string | null;
            currency: {
              code: string;
              decimals: number;
            };
            discount_amount?: number | null;
            subtotal_amount?: number | null;
            shipping_amount?: number | null;
            tax_amount?: number | null;
            cancelled_datetime?: string | null; // date-time
            created_datetime: string; // date-time
            external_status?: string | null;
            external_fulfillment_status?: string | null;
            billing_address?: {
              line_1: string | null;
              line_2: string | null;
              city: string | null;
              country: string | null;
              state: string | null;
              zip_code: string | null;
              first_name: string | null;
              last_name: string | null;
              phone_number: string | null;
            } | null;
            shipping_address?: {
              line_1: string | null;
              line_2: string | null;
              city: string | null;
              country: string | null;
              state: string | null;
              zip_code: string | null;
              first_name: string | null;
              last_name: string | null;
              phone_number: string | null;
            } | null;
            external_payment_status?: string | null;
            total_amount: number;
            tracking_url?: string | null;
            shipping_datetime?: string | null; // date-time
            tracking_number?: string | null;
            status?: "partially_fulfilled" | "completed" | "canceled" | "on_hold" | "awaiting_fulfillment" | "awaiting_payment" | "scheduled" | "order_pending";
            line_items: {
              name: string;
              total_amount: number;
              quantity: number;
              external_id?: string | null;
              external_product_id?: string | null;
              product?: {
                external_id: string;
                images: string[];
                name?: string | null;
                external_type?: string | null;
                variants?: {
                  external_id: string;
                  external_gid?: string | null;
                  quantity?: number | null;
                  name?: string | null;
                }[] | null;
              } | null;
            }[];
            fulfillments?: {
              status?: "unfulfilled" | "processing_fulfillment" | "pending_delivery" | "attempted_delivery" | "ready_for_pickup" | "in_transit" | "out_for_delivery" | "delivered" | "failed_delivery" | "failed_fulfillment" | "partially_refunded" | "refunded" | "cancelled" | "shipment_status_unavailable" | "status_unavailable";
              external_shipment_status?: string | null;
              updated_datetime?: string | null; // date-time
            }[] | null;
            shipping_lines?: {
              external_method_id?: string | null;
              method_name?: string | null;
            }[] | null;
            tags_stringified?: string | null;
            note?: string | null;
          } | null;
          products?: {
            [name: string]: {
              external_id: string;
              images: string[];
              name?: string | null;
              external_type?: string | null;
              variants?: {
                external_id: string;
                external_gid?: string | null;
                quantity?: number | null;
                name?: string | null;
              }[] | null;
              selected_variant?: {
                external_id: string;
                external_gid?: string | null;
                quantity?: number | null;
                name?: string | null;
              } | null;
            };
          } | null;
        } | null;
        custom_inputs?: {
          [name: string]: number | boolean | string /* date-time */  | string;
        } | null;
        values?: {
          [name: string]: number | boolean | string /* date-time */  | string;
        } | null;
        user_journey_id?: string | null;
        channel?: "email";
        callback_url?: string | null;
      } | null;
      outputs?: {
        [name: string]: {
          description: string;
          value?: any;
        };
      } | null;
    };
    export interface UpsertAccountOauth2TokenRequestBodyDto {
      id?: string | null;
      refresh_token: string;
    }
    export interface UpsertAccountOauth2TokenRequestResponseBodyDto {
      id: string;
      refresh_token: string;
      account_id: number;
    }
    export interface UpsertAppRequestBodyDto {
      auth_type: "api-key" | "oauth2-token";
      auth_settings: {
        refresh_token_url?: string | null;
        input_label?: string | null;
        instruction_url_text?: string | null;
        url?: string | null;
      };
    }
    export type UpsertAppRequestResponseDto = {
      id: string;
      auth_type: "api-key" | "oauth2-token";
      auth_settings: {
        refresh_token_url?: string | null;
        input_label?: string | null;
        instruction_url_text?: string | null;
        url?: string | null;
      };
    };
    export interface UpsertStoreAppRequestBodyDto {
      integration_id: number;
    }
    export interface UpsertStoreAppResponseDto {
      store_type: "shopify";
      store_name: string;
      account_id: number;
      integration_id: number;
      type: "recharge";
    }
    export interface UpsertStoreWfConfigurationRequestBodyDto {
      id: string;
      template_internal_id?: string | null;
      name: string;
      description?: string | null;
      short_description?: string | null;
      is_draft: boolean;
      initial_step_id?: string | null;
      entrypoint?: {
        label: string;
        label_tkey: string;
      } | null;
      steps: ({
        id: string;
        kind: "choices";
        settings: {
          choices: {
            event_id: string;
            label: string;
            label_tkey: string;
          }[];
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "handover";
        settings?: {
          ticket_tags?: string[] | null;
          ticket_assignee_user_id?: null | number;
          ticket_assignee_team_id?: null | number;
        } | null;
      } | {
        id: string;
        kind: "workflow_call";
        settings: {
          configuration_id: string;
        };
      } | {
        id: string;
        kind: "text-input";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "attachments-input";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "shopper-authentication";
        settings: {
          integration_id: number;
        };
      } | {
        id: string;
        kind: "order-selection";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "http-request";
        settings: {
          name: string;
          url: string /* uri */  | ("");
          method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
          headers?: {
            [name: string]: string;
          } | null;
          body?: string | null;
          oauth2_token_settings?: {
            account_oauth2_token_id: string;
            refresh_token_url: string;
          } | null;
          variables: {
            id: string;
            name: string;
            jsonpath: string;
            data_type?: "string" | "number" | "date" | "boolean";
          }[];
        };
      } | {
        id: string;
        kind: "helpful-prompt";
        settings?: {
          ticket_tags?: string[] | null;
          ticket_assignee_user_id?: null | number;
          ticket_assignee_team_id?: null | number;
        } | null;
      } | {
        id: string;
        kind: "message";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "end";
        settings?: {
          success: boolean;
        } | null;
      } | {
        id: string;
        kind: "conditions";
        settings: {
          name: string;
        };
      } | {
        id: string;
        kind: "order-line-item-selection";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "cancel-order";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "refund-order";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "update-shipping-address";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          name: string;
          address1: string;
          address2: string;
          city: string;
          zip: string;
          province: string;
          country: string;
          phone: string;
          last_name: string;
          first_name: string;
        };
      } | {
        id: string;
        kind: "cancel-subscription";
        settings: {
          customer_id: string;
          integration_id: string;
          subscription_id: string;
          reason: string;
        };
      } | {
        id: string;
        kind: "skip-charge";
        settings: {
          customer_id: string;
          integration_id: string;
          subscription_id: string;
          charge_id: string;
        };
      } | {
        id: string;
        kind: "remove-item";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          product_variant_id: string;
          quantity: string;
        };
      } | {
        id: string;
        kind: "replace-item";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          product_variant_id: string;
          quantity: string;
          added_product_variant_id: string;
          added_quantity: string;
        };
      } | {
        id: string;
        kind: "create-discount-code";
        settings: {
          customer_id: string;
          integration_id: string;
          type: string;
          amount: string;
          valid_for: string;
        };
      } | {
        id: string;
        kind: "reship-for-free";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "refund-shipping-costs";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "reusable-llm-prompt-call";
        settings: {
          configuration_id: string;
          configuration_internal_id: string;
          objects?: {
            customer?: string | null;
            order?: string | null;
            products?: {
              [name: string]: string;
            } | null;
          } | null;
          custom_inputs?: {
            [name: string]: string;
          } | null;
          values: {
            [name: string]: string | number | boolean;
          };
        };
      })[];
      inputs?: ({
        id: string;
        name: string;
        description: string;
        data_type: "string";
        options?: {
          label: string;
          value: string;
        }[] | null;
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "number";
        options?: {
          label: string;
          value: number;
        }[] | null;
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "boolean";
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "date";
      })[] | null;
      values?: {
        [name: string]: number | boolean | string /* date-time */  | string;
      } | null;
      transitions: {
        id: string;
        from_step_id: string;
        to_step_id: string;
        event?: {
          id: string;
          kind: "choices";
        } | null;
        name?: string | null;
        conditions?: {
          or: ({
            equals: any;
          } | {
            notEqual: any;
          } | {
            contains: any;
          } | {
            doesNotContain: any;
          } | {
            endsWith: any;
          } | {
            startsWith: any;
          } | {
            exists: any;
          } | {
            doesNotExist: any;
          } | {
            lessThan: any;
          } | {
            lessThanInterval: any;
          } | {
            lessOrEqual: any;
          } | {
            greaterThan: any;
          } | {
            greaterThanInterval: any;
          } | {
            greaterOrEqual: any;
          })[];
        } | {
          and: ({
            equals: any;
          } | {
            notEqual: any;
          } | {
            contains: any;
          } | {
            doesNotContain: any;
          } | {
            endsWith: any;
          } | {
            startsWith: any;
          } | {
            exists: any;
          } | {
            doesNotExist: any;
          } | {
            lessThan: any;
          } | {
            lessThanInterval: any;
          } | {
            lessOrEqual: any;
          } | {
            greaterThan: any;
          } | {
            greaterThanInterval: any;
          } | {
            greaterOrEqual: any;
          })[];
        };
      }[];
      available_languages: ("en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR")[];
      triggers: ({
        kind: "llm-prompt";
        settings: {
          custom_inputs: {
            id: string;
            name: string;
            instructions: string;
            data_type: "string" | "number" | "date" | "boolean";
          }[];
          object_inputs: ({
            kind: "customer";
            integration_id: number | string;
          } | {
            kind: "order";
            integration_id: number | string;
          } | {
            kind: "product";
            integration_id: number | string;
            name: string;
            instructions: string;
            id: string;
          })[];
          conditions?: {
            or: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          } | {
            and: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          };
          outputs: {
            id: string;
            description: string;
            path: string;
          }[];
        };
      } | {
        kind: "channel";
        settings: {
        };
      } | {
        kind: "reusable-llm-prompt";
        settings: {
          custom_inputs: {
            id: string;
            name: string;
            instructions: string;
            data_type: "string" | "number" | "date" | "boolean";
          }[];
          object_inputs: ({
            kind: "customer";
          } | {
            kind: "order";
          } | {
            kind: "product";
            name: string;
            instructions: string;
            id: string;
          })[];
          outputs: {
            id: string;
            name: string;
            description: string;
            path: string;
            data_type?: "string" | "number" | "date" | "boolean";
          }[];
        };
      })[];
      entrypoints: ({
        deactivated_datetime?: string | null; // date-time
        kind: "llm-conversation";
        trigger: "llm-prompt";
        settings: {
          requires_confirmation?: boolean | null;
          instructions: string;
        };
      } | {
        deactivated_datetime?: string | null; // date-time
        kind: "reusable-llm-prompt-call-step";
        trigger: "reusable-llm-prompt";
        settings: {
          requires_confirmation: boolean;
          conditions: {
            or: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          } | {
            and: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          };
        };
      })[];
      apps?: ({
        type: "shopify";
      } | {
        type: "recharge";
      } | {
        app_id: string;
        api_key?: string | null;
        account_oauth2_token_id?: string | null;
        type: "app";
        refresh_token?: string | null;
      })[] | null;
    }
    export interface UpsertStoreWfConfigurationResponseDto {
      internal_id: string;
      id: string;
      account_id: number | null;
      template_internal_id?: string | null;
      name: string;
      description?: string | null;
      short_description?: string | null;
      is_draft: boolean;
      initial_step_id?: string | null;
      entrypoint?: {
        label: string;
        label_tkey: string;
      } | null;
      steps: ({
        id: string;
        kind: "choices";
        settings: {
          choices: {
            event_id: string;
            label: string;
            label_tkey: string;
          }[];
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "handover";
        settings?: {
          ticket_tags?: string[] | null;
          ticket_assignee_user_id?: null | number;
          ticket_assignee_team_id?: null | number;
        } | null;
      } | {
        id: string;
        kind: "workflow_call";
        settings: {
          configuration_id: string;
        };
      } | {
        id: string;
        kind: "text-input";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "attachments-input";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "shopper-authentication";
        settings: {
          integration_id: number;
        };
      } | {
        id: string;
        kind: "order-selection";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "http-request";
        settings: {
          name: string;
          url: string /* uri */  | ("");
          method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
          headers?: {
            [name: string]: string;
          } | null;
          body?: string | null;
          oauth2_token_settings?: {
            account_oauth2_token_id: string;
            refresh_token_url: string;
          } | null;
          variables: {
            id: string;
            name: string;
            jsonpath: string;
            data_type?: "string" | "number" | "date" | "boolean";
          }[];
        };
      } | {
        id: string;
        kind: "helpful-prompt";
        settings?: {
          ticket_tags?: string[] | null;
          ticket_assignee_user_id?: null | number;
          ticket_assignee_team_id?: null | number;
        } | null;
      } | {
        id: string;
        kind: "message";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "end";
        settings?: {
          success: boolean;
        } | null;
      } | {
        id: string;
        kind: "conditions";
        settings: {
          name: string;
        };
      } | {
        id: string;
        kind: "order-line-item-selection";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "cancel-order";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "refund-order";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "update-shipping-address";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          name: string;
          address1: string;
          address2: string;
          city: string;
          zip: string;
          province: string;
          country: string;
          phone: string;
          last_name: string;
          first_name: string;
        };
      } | {
        id: string;
        kind: "cancel-subscription";
        settings: {
          customer_id: string;
          integration_id: string;
          subscription_id: string;
          reason: string;
        };
      } | {
        id: string;
        kind: "skip-charge";
        settings: {
          customer_id: string;
          integration_id: string;
          subscription_id: string;
          charge_id: string;
        };
      } | {
        id: string;
        kind: "remove-item";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          product_variant_id: string;
          quantity: string;
        };
      } | {
        id: string;
        kind: "replace-item";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          product_variant_id: string;
          quantity: string;
          added_product_variant_id: string;
          added_quantity: string;
        };
      } | {
        id: string;
        kind: "create-discount-code";
        settings: {
          customer_id: string;
          integration_id: string;
          type: string;
          amount: string;
          valid_for: string;
        };
      } | {
        id: string;
        kind: "reship-for-free";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "refund-shipping-costs";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "reusable-llm-prompt-call";
        settings: {
          configuration_id: string;
          configuration_internal_id: string;
          objects?: {
            customer?: string | null;
            order?: string | null;
            products?: {
              [name: string]: string;
            } | null;
          } | null;
          custom_inputs?: {
            [name: string]: string;
          } | null;
          values: {
            [name: string]: string | number | boolean;
          };
        };
      })[];
      inputs?: ({
        id: string;
        name: string;
        description: string;
        data_type: "string";
        options?: {
          label: string;
          value: string;
        }[] | null;
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "number";
        options?: {
          label: string;
          value: number;
        }[] | null;
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "boolean";
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "date";
      })[] | null;
      values?: {
        [name: string]: number | boolean | string /* date-time */  | string;
      } | null;
      transitions: {
        id: string;
        from_step_id: string;
        to_step_id: string;
        event?: {
          id: string;
          kind: "choices";
        } | null;
        name?: string | null;
        conditions?: {
          or: ({
            equals: any;
          } | {
            notEqual: any;
          } | {
            contains: any;
          } | {
            doesNotContain: any;
          } | {
            endsWith: any;
          } | {
            startsWith: any;
          } | {
            exists: any;
          } | {
            doesNotExist: any;
          } | {
            lessThan: any;
          } | {
            lessThanInterval: any;
          } | {
            lessOrEqual: any;
          } | {
            greaterThan: any;
          } | {
            greaterThanInterval: any;
          } | {
            greaterOrEqual: any;
          })[];
        } | {
          and: ({
            equals: any;
          } | {
            notEqual: any;
          } | {
            contains: any;
          } | {
            doesNotContain: any;
          } | {
            endsWith: any;
          } | {
            startsWith: any;
          } | {
            exists: any;
          } | {
            doesNotExist: any;
          } | {
            lessThan: any;
          } | {
            lessThanInterval: any;
          } | {
            lessOrEqual: any;
          } | {
            greaterThan: any;
          } | {
            greaterThanInterval: any;
          } | {
            greaterOrEqual: any;
          })[];
        };
      }[];
      available_languages: ("en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR")[];
      created_datetime?: string | null; // date-time
      updated_datetime?: string | null; // date-time
      deleted_datetime?: string | null; // date-time
      triggers: ({
        kind: "llm-prompt";
        settings: {
          custom_inputs: {
            id: string;
            name: string;
            instructions: string;
            data_type: "string" | "number" | "date" | "boolean";
          }[];
          object_inputs: ({
            kind: "customer";
            integration_id: number | string;
          } | {
            kind: "order";
            integration_id: number | string;
          } | {
            kind: "product";
            integration_id: number | string;
            name: string;
            instructions: string;
            id: string;
          })[];
          conditions?: {
            or: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          } | {
            and: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          };
          outputs: {
            id: string;
            description: string;
            path: string;
          }[];
        };
      } | {
        kind: "channel";
        settings: {
        };
      } | {
        kind: "reusable-llm-prompt";
        settings: {
          custom_inputs: {
            id: string;
            name: string;
            instructions: string;
            data_type: "string" | "number" | "date" | "boolean";
          }[];
          object_inputs: ({
            kind: "customer";
          } | {
            kind: "order";
          } | {
            kind: "product";
            name: string;
            instructions: string;
            id: string;
          })[];
          outputs: {
            id: string;
            name: string;
            description: string;
            path: string;
            data_type?: "string" | "number" | "date" | "boolean";
          }[];
        };
      })[];
      entrypoints: ({
        deactivated_datetime?: string | null; // date-time
        kind: "llm-conversation";
        trigger: "llm-prompt";
        settings: {
          requires_confirmation?: boolean | null;
          instructions: string;
        };
      } | {
        deactivated_datetime?: string | null; // date-time
        kind: "reusable-llm-prompt-call-step";
        trigger: "reusable-llm-prompt";
        settings: {
          requires_confirmation: boolean;
          conditions: {
            or: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          } | {
            and: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          };
        };
      })[];
      apps?: ({
        type: "shopify";
      } | {
        type: "recharge";
      } | {
        app_id: string;
        api_key?: string | null;
        account_oauth2_token_id?: string | null;
        type: "app";
        refresh_token?: string | null;
      })[] | null;
    }
    export interface UpsertWfConfigurationRequestDto {
      id: string;
      template_internal_id?: string | null;
      name: string;
      description?: string | null;
      short_description?: string | null;
      is_draft: boolean;
      initial_step_id: string;
      entrypoint?: {
        label: string;
        label_tkey: string;
      } | null;
      steps: ({
        id: string;
        kind: "choices";
        settings: {
          choices: {
            event_id: string;
            label: string;
            label_tkey: string;
          }[];
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "handover";
        settings?: {
          ticket_tags?: string[] | null;
          ticket_assignee_user_id?: null | number;
          ticket_assignee_team_id?: null | number;
        } | null;
      } | {
        id: string;
        kind: "workflow_call";
        settings: {
          configuration_id: string;
        };
      } | {
        id: string;
        kind: "text-input";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "attachments-input";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "shopper-authentication";
        settings: {
          integration_id: number;
        };
      } | {
        id: string;
        kind: "order-selection";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "http-request";
        settings: {
          name: string;
          url: string /* uri */  | ("");
          method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
          headers?: {
            [name: string]: string;
          } | null;
          body?: string | null;
          oauth2_token_settings?: {
            account_oauth2_token_id: string;
            refresh_token_url: string;
          } | null;
          variables: {
            id: string;
            name: string;
            jsonpath: string;
            data_type?: "string" | "number" | "date" | "boolean";
          }[];
        };
      } | {
        id: string;
        kind: "helpful-prompt";
        settings?: {
          ticket_tags?: string[] | null;
          ticket_assignee_user_id?: null | number;
          ticket_assignee_team_id?: null | number;
        } | null;
      } | {
        id: string;
        kind: "message";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "end";
        settings?: {
          success: boolean;
        } | null;
      } | {
        id: string;
        kind: "conditions";
        settings: {
          name: string;
        };
      } | {
        id: string;
        kind: "order-line-item-selection";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "cancel-order";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "refund-order";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "update-shipping-address";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          name: string;
          address1: string;
          address2: string;
          city: string;
          zip: string;
          province: string;
          country: string;
          phone: string;
          last_name: string;
          first_name: string;
        };
      } | {
        id: string;
        kind: "cancel-subscription";
        settings: {
          customer_id: string;
          integration_id: string;
          subscription_id: string;
          reason: string;
        };
      } | {
        id: string;
        kind: "skip-charge";
        settings: {
          customer_id: string;
          integration_id: string;
          subscription_id: string;
          charge_id: string;
        };
      } | {
        id: string;
        kind: "remove-item";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          product_variant_id: string;
          quantity: string;
        };
      } | {
        id: string;
        kind: "replace-item";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          product_variant_id: string;
          quantity: string;
          added_product_variant_id: string;
          added_quantity: string;
        };
      } | {
        id: string;
        kind: "create-discount-code";
        settings: {
          customer_id: string;
          integration_id: string;
          type: string;
          amount: string;
          valid_for: string;
        };
      } | {
        id: string;
        kind: "reship-for-free";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "refund-shipping-costs";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "reusable-llm-prompt-call";
        settings: {
          configuration_id: string;
          configuration_internal_id: string;
          objects?: {
            customer?: string | null;
            order?: string | null;
            products?: {
              [name: string]: string;
            } | null;
          } | null;
          custom_inputs?: {
            [name: string]: string;
          } | null;
          values: {
            [name: string]: string | number | boolean;
          };
        };
      })[];
      inputs?: ({
        id: string;
        name: string;
        description: string;
        data_type: "string";
        options?: {
          label: string;
          value: string;
        }[] | null;
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "number";
        options?: {
          label: string;
          value: number;
        }[] | null;
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "boolean";
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "date";
      })[] | null;
      values?: {
        [name: string]: number | boolean | string /* date-time */  | string;
      } | null;
      transitions: {
        id: string;
        from_step_id: string;
        to_step_id: string;
        event?: {
          id: string;
          kind: "choices";
        } | null;
        name?: string | null;
        conditions?: {
          or: ({
            equals: any;
          } | {
            notEqual: any;
          } | {
            contains: any;
          } | {
            doesNotContain: any;
          } | {
            endsWith: any;
          } | {
            startsWith: any;
          } | {
            exists: any;
          } | {
            doesNotExist: any;
          } | {
            lessThan: any;
          } | {
            lessThanInterval: any;
          } | {
            lessOrEqual: any;
          } | {
            greaterThan: any;
          } | {
            greaterThanInterval: any;
          } | {
            greaterOrEqual: any;
          })[];
        } | {
          and: ({
            equals: any;
          } | {
            notEqual: any;
          } | {
            contains: any;
          } | {
            doesNotContain: any;
          } | {
            endsWith: any;
          } | {
            startsWith: any;
          } | {
            exists: any;
          } | {
            doesNotExist: any;
          } | {
            lessThan: any;
          } | {
            lessThanInterval: any;
          } | {
            lessOrEqual: any;
          } | {
            greaterThan: any;
          } | {
            greaterThanInterval: any;
          } | {
            greaterOrEqual: any;
          })[];
        };
      }[];
      available_languages: ("en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR")[];
      category?: string | null;
      triggers?: ({
        kind: "llm-prompt";
        settings: {
          custom_inputs: {
            id: string;
            name: string;
            instructions: string;
            data_type: "string" | "number" | "date" | "boolean";
          }[];
          object_inputs: ({
            kind: "customer";
            integration_id: number | string;
          } | {
            kind: "order";
            integration_id: number | string;
          } | {
            kind: "product";
            integration_id: number | string;
            name: string;
            instructions: string;
            id: string;
          })[];
          conditions?: {
            or: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          } | {
            and: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          };
          outputs: {
            id: string;
            description: string;
            path: string;
          }[];
        };
      } | {
        kind: "channel";
        settings: {
        };
      } | {
        kind: "reusable-llm-prompt";
        settings: {
          custom_inputs: {
            id: string;
            name: string;
            instructions: string;
            data_type: "string" | "number" | "date" | "boolean";
          }[];
          object_inputs: ({
            kind: "customer";
          } | {
            kind: "order";
          } | {
            kind: "product";
            name: string;
            instructions: string;
            id: string;
          })[];
          outputs: {
            id: string;
            name: string;
            description: string;
            path: string;
            data_type?: "string" | "number" | "date" | "boolean";
          }[];
        };
      })[] | null;
      entrypoints?: ({
        deactivated_datetime?: string | null; // date-time
        kind: "llm-conversation";
        trigger: "llm-prompt";
        settings: {
          requires_confirmation?: boolean | null;
          instructions: string;
        };
      } | {
        deactivated_datetime?: string | null; // date-time
        kind: "reusable-llm-prompt-call-step";
        trigger: "reusable-llm-prompt";
        settings: {
          requires_confirmation: boolean;
          conditions: {
            or: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          } | {
            and: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          };
        };
      })[] | null;
      apps?: ({
        type: "shopify";
      } | {
        type: "recharge";
      } | {
        app_id: string;
        api_key?: string | null;
        account_oauth2_token_id?: string | null;
        type: "app";
        refresh_token?: string | null;
      })[] | null;
    }
    export interface UpsertWfConfigurationResponseDto {
      internal_id: string;
      id: string;
      account_id: number | null;
      template_internal_id?: string | null;
      name: string;
      description?: string | null;
      short_description?: string | null;
      is_draft: boolean;
      initial_step_id: string;
      entrypoint?: {
        label: string;
        label_tkey: string;
      } | null;
      steps: ({
        id: string;
        kind: "choices";
        settings: {
          choices: {
            event_id: string;
            label: string;
            label_tkey: string;
          }[];
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "handover";
        settings?: {
          ticket_tags?: string[] | null;
          ticket_assignee_user_id?: null | number;
          ticket_assignee_team_id?: null | number;
        } | null;
      } | {
        id: string;
        kind: "workflow_call";
        settings: {
          configuration_id: string;
        };
      } | {
        id: string;
        kind: "text-input";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "attachments-input";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "shopper-authentication";
        settings: {
          integration_id: number;
        };
      } | {
        id: string;
        kind: "order-selection";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "http-request";
        settings: {
          name: string;
          url: string /* uri */  | ("");
          method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
          headers?: {
            [name: string]: string;
          } | null;
          body?: string | null;
          oauth2_token_settings?: {
            account_oauth2_token_id: string;
            refresh_token_url: string;
          } | null;
          variables: {
            id: string;
            name: string;
            jsonpath: string;
            data_type?: "string" | "number" | "date" | "boolean";
          }[];
        };
      } | {
        id: string;
        kind: "helpful-prompt";
        settings?: {
          ticket_tags?: string[] | null;
          ticket_assignee_user_id?: null | number;
          ticket_assignee_team_id?: null | number;
        } | null;
      } | {
        id: string;
        kind: "message";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "end";
        settings?: {
          success: boolean;
        } | null;
      } | {
        id: string;
        kind: "conditions";
        settings: {
          name: string;
        };
      } | {
        id: string;
        kind: "order-line-item-selection";
        settings: {
          message: {
            content: {
              html: string;
              html_tkey: string;
              text: string;
              text_tkey: string;
              attachments?: {
                content_type: "application/productCard";
                name?: string | null;
                size?: number | null;
                url: string;
                extra?: {
                  product_id?: number | null;
                  variant_id?: number | null;
                  price?: string | null;
                  compare_at_price?: string | null;
                  variant_name?: string | null;
                  product_link?: string | null;
                  currency?: string | null;
                  featured_image?: string | null;
                } | null;
              }[] | null;
            };
          };
        };
      } | {
        id: string;
        kind: "cancel-order";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "refund-order";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "update-shipping-address";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          name: string;
          address1: string;
          address2: string;
          city: string;
          zip: string;
          province: string;
          country: string;
          phone: string;
          last_name: string;
          first_name: string;
        };
      } | {
        id: string;
        kind: "cancel-subscription";
        settings: {
          customer_id: string;
          integration_id: string;
          subscription_id: string;
          reason: string;
        };
      } | {
        id: string;
        kind: "skip-charge";
        settings: {
          customer_id: string;
          integration_id: string;
          subscription_id: string;
          charge_id: string;
        };
      } | {
        id: string;
        kind: "remove-item";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          product_variant_id: string;
          quantity: string;
        };
      } | {
        id: string;
        kind: "replace-item";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          product_variant_id: string;
          quantity: string;
          added_product_variant_id: string;
          added_quantity: string;
        };
      } | {
        id: string;
        kind: "create-discount-code";
        settings: {
          customer_id: string;
          integration_id: string;
          type: string;
          amount: string;
          valid_for: string;
        };
      } | {
        id: string;
        kind: "reship-for-free";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "refund-shipping-costs";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "reusable-llm-prompt-call";
        settings: {
          configuration_id: string;
          configuration_internal_id: string;
          objects?: {
            customer?: string | null;
            order?: string | null;
            products?: {
              [name: string]: string;
            } | null;
          } | null;
          custom_inputs?: {
            [name: string]: string;
          } | null;
          values: {
            [name: string]: string | number | boolean;
          };
        };
      })[];
      inputs?: ({
        id: string;
        name: string;
        description: string;
        data_type: "string";
        options?: {
          label: string;
          value: string;
        }[] | null;
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "number";
        options?: {
          label: string;
          value: number;
        }[] | null;
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "boolean";
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "date";
      })[] | null;
      values?: {
        [name: string]: number | boolean | string /* date-time */  | string;
      } | null;
      transitions: {
        id: string;
        from_step_id: string;
        to_step_id: string;
        event?: {
          id: string;
          kind: "choices";
        } | null;
        name?: string | null;
        conditions?: {
          or: ({
            equals: any;
          } | {
            notEqual: any;
          } | {
            contains: any;
          } | {
            doesNotContain: any;
          } | {
            endsWith: any;
          } | {
            startsWith: any;
          } | {
            exists: any;
          } | {
            doesNotExist: any;
          } | {
            lessThan: any;
          } | {
            lessThanInterval: any;
          } | {
            lessOrEqual: any;
          } | {
            greaterThan: any;
          } | {
            greaterThanInterval: any;
          } | {
            greaterOrEqual: any;
          })[];
        } | {
          and: ({
            equals: any;
          } | {
            notEqual: any;
          } | {
            contains: any;
          } | {
            doesNotContain: any;
          } | {
            endsWith: any;
          } | {
            startsWith: any;
          } | {
            exists: any;
          } | {
            doesNotExist: any;
          } | {
            lessThan: any;
          } | {
            lessThanInterval: any;
          } | {
            lessOrEqual: any;
          } | {
            greaterThan: any;
          } | {
            greaterThanInterval: any;
          } | {
            greaterOrEqual: any;
          })[];
        };
      }[];
      available_languages: ("en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR")[];
      category?: string | null;
      created_datetime?: string | null; // date-time
      updated_datetime?: string | null; // date-time
      deleted_datetime?: string | null; // date-time
      triggers?: ({
        kind: "llm-prompt";
        settings: {
          custom_inputs: {
            id: string;
            name: string;
            instructions: string;
            data_type: "string" | "number" | "date" | "boolean";
          }[];
          object_inputs: ({
            kind: "customer";
            integration_id: number | string;
          } | {
            kind: "order";
            integration_id: number | string;
          } | {
            kind: "product";
            integration_id: number | string;
            name: string;
            instructions: string;
            id: string;
          })[];
          conditions?: {
            or: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          } | {
            and: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          };
          outputs: {
            id: string;
            description: string;
            path: string;
          }[];
        };
      } | {
        kind: "channel";
        settings: {
        };
      } | {
        kind: "reusable-llm-prompt";
        settings: {
          custom_inputs: {
            id: string;
            name: string;
            instructions: string;
            data_type: "string" | "number" | "date" | "boolean";
          }[];
          object_inputs: ({
            kind: "customer";
          } | {
            kind: "order";
          } | {
            kind: "product";
            name: string;
            instructions: string;
            id: string;
          })[];
          outputs: {
            id: string;
            name: string;
            description: string;
            path: string;
            data_type?: "string" | "number" | "date" | "boolean";
          }[];
        };
      })[] | null;
      entrypoints?: ({
        deactivated_datetime?: string | null; // date-time
        kind: "llm-conversation";
        trigger: "llm-prompt";
        settings: {
          requires_confirmation?: boolean | null;
          instructions: string;
        };
      } | {
        deactivated_datetime?: string | null; // date-time
        kind: "reusable-llm-prompt-call-step";
        trigger: "reusable-llm-prompt";
        settings: {
          requires_confirmation: boolean;
          conditions: {
            or: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          } | {
            and: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          };
        };
      })[] | null;
      apps?: ({
        type: "shopify";
      } | {
        type: "recharge";
      } | {
        app_id: string;
        api_key?: string | null;
        account_oauth2_token_id?: string | null;
        type: "app";
        refresh_token?: string | null;
      })[] | null;
    }
    export interface UpsertWfConfigurationTemplateRequestDto {
      id: string;
      name: string;
      description?: string | null;
      short_description?: string | null;
      is_draft: boolean;
      initial_step_id: string;
      entrypoint?: {
        label: string;
        label_tkey: string;
      } | null;
      steps: ({
        id: string;
        kind: "http-request";
        settings: {
          name: string;
          url: string /* uri */  | ("");
          method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
          headers?: {
            [name: string]: string;
          } | null;
          body?: string | null;
          oauth2_token_settings?: {
            account_oauth2_token_id: string;
            refresh_token_url: string;
          } | null;
          variables: {
            id: string;
            name: string;
            jsonpath: string;
            data_type?: "string" | "number" | "date" | "boolean";
          }[];
        };
      } | {
        id: string;
        kind: "cancel-order";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "refund-order";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "update-shipping-address";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          name: string;
          address1: string;
          address2: string;
          city: string;
          zip: string;
          province: string;
          country: string;
          phone: string;
          last_name: string;
          first_name: string;
        };
      } | {
        id: string;
        kind: "cancel-subscription";
        settings: {
          customer_id: string;
          integration_id: string;
          subscription_id: string;
          reason: string;
        };
      } | {
        id: string;
        kind: "skip-charge";
        settings: {
          customer_id: string;
          integration_id: string;
          subscription_id: string;
          charge_id: string;
        };
      } | {
        id: string;
        kind: "remove-item";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          product_variant_id: string;
          quantity: string;
        };
      } | {
        id: string;
        kind: "replace-item";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          product_variant_id: string;
          quantity: string;
          added_product_variant_id: string;
          added_quantity: string;
        };
      } | {
        id: string;
        kind: "create-discount-code";
        settings: {
          customer_id: string;
          integration_id: string;
          type: string;
          amount: string;
          valid_for: string;
        };
      } | {
        id: string;
        kind: "refund-shipping-costs";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "reship-for-free";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "conditions";
        settings: {
          name: string;
        };
      } | {
        id: string;
        kind: "end";
        settings?: {
          success: boolean;
        } | null;
      } | {
        id: string;
        kind: "reusable-llm-prompt-call";
        settings: {
          configuration_id: string;
          configuration_internal_id: string;
          objects?: {
            customer?: string | null;
            order?: string | null;
            products?: {
              [name: string]: string;
            } | null;
          } | null;
          custom_inputs?: {
            [name: string]: string;
          } | null;
          values: {
            [name: string]: string | number | boolean;
          };
        };
      })[];
      inputs?: ({
        id: string;
        name: string;
        description: string;
        data_type: "string";
        options?: {
          label: string;
          value: string;
        }[] | null;
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "number";
        options?: {
          label: string;
          value: number;
        }[] | null;
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "boolean";
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "date";
      })[] | null;
      values?: {
        [name: string]: number | boolean | string /* date-time */  | string;
      } | null;
      transitions: {
        id: string;
        from_step_id: string;
        to_step_id: string;
        event?: {
          id: string;
          kind: "choices";
        } | null;
        name?: string | null;
        conditions?: {
          or: ({
            equals: any;
          } | {
            notEqual: any;
          } | {
            contains: any;
          } | {
            doesNotContain: any;
          } | {
            endsWith: any;
          } | {
            startsWith: any;
          } | {
            exists: any;
          } | {
            doesNotExist: any;
          } | {
            lessThan: any;
          } | {
            lessThanInterval: any;
          } | {
            lessOrEqual: any;
          } | {
            greaterThan: any;
          } | {
            greaterThanInterval: any;
          } | {
            greaterOrEqual: any;
          })[];
        } | {
          and: ({
            equals: any;
          } | {
            notEqual: any;
          } | {
            contains: any;
          } | {
            doesNotContain: any;
          } | {
            endsWith: any;
          } | {
            startsWith: any;
          } | {
            exists: any;
          } | {
            doesNotExist: any;
          } | {
            lessThan: any;
          } | {
            lessThanInterval: any;
          } | {
            lessOrEqual: any;
          } | {
            greaterThan: any;
          } | {
            greaterThanInterval: any;
          } | {
            greaterOrEqual: any;
          })[];
        };
      }[];
      available_languages: ("en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR")[];
      triggers: ({
        kind: "llm-prompt";
        settings: {
          custom_inputs: {
            id: string;
            name: string;
            instructions: string;
            data_type: "string" | "number" | "date" | "boolean";
          }[];
          object_inputs: ({
            kind: "customer";
            integration_id: number | string;
          } | {
            kind: "order";
            integration_id: number | string;
          } | {
            kind: "product";
            integration_id: number | string;
            name: string;
            instructions: string;
            id: string;
          })[];
          conditions?: {
            or: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          } | {
            and: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          };
          outputs: {
            id: string;
            description: string;
            path: string;
          }[];
        };
      } | {
        kind: "channel";
        settings: {
        };
      } | {
        kind: "reusable-llm-prompt";
        settings: {
          custom_inputs: {
            id: string;
            name: string;
            instructions: string;
            data_type: "string" | "number" | "date" | "boolean";
          }[];
          object_inputs: ({
            kind: "customer";
          } | {
            kind: "order";
          } | {
            kind: "product";
            name: string;
            instructions: string;
            id: string;
          })[];
          outputs: {
            id: string;
            name: string;
            description: string;
            path: string;
            data_type?: "string" | "number" | "date" | "boolean";
          }[];
        };
      })[];
      entrypoints: ({
        deactivated_datetime?: string | null; // date-time
        kind: "llm-conversation";
        trigger: "llm-prompt";
        settings: {
          requires_confirmation: boolean;
          instructions: string;
        };
      } | {
        deactivated_datetime?: string | null; // date-time
        kind: "reusable-llm-prompt-call-step";
        trigger: "reusable-llm-prompt";
        settings: {
          requires_confirmation: boolean;
          conditions: {
            or: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          } | {
            and: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          };
        };
      })[];
      apps: ({
        type: "shopify";
      } | {
        type: "recharge";
      } | {
        app_id: string;
        api_key?: string | null;
        account_oauth2_token_id?: string | null;
        type: "app";
        refresh_token?: string | null;
      })[];
    }
    export interface UpsertWfConfigurationTemplateResponseDto {
      internal_id: string;
      id: string;
      name: string;
      description?: string | null;
      short_description?: string | null;
      is_draft: boolean;
      initial_step_id: string;
      entrypoint?: {
        label: string;
        label_tkey: string;
      } | null;
      steps: ({
        id: string;
        kind: "http-request";
        settings: {
          name: string;
          url: string /* uri */  | ("");
          method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
          headers?: {
            [name: string]: string;
          } | null;
          body?: string | null;
          oauth2_token_settings?: {
            account_oauth2_token_id: string;
            refresh_token_url: string;
          } | null;
          variables: {
            id: string;
            name: string;
            jsonpath: string;
            data_type?: "string" | "number" | "date" | "boolean";
          }[];
        };
      } | {
        id: string;
        kind: "cancel-order";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "refund-order";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "update-shipping-address";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          name: string;
          address1: string;
          address2: string;
          city: string;
          zip: string;
          province: string;
          country: string;
          phone: string;
          last_name: string;
          first_name: string;
        };
      } | {
        id: string;
        kind: "cancel-subscription";
        settings: {
          customer_id: string;
          integration_id: string;
          subscription_id: string;
          reason: string;
        };
      } | {
        id: string;
        kind: "skip-charge";
        settings: {
          customer_id: string;
          integration_id: string;
          subscription_id: string;
          charge_id: string;
        };
      } | {
        id: string;
        kind: "remove-item";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          product_variant_id: string;
          quantity: string;
        };
      } | {
        id: string;
        kind: "replace-item";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
          product_variant_id: string;
          quantity: string;
          added_product_variant_id: string;
          added_quantity: string;
        };
      } | {
        id: string;
        kind: "create-discount-code";
        settings: {
          customer_id: string;
          integration_id: string;
          type: string;
          amount: string;
          valid_for: string;
        };
      } | {
        id: string;
        kind: "refund-shipping-costs";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "reship-for-free";
        settings: {
          customer_id: string;
          order_external_id: string;
          integration_id: string;
        };
      } | {
        id: string;
        kind: "conditions";
        settings: {
          name: string;
        };
      } | {
        id: string;
        kind: "end";
        settings?: {
          success: boolean;
        } | null;
      })[];
      inputs?: ({
        id: string;
        name: string;
        description: string;
        data_type: "string";
        options?: {
          label: string;
          value: string;
        }[] | null;
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "number";
        options?: {
          label: string;
          value: number;
        }[] | null;
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "boolean";
      } | {
        id: string;
        name: string;
        description: string;
        data_type: "date";
      })[] | null;
      values?: {
        [name: string]: number | boolean | string /* date-time */  | string;
      } | null;
      transitions: {
        id: string;
        from_step_id: string;
        to_step_id: string;
        event?: {
          id: string;
          kind: "choices";
        } | null;
        name?: string | null;
        conditions?: {
          or: ({
            equals: any;
          } | {
            notEqual: any;
          } | {
            contains: any;
          } | {
            doesNotContain: any;
          } | {
            endsWith: any;
          } | {
            startsWith: any;
          } | {
            exists: any;
          } | {
            doesNotExist: any;
          } | {
            lessThan: any;
          } | {
            lessThanInterval: any;
          } | {
            lessOrEqual: any;
          } | {
            greaterThan: any;
          } | {
            greaterThanInterval: any;
          } | {
            greaterOrEqual: any;
          })[];
        } | {
          and: ({
            equals: any;
          } | {
            notEqual: any;
          } | {
            contains: any;
          } | {
            doesNotContain: any;
          } | {
            endsWith: any;
          } | {
            startsWith: any;
          } | {
            exists: any;
          } | {
            doesNotExist: any;
          } | {
            lessThan: any;
          } | {
            lessThanInterval: any;
          } | {
            lessOrEqual: any;
          } | {
            greaterThan: any;
          } | {
            greaterThanInterval: any;
          } | {
            greaterOrEqual: any;
          })[];
        };
      }[];
      available_languages: ("en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR")[];
      created_datetime: string; // date-time
      updated_datetime: string; // date-time
      deleted_datetime?: string | null; // date-time
      triggers: ({
        kind: "llm-prompt";
        settings: {
          custom_inputs: {
            id: string;
            name: string;
            instructions: string;
            data_type: "string" | "number" | "date" | "boolean";
          }[];
          object_inputs: ({
            kind: "customer";
            integration_id: number | string;
          } | {
            kind: "order";
            integration_id: number | string;
          } | {
            kind: "product";
            integration_id: number | string;
            name: string;
            instructions: string;
            id: string;
          })[];
          conditions?: {
            or: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          } | {
            and: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          };
          outputs: {
            id: string;
            description: string;
            path: string;
          }[];
        };
      } | {
        kind: "channel";
        settings: {
        };
      } | {
        kind: "reusable-llm-prompt";
        settings: {
          custom_inputs: {
            id: string;
            name: string;
            instructions: string;
            data_type: "string" | "number" | "date" | "boolean";
          }[];
          object_inputs: ({
            kind: "customer";
          } | {
            kind: "order";
          } | {
            kind: "product";
            name: string;
            instructions: string;
            id: string;
          })[];
          outputs: {
            id: string;
            name: string;
            description: string;
            path: string;
            data_type?: "string" | "number" | "date" | "boolean";
          }[];
        };
      })[];
      entrypoints: ({
        deactivated_datetime?: string | null; // date-time
        kind: "llm-conversation";
        trigger: "llm-prompt";
        settings: {
          requires_confirmation: boolean;
          instructions: string;
        };
      } | {
        deactivated_datetime?: string | null; // date-time
        kind: "reusable-llm-prompt-call-step";
        trigger: "reusable-llm-prompt";
        settings: {
          requires_confirmation: boolean;
          conditions: {
            or: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          } | {
            and: ({
              equals: any;
            } | {
              notEqual: any;
            } | {
              contains: any;
            } | {
              doesNotContain: any;
            } | {
              endsWith: any;
            } | {
              startsWith: any;
            } | {
              exists: any;
            } | {
              doesNotExist: any;
            } | {
              lessThan: any;
            } | {
              lessThanInterval: any;
            } | {
              lessOrEqual: any;
            } | {
              greaterThan: any;
            } | {
              greaterThanInterval: any;
            } | {
              greaterOrEqual: any;
            })[];
          };
        };
      })[];
      apps: ({
        type: "shopify";
      } | {
        type: "recharge";
      } | {
        app_id: string;
        api_key?: string | null;
        account_oauth2_token_id?: string | null;
        type: "app";
        refresh_token?: string | null;
      })[];
    }
    export interface UpsertWfConfigurationTranslationsRequestBodyDto {
      [name: string]: string;
    }
    export interface UpsertWfConfigurationTranslationsResponseDto {
      [name: string]: string;
    }
    export interface WfExecutionHandoverCallbackRequestDto {
      ticket_id: number;
    }
  }
}
declare namespace Paths {
  namespace AccountOauth2TokenControllerUpsert {
    export type RequestBody = Components.Schemas.UpsertAccountOauth2TokenRequestBodyDto;
    namespace Responses {
      export type $201 = Components.Schemas.UpsertAccountOauth2TokenRequestResponseBodyDto;
    }
  }
  namespace AppControllerDelete {
    namespace Parameters {
      export type Id = string;
    }
    export interface PathParameters {
      id: Parameters.Id;
    }
  }
  namespace AppControllerGet {
    namespace Parameters {
      export type Id = string;
    }
    export interface PathParameters {
      id: Parameters.Id;
    }
    namespace Responses {
      export type $200 = Components.Schemas.GetAppResponseDto;
    }
  }
  namespace AppControllerList {
    namespace Parameters {
      export type Ids = any[];
    }
    export interface QueryParameters {
      ids?: Parameters.Ids;
    }
    namespace Responses {
      export type $200 = Components.Schemas.ListAppResponseDto;
    }
  }
  namespace AppControllerUpsert {
    namespace Parameters {
      export type Id = string;
    }
    export interface PathParameters {
      id: Parameters.Id;
    }
    export type RequestBody = Components.Schemas.UpsertAppRequestBodyDto;
    namespace Responses {
      export type $201 = Components.Schemas.UpsertAppRequestResponseDto;
    }
  }
  namespace AutomationEventControllerGet {
    namespace Parameters {
      export type Uuid = string;
    }
    export interface PathParameters {
      uuid: Parameters.Uuid;
    }
    namespace Responses {
      export type $200 = Components.Schemas.GetAutomationEventResponseDto;
    }
  }
  namespace HealthControllerCheck {
    namespace Responses {
      export interface $200 {
        /**
         * example:
         * ok
         */
        status?: string;
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
            [name: string]: any;
            status: string;
          };
        } | null;
        /**
         * example:
         * {}
         */
        error?: {
          [name: string]: {
            [name: string]: any;
            status: string;
          };
        } | null;
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
            [name: string]: any;
            status: string;
          };
        };
      }
      export interface $503 {
        /**
         * example:
         * error
         */
        status?: string;
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
            [name: string]: any;
            status: string;
          };
        } | null;
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
            [name: string]: any;
            status: string;
          };
        } | null;
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
            [name: string]: any;
            status: string;
          };
        };
      }
    }
  }
  namespace StoreAppControllerDelete {
    namespace Parameters {
      export type StoreName = string;
      export type StoreType = "shopify";
      export type Type = "recharge";
    }
    export interface PathParameters {
      store_type: Parameters.StoreType;
      store_name: Parameters.StoreName;
      type: Parameters.Type;
    }
  }
  namespace StoreAppControllerList {
    namespace Parameters {
      export type StoreName = string;
      export type StoreType = "shopify";
    }
    export interface PathParameters {
      store_type: Parameters.StoreType;
      store_name: Parameters.StoreName;
    }
    namespace Responses {
      export type $200 = Components.Schemas.ListStoreAppResponseDto;
    }
  }
  namespace StoreAppControllerUpsert {
    namespace Parameters {
      export type StoreName = string;
      export type StoreType = "shopify";
      export type Type = "recharge";
    }
    export interface PathParameters {
      store_type: Parameters.StoreType;
      store_name: Parameters.StoreName;
      type: Parameters.Type;
    }
    export type RequestBody = Components.Schemas.UpsertStoreAppRequestBodyDto;
    namespace Responses {
      export type $201 = Components.Schemas.UpsertStoreAppResponseDto;
    }
  }
  namespace StoreWfConfigurationControllerList {
    namespace Parameters {
      export type StoreName = string;
      export type StoreType = "shopify";
      export type Triggers = any[];
    }
    export interface PathParameters {
      store_type: Parameters.StoreType;
      store_name: Parameters.StoreName;
    }
    export interface QueryParameters {
      triggers: Parameters.Triggers;
    }
    namespace Responses {
      export type $200 = Components.Schemas.ListStoreWfConfigurationsResponseDto;
    }
  }
  namespace StoreWfConfigurationControllerUpsert {
    namespace Parameters {
      export type InternalId = string;
      export type StoreName = string;
      export type StoreType = "shopify";
    }
    export interface PathParameters {
      store_type: Parameters.StoreType;
      store_name: Parameters.StoreName;
      internal_id: Parameters.InternalId;
    }
    export type RequestBody = Components.Schemas.UpsertStoreWfConfigurationRequestBodyDto;
    namespace Responses {
      export type $201 = Components.Schemas.UpsertStoreWfConfigurationResponseDto;
    }
  }
  namespace StoreWfEntrypointControllerList {
    namespace Parameters {
      export type AccountId = number;
      export type StoreName = string;
      export type StoreType = "shopify";
    }
    export interface PathParameters {
      account_id: Parameters.AccountId;
      store_type: Parameters.StoreType;
      store_name: Parameters.StoreName;
    }
    namespace Responses {
      export type $200 = Components.Schemas.ListStoreWfEntrypointsResponseDto;
    }
  }
  namespace WfConfigurationControllerDelete {
    namespace Parameters {
      export type InternalId = string;
    }
    export interface PathParameters {
      internal_id: Parameters.InternalId;
    }
  }
  namespace WfConfigurationControllerDuplicate {
    namespace Parameters {
      export type Id = string;
    }
    export interface PathParameters {
      id: Parameters.Id;
    }
    export type RequestBody = Components.Schemas.DuplicateWfConfigurationRequestDto;
    namespace Responses {
      export type $201 = Components.Schemas.DuplicateWfConfigurationResponseDto;
    }
  }
  namespace WfConfigurationControllerExportExecutionLogs {
    namespace Parameters {
      export type ExecutionId = string;
      export type InternalId = string;
    }
    export interface PathParameters {
      internal_id: Parameters.InternalId;
      execution_id: Parameters.ExecutionId;
    }
    namespace Responses {
      export type $200 = Components.Schemas.HttpRequestEventsResponseDto;
    }
  }
  namespace WfConfigurationControllerExportStepLogs {
    namespace Parameters {
      export type InternalId = string;
      export type StepId = string;
    }
    export interface PathParameters {
      internal_id: Parameters.InternalId;
      step_id: Parameters.StepId;
    }
  }
  namespace WfConfigurationControllerGet {
    namespace Parameters {
      export type Id = string;
    }
    export interface PathParameters {
      id: Parameters.Id;
    }
    namespace Responses {
      export type $200 = Components.Schemas.GetWfConfigurationResponseDto;
    }
  }
  namespace WfConfigurationControllerGetExecution {
    namespace Parameters {
      export type ExecutionId = string;
      export type InternalId = string;
    }
    export interface PathParameters {
      internal_id: Parameters.InternalId;
      execution_id: Parameters.ExecutionId;
    }
    namespace Responses {
      export type $200 = Components.Schemas.GetWfExecutionDto;
    }
  }
  namespace WfConfigurationControllerGetExecutions {
    namespace Parameters {
      export type EndDate = string; // date-time
      export type InternalId = string;
      export type OrderBy = "ASC" | "DESC";
      export type Page = number;
      export type StartDate = string; // date-time
      export type Success = "0" | "1" | "true" | "false";
    }
    export interface PathParameters {
      internal_id: Parameters.InternalId;
    }
    export interface QueryParameters {
      order_by?: Parameters.OrderBy;
      page?: Parameters.Page;
      success?: Parameters.Success;
      end_date: Parameters.EndDate; // date-time
      start_date: Parameters.StartDate; // date-time
    }
    namespace Responses {
      export type $200 = Components.Schemas.GetExecutionsPaginationResponseDto;
    }
  }
  namespace WfConfigurationControllerList {
    namespace Parameters {
      export type IsDraft = any[];
    }
    export interface QueryParameters {
      is_draft?: Parameters.IsDraft;
    }
    namespace Responses {
      export type $200 = Components.Schemas.ListWfConfigurationsResponseDto;
    }
  }
  namespace WfConfigurationControllerUpsert {
    namespace Parameters {
      export type InternalId = string;
    }
    export interface PathParameters {
      internal_id: Parameters.InternalId;
    }
    export type RequestBody = Components.Schemas.UpsertWfConfigurationRequestDto;
    namespace Responses {
      export type $201 = Components.Schemas.UpsertWfConfigurationResponseDto;
    }
  }
  namespace WfConfigurationTemplateControllerDelete {
    namespace Parameters {
      export type InternalId = string;
    }
    export interface PathParameters {
      internal_id: Parameters.InternalId;
    }
  }
  namespace WfConfigurationTemplateControllerGet {
    namespace Parameters {
      export type Id = string;
    }
    export interface PathParameters {
      id: Parameters.Id;
    }
    namespace Responses {
      export type $200 = Components.Schemas.GetWfConfigurationTemplateResponseDto;
    }
  }
  namespace WfConfigurationTemplateControllerList {
    namespace Parameters {
      export type Triggers = any[];
    }
    export interface QueryParameters {
      triggers: Parameters.Triggers;
    }
    namespace Responses {
      export type $200 = Components.Schemas.ListWfConfigurationTemplatesResponseDto;
    }
  }
  namespace WfConfigurationTemplateControllerUpsert {
    namespace Parameters {
      export type InternalId = string;
    }
    export interface PathParameters {
      internal_id: Parameters.InternalId;
    }
    export type RequestBody = Components.Schemas.UpsertWfConfigurationTemplateRequestDto;
    namespace Responses {
      export type $201 = Components.Schemas.UpsertWfConfigurationTemplateResponseDto;
    }
  }
  namespace WfConfigurationTranslationsControllerDelete {
    namespace Parameters {
      export type InternalId = string;
      export type Lang = "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
    }
    export interface PathParameters {
      internal_id: Parameters.InternalId;
      lang: Parameters.Lang;
    }
  }
  namespace WfConfigurationTranslationsControllerGet {
    namespace Parameters {
      export type InternalId = string;
      export type Lang = "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
    }
    export interface PathParameters {
      internal_id: Parameters.InternalId;
      lang: Parameters.Lang;
    }
    namespace Responses {
      export type $200 = Components.Schemas.GetWfConfigurationTranslationsResponseDto;
    }
  }
  namespace WfConfigurationTranslationsControllerUpsert {
    namespace Parameters {
      export type InternalId = string;
      export type Lang = "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
    }
    export interface PathParameters {
      internal_id: Parameters.InternalId;
      lang: Parameters.Lang;
    }
    export type RequestBody = Components.Schemas.UpsertWfConfigurationTranslationsRequestBodyDto;
    namespace Responses {
      export type $201 = Components.Schemas.UpsertWfConfigurationTranslationsResponseDto;
    }
  }
  namespace WfEntrypointControllerList {
    namespace Parameters {
      export type Ids = any[];
      export type Language = "en-US" | "en-GB" | "fr-FR" | "fr-CA" | "es-ES" | "de-DE" | "nl-NL" | "cs-CZ" | "da-DK" | "no-NO" | "it-IT" | "sv-SE" | "fi-FI" | "ja-JP" | "pt-BR";
    }
    export interface QueryParameters {
      ids: Parameters.Ids;
      language: Parameters.Language;
    }
    namespace Responses {
      export type $200 = Components.Schemas.ListWfEntrypointsResponseDto;
    }
  }
  namespace WfExecutionControllerGet {
    namespace Parameters {
      export type Id = string;
    }
    export interface PathParameters {
      id: Parameters.Id;
    }
    namespace Responses {
      export type $200 = Components.Schemas.GetWfExecutionResponseDto;
    }
  }
  namespace WfExecutionControllerHandleHandoverCallback {
    namespace Parameters {
      export type Id = string;
    }
    export interface PathParameters {
      id: Parameters.Id;
    }
    export type RequestBody = Components.Schemas.WfExecutionHandoverCallbackRequestDto;
  }
  namespace WfExecutionControllerSend {
    export type RequestBody = Components.Schemas.SendWfExecutionEventRequestDto;
    namespace Responses {
      export type $201 = Components.Schemas.SendWfExecutionEventResponseDto;
    }
  }
  namespace WfExecutionControllerStart {
    export type RequestBody = Components.Schemas.StartWfExecutionRequestDto;
    namespace Responses {
      export type $201 = Components.Schemas.StartWfExecutionResponseDto;
    }
  }
  namespace WfExecutionControllerTest {
    export type RequestBody = Components.Schemas.TestWfExecutionRequestDto;
    namespace Responses {
      export type $201 = Components.Schemas.TestWfExecutionResponseDto;
    }
  }
}

export interface OperationMethods {
  /**
   * AutomationEventController_get
   */
  'AutomationEventController_get'(
    parameters?: Parameters<Paths.AutomationEventControllerGet.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AutomationEventControllerGet.Responses.$200>
  /**
   * WfConfigurationController_list
   */
  'WfConfigurationController_list'(
    parameters?: Parameters<Paths.WfConfigurationControllerList.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.WfConfigurationControllerList.Responses.$200>
  /**
   * WfConfigurationController_get
   */
  'WfConfigurationController_get'(
    parameters?: Parameters<Paths.WfConfigurationControllerGet.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.WfConfigurationControllerGet.Responses.$200>
  /**
   * WfConfigurationController_upsert
   */
  'WfConfigurationController_upsert'(
    parameters?: Parameters<Paths.WfConfigurationControllerUpsert.PathParameters> | null,
    data?: Paths.WfConfigurationControllerUpsert.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.WfConfigurationControllerUpsert.Responses.$201>
  /**
   * WfConfigurationController_delete
   */
  'WfConfigurationController_delete'(
    parameters?: Parameters<Paths.WfConfigurationControllerDelete.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * WfConfigurationController_duplicate
   */
  'WfConfigurationController_duplicate'(
    parameters?: Parameters<Paths.WfConfigurationControllerDuplicate.PathParameters> | null,
    data?: Paths.WfConfigurationControllerDuplicate.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.WfConfigurationControllerDuplicate.Responses.$201>
  /**
   * WfConfigurationController_exportStepLogs
   */
  'WfConfigurationController_exportStepLogs'(
    parameters?: Parameters<Paths.WfConfigurationControllerExportStepLogs.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * WfConfigurationController_exportExecutionLogs
   */
  'WfConfigurationController_exportExecutionLogs'(
    parameters?: Parameters<Paths.WfConfigurationControllerExportExecutionLogs.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.WfConfigurationControllerExportExecutionLogs.Responses.$200>
  /**
   * WfConfigurationController_getExecution
   */
  'WfConfigurationController_getExecution'(
    parameters?: Parameters<Paths.WfConfigurationControllerGetExecution.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.WfConfigurationControllerGetExecution.Responses.$200>
  /**
   * WfConfigurationController_getExecutions
   */
  'WfConfigurationController_getExecutions'(
    parameters?: Parameters<Paths.WfConfigurationControllerGetExecutions.PathParameters & Paths.WfConfigurationControllerGetExecutions.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.WfConfigurationControllerGetExecutions.Responses.$200>
  /**
   * WfConfigurationTranslationsController_get
   */
  'WfConfigurationTranslationsController_get'(
    parameters?: Parameters<Paths.WfConfigurationTranslationsControllerGet.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.WfConfigurationTranslationsControllerGet.Responses.$200>
  /**
   * WfConfigurationTranslationsController_upsert
   */
  'WfConfigurationTranslationsController_upsert'(
    parameters?: Parameters<Paths.WfConfigurationTranslationsControllerUpsert.PathParameters> | null,
    data?: Paths.WfConfigurationTranslationsControllerUpsert.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.WfConfigurationTranslationsControllerUpsert.Responses.$201>
  /**
   * WfConfigurationTranslationsController_delete
   */
  'WfConfigurationTranslationsController_delete'(
    parameters?: Parameters<Paths.WfConfigurationTranslationsControllerDelete.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * WfEntrypointController_list
   */
  'WfEntrypointController_list'(
    parameters?: Parameters<Paths.WfEntrypointControllerList.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.WfEntrypointControllerList.Responses.$200>
  /**
   * WfExecutionController_start
   */
  'WfExecutionController_start'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.WfExecutionControllerStart.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.WfExecutionControllerStart.Responses.$201>
  /**
   * WfExecutionController_test
   */
  'WfExecutionController_test'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.WfExecutionControllerTest.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.WfExecutionControllerTest.Responses.$201>
  /**
   * WfExecutionController_send
   */
  'WfExecutionController_send'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.WfExecutionControllerSend.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.WfExecutionControllerSend.Responses.$201>
  /**
   * WfExecutionController_get
   */
  'WfExecutionController_get'(
    parameters?: Parameters<Paths.WfExecutionControllerGet.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.WfExecutionControllerGet.Responses.$200>
  /**
   * WfExecutionController_handleHandoverCallback
   */
  'WfExecutionController_handleHandoverCallback'(
    parameters?: Parameters<Paths.WfExecutionControllerHandleHandoverCallback.PathParameters> | null,
    data?: Paths.WfExecutionControllerHandleHandoverCallback.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * StoreWfConfigurationController_list
   */
  'StoreWfConfigurationController_list'(
    parameters?: Parameters<Paths.StoreWfConfigurationControllerList.PathParameters & Paths.StoreWfConfigurationControllerList.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.StoreWfConfigurationControllerList.Responses.$200>
  /**
   * StoreWfConfigurationController_upsert
   */
  'StoreWfConfigurationController_upsert'(
    parameters?: Parameters<Paths.StoreWfConfigurationControllerUpsert.PathParameters> | null,
    data?: Paths.StoreWfConfigurationControllerUpsert.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.StoreWfConfigurationControllerUpsert.Responses.$201>
  /**
   * StoreWfEntrypointController_list
   */
  'StoreWfEntrypointController_list'(
    parameters?: Parameters<Paths.StoreWfEntrypointControllerList.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.StoreWfEntrypointControllerList.Responses.$200>
  /**
   * WfConfigurationTemplateController_upsert
   */
  'WfConfigurationTemplateController_upsert'(
    parameters?: Parameters<Paths.WfConfigurationTemplateControllerUpsert.PathParameters> | null,
    data?: Paths.WfConfigurationTemplateControllerUpsert.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.WfConfigurationTemplateControllerUpsert.Responses.$201>
  /**
   * WfConfigurationTemplateController_delete
   */
  'WfConfigurationTemplateController_delete'(
    parameters?: Parameters<Paths.WfConfigurationTemplateControllerDelete.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * WfConfigurationTemplateController_list
   */
  'WfConfigurationTemplateController_list'(
    parameters?: Parameters<Paths.WfConfigurationTemplateControllerList.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.WfConfigurationTemplateControllerList.Responses.$200>
  /**
   * WfConfigurationTemplateController_get
   */
  'WfConfigurationTemplateController_get'(
    parameters?: Parameters<Paths.WfConfigurationTemplateControllerGet.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.WfConfigurationTemplateControllerGet.Responses.$200>
  /**
   * StoreAppController_list
   */
  'StoreAppController_list'(
    parameters?: Parameters<Paths.StoreAppControllerList.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.StoreAppControllerList.Responses.$200>
  /**
   * StoreAppController_upsert
   */
  'StoreAppController_upsert'(
    parameters?: Parameters<Paths.StoreAppControllerUpsert.PathParameters> | null,
    data?: Paths.StoreAppControllerUpsert.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.StoreAppControllerUpsert.Responses.$201>
  /**
   * StoreAppController_delete
   */
  'StoreAppController_delete'(
    parameters?: Parameters<Paths.StoreAppControllerDelete.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * AppController_list
   */
  'AppController_list'(
    parameters?: Parameters<Paths.AppControllerList.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AppControllerList.Responses.$200>
  /**
   * AppController_get
   */
  'AppController_get'(
    parameters?: Parameters<Paths.AppControllerGet.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AppControllerGet.Responses.$200>
  /**
   * AppController_upsert
   */
  'AppController_upsert'(
    parameters?: Parameters<Paths.AppControllerUpsert.PathParameters> | null,
    data?: Paths.AppControllerUpsert.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AppControllerUpsert.Responses.$201>
  /**
   * AppController_delete
   */
  'AppController_delete'(
    parameters?: Parameters<Paths.AppControllerDelete.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<any>
  /**
   * AccountOauth2TokenController_upsert
   */
  'AccountOauth2TokenController_upsert'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.AccountOauth2TokenControllerUpsert.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AccountOauth2TokenControllerUpsert.Responses.$201>
  /**
   * HealthController_check
   */
  'HealthController_check'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.HealthControllerCheck.Responses.$200 | Paths.HealthControllerCheck.Responses.$503>
}

export interface PathsDictionary {
  ['/automation-events/{uuid}']: {
    /**
     * AutomationEventController_get
     */
    'get'(
      parameters?: Parameters<Paths.AutomationEventControllerGet.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AutomationEventControllerGet.Responses.$200>
  }
  ['/configurations']: {
    /**
     * WfConfigurationController_list
     */
    'get'(
      parameters?: Parameters<Paths.WfConfigurationControllerList.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.WfConfigurationControllerList.Responses.$200>
  }
  ['/configurations/{id}']: {
    /**
     * WfConfigurationController_get
     */
    'get'(
      parameters?: Parameters<Paths.WfConfigurationControllerGet.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.WfConfigurationControllerGet.Responses.$200>
  }
  ['/configurations/{internal_id}']: {
    /**
     * WfConfigurationController_upsert
     */
    'put'(
      parameters?: Parameters<Paths.WfConfigurationControllerUpsert.PathParameters> | null,
      data?: Paths.WfConfigurationControllerUpsert.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.WfConfigurationControllerUpsert.Responses.$201>
    /**
     * WfConfigurationController_delete
     */
    'delete'(
      parameters?: Parameters<Paths.WfConfigurationControllerDelete.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/configurations/{id}/duplicate']: {
    /**
     * WfConfigurationController_duplicate
     */
    'post'(
      parameters?: Parameters<Paths.WfConfigurationControllerDuplicate.PathParameters> | null,
      data?: Paths.WfConfigurationControllerDuplicate.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.WfConfigurationControllerDuplicate.Responses.$201>
  }
  ['/configurations/{internal_id}/steps/{step_id}/logs/export']: {
    /**
     * WfConfigurationController_exportStepLogs
     */
    'get'(
      parameters?: Parameters<Paths.WfConfigurationControllerExportStepLogs.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/configurations/{internal_id}/executions/{execution_id}/logs']: {
    /**
     * WfConfigurationController_exportExecutionLogs
     */
    'get'(
      parameters?: Parameters<Paths.WfConfigurationControllerExportExecutionLogs.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.WfConfigurationControllerExportExecutionLogs.Responses.$200>
  }
  ['/configurations/{internal_id}/executions/{execution_id}']: {
    /**
     * WfConfigurationController_getExecution
     */
    'get'(
      parameters?: Parameters<Paths.WfConfigurationControllerGetExecution.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.WfConfigurationControllerGetExecution.Responses.$200>
  }
  ['/configurations/{internal_id}/executions']: {
    /**
     * WfConfigurationController_getExecutions
     */
    'get'(
      parameters?: Parameters<Paths.WfConfigurationControllerGetExecutions.PathParameters & Paths.WfConfigurationControllerGetExecutions.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.WfConfigurationControllerGetExecutions.Responses.$200>
  }
  ['/configurations/{internal_id}/translations/{lang}']: {
    /**
     * WfConfigurationTranslationsController_get
     */
    'get'(
      parameters?: Parameters<Paths.WfConfigurationTranslationsControllerGet.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.WfConfigurationTranslationsControllerGet.Responses.$200>
    /**
     * WfConfigurationTranslationsController_upsert
     */
    'put'(
      parameters?: Parameters<Paths.WfConfigurationTranslationsControllerUpsert.PathParameters> | null,
      data?: Paths.WfConfigurationTranslationsControllerUpsert.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.WfConfigurationTranslationsControllerUpsert.Responses.$201>
    /**
     * WfConfigurationTranslationsController_delete
     */
    'delete'(
      parameters?: Parameters<Paths.WfConfigurationTranslationsControllerDelete.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/entrypoints']: {
    /**
     * WfEntrypointController_list
     */
    'get'(
      parameters?: Parameters<Paths.WfEntrypointControllerList.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.WfEntrypointControllerList.Responses.$200>
  }
  ['/executions/start']: {
    /**
     * WfExecutionController_start
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.WfExecutionControllerStart.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.WfExecutionControllerStart.Responses.$201>
  }
  ['/executions/test']: {
    /**
     * WfExecutionController_test
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.WfExecutionControllerTest.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.WfExecutionControllerTest.Responses.$201>
  }
  ['/executions/send']: {
    /**
     * WfExecutionController_send
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.WfExecutionControllerSend.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.WfExecutionControllerSend.Responses.$201>
  }
  ['/executions/{id}']: {
    /**
     * WfExecutionController_get
     */
    'get'(
      parameters?: Parameters<Paths.WfExecutionControllerGet.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.WfExecutionControllerGet.Responses.$200>
  }
  ['/executions/{id}/handover-callback']: {
    /**
     * WfExecutionController_handleHandoverCallback
     */
    'post'(
      parameters?: Parameters<Paths.WfExecutionControllerHandleHandoverCallback.PathParameters> | null,
      data?: Paths.WfExecutionControllerHandleHandoverCallback.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/stores/{store_type}/{store_name}/configurations']: {
    /**
     * StoreWfConfigurationController_list
     */
    'get'(
      parameters?: Parameters<Paths.StoreWfConfigurationControllerList.PathParameters & Paths.StoreWfConfigurationControllerList.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.StoreWfConfigurationControllerList.Responses.$200>
  }
  ['/stores/{store_type}/{store_name}/configurations/{internal_id}']: {
    /**
     * StoreWfConfigurationController_upsert
     */
    'put'(
      parameters?: Parameters<Paths.StoreWfConfigurationControllerUpsert.PathParameters> | null,
      data?: Paths.StoreWfConfigurationControllerUpsert.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.StoreWfConfigurationControllerUpsert.Responses.$201>
  }
  ['/accounts/{account_id}/stores/{store_type}/{store_name}/entrypoints/llm-conversation']: {
    /**
     * StoreWfEntrypointController_list
     */
    'get'(
      parameters?: Parameters<Paths.StoreWfEntrypointControllerList.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.StoreWfEntrypointControllerList.Responses.$200>
  }
  ['/configuration-templates/{internal_id}']: {
    /**
     * WfConfigurationTemplateController_upsert
     */
    'put'(
      parameters?: Parameters<Paths.WfConfigurationTemplateControllerUpsert.PathParameters> | null,
      data?: Paths.WfConfigurationTemplateControllerUpsert.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.WfConfigurationTemplateControllerUpsert.Responses.$201>
    /**
     * WfConfigurationTemplateController_delete
     */
    'delete'(
      parameters?: Parameters<Paths.WfConfigurationTemplateControllerDelete.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/configuration-templates']: {
    /**
     * WfConfigurationTemplateController_list
     */
    'get'(
      parameters?: Parameters<Paths.WfConfigurationTemplateControllerList.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.WfConfigurationTemplateControllerList.Responses.$200>
  }
  ['/configuration-templates/{id}']: {
    /**
     * WfConfigurationTemplateController_get
     */
    'get'(
      parameters?: Parameters<Paths.WfConfigurationTemplateControllerGet.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.WfConfigurationTemplateControllerGet.Responses.$200>
  }
  ['/stores/{store_type}/{store_name}/apps']: {
    /**
     * StoreAppController_list
     */
    'get'(
      parameters?: Parameters<Paths.StoreAppControllerList.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.StoreAppControllerList.Responses.$200>
  }
  ['/stores/{store_type}/{store_name}/apps/{type}']: {
    /**
     * StoreAppController_upsert
     */
    'put'(
      parameters?: Parameters<Paths.StoreAppControllerUpsert.PathParameters> | null,
      data?: Paths.StoreAppControllerUpsert.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.StoreAppControllerUpsert.Responses.$201>
    /**
     * StoreAppController_delete
     */
    'delete'(
      parameters?: Parameters<Paths.StoreAppControllerDelete.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/apps']: {
    /**
     * AppController_list
     */
    'get'(
      parameters?: Parameters<Paths.AppControllerList.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AppControllerList.Responses.$200>
  }
  ['/apps/{id}']: {
    /**
     * AppController_get
     */
    'get'(
      parameters?: Parameters<Paths.AppControllerGet.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AppControllerGet.Responses.$200>
    /**
     * AppController_upsert
     */
    'put'(
      parameters?: Parameters<Paths.AppControllerUpsert.PathParameters> | null,
      data?: Paths.AppControllerUpsert.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AppControllerUpsert.Responses.$201>
    /**
     * AppController_delete
     */
    'delete'(
      parameters?: Parameters<Paths.AppControllerDelete.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<any>
  }
  ['/account-oauth2-token']: {
    /**
     * AccountOauth2TokenController_upsert
     */
    'put'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.AccountOauth2TokenControllerUpsert.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AccountOauth2TokenControllerUpsert.Responses.$201>
  }
  ['/health']: {
    /**
     * HealthController_check
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.HealthControllerCheck.Responses.$200 | Paths.HealthControllerCheck.Responses.$503>
  }
}

export type Client = OpenAPIClient<OperationMethods, PathsDictionary>
