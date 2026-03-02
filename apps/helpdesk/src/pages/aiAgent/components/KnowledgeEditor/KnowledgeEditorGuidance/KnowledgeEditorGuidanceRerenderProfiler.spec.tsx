import { createContext, useContext, useMemo, useReducer } from 'react'
import type { MutableRefObject } from 'react'

import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

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

type RenderCounts = Record<string, number>

const countRender = (
    countsRef: MutableRefObject<RenderCounts>,
    key: string,
): number => {
    const nextCount = (countsRef.current[key] ?? 0) + 1
    countsRef.current[key] = nextCount
    return nextCount
}

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
    shopName: 'test-shop',
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

const LegacyTitleField = ({
    countsRef,
}: {
    countsRef: MutableRefObject<RenderCounts>
}) => {
    const { state, dispatch } = useLegacyGuidanceContext()
    const titleRenderCount = countRender(countsRef, 'legacy.title')

    return (
        <>
            <label htmlFor="legacy-input">Legacy input</label>
            <input
                id="legacy-input"
                value={state.title}
                onChange={(event) =>
                    dispatch({ type: 'SET_TITLE', payload: event.target.value })
                }
            />
            <div>legacy-title-renders: {titleRenderCount}</div>
        </>
    )
}

const LegacyContentProbe = ({
    countsRef,
}: {
    countsRef: MutableRefObject<RenderCounts>
}) => {
    const { state } = useLegacyGuidanceContext()
    const contentRenderCount = countRender(countsRef, 'legacy.content')

    return (
        <>
            <div>legacy-content-renders: {contentRenderCount}</div>
            <div>legacy-content-value: {state.content}</div>
        </>
    )
}

const LegacyDetailsProbe = ({
    countsRef,
}: {
    countsRef: MutableRefObject<RenderCounts>
}) => {
    const { state } = useLegacyGuidanceContext()
    const detailsRenderCount = countRender(countsRef, 'legacy.details')

    return (
        <>
            <div>legacy-details-renders: {detailsRenderCount}</div>
            <div>legacy-details-value: {String(state.isDetailsView)}</div>
        </>
    )
}

const LegacyHarness = ({
    countsRef,
}: {
    countsRef: MutableRefObject<RenderCounts>
}) => (
    <div>
        <LegacyTitleField countsRef={countsRef} />
        <LegacyContentProbe countsRef={countsRef} />
        <LegacyDetailsProbe countsRef={countsRef} />
    </div>
)

const ZustandTitleField = ({
    countsRef,
}: {
    countsRef: MutableRefObject<RenderCounts>
}) => {
    const dispatch = useGuidanceStore(
        (storeState: { dispatch: (action: GuidanceReducerAction) => void }) =>
            storeState.dispatch,
    )
    const title = useGuidanceStore((storeState) => storeState.state.title)
    const titleRenderCount = countRender(countsRef, 'zustand.title')

    return (
        <>
            <label htmlFor="zustand-input">Zustand input</label>
            <input
                id="zustand-input"
                value={title}
                onChange={(event) =>
                    dispatch({ type: 'SET_TITLE', payload: event.target.value })
                }
            />
            <div>zustand-title-renders: {titleRenderCount}</div>
        </>
    )
}

const ZustandContentProbe = ({
    countsRef,
}: {
    countsRef: MutableRefObject<RenderCounts>
}) => {
    const content = useGuidanceStore((storeState) => storeState.state.content)
    const contentRenderCount = countRender(countsRef, 'zustand.content')

    return (
        <>
            <div>zustand-content-renders: {contentRenderCount}</div>
            <div>zustand-content-value: {content}</div>
        </>
    )
}

const ZustandDetailsProbe = ({
    countsRef,
}: {
    countsRef: MutableRefObject<RenderCounts>
}) => {
    const isDetailsView = useGuidanceStore(
        (storeState) => storeState.state.isDetailsView,
    )
    const detailsRenderCount = countRender(countsRef, 'zustand.details')

    return (
        <>
            <div>zustand-details-renders: {detailsRenderCount}</div>
            <div>zustand-details-value: {String(isDetailsView)}</div>
        </>
    )
}

const ZustandHarness = ({
    countsRef,
}: {
    countsRef: MutableRefObject<RenderCounts>
}) => (
    <div>
        <ZustandTitleField countsRef={countsRef} />
        <ZustandContentProbe countsRef={countsRef} />
        <ZustandDetailsProbe countsRef={countsRef} />
    </div>
)

describe('KnowledgeEditorGuidance rerender isolation', () => {
    it('rerenders unaffected consumers less with zustand selectors than with legacy context', async () => {
        const user = userEvent.setup()

        const legacyCountsRef = { current: {} as RenderCounts }

        render(
            <LegacyGuidanceProvider config={mockConfig}>
                <LegacyHarness countsRef={legacyCountsRef} />
            </LegacyGuidanceProvider>,
        )

        await act(async () => {
            await user.type(screen.getByLabelText('Legacy input'), 'abcdefghij')
        })

        const zustandCountsRef = { current: {} as RenderCounts }

        render(
            <KnowledgeEditorGuidanceProvider config={mockConfig}>
                <ZustandHarness countsRef={zustandCountsRef} />
            </KnowledgeEditorGuidanceProvider>,
        )

        await act(async () => {
            await user.type(
                screen.getByLabelText('Zustand input'),
                'abcdefghij',
            )
        })

        const legacyContentRenders = legacyCountsRef.current['legacy.content']
        const legacyDetailsRenders = legacyCountsRef.current['legacy.details']

        const zustandContentRenders =
            zustandCountsRef.current['zustand.content']
        const zustandDetailsRenders =
            zustandCountsRef.current['zustand.details']

        expect(legacyContentRenders).toBeGreaterThan(zustandContentRenders)
        expect(legacyDetailsRenders).toBeGreaterThan(zustandDetailsRenders)

        // The title subscriber should still rerender while typing.
        expect(zustandCountsRef.current['zustand.title']).toBeGreaterThan(1)
    })
})
