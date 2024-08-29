import React from 'react'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {
    useAIAgentGetOtherResources,
    UseAIAgentGetOtherResourcesProps,
} from 'pages/tickets/detail/hooks/useAIAgentGetOtherResources'
import useAppDispatch from 'hooks/useAppDispatch'
import {assumeMock} from 'utils/testing'
import FeedbackOtherResourcesSelect, {
    NO_RELEVANT_RESOURCES_LABEL,
} from '../FeedbackOtherResourcesSelect'
import {MultiLevelSelectProps} from '../../TicketFields/components/fields/DropdownField/MultiLevelSelect'

jest.mock('pages/tickets/detail/hooks/useAIAgentGetOtherResources')
jest.mock('state/ticket/actions')
jest.mock('hooks/useAppDispatch')
jest.mock('hooks/useElementSize', () => () => ({width: 100, height: 100}))

const mockDispatch = jest.fn()
assumeMock(useAppDispatch).mockReturnValue(mockDispatch)
const mockUseAIAgentGetOtherResources = assumeMock(useAIAgentGetOtherResources)

const mockChildComponent = jest.fn()
jest.mock(
    '../../TicketFields/components/fields/DropdownField/MultiLevelSelect',
    () => (props: MultiLevelSelectProps) => {
        mockChildComponent(props)
        return (
            <div>
                <button onClick={props.onApplyClick}>Apply</button>
            </div>
        )
    }
)

