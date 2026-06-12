"""
Test fitur baru SIMCUTI:
- Dashboard endpoint
- Export Excel & PDF
- Logika cuti yang diperbaiki (weekend & libur nasional)
- Preview kalkulasi hari kerja
"""
from datetime import date


# ==================== HELPER FIXTURES ====================

def _register_and_login(client, email, password, name, role="karyawan", department=None):
    """Helper: register user lalu login, return headers."""
    payload = {
        "email": email,
        "password": password,
        "name": name,
        "role": role,
    }
    if department:
        payload["department"] = department
    client.post("/auth/register", json=payload)
    resp = client.post("/auth/login", data={"grant_type": "password", "username": email, "password": password})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _create_admin(client, email="admin_test@simcuti.id", password="Admin@2026"):
    """Helper: buat admin dan return auth headers."""
    return _register_and_login(
        client, email, password, "Admin Test", role="admin", department="HR"
    )


def _create_karyawan(client, email="karyawan1@simcuti.id", password="Karya@2026",
                     name="Karyawan Test", department="Engineering"):
    """Helper: buat karyawan dan return auth headers."""
    return _register_and_login(
        client, email, password, name, role="karyawan", department=department
    )


def _add_holiday(client, admin_headers, date_str, name, h_type="nasional"):
    """Helper: tambah hari libur."""
    return client.post("/holidays", json={
        "date": date_str,
        "name": name,
        "type": h_type,
    }, headers=admin_headers)


def _create_leave(client, headers, start, end, reason="Test cuti"):
    """Helper: buat pengajuan cuti."""
    return client.post("/leaves", json={
        "start_date": start,
        "end_date": end,
        "reason": reason,
    }, headers=headers)


# ==================== LEAVE LOGIC TESTS ====================

class TestLeaveLogicWeekend:
    """Test bahwa pengajuan cuti yang mencakup weekend tetap diterima."""

    def test_leave_spanning_weekend_accepted(self, client, auth_headers):
        """Cuti Jumat-Senin harus diterima, working_days = 2."""
        admin_h = _create_admin(client)

        # Cari tanggal Jumat yang valid (2026-06-05 = Jumat)
        resp = _create_leave(client, auth_headers, "2026-06-05", "2026-06-08")
        assert resp.status_code == 201
        data = resp.json()
        # Jumat + Senin = 2 hari kerja (Sabtu & Minggu dilewati)
        assert data["working_days"] == 2
        assert data["start_date"] == "2026-06-05"
        assert data["end_date"] == "2026-06-08"

    def test_leave_only_weekend_rejected(self, client, auth_headers):
        """Cuti hanya Sabtu-Minggu harus ditolak (0 hari kerja)."""
        # 2026-06-06 = Sabtu, 2026-06-07 = Minggu
        resp = _create_leave(client, auth_headers, "2026-06-06", "2026-06-07")
        assert resp.status_code == 400

    def test_leave_weekday_only(self, client, auth_headers):
        """Cuti Senin-Jumat = 5 hari kerja."""
        # 2026-07-06 = Senin, 2026-07-10 = Jumat
        resp = _create_leave(client, auth_headers, "2026-07-06", "2026-07-10")
        assert resp.status_code == 201
        assert resp.json()["working_days"] == 5


class TestLeaveLogicHoliday:
    """Test bahwa hari libur nasional TIDAK memotong kuota cuti."""

    def test_leave_with_holiday_excluded(self, client, auth_headers):
        """Hari libur di tengah range cuti TIDAK dihitung."""
        admin_h = _create_admin(client, email="admin_hol@test.id")

        # Tambah libur nasional: 2026-08-17 (Senin - HUT RI)
        _add_holiday(client, admin_h, "2026-08-17", "Hari Kemerdekaan RI")

        # Cuti 2026-08-17 s/d 2026-08-21 (Senin-Jumat)
        # Senin = libur, Selasa-Jumat = 4 hari kerja
        resp = _create_leave(client, auth_headers, "2026-08-17", "2026-08-21")
        assert resp.status_code == 201
        assert resp.json()["working_days"] == 4

    def test_leave_all_holidays_rejected(self, client, auth_headers):
        """Jika semua hari dalam range adalah libur, pengajuan ditolak."""
        admin_h = _create_admin(client, email="admin_hol2@test.id")

        # Tambah libur pada Senin
        _add_holiday(client, admin_h, "2026-09-07", "Libur Test Senin")

        # Cuti hanya 1 hari dan itu libur
        resp = _create_leave(client, auth_headers, "2026-09-07", "2026-09-07")
        assert resp.status_code == 400


