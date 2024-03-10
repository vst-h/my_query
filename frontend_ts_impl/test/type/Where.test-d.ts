import { describe, expectTypeOf, test } from 'vitest';
import { newEWhere } from '../../src/EWhere';
import { Post } from '../EntityMap';

describe("methods derived from field types", () => {

  test("Id type", () => {
    const e = newEWhere<Post>([])

    expectTypeOf<keyof typeof e["id"]>()
      .toEqualTypeOf<"eq" | "nEq" | "in" | "notIn">()

    const _ = e
      .id.eq(1)
      .id.nEq(2)
      .id.in(3, 4)
      .id.notIn(5, 6)
  })
})