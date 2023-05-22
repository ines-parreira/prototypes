declare namespace Intl {
    interface DisplayNamesOptions {
        type: 'language' | 'region' | 'script' | 'currency'
        languageDisplay?: 'dialect' | 'standard'
    }

    interface DisplayNames {
        of(code: string): string
    }

    const DisplayNames: {
        prototype: DisplayNames
        new (
            locales?: string | string[],
            options?: Partial<DisplayNamesOptions>
        ): DisplayNames
    }
}
