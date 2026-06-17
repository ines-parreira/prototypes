import fs from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'

import { packHierarchy, scalePack } from './lib/circle-pack'
import type { PackedNode, PackSource } from './lib/circle-pack'
import { METRICS_DIR, ROOT_DIR } from './lib/report.utils'

const DEFAULT_OUTPUT_PATH = path.join(
    ROOT_DIR,
    'scripts/codebase-health/artefacts/summary.html',
)
const ROW_HEIGHT = 30
const VLIST_VISIBLE_ROWS = 12
const REACT_DOCTOR_TIP_RULES = 16
const CLUSTER_RADIUS_PX = 560
const CLUSTER_MARGIN_PX = 48
const MIN_LABELED_RADIUS = 30

type JsonRecord = Record<string, unknown>

type MetricFile = {
    fileName: string
    name: string
    data: JsonRecord
}

type BarDatum = {
    label: string
    value: number
    detail?: string
    tip?: string
}

type MetricOverview = {
    label: string
    value: string
    detail: string
    tone: 'neutral' | 'good' | 'warning' | 'danger'
}

type SummaryOptions = {
    metricsDir?: string
    outputPath?: string
}

type FileCounts = Map<string, number>

type IssueCategory = {
    id: string
    label: string
    color: string
    extract: (metrics: MetricFile[]) => FileCounts
}

type CategoryTotals = Map<string, number>

type FolderRollup = {
    name: string
    total: number
    byCategory: CategoryTotals
}

type PackageRollup = {
    name: string
    total: number
    byCategory: CategoryTotals
    folders: Map<string, FolderRollup>
}

type IssueRollup = {
    packages: Map<string, PackageRollup>
    byFile: Map<string, CategoryTotals>
    totals: CategoryTotals
    grandTotal: number
}

type ClusterDatum =
    | { kind: 'root' }
    | { kind: 'package'; name: string }
    | { kind: 'folder'; pkg: string; name: string }
    | { kind: 'leaf'; pkg: string; folder: string; categoryId: string }

type StackedRow = {
    label: string
    title?: string
    total: number
    segments: { categoryId: string; count: number }[]
}

function isRecord(value: unknown): value is JsonRecord {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function getRecord(record: JsonRecord, key: string): JsonRecord | null {
    const value = record[key]

    return isRecord(value) ? value : null
}

function getArray(record: JsonRecord, key: string): unknown[] {
    const value = record[key]

    return Array.isArray(value) ? value : []
}

function getNumber(record: JsonRecord, key: string, fallback = 0): number {
    const value = record[key]

    return typeof value === 'number' && Number.isFinite(value)
        ? value
        : fallback
}

function getString(record: JsonRecord, key: string, fallback = ''): string {
    const value = record[key]

    return typeof value === 'string' ? value : fallback
}

function asNumberEntries(record: JsonRecord | null): BarDatum[] {
    if (!record) {
        return []
    }

    return Object.entries(record)
        .filter(
            (entry): entry is [string, number] => typeof entry[1] === 'number',
        )
        .map(([label, value]) => ({ label, value }))
}

function compareByValueDescending(left: BarDatum, right: BarDatum) {
    return right.value - left.value || left.label.localeCompare(right.label)
}

function topEntries(entries: BarDatum[], count: number) {
    return sortedEntries(entries).slice(0, count)
}

function sortedEntries(entries: BarDatum[]) {
    return entries
        .filter((entry) => entry.value > 0)
        .sort(compareByValueDescending)
}

function formatNumber(value: number) {
    return new Intl.NumberFormat('en-US').format(value)
}

function formatPercent(value: number) {
    return `${new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2,
    }).format(value)}%`
}

function formatMetricName(fileName: string) {
    return fileName
        .replace(/\.json$/, '')
        .replace(/^plugin-/, '')
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
}

function formatTimestamp(value: string) {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return value || 'unknown'
    }

    return `${date.toISOString().slice(0, 16).replace('T', ' ')} UTC`
}

function escapeHtml(value: unknown) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;')
}

function svgNum(value: number) {
    return Number(value.toFixed(2))
}

function readMetrics(metricsDir: string): MetricFile[] {
    if (!fs.existsSync(metricsDir)) {
        throw new Error(`Metrics directory does not exist: ${metricsDir}`)
    }

    return fs
        .readdirSync(metricsDir)
        .filter((fileName) => fileName.endsWith('.json'))
        .sort()
        .map((fileName) => {
            const filePath = path.join(metricsDir, fileName)
            const parsed = JSON.parse(
                fs.readFileSync(filePath, 'utf8'),
            ) as unknown

            if (!isRecord(parsed)) {
                throw new Error(`${filePath} must contain a JSON object`)
            }

            return {
                fileName,
                name: formatMetricName(fileName),
                data: parsed,
            }
        })
}

function getMetric(metrics: MetricFile[], fileName: string) {
    return metrics.find((metric) => metric.fileName === fileName)?.data ?? null
}

function sumByFileValue(value: unknown): number {
    if (typeof value === 'number') {
        return value
    }

    if (isRecord(value)) {
        return Object.values(value).reduce<number>(
            (sum, entry) => sum + (typeof entry === 'number' ? entry : 0),
            0,
        )
    }

    return 0
}

function addFileCount(counts: FileCounts, filePath: string, count: number) {
    if (count > 0) {
        counts.set(filePath, (counts.get(filePath) ?? 0) + count)
    }
}

function extractByFile(fileName: string) {
    return (metrics: MetricFile[]): FileCounts => {
        const counts: FileCounts = new Map()
        const byFile = getRecord(getMetric(metrics, fileName) ?? {}, 'byFile')

        for (const [filePath, value] of Object.entries(byFile ?? {})) {
            addFileCount(counts, filePath, sumByFileValue(value))
        }

        return counts
    }
}

function extractReactDoctor(metrics: MetricFile[]): FileCounts {
    const counts: FileCounts = new Map()
    const projects = getRecord(
        getMetric(metrics, 'react-doctor.json') ?? {},
        'projects',
    )

    for (const project of Object.values(projects ?? {})) {
        if (!isRecord(project)) {
            continue
        }

        const byFile = getRecord(project, 'byFile')
        for (const [filePath, value] of Object.entries(byFile ?? {})) {
            addFileCount(counts, filePath, sumByFileValue(value))
        }
    }

    return counts
}

function extractDeprecatedNodes(metrics: MetricFile[]): FileCounts {
    const counts: FileCounts = new Map()
    const deprecated = getArray(
        getMetric(metrics, 'plugin-deprecated-nodes.json') ?? {},
        'deprecated',
    )

    for (const node of deprecated) {
        if (isRecord(node)) {
            addFileCount(
                counts,
                getString(node, 'filePath'),
                getNumber(node, 'count'),
            )
        }
    }

    return counts
}

