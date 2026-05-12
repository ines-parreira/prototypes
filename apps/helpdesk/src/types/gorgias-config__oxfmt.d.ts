declare module '@gorgias/config/oxfmt' {
    import type { OxfmtConfig } from 'oxfmt'

    // TODO(SPLTFE-2647): Remove this shim once @gorgias/config ships ./oxfmt types.
    type GorgiasOxfmtConfigOptions = Partial<OxfmtConfig> & {
        srcDir?: string
    }

    export const createConfig: (
        options?: GorgiasOxfmtConfigOptions,
    ) => OxfmtConfig

    const config: OxfmtConfig

    export default config
}
