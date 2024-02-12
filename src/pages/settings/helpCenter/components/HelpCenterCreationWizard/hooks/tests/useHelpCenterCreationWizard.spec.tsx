import {act, renderHook} from '@testing-library/react-hooks'
import React from 'react'
import {QueryClientProvider} from '@tanstack/react-query'
import {HelpCenter, HelpCenterCreationWizardStep} from 'models/helpCenter/types'
import {
    HELP_CENTER_DEFAULT_LOCALE,
    HELP_CENTER_WIZARD_COMPLETED_QUERY_KEY,
    HELP_CENTER_WIZARD_COMPLETED_STATE,
    NEXT_ACTION,
    PlatformType,
} from 'pages/settings/helpCenter/constants'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import * as resources from 'models/helpCenter/resources'
import {useHelpCenterApi} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {HelpCenterClient} from 'rest_api/help_center_api/client'
import history from 'pages/history'
import {useHelpCenterCreationWizard} from '../useHelpCenterCreationWizard'

jest.mock('pages/history')
jest.mock('hooks/useAppDispatch', () => jest.fn())
jest.mock('hooks/useAppSelector')
jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useHelpCenterApi: jest.fn(),
}))

const createHelpCenter = jest.spyOn(resources, 'createHelpCenter')
const updateHelpCenter = jest.spyOn(resources, 'updateHelpCenter')

const useAppDispatchMock = useAppDispatch as jest.Mock
const useAppSelectorMock = useAppSelector as jest.Mock
const mockUseHelpCenterApi = jest.mocked(useHelpCenterApi)

const queryClient = mockQueryClient()

