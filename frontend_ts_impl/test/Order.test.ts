import { describe, it } from 'vitest'
import { EWhere } from '../src/EWhere'
import { createQuery } from "../src/Query"
import { Post } from "./EntityMap"
import { EOrder } from '../src/EOrder'



describe.skip("Order", () => {
  return
  const q = createQuery({})

  it("entity prop Remove the `~include` key.", () => {
    type PropKey = keyof EOrder<Post>
    function test<T>(_: T extends "~include" ? never : T, key: PropKey) {
      test(key, key)
    }
  })

  it("entity prop", () => {
    const qOrder = q.Post.orderBy(e => e.id.titel.ASC$.create_at)

  })

})
