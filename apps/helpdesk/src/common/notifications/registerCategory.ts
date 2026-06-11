import { categories } from './data'
import type { CategoryConfig } from './types'

export function registerCategory(config: CategoryConfig) {
    categories.push(config)
}
