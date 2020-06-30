// @flow
import {List} from 'immutable'
//$FlowFixMe
import {useMemo} from 'react'

export const useOptions = <Option, Id>(
    selectedOption: ?Option,
    options: List<Option>,
    getOptionId: (Option) => Id
): List<Option> => {
    return useMemo(() => {
        if (
            selectedOption &&
            !options.find(
                (option: Option) =>
                    getOptionId(option) ===
                    getOptionId(((selectedOption: any): Option))
            )
        ) {
            return options.push(selectedOption)
        }
        return options
    }, [options, selectedOption])
}
