import { describe, test } from 'vitest'
import { createQuery } from "../src/Query"



describe.skip("Group", () => {
  return
  const q = createQuery({})


  test("entity prop", () => {
    const qGroup = q.Post.groupBy(e => e.titel.create_at)

  })

})
