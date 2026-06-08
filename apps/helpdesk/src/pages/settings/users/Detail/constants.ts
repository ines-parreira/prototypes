import { history } from '@repo/routing'

export const USERS_LIST_PATH = '/app/settings/users'

export const navigateBackToUserList = () => history.push(USERS_LIST_PATH)