const wrapper = ({children}: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const helpCenterData = {
    id: 1,
    name: 'test',
    subdomain: 'test',
    default_locale: 'en-US',
    supported_locales: ['en-US'],
    wizard: {
        step_name: HelpCenterCreationWizardStep.Basics,
        step_data: {
            platform_type: PlatformType.ECOMMERCE,
        },
    },
    shop_name: 'test',
}

const defaultHelpCenter = {
    name: '',
    subdomain: '',
    defaultLocale: HELP_CENTER_DEFAULT_LOCALE,
    supportedLocales: [HELP_CENTER_DEFAULT_LOCALE],
    platformType: PlatformType.ECOMMERCE,
    stepName: HelpCenterCreationWizardStep.Basics,
    shopName: '',
}

describe('useHelpCenterCreationWizard', () => {
    let dispatch: jest.Mock

    beforeEach(() => {
        jest.resetAllMocks()
        dispatch = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatch)
        useAppSelectorMock.mockReturnValue([])
        mockUseHelpCenterApi.mockReturnValue({
            client: {} as HelpCenterClient,
            isReady: true,
        })
    })

    it('should return default help center', () => {
        const {result} = renderHook(
            () =>
                useHelpCenterCreationWizard(
                    undefined,
                    HelpCenterCreationWizardStep.Basics
                ),
            {wrapper}
        )

        expect(result.current.helpCenter).toMatchObject(defaultHelpCenter)
    })

    it('should map api help center to UI data', () => {
        const {result} = renderHook(
            () =>
                useHelpCenterCreationWizard(
                    helpCenterData as HelpCenter,
                    HelpCenterCreationWizardStep.Basics
                ),
            {wrapper}
        )

        expect(result.current.helpCenter).toMatchObject({
            name: 'test',
            subdomain: 'test',
            defaultLocale: 'en-US',
            supportedLocales: ['en-US'],
            platformType: PlatformType.ECOMMERCE,
            stepName: HelpCenterCreationWizardStep.Basics,
            shopName: 'test',
        })
    })

    it('should update help center state', () => {
        const {result} = renderHook(
            () =>
                useHelpCenterCreationWizard(
                    helpCenterData as HelpCenter,
                    HelpCenterCreationWizardStep.Basics
                ),
            {wrapper}
        )
        expect(result.current.helpCenter).toMatchObject({name: 'test'})

        const {handleFormUpdate} = result.current
        act(() => {
            handleFormUpdate({name: 'test-updated'})
        })

        expect(result.current.helpCenter).toMatchObject({name: 'test-updated'})
    })

    it('should create help center and navigate to next step', async () => {
        const {result, waitFor} = renderHook(
            () =>
                useHelpCenterCreationWizard(
                    undefined,
                    HelpCenterCreationWizardStep.Basics
                ),
            {wrapper}
        )

        const {handleSave} = result.current

        createHelpCenter.mockResolvedValueOnce({
            data: {...helpCenterData, id: 2},
        } as any)

        act(() => {
            handleSave({redirectTo: NEXT_ACTION.NEW_WIZARD})
        })

        await waitFor(() => {
            expect(history.replace).toHaveBeenCalledWith(
                '/app/settings/help-center/2/new'
            )
        })
    })

    it('should update help center and navigate to home', async () => {
        const {result, waitFor} = renderHook(
            () =>
                useHelpCenterCreationWizard(
                    helpCenterData as HelpCenter,
                    HelpCenterCreationWizardStep.Basics
                ),
            {wrapper}
        )

        const {handleSave} = result.current

        updateHelpCenter.mockResolvedValueOnce({
            data: helpCenterData,
        } as any)

        act(() => {
            handleSave({redirectTo: NEXT_ACTION.BACK_HOME})
        })

        await waitFor(() => {
            expect(history.replace).toHaveBeenCalledWith(
                '/app/settings/help-center'
            )
        })
    })

    it('should update help center and navigate to new help center with articles', async () => {
        const {result, waitFor} = renderHook(
            () =>
                useHelpCenterCreationWizard(
                    helpCenterData as HelpCenter,
                    HelpCenterCreationWizardStep.Automate
                ),
            {wrapper}
        )

        const {handleSave} = result.current

        updateHelpCenter.mockResolvedValueOnce({
            data: helpCenterData,
        } as any)

        act(() => {
            handleSave({
                redirectTo: NEXT_ACTION.NEW_HELP_CENTER,
                successModalParams: {
                    articlesCount: 2,
                    isArticleRecommendationEnabled: true,
                },
            })
        })

        await waitFor(() => {
            expect(history.replace).toHaveBeenCalledWith({
                pathname: `/app/settings/help-center/${helpCenterData.id}/articles`,
                search: `${HELP_CENTER_WIZARD_COMPLETED_QUERY_KEY}=${HELP_CENTER_WIZARD_COMPLETED_STATE.AllSet}`,
            })
        })
    })

    it('should update help center and navigate to new help center without articles', async () => {
        const {result, waitFor} = renderHook(
            () =>
                useHelpCenterCreationWizard(
                    helpCenterData as HelpCenter,
                    HelpCenterCreationWizardStep.Automate
                ),
            {wrapper}
        )

        const {handleSave} = result.current

        updateHelpCenter.mockResolvedValueOnce({
            data: helpCenterData,
        } as any)

        act(() => {
            handleSave({
                redirectTo: NEXT_ACTION.NEW_HELP_CENTER,
                successModalParams: {
                    articlesCount: 0,
                },
            })
        })

        await waitFor(() => {
            expect(history.replace).toHaveBeenCalledWith({
                pathname: `/app/settings/help-center/${helpCenterData.id}/articles`,
            })
        })
    })

    it('should update help center and navigate to new help center without articles and enabled article recom', async () => {
        const {result, waitFor} = renderHook(
            () =>
                useHelpCenterCreationWizard(
                    helpCenterData as HelpCenter,
                    HelpCenterCreationWizardStep.Automate
                ),
            {wrapper}
        )

        const {handleSave} = result.current

        updateHelpCenter.mockResolvedValueOnce({
            data: helpCenterData,
        } as any)

        act(() => {
            handleSave({
                redirectTo: NEXT_ACTION.NEW_HELP_CENTER,
                successModalParams: {
                    articlesCount: 0,
                    isArticleRecommendationEnabled: true,
                },
            })
        })

        await waitFor(() => {
            expect(history.replace).toHaveBeenCalledWith({
                pathname: `/app/settings/help-center/${helpCenterData.id}/articles`,
                search: `${HELP_CENTER_WIZARD_COMPLETED_QUERY_KEY}=${HELP_CENTER_WIZARD_COMPLETED_STATE.AlmostDone}`,
            })
        })
    })
})
