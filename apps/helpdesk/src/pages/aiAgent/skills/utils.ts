export const formatIntentName = (name: string): string =>
    name
        .split('::')
        .map((part) => part.replace(/\b\w/g, (char) => char.toUpperCase()))
        .join(' / ')
