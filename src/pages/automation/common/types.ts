export type ChannelLanguageCode =
    | 'en-US'
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

type GetShortCode<
    C extends string,
    Acc extends string = ''
> = C extends `${infer H}${infer T}`
    ? H extends '-'
        ? Acc
        : GetShortCode<T, `${Acc}${H}`>
    : never

export type ChannelLanguage =
    | ChannelLanguageCode
    | (ChannelLanguageCode extends any
          ? GetShortCode<ChannelLanguageCode>
          : never)
