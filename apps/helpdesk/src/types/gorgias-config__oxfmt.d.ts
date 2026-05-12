declare module '@gorgias/config/oxfmt' {
    import type { OxfmtConfig } from 'oxfmt'

    type GorgiasOxfmtConfigOptions = OxfmtConfig & {
        srcDir?: string
    }

    export const createConfig: (
        options?: GorgiasOxfmtConfigOptions,
    ) => OxfmtConfig

    const config: OxfmtConfig

    export default config
}
