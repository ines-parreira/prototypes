export const WHATSAPP_VARIABLE_REGEX = /(\{\{\d\}\})/

export const countDistinctVariables = (message: string): number => {
    const matches = message.match(/\{\{(\d+)\}\}/g)
    let highestNumber = 0

    if (matches) {
        matches.forEach((match) => {
            // Remove the "{{" and "}}" and parse as an integer
            const number = parseInt(match.slice(2, -2))
            if (number > highestNumber) {
                highestNumber = number
            }
        })
    }

    return highestNumber
}

/* checks that every variable is filled */
export const isWhatsAppMessageValid = (
    message: string,
    values: string[]
): boolean => {
    const numberOfVariables = countDistinctVariables(message)
    const filledValues = values.filter(Boolean)

    return numberOfVariables === filledValues.length
}

export const processWhatsAppMarkdown = (unformattedMessage: string): string => {
    // 1. Split message according to line breaks
    // 2. Detect links
    // 3. Add bold(<b></b>), italic(<i></i>) and strikethrough(<s></s>) tags in between the message at respective places. By watching '*'s, '_'s and '~' respectively.

    // process URLs
    const urlRegex =
        /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/
    const message = unformattedMessage

    // Messages split by new line character
    const partsOfMessage = message.split(/\r\n|\n|\r/)

    // Process bold, italic and strikethrough
    let processedMessage = ''
    for (let i = 0; i < partsOfMessage.length; ++i) {
        let processedMessagePart = ''
        let totalBolds = 0,
            totalItalics = 0,
            totalStrikes = 0
        for (const ch of partsOfMessage[i]) {
            if (ch === '*') ++totalBolds
            else if (ch === '_') ++totalItalics
            else if (ch === '~') ++totalStrikes
        }

        let boldCount = 0,
            italicCount = 0,
            strikeCount = 0
        for (const ch of partsOfMessage[i]) {
            if (ch === '*') {
                if ((totalBolds & 1) === 1 && boldCount === totalBolds - 1)
                    continue
                processedMessagePart += (boldCount & 1) === 0 ? '<b>' : '</b>'
                ++boldCount
            } else if (ch === '_') {
                if (
                    (totalItalics & 1) === 1 &&
                    italicCount === totalItalics - 1
                )
                    continue
                processedMessagePart += (italicCount & 1) === 0 ? '<i>' : '</i>'
                ++italicCount
            } else if (ch === '~') {
                if (
                    (totalStrikes & 1) === 1 &&
                    strikeCount === totalStrikes - 1
                )
                    continue
                processedMessagePart += (strikeCount & 1) === 0 ? '<s>' : '</s>'
                ++strikeCount
            } else {
                processedMessagePart += ch
            }
        }
        processedMessage +=
            processedMessagePart +
            (i <= partsOfMessage.length - 2 ? '<br/>' : '')
    }

    // Process URLs
    processedMessage = processedMessage.replace(
        urlRegex,
        (url) =>
            '<a href="' +
            url +
            '" target="_blank" rel="noopener noreferrer" >' +
            url +
            '</a>'
    )

    return processedMessage
}

export const normalizeLocale = (locale: string): string => {
    return locale.replace('_', '-').toLowerCase()
}
