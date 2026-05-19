jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    reportError: jest.fn(),
}))

jest.mock('@sentry/react', () => ({
    addBreadcrumb: jest.fn(),
}))

type EventHandler = (event: { detail: { value: number } }) => void

interface NoticeableMock {
    render: jest.Mock
    do: jest.Mock
    on: jest.Mock
}

type HookModule = typeof import('../useNoticeableWidget')
type PureLib = typeof import('@testing-library/react/pure')

const freshNoticeable = (): NoticeableMock => ({
    render: jest.fn(() => Promise.resolve()),
    do: jest.fn(),
    on: jest.fn(),
})

const flush = async () => {
    for (let i = 0; i < 5; i += 1) {
        await Promise.resolve()
    }
}

const getEventHandler = (noticeable: NoticeableMock): EventHandler => {
    expect(noticeable.on).toHaveBeenCalled()
    return noticeable.on.mock.calls[0]![2] as EventHandler
}

const withFreshModule = (
    fn: (loaded: {
        mod: HookModule
        lib: PureLib
        noticeable: NoticeableMock
    }) => void | Promise<void>,
) => {
    const noticeable = freshNoticeable()
    window.noticeableWidgetId = 'widget-id-123'
    window.noticeable = noticeable as unknown as typeof window.noticeable
    document.body.innerHTML = ''

    return jest.isolateModulesAsync(async () => {
        const lib = require('@testing-library/react/pure') as PureLib
        const mod = require('../useNoticeableWidget') as HookModule
        try {
            await fn({ mod, lib, noticeable })
        } finally {
            lib.cleanup()
        }
    })
}

