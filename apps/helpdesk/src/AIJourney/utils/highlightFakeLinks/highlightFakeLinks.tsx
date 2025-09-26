export const highlightFakeLinks = (text: string, className: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    return text.split(urlRegex).map((part, index) =>
        urlRegex.test(part) ? (
            <span className={className} key={index}>
                {part}
            </span>
        ) : (
            part
        ),
    )
}
