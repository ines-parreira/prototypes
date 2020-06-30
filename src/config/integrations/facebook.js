//@flow
import {fromJS} from 'immutable'

import {
    DANISH_LANGUAGE,
    DUTCH_LANGUAGE,
    ENGLISH_US_LANGUAGE,
    FRENCH_LANGUAGE,
    GERMAN_LANGUAGE,
    ITALIAN_LANGUAGE,
    NORWEGIAN_LANGUAGE,
    SPANISH_LANGUAGE,
    SWEDISH_LANGUAGE,
} from '../../constants/languages'

export const FACEBOOK_LANGUAGE_DEFAULT = ENGLISH_US_LANGUAGE
export const FACEBOOK_LANGUAGE_OPTIONS = fromJS([
    {value: ENGLISH_US_LANGUAGE, label: 'English US'},
    {value: FRENCH_LANGUAGE, label: 'French'},
    {value: SPANISH_LANGUAGE, label: 'Spanish'},
    {value: DANISH_LANGUAGE, label: 'Danish'},
    {value: SWEDISH_LANGUAGE, label: 'Swedish'},
    {value: ITALIAN_LANGUAGE, label: 'Italian'},
    {value: DUTCH_LANGUAGE, label: 'Dutch'},
    {value: GERMAN_LANGUAGE, label: 'German'},
    {value: NORWEGIAN_LANGUAGE, label: 'Norwegian'},
])
