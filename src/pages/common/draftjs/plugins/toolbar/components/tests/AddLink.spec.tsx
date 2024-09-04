import React, {ComponentProps} from 'react'
import {fireEvent, render, screen, waitFor, act} from '@testing-library/react'
import {shallow} from 'enzyme'
import {EditorState} from 'draft-js'
import _noop from 'lodash/noop'
import {assumeMock} from 'utils/testing'

import Button from 'pages/common/components/button/Button'

import * as draftjsPluginsUtils from 'pages/common/draftjs/plugins/utils'
import * as editorUtils from 'utils/editor'
import * as flagUtils from 'common/flags'

import {useCampaignFormContext} from 'pages/convert/campaigns/hooks/useCampaignFormContext'
import {CampaignFormConfigurationType} from 'pages/convert/campaigns/providers/CampaignDetailsForm/configurationContext'
import {utmConfiguration} from 'fixtures/utmConfiguration'
import {attachUtmToUrl} from 'pages/convert/campaigns/utils/attachUtmParams'
import {AddLinkContainer} from '../AddLink'
import ToolbarProvider from '../../ToolbarProvider'

jest.mock('pages/convert/campaigns/utils/attachUtmParams')
jest.mock('pages/convert/campaigns/hooks/useCampaignFormContext')
const useCampaignFormContextMock: jest.MockedFunction<
    () => Pick<CampaignFormConfigurationType, 'utmConfiguration'>
> = assumeMock(useCampaignFormContext)
const attachUtmtoUrlMock = assumeMock(attachUtmToUrl)