class TestLeaveOverlapWorkingDay:
    """Test bahwa overlap dicek berdasarkan HARI KERJA, bukan kalender."""

    def test_weekend_overlap_allowed(self, client):
        """Dua cuti yang overlap HANYA di weekend harus bisa diterima."""
        headers = _create_karyawan(client, email="overlap_test@test.id")

        # Leave 1: Kamis-Sabtu (2026-07-02 = Kamis, 2026-07-04 = Sabtu)
        resp1 = _create_leave(client, headers, "2026-07-02", "2026-07-04")
        assert resp1.status_code == 201
        assert resp1.json()["working_days"] == 2  # Kamis + Jumat

        # Leave 2: Sabtu-Selasa (2026-07-04 = Sabtu s/d 2026-07-07 = Selasa)
        # Overlap di Sabtu, tapi Sabtu bukan hari kerja
        resp2 = _create_leave(client, headers, "2026-07-04", "2026-07-07")
        assert resp2.status_code == 201
        assert resp2.json()["working_days"] == 2  # Senin + Selasa

    def test_working_day_overlap_rejected(self, client):
        """Dua cuti yang overlap di hari kerja HARUS ditolak."""
        headers = _create_karyawan(client, email="overlap_test2@test.id")

        # Leave 1: Senin-Rabu (2026-07-06 s/d 2026-07-08)
        resp1 = _create_leave(client, headers, "2026-07-06", "2026-07-08")
        assert resp1.status_code == 201

        # Leave 2: Rabu-Jumat (2026-07-08 s/d 2026-07-10) — overlap di Rabu
        resp2 = _create_leave(client, headers, "2026-07-08", "2026-07-10")
        assert resp2.status_code == 400


# ==================== LEAVE CALCULATION PREVIEW TESTS ====================

