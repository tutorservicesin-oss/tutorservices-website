from html.parser import HTMLParser
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).parent


class ImageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.images = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() == "img":
            self.images.append(dict(attrs))


errors = []
image_count = 0

for page in sorted(ROOT.glob("*.html")):
    if page.name.startswith("google"):
        continue

    parser = ImageParser()
    parser.feed(page.read_text(encoding="utf-8"))

    for image in parser.images:
        source = image.get("src", "")
        file_path = ROOT / source.lstrip("/")
        image_count += 1

        if not file_path.exists():
            errors.append(f"{page.name}: missing {source}")
            continue

        declared_size = (int(image["width"]), int(image["height"]))
        with Image.open(file_path) as local_image:
            actual_size = local_image.size

        if declared_size != actual_size:
            errors.append(
                f"{page.name}: {source} declares {declared_size}, actual {actual_size}"
            )

print(f"Validated {image_count} image elements.")
if errors:
    raise SystemExit("\n".join(errors))
print("All local images exist and all declared dimensions match.")
