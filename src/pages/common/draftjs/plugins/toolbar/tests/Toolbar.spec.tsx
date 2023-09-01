import React, {ComponentProps} from 'react'

import _noop from 'lodash/noop'
import {ContentState, EditorState} from 'draft-js'
import {fromJS} from 'immutable'

import {render} from '@testing-library/react'
import {convertFromHTML} from 'utils/editor'

import {RichFieldEditor} from 'pages/common/forms/RichField/RichFieldEditor'
import toolbarPlugin from '../index'
import Toolbar from '../Toolbar'
import ToolbarProvider from '../ToolbarProvider'
import {ActionName} from '../types'

// mock random key generation so they match from a snapshot to the other
jest.mock('draft-js/lib/generateRandomKey', () => () => '123')
jest.mock('services/shortcutManager/shortcutManager')

// TODO: cover me with more tests
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
        onLinkUrlChange: _noop,
        onLinkTextChange: _noop,
        onLinkOpen: _noop,
        onLinkClose: _noop,
        canDropFiles: false,
        isRequired: false,
        isFocused: false,
        mentionSearchResults: fromJS({}),
        onMentionSearchChange: jest.fn(),
        attachments: fromJS([]),
        quickReply: null,
        attachFiles: _noop,
        displayedActions: [] as ActionName[],
        setEditorState: _noop,
    }
    let contentState: ContentState
    let editorState: EditorState

    beforeEach(() => {
        contentState = convertFromHTML('<p>foo</p>')
        editorState = EditorState.createWithContent(contentState)
    })

    it('should render character count if max length is specified', () => {
        const {container} = render(
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
            </ToolbarProvider>
        )

        expect(container).toHaveTextContent(/3\/100/)
    })
})
