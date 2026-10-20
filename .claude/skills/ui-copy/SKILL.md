---
name: ui-copy
description: >-
  How to write any words a person reads on loganclampitt.com, meaning
  console and site labels, headings, empty states, helper text, footnotes,
  hover titles, error lines, the privacy note and emails. Use it whenever you write
  or change user-facing copy, even one line, even inside a bigger change.
  Two owner rules above all. Clarifiers stay short, and no dashes or
  hyphenated compounds in the copy.
---

# UI copy (loganclampitt.com)

The owner's rules for every word a user sees (owner 2026-09-24, carried
over from pixel-lord unchanged). They apply to the site, the /console, the
privacy note and emails. They do not
apply to code comments, commit messages or docs, where the long reasoning
belongs.

## 1. Clarifiers stay short

A clarifier is any small line that qualifies or explains something else:
helper text under a field, the grey line under a heading or a number, a
footnote, an empty state's second line, a hover title, a caveat.

- **One sentence, about ten words or fewer.** If it needs a second
  sentence, it is too long.
- **Say the fact, not the reasoning.** The reasoning goes in a code
  comment beside it.
- **Cut what the screen already says.** Don't repeat the heading, the
  number or the button label.
- **No stacked qualifiers.** "at least", "roughly", "so far" and the like:
  keep the one that matters.
- If a caveat genuinely needs more room, put the short line on screen and
  the rest behind a hover title or a fold. Never a paragraph in the page.

| Too long | Short |
|---|---|
| Filters the 50 rows on this page, not every visitor serve holds. | Filters this page's 50 rows. |
| Their building total isn't published, so no share is shown. | Building size unknown. |
| This is not zero — treat today's intake as unknown. | Unknown, not zero. |

## 2. No dashes, no hyphenated compounds

- **No dashes as punctuation.** No em dash (—), en dash (–) or spaced
  hyphen ( - ) joining clauses. Use a full stop, a comma or a colon, or
  split it into two lines.
  - "Didn't load — the file may be missing" becomes "Didn't load. The file
    may be missing."
- **No hyphenated compounds** when a plain form exists. Write the words
  apart, as one word, or reword.
  - "follow-up" becomes "follow up", "sign-in" becomes "sign in",
    "move-in date" becomes "move in date" or "available from".
- **Ranges use "to".** "Sep 24 to Oct 24", not "Sep 24 – Oct 24".
- **Allowed:** names and codes that carry their own hyphen (plan codes
  like "C2-TH", slugs, URLs, phone numbers, dates written as 2026-09-24
  in machine contexts). A minus sign on a number ("−$1,289") is a sign,
  not a dash.

## Also (standing rules, unchanged)

- Sentence case, plain words, British spelling ("recognised").
- Status in plain coloured words, not pills or badges.
- Fail honest: an unknown says unknown, never a zero. Rule 1 shortens the
  words, it never drops the honesty.

## Before you finish

Search the strings you added or changed for `—`, `–`, ` - ` and
hyphenated words, and read every clarifier aloud once. If it takes a
breath, shorten it.