const ISSUE_CATEGORIES: IssueCategory[] = [
    {
        id: 'react-doctor',
        label: 'React Doctor',
        color: '#4ade80',
        extract: extractReactDoctor,
    },
    {
        id: 'any-types',
        label: 'Any types',
        color: '#fb7185',
        extract: extractByFile('plugin-any-types.json'),
    },
    {
        id: 'as-casts',
        label: 'As casts',
        color: '#fbbf24',
        extract: extractByFile('plugin-as-casts.json'),
    },
    {
        id: 'deprecated-nodes',
        label: 'Deprecated nodes',
        color: '#2dd4bf',
        extract: extractDeprecatedNodes,
    },
    {
        id: 'deprecated-components',
        label: 'Deprecated components',
        color: '#a78bfa',
        extract: extractByFile('plugin-deprecated-components.json'),
    },
    {
        id: 'dead-code',
        label: 'Dead code',
        color: '#a3e635',
        extract: extractByFile('fallow-dead-code.json'),
    },
    {
        id: 'health',
        label: 'Health hotspots',
        color: '#f87171',
        extract: extractByFile('fallow-health.json'),
    },
    {
        id: 'oxlint',
        label: 'Oxlint',
        color: '#5da9ff',
        extract: extractByFile('oxlint.json'),
    },
    {
        id: 'duplication',
        label: 'Duplication',
        color: '#9aa7bd',
        extract: extractByFile('fallow-dupes.json'),
    },
    {
        id: 'legacy-api-clients',
        label: 'Legacy API clients',
        color: '#fb8a3c',
        extract: extractByFile('plugin-legacy-api-clients.json'),
    },
    {
        id: 'legacy-generated-clients',
        label: 'Legacy generated clients',
        color: '#e879f9',
        extract: extractByFile('plugin-legacy-generated-clients.json'),
    },
    {
        id: 'handwritten-react-query',
        label: 'Hand-written React Query',
        color: '#f472b6',
        extract: extractByFile('plugin-handwritten-react-query.json'),
    },
]

const CATEGORY_BY_ID = new Map(
    ISSUE_CATEGORIES.map((category) => [category.id, category]),
)

function categoryLabel(categoryId: string) {
    return CATEGORY_BY_ID.get(categoryId)?.label ?? categoryId
}

function categoryColor(categoryId: string) {
    return CATEGORY_BY_ID.get(categoryId)?.color ?? '#9aa7bd'
}

function packageOf(filePath: string) {
    const parts = filePath.split('/')

    if ((parts[0] === 'apps' || parts[0] === 'packages') && parts.length > 2) {
        return `${parts[0]}/${parts[1]}`
    }

    return parts.length === 1 ? '(repo root)' : parts[0]
}

function folderOf(filePath: string, pkg: string) {
    if (!filePath.startsWith(`${pkg}/`)) {
        return '(root)'
    }

    const rest = filePath.slice(pkg.length + 1).split('/')

    if (rest.length === 1) {
        return '(root)'
    }

    if (rest[0] === 'src') {
        return rest.length > 2 ? `src/${rest[1]}` : 'src'
    }

    return rest[0]
}

function addToTotals(
    totals: CategoryTotals,
    categoryId: string,
    count: number,
) {
    totals.set(categoryId, (totals.get(categoryId) ?? 0) + count)
}

function buildIssueRollup(metrics: MetricFile[]): IssueRollup {
    const packages = new Map<string, PackageRollup>()
    const byFile = new Map<string, CategoryTotals>()
    const totals: CategoryTotals = new Map()
    let grandTotal = 0

    for (const category of ISSUE_CATEGORIES) {
        for (const [filePath, count] of category.extract(metrics)) {
            const pkgName = packageOf(filePath)
            const folderName = folderOf(filePath, pkgName)

            let pkg = packages.get(pkgName)
            if (!pkg) {
                pkg = {
                    name: pkgName,
                    total: 0,
                    byCategory: new Map(),
                    folders: new Map(),
                }
                packages.set(pkgName, pkg)
            }

            let folder = pkg.folders.get(folderName)
            if (!folder) {
                folder = { name: folderName, total: 0, byCategory: new Map() }
                pkg.folders.set(folderName, folder)
            }

            let fileTotals = byFile.get(filePath)
            if (!fileTotals) {
                fileTotals = new Map()
                byFile.set(filePath, fileTotals)
            }

            pkg.total += count
            folder.total += count
            grandTotal += count
            addToTotals(pkg.byCategory, category.id, count)
            addToTotals(folder.byCategory, category.id, count)
            addToTotals(fileTotals, category.id, count)
            addToTotals(totals, category.id, count)
        }
    }

    return { packages, byFile, totals, grandTotal }
}

function sortedCategoryEntries(totals: CategoryTotals) {
    return ISSUE_CATEGORIES.map((category) => ({
        categoryId: category.id,
        count: totals.get(category.id) ?? 0,
    })).filter((entry) => entry.count > 0)
}

function breakdownTip(totals: CategoryTotals, limit = 5) {
    const entries = sortedCategoryEntries(totals).sort(
        (left, right) => right.count - left.count,
    )
    const lines = entries
        .slice(0, limit)
        .map(
            (entry) =>
                `${categoryLabel(entry.categoryId)} · ${formatNumber(entry.count)}`,
        )

    if (entries.length > limit) {
        lines.push(`+${entries.length - limit} more categories`)
    }

    return lines.join('\n')
}

function shortPackageName(pkg: string) {
    return pkg.startsWith('packages/') ? pkg.slice('packages/'.length) : pkg
}

function shortFolderName(folder: string) {
    return folder.startsWith('src/') ? folder.slice('src/'.length) : folder
}

function buildClusterRoot(rollup: IssueRollup): PackedNode<ClusterDatum> {
    const source: PackSource<ClusterDatum> = {
        data: { kind: 'root' },
        children: [...rollup.packages.values()]
            .filter((pkg) => pkg.total > 0)
            .map((pkg) => ({
                data: { kind: 'package', name: pkg.name } as ClusterDatum,
                children: [...pkg.folders.values()]
                    .filter((folder) => folder.total > 0)
                    .map((folder) => ({
                        data: {
                            kind: 'folder',
                            pkg: pkg.name,
                            name: folder.name,
                        } as ClusterDatum,
                        children: sortedCategoryEntries(folder.byCategory).map(
                            (entry) => ({
                                data: {
                                    kind: 'leaf',
                                    pkg: pkg.name,
                                    folder: folder.name,
                                    categoryId: entry.categoryId,
                                } as ClusterDatum,
                                value: entry.count,
                            }),
                        ),
                    })),
            })),
    }

    const root = packHierarchy(source, {
        padding: 2,
        leafRadius: (value) => Math.max(Math.sqrt(value), 1.15),
    })

    if (root.r > 0) {
        scalePack(root, CLUSTER_RADIUS_PX / root.r)
    }

    return root
}

function renderClusterLabel(
    node: PackedNode<ClusterDatum>,
    text: string,
    variant: 'pkg' | 'folder',
) {
    if (node.r < MIN_LABELED_RADIUS) {
        return ''
    }

    const fontSize = Math.min(
        Math.max(variant === 'pkg' ? node.r * 0.16 : node.r * 0.14, 10),
        variant === 'pkg' ? 19 : 14,
    )
    const y = variant === 'pkg' ? node.y - node.r - fontSize * 0.6 : node.y

    return `<text class="cluster-label cluster-label--${variant}" x="${svgNum(
        node.x,
    )}" y="${svgNum(y)}" font-size="${svgNum(fontSize)}">${escapeHtml(text)}</text>`
}

