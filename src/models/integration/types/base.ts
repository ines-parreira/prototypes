export type IntegrationBase = {
    created_datetime: string
    deactivated_datetime: Maybe<string>
    decoration: Maybe<IntegrationDecoration>
    deleted_datetime: Maybe<string>
    description: Maybe<string>
    id: number
    locked_datetime: Maybe<string>
    mappings?: Maybe<{id: number}[]>
    name: string
    updated_datetime: string
    uri: string
    user: {
        id: number
    }
    managed: boolean
}

export type IntegrationDecoration = {
    avatar_team_picture_url: Maybe<string>
    avatar_type: string
    conversation_color: string
    introduction_text: string
    main_color: string
    offline_introduction_text: string
    main_font_family: string
}
