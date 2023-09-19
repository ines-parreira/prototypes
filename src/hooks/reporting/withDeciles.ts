import _findIndex from 'lodash/findLastIndex'

export interface DataResponse<TData = Record<string, any>> {
    data: {
        data: TData[]
    }
}

export const withDeciles = <TData extends DataResponse>(res: TData) => {
    return {
        ...res,
        data: {
            ...res.data,
            data: selectWithDeciles(res.data.data),
        },
    }
}

export const selectWithDeciles = (data: DataResponse['data']['data']) => {
    const count = data.length
    const deciles = getDecilesIndex(count)
    return data.map((item, index) => ({
        ...item,
        decile: getDecile(index, deciles),
    }))
}

export const getDecile = (
    itemIndex: number,
    decilesIndex: {decileIndex: number; decile: number}[]
) => {
    const result = _findIndex(
        decilesIndex,
        (item) => itemIndex >= item.decileIndex
    )
    return decilesIndex[result].decile
}

type DecileIndex = {
    decileIndex: number
    decile: number
}

export const getDecilesIndex = (length: number): DecileIndex[] => {
    if (length <= 0) return []

    let deciles: DecileIndex[]

    if (length >= 10) {
        const localDeciles = []
        for (let i = 9; i >= 0; i--) {
            localDeciles.push({decileIndex: Math.round((length * i) / 10)})
        }
        deciles = localDeciles
            .map((item, index) => ({
                ...item,
                decile: index,
            }))
            .reverse()
    } else {
        const increment = 10 / length
        const localDeciles = []
        for (let i = 9; i >= 0; i = i - increment) {
            localDeciles.push({
                decile: Math.round(i),
            })
        }
        deciles = localDeciles.map((item, index) => ({
            ...item,
            decileIndex: index,
        }))
    }

    return deciles
}
