import React, {ComponentProps} from 'react'
import {mount, shallow} from 'enzyme'
import _noop from 'lodash/noop'
import _omit from 'lodash/omit'
import {ContentState, EditorState} from 'draft-js'
import {convertToHTML} from 'draft-convert'
import Editor from 'draft-js-plugins-editor'
import {fromJS} from 'immutable'

import {convertFromHTML} from 'utils/editor'

import {FeatureFlagKey} from 'config/featureFlags'
import {getLDClient} from 'utils/launchDarkly'
import {TicketChannel} from 'business/types/ticket'
import {RichFieldEditor} from '../RichFieldEditor'
import toolbarPlugin from '../../../draftjs/plugins/toolbar/index'
import provideToolbarPlugin from '../provideToolbarPlugin'

// mock random key generation so they match from a snapshot to the other
jest.mock('draft-js/lib/generateRandomKey', () => () => '123')

jest.mock('utils/launchDarkly')
const allFlagsMock = getLDClient().allFlags as jest.Mock
allFlagsMock.mockReturnValue({[FeatureFlagKey.ChatVideoSharingExtra]: true})

describe('RichFieldEditor', () => {
    const defaultProps: ComponentProps<typeof RichFieldEditor> = {
        createToolbarPlugin: (imageDecorator) =>
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
        isRequired: false,
        isFocused: false,
        mentionSearchResults: fromJS({}),
        onMentionSearchChange: jest.fn(),
        currentAccount: fromJS({}),
        ticket: fromJS({}),
        isNewMessagePublic: false,
        newMessageChannel: TicketChannel.Email,
        dispatch: jest.fn(),
    }
    let contentState: ContentState
    let editorState: EditorState

    beforeEach(() => {
        jest.clearAllMocks()
        contentState = convertFromHTML('<p>foo</p>')
        editorState = EditorState.createWithContent(contentState)
    })

    // Note: functional test candidate
    it('should keep existing content and newlines when pasting text', () => {
        const spyOnchange = jest.fn()
        contentState = convertFromHTML('html')
        editorState = EditorState.createWithContent(contentState)
        editorState = EditorState.moveFocusToEnd(editorState)
        const component = mount<RichFieldEditor>(
            <RichFieldEditor
                {...defaultProps}
                editorState={editorState}
                onChange={spyOnchange}
            />
        )
        const text = 'a\n\nb\n\nc'
        const html = '<div>a<br><br>b<br><br>c</div>'

        const instanceComponent = component.instance()
        // simulate pasted text
        instanceComponent._handlePastedText(text, html, editorState)
        const lastCall: EditorState[] =
            spyOnchange.mock.calls[spyOnchange.mock.calls.length - 1]

        const convertedHTML = convertToHTML(lastCall[0].getCurrentContent())
        expect(convertedHTML).toBe('<p>htmla<br/><br/>b<br/><br/>c</p>')
    })

    // tests the newline-doubling bug when copying and pasting content from draft-js
    // https://github.com/gorgias/gorgias/pull/3373#issuecomment-392855428
    // Note: functional test candidate
    it('should not handle html when pasting draft-js-specific content', () => {
        const onChangeSpy = jest.fn()
        contentState = convertFromHTML('html')
        editorState = EditorState.createWithContent(contentState)
        editorState = EditorState.moveFocusToEnd(editorState)
        const component = mount<RichFieldEditor>(
            <RichFieldEditor
                {...defaultProps}
                editorKey="editor"
                editorState={editorState}
                onChange={onChangeSpy}
            />
        )
        const text = 'a\n\nb\n\nc'
        // html copied from draft-js contains the data-editor=editorKey attribute
        const html =
            '<div data-editor="editor"><div>a<br><br>b<br><br>c</div></div>'
        // simulate pasted text

        component.instance()._handlePastedText(text, html, editorState)

        const [newContentState]: EditorState[] =
            onChangeSpy.mock.calls[onChangeSpy.mock.calls.length - 1]
        const convertedHTML = convertToHTML(newContentState.getCurrentContent())
        // we can't simulate the paste event, so we test for unmodified content
        expect(convertedHTML).toBe('<p>html</p>')
    })

    it('should focus the end of input on initial focus', () => {
        const onFocus = jest.fn()
        const component = shallow(
            <RichFieldEditor
                {...defaultProps}
                editorKey="editor"
                editorState={editorState}
                onFocus={onFocus}
            />
        )

        expect(component).toMatchSnapshot()
        expect(component.state('wasEverFocused')).toBe(false)
        component.find(Editor).simulate('focus')
        expect(onFocus).toBeCalled()
        component.setProps({isFocused: true})
        expect(component.state('wasEverFocused')).toBe(true)
        expect(defaultProps.onChange).toBeCalledWith(
            expect.objectContaining(EditorState.moveFocusToEnd(editorState))
        )
    })

    describe('should call detect grammarly when editor is focused', () => {
        const onFocus = jest.fn()
        const detectGrammarly = jest.fn()

        const component = shallow(
            <RichFieldEditor
                {...defaultProps}
                editorKey="editor"
                editorState={editorState}
                onFocus={onFocus}
                detectGrammarly={detectGrammarly}
            />
        )

        component.find(Editor).simulate('focus')
        expect(detectGrammarly).toBeCalledTimes(1)
    })

    it('should handle shortcuts', () => {
        const spyOnchange = jest.fn()

        const WrappedRichFieldEditor = provideToolbarPlugin(RichFieldEditor)
        const component = mount(
            <WrappedRichFieldEditor
                {..._omit(defaultProps, 'createToolbarPlugin')}
                editorKey="editor"
                editorState={editorState}
                onChange={spyOnchange}
            />
        )

        component
            .find('.public-DraftEditor-content')
            .simulate('keyDown', {ctrlKey: true, key: 'b', keyCode: 66})
        expect(spyOnchange.mock.calls).toMatchSnapshot()
    })

    it('should insert a video preview when pasting a compatible video link when channel is chat', () => {
        const onChangeSpy = jest.fn()
        contentState = convertFromHTML('html')
        editorState = EditorState.createWithContent(contentState)
        editorState = EditorState.moveFocusToEnd(editorState)
        const component = mount<RichFieldEditor>(
            <RichFieldEditor
                {...defaultProps}
                editorKey="editor"
                editorState={editorState}
                onChange={onChangeSpy}
                newMessageChannel={TicketChannel.Chat}
                isNewMessagePublic={true}
            />
        )
        const text = 'https://www.youtube.com/watch?v=4sLFpe-xbhk'
        const html = undefined
        // simulate pasted text
        component.instance()._handlePastedText(text, html, editorState)

        const [newContentState]: EditorState[] =
            onChangeSpy.mock.calls[onChangeSpy.mock.calls.length - 1]
        const convertedHTML = convertToHTML(newContentState.getCurrentContent())
        // we can't simulate the paste event, so we test for unmodified content
        expect(convertedHTML).toBe('<figure></figure>')
    })

    it('should NOT insert a video preview when pasting a compatible video link when channel is mail', () => {
        const onChangeSpy = jest.fn()
        contentState = convertFromHTML('html')
        editorState = EditorState.createWithContent(contentState)
        editorState = EditorState.moveFocusToEnd(editorState)
        const component = mount<RichFieldEditor>(
            <RichFieldEditor
                {...defaultProps}
                editorKey="editor"
                editorState={editorState}
                onChange={onChangeSpy}
                newMessageChannel={TicketChannel.Email}
                isNewMessagePublic={true}
            />
        )
        const text = 'https://www.youtube.com/watch?v=4sLFpe-xbhk'
        const html = undefined
        // simulate pasted text
        component.instance()._handlePastedText(text, html, editorState)

        const [newContentState]: EditorState[] =
            onChangeSpy.mock.calls[onChangeSpy.mock.calls.length - 1]
        const convertedHTML = convertToHTML(newContentState.getCurrentContent())
        // we can't simulate the paste event, so we test for unmodified content
        expect(convertedHTML).toBe(
            '<p>htmlhttps://www.youtube.com/watch?v=4sLFpe-xbhk</p>'
        )
    })
})
