from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen

from PIL import Image, ImageOps


ASSET_DIR = Path(__file__).parent / "assets" / "images"
ASSET_DIR.mkdir(parents=True, exist_ok=True)

IMAGES = [
    ("photo-1577896851231-70ef18881754", "teacher-guiding-students-classroom.webp", 1000, 750),
    ("photo-1497633762265-9d179a990aa6", "home-tuition-study-guide.webp", 1200, 675),
    ("photo-1497633762265-9d179a990aa6", "student-reading-home-tuition.webp", 700, 438),
    ("photo-1522202176988-66273c2fd55f", "personalized-tuition-students-guide.webp", 1200, 675),
    ("photo-1522202176988-66273c2fd55f", "parent-student-tutor-study-plan.webp", 900, 600),
    ("photo-1522202176988-66273c2fd55f", "students-learning-with-mentor.webp", 1000, 750),
    ("photo-1456513080510-7bf3a84b82f8", "class-10-board-exam-preparation-guide.webp", 1200, 675),
    ("photo-1456513080510-7bf3a84b82f8", "class-10-board-exam-study-plan.webp", 700, 438),
    ("photo-1503676260728-1c00da094a0b", "school-board-exam-students.webp", 700, 438),
    ("photo-1513258496099-48168024aec0", "effective-study-techniques-notebook.webp", 700, 438),
    ("photo-1515879218367-8466d910aaa4", "coding-for-kids-computer-class.webp", 700, 438),
    ("photo-1543269865-cbf427effbad", "spoken-english-conversation-guide.webp", 1200, 675),
    ("photo-1543269865-cbf427effbad", "students-practicing-spoken-english.webp", 700, 438),
    ("photo-1551836022-d5d88e9218df", "professional-home-tutor-registration.webp", 700, 438),
    ("photo-1554224155-8d04cb21cd6c", "commerce-accounts-tuition-student.webp", 700, 438),
    ("photo-1596495578065-6e0763fa1178", "online-tuition-learning-guide.webp", 1200, 675),
    ("photo-1596495578065-6e0763fa1178", "student-attending-online-tuition.webp", 700, 438),
    ("photo-1594708767771-a7502209ff51", "delhi-home-tuition-service-areas.webp", 1000, 750),
    ("photo-1588072432836-e10032774350", "student-home-tuition-registration.webp", 1000, 750),
]


def download_image(photo_id: str, width: int) -> Image.Image:
    source_width = max(width, 1200)
    url = f"https://images.unsplash.com/{photo_id}?auto=format&fit=crop&w={source_width}&q=80"
    request = Request(url, headers={"User-Agent": "Tutorservices image optimizer"})
    with urlopen(request, timeout=45) as response:
        return Image.open(BytesIO(response.read())).convert("RGB")


source_cache: dict[str, Image.Image] = {}

for photo_id, filename, width, height in IMAGES:
    if photo_id not in source_cache:
        source_cache[photo_id] = download_image(photo_id, width)

    optimized = ImageOps.fit(
        source_cache[photo_id],
        (width, height),
        method=Image.Resampling.LANCZOS,
        centering=(0.5, 0.5),
    )
    destination = ASSET_DIR / filename
    optimized.save(destination, "WEBP", quality=68, method=6)
    print(f"{filename}: {width}x{height}, {destination.stat().st_size} bytes")
