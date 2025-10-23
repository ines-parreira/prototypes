import React, { ComponentProps } from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ContentState, EditorState } from 'draft-js'
import { fromJS } from 'immutable'
import _noop from 'lodash/noop'
import { Provider } from 'react-redux'

import { useFlag } from 'core/flags'
import { RichFieldEditor } from 'pages/common/forms/RichField/RichFieldEditor'
import * as utils from 'utils'
import { convertFromHTML } from 'utils/editor'
import { mockStore } from 'utils/testing'

import toolbarPlugin from '../index'
import Toolbar from '../Toolbar'
import ToolbarProvider from '../ToolbarProvider'
import { ActionName } from '../types'

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

const insertTextSpy = jest.spyOn(utils, 'insertText')

// mock random key generation so they match from a snapshot to the other
jest.mock('draft-js/lib/generateRandomKey', () => () => '123')
jest.mock('@repo/utils', () => ({
    ...jest.requireActual('@repo/utils'),
    shortcutManager: {
        bind: jest.fn(),
    },
}))

jest.mock('../components', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...jest.requireActual('../components'),
        AddLink: jest.fn((props: { getWorkflowVariables: () => void }) => (
            <div onClick={props.getWorkflowVariables}>Click me</div>
        )),
    }
})

const mockUseFlag = useFlag as jest.Mock

jest.mock('hooks/useAppSelector')

