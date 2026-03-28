from collections import Counter
try:
    from PIL import Image
except ImportError:
    import subprocess, sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow"])
    from PIL import Image

def get_dom(path):
    img = Image.open(path).convert('RGBA')
    img.thumbnail((150,150))
    px = [p for p in img.getdata() if p[3]>50 and p[:3] != (255,255,255)] # exclude transparent & pure white
    if not px:
        return []
    return Counter(px).most_common(5)

for i in range(1, 5):
    path = f"D:/Lavente/business/Online Directory/Tuinhub.nl/Logo/clean/logo{i}.png"
    print(f"\n--- logo{i}.png ---")
    try:
        colors = get_dom(path)
        for c, count in colors:
            print(f"#{c[0]:02x}{c[1]:02x}{c[2]:02x} ({count})")
    except Exception as e:
         print(e)
