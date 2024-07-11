import {ElementType} from 'react'

export type CardEditFormState = {
    title: string
    link: string
    pictureUrl: string
    color: string
    displayCard: boolean
    limit: number
    orderBy: string
}

export type HiddenField = keyof CardEditFormState

export type Extensions = {
    AfterTitle?: ElementType
    BeforeContent?: ElementType
    AfterContent?: ElementType
    TitleWrapper?: ElementType
    Wrapper?: ElementType
}

export type CardCustomization = Extensions & {
    editionHiddenFields?: HiddenField[]
}
