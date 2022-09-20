import {renderHook} from 'react-hooks-testing-library'
import {useAbilityChecker} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

import {useCategoryRowActions} from '../useCategoryRowActions'
import {CATEGORY_TREE_MAX_LEVEL} from '../../constants'

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi')

const mockUseAbilityChecker = useAbilityChecker as jest.MockedFunction<
    typeof useAbilityChecker
>

describe('useCategoryRowActions()', () => {
    const categoryId = 1
    const level = 1

    beforeEach(() => {
        mockUseAbilityChecker.mockReturnValue({
            isPassingRulesCheck: () => true,
        })
    })

    it('returns all the actions - enabled', () => {
        const {result} = renderHook(() =>
            useCategoryRowActions(categoryId, level)
        )

        expect(result.current).toMatchInlineSnapshot(`
            Array [
              Object {
                "disabled": false,
                "icon": "settings",
                "name": "categorySettings",
                "tooltip": Object {
                  "content": "Category settings",
                  "target": "categorySettings-1",
                },
              },
              Object {
                "disabled": false,
                "icon": "playlist_add",
                "name": "createNestedCategory",
                "tooltip": Object {
                  "content": "Create category",
                  "target": "createNestedCategory-1",
                },
              },
              Object {
                "disabled": false,
                "icon": "note_add",
                "name": "createNestedArticle",
                "tooltip": Object {
                  "content": "Create article",
                  "target": "createNestedArticle-1",
                },
              },
            ]
        `)
    })

    it('returns all the actions - createNestedCategory disabled because passed the level limitations', () => {
        const {result} = renderHook(() =>
            useCategoryRowActions(categoryId, CATEGORY_TREE_MAX_LEVEL)
        )
        expect(result.current).toMatchInlineSnapshot(`
            Array [
              Object {
                "disabled": false,
                "icon": "settings",
                "name": "categorySettings",
                "tooltip": Object {
                  "content": "Category settings",
                  "target": "categorySettings-1",
                },
              },
              Object {
                "disabled": true,
                "icon": "playlist_add",
                "name": "createNestedCategory",
                "tooltip": Object {
                  "content": "Create category",
                  "target": "createNestedCategory-1",
                },
              },
              Object {
                "disabled": false,
                "icon": "note_add",
                "name": "createNestedArticle",
                "tooltip": Object {
                  "content": "Create article",
                  "target": "createNestedArticle-1",
                },
              },
            ]
        `)
    })

    it('returns all the actions - disabled', () => {
        mockUseAbilityChecker.mockReturnValue({
            isPassingRulesCheck: () => false,
        })

        const {result} = renderHook(() =>
            useCategoryRowActions(categoryId, level)
        )
        expect(result.current).toMatchInlineSnapshot(`
            Array [
              Object {
                "disabled": true,
                "icon": "settings",
                "name": "categorySettings",
                "tooltip": Object {
                  "content": "Category settings",
                  "target": "categorySettings-1",
                },
              },
              Object {
                "disabled": true,
                "icon": "playlist_add",
                "name": "createNestedCategory",
                "tooltip": Object {
                  "content": "Create category",
                  "target": "createNestedCategory-1",
                },
              },
              Object {
                "disabled": true,
                "icon": "note_add",
                "name": "createNestedArticle",
                "tooltip": Object {
                  "content": "Create article",
                  "target": "createNestedArticle-1",
                },
              },
            ]
        `)
    })
})
