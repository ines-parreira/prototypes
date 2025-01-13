import {defineConfig} from '@gorgias/static-analysis'

export default defineConfig({
    sourceDir: 'src',
    adapter: 'deprecation',
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