function renderClusterSvg(rollup: IssueRollup) {
    const root = buildClusterRoot(rollup)

    if (root.children.length === 0) {
        return '<p class="empty-note">No per-file findings were found in the metrics directory.</p>'
    }

    const extent = root.r + CLUSTER_MARGIN_PX
    const size = svgNum(extent * 2)
    const packageGroups = [...root.children]
        .sort((left, right) => right.r - left.r)
        .map((pkgNode) => {
            const pkgDatum = pkgNode.data
            const pkgName = pkgDatum.kind === 'package' ? pkgDatum.name : ''
            const pkgRollup = rollup.packages.get(pkgName)
            const pkgTip = `${pkgName}\n${formatNumber(
                pkgRollup?.total ?? 0,
            )} issues\n${breakdownTip(pkgRollup?.byCategory ?? new Map())}`

            const folderGroups = pkgNode.children.map((folderNode) => {
                const folderDatum = folderNode.data
                const folderName =
                    folderDatum.kind === 'folder' ? folderDatum.name : ''
                const folderRollup = pkgRollup?.folders.get(folderName)
                const folderTip = `${pkgName} / ${folderName}\n${formatNumber(
                    folderRollup?.total ?? 0,
                )} issues\n${breakdownTip(
                    folderRollup?.byCategory ?? new Map(),
                )}`

                const leaves = folderNode.children
                    .map((leafNode) => {
                        const leaf = leafNode.data

                        if (leaf.kind !== 'leaf') {
                            return ''
                        }

                        const tip = `${pkgName} / ${folderName}\n${categoryLabel(
                            leaf.categoryId,
                        )} · ${formatNumber(leafNode.value)} issues`

                        return `<circle class="leaf" data-cat-item="${escapeHtml(
                            leaf.categoryId,
                        )}" cx="${svgNum(leafNode.x)}" cy="${svgNum(
                            leafNode.y,
                        )}" r="${svgNum(leafNode.r)}" fill="${categoryColor(
                            leaf.categoryId,
                        )}" data-tip="${escapeHtml(tip)}"></circle>`
                    })
                    .join('')

                return `<g class="folder">
                    <circle class="folder-circle" cx="${svgNum(
                        folderNode.x,
                    )}" cy="${svgNum(folderNode.y)}" r="${svgNum(
                        folderNode.r,
                    )}" data-tip="${escapeHtml(folderTip)}"></circle>
                    ${leaves}
                    ${renderClusterLabel(
                        folderNode,
                        shortFolderName(folderName),
                        'folder',
                    )}
                </g>`
            })

            return `<g class="pkg">
                <circle class="pkg-circle" cx="${svgNum(pkgNode.x)}" cy="${svgNum(
                    pkgNode.y,
                )}" r="${svgNum(pkgNode.r)}" data-tip="${escapeHtml(pkgTip)}"></circle>
                ${folderGroups.join('')}
                ${renderClusterLabel(pkgNode, shortPackageName(pkgName), 'pkg')}
            </g>`
        })

    return `<svg class="cluster-svg" viewBox="${svgNum(-extent)} ${svgNum(
        -extent,
    )} ${size} ${size}" role="img" aria-label="Issues clustered by package, folder and category">
        ${packageGroups.join('')}
    </svg>`
}

function serializeJson(value: unknown) {
    return JSON.stringify(value)
        .replaceAll('<', '\\u003c')
        .replaceAll('>', '\\u003e')
        .replaceAll('&', '\\u0026')
}

function renderVlistContainer(
    id: string,
    config: JsonRecord,
    count: number,
    visibleRows: number,
) {
    const viewportHeight = Math.min(count, visibleRows) * ROW_HEIGHT
    const hint =
        count > visibleRows
            ? `<p class="vlist__hint">Scroll · ${formatNumber(count)} rows</p>`
            : `<p class="vlist__hint">${formatNumber(count)} rows</p>`

    return `<div class="vlist" data-vlist-for="${escapeHtml(id)}">
        <div class="vlist__viewport" style="--vlist-max:${viewportHeight}px">
            <div class="vlist__sizer"></div>
        </div>
        ${hint}
    </div><script type="application/json" data-vlist="${escapeHtml(id)}">${serializeJson(
        config,
    )}</script>`
}

function renderVirtualStack(
    id: string,
    rows: StackedRow[],
    emptyText: string,
    options: { visibleRows?: number; grandTotal?: number } = {},
) {
    if (rows.length === 0) {
        return `<p class="empty-note">${escapeHtml(emptyText)}</p>`
    }

    const grandTotal = options.grandTotal ?? 0
    const maxValue = Math.max(...rows.map((row) => row.total), 1)
    const payload = rows.map((row) => ({
        label: row.label,
        title: row.title ?? row.label,
        total: row.total,
        detail:
            grandTotal > 0
                ? formatPercent((row.total / grandTotal) * 100)
                : undefined,
        segments: row.segments.map((segment) => [
            segment.categoryId,
            segment.count,
        ]),
    }))

    return renderVlistContainer(
        id,
        { type: 'stack', rowHeight: ROW_HEIGHT, maxValue, rows: payload },
        rows.length,
        options.visibleRows ?? VLIST_VISIBLE_ROWS,
    )
}

function renderVirtualBar(
    id: string,
    entries: BarDatum[],
    color: string,
    emptyText: string,
    visibleRows = VLIST_VISIBLE_ROWS,
) {
    if (entries.length === 0) {
        return `<p class="empty-note">${escapeHtml(emptyText)}</p>`
    }

    const maxValue = Math.max(...entries.map((entry) => entry.value), 1)
    const payload = entries.map((entry) => ({
        label: entry.label,
        title: entry.label,
        value: entry.value,
        detail: entry.detail,
    }))

    return renderVlistContainer(
        id,
        { type: 'bar', rowHeight: ROW_HEIGHT, color, maxValue, rows: payload },
        entries.length,
        visibleRows,
    )
}

function renderVirtualScore(
    id: string,
    entries: BarDatum[],
    emptyText: string,
    visibleRows = VLIST_VISIBLE_ROWS,
) {
    if (entries.length === 0) {
        return `<p class="empty-note">${escapeHtml(emptyText)}</p>`
    }

    const payload = entries.map((entry) => ({
        label: entry.label,
        title: entry.label,
        value: entry.value,
        detail: entry.detail ?? '',
        tip: entry.tip,
    }))

    return renderVlistContainer(
        id,
        { type: 'score', rowHeight: ROW_HEIGHT, rows: payload },
        entries.length,
        visibleRows,
    )
}

function renderCategoryMapScript() {
    const map = Object.fromEntries(
        ISSUE_CATEGORIES.map((category) => [
            category.id,
            { label: category.label, color: category.color },
        ]),
    )

    return `<script type="application/json" id="cat-map">${serializeJson(
        map,
    )}</script>`
}

function getPackageRows(rollup: IssueRollup): StackedRow[] {
    return [...rollup.packages.values()]
        .filter((pkg) => pkg.total > 0)
        .sort((left, right) => right.total - left.total)
        .map((pkg) => ({
            label: pkg.name,
            total: pkg.total,
            segments: sortedCategoryEntries(pkg.byCategory),
        }))
}

