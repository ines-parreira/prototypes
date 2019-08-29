type Ad = {
    comment_count: number,
    comments_fetched_at: string,
    is_active: boolean,
    name: string,
}

type AdAccount = {
    is_active: boolean,
    name: string,
}

type Internal = {
    ads: {
        [key: string]: Ad
    },
    ad_accounts: AdAccount,
}

export type Internals = {
    [key: string]: Internal,
}
