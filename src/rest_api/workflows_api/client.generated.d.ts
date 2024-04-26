/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import {
    OpenAPIClient,
    Parameters,
    UnknownParamsObject,
    OperationResponse,
    AxiosRequestConfig,
} from 'openapi-client-axios'

declare namespace Components {
    namespace Schemas {
        export interface DuplicateWfConfigurationRequestDto {
            integration_id: number
        }
        export interface StoreWfConfigurationResponseDto {
            internal_id: string
            id: string
            account_id?: number | null
            name: string
            is_draft: boolean
            initial_step_id: string
            entrypoint?: {
                label: string
                label_tkey: string
            } | null
            steps: (
                | {
                      id: string
                      kind: 'choices'
                      settings: {
                          choices: {
                              event_id: string
                              label: string
                              label_tkey: string
                          }[]
                          message: {
                              content: {
                                  html: string
                                  html_tkey: string
                                  text: string
                                  text_tkey: string
                                  attachments?:
                                      | {
                                            content_type: 'application/productCard'
                                            name?: string | null
                                            size?: number | null
                                            url: string
                                            extra?: {
                                                product_id?: number | null
                                                variant_id?: number | null
                                                price?: string | null
                                                variant_name?: string | null
                                                product_link?: string | null
                                                currency?: string | null
                                                featured_image?: string | null
                                            } | null
                                        }[]
                                      | null
                              }
                          }
                      }
                  }
                | {
                      id: string
                      kind: 'handover'
                      settings?: {
                          ticket_tags?: string[] | null
                          ticket_assignee_user_id?: null | number
                          ticket_assignee_team_id?: null | number
                      } | null
                  }
                | {
                      id: string
                      kind: 'workflow_call'
                      settings: {
                          configuration_id: string
                      }
                  }
                | {
                      id: string
                      kind: 'text-input'
                      settings: {
                          message: {
                              content: {
                                  html: string
                                  html_tkey: string
                                  text: string
                                  text_tkey: string
                                  attachments?:
                                      | {
                                            content_type: 'application/productCard'
                                            name?: string | null
                                            size?: number | null
                                            url: string
                                            extra?: {
                                                product_id?: number | null
                                                variant_id?: number | null
                                                price?: string | null
                                                variant_name?: string | null
                                                product_link?: string | null
                                                currency?: string | null
                                                featured_image?: string | null
                                            } | null
                                        }[]
                                      | null
                              }
                          }
                      }
                  }
                | {
                      id: string
                      kind: 'attachments-input'
                      settings: {
                          message: {
                              content: {
                                  html: string
                                  html_tkey: string
                                  text: string
                                  text_tkey: string
                                  attachments?:
                                      | {
                                            content_type: 'application/productCard'
                                            name?: string | null
                                            size?: number | null
                                            url: string
                                            extra?: {
                                                product_id?: number | null
                                                variant_id?: number | null
                                                price?: string | null
                                                variant_name?: string | null
                                                product_link?: string | null
                                                currency?: string | null
                                                featured_image?: string | null
                                            } | null
                                        }[]
                                      | null
                              }
                          }
                      }
                  }
                | {
                      id: string
                      kind: 'shopper-authentication'
                      settings: {
                          integration_id: number
                      }
                  }
                | {
                      id: string
                      kind: 'order-selection'
                      settings: {
                          message: {
                              content: {
                                  html: string
                                  html_tkey: string
                                  text: string
                                  text_tkey: string
                                  attachments?:
                                      | {
                                            content_type: 'application/productCard'
                                            name?: string | null
                                            size?: number | null
                                            url: string
                                            extra?: {
                                                product_id?: number | null
                                                variant_id?: number | null
                                                price?: string | null
                                                variant_name?: string | null
                                                product_link?: string | null
                                                currency?: string | null
                                                featured_image?: string | null
                                            } | null
                                        }[]
                                      | null
                              }
                          }
                      }
                  }
                | {
                      id: string
                      kind: 'http-request'
                      settings: {
                          name: string
                          url: string /* uri */ | ''
                          method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
                          headers?: {
                              [name: string]: string
                          } | null
                          body?: string | null
                          variables: {
                              id: string
                              name: string
                              jsonpath: string
                              data_type?:
                                  | 'string'
                                  | 'number'
                                  | 'date'
                                  | 'boolean'
                          }[]
                      }
                  }
                | {
                      id: string
                      kind: 'helpful-prompt'
                      settings?: {
                          ticket_tags?: string[] | null
                          ticket_assignee_user_id?: null | number
                          ticket_assignee_team_id?: null | number
                      } | null
                  }
                | {
                      id: string
                      kind: 'message'
                      settings: {
                          message: {
                              content: {
                                  html: string
                                  html_tkey: string
                                  text: string
                                  text_tkey: string
                                  attachments?:
                                      | {
                                            content_type: 'application/productCard'
                                            name?: string | null
                                            size?: number | null
                                            url: string
                                            extra?: {
                                                product_id?: number | null
                                                variant_id?: number | null
                                                price?: string | null
                                                variant_name?: string | null
                                                product_link?: string | null
                                                currency?: string | null
                                                featured_image?: string | null
                                            } | null
                                        }[]
                                      | null
                              }
                          }
                      }
                  }
                | {
                      id: string
                      kind: 'end'
                  }
                | {
                      id: string
                      kind: 'conditions'
                      settings: {
                          name: string
                      }
                  }
                | {
                      id: string
                      kind: 'order-line-item-selection'
                      settings: {
                          message: {
                              content: {
                                  html: string
                                  html_tkey: string
                                  text: string
                                  text_tkey: string
                                  attachments?:
                                      | {
                                            content_type: 'application/productCard'
                                            name?: string | null
                                            size?: number | null
                                            url: string
                                            extra?: {
                                                product_id?: number | null
                                                variant_id?: number | null
                                                price?: string | null
                                                variant_name?: string | null
                                                product_link?: string | null
                                                currency?: string | null
                                                featured_image?: string | null
                                            } | null
                                        }[]
                                      | null
                              }
                          }
                      }
                  }
            )[]
            transitions: {
                id: string
                from_step_id: string
                to_step_id: string
                event?: {
                    id: string
                    kind: 'choices'
                } | null
                name?: string | null
                conditions?:
                    | {
                          or: (
                              | {
                                    equals: any
                                }
                              | {
                                    notEqual: any
                                }
                              | {
                                    contains: any
                                }
                              | {
                                    doesNotContain: any
                                }
                              | {
                                    endsWith: any
                                }
                              | {
                                    startsWith: any
                                }
                              | {
                                    exists: any
                                }
                              | {
                                    doesNotExist: any
                                }
                              | {
                                    lessThan: any
                                }
                              | {
                                    lessThanInterval: any
                                }
                              | {
                                    lessOrEqual: any
                                }
                              | {
                                    greaterThan: any
                                }
                              | {
                                    greaterThanInterval: any
                                }
                              | {
                                    greaterOrEqual: any
                                }
                          )[]
                      }
                    | {
                          and: (
                              | {
                                    equals: any
                                }
                              | {
                                    notEqual: any
                                }
                              | {
                                    contains: any
                                }
                              | {
                                    doesNotContain: any
                                }
                              | {
                                    endsWith: any
                                }
                              | {
                                    startsWith: any
                                }
                              | {
                                    exists: any
                                }
                              | {
                                    doesNotExist: any
                                }
                              | {
                                    lessThan: any
                                }
                              | {
                                    lessThanInterval: any
                                }
                              | {
                                    lessOrEqual: any
                                }
                              | {
                                    greaterThan: any
                                }
                              | {
                                    greaterThanInterval: any
                                }
                              | {
                                    greaterOrEqual: any
                                }
                          )[]
                      }
            }[]
            available_languages: (
                | 'en-US'
                | 'en-GB'
                | 'fr-FR'
                | 'fr-CA'
                | 'es-ES'
                | 'de-DE'
                | 'nl-NL'
                | 'cs-CZ'
                | 'da-DK'
                | 'no-NO'
                | 'it-IT'
                | 'sv-SE'
                | 'fi-FI'
                | 'ja-JP'
                | 'pt-BR'
            )[]
            created_datetime?: string | null // date-time
            updated_datetime?: string | null // date-time
            deleted_datetime?: string | null // date-time
            triggers: {
                kind: 'llm-prompt'
                settings: {
                    custom_inputs: {
                        id: string
                        name: string
                        instructions: string
                        data_type: 'string' | 'number' | 'date' | 'boolean'
                    }[]
                    object_inputs: {
                        kind: 'customer' | 'order'
                    }[]
                    conditions?:
                        | {
                              or: (
                                  | {
                                        equals: any
                                    }
                                  | {
                                        notEqual: any
                                    }
                                  | {
                                        contains: any
                                    }
                                  | {
                                        doesNotContain: any
                                    }
                                  | {
                                        endsWith: any
                                    }
                                  | {
                                        startsWith: any
                                    }
                                  | {
                                        exists: any
                                    }
                                  | {
                                        doesNotExist: any
                                    }
                                  | {
                                        lessThan: any
                                    }
                                  | {
                                        lessThanInterval: any
                                    }
                                  | {
                                        lessOrEqual: any
                                    }
                                  | {
                                        greaterThan: any
                                    }
                                  | {
                                        greaterThanInterval: any
                                    }
                                  | {
                                        greaterOrEqual: any
                                    }
                              )[]
                          }
                        | {
                              and: (
                                  | {
                                        equals: any
                                    }
                                  | {
                                        notEqual: any
                                    }
                                  | {
                                        contains: any
                                    }
                                  | {
                                        doesNotContain: any
                                    }
                                  | {
                                        endsWith: any
                                    }
                                  | {
                                        startsWith: any
                                    }
                                  | {
                                        exists: any
                                    }
                                  | {
                                        doesNotExist: any
                                    }
                                  | {
                                        lessThan: any
                                    }
                                  | {
                                        lessThanInterval: any
                                    }
                                  | {
                                        lessOrEqual: any
                                    }
                                  | {
                                        greaterThan: any
                                    }
                                  | {
                                        greaterThanInterval: any
                                    }
                                  | {
                                        greaterOrEqual: any
                                    }
                              )[]
                          }
                    output_description: string
                }
            }[]
            entrypoints: {
                deactivated_datetime?: string | null // date-time
                kind: 'llm-conversation'
                trigger: 'llm-prompt'
                settings: {
                    requires_confirmation: boolean
                    instructions: string
                }
            }[]
        }
        export interface UpsertStoreWfConfigurationRequestBodyDto {
            id: string
            name: string
            is_draft: boolean
            initial_step_id: string
            entrypoint?: {
                label: string
                label_tkey: string
            } | null
            steps: (
                | {
                      id: string
                      kind: 'choices'
                      settings: {
                          choices: {
                              event_id: string
                              label: string
                              label_tkey: string
                          }[]
                          message: {
                              content: {
                                  html: string
                                  html_tkey: string
                                  text: string
                                  text_tkey: string
                                  attachments?:
                                      | {
                                            content_type: 'application/productCard'
                                            name?: string | null
                                            size?: number | null
                                            url: string
                                            extra?: {
                                                product_id?: number | null
                                                variant_id?: number | null
                                                price?: string | null
                                                variant_name?: string | null
                                                product_link?: string | null
                                                currency?: string | null
                                                featured_image?: string | null
                                            } | null
                                        }[]
                                      | null
                              }
                          }
                      }
                  }
                | {
                      id: string
                      kind: 'handover'
                      settings?: {
                          ticket_tags?: string[] | null
                          ticket_assignee_user_id?: null | number
                          ticket_assignee_team_id?: null | number
                      } | null
                  }
                | {
                      id: string
                      kind: 'workflow_call'
                      settings: {
                          configuration_id: string
                      }
                  }
                | {
                      id: string
                      kind: 'text-input'
                      settings: {
                          message: {
                              content: {
                                  html: string
                                  html_tkey: string
                                  text: string
                                  text_tkey: string
                                  attachments?:
                                      | {
                                            content_type: 'application/productCard'
                                            name?: string | null
                                            size?: number | null
                                            url: string
                                            extra?: {
                                                product_id?: number | null
                                                variant_id?: number | null
                                                price?: string | null
                                                variant_name?: string | null
                                                product_link?: string | null
                                                currency?: string | null
                                                featured_image?: string | null
                                            } | null
                                        }[]
                                      | null
                              }
                          }
                      }
                  }
                | {
                      id: string
                      kind: 'attachments-input'
                      settings: {
                          message: {
                              content: {
                                  html: string
                                  html_tkey: string
                                  text: string
                                  text_tkey: string
                                  attachments?:
                                      | {
                                            content_type: 'application/productCard'
                                            name?: string | null
                                            size?: number | null
                                            url: string
                                            extra?: {
                                                product_id?: number | null
                                                variant_id?: number | null
                                                price?: string | null
                                                variant_name?: string | null
                                                product_link?: string | null
                                                currency?: string | null
                                                featured_image?: string | null
                                            } | null
                                        }[]
                                      | null
                              }
                          }
                      }
                  }
                | {
                      id: string
                      kind: 'shopper-authentication'
                      settings: {
                          integration_id: number
                      }
                  }
                | {
                      id: string
                      kind: 'order-selection'
                      settings: {
                          message: {
                              content: {
                                  html: string
                                  html_tkey: string
                                  text: string
                                  text_tkey: string
                                  attachments?:
                                      | {
                                            content_type: 'application/productCard'
                                            name?: string | null
                                            size?: number | null
                                            url: string
                                            extra?: {
                                                product_id?: number | null
                                                variant_id?: number | null
                                                price?: string | null
                                                variant_name?: string | null
                                                product_link?: string | null
                                                currency?: string | null
                                                featured_image?: string | null
                                            } | null
                                        }[]
                                      | null
                              }
                          }
                      }
                  }
                | {
                      id: string
                      kind: 'http-request'
                      settings: {
                          name: string
                          url: string /* uri */ | ''
                          method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
                          headers?: {
                              [name: string]: string
                          } | null
                          body?: string | null
                          variables: {
                              id: string
                              name: string
                              jsonpath: string
                              data_type?:
                                  | 'string'
                                  | 'number'
                                  | 'date'
                                  | 'boolean'
                          }[]
                      }
                  }
                | {
                      id: string
                      kind: 'helpful-prompt'
                      settings?: {
                          ticket_tags?: string[] | null
                          ticket_assignee_user_id?: null | number
                          ticket_assignee_team_id?: null | number
                      } | null
                  }
                | {
                      id: string
                      kind: 'message'
                      settings: {
                          message: {
                              content: {
                                  html: string
                                  html_tkey: string
                                  text: string
                                  text_tkey: string
                                  attachments?:
                                      | {
                                            content_type: 'application/productCard'
                                            name?: string | null
                                            size?: number | null
                                            url: string
                                            extra?: {
                                                product_id?: number | null
                                                variant_id?: number | null
                                                price?: string | null
                                                variant_name?: string | null
                                                product_link?: string | null
                                                currency?: string | null
                                                featured_image?: string | null
                                            } | null
                                        }[]
                                      | null
                              }
                          }
                      }
                  }
                | {
                      id: string
                      kind: 'end'
                  }
                | {
                      id: string
                      kind: 'conditions'
                      settings: {
                          name: string
                      }
                  }
                | {
                      id: string
                      kind: 'order-line-item-selection'
                      settings: {
                          message: {
                              content: {
                                  html: string
                                  html_tkey: string
                                  text: string
                                  text_tkey: string
                                  attachments?:
                                      | {
                                            content_type: 'application/productCard'
                                            name?: string | null
                                            size?: number | null
                                            url: string
                                            extra?: {
                                                product_id?: number | null
                                                variant_id?: number | null
                                                price?: string | null
                                                variant_name?: string | null
                                                product_link?: string | null
                                                currency?: string | null
                                                featured_image?: string | null
                                            } | null
                                        }[]
                                      | null
                              }
                          }
                      }
                  }
            )[]
            transitions: {
                id: string
                from_step_id: string
                to_step_id: string
                event?: {
                    id: string
                    kind: 'choices'
                } | null
                name?: string | null
                conditions?:
                    | {
                          or: (
                              | {
                                    equals: any
                                }
                              | {
                                    notEqual: any
                                }
                              | {
                                    contains: any
                                }
                              | {
                                    doesNotContain: any
                                }
                              | {
                                    endsWith: any
                                }
                              | {
                                    startsWith: any
                                }
                              | {
                                    exists: any
                                }
                              | {
                                    doesNotExist: any
                                }
                              | {
                                    lessThan: any
                                }
                              | {
                                    lessThanInterval: any
                                }
                              | {
                                    lessOrEqual: any
                                }
                              | {
                                    greaterThan: any
                                }
                              | {
                                    greaterThanInterval: any
                                }
                              | {
                                    greaterOrEqual: any
                                }
                          )[]
                      }
                    | {
                          and: (
                              | {
                                    equals: any
                                }
                              | {
                                    notEqual: any
                                }
                              | {
                                    contains: any
                                }
                              | {
                                    doesNotContain: any
                                }
                              | {
                                    endsWith: any
                                }
                              | {
                                    startsWith: any
                                }
                              | {
                                    exists: any
                                }
                              | {
                                    doesNotExist: any
                                }
                              | {
                                    lessThan: any
                                }
                              | {
                                    lessThanInterval: any
                                }
                              | {
                                    lessOrEqual: any
                                }
                              | {
                                    greaterThan: any
                                }
                              | {
                                    greaterThanInterval: any
                                }
                              | {
                                    greaterOrEqual: any
                                }
                          )[]
                      }
            }[]
            available_languages: (
                | 'en-US'
                | 'en-GB'
                | 'fr-FR'
                | 'fr-CA'
                | 'es-ES'
                | 'de-DE'
                | 'nl-NL'
                | 'cs-CZ'
                | 'da-DK'
                | 'no-NO'
                | 'it-IT'
                | 'sv-SE'
                | 'fi-FI'
                | 'ja-JP'
                | 'pt-BR'
            )[]
            triggers: {
                kind: 'llm-prompt'
                settings: {
                    custom_inputs: {
                        id: string
                        name: string
                        instructions: string
                        data_type: 'string' | 'number' | 'date' | 'boolean'
                    }[]
                    object_inputs: {
                        kind: 'customer' | 'order'
                    }[]
                    conditions?:
                        | {
                              or: (
                                  | {
                                        equals: any
                                    }
                                  | {
                                        notEqual: any
                                    }
                                  | {
                                        contains: any
                                    }
                                  | {
                                        doesNotContain: any
                                    }
                                  | {
                                        endsWith: any
                                    }
                                  | {
                                        startsWith: any
                                    }
                                  | {
                                        exists: any
                                    }
                                  | {
                                        doesNotExist: any
                                    }
                                  | {
                                        lessThan: any
                                    }
                                  | {
                                        lessThanInterval: any
                                    }
                                  | {
                                        lessOrEqual: any
                                    }
                                  | {
                                        greaterThan: any
                                    }
                                  | {
                                        greaterThanInterval: any
                                    }
                                  | {
                                        greaterOrEqual: any
                                    }
                              )[]
                          }
                        | {
                              and: (
                                  | {
                                        equals: any
                                    }
                                  | {
                                        notEqual: any
                                    }
                                  | {
                                        contains: any
                                    }
                                  | {
                                        doesNotContain: any
                                    }
                                  | {
                                        endsWith: any
                                    }
                                  | {
                                        startsWith: any
                                    }
                                  | {
                                        exists: any
                                    }
                                  | {
                                        doesNotExist: any
                                    }
                                  | {
                                        lessThan: any
                                    }
                                  | {
                                        lessThanInterval: any
                                    }
                                  | {
                                        lessOrEqual: any
                                    }
                                  | {
                                        greaterThan: any
                                    }
                                  | {
                                        greaterThanInterval: any
                                    }
                                  | {
                                        greaterOrEqual: any
                                    }
                              )[]
                          }
                    output_description: string
                }
            }[]
            entrypoints: {
                deactivated_datetime?: string | null // date-time
                kind: 'llm-conversation'
                trigger: 'llm-prompt'
                settings: {
                    requires_confirmation: boolean
                    instructions: string
                }
            }[]
        }
        export interface UpsertWfConfigurationRequestDto {
            id: string
            name: string
            is_draft: boolean
            initial_step_id: string
            entrypoint?: {
                label: string
                label_tkey: string
            } | null
            steps: (
                | {
                      id: string
                      kind: 'choices'
                      settings: {
                          choices: {
                              event_id: string
                              label: string
                              label_tkey: string
                          }[]
                          message: {
                              content: {
                                  html: string
                                  html_tkey: string
                                  text: string
                                  text_tkey: string
                                  attachments?:
                                      | {
                                            content_type: 'application/productCard'
                                            name?: string | null
                                            size?: number | null
                                            url: string
                                            extra?: {
                                                product_id?: number | null
                                                variant_id?: number | null
                                                price?: string | null
                                                variant_name?: string | null
                                                product_link?: string | null
                                                currency?: string | null
                                                featured_image?: string | null
                                            } | null
                                        }[]
                                      | null
                              }
                          }
                      }
                  }
                | {
                      id: string
                      kind: 'handover'
                      settings?: {
                          ticket_tags?: string[] | null
                          ticket_assignee_user_id?: null | number
                          ticket_assignee_team_id?: null | number
                      } | null
                  }
                | {
                      id: string
                      kind: 'workflow_call'
                      settings: {
                          configuration_id: string
                      }
                  }
                | {
                      id: string
                      kind: 'text-input'
                      settings: {
                          message: {
                              content: {
                                  html: string
                                  html_tkey: string
                                  text: string
                                  text_tkey: string
                                  attachments?:
                                      | {
                                            content_type: 'application/productCard'
                                            name?: string | null
                                            size?: number | null
                                            url: string
                                            extra?: {
                                                product_id?: number | null
                                                variant_id?: number | null
                                                price?: string | null
                                                variant_name?: string | null
                                                product_link?: string | null
                                                currency?: string | null
                                                featured_image?: string | null
                                            } | null
                                        }[]
                                      | null
                              }
                          }
                      }
                  }
                | {
                      id: string
                      kind: 'attachments-input'
                      settings: {
                          message: {
                              content: {
                                  html: string
                                  html_tkey: string
                                  text: string
                                  text_tkey: string
                                  attachments?:
                                      | {
                                            content_type: 'application/productCard'
                                            name?: string | null
                                            size?: number | null
                                            url: string
                                            extra?: {
                                                product_id?: number | null
                                                variant_id?: number | null
                                                price?: string | null
                                                variant_name?: string | null
                                                product_link?: string | null
                                                currency?: string | null
                                                featured_image?: string | null
                                            } | null
                                        }[]
                                      | null
                              }
                          }
                      }
                  }
                | {
                      id: string
                      kind: 'shopper-authentication'
                      settings: {
                          integration_id: number
                      }
                  }
                | {
                      id: string
                      kind: 'order-selection'
                      settings: {
                          message: {
                              content: {
                                  html: string
                                  html_tkey: string
                                  text: string
                                  text_tkey: string
                                  attachments?:
                                      | {
                                            content_type: 'application/productCard'
                                            name?: string | null
                                            size?: number | null
                                            url: string
                                            extra?: {
                                                product_id?: number | null
                                                variant_id?: number | null
                                                price?: string | null
                                                variant_name?: string | null
                                                product_link?: string | null
                                                currency?: string | null
                                                featured_image?: string | null
                                            } | null
                                        }[]
                                      | null
                              }
                          }
                      }
                  }
                | {
                      id: string
                      kind: 'http-request'
                      settings: {
                          name: string
                          url: string /* uri */ | ''
                          method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
                          headers?: {
                              [name: string]: string
                          } | null
                          body?: string | null
                          variables: {
                              id: string
                              name: string
                              jsonpath: string
                              data_type?:
                                  | 'string'
                                  | 'number'
                                  | 'date'
                                  | 'boolean'
                          }[]
                      }
                  }
                | {
                      id: string
                      kind: 'helpful-prompt'
                      settings?: {
                          ticket_tags?: string[] | null
                          ticket_assignee_user_id?: null | number
                          ticket_assignee_team_id?: null | number
                      } | null
                  }
                | {
                      id: string
                      kind: 'message'
                      settings: {
                          message: {
                              content: {
                                  html: string
                                  html_tkey: string
                                  text: string
                                  text_tkey: string
                                  attachments?:
                                      | {
                                            content_type: 'application/productCard'
                                            name?: string | null
                                            size?: number | null
                                            url: string
                                            extra?: {
                                                product_id?: number | null
                                                variant_id?: number | null
                                                price?: string | null
                                                variant_name?: string | null
                                                product_link?: string | null
                                                currency?: string | null
                                                featured_image?: string | null
                                            } | null
                                        }[]
                                      | null
                              }
                          }
                      }
                  }
                | {
                      id: string
                      kind: 'end'
                  }
                | {
                      id: string
                      kind: 'conditions'
                      settings: {
                          name: string
                      }
                  }
                | {
                      id: string
                      kind: 'order-line-item-selection'
                      settings: {
                          message: {
                              content: {
                                  html: string
                                  html_tkey: string
                                  text: string
                                  text_tkey: string
                                  attachments?:
                                      | {
                                            content_type: 'application/productCard'
                                            name?: string | null
                                            size?: number | null
                                            url: string
                                            extra?: {
                                                product_id?: number | null
                                                variant_id?: number | null
                                                price?: string | null
                                                variant_name?: string | null
                                                product_link?: string | null
                                                currency?: string | null
                                                featured_image?: string | null
                                            } | null
                                        }[]
                                      | null
                              }
                          }
                      }
                  }
            )[]
            transitions: {
                id: string
                from_step_id: string
                to_step_id: string
                event?: {
                    id: string
                    kind: 'choices'
                } | null
                name?: string | null
                conditions?:
                    | {
                          or: (
                              | {
                                    equals: any
                                }
                              | {
                                    notEqual: any
                                }
                              | {
                                    contains: any
                                }
                              | {
                                    doesNotContain: any
                                }
                              | {
                                    endsWith: any
                                }
                              | {
                                    startsWith: any
                                }
                              | {
                                    exists: any
                                }
                              | {
                                    doesNotExist: any
                                }
                              | {
                                    lessThan: any
                                }
                              | {
                                    lessThanInterval: any
                                }
                              | {
                                    lessOrEqual: any
                                }
                              | {
                                    greaterThan: any
                                }
                              | {
                                    greaterThanInterval: any
                                }
                              | {
                                    greaterOrEqual: any
                                }
                          )[]
                      }
                    | {
                          and: (
                              | {
                                    equals: any
                                }
                              | {
                                    notEqual: any
                                }
                              | {
                                    contains: any
                                }
                              | {
                                    doesNotContain: any
                                }
                              | {
                                    endsWith: any
                                }
                              | {
                                    startsWith: any
                                }
                              | {
                                    exists: any
                                }
                              | {
                                    doesNotExist: any
                                }
                              | {
                                    lessThan: any
                                }
                              | {
                                    lessThanInterval: any
                                }
                              | {
                                    lessOrEqual: any
                                }
                              | {
                                    greaterThan: any
                                }
                              | {
                                    greaterThanInterval: any
                                }
                              | {
                                    greaterOrEqual: any
                                }
                          )[]
                      }
            }[]
            available_languages: (
                | 'en-US'
                | 'en-GB'
                | 'fr-FR'
                | 'fr-CA'
                | 'es-ES'
                | 'de-DE'
                | 'nl-NL'
                | 'cs-CZ'
                | 'da-DK'
                | 'no-NO'
                | 'it-IT'
                | 'sv-SE'
                | 'fi-FI'
                | 'ja-JP'
                | 'pt-BR'
            )[]
            triggers?:
                | {
                      kind: 'llm-prompt'
                      settings: {
                          custom_inputs: {
                              id: string
                              name: string
                              instructions: string
                              data_type:
                                  | 'string'
                                  | 'number'
                                  | 'date'
                                  | 'boolean'
                          }[]
                          object_inputs: {
                              kind: 'customer' | 'order'
                          }[]
                          conditions?:
                              | {
                                    or: (
                                        | {
                                              equals: any
                                          }
                                        | {
                                              notEqual: any
                                          }
                                        | {
                                              contains: any
                                          }
                                        | {
                                              doesNotContain: any
                                          }
                                        | {
                                              endsWith: any
                                          }
                                        | {
                                              startsWith: any
                                          }
                                        | {
                                              exists: any
                                          }
                                        | {
                                              doesNotExist: any
                                          }
                                        | {
                                              lessThan: any
                                          }
                                        | {
                                              lessThanInterval: any
                                          }
                                        | {
                                              lessOrEqual: any
                                          }
                                        | {
                                              greaterThan: any
                                          }
                                        | {
                                              greaterThanInterval: any
                                          }
                                        | {
                                              greaterOrEqual: any
                                          }
                                    )[]
                                }
                              | {
                                    and: (
                                        | {
                                              equals: any
                                          }
                                        | {
                                              notEqual: any
                                          }
                                        | {
                                              contains: any
                                          }
                                        | {
                                              doesNotContain: any
                                          }
                                        | {
                                              endsWith: any
                                          }
                                        | {
                                              startsWith: any
                                          }
                                        | {
                                              exists: any
                                          }
                                        | {
                                              doesNotExist: any
                                          }
                                        | {
                                              lessThan: any
                                          }
                                        | {
                                              lessThanInterval: any
                                          }
                                        | {
                                              lessOrEqual: any
                                          }
                                        | {
                                              greaterThan: any
                                          }
                                        | {
                                              greaterThanInterval: any
                                          }
                                        | {
                                              greaterOrEqual: any
                                          }
                                    )[]
                                }
                          output_description: string
                      }
                  }[]
                | null
            entrypoints?:
                | {
                      deactivated_datetime?: string | null // date-time
                      kind: 'llm-conversation'
                      trigger: 'llm-prompt'
                      settings: {
                          requires_confirmation: boolean
                          instructions: string
                      }
                  }[]
                | null
        }
        export interface UpsertWfConfigurationTranslationsRequestBodyDto {
            [name: string]: string
        }
        export interface WfExecutionHandoverCallbackRequestDto {
            ticket_id: number
        }
    }
}
declare namespace Paths {
    namespace StoreWfConfigurationControllerList {
        namespace Parameters {
            export type StoreName = string
            export type StoreType = 'shopify'
            export type Triggers = any[]
        }
        export interface PathParameters {
            store_type: Parameters.StoreType
            store_name: Parameters.StoreName
        }
        export interface QueryParameters {
            triggers: Parameters.Triggers
        }
        namespace Responses {
            export type $201 =
                Components.Schemas.StoreWfConfigurationResponseDto[]
        }
    }
    namespace StoreWfConfigurationControllerUpsert {
        namespace Parameters {
            export type InternalId = string
            export type StoreName = string
            export type StoreType = 'shopify'
        }
        export interface PathParameters {
            store_type: Parameters.StoreType
            store_name: Parameters.StoreName
            internal_id: Parameters.InternalId
        }
        export type RequestBody =
            Components.Schemas.UpsertStoreWfConfigurationRequestBodyDto
        namespace Responses {
            export type $201 =
                Components.Schemas.StoreWfConfigurationResponseDto
        }
    }
    namespace WfConfigurationControllerDelete {
        namespace Parameters {
            export type InternalId = string
        }
        export interface PathParameters {
            internal_id: Parameters.InternalId
        }
    }
}

