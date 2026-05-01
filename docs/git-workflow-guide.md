# 🔀 Git Workflow Guide

## 1. Branch Naming
Dalam project ini, setiap anggota tim diwajibkan bekerja menggunakan branch masing-masing agar perubahan tidak langsung masuk ke branch utama (`main`). Cara ini membantu mengurangi konflik dan mempermudah proses review.

### Format branch yang digunakan

| Jenis Branch | Fungsi | Contoh |
|---|---|---|
| `feature/` | Digunakan saat menambahkan fitur baru | `feature//user-profile` |
| `fix/` | Digunakan untuk memperbaiki bug atau error | `fix/login-token-expired` |
| `docs/` | Digunakan untuk penambahan atau perubahan dokumentasi | `docs/api-docs-update` |
| `refactor/` | Digunakan untuk merapikan struktur kode | `refactor/split-crud-service` |
| `chore/` | Digunakan untuk konfigurasi atau maintenance project | `chore/update-requirements` |

---

## 2. Aturan Commit Message
Setiap commit menggunakan format Conventional Commits agar riwayat perubahan repository lebih terstruktur dan mudah dipahami.

### Format commit

| Tipe       | Kegunaan                                   | Contoh                               |
| ---------- | ------------------------------------------ | ------------------------------------ |
| `feat`     | Menambahkan fitur baru                     | `feat: add user profile page`    |
| `fix`      | Memperbaiki bug                            | `fix:  resolve JWT token expiry issue`  |
| `docs`     | Menambah atau memperbarui dokumentasi      | `docs: update API endpoint list in README`  |
| `refactor` | Merapikan kode tanpa mengubah fungsi utama | `refactor: extract auth logic to separate module`  |
| `chore`    | Perubahan konfigurasi atau maintenance     | `chore: update python dependencies` |
| `test`     | Menambahkan atau memperbarui testing       | `test: add unit tests for CRUD operations`            |
| `style`    | Perubahan format penulisan kode            | `style: fix indentation in docker-compose.yml`  |


## 3. Pull Request Process

Pull Request (PR) digunakan sebagai proses pengecekan sebelum perubahan digabungkan ke branch `main`. Dengan workflow ini, setiap perubahan dapat direview terlebih dahulu oleh anggota lain.

### Tahapan Pull Request yang digunakan :

#### 1. Update branch `main`
```bash
git checkout main
git pull origin main
```

#### 2. Membuat branch baru
Contoh : 
```bash
git checkout -b docs/git-workflow-guide
```
#### 3. Mengerjakan perubahan sesuai tugas
Perubahan dilakukan di branch masing-masing.

#### 4. Menyimpan perubahan dengan commit
```bash
git add .
git commit -m "docs: add git workflow guide"
```
#### 5. Push branch ke GitHub
```bash
git push origin docs/git-workflow-guide
```
#### 6. Membuat Pull Request
Setelah branch berhasil dipush:

- buka repository GitHub
- klik  `Compare & pull request`
- isi title dan description PR
  
#### 7. Menentukan reviewer
PR harus direview minimal oleh satu anggota tim yaitu Lead Devops sebelum dapat di-merge.

#### 8. Review perubahan

Reviewer akan memeriksa isi perubahan dan memberikan komentar jika diperlukan.

#### 9. Merge Pull Request

Jika sudah disetujui:

gunakan  `Squash and merge`
hapus branch setelah merge selesai 


## 4. Review Guidelines
Code review dilakukan agar perubahan yang masuk ke repository tetap terjaga kualitas dan konsistensinya.

Hal yang diperiksa reviewer : 

| Bagian yang Dicek | Keterangan |
|---|---|
| Kesesuaian perubahan | Pastikan perubahan sesuai tugas yang dikerjakan |
| File yang dimodifikasi | Pastikan tidak ada file yang berubah di luar kebutuhan |
| Commit message | Pastikan format commit sudah benar |
| Kerapian isi | Pastikan kode atau dokumentasi mudah dipahami |
| Keamanan file | Pastikan tidak ada file sensitif yang ikut terupload seperti `.env` , password, ataupun token  |
| Pengaruh ke sistem lain | Pastikan perubahan tidak merusak bagian lain project |

## 5. Referens CODEOWNERS

Repository menggunakan file . `github/CODEOWNERS` untuk membantu menentukan reviewer otomatis berdasarkan area file yang diubah.

Selain menggunakan CODEOWNERS, tim juga menerapkan sistem pasangan reviewer agar setiap Pull Request diperiksa oleh anggota lain sebelum digabungkan ke  `main`.

### Pasangan reviewer tim : 

| Pembuat PR | Reviewer |
|---|---|
| Lead Backend | Lead Frontend |
| Lead Frontend | Lead Backend |
| Lead DevOps | Lead QA & Docs |
| Lead QA & Docs | Lead DevOps |


### Reviewer berdasarkan area file :
| Area File | Reviewer |
|---|---|
| `backend/` | Lead Backend |
| `frontend/` | Lead Frontend |
| `docker-compose.yml` | Lead DevOps |
| `backend/Dockerfile` | Lead DevOps |
| `frontend/Dockerfile` | Lead DevOps |
| `Makefile` | Lead DevOps |
| `README.md` | Lead QA & Docs |
| `docs/` | Lead QA & Docs |

Dengan sistem ini, proses review menjadi lebih terarah karena setiap perubahan diperiksa oleh anggota yang sesuai dengan area tanggung jawabnya.

