# Smart Elevator V2 — Miniatur 4 Lantai

> Proyek Instrumentasi & Sistem Kendali — Universitas Bangka Belitung

**Chakim Fadlan** 

---

## 🔗 Live 3D Viewer

**[Buka Smart Elevator 3D →](https://smart-elevator-3d-web.vercel.app)**

## Tentang

Miniatur Smart Elevator 4 lantai sebagai implementasi sistem kendali posisi dan kecepatan. Model 3D interaktif dibangun secara programatik dari data desain SketchUp V2 menggunakan Three.js.

### Fitur
- **OrbitControls** — rotasi, zoom, dan pan dengan mouse/touch
- **Tombol lantai F1–F4** — animasi kabin bergerak naik/turun
- **Preset kamera** — 3D, Depan, Samping, Atas
- **Panel informasi** — nama proyek, mahasiswa, NIM, universitas
- **Legend subsistem** — warna komponen
- **Status bar** — posisi kabin, kecepatan demo
- **Responsive** — desktop & mobile

### Subsistem yang Dimodelkan
| # | Subsistem | Keterangan |
|---|---|---|
| 1 | Rangka & Landings | Base plywood, 4 tiang, balok, 4 landing platform |
| 2 | Guide Rails | 2 rel pemandu baja + sleeve kabin |
| 3 | Kabin | Dinding, kaca belakang, atap, handrail, flag sensor |
| 4 | Sensor Posisi | 4 optointerrupter (F1–F4) pada rel sensor |
| 5 | Drive System | Drum, motor DC, encoder A/B, poros koaksial |
| 6 | Wire Rope | Tali penghubung kabin ke drum |
| 7 | Controller Panel | MCU, H-bridge, DC-DC, terminal, tombol, E-Stop |
| 8 | Safety | Limit switch atas/bawah, cam pada kabin |
| 9 | Pelindung | Panel kaca transparan samping |

## Stack

- [Vite](https://vitejs.dev/) — build tool
- [Three.js](https://threejs.org/) — 3D rendering
- [Vercel](https://vercel.com/) — hosting

## Jalankan Lokal

```bash
npm install
npm run build
# atau langsung:
npx vite
```

## Dokumen Terkait

- [README Desain & Sensor](../Smart_Elevator_V2/README_DESAIN_DAN_SENSOR.md)
- [Proposal Asli](../Proposal_Smart_Elevator_Chakim_Fadlan.pdf)
- [SketchUp Model V2](../Smart_Elevator_V2/Smart_Elevator_V2_4Lantai.skp)

## Lisensi

Proyek akademik — Universitas Bangka Belitung 2026
