import {fromJS, List} from 'immutable'

import {Language} from '../../constants/languages'

export const FACEBOOK_LANGUAGE_DEFAULT = Language.EnglishUs
export const FACEBOOK_LANGUAGE_OPTIONS = fromJS([
    {value: Language.EnglishUs, label: 'English US'},
    {value: Language.French, label: 'French'},
    {value: Language.Spanish, label: 'Spanish'},
    {value: Language.Danish, label: 'Danish'},
    {value: Language.Swedish, label: 'Swedish'},
    {value: Language.Italian, label: 'Italian'},
    {value: Language.Dutch, label: 'Dutch'},
    {value: Language.German, label: 'German'},
    {value: Language.Norwegian, label: 'Norwegian'},
]) as List<any>

export const FACEBOOK_MESSENGER_MESSAGE_MAX_LENGTH = 2000
