import HelpCenterEditModalFooter from 'pages/settings/helpCenter/components/articles/HelpCenterEditModalFooter'
import { getSingleArticleEnglish } from 'pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'
import { getInitialRootCategory } from 'pages/settings/helpCenter/fixtures/getCategoriesTree.fixtures'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { getLocalesResponseFixture } from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import { ArticleMode } from 'pages/settings/helpCenter/types/articleMode'
import { RootState } from 'state/types'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import HelpCenterArticleModalBasicViewContent from '../HelpCenterArticleModalBasicViewContent'

const mockUseScreenSize = jest.fn()
const mockUseAbilityChecker = jest.fn()
const mockUseEditionManager = jest.fn()
const mockUseCurrentHelpCenter = jest.fn()
const mockUseSupportedLocales = jest.fn()

jest.mock('hooks/useScreenSize', () => ({
    useScreenSize: () => mockUseScreenSize(),
    SCREEN_SIZE: { SMALL: 'small' },
}))

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useAbilityChecker: () => mockUseAbilityChecker(),
}))

jest.mock('pages/settings/helpCenter/providers/EditionManagerContext', () => ({
    useEditionManager: () => mockUseEditionManager(),
}))

jest.mock('pages/settings/helpCenter/hooks/useCurrentHelpCenter', () => ({
    __esModule: true,
    default: () => mockUseCurrentHelpCenter(),
}))

jest.mock('pages/settings/helpCenter/providers/SupportedLocales', () => ({
    useSupportedLocales: () => mockUseSupportedLocales(),
}))

jest.mock(
    'pages/settings/helpCenter/components/articles/HelpCenterEditModalFooter',
)

describe('HelpCenterArticleModalBasicViewContent', () => {
    const mockOnArticleLanguageSelect = jest.fn()
    const mockOnArticleModalClose = jest.fn()
    const mockOnArticleLanguageSelectActionClick = jest.fn()
    const mockOnArticleChange = jest.fn()
    const mockOnEditorReady = jest.fn()
    const mockOnChangesDiscard = jest.fn()
    const mockOnCopyLinkToClipboard = jest.fn()

    const mockArticleMode: ArticleMode = {
        mode: 'modified',
        onSave: jest.fn(),
        onDelete: jest.fn(),
    }

    const defaultProps = {
        onArticleLanguageSelect: mockOnArticleLanguageSelect,
        autoFocus: false,
        onArticleModalClose: mockOnArticleModalClose,
        onArticleLanguageSelectActionClick:
            mockOnArticleLanguageSelectActionClick,
        onArticleChange: mockOnArticleChange,
        onEditorReady: mockOnEditorReady,
        canSaveArticle: true,
        requiredFieldsArticle: [],
        articleMode: mockArticleMode,
        onChangesDiscard: mockOnChangesDiscard,
        onCopyLinkToClipboard: mockOnCopyLinkToClipboard,
    }

    const renderComponent = (isDraftAllowed?: boolean) => {
        const props =
            isDraftAllowed !== undefined
                ? { ...defaultProps, isDraftAllowed }
                : defaultProps

        const initialState: Partial<RootState> = {
            entities: {
                helpCenter: {
                    categories: {
                        categoriesById: {
                            '0': getInitialRootCategory,
                        },
                    },
                },
            } as any,
        }

        return renderWithStoreAndQueryClientProvider(
            <HelpCenterArticleModalBasicViewContent {...props} />,
            initialState,
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseScreenSize.mockReturnValue('large')
        mockUseAbilityChecker.mockReturnValue({
            isPassingRulesCheck: jest.fn().mockReturnValue(true),
        })
        mockUseEditionManager.mockReturnValue({
            setEditModal: jest.fn(),
            selectedArticle: getSingleArticleEnglish,
            setSelectedArticle: jest.fn(),
            isFullscreenEditModal: false,
            setIsFullscreenEditModal: jest.fn(),
            setIsEditorCodeViewActive: jest.fn(),
        })
        mockUseCurrentHelpCenter.mockReturnValue(
            getSingleHelpCenterResponseFixture,
        )
        mockUseSupportedLocales.mockReturnValue(getLocalesResponseFixture)
        ;(HelpCenterEditModalFooter as jest.Mock).mockReturnValue(
            <div data-testid="help-center-edit-modal-footer">Footer</div>,
        )
    })

    describe('when isDraftAllowed is true', () => {
        it('should pass isDraftAllowed as true to HelpCenterEditModalFooter', () => {
            renderComponent(true)

            expect(HelpCenterEditModalFooter).toHaveBeenCalledWith(
                expect.objectContaining({
                    isDraftAllowed: true,
                }),
                {},
            )
        })
    })

    describe('when isDraftAllowed is false', () => {
        it('should pass isDraftAllowed as false to HelpCenterEditModalFooter', () => {
            renderComponent(false)

            expect(HelpCenterEditModalFooter).toHaveBeenCalledWith(
                expect.objectContaining({
                    isDraftAllowed: false,
                }),
                {},
            )
        })
    })

    describe('when isDraftAllowed is undefined', () => {
        it('should pass isDraftAllowed as true to HelpCenterEditModalFooter (default value)', () => {
            renderComponent()

            expect(HelpCenterEditModalFooter).toHaveBeenCalledWith(
                expect.objectContaining({
                    isDraftAllowed: true,
                }),
                {},
            )
        })
    })
})
