import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { Router } from 'react-router-dom'

import { UserRole } from 'config/types/user'
import { user } from 'fixtures/users'
import useAppSelector from 'hooks/useAppSelector'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { useTrackingBundleInstallationWarningCheck } from 'pages/aiAgent/hooks/useTrackingBundleInstallationWarningCheck'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useWarningBannerIsDisplayed } from '../useWarningBannerIsDisplayed'

jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = assumeMock(useAppSelector)

const mockUseStoreActivations = assumeMock(useStoreActivations)

jest.mock('pages/aiAgent/hooks/useTrackingBundleInstallationWarningCheck')
const mockUseTrackingBundleInstallationWarningCheck = jest.mocked(
    useTrackingBundleInstallationWarningCheck,
)

const renderHookWithRouter = ({
    initialEntry = '/',
    props = {},
}: {
    initialEntry?: string
    props?: Parameters<typeof useWarningBannerIsDisplayed>[0]
} = {}) => {
    const history = createMemoryHistory({ initialEntries: [initialEntry] })
    const wrapper = ({ children }: { children?: React.ReactNode }) => (
        <Router history={history}>{children}</Router>
    )

    return {
        ...renderHook(() => useWarningBannerIsDisplayed(props), { wrapper }),
        history,
    }
}

describe('useWarningBannerIsDisplayed', () => {
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

    it('should return loading state when store activations are loading', () => {
        mockUseStoreActivations.mockReturnValue({
            storeActivations: {},
            isFetchLoading: true,
        } as ReturnType<typeof useStoreActivations>)

        const { result } = renderHookWithRouter()

        expect(result.current.isLoading).toEqual(true)
    })

    it('should call store activations hook with storeName when storeName and storeIntegration are provided', () => {
        renderHookWithRouter({
            props: {
                storeName: 'testStore',
                storeIntegrationFromStoreFilter: {
                    name: 'testStoreFromFilter',
                } as any,
            },
        })

        expect(mockUseStoreActivations).toHaveBeenCalledWith({
            storeName: 'testStore',
            withChatIntegrationsStatus: true,
            withStoresKnowledgeStatus: true,
        })
    })

    it('should call store activations hook with storeName from storeIntegration when only storeIntegration is provided', () => {
        renderHookWithRouter({
            props: {
                storeIntegrationFromStoreFilter: {
                    name: 'testStoreFromFilter',
                } as any,
            },
        })

        expect(mockUseStoreActivations).toHaveBeenCalledWith({
            storeName: 'testStoreFromFilter',
            withChatIntegrationsStatus: true,
            withStoresKnowledgeStatus: true,
        })
    })

    it.each([UserRole.Admin, UserRole.Agent, UserRole.GorgiasAgent])(
        'should display banner if the user is %s',
        (role: UserRole) => {
            useAppSelectorMock.mockReturnValue(
                fromJS({ ...user, role: { name: role } }),
            )

            const { result } = renderHookWithRouter()

            expect(result.current.isBannerDisplayed).toEqual(true)
            expect(result.current.redirectionPath).toEqual(
                '/app/settings/channels/gorgias_chat/456/installation',
            )
        },
    )

    it.each([
        UserRole.BasicAgent,
        UserRole.LiteAgent,
        UserRole.ObserverAgent,
        UserRole.Bot,
    ])('should not display banner if user is %s', (role: UserRole) => {
        useAppSelectorMock.mockReturnValue(
            fromJS({ ...user, role: { name: role } }),
        )
        const { result } = renderHookWithRouter()

        expect(result.current.isBannerDisplayed).toEqual(false)
    })

    it.each([
        '/app/tickets',
        '/app/tickets/123124',
        '/app/ticket',
        '/app/ticket/123124',
        '/app/ticket/new',
        '/app/views/123124',
    ])(
        'should not display the banner if the user goes to the %s page',
        (pathname) => {
            const { rerender, history, result } = renderHookWithRouter()

            expect(result.current.isBannerDisplayed).toEqual(true)

            history.push(pathname)

            rerender()

            expect(result.current.isBannerDisplayed).toEqual(false)
        },
    )

    it('should not display the banner if the user completes its installation', () => {
        const { rerender, result } = renderHookWithRouter()

        expect(result.current.isBannerDisplayed).toEqual(true)

        mockUseTrackingBundleInstallationWarningCheck.mockReturnValue({
            uninstalledChatIntegrationId: undefined,
        } as any)

        rerender()

        expect(result.current.isBannerDisplayed).toEqual(false)
    })

    it('should redirect to chat settings when banner is displayed and calling the redirect function', () => {
        const { result, history } = renderHookWithRouter()

        result.current.redirectToChatSettings()

        expect(history.location.pathname).toEqual(
            result.current.redirectionPath,
        )
    })

    it('should not redirect to chat settings when banner is not displayed and calling the redirect function', () => {
        mockUseTrackingBundleInstallationWarningCheck.mockReturnValue({
            uninstalledChatIntegrationId: undefined,
        } as any)

        const { result, history } = renderHookWithRouter()

        result.current.redirectToChatSettings()

        expect(history.location.pathname).toEqual('/')
    })
})
