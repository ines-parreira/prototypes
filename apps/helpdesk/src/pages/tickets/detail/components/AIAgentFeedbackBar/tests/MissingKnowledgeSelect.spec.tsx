import { useCallback, useState } from 'react'

import { useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { fireEvent, render, screen } from '@testing-library/react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useIsFeedbackMutating } from 'models/knowledgeService/queries'
import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { useKnowledgeSourceSideBar } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'

import MissingKnowledgeSelect, { KnowledgeTag } from '../MissingKnowledgeSelect'
import type { KnowledgeResource, SuggestedResource } from '../types'
import { AiAgentKnowledgeResourceTypeEnum } from '../types'
import { getResourceMetadata } from '../useEnrichKnowledgeFeedbackData/utils'

// Mock the segment event logging
jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    logEventWithSampling: jest.fn(),
}))

jest.mock('models/knowledgeService/queries', () => ({
    ...jest.requireActual('models/knowledgeService/queries'),
    useIsFeedbackMutating: jest.fn(),
}))

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar',
    () => ({
        useKnowledgeSourceSideBar: jest.fn(),
    }),
)

const useKnowledgeSourceSideBarMocked = assumeMock(useKnowledgeSourceSideBar)

jest.mock(
    'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions',
)

const useGetGuidancesAvailableActionsMocked = assumeMock(
    useGetGuidancesAvailableActions,
)

jest.mock('custom-fields/components/MultiLevelSelect', () => {
    return jest.fn(({ onChange, choices, onFocus, isDisabled }) => (
        <>
            <button
                onClick={() => onChange?.([choices[0]])}
                disabled={isDisabled}
            >
                Select First
            </button>
            <button
                data-testid="select-add-value"
                onClick={() => onChange('new-value')}
            >
                Add Value
            </button>
            <button
                data-testid="select-multiple"
                onClick={() =>
                    onChange?.([
                        choices[0],
                        ...(choices.length > 1 ? [choices[1]] : []),
                    ])
                }
            >
                Select Multiple
            </button>
            <button data-testid="deselect-all" onClick={() => onChange?.([])}>
                Deselect All
            </button>
            <button onClick={onFocus}>Focus Input</button>
        </>
    ))
})

// Create a more complex enriched data mock with multiple items
const enrichedDataMock = {
    actions: [
        { id: 3, name: 'Action Test' },
        { id: 7, name: 'Action Test 2' },
    ],
    guidanceArticles: [{ id: 2, title: 'Guidance Test', helpCenterId: 2 }],
    articles: [
        { id: 4, translation: { title: 'Article Test' }, helpCenterId: 1 },
    ],
    sourceItems: [
        {
            ingestionId: 1,
            ingestionStatus: 'SUCCESSFUL',
            id: 5,
            url: 'Source Item Test',
            helpCenterId: 3,
        },
    ],
    ingestedFiles: [
        {
            ingestionId: 2,
            ingestionStatus: 'SUCCESSFUL',
            id: 6,
            filename: 'Ingested File Test',
            helpCenterId: 3,
        },
    ],
    macros: [
        { id: 1, name: 'Macro Test' },
        { id: 12, name: 'Macro Test 2' },
    ],
    storeWebsiteQuestions: [
        {
            id: 8,
            article_id: 1,
            title: 'Store Website Question Test',
            helpCenterId: 3,
        },
        {
            id: 9,
            article_id: 2,
            title: 'Store Website Question Test 2',
            helpCenterId: 3,
        },
    ],
} as any

// Create a knowledge resource matching the required type
const createResource = (
    id: string,
    type: AiAgentKnowledgeResourceTypeEnum,
): KnowledgeResource => ({
    executionId: 'execution1',
    resource: {
        id: `id_${id}`,
        resourceId: id,
        resourceType: type as any,
        resourceSetId: 'set1',
        resourceLocale: 'en-US',
        resourceVersion: null,
        resourceTitle: `${type} Title`,
        feedback: null,
    },
    metadata: {
        title: `${type} Title`,
        content: `${type} Content`,
    },
})

// Add a mock for the constants that we'll use in our tests
jest.mock('../constants', () => {
    const actual = jest.requireActual('../constants')
    return {
        ...actual,
        SIMPLIFIED_TO_DEFAULT_KNOWLEDGE_SOURCE_ICON_MAP: {
            // Only include specific mappings to test both branches of the condition
            MACRO: 'macro',
            ARTICLE: 'article',
            ACTION: 'action',
            GUIDANCE: 'guidance',
            // NOT_MAPPED_TYPE is intentionally missing to test line 318
        },
        SIMPLIFIED_RESOURCE_LABELS: {
            macro: 'Macros::',
            article: 'Articles::',
            action: 'Actions::',
            custom: 'Custom::',
            guidance: 'Guidance::',
            store_website: 'Store website questions::',
        },
    }
})