describe('FeedbackOtherResourcesSelect Component', () => {
    const setupMockResourcesValues = ({
        optionName,
        resourceType,
        resourceId,
        label,
        optionsOverride,
    }: {
        optionName: string
        resourceType: string
        resourceId: string | number
        label: string
        optionsOverride: string
    }) => {
        const mockOptions = {
            [`${optionName}Options`]: [{value: resourceId, label}],
        }

        mockUseAIAgentGetOtherResources.mockReturnValueOnce({
            ...mockUseAIAgentGetOtherResources(
                {} as UseAIAgentGetOtherResourcesProps
            ),
            ...mockOptions,
        })

        return {
            initialValues: [{type: 'resource', resourceId, resourceType}],
            expectedValues: [`${optionsOverride}::${label}`],
        }
    }

    const mockGetResources = {
        articlesOptions: [],
        guidanceOptions: [],
        snippetsOptions: [],
        macrosOptions: [],
        actionsOptions: [],
        isOtherResourceListLoading: false,
        getResourcesFromLabels: jest.fn(),
    }

    beforeEach(() => {
        mockUseAIAgentGetOtherResources.mockReturnValue(mockGetResources)
    })

    const renderComponent = (props = {}) => {
        return render(
            <FeedbackOtherResourcesSelect
                helpCenterId={1}
                guidanceHelpCenterId={2}
                snippetHelpCenterId={3}
                shopName="Test Shop"
                shopType="Test Type"
                initialValues={[]}
                onSubmit={jest.fn()}
                onRemove={jest.fn()}
                {...props}
            />
        )
    }

    it('renders the component correctly with preselected guidance option', async () => {
        renderComponent({
            initialValues: [
                {
                    type: 'resource',
                    resourceId: '20',
                    resourceType: 'guidance',
                },
            ],
        })

        await waitFor(() => {
            expect(screen.getByTestId('tag')).toBeInTheDocument()
        })
    })

    it('renders empty multi select component correctly', () => {
        renderComponent()

        expect(mockChildComponent).toHaveBeenCalledWith(
            expect.objectContaining({
                values: [],
            })
        )
    })

    it('renders multi select component correctly with preselected article option', () => {
        const {initialValues, expectedValues} = setupMockResourcesValues({
            optionName: 'articles',
            resourceType: 'article',
            resourceId: '1',
            label: 'Article Label',
            optionsOverride: 'Knowledge::Help Center articles',
        })

        renderComponent({initialValues})

        expect(mockChildComponent).toHaveBeenCalledWith(
            expect.objectContaining({
                values: expectedValues,
            })
        )
    })

    it('renders multi select component correctly with preselected other option', () => {
        renderComponent({
            initialValues: [
                {type: 'resource', resourceId: '1', resourceType: 'other'},
            ],
        })

        expect(mockChildComponent).toHaveBeenCalledWith(
            expect.objectContaining({
                values: [NO_RELEVANT_RESOURCES_LABEL],
            })
        )
    })

    it('renders multi select component correctly with preselected guidance option', async () => {
        const {initialValues, expectedValues} = setupMockResourcesValues({
            optionName: 'guidance',
            resourceType: 'guidance',
            resourceId: '2',
            label: 'Guidance Label',
            optionsOverride: 'Guidance',
        })

        renderComponent({initialValues})

        await waitFor(() => {
            expect(mockChildComponent).toHaveBeenCalledWith(
                expect.objectContaining({
                    values: expectedValues,
                })
            )
        })
    })

    it('renders multi select component correctly with preselected macro option', async () => {
        const {initialValues, expectedValues} = setupMockResourcesValues({
            optionName: 'macros',
            resourceType: 'macro',
            resourceId: '2',
            label: 'Macro Label',
            optionsOverride: 'Knowledge::Macros',
        })

        renderComponent({initialValues})

        await waitFor(() => {
            expect(mockChildComponent).toHaveBeenCalledWith(
                expect.objectContaining({
                    values: expectedValues,
                })
            )
        })
    })

    it('renders multi select component correctly with preselected snippet option', async () => {
        const {initialValues, expectedValues} = setupMockResourcesValues({
            optionName: 'snippets',
            resourceType: 'external_snippet',
            resourceId: '2',
            label: 'Snippet Label',
            optionsOverride: 'Knowledge::External websites',
        })

        renderComponent({initialValues})

        await waitFor(() => {
            expect(mockChildComponent).toHaveBeenCalledWith(
                expect.objectContaining({
                    values: expectedValues,
                })
            )
        })
    })

    it('renders multi select component correctly with preselected hard action option', async () => {
        const {initialValues, expectedValues} = setupMockResourcesValues({
            optionName: 'actions',
            resourceType: 'hard_action',
            resourceId: 2,
            label: 'Action Label',
            optionsOverride: 'Actions::Hard action',
        })

        renderComponent({initialValues})

        await waitFor(() => {
            expect(mockChildComponent).toHaveBeenCalledWith(
                expect.objectContaining({
                    values: expectedValues,
                })
            )
        })
    })

    it('renders multi select component correctly with preselected soft action option', async () => {
        const {initialValues, expectedValues} = setupMockResourcesValues({
            optionName: 'actions',
            resourceType: 'soft_action',
            resourceId: 2,
            label: 'Action Label',
            optionsOverride: 'Actions::Soft action',
        })

        renderComponent({initialValues})

        await waitFor(() => {
            expect(mockChildComponent).toHaveBeenCalledWith(
                expect.objectContaining({
                    values: expectedValues,
                })
            )
        })
    })

    it('should handle apply correctly for other option', () => {
        const {getByText} = renderComponent({
            initialValues: [
                {type: 'resource', resourceId: '1', resourceType: 'other'},
            ],
        })

        void waitFor(() => {
            fireEvent.click(getByText('Apply'))
            expect(mockDispatch).toHaveBeenCalled()
        })
    })

    it('should handle apply correctly for guidance option', () => {
        const {getByText} = renderComponent({
            initialValues: [
                {type: 'resource', resourceId: '1', resourceType: 'guidance'},
            ],
        })

        fireEvent.click(getByText('Apply'))

        void waitFor(() => {
            expect(mockDispatch).not.toHaveBeenCalled()
        })
    })

    it('should call remove ticket tag when other resource is removed', async () => {
        renderComponent({
            initialValues: [
                {
                    type: 'resource',
                    resourceId: '1',
                    resourceType: 'other',
                },
            ],
        })

        await waitFor(() => {
            expect(screen.getByTestId('tag-trail-icon')).toBeInTheDocument()
            fireEvent.click(screen.getByTestId('tag-trail-icon'))
            expect(mockDispatch).toHaveBeenCalled()
        })
    })

    it('should not call remove ticket tag when guidance resource is removed', async () => {
        renderComponent({
            initialValues: [
                {
                    type: 'resource',
                    resourceId: '20',
                    resourceType: 'guidance',
                },
            ],
        })

        await waitFor(() => {
            expect(screen.getByTestId('tag-trail-icon')).toBeInTheDocument()
            fireEvent.click(screen.getByTestId('tag-trail-icon'))
            expect(mockDispatch).not.toHaveBeenCalled()
        })
    })
})
