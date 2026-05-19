import { useFlag } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'

import { useGetWizard } from 'models/helpCenter/queries'
import { useSkillsTagLabel } from 'pages/aiAgent/hooks/useSkillsTagLabel'
import { SkillWizardStatus } from 'pages/aiAgent/skills/types'

jest.mock('models/helpCenter/queries', () => ({
    useGetWizard: jest.fn(),
}))
jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

const mockUseGetWizard = useGetWizard as jest.MockedFunction<
    typeof useGetWizard
>
const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

const SHOP = 'test-shop'
const HELP_CENTER_ID = 21
const SKILLS_WIZARD_PATH = `/app/ai-agent/shopify/${SHOP}/skills/wizard`
const NON_WIZARD_PATH = `/app/ai-agent/shopify/${SHOP}/skills`

const setWizardStatus = (status: SkillWizardStatus | undefined) => {
    mockUseGetWizard.mockReturnValue({
        data: status ? { status } : undefined,
    } as unknown as ReturnType<typeof useGetWizard>)
}

describe('useSkillsTagLabel', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseFlag.mockReturnValue(true)
        setWizardStatus(undefined)
    })

    it('returns "Resume" when wizard is in progress and the user is not on the skills wizard route', () => {
        setWizardStatus(SkillWizardStatus.InProgress)

        const { result } = renderHook(
            () =>
                useSkillsTagLabel({
                    selectedStore: SHOP,
                    guidanceHelpCenterId: HELP_CENTER_ID,
                }),
            { initialEntries: [NON_WIZARD_PATH] },
        )

        expect(result.current).toBe('Resume')
    })

    it('returns "New" when wizard is in progress but the user is already on the skills wizard route', () => {
        setWizardStatus(SkillWizardStatus.InProgress)

        const { result } = renderHook(
            () =>
                useSkillsTagLabel({
                    selectedStore: SHOP,
                    guidanceHelpCenterId: HELP_CENTER_ID,
                }),
            { initialEntries: [`${SKILLS_WIZARD_PATH}?step=1`] },
        )

        expect(result.current).toBe('New')
    })

    it('returns "New" when wizard has not been started', () => {
        setWizardStatus(SkillWizardStatus.NotStarted)

        const { result } = renderHook(
            () =>
                useSkillsTagLabel({
                    selectedStore: SHOP,
                    guidanceHelpCenterId: HELP_CENTER_ID,
                }),
            { initialEntries: [NON_WIZARD_PATH] },
        )

        expect(result.current).toBe('New')
    })

    it('returns "New" when wizard is completed', () => {
        setWizardStatus(SkillWizardStatus.Completed)

        const { result } = renderHook(
            () =>
                useSkillsTagLabel({
                    selectedStore: SHOP,
                    guidanceHelpCenterId: HELP_CENTER_ID,
                }),
            { initialEntries: [NON_WIZARD_PATH] },
        )

        expect(result.current).toBe('New')
    })

    it('returns "New" when there is no wizard data available', () => {
        setWizardStatus(undefined)

        const { result } = renderHook(
            () =>
                useSkillsTagLabel({
                    selectedStore: SHOP,
                    guidanceHelpCenterId: HELP_CENTER_ID,
                }),
            { initialEntries: [NON_WIZARD_PATH] },
        )

        expect(result.current).toBe('New')
    })

    it('does not query the wizard when the skill wizard feature flag is disabled', () => {
        mockUseFlag.mockReturnValue(false)
        setWizardStatus(undefined)

        renderHook(
            () =>
                useSkillsTagLabel({
                    selectedStore: SHOP,
                    guidanceHelpCenterId: HELP_CENTER_ID,
                }),
            { initialEntries: [NON_WIZARD_PATH] },
        )

        expect(mockUseGetWizard).toHaveBeenCalledWith(
            HELP_CENTER_ID,
            expect.objectContaining({ enabled: false }),
        )
    })

    it('does not query the wizard when guidanceHelpCenterId is missing', () => {
        renderHook(() => useSkillsTagLabel({ selectedStore: SHOP }), {
            initialEntries: [NON_WIZARD_PATH],
        })

        expect(mockUseGetWizard).toHaveBeenCalledWith(
            0,
            expect.objectContaining({ enabled: false }),
        )
    })
})
