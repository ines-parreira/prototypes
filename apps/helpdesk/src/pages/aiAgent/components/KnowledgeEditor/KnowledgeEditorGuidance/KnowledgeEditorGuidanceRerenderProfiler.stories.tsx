/* eslint-disable no-console */
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
} from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { areTrimmedStringsEqual } from 'pages/aiAgent/components/KnowledgeEditor/shared/utils'
import type { GuidanceArticle } from 'pages/aiAgent/types'

import {
    createInitialState,
    guidanceReducer,
    KnowledgeEditorGuidanceProvider,
    useGuidanceStore,
} from './context'
import type {
    GuidanceContextConfig,
    GuidanceContextValue,
    GuidanceReducerAction,
    GuidanceState,
} from './context'

const SYNTHETIC_TYPING_STEPS = 25
const SYNTHETIC_TYPING_DELAY_MS = 0

type HarnessKind = 'legacy-context' | 'zustand-selector'

type RenderMetricSink = {
    registerRender: (probeName: string, count: number) => void
    logSummary: (label: string) => void
    reset: () => void
}

const sleep = (delayMs: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, delayMs))

const mockGuidanceArticle: GuidanceArticle = {
    id: 1,
    title: 'Initial title',
    content: 'Initial content',
    visibility: 'PUBLIC',
    locale: 'en-US',
    createdDatetime: '2026-02-01T08:00:00.000Z',
    lastUpdated: '2026-02-01T08:00:00.000Z',
    draftVersionId: 101,
    publishedVersionId: 101,
    templateKey: null,
    isCurrent: true,
}

const mockConfig: GuidanceContextConfig = {
    shopName: 'storybook-shop',
    shopType: 'shopify',
    guidanceArticle: mockGuidanceArticle,
    guidanceTemplate: undefined,
    guidanceArticles: [],
    initialMode: 'edit',
    guidanceHelpCenter: {
        id: 1,
        default_locale: 'en-US',
        shop_integration_id: 1,
    } as GuidanceContextConfig['guidanceHelpCenter'],
    onClose: () => undefined,
    onClickPrevious: undefined,
    onClickNext: undefined,
    onDeleteFn: undefined,
    onCreateFn: undefined,
    onUpdateFn: undefined,
    onCopyFn: undefined,
    handleVisibilityUpdate: undefined,
}

const createMetricsSink = (harness: HarnessKind): RenderMetricSink => {
    const probeRenderCounts: Record<string, number> = {}

    return {
        registerRender: (probeName, count) => {
            probeRenderCounts[probeName] = count
            console.log(`[${harness}] ${probeName} render #${count}`)
        },
        logSummary: (label) => {
            console.groupCollapsed(`[${harness}] ${label}`)
            console.table({ ...probeRenderCounts })
            console.groupEnd()
        },
        reset: () => {
            Object.keys(probeRenderCounts).forEach((key) => {
                delete probeRenderCounts[key]
            })
            console.log(`[${harness}] probe counters reset`)
        },
    }
}

const ProbeRow = ({
    probeName,
    value,
    metrics,
}: {
    probeName: string
    value: string | number | boolean
    metrics: RenderMetricSink
}) => {
    const renderCountRef = useRef(0)
    renderCountRef.current += 1

    useEffect(() => {
        metrics.registerRender(probeName, renderCountRef.current)
    })

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '220px 120px 1fr',
                gap: '8px',
                padding: '6px 8px',
                borderBottom: '1px solid var(--border-neutral-default)',
                fontFamily: 'monospace',
                fontSize: '12px',
            }}
        >
            <span>{probeName}</span>
            <span>renders: {renderCountRef.current}</span>
            <span>value: {String(value)}</span>
        </div>
    )
}

const isLegacyHasPendingChanges = (state: GuidanceState) => {
    if (state.guidanceMode === 'read' || state.guidanceMode === 'diff') {
        return false
    }

    return (
        !areTrimmedStringsEqual(state.title, state.savedSnapshot.title) ||
        state.content !== state.savedSnapshot.content
    )
}

