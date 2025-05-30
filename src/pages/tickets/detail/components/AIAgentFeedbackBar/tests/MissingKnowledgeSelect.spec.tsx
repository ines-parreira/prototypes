import { fireEvent, render, screen } from '@testing-library/react'

import MissingKnowledgeSelect from '../MissingKnowledgeSelect'
import { AiAgentKnowledgeResourceTypeEnum, SuggestedResource } from '../types'

jest.mock('custom-fields/components/MultiLevelSelect', () => {
    return jest.fn(({ onChange, choices, onFocus, isDisabled }) => (
        <>
            <button
                onClick={() => onChange?.([choices[0]])}
                disabled={isDisabled}
            >
                Select First
            </button>
            <button onClick={onFocus}>Focus Input</button>
        </>
    ))
})

const enrichedDataMock = {
    actions: [{ id: 3, name: 'Action Test' }],
    guidanceArticles: [{ id: 2, title: 'Guidance Test' }],
    articles: [{ id: 4, translation: { title: 'Article Test' } }],
    sourceItems: [{ id: 5, url: 'Source Item Test' }],
    ingestedFiles: [{ id: 6, filename: 'Ingested File Test' }],
    macros: [{ id: 1, name: 'Macro Test' }],
} as any

describe('MissingKnowledgeSelect', () => {
    it('renders correctly and handles selection and submission', () => {
        const onSubmit = jest.fn()
        const onRemove = jest.fn()

        render(
            <MissingKnowledgeSelect
                helpCenterId={1}
                guidanceHelpCenterId={2}
                snippetHelpCenterId={3}
                accountId={123}
                initialValues={[]}
                enrichedData={enrichedDataMock}
                onSubmit={onSubmit}
                onRemove={onRemove}
            />,
        )

        expect(screen.queryByText('Action Test')).not.toBeInTheDocument()

        fireEvent.click(screen.getByText('Select First'))

        expect(onSubmit).toHaveBeenCalledWith([
            expect.objectContaining({
                label: 'Actions::Action Test',
                type: 'ACTION',
                value: 3,
            }),
        ])
        expect(screen.getByText('Action Test')).toBeInTheDocument()
    })

    it('handles onRemove correctly', () => {
        const onSubmit = jest.fn()
        const onRemove = jest.fn()

        render(
            <MissingKnowledgeSelect
                helpCenterId={1}
                guidanceHelpCenterId={2}
                snippetHelpCenterId={3}
                accountId={123}
                initialValues={
                    [
                        {
                            parsedResource: {
                                resourceId: '1',
                                resourceType:
                                    AiAgentKnowledgeResourceTypeEnum.MACRO,
                            },
                        },
                    ] as SuggestedResource[]
                }
                enrichedData={enrichedDataMock}
                onSubmit={onSubmit}
                onRemove={onRemove}
            />,
        )

        expect(screen.getByText('Macro Test')).toBeInTheDocument()

        fireEvent.click(screen.getByText('close'))

        expect(onRemove).toHaveBeenCalledWith([
            expect.objectContaining({
                value: '1',
                type: 'MACRO',
                isDeleted: true,
            }),
        ])
    })

    it('disables selection when disabled prop is true', () => {
        const onSubmit = jest.fn()
        const onRemove = jest.fn()

        render(
            <MissingKnowledgeSelect
                helpCenterId={1}
                guidanceHelpCenterId={2}
                snippetHelpCenterId={3}
                accountId={123}
                initialValues={[]}
                enrichedData={enrichedDataMock}
                onSubmit={onSubmit}
                onRemove={onRemove}
                disabled={true}
            />,
        )

        const selectButton = screen.getByText('Select First')
        expect(selectButton).toBeDisabled()
    })

    it('initializes with pre-selected values', () => {
        const onSubmit = jest.fn()
        const onRemove = jest.fn()

        render(
            <MissingKnowledgeSelect
                helpCenterId={1}
                guidanceHelpCenterId={2}
                snippetHelpCenterId={3}
                accountId={123}
                initialValues={
                    [
                        {
                            parsedResource: {
                                resourceId: '1',
                                resourceType:
                                    AiAgentKnowledgeResourceTypeEnum.MACRO,
                            },
                        },
                    ] as SuggestedResource[]
                }
                enrichedData={enrichedDataMock}
                onSubmit={onSubmit}
                onRemove={onRemove}
            />,
        )

        expect(screen.getByText('Macro Test')).toBeInTheDocument()
    })

    it('triggers onFocus when input is focused', () => {
        const onSubmit = jest.fn()
        const onRemove = jest.fn()

        render(
            <MissingKnowledgeSelect
                helpCenterId={1}
                guidanceHelpCenterId={2}
                snippetHelpCenterId={3}
                accountId={123}
                initialValues={[]}
                enrichedData={enrichedDataMock}
                onSubmit={onSubmit}
                onRemove={onRemove}
            />,
        )

        fireEvent.click(screen.getByText('Focus Input'))
    })
})
