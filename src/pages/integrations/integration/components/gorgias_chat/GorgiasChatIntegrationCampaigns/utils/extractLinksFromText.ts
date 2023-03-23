/**
 * @description
 *      Loops through the string and extract all matches of the regex.
 *
 * @param text Current string
 * @param regex Regex expression
 * @returns List of matches
 */
export function getAllMatches(text: string, regex: RegExp): string[] {
    if (regex.constructor !== RegExp) {
        throw new Error('not RegExp')
    }

    const res: string[] = []
    let match

    if (regex.global) {
        while ((match = regex.exec(text))) {
            res.push(match[0])
        }
    } else {
        if ((match = regex.exec(text))) {
            res.push(match[0])
        }
    }

    return res
}

/**
 * @description
 *    Looks in the html text and extracts the value of the `href`s.
 *
 * @param html HTML text to be inspected
 * @returns List of anchors from the text
 */
export function extractLinksFromText(html: string): string[] {
    return getAllMatches(html, /href="([^"]*)/g).map(
        (result) => result.split('="')[1]
    )
}
