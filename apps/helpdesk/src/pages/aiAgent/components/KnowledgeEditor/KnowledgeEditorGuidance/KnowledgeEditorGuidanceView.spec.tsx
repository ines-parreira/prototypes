import { render } from '@testing-library/react'
import { Provider } from 'react-redux'

import { mockStore } from 'utils/testing'

import { KnowledgeEditorGuidanceView } from './KnowledgeEditorGuidanceView'

describe('KnowledgeEditorGuidanceView', () => {
    it('renders', () => {
        render(
            <Provider store={mockStore({})}>
                <KnowledgeEditorGuidanceView
                    onClose={jest.fn()}
                    onClickPrevious={jest.fn()}
                    onClickNext={jest.fn()}
                    availableActions={[
                        {
                            name: 'Test action',
                            value: 'test-action',
                        },
                    ]}
                    availableVariables={[
                        {
                            name: 'Test variable',
                            variables: [],
                        },
                    ]}
                    onSave={jest.fn()}
                    onDelete={jest.fn()}
                    onDuplicate={jest.fn()}
                    title="Test Title"
                    content="Test Content"
                    aiAgentEnabled={true}
                    onToggleAIAgentEnabled={jest.fn()}
                    shopName="Test Shop"
                    createdDatetime={new Date()}
                    lastUpdatedDatetime={new Date()}
                    onChangeTitle={jest.fn()}
                    onChangeContent={jest.fn()}
                    isGuidanceArticleUpdating={false}
                    guidanceMode="read"
                />
            </Provider>,
        )
    })
})
