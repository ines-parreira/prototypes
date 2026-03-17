import { act, renderHook } from '@testing-library/react'
import { fromJS } from 'immutable'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
    GorgiasChatLauncherType,
    GorgiasChatPositionAlignmentEnum,
    IntegrationType,
} from 'models/integration/types'
import { updateOrCreateIntegration } from 'state/integrations/actions'

import { useAppearanceForm } from './useAppearanceForm'

jest.mock('hooks/useAppDispatch')

jest.mock('state/integrations/actions', () => ({
    ...jest.requireActual('state/integrations/actions'),
    updateOrCreateIntegration: jest.fn(() => () => Promise.resolve()),
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/hooks/usePrivacyPolicyText',
    () => ({
        usePrivacyPolicyText: jest.fn(() => ({
            privacyPolicyText: 'Privacy policy text',
            setPrivacyPolicyText: jest.fn(),
            savePrivacyPolicyText: jest.fn(),
        })),
    }),
)

const mockDispatch = jest.fn().mockResolvedValue({})
const mockUseAppDispatch = jest.mocked(useAppDispatch)
const mockUpdateOrCreateIntegration = jest.mocked(updateOrCreateIntegration)

const makeIntegration = (overrides = {}) =>
    fromJS({
        id: 1,
        name: 'Test Chat',
        type: IntegrationType.GorgiasChat,
        meta: {
            app_id: 'test-app-id',
            preferences: {
                privacy_policy_disclaimer_enabled: true,
            },
        },
        decoration: {
            main_color: '#FF0000',
            header_picture_url: 'https://example.com/logo.png',
            position: {
                alignment: GorgiasChatPositionAlignmentEnum.BOTTOM_LEFT,
                offsetX: 10,
                offsetY: 20,
            },
            launcher: {
                type: GorgiasChatLauncherType.ICON_AND_LABEL,
                label: 'Shop with AI',
            },
            avatar: {
                image_type: GorgiasChatAvatarImageType.AGENT_INITIALS,
                name_type: GorgiasChatAvatarNameType.AGENT_FULLNAME,
                company_logo_url: 'https://example.com/company.png',
            },
        },
        ...overrides,
    })

const makeLoading = (integration = false) =>
    fromJS({ integration, updateIntegration: false })

describe('useAppearanceForm', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAppDispatch.mockReturnValue(mockDispatch)
        global.CSS = {
            supports: jest.fn().mockReturnValue(true),
        } as unknown as typeof CSS
    })

    describe('initial values', () => {
        it('should build form values from integration', () => {
            const integration = makeIntegration()
            const loading = makeLoading(false)
            const { result } = renderHook(() =>
                useAppearanceForm({ integration, loading }),
            )

            expect(result.current.values).toMatchObject({
                name: 'Test Chat',
                mainColor: '#FF0000',
                headerPictureUrl: 'https://example.com/logo.png',
                position: {
                    alignment: GorgiasChatPositionAlignmentEnum.BOTTOM_LEFT,
                    offsetX: 10,
                    offsetY: 20,
                },
                launcher: {
                    type: GorgiasChatLauncherType.ICON_AND_LABEL,
                    label: 'Shop with AI',
                },
                avatar: {
                    imageType: GorgiasChatAvatarImageType.AGENT_INITIALS,
                    nameType: GorgiasChatAvatarNameType.AGENT_FULLNAME,
                    companyLogoUrl: 'https://example.com/company.png',
                },
                legalDisclaimerEnabled: true,
            })
        })

        it('should use defaults when decoration is missing', () => {
            const integration = fromJS({
                id: 1,
                name: '',
                type: IntegrationType.GorgiasChat,
                meta: { preferences: {} },
            })
            const loading = makeLoading(false)
            const { result } = renderHook(() =>
                useAppearanceForm({ integration, loading }),
            )

            expect(result.current.values.mainColor).toBe('#115cb5')
            expect(result.current.values.headerPictureUrl).toBeUndefined()
            expect(result.current.values.legalDisclaimerEnabled).toBe(false)
            expect(result.current.values.launcher).toEqual({
                type: GorgiasChatLauncherType.ICON,
                label: '',
            })
        })
    })

    describe('isSubmitting', () => {
        it('should be true when updateIntegration loading matches integration id', () => {
            const integration = makeIntegration()
            const loading = fromJS({ integration: false, updateIntegration: 1 })
            const { result } = renderHook(() =>
                useAppearanceForm({ integration, loading }),
            )

            expect(result.current.isSubmitting).toBe(true)
        })

        it('should be false when updateIntegration loading does not match', () => {
            const integration = makeIntegration()
            const loading = fromJS({ integration: false, updateIntegration: 2 })
            const { result } = renderHook(() =>
                useAppearanceForm({ integration, loading }),
            )

            expect(result.current.isSubmitting).toBe(false)
        })

        it('should be false when no loading state', () => {
            const integration = makeIntegration()
            const loading = makeLoading(false)
            const { result } = renderHook(() =>
                useAppearanceForm({ integration, loading }),
            )

            expect(result.current.isSubmitting).toBe(false)
        })
    })

    describe('onSubmit', () => {
        it('should dispatch updateOrCreateIntegration with correct form data', async () => {
            const integration = makeIntegration()
            const loading = makeLoading(false)
            const { result } = renderHook(() =>
                useAppearanceForm({ integration, loading }),
            )

            await act(async () => {
                await result.current.handleSubmit(result.current.onSubmit)()
            })

            expect(mockUpdateOrCreateIntegration).toHaveBeenCalledWith(
                expect.objectContaining({ toJS: expect.any(Function) }),
            )

            const form = mockUpdateOrCreateIntegration.mock.calls[0][0].toJS()
            expect(form).toMatchObject({
                id: 1,
                name: 'Test Chat',
                decoration: expect.objectContaining({
                    main_color: '#FF0000',
                    conversation_color: '#FF0000',
                    header_picture_url: 'https://example.com/logo.png',
                    launcher: {
                        type: GorgiasChatLauncherType.ICON_AND_LABEL,
                        label: 'Shop with AI',
                    },
                    avatar: {
                        image_type: GorgiasChatAvatarImageType.AGENT_INITIALS,
                        name_type: GorgiasChatAvatarNameType.AGENT_FULLNAME,
                        company_logo_url: 'https://example.com/company.png',
                    },
                }),
                meta: expect.objectContaining({
                    preferences: expect.objectContaining({
                        privacy_policy_disclaimer_enabled: true,
                    }),
                }),
            })
        })

        it('should fall back to default color when mainColor is not a valid CSS color', async () => {
            ;(global.CSS.supports as jest.Mock).mockReturnValue(false)
            const integration = makeIntegration({
                decoration: { main_color: 'not-a-color' },
            })
            const loading = makeLoading(false)
            const { result } = renderHook(() =>
                useAppearanceForm({ integration, loading }),
            )

            await act(async () => {
                await result.current.handleSubmit(result.current.onSubmit)()
            })

            const form = mockUpdateOrCreateIntegration.mock.calls[0][0].toJS()
            expect(form.decoration.main_color).toBe('#115cb5')
            expect(form.decoration.conversation_color).toBe('#115cb5')
        })

        it('should not include label in launcher when type is ICON', async () => {
            const integration = makeIntegration({
                decoration: {
                    launcher: {
                        type: GorgiasChatLauncherType.ICON,
                        label: 'Old label',
                    },
                },
            })
            const loading = makeLoading(false)
            const { result } = renderHook(() =>
                useAppearanceForm({ integration, loading }),
            )

            await act(async () => {
                await result.current.handleSubmit(result.current.onSubmit)()
            })

            const form = mockUpdateOrCreateIntegration.mock.calls[0][0].toJS()
            expect(form.decoration.launcher).toEqual({
                type: GorgiasChatLauncherType.ICON,
            })
            expect(form.decoration.launcher.label).toBeUndefined()
        })

        it('should include label in launcher when type is ICON_AND_LABEL', async () => {
            const integration = makeIntegration()
            const loading = makeLoading(false)
            const { result } = renderHook(() =>
                useAppearanceForm({ integration, loading }),
            )

            await act(async () => {
                await result.current.handleSubmit(result.current.onSubmit)()
            })

            const form = mockUpdateOrCreateIntegration.mock.calls[0][0].toJS()
            expect(form.decoration.launcher).toEqual({
                type: GorgiasChatLauncherType.ICON_AND_LABEL,
                label: 'Shop with AI',
            })
        })

        it('should dispatch the thunk via dispatch', async () => {
            const integration = makeIntegration()
            const loading = makeLoading(false)
            const { result } = renderHook(() =>
                useAppearanceForm({ integration, loading }),
            )

            await act(async () => {
                await result.current.handleSubmit(result.current.onSubmit)()
            })

            expect(mockDispatch).toHaveBeenCalledTimes(1)
        })
    })

    describe('form reset', () => {
        it('should reset values when integration changes and loading is done', async () => {
            const integration = makeIntegration()
            const loading = makeLoading(false)
            const { result, rerender } = renderHook(
                ({ integration, loading }) =>
                    useAppearanceForm({ integration, loading }),
                { initialProps: { integration, loading } },
            )

            const updatedIntegration = makeIntegration({
                name: 'Updated Chat',
                decoration: { main_color: '#00FF00' },
            })

            rerender({ integration: updatedIntegration, loading })

            expect(result.current.values.name).toBe('Updated Chat')
            expect(result.current.values.mainColor).toBe('#00FF00')
        })

        it('should not reset values when integration is still loading', () => {
            const integration = makeIntegration()
            const loading = makeLoading(true)
            const { result, rerender } = renderHook(
                ({ integration, loading }) =>
                    useAppearanceForm({ integration, loading }),
                { initialProps: { integration, loading } },
            )

            const updatedIntegration = makeIntegration({
                name: 'Should Not Update',
                decoration: { main_color: '#ABCDEF' },
            })

            rerender({ integration: updatedIntegration, loading })

            expect(result.current.values.name).toBe('Test Chat')
            expect(result.current.values.mainColor).toBe('#FF0000')
        })
    })
})
