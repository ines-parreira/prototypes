import { ComponentProps } from 'react'

import { render } from '@testing-library/react'

import { RealtimeProvider } from '@gorgias/realtime'

import { AlertBannerTypes, BannerCategories, useBanners } from 'AlertBanners'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { reportError } from 'utils/errors'

import { useErrorThreshold } from '../hooks/useErrorThreshold'
import RealtimeAppProvider from '../RealtimeAppProvider'

const MockRealtimeProvider = jest
    .fn()
    .mockImplementation(
        ({ children }: ComponentProps<typeof RealtimeProvider>) => (
            <div>
                <p>RealtimeProvider</p>
                {children}
            </div>
        ),
    )

jest.mock('@gorgias/realtime', () => ({
    ...jest.requireActual('@gorgias/realtime'),
    RealtimeProvider: (props: ComponentProps<typeof RealtimeProvider>) => (
        <MockRealtimeProvider {...props} />
    ),
}))

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))
const mockUseFlag = useFlag as jest.Mock

jest.mock('utils/errors')
const mockReportError = reportError as jest.Mock

jest.mock('../hooks/useErrorThreshold', () => ({
    useErrorThreshold: jest.fn().mockReturnValue({
        incrementErrorCount: jest.fn(),
        resetErrorCount: jest.fn(),
    }),
}))
const mockUseErrorThreshold = useErrorThreshold as jest.Mock

jest.mock('AlertBanners', () => ({
    ...jest.requireActual('AlertBanners'),
    useBanners: jest.fn().mockReturnValue({
        addBanner: jest.fn(),
        removeBanner: jest.fn(),
    }),
}))
const mockUseBanners = useBanners as jest.Mock

