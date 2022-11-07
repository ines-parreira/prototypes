import {User} from 'config/types/user'

export type CampaignAuthor = Pick<User, 'name' | 'email'> & {
    avatar_url?: string | undefined
}