const isLegacyHasDraft = (state: GuidanceState) =>
    state.guidance !== undefined &&
    (!state.guidance.publishedVersionId ||
        state.guidance.draftVersionId !== state.guidance.publishedVersionId)

const isLegacyCanEdit = (state: GuidanceState) => {
    if (state.guidance === undefined) {
        return false
    }

    const hasDraft = isLegacyHasDraft(state)

    if (state.guidance.isCurrent && hasDraft) {
        return false
    }

    return true
}

const LegacyGuidanceContext = createContext<GuidanceContextValue | null>(null)

const useLegacyGuidanceContext = (): GuidanceContextValue => {
    const context = useContext(LegacyGuidanceContext)

    if (!context) {
        throw new Error(
            'useLegacyGuidanceContext must be used within LegacyGuidanceProvider',
        )
    }

    return context
}

const LegacyGuidanceProvider = ({
    config,
    children,
}: {
    config: GuidanceContextConfig
    children: React.ReactNode
}) => {
    const [state, dispatch] = useReducer(
        guidanceReducer,
        createInitialState(
            config.guidanceTemplate,
            config.guidanceArticle,
            config.initialMode,
        ),
    )

    const value = useMemo<GuidanceContextValue>(
        () => ({
            state,
            config,
            dispatch,
            guidanceArticle: config.guidanceArticle,
            hasPendingChanges: isLegacyHasPendingChanges(state),
            isFormValid:
                state.title.trim() !== '' && state.content.trim() !== '',
            hasDraft: isLegacyHasDraft(state),
            canEdit: isLegacyCanEdit(state),
            playground: {
                isOpen: false,
                onTest: () => undefined,
                onClose: () => undefined,
                sidePanelWidth: '100vw',
                shouldHideFullscreenButton: false,
            },
        }),
        [state, config],
    )

    return (
        <LegacyGuidanceContext.Provider value={value}>
            {children}
        </LegacyGuidanceContext.Provider>
    )
}

const HarnessControls = ({
    harness,
    title,
    onChangeTitle,
    onRunSyntheticTyping,
    onToggleDetailsView,
    onResetSession,
    onLogSummary,
}: {
    harness: HarnessKind
    title: string
    onChangeTitle: (title: string) => void
    onRunSyntheticTyping: () => Promise<void>
    onToggleDetailsView: () => void
    onResetSession: () => void
    onLogSummary: () => void
}) => (
    <div
        style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '8px',
            border: '1px solid var(--border-neutral-default)',
            borderRadius: '8px',
            background: 'var(--surface-neutral-primary)',
        }}
    >
        <label htmlFor={`${harness}-title-input`}>
            Title input ({harness})
        </label>
        <input
            id={`${harness}-title-input`}
            value={title}
            onChange={(event) => onChangeTitle(event.target.value)}
        />

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={onRunSyntheticTyping}>
                Run {SYNTHETIC_TYPING_STEPS} synthetic keystrokes
            </button>
            <button onClick={onToggleDetailsView}>Toggle details view</button>
            <button onClick={onLogSummary}>Log summary</button>
            <button onClick={onResetSession}>Reset counters</button>
        </div>
    </div>
)

const LegacyControls = ({
    metrics,
    onResetSession,
}: {
    metrics: RenderMetricSink
    onResetSession: () => void
}) => {
    const { state, dispatch } = useLegacyGuidanceContext()

    const onRunSyntheticTyping = useCallback(async () => {
        for (let index = 1; index <= SYNTHETIC_TYPING_STEPS; index += 1) {
            dispatch({
                type: 'SET_TITLE',
                payload: `synthetic-title-${index}`,
            })
            await sleep(SYNTHETIC_TYPING_DELAY_MS)
        }

        metrics.logSummary('Legacy summary after synthetic typing')
    }, [dispatch, metrics])

    return (
        <HarnessControls
            harness="legacy-context"
            title={state.title}
            onChangeTitle={(title) =>
                dispatch({ type: 'SET_TITLE', payload: title })
            }
            onRunSyntheticTyping={onRunSyntheticTyping}
            onToggleDetailsView={() =>
                dispatch({ type: 'TOGGLE_DETAILS_VIEW' })
            }
            onLogSummary={() => metrics.logSummary('Legacy summary on demand')}
            onResetSession={onResetSession}
        />
    )
}

