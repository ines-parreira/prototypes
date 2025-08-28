import { ComponentProps } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { act, render } from '@testing-library/react'

import { RealtimeProvider } from '@gorgias/realtime'

import { AlertBannerTypes, BannerCategories, useBanners } from 'AlertBanners'
import { logEvent, SegmentEvent } from 'common/segment'
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

jest.mock('common/segment/segment')
const mockLogEvent = logEvent as jest.Mock

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
        ['yakovishen', true, 0],
        ['other', false, 5],
    ])(
        `should set PNWorkerLogVerbosity to %s`,
        (domain, expected, logLevel) => {
            window.GORGIAS_STATE.currentAccount.domain = domain

            render(<RealtimeAppProvider>foo</RealtimeAppProvider>)

            expect(MockRealtimeProvider).toHaveBeenCalledWith(
                expect.objectContaining({
                    subscriptionWorkerLogVerbosity: expected,
                    logLevel,
                }),
                {},
            )
        },
    )

    it('should call reportError when there is an error', () => {
        const pnError = new Error(`PubNub Status error`)
        render(<RealtimeAppProvider>foo</RealtimeAppProvider>)

        MockRealtimeProvider.mock.calls[0][0].onErrorStatus(
            {
                statusCode: '400',
                operation: 'foo',
                category: 'bar',
            },
            '1.0.0',
        )

        expect(mockReportError).toHaveBeenCalledWith(pnError, {
            tags: {
                operation: 'foo',
                statusCode: '400',
                category: 'bar',
                pnSdkVersion: '1.0.0',
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

    it('should call report error with access error message when status is access denied', () => {
        const pnError = new Error(`PubNub Status error`)
        render(<RealtimeAppProvider>foo</RealtimeAppProvider>)

        MockRealtimeProvider.mock.calls[0][0].onErrorStatus({
            statusCode: '400',
            operation: 'foo',
            category: 'PNAccessDeniedCategory',
            errorData: { message: 'Access denied' },
        })

        expect(mockReportError).toHaveBeenCalledWith(pnError, {
            tags: {
                operation: 'foo',
                statusCode: '400',
                category: 'PNAccessDeniedCategory',
                message: 'Access denied',
            },
            extra: {
                status: {
                    statusCode: '400',
                    operation: 'foo',
                    category: 'PNAccessDeniedCategory',
                    errorData: { message: 'Access denied' },
                },
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

    it('should add a banner when the error threshold is reached and log an event', () => {
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

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.RealtimeConnectivityBannerDisplayed,
        )
    })

    it('should open helpdocs when clicking the error banner CTA and log an event', () => {
        const mockAddBanner = jest.fn()
        mockUseBanners.mockReturnValue({
            addBanner: mockAddBanner,
            removeBanner: jest.fn(),
        })

        render(<RealtimeAppProvider>foo</RealtimeAppProvider>)

        mockUseErrorThreshold.mock.calls[0][1]()

        mockAddBanner.mock.calls[0][0].CTA.onClick()

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.RealtimeConnectivityBannerDocsClicked,
        )
        expect(window.open).toHaveBeenCalledWith(
            'https://docs.gorgias.com/en-US/common-account-errors-486968#cant-connect-to-real-time-updates',
            '_blank',
        )
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

    it('should reset error count when realtime is disabled', () => {
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
                return false
            }
            return true
        })

        rerender(<RealtimeAppProvider>foo</RealtimeAppProvider>)

        expect(mockResetErrorCount).toHaveBeenCalled()
    })

    describe('onNetworkUp handler', () => {
        it('should reset error count and remove banner when network comes up', () => {
            const mockResetErrorCount = jest.fn()
            const mockRemoveBanner = jest.fn()
            mockUseErrorThreshold.mockReturnValue({
                incrementErrorCount: jest.fn(),
                resetErrorCount: mockResetErrorCount,
            })
            mockUseBanners.mockReturnValue({
                addBanner: jest.fn(),
                removeBanner: mockRemoveBanner,
            })

            render(<RealtimeAppProvider>foo</RealtimeAppProvider>)

            act(() => {
                MockRealtimeProvider.mock.calls[0][0].onNetworkUp()
            })

            expect(mockResetErrorCount).toHaveBeenCalled()
            expect(mockRemoveBanner).toHaveBeenCalledWith(
                BannerCategories.REALTIME_CONNECTIVITY,
                'realtime-connectivity-banner',
            )
        })

        it('should not reset error count even when realtime is disabled', () => {
            const mockResetErrorCount = jest.fn()
            const mockRemoveBanner = jest.fn()
            mockUseErrorThreshold.mockReturnValue({
                incrementErrorCount: jest.fn(),
                resetErrorCount: mockResetErrorCount,
            })
            mockUseBanners.mockReturnValue({
                addBanner: jest.fn(),
                removeBanner: mockRemoveBanner,
            })
            mockUseFlag.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.PubNubRealtime) {
                    return false
                }
                return true
            })

            render(<RealtimeAppProvider>foo</RealtimeAppProvider>)

            act(() => {
                MockRealtimeProvider.mock.calls[0][0].onNetworkUp()
            })

            expect(mockResetErrorCount).not.toHaveBeenCalled()
            expect(mockRemoveBanner).not.toHaveBeenCalled()
        })
    })

    describe('onNetworkDown handler', () => {
        it('should reset error count and display banner without logging when network goes down', () => {
            const mockResetErrorCount = jest.fn()
            const mockAddBanner = jest.fn()
            mockUseErrorThreshold.mockReturnValue({
                incrementErrorCount: jest.fn(),
                resetErrorCount: mockResetErrorCount,
            })
            mockUseBanners.mockReturnValue({
                addBanner: mockAddBanner,
                removeBanner: jest.fn(),
            })

            render(<RealtimeAppProvider>foo</RealtimeAppProvider>)

            act(() => {
                MockRealtimeProvider.mock.calls[0][0].onNetworkDown()
            })

            expect(mockResetErrorCount).toHaveBeenCalled()
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
            expect(mockLogEvent).not.toHaveBeenCalled()
        })

        it('should not reset error count and display banner without logging when network goes down and realtime is disabled', () => {
            const mockResetErrorCount = jest.fn()
            const mockAddBanner = jest.fn()
            mockUseErrorThreshold.mockReturnValue({
                incrementErrorCount: jest.fn(),
                resetErrorCount: mockResetErrorCount,
            })
            mockUseBanners.mockReturnValue({
                addBanner: mockAddBanner,
                removeBanner: jest.fn(),
            })
            mockUseFlag.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.PubNubRealtime) {
                    return false
                }
                return true
            })

            render(<RealtimeAppProvider>foo</RealtimeAppProvider>)

            act(() => {
                MockRealtimeProvider.mock.calls[0][0].onNetworkDown()
            })

            expect(mockResetErrorCount).not.toHaveBeenCalled()
            expect(mockAddBanner).not.toHaveBeenCalled()
            expect(mockLogEvent).not.toHaveBeenCalled()
        })
    })

    it('should not increment error count when PN network is down', () => {
        const mockIncrementErrorCount = jest.fn()
        mockUseErrorThreshold.mockReturnValue({
            incrementErrorCount: mockIncrementErrorCount,
            resetErrorCount: jest.fn(),
        })

        const { rerender } = render(
            <RealtimeAppProvider>foo</RealtimeAppProvider>,
        )

        act(() => {
            MockRealtimeProvider.mock.calls[0][0].onNetworkDown()
        })

        rerender(<RealtimeAppProvider>foo</RealtimeAppProvider>)

        act(() => {
            MockRealtimeProvider.mock.calls[
                MockRealtimeProvider.mock.calls.length - 1
            ][0].onErrorStatus({
                statusCode: '400',
                operation: 'foo',
                category: 'PNNetworkIssuesCategory',
            })
        })

        expect(mockIncrementErrorCount).not.toHaveBeenCalled()
    })
})