function getFolderRows(rollup: IssueRollup): StackedRow[] {
    const folders: StackedRow[] = []

    for (const pkg of rollup.packages.values()) {
        for (const folder of pkg.folders.values()) {
            if (folder.total > 0) {
                folders.push({
                    label: `${shortPackageName(pkg.name)} / ${folder.name}`,
                    title: `${pkg.name} / ${folder.name}`,
                    total: folder.total,
                    segments: sortedCategoryEntries(folder.byCategory),
                })
            }
        }
    }

    return folders.sort((left, right) => right.total - left.total)
}

function getFileRows(rollup: IssueRollup): StackedRow[] {
    return [...rollup.byFile.entries()]
        .map(([filePath, totals]) => ({
            filePath,
            totals,
            total: [...totals.values()].reduce((sum, count) => sum + count, 0),
        }))
        .sort((left, right) => right.total - left.total)
        .map((entry) => ({
            label: entry.filePath,
            total: entry.total,
            segments: sortedCategoryEntries(entry.totals),
        }))
}

function getReactDoctorProjectScores(metrics: MetricFile[]) {
    const reactDoctor = getMetric(metrics, 'react-doctor.json')
    const projects = reactDoctor ? getRecord(reactDoctor, 'projects') : null

    if (!projects) {
        return []
    }

    return Object.entries(projects)
        .map<BarDatum | null>(([label, project]) => {
            if (!isRecord(project)) {
                return null
            }

            const score = project.score
            if (typeof score !== 'number') {
                return null
            }

            const summary = getRecord(project, 'summary')
            const total = getNumber(summary ?? {}, 'total')
            const errors = getNumber(summary ?? {}, 'errors')
            const warnings = getNumber(summary ?? {}, 'warnings')
            const rules = sortedEntries(
                asNumberEntries(getRecord(project, 'byRule')),
            )
            const ruleLines = rules
                .slice(0, REACT_DOCTOR_TIP_RULES)
                .map((rule) => `${rule.label} · ${formatNumber(rule.value)}`)

            if (rules.length > REACT_DOCTOR_TIP_RULES) {
                ruleLines.push(
                    `+${rules.length - REACT_DOCTOR_TIP_RULES} more rule types`,
                )
            }

            const tip = [
                `${label} · score ${formatNumber(score)}`,
                `${formatNumber(total)} diagnostics · ${formatNumber(
                    errors,
                )} errors, ${formatNumber(warnings)} warnings`,
                '',
                ...(ruleLines.length > 0
                    ? ['Violations by rule:', ...ruleLines]
                    : ['No rule-level violations recorded.']),
            ].join('\n')

            return {
                label,
                value: score,
                detail: `${formatNumber(total)} diagnostics`,
                tip,
            }
        })
        .filter((entry): entry is BarDatum => entry !== null)
        .sort((left, right) => left.value - right.value)
}

function getMetricOverviews(
    metrics: MetricFile[],
    rollup: IssueRollup,
): MetricOverview[] {
    const reactDoctorSummary = getRecord(
        getMetric(metrics, 'react-doctor.json') ?? {},
        'summary',
    )
    const oxlintSummary = getRecord(
        getMetric(metrics, 'oxlint.json') ?? {},
        'summary',
    )
    const deadCodeSummary = getRecord(
        getMetric(metrics, 'fallow-dead-code.json') ?? {},
        'summary',
    )
    const dupesSummary = getRecord(
        getMetric(metrics, 'fallow-dupes.json') ?? {},
        'summary',
    )
    const healthSummary = getRecord(
        getMetric(metrics, 'fallow-health.json') ?? {},
        'summary',
    )
    const anyTypesSummary = getRecord(
        getMetric(metrics, 'plugin-any-types.json') ?? {},
        'summary',
    )

    return [
        {
            label: 'File-scoped issues',
            value: formatNumber(rollup.grandTotal),
            detail: `${formatNumber(rollup.packages.size)} packages · ${formatNumber(
                rollup.byFile.size,
            )} files`,
            tone: 'neutral',
        },
        {
            label: 'Any types',
            value: formatNumber(getNumber(anyTypesSummary ?? {}, 'total')),
            detail: `${formatNumber(
                getNumber(anyTypesSummary ?? {}, 'filesWithFindings'),
            )} files with \`any\``,
            tone: 'warning',
        },
        {
            label: 'Fallow health',
            value: `${getString(healthSummary ?? {}, 'healthGrade', 'n/a')} · ${formatNumber(
                getNumber(healthSummary ?? {}, 'healthScore'),
            )}`,
            detail: `${formatNumber(
                getNumber(healthSummary ?? {}, 'severity_critical_count'),
            )} critical, ${formatNumber(
                getNumber(healthSummary ?? {}, 'severity_high_count'),
            )} high`,
            tone:
                getNumber(healthSummary ?? {}, 'healthScore') >= 80
                    ? 'good'
                    : 'warning',
        },
        {
            label: 'React Doctor',
            value: formatNumber(
                getNumber(reactDoctorSummary ?? {}, 'totalDiagnostics'),
            ),
            detail: `${formatNumber(
                getNumber(reactDoctorSummary ?? {}, 'errors'),
            )} errors, ${formatNumber(
                getNumber(reactDoctorSummary ?? {}, 'warnings'),
            )} warnings`,
            tone:
                getNumber(reactDoctorSummary ?? {}, 'errors') > 0
                    ? 'danger'
                    : 'warning',
        },
        {
            label: 'Oxlint',
            value: formatNumber(getNumber(oxlintSummary ?? {}, 'total')),
            detail: `${formatNumber(
                getNumber(oxlintSummary ?? {}, 'filesWithIssues'),
            )} files, ${formatNumber(
                getNumber(oxlintSummary ?? {}, 'workspaces'),
            )} workspaces`,
            tone:
                getNumber(oxlintSummary ?? {}, 'errors') > 0
                    ? 'danger'
                    : 'warning',
        },
        {
            label: 'Dead code',
            value: formatNumber(
                getNumber(deadCodeSummary ?? {}, 'total_issues'),
            ),
            detail: `${formatNumber(
                getNumber(deadCodeSummary ?? {}, 'unused_exports'),
            )} unused exports`,
            tone: 'warning',
        },
        {
            label: 'Duplication',
            value: formatPercent(
                getNumber(dupesSummary ?? {}, 'duplicationPercentage'),
            ),
            detail: `${formatNumber(
                getNumber(dupesSummary ?? {}, 'cloneGroups'),
            )} clone groups`,
            tone: 'warning',
        },
    ]
}

function getMetricRows(metrics: MetricFile[]) {
    return metrics
        .filter((metric) => metric.fileName !== 'meta.json')
        .map((metric) => {
            const summary = getRecord(metric.data, 'summary')
            const byFile = getRecord(metric.data, 'byFile')
            const byPattern = getRecord(metric.data, 'byPattern')
            const byRule = getRecord(metric.data, 'byRule')
            const primaryValue =
                getNumber(summary ?? {}, 'total') ||
                getNumber(summary ?? {}, 'totalDiagnostics') ||
                getNumber(summary ?? {}, 'total_issues') ||
                getNumber(summary ?? {}, 'cloneGroups') ||
                getNumber(summary ?? {}, 'deprecatedNodeUsages') ||
                getNumber(summary ?? {}, 'deprecatedPackageUsages') ||
                getNumber(summary ?? {}, 'healthScore')
            const files =
                Object.keys(byFile ?? {}).length ||
                getNumber(summary ?? {}, 'filesWithFindings') ||
                getNumber(summary ?? {}, 'filesWithIssues') ||
                getNumber(summary ?? {}, 'filesWithClones') ||
                getNumber(summary ?? {}, 'deprecatedNodes')
            const breakdown = topEntries(
                [
                    ...asNumberEntries(byPattern),
                    ...asNumberEntries(byRule),
                    ...asNumberEntries(summary),
                ].filter(
                    (entry) =>
                        !['total', 'totalDiagnostics'].includes(entry.label),
                ),
                3,
            )
                .map((entry) => `${entry.label}: ${formatNumber(entry.value)}`)
                .join(', ')

            return {
                metric: metric.name,
                primaryValue,
                files,
                breakdown,
            }
        })
}

