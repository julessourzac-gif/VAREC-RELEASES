#!/usr/bin/env python3
"""
Propose updates to manuel.html based on a new VAREC release.

Reads:
  TAG, PREV_TAG, RELEASE_NOTES, SOURCE_DIFF (from environment)
  manuel.html (from working tree)

Writes (if changes are proposed):
  manuel.html (patched in place)
  /tmp/manual_update_summary.md (PR body)

Exits 0 with MANUAL_UPDATED=true/false in $GITHUB_OUTPUT.
"""

import json
import os
import sys
from pathlib import Path

import anthropic

MODEL = "claude-opus-4-8"
MANUEL_PATH = Path("manuel.html")
SUMMARY_PATH = Path("/tmp/manual_update_summary.md")
GITHUB_OUTPUT = os.environ.get("GITHUB_OUTPUT")


def set_output(key: str, value: str) -> None:
    if not GITHUB_OUTPUT:
        return
    with open(GITHUB_OUTPUT, "a") as f:
        f.write(f"{key}={value}\n")


SYSTEM_PROMPT = """Tu es un rédacteur technique qui maintient le manuel utilisateur HTML de VAREC, un field recorder multipiste pour Mac.

Tu reçois :
- Le contenu actuel de manuel.html
- Les notes de la nouvelle release
- Un résumé des changements du code source (commits + fichiers modifiés)

Ta tâche : identifier les nouvelles fonctionnalités ou changements visibles par l'utilisateur qui méritent d'être documentés dans le manuel, et proposer des éditions ciblées.

Règles strictes :
1. Ne touche AU manuel QUE si la release introduit des changements documentables (nouvelle fonctionnalité, changement de comportement utilisateur, nouveau raccourci, etc.). Les fixes internes, refactos, optimisations ne nécessitent pas de mise à jour du manuel.
2. Conserve le style HTML, la structure, le ton et la langue (français) du manuel existant.
3. Édite avec parcimonie : ajoute/modifie uniquement le strict nécessaire. Ne réécris pas des sections entières si une phrase suffit.
4. Pour chaque édition, fournis l'ANCIEN texte EXACT à remplacer (copier-coller depuis le manuel, espaces et balises compris) et le NOUVEAU texte.
5. Si tu n'es pas sûr qu'un changement mérite documentation, abstiens-toi.

Tu DOIS répondre en JSON conforme au schéma fourni."""


SCHEMA = {
    "type": "object",
    "properties": {
        "needs_update": {
            "type": "boolean",
            "description": "true si le manuel doit être mis à jour, false sinon",
        },
        "summary": {
            "type": "string",
            "description": "Résumé en français des changements documentaires proposés (ou raison pour laquelle aucun changement n'est nécessaire)",
        },
        "edits": {
            "type": "array",
            "description": "Liste des éditions à appliquer (vide si needs_update=false)",
            "items": {
                "type": "object",
                "properties": {
                    "section": {
                        "type": "string",
                        "description": "Description courte de la section concernée",
                    },
                    "old_text": {
                        "type": "string",
                        "description": "Texte exact à remplacer (doit apparaître textuellement une seule fois dans manuel.html)",
                    },
                    "new_text": {
                        "type": "string",
                        "description": "Texte de remplacement",
                    },
                    "rationale": {
                        "type": "string",
                        "description": "Justification courte en français",
                    },
                },
                "required": ["section", "old_text", "new_text", "rationale"],
                "additionalProperties": False,
            },
        },
    },
    "required": ["needs_update", "summary", "edits"],
    "additionalProperties": False,
}


def main() -> int:
    tag = os.environ["TAG"]
    prev_tag = os.environ.get("PREV_TAG", "")
    release_notes = os.environ.get("RELEASE_NOTES", "")
    source_diff = os.environ.get("SOURCE_DIFF", "")

    if not MANUEL_PATH.exists():
        print(f"manuel.html introuvable", file=sys.stderr)
        return 1

    manuel = MANUEL_PATH.read_text(encoding="utf-8")

    user_prompt = f"""Nouvelle release : {tag}
Release précédente : {prev_tag or "(inconnue)"}

=== Notes de release ===
{release_notes or "(vide)"}

=== Résumé des changements code source ===
{source_diff or "(non disponible)"}

=== manuel.html actuel ===
{manuel}

Analyse la release et propose, si nécessaire, des éditions ciblées au manuel."""

    client = anthropic.Anthropic()

    with client.messages.stream(
        model=MODEL,
        max_tokens=32000,
        thinking={"type": "adaptive"},
        output_config={
            "effort": "high",
            "format": {
                "type": "json_schema",
                "schema": SCHEMA,
            },
        },
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
    ) as stream:
        message = stream.get_final_message()

    # Extract JSON from response
    raw = ""
    for block in message.content:
        if block.type == "text":
            raw += block.text

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        print(f"Réponse non-JSON : {e}", file=sys.stderr)
        print(raw[:2000], file=sys.stderr)
        return 1

    needs_update = bool(data.get("needs_update"))
    summary = data.get("summary", "")
    edits = data.get("edits", [])

    print(f"needs_update: {needs_update}")
    print(f"summary: {summary}")
    print(f"edits: {len(edits)}")

    if not needs_update or not edits:
        set_output("MANUAL_UPDATED", "false")
        SUMMARY_PATH.write_text(
            f"Aucune mise à jour du manuel nécessaire pour {tag}.\n\n{summary}\n",
            encoding="utf-8",
        )
        return 0

    applied = []
    skipped = []
    new_manuel = manuel
    for i, edit in enumerate(edits, 1):
        old = edit["old_text"]
        new = edit["new_text"]
        section = edit.get("section", f"édition #{i}")
        count = new_manuel.count(old)
        if count == 0:
            skipped.append(f"- **{section}** : ancien texte introuvable")
            continue
        if count > 1:
            skipped.append(f"- **{section}** : ancien texte ambigu ({count} occurrences)")
            continue
        new_manuel = new_manuel.replace(old, new, 1)
        applied.append(
            f"- **{section}** : {edit.get('rationale', '')}"
        )

    if not applied:
        set_output("MANUAL_UPDATED", "false")
        SUMMARY_PATH.write_text(
            "Aucune édition applicable proposée par Claude.\n\n"
            + summary
            + "\n\nÉditions ignorées :\n"
            + "\n".join(skipped),
            encoding="utf-8",
        )
        return 0

    MANUEL_PATH.write_text(new_manuel, encoding="utf-8")
    set_output("MANUAL_UPDATED", "true")

    body = [
        f"## Mise à jour du manuel pour {tag}",
        "",
        "Cette PR a été générée automatiquement par le workflow `update-manual.yml`.",
        "Claude a analysé les notes de release et le diff du code source, puis a proposé les éditions ci-dessous.",
        "",
        "**Relis attentivement avant de merger.**",
        "",
        "### Résumé",
        "",
        summary,
        "",
        "### Éditions appliquées",
        "",
        *applied,
    ]
    if skipped:
        body += ["", "### Éditions ignorées", "", *skipped]
    SUMMARY_PATH.write_text("\n".join(body), encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main())
