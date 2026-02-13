import type { ComponentProps } from 'react'
import React from 'react'

import { useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContentState, EditorState, Modifier, SelectionState } from 'draft-js'
import _noop from 'lodash/noop'
import ReactPlayer from 'react-player'

import { utmConfiguration } from 'fixtures/utmConfiguration'
import * as draftjsPluginsUtils from 'pages/common/draftjs/plugins/utils'
import { useCampaignFormContext } from 'pages/convert/campaigns/hooks/useCampaignFormContext'
import type { CampaignFormConfigurationType } from 'pages/convert/campaigns/providers/CampaignDetailsForm/configurationContext'
import { attachUtmToUrl } from 'pages/convert/campaigns/utils/attachUtmParams'
import * as editorUtils from 'utils/editor'

import ToolbarProvider from '../../ToolbarProvider'
import { AddLinkContainer } from '../AddLink'

jest.mock('@repo/feature-flags')
const useFlagMock = assumeMock(useFlag)

jest.mock('pages/convert/campaigns/utils/attachUtmParams')
jest.mock('pages/convert/campaigns/hooks/useCampaignFormContext')
const useCampaignFormContextMock: jest.MockedFunction<
    () => Pick<CampaignFormConfigurationType, 'utmConfiguration'>
> = assumeMock(useCampaignFormContext)
const attachUtmtoUrlMock = assumeMock(attachUtmToUrl)

const mockOnClose = jest.fn()
function AddLinkWithIsOpenState(
    props: ComponentProps<typeof AddLinkContainer>,
) {
    const [isOpen, setIsOpen] = React.useState(false)
    return (
        <AddLinkContainer
            {...props}
            onClose={() => {
                setIsOpen(false)
            }}
            onOpen={() => setIsOpen(true)}
            isOpen={isOpen}
        />
    )
}

