import { ReactNode } from 'react'

import { assumeMock, userEvent } from '@repo/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    useAIAgentGetOtherResources,
    UseAIAgentGetOtherResourcesProps,
} from 'pages/tickets/detail/hooks/useAIAgentGetOtherResources'

import { MultiLevelSelectProps } from '../Deprecated_MultiLevelSelect/Deprecated_MultiLevelSelect'
import FeedbackOtherResourcesSelect, {
    NO_RELEVANT_RESOURCES_LABEL,
} from '../FeedbackOtherResourcesSelect'

jest.mock('pages/tickets/detail/hooks/useAIAgentGetOtherResources')
jest.mock('state/ticket/actions')
jest.mock('hooks/useAppDispatch')
jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useElementSize: jest
        .fn()
        .mockImplementation(() => ({ width: 100, height: 100 })),
}))
jest.mock('common/segment/segment')

const mockDispatch = jest.fn()
assumeMock(useAppDispatch).mockReturnValue(mockDispatch)
const mockUseAIAgentGetOtherResources = assumeMock(useAIAgentGetOtherResources)

const mockChildComponent = jest.fn()
jest.mock(
    '../Deprecated_MultiLevelSelect/Deprecated_MultiLevelSelect',
    () => (props: MultiLevelSelectProps) => {
        mockChildComponent(props)
        return (
            <div>
                <button onClick={props.onApplyClick}>Apply</button>
            </div>
        )
    },
)

