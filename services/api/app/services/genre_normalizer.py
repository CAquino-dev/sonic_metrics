from typing import Final


# Tags that are useful for music analytics but are not genres.
IGNORED_TAGS: Final[set[str]] = {
    "female vocalists",
    "male vocalists",
    "singer-songwriter",
    "american",
    "canadian",
    "british",
    "australian",
    "korean",
    "japanese",
    "japan",
    "canada",
    "usa",
    "chicago",
    "manchester",
    "pittsburgh",
    "ariana grande",
    "kanye west",
    "rihanna",
    "drake",
    "justin bieber",
    "bruno mars",
    "michael jackson",
    "nickelodeon",
    "disney",
    "eurovision",
    "ovo",
    "young money",
    "blackpink",
    "aespa",
    "jennie",
    "le sserafim",
    "oddatelier",
    "mother earth",
    "gay fish",
    "want to see live",
    "my top songs",
    "4th gen",
    "boyband",
    "legend",
}


# Different Last.fm spellings that represent the same genre.
GENRE_ALIASES: Final[dict[str, str]] = {
    "rnb": "R&B",
    "r&b": "R&B",
    "alternative rnb": "Alternative R&B",
    "contemporary rnb": "Contemporary R&B",
    "hip hop": "Hip-Hop",
    "hip-hop": "Hip-Hop",
    "underground hip-hop": "Underground Hip-Hop",
    "underground rap": "Underground Rap",
    "experimental hip hop": "Experimental Hip-Hop",
    "west coast hip hop": "West Coast Hip-Hop",
    "hardcore hip hop": "Hardcore Hip-Hop",
    "jazz rap": "Jazz Rap",
    "pop rap": "Pop Rap",
    "kpop": "K-Pop",
    "k-pop": "K-Pop",
    "k-pop girl group": "K-Pop",
    "pop rock": "Pop Rock",
    "alternative rock": "Alternative Rock",
    "indie rock": "Indie Rock",
    "indie pop": "Indie Pop",
    "dance-pop": "Dance-Pop",
    "electropop": "Electropop",
    "bedroom pop": "Bedroom Pop",
    "alternative pop": "Alternative Pop",
    "dark pop": "Dark Pop",
    "pop soul": "Pop Soul",
    "psychedelic soul": "Psychedelic Soul",
    "neo-soul": "Neo-Soul",
    "trip hop": "Trip-Hop",
    "lo-fi": "Lo-Fi",
    "black metal": "Black Metal",
    "brutal death metal": "Brutal Death Metal",
    "slow jams": "Slow Jams",
}


def normalize_genre(tag: str) -> str | None:
    """
    Convert a Last.fm tag into a clean genre name.

    Returns None when the tag should not be treated as a genre.
    """

    normalized = tag.strip().lower()

    if not normalized:
        return None

    if normalized in IGNORED_TAGS:
        return None

    if normalized in GENRE_ALIASES:
        return GENRE_ALIASES[normalized]

    return normalized.title()