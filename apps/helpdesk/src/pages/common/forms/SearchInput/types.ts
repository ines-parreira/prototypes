export type SearchInputResultProps<T> = {
    result: T
}

export type SearchInputSubResultProps<T, U> = SearchInputResultProps<T> & {
    subResult: U
}
