import { useEffect, useMemo, useState } from 'react'

import { useCopyToClipboard } from '@repo/hooks'

import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    createColumnHelper,
    DataTable,
    DataTableActions,
    DataTableBaseCell,
    DataTableSearch,
    DataTableTextCell,
    DataTableToolbar,
    Heading,
    Label,
    Modal,
    OverflowTooltip,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    SidePanel,
    Tag,
    Text,
    TextField,
    toast,
} from '@gorgias/axiom'
import type { TagColor } from '@gorgias/axiom'

import {
    evaluateFlag,
    getEngineContexts,
    getFlagDetails,
} from '../dualEvaluation'
import { normalizeFlagId } from '../engines/harness'
import type { FeatureFlagKey } from '../featureFlagKey'
import type { EvalEntry } from './evalStore'
import { evalStore } from './evalStore'

function formatValue(value: unknown): string {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    return JSON.stringify(value)
}

function valueColor(value: unknown): TagColor {
    if (value === null || value === undefined) return 'red'
    if (value === true) return 'green'
    if (value === false) return 'purple'
    if (typeof value === 'number') return 'orange'
    if (typeof value === 'string') return 'blue'
    return 'fuchsia'
}

type FlagDetails = ReturnType<typeof getFlagDetails>

const preStyle = {
    margin: 0,
    whiteSpace: 'pre-wrap' as const,
    fontSize: 'inherit',
}

function ValueTag({ value }: { value: unknown }) {
    return (
        <Tag color={valueColor(value)} overflow="ellipsis">
            {formatValue(value)}
        </Tag>
    )
}

function buildColumns() {
    const columnHelper = createColumnHelper<EvalEntry>()
    return [
        columnHelper.accessor('status', {
            header: 'Status',
            hug: true,
            cell: (info) => (
                <DataTableBaseCell {...info}>
                    <Tag color={info.getValue() === 'match' ? 'green' : 'red'}>
                        {info.getValue()}
                    </Tag>
                </DataTableBaseCell>
            ),
        }),
        columnHelper.accessor('flag', {
            header: 'Flag',
            maxSize: 400,
            cell: (info) => (
                <DataTableBaseCell {...info}>
                    <OverflowTooltip>
                        <Text overflow="ellipsis" size="sm">
                            {info.getValue()}
                        </Text>
                    </OverflowTooltip>
                </DataTableBaseCell>
            ),
        }),
        columnHelper.accessor((row) => formatValue(row.launchdarklyValue), {
            id: 'launchdarklyValue',
            header: 'LaunchDarkly',
            maxSize: 200,
            cell: (info) => (
                <DataTableBaseCell {...info}>
                    <ValueTag value={info.row.original.launchdarklyValue} />
                </DataTableBaseCell>
            ),
        }),
        columnHelper.accessor((row) => formatValue(row.harnessValue), {
            id: 'harnessValue',
            header: 'Harness',
            maxSize: 200,
            cell: (info) => (
                <DataTableBaseCell {...info}>
                    <ValueTag value={info.row.original.harnessValue} />
                </DataTableBaseCell>
            ),
        }),
        columnHelper.accessor(
            (row) =>
                row.timestamp
                    ? new Date(row.timestamp).toLocaleTimeString()
                    : '—',
            {
                id: 'timestamp',
                header: 'Last Changed',
                hug: true,
                cell: (info) => <DataTableTextCell {...info} />,
            },
        ),
    ]
}

export type EvaluationsDebugPanelProps = {
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
}

