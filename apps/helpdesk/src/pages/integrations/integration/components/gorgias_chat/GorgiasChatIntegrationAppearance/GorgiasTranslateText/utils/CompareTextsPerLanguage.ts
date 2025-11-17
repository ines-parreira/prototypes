import { cloneDeep, isEqual, isObject } from 'lodash'

import type { TextsPerLanguage } from 'rest_api/gorgias_chat_protected_api/types'

const removeUndefinedProperties = (obj: any): any => {
    return Object.entries(obj).reduce(
        (acc, [key, value]) => {
            if (value !== undefined) {
                acc[key] = isObject(value)
                    ? removeUndefinedProperties(value)
                    : value
            }
            return acc
        },
        {} as Record<string, any>,
    )
}

/**
 * Compare two sets of TextsPerLanguage and return true if they are equal.
 * We coded that because Lodash's deep equality check treats an undefined property as a distinct value,
 * and thus objects with properties explicitly set to undefined will not be considered equal to objects without those properties.
 * Therefore,
 * ```
{
    "meta": { "privacyPolicyDisclaimer": undefined },
    "texts": {},
    "sspTexts": {}
  }
```
is equal to
```
{
    "meta": {},
    "texts": {},
    "sspTexts": {}
  }
  ```
 */
const isEqualTextsPerLanguage = (
    draft: TextsPerLanguage,
    reference: TextsPerLanguage,
) => {
    return isEqual(
        removeUndefinedProperties(cloneDeep(draft)),
        removeUndefinedProperties(cloneDeep(reference)),
    )
}

export default isEqualTextsPerLanguage