describe('useNoticeableWidget module', () => {
    const reportErrorMock = jest.requireMock('@repo/logging')
        .reportError as jest.Mock
    const addBreadcrumbMock = jest.requireMock('@sentry/react')
        .addBreadcrumb as jest.Mock

    beforeEach(() => {
        reportErrorMock.mockClear()
        addBreadcrumbMock.mockClear()
    })

    afterEach(() => {
        delete (window as unknown as { noticeable?: unknown }).noticeable
    })

    describe('useNoticeableUnreadCount', () => {
        it('returns 0 before any event fires', () =>
            withFreshModule(({ mod, lib }) => {
                const { result } = lib.renderHook(() =>
                    mod.useNoticeableUnreadCount(),
                )

                expect(result.current).toBe(0)
            }))

        it('updates when the Noticeable unread_count_changed handler fires', () =>
            withFreshModule(({ mod, lib, noticeable }) => {
                const { result } = lib.renderHook(() => {
                    mod.useNoticeableWidget()
                    return mod.useNoticeableUnreadCount()
                })
                const handler = getEventHandler(noticeable)

                lib.act(() => handler({ detail: { value: 7 } }))

                expect(result.current).toBe(7)
                expect(addBreadcrumbMock).toHaveBeenCalledWith(
                    expect.objectContaining({ category: 'noticeable' }),
                )
            }))

        it('does not notify subscribers when the new value equals the current one', () =>
            withFreshModule(({ mod, lib, noticeable }) => {
                let renderCount = 0
                lib.renderHook(() => {
                    mod.useNoticeableWidget()
                    renderCount += 1
                    return mod.useNoticeableUnreadCount()
                })
                const handler = getEventHandler(noticeable)
                const baselineRenders = renderCount

                lib.act(() => handler({ detail: { value: 0 } }))

                expect(renderCount).toBe(baselineRenders)
            }))
    })

    describe('useNoticeableWidget effect', () => {
        it('creates the mount node and renders the widget when one does not exist', () =>
            withFreshModule(async ({ mod, lib, noticeable }) => {
                lib.renderHook(() => mod.useNoticeableWidget())

                expect(
                    document.getElementById('noticeable-widget'),
                ).not.toBeNull()
                expect(noticeable.render).toHaveBeenCalledWith(
                    'widget',
                    'widget-id-123',
                )
                await flush()
                expect(addBreadcrumbMock).toHaveBeenCalledWith(
                    expect.objectContaining({ message: 'widget rendered' }),
                )
            }))

        it('reuses an existing mount node', () =>
            withFreshModule(({ mod, lib }) => {
                const existing = document.createElement('div')
                existing.id = 'noticeable-widget'
                document.body.appendChild(existing)

                lib.renderHook(() => mod.useNoticeableWidget())

                expect(document.getElementById('noticeable-widget')).toBe(
                    existing,
                )
            }))

        it('does nothing when window.noticeable is not defined', () => {
            delete (window as unknown as { noticeable?: unknown }).noticeable

            return jest.isolateModulesAsync(async () => {
                const lib = require('@testing-library/react/pure') as PureLib
                const mod = require('../useNoticeableWidget') as HookModule

                lib.renderHook(() => mod.useNoticeableWidget())
                lib.cleanup()

                expect(reportErrorMock).not.toHaveBeenCalled()
            })
        })

        it('swallows render errors inside the effect without throwing', () =>
            withFreshModule(async ({ mod, lib, noticeable }) => {
                const error = new Error('effect-render-failed')
                noticeable.render.mockReturnValueOnce(Promise.reject(error))

                lib.renderHook(() => mod.useNoticeableWidget())

                await flush()

                expect(reportErrorMock).toHaveBeenCalledWith(error)
            }))

        it('accepts Noticeable render returning synchronously', () =>
            withFreshModule(async ({ mod, lib, noticeable }) => {
                noticeable.render.mockReturnValueOnce(undefined)

                lib.renderHook(() => mod.useNoticeableWidget())

                await flush()

                expect(reportErrorMock).not.toHaveBeenCalled()
                expect(addBreadcrumbMock).toHaveBeenCalledWith(
                    expect.objectContaining({ message: 'widget rendered' }),
                )
            }))

        it('caches the render promise across repeated mounts', () =>
            withFreshModule(({ mod, lib, noticeable }) => {
                const { unmount } = lib.renderHook(() =>
                    mod.useNoticeableWidget(),
                )
                unmount()
                lib.renderHook(() => mod.useNoticeableWidget())

                expect(noticeable.render).toHaveBeenCalledTimes(1)
            }))
    })

    describe('openNoticeableWidget', () => {
        it('ensures the mount node even when window.noticeable is undefined', () => {
            delete (window as unknown as { noticeable?: unknown }).noticeable

            return jest.isolateModulesAsync(async () => {
                const mod = require('../useNoticeableWidget') as HookModule

                mod.openNoticeableWidget()

                expect(
                    document.getElementById('noticeable-widget'),
                ).not.toBeNull()
            })
        })

        it('opens the widget after the render promise resolves', () =>
            withFreshModule(async ({ mod, noticeable }) => {
                mod.openNoticeableWidget()

                expect(noticeable.render).toHaveBeenCalled()
                await flush()
                expect(noticeable.do).toHaveBeenCalledWith(
                    'widget:open',
                    'widget-id-123',
                )
            }))

        it('reports the render error and resets the cached render promise on rejection', () =>
            withFreshModule(async ({ mod, noticeable }) => {
                const error = new Error('render-failed')
                noticeable.render.mockReturnValueOnce(Promise.reject(error))

                mod.openNoticeableWidget()

                await flush()

                expect(reportErrorMock).toHaveBeenCalledWith(error)
                expect(noticeable.do).not.toHaveBeenCalled()

                mod.openNoticeableWidget()
                expect(noticeable.render).toHaveBeenCalledTimes(2)
            }))

        it('reports synchronous render throws via reportError', () =>
            withFreshModule(async ({ mod, noticeable }) => {
                const error = new Error('sync-throw')
                noticeable.render.mockImplementationOnce(() => {
                    throw error
                })

                mod.openNoticeableWidget()

                await flush()

                expect(reportErrorMock).toHaveBeenCalledWith(error)
            }))

        it('subscribes to unread_count_changed events only once across multiple calls', () =>
            withFreshModule(({ mod, noticeable }) => {
                mod.openNoticeableWidget()
                mod.openNoticeableWidget()

                expect(noticeable.on).toHaveBeenCalledTimes(1)
            }))
    })
})
