use std::fmt::{Display, Formatter, Result as FmtRes};

pub(crate) fn slice_join<T: Display, S: Display + ?Sized>(
    f: &mut Formatter<'_>, v: &[T], sep: &S,
) -> FmtRes {
    if v.len() == 0 {
        return Ok(());
    }

    write!(f, "{}", v[0])?;
    v[1..].iter().try_for_each(|w| write!(f, "{}{}", sep, w))
}

pub(crate) fn slice_join_bracket<T: Display, S: Display + ?Sized>(
    f: &mut Formatter<'_>, v: &[T], separator: &S,
) -> FmtRes {
    write!(f, "(")?;
    slice_join(f, v, separator)?;
    write!(f, ")")
}
