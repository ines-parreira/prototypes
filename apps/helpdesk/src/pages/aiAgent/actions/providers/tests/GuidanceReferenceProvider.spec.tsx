import { screen } from '@testing-library/react'

import type { FindAllGuidancesKnowledgeResourcesResult } from '@gorgias/knowledge-service-client'

import { useFindAllGuidancesKnowledgeResources } from 'models/knowledgeService/queries'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import GuidanceReferenceContext from '../GuidanceReferenceContext'
import GuidanceReferenceProvider, { select } from '../GuidanceReferenceProvider'

jest.mock('models/knowledgeService/queries')

const mockUseFindAllGuidancesKnowledgeResources = jest.mocked(
    useFindAllGuidancesKnowledgeResources,
)

describe('<GuidanceReferenceProvider />', () => {
    it('should provide guidance references and canBeDeleted function', () => {
        mockUseFindAllGuidancesKnowledgeResources.mockReturnValue({
            data: {
                data: [
                    {
                        id: 1,
                        title: 'Guidance 1',
                        sourceId: '1',
                        metadata: {
                            actions: [{ id: 'action-1', title: 'Action 1' }],
                        },
                    },
                ],
            },
            isLoading: false,
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

        expect(mockUseFindAllGuidancesKnowledgeResources).toHaveBeenCalledWith(
            {
                actionsIds: ['action-1'],
                includeDisabled: false,
            },
            {
                enabled: true,
            },
        )
    })

    it('should transform data to map', () => {
        const data = {
            data: [
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
            ],
        } as unknown as FindAllGuidancesKnowledgeResourcesResult
        expect(select(data)).toEqual({
            'action-1': [{ id: 1, title: 'Guidance 1', sourceId: '1' }],
            'action-2': [{ id: 1, title: 'Guidance 1', sourceId: '1' }],
        })
    })
})