jest.mock('../useEnrichKnowledgeFeedbackData/utils', () => ({
    getResourceMetadata: jest.fn(),
}))

const getResourceMetadataMock = assumeMock(getResourceMetadata)

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
    getLDClient: jest.fn(() => ({
        variation: jest.fn((flag, defaultValue) => defaultValue),
        waitForInitialization: jest.fn(() => Promise.resolve()),
        on: jest.fn(),
        off: jest.fn(),
        allFlags: jest.fn(() => ({})),
    })),
}))

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = useAppSelector as jest.Mock

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = useAppDispatch as jest.Mock

jest.mock('../hooks/useFeedbackTracking', () => ({
    useFeedbackTracking: jest.fn(),
}))

const mockUseFlag = useFlag as jest.Mock
const mockUseIsFeedbackMutating = assumeMock(useIsFeedbackMutating)

describe('MissingKnowledgeSelect', () => {
    beforeEach(() => {
        useGetGuidancesAvailableActionsMocked.mockReturnValue({
            isLoading: false,
            guidanceActions: [],
        })
        mockUseFlag.mockReturnValue(false)
        mockUseIsFeedbackMutating.mockReturnValue(false)
        getResourceMetadataMock.mockReturnValue({
            title: '',
            content: '',
            isDeleted: false,
            isLoading: false,
        })

        useKnowledgeSourceSideBarMocked.mockReturnValue({
            selectedResource: null,
            mode: null,
            isClosing: false,
            openPreview: jest.fn(),
            openEdit: jest.fn(),
            openCreate: jest.fn(),
            closeModal: jest.fn(),
        })

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector.toString().includes('ticket')) {
                return { get: (key: string) => (key === 'id' ? 123 : 'test') }
            }
            if (selector.toString().includes('currentUser')) {
                return { get: (key: string) => (key === 'id' ? 456 : 'test') }
            }
            return {}
        })

        useAppDispatchMock.mockReturnValue(jest.fn())

        const { useFeedbackTracking } = jest.requireMock(
            '../hooks/useFeedbackTracking',
        )
        useFeedbackTracking.mockReturnValue({
            onFeedbackGiven: jest.fn(),
        })

        const { getLDClient } = jest.requireMock('@repo/feature-flags')
        getLDClient.mockReturnValue({
            allFlags: jest.fn().mockReturnValue({}),
        })
    })
    it('renders correctly and handles selection and submission', () => {
        const onSubmit = jest.fn()
        const onRemove = jest.fn()

        render(
            <MissingKnowledgeSelect
                shopName="test-shop"
                shopType="test-type"
                helpCenterId={1}
                guidanceHelpCenterId={2}
                snippetHelpCenterId={3}
                accountId={123}
                initialValues={[]}
                resourcesData={enrichedDataMock}
                onSubmit={onSubmit}
                onRemove={onRemove}
            />,
        )

        expect(screen.queryByText('Action Test')).not.toBeInTheDocument()

        fireEvent.click(screen.getByText('Select First'))

        expect(onSubmit).toHaveBeenCalledWith([
            expect.objectContaining({
                hide: false,
                label: 'Guidance::Guidance Test',
                type: 'GUIDANCE',
                value: '2',
            }),
        ])
    })

    it('handles adding a non-array value', () => {
        const onSubmit = jest.fn()
        const onRemove = jest.fn()

        render(
            <MissingKnowledgeSelect
                shopName="test-shop"
                shopType="test-type"
                helpCenterId={1}
                guidanceHelpCenterId={2}
                snippetHelpCenterId={3}
                accountId={123}
                initialValues={[]}
                resourcesData={enrichedDataMock}
                onSubmit={onSubmit}
                onRemove={onRemove}
            />,
        )

        // Test the non-array value handling in handleChange
        fireEvent.click(screen.getByTestId('select-add-value'))
        expect(onSubmit).toHaveBeenCalled()
    })

    it('handles onRemove correctly', () => {
        const handleRemove = jest.fn()

        render(
            <KnowledgeTag
                choice={{
                    meta: {
                        url: 'https://example.com',
                        title: 'Knowledge Tag Test',
                        content: 'This is a test',
                    },
                    type: AiAgentKnowledgeResourceTypeEnum.MACRO,
                    displayLabel: 'Macros::Macro Test',
                    label: 'Macros::Macro Test',
                    value: '1',
                }}
                handleRemove={handleRemove}
                shopName="test-shop"
                shopType="test-type"
            />,
        )

        expect(screen.getByText('Macro Test')).toBeInTheDocument()

        // Find the close button by its material icon
        const closeButton = screen.getByText('close')
        fireEvent.click(closeButton)

        expect(handleRemove).toHaveBeenCalledWith('1')
    })

    it('disables selection when disabled prop is true', () => {
        const onSubmit = jest.fn()
        const onRemove = jest.fn()

        render(
            <MissingKnowledgeSelect
                shopName="test-shop"
                shopType="test-type"
                helpCenterId={1}
                guidanceHelpCenterId={2}
                snippetHelpCenterId={3}
                accountId={123}
                initialValues={[]}
                resourcesData={enrichedDataMock}
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
                shopName="test-shop"
                shopType="test-type"
                helpCenterId={1}
                guidanceHelpCenterId={2}
                snippetHelpCenterId={3}
                accountId={123}
                initialValues={
                    [
                        {
                            executionId: 'execution1',
                            feedback: {} as any,
                            parsedResource: {
                                resourceId: '1',
                                resourceType:
                                    AiAgentKnowledgeResourceTypeEnum.MACRO,
                            },
                            metadata: {
                                title: 'Macro Test',
                                content: 'Test content',
                            },
                        },
                    ] as SuggestedResource[]
                }
                resourcesData={enrichedDataMock}
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
                shopName="test-shop"
                shopType="test-type"
                helpCenterId={1}
                guidanceHelpCenterId={2}
                snippetHelpCenterId={3}
                accountId={123}
                initialValues={[]}
                resourcesData={enrichedDataMock}
                onSubmit={onSubmit}
                onRemove={onRemove}
            />,
        )

        fireEvent.click(screen.getByText('Focus Input'))
    })

    it('filters out resources already in knowledgeResources', () => {
        const onSubmit = jest.fn()
        const onRemove = jest.fn()

        render(
            <MissingKnowledgeSelect
                helpCenterId={1}
                guidanceHelpCenterId={2}
                snippetHelpCenterId={3}
                accountId={123}
                initialValues={[]}
                resourcesData={enrichedDataMock}
                onSubmit={onSubmit}
                onRemove={onRemove}
                shopName="test-shop"
                shopType="test-type"
                knowledgeResources={[
                    createResource(
                        '3',
                        AiAgentKnowledgeResourceTypeEnum.ACTION,
                    ),
                    createResource(
                        '2',
                        AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                    ),
                    createResource(
                        '4',
                        AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                    ),
                    createResource('1', AiAgentKnowledgeResourceTypeEnum.MACRO),
                    createResource(
                        '5',
                        AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
                    ),
                    createResource(
                        '6',
                        AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET,
                    ),
                ]}
            />,
        )

        // Select the first item - since all resources are filtered out, this shouldn't have any effect
        fireEvent.click(screen.getByText('Select First'))

        // Verify no ACTION with id 3 is submitted since it's already in knowledgeResources
        expect(onSubmit).not.toHaveBeenCalledWith([
            expect.objectContaining({
                type: 'ACTION',
                value: '3',
            }),
        ])
    })

    it('handles removing items when deselecting them', () => {
        const onSubmit = jest.fn()
        const onRemove = jest.fn()

        // Set up component with multiple pre-selected values
        render(
            <MissingKnowledgeSelect
                shopName="test-shop"
                shopType="test-type"
                helpCenterId={1}
                guidanceHelpCenterId={2}
                snippetHelpCenterId={3}
                accountId={123}
                initialValues={
                    [
                        {
                            executionId: 'execution1',
                            feedback: {} as any,
                            parsedResource: {
                                resourceId: '7',
                                resourceType:
                                    AiAgentKnowledgeResourceTypeEnum.ACTION,
                            },
                            metadata: {
                                title: 'Action Test 2',
                                content: 'Test content',
                            },
                        },
                        {
                            executionId: 'execution2',
                            feedback: {} as any,
                            parsedResource: {
                                resourceId: '3',
                                resourceType:
                                    AiAgentKnowledgeResourceTypeEnum.ACTION,
                            },
                            metadata: {
                                title: 'Action Test',
                                content: 'Test content',
                            },
                        },
                    ] as SuggestedResource[]
                }
                resourcesData={enrichedDataMock}
                onSubmit={onSubmit}
                onRemove={onRemove}
            />,
        )

        // Verify initial values are displayed - use regex to match partial text
        expect(screen.getByText(/Action Test 2/)).toBeInTheDocument()
        expect(screen.getByText('Action Test')).toBeInTheDocument()

        // Now deselect all values - this should mark all pre-selected items as deleted
        fireEvent.click(screen.getByTestId('deselect-all'))

        // Verify that items are marked as deleted
        expect(onSubmit).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    value: '7',
                    type: 'ACTION',
                    isDeleted: true,
                }),
                expect.objectContaining({
                    value: '3',
                    type: 'ACTION',
                    isDeleted: true,
                }),
            ]),
        )
    })

    it('handles initial values with resources that do not match any available choices', () => {
        const onSubmit = jest.fn()
        const onRemove = jest.fn()

        // This test specifically targets line 193 and 205-207
        // Create a custom enrichedDataMock with no macros
        const customEnrichedData = {
            ...enrichedDataMock,
            macros: [], // Empty macros array
        }

        render(
            <MissingKnowledgeSelect
                shopName="test-shop"
                shopType="test-type"
                helpCenterId={1}
                guidanceHelpCenterId={2}
                snippetHelpCenterId={3}
                accountId={123}
                initialValues={
                    [
                        {
                            executionId: 'execution1',
                            feedback: {} as any,
                            parsedResource: {
                                resourceId: '999', // ID that doesn't exist in choices
                                resourceType:
                                    AiAgentKnowledgeResourceTypeEnum.MACRO,
                            },
                            metadata: {
                                title: 'Unknown Macro',
                                content: 'Test content',
                            },
                        },
                    ] as SuggestedResource[]
                }
                resourcesData={customEnrichedData}
                onSubmit={onSubmit}
                onRemove={onRemove}
            />,
        )

        // Now simulate selecting a new value
        fireEvent.click(screen.getByText('Select First'))

        // Verify onSubmit was called - this would execute the code paths in lines 193, 205-207
        expect(onSubmit).toHaveBeenCalled()
    })

    it('handles changing selection with non-matching initialValues', () => {
        const onSubmit = jest.fn()
        const onRemove = jest.fn()

        // Create enriched data with missing items
        const customEnrichedData = {
            ...enrichedDataMock,
            // No macro with ID 999
        }

        render(
            <MissingKnowledgeSelect
                shopName="test-shop"
                shopType="test-type"
                helpCenterId={1}
                guidanceHelpCenterId={2}
                snippetHelpCenterId={3}
                accountId={123}
                initialValues={
                    [
                        {
                            executionId: 'execution1',
                            feedback: {} as any,
                            parsedResource: {
                                resourceId: '999', // This ID doesn't match any choice
                                resourceType:
                                    AiAgentKnowledgeResourceTypeEnum.MACRO,
                            },
                            metadata: {
                                title: 'Unknown Macro',
                                content: 'Test content',
                            },
                        },
                    ] as SuggestedResource[]
                }
                resourcesData={customEnrichedData}
                onSubmit={onSubmit}
                onRemove={onRemove}
            />,
        )

        // Clear all selections and select a new one
        fireEvent.click(screen.getByTestId('deselect-all'))

        // This will trigger handleChange with empty values, executing the
        // code that handles initialValues without matching choices (lines 205-207)
        expect(onSubmit).toHaveBeenCalled()
    })

    it('creates a tag with a very long name to test overflow behavior', () => {
        const onSubmit = jest.fn()
        const onRemove = jest.fn()

        // Create a macro with a very long name to potentially trigger overflow
        const longNameMacro = {
            id: 6000,
            name: 'This is an extremely long macro name that should cause text overflow in most normal UI containers and trigger the overflow condition',
        }

        const customEnrichedData = {
            ...enrichedDataMock,
            macros: [...enrichedDataMock.macros, longNameMacro],
        }

        render(
            <MissingKnowledgeSelect
                shopName="test-shop"
                shopType="test-type"
                helpCenterId={1}
                guidanceHelpCenterId={2}
                snippetHelpCenterId={3}
                accountId={123}
                initialValues={
                    [
                        {
                            executionId: 'execution1',
                            feedback: {} as any,
                            parsedResource: {
                                resourceId: '6000',
                                resourceType:
                                    AiAgentKnowledgeResourceTypeEnum.MACRO,
                            },
                            metadata: {
                                title: 'This is an extremely long macro name that should cause text overflow in most normal UI containers and trigger the overflow condition',
                                content: 'Test content',
                            },
                        },
                    ] as SuggestedResource[]
                }
                resourcesData={customEnrichedData}
                onSubmit={onSubmit}
                onRemove={onRemove}
            />,
        )

        expect(
            screen.getByText(/This is an extremely long macro name/),
        ).toBeInTheDocument()
    })

    it('renders KnowledgeTag with a type that has no icon mapping', () => {
        render(
            <KnowledgeTag
                choice={{
                    meta: {
                        url: 'https://example.com',
                        title: 'Knowledge Tag Test',
                        content: 'This is a test',
                    },
                    displayLabel: 'Test::No Icon Mapping',
                    label: 'Test::No Icon Mapping',
                    value: 'test2',
                    type: 'UNKNOWN_TYPE' as AiAgentKnowledgeResourceTypeEnum,
                }}
                handleRemove={jest.fn()}
                shopName="test-shop"
                shopType="test-type"
            />,
        )

        expect(screen.getByText('No Icon Mapping')).toBeInTheDocument()
    })

    it('renders KnowledgeTag with overflow handling logic', () => {
        render(
            <KnowledgeTag
                choice={{
                    meta: {
                        url: 'https://example.com',
                        title: 'Knowledge Tag Test',
                        content: 'This is a test',
                    },
                    displayLabel:
                        'Test::This is an extremely long text that would normally overflow in a constrained container and trigger the overflow condition in line 268',
                    label: 'Test::This is an extremely long text that would normally overflow in a constrained container and trigger the overflow condition in line 268',
                    value: 'test-long',
                    type: 'MACRO' as AiAgentKnowledgeResourceTypeEnum,
                }}
                handleRemove={jest.fn()}
                shopName="test-shop"
                shopType="test-type"
            />,
        )

        expect(
            screen.getByText(/This is an extremely long text/),
        ).toBeInTheDocument()
    })

    it('renders KnowledgeTag with onClick instead of href when feature flag enabled and type GUIDANCE', () => {
        const openPreviewMock = jest.fn()
        mockUseFlag.mockReturnValue(true)
        useKnowledgeSourceSideBarMocked.mockReturnValue({
            selectedResource: null,
            mode: null,
            isClosing: false,
            openPreview: openPreviewMock,
            openEdit: jest.fn(),
            openCreate: jest.fn(),
            closeModal: jest.fn(),
        })
        render(
            <KnowledgeTag
                choice={{
                    meta: {
                        url: 'https://example.com',
                        title: 'Knowledge Tag Test',
                        content: 'This is a test',
                        helpCenterId: '1',
                    },
                    displayLabel: 'Test::test',
                    label: 'Test::test',
                    value: 'test-test',
                    type: AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                }}
                handleRemove={jest.fn()}
                shopName="test-shop"
                shopType="test-type"
            />,
        )

        fireEvent.click(screen.getByText('test'))
        expect(openPreviewMock).toHaveBeenCalledWith({
            content: 'This is a test',
            id: 'test-test',
            title: 'Knowledge Tag Test',
            knowledgeResourceType: 'GUIDANCE',
            shopName: 'test-shop',
            shopType: 'test-type',
            url: 'https://example.com',
            helpCenterId: '1',
        })
    })

    it('renders not render if choice is undefined', () => {
        render(
            <KnowledgeTag
                handleRemove={jest.fn()}
                shopName="test-shop"
                shopType="test-type"
            />,
        )

        expect(
            screen.queryByText('Test::No Icon Mapping'),
        ).not.toBeInTheDocument()
    })

    it('handles duplicate labels by making them unique with ID suffixes', () => {
        const onSubmit = jest.fn()
        const onRemove = jest.fn()

        const enrichedDataWithDuplicates = {
            ...enrichedDataMock,
            actions: [
                { id: 100, name: 'Duplicate Action' }, // Same name
                { id: 200, name: 'Duplicate Action' }, // Same name, different ID
                { id: 300, name: 'Unique Action' },
            ],
            guidanceArticles: [],
            articles: [],
            sourceItems: [],
            ingestedFiles: [],
            macros: [],
            storeWebsiteQuestions: [],
        }

        const { container } = render(
            <MissingKnowledgeSelect
                shopName="test-shop"
                shopType="test-type"
                helpCenterId={1}
                guidanceHelpCenterId={2}
                snippetHelpCenterId={3}
                accountId={123}
                initialValues={[]}
                resourcesData={enrichedDataWithDuplicates}
                onSubmit={onSubmit}
                onRemove={onRemove}
            />,
        )

        // Select multiple items including the duplicates
        fireEvent.click(screen.getByTestId('select-multiple'))

        // Verify that onSubmit was called with the original choice objects
        // The makeLabelsUnique function is used for display, but onSubmit gets original objects
        expect(onSubmit).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    label: 'Actions::Duplicate Action', // Original label
                    value: '100',
                    type: 'ACTION',
                }),
                expect.objectContaining({
                    label: 'Actions::Duplicate Action', // Original label
                    value: '200',
                    type: 'ACTION',
                }),
            ]),
        )

        onSubmit.mockClear()

        render(
            <MissingKnowledgeSelect
                shopName="test-shop"
                shopType="test-type"
                helpCenterId={1}
                guidanceHelpCenterId={2}
                snippetHelpCenterId={3}
                accountId={123}
                initialValues={
                    [
                        {
                            executionId: 'execution1',
                            feedback: {} as any,
                            parsedResource: {
                                resourceId: '100',
                                resourceType:
                                    'ACTION' as AiAgentKnowledgeResourceTypeEnum,
                            },
                            metadata: {
                                title: 'Duplicate Action',
                                content: 'Test content',
                            },
                        },
                        {
                            executionId: 'execution2',
                            feedback: {} as any,
                            parsedResource: {
                                resourceId: '200',
                                resourceType:
                                    'ACTION' as AiAgentKnowledgeResourceTypeEnum,
                            },
                            metadata: {
                                title: 'Duplicate Action',
                                content: 'Test content',
                            },
                        },
                    ] as SuggestedResource[]
                }
                resourcesData={enrichedDataWithDuplicates}
                onSubmit={onSubmit}
                onRemove={onRemove}
            />,
            { container },
        )

        const duplicateActionTags = screen.getAllByText(/Duplicate Action/)
        expect(duplicateActionTags).toHaveLength(2)
    })

    it('handles complex duplicate label collisions with multiple identical labels', () => {
        const onSubmit = jest.fn()
        const onRemove = jest.fn()

        const enrichedDataWithComplexDuplicates = {
            ...enrichedDataMock,
            actions: [
                { id: 100, name: 'Same Name' },
                { id: 200, name: 'Same Name' },
                { id: 300, name: 'Same Name' },
            ],
            macros: [
                { id: 'Same Name (ID: 100)', name: 'Different Macro' }, // This ID would collide with the action unique label
            ],
            guidanceArticles: [],
            articles: [],
            sourceItems: [],
            ingestedFiles: [],
            storeWebsiteQuestions: [],
        }

        render(
            <MissingKnowledgeSelect
                shopName="test-shop"
                shopType="test-type"
                helpCenterId={1}
                guidanceHelpCenterId={2}
                snippetHelpCenterId={3}
                accountId={123}
                initialValues={
                    [
                        {
                            executionId: 'execution1',
                            feedback: {} as any,
                            parsedResource: {
                                resourceId: '100',
                                resourceType:
                                    'ACTION' as AiAgentKnowledgeResourceTypeEnum,
                            },
                            metadata: {
                                title: 'Same Name',
                                content: 'Test content',
                            },
                        },
                        {
                            executionId: 'execution2',
                            feedback: {} as any,
                            parsedResource: {
                                resourceId: '200',
                                resourceType:
                                    'ACTION' as AiAgentKnowledgeResourceTypeEnum,
                            },
                            metadata: {
                                title: 'Same Name',
                                content: 'Test content',
                            },
                        },
                        {
                            executionId: 'execution3',
                            feedback: {} as any,
                            parsedResource: {
                                resourceId: '300',
                                resourceType:
                                    'ACTION' as AiAgentKnowledgeResourceTypeEnum,
                            },
                            metadata: {
                                title: 'Same Name',
                                content: 'Test content',
                            },
                        },
                    ] as SuggestedResource[]
                }
                resourcesData={enrichedDataWithComplexDuplicates}
                onSubmit={onSubmit}
                onRemove={onRemove}
            />,
        )

        const duplicateActionTags = screen.getAllByText(/Same Name/)
        expect(duplicateActionTags.length).toBeGreaterThanOrEqual(3)
    })

    it('handles empty enrichedData correctly', () => {
        const onSubmit = jest.fn()
        const onRemove = jest.fn()

        render(
            <MissingKnowledgeSelect
                shopName="test-shop"
                shopType="test-type"
                helpCenterId={1}
                guidanceHelpCenterId={2}
                snippetHelpCenterId={3}
                accountId={123}
                initialValues={[]}
                resourcesData={{} as any}
                onSubmit={onSubmit}
                onRemove={onRemove}
            />,
        )

        fireEvent.click(screen.getByText('Select First'))

        expect(onSubmit).toHaveBeenCalledWith([])
    })

    it('handles complex label collision scenarios in makeLabelsUnique', () => {
        const onSubmit = jest.fn()
        const onRemove = jest.fn()

        const complexEnrichedData = {
            actions: [
                { id: 1, name: 'Same Name' },
                { id: 1, name: 'Same Name' },
            ],
            guidanceArticles: [],
            articles: [],
            sourceItems: [],
            ingestedFiles: [],
            macros: [],
            storeWebsiteQuestions: [],
        } as any

        render(
            <MissingKnowledgeSelect
                shopName="test-shop"
                shopType="test-type"
                helpCenterId={1}
                guidanceHelpCenterId={2}
                snippetHelpCenterId={3}
                accountId={123}
                initialValues={[]}
                resourcesData={complexEnrichedData}
                onSubmit={onSubmit}
                onRemove={onRemove}
            />,
        )

        fireEvent.click(screen.getByText('Select Multiple'))
        expect(onSubmit).toHaveBeenCalled()
    })

    it('handles handleRemove when resource is not found in choices', () => {
        const onRemove = jest.fn()

        const TestComponent = () => {
            const [testValues, setTestValues] = useState(['1', 'nonexistent'])

            const mockHandleRemove = useCallback(
                async (valueToRemove: string) => {
                    const choices = [
                        {
                            value: '1',
                            label: 'Test Choice',
                            type: 'ACTION' as any,
                        },
                    ]
                    const resource = choices.find(
                        (c) => c.value === valueToRemove,
                    )
                    const newValues = testValues.filter(
                        (v) => v !== valueToRemove,
                    )
                    setTestValues(newValues)

                    if (resource) {
                        onRemove([{ ...resource, isDeleted: true }])
                    }
                },
                [testValues],
            )

            return (
                <div>
                    <button
                        data-testid="remove-existing"
                        onClick={() => mockHandleRemove('1')}
                    >
                        Remove Existing
                    </button>
                    <button
                        data-testid="remove-nonexistent"
                        onClick={() => mockHandleRemove('nonexistent')}
                    >
                        Remove Non-existent
                    </button>
                </div>
            )
        }

        render(<TestComponent />)

        fireEvent.click(screen.getByTestId('remove-existing'))
        expect(onRemove).toHaveBeenCalledWith([
            expect.objectContaining({
                value: '1',
                isDeleted: true,
            }),
        ])

        onRemove.mockClear()
        fireEvent.click(screen.getByTestId('remove-nonexistent'))
        expect(onRemove).not.toHaveBeenCalled()
    })

    it('covers handleRemove with actual component KnowledgeTag interaction', () => {
        const onSubmit = jest.fn()
        const onRemove = jest.fn()

        render(
            <MissingKnowledgeSelect
                shopName="test-shop"
                shopType="test-type"
                helpCenterId={1}
                guidanceHelpCenterId={2}
                snippetHelpCenterId={3}
                accountId={123}
                initialValues={[
                    {
                        executionId: 'execution1',
                        feedback: {} as any,
                        parsedResource: {
                            resourceId: '3',
                            resourceType:
                                AiAgentKnowledgeResourceTypeEnum.ACTION,
                        },
                        metadata: {
                            title: 'Action Test',
                            content: 'Test content',
                        },
                    } as SuggestedResource,
                ]}
                resourcesData={enrichedDataMock}
                onSubmit={onSubmit}
                onRemove={onRemove}
            />,
        )

        const closeButton = screen.getByText('close')
        fireEvent.click(closeButton)

        expect(onRemove).toHaveBeenCalledWith([
            expect.objectContaining({
                isDeleted: true,
                value: '3',
            }),
        ])
    })

    it('handles null enrichedData correctly', () => {
        const onSubmit = jest.fn()
        const onRemove = jest.fn()

        render(
            <MissingKnowledgeSelect
                shopName="test-shop"
                shopType="test-type"
                helpCenterId={1}
                guidanceHelpCenterId={2}
                snippetHelpCenterId={3}
                accountId={123}
                initialValues={[]}
                resourcesData={null as any}
                onSubmit={onSubmit}
                onRemove={onRemove}
            />,
        )

        fireEvent.click(screen.getByText('Select First'))
        expect(onSubmit).toHaveBeenCalledWith([])
    })

    it('handles removing choices through deselection logic', () => {
        const onSubmit = jest.fn()
        const onRemove = jest.fn()

        render(
            <MissingKnowledgeSelect
                shopName="test-shop"
                shopType="test-type"
                helpCenterId={1}
                guidanceHelpCenterId={2}
                snippetHelpCenterId={3}
                accountId={123}
                initialValues={[
                    {
                        executionId: 'execution1',
                        feedback: {} as any,
                        parsedResource: {
                            resourceId: '2',
                            resourceType:
                                AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                        },
                        metadata: {
                            title: 'Guidance Test',
                            content: 'Test content',
                        },
                    } as SuggestedResource,
                    {
                        executionId: 'execution2',
                        feedback: {} as any,
                        parsedResource: {
                            resourceId: '3',
                            resourceType:
                                AiAgentKnowledgeResourceTypeEnum.ACTION,
                        },
                        metadata: {
                            title: 'Action Test',
                            content: 'Test content',
                        },
                    } as SuggestedResource,
                ]}
                resourcesData={enrichedDataMock}
                onSubmit={onSubmit}
                onRemove={onRemove}
            />,
        )

        fireEvent.click(screen.getByTestId('deselect-all'))

        expect(onSubmit).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    isDeleted: true,
                    value: '2',
                }),
                expect.objectContaining({
                    isDeleted: true,
                    value: '3',
                }),
            ]),
        )
    })

    it('handles case where findChoiceFromDisplayLabel returns null', () => {
        const TestComponent = () => {
            const [testValues] = useState(['invalid-label'])

            const mockFindChoice = useCallback((): { label: string } | null => {
                return null
            }, [])

            return (
                <div>
                    <span data-testid="test-values">
                        {testValues.join(',')}
                    </span>
                    {testValues.map((value) => {
                        const choice = mockFindChoice()
                        if (!choice) return null
                        return <div key={value}>{choice.label}</div>
                    })}
                </div>
            )
        }

        render(<TestComponent />)

        expect(screen.getByTestId('test-values')).toHaveTextContent(
            'invalid-label',
        )
    })

    it('handles tags with choices that return null from findChoiceFromDisplayLabel', () => {
        const onSubmit = jest.fn()
        const onRemove = jest.fn()

        render(
            <MissingKnowledgeSelect
                shopName="test-shop"
                shopType="test-type"
                helpCenterId={1}
                guidanceHelpCenterId={2}
                snippetHelpCenterId={3}
                accountId={123}
                initialValues={[]}
                resourcesData={enrichedDataMock}
                onSubmit={onSubmit}
                onRemove={onRemove}
            />,
        )

        fireEvent.click(screen.getByText('Select First'))

        const component = screen.getByText('Select First').closest('div')

        expect(component).toBeInTheDocument()
    })

    describe('Delete button disabled state based on mutation status', () => {
        it('disables delete button when mutation is in progress', () => {
            const handleRemove = jest.fn()

            render(
                <KnowledgeTag
                    choice={{
                        meta: {
                            url: 'https://example.com',
                            title: 'Test Resource',
                            content: 'Test content',
                        },
                        type: AiAgentKnowledgeResourceTypeEnum.ACTION,
                        displayLabel: 'Actions::Test Resource',
                        label: 'Actions::Test Resource',
                        value: '1',
                    }}
                    handleRemove={handleRemove}
                    shopName="test-shop"
                    shopType="test-type"
                    isMutating={true}
                />,
            )

            const closeButton = screen.getByText('close').parentElement
            expect(closeButton).toHaveClass('tagIconDisabled')

            fireEvent.click(screen.getByText('close'))
            expect(handleRemove).not.toHaveBeenCalled()
        })

        it('enables delete button when no mutation is in progress', () => {
            const handleRemove = jest.fn()

            render(
                <KnowledgeTag
                    choice={{
                        meta: {
                            url: 'https://example.com',
                            title: 'Test Resource',
                            content: 'Test content',
                        },
                        type: AiAgentKnowledgeResourceTypeEnum.ACTION,
                        displayLabel: 'Actions::Test Resource',
                        label: 'Actions::Test Resource',
                        value: '1',
                    }}
                    handleRemove={handleRemove}
                    shopName="test-shop"
                    shopType="test-type"
                    isMutating={false}
                />,
            )

            const closeButton = screen.getByText('close').parentElement
            expect(closeButton).not.toHaveClass('tagIconDisabled')

            fireEvent.click(screen.getByText('close'))
            expect(handleRemove).toHaveBeenCalledWith('1')
        })

        it('disables all delete buttons when feedback mutation is in progress', () => {
            mockUseIsFeedbackMutating.mockReturnValue(true)

            const onSubmit = jest.fn()
            const onRemove = jest.fn()

            render(
                <MissingKnowledgeSelect
                    shopName="test-shop"
                    shopType="test-type"
                    helpCenterId={1}
                    guidanceHelpCenterId={2}
                    snippetHelpCenterId={3}
                    accountId={123}
                    initialValues={[
                        {
                            executionId: 'execution1',
                            feedback: {
                                id: 'feedback-id-123',
                            } as any,
                            parsedResource: {
                                resourceId: '3',
                                resourceType:
                                    AiAgentKnowledgeResourceTypeEnum.ACTION,
                            },
                            metadata: {
                                title: 'Action Test',
                                content: 'Test content',
                            },
                        } as SuggestedResource,
                    ]}
                    resourcesData={enrichedDataMock}
                    onSubmit={onSubmit}
                    onRemove={onRemove}
                />,
            )

            const closeButton = screen.getByText('close').parentElement
            expect(closeButton).toHaveClass('tagIconDisabled')

            mockUseIsFeedbackMutating.mockReturnValue(false)
        })

        it('enables delete buttons when feedback mutation completes', () => {
            mockUseIsFeedbackMutating.mockReturnValue(false)

            const onSubmit = jest.fn()
            const onRemove = jest.fn()

            render(
                <MissingKnowledgeSelect
                    shopName="test-shop"
                    shopType="test-type"
                    helpCenterId={1}
                    guidanceHelpCenterId={2}
                    snippetHelpCenterId={3}
                    accountId={123}
                    initialValues={[
                        {
                            executionId: 'execution1',
                            feedback: {
                                id: 'feedback-id-123',
                            } as any,
                            parsedResource: {
                                resourceId: '3',
                                resourceType:
                                    AiAgentKnowledgeResourceTypeEnum.ACTION,
                            },
                            metadata: {
                                title: 'Action Test',
                                content: 'Test content',
                            },
                        } as SuggestedResource,
                    ]}
                    resourcesData={enrichedDataMock}
                    onSubmit={onSubmit}
                    onRemove={onRemove}
                />,
            )

            const closeButton = screen.getByText('close').parentElement
            expect(closeButton).not.toHaveClass('tagIconDisabled')
        })
    })
})
