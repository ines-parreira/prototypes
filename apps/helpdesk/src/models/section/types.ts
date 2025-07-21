export type SectionDecoration = {
    emoji?: string
}

export type SectionDraft = {
    decoration?: Maybe<SectionDecoration>
    name: string
    private: boolean
}

export type Section = SectionDraft & {
    created_datetime: string
    decoration: Maybe<SectionDecoration>
    id: number
    updated_datetime: string
    uri: string
}
