// @flow
export type SectionDecoration = {
    emoji?: string,
}

export type SectionDraft = {
    decoration?: ?SectionDecoration,
    name: string,
    private: boolean,
}

export type Section = SectionDraft & {
    created_datetime: string,
    decoration: ?SectionDecoration,
    id: number,
    updated_datetime: string,
    uri: string,
}