describe('Toolbar', () => {
    const defaultProps: ComponentProps<typeof RichFieldEditor> &
        Omit<ComponentProps<typeof Toolbar>, 'getEditorState'> = {
        createToolbarPlugin: (imageDecorator) =>
            //@ts-ignore
            toolbarPlugin({
                imageDecorator,
                onLinkEdit: jest.fn(),
                onLinkCreate: jest.fn(),
                getDisplayedActions: jest.fn(),
            }),
        editorState: fromJS({}),
        onFocus: jest.fn(),
        onBlur: jest.fn(),
        detectGrammarly: _noop,
        onChange: jest.fn(),
        linkIsOpen: false,
        linkText: '',
        linkUrl: '',
        linkTarget: '_blank',
        onLinkUrlChange: _noop,
        onLinkTextChange: _noop,
        onLinkOpen: _noop,
        onLinkClose: _noop,
        onLinkTargetChange: _noop,
        canDropFiles: false,
        isRequired: false,
        isFocused: false,
        mentionSearchResults: fromJS({}),
        onMentionSearchChange: jest.fn(),
        attachments: fromJS([]),
        quickReply: null,
        attachFiles: _noop,
        displayedActions: [] as ActionName[],
        setEditorState: jest.fn(),
    }
    let contentState: ContentState
    let editorState: EditorState

    beforeEach(() => {
        contentState = convertFromHTML('<p>foo</p>')
        editorState = EditorState.createWithContent(contentState)
        mockUseFlag.mockReturnValue(false)
    })

    it('should render character count if max length is specified', () => {
        const { container } = render(
            <ToolbarProvider
                canAddProductCard={true}
                onAddProductCardAttachment={jest.fn()}
                canAddDiscountCodeLink={false}
                canAddVideoPlayer={false}
                shopifyIntegrations={fromJS([])}
            >
                <Toolbar
                    maxLength={100}
                    {...defaultProps}
                    editorState={editorState}
                    getEditorState={() => editorState}
                />
            </ToolbarProvider>,
        )

        expect(container).toHaveTextContent(/3\/100/)
    })

    describe('tooltip tour', () => {
        const editorProps: ComponentProps<typeof RichFieldEditor> &
            Omit<ComponentProps<typeof Toolbar>, 'getEditorState'> = {
            ...defaultProps,

            displayedActions: [ActionName.ProductPicker],
            createToolbarPlugin: (imageDecorator) =>
                //@ts-ignore
                toolbarPlugin({
                    imageDecorator,
                    onLinkEdit: jest.fn(),
                    onLinkCreate: jest.fn(),
                    getDisplayedActions: () => [ActionName.ProductPicker],
                }),
        }

        it('should not render tooltip tour', () => {
            const { queryByText } = render(
                <ToolbarProvider
                    canAddProductCard={true}
                    onAddProductCardAttachment={jest.fn()}
                    canAddDiscountCodeLink={true}
                    canAddVideoPlayer={false}
                    shopifyIntegrations={fromJS([{}])}
                    toolbarTour={undefined}
                >
                    <Toolbar
                        maxLength={100}
                        {...editorProps}
                        editorState={editorState}
                        getEditorState={() => editorState}
                    />
                </ToolbarProvider>,
            )

            expect(queryByText('lorem ipsum tooltip')).not.toBeInTheDocument()
        })

        it('should render tooltip tour', () => {
            const { getByText } = render(
                <ToolbarProvider
                    canAddProductCard={true}
                    onAddProductCardAttachment={jest.fn()}
                    canAddDiscountCodeLink={true}
                    canAddVideoPlayer={false}
                    shopifyIntegrations={fromJS([{}])}
                    toolbarTour={{
                        [ActionName.ProductPicker]: {
                            tooltipContent: 'lorem ipsum tooltip',
                        },
                    }}
                >
                    <Toolbar
                        maxLength={100}
                        {...editorProps}
                        editorState={editorState}
                        getEditorState={() => editorState}
                    />
                </ToolbarProvider>,
            )

            expect(getByText('lorem ipsum tooltip')).toBeInTheDocument()
        })

        it('should should use "getWorkflowVariables" prop when passed and link is clicked', () => {
            const getWorkflowVariablesMock = jest.fn()
            render(
                <Provider store={mockStore({})}>
                    <ToolbarProvider
                        canAddProductCard={true}
                        onAddProductCardAttachment={jest.fn()}
                        canAddDiscountCodeLink={true}
                        canAddVideoPlayer={false}
                        shopifyIntegrations={fromJS([{}])}
                    >
                        <Toolbar
                            maxLength={100}
                            {...editorProps}
                            editorState={editorState}
                            getEditorState={() => editorState}
                            displayedActions={[ActionName.Link]}
                            linkIsOpen={true}
                            linkUrl={'https://help.domain.com/article'}
                            getWorkflowVariables={getWorkflowVariablesMock}
                        />
                    </ToolbarProvider>
                </Provider>,
            )
            fireEvent.click(screen.getByText('Click me'))
            expect(getWorkflowVariablesMock).toHaveBeenCalled()
        })

        it('should display guidance action picker when GuidanceAction is passed', () => {
            const mockGuidanceActions = [
                {
                    name: 'TOTO action',
                    value: '00AAAAA7AAA0AAA1A50AAAA00A',
                },
            ]

            mockUseFlag.mockReturnValue(true)

            render(
                <Provider store={mockStore({})}>
                    <ToolbarProvider
                        canAddProductCard={true}
                        onAddProductCardAttachment={jest.fn()}
                        canAddDiscountCodeLink={true}
                        canAddVideoPlayer={false}
                        guidanceActions={mockGuidanceActions}
                        shopifyIntegrations={fromJS([{}])}
                    >
                        <Toolbar
                            maxLength={100}
                            {...editorProps}
                            editorState={editorState}
                            getEditorState={() => editorState}
                            displayedActions={[ActionName.GuidanceAction]}
                            linkIsOpen={true}
                            linkUrl={'https://help.domain.com/article'}
                        />
                    </ToolbarProvider>
                </Provider>,
            )

            fireEvent.click(screen.getByText('Actions'))
            fireEvent.click(screen.getByText('TOTO action'))

            expect(insertTextSpy).toHaveBeenLastCalledWith(
                editorState,
                '$$$00AAAAA7AAA0AAA1A50AAAA00A$$$',
            )
        })

        it('should display guidance action picker disabled with a tooltip when there is no action', async () => {
            mockUseFlag.mockReturnValue(true)

            render(
                <Provider store={mockStore({})}>
                    <ToolbarProvider
                        canAddProductCard={true}
                        onAddProductCardAttachment={jest.fn()}
                        canAddDiscountCodeLink={true}
                        canAddVideoPlayer={false}
                        guidanceActions={[]}
                        shopifyIntegrations={fromJS([{}])}
                        shopName="myshop"
                    >
                        <Toolbar
                            maxLength={100}
                            {...editorProps}
                            editorState={editorState}
                            getEditorState={() => editorState}
                            displayedActions={[ActionName.GuidanceAction]}
                            linkIsOpen={true}
                            linkUrl={'https://help.domain.com/article'}
                        />
                    </ToolbarProvider>
                </Provider>,
            )

            fireEvent.mouseOver(screen.getByText('Actions'))

            await waitFor(() =>
                expect(
                    screen.getByText(
                        'enable at least one Action for AI Agent.',
                        { exact: false },
                    ),
                ).toBeInTheDocument(),
            )
        })
    })
})
