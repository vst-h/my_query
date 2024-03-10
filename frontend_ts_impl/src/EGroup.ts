import { EntityKey } from "./EInclude"

export interface EGroupsFn<T> {
    (t: EGroup<T>): EGroup
}

/** Entities Group */
type EGroups<T extends unknown[]> = { [K in keyof T]: EGroup<T[K]> }

type EGroup<T = unknown> = { [K in EntityKey<T>]-?: EGroup<T> }
