import type { createPlugin, defineConfig } from '@gorgias/static-analysis'

type PluginApplyParams = Parameters<
    Parameters<typeof createPlugin>[0]['apply']
>[0]

export type ModuleGraphApi = PluginApplyParams['ModuleGraph']
export type AnalyzedModule = ReturnType<ModuleGraphApi['getAllModules']>[number]
export type ModuleImportDeclaration = AnalyzedModule['imports'][number]
export type ModuleImportEntry = ModuleImportDeclaration['entries'][number]
export type ModuleGraphOptions = NonNullable<
    Parameters<typeof defineConfig>[0]['moduleGraphOptions']
>

export type PluginMetrics = {
    plugin: string
    summary: {
        total: number
        filesWithFindings: number
    }
    byPattern: Record<string, number>
    byFile: Record<string, Record<string, number>>
}

export type ToolStepResult = {
    tool: string
    status: 'ok' | 'failed'
    headline: string
}