const LegacyProbeTitle = ({ metrics }: { metrics: RenderMetricSink }) => {
    const {
        state: { title },
    } = useLegacyGuidanceContext()

    return (
        <ProbeRow probeName="TitleConsumer" value={title} metrics={metrics} />
    )
}

const LegacyProbeContent = ({ metrics }: { metrics: RenderMetricSink }) => {
    const {
        state: { content },
    } = useLegacyGuidanceContext()

    return (
        <ProbeRow
            probeName="ContentConsumer"
            value={content}
            metrics={metrics}
        />
    )
}

const LegacyProbeMode = ({ metrics }: { metrics: RenderMetricSink }) => {
    const {
        state: { guidanceMode },
    } = useLegacyGuidanceContext()

    return (
        <ProbeRow
            probeName="ModeConsumer"
            value={guidanceMode}
            metrics={metrics}
        />
    )
}

const LegacyProbePending = ({ metrics }: { metrics: RenderMetricSink }) => {
    const { hasPendingChanges } = useLegacyGuidanceContext()

    return (
        <ProbeRow
            probeName="PendingChangesConsumer"
            value={hasPendingChanges}
            metrics={metrics}
        />
    )
}

const LegacyProbeDetails = ({ metrics }: { metrics: RenderMetricSink }) => {
    const {
        state: { isDetailsView },
    } = useLegacyGuidanceContext()

    return (
        <ProbeRow
            probeName="DetailsViewConsumer"
            value={isDetailsView}
            metrics={metrics}
        />
    )
}

const LegacyProbeToolbarDisabled = ({
    metrics,
}: {
    metrics: RenderMetricSink
}) => {
    const {
        state: { isUpdating, isAutoSaving },
    } = useLegacyGuidanceContext()

    return (
        <ProbeRow
            probeName="ToolbarDisabledConsumer"
            value={isUpdating || isAutoSaving}
            metrics={metrics}
        />
    )
}

const LegacyProbePlayground = ({ metrics }: { metrics: RenderMetricSink }) => {
    const {
        playground: { shouldHideFullscreenButton },
    } = useLegacyGuidanceContext()

    return (
        <ProbeRow
            probeName="PlaygroundButtonVisibilityConsumer"
            value={shouldHideFullscreenButton}
            metrics={metrics}
        />
    )
}

const LegacyProbeOnClose = ({ metrics }: { metrics: RenderMetricSink }) => {
    const {
        config: { onClose },
    } = useLegacyGuidanceContext()

    return (
        <ProbeRow
            probeName="OnCloseRefConsumer"
            value={typeof onClose === 'function'}
            metrics={metrics}
        />
    )
}

const LegacyProbeSection = ({ metrics }: { metrics: RenderMetricSink }) => (
    <div
        style={{
            border: '1px solid var(--border-neutral-default)',
            borderRadius: '8px',
            overflow: 'hidden',
            marginTop: '8px',
        }}
    >
        <LegacyProbeTitle metrics={metrics} />
        <LegacyProbeContent metrics={metrics} />
        <LegacyProbeMode metrics={metrics} />
        <LegacyProbePending metrics={metrics} />
        <LegacyProbeDetails metrics={metrics} />
        <LegacyProbeToolbarDisabled metrics={metrics} />
        <LegacyProbePlayground metrics={metrics} />
        <LegacyProbeOnClose metrics={metrics} />
    </div>
)

const selectDispatch = (storeState: {
    dispatch: (action: GuidanceReducerAction) => void
}) => storeState.dispatch

const selectTitle = (storeState: { state: GuidanceState }) =>
    storeState.state.title
const selectContent = (storeState: { state: GuidanceState }) =>
    storeState.state.content
const selectMode = (storeState: { state: GuidanceState }) =>
    storeState.state.guidanceMode
