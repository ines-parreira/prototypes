import {renderHook} from 'react-hooks-testing-library'
import {useAbilityChecker} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {useLimitations} from '../../../../../hooks/helpCenter/useLimitations'

import {useArticleRowActions} from '../useArticleRowActions'

jest.mock('hooks/helpCenter/useLimitations')
jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi')

const mockUseLimitation = useLimitations as jest.MockedFunction<
    typeof useLimitations
>
const mockUseAbilityChecker = useAbilityChecker as jest.MockedFunction<
    typeof useAbilityChecker
>

const defaultLimitations = {
    articleSettings: {
        disabled: false,
        warningThreshold: false,
        currentNumber: 1,
    },
    duplicateArticle: {
        disabled: false,
        warningThreshold: false,
        currentNumber: 1,
    },
    copyToClipboard: {
        disabled: false,
        warningThreshold: false,
        currentNumber: 1,
    },
}

describe('useArticleRowActions()', () => {
    const articleId = 1

    beforeEach(() => {
        mockUseLimitation.mockReturnValue(defaultLimitations)
        mockUseAbilityChecker.mockReturnValue({isPassingRulesCheck: () => true})
    })

    it('returns all the actions - enabled', () => {
        const {result} = renderHook(() => useArticleRowActions(articleId))

        expect(result.current).toMatchInlineSnapshot(`
            Array [
              Object {
                "disabled": false,
                "icon": "settings",
                "name": "articleSettings",
                "tooltip": Object {
                  "content": "Article settings",
                  "target": "articleSettings-1",
                },
              },
              Object {
                "disabled": false,
                "icon": "content_copy",
                "name": "duplicateArticle",
                "tooltip": Object {
                  "content": "Duplicate article",
                  "target": "duplicateArticle-1",
                },
              },
              Object {
                "disabled": false,
                "icon": "share",
                "name": "copyToClipboard",
                "tooltip": Object {
                  "content": "Copy link to clipboard",
                  "target": "copyToClipboard-1",
                },
              },
            ]
        `)
    })

    it('returns all the actions - disabled because passed the limitations', () => {
        mockUseLimitation.mockReturnValue({
            ...defaultLimitations,
            articleSettings: {
                ...defaultLimitations.articleSettings,
                disabled: true,
            },
            duplicateArticle: {
                ...defaultLimitations.duplicateArticle,
                disabled: true,
            },
            copyToClipboard: {
                ...defaultLimitations.copyToClipboard,
                disabled: true,
            },
        })

        const {result} = renderHook(() => useArticleRowActions(articleId))

        expect(result.current).toMatchInlineSnapshot(`
            Array [
              Object {
                "disabled": true,
                "icon": "settings",
                "name": "articleSettings",
                "tooltip": Object {
                  "content": "Article settings",
                  "target": "articleSettings-1",
                },
              },
              Object {
                "disabled": true,
                "icon": "content_copy",
                "name": "duplicateArticle",
                "tooltip": Object {
                  "content": "Duplicate article",
                  "target": "duplicateArticle-1",
                },
              },
              Object {
                "disabled": false,
                "icon": "share",
                "name": "copyToClipboard",
                "tooltip": Object {
                  "content": "Copy link to clipboard",
                  "target": "copyToClipboard-1",
                },
              },
            ]
        `)
    })

    it('returns all the actions - disabled', () => {
        mockUseAbilityChecker.mockReturnValue({
            isPassingRulesCheck: () => false,
        })

        const {result} = renderHook(() => useArticleRowActions(articleId))
        expect(result.current).toMatchInlineSnapshot(`
            Array [
              Object {
                "disabled": true,
                "icon": "settings",
                "name": "articleSettings",
                "tooltip": Object {
                  "content": "Article settings",
                  "target": "articleSettings-1",
                },
              },
              Object {
                "disabled": true,
                "icon": "content_copy",
                "name": "duplicateArticle",
                "tooltip": Object {
                  "content": "Duplicate article",
                  "target": "duplicateArticle-1",
                },
              },
              Object {
                "disabled": false,
                "icon": "share",
                "name": "copyToClipboard",
                "tooltip": Object {
                  "content": "Copy link to clipboard",
                  "target": "copyToClipboard-1",
                },
              },
            ]
        `)
    })
})
