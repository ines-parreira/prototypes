import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'

import { mockStore } from 'utils/testing'

import HelpCenterEditor from '../HelpCenterEditor'

const mockUseCurrentHelpCenter = jest.fn()
const mockUseEditionManager = jest.fn()
const mockUseAppDispatch = jest.fn()

jest.mock('pages/settings/helpCenter/hooks/useCurrentHelpCenter', () => ({
    __esModule: true,
    default: () => mockUseCurrentHelpCenter(),
}))

jest.mock('pages/settings/helpCenter/providers/EditionManagerContext', () => ({
    useEditionManager: () => mockUseEditionManager(),
}))

jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    default: () => mockUseAppDispatch(),
}))

jest.mock('../FroalaEditorComponent', () => {
    return function MockFroalaEditorComponent(props: any) {
        return (
            <div
                data-testid="froala-editor"
                data-config={JSON.stringify(props.config)}
            >
                Mocked Froala Editor
            </div>
        )
    }
})

jest.mock('../froala-config', () => {
    const originalModule = jest.requireActual('../froala-config')
    return {
        ...originalModule,
    }
})

describe('HelpCenterEditor', () => {
    const mockDispatch = jest.fn()

    const defaultProps = {
        locale: 'en-US' as const,
        value: 'Test content',
        onChange: jest.fn(),
    }

    const renderComponent = (props = {}) => {
        const store = mockStore({})
        const queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        })

        return render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <HelpCenterEditor {...defaultProps} {...props} />
                </QueryClientProvider>
            </Provider>,
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseCurrentHelpCenter.mockReturnValue({
            id: 1,
            layout: 'normal',
        })
        mockUseEditionManager.mockReturnValue({
            setIsEditorCodeViewActive: jest.fn(),
        })
        mockUseAppDispatch.mockReturnValue(mockDispatch)
    })

    describe('XS Layout Configuration', () => {
        // Extract button configurations to find differences between layouts
        const { config, configXS } = jest.requireActual('../froala-config')

        const normalLayoutButtons: string[] =
            config.toolbarButtons.moreText.buttons.filter(
                (button: string | object) => typeof button === 'string',
            )

        const xsLayoutButtons: string[] =
            configXS.toolbarButtons.moreText.buttons.filter(
                (button: string | object) => typeof button === 'string',
            )

        const NORMAL_LAYOUT_ONLY_BUTTONS = normalLayoutButtons.filter(
            (button: string) => !xsLayoutButtons.includes(button),
        )

        describe('when useXSLayout is false', () => {
            it('should include all toolbar buttons including normal layout specific ones', () => {
                const { getByTestId } = renderComponent({ useXSLayout: false })

                const froalaEditor = getByTestId('froala-editor')
                const config = JSON.parse(
                    froalaEditor.getAttribute('data-config') || '{}',
                )

                const toolbarButtons =
                    config.toolbarButtons?.moreText?.buttons || []

                NORMAL_LAYOUT_ONLY_BUTTONS.forEach((buttonName) => {
                    expect(toolbarButtons).toContain(buttonName)
                })
            })
        })

        describe('when useXSLayout is true', () => {
            it('should exclude normal layout specific toolbar buttons', () => {
                const { getByTestId } = renderComponent({ useXSLayout: true })

                const froalaEditor = getByTestId('froala-editor')
                const config = JSON.parse(
                    froalaEditor.getAttribute('data-config') || '{}',
                )

                const toolbarButtons =
                    config.toolbarButtons?.moreText?.buttons || []

                NORMAL_LAYOUT_ONLY_BUTTONS.forEach((buttonName) => {
                    expect(toolbarButtons).not.toContain(buttonName)
                })
            })
        })

        describe('when useXSLayout is undefined', () => {
            it('should default to normal layout and include all toolbar buttons', () => {
                const { getByTestId } = renderComponent()

                const froalaEditor = getByTestId('froala-editor')
                const config = JSON.parse(
                    froalaEditor.getAttribute('data-config') || '{}',
                )

                const toolbarButtons =
                    config.toolbarButtons?.moreText?.buttons || []

                NORMAL_LAYOUT_ONLY_BUTTONS.forEach((buttonName) => {
                    expect(toolbarButtons).toContain(buttonName)
                })
            })
        })

        describe('common buttons in both layouts', () => {
            const SHARED_BUTTONS = xsLayoutButtons

            it('should include common buttons in normal layout', () => {
                const { getByTestId } = renderComponent({ useXSLayout: false })

                const froalaEditor = getByTestId('froala-editor')
                const config = JSON.parse(
                    froalaEditor.getAttribute('data-config') || '{}',
                )

                const toolbarButtons =
                    config.toolbarButtons?.moreText?.buttons || []

                SHARED_BUTTONS.forEach((buttonName: string) => {
                    expect(toolbarButtons).toContain(buttonName)
                })
            })

            it('should include common buttons in XS layout', () => {
                const { getByTestId } = renderComponent({ useXSLayout: true })

                const froalaEditor = getByTestId('froala-editor')
                const config = JSON.parse(
                    froalaEditor.getAttribute('data-config') || '{}',
                )

                const toolbarButtons =
                    config.toolbarButtons?.moreText?.buttons || []

                SHARED_BUTTONS.forEach((buttonName: string) => {
                    expect(toolbarButtons).toContain(buttonName)
                })
            })
        })
    })
})