function renderOverviewCards(overviews: MetricOverview[]) {
    return `<section class="kpi-grid" aria-label="Metric overview">
        ${overviews
            .map(
                (
                    overview,
                    index,
                ) => `<article class="kpi kpi--${overview.tone}" style="--delay:${
                    120 + index * 60
                }ms">
                    <div class="kpi__label">${escapeHtml(overview.label)}</div>
                    <div class="kpi__value">${escapeHtml(overview.value)}</div>
                    <div class="kpi__detail">${escapeHtml(overview.detail)}</div>
                </article>`,
            )
            .join('')}
    </section>`
}

function renderLegend(rollup: IssueRollup) {
    const chips = ISSUE_CATEGORIES.map((category) => {
        const total = rollup.totals.get(category.id) ?? 0

        return `<button type="button" class="chip" data-cat="${escapeHtml(
            category.id,
        )}" style="--c:${category.color}">
            <i class="chip__dot"></i>${escapeHtml(category.label)}
            <b>${formatNumber(total)}</b>
        </button>`
    }).join('')

    return `<nav class="legend" aria-label="Issue categories">
        <button type="button" class="chip chip--all is-active" data-cat="">
            All categories <b>${formatNumber(rollup.grandTotal)}</b>
        </button>
        ${chips}
    </nav>`
}

function renderPanel(options: {
    index: string
    title: string
    subtitle?: string
    body: string
    wide?: boolean
    delayMs?: number
}) {
    return `<section class="panel${options.wide ? ' panel--wide' : ''}" style="--delay:${
        options.delayMs ?? 0
    }ms">
        <header class="panel__header">
            <h2><span class="panel__index">${escapeHtml(options.index)}</span>${escapeHtml(
                options.title,
            )}</h2>
            ${
                options.subtitle
                    ? `<p class="panel__subtitle">${escapeHtml(options.subtitle)}</p>`
                    : ''
            }
        </header>
        ${options.body}
    </section>`
}

function renderMetricTable(rows: ReturnType<typeof getMetricRows>) {
    return `<div class="table-wrap">
        <table>
            <thead>
                <tr>
                    <th>Metric</th>
                    <th>Primary count</th>
                    <th>Files or nodes</th>
                    <th>Largest breakdowns</th>
                </tr>
            </thead>
            <tbody>
                ${rows
                    .map(
                        (row) => `<tr>
                            <td>${escapeHtml(row.metric)}</td>
                            <td class="num">${formatNumber(row.primaryValue)}</td>
                            <td class="num">${formatNumber(row.files)}</td>
                            <td class="muted">${escapeHtml(row.breakdown || 'n/a')}</td>
                        </tr>`,
                    )
                    .join('')}
            </tbody>
        </table>
    </div>`
}

function renderToolStatus(meta: JsonRecord | null) {
    const results = getArray(meta ?? {}, 'toolResults').filter(isRecord)

    if (results.length === 0) {
        return ''
    }

    return `<div class="masthead__tools">
        ${results
            .map((result) => {
                const ok = getString(result, 'status') === 'ok'

                return `<span class="tool-chip ${ok ? 'tool-chip--ok' : 'tool-chip--failed'}" title="${escapeHtml(
                    getString(result, 'headline'),
                )}">${escapeHtml(getString(result, 'tool'))}</span>`
            })
            .join('')}
    </div>`
}

const PAGE_STYLES = `
:root {
    color-scheme: dark;
    --bg: #0a0d13;
    --panel: #0f141d;
    --panel-raise: #121826;
    --line: #1d2535;
    --line-strong: #2b3447;
    --text: #e3e8f2;
    --muted: #8c96ab;
    --faint: #5c6678;
    --good: #4ade80;
    --warn: #fbbf24;
    --danger: #f87171;
    --info: #5da9ff;
    --serif: "Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif;
    --mono: ui-monospace, "SF Mono", "JetBrains Mono", "Cascadia Code", Menlo, Consolas, monospace;
}

* {
    box-sizing: border-box;
}

html {
    background: var(--bg);
}

body {
    position: relative;
    margin: 0;
    font-family: var(--mono);
    font-size: 13px;
    line-height: 1.55;
    color: var(--text);
    background:
        radial-gradient(1100px 560px at 78% -12%, rgba(93, 169, 255, 0.07), transparent 62%),
        radial-gradient(820px 460px at 8% -6%, rgba(248, 113, 113, 0.05), transparent 60%),
        var(--bg);
}

body::before {
    content: "";
    position: fixed;
    inset: 0;
    background-image:
        linear-gradient(rgba(255, 255, 255, 0.022) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.022) 1px, transparent 1px);
    background-size: 44px 44px;
    pointer-events: none;
}

main {
    position: relative;
    width: min(1280px, 100%);
    margin: 0 auto;
    padding: 44px 32px 72px;
}

.masthead {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 28px;
    align-items: end;
    padding-bottom: 26px;
    margin-bottom: 26px;
    border-bottom: 1px solid var(--line);
    animation: rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.masthead__eyebrow {
    margin-bottom: 12px;
    color: var(--faint);
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
}

.masthead__eyebrow::before {
    content: "/// ";
    color: var(--info);
}

h1 {
    margin: 0;
    font-family: var(--serif);
    font-size: clamp(38px, 5.4vw, 58px);
    font-weight: 500;
    line-height: 1.04;
    letter-spacing: -0.015em;
}

h1 em {
    font-style: italic;
    background: linear-gradient(92deg, #ffd166 10%, #fb8a3c 55%, #f87171 95%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
}

.masthead__sub {
    max-width: 620px;
    margin: 14px 0 0;
    color: var(--muted);
}

.masthead__meta {
    display: grid;
    gap: 6px;
    justify-items: end;
    margin: 0;
    font-size: 12px;
    white-space: nowrap;
}

.masthead__meta div {
    display: flex;
    gap: 10px;
    align-items: baseline;
}

.masthead__meta dt {
    color: var(--faint);
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
}

.masthead__meta dd {
    margin: 0;
}

.masthead__meta code {
    padding: 2px 7px;
    border: 1px solid var(--line-strong);
    border-radius: 5px;
    background: var(--panel-raise);
    color: var(--info);
}

.masthead__tools {
    display: flex;
    gap: 6px;
    justify-content: flex-end;
    margin-top: 4px;
}

.tool-chip {
    padding: 2px 8px;
    border: 1px solid var(--line-strong);
    border-radius: 999px;
    font-size: 10px;
    letter-spacing: 0.08em;
    color: var(--muted);
}

.tool-chip::before {
    content: "● ";
    font-size: 8px;
}

.tool-chip--ok::before {
    color: var(--good);
}

.tool-chip--failed {
    color: var(--danger);
    border-color: rgba(248, 113, 113, 0.4);
}

.tool-chip--failed::before {
    color: var(--danger);
}

.kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(158px, 1fr));
    gap: 12px;
    margin-bottom: 18px;
}

