export type DeprecatedUsage = {
    name: string
    files: string[]
}

export type DeprecatedItem = {
    filePath: string
    nodeType: string
    nodeName: string
    comment: string
    count: number
    usages: DeprecatedUsage[]
}

export type DeprecatedPackageUsage = {
    name: string
    count: number
    files: string[]
}

export type DeprecatedPackage = {
    packageName: string
    usagesCount: number
    usages: DeprecatedPackageUsage[]
}

export type StaticAnalysisReport = {
    date: string
    total: number
    deprecated: DeprecatedItem[]
    deprecatedPackageUsages: DeprecatedPackage[]
}
