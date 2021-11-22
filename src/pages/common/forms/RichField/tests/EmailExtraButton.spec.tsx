import React, {ComponentProps} from 'react'
import {render, fireEvent, RenderResult} from '@testing-library/react'
import {fromJS} from 'immutable'
import {ContentState, EditorState} from 'draft-js'

import {ReplyThreadMessage} from '../../../../../state/newMessage/emailExtraUtils'

import {EmailExtraButtonContainer} from '../EmailExtraButton'
import {ticket} from '../../../../../fixtures/ticket'
import {addEmailExtra} from '../../../../../state/newMessage/actions'
import {TicketChannel} from '../../../../../business/types/ticket'

// mock random key generation so they match from a snapshot to the other
jest.mock('draft-js/lib/generateRandomKey', () => () => '123')

const defaultSignature = {
    html: '<div><br /></div><div>Some signature</div>',
    text: '\nSome signature',
}

const addEmailExtraMock = jest.fn()

const defaultProps: ComponentProps<typeof EmailExtraButtonContainer> = {
    editorState: EditorState.createEmpty(),
    signature: fromJS(defaultSignature),
    addEmailExtra: addEmailExtraMock as unknown as typeof addEmailExtra,
    ticketMessages: fromJS([]),
    isNewMessageEmailExtraAdded: false,
    newMessageChannel: TicketChannel.Email,
    isNewMessagePublic: true,
    isNewMessageForward: true,
    ticket: fromJS(ticket),
}

const getEllipsisButton = ({getByTitle}: RenderResult) =>
    getByTitle('Show trimmed content')

describe('<EmailExtraButton />', () => {
    const replyThreadMessage = ticket.messages[0] as ReplyThreadMessage

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the email extra button', () => {
        const {container} = render(
            <EmailExtraButtonContainer {...defaultProps} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not render the email extra button if signature is not set', () => {
        const {container} = render(
            <EmailExtraButtonContainer
                {...defaultProps}
                signature={fromJS({})}
            />
        )
        expect(container.firstChild).toBe(null)
    })

    it('should not render the email extra button if signature is empty', () => {
        const {container} = render(
            <EmailExtraButtonContainer
                {...defaultProps}
                signature={fromJS({
                    body: '<div><br></div>',
                })}
            />
        )
        expect(container.firstChild).toBe(null)
    })

    it('should not render the email extra button if channel is not email', () => {
        const {container} = render(
            <EmailExtraButtonContainer
                {...defaultProps}
                newMessageChannel={TicketChannel.Aircall}
            />
        )
        expect(container.firstChild).toBe(null)
    })

    it('should not render the email extra button if new message is not public', () => {
        const {container} = render(
            <EmailExtraButtonContainer
                {...defaultProps}
                isNewMessagePublic={false}
            />
        )
        expect(container.firstChild).toBe(null)
    })

    it('should render the email extra button when only reply thread is available', () => {
        const {container} = render(
            <EmailExtraButtonContainer
                {...defaultProps}
                signature={fromJS({})}
                ticketMessages={fromJS([replyThreadMessage])}
            />
        )
        expect(container.firstChild).not.toBe(null)
    })

    it('should render the email extra button when signature has only text', () => {
        const {container} = render(
            <EmailExtraButtonContainer
                {...defaultProps}
                signature={fromJS({
                    text: defaultSignature.text,
                })}
            />
        )
        expect(container.firstChild).not.toBe(null)
    })

    it('should render the email extra button when signature has only html', () => {
        const {container} = render(
            <EmailExtraButtonContainer
                {...defaultProps}
                signature={fromJS({
                    html: defaultSignature.html,
                })}
            />
        )
        expect(container.firstChild).not.toBe(null)
    })

    describe('signature in the content', () => {
        const contentStateWithSignature = ContentState.createFromText(
            `some content\n\n${defaultProps.signature.get('text') as string}`,
            '%%'
        )

        it('should hide the button when signature is in the content', () => {
            const {container} = render(
                <EmailExtraButtonContainer
                    {...defaultProps}
                    editorState={EditorState.createWithContent(
                        contentStateWithSignature
                    )}
                />
            )
            expect(container.firstChild).toBe(null)
        })

        it('should not hide the button when signature reply thread is available', () => {
            const {container} = render(
                <EmailExtraButtonContainer
                    {...defaultProps}
                    editorState={EditorState.createWithContent(
                        contentStateWithSignature
                    )}
                    ticketMessages={fromJS([replyThreadMessage])}
                />
            )
            expect(container.firstChild).not.toBe(null)
        })
    })

    it('should not display the button if email extra was added to new message', () => {
        const {container} = render(
            <EmailExtraButtonContainer
                {...defaultProps}
                signature={fromJS({
                    text: defaultSignature.text,
                })}
                ticketMessages={fromJS([replyThreadMessage])}
                isNewMessageEmailExtraAdded
            />
        )
        expect(container.firstChild).toBe(null)
    })

    it('should add signature on click', () => {
        const renderResult = render(
            <EmailExtraButtonContainer
                {...defaultProps}
                ticketMessages={fromJS([replyThreadMessage])}
            />
        )
        fireEvent.click(getEllipsisButton(renderResult))
        expect(addEmailExtraMock.mock.calls).toMatchSnapshot()
    })
})
