import * as immutableMatchers from 'jest-immutable-matchers'

import toBeAriaDisabled from './customMatchers/toBeAriaDisabled'
import toBeAriaEnabled from './customMatchers/toBeAriaEnabled'

expect.extend({ ...immutableMatchers, toBeAriaDisabled, toBeAriaEnabled })
