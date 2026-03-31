import type { List } from 'immutable'
import { fromJS } from 'immutable'

import { LANGUAGE } from '../../constants/languages'

export const FACEBOOK_LANGUAGE_DEFAULT = LANGUAGE.EN_US
export const FACEBOOK_LANGUAGE_OPTIONS = fromJS([
    { value: LANGUAGE.EN_US, label: 'English US' },
    { value: LANGUAGE.FR, label: 'French' },
    { value: LANGUAGE.ES, label: 'Spanish' },
    { value: LANGUAGE.DA, label: 'Danish' },
    { value: LANGUAGE.SV, label: 'Swedish' },
    { value: LANGUAGE.IT, label: 'Italian' },
    { value: LANGUAGE.NL, label: 'Dutch' },
    { value: LANGUAGE.DE, label: 'German' },
    { value: LANGUAGE.NO, label: 'Norwegian' },
]) as List<any>

export const FACEBOOK_MESSENGER_MESSAGE_MAX_LENGTH = 2000