export function EvaluationsDebugPanel({
    isOpen = false,
    onOpenChange,
}: EvaluationsDebugPanelProps) {
    const [snapshot, setSnapshot] = useState<EvalEntry[]>([])
    const [contexts, setContexts] = useState<ReturnType<
        typeof getEngineContexts
    > | null>(null)
    const [inspectedEntry, setInspectedEntry] = useState<EvalEntry | null>(null)
    const [flagDetails, setFlagDetails] = useState<FlagDetails | null>(null)
    const [, copyToClipboard] = useCopyToClipboard()

    const discrepancyCount = useMemo(
        () => snapshot.filter((e) => e.status === 'mismatch').length,
        [snapshot],
    )

    const columns = useMemo(() => buildColumns(), [])

    useEffect(() => {
        if (isOpen) refreshSnapshot()
    }, [isOpen])

    function refreshSnapshot() {
        setSnapshot(Object.values(evalStore.getState().entries))
        setContexts(getEngineContexts())
    }

    function clearEvaluations() {
        evalStore.getState().clear()
        setSnapshot([])
    }

    function refreshInspection(flag: string) {
        const entry = evalStore.getState().entries[flag] ?? null
        setInspectedEntry(entry)
        setFlagDetails(getFlagDetails(flag))
    }

    function handleInspect(flag: string) {
        refreshInspection(flag)
    }

    function handleReEvaluate() {
        if (!inspectedEntry) return
        const flag = inspectedEntry.flag
        evaluateFlag(flag as FeatureFlagKey, inspectedEntry.defaultValue)
        queueMicrotask(() => {
            refreshInspection(flag)
            refreshSnapshot()
            toast.success(`Re-evaluated ${flag}`)
        })
    }

    return (
        <>
            <SidePanel
                isOpen={isOpen}
                onOpenChange={(open) => {
                    if (open) refreshSnapshot()
                    onOpenChange?.(open)
                }}
                width="80vw"
            >
                <OverlayHeader />
                <OverlayContent flexDirection="column" p={0} m={0}>
                    <DataTable
                        data={snapshot}
                        columns={columns}
                        sorting={{ enable: true }}
                        search={{ enable: true }}
                        pagination={{
                            enable: true,
                            defaultValue: { pageIndex: 0, pageSize: 50 },
                        }}
                        elevation="high"
                        onRowClick={(row) => handleInspect(row.flag)}
                    >
                        <DataTableToolbar
                            title={`${snapshot.length} evaluations (${discrepancyCount} mismatches)`}
                        >
                            <DataTableSearch placeholder="Search flags..." />
                            <DataTableActions>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={refreshSnapshot}
                                >
                                    Refresh
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                        const mismatches = snapshot
                                            .filter(
                                                (e) => e.status === 'mismatch',
                                            )
                                            .map((e) => ({
                                                ...e,
                                                raw: getFlagDetails(e.flag),
                                            }))
                                        copyToClipboard(
                                            JSON.stringify(mismatches, null, 2),
                                        )
                                        toast.success(
                                            `Copied ${mismatches.length} mismatches to clipboard`,
                                        )
                                    }}
                                >
                                    Export Mismatches
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    intent="destructive"
                                    onClick={clearEvaluations}
                                >
                                    Clear
                                </Button>
                            </DataTableActions>
                        </DataTableToolbar>
                    </DataTable>
                    {contexts && (
                        <Box gap="md" flexDirection="row" pt="md">
                            <Card elevation="default" flexGrow={1}>
                                <CardHeader title="LaunchDarkly Context" />
                                <CardContent>
                                    <Text size="sm" as="p">
                                        <pre style={preStyle}>
                                            {JSON.stringify(
                                                contexts.launchdarkly,
                                                null,
                                                2,
                                            )}
                                        </pre>
                                    </Text>
                                </CardContent>
                            </Card>
                            <Card elevation="default" flexGrow={1}>
                                <CardHeader title="Harness Context" />
                                <CardContent>
                                    <Text size="sm" as="p">
                                        <pre style={preStyle}>
                                            {JSON.stringify(
                                                contexts.harness,
                                                null,
                                                2,
                                            )}
                                        </pre>
                                    </Text>
                                </CardContent>
                            </Card>
                        </Box>
                    )}
                </OverlayContent>
            </SidePanel>

            <Modal
                isOpen={inspectedEntry !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setInspectedEntry(null)
                        setFlagDetails(null)
                    }
                }}
                size="lg"
            >
                <OverlayHeader
                    title={
                        inspectedEntry ? (
                            <Box
                                gap="sm"
                                flexDirection="row"
                                alignItems="center"
                            >
                                <Heading size="md">
                                    {inspectedEntry.flag}
                                </Heading>
                                <Tag
                                    color={
                                        inspectedEntry.status === 'match'
                                            ? 'green'
                                            : 'red'
                                    }
                                >
                                    {inspectedEntry.status}
                                </Tag>
                            </Box>
                        ) : (
                            ''
                        )
                    }
                />
                <OverlayContent>
                    {flagDetails && inspectedEntry && (
                        <Box gap="md" flexDirection="row" w="100%">
                            <Box
                                flexBasis="50%"
                                minWidth={0}
                                flexDirection="column"
                                gap="sm"
                            >
                                <TextField
                                    label="LaunchDarkly Flag ID"
                                    value={inspectedEntry.flag}
                                    isReadOnly
                                    trailingSlot={
                                        <Button
                                            variant="tertiary"
                                            icon="copy"
                                            onClick={() => {
                                                copyToClipboard(
                                                    inspectedEntry.flag,
                                                )
                                                toast.success(
                                                    'Copied to clipboard',
                                                )
                                            }}
                                        />
                                    }
                                />
                                <Box
                                    flexDirection="column"
                                    gap="xxxs"
                                    alignItems="flex-start"
                                >
                                    <Label>Value</Label>
                                    <ValueTag
                                        value={inspectedEntry.launchdarklyValue}
                                    />
                                </Box>
                                <Card elevation="default" h="100%">
                                    <CardHeader title="Raw Variation" />
                                    <CardContent>
                                        <Text size="sm" as="p">
                                            <pre style={preStyle}>
                                                {JSON.stringify(
                                                    flagDetails.launchdarkly,
                                                    null,
                                                    2,
                                                )}
                                            </pre>
                                        </Text>
                                    </CardContent>
                                </Card>
                            </Box>
                            <Box
                                flexBasis="50%"
                                minWidth={0}
                                flexDirection="column"
                                gap="sm"
                            >
                                <TextField
                                    label="Harness Flag ID"
                                    value={normalizeFlagId(inspectedEntry.flag)}
                                    isReadOnly
                                    trailingSlot={
                                        <Button
                                            variant="tertiary"
                                            icon="copy"
                                            onClick={() => {
                                                copyToClipboard(
                                                    normalizeFlagId(
                                                        inspectedEntry.flag,
                                                    ),
                                                )
                                                toast.success(
                                                    'Copied to clipboard',
                                                )
                                            }}
                                        />
                                    }
                                />
                                <Box
                                    flexDirection="column"
                                    gap="xxxs"
                                    alignItems="flex-start"
                                >
                                    <Label>Value</Label>
                                    <ValueTag
                                        value={inspectedEntry.harnessValue}
                                    />
                                </Box>
                                <Card elevation="default" h="100%">
                                    <CardHeader title="Raw Treatment" />
                                    <CardContent>
                                        <Text size="sm" as="p">
                                            <pre style={preStyle}>
                                                {JSON.stringify(
                                                    flagDetails.harness,
                                                    null,
                                                    2,
                                                )}
                                            </pre>
                                        </Text>
                                    </CardContent>
                                </Card>
                            </Box>
                        </Box>
                    )}
                </OverlayContent>
                <OverlayFooter hideCancelButton>
                    <Button onClick={handleReEvaluate}>Re-evaluate</Button>
                </OverlayFooter>
            </Modal>
        </>
    )
}
