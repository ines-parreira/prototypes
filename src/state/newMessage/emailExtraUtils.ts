import moment from 'moment'
import {ContentBlock, ContentState, Modifier} from 'draft-js'
import {fromJS, Map} from 'immutable'

import {Ticket, TicketElement, TicketMessage} from '../../models/ticket/types'
import {isTicketMessage} from '../../models/ticket/predicates'
import {
    contentStateFromTextOrHTML,
    convertFromHTML,
    insertNewBlockAtTheBeginning,
    mergeContentStates,
    selectWholeContentState,
    truncateContentStateBlocks,
    truncateContentStateWords,
    ContentStateCounter,
} from '../../utils/editor'
import {setQuoteDepth} from '../../pages/common/draftjs/plugins/quotes/quotesEditorUtils'
import {TicketChannel} from '../../business/types/ticket'

export type Signature = Map<'text' | 'html', string | undefined>

export type ReplyThreadMessage = TicketMessage & {
    sent_datetime: NonNullable<TicketMessage['sent_datetime']>
    public: true
}

export type EmailExtraArgs = ReplyThreadArgs & {
    signature: Signature
}

type ReplyThreadArgs = {
    replyThreadMessages: ReplyThreadMessage[]
    isForwarded: boolean
    ticket: Ticket
    messagesCountLimit?: number
    replyBlocksCountLimit?: number
    replyWordsCountLimit?: number
}

enum BlockDataKey {
    EmailExtra = 'emailExtra',
    Signature = 'signature',
    ReplyThread = 'replyThread',
}

const DEFAULT_REPLY_THREAD_MESSAGES_COUNT_LIMIT = 15
const DEFAULT_REPLY_BLOCKS_COUNT_LIMIT = 150
const DEFAULT_REPLY_WORDS_COUNT_LIMIT = 1200
const LIMITED_REPLY_THREAD_INDICATOR = ContentState.createFromText('(...)')

export const getReplyThreadMessages = (
    messages: TicketElement[]
): ReplyThreadMessage[] => {
    return messages
        .filter((message): message is ReplyThreadMessage => {
            return (
                isTicketMessage(message) &&
                message.public &&
                !!message.sent_datetime
            )
        })
        .sort((msg1, msg2) => {
            return moment(msg2.sent_datetime).diff(msg1.sent_datetime)
        })
}

export const isSignatureTextAdded = (
    contentState: ContentState,
    signature: Signature
): boolean => {
    if (!signature.get('text')) {
        return false
    }

    return contentState
        .getPlainText()
        .includes(generateSignature(signature).getPlainText())
}

export const hasOnlySignatureText = (
    contentState: ContentState,
    signature: Signature
): boolean => {
    if (!signature.get('text')) {
        return false
    }
    return (
        contentState.getPlainText() ===
        mergeContentStates(
            ContentState.createFromText(''),
            generateSignature(signature)
        ).getPlainText()
    )
}

const generateSignature = (signature: Signature): ContentState => {
    const text = signature.get('text', '')
    const html = signature.get('html', '')
    let signatureContentState = contentStateFromTextOrHTML(text, html)

    if (!signatureContentState.hasText()) {
        return ContentState.createFromText('')
    }

    signatureContentState = insertNewBlockAtTheBeginning(signatureContentState)

    return Modifier.mergeBlockData(
        signatureContentState,
        selectWholeContentState(signatureContentState),
        fromJS({[BlockDataKey.Signature]: true})
    )
}

const generateReplyThreadMessageHeader = (
    message: ReplyThreadMessage
): ContentState => {
    const {source, sent_datetime, sender, channel} = message
    const name = source?.from?.name || sender.name || ''
    const {address} = source?.from || {}
    const sentDate = moment
        .parseZone(sent_datetime)
        .format('ddd, MMM DD, YYYY, [at] hh:mm A')

    const headerHtml = `On ${sentDate}, ${name} ${
        channel === TicketChannel.Email && address
            ? `<<a href="mailto:${address}" target="_blank">${address}</a>> `
            : ''
    }wrote:`

    return convertFromHTML(headerHtml)
}

const generateForwardedReplyThreadMessageHeader = (
    message: ReplyThreadMessage,
    ticket: Ticket
) => {
    const {source, sent_datetime, sender, channel} = message
    const name = source?.from?.name || sender.name || ''
    const {address} = source?.from || {}
    const sentDate = moment
        .parseZone(sent_datetime)
        .format('ddd, MMM DD, YYYY, [at] hh:mm A')
    const recipients =
        channel === TicketChannel.Email
            ? message.source?.to.map(
                  ({address}) => `<a href="${address}">${address}</a>`
              ) || []
            : [message.receiver.name]

    const headerHtml = [
        '---------- Forwarded message ----------',
        `From: <b>${name}</b> ${
            channel === TicketChannel.Email && address
                ? `<<a href="mailto:${address}" target="_blank">${address}</a>>`
                : ''
        }`,
        `Date: ${sentDate}`,
        `Subject: ${ticket.subject}`,
        `To: ${recipients.join(', ')}`,
        '<br>',
    ].join('<br>')

    return convertFromHTML(headerHtml)
}

const generateReplyThreadMessageBody = (
    message: ReplyThreadMessage
): ContentState => {
    const {stripped_html, stripped_text, body_html, body_text} = message
    return convertFromHTML(
        stripped_html || body_html || stripped_text || body_text || ''
    )
}

const truncateReplyThreadMessageBody = (
    bodyContentState: ContentState,
    blocks: number,
    words: number
): ContentState => {
    return blocks <= 0 || words <= 0
        ? truncateContentStateWords(
              truncateContentStateBlocks(bodyContentState, 1),
              3
          )
        : truncateContentStateWords(
              truncateContentStateBlocks(bodyContentState, blocks),
              words
          )
}