const selectPending = (storeState: { state: GuidanceState }) => {
    const state = storeState.state

    if (state.guidanceMode === 'read' || state.guidanceMode === 'diff') {
        return false
    }

    return (
        !areTrimmedStringsEqual(state.title, state.savedSnapshot.title) ||
        state.content !== state.savedSnapshot.content
    )
}
const selectDetails = (storeState: { state: GuidanceState }) =>
    storeState.state.isDetailsView
const selectToolbarDisabled = (storeState: { state: GuidanceState }) =>
    storeState.state.isUpdating || storeState.state.isAutoSaving
const selectPlaygroundVisibility = (storeState: {
    playground: { shouldHideFullscreenButton: boolean }
}) => storeState.playground.shouldHideFullscreenButton
const selectOnCloseRef = (storeState: {
    config: { onClose: GuidanceContextConfig['onClose'] }
}) => typeof storeState.config.onClose === 'function'

const ZustandControls = ({
    metrics,
    onResetSession,
}: {
    metrics: RenderMetricSink
    onResetSession: () => void
}) => {
    const dispatch = useGuidanceStore(selectDispatch)
    const title = useGuidanceStore(selectTitle)

    const onRunSyntheticTyping = useCallback(async () => {
        for (let index = 1; index <= SYNTHETIC_TYPING_STEPS; index += 1) {
            dispatch({
                type: 'SET_TITLE',
                payload: `synthetic-title-${index}`,
            })
            await sleep(SYNTHETIC_TYPING_DELAY_MS)
        }

        metrics.logSummary('Zustand summary after synthetic typing')
    }, [dispatch, metrics])

    return (
        <HarnessControls
            harness="zustand-selector"
            title={title}
            onChangeTitle={(nextTitle) =>
                dispatch({ type: 'SET_TITLE', payload: nextTitle })
            }
            onRunSyntheticTyping={onRunSyntheticTyping}
            onToggleDetailsView={() =>
                dispatch({ type: 'TOGGLE_DETAILS_VIEW' })
            }
            onLogSummary={() => metrics.logSummary('Zustand summary on demand')}
            onResetSession={onResetSession}
        />
    )
}

const ZustandProbeTitle = ({ metrics }: { metrics: RenderMetricSink }) => {
    const title = useGuidanceStore(selectTitle)

    return (
        <ProbeRow probeName="TitleConsumer" value={title} metrics={metrics} />
    )
}

const ZustandProbeContent = ({ metrics }: { metrics: RenderMetricSink }) => {
    const content = useGuidanceStore(selectContent)

    return (
        <ProbeRow
            probeName="ContentConsumer"
            value={content}
            metrics={metrics}
        />
    )
}

const ZustandProbeMode = ({ metrics }: { metrics: RenderMetricSink }) => {
    const mode = useGuidanceStore(selectMode)

    return <ProbeRow probeName="ModeConsumer" value={mode} metrics={metrics} />
}

const ZustandProbePending = ({ metrics }: { metrics: RenderMetricSink }) => {
    const pending = useGuidanceStore(selectPending)

    return (
        <ProbeRow
            probeName="PendingChangesConsumer"
            value={pending}
            metrics={metrics}
        />
    )
}

const ZustandProbeDetails = ({ metrics }: { metrics: RenderMetricSink }) => {
    const details = useGuidanceStore(selectDetails)

    return (
        <ProbeRow
            probeName="DetailsViewConsumer"
            value={details}
            metrics={metrics}
        />
    )
}

const ZustandProbeToolbarDisabled = ({
    metrics,
}: {
    metrics: RenderMetricSink
}) => {
    const disabled = useGuidanceStore(selectToolbarDisabled)

    return (
        <ProbeRow
            probeName="ToolbarDisabledConsumer"
            value={disabled}
            metrics={metrics}
        />
    )
}

const ZustandProbePlayground = ({ metrics }: { metrics: RenderMetricSink }) => {
    const shouldHideFullscreenButton = useGuidanceStore(
        selectPlaygroundVisibility,
    )

    return (
        <ProbeRow
            probeName="PlaygroundButtonVisibilityConsumer"
            value={shouldHideFullscreenButton}
            metrics={metrics}
        />
    )
}

