import { screen } from '@testing-library/react'

import { useFindAllGuidancesKnowledgeResources } from 'models/knowledgeService/queries'
import { Paths } from 'rest_api/knowledge_service_api/client.generated'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import GuidanceReferenceContext from '../GuidanceReferenceContext'
import GuidanceReferenceProvider, { select } from '../GuidanceReferenceProvider'

jest.mock('models/knowledgeService/queries')

const mockUseFindAllGuidancesKnowledgeResources = jest.mocked(
    useFindAllGuidancesKnowledgeResources,
)

describe('<StoreTrackstarProvider />', () => {
    it('should use trackstar integration id from store app', () => {
        mockUseFindAllGuidancesKnowledgeResources.mockReturnValue({
            data: {
                'action-1': true,
            },
            isInitialLoading: false,
        } as unknown as ReturnType<
            typeof useFindAllGuidancesKnowledgeResources
        >)

        renderWithQueryClientProvider(
            <GuidanceReferenceProvider actions={[{ id: 'action-1' }]}>
                <GuidanceReferenceContext.Consumer>
                    {(contextValue) => {
                        return `action-1: ${contextValue.canBeDeleted('action-1')}`
                    }}
                </GuidanceReferenceContext.Consumer>
            </GuidanceReferenceProvider>,
        )

        expect(screen.getByText('action-1: false')).toBeInTheDocument()
    })

    it('should transform data to map', () => {
        const data = [
            {
                id: 1,
                title: 'Guidance 1',
                sourceId: '1',
                metadata: {
                    actions: [
                        { id: 'action-1', title: 'Action 1' },
                        { id: 'action-2', title: 'Action 2' },
                    ],
                },
            },
        ] as unknown as Paths.FindAllGuidancesKnowledgeResources.Responses.$200
        expect(select(data)).toEqual({
            'action-1': [{ id: 1, title: 'Guidance 1', sourceId: '1' }],
            'action-2': [{ id: 1, title: 'Guidance 1', sourceId: '1' }],
        })
    })
})