const generateReplyThread = (
    contentState: ContentState,
    {
        replyThreadMessages,
        isForwarded,
        ticket,
        messagesCountLimit = DEFAULT_REPLY_THREAD_MESSAGES_COUNT_LIMIT,
        replyBlocksCountLimit = DEFAULT_REPLY_BLOCKS_COUNT_LIMIT,
        replyWordsCountLimit = DEFAULT_REPLY_WORDS_COUNT_LIMIT,
    }: ReplyThreadArgs
): ContentState => {
    if (!replyThreadMessages.length) {
        return ContentState.createFromText('')
    }

    const messagesToRender = replyThreadMessages.slice(0, messagesCountLimit)
    let isLimited = replyThreadMessages.length !== messagesToRender.length
    let replyThread = ContentState.createFromText('')
    const replyCounts = new ContentStateCounter(
        mergeContentStates(contentState, replyThread)
    )

    const appendToReplyThread = (contentState: ContentState) => {
        replyThread = mergeContentStates(replyThread, contentState)
        replyCounts.addContentState(contentState)
    }

    for (let i = 0, quoteLevel = 0; i < messagesToRender.length; i++) {
        const message = messagesToRender[i]
        const isPreviousMessageForwarded =
            (i === 0 && isForwarded) ||
            (i > 0 && !!replyThreadMessages[i - 1].source?.extra?.forward)

        let header = isPreviousMessageForwarded
            ? generateForwardedReplyThreadMessageHeader(message, ticket)
            : generateReplyThreadMessageHeader(message)
        if (i > 0) {
            header = insertNewBlockAtTheBeginning(header)
        }
        header = setQuoteDepth(
            header,
            selectWholeContentState(header),
            quoteLevel
        )
        appendToReplyThread(header)

        let body = generateReplyThreadMessageBody(message)
        body = setQuoteDepth(
            body,
            selectWholeContentState(body),
            isPreviousMessageForwarded ? quoteLevel : quoteLevel + 1
        )
        const truncatedBody = truncateReplyThreadMessageBody(
            body,
            replyBlocksCountLimit - replyCounts.blocks,
            replyWordsCountLimit - replyCounts.words
        )
        appendToReplyThread(truncatedBody)

        if (!isPreviousMessageForwarded) {
            quoteLevel++
        }

        if (body !== truncatedBody) {
            isLimited = true
            break
        }
    }

    if (isLimited) {
        appendToReplyThread(LIMITED_REPLY_THREAD_INDICATOR)
    }

    return Modifier.mergeBlockData(
        replyThread,
        selectWholeContentState(replyThread),
        fromJS({[BlockDataKey.ReplyThread]: true})
    )
}

const generateEmailExtra = (
    contentState: ContentState,
    {signature, ...replyThreadArgs}: EmailExtraArgs
): ContentState => {
    const signatureContentState = generateSignature(signature)
    let newContentState: ContentState | null = null

    if (
        signatureContentState.hasText() &&
        !isSignatureTextAdded(contentState, signature)
    ) {
        newContentState = signatureContentState
    }

    const replyThreadContentState = generateReplyThread(
        newContentState
            ? mergeContentStates(contentState, newContentState)
            : contentState,
        replyThreadArgs
    )

    if (replyThreadContentState.hasText()) {
        newContentState = newContentState
            ? mergeContentStates(newContentState, replyThreadContentState)
            : replyThreadContentState
    }

    return newContentState
        ? Modifier.mergeBlockData(
              newContentState,
              selectWholeContentState(newContentState),
              fromJS({[BlockDataKey.EmailExtra]: true})
          )
        : ContentState.createFromText('')
}

export const addEmailExtraContent = (
    contentState: ContentState,
    emailExtraArgs: EmailExtraArgs
): ContentState => {
    const emailExtraContentState = generateEmailExtra(
        contentState,
        emailExtraArgs
    )

    if (emailExtraContentState.hasText()) {
        return mergeContentStates(contentState, emailExtraContentState)
    }

    return contentState
}

const isEmailExtraContentBlock = (block: ContentBlock): boolean => {
    return block.getData().get(BlockDataKey.EmailExtra, false) as boolean
}

export const deleteEmailExtraContent = (
    contentState: ContentState
): ContentState => {
    const newBlocks = contentState
        .getBlocksAsArray()
        .filter((block) => !isEmailExtraContentBlock(block))

    if (newBlocks.length === contentState.getBlocksAsArray().length) {
        return contentState
    }

    return newBlocks.length
        ? ContentState.createFromBlockArray(newBlocks)
        : ContentState.createFromText('')
}

export const hasEmailExtraContent = (contentState: ContentState): boolean => {
    return !!contentState.getBlocksAsArray().find(isEmailExtraContentBlock)
}

export const getEmailExtraContent = (
    contentState: ContentState
): ContentState => {
    return ContentState.createFromBlockArray(
        contentState.getBlocksAsArray().filter(isEmailExtraContentBlock)
    )
}

export const clearEmailExtraData = (
    contentState: ContentState
): ContentState => {
    let modified = false
    const cleanContentState = ContentState.createFromBlockArray(
        contentState.getBlocksAsArray().map((block) => {
            const data = block.getData()
            if (isEmailExtraContentBlock(block)) {
                modified = true
                const newData = Object.values(BlockDataKey).reduce(
                    (data, key) => {
                        return data.delete(key)
                    },
                    data
                )
                return block.set('data', newData)
            }
            return block
        }) as ContentBlock[]
    )
        .set('selectionAfter', contentState.getSelectionAfter())
        .set(
            'selectionBefore',
            contentState.getSelectionBefore()
        ) as ContentState
    return modified ? cleanContentState : contentState
}
