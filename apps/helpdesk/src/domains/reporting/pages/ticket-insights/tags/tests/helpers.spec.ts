import {
    TAGS_RESULTS_SELECTION_KEY,
    TagSelection,
} from 'domains/reporting/hooks/tags/useTagResultsSelection'
import { getTagResultsSelectionFromSessionStorage } from 'domains/reporting/pages/ticket-insights/tags/helpers'

const localStorageMock = (() => {
    const store = {} as any

    return {
        getItem(key: string) {
            return store[key] || null
        },
        setItem(key: string, value: string) {
            store[key] = value.toString()
        },
    }
})()

Object.defineProperty(window, 'sessionStorage', {
    value: localStorageMock,
})

describe('getTagResultsSelectionFromSessionStorage', () => {
    it('should return include_tags by default', () => {
        const result = getTagResultsSelectionFromSessionStorage()

        expect(result).toBe(TagSelection.includeTags)
    })

    it('should return include_tags after setting it', () => {
        window.sessionStorage.setItem(
            TAGS_RESULTS_SELECTION_KEY,
            TagSelection.includeTags,
        )

        const result = getTagResultsSelectionFromSessionStorage()

        expect(result).toBe(TagSelection.includeTags)
    })

    it('should return exclude_tags after setting it', () => {
        window.sessionStorage.setItem(
            TAGS_RESULTS_SELECTION_KEY,
            TagSelection.excludeTags,
        )

        const result = getTagResultsSelectionFromSessionStorage()

        expect(result).toBe(TagSelection.excludeTags)
    })

    it('should return include_tags after setting the wrong value', () => {
        window.sessionStorage.setItem(TAGS_RESULTS_SELECTION_KEY, 'other')

        const result = getTagResultsSelectionFromSessionStorage()

        expect(result).toBe(TagSelection.includeTags)
    })
})
