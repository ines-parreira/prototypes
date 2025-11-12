// Mock analytics
window.SEGMENT_ANALYTICS_USER_ID = '1_1'
globalThis.analytics = {
    addIntegration: vi.fn(),
    alias: vi.fn(),
    debug: vi.fn(),
    group: vi.fn(),
    identify: vi.fn(),
    init: vi.fn(),
    load: vi.fn(),
    on: vi.fn(),
    page: vi.fn(),
    ready: vi.fn(),
    reset: vi.fn(),
    setAnonymousId: vi.fn(),
    timeout: vi.fn(),
    track: vi.fn(),
    trackForm: vi.fn(),
    trackLink: vi.fn(),
    use: vi.fn(),
    user: vi.fn(),
}
