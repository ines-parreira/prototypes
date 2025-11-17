import { history } from '@repo/routing'
import { renderHook } from '@repo/testing'
import { act, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import {
    useCreateHelpCenter,
    useCreateHelpCenterTranslation,
    useDeleteHelpCenterTranslation,
    useUpdateHelpCenter,
} from 'models/helpCenter/queries'
import type { HelpCenter } from 'models/helpCenter/types'
import { HelpCenterCreationWizardStep } from 'models/helpCenter/types'
import {
    HELP_CENTER_WIZARD_COMPLETED_QUERY_KEY,
    HELP_CENTER_WIZARD_COMPLETED_STATE,
    NEXT_ACTION,
} from 'pages/settings/helpCenter/constants'
import {
    EmptyHelpCenterUiFixture,
    HelpCenterApiBasicsFixture,
    HelpCenterUiBasicsFixture,
} from 'pages/settings/helpCenter/fixtures/wizard.fixture'
import { HelpCenterLayout } from 'pages/settings/helpCenter/types/layout.enum'
import type { StoreState } from 'state/types'

import { useHelpCenterCreationWizard } from '../useHelpCenterCreationWizard'

jest.mock(
    'pages/settings/helpCenter/hooks/useEnableArticleRecommendation',
    () => ({
        useEnableArticleRecommendation: () => jest.fn(),
    }),
)
jest.mock('@repo/routing', () => ({
    ...jest.requireActual('@repo/routing'),
    history: {
        push: jest.fn(),
        replace: jest.fn(),
    },
}))
jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('hooks/useAppDispatch', () =>
    jest.fn().mockImplementation(() => jest.fn()),
)
jest.mock('models/helpCenter/queries')
jest.mock('../useStoreToChannelMappings', () => ({
    useStoreToChannelMappings: () => ({
        handleStoreToChannelMapping: jest.fn(),
    }),
}))

const mockedUseCreateHelpCenter = jest.mocked(useCreateHelpCenter)
const mockedUseUpdateHelpCenter = jest.mocked(useUpdateHelpCenter)
const mockedUseCreateHelpCenterTranslation = jest.mocked(
    useCreateHelpCenterTranslation,
)
const mockedUseDeleteHelpCenterTranslation = jest.mocked(
    useDeleteHelpCenterTranslation,
)

const helpCenter = HelpCenterApiBasicsFixture
const helpCenterUI = HelpCenterUiBasicsFixture
const mockedUseAppSelector = jest.mocked(useAppSelector)

describe('useHelpCenterCreationWizard', () => {
    beforeEach(() => {
        mockedUseAppSelector.mockImplementation((selector) =>
            selector({
                currentAccount: fromJS({ domain: 'test' }),
                integrations: fromJS({ integrations: [] }),
            } as unknown as StoreState),
        )
        mockedUseCreateHelpCenter.mockReturnValue({
            mutateAsync: jest.fn().mockReturnValue({ data: helpCenter }),
            isLoading: false,
        } as unknown as ReturnType<typeof useCreateHelpCenter>)
        mockedUseUpdateHelpCenter.mockReturnValue({
            mutateAsync: jest.fn().mockReturnValue({ data: helpCenter }),
            isLoading: false,
        } as unknown as ReturnType<typeof useUpdateHelpCenter>)
        mockedUseCreateHelpCenterTranslation.mockReturnValue({
            mutateAsync: jest.fn(),
            isLoading: false,
        } as unknown as ReturnType<typeof useCreateHelpCenterTranslation>)
        mockedUseDeleteHelpCenterTranslation.mockReturnValue({
            mutateAsync: jest.fn(),
            isLoading: false,
        } as unknown as ReturnType<typeof mockedUseDeleteHelpCenterTranslation>)
    })

    it('should return default help center', () => {
        const accountDomain = 'test-domain'
        mockedUseAppSelector.mockImplementation((selector) =>
            selector({
                currentAccount: fromJS({ domain: accountDomain }),
                integrations: fromJS({ integrations: [] }),
            } as unknown as StoreState),
        )

        const { result } = renderHook(() =>
            useHelpCenterCreationWizard(
                undefined,
                HelpCenterCreationWizardStep.Basics,
            ),
        )

        expect(result.current.helpCenter).toMatchObject({
            ...EmptyHelpCenterUiFixture,
            name: accountDomain,
            layout: HelpCenterLayout.DEFAULT,
        })
    })

    it('should map api help center to UI data', () => {
        const { result } = renderHook(() =>
            useHelpCenterCreationWizard(
                helpCenter,
                HelpCenterCreationWizardStep.Basics,
            ),
        )

        expect(result.current.helpCenter).toMatchObject(helpCenterUI)
    })

    it('should update help center state', () => {
        const { result } = renderHook(() =>
            useHelpCenterCreationWizard(
                helpCenter as HelpCenter,
                HelpCenterCreationWizardStep.Basics,
            ),
        )

        act(() => {
            result.current.handleFormUpdate({ name: 'Acme updated' })
        })

        expect(result.current.helpCenter).toMatchObject({
            name: 'Acme updated',
        })
    })

    it('should create help center and navigate to next step', async () => {
        const { result } = renderHook(() =>
            useHelpCenterCreationWizard(
                undefined,
                HelpCenterCreationWizardStep.Basics,
            ),
        )

        act(() => {
            result.current.handleSave({ redirectTo: NEXT_ACTION.NEW_WIZARD })
        })

        await waitFor(() => {
            expect(history.replace).toHaveBeenCalledWith(
                `/app/settings/help-center/${helpCenter.id}/new`,
            )
        })
    })

    it('should update help center and navigate to home', async () => {
        const { result } = renderHook(() =>
            useHelpCenterCreationWizard(
                helpCenter,
                HelpCenterCreationWizardStep.Basics,
            ),
        )

        act(() => {
            result.current.handleSave({ redirectTo: NEXT_ACTION.BACK_HOME })
        })

        await waitFor(() => {
            expect(history.replace).toHaveBeenCalledWith(
                '/app/settings/help-center',
            )
        })
    })

    it('should update help center and navigate to new help center with articles', async () => {
        const { result } = renderHook(() =>
            useHelpCenterCreationWizard(
                helpCenter as HelpCenter,
                HelpCenterCreationWizardStep.Automate,
            ),
        )

        act(() => {
            result.current.handleSave({
                redirectTo: NEXT_ACTION.NEW_HELP_CENTER,
                successModalParams: {
                    articlesCount: 2,
                    isArticleRecommendationEnabled: true,
                },
            })
        })

        await waitFor(() => {
            expect(history.replace).toHaveBeenCalledWith({
                pathname: `/app/settings/help-center/${helpCenter.id}/articles`,
                search: `${HELP_CENTER_WIZARD_COMPLETED_QUERY_KEY}=${HELP_CENTER_WIZARD_COMPLETED_STATE.AllSet}`,
            })
        })
    })

    it('should update help center and navigate to new help center without articles', async () => {
        const { result } = renderHook(() =>
            useHelpCenterCreationWizard(
                helpCenter as HelpCenter,
                HelpCenterCreationWizardStep.Automate,
            ),
        )

        act(() => {
            result.current.handleSave({
                redirectTo: NEXT_ACTION.NEW_HELP_CENTER,
                successModalParams: {
                    articlesCount: 0,
                },
            })
        })

        await waitFor(() => {
            expect(history.replace).toHaveBeenCalledWith({
                pathname: `/app/settings/help-center/${helpCenter.id}/articles`,
            })
        })
    })

    it('should update help center and navigate to new help center without articles and enabled article recom', async () => {
        const { result } = renderHook(() =>
            useHelpCenterCreationWizard(
                helpCenter as HelpCenter,
                HelpCenterCreationWizardStep.Automate,
            ),
        )

        act(() => {
            result.current.handleSave({
                redirectTo: NEXT_ACTION.NEW_HELP_CENTER,
                successModalParams: {
                    articlesCount: 0,
                    isArticleRecommendationEnabled: true,
                },
            })
        })

        await waitFor(() => {
            expect(history.replace).toHaveBeenCalledWith({
                pathname: `/app/settings/help-center/${helpCenter.id}/articles`,
                search: `${HELP_CENTER_WIZARD_COMPLETED_QUERY_KEY}=${HELP_CENTER_WIZARD_COMPLETED_STATE.AlmostDone}`,
            })
        })
    })
})