export interface OperationMethods {
    /**
     * StoreWfConfigurationController_list
     */
    'StoreWfConfigurationController_list'(
        parameters?: Parameters<
            Paths.StoreWfConfigurationControllerList.PathParameters &
                Paths.StoreWfConfigurationControllerList.QueryParameters
        > | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<Paths.StoreWfConfigurationControllerList.Responses.$201>
    /**
     * StoreWfConfigurationController_upsert
     */
    'StoreWfConfigurationController_upsert'(
        parameters?: Parameters<Paths.StoreWfConfigurationControllerUpsert.PathParameters> | null,
        data?: Paths.StoreWfConfigurationControllerUpsert.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<Paths.StoreWfConfigurationControllerUpsert.Responses.$201>
    /**
     * WfConfigurationController_delete
     */
    'WfConfigurationController_delete'(
        parameters?: Parameters<Paths.WfConfigurationControllerDelete.PathParameters> | null,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<any>
}

export interface PathsDictionary {
    ['/stores/{store_type}/{store_name}/configurations']: {
        /**
         * StoreWfConfigurationController_list
         */
        'get'(
            parameters?: Parameters<
                Paths.StoreWfConfigurationControllerList.PathParameters &
                    Paths.StoreWfConfigurationControllerList.QueryParameters
            > | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<Paths.StoreWfConfigurationControllerList.Responses.$201>
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
    ['/configurations/{internal_id}']: {
        /**
         * WfConfigurationController_delete
         */
        'delete'(
            parameters?: Parameters<Paths.WfConfigurationControllerDelete.PathParameters> | null,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<any>
    }
}

export type Client = OpenAPIClient<OperationMethods, PathsDictionary>
