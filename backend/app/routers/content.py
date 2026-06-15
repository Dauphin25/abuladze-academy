"""Site content (mini CMS) endpoints — public read, admin write. Locale-aware."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_admin
from ..models import SiteContent
from ..schemas import ContentItem, ContentUpdate

router = APIRouter(prefix="/api/content", tags=["content"])

DEFAULT_LOCALE = "ka"


@router.get("", response_model=dict[str, str])
def get_all_content(
    lang: str = Query(DEFAULT_LOCALE),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    """Public: return content for `lang`, falling back to the default locale.

    Keys missing in the requested language are filled in from Georgian so the
    page never shows blanks.
    """
    base = {c.key: c.value for c in db.scalars(
        select(SiteContent).where(SiteContent.locale == DEFAULT_LOCALE)
    )}
    if lang == DEFAULT_LOCALE:
        return base
    localized = {c.key: c.value for c in db.scalars(
        select(SiteContent).where(SiteContent.locale == lang)
    )}
    return {**base, **localized}


@router.put(
    "/{key}", response_model=ContentItem,
    dependencies=[Depends(get_current_admin)],
)
def upsert_content(
    key: str,
    payload: ContentUpdate,
    lang: str = Query(DEFAULT_LOCALE),
    db: Session = Depends(get_db),
) -> SiteContent:
    """Admin: create or update a content block for a given key + locale."""
    item = db.get(SiteContent, {"key": key, "locale": lang})
    if item is None:
        item = SiteContent(key=key, locale=lang, value=payload.value)
        db.add(item)
    else:
        item.value = payload.value
    db.commit()
    db.refresh(item)
    return item