.kpi {
    position: relative;
    padding: 16px 16px 14px;
    border: 1px solid var(--line);
    border-radius: 10px;
    background: linear-gradient(180deg, var(--panel-raise), var(--panel));
    overflow: hidden;
    animation: rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
    animation-delay: var(--delay, 0ms);
}

.kpi::before {
    content: "";
    position: absolute;
    inset: 0 auto 0 0;
    width: 3px;
    background: var(--info);
}

.kpi--good::before {
    background: var(--good);
}

.kpi--warning::before {
    background: var(--warn);
}

.kpi--danger::before {
    background: var(--danger);
}

.kpi__label {
    color: var(--faint);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
}

.kpi__value {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
}

.kpi__detail {
    margin-top: 4px;
    color: var(--muted);
    font-size: 11px;
}

.legend {
    position: sticky;
    top: 12px;
    z-index: 40;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px 12px;
    margin-bottom: 18px;
    border: 1px solid var(--line);
    border-radius: 12px;
    background: rgba(13, 17, 26, 0.88);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    animation: rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
    animation-delay: 200ms;
}

.chip {
    display: inline-flex;
    gap: 7px;
    align-items: center;
    padding: 5px 11px;
    border: 1px solid var(--line-strong);
    border-radius: 999px;
    background: transparent;
    color: var(--muted);
    font-family: var(--mono);
    font-size: 11px;
    cursor: pointer;
    transition: border-color 0.18s ease, color 0.18s ease, background 0.18s ease;
}

.chip:hover {
    color: var(--text);
    border-color: var(--c, var(--info));
}

.chip.is-active {
    color: var(--text);
    border-color: var(--c, var(--info));
    background: color-mix(in srgb, var(--c, #5da9ff) 14%, transparent);
}

.chip__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--c, var(--info));
    box-shadow: 0 0 8px color-mix(in srgb, var(--c, #5da9ff) 60%, transparent);
}

.chip b {
    color: var(--faint);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
}

.chip.is-active b {
    color: var(--text);
}

.dashboard-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
}

.panel {
    min-width: 0;
    padding: 20px;
    border: 1px solid var(--line);
    border-radius: 12px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.015), transparent 70px), var(--panel);
    animation: rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
    animation-delay: var(--delay, 0ms);
}

.panel--wide {
    grid-column: 1 / -1;
}

.panel__header {
    margin-bottom: 16px;
}

.panel__header h2 {
    display: flex;
    gap: 12px;
    align-items: center;
    margin: 0;
    color: var(--text);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
}

.panel__header h2::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--line);
}

.panel__index {
    color: var(--info);
    font-weight: 700;
}

.panel__subtitle {
    margin: 8px 0 0;
    color: var(--faint);
    font-size: 11.5px;
}

.cluster-wrap {
    display: flex;
    justify-content: center;
}

.cluster-svg {
    display: block;
    width: auto;
    max-width: 100%;
    max-height: 84vh;
    aspect-ratio: 1;
}

.pkg-circle {
    fill: rgba(255, 255, 255, 0.018);
    stroke: var(--line-strong);
    stroke-width: 1;
}

.folder-circle {
    fill: rgba(255, 255, 255, 0.014);
    stroke: rgba(86, 102, 134, 0.45);
    stroke-width: 0.75;
}

.leaf {
    fill-opacity: 0.88;
    stroke: rgba(8, 11, 17, 0.55);
    stroke-width: 0.6;
    transition: opacity 0.2s ease, fill-opacity 0.15s ease;
}

.leaf:hover {
    fill-opacity: 1;
    stroke: #fff;
    stroke-width: 1;
}

.leaf.is-dimmed {
    opacity: 0.1;
}

.cluster-label {
    fill: var(--muted);
    font-family: var(--mono);
    letter-spacing: 0.06em;
    text-anchor: middle;
    pointer-events: none;
    paint-order: stroke;
    stroke: var(--bg);
    stroke-width: 3px;
    stroke-linejoin: round;
}

.cluster-label--pkg {
    fill: var(--text);
    font-weight: 700;
}

.seg {
    min-width: 1px;
    transition: opacity 0.2s ease;
}

.seg.is-dimmed {
    opacity: 0.12;
}

.vlist {
    display: block;
}

.vlist__viewport {
    position: relative;
    max-height: var(--vlist-max, 360px);
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    scrollbar-color: var(--line-strong) transparent;
}

.vlist__viewport::-webkit-scrollbar {
    width: 10px;
}

.vlist__viewport::-webkit-scrollbar-thumb {
    background: var(--line-strong);
    border: 3px solid var(--panel);
    border-radius: 999px;
}

.vlist__sizer {
    position: relative;
    width: 100%;
}

.vlist__row {
    position: absolute;
    left: 0;
    right: 6px;
    display: grid;
    grid-template-columns: minmax(150px, 0.44fr) minmax(110px, 1fr) minmax(76px, auto);
    gap: 12px;
    align-items: center;
}

.vlist__row .lbl {
    overflow: hidden;
    direction: rtl;
    text-align: left;
    font-size: 12px;
    color: var(--muted);
    text-overflow: ellipsis;
    white-space: nowrap;
}

.vlist__row .trk {
    height: 12px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.03);
}

.vlist__row .bar {
    display: flex;
    height: 100%;
    min-width: 2px;
    border-radius: 3px;
    overflow: hidden;
}

.vlist__row .val {
    display: grid;
    justify-items: end;
    font-size: 12px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
}

.vlist__row .val span {
    color: var(--faint);
    font-size: 10px;
    font-weight: 500;
}

.vlist__hint {
    margin: 10px 0 0;
    color: var(--faint);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.empty-note,
.muted {
    color: var(--faint);
}

.table-wrap {
    overflow-x: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
}

th,
td {
    padding: 9px 12px;
    border-bottom: 1px solid var(--line);
    text-align: left;
    vertical-align: top;
}

th {
    color: var(--faint);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

td.num {
    font-variant-numeric: tabular-nums;
    font-weight: 700;
}

tr:last-child td {
    border-bottom: 0;
}

tbody tr:hover td {
    background: rgba(255, 255, 255, 0.015);
}

.page-footer {
    margin-top: 28px;
    color: var(--faint);
    font-size: 11px;
    text-align: center;
}

.page-footer code {
    color: var(--muted);
}

#tooltip {
    position: fixed;
    z-index: 100;
    max-width: 340px;
    padding: 9px 12px;
    border: 1px solid var(--line-strong);
    border-radius: 8px;
    background: #141b29;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
    color: var(--text);
    font-family: var(--mono);
    font-size: 11px;
    line-height: 1.5;
    white-space: pre-line;
    pointer-events: none;
}

#tooltip[hidden] {
    display: none;
}

@keyframes rise {
    from {
        opacity: 0;
        transform: translateY(14px);
    }
}

@media (prefers-reduced-motion: reduce) {
    .masthead,
    .kpi,
    .legend,
    .panel {
        animation: none;
    }
}

