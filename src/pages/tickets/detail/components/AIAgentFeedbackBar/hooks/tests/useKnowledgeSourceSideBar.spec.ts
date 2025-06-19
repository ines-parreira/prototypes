import { renderHook } from 'utils/testing/renderHook'

import { KnowledgeSourceSideBarProvider } from '../../KnowledgeSourceSideBarProvider'
import { useKnowledgeSourceSideBar } from '../useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'

jest.mock('common/navigation/hooks/useNavBar/useNavBar', () => ({
    useNavBar: () => ({
        navBarDisplay: 'default',
        setNavBarDisplay: jest.fn(),
    }),
}))

jest.mock('split-ticket-view-toggle', () => ({
    useSplitTicketView: () => ({
        isEnabled: true,
        setIsEnabled: jest.fn(),
    }),
}))
describe('useKnowledgeSourceSideBar', () => {
    it('throws an error if used outside the provider', () => {
        const { result } = renderHook(() => useKnowledgeSourceSideBar())

        expect(result.error).toEqual(
            new Error(
                'useKnowledgeSourceSideBar must be used within a KnowledgeSourceSideBarProvider',
            ),
        )
    })

    it('returns context value when used within the provider', () => {
        const { result } = renderHook(() => useKnowledgeSourceSideBar(), {
            wrapper: KnowledgeSourceSideBarProvider as any,
        })

        expect(result.current).toMatchObject({
            mode: null,
            selectedResource: null,
            openPreview: expect.any(Function),
            openEdit: expect.any(Function),
            openCreate: expect.any(Function),
            closeModal: expect.any(Function),
        })
    })
})