describe('RealtimeAppProvider', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseFlag.mockImplementation((flag) => {
            switch (flag) {
                case FeatureFlagKey.CatchPNErrors:
                    return true
                case FeatureFlagKey.PubNubRealtime:
                    return true
                case FeatureFlagKey.PubnNubRealtimeErrorThreshold:
                    return { enabled: true, threshold: 3 }
                default:
                    return false
            }
        })
    })

    it('should render', () => {
        const { getByText } = render(
            <RealtimeAppProvider>foo</RealtimeAppProvider>,
        )

        expect(getByText('RealtimeProvider')).toBeInTheDocument()
    })

    it.each([
        ['acme', true],
        ['artemisathletix', true],
        ['yakovishen', true],
        ['walter-test', true],
        ['other', false],
    ])(`should set PNWorkerLogVerbosity to %s`, (domain, expected) => {
        window.GORGIAS_STATE.currentAccount.domain = domain

        render(<RealtimeAppProvider>foo</RealtimeAppProvider>)

        expect(MockRealtimeProvider).toHaveBeenCalledWith(
            expect.objectContaining({
                subscriptionWorkerLogVerbosity: expected,
            }),
            {},
        )
    })

    it('should call reportError when there is an error', () => {
        const pnError = new Error(`PubNub Status error`)
        render(<RealtimeAppProvider>foo</RealtimeAppProvider>)

        MockRealtimeProvider.mock.calls[0][0].onErrorStatus({
            statusCode: '400',
            operation: 'foo',
            category: 'bar',
        })

        expect(mockReportError).toHaveBeenCalledWith(pnError, {
            tags: {
                operation: 'foo',
                statusCode: '400',
                category: 'bar',
            },
            extra: {
                status: {
                    statusCode: '400',
                    operation: 'foo',
                    category: 'bar',
                },
            },
        })
    })

    it('should call report error with fallback values when status is not an object', () => {
        const pnError = new Error(`PubNub Status error`)
        render(<RealtimeAppProvider>foo</RealtimeAppProvider>)

        MockRealtimeProvider.mock.calls[0][0].onErrorStatus({})

        expect(mockReportError).toHaveBeenCalledWith(pnError, {
            tags: {
                operation: 'unknown',
                statusCode: 'unknown',
                category: 'unknown',
            },
            extra: {
                status: {},
            },
        })
    })

    it('should increment the error count when network issues occur', () => {
        const mockIncrementErrorCount = jest.fn()
        mockUseErrorThreshold.mockReturnValueOnce({
            incrementErrorCount: mockIncrementErrorCount,
            resetErrorCount: jest.fn(),
        })

        render(<RealtimeAppProvider>foo</RealtimeAppProvider>)

        MockRealtimeProvider.mock.calls[0][0].onErrorStatus({
            statusCode: '400',
            operation: 'foo',
            category: 'PNNetworkIssuesCategory',
        })

        expect(mockIncrementErrorCount).toHaveBeenCalledTimes(1)
    })

    it('should not increment error count when realtime is disabled', () => {
        const mockIncrementErrorCount = jest.fn()
        mockUseErrorThreshold.mockReturnValueOnce({
            incrementErrorCount: mockIncrementErrorCount,
            resetErrorCount: jest.fn(),
        })
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.PubNubRealtime) {
                return false
            }
            return true
        })

        render(<RealtimeAppProvider>foo</RealtimeAppProvider>)

        MockRealtimeProvider.mock.calls[0][0].onErrorStatus({
            statusCode: '400',
            operation: 'foo',
            category: 'PNNetworkIssuesCategory',
        })

        expect(mockIncrementErrorCount).not.toHaveBeenCalled()
    })

    it('should not increment error count when error threshold is disabled', () => {
        const mockIncrementErrorCount = jest.fn()
        mockUseErrorThreshold.mockReturnValueOnce({
            incrementErrorCount: mockIncrementErrorCount,
            resetErrorCount: jest.fn(),
        })
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.PubnNubRealtimeErrorThreshold) {
                return { enabled: false, threshold: 3 }
            }
            return true
        })

        render(<RealtimeAppProvider>foo</RealtimeAppProvider>)

        MockRealtimeProvider.mock.calls[0][0].onErrorStatus({
            statusCode: '400',
            operation: 'foo',
            category: 'PNNetworkIssuesCategory',
        })

        expect(mockIncrementErrorCount).not.toHaveBeenCalled()
    })

    it('should add a banner when the error threshold is reached', () => {
        const mockAddBanner = jest.fn()
        mockUseBanners.mockReturnValue({
            addBanner: mockAddBanner,
            removeBanner: jest.fn(),
        })

        render(<RealtimeAppProvider>foo</RealtimeAppProvider>)

        mockUseErrorThreshold.mock.calls[0][1]()

        expect(mockAddBanner).toHaveBeenCalledWith({
            category: BannerCategories.REALTIME_CONNECTIVITY,
            type: AlertBannerTypes.Critical,
            message: `Can't connect to realtime updates. Please consult the debugging guide.`,
            instanceId: 'realtime-connectivity-banner',
            CTA: {
                type: 'action',
                text: 'View debugging guide',
                onClick: expect.any(Function),
            },
        })
    })

    it('should remove the banner when the error threshold is reset', () => {
        const mockAddBanner = jest.fn()
        const mockRemoveBanner = jest.fn()
        mockUseBanners.mockReturnValue({
            addBanner: mockAddBanner,
            removeBanner: mockRemoveBanner,
        })

        render(<RealtimeAppProvider>foo</RealtimeAppProvider>)

        MockRealtimeProvider.mock.calls[0][0].onReconnectStatus()

        expect(mockRemoveBanner).toHaveBeenCalledWith(
            BannerCategories.REALTIME_CONNECTIVITY,
            'realtime-connectivity-banner',
        )
    })

    it.each([
        ['PubNubRealtime disabled', false, { enabled: true, threshold: 3 }],
        [
            'PubnNubRealtimeErrorThreshold threshold changed',
            true,
            { enabled: true, threshold: 5 },
        ],
        [
            'PubnNubRealtimeErrorThreshold enabled changed',
            true,
            { enabled: false, threshold: 3 },
        ],
    ])('should reset error count when %s', (_, realtimeFF, thresholdFF) => {
        const mockResetErrorCount = jest.fn()
        mockUseErrorThreshold.mockReturnValue({
            incrementErrorCount: jest.fn(),
            resetErrorCount: mockResetErrorCount,
        })

        const { rerender } = render(
            <RealtimeAppProvider>foo</RealtimeAppProvider>,
        )

        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.PubNubRealtime) {
                return realtimeFF
            }
            if (flag === FeatureFlagKey.PubnNubRealtimeErrorThreshold) {
                return thresholdFF
            }
            return false
        })

        rerender(<RealtimeAppProvider>foo</RealtimeAppProvider>)

        expect(mockResetErrorCount).toHaveBeenCalled()
    })
})
