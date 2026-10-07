"""Import user-supplied DOCX copy into the existing service content model."""
import json
import pathlib
import zipfile
import xml.etree.ElementTree as ET

root = pathlib.Path(__file__).resolve().parent.parent
ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
configs = [
    ("SEO Services", "seo-services", "Search Engine Optimization", "search", "Organic visibility", "svc-seo"),
    ("PPC", "ppc-management", "PPC Management", "target", "Paid performance", "svc-ppc"),
    ("Social Media", "social-media-marketing", "Social Media Marketing", "megaphone", "Meaningful engagement", "svc-social"),
    ("Content Creation", "content-marketing", "Content Marketing", "palette", "Content with purpose", "svc-content"),
]
services = json.loads((root / "content/services.json").read_text(encoding="utf-8"))
for name, slug, title, icon, tag, image in configs:
    source = pathlib.Path("d:/Downloads") / f"Services Pages Content _ {name} _ Eiretech360.docx"
    with zipfile.ZipFile(source) as doc:
        tree = ET.fromstring(doc.read("word/document.xml"))
    heading = ""
    intro = []
    sections = []
    for p in tree.findall(".//w:body/w:p", ns):
        text = "".join(t.text or "" for t in p.findall(".//w:t", ns)).strip()
        if not text:
            continue
        style = p.find("w:pPr/w:pStyle", ns)
        level = style.get(f"{{{ns['w']}}}val", "") if style is not None else ""
        # The SEO document uses bold 14pt paragraphs instead of Word heading
        # styles. Recognise that formatting so its sections are not swallowed
        # by the overview.
        bold = p.find("w:pPr/w:rPr/w:b", ns)
        size = p.find("w:pPr/w:rPr/w:sz", ns)
        formatted_heading = (
            bold is not None
            and bold.get(f"{{{ns['w']}}}val", "1") not in ("0", "false")
            and size is not None
            and int(size.get(f"{{{ns['w']}}}val", "0")) >= 28
            and len(text) < 120
        )
        if not heading:
            heading = text
        elif level.startswith("Heading") or formatted_heading:
            sections.append({"title": text, "paragraphs": []})
        elif sections:
            sections[-1]["paragraphs"].append(text)
        else:
            intro.append(text)
    entry = {
        "title": title, "slug": slug, "parent": "digital-marketing", "headline": heading,
        "icon": icon, "tag": tag, "image": image,
        "desc": intro[0], "intro": "\n\n".join(intro),
        "points": [s["title"] for s in sections],
        "details": ["\n\n".join(s["paragraphs"]) for s in sections],
        "seo": {"title": f"{heading} | Eire Tech 360", "description": intro[0][:157]},
        "benefits": ["A strategy built around your business goals", "Support across Ireland, Europe and the USA", "Clear reporting and ongoing improvement"],
    }
    services = [s for s in services if s.get("slug") != slug]
    services.append(entry)
(root / "content/services.json").write_text(json.dumps(services, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
