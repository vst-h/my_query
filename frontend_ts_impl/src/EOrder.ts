import { EntityKey } from "./EInclude"

export interface EOrdersFn<T> {
    (e: EOrder0<T>): EOrder
}

/** Entities Order */
type EOrders<T> = { [K in keyof T]: EOrder0<T[K]> }

export type EOrder<T = unknown> = {
    readonly DESC$: EOrder0<T>
    readonly ASC$: EOrder0<T>
} & EOrder0<T>

export type EOrder0<T> = { [K in EntityKey<T>]-?: EOrder<T> }
