type Ad = {
    comment_count: number,
    comments_fetched_at: string,
    is_active: boolean,
    name: string,
}

type Internal = {
    ads: {
        [key: string]: Ad
    },
}

export type Internals = {
    [key: string]: Internal,
}
