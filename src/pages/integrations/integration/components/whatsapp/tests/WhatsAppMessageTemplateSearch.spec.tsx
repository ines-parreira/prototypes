import {cleanup, fireEvent, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import React from 'react'
import {act} from 'react-dom/test-utils'
import {mockStore} from 'utils/testing'
import useWhatsAppEditor from 'pages/integrations/integration/components/whatsapp/useWhatsAppEditor'
import {renderWithQueryClientProvider} from 'tests/reactQueryTestingUtils'
import WhatsAppMessageTemplateSearch from '../WhatsAppMessageTemplateSearch'

jest.mock(
    'pages/integrations/integration/components/whatsapp/useWhatsAppEditor',
    () => jest.fn()
)

const useWhatsAppEditorSpy = useWhatsAppEditor as jest.Mock

const useWhatsAppEditorMockSetters = {
    setIsTemplateListVisible: jest.fn(),
    setSearchFilter: jest.fn(),
}

jest.useFakeTimers()

jest.mock(
    'pages/tickets/detail/components/ReplyArea/TemplateTypeFilterDropdown',
    () =>
        ({
            ...jest.requireActual(
                'pages/tickets/detail/components/ReplyArea/TemplateTypeFilterDropdown'
            ),
            default: () => <div>TemplateTypeFilterDropdown</div>,
        }) as Record<string, any>
)

describe('WhatsAppMessageTemplateSearch', () => {
    const renderComponent = () =>
        renderWithQueryClientProvider(
            <Provider store={mockStore({} as any)}>
                <WhatsAppMessageTemplateSearch />
            </Provider>
        )

    afterEach(() => {
        cleanup()
        jest.resetAllMocks()
    })

    it('should expand template list when clicking arrow', () => {
        useWhatsAppEditorSpy.mockReturnValue({
            ...useWhatsAppEditorMockSetters,
            isTemplateListVisible: false,
            selectedTemplate: {
                name: 'template',
            },
        } as any)

        renderComponent()
        const arrowButton = screen.getByTestId('arrow-button')
        act(() => {
            fireEvent.click(arrowButton)
        })
        expect(
            useWhatsAppEditorMockSetters.setIsTemplateListVisible
        ).toHaveBeenCalledWith(true)
    })

    it('should collapse template list when clicking arrow', () => {
        useWhatsAppEditorSpy.mockReturnValue({
            ...useWhatsAppEditorMockSetters,
            isTemplateListVisible: true,
            selectedTemplate: {
                name: 'template',
            },
        } as any)

        renderComponent()
        const arrowButton = screen.getByTestId('arrow-button')
        act(() => {
            fireEvent.click(arrowButton)
        })
        expect(
            useWhatsAppEditorMockSetters.setIsTemplateListVisible
        ).toHaveBeenCalledWith(false)
    })

    it('should not be collapsible when a template is not selected', () => {
        useWhatsAppEditorSpy.mockReturnValue({
            ...useWhatsAppEditorMockSetters,
            isTemplateListVisible: false,
            isWhatsAppWindowOpen: false,
            selectedTemplate: null,
        } as any)

        renderComponent()
        expect(screen.queryByTestId('arrow-button')).not.toBeInTheDocument()
    })

    it('should display filters when input is focused', () => {
        useWhatsAppEditorSpy.mockReturnValue({
            ...useWhatsAppEditorMockSetters,
            isTemplateListVisible: false,
            isWhatsAppWindowOpen: false,
            selectedTemplate: null,
        } as any)

        renderComponent()
        act(() => {
            screen
                .getByPlaceholderText('Search WhatsApp templates by name')
                .focus()
        })
        expect(screen.getByTestId('dropdown-filters')).toBeInTheDocument()
    })

    it('should display filters when template list is visible', () => {
        useWhatsAppEditorSpy.mockReturnValue({
            ...useWhatsAppEditorMockSetters,
            isTemplateListVisible: true,
            isWhatsAppWindowOpen: false,
            selectedTemplate: null,
        } as any)

        renderComponent()
        expect(screen.getByTestId('dropdown-filters')).toBeInTheDocument()
    })

    it('should not display TemplateTypeFilterDropdown when WhatsApp window is closed', () => {
        useWhatsAppEditorSpy.mockReturnValue({
            ...useWhatsAppEditorMockSetters,
            isTemplateListVisible: true,
            isWhatsAppWindowOpen: false,
            selectedTemplate: null,
        } as any)

        renderComponent()
        expect(screen.queryByText('TemplateTypeFilterDropdown')).toBeNull()
    })

    it('should display TemplateTypeFilterDropdown when WhatsApp window is open', () => {
        useWhatsAppEditorSpy.mockReturnValue({
            ...useWhatsAppEditorMockSetters,
            isTemplateListVisible: true,
            isWhatsAppWindowOpen: true,
            selectedTemplate: null,
        } as any)

        renderComponent()
        expect(
            screen.getByText('TemplateTypeFilterDropdown')
        ).toBeInTheDocument()
    })

    it('should set template name filter correctly on change', () => {
        useWhatsAppEditorSpy.mockReturnValue({
            ...useWhatsAppEditorMockSetters,
            isTemplateListVisible: true,
            isWhatsAppWindowOpen: true,
            selectedTemplate: null,
        } as any)

        renderComponent()
        const input = screen.getByPlaceholderText(
            'Search WhatsApp templates by name'
        )
        act(() => {
            input.focus()
            fireEvent.change(input, {target: {value: 'test'}})
        })

        // wait for 350ms debounce
        jest.advanceTimersByTime(350)

        expect(
            useWhatsAppEditorMockSetters.setSearchFilter
        ).toHaveBeenCalledWith({
            language: [],
            name: 'test',
        })
    })
})
