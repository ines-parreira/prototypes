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

    interface NumberFormatOptions {
        compactDisplay?: 'short' | 'long' | undefined
        notation?:
            | 'standard'
            | 'scientific'
            | 'engineering'
            | 'compact'
            | undefined
        signDisplay?: 'auto' | 'never' | 'always' | 'exceptZero' | undefined
        unit?: string | undefined
        unitDisplay?: 'short' | 'long' | 'narrow' | undefined
        currencyDisplay?: string | undefined
        currencySign?: string | undefined
    }
}