jest.mock('@gorgias/merchant-ui-kit', () => {
    return {
        ...jest.requireActual('@gorgias/merchant-ui-kit'),
        Tooltip: ({ children }: { children: ReactNode }) => (
            <div>TooltipMock{children}</div>
        ),
    } as Record<string, unknown>
})

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
            [`${optionName}Options`]: [{ value: resourceId, label }],
        } as unknown as ReturnType<typeof useAIAgentGetOtherResources>

        mockUseAIAgentGetOtherResources.mockReturnValue({
            ...mockUseAIAgentGetOtherResources(
                {} as UseAIAgentGetOtherResourcesProps,
            ),
            ...mockOptions,
        })

        return {
            initialValues: [{ type: 'resource', resourceId, resourceType }],
            expectedValues: [`${optionsOverride}::${label}`],
        }
    }

    const mockGetResources = {
        articlesOptions: [],
        guidanceOptions: [],
        snippetsOptions: [],
        fileSnippetsOptions: [],
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
                accountId={1}
                {...props}
            />,
        )
    }

    it('renders the component correctly with preselected guidance option', () => {
        const label = 'Guidance Label'
        const { initialValues } = setupMockResourcesValues({
            optionName: 'guidance',
            resourceType: 'guidance',
            resourceId: '20',
            label,
            optionsOverride: 'Guidance',
        })

        renderComponent({
            initialValues,
        })

        expect(screen.getByText(label)).toBeInTheDocument()
    })

    it('renders empty multi select component correctly', () => {
        renderComponent()

        expect(mockChildComponent).toHaveBeenCalledWith(
            expect.objectContaining({
                values: [],
            }),
        )
    })

    it('renders multi select component correctly with preselected article option', () => {
        const { initialValues, expectedValues } = setupMockResourcesValues({
            optionName: 'articles',
            resourceType: 'article',
            resourceId: '1',
            label: 'Article Label',
            optionsOverride: 'Knowledge::Help Center articles',
        })

        renderComponent({ initialValues })

        expect(mockChildComponent).toHaveBeenCalledWith(
            expect.objectContaining({
                values: expectedValues,
            }),
        )
    })

    it('renders multi select component correctly with preselected other option', () => {
        renderComponent({
            initialValues: [
                { type: 'resource', resourceId: '1', resourceType: 'other' },
            ],
        })

        expect(mockChildComponent).toHaveBeenCalledWith(
            expect.objectContaining({
                values: [NO_RELEVANT_RESOURCES_LABEL],
            }),
        )
    })

    it('renders multi select component correctly with preselected guidance option', async () => {
        const { initialValues, expectedValues } = setupMockResourcesValues({
            optionName: 'guidance',
            resourceType: 'guidance',
            resourceId: '2',
            label: 'Guidance Label',
            optionsOverride: 'Guidance',
        })

        renderComponent({ initialValues })

        await waitFor(() => {
            expect(mockChildComponent).toHaveBeenCalledWith(
                expect.objectContaining({
                    values: expectedValues,
                }),
            )
        })
    })

    it('renders multi select component correctly with preselected macro option', async () => {
        const { initialValues, expectedValues } = setupMockResourcesValues({
            optionName: 'macros',
            resourceType: 'macro',
            resourceId: '2',
            label: 'Macro Label',
            optionsOverride: 'Knowledge::Macros',
        })

        renderComponent({ initialValues })

        await waitFor(() => {
            expect(mockChildComponent).toHaveBeenCalledWith(
                expect.objectContaining({
                    values: expectedValues,
                }),
            )
        })
    })

    it('renders multi select component correctly with preselected snippet option', async () => {
        const { initialValues, expectedValues } = setupMockResourcesValues({
            optionName: 'snippets',
            resourceType: 'external_snippet',
            resourceId: '2',
            label: 'Snippet Label',
            optionsOverride: 'Knowledge::External websites',
        })

        renderComponent({ initialValues })

        await waitFor(() => {
            expect(mockChildComponent).toHaveBeenCalledWith(
                expect.objectContaining({
                    values: expectedValues,
                }),
            )
        })
    })

    it('renders multi select component correctly with preselected file external snippet option', async () => {
        const { initialValues, expectedValues } = setupMockResourcesValues({
            optionName: 'fileSnippets',
            resourceType: 'file_external_snippet',
            resourceId: '2',
            label: 'File Snippet Label',
            optionsOverride: 'Knowledge::External files',
        })

        renderComponent({ initialValues })

        await waitFor(() => {
            expect(mockChildComponent).toHaveBeenCalledWith(
                expect.objectContaining({
                    values: expectedValues,
                }),
            )
        })
    })

    it('renders multi select component correctly with preselected hard action option', async () => {
        const { initialValues, expectedValues } = setupMockResourcesValues({
            optionName: 'actions',
            resourceType: 'hard_action',
            resourceId: 2,
            label: 'Action Label',
            optionsOverride: 'Actions::Hard action',
        })

        renderComponent({ initialValues })

        await waitFor(() => {
            expect(mockChildComponent).toHaveBeenCalledWith(
                expect.objectContaining({
                    values: expectedValues,
                }),
            )
        })
    })

    it('renders multi select component correctly with preselected soft action option', async () => {
        const { initialValues, expectedValues } = setupMockResourcesValues({
            optionName: 'actions',
            resourceType: 'soft_action',
            resourceId: 2,
            label: 'Action Label',
            optionsOverride: 'Actions::Soft action',
        })

        renderComponent({ initialValues })

        await waitFor(() => {
            expect(mockChildComponent).toHaveBeenCalledWith(
                expect.objectContaining({
                    values: expectedValues,
                }),
            )
        })
    })

    it('should handle apply correctly for other option', () => {
        const { getByText } = renderComponent({
            initialValues: [
                { type: 'resource', resourceId: '1', resourceType: 'other' },
            ],
        })

        void waitFor(() => {
            fireEvent.click(getByText('Apply'))
            expect(mockDispatch).toHaveBeenCalled()
        })
    })

    it('should handle apply correctly for guidance option', () => {
        const { getByText } = renderComponent({
            initialValues: [
                { type: 'resource', resourceId: '1', resourceType: 'guidance' },
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
            fireEvent.click(screen.getByText('close'))
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
            fireEvent.click(screen.getByText('close'))
            expect(mockDispatch).not.toHaveBeenCalled()
        })
    })

    it('renders tag tooltip', async () => {
        let mockValue = 0
        jest.spyOn(
            HTMLElement.prototype,
            'offsetWidth',
            'get',
        ).mockImplementation(() => {
            mockValue += 5
            return mockValue
        })
        jest.spyOn(
            HTMLElement.prototype,
            'scrollWidth',
            'get',
        ).mockImplementation(() => {
            mockValue += 5
            return mockValue
        })

        const label = 'overflowing label'
        const { initialValues } = setupMockResourcesValues({
            optionName: 'guidance',
            resourceType: 'guidance',
            resourceId: '20',
            label,
            optionsOverride: 'Guidance',
        })

        renderComponent({
            initialValues,
        })

        await waitFor(() => {
            userEvent.hover(screen.getByText(label))
            expect(screen.getByText(`TooltipMock${label}`)).toBeInTheDocument()
        })
    })

    it("doesn't render tag tooltip", async () => {
        jest.spyOn(
            HTMLElement.prototype,
            'offsetWidth',
            'get',
        ).mockImplementation(() => 0)
        jest.spyOn(
            HTMLElement.prototype,
            'scrollWidth',
            'get',
        ).mockImplementation(() => 0)

        const label = 'label without tooltip'
        const { initialValues } = setupMockResourcesValues({
            optionName: 'guidance',
            resourceType: 'guidance',
            resourceId: '20',
            label,
            optionsOverride: 'Guidance',
        })

        renderComponent({
            initialValues,
        })

        await waitFor(() => {
            userEvent.hover(screen.getByText(label))
            expect(
                screen.queryByText(`TooltipMock${label}`),
            ).not.toBeInTheDocument()
        })
    })
})
