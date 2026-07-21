from pathlib import Path

from PIL import Image


ROOT = Path(__file__).parent
ASSETS = ROOT / "assets"


for source in ASSETS.rglob("*.webp"):
    is_logo = source.name == "tutor-services-logo.webp"
    destination = source.with_suffix(".png" if is_logo else ".jpg")
    with Image.open(source) as image:
        converted = image.convert("RGBA" if is_logo else "RGB")
        if is_logo:
            converted.save(destination, "PNG")
        else:
            converted.save(destination, "JPEG", quality=90, subsampling=0)
    print(f"Created {destination.relative_to(ROOT)}")
