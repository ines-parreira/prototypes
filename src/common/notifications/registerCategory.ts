import {categories} from './data'
import type {CategoryConfig} from './types'

export default function registerCategory(config: CategoryConfig) {
    categories.push(config)
}