@media (max-width: 1100px) {
    .kpi-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .dashboard-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 760px) {
    main {
        padding: 24px 16px 48px;
    }

    .masthead {
        grid-template-columns: 1fr;
        align-items: start;
    }

    .masthead__meta {
        justify-items: start;
    }

    .masthead__tools {
        justify-content: flex-start;
    }

    .kpi-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .vlist__row {
        grid-template-columns: minmax(110px, 0.5fr) minmax(80px, 1fr) minmax(64px, auto);
        gap: 8px;
    }
}
`

const PAGE_SCRIPT = `
(() => {
    const tooltip = document.getElementById('tooltip')
    let currentTip = null

    document.addEventListener('pointermove', (event) => {
        const target =
            event.target instanceof Element
                ? event.target.closest('[data-tip]')
                : null

        if (!target) {
            tooltip.hidden = true
            currentTip = null
            return
        }

        if (target !== currentTip) {
            tooltip.textContent = target.getAttribute('data-tip')
            currentTip = target
        }

        tooltip.hidden = false

        const pad = 14
        const rect = tooltip.getBoundingClientRect()
        let x = event.clientX + pad
        let y = event.clientY + pad

        if (x + rect.width > window.innerWidth - 8) {
            x = event.clientX - rect.width - pad
        }
        if (y + rect.height > window.innerHeight - 8) {
            y = event.clientY - rect.height - pad
        }

        tooltip.style.left = x + 'px'
        tooltip.style.top = y + 'px'
    })

    const fmt = new Intl.NumberFormat('en-US')
    const catMapEl = document.getElementById('cat-map')
    const CATS = catMapEl ? JSON.parse(catMapEl.textContent) : {}
    const catColor = (id) => (CATS[id] && CATS[id].color) || '#9aa7bd'
    const catLabel = (id) => (CATS[id] && CATS[id].label) || id

    let activeCategory = ''

    function applyActiveCategory() {
        document.querySelectorAll('[data-cat-item]').forEach((item) => {
            item.classList.toggle(
                'is-dimmed',
                Boolean(activeCategory) &&
                    item.dataset.catItem !== activeCategory,
            )
        })
    }

    function scoreTone(value) {
        return value < 50 ? '#f87171' : value < 75 ? '#fbbf24' : '#4ade80'
    }

    function buildRow(config, row) {
        const el = document.createElement('div')
        el.className = 'vlist__row'
        el.style.height = config.rowHeight + 'px'

        const lbl = document.createElement('div')
        lbl.className = 'lbl'
        lbl.dataset.tip = row.title || row.label
        lbl.textContent = row.label

        const trk = document.createElement('div')
        trk.className = 'trk'
        const bar = document.createElement('div')
        bar.className = 'bar'

        const val = document.createElement('div')
        val.className = 'val'

        if (config.type === 'stack') {
            bar.style.width =
                Math.max((row.total / config.maxValue) * 100, 0.8) + '%'
            row.segments.forEach((segment) => {
                const id = segment[0]
                const count = segment[1]
                const seg = document.createElement('span')
                seg.className = 'seg'
                seg.dataset.catItem = id
                seg.style.flexGrow = String(count)
                seg.style.background = catColor(id)
                seg.dataset.tip =
                    (row.title || row.label) +
                    '\\n' +
                    catLabel(id) +
                    ' · ' +
                    fmt.format(count) +
                    ' issues'
                bar.appendChild(seg)
            })
            val.innerHTML =
                fmt.format(row.total) +
                (row.detail ? '<span>' + row.detail + '</span>' : '')
        } else if (config.type === 'bar') {
            bar.style.width =
                Math.max((row.value / config.maxValue) * 100, 1.5) + '%'
            bar.style.background = config.color
            val.innerHTML =
                fmt.format(row.value) +
                (row.detail ? '<span>' + row.detail + '</span>' : '')
        } else {
            bar.style.width = Math.max(row.value, 1.5) + '%'
            bar.style.background = scoreTone(row.value)
            val.innerHTML =
                fmt.format(row.value) +
                (row.detail ? '<span>' + row.detail + '</span>' : '')
            if (row.tip) {
                el.dataset.tip = row.tip
                lbl.dataset.tip = row.tip
            }
        }

        trk.appendChild(bar)
        el.append(lbl, trk, val)
        return el
    }

    const controllers = []

    document.querySelectorAll('[data-vlist]').forEach((dataEl) => {
        const id = dataEl.getAttribute('data-vlist')
        const config = JSON.parse(dataEl.textContent)
        const container = document.querySelector(
            '[data-vlist-for="' + id + '"]',
        )
        if (!container) {
            return
        }

        const viewport = container.querySelector('.vlist__viewport')
        const sizer = container.querySelector('.vlist__sizer')
        const rows = config.rows
        const rowHeight = config.rowHeight || 30
        sizer.style.height = rows.length * rowHeight + 'px'

        let lastStart = -1
        let lastEnd = -1

        function render(force) {
            const scrollTop = viewport.scrollTop
            const height = viewport.clientHeight || rowHeight * 12
            const overscan = 6
            const start = Math.max(
                0,
                Math.floor(scrollTop / rowHeight) - overscan,
            )
            const end = Math.min(
                rows.length,
                Math.ceil((scrollTop + height) / rowHeight) + overscan,
            )

            if (!force && start === lastStart && end === lastEnd) {
                return
            }

            lastStart = start
            lastEnd = end

            const frag = document.createDocumentFragment()
            for (let i = start; i < end; i++) {
                const el = buildRow(config, rows[i])
                el.style.transform = 'translateY(' + i * rowHeight + 'px)'
                frag.appendChild(el)
            }
            sizer.replaceChildren(frag)
            applyActiveCategory()
        }

        viewport.addEventListener(
            'scroll',
            () => requestAnimationFrame(() => render(false)),
            { passive: true },
        )
        controllers.push(() => render(true))
        render(true)
    })

    let resizeFrame = null
    window.addEventListener('resize', () => {
        if (resizeFrame) {
            cancelAnimationFrame(resizeFrame)
        }
        resizeFrame = requestAnimationFrame(() =>
            controllers.forEach((fn) => fn()),
        )
    })

    const chips = Array.from(document.querySelectorAll('.legend .chip'))

    chips.forEach((chip) => {
        chip.addEventListener('click', () => {
            const next = chip.dataset.cat || ''
            activeCategory = next === activeCategory ? '' : next

            chips.forEach((other) => {
                other.classList.toggle(
                    'is-active',
                    activeCategory
                        ? other.dataset.cat === activeCategory
                        : !other.dataset.cat,
                )
            })

            applyActiveCategory()
        })
    })
})()
`

function renderHtml(metrics: MetricFile[], options: Required<SummaryOptions>) {
    const meta = getMetric(metrics, 'meta.json')
    const rollup = buildIssueRollup(metrics)
    const healthSummary = getRecord(
        getMetric(metrics, 'fallow-health.json') ?? {},
        'summary',
    )
    const healthPenalties = sortedEntries(
        asNumberEntries(getRecord(healthSummary ?? {}, 'penalties')),
    )
    const deadCodeSummary = getRecord(
        getMetric(metrics, 'fallow-dead-code.json') ?? {},
        'summary',
    )
    const deadCodeCategories = sortedEntries(
        asNumberEntries(deadCodeSummary).filter(
            (entry) => entry.label !== 'total_issues',
        ),
    )
    const oxlintRules = sortedEntries(
        asNumberEntries(
            getRecord(getMetric(metrics, 'oxlint.json') ?? {}, 'byRule'),
        ),
    )
    const reactDoctorScores = getReactDoctorProjectScores(metrics)
    const packageRows = getPackageRows(rollup)
    const folderRows = getFolderRows(rollup)
    const fileRows = getFileRows(rollup)
    const generatedAt = formatTimestamp(getString(meta ?? {}, 'generatedAt'))
    const commit = getString(meta ?? {}, 'commit', 'unknown').slice(0, 10)

    return `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Codebase Health · ${escapeHtml(commit)}</title>
    <style>${PAGE_STYLES}</style>