const ZustandProbeOnClose = ({ metrics }: { metrics: RenderMetricSink }) => {
    const onCloseRef = useGuidanceStore(selectOnCloseRef)

    return (
        <ProbeRow
            probeName="OnCloseRefConsumer"
            value={onCloseRef}
            metrics={metrics}
        />
    )
}

const ZustandProbeSection = ({ metrics }: { metrics: RenderMetricSink }) => (
    <div
        style={{
            border: '1px solid var(--border-neutral-default)',
            borderRadius: '8px',
            overflow: 'hidden',
            marginTop: '8px',
        }}
    >
        <ZustandProbeTitle metrics={metrics} />
        <ZustandProbeContent metrics={metrics} />
        <ZustandProbeMode metrics={metrics} />
        <ZustandProbePending metrics={metrics} />
        <ZustandProbeDetails metrics={metrics} />
        <ZustandProbeToolbarDisabled metrics={metrics} />
        <ZustandProbePlayground metrics={metrics} />
        <ZustandProbeOnClose metrics={metrics} />
    </div>
)

const LegacyHarness = () => {
    const [resetToken, setResetToken] = useState(0)
    const metricsRef = useRef<RenderMetricSink>(
        createMetricsSink('legacy-context'),
    )

    const onResetSession = useCallback(() => {
        metricsRef.current.reset()
        setResetToken((value) => value + 1)
    }, [])

    return (
        <LegacyGuidanceProvider config={mockConfig}>
            <div
                key={resetToken}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    padding: '12px',
                    border: '2px solid #e05454',
                    borderRadius: '12px',
                }}
            >
                <h3 style={{ margin: 0 }}>Legacy Context Simulation</h3>
                <p style={{ margin: 0 }}>
                    Every consumer subscribes to one context object.
                </p>
                <LegacyControls
                    metrics={metricsRef.current}
                    onResetSession={onResetSession}
                />
                <LegacyProbeSection metrics={metricsRef.current} />
            </div>
        </LegacyGuidanceProvider>
    )
}

const ZustandHarness = () => {
    const [resetToken, setResetToken] = useState(0)
    const metricsRef = useRef<RenderMetricSink>(
        createMetricsSink('zustand-selector'),
    )

    const onResetSession = useCallback(() => {
        metricsRef.current.reset()
        setResetToken((value) => value + 1)
    }, [])

    return (
        <KnowledgeEditorGuidanceProvider config={mockConfig}>
            <div
                key={resetToken}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    padding: '12px',
                    border: '2px solid #2f8f46',
                    borderRadius: '12px',
                }}
            >
                <h3 style={{ margin: 0 }}>Zustand Selector Harness</h3>
                <p style={{ margin: 0 }}>
                    Consumers subscribe to specific slices via selectors.
                </p>
                <ZustandControls
                    metrics={metricsRef.current}
                    onResetSession={onResetSession}
                />
                <ZustandProbeSection metrics={metricsRef.current} />
            </div>
        </KnowledgeEditorGuidanceProvider>
    )
}

const RerenderProfilerStory = () => (
    <div
        style={{
            display: 'grid',
            gap: '16px',
            padding: '16px',
            background: '#f5f7fb',
            color: '#17202b',
        }}
    >
        <p style={{ margin: 0 }}>
            Use the same action in both panels, then compare console output and
            render counters. The legacy panel should emit more render logs for
            unaffected probes.
        </p>
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
                gap: '16px',
                alignItems: 'start',
            }}
        >
            <LegacyHarness />
            <ZustandHarness />
        </div>
    </div>
)

const meta: Meta<typeof RerenderProfilerStory> = {
    title: 'AI Agent/Knowledge/KnowledgeEditor/Guidance Rerender Profiler',
    component: RerenderProfilerStory,
    parameters: {
        docs: {
            description: {
                component:
                    'Rerender benchmark harness. Compare legacy-context and zustand-selector behavior under repeated title updates. Check console logs and console.table summaries for per-probe render counts.',
            },
        },
    },
}

export default meta

type Story = StoryObj<typeof RerenderProfilerStory>

export const CompareLegacyVsZustand: Story = {
    render: () => <RerenderProfilerStory />,
}
