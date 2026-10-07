"""Check that every supplied DOCX paragraph appears in its generated page."""
import html
import pathlib
import re
import zipfile
import xml.etree.ElementTree as ET

root = pathlib.Path(__file__).resolve().parent.parent
ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
normalize = lambda s: re.sub(r"\s+", " ", s).strip()
for name, slug in [("SEO Services", "seo-services"), ("PPC", "ppc-management"), ("Social Media", "social-media-marketing"), ("Content Creation", "content-marketing")]:
    page = root / "dist-static/services" / slug / "index.html"
    rendered = normalize(html.unescape(re.sub(r"<[^>]+>", " ", page.read_text(encoding="utf-8"))))
    with zipfile.ZipFile(pathlib.Path("d:/Downloads") / f"Services Pages Content _ {name} _ Eiretech360.docx") as source:
        tree = ET.fromstring(source.read("word/document.xml"))
    paragraphs = [normalize("".join(t.text or "" for t in p.findall(".//w:t", ns))) for p in tree.findall(".//w:body/w:p", ns)]
    for paragraph in filter(None, paragraphs):
        assert paragraph in rendered, f"Missing content on {slug}: {paragraph[:100]}"
    print(f"Verified all {sum(bool(p) for p in paragraphs)} DOCX paragraphs on /services/{slug}")
