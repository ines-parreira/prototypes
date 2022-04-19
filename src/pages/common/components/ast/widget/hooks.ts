import {List, Map} from 'immutable'
import {useMemo} from 'react'

export const useOptions = (
    selectedOption: Maybe<Map<any, any>>,
    options: List<any>,
    getOptionId: (value: Map<any, any>) => string | number
): List<any> => {
    return useMemo(() => {
        if (
            selectedOption &&
            !options.find(
                (option: Map<any, any>) =>
                    getOptionId(option) === getOptionId(selectedOption)
            )
        ) {
            return options.push(selectedOption)
        }
        return options
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options, selectedOption])
}
