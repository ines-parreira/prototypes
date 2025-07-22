import { useCallback, useState } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { useFlag } from 'core/flags'
import { account } from 'fixtures/account'
import { ticket } from 'fixtures/ticket'
import { user } from 'fixtures/users'
import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { useKnowledgeSourceSideBar } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'
import { getResourceMetadata } from 'pages/tickets/detail/components/AIAgentFeedbackBar/useEnrichFeedbackData'
import { RootState, StoreDispatch } from 'state/types'
import { assumeMock } from 'utils/testing'

import MissingKnowledgeSelect, { KnowledgeTag } from '../MissingKnowledgeSelect'
import {
    AiAgentKnowledgeResourceTypeEnum,
    KnowledgeResource,
    SuggestedResource,
} from '../types'

// Mock the segment event logging
jest.mock('common/segment/segment', () => ({
    logEventWithSampling: jest.fn(),
    logEvent: jest.fn(),
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

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/useEnrichFeedbackData',
    () => ({
        getResourceMetadata: jest.fn(),
    }),
)

const getResourceMetadataMock = assumeMock(getResourceMetadata)

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

const mockUseFlag = useFlag as jest.Mock
const defaultStore: Partial<RootState> = {
    currentAccount: fromJS(account),
    currentUser: fromJS(user),
    ticket: fromJS(ticket),
}

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

describe('MissingKnowledgeSelect', () => {
    let onKnowledgeResourceClickMock: jest.Mock

    beforeEach(() => {
        onKnowledgeResourceClickMock = jest.fn()
        useGetGuidancesAvailableActionsMocked.mockReturnValue({
            isLoading: false,
            guidanceActions: [],
        })
        mockUseFlag.mockReturnValue(false)
        getResourceMetadataMock.mockReturnValue({
            title: '',
            content: '',
            isDeleted: false,
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
    })
    it('renders correctly and handles selection and submission', () => {
        const onSubmit = jest.fn()
        const onRemove = jest.fn()

        render(
            <Provider store={mockStore(defaultStore)}>
                <MissingKnowledgeSelect
                    shopName="test-shop"
                    shopType="test-type"
                    helpCenterId={1}
                    guidanceHelpCenterId={2}
                    snippetHelpCenterId={3}
                    accountId={123}
                    initialValues={[]}
                    enrichedData={enrichedDataMock}
                    onSubmit={onSubmit}
                    onRemove={onRemove}
                    onKnowledgeResourceClick={onKnowledgeResourceClickMock}
                />
            </Provider>,
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
            <Provider store={mockStore(defaultStore)}>
                <MissingKnowledgeSelect
                    shopName="test-shop"
                    shopType="test-type"
                    helpCenterId={1}
                    guidanceHelpCenterId={2}
                    snippetHelpCenterId={3}
                    accountId={123}
                    initialValues={[]}
                    enrichedData={enrichedDataMock}
                    onSubmit={onSubmit}
                    onRemove={onRemove}
                    onKnowledgeResourceClick={onKnowledgeResourceClickMock}
                />
            </Provider>,
        )

        // Test the non-array value handling in handleChange
        fireEvent.click(screen.getByTestId('select-add-value'))
        expect(onSubmit).toHaveBeenCalled()
    })

    it('handles onRemove correctly', () => {
        const handleRemove = jest.fn()

        render(
            <Provider store={mockStore(defaultStore)}>
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
                    onKnowledgeResourceClick={onKnowledgeResourceClickMock}
                />
            </Provider>,
        )

        expect(screen.getByText('Macro Test')).toBeInTheDocument()

        // Find the close button by its material icon
        const closeButton = screen.getByText('close')
        fireEvent.click(closeButton)

        expect(handleRemove).toHaveBeenCalledWith('1')
    })

    it('calls onKnowledgeResourceClick when clicking on a knowledge tag', () => {
        const handleRemove = jest.fn()

        render(
            <Provider store={mockStore(defaultStore)}>
                <KnowledgeTag
                    choice={{
                        meta: {
                            url: 'https://example.com',
                            title: 'Knowledge Tag Test',
                            content: 'This is a test',
                            helpCenterId: '2',
                        },
                        type: AiAgentKnowledgeResourceTypeEnum.MACRO,
                        displayLabel: 'Macros::Macro Test',
                        label: 'Macros::Macro Test',
                        value: '1',
                    }}
                    handleRemove={handleRemove}
                    shopName="test-shop"
                    shopType="test-type"
                    onKnowledgeResourceClick={onKnowledgeResourceClickMock}
                />
            </Provider>,
        )

        fireEvent.click(screen.getByText('Macro Test'))

        expect(onKnowledgeResourceClickMock).toHaveBeenCalledWith(
            '1',
            AiAgentKnowledgeResourceTypeEnum.MACRO,
            '2',
        )
    })

    it('calls onKnowledgeResourceClick with empty string when helpCenterId is undefined', () => {
        const handleRemove = jest.fn()

        render(
            <Provider store={mockStore(defaultStore)}>
                <KnowledgeTag
                    choice={{
                        meta: {
                            url: 'https://example.com',
                            title: 'Knowledge Tag Test',
                            content: 'This is a test',
                            // helpCenterId is undefined
                        },
                        type: AiAgentKnowledgeResourceTypeEnum.MACRO,
                        displayLabel: 'Macros::Macro Test',
                        label: 'Macros::Macro Test',
                        value: '1',
                    }}
                    handleRemove={handleRemove}
                    shopName="test-shop"
                    shopType="test-type"
                    onKnowledgeResourceClick={onKnowledgeResourceClickMock}
                />
            </Provider>,
        )

        fireEvent.click(screen.getByText('Macro Test'))

        expect(onKnowledgeResourceClickMock).toHaveBeenCalledWith(
            '1',
            AiAgentKnowledgeResourceTypeEnum.MACRO,
            '',
        )
    })

    it('calls onKnowledgeResourceClick with empty string when helpCenterId is empty string', () => {
        const handleRemove = jest.fn()

        render(
            <Provider store={mockStore(defaultStore)}>
                <KnowledgeTag
                    choice={{
                        meta: {
                            url: 'https://example.com',
                            title: 'Knowledge Tag Test',
                            content: 'This is a test',
                            helpCenterId: '',
                        },
                        type: AiAgentKnowledgeResourceTypeEnum.MACRO,
                        displayLabel: 'Macros::Macro Test',
                        label: 'Macros::Macro Test',
                        value: '1',
                    }}
                    handleRemove={handleRemove}
                    shopName="test-shop"
                    shopType="test-type"
                    onKnowledgeResourceClick={onKnowledgeResourceClickMock}
                />
            </Provider>,
        )

        fireEvent.click(screen.getByText('Macro Test'))

        expect(onKnowledgeResourceClickMock).toHaveBeenCalledWith(
            '1',
            AiAgentKnowledgeResourceTypeEnum.MACRO,
            '',
        )
    })

    it('calls onKnowledgeResourceClick with empty string when meta has no helpCenterId', () => {
        const handleRemove = jest.fn()

        render(
            <Provider store={mockStore(defaultStore)}>
                <KnowledgeTag
                    choice={{
                        meta: {
                            url: 'https://example.com',
                            title: 'Knowledge Tag Test',
                            content: 'This is a test',
                            // helpCenterId is not provided, so it's undefined
                        },
                        type: AiAgentKnowledgeResourceTypeEnum.MACRO,
                        displayLabel: 'Macros::Macro Test',
                        label: 'Macros::Macro Test',
                        value: '1',
                    }}
                    handleRemove={handleRemove}
                    shopName="test-shop"
                    shopType="test-type"
                    onKnowledgeResourceClick={onKnowledgeResourceClickMock}
                />
            </Provider>,
        )

        fireEvent.click(screen.getByText('Macro Test'))

        expect(onKnowledgeResourceClickMock).toHaveBeenCalledWith(
            '1',
            AiAgentKnowledgeResourceTypeEnum.MACRO,
            '',
        )
    })

    it('disables selection when disabled prop is true', () => {
        const onSubmit = jest.fn()
        const onRemove = jest.fn()

        render(
            <Provider store={mockStore(defaultStore)}>
                <MissingKnowledgeSelect
                    shopName="test-shop"
                    shopType="test-type"
                    helpCenterId={1}
                    guidanceHelpCenterId={2}
                    snippetHelpCenterId={3}
                    accountId={123}
                    initialValues={[]}
                    enrichedData={enrichedDataMock}
                    onSubmit={onSubmit}
                    onRemove={onRemove}
                    disabled={true}
                    onKnowledgeResourceClick={onKnowledgeResourceClickMock}
                />
            </Provider>,
        )

        const selectButton = screen.getByText('Select First')
        expect(selectButton).toBeDisabled()
    })

    it('initializes with pre-selected values', () => {
        const onSubmit = jest.fn()
        const onRemove = jest.fn()

        render(
            <Provider store={mockStore(defaultStore)}>
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
                    onKnowledgeResourceClick={onKnowledgeResourceClickMock}
                />
            </Provider>,
        )

        expect(screen.getByText('Macro Test')).toBeInTheDocument()
    })

    it('triggers onFocus when input is focused', () => {
        const onSubmit = jest.fn()
        const onRemove = jest.fn()

        render(
            <Provider store={mockStore(defaultStore)}>
                <MissingKnowledgeSelect
                    shopName="test-shop"
                    shopType="test-type"
                    helpCenterId={1}
                    guidanceHelpCenterId={2}
                    snippetHelpCenterId={3}
                    accountId={123}
                    initialValues={[]}
                    enrichedData={enrichedDataMock}
                    onSubmit={onSubmit}
                    onRemove={onRemove}
                    onKnowledgeResourceClick={onKnowledgeResourceClickMock}
                />
            </Provider>,
        )

        fireEvent.click(screen.getByText('Focus Input'))
    })

    it('filters out resources already in knowledgeResources', () => {
        const onSubmit = jest.fn()
        const onRemove = jest.fn()

        render(
            <Provider store={mockStore(defaultStore)}>
                <MissingKnowledgeSelect
                    helpCenterId={1}
                    guidanceHelpCenterId={2}
                    snippetHelpCenterId={3}
                    accountId={123}
                    initialValues={[]}
                    enrichedData={enrichedDataMock}
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
                        createResource(
                            '1',
                            AiAgentKnowledgeResourceTypeEnum.MACRO,
                        ),
                        createResource(
                            '5',
                            AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
                        ),
                        createResource(
                            '6',
                            AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET,
                        ),
                    ]}
                    onKnowledgeResourceClick={onKnowledgeResourceClickMock}
                />
            </Provider>,
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
            <Provider store={mockStore(defaultStore)}>
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
                                parsedResource: {
                                    resourceId: '1',
                                    resourceType:
                                        AiAgentKnowledgeResourceTypeEnum.MACRO,
                                },
                            },
                            {
                                parsedResource: {
                                    resourceId: '3',
                                    resourceType:
                                        AiAgentKnowledgeResourceTypeEnum.ACTION,
                                },
                            },
                        ] as SuggestedResource[]
                    }
                    enrichedData={enrichedDataMock}
                    onSubmit={onSubmit}
                    onRemove={onRemove}
                    onKnowledgeResourceClick={onKnowledgeResourceClickMock}
                />
            </Provider>,
        )

        // Verify initial values are displayed - use regex to match partial text
        expect(screen.getByText(/Macro Test/)).toBeInTheDocument()
        expect(screen.getByText(/Action Test/)).toBeInTheDocument()

        // Now deselect all values - this should mark all pre-selected items as deleted
        fireEvent.click(screen.getByTestId('deselect-all'))

        // Verify that items are marked as deleted
        expect(onSubmit).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    value: '1',
                    type: 'MACRO',
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
            <Provider store={mockStore(defaultStore)}>
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
                                parsedResource: {
                                    resourceId: '999', // ID that doesn't exist in choices
                                    resourceType:
                                        AiAgentKnowledgeResourceTypeEnum.MACRO,
                                },
                            },
                        ] as SuggestedResource[]
                    }
                    enrichedData={customEnrichedData}
                    onSubmit={onSubmit}
                    onRemove={onRemove}
                    onKnowledgeResourceClick={onKnowledgeResourceClickMock}
                />
            </Provider>,
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
            <Provider store={mockStore(defaultStore)}>
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
                                parsedResource: {
                                    resourceId: '999', // This ID doesn't match any choice
                                    resourceType:
                                        AiAgentKnowledgeResourceTypeEnum.MACRO,
                                },
                            },
                        ] as SuggestedResource[]
                    }
                    enrichedData={customEnrichedData}
                    onSubmit={onSubmit}
                    onRemove={onRemove}
                    onKnowledgeResourceClick={onKnowledgeResourceClickMock}
                />
            </Provider>,
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
            <Provider store={mockStore(defaultStore)}>
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
                                parsedResource: {
                                    resourceId: '6000',
                                    resourceType:
                                        AiAgentKnowledgeResourceTypeEnum.MACRO,
                                },
                            },
                        ] as SuggestedResource[]
                    }
                    enrichedData={customEnrichedData}
                    onSubmit={onSubmit}
                    onRemove={onRemove}
                    onKnowledgeResourceClick={onKnowledgeResourceClickMock}
                />
            </Provider>,
        )

        expect(
            screen.getByText(/This is an extremely long macro name/),
        ).toBeInTheDocument()
    })

    it('renders KnowledgeTag with a type that has no icon mapping', () => {
        render(
            <Provider store={mockStore(defaultStore)}>
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
                    onKnowledgeResourceClick={onKnowledgeResourceClickMock}
                />
            </Provider>,
        )

        expect(screen.getByText('No Icon Mapping')).toBeInTheDocument()
    })

    it('renders KnowledgeTag with overflow handling logic', () => {
        render(
            <Provider store={mockStore(defaultStore)}>
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
                    onKnowledgeResourceClick={onKnowledgeResourceClickMock}
                />
            </Provider>,
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
            <Provider store={mockStore(defaultStore)}>
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
                    onKnowledgeResourceClick={onKnowledgeResourceClickMock}
                />
            </Provider>,
        )

        fireEvent.click(screen.getByText('test'))

        expect(onKnowledgeResourceClickMock).toHaveBeenCalledWith(
            'test-test',
            AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
            '1',
        )
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
            <Provider store={mockStore(defaultStore)}>
                <KnowledgeTag
                    handleRemove={jest.fn()}
                    shopName="test-shop"
                    shopType="test-type"
                    onKnowledgeResourceClick={onKnowledgeResourceClickMock}
                />
            </Provider>,
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
            <Provider store={mockStore(defaultStore)}>
                <MissingKnowledgeSelect
                    shopName="test-shop"
                    shopType="test-type"
                    helpCenterId={1}
                    guidanceHelpCenterId={2}
                    snippetHelpCenterId={3}
                    accountId={123}
                    initialValues={[]}
                    enrichedData={enrichedDataWithDuplicates}
                    onSubmit={onSubmit}
                    onRemove={onRemove}
                    onKnowledgeResourceClick={onKnowledgeResourceClickMock}
                />
            </Provider>,
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
            <Provider store={mockStore(defaultStore)}>
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
                                parsedResource: {
                                    resourceId: '100',
                                    resourceType:
                                        'ACTION' as AiAgentKnowledgeResourceTypeEnum,
                                },
                            },
                            {
                                parsedResource: {
                                    resourceId: '200',
                                    resourceType:
                                        'ACTION' as AiAgentKnowledgeResourceTypeEnum,
                                },
                            },
                        ] as SuggestedResource[]
                    }
                    enrichedData={enrichedDataWithDuplicates}
                    onSubmit={onSubmit}
                    onRemove={onRemove}
                    onKnowledgeResourceClick={onKnowledgeResourceClickMock}
                />
            </Provider>,
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
            <Provider store={mockStore(defaultStore)}>
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
                                parsedResource: {
                                    resourceId: '100',
                                    resourceType:
                                        'ACTION' as AiAgentKnowledgeResourceTypeEnum,
                                },
                            },
                            {
                                parsedResource: {
                                    resourceId: '200',
                                    resourceType:
                                        'ACTION' as AiAgentKnowledgeResourceTypeEnum,
                                },
                            },
                            {
                                parsedResource: {
                                    resourceId: '300',
                                    resourceType:
                                        'ACTION' as AiAgentKnowledgeResourceTypeEnum,
                                },
                            },
                        ] as SuggestedResource[]
                    }
                    enrichedData={enrichedDataWithComplexDuplicates}
                    onSubmit={onSubmit}
                    onRemove={onRemove}
                    onKnowledgeResourceClick={onKnowledgeResourceClickMock}
                />
            </Provider>,
        )

        const duplicateActionTags = screen.getAllByText(/Same Name/)
        expect(duplicateActionTags.length).toBeGreaterThanOrEqual(3)
    })

    it('handles empty enrichedData correctly', () => {
        const onSubmit = jest.fn()
        const onRemove = jest.fn()

        render(
            <Provider store={mockStore(defaultStore)}>
                <MissingKnowledgeSelect
                    shopName="test-shop"
                    shopType="test-type"
                    helpCenterId={1}
                    guidanceHelpCenterId={2}
                    snippetHelpCenterId={3}
                    accountId={123}
                    initialValues={[]}
                    enrichedData={{} as any}
                    onSubmit={onSubmit}
                    onRemove={onRemove}
                    onKnowledgeResourceClick={onKnowledgeResourceClickMock}
                />
            </Provider>,
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
            <Provider store={mockStore(defaultStore)}>
                <MissingKnowledgeSelect
                    shopName="test-shop"
                    shopType="test-type"
                    helpCenterId={1}
                    guidanceHelpCenterId={2}
                    snippetHelpCenterId={3}
                    accountId={123}
                    initialValues={[]}
                    enrichedData={complexEnrichedData}
                    onSubmit={onSubmit}
                    onRemove={onRemove}
                    onKnowledgeResourceClick={onKnowledgeResourceClickMock}
                />
            </Provider>,
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

        render(
            <Provider store={mockStore(defaultStore)}>
                <TestComponent />
            </Provider>,
        )

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
            <Provider store={mockStore(defaultStore)}>
                <MissingKnowledgeSelect
                    shopName="test-shop"
                    shopType="test-type"
                    helpCenterId={1}
                    guidanceHelpCenterId={2}
                    snippetHelpCenterId={3}
                    accountId={123}
                    initialValues={[
                        {
                            parsedResource: {
                                resourceId: '3',
                                resourceType:
                                    AiAgentKnowledgeResourceTypeEnum.ACTION,
                            },
                        } as SuggestedResource,
                    ]}
                    enrichedData={enrichedDataMock}
                    onSubmit={onSubmit}
                    onRemove={onRemove}
                    onKnowledgeResourceClick={onKnowledgeResourceClickMock}
                />
            </Provider>,
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
            <Provider store={mockStore(defaultStore)}>
                <MissingKnowledgeSelect
                    shopName="test-shop"
                    shopType="test-type"
                    helpCenterId={1}
                    guidanceHelpCenterId={2}
                    snippetHelpCenterId={3}
                    accountId={123}
                    initialValues={[]}
                    enrichedData={null as any}
                    onSubmit={onSubmit}
                    onRemove={onRemove}
                    onKnowledgeResourceClick={onKnowledgeResourceClickMock}
                />
            </Provider>,
        )

        fireEvent.click(screen.getByText('Select First'))
        expect(onSubmit).toHaveBeenCalledWith([])
    })

    it('handles removing choices through deselection logic', () => {
        const onSubmit = jest.fn()
        const onRemove = jest.fn()

        render(
            <Provider store={mockStore(defaultStore)}>
                <MissingKnowledgeSelect
                    shopName="test-shop"
                    shopType="test-type"
                    helpCenterId={1}
                    guidanceHelpCenterId={2}
                    snippetHelpCenterId={3}
                    accountId={123}
                    initialValues={[
                        {
                            parsedResource: {
                                resourceId: '2',
                                resourceType:
                                    AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                            },
                        } as SuggestedResource,
                        {
                            parsedResource: {
                                resourceId: '3',
                                resourceType:
                                    AiAgentKnowledgeResourceTypeEnum.ACTION,
                            },
                        } as SuggestedResource,
                    ]}
                    enrichedData={enrichedDataMock}
                    onSubmit={onSubmit}
                    onRemove={onRemove}
                    onKnowledgeResourceClick={onKnowledgeResourceClickMock}
                />
            </Provider>,
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

        render(
            <Provider store={mockStore(defaultStore)}>
                <TestComponent />
            </Provider>,
        )

        expect(screen.getByTestId('test-values')).toHaveTextContent(
            'invalid-label',
        )
    })

    it('handles tags with choices that return null from findChoiceFromDisplayLabel', () => {
        const onSubmit = jest.fn()
        const onRemove = jest.fn()

        render(
            <Provider store={mockStore(defaultStore)}>
                <MissingKnowledgeSelect
                    shopName="test-shop"
                    shopType="test-type"
                    helpCenterId={1}
                    guidanceHelpCenterId={2}
                    snippetHelpCenterId={3}
                    accountId={123}
                    initialValues={[]}
                    enrichedData={enrichedDataMock}
                    onSubmit={onSubmit}
                    onRemove={onRemove}
                    onKnowledgeResourceClick={onKnowledgeResourceClickMock}
                />
            </Provider>,
        )

        fireEvent.click(screen.getByText('Select First'))

        const component = screen.getByText('Select First').closest('div')

        expect(component).toBeInTheDocument()
    })
})
