import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { Router } from 'react-router-dom'

import { AlertBannerTypes, BannerCategories, ContextBanner } from 'AlertBanners'
import { UserRole } from 'config/types/user'
import { user } from 'fixtures/users'
import useAppSelector from 'hooks/useAppSelector'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { useTrackingBundleInstallationWarningCheck } from 'pages/aiAgent/hooks/useTrackingBundleInstallationWarningCheck'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useTrackingBundleInstallationWarningBanner } from '../useTrackingBundleInstallationWarningBanner'

jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')

jest.mock('pages/aiAgent/hooks/useTrackingBundleInstallationWarningCheck')
const mockUseTrackingBundleInstallationWarningCheck = jest.mocked(
    useTrackingBundleInstallationWarningCheck,
)

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = assumeMock(useAppSelector)

const mockUseStoreActivations = assumeMock(useStoreActivations)
const mockedAddBanner = jest.fn<unknown, [ContextBanner]>()
const mockedRemoveBanner = jest.fn()

jest.mock(
    'AlertBanners',
    () =>
        ({
            ...jest.requireActual('AlertBanners'),
            useBanners: () => ({
                addBanner: mockedAddBanner,
                removeBanner: mockedRemoveBanner,
            }),
        }) as Record<string, unknown>,
)

const renderBannerHookWithRouter = ({
    initialEntry = '/',
}: {
    initialEntry?: string
} = {}) => {
    const history = createMemoryHistory({ initialEntries: [initialEntry] })
    const wrapper = ({ children }: { children?: React.ReactNode }) => (
        <Router history={history}>{children}</Router>
    )

    return {
        ...renderHook(useTrackingBundleInstallationWarningBanner, { wrapper }),
        history,
    }
}

describe('useTrackingBundleInstallationWarningBanner', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseStoreActivations.mockReturnValue({
            storeActivations: {},
        } as ReturnType<typeof useStoreActivations>)
        mockUseTrackingBundleInstallationWarningCheck.mockReturnValue({
            uninstalledChatIntegrationId: 456,
        } as any)
        useAppSelectorMock.mockReturnValue(fromJS(user))
    })

    it.each([UserRole.Admin, UserRole.Agent, UserRole.GorgiasAgent])(
        'should render if the user is %s',
        (role: UserRole) => {
            useAppSelectorMock.mockReturnValue(
                fromJS({ ...user, role: { name: role } }),
            )
            renderBannerHookWithRouter()

            expect(mockedAddBanner).toHaveBeenCalledWith({
                category: BannerCategories.TRACKING_BUNDLE_INSTALLATION_WARNING,
                instanceId:
                    BannerCategories.TRACKING_BUNDLE_INSTALLATION_WARNING,
                type: AlertBannerTypes.Warning,
                preventDismiss: false,
                message: `Please update your chat's manual installation script to enable tracking for your Shopping Assistant.`,
                CTA: {
                    type: 'action',
                    text: 'Update Installation',
                    onClick: expect.any(Function),
                },
            })
        },
    )

    it.each([
        UserRole.BasicAgent,
        UserRole.LiteAgent,
        UserRole.ObserverAgent,
        UserRole.Bot,
    ])('should not render if user is %s', (role: UserRole) => {
        useAppSelectorMock.mockReturnValue(
            fromJS({ ...user, role: { name: role } }),
        )
        renderBannerHookWithRouter()

        expect(mockedAddBanner).not.toHaveBeenCalled()
    })

    it.each([
        '/app/tickets',
        '/app/tickets/123124',
        '/app/ticket',
        '/app/ticket/123124',
        '/app/ticket/new',
        '/app/views/123124',
    ])(
        'should remove the banner if the user goes to the %s page',
        (pathname) => {
            const { rerender, history } = renderBannerHookWithRouter()

            expect(mockedAddBanner).toHaveBeenCalled()

            history.push(pathname)

            rerender()

            expect(mockedRemoveBanner).toHaveBeenCalledWith(
                BannerCategories.TRACKING_BUNDLE_INSTALLATION_WARNING,
                BannerCategories.TRACKING_BUNDLE_INSTALLATION_WARNING,
            )
        },
    )

    it('should remove the banner if the user completes its installation', () => {
        const { rerender } = renderBannerHookWithRouter()

        expect(mockedAddBanner).toHaveBeenCalled()

        mockUseTrackingBundleInstallationWarningCheck.mockReturnValue({
            uninstalledChatIntegrationId: undefined,
        } as any)

        rerender()

        expect(mockedRemoveBanner).toHaveBeenCalledWith(
            BannerCategories.TRACKING_BUNDLE_INSTALLATION_WARNING,
            BannerCategories.TRACKING_BUNDLE_INSTALLATION_WARNING,
        )
    })
})
