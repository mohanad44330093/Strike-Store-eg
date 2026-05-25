import qrcode

img = qrcode.make("https://strike-store-eg-ss55.vercel.app/StrikeStorePage")
img.save('StrikeQrCode.png')