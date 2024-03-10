
pub(crate) trait BoolExt {
    // fn then_else() ->
    fn ok_err<T, E>(self, ok: T, err: E) -> Result<T, E>;
}

#[rustfmt::skip]
impl BoolExt for bool {
    fn ok_err<T, E>(self, ok: T, err: E) -> Result<T, E> {
        if self { Ok(ok) } else { Err(err) }
    }
}