class TestLeaveCalculation:
    """Test endpoint preview kalkulasi hari kerja."""

    def test_calculate_normal_week(self, client, auth_headers):
        """Preview Senin-Jumat = 5 hari kerja, 0 weekend, 0 libur."""
        resp = client.get(
            "/leaves/calculate?start_date=2026-07-13&end_date=2026-07-17",
            headers=auth_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["working_days"] == 5
        assert data["weekend_days"] == 0
        assert data["holiday_days"] == 0
        assert data["total_calendar_days"] == 5
        assert len(data["breakdown"]) == 5

    def test_calculate_with_weekend(self, client, auth_headers):
        """Preview Jumat-Selasa = 7 hari kalender, breakdown benar."""
        # 2026-07-10 Jumat s/d 2026-07-14 Selasa
        resp = client.get(
            "/leaves/calculate?start_date=2026-07-10&end_date=2026-07-14",
            headers=auth_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["working_days"] == 3  # Jumat, Senin, Selasa
        assert data["weekend_days"] == 2  # Sabtu, Minggu
        assert data["total_calendar_days"] == 5

        # Cek breakdown detail
        weekend_items = [d for d in data["breakdown"] if d["is_weekend"]]
        assert len(weekend_items) == 2

    def test_calculate_with_holiday(self, client, auth_headers):
        """Preview dengan hari libur nasional."""
        admin_h = _create_admin(client, email="admin_calc@test.id")
        _add_holiday(client, admin_h, "2026-07-14", "Libur Test Kalkulasi")

        resp = client.get(
            "/leaves/calculate?start_date=2026-07-13&end_date=2026-07-17",
            headers=auth_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["working_days"] == 4  # 5 - 1 libur
        assert data["holiday_days"] == 1

        # Cek breakdown: Selasa 14 Juli = holiday
        holiday_items = [d for d in data["breakdown"] if d["is_holiday"]]
        assert len(holiday_items) == 1
        assert holiday_items[0]["holiday_name"] == "Libur Test Kalkulasi"

    def test_calculate_invalid_dates(self, client, auth_headers):
        """Format tanggal tidak valid → 400."""
        resp = client.get(
            "/leaves/calculate?start_date=invalid&end_date=2026-07-17",
            headers=auth_headers,
        )
        assert resp.status_code == 400

    def test_calculate_end_before_start(self, client, auth_headers):
        """Tanggal selesai sebelum mulai → 400."""
        resp = client.get(
            "/leaves/calculate?start_date=2026-07-17&end_date=2026-07-13",
            headers=auth_headers,
        )
        assert resp.status_code == 400


# ==================== DASHBOARD TESTS ====================

class TestDashboard:
    """Test endpoint dashboard admin."""

    def test_dashboard_admin_access(self, client):
        """Admin bisa akses dashboard."""
        admin_h = _create_admin(client, email="admin_dash@test.id")
        resp = client.get("/dashboard", headers=admin_h)
        assert resp.status_code == 200
        data = resp.json()

        # Cek struktur response
        assert "stats" in data
        assert "monthly_trends" in data
        assert "department_summary" in data
        assert "recent_pending" in data

        # Cek stats fields
        stats = data["stats"]
        assert "total_karyawan" in stats
        assert "total_pengajuan" in stats
        assert "pending_count" in stats
        assert "approved_count" in stats
        assert "rejected_count" in stats
        assert "total_hari_cuti_approved" in stats
        assert "avg_leave_per_employee" in stats
        assert "quota_utilization_percent" in stats

    def test_dashboard_karyawan_denied(self, client):
        """Karyawan tidak bisa akses dashboard → 403."""
        karyawan_h = _create_karyawan(client, email="kary_dash@test.id")
        resp = client.get("/dashboard", headers=karyawan_h)
        assert resp.status_code == 403

    def test_dashboard_no_auth_denied(self, client):
        """Tanpa auth tidak bisa akses → 401."""
        resp = client.get("/dashboard")
        assert resp.status_code == 401

    def test_dashboard_monthly_trends_structure(self, client):
        """Monthly trends harus ada 12 bulan."""
        admin_h = _create_admin(client, email="admin_trends@test.id")
        resp = client.get("/dashboard", headers=admin_h)
        data = resp.json()
        assert len(data["monthly_trends"]) == 12
        months = [t["month"] for t in data["monthly_trends"]]
        assert months == list(range(1, 13))

    def test_dashboard_with_data(self, client):
        """Dashboard dengan data karyawan dan cuti."""
        admin_h = _create_admin(client, email="admin_data@test.id")
        kary_h = _create_karyawan(
            client, email="kary_data@test.id", department="IT"
        )

        # Buat pengajuan cuti
        _create_leave(client, kary_h, "2026-07-13", "2026-07-14")

        resp = client.get("/dashboard", headers=admin_h)
        data = resp.json()

        assert data["stats"]["total_karyawan"] >= 1
        assert data["stats"]["total_pengajuan"] >= 1
        assert data["stats"]["pending_count"] >= 1


# ==================== EXPORT TESTS ====================

class TestExportExcel:
    """Test export Excel endpoint."""

    def test_export_excel_admin(self, client):
        """Admin bisa export Excel."""
        admin_h = _create_admin(client, email="admin_excel@test.id")
        resp = client.get("/dashboard/export/excel", headers=admin_h)
        assert resp.status_code == 200
        assert "spreadsheetml" in resp.headers.get("content-type", "")
        assert resp.headers.get("content-disposition") is not None
        assert len(resp.content) > 0  # File tidak kosong

    def test_export_excel_with_status_filter(self, client):
        """Export Excel dengan filter status."""
        admin_h = _create_admin(client, email="admin_excel2@test.id")
        resp = client.get(
            "/dashboard/export/excel?status=approved",
            headers=admin_h,
        )
        assert resp.status_code == 200

    def test_export_excel_with_year_filter(self, client):
        """Export Excel dengan filter tahun."""
        admin_h = _create_admin(client, email="admin_excel3@test.id")
        resp = client.get(
            "/dashboard/export/excel?year=2026",
            headers=admin_h,
        )
        assert resp.status_code == 200

    def test_export_excel_karyawan_denied(self, client):
        """Karyawan tidak bisa export → 403."""
        kary_h = _create_karyawan(client, email="kary_excel@test.id")
        resp = client.get("/dashboard/export/excel", headers=kary_h)
        assert resp.status_code == 403

    def test_export_excel_no_auth_denied(self, client):
        """Tanpa auth tidak bisa export → 401."""
        resp = client.get("/dashboard/export/excel")
        assert resp.status_code == 401


class TestExportPDF:
    """Test export PDF endpoint."""

    def test_export_pdf_admin(self, client):
        """Admin bisa export PDF."""
        admin_h = _create_admin(client, email="admin_pdf@test.id")
        resp = client.get("/dashboard/export/pdf", headers=admin_h)
        assert resp.status_code == 200
        assert "pdf" in resp.headers.get("content-type", "")
        assert len(resp.content) > 0

    def test_export_pdf_with_filters(self, client):
        """Export PDF dengan filter status dan tahun."""
        admin_h = _create_admin(client, email="admin_pdf2@test.id")
        resp = client.get(
            "/dashboard/export/pdf?status=pending&year=2026",
            headers=admin_h,
        )
        assert resp.status_code == 200

    def test_export_pdf_karyawan_denied(self, client):
        """Karyawan tidak bisa export PDF → 403."""
        kary_h = _create_karyawan(client, email="kary_pdf@test.id")
        resp = client.get("/dashboard/export/pdf", headers=kary_h)
        assert resp.status_code == 403

    def test_export_pdf_with_data(self, client):
        """Export PDF setelah ada data cuti."""
        admin_h = _create_admin(client, email="admin_pdf3@test.id")
        kary_h = _create_karyawan(client, email="kary_pdf2@test.id")

        # Buat cuti & approve
        leave_resp = _create_leave(client, kary_h, "2026-08-03", "2026-08-05")
        if leave_resp.status_code == 201:
            leave_id = leave_resp.json()["id"]
            client.put(f"/leaves/{leave_id}/approve", headers=admin_h)

        resp = client.get("/dashboard/export/pdf", headers=admin_h)
        assert resp.status_code == 200
        assert len(resp.content) > 100  # PDF harus cukup besar