function AddLinkWithIsOpenState(
    props: ComponentProps<typeof AddLinkContainer>
) {
    const [isOpen, setIsOpen] = React.useState(false)
    return (
        <AddLinkContainer
            {...props}
            onClose={() => setIsOpen(false)}
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
        onClose: _noop,
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
        const component = shallow(
            <AddLinkContainer
                {...defaultProps}
                text="foo"
                url="http://gorgias.io"
            />
        )
        const button = component.find(Button)
        expect(button.props().isDisabled).toBe(false)
    })

    it('should allow to submit a url without the protocol', () => {
        const component = shallow(
            <AddLinkContainer {...defaultProps} text="foo" url="gorgias.io" />
        )
        const button = component.find(Button)
        expect(button.props().isDisabled).toBe(false)
    })

    it('should NOT allow to submit an invalid url', () => {
        const component = shallow(
            <AddLinkContainer
                {...defaultProps}
                text="foo"
                url="bar{{ticket.url_something}}"
            />
        )
        const button = component.find(Button)
        expect(button.props().isDisabled).toBe(true)
    })

    it('should allow to submit templated url', () => {
        const component = shallow(
            <AddLinkContainer
                {...defaultProps}
                text="foo"
                url="{{ticket.url_something}}"
            />
        )
        const button = component.find(Button)
        expect(button.props().isDisabled).toBe(false)
    })

    it('should remove link if there is an entity key', () => {
        const dummyUrl = 'https://foo.bar'
        const editorState = defaultProps.getEditorState()
        const contentState = editorState.getCurrentContent()
        const contentStateWithEntity = contentState.createEntity(
            'link', // Entity type
            'MUTABLE', // Mutability
            {url: dummyUrl} // Data
        )
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
        jest.spyOn(editorUtils, 'getSelectedEntityKey').mockReturnValue(
            entityKey
        )

        const mockRemoveLink = jest.spyOn(draftjsPluginsUtils, 'removeLink')
        const {getByText} = render(
            <AddLinkWithIsOpenState
                {...defaultProps}
                url={dummyUrl}
                text="foo"
            />
        )
        getByText(/link/).click()

        expect(mockRemoveLink).toBeCalled()
    })

    it('should update the link if its different from the one in text', () => {
        const editorState = defaultProps.getEditorState()
        const contentState = editorState.getCurrentContent()
        const contentStateWithEntity = contentState.createEntity(
            'link', // Entity type
            'MUTABLE', // Mutability
            {url: 'https://foo.bar'} // Data
        )
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey()

        const {getByText} = render(
            <AddLinkWithIsOpenState
                {...defaultProps}
                entityKey={entityKey}
                url="https://new.url.com"
                text="New URL"
            />
        )
        getByText('link').click()
        getByText('Update Link').click()
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
            const {getByLabelText} = render(<Wrapped />)

            act(() => {
                fireEvent.click(screen.getByText(/link/))
            })

            fireEvent.keyDown(getByLabelText('Link text'), {key: inputKey})
            expect(mockOnClose).toBeCalled()
        }
    )

    it('should be able to navigate between URL and UTM tabs', () => {
        jest.spyOn(flagUtils, 'useFlag').mockReturnValue(true)
        const {getByText, getAllByRole} = render(
            <ToolbarProvider canAddUtm>
                <AddLinkWithIsOpenState {...defaultProps} />
            </ToolbarProvider>
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
        jest.spyOn(flagUtils, 'useFlag').mockReturnValue(true)
        const {getByText, getAllByRole} = render(
            <ToolbarProvider canAddUtm>
                <AddLinkWithIsOpenState {...defaultProps} />
            </ToolbarProvider>
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
        const {getByText} = render(
            <ToolbarProvider canAddUtm>
                <AddLinkWithIsOpenState
                    {...defaultProps}
                    text="Foo"
                    url={baseUrl}
                />
            </ToolbarProvider>
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
            baseUtmQueryString
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
        const {getByText} = render(
            <ToolbarProvider canAddUtm={false}>
                <AddLinkWithIsOpenState
                    {...defaultProps}
                    text="Foo"
                    url={baseUrl}
                />
            </ToolbarProvider>
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
        const component = shallow(
            <AddLinkContainer
                {...defaultProps}
                text="foo"
                url="http://google.com/?email={{message.customer.email}}"
            />
        )
        const button = component.find(Button)
        expect(button.props().isDisabled).toBe(false)
    })

    it('should add a video at the bottom when URL is compatible and under a chat channel', () => {
        const addVideoSpy = jest
            .spyOn(draftjsPluginsUtils, 'addVideo')
            .mockImplementation((editorState) => editorState)

        const {getByText} = render(
            <AddLinkWithIsOpenState
                {...defaultProps}
                canAddVideoPlayer
                text="foo"
                url="https://www.youtube.com/watch?v=4sLFpe-xbhk"
            />,
            {
                container: document.body,
            }
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
            jest.fn()
        )

        render(
            <AddLinkWithIsOpenState
                {...defaultProps}
                canAddVideoPlayer={false}
                text="foo"
                url="https://www.youtube.com/watch?v=4sLFpe-xbhk"
            />
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
            />
        )
        fireEvent.click(screen.getByText(/link/))

        await act(async () => {
            await waitFor(() => {
                expect(
                    screen.getByText('https://help.domain.com')
                ).toBeInTheDocument()
                expect(
                    screen.queryByText('https://help.domain.com/article')
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
            />
        )
        fireEvent.click(screen.getByText(/link/))

        await act(async () => {
            await waitFor(() => {
                fireEvent.click(screen.getByText('{+}'))
                expect(
                    screen.getByText(/Insert variable from previous steps/i)
                ).toBeInTheDocument()
                expect(onOpenMock).not.toHaveBeenCalled()
            })
        })
    })

    it('should return true when workflowVariables are provided and target matches', () => {
        const wrapper = shallow(
            <AddLinkContainer
                getWorkflowVariables={() => [
                    {
                        type: 'string',
                        name: 'testVar',
                        nodeType: 'text_reply',
                        value: 'value',
                    },
                ]}
                {...defaultProps}
            />
        )
        const instance = wrapper.instance() as unknown as {
            _flowVariablesDisablePopoverToggle: (
                event: React.MouseEvent<any, globalThis.MouseEvent>
            ) => boolean
        }

        const event = {
            target: document.createElement('div'),
        }
        event.target.setAttribute('id', 'floating-ui-123')

        // Act

        const result = instance._flowVariablesDisablePopoverToggle(
            event as unknown as React.MouseEvent<any, globalThis.MouseEvent>
        )

        expect(result).toBe(true)
    })

    it('should return false when workflowVariables are not provided', () => {
        const wrapper = shallow(<AddLinkContainer {...defaultProps} />)
        const instance = wrapper.instance()

        const event = {
            target: document.createElement('div'),
        }

        const result = (
            instance as unknown as {
                _flowVariablesDisablePopoverToggle: (
                    event: React.MouseEvent<any, globalThis.MouseEvent>
                ) => boolean
            }
        )._flowVariablesDisablePopoverToggle(
            event as unknown as React.MouseEvent<any, globalThis.MouseEvent>
        )

        expect(result).toBe(false)
    })

    it('should return true when workflowVariables are provided and target matches', () => {
        // Arrange
        const wrapper = shallow(
            <AddLinkContainer
                getWorkflowVariables={() => [
                    {
                        type: 'string',
                        name: 'testVar',
                        nodeType: 'text_reply',
                        value: 'value',
                    },
                ]}
                {...defaultProps}
            />
        )
        const instance = wrapper.instance() as unknown as {
            _flowVariablesDisablePopoverToggle: (
                event: React.MouseEvent<any, globalThis.MouseEvent>
            ) => boolean
        }

        const event = {
            target: document.createElement('div'),
        }

        const result = (
            instance as unknown as {
                _flowVariablesDisablePopoverToggle: (
                    event: React.MouseEvent<any, globalThis.MouseEvent>
                ) => boolean
            }
        )._flowVariablesDisablePopoverToggle(
            event as unknown as React.MouseEvent<any, globalThis.MouseEvent>
        )

        expect(result).toBe(true)
    })

    it('should return false when workflowVariables is an empty array', () => {
        const wrapper = shallow(
            <AddLinkContainer
                {...defaultProps}
                getWorkflowVariables={() => []}
            />
        )
        const instance = wrapper.instance() as unknown as {
            _flowVariablesDisablePopoverToggle: (
                event: React.MouseEvent<any, globalThis.MouseEvent>
            ) => boolean
        }

        const event = {
            target: document.createElement('div'),
        }

        const result = instance._flowVariablesDisablePopoverToggle(
            event as unknown as React.MouseEvent<any, globalThis.MouseEvent>
        )

        expect(result).toBe(false)
    })

    it('should render "open in a new tab" checkbox', () => {
        const mockOnTargetChange = jest.fn()

        const {rerender} = render(
            <AddLinkWithIsOpenState
                {...defaultProps}
                text="foo"
                url="https://example/com"
                target="_blank"
                onTargetChange={mockOnTargetChange}
                getWorkflowVariables={() => []}
            />
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
            />
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
            />
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
            {url: '{{ticket.url}}'}
        )
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey()

        const replaceEntityDataSpy = jest.spyOn(
            contentState,
            'replaceEntityData'
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
            />
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
})