describe('<AddLink />', () => {
    beforeEach(() => {
        useCampaignFormContextMock.mockReturnValue({
            utmConfiguration: utmConfiguration,
        })
        attachUtmtoUrlMock.mockReturnValue('')
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    const defaultProps = {
        isOpen: true,
        getEditorState: () => EditorState.createEmpty(),
        setEditorState: _noop,
        onClose: mockOnClose,
        onOpen: _noop,
        onTextChange: _noop,
        onUrlChange: _noop,
        text: '',
        url: '',
        linkEditionStarted: jest.fn(),
        linkEditionEnded: jest.fn(),
        canAddVideoPlayer: false,
        onInsertVideoAddedFromInsertLink: jest.fn(),
    } as unknown as ComponentProps<typeof AddLinkContainer>

    it('should allow to submit a valid url', () => {
        const { getByText, getByRole } = render(
            <AddLinkWithIsOpenState
                {...defaultProps}
                text="foo"
                url="http://gorgias.io"
            />,
        )

        act(() => {
            fireEvent.click(getByText(/link/))
        })

        const button = getByRole('button', {
            name: 'Insert Link',
        })
        expect(button).toHaveAttribute('aria-disabled', 'false')
    })

    it('should allow to submit a url without the protocol', () => {
        const { getByText, getByRole } = render(
            <AddLinkWithIsOpenState
                {...defaultProps}
                text="foo"
                url="gorgias.io"
            />,
        )

        act(() => {
            fireEvent.click(getByText(/link/))
        })

        const button = getByRole('button', {
            name: 'Insert Link',
        })
        expect(button).toHaveAttribute('aria-disabled', 'false')
    })

    it('should NOT allow to submit an invalid url', () => {
        const { getByText, getByRole } = render(
            <AddLinkWithIsOpenState
                {...defaultProps}
                text="foo"
                url="bar{{ticket.url_something}}"
            />,
        )
        act(() => {
            fireEvent.click(getByText(/link/))
        })

        const button = getByRole('button', {
            name: 'Insert Link',
        })
        expect(button).toHaveAttribute('aria-disabled', 'true')
    })

    it('should allow to submit templated url', () => {
        const { getByText, getByRole } = render(
            <AddLinkWithIsOpenState
                {...defaultProps}
                text="foo"
                url="{{ticket.url_something}}"
            />,
        )

        act(() => {
            fireEvent.click(getByText(/link/))
        })

        const button = getByRole('button', {
            name: 'Insert Link',
        })
        expect(button).toHaveAttribute('aria-disabled', 'false')
    })

    it('should remove link if there is an entity key', () => {
        const dummyUrl = 'https://foo.bar'
        const editorState = defaultProps.getEditorState()
        const contentState = editorState.getCurrentContent()
        const contentStateWithEntity = contentState.createEntity(
            'link', // Entity type
            'MUTABLE', // Mutability
            { url: dummyUrl }, // Data
        )
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
        jest.spyOn(editorUtils, 'getSelectedEntityKey').mockReturnValue(
            entityKey,
        )
        const mockRemoveLink = jest.spyOn(draftjsPluginsUtils, 'removeLink')

        const { getByText } = render(
            <AddLinkWithIsOpenState
                {...defaultProps}
                url={dummyUrl}
                text="foo"
            />,
        )
        getByText(/link/).click()

        expect(mockRemoveLink).toBeCalled()
    })

    it('should update the link if its different from the one in text', async () => {
        const editorState = defaultProps.getEditorState()
        const contentState = editorState.getCurrentContent()
        const contentStateWithEntity = contentState.createEntity(
            'link', // Entity type
            'MUTABLE', // Mutability
            { url: 'https://foo.bar' }, // Data
        )
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey()

        const { getByText } = render(
            <AddLinkWithIsOpenState
                {...defaultProps}
                entityKey={entityKey}
                url="https://new.url.com"
                text="New URL"
            />,
        )
        await userEvent.click(getByText('link'))
        await userEvent.click(getByText('Update Link'))
    })

    it.each(['Enter', 'Escape'])(
        'should close when pressing enter or escape',
        (inputKey) => {
            const mockOnClose = jest.fn()

            const Wrapped = () => {
                const [isOpen, setIsOpen] = React.useState(false)
                return (
                    <AddLinkContainer
                        {...defaultProps}
                        onClose={mockOnClose}
                        onOpen={() => setIsOpen(true)}
                        isOpen={isOpen}
                        text="Foo"
                        url="https://foo.bar"
                    />
                )
            }
            const { getByLabelText } = render(<Wrapped />)

            act(() => {
                fireEvent.click(screen.getByText(/link/))
            })
            fireEvent.keyDown(getByLabelText('Link text'), { key: inputKey })

            expect(mockOnClose).toBeCalled()
        },
    )

    it('should be able to navigate between URL and UTM tabs', () => {
        useFlagMock.mockReturnValue(true)
        const { getByText, getAllByRole } = render(
            <ToolbarProvider canAddUtm>
                <AddLinkWithIsOpenState {...defaultProps} />
            </ToolbarProvider>,
        )
        fireEvent.click(getByText(/link/))

        act(() => {
            getAllByRole('tab')[1].focus()
        })
        getByText('Enable UTM tracking').focus()
        act(() => {
            getAllByRole('tab')[0].focus()
        })
        getByText('Insert Link').focus()
    })

    it('should navigate to url tab when utm apply is clicked', async () => {
        useFlagMock.mockReturnValue(true)
        const { getByText, getAllByRole } = render(
            <ToolbarProvider canAddUtm>
                <AddLinkWithIsOpenState {...defaultProps} />
            </ToolbarProvider>,
        )
        fireEvent.click(getByText(/link/))

        act(() => {
            getAllByRole('tab')[1].focus()
        })
        act(() => {
            getByText('Apply').click()
        })
        await waitFor(() => getByText('Insert Link').focus())
    })

    it('should replace the querystring when utm is enabled and has a applied valid utm configuration', () => {
        const baseUrl = 'https://foo.bar'
        const baseUtmQueryString = '?foo=bar'
        useCampaignFormContextMock.mockReturnValue({
            utmConfiguration: {
                ...utmConfiguration,
                appliedUtmQueryString: baseUtmQueryString,
            },
        })
        const { getByText } = render(
            <ToolbarProvider canAddUtm>
                <AddLinkWithIsOpenState
                    {...defaultProps}
                    text="Foo"
                    url={baseUrl}
                />
            </ToolbarProvider>,
        )
        act(() => {
            fireEvent.click(getByText(/link/))
        })
        act(() => {
            fireEvent.click(getByText(/Insert Link/))
        })

        expect(attachUtmtoUrlMock).toHaveBeenCalledWith(
            baseUrl,
            '',
            true,
            true,
            baseUtmQueryString,
        )
    })

    it('shouldnt call the link utm udate if the flag is off', () => {
        const baseUrl = 'https://foo.bar'
        const baseUtmQueryString = '?foo=bar'
        useCampaignFormContextMock.mockReturnValue({
            utmConfiguration: {
                ...utmConfiguration,
                utmQueryString: baseUtmQueryString,
            },
        })
        const { getByText } = render(
            <ToolbarProvider canAddUtm={false}>
                <AddLinkWithIsOpenState
                    {...defaultProps}
                    text="Foo"
                    url={baseUrl}
                />
            </ToolbarProvider>,
        )
        act(() => {
            fireEvent.click(getByText(/link/))
        })
        act(() => {
            fireEvent.click(getByText(/Insert Link/))
        })

        expect(attachUtmtoUrlMock).not.toHaveBeenCalled()
    })

    it('should allow to submit an url with a variable', () => {
        const { getByText, getByRole } = render(
            <AddLinkWithIsOpenState
                {...defaultProps}
                text="foo"
                url="http://google.com/?email={{message.customer.email}}"
            />,
        )
        act(() => {
            fireEvent.click(getByText(/link/))
        })

        const button = getByRole('button', {
            name: 'Insert Link',
        })
        expect(button).toHaveAttribute('aria-disabled', 'false')
    })

    it('should add a video at the bottom when URL is compatible and under a chat channel', () => {
        const addVideoSpy = jest
            .spyOn(draftjsPluginsUtils, 'addVideo')
            .mockImplementation((editorState) => editorState)

        const { getByText } = render(
            <AddLinkWithIsOpenState
                {...defaultProps}
                canAddVideoPlayer
                text="foo"
                url="https://www.youtube.com/watch?v=4sLFpe-xbhk"
            />,
            {
                container: document.body,
            },
        )
        fireEvent.click(screen.getByText(/link/))
        fireEvent.click(getByText(/Insert Link/))

        expect(addVideoSpy).toHaveBeenCalled()
    })

    it('should not add a video at the bottom when URL is compatible because channel is not chat', () => {
        const addVideoSpy = jest
            .spyOn(draftjsPluginsUtils, 'addVideo')
            .mockImplementation(jest.fn())

        jest.spyOn(draftjsPluginsUtils, 'addVideo').mockImplementation(
            jest.fn(),
        )

        render(
            <AddLinkWithIsOpenState
                {...defaultProps}
                canAddVideoPlayer={false}
                text="foo"
                url="https://www.youtube.com/watch?v=4sLFpe-xbhk"
            />,
        )
        fireEvent.click(screen.getByText(/link/))
        fireEvent.click(screen.getByText(/Insert Link/))

        expect(addVideoSpy).not.toHaveBeenCalled()
    })

    it('should render TextInputWithVariables when workflowVariables are provided', async () => {
        render(
            <AddLinkWithIsOpenState
                {...defaultProps}
                canAddVideoPlayer={false}
                text="foo"
                getWorkflowVariables={() => [
                    {
                        type: 'string',
                        name: 'ticket.url_something',
                        nodeType: 'text_reply',
                        value: 'value',
                    },
                ]}
            />,
        )
        fireEvent.click(screen.getByText(/link/))

        await act(async () => {
            await waitFor(() => {
                expect(
                    screen.getByText('https://help.domain.com'),
                ).toBeInTheDocument()
                expect(
                    screen.queryByText('https://help.domain.com/article'),
                ).not.toBeInTheDocument()
                expect(screen.getByText(`{+}`)).toBeInTheDocument()
            })
        })
    })

    it('should set toggle guard if "workflowVariables" are provided', async () => {
        const onOpenMock = jest.fn()

        render(
            <AddLinkWithIsOpenState
                {...defaultProps}
                canAddVideoPlayer={false}
                text="foo"
                onOpen={onOpenMock}
                getWorkflowVariables={() => [
                    {
                        type: 'string',
                        name: 'ticket.url_something',
                        nodeType: 'text_reply',
                        value: 'value',
                    },
                ]}
            />,
        )
        fireEvent.click(screen.getByText(/link/))

        await waitFor(() => {
            fireEvent.click(screen.getByText('{+}'))
            expect(
                screen.getByText(/Insert variable from previous steps/i),
            ).toBeInTheDocument()
            expect(onOpenMock).not.toHaveBeenCalled()
        })
    })

    it('should render "open in a new tab" checkbox', () => {
        const mockOnTargetChange = jest.fn()

        const { rerender } = render(
            <AddLinkWithIsOpenState
                {...defaultProps}
                text="foo"
                url="https://example/com"
                target="_blank"
                onTargetChange={mockOnTargetChange}
                getWorkflowVariables={() => []}
            />,
        )

        act(() => {
            fireEvent.click(screen.getByText('link'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Open in a new tab'))
        })

        expect(mockOnTargetChange).toHaveBeenNthCalledWith(1, '_self')

        rerender(
            <AddLinkWithIsOpenState
                {...defaultProps}
                text="foo"
                url="https://example/com"
                target="_self"
                onTargetChange={mockOnTargetChange}
                getWorkflowVariables={() => []}
            />,
        )

        act(() => {
            fireEvent.click(screen.getByText('Open in a new tab'))
        })

        expect(mockOnTargetChange).toHaveBeenNthCalledWith(2, '_blank')
    })

    it('should set templatedUrl attribute if url starts with template', () => {
        const editorState = EditorState.createEmpty()

        const contentState = editorState.getCurrentContent()
        const createEntitySpy = jest.spyOn(contentState, 'createEntity')

        render(
            <AddLinkWithIsOpenState
                {...defaultProps}
                text="foo"
                url="{{ticket.url}}"
                target="_blank"
                onTargetChange={jest.fn()}
                getWorkflowVariables={() => []}
                getEditorState={() => editorState}
            />,
        )

        act(() => {
            fireEvent.click(screen.getByText('link'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Insert Link'))
        })

        expect(createEntitySpy).toHaveBeenCalledWith('link', 'MUTABLE', {
            target: '_blank',
            templatedUrl: '{{ticket.url}}',
            url: '{{ticket.url}}',
        })
    })

    it('should set templatedUrl attribute if url starts with template during update', () => {
        const editorState = EditorState.createEmpty()

        const contentState = editorState.getCurrentContent()
        const contentStateWithEntity = contentState.createEntity(
            'link',
            'MUTABLE',
            { url: '{{ticket.url}}' },
        )
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey()

        const replaceEntityDataSpy = jest.spyOn(
            contentState,
            'replaceEntityData',
        )

        render(
            <AddLinkWithIsOpenState
                {...defaultProps}
                text="foo"
                url="{{ticket.url}}"
                target="_blank"
                onTargetChange={jest.fn()}
                getWorkflowVariables={() => []}
                getEditorState={() => editorState}
                entityKey={entityKey}
            />,
        )

        act(() => {
            fireEvent.click(screen.getByText('link'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Update Link'))
        })

        expect(replaceEntityDataSpy).toHaveBeenCalledWith(entityKey, {
            target: '_blank',
            templatedUrl: '{{ticket.url}}',
            url: '{{ticket.url}}',
        })
    })

    it('should call linkEditionStarted on open and linkEditionEnded on close', () => {
        const linkEditionStarted = Object.assign(jest.fn(), {
            type: 'EDITOR/LINK_EDITION_STARTED' as const,
            match: jest.fn(),
        }) as unknown as ComponentProps<
            typeof AddLinkContainer
        >['linkEditionStarted']
        const linkEditionEnded = Object.assign(jest.fn(), {
            type: 'EDITOR/LINK_EDITION_ENDED' as const,
            match: jest.fn(),
        }) as unknown as ComponentProps<
            typeof AddLinkContainer
        >['linkEditionEnded']

        const { rerender } = render(
            <AddLinkContainer
                {...defaultProps}
                isOpen={false}
                linkEditionStarted={linkEditionStarted}
                linkEditionEnded={linkEditionEnded}
            />,
        )

        rerender(
            <AddLinkContainer
                {...defaultProps}
                isOpen={true}
                linkEditionStarted={linkEditionStarted}
                linkEditionEnded={linkEditionEnded}
            />,
        )

        expect(linkEditionStarted).toHaveBeenCalled()

        rerender(
            <AddLinkContainer
                {...defaultProps}
                isOpen={false}
                linkEditionStarted={linkEditionStarted}
                linkEditionEnded={linkEditionEnded}
            />,
        )

        expect(linkEditionEnded).toHaveBeenCalled()
    })

    it('should set anchorStyle from linkSelectionRect when opening', () => {
        const linkEditionStarted = Object.assign(jest.fn(), {
            type: 'EDITOR/LINK_EDITION_STARTED' as const,
            match: jest.fn(),
        }) as unknown as ComponentProps<
            typeof AddLinkContainer
        >['linkEditionStarted']
        const linkEditionEnded = Object.assign(jest.fn(), {
            type: 'EDITOR/LINK_EDITION_ENDED' as const,
            match: jest.fn(),
        }) as unknown as ComponentProps<
            typeof AddLinkContainer
        >['linkEditionEnded']
        const mockRect = {
            bottom: 100,
            left: 50,
            width: 200,
            height: 20,
            top: 80,
            right: 250,
            x: 50,
            y: 80,
            toJSON: () => {},
        } as DOMRect

        const { rerender } = render(
            <AddLinkContainer
                {...defaultProps}
                isOpen={false}
                linkEditionStarted={linkEditionStarted}
                linkEditionEnded={linkEditionEnded}
                linkSelectionRect={mockRect}
            />,
        )

        rerender(
            <AddLinkContainer
                {...defaultProps}
                isOpen={true}
                linkEditionStarted={linkEditionStarted}
                linkEditionEnded={linkEditionEnded}
                linkSelectionRect={mockRect}
            />,
        )

        expect(linkEditionStarted).toHaveBeenCalled()
    })

    it('should apply LINK_HIGHLIGHT style when opening with non-collapsed selection', () => {
        const setEditorState = jest.fn()
        const contentState = ContentState.createFromText('Hello')
        const editorState = EditorState.createWithContent(contentState)
        const block = contentState.getFirstBlock()
        const selection = editorState.getSelection().merge({
            anchorKey: block.getKey(),
            anchorOffset: 0,
            focusKey: block.getKey(),
            focusOffset: 5,
            hasFocus: true,
        }) as import('draft-js').SelectionState
        const stateWithSelection = EditorState.forceSelection(
            editorState,
            selection,
        )

        render(
            <AddLinkWithIsOpenState
                {...defaultProps}
                getEditorState={() => stateWithSelection}
                setEditorState={setEditorState}
                text=""
                url=""
            />,
        )

        act(() => {
            fireEvent.click(screen.getByText('link'))
        })

        expect(setEditorState).toHaveBeenCalled()
        const calledState = setEditorState.mock.calls[0][0] as EditorState
        const calledBlock = calledState.getCurrentContent().getFirstBlock()
        const styles = calledBlock.getInlineStyleAt(0)
        expect(styles.has('LINK_HIGHLIGHT')).toBe(true)
    })

    it('should toggle closed when clicking link button while popover is open', () => {
        const onClose = jest.fn()

        const Wrapped = () => {
            const [isOpen, setIsOpen] = React.useState(true)
            return (
                <AddLinkContainer
                    {...defaultProps}
                    onClose={() => {
                        setIsOpen(false)
                        onClose()
                    }}
                    onOpen={() => setIsOpen(true)}
                    isOpen={isOpen}
                />
            )
        }
        render(<Wrapped />)

        act(() => {
            fireEvent.click(screen.getByText('link'))
        })

        expect(onClose).toHaveBeenCalled()
    })

    it('should not submit when url is invalid', () => {
        const setEditorState = jest.fn()

        render(
            <AddLinkWithIsOpenState
                {...defaultProps}
                text="foo"
                url="not-a-valid-url"
                setEditorState={setEditorState}
            />,
        )

        act(() => {
            fireEvent.click(screen.getByText('link'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Insert Link'))
        })

        expect(setEditorState).not.toHaveBeenCalled()
    })

    it('should remove LINK_HIGHLIGHT on close and insert link using highlighted selection', () => {
        const setEditorState = jest.fn()
        const contentState = ContentState.createFromText('Hello World')
        let editorState = EditorState.createWithContent(contentState)
        const block = contentState.getFirstBlock()
        const selection = editorState.getSelection().merge({
            anchorKey: block.getKey(),
            anchorOffset: 0,
            focusKey: block.getKey(),
            focusOffset: 5,
            hasFocus: true,
        }) as import('draft-js').SelectionState
        editorState = EditorState.forceSelection(editorState, selection)

        const getEditorState = jest.fn(() => editorState)
        setEditorState.mockImplementation((newState: EditorState) => {
            editorState = newState
            getEditorState.mockReturnValue(newState)
        })

        const Wrapped = () => {
            const [isOpen, setIsOpen] = React.useState(false)
            const [text, setText] = React.useState('')
            const [url, setUrl] = React.useState('')
            return (
                <AddLinkContainer
                    {...defaultProps}
                    isOpen={isOpen}
                    onOpen={() => setIsOpen(true)}
                    onClose={() => setIsOpen(false)}
                    getEditorState={getEditorState}
                    setEditorState={setEditorState}
                    text={text}
                    onTextChange={setText}
                    url={url}
                    onUrlChange={setUrl}
                />
            )
        }

        render(<Wrapped />)

        act(() => {
            fireEvent.click(screen.getByText('link'))
        })

        expect(setEditorState).toHaveBeenCalled()
        const highlightedState = setEditorState.mock.calls[0][0] as EditorState
        const highlightedBlock = highlightedState
            .getCurrentContent()
            .getFirstBlock()
        expect(highlightedBlock.getInlineStyleAt(0).has('LINK_HIGHLIGHT')).toBe(
            true,
        )
    })

    it('should update link text via entity selection when updating existing link', () => {
        const { Modifier } = require('draft-js')
        const contentState = ContentState.createFromText('Click Here')
        const contentStateWithEntity = contentState.createEntity(
            'link',
            'MUTABLE',
            { url: 'https://old.com' },
        )
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey()

        const block = contentStateWithEntity.getFirstBlock()
        const entitySelection = EditorState.createWithContent(
            contentStateWithEntity,
        )
            .getSelection()
            .merge({
                anchorKey: block.getKey(),
                anchorOffset: 0,
                focusKey: block.getKey(),
                focusOffset: 10,
            }) as import('draft-js').SelectionState

        const newContent = Modifier.applyEntity(
            contentStateWithEntity,
            entitySelection,
            entityKey,
        )
        let editorState = EditorState.createWithContent(newContent)

        const setEditorState = jest.fn((state: EditorState) => {
            editorState = state
        })
        const getEditorState = () => editorState

        render(
            <AddLinkWithIsOpenState
                {...defaultProps}
                entityKey={entityKey}
                url="https://new.com"
                text="New Text"
                getEditorState={getEditorState}
                setEditorState={setEditorState}
            />,
        )

        act(() => {
            fireEvent.click(screen.getByText('link'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Update Link'))
        })

        expect(setEditorState).toHaveBeenCalled()
    })

    it('should insert link using highlighted selection and remove highlights on close', () => {
        const { Modifier, SelectionState } = require('draft-js')
        const contentState = ContentState.createFromText('Hello World')
        const block = contentState.getFirstBlock()
        const selection = SelectionState.createEmpty(block.getKey()).merge({
            anchorOffset: 0,
            focusOffset: 5,
        }) as import('draft-js').SelectionState

        const contentWithHighlight = Modifier.applyInlineStyle(
            contentState,
            selection,
            'LINK_HIGHLIGHT',
        )
        let editorState = EditorState.createWithContent(contentWithHighlight)
        editorState = EditorState.forceSelection(
            editorState,
            editorState.getSelection().merge({
                hasFocus: true,
            }) as import('draft-js').SelectionState,
        )

        const setEditorState = jest.fn((state: EditorState) => {
            editorState = state
        })
        const getEditorState = jest.fn(() => editorState)

        const Wrapped = () => {
            const [isOpen, setIsOpen] = React.useState(true)
            return (
                <AddLinkContainer
                    {...defaultProps}
                    isOpen={isOpen}
                    onOpen={() => setIsOpen(true)}
                    onClose={() => setIsOpen(false)}
                    getEditorState={getEditorState}
                    setEditorState={setEditorState}
                    text="Hello"
                    url="https://example.com"
                />
            )
        }

        render(<Wrapped />)

        act(() => {
            fireEvent.click(screen.getByText('Insert Link'))
        })

        expect(setEditorState).toHaveBeenCalled()
    })

    it('should not submit when text is empty', () => {
        const setEditorState = jest.fn()

        render(
            <AddLinkWithIsOpenState
                {...defaultProps}
                text=""
                url="https://example.com"
                setEditorState={setEditorState}
            />,
        )

        act(() => {
            fireEvent.click(screen.getByText('link'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Insert Link'))
        })

        expect(setEditorState).not.toHaveBeenCalled()
    })

    it('should remove LINK_HIGHLIGHT when closing popover without submitting', () => {
        const { Modifier, SelectionState } = require('draft-js')
        const contentState = ContentState.createFromText('Hello World')
        const block = contentState.getFirstBlock()
        const selection = SelectionState.createEmpty(block.getKey()).merge({
            anchorOffset: 0,
            focusOffset: 5,
        }) as import('draft-js').SelectionState

        const contentWithHighlight = Modifier.applyInlineStyle(
            contentState,
            selection,
            'LINK_HIGHLIGHT',
        )
        let editorState = EditorState.createWithContent(contentWithHighlight)

        const setEditorState = jest.fn((state: EditorState) => {
            editorState = state
        })
        const getEditorState = jest.fn(() => editorState)

        const { rerender } = render(
            <AddLinkContainer
                {...defaultProps}
                isOpen={true}
                getEditorState={getEditorState}
                setEditorState={setEditorState}
                text="Hello"
                url=""
            />,
        )

        rerender(
            <AddLinkContainer
                {...defaultProps}
                isOpen={false}
                getEditorState={getEditorState}
                setEditorState={setEditorState}
                text="Hello"
                url=""
            />,
        )

        expect(setEditorState).toHaveBeenCalled()
        const resultState = setEditorState.mock.calls[
            setEditorState.mock.calls.length - 1
        ][0] as EditorState
        const resultBlock = resultState.getCurrentContent().getFirstBlock()
        expect(resultBlock.getInlineStyleAt(0).has('LINK_HIGHLIGHT')).toBe(
            false,
        )
    })

    it('should NOT apply LINK_HIGHLIGHT style when selection is collapsed', () => {
        const setEditorState = jest.fn()
        const editorState = EditorState.createWithContent(
            ContentState.createFromText('Hello'),
        )

        render(
            <AddLinkWithIsOpenState
                {...defaultProps}
                getEditorState={() => editorState}
                setEditorState={setEditorState}
                text=""
                url=""
            />,
        )

        act(() => {
            fireEvent.click(screen.getByText('link'))
        })

        if (setEditorState.mock.calls.length > 0) {
            const calledState = setEditorState.mock.calls[0][0] as EditorState
            const calledBlock = calledState.getCurrentContent().getFirstBlock()
            expect(calledBlock.getInlineStyleAt(0).has('LINK_HIGHLIGHT')).toBe(
                false,
            )
        }
    })

    it('should insert link using current editor selection when no LINK_HIGHLIGHT exists', () => {
        const setEditorState = jest.fn()
        const contentState = ContentState.createFromText('Hello World')
        const block = contentState.getFirstBlock()
        const selection = SelectionState.createEmpty(block.getKey()).merge({
            anchorOffset: 0,
            focusOffset: 5,
        }) as import('draft-js').SelectionState
        let editorState = EditorState.createWithContent(contentState)
        editorState = EditorState.forceSelection(editorState, selection)

        const getEditorState = jest.fn(() => editorState)
        setEditorState.mockImplementation((newState: EditorState) => {
            editorState = newState
            getEditorState.mockReturnValue(newState)
        })

        const Wrapped = () => {
            const [isOpen, setIsOpen] = React.useState(true)
            return (
                <AddLinkContainer
                    {...defaultProps}
                    isOpen={isOpen}
                    onOpen={() => setIsOpen(true)}
                    onClose={() => setIsOpen(false)}
                    getEditorState={getEditorState}
                    setEditorState={setEditorState}
                    text="Hello"
                    url="https://example.com"
                />
            )
        }

        render(<Wrapped />)

        act(() => {
            fireEvent.click(screen.getByText('Insert Link'))
        })

        expect(setEditorState).toHaveBeenCalled()
        const resultState = setEditorState.mock.calls[
            setEditorState.mock.calls.length - 1
        ][0] as EditorState
        const resultBlock = resultState.getCurrentContent().getFirstBlock()
        expect(resultBlock.getText()).toContain('Hello')
    })

    it('should return early from _updateLink when entityKey is null', () => {
        const setEditorState = jest.fn()
        const editorState = EditorState.createEmpty()

        render(
            <AddLinkWithIsOpenState
                {...defaultProps}
                entityKey={undefined}
                url="https://example.com"
                text="Test"
                getEditorState={() => editorState}
                setEditorState={setEditorState}
            />,
        )

        act(() => {
            fireEvent.click(screen.getByText('link'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Insert Link'))
        })

        expect(setEditorState).toHaveBeenCalled()
    })

    it('should NOT call _insertExtraVideoIfApplicable in update mode', () => {
        const addVideoSpy = jest
            .spyOn(draftjsPluginsUtils, 'addVideo')
            .mockImplementation((editorState) => editorState)

        const contentState = ContentState.createFromText('Click Here')
        const contentStateWithEntity = contentState.createEntity(
            'link',
            'MUTABLE',
            { url: 'https://old.com' },
        )
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey()

        const block = contentStateWithEntity.getFirstBlock()
        const entitySelection = EditorState.createWithContent(
            contentStateWithEntity,
        )
            .getSelection()
            .merge({
                anchorKey: block.getKey(),
                anchorOffset: 0,
                focusKey: block.getKey(),
                focusOffset: 10,
            }) as import('draft-js').SelectionState

        const newContent = Modifier.applyEntity(
            contentStateWithEntity,
            entitySelection,
            entityKey,
        )
        let editorState = EditorState.createWithContent(newContent)

        const setEditorState = jest.fn((state: EditorState) => {
            editorState = state
        })
        const getEditorState = () => editorState

        render(
            <AddLinkWithIsOpenState
                {...defaultProps}
                entityKey={entityKey}
                url="https://www.youtube.com/watch?v=4sLFpe-xbhk"
                text="Video Link"
                canAddVideoPlayer
                getEditorState={getEditorState}
                setEditorState={setEditorState}
            />,
        )

        act(() => {
            fireEvent.click(screen.getByText('link'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Update Link'))
        })

        expect(addVideoSpy).not.toHaveBeenCalled()
    })

    it('should NOT insert video when URL is not playable', () => {
        const addVideoSpy = jest
            .spyOn(draftjsPluginsUtils, 'addVideo')
            .mockImplementation((editorState) => editorState)

        const canPlaySpy = jest
            .spyOn(ReactPlayer, 'canPlay')
            .mockReturnValue(false)

        render(
            <AddLinkWithIsOpenState
                {...defaultProps}
                canAddVideoPlayer
                text="foo"
                url="https://not-a-video-site.com/page"
            />,
        )

        act(() => {
            fireEvent.click(screen.getByText('link'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Insert Link'))
        })

        expect(addVideoSpy).not.toHaveBeenCalled()
        canPlaySpy.mockRestore()
    })

    it('should disable submit when url is a non-template URL that fails linkify', () => {
        const { getByRole } = render(
            <AddLinkWithIsOpenState
                {...defaultProps}
                text="foo"
                url="just-some-text-not-url"
            />,
        )

        act(() => {
            fireEvent.click(screen.getByText('link'))
        })

        const button = getByRole('button', {
            name: 'Insert Link',
        })
        expect(button).toHaveAttribute('aria-disabled', 'true')
    })

    it('should handle _onPopoverOpen when getBoundingClientRect returns rect with width 0', () => {
        const setEditorState = jest.fn()
        const onOpen = jest.fn()
        const contentState = ContentState.createFromText('Hello')
        const block = contentState.getFirstBlock()
        const selection = SelectionState.createEmpty(block.getKey()).merge({
            anchorOffset: 0,
            focusOffset: 5,
        }) as import('draft-js').SelectionState
        let editorState = EditorState.createWithContent(contentState)
        editorState = EditorState.forceSelection(editorState, selection)

        const mockRange = {
            getBoundingClientRect: () => ({
                width: 0,
                height: 20,
                top: 100,
                bottom: 120,
                left: 50,
                right: 50,
                x: 50,
                y: 100,
                toJSON: () => {},
            }),
        }
        const originalGetSelection = window.getSelection
        window.getSelection = jest.fn().mockReturnValue({
            rangeCount: 1,
            getRangeAt: () => mockRange,
        })

        const ref = React.createRef<AddLinkContainer>()

        render(
            <AddLinkContainer
                {...defaultProps}
                ref={ref}
                getEditorState={() => editorState}
                setEditorState={setEditorState}
                onOpen={onOpen}
                isOpen={false}
                text=""
                url=""
            />,
        )

        act(() => {
            ref.current!._onPopoverOpen(true)
        })

        expect(onOpen).toHaveBeenCalled()
        expect(setEditorState).toHaveBeenCalled()
        window.getSelection = originalGetSelection
    })

    it('should handle _onPopoverOpen when getSelection throws', () => {
        const setEditorState = jest.fn()
        const onOpen = jest.fn()
        const contentState = ContentState.createFromText('Hello')
        const block = contentState.getFirstBlock()
        const selection = SelectionState.createEmpty(block.getKey()).merge({
            anchorOffset: 0,
            focusOffset: 5,
        }) as import('draft-js').SelectionState
        let editorState = EditorState.createWithContent(contentState)
        editorState = EditorState.forceSelection(editorState, selection)

        const originalGetSelection = window.getSelection
        window.getSelection = jest.fn().mockImplementation(() => {
            throw new Error('not available')
        })

        const ref = React.createRef<AddLinkContainer>()

        render(
            <AddLinkContainer
                {...defaultProps}
                ref={ref}
                getEditorState={() => editorState}
                setEditorState={setEditorState}
                onOpen={onOpen}
                isOpen={false}
                text=""
                url=""
            />,
        )

        act(() => {
            ref.current!._onPopoverOpen(true)
        })

        expect(onOpen).toHaveBeenCalled()
        expect(setEditorState).toHaveBeenCalled()
        window.getSelection = originalGetSelection
    })

    it('should render CampaignFormContextInterceptor and call callback when UTM context updates', () => {
        useFlagMock.mockReturnValue(true)
        const testUtmQueryString = '?utm_source=test'
        const testUtmEnabled = true

        useCampaignFormContextMock.mockReturnValue({
            utmConfiguration: {
                ...utmConfiguration,
                appliedUtmQueryString: testUtmQueryString,
                appliedUtmEnabled: testUtmEnabled,
            },
        })

        const { getByText } = render(
            <ToolbarProvider canAddUtm>
                <AddLinkWithIsOpenState
                    {...defaultProps}
                    text="Foo"
                    url="https://foo.bar"
                />
            </ToolbarProvider>,
        )

        act(() => {
            fireEvent.click(getByText(/link/))
        })

        act(() => {
            fireEvent.click(getByText(/Insert Link/))
        })

        expect(attachUtmtoUrlMock).toHaveBeenCalledWith(
            'https://foo.bar',
            '',
            true,
            testUtmEnabled,
            testUtmQueryString,
        )
    })

    it('should use button as popover target when no anchor position is set and no linkSelectionRect', () => {
        const linkEditionStarted = Object.assign(jest.fn(), {
            type: 'EDITOR/LINK_EDITION_STARTED' as const,
            match: jest.fn(),
        }) as unknown as ComponentProps<
            typeof AddLinkContainer
        >['linkEditionStarted']
        const linkEditionEnded = Object.assign(jest.fn(), {
            type: 'EDITOR/LINK_EDITION_ENDED' as const,
            match: jest.fn(),
        }) as unknown as ComponentProps<
            typeof AddLinkContainer
        >['linkEditionEnded']

        const { rerender } = render(
            <AddLinkContainer
                {...defaultProps}
                isOpen={false}
                linkEditionStarted={linkEditionStarted}
                linkEditionEnded={linkEditionEnded}
            />,
        )

        rerender(
            <AddLinkContainer
                {...defaultProps}
                isOpen={true}
                linkEditionStarted={linkEditionStarted}
                linkEditionEnded={linkEditionEnded}
            />,
        )

        expect(linkEditionStarted).toHaveBeenCalled()
    })

    it('should use linkSelectionRect as fallback anchor when no anchorStyle is set', () => {
        const linkEditionStarted = Object.assign(jest.fn(), {
            type: 'EDITOR/LINK_EDITION_STARTED' as const,
            match: jest.fn(),
        }) as unknown as ComponentProps<
            typeof AddLinkContainer
        >['linkEditionStarted']
        const linkEditionEnded = Object.assign(jest.fn(), {
            type: 'EDITOR/LINK_EDITION_ENDED' as const,
            match: jest.fn(),
        }) as unknown as ComponentProps<
            typeof AddLinkContainer
        >['linkEditionEnded']
        const mockRect = {
            bottom: 100,
            left: 50,
            width: 200,
            height: 20,
            top: 80,
            right: 250,
            x: 50,
            y: 80,
            toJSON: () => {},
        } as DOMRect

        render(
            <AddLinkContainer
                {...defaultProps}
                isOpen={true}
                linkEditionStarted={linkEditionStarted}
                linkEditionEnded={linkEditionEnded}
                linkSelectionRect={mockRect}
                text="foo"
                url="https://example.com"
            />,
        )

        expect(
            screen.getByRole('button', { name: 'Insert Link' }),
        ).toBeInTheDocument()
    })
})
