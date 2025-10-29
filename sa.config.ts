import { defineConfig } from '@gorgias/static-analysis'

export default defineConfig({
    sourceDir: 'apps/helpdesk/src',
    adapter: 'deprecation',
    rules: {
        deprecation: {
            pkgs: [
                {
                    pkgName: 'launchdarkly-react-client-sdk',
                    // Use the useFlag hook (src/core/hooks/useFlag.ts) instead
                    // More context: https://www.notion.so/gorgias/How-to-use-Feature-flags-54fb0f6329b04d21970f42f295d1ef02?pvs=4#1921ae2178f580c99babe154b7116151
                    imports: ['useFlags', 'LD', 'LDProvider'],
                    type: 'feature-flag cleanup initiative',
                    date: '2025-02-10',
                },
                {
                    pkgName: 'reactstrap',
                    imports: ['Button'],
                    type: 'ui-kit-migration',
                    date: '2025-08-12',
                },
                //
                //  axiom related Legacy component deprecations
                {
                    pkgName: '@gorgias/axiom',
                    imports: [
                        'LegacyButton',
                        'LegacyIconButton',
                        'LegacySelectField',
                        'LegacyAvatar',
                        'LegacyShortcutKey',
                    ],
                    type: 'ui-kit-migration',
                    date: '2025-10-15',
                },
            ],
        },
    },
    /**
     * To generate custom reports intented to be shared with humans,
     * you can use the markdown reporter:
     *
     * type: 'markdown',
     * filePath: 'deprecated.report.md',
     *
     */
    reporter: {
        type: 'json',
        filePath: './scripts/deprecated-monitoring/deprecated.snapshot.json',
    },
})
