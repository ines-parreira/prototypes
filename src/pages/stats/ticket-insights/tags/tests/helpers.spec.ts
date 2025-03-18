import useSessionStorage from 'hooks/useSessionStorage'
import { useTagResultsSelection } from 'pages/stats/ticket-insights/tags/helpers'
import { TagSelection } from 'pages/stats/ticket-insights/tags/TagActionsMenu'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/useSessionStorage')
const useSessionStorageMock = assumeMock(useSessionStorage)
describe('getTagResultsSelection', () => {
    it('should return include_tags by default', () => {
        useSessionStorageMock.mockReturnValue([TagSelection.includeTags] as any)

        expect(useTagResultsSelection()).toBe(TagSelection.includeTags)
    })

    it('should return include_tags by default', () => {
        useSessionStorageMock.mockReturnValue(['another-value'] as any)

        expect(useTagResultsSelection()).toBe(TagSelection.includeTags)
    })

    it('should return exclude_tags', () => {
        useSessionStorageMock.mockReturnValue([TagSelection.excludeTags] as any)

        expect(useTagResultsSelection()).toBe(TagSelection.excludeTags)
    })

    it('should return default value if session storage is empty', () => {
        useSessionStorageMock.mockReturnValue([null] as any)

        expect(useTagResultsSelection()).toBe(TagSelection.includeTags)
    })
})
