# Perbandingan  Ukuran Docker Image Pyhton 3.12

Dokumen ini berisi hasil perbandingan ukuran beberapa Docker image Python 3.12 yang digunakan sebagai referensi dalam pemilihan base image untuk backend project.

## Hasil Perbandingan

![alt text](<Hasil Perbandingan Ukuran Docker.png>)

| Image | Size |
|---|---:|
| python:3.12 | 1.62GB |
| python:3.12-slim | 179MB |
| python:3.12-alpine | 75MB |


- Berdasarkan hasil perbandingan, image `python:3.12` memiliki ukuran paling besar karena merupakan full image dengan package bawaan yang lengkap.

- Image `python:3.12-slim` memiliki ukuran yang lebih ringan dan cocok digunakan untuk deployment backend karena tetap kompatibel dengan dependency Python.

- Sementara itu, `python:3.12-alpine` memiliki ukuran paling kecil, namun terkadang memerlukan penyesuaian tambahan untuk beberapa library.

## Langkah Pengujian

```bash
docker pull python:3.12
docker pull python:3.12-slim
docker pull python:3.12-alpine
```

Setelah seluruh image berhasil diunduh, dilakukan pengecekan ukuran image menggunakan perintah:

```bash
docker image ls python --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}"
```