</head>
<body>
    <main>
        <header class="masthead">
            <div>
                <div class="masthead__eyebrow">helpdesk-web-app · static analysis report</div>
                <h1>Codebase <em>Health</em></h1>
                <p class="masthead__sub">Every file-scoped finding from ${formatNumber(
                    ISSUE_CATEGORIES.length,
                )} issue categories, mapped onto the monorepo: package &rarr; top-level folder &rarr; issue type. Click a category chip to isolate it across every visualization; hover anything for details.</p>
            </div>
            <dl class="masthead__meta">
                <div><dt>Commit</dt><dd><code>${escapeHtml(commit)}</code></dd></div>
                <div><dt>Generated</dt><dd>${escapeHtml(generatedAt)}</dd></div>
                <div><dt>Source</dt><dd>${escapeHtml(
                    path.relative(ROOT_DIR, options.metricsDir),
                )}</dd></div>
            </dl>
            ${renderToolStatus(meta)}
        </header>

        ${renderOverviewCards(getMetricOverviews(metrics, rollup))}
        ${renderLegend(rollup)}

        <div class="dashboard-grid">
            ${renderPanel({
                index: '01',
                title: 'Issue clusters',
                subtitle:
                    'Each outlined ring is a workspace package; inner rings are its top-level folders; dots are issue categories sized by finding count.',
                body: `<div class="cluster-wrap">${renderClusterSvg(rollup)}</div>`,
                wide: true,
                delayMs: 260,
            })}
            ${renderPanel({
                index: '02',
                title: 'Issues by package',
                subtitle: `All ${formatNumber(
                    packageRows.length,
                )} packages with findings, ranked by share of the ${formatNumber(
                    rollup.grandTotal,
                )} file-scoped issues. Bars show the category mix; % is the package's share of all findings. Scroll for the full distribution.`,
                body: renderVirtualStack(
                    'packages',
                    packageRows,
                    'No per-package findings were found.',
                    { visibleRows: 16, grandTotal: rollup.grandTotal },
                ),
                wide: true,
                delayMs: 320,
            })}
            ${renderPanel({
                index: '03',
                title: 'Hot folders',
                subtitle: `Every top-level folder across all packages (${formatNumber(
                    folderRows.length,
                )} in total), ranked by issue count. Scroll for the full list.`,
                body: renderVirtualStack(
                    'folders',
                    folderRows,
                    'No per-folder findings were found.',
                    { visibleRows: 14 },
                ),
                delayMs: 380,
            })}
            ${renderPanel({
                index: '04',
                title: 'Hottest files',
                subtitle: `Every file with findings (${formatNumber(
                    fileRows.length,
                )} in total), ranked across all issue categories. Scroll the virtualized list to inspect the long tail.`,
                body: renderVirtualStack(
                    'files',
                    fileRows,
                    'No per-file findings were found.',
                    { visibleRows: 16 },
                ),
                wide: true,
                delayMs: 440,
            })}
            ${renderPanel({
                index: '05',
                title: 'Top oxlint rules',
                subtitle: `All ${formatNumber(
                    oxlintRules.length,
                )} triggered lint rules, ranked by violation count across every workspace. Scroll for the full list.`,
                body: renderVirtualBar(
                    'oxlint-rules',
                    oxlintRules,
                    categoryColor('oxlint'),
                    'No oxlint rule metrics were found.',
                ),
                delayMs: 500,
            })}
            ${renderPanel({
                index: '06',
                title: 'Fallow health penalties',
                subtitle:
                    'How much each maintainability dimension (duplication, unit size, hotspots…) drags down the overall fallow health score.',
                body: renderVirtualBar(
                    'health-penalties',
                    healthPenalties,
                    categoryColor('health'),
                    'No fallow health penalties were found.',
                ),
                delayMs: 540,
            })}
            ${renderPanel({
                index: '07',
                title: 'Dead-code categories',
                subtitle:
                    'Fallow dead-code findings grouped by kind — unused exports, files, dependencies, enum members and more.',
                body: renderVirtualBar(
                    'dead-code',
                    deadCodeCategories,
                    categoryColor('dead-code'),
                    'No fallow dead-code categories were found.',
                ),
                delayMs: 580,
            })}
            ${renderPanel({
                index: '08',
                title: 'React Doctor scores',
                subtitle: `Per-package React Doctor score (0–100; higher is healthier), worst first. ${formatNumber(
                    reactDoctorScores.length,
                )} packages scored — scroll for the full ranking; hover a row for its violations by rule.`,
                body: renderVirtualScore(
                    'react-doctor-scores',
                    reactDoctorScores,
                    'No React Doctor project scores were found.',
                ),
                delayMs: 620,
            })}
            ${renderPanel({
                index: '09',
                title: 'Metric files',
                subtitle:
                    'Every raw metric file in the source directory with its headline count and largest breakdowns.',
                body: renderMetricTable(getMetricRows(metrics)),
                wide: true,
                delayMs: 660,
            })}
        </div>

        <footer class="page-footer">
            Regenerate with <code>pnpm platform:codebase-health:summary</code> · counts cover file-attributable findings only
        </footer>
    </main>
    <div id="tooltip" hidden></div>
    ${renderCategoryMapScript()}
    <script>${PAGE_SCRIPT}</script>
</body>
</html>
`
}

export function generateCodebaseHealthSummary(options: SummaryOptions = {}) {
    const normalizedOptions: Required<SummaryOptions> = {
        metricsDir: path.resolve(options.metricsDir ?? METRICS_DIR),
        outputPath: path.resolve(options.outputPath ?? DEFAULT_OUTPUT_PATH),
    }
    const metrics = readMetrics(normalizedOptions.metricsDir)
    const html = renderHtml(metrics, normalizedOptions)

    fs.mkdirSync(path.dirname(normalizedOptions.outputPath), {
        recursive: true,
    })
    fs.writeFileSync(normalizedOptions.outputPath, html)

    return {
        outputPath: normalizedOptions.outputPath,
        metricFiles: metrics.length,
    }
}

async function main() {
    const { values } = parseArgs({
        options: {
            'metrics-dir': { type: 'string' },
            output: { type: 'string' },
        },
        allowPositionals: false,
    })

    const result = generateCodebaseHealthSummary({
        metricsDir: values['metrics-dir'],
        outputPath: values.output,
    })

    console.log(
        `Codebase health summary written to ${path.relative(
            ROOT_DIR,
            result.outputPath,
        )} from ${result.metricFiles} metric files`,
    )
}

if (require.main === module) {
    main().catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